import { withApiHandler } from '@/lib/api/handler';
import { ApiResponse } from '@/lib/api/responses';
import {
  listProductsService,
  saveProductService
} from '@wishhub/catalog';
import { CreateProductRequestSchema, PaginationSchema } from '@wishhub/contracts';

export const GET = withApiHandler(async (req, { session }) => {
  const { searchParams } = new URL(req.url);
  const paginationResult = PaginationSchema.safeParse({
    limit: Number(searchParams.get('limit')) || undefined,
    cursor: searchParams.get('cursor') || undefined,
  });

  if (!paginationResult.success) {
    return ApiResponse.badRequest('Invalid pagination parameters');
  }

  const result = await listProductsService.execute(session.user.id, paginationResult.data);

  if (!result.ok) {
    const errMsg = (result.error as any) instanceof Error ? (result.error as any).message : String(result.error);
    return ApiResponse.internalServerError(errMsg);
  }

  return ApiResponse.success({ products: result.value });
});

export const POST = withApiHandler(async (req, { session }) => {
  const body = await req.json();
  const validationResult = CreateProductRequestSchema.safeParse(body);

  if (!validationResult.success) {
    return ApiResponse.badRequest('Validation Failed');
  }

  const result = await saveProductService.execute(session.user.id, validationResult.data);

  if (!result.ok) {
    const errMsg = (result.error as any) instanceof Error ? (result.error as any).message : String(result.error);
    return ApiResponse.badRequest(errMsg);
  }

  const isDuplicate = !!result.value.isDuplicate;

  return ApiResponse.created({
    product: result.value,
    duplicate: isDuplicate,
  });
});
