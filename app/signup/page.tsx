// app/signup/page.tsx
"use client"

import React, { useState } from "react";
import Link from "next/link";
import { FormInput } from "@/components/ui/form-input";
import { Separator } from "@/components/ui/separator";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    fullName: "",
    password: "",
    confirmPassword: "",
    marketing: true
  });
  
  const [errors, setErrors] = useState({
    email: "",
    phone: "",
    fullName: "",
    password: "",
    confirmPassword: ""
  });
  
  const [touched, setTouched] = useState({
    email: false,
    phone: false,
    fullName: false,
    password: false,
    confirmPassword: false
  });
  
  const validateField = (name: string, value: string) => {
    switch (name) {
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) ? "" : "Please enter a valid email";
      case "phone":
        const phoneRegex = /^\d{10}$/;
        return phoneRegex.test(value) ? "" : "Please enter a valid 10-digit phone number";
      case "fullName":
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
    
    if (touched[name as keyof typeof touched]) {
      setErrors({
        ...errors,
        [name]: validateField(name, value)
      });
    }
    
    // Special case for confirmPassword
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors = {
      email: validateField("email", formData.email),
      phone: validateField("phone", formData.phone),
      fullName: validateField("fullName", formData.fullName),
      password: validateField("password", formData.password),
      confirmPassword: validateField("confirmPassword", formData.confirmPassword)
    };
    
    setErrors(newErrors);
    setTouched({
      email: true,
      phone: true,
      fullName: true,
      password: true,
      confirmPassword: true
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
      <div className="max-w-xl w-full space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Create your free account to get started
          </h2>
        </div>
        
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
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
            required
            value={formData.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.phone}
            showError={touched.phone && !!errors.phone}
            leftIcon={<span className="text-gray-500 sm:text-sm">🇨🇦</span>}
          />
          
          {/* Full Name */}
          <FormInput
            label="Full Name"
            id="fullName"
            name="fullName"
            type="text"
            placeholder="Full Name"
            required
            value={formData.fullName}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.fullName}
            showError={touched.fullName && !!errors.fullName}
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
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0C8B44] hover:bg-[#0A7A3C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0C8B44]"
            >
              Create account
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