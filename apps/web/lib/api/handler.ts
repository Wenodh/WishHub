import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@wishhub/auth';
import { telemetry } from '@wishhub/telemetry';
import { ApiResponse } from './responses';

export type ApiHandler = (
  req: NextRequest,
  context: { params: any; session: any }
) => Promise<NextResponse>;

export function withApiHandler(handler: ApiHandler) {
  return async (req: NextRequest, { params }: { params: any }) => {
    const requestId = crypto.randomUUID();
    const startTime = Date.now();
    const { pathname } = new URL(req.url);

    try {
      const session = await auth.api.getSession({ headers: req.headers });

      if (!session) {
        return ApiResponse.unauthorized();
      }

      const response = await handler(req, { params, session });

      const duration = Date.now() - startTime;

      telemetry.logger.info('API Request', {
        requestId,
        userId: session.user.id,
        route: pathname,
        method: req.method,
        duration,
        statusCode: response.status,
      });

      return response;
    } catch (error: any) {
      const duration = Date.now() - startTime;

      telemetry.logger.error('API Error', {
        requestId,
        route: pathname,
        method: req.method,
        duration,
        error: error.message,
        stack: error.stack,
      });

      return ApiResponse.internalServerError(error.message);
    }
  };
}
