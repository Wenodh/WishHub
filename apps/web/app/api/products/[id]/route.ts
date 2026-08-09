import { withApiHandler } from '@/lib/api/handler';
import { ApiResponse } from '@/lib/api/responses';
import { deleteProductService } from '@wishhub/catalog';
import { prisma } from '@wishhub/database';

export const PATCH = withApiHandler(async (req, { params, session }) => {
  const { id } = await params;
  const body = await req.json();

  // Find the user's saved product to guarantee authorization and prevent IDOR
  const savedProduct = await prisma.savedProduct.findUnique({
    where: { id },
  });

  if (!savedProduct || savedProduct.userId !== session.user.id) {
    return ApiResponse.forbidden('You do not have access to this product');
  }

  const { title, price, currency, store, description, imageUrl } = body;

  const updateData: any = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (store !== undefined) updateData.store = store;

  if (imageUrl !== undefined) {
    updateData.images = imageUrl ? [{ url: imageUrl }] : [];
  }

  // Handle metadata updates like price/currency
  const currentCatalog = await prisma.catalogProduct.findUnique({
    where: { id: savedProduct.catalogProductId },
  });

  const currentMetadata = typeof currentCatalog?.metadata === 'string'
    ? JSON.parse(currentCatalog.metadata)
    : (currentCatalog?.metadata || {});

  const updatedMetadata = {
    ...currentMetadata,
    ...(price !== undefined ? { price: price ? parseFloat(price) : null } : {}),
    ...(currency !== undefined ? { currency } : {}),
  };

  updateData.metadata = updatedMetadata;

  const updatedCatalog = await prisma.catalogProduct.update({
    where: { id: savedProduct.catalogProductId },
    data: updateData,
  });

  return ApiResponse.success({ product: updatedCatalog });
});

export const DELETE = withApiHandler(async (req, { params, session }) => {
  const { id } = await params;
  const result = await deleteProductService.execute(session.user.id, id);

  if (!result.ok) {
    const errMsg = (result.error as any) instanceof Error ? (result.error as any).message : String(result.error);
    return ApiResponse.badRequest(errMsg);
  }

  return ApiResponse.success({ success: true });
});
