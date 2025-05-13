// app/login/page.tsx
"use client"

import React, { useState } from "react";
import Link from "next/link";
import { FormInput } from "@/components/ui/form-input";
import { Separator } from "@/components/ui/separator";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });
  
  const [errors, setErrors] = useState({
    email: "",
    password: ""
  });
  
  const [touched, setTouched] = useState({
    email: false,
    password: false
  });
  
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
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
    
    if (touched[name as keyof typeof touched]) {
      setErrors({
        ...errors,
        [name]: validateField(name, value)
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors = {
      email: validateField("email", formData.email),
      password: validateField("password", formData.password)
    };
    
    setErrors(newErrors);
    setTouched({
      email: true,
      password: true
    });
    
    // Check if there are any errors
    if (Object.values(newErrors).some(error => error !== "")) {
      console.log("Form has errors");
      return;
    }
    
    // Form is valid, proceed with submission
    console.log("Form submitted:", formData);
    // Add your API call or form submission logic here
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Log in to your account
          </h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
          
          <div className="flex items-center justify-end">
            <div className="text-sm">
              <Link href="/forgot-password" className="font-medium text-[#0C8B44] hover:text-[#0A7A3C]">
                Forgot your password?
              </Link>
            </div>
          </div>
          
          {/* Login button */}
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0C8B44] hover:bg-[#0A7A3C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0C8B44]"
            >
              Log in
            </button>
          </div>
        </form>

        <Separator />
        
        <p className="mt-2 text-left text-sm text-gray-600">
          {"Don't have an account?"}{" "}
          <Link href="/signup" className="font-medium underline text-[#0C8B44] hover:text-[#0A7A3C]">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}