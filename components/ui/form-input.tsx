// components/ui/form-input.tsx
"use client"

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
  showError?: boolean;
  leftIcon?: React.ReactNode;
}

export function FormInput({
  label,
  id,
  error,
  showError = false,
  className,
  leftIcon,
  value,
  defaultValue,
  onChange,
  onBlur,
  type,
  ...props
}: FormInputProps) {
  // Controlled when a `value` prop is given; otherwise fall back to
  // internal state seeded from `defaultValue`.
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const [touched, setTouched] = useState(false);
  const isPassword = type === "password";
  const [showPassword, setShowPassword] = useState(false);
  const displayError = showError || (touched && !!error);

  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm text-gray-600 mb-1">
        {label}
      </label>

      <div className={cn(leftIcon ? "flex" : "relative")}>
        {leftIcon && (
          <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 bg-gray-50 rounded-l-md text-sm text-gray-500">
            {leftIcon}
          </span>
        )}

        <div className="relative w-full">
          <input
            id={id}
            value={isControlled ? value : internalValue}
            type={isPassword && showPassword ? "text" : type}
            onChange={(e) => {
              if (!isControlled) setInternalValue(e.target.value);
              onChange?.(e);
            }}
            onBlur={(e) => {
              setTouched(true);
              onBlur?.(e);
            }}
            className={cn(
              "w-full px-3 py-2 text-sm border border-gray-300 bg-white shadow-sm",
              "placeholder:text-gray-400",
              "focus:outline-none focus:ring-2 focus:ring-[#0C8B44] focus:border-transparent",
              "disabled:bg-gray-50 disabled:cursor-not-allowed",
              leftIcon ? "rounded-r-md" : "rounded-md",
              isPassword && "pr-10",
              displayError && "border-red-500 focus:ring-red-500",
              className
            )}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>

      {displayError && error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
