import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { SessionStore } from '@state/session.store';
import { NotificationService } from '@core/services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const sessionStore = inject(SessionStore);
  const notification = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isAuthRequest =
        req.url.includes('/auth/login') || req.url.includes('/auth/register');

      let title = 'Something Went Wrong';
      let message = 'An unexpected error occurred. Please try again.';

      if (error.status === 0) {
        title = 'Connection Failed';
        message =
          'Unable to reach the server. Please check that the backend is running and try again.';
      } else if (error.status === 401 && isAuthRequest) {
        title = 'Invalid Credentials';
        message = error.error?.message || 'The email or password you entered is incorrect.';
      } else if (error.status === 401) {
        sessionStore.logout();
        router.navigate(['/login']);
        title = 'Session Expired';
        message = 'Your session has expired. Please log in again.';
      } else if (error.status === 403) {
        title = 'Access Denied';
        message = 'You do not have permission to perform this action.';
      } else if (error.status === 404) {
        title = 'Not Found';
        message = 'The requested resource could not be found.';
      } else if (error.status === 409) {
        title = 'Already Exists';
        message = error.error?.message || 'An account with this email already exists.';
      } else if (error.status >= 500) {
        title = 'Server Error';
        message = 'The server encountered a problem. Please try again later.';
      } else if (error.error?.message) {
        const serverMessage = error.error.message;
        message = Array.isArray(serverMessage) ? serverMessage.join('\n') : serverMessage;
      }

      notification.error(title, message);

      return throwError(() => error);
    })
  );
};
