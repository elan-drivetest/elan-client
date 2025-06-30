// app/reset-password/page.tsx
"use client"

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForgotPassword } from "@/lib/hooks/useForgotPassword";
import { FormInput } from "@/components/ui/form-input";
import { Separator } from "@/components/ui/separator";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hash, setHash] = useState<string>("");
  const [localError, setLocalError] = useState<string>("");
  const [touched, setTouched] = useState({
    password: false,
    confirmPassword: false
  });
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetPassword, isLoading, error, success, message, validatePassword } = useForgotPassword();

  useEffect(() => {
    const hashParam = searchParams.get('hash');
    if (hashParam) {
      setHash(hashParam);
    } else {
      setLocalError('Invalid reset link. Please request a new password reset.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setLocalError(passwordValidation.message || 'Invalid password');
      return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (!hash) {
      setLocalError('Invalid reset link. Please request a new password reset.');
      return;
    }

    const result = await resetPassword(hash, password);
    
    if (result.success) {
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setLocalError("");
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    setLocalError("");
  };

  const handlePasswordBlur = () => {
    setTouched(prev => ({ ...prev, password: true }));
  };

  const handleConfirmPasswordBlur = () => {
    setTouched(prev => ({ ...prev, confirmPassword: true }));
    if (password && confirmPassword && password !== confirmPassword) {
      setLocalError('Passwords do not match');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Password Reset Successful
            </h2>
            <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <p className="text-green-700 text-center">{message}</p>
            </div>
            
            <div className="mt-6 space-y-4">
              <p className="text-sm text-gray-600">
                Redirecting to login page in 3 seconds...
              </p>
              
              <Link
                href="/login"
                className="inline-flex items-center justify-center w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0C8B44] hover:bg-[#0A7A3C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0C8B44]"
              >
                Login Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-gray-600">
            Enter your new password below
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {(error || localError) && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-600">{error || localError}</p>
            </div>
          )}
          
          <FormInput
            label="New Password"
            id="password"
            name="password"
            type="password"
            placeholder="Enter new password (min 8 characters)"
            required
            value={password}
            onChange={handlePasswordChange}
            onBlur={handlePasswordBlur}
            showError={touched.password && password.length > 0 && password.length < 8}
            error={touched.password && password.length > 0 && password.length < 8 ? "Password must be at least 8 characters" : undefined}
            className="w-full"
          />

          <FormInput
            label="Confirm New Password"
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Confirm new password"
            required
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            onBlur={handleConfirmPasswordBlur}
            showError={touched.confirmPassword && confirmPassword.length > 0 && password !== confirmPassword}
            error={touched.confirmPassword && confirmPassword.length > 0 && password !== confirmPassword ? "Passwords do not match" : undefined}
            className="w-full"
          />

          <button
            type="submit"
            disabled={isLoading || !hash || password.length < 8 || password !== confirmPassword}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0C8B44] hover:bg-[#0A7A3C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0C8B44] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <Separator />
        
        <div className="text-center">
          <Link
            href="/login"
            className="font-medium text-[#0C8B44] hover:underline"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#0C8B44]"></div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}