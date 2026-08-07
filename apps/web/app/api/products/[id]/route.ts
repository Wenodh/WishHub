import { withApiHandler } from '@/lib/api/handler';
import { ApiResponse } from '@/lib/api/responses';
import { deleteProductService } from '@wishhub/catalog';

export const DELETE = withApiHandler(async (req, { params, session }) => {
  const { id } = await params;
  const result = await deleteProductService.execute(session.user.id, id);

  if (!result.ok) {
    const errMsg = (result.error as any) instanceof Error ? (result.error as any).message : String(result.error);
    return ApiResponse.badRequest(errMsg);
  }

  return ApiResponse.success({ success: true });
});
