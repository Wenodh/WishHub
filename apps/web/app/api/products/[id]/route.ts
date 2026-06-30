import { NextResponse } from 'next/server';
import { auth } from '@wishhub/auth';
import { deleteProductService } from '@wishhub/catalog';

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await deleteProductService.execute(session.user.id, params.id);
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
