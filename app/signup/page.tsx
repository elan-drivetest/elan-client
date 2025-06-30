// app/signup/page.tsx
"use client"

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormInput } from "@/components/ui/form-input";
import { Separator } from "@/components/ui/separator";
import { authApi, handleApiError, validateRegistrationData } from "@/lib/api";
import type { RegisterRequest } from "@/lib/types/auth.types";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterRequest>({
    email: "",
    phone: "",
    full_name: "",
    password: "",
    confirmPassword: "",
    marketing: true
  });
  
  const [errors, setErrors] = useState({
    email: "",
    phone: "",
    full_name: "",
    password: "",
    confirmPassword: "",
    general: ""
  });
  
  const [touched, setTouched] = useState({
    email: false,
    phone: false,
    full_name: false,
    password: false,
    confirmPassword: false
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  
  const validateField = (name: string, value: string) => {
    switch (name) {
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) ? "" : "Please enter a valid email";
      case "phone":
        if (!value.trim()) return ""; // Optional field
        const phoneRegex = /^\+?[\d\s\-()]+$/;
        return phoneRegex.test(value) ? "" : "Please enter a valid phone number";
      case "full_name":
        return value.trim().length > 0 ? "" : "Please enter your full name";
      case "password":
        return value.length >= 8 ? "" : "Password must be at least 8 characters";
      case "confirmPassword":
        return value === formData.password ? "" : "Passwords do not match";
      default:
        return "";
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
    
    // Clear general error when user starts typing
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: "" }));
    }
    
    if (touched[name as keyof typeof touched]) {
      setErrors({
        ...errors,
        [name]: validateField(name, value)
      });
    }
    
    // Special case for confirmPassword when password changes
    if (name === "password" && touched.confirmPassword) {
      setErrors({
        ...errors,
        confirmPassword: formData.confirmPassword === value ? "" : "Passwords do not match"
      });
    }
  };
  
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched({
      ...touched,
      [name]: true
    });
    setErrors({
      ...errors,
      [name]: validateField(name, value)
    });
  };
  
  const handleResendConfirmation = async () => {
    setIsResendingEmail(true);
    setResendMessage("");
    try {
      const result = await authApi.confirmEmail(formData.email);
      
      if (result.success) {
        setResendMessage("Verification email sent! Please check your inbox.");
      } else {
        const errorMessage = handleApiError(result.error);
        setResendMessage(`Failed to resend email: ${errorMessage}`);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
      setResendMessage("Failed to resend verification email. Please try again.");
    } finally {
      setIsResendingEmail(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare data for API (map form fields to API fields)
    const apiData: RegisterRequest = {
      full_name: formData.full_name,
      email: formData.email,
      password: formData.password,
      phone_number: typeof formData.phone === 'string' ? formData.phone.trim() : undefined,
      confirmPassword: "",
      phone: undefined,
      marketing: undefined
    };
    
    // Validate all fields
    const clientValidation = validateRegistrationData(apiData);
    const confirmPasswordError = validateField("confirmPassword", formData.confirmPassword);
    
    const newErrors = {
      ...clientValidation.errors,
      confirmPassword: confirmPasswordError,
      general: ""
    };
    
    setErrors(prevErrors => ({
      ...prevErrors,
      ...newErrors
    }));
    setTouched({
      email: true,
      phone: true,
      full_name: true,
      password: true,
      confirmPassword: true
    });
    
    // Check if there are any validation errors
    if (!clientValidation.isValid || confirmPasswordError) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await authApi.register(apiData);
      
      if (result.success) {
        // Registration successful - show success message
        setShowSuccess(true);
        // Optional: redirect to login page after a delay
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        // Handle API errors
        const errorMessage = handleApiError(result.error);
        setErrors(prev => ({
          ...prev,
          general: errorMessage
        }));
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Handle unexpected errors
      setErrors(prev => ({
        ...prev,
        general: "An unexpected error occurred. Please try again."
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Success state
  if (showSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl w-full space-y-8 text-center">
          <div className="bg-green-50 border border-green-200 rounded-lg p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-900 mb-4">
              Registration Successful!
            </h2>
            <p className="text-green-700 mb-6">
              {"Thank you for signing up! We've sent a verification email to"} <strong>{formData.email}</strong>. 
              Please check your inbox and click the verification link to activate your account.
            </p>
            <p className="text-sm text-green-600">
              Redirecting to login page in a few seconds...
            </p>
          </div>
          
          <div className="space-y-4">
            <Link href="/login">
              <button className="w-full py-2 px-4 bg-[#0C8B44] hover:bg-[#0A7A3C] text-white rounded-md font-medium transition-colors">
                Go to Login Page
              </button>
            </Link>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                {"Didn't receive the email?"}{" "}
                <button 
                  onClick={handleResendConfirmation}
                  disabled={isResendingEmail}
                  className="text-[#0C8B44] hover:underline font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResendingEmail ? "Sending..." : "Resend verification email"}
                </button>
              </p>
              
              {resendMessage && (
                <div className={`text-sm p-3 rounded-md ${
                  resendMessage.includes("Failed") 
                    ? "bg-red-50 text-red-600 border border-red-200" 
                    : "bg-blue-50 text-blue-600 border border-blue-200"
                }`}>
                  {resendMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Create your free account to get started
          </h2>
        </div>
        
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {/* General error message */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}
          
          {/* Email */}
          <FormInput
            label="Email"
            id="email"
            name="email"
            type="email"
            placeholder="Email"
            required
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.email}
            showError={touched.email && !!errors.email}
          />
          
          {/* Phone Number */}
          <FormInput
            label="Phone Number"
            id="phone"
            name="phone"
            type="tel"
            placeholder="Phone Number"
            value={formData.phone as string}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.phone}
            showError={touched.phone && !!errors.phone}
            leftIcon={<span className="text-gray-500 sm:text-sm">🇨🇦</span>}
          />
          
          {/* Full Name */}
          <FormInput
            label="Full Name"
            id="full_name"
            name="full_name"
            type="text"
            placeholder="Full Name"
            required
            value={formData.full_name}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.full_name}
            showError={touched.full_name && !!errors.full_name}
          />
          
          {/* Password */}
          <FormInput
            label="Password"
            id="password"
            name="password"
            type="password"
            placeholder="Password"
            required
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.password}
            showError={touched.password && !!errors.password}
          />
          
          {/* Confirm Password */}
          <FormInput
            label="Confirm Password"
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.confirmPassword}
            showError={touched.confirmPassword && !!errors.confirmPassword}
          />
          
          {/* Marketing consent */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="marketing"
                name="marketing"
                type="checkbox"
                checked={formData.marketing}
                onChange={handleChange}
                className="h-4 w-4 text-[#0C8B44] focus:ring-[#0C8B44] border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="marketing" className="text-gray-600">
                Get emails and text messages from Elan about promotions, new service offerings, and company updates. You can unsubscribe at any time.
              </label>
            </div>
          </div>
          
          {/* Create account button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0C8B44] hover:bg-[#0A7A3C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0C8B44] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating account..." : "Create account"}
            </button>
          </div>
        </form>
        
        <p className="mt-2 text-left text-sm text-gray-600">
          {"By creating an account, you agree to Elan's"}{" "}
          <Link href="/terms" className="font-medium text-[#0C8B44] hover:text-[#0A7A3C]">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="font-medium text-[#0C8B44] hover:text-[#0A7A3C]">
            Privacy Policy
          </Link>
          .
        </p>

        <Separator />
        
        <p className="text-left text-sm text-gray-600">
          Have an account?{" "}
          <Link href="/login" className="font-medium text-[#0C8B44] underline hover:text-[#0A7A3C]">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}