import { type ExtractionProduct, ExtractionProductSchema } from '@wishhub/contracts';

export interface ValidationResult {
  isValid: boolean;
  missingFields: string[];
  warnings: string[];
  errors: string[];
}

export function validateProduct(product: Partial<ExtractionProduct>): ValidationResult {
  const missingFields: string[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];

  const requiredFields: (keyof ExtractionProduct)[] = ['title', 'originalUrl'];

  requiredFields.forEach(field => {
    if (!product[field]) {
      missingFields.push(field);
    }
  });

  if (!product.images || product.images.length === 0) {
    warnings.push('No images found');
  }

  if (product.price === undefined) {
    warnings.push('Price not found');
  }

  const result = ExtractionProductSchema.safeParse(product);
  if (!result.success) {
    result.error.issues.forEach(issue => {
      errors.push(`${issue.path.join('.')}: ${issue.message}`);
    });
  }

  return {
    isValid: missingFields.length === 0 && errors.length === 0,
    missingFields,
    warnings,
    errors,
  };
}
