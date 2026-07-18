import { Injectable, inject, computed, effect } from '@angular/core';
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { Router } from '@angular/router';
import { AuthApiService } from '@core/services/auth-api.service';
import { NotificationService } from '@core/services/notification.service';
import { API_CONFIG } from '@core/config/api.config';
import { User } from '@models/view/auth.view-models';
import { UserDto } from '@models/api/auth.models';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, of } from 'rxjs';

interface SessionState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: SessionState = {
  user: null,
  accessToken: null,
  isLoading: false,
  error: null,
};

export const SessionStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ user, accessToken }) => ({
    isAuthenticated: computed(() => !!user() && !!accessToken()),
  })),
  withMethods((store) => {
    const authApi = inject(AuthApiService);
    const router = inject(Router);
    const notification = inject(NotificationService);

    return {
      setUser: (user: User | null) => {
        patchState(store, { user });
      },

      setAccessToken: (token: string | null) => {
        patchState(store, { accessToken: token });
        if (token) {
          sessionStorage.setItem(API_CONFIG.storage.accessTokenKey, token);
        } else {
          sessionStorage.removeItem(API_CONFIG.storage.accessTokenKey);
        }
      },

      setLoading: (isLoading: boolean) => {
        patchState(store, { isLoading });
      },

      setError: (error: string | null) => {
        patchState(store, { error });
      },

      login: rxMethod<{ email: string; password: string }>(
        switchMap(({ email, password }) => {
          patchState(store, { isLoading: true, error: null });
          return authApi.login({ email, password }).pipe(
            tap((response) => {
              const user: User = {
                id: response.user.id,
                email: response.user.email,
                emailVerified: response.user.emailVerified,
              };
              patchState(store, {
                user,
                accessToken: response.accessToken,
                isLoading: false,
              });
              sessionStorage.setItem(API_CONFIG.storage.accessTokenKey, response.accessToken);
              router.navigate(['/dashboard']);
            }),
            catchError((error: Error) => {
              patchState(store, {
                isLoading: false,
                error: error.message || 'Login failed',
              });
              return of();
            })
          );
        })
      ),

      register: rxMethod<{ email: string; password: string }>(
        switchMap(({ email, password }) => {
          patchState(store, { isLoading: true, error: null });
          return authApi.register({ email, password }).pipe(
            tap(() => {
              patchState(store, { isLoading: false });
              notification.success(
                'Account Created!',
                'Your account has been created successfully. Please check your email to verify your account, then log in.',
                'Go to Login'
              );
              router.navigate(['/login'], {
                queryParams: { registered: 'true' },
              });
            }),
            catchError((error: Error) => {
              patchState(store, {
                isLoading: false,
                error: error.message || 'Registration failed',
              });
              return of();
            })
          );
        })
      ),

      restoreSession: rxMethod<void>(
        switchMap(() => {
          const token = sessionStorage.getItem(API_CONFIG.storage.accessTokenKey);
          if (!token) {
            patchState(store, { isLoading: false });
            return of();
          }
          patchState(store, { accessToken: token, isLoading: true });
          
          return authApi.me().pipe(
            tap((userDto: UserDto) => {
              const user: User = {
                id: userDto.id,
                email: userDto.email,
                emailVerified: userDto.emailVerified,
                createdAt: userDto.createdAt ? new Date(userDto.createdAt) : undefined,
              };
              patchState(store, { user, isLoading: false });
            }),
            catchError(() => {
              patchState(store, {
                user: null,
                accessToken: null,
                isLoading: false,
              });
              sessionStorage.removeItem(API_CONFIG.storage.accessTokenKey);
              return of();
            })
          );
        })
      ),

      logout: () => {
        patchState(store, {
          user: null,
          accessToken: null,
          isLoading: false,
          error: null,
        });
        sessionStorage.removeItem(API_CONFIG.storage.accessTokenKey);
        router.navigate(['/login']);
      },
    };
  })
);

@Injectable({ providedIn: 'root' })
export class SessionStoreInitializer {
  private readonly sessionStore = inject(SessionStore);

  constructor() {
    effect(() => {
      this.sessionStore.restoreSession();
    });
  }
}
