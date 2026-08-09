// components/ui/form-input.tsx
"use client"

import React, { useState } from "react";
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
  ...props
}: FormInputProps) {
  // Controlled when a `value` prop is given; otherwise fall back to
  // internal state seeded from `defaultValue`.
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const [touched, setTouched] = useState(false);
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

        <input
          id={id}
          value={isControlled ? value : internalValue}
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
            displayError && "border-red-500 focus:ring-red-500",
            className
          )}
          {...props}
        />
      </div>

      {displayError && error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
