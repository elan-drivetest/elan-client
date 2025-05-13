"use client"

import React, { useState } from "react";
import Link from "next/link";
import FormInput from "@/components/booking/FormInput";
import Checkbox from "@/components/booking/Checkbox";

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void;
  buttonText?: string;
  showRememberMe?: boolean;
  initialValues?: Partial<LoginFormData>;
  className?: string;
}

export default function LoginForm({
  onSubmit,
  buttonText = "Log in",
  showRememberMe = true,
  initialValues = {},
  className = "",
}: LoginFormProps) {
  const [formData, setFormData] = useState<LoginFormData>({
    email: initialValues.email || "",
    password: initialValues.password || "",
    rememberMe: initialValues.rememberMe !== undefined ? initialValues.rememberMe : false,
  });
  
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [touched, setTouched] = useState<Record<keyof LoginFormData, boolean>>({
    email: false,
    password: false,
    rememberMe: false,
  });

  const validateField = (name: keyof LoginFormData, value: string) => {
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
    const fieldName = name as keyof LoginFormData;

    setFormData((prev) => ({
      ...prev,
      [fieldName]: type === "checkbox" ? checked : value,
    }));

    if (touched[fieldName]) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: type === "checkbox" ? "" : validateField(fieldName, value),
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const fieldName = name as keyof LoginFormData;

    setTouched((prev) => ({
      ...prev,
      [fieldName]: true,
    }));

    setErrors((prev) => ({
      ...prev,
      [fieldName]: validateField(fieldName, value),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: Partial<LoginFormData> = {};
    Object.keys(formData).forEach((key) => {
      const fieldName = key as keyof LoginFormData;
      if (fieldName !== "rememberMe") {
        newErrors[fieldName] = validateField(
          fieldName,
          formData[fieldName] as string
        );
      }
    });

    setErrors(newErrors);
    setTouched({
      email: true,
      password: true,
      rememberMe: true,
    });

    // Check if there are any errors
    if (Object.values(newErrors).some((error) => error !== "")) {
      console.log("Form has errors");
      return;
    }

    // Form is valid, proceed with submission
    onSubmit(formData);
  };

  return (
    <form className={`space-y-4 ${className}`} onSubmit={handleSubmit}>
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
        error={touched.email ? errors.email : undefined}
      />

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
        error={touched.password ? errors.password : undefined}
      />

      <div className="flex items-center justify-between">
        {showRememberMe && (
          <Checkbox
            id="rememberMe"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
            label="Remember me"
          />
        )}
        
        <div className="text-sm">
          <Link href="/forgot-password" className="font-medium text-[#0C8B44] hover:underline">
            Forgot your password?
          </Link>
        </div>
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0C8B44] hover:bg-[#0A7A3C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0C8B44]"
      >
        {buttonText}
      </button>

      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          {"Don't have an account?"}{" "}
          <Link href="/signup" className="font-medium text-[#0C8B44] hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </form>
  );
}