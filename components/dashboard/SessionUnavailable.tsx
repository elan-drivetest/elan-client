"use client"

import React from 'react';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';

/**
 * Shown when we could not establish whether the visitor is signed in.
 *
 * This is deliberately NOT the "Authentication Required" screen. The backend
 * never told us the session was over — the request simply did not complete
 * (offline, CORS, timeout, a 5xx or an API cold start). Treating that as a
 * logout is what produced the "it logged me out again" reports, so the only
 * honest thing to offer here is another attempt.
 */
export default function SessionUnavailable({
  onRetry,
  isRetrying = false,
}: {
  onRetry: () => void;
  isRetrying?: boolean;
}) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white">
      <DashboardSidebar />
      <div className="flex-1 p-4 sm:p-6 md:p-8 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-xl font-semibold text-gray-600 mb-4">
            We couldn&apos;t reach the server
          </div>
          <div className="text-gray-500 mb-6">
            Your session is still active — we just couldn&apos;t confirm it.
            Check your connection and try again.
          </div>
          <button
            onClick={onRetry}
            disabled={isRetrying}
            className="bg-[#0C8B44] hover:bg-[#0C8B44]/90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-md"
          >
            {isRetrying ? 'Checking…' : 'Try again'}
          </button>
        </div>
      </div>
    </div>
  );
}
