import { PromptTemplate, ProductInput } from './types';

export const PROMPTS: Record<string, PromptTemplate> = {
  'product-analyzer-v1': {
    version: '1.0.0',
    identifier: 'product-analyzer-v1',
    template: `You are an extremely intelligent personal shopping assistant.
Analyze the following product details and output a beautifully structured analysis.

Product Title: {title}
Brand: {brand}
Store: {store}
Category: {category}
Price: {price} {currency}
Description: {description}

Requirements:
1. Provide a concise summary of what it is, who it is for, strengths, and drawbacks.
2. Identify a robust list of structured pros and cons.
3. Recommend whether this is a "Good Buy", "Consider Waiting", "Compare Alternatives", or "Not Enough Information" with clear reasoning and a confidence score from 0.0 to 1.0.
4. Categorize with appropriate tags (e.g. Gaming, Budget, Travel, Electronics, Premium, Office).

Be highly factual and only make statements grounded in the product data provided.`,
  },
};

export class PromptManager {
  static getPrompt(identifier: string): PromptTemplate {
    const prompt = PROMPTS[identifier];
    if (!prompt) {
      throw new Error(`Prompt template with identifier "${identifier}" not found`);
    }
    return prompt;
  }

  static render(template: string, product: ProductInput): string {
    return template
      .replace('{title}', product.title || '')
      .replace('{brand}', product.brand || 'Unknown Brand')
      .replace('{store}', product.store || 'Unknown Store')
      .replace('{category}', product.category || 'General')
      .replace('{price}', product.price?.toString() || 'Unpriced')
      .replace('{currency}', product.currency || 'USD')
      .replace('{description}', product.description || 'No description provided.');
  }
}
