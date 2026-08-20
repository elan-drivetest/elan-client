// app/login/page.tsx - Clean version
"use client"

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormInput } from "@/components/ui/form-input";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Separator } from "@/components/ui/separator";
import { authApi, handleApiError } from "@/lib/api";
import { isInactiveAccountError } from "@/lib/utils/error-messages";
import InactiveAccountNotice from "@/components/auth/InactiveAccountNotice";
import { useAuth } from "@/lib/context/AuthContext";
import { hasBookingInProgress } from "@/lib/utils/booking.utils";
import type { LoginRequest } from "@/lib/types/auth.types";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { checkAuthStatus } = useAuth();

  // "verified=true" arrives from /confirm-email when the email was confirmed
  // but auto-login didn't stick; "redirect" says where to land after login.
  const emailJustVerified = searchParams.get('verified') === 'true';
  const redirectParam = searchParams.get('redirect');

  // "expired=true" is set by AuthProvider when the backend rejected a session
  // that had already been established, so the user understands why they are
  // back here instead of silently landing on a login form.
  const sessionExpired = searchParams.get('expired') === 'true';

  // Where to go after a successful login:
  // 1. an internal redirect param (external/protocol-relative URLs rejected),
  // 2. else back into an in-progress booking so saved Step 1 values are kept,
  // 3. else the dashboard.
  const getPostLoginDestination = (): string => {
    if (redirectParam && redirectParam.startsWith('/') && !redirectParam.startsWith('//')) {
      return redirectParam;
    }
    if (hasBookingInProgress()) {
      return '/book-road-test-vehicle/booking-details';
    }
    return '/dashboard';
  };
  const [formData, setFormData] = useState<LoginRequest>({
    email: "",
    password: ""
  });
  
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: ""
  });
  
  const [touched, setTouched] = useState({
    email: false,
    password: false
  });
  
  const [isLoading, setIsLoading] = useState(false);

  // Set when a login is refused only because the account was never activated.
  // Holds the address that was tried, so a fresh activation email can be sent
  // without asking for it again.
  const [inactiveAccountEmail, setInactiveAccountEmail] = useState("");
  
  const validateField = (name: string, value: string) => {
    switch (name) {
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) ? "" : "Please enter a valid email";
      case "password":
        return value.length > 0 ? "" : "Password is required";
      default:
        return "";
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: "" }));
    }
    
    if (touched[name as keyof typeof touched]) {
      setErrors({ ...errors, [name]: validateField(name, value) });
    }
  };
  
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    setErrors({ ...errors, [name]: validateField(name, value) });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const newErrors = {
      email: validateField("email", formData.email),
      password: validateField("password", formData.password),
      general: ""
    };
    
    setErrors(newErrors);
    setTouched({ email: true, password: true });
    
    if (newErrors.email || newErrors.password) {
      return;
    }
    
    setIsLoading(true);
    setInactiveAccountEmail("");

    try {
      // Just call login endpoint
      const result = await authApi.login(formData);

      if (result.success) {
        console.log('Login successful, checking auth status...');
        // Let AuthContext fetch user data
        await checkAuthStatus();
        // Keep isLoading=true so the button spinner stays visible through
        // navigation instead of flickering back to "Log in" while the
        // destination page loads.
        router.push(getPostLoginDestination());
        return;
      }

      // The account exists and the password was right — it was simply never
      // activated. That is recoverable, so offer a fresh activation email
      // instead of an error the user can do nothing about.
      if (isInactiveAccountError(result.error)) {
        setInactiveAccountEmail(formData.email);
        setErrors(prev => ({ ...prev, general: "" }));
        setIsLoading(false);
        return;
      }

      // Show backend error
      const errorMessage = handleApiError(result.error);
      setErrors(prev => ({ ...prev, general: errorMessage }));
      setIsLoading(false);
    } catch (error) {
      console.error('Login exception:', error);
      setErrors(prev => ({
        ...prev,
        general: "An unexpected error occurred. Please try again."
      }));
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Log in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Access your Elan dashboard to manage your bookings
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {sessionExpired && !emailJustVerified && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
              <p className="text-sm text-amber-800">
                Your session has expired. Please log in again to pick up where
                you left off.
              </p>
            </div>
          )}

          {emailJustVerified && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <p className="text-sm text-green-700">
                Your email has been verified! Log in to continue
                {redirectParam ? " your booking" : ""}.
              </p>
            </div>
          )}

          <ErrorAlert message={errors.general} />

          {inactiveAccountEmail && (
            <InactiveAccountNotice email={inactiveAccountEmail} />
          )}
          
          <FormInput
            label="Email"
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            required
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.email}
            showError={touched.email && !!errors.email}
          />
          
          <FormInput
            label="Password"
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            required
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.password}
            showError={touched.password && !!errors.password}
          />
          
          <div className="flex items-center justify-end">
            <Link href="/forgot-password" className="text-sm font-medium text-[#0C8B44] hover:text-[#0A7A3C]">
              Forgot your password?
            </Link>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0C8B44] hover:bg-[#0A7A3C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0C8B44] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Logging in...
              </div>
            ) : (
              "Log in"
            )}
          </button>
        </form>

        <Separator />
        
        <p className="text-center text-sm text-gray-600">
          {"Don't have an account?"}{" "}
          <Link href="/signup" className="font-medium underline text-[#0C8B44] hover:text-[#0A7A3C]">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  // useSearchParams requires a Suspense boundary during prerendering
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0C8B44]"></div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}