import { NextResponse } from 'next/server';
import { prisma } from '@wishhub/database';
import { AIProviderFactory, PromptManager } from '@wishhub/ai';
import { telemetry } from '@wishhub/telemetry';

export async function POST(req: Request) {
  const start = Date.now();

  // Find next unclaimed/pending job or failed job with remaining attempts
  const job = await prisma.aIJob.findFirst({
    where: {
      status: { in: ['PENDING', 'FAILED'] },
      attempts: { lt: 3 },
      OR: [
        { lockedAt: null },
        { lockedAt: { lt: new Date(Date.now() - 5 * 60 * 1000) } } // Stale lock timeout (5 minutes)
      ]
    },
    orderBy: [
      { priority: 'desc' },
      { createdAt: 'asc' }
    ],
    include: {
      catalogProduct: true
    }
  });

  if (!job) {
    return NextResponse.json({ success: true, message: 'No pending AI jobs found.' });
  }

  // Lock the job
  const lockId = crypto.randomUUID();
  const lockedJob = await prisma.aIJob.update({
    where: { id: job.id },
    data: {
      status: 'PROCESSING',
      lockedAt: new Date(),
      lockedBy: lockId,
      attempts: { increment: 1 }
    }
  });

  try {
    const provider = AIProviderFactory.getProvider();
    const promptTemplate = PromptManager.getPrompt('product-analyzer-v1');
    const promptText = PromptManager.render(promptTemplate.template, {
      title: job.catalogProduct.title,
      description: job.catalogProduct.description,
      brand: job.catalogProduct.brand,
      store: job.catalogProduct.store,
      category: job.catalogProduct.category,
      price: (job.catalogProduct.metadata as any)?.price,
      currency: (job.catalogProduct.metadata as any)?.currency,
    });

    // Execute provider
    const result = await provider.generateInsight(job.catalogProduct, promptText);

    // Save/Update Insight
    const fingerprint = 'f-' + job.catalogProduct.title.length; // stable content fingerprint

    // Upsert the ProductInsight
    await prisma.productInsight.upsert({
      where: {
        catalogProductId_promptVersion: {
          catalogProductId: job.catalogProductId,
          promptVersion: promptTemplate.version
        }
      },
      create: {
        catalogProductId: job.catalogProductId,
        summary: result.insight.summary,
        pros: result.insight.pros,
        cons: result.insight.cons,
        buyRecommendation: result.insight.buyRecommendation,
        confidenceScore: result.insight.confidenceScore,
        reasoning: result.insight.reasoning,
        provider: provider.name,
        model: result.model,
        promptVersion: promptTemplate.version,
        contentFingerprint: fingerprint,
        metadata: result.insight as any,
      },
      update: {
        summary: result.insight.summary,
        pros: result.insight.pros,
        cons: result.insight.cons,
        buyRecommendation: result.insight.buyRecommendation,
        confidenceScore: result.insight.confidenceScore,
        reasoning: result.insight.reasoning,
        provider: provider.name,
        model: result.model,
        metadata: result.insight as any,
      }
    });

    // Update ProductTags (delete old ones and insert new ones)
    await prisma.productTag.deleteMany({
      where: { catalogProductId: job.catalogProductId }
    });

    if (result.insight.tags && result.insight.tags.length > 0) {
      await prisma.productTag.createMany({
        data: result.insight.tags.map(tagName => ({
          catalogProductId: job.catalogProductId,
          name: tagName
        }))
      });
    }

    // Complete Job
    const processingTime = Date.now() - start;
    await prisma.aIJob.update({
      where: { id: job.id },
      data: {
        status: 'COMPLETED',
        lockedAt: null,
        lockedBy: null,
        processingTime,
        tokenUsage: result.tokenUsage as any,
        estimatedCost: result.estimatedCost,
        errorLog: null
      }
    });

    telemetry.logger.info('AI Job completed successfully', {
      jobId: job.id,
      catalogProductId: job.catalogProductId,
      processingTimeMs: processingTime,
    });

    return NextResponse.json({ success: true, jobId: job.id, status: 'COMPLETED' });

  } catch (error: any) {
    const processingTime = Date.now() - start;
    await prisma.aIJob.update({
      where: { id: job.id },
      data: {
        status: 'FAILED',
        lockedAt: null,
        lockedBy: null,
        processingTime,
        errorLog: error.message || 'Unknown error'
      }
    });

    telemetry.logger.error('AI Job execution failed', {
      jobId: job.id,
      catalogProductId: job.catalogProductId,
      error: error.message
    });

    return NextResponse.json({ success: false, jobId: job.id, error: error.message }, { status: 500 });
  }
}
