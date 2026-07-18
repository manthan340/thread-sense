import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { SessionStore } from '@state/session.store';

export const authGuard: CanActivateFn = () => {
  const sessionStore = inject(SessionStore);
  const router = inject(Router);

  if (sessionStore.isAuthenticated()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
