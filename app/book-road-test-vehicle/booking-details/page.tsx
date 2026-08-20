// app/book-road-test-vehicle/booking-details/page.tsx
"use client"

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import BookingStepsProgress from "@/components/booking/BookingStepsProgress";
import SignupForm, { SignupFormData } from "@/components/auth/SignupForm";
import LoginForm, { LoginFormData } from "@/components/auth/LoginForm";
import VehicleSummary from "@/components/booking/VehicleSummary";
import PickupOptions from "@/components/booking/PickupOptions";
import { useBooking } from "@/lib/context/BookingContext";
import { useAuth } from "@/lib/context/AuthContext";
import { authApi, handleApiError } from "@/lib/api";
import { isInactiveAccountError } from "@/lib/utils/error-messages";
import InactiveAccountNotice from "@/components/auth/InactiveAccountNotice";
import { toE164Canadian, formatCanadianPhoneDisplay } from "@/lib/utils/phone.utils";
import type { RegisterRequest, LoginRequest } from "@/lib/types/auth.types";
import { CheckCircle, LayoutDashboard, Loader2 } from "lucide-react";
import { ErrorAlert } from "@/components/ui/error-alert";

const bookingSteps = [
  { id: 1, name: "Road Test Details", path: "/book-road-test-vehicle/road-test-details" },
  { id: 2, name: "Booking Details", path: "/book-road-test-vehicle/booking-details" },
  { id: 3, name: "Test Details", path: "/book-road-test-vehicle/test-details" },
  { id: 4, name: "Payment", path: "/book-road-test-vehicle/payment" },
];

