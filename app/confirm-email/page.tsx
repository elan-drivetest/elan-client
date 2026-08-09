"use client"

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useAuth } from '@/lib/context/AuthContext';
import { hasBookingInProgress } from '@/lib/utils/booking.utils';

function ConfirmEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const confirmEmail = async () => {
      // Get hash from URL query parameter
      const hash = searchParams.get('hash');

      if (!hash) {
        setStatus('error');
        setErrorMessage('Invalid confirmation link. No hash parameter found.');
        return;
      }

      try {
        console.log('🔍 Confirming email with hash...');

        // Step 1: Confirm email with the hash
        const confirmResult = await authApi.confirmEmail(hash);

        if (!confirmResult.success) {
          console.error('❌ Email confirmation failed:', confirmResult.error);
          setStatus('error');
          setErrorMessage(
            confirmResult.error?.message ||
            'Failed to verify your email. The link may be expired or invalid.'
          );
          return;
        }

        console.log('✅ Email confirmed successfully');

        // Step 2: Get the current user data (backend should have set auth cookie)
        const userResult = await authApi.getCurrentUser();

        // The saved booking (localStorage) decides where the user continues:
        // back into the booking flow with their Step 1 values, or the dashboard.
        const resumeBooking = hasBookingInProgress();

        if (userResult.success && userResult.data) {
          console.log('✅ User data retrieved:', userResult.data);

          // Step 3: Set user in auth context
          login(userResult.data);

          // Step 4: Show success and redirect after a brief delay.
          // The destination (/book-road-test-vehicle/booking-details) lives
          // inside BookingProvider and fetches its own data on mount, so we
          // don't (and can't) use booking context here.
          setStatus('success');

          setTimeout(() => {
            router.push(resumeBooking ? '/book-road-test-vehicle/booking-details' : '/dashboard');
          }, 2000);
        } else {
          // Email confirmed but couldn't get user data (e.g. auth cookie not
          // set) - send to login, telling it where to land after a successful
          // login so an in-progress booking is resumed with its saved values.
          console.warn('⚠️ Email confirmed but could not retrieve user data');
          setStatus('success');

          setTimeout(() => {
            const loginUrl = resumeBooking
              ? `/login?verified=true&redirect=${encodeURIComponent('/book-road-test-vehicle/booking-details')}`
              : '/login?verified=true';
            router.push(loginUrl);
          }, 2000);
        }
      } catch (error) {
        console.error('💥 Email confirmation error:', error);
        setStatus('error');
        setErrorMessage('An unexpected error occurred. Please try again or contact support.');
      }
    };

    confirmEmail();
  }, [searchParams, login, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {status === 'verifying' && (
          <div className="text-center">
            <div className="mb-4">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Verifying Your Email
            </h1>
            <p className="text-gray-600">
              Please wait while we confirm your email address...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Email Verified Successfully!
            </h1>
            <p className="text-gray-600 mb-4">
              Your email has been confirmed. You are now signed in.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting you...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Verification Failed
            </h1>
            <p className="text-gray-600 mb-6">
              {errorMessage}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/login')}
                className="w-full bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors"
              >
                Go to Login
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full bg-white text-gray-700 py-2 px-4 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="mb-4">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Loading...
            </h1>
          </div>
        </div>
      </div>
    }>
      <ConfirmEmailContent />
    </Suspense>
  );
}
