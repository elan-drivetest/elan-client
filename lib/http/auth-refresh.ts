// lib/http/auth-refresh.ts
//
// ONE refresh coordinator, shared by every axios instance in the app.
//
// Why this exists: we run three axios instances (lib/api.ts,
// booking.service.ts, fileUpload.service.ts). Each used to carry its own
// `isRefreshing` flag and its own queue, so a page that fired requests through
// two instances at once (e.g. the dashboard calling /auth/customer/me and
// /bookings together) could send TWO concurrent POST /auth/customer/refresh
// calls. The backend rotates the refresh token and compares the raw cookie
// against the stored one, so the second call arrived with an
// already-rotated cookie, got a 401, and hard-logged the user out mid-session.
//
// Here there is a single module-level in-flight promise. Every 401 across every
// instance awaits the same refresh. The de-duplication IS the queue.

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '@/lib/config/api';
import { emitSessionExpired } from '@/lib/http/session-events';

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

// Endpoints where a 401 is a legitimate answer rather than an expired session.
// Refreshing on these is pointless and, for /refresh itself, recursive.
const NO_REFRESH_ENDPOINTS = [
  '/login',
  '/register',
  '/refresh',
  '/confirm',
  '/logout',
  '/forgot/password',
  '/reset/password',
];

const isNoRefreshEndpoint = (url: string): boolean =>
  NO_REFRESH_ENDPOINTS.some((endpoint) => url.includes(endpoint));

// A bare client with NO interceptors attached. Refreshing through an
// intercepted instance means a failed refresh re-enters the 401 handler, which
// is how refresh loops start.
const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

let inFlightRefresh: Promise<void> | null = null;

/**
 * Refresh the session, coalescing concurrent callers onto a single request.
 *
 * Deliberately does NOT pre-check for the refresh cookie: `_elanAuthR` is set
 * by the API domain and is HttpOnly, so `document.cookie` can never see it. A
 * pre-check would always report "missing" and skip a refresh that would have
 * succeeded. The backend is the source of truth.
 */
export function refreshSession(): Promise<void> {
  if (!inFlightRefresh) {
    inFlightRefresh = refreshClient
      .post('/auth/customer/refresh')
      .then(() => undefined)
      .finally(() => {
        inFlightRefresh = null;
      });
  }

  return inFlightRefresh;
}

/**
 * Attach the shared 401 -> refresh -> retry behaviour to an axios instance.
 *
 * On a definitive auth failure this emits a session-expired event rather than
 * navigating. AuthProvider owns the decision of whether and where to redirect,
 * because only it knows whether there was a live session to lose.
 */
export function attachAuthRefresh(instance: AxiosInstance, label: string): void {
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as RetriableConfig | undefined;

      if (error.response?.status !== 401 || !originalRequest) {
        return Promise.reject(error);
      }

      const url = originalRequest.url ?? '';

      // A 401 on an auth endpoint is the backend's actual answer — surface it.
      if (isNoRefreshEndpoint(url)) {
        return Promise.reject(error);
      }

      // Already refreshed once for this request and still unauthorised: the
      // session is genuinely dead.
      if (originalRequest._retry) {
        console.warn(`[${label}] Still 401 after refresh — session expired`);
        emitSessionExpired();
        return Promise.reject(error);
      }

      // Mark BEFORE awaiting. Concurrent 401s each mark themselves and then all
      // await the same coordinated refresh, so none of them can start a second.
      originalRequest._retry = true;

      try {
        await refreshSession();
      } catch {
        console.warn(`[${label}] Token refresh failed`);
        emitSessionExpired();
        // Reject with the original 401 so callers see a consistent error shape
        // rather than the refresh call's error.
        return Promise.reject(error);
      }

      // Deliberately outside the try: if the retry itself 401s, it re-enters
      // this interceptor with _retry already set and reports the expiry there.
      // Wrapping it would report the same expiry twice.
      return instance(originalRequest);
    }
  );
}

/**
 * Create an axios instance pre-wired with credentials and shared refresh.
 */
export function createApiClient(label: string, withJsonHeaders = true): AxiosInstance {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    ...(withJsonHeaders ? { headers: { 'Content-Type': 'application/json' } } : {}),
  });

  instance.interceptors.request.use(
    (config) => {
      // Cross-origin cookies only ride along when this is set per request.
      config.withCredentials = true;
      return config;
    },
    (error: AxiosError) => Promise.reject(error)
  );

  attachAuthRefresh(instance, label);

  return instance;
}
