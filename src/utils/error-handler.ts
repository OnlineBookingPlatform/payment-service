/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponse } from './api-response';

export function handleError(error: any): ApiResponse<null> {
  const status =
    error instanceof HttpException
      ? error.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

  const message =
    error instanceof HttpException
      ? typeof error.getResponse() === 'string'
        ? error.getResponse()
        : (error.getResponse() as any)?.message || 'Unknown Error'
      : 'Internal Server Error';

  return ApiResponse.error(message, status);
}