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
    const method = req.method;

    try {
      const session = await auth.api.getSession({ headers: req.headers });

      telemetry.track('api.request', {
        route: pathname,
        method,
        requestId,
        userId: session?.user?.id,
      });

      if (!session) {
        const durationMs = Date.now() - startTime;
        telemetry.track('api.response', {
          route: pathname,
          method,
          statusCode: 401,
          durationMs,
          requestId,
          errorCode: 'UNAUTHORIZED',
        });
        return ApiResponse.unauthorized();
      }

      const response = await handler(req, { params, session });

      const durationMs = Date.now() - startTime;

      // Try to extract error code if it's a failure response
      let errorCode: string | undefined;
      if (response.status >= 400) {
          try {
              const clone = response.clone();
              const body = await clone.json();
              errorCode = body.error?.code;
          } catch (e) {
              // Ignore if body is not JSON or doesn't have expected shape
          }
      }

      telemetry.track('api.response', {
        requestId,
        userId: session.user.id,
        route: pathname,
        method,
        durationMs,
        statusCode: response.status,
        errorCode,
      });

      return response;
    } catch (error: any) {
      const durationMs = Date.now() - startTime;

      telemetry.logger.error('API Uncaught Error', {
        requestId,
        route: pathname,
        method,
        durationMs,
        error: error.message,
        stack: error.stack,
      });

      telemetry.track('api.response', {
        route: pathname,
        method,
        statusCode: 500,
        durationMs,
        requestId,
        errorCode: 'INTERNAL_SERVER_ERROR',
      });

      return ApiResponse.internalServerError(error.message);
    }
  };
}
