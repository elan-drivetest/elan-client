// lib/context/AuthContext.tsx
"use client"

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { onSessionExpired } from '@/lib/http/session-events';
import type { UserProfile } from '@/lib/types/auth.types';

/**
 * Three-way session verdict.
 *
 * `isAuthenticated` alone cannot tell "the backend said you are logged out"
 * apart from "we never got an answer", and on a cold page load there is no
 * prior user in memory to fall back on — so a single dropped request read as a
 * logout and bounced people to /login. Pages that gate on auth should redirect
 * on `'anonymous'` only, and offer a retry on `'unknown'`.
 */
export type AuthStatus = 'unknown' | 'authenticated' | 'anonymous';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  authStatus: AuthStatus;
  login: (user: UserProfile) => void;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<UserProfile | null>;
  refreshAuth: () => Promise<boolean>;
}

// How long to wait before asking /me a second time when the first attempt was
// inconclusive. Long enough to ride out a dev-API cold start or a dropped
// connection on a flaky mobile link, short enough not to stall the first paint.
const INCONCLUSIVE_RETRY_DELAY_MS = 1200;

// Only the backend actively rejecting us settles the question. Everything else
// — status_code 0 (never reached the backend) and 5xx (backend unwell) — is an
// absence of evidence, not evidence of a logout.
const isConclusiveRejection = (status: number): boolean =>
  status === 401 || status === 403;

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Routes that run their own auth choreography. A session-expiry event must not
// yank the user off these: the booking flow deliberately lets unauthenticated
// users through Steps 1-2, /confirm-email is mid-verification and picks its own
// destination, and the auth pages are already where an expired user belongs.
const SELF_MANAGED_AUTH_ROUTES = [
  '/book-road-test-vehicle',
  '/confirm-email',
  '/login',
  '/signup',
  '/forgot-password',
  '/password-change',
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);

  // Starts true: on every page load we ask the backend who the user is before
  // rendering a verdict. Consumers (Navbar, dashboards) already show a loading
  // state, so this closes the window where a logged-in user is briefly shown
  // the logged-out UI.
  const [isLoading, setIsLoading] = useState(true);

  // Stays 'unknown' until the backend gives us a definitive answer. An
  // inconclusive check deliberately leaves it alone.
  const [authStatus, setAuthStatus] = useState<AuthStatus>('unknown');

  // Mirrors `user` for reads inside callbacks that must not re-subscribe on
  // every user change (the session-expiry listener, in-flight request handlers).
  const userRef = useRef<UserProfile | null>(null);
  const inFlightCheck = useRef<Promise<UserProfile | null> | null>(null);
  const hasBootstrapped = useRef(false);
  const isRedirecting = useRef(false);

  // Every call site here is a definitive verdict — a profile we just read, a
  // 401/403, a logout, a failed refresh — so deriving the status is safe. The
  // inconclusive path below never reaches this function, which is exactly how
  // 'unknown' survives a blip.
  const applyUser = useCallback((nextUser: UserProfile | null) => {
    userRef.current = nextUser;
    setUser(nextUser);
    setAuthStatus(nextUser ? 'authenticated' : 'anonymous');
  }, []);

  // Ask the backend who we are.
  //
  // Concurrent callers share one request: the provider bootstraps on mount and
  // pages such as /dashboard also call this, and without de-duplication that is
  // two /auth/customer/me round trips (each capable of triggering its own 401
  // handling) for one page view.
  const checkAuthStatus = useCallback(async (): Promise<UserProfile | null> => {
    if (inFlightCheck.current) {
      return inFlightCheck.current;
    }

    setIsLoading(true);

    const request = (async (): Promise<UserProfile | null> => {
      try {
        let result = await authApi.getCurrentUser();

        // Ask once more before drawing any conclusion from a non-answer. On a
        // cold load there is no prior session to fall back on, so an
        // inconclusive first attempt would otherwise present as a logout and
        // send the user to /login.
        if (
          !result.success &&
          !isConclusiveRejection(result.error?.status_code ?? 0)
        ) {
          await delay(INCONCLUSIVE_RETRY_DELAY_MS);
          result = await authApi.getCurrentUser();
        }

        if (result.success && result.data) {
          applyUser(result.data);
          return result.data;
        }

        const status = result.error?.status_code ?? 0;

        // Only a definitive rejection from the backend means "logged out".
        // status_code 0 means the request never completed (offline, CORS,
        // timeout) and 5xx means the backend is unwell — neither is evidence
        // that the session ended. Treating them as a logout is why a transient
        // blip used to eject users; we keep whatever session we already had.
        if (isConclusiveRejection(status)) {
          applyUser(null);
          return null;
        }

        console.warn(
          `Auth check inconclusive (status ${status}) — keeping the current session`
        );
        return userRef.current;
      } catch (error) {
        console.error('Auth check threw:', error);
        return userRef.current;
      } finally {
        setIsLoading(false);
        inFlightCheck.current = null;
      }
    })();

    inFlightCheck.current = request;
    return request;
  }, [applyUser]);

  // Hydrate the session once per app load.
  //
  // Auth state lives in cookies on the API domain, but it used to live ONLY in
  // this component's memory on the client — so a hard reload, a new tab, or a
  // return trip from Stripe or an email link left the app rendering as though
  // the user had been logged out, even with a perfectly valid session.
  useEffect(() => {
    if (hasBootstrapped.current) return;
    hasBootstrapped.current = true;
    checkAuthStatus();
  }, [checkAuthStatus]);

  // React to the axios layer reporting that a 401 survived a refresh attempt.
  useEffect(() => {
    return onSessionExpired(() => {
      // Nothing to lose: an anonymous visitor on a public page 401s on the
      // bootstrap call above, and that must never bounce them to /login.
      if (!userRef.current) return;

      applyUser(null);

      if (isRedirecting.current) return;

      const path = window.location.pathname;
      if (SELF_MANAGED_AUTH_ROUTES.some((route) => path.startsWith(route))) return;

      isRedirecting.current = true;
      const returnTo = `${path}${window.location.search}`;
      router.replace(
        `/login?expired=true&redirect=${encodeURIComponent(returnTo)}`
      );
    });
  }, [applyUser, router]);

  // Set user data after successful login
  const login = useCallback(
    (userData: UserProfile) => {
      applyUser(userData);
      // A fresh session re-arms the expiry redirect for the next time.
      isRedirecting.current = false;
    },
    [applyUser]
  );

  // Manually renew the session.
  //
  // The refresh endpoint only rotates cookies; it returns no profile. So we
  // refresh and then re-read /auth/customer/me. The previous version read
  // `result.data` straight off the refresh response, found it empty, and
  // concluded the user was logged out — a manual refresh logged you out.
  const refreshAuth = useCallback(async (): Promise<boolean> => {
    const result = await authApi.refreshToken();

    if (!result.success) {
      applyUser(null);
      return false;
    }

    const profile = await checkAuthStatus();
    return !!profile;
  }, [applyUser, checkAuthStatus]);

  // Logout
  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);

    try {
      await authApi.logout();
    } catch (error) {
      // Continue with the frontend logout even if the backend call fails.
      console.error('Backend logout error:', error);
    } finally {
      applyUser(null);
      setIsLoading(false);

      // A full navigation rather than router.push: this is the one place where
      // discarding every scrap of in-memory state is the point.
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  }, [applyUser]);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    authStatus,
    login,
    logout,
    checkAuthStatus,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
