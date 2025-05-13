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
  ...props
}: FormInputProps) {
  const [value, setValue] = useState(props.defaultValue || "");
  const [touched, setTouched] = useState(false);
  const displayError = showError || (touched && error);
  
  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm text-gray-600 mb-1">
        {label}
      </label>
      
      <div className={cn("relative", leftIcon ? "flex rounded-md shadow-sm" : "")}>
        {leftIcon && (
          <span className="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 rounded-l-md">
            {leftIcon}
          </span>
        )}
        
        <input
          id={id}
          {...props}
          value={value as string}
          onChange={(e) => {
            setValue(e.target.value);
            props.onChange?.(e);
          }}
          onBlur={(e) => {
            setTouched(true);
            props.onBlur?.(e);
          }}
          className={cn(
            "block w-full px-3 py-2 border border-gray-300 shadow-sm focus:outline-none focus:ring-[#0C8B44] focus:border-[#0C8B44]",
            leftIcon ? "rounded-r-md" : "rounded-md",
            displayError ? "border-red-500" : "",
            className
          )}
        />
      </div>
      
      {displayError && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
}