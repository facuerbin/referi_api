import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, body } = request;
    const startTime = Date.now();

    this.logger.log(
      `[${method}] ${url} - Request started`,
    );
    if (Object.keys(body || {}).length > 0) {
      this.logger.debug(`Request body: ${JSON.stringify(body)}`);
    }

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - startTime;
        const statusCode = response.statusCode;
        this.logger.log(
          `[${method}] ${url} - Response ${statusCode} (${duration}ms)`,
        );
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        const statusCode = error.status || 500;
        this.logger.error(
          `[${method}] ${url} - Error ${statusCode} (${duration}ms): ${error.message}`,
        );
        this.logger.debug(`Error details: ${JSON.stringify(error)}`);
        throw error;
      }),
    );
  }
}
