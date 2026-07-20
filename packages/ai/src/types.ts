import { z } from 'zod';

export const AIInsightSchema = z.object({
  summary: z.string().describe('Concise summary explaining what the product is, who it is for, notable strengths, and drawbacks.'),
  pros: z.array(z.string()).describe('List of product pros/strengths.'),
  cons: z.array(z.string()).describe('List of product cons/drawbacks.'),
  buyRecommendation: z.enum([
    'Good Buy',
    'Consider Waiting',
    'Compare Alternatives',
    'Not Enough Information'
  ]).describe('Buying recommendation based on the product characteristics.'),
  confidenceScore: z.number().min(0).max(1).describe('Confidence score from 0.0 to 1.0 based on evidence.'),
  reasoning: z.string().describe('Clear reasoning explaining why this recommendation was reached.'),
  tags: z.array(z.string()).describe('Concise category/style tags (e.g. Gaming, Budget, Travel, Electronics, Premium).'),
});

export type AIInsight = z.infer<typeof AIInsightSchema>;

export interface ProductInput {
  title: string;
  description?: string | null;
  store: string;
  price?: string | number | null;
  currency?: string | null;
  brand?: string | null;
  category?: string | null;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface ProviderResult {
  insight: AIInsight;
  model: string;
  promptVersion: string;
  tokenUsage: TokenUsage;
  estimatedCost: number;
}

export interface AIProvider {
  name: string;
  generateInsight(product: ProductInput, promptText: string): Promise<ProviderResult>;
}

export interface PromptTemplate {
  version: string;
  identifier: string;
  template: string;
}
