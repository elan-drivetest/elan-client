// lib/http/session-events.ts
//
// Bridge between the axios interceptors (plain modules, outside React) and the
// React tree. When the backend definitively rejects a session — a 401 that
// survived a refresh attempt — the interceptor emits here and AuthProvider
// decides what to do: clear context state and route the user, using the Next.js
// router rather than a full `window.location` page load.
//
// Previously the interceptor called `window.location.href = '/login'` directly,
// which blew away all in-memory state (including in-progress booking data) and
// left AuthContext holding a stale user.

type SessionExpiredListener = () => void;

const listeners = new Set<SessionExpiredListener>();

/**
 * Subscribe to session-expiry events. Returns an unsubscribe function.
 */
export function onSessionExpired(listener: SessionExpiredListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Announce that the backend has definitively rejected the current session.
 *
 * Safe to call repeatedly — listeners are responsible for being idempotent, and
 * AuthProvider guards against redirecting more than once.
 */
export function emitSessionExpired(): void {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (error) {
      console.error('Session-expired listener threw:', error);
    }
  });
}
