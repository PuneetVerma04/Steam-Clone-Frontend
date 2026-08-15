import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { TokenService } from '@core/services/token.service';
import { NotificationService } from '@core/services/notification.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private tokenService: TokenService,
    private notificationService: NotificationService,
  ) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // SECURITY NOTE: Never log the Authorization header or token value here.
        if (error.status === 401) {
          this.tokenService.clearToken();
          this.router.navigate(['/auth/login']);
        } else if (error.status === 403) {
          this.notificationService.error('Access denied');
        } else if (error.status === 500) {
          this.notificationService.error('Something went wrong. Please try again.');
        }
        return throwError(() => error);
      }),
    );
  }
}
