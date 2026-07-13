import { NextResponse } from 'next/server';

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export const ApiResponse = {
  success: <T>(data: T, status = 200) => {
    return NextResponse.json({ success: true, data }, { status });
  },

  created: <T>(data: T) => {
    return ApiResponse.success(data, 201);
  },

  noContent: () => {
    return new NextResponse(null, { status: 204 });
  },

  error: (code: string, message: string, status: number) => {
    return NextResponse.json(
      {
        success: false,
        error: { code, message },
      },
      { status }
    );
  },

  badRequest: (message: string, code = 'BAD_REQUEST') => {
    return ApiResponse.error(code, message, 400);
  },

  unauthorized: (message = 'Unauthorized') => {
    return ApiResponse.error('UNAUTHORIZED', message, 401);
  },

  forbidden: (message = 'Forbidden') => {
    return ApiResponse.error('FORBIDDEN', message, 403);
  },

  notFound: (message = 'Not Found') => {
    return ApiResponse.error('NOT_FOUND', message, 404);
  },

  conflict: (message: string, code = 'CONFLICT') => {
    return ApiResponse.error(code, message, 409);
  },

  unprocessable: (message: string, code = 'UNPROCESSABLE_ENTITY') => {
    return ApiResponse.error(code, message, 422);
  },

  internalServerError: (message = 'Internal Server Error') => {
    return ApiResponse.error('INTERNAL_SERVER_ERROR', message, 500);
  },
};
