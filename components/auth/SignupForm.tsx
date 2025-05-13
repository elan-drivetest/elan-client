"use client"

import React, { useState } from "react";
import Link from "next/link";
import FormInput from "@/components/booking/FormInput";
import Checkbox from "@/components/booking/Checkbox";
// import { Flag } from "lucide-react";

export interface SignupFormData {
  email: string;
  phone: string;
  fullName: string;
  password: string;
  confirmPassword: string;
  marketing: boolean;
}

interface SignupFormProps {
  onSubmit: (data: SignupFormData) => void;
  buttonText?: string;
  showMarketingConsent?: boolean;
  initialValues?: Partial<SignupFormData>;
  className?: string;
}

export default function SignupForm({
  onSubmit,
  buttonText = "Create account",
  showMarketingConsent = true,
  initialValues = {},
  className = "",
}: SignupFormProps) {
  const [formData, setFormData] = useState<SignupFormData>({
    email: initialValues.email || "",
    phone: initialValues.phone || "",
    fullName: initialValues.fullName || "",
    password: initialValues.password || "",
    confirmPassword: initialValues.confirmPassword || "",
    marketing: initialValues.marketing !== undefined ? initialValues.marketing : true,
  });
  
  const [errors, setErrors] = useState<Partial<SignupFormData>>({});
  const [touched, setTouched] = useState<Record<keyof SignupFormData, boolean>>({
    email: false,
    phone: false,
    fullName: false,
    password: false,
    confirmPassword: false,
    marketing: false,
  });

  const validateField = (name: keyof SignupFormData, value: string) => {
    switch (name) {
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) ? "" : "Please enter a valid email";
      case "phone":
        const phoneRegex = /^\d{10}$/;
        return phoneRegex.test(value.replace(/\D/g, "")) ? "" : "Please enter a valid 10-digit phone number";
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
    const fieldName = name as keyof SignupFormData;

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

    // Special case for confirmPassword
    if (fieldName === "password" && touched.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword:
          formData.confirmPassword === value ? "" : "Passwords do not match",
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const fieldName = name as keyof SignupFormData;

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
    const newErrors: Partial<SignupFormData> = {};
    Object.keys(formData).forEach((key) => {
      const fieldName = key as keyof SignupFormData;
      if (fieldName !== "marketing") {
        newErrors[fieldName] = validateField(
          fieldName,
          formData[fieldName] as string
        );
      }
    });

    setErrors(newErrors);
    setTouched({
      email: true,
      phone: true,
      fullName: true,
      password: true,
      confirmPassword: true,
      marketing: true,
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
        label="Phone Number"
        id="phone"
        name="phone"
        type="tel"
        placeholder="Phone Number"
        required
        value={formData.phone}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.phone ? errors.phone : undefined}
        leftIcon={
          <div className="flex items-center">
            <span className="text-sm text-gray-500">🇨🇦</span>
          </div>
        }
      />

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
        error={touched.fullName ? errors.fullName : undefined}
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
        error={touched.confirmPassword ? errors.confirmPassword : undefined}
      />

      {showMarketingConsent && (
        <Checkbox
          id="marketing"
          name="marketing"
          checked={formData.marketing}
          onChange={handleChange}
          label="Get emails and text messages from Elan about promotions, new service offerings, and company updates. You can unsubscribe at any time."
          className="mt-2"
        />
      )}

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0C8B44] hover:bg-[#0A7A3C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0C8B44]"
      >
        {buttonText}
      </button>

      <p className="mt-2 text-sm text-gray-600">
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
    </form>
  );
}