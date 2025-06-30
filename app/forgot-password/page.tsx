// app/forgot-password/page.tsx
"use client"

import React, { useState } from "react";
import Link from "next/link";
import { useForgotPassword } from "@/lib/hooks/useForgotPassword";
import { FormInput } from "@/components/ui/form-input";
import { Separator } from "@/components/ui/separator";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const { requestReset, isLoading, error, success, message } = useForgotPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await requestReset(email);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Check Your Email
            </h2>
            <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
              </div>
              <p className="text-green-700 text-center">{message}</p>
            </div>
            
            <div className="mt-6 space-y-4">
              <p className="text-sm text-gray-600">
                {"Didn't receive an email? Check your spam folder or "}
                <button
                  onClick={() => window.location.reload()}
                  className="font-medium text-[#0C8B44] hover:underline"
                >
                  try again
                </button>
              </p>
              
              <Link
                href="/login"
                className="inline-flex items-center justify-center w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0C8B44] hover:bg-[#0A7A3C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0C8B44]"
              >
                Back to Login
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
            Forgot your password?
          </h2>
          <p className="mt-2 text-gray-600">
            {"Enter your email address and we'll send you a link to reset your password."}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          <FormInput
            label="Email Address"
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email address"
            required
            value={email}
            onChange={handleChange}
            className="w-full"
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0C8B44] hover:bg-[#0A7A3C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0C8B44] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
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