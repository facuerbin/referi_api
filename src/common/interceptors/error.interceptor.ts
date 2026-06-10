import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  Logger,
  HttpException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  private readonly logger = new Logger('ERROR');

  intercept(context: ExecutionContext, next): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        const request = context.switchToHttp().getRequest<Request>();
        const { method, url } = request;

        if (error instanceof HttpException) {
          this.logger.warn(
            `HTTP Exception [${method}] ${url}: ${error.getStatus()} - ${error.message}`,
          );
        } else {
          this.logger.error(
            `Unhandled Exception [${method}] ${url}: ${error.message}`,
            error.stack,
          );
        }

        throw error;
      }),
    );
  }
}
