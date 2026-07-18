import { environment } from '@environments/environment';

export const API_CONFIG = {
  baseUrl: environment.apiUrl,
  endpoints: {
    auth: {
      register: '/auth/register',
      login: '/auth/login',
      me: '/auth/me',
      verifyEmail: '/auth/verify-email',
      resendVerification: '/auth/resend-verification',
      forgotPassword: '/auth/forgot-password',
      resetPassword: '/auth/reset-password',
    },
    images: {
      upload: '/images/upload',
      list: '/images',
      updateTags: (id: string) => `/images/${id}/tags`,
    },
    taxonomies: {
      list: '/taxonomies',
    },
  },
  storage: {
    accessTokenKey: 'thread_sense_access_token',
    userKey: 'thread_sense_user',
  },
};
