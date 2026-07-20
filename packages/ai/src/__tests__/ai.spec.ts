import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PromptManager, MockAIProvider, MetadataSimilarityStrategy, similarityService } from '../index';
import { prisma } from '@wishhub/database';

vi.mock('@wishhub/database', () => ({
  prisma: {
    catalogProduct: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

vi.mock('@wishhub/telemetry', () => ({
  telemetry: {
    logger: {
      info: vi.fn(),
      error: vi.fn(),
    },
  },
}));

describe('AI Package Infrastructure', () => {
  describe('PromptManager', () => {
    it('should retrieve a valid prompt template by identifier', () => {
      const template = PromptManager.getPrompt('product-analyzer-v1');
      expect(template).toBeDefined();
      expect(template.version).toBe('1.0.0');
    });

    it('should throw an error for non-existent identifiers', () => {
      expect(() => PromptManager.getPrompt('invalid-prompt-id')).toThrow();
    });

    it('should render a prompt template with product variables', () => {
      const template = 'Title: {title}, Price: {price} {currency}';
      const rendered = PromptManager.render(template, {
        title: 'Nintendo Switch',
        price: 299,
        currency: 'USD',
        store: 'Amazon',
      });
      expect(rendered).toContain('Title: Nintendo Switch');
      expect(rendered).toContain('Price: 299 USD');
    });
  });

  describe('MockAIProvider', () => {
    it('should deterministically generate correct dynamic tags and summary', async () => {
      const provider = new MockAIProvider();
      const product = {
        title: 'Razer Gaming Headphone',
        brand: 'Razer',
        store: 'Amazon',
        price: 150,
        currency: 'USD',
        category: 'Electronics',
      };

      const result = await provider.generateInsight(product, 'Dummy Prompt');

      expect(result.insight).toBeDefined();
      expect(result.insight.tags).toContain('Gaming');
      expect(result.insight.tags).toContain('Electronics');
      expect(result.insight.pros.length).toBeGreaterThan(0);
      expect(result.insight.cons.length).toBeGreaterThan(0);
      expect(result.model).toBe('mock-model-v1');
      expect(result.tokenUsage.totalTokens).toBe(230);
    });

    it('should deterministically assign premium tag for expensive items', async () => {
      const provider = new MockAIProvider();
      const product = {
        title: 'Luxury Apple Watch Case',
        brand: 'Luxury',
        store: 'Amazon',
        price: 500,
        currency: 'USD',
      };

      const result = await provider.generateInsight(product, 'Dummy Prompt');

      expect(result.insight.tags).toContain('Premium');
    });
  });

  describe('MetadataSimilarityStrategy', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should match products based on brand, category, and tags overlap', async () => {
      const currentProduct = {
        id: 'p-1',
        title: 'Apple iPad Pro',
        brand: 'Apple',
        store: 'Amazon',
        category: 'Tablets',
        metadata: { price: 799 },
        tags: [{ name: 'Premium' }, { name: 'Electronics' }],
      };

      const similarProducts = [
        {
          id: 'p-2',
          title: 'Apple iPhone 15',
          brand: 'Apple',
          store: 'Amazon',
          category: 'Phones',
          metadata: { price: 999 },
          tags: [{ name: 'Premium' }, { name: 'Electronics' }],
        },
        {
          id: 'p-3',
          title: 'Samsung Galaxy Tab',
          brand: 'Samsung',
          store: 'BestBuy',
          category: 'Tablets',
          metadata: { price: 599 },
          tags: [{ name: 'Electronics' }],
        },
      ];

      vi.mocked(prisma.catalogProduct.findUnique).mockResolvedValue(currentProduct as any);
      vi.mocked(prisma.catalogProduct.findMany).mockResolvedValue(similarProducts as any);

      const strategy = new MetadataSimilarityStrategy();
      const results = await strategy.findSimilar('p-1', 5);

      expect(results.length).toBe(2);
      expect(results[0].id).toBe('p-2'); // Apple match + tags overlap makes iPhone higher match score
    });
  });
});
