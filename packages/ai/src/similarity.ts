import { prisma } from '@wishhub/database';

export interface SimilarityStrategy {
  findSimilar(catalogProductId: string, limit?: number): Promise<any[]>;
}

export class MetadataSimilarityStrategy implements SimilarityStrategy {
  async findSimilar(catalogProductId: string, limit = 5): Promise<any[]> {
    // 1. Fetch current product details to match against
    const current = await prisma.catalogProduct.findUnique({
      where: { id: catalogProductId },
      include: { tags: true }
    });

    if (!current) return [];

    const currentTagNames = current.tags.map(t => t.name);

    // 2. Fetch other products in database
    const others = await prisma.catalogProduct.findMany({
      where: {
        id: { not: catalogProductId }
      },
      include: {
        tags: true
      }
    });

    // 3. Compute simple metadata overlap score
    const scored = others.map(p => {
      let score = 0;

      // Brand match (e.g. 3 points)
      if (current.brand && p.brand && current.brand.toLowerCase() === p.brand.toLowerCase()) {
        score += 3;
      }

      // Store match (e.g. 1 point)
      if (current.store.toLowerCase() === p.store.toLowerCase()) {
        score += 1;
      }

      // Category match (e.g. 2 points)
      if (current.category && p.category && current.category.toLowerCase() === p.category.toLowerCase()) {
        score += 2;
      }

      // Tag overlap match (e.g. 2 points per overlapping tag)
      const otherTagNames = p.tags.map(t => t.name);
      const overlapTags = currentTagNames.filter(name => otherTagNames.includes(name));
      score += overlapTags.length * 2;

      // Price closeness (e.g. up to 2 points)
      const priceA = parseFloat((current.metadata as any)?.price || '0');
      const priceB = parseFloat((p.metadata as any)?.price || '0');
      if (priceA > 0 && priceB > 0) {
        const diffRatio = Math.abs(priceA - priceB) / Math.max(priceA, priceB);
        if (diffRatio < 0.2) {
          score += 2;
        } else if (diffRatio < 0.5) {
          score += 1;
        }
      }

      return { product: p, score };
    });

    // 4. Sort by score descending and return limit
    return scored
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.product);
  }
}

// Clean extension points for future embedding / hybrid vector search
export class EmbeddingSimilarityStrategy implements SimilarityStrategy {
  async findSimilar(catalogProductId: string, limit = 5): Promise<any[]> {
    throw new Error('EmbeddingSimilarityStrategy is not implemented yet.');
  }
}

export class HybridSimilarityStrategy implements SimilarityStrategy {
  async findSimilar(catalogProductId: string, limit = 5): Promise<any[]> {
    throw new Error('HybridSimilarityStrategy is not implemented yet.');
  }
}

export class SimilarityService {
  private strategy: SimilarityStrategy;

  constructor(strategy?: SimilarityStrategy) {
    this.strategy = strategy || new MetadataSimilarityStrategy();
  }

  async findSimilar(catalogProductId: string, limit = 5): Promise<any[]> {
    return this.strategy.findSimilar(catalogProductId, limit);
  }
}
export const similarityService = new SimilarityService();
