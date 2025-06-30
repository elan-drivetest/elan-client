// app/login/page.tsx - Clean version
"use client"

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormInput } from "@/components/ui/form-input";
import { Separator } from "@/components/ui/separator";
import { authApi, handleApiError } from "@/lib/api";
import { useAuth } from "@/lib/context/AuthContext";
import type { LoginRequest } from "@/lib/types/auth.types";

export default function LoginPage() {
  const router = useRouter();
  const { checkAuthStatus } = useAuth();
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
    
    try {
      // Just call login endpoint
      const result = await authApi.login(formData);
      
      if (result.success) {
        console.log('Login successful, checking auth status...');
        // Let AuthContext fetch user data
        await checkAuthStatus();
        // Redirect to dashboard
        router.push("/dashboard");
      } else {
        // Show backend error
        const errorMessage = handleApiError(result.error);
        setErrors(prev => ({ ...prev, general: errorMessage }));
      }
    } catch (error) {
      console.error('Login exception:', error);
      setErrors(prev => ({
        ...prev,
        general: "An unexpected error occurred. Please try again."
      }));
    } finally {
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
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
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