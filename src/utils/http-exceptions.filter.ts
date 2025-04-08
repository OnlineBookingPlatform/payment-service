import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

class ApiResponse<T> {
  status: number;
  message: string;
  result: T | null;

  constructor(status: number, message: string, result: T | null = null) {
    this.status = status;
    this.message = message;
    this.result = result;
  }

  static success<T>(result: T, message = 'Success'): ApiResponse<T> {
    return new ApiResponse<T>(200, message, result);
  }

  static error<T>(
    message = 'Error',
    status = 500,
    result: T | null = null,
  ): ApiResponse<T> {
    return new ApiResponse<T>(status, message, result);
  }
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    console.log('🚀 Caught Exception:', exception);

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';
    let result: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        'message' in exceptionResponse &&
        'result' in exceptionResponse
      ) {
        message = (exceptionResponse.message as string) || message;
        result = exceptionResponse.result || null;
      }
    }

    response.status(status).json(new ApiResponse(status, message, result));
  }
}
