import { AIProvider, ProductInput, ProviderResult, AIInsight, AIInsightSchema } from './types';
import OpenAI from 'openai';
import { telemetry } from '@wishhub/telemetry';

export class MockAIProvider implements AIProvider {
  name = 'MockAIProvider';

  async generateInsight(product: ProductInput, promptText: string): Promise<ProviderResult> {
    const startTime = Date.now();

    // Hash function to make outputs deterministic for the same title
    let hash = 0;
    const title = product.title || '';
    for (let i = 0; i < title.length; i++) {
      hash = (hash << 5) - hash + title.charCodeAt(i);
      hash |= 0;
    }
    const absHash = Math.abs(hash);

    // Derive tags
    const tagsSet = new Set<string>();
    const lowerTitle = title.toLowerCase();
    const priceNum = typeof product.price === 'number' ? product.price : parseFloat(product.price || '0');

    if (lowerTitle.includes('game') || lowerTitle.includes('gaming') || lowerTitle.includes('xbox') || lowerTitle.includes('nintendo') || lowerTitle.includes('playstation') || lowerTitle.includes('razer') || lowerTitle.includes('switch')) {
      tagsSet.add('Gaming');
    }
    if (lowerTitle.includes('budget') || lowerTitle.includes('cheap') || (priceNum < 50 && priceNum > 0)) {
      tagsSet.add('Budget');
    }
    if (lowerTitle.includes('office') || lowerTitle.includes('desk') || lowerTitle.includes('chair') || lowerTitle.includes('work')) {
      tagsSet.add('Office');
    }
    if (lowerTitle.includes('travel') || lowerTitle.includes('bag') || lowerTitle.includes('luggage') || lowerTitle.includes('backpack')) {
      tagsSet.add('Travel');
    }
    if (lowerTitle.includes('apple') || lowerTitle.includes('pro') || lowerTitle.includes('leather') || priceNum > 300) {
      tagsSet.add('Premium');
    }
    if (lowerTitle.includes('electron') || lowerTitle.includes('phone') || lowerTitle.includes('camera') || lowerTitle.includes('laptop') || lowerTitle.includes('headphone') || lowerTitle.includes('speaker')) {
      tagsSet.add('Electronics');
    }

    if (tagsSet.size === 0) {
      tagsSet.add('Electronics');
    }

    const tags = Array.from(tagsSet);

    // Derive recommendation
    let buyRecommendation: 'Good Buy' | 'Consider Waiting' | 'Compare Alternatives' | 'Not Enough Information' = 'Good Buy';
    if (absHash % 4 === 1) buyRecommendation = 'Consider Waiting';
    else if (absHash % 4 === 2) buyRecommendation = 'Compare Alternatives';
    else if (absHash % 4 === 3) buyRecommendation = 'Not Enough Information';

    // Derive confidence score
    const confidenceScore = parseFloat((0.7 + (absHash % 30) / 100).toFixed(2));

    // Summary & details
    const brandStr = product.brand || 'This product';
    const storeStr = product.store || 'the store';
    const summary = `Concise AI analysis of ${title} by ${brandStr}. It is an excellent choice from ${storeStr} suited for daily use, matching style with modern performance.`;

    const pros = [
      `Sleek design and aesthetics by ${brandStr}`,
      `Excellent integration and convenience through ${storeStr}`,
      `High-quality materials matching original specifications`
    ];

    const cons = [
      priceNum > 200 ? 'Higher premium price point' : 'Limited availability in offline retail',
      'No extensive long-term durability data captured yet'
    ];

    const reasoning = `Based on pricing of ${product.currency || '$'}${priceNum || 'unspecified'}, strong brand reputation of ${brandStr}, and positive sentiment analytics from catalog records.`;

    const insight: AIInsight = {
      summary,
      pros,
      cons,
      buyRecommendation,
      confidenceScore,
      reasoning,
      tags
    };

    const duration = Date.now() - startTime;

    return {
      insight,
      model: 'mock-model-v1',
      promptVersion: '1.0.0',
      tokenUsage: {
        promptTokens: 150,
        completionTokens: 80,
        totalTokens: 230
      },
      estimatedCost: 0.0004
    };
  }
}

export class OpenAIProvider implements AIProvider {
  name = 'OpenAI';
  private client: OpenAI;

  constructor(apiKey?: string) {
    this.client = new OpenAI({ apiKey: apiKey || process.env.OPENAI_API_KEY || 'dummy-key' });
  }

  async generateInsight(product: ProductInput, promptText: string): Promise<ProviderResult> {
    const startTime = Date.now();
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    try {
      const response = await this.client.chat.completions.create({
        model,
        messages: [{ role: 'user', content: promptText }],
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error('No content returned from OpenAI');

      const rawJson = JSON.parse(content);
      const validated = AIInsightSchema.parse(rawJson);

      const promptTokens = response.usage?.prompt_tokens || 0;
      const completionTokens = response.usage?.completion_tokens || 0;
      const totalTokens = response.usage?.total_tokens || 0;

      // Pricing structure estimate for mini models (e.g. gpt-4o-mini is 0.15/1M prompt, 0.60/1M completion)
      const costPerPrompt = 0.15 / 1000000;
      const costPerCompletion = 0.60 / 1000000;
      const estimatedCost = (promptTokens * costPerPrompt) + (completionTokens * costPerCompletion);

      return {
        insight: validated,
        model,
        promptVersion: '1.0.0',
        tokenUsage: {
          promptTokens,
          completionTokens,
          totalTokens
        },
        estimatedCost
      };
    } catch (error: any) {
      telemetry.logger.error('OpenAI generateInsight failed', { error: error.message });
      throw error;
    }
  }
}

export class AIProviderFactory {
  static getProvider(): AIProvider {
    const providerType = process.env.AI_PROVIDER || 'mock';

    if (providerType === 'openai') {
      return new OpenAIProvider();
    }

    return new MockAIProvider();
  }
}
