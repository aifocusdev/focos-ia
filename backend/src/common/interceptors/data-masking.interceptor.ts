import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataMaskingUtil } from '../utils/data-masking.util';

@Injectable()
export class DataMaskingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (!data) {
          return data;
        }

        if (this.shouldMaskData(context)) {
          return DataMaskingUtil.maskContactData(data);
        }

        return data;
      }),
    );
  }

  private shouldMaskData(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const url: string = request.url;

    const maskingRoutes = ['/contacts', '/conversations', '/messages'];

    return maskingRoutes.some((route) => url.includes(route));
  }
}
