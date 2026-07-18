import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SessionStore } from '@state/session.store';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const sessionStore = inject(SessionStore);
  const token = sessionStore.accessToken();

  // Skip ngrok's browser warning interstitial so API responses return JSON
  const headers: Record<string, string> = {
    'ngrok-skip-browser-warning': 'true',
  };

  if (token && !req.url.includes('/auth/login') && !req.url.includes('/auth/register')) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return next(req.clone({ setHeaders: headers }));
};
