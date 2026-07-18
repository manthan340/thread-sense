import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { SessionStore } from '@state/session.store';

export const guestGuard: CanActivateFn = () => {
  const sessionStore = inject(SessionStore);
  const router = inject(Router);

  if (!sessionStore.isAuthenticated()) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};