export default function BookingDetails() {
  const router = useRouter();
  const { bookingState, updateBookingState, setCurrentStep, refetchBookingData } = useBooking();
  const { isAuthenticated, user, login, checkAuthStatus, authStatus, isLoading: isAuthLoading } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [errors, setErrors] = useState({ general: "" });
  const [showSuccessState, setShowSuccessState] = useState(false);
  const [showEmailVerificationNotice, setShowEmailVerificationNotice] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [resendEmailSuccess, setResendEmailSuccess] = useState(false);

  // Set when a login was refused only because the account was never activated.
  // Holds the address that was tried, so the activation email can be resent
  // without asking for it again.
  const [inactiveAccountEmail, setInactiveAccountEmail] = useState("");

  // Use refs to prevent infinite re-renders
  const hasSetCurrentStep = useRef(false);
  const hasCheckedAuth = useRef(false);
  const hasValidatedBooking = useRef(false);
  const hasUpdatedUserDetails = useRef(false);

  // Set current step ONCE
  useEffect(() => {
    if (!hasSetCurrentStep.current) {
      setCurrentStep(2);
      hasSetCurrentStep.current = true;
    }
  }, [setCurrentStep]); // Empty dependency array

  // Check authentication status ONCE on mount
  useEffect(() => {
    if (!hasCheckedAuth.current) {
      checkAuthStatus();
      hasCheckedAuth.current = true;
    }
  }, [checkAuthStatus]); // Empty dependency array

  // Redirect to first step if needed fields aren't set - ONCE
  useEffect(() => {
    if (!hasValidatedBooking.current) {
      if (!bookingState.testType || !bookingState.testCenter || !bookingState.testDate || !bookingState.testTime) {
        router.push("/book-road-test-vehicle/road-test-details");
      }
      hasValidatedBooking.current = true;
    }
  }, [bookingState.testCenter, bookingState.testDate, bookingState.testTime, bookingState.testType, router]); // Empty dependency array - check once on mount

  // Update booking state when user is authenticated - ONCE per authentication
  useEffect(() => {
    if (isAuthenticated && user && !showSuccessState && !hasUpdatedUserDetails.current) {
      updateBookingState({
        userDetails: {
          fullName: user.full_name,
          email: user.email,
          phone: user.phone_number || "",
        }
      });
      setShowSuccessState(true);
      hasUpdatedUserDetails.current = true;
    }
  }, [isAuthenticated, user, showSuccessState, updateBookingState]); // Only depend on auth state changes

  // Reset the user update flag when auth state changes
  useEffect(() => {
    if (!isAuthenticated) {
      hasUpdatedUserDetails.current = false;
    } else {
      // Hide email verification notice when user is authenticated
      setShowEmailVerificationNotice(false);
    }
  }, [isAuthenticated]);

  const handleCreateAccount = async (data: SignupFormData) => {
    setIsProcessing(true);
    setErrors({ general: "" });
    
    try {
      // Prepare data for API (map form fields to API fields)
      const apiData: RegisterRequest = {
        full_name: data.fullName,
        email: data.email,
        password: data.password,
        phone_number: toE164Canadian(data.phone) || undefined,
        confirmPassword: "", // Not used by API but required by type
        phone: undefined,    // Not used by API but required by type
        marketing: undefined // Not used by API but required by type
      };

      console.log('🚀 Registering user:', { email: apiData.email, name: apiData.full_name });
      
      // Call the real registration API
      const result = await authApi.register(apiData);
      
      if (result.success) {
        console.log('✅ Registration successful - email verification required');

        // Store email for the verification notice
        setRegisteredEmail(data.email);

        // Store user data in booking state (but user is not authenticated yet)
        updateBookingState({
          userDetails: {
            fullName: data.fullName,
            email: data.email,
            phone: data.phone || "",
          }
        });

        // Show email verification notice instead of success state
        setShowEmailVerificationNotice(true);
      } else {
        // Handle API errors
        const errorMessage = handleApiError(result.error);
        setErrors({ general: errorMessage });
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      setErrors({ general: "Registration failed. Please try again." });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogin = async (data: LoginFormData) => {
    setIsProcessing(true);
    setErrors({ general: "" });
    
    try {
      // Prepare data for API
      const apiData: LoginRequest = {
        email: data.email,
        password: data.password,
      };

      console.log('🚀 Logging in user:', { email: apiData.email });
      
      // Call the real login API
      const result = await authApi.login(apiData);
      
      if (result.success && result.data) {
        console.log('✅ Login successful');

        setInactiveAccountEmail("");

        // Set user in auth context
        login(result.data);

        // Call /me endpoint to ensure user data is fully loaded.
        // The login response may not include full profile fields, so prefer
        // the authoritative /me profile and fall back to the login payload.
        const profile = (await checkAuthStatus()) || result.data;

        // Refetch booking data now that user is authenticated
        refetchBookingData();

        // Store user data in booking state
        updateBookingState({
          userDetails: {
            fullName: profile.full_name,
            email: profile.email,
            phone: profile.phone_number || "",
          }
        });

        // Show success state instead of auto-redirecting
        setShowSuccessState(true);
      } else if (isInactiveAccountError(result.error)) {
        // The account exists and the password was right — it was simply never
        // activated. Offer a fresh activation email rather than a dead-end
        // error, since the original link has usually expired by now.
        setInactiveAccountEmail(data.email);
        setShowEmailVerificationNotice(false);
        setErrors({ general: "" });
      } else {
        // Handle API errors
        const errorMessage = handleApiError(result.error);
        setErrors({ general: errorMessage });
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setErrors({ general: "Login failed. Please check your credentials." });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProceedToNext = () => {
    setCurrentStep(3);
    router.push("/book-road-test-vehicle/test-details");
  };

  const handleResendEmail = async () => {
    if (!registeredEmail) return;

    setIsResendingEmail(true);
    setResendEmailSuccess(false);

    try {
      const result = await authApi.resendConfirmationEmail(registeredEmail);

      if (result.success) {
        setResendEmailSuccess(true);
        // Reset success message after 5 seconds
        setTimeout(() => setResendEmailSuccess(false), 5000);
      } else {
        setErrors({ general: handleApiError(result.error) });
      }
    } catch (error) {
      console.error('❌ Resend email error:', error);
      setErrors({ general: "Failed to resend email. Please try again." });
    } finally {
      setIsResendingEmail(false);
    }
  };

  const toggleAuthMode = () => {
    setShowLogin(!showLogin);
    setErrors({ general: "" }); // Clear errors when switching
    setShowEmailVerificationNotice(false); // Hide verification notice when switching
    setInactiveAccountEmail("");
  };

  // Wait for the session check before deciding what to render.
  //
  // AuthProvider asks the backend who the visitor is on every app load, and
  // that answer takes a round trip. Rendering ahead of it meant a returning
  // customer — with a perfectly valid session — was shown a login form first
  // and only swapped to "Welcome back" once /me came back. People took the form
  // at face value and typed their password into it, which is a large part of
  // why this step felt like it demanded a fresh login every visit.
  //
  // `authStatus` is the right signal rather than `isAuthenticated`: on a cold
  // load the latter is indistinguishable from a genuine logout.
  if (authStatus === 'unknown' && isAuthLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <BookingStepsProgress steps={bookingSteps} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="col-span-1 md:col-span-1">
            <h1 className="text-2xl font-bold mb-1">Booking details</h1>
            <p className="text-gray-600 mb-6">Checking your session…</p>

            <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">
              <Loader2 size={20} className="animate-spin text-[#0C8B44]" />
              <span className="text-sm">
                One moment — we&apos;re seeing whether you&apos;re already
                signed in.
              </span>
            </div>
          </div>

          <div className="col-span-1">
            <VehicleSummary />
          </div>
        </div>
      </div>
    );
  }

  // Show success state with user info and next button (only if authenticated)
  if (showSuccessState && isAuthenticated) {
    // Use bookingState.userDetails if available, otherwise fallback to user from AuthContext
    const userDetails = bookingState.userDetails || {
      fullName: user?.full_name || '',
      email: user?.email || '',
      phone: user?.phone_number || ''
    };

    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <BookingStepsProgress steps={bookingSteps} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="col-span-1 md:col-span-1">
            <h1 className="text-2xl font-bold mb-1">Booking details</h1>
            <p className="text-gray-600 mb-6">Account verified - ready to continue</p>

            {/* Success Message */}
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle size={24} className="text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-green-900 mb-2">
                    {isAuthenticated ? "Welcome back!" : "Account created successfully!"}
                  </h3>
                  <div className="space-y-1 text-sm text-green-800">
                    <p><strong>Name:</strong> {userDetails?.fullName || user?.full_name || 'N/A'}</p>
                    <p><strong>Email:</strong> {userDetails?.email || user?.email || 'N/A'}</p>
                    {(userDetails?.phone || user?.phone_number) && (
                      <p><strong>Phone:</strong> {formatCanadianPhoneDisplay(userDetails?.phone || user?.phone_number)}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <PickupOptions />

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              {/* Continue to Test Details Button */}
              <button
                onClick={handleProceedToNext}
                className="w-full bg-[#0C8B44] hover:bg-[#0C8B44]/90 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                Continue to Test Details
              </button>

              {/* Go to Dashboard Button */}
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full bg-white hover:bg-gray-50 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors border border-gray-300 flex items-center justify-center gap-2"
              >
                <LayoutDashboard size={18} />
                Go to Dashboard
              </button>
            </div>
          </div>
          
          <div className="col-span-1">
            <VehicleSummary />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <BookingStepsProgress steps={bookingSteps} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="col-span-1 md:col-span-1">
          <h1 className="text-2xl font-bold mb-1">Booking details</h1>
          <p className="text-gray-600 mb-6">{showLogin ? "Log in" : "Sign up"} to continue</p>

          {/* Show general errors */}
          <ErrorAlert message={errors.general} className="mb-4" />

          {/*
            We asked the backend who you are and never got an answer (offline,
            a timeout, an API cold start). That is not a logout, so don't
            present it as one — offer another go before the login form.
          */}
          {authStatus === 'unknown' && !isAuthLoading && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between gap-3">
              <p className="text-sm text-amber-800">
                We couldn&apos;t confirm whether you&apos;re already signed in.
              </p>
              <button
                onClick={() => checkAuthStatus()}
                className="text-sm font-medium text-amber-900 underline hover:no-underline bg-transparent border-none p-0 cursor-pointer whitespace-nowrap"
              >
                Try again
              </button>
            </div>
          )}

          {/* Account exists but was never activated — offer a fresh link */}
          {inactiveAccountEmail && (
            <InactiveAccountNotice
              email={inactiveAccountEmail}
              className="mb-6"
            />
          )}

          {/* Show email verification notice after signup */}
          {showEmailVerificationNotice && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <svg
                  className="flex-shrink-0 mt-0.5 text-blue-600"
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-blue-900 mb-2">
                    Check your email to verify your account
                  </h3>
                  <p className="text-sm text-blue-800 mb-3">
                    We&apos;ve sent a verification link to <strong>{registeredEmail}</strong>.
                    Please check your inbox and click the link to verify your email and continue with your booking.
                  </p>

                  {/* Success message after resending */}
                  {resendEmailSuccess && (
                    <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded">
                      <p className="text-xs text-green-800 font-medium">
                        ✓ Confirmation email has been resent! Please check your inbox.
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs text-blue-700">
                      Didn&apos;t receive the email?
                    </p>
                    <button
                      onClick={handleResendEmail}
                      disabled={isResendingEmail}
                      className="text-xs text-blue-700 underline hover:no-underline font-medium bg-transparent border-none p-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isResendingEmail ? "Sending..." : "Resend Email"}
                    </button>
                    <span className="text-xs text-blue-700">or</span>
                    <button
                      onClick={toggleAuthMode}
                      className="text-xs text-blue-700 underline hover:no-underline font-medium bg-transparent border-none p-0 cursor-pointer"
                    >
                      try logging in
                    </button>
                    <span className="text-xs text-blue-700">if you already verified.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showLogin ? (
            <>
              <LoginForm 
                onSubmit={handleLogin} 
                buttonText={isProcessing ? "Processing..." : "Log in"}
                showRememberMe={false}
                className="mb-4"
              />
            </>
          ) : (
            <>
              <SignupForm 
                onSubmit={handleCreateAccount} 
                buttonText={isProcessing ? "Processing..." : "Create account"}
                className="mb-4"
              />
              
              <div className="mt-4 text-sm">
                <span className="text-gray-600">Have an account? </span>
                <button 
                  onClick={toggleAuthMode}
                  className="text-[#0C8B44] hover:underline font-medium bg-transparent border-none p-0 cursor-pointer"
                >
                  Log in
                </button>
              </div>
            </>
          )}
          
          <PickupOptions />
          
        </div>
        
        <div className="col-span-1">
          <VehicleSummary />
        </div>
      </div>
    </div>
  );
}