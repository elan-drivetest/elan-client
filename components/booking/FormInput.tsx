"use client"

import React, { InputHTMLAttributes, forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, label, error, id, leftIcon, type, ...props }, ref) => {
    const isPassword = type === "password";
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="w-full mb-4">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm text-gray-600 mb-1"
          >
            {label}
          </label>
        )}

        <div className={cn((leftIcon || isPassword) ? "relative flex items-center" : "")}>
          {leftIcon && (
            <div className="absolute left-3 pointer-events-none">
              {leftIcon}
            </div>
          )}

          <input
            id={id}
            ref={ref}
            type={isPassword && showPassword ? "text" : type}
            className={cn(
              "w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white shadow-sm",
              "placeholder:text-gray-400",
              "focus:outline-none focus:ring-2 focus:ring-[#0C8B44] focus:border-transparent",
              "disabled:bg-gray-50 disabled:cursor-not-allowed",
              leftIcon && "pl-10",
              isPassword && "pr-10",
              error && "border-red-500 focus:ring-red-500",
              className
            )}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 text-gray-400 hover:text-gray-600 focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </div>

        {error && (
          <p className="mt-1 text-xs text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";

export default FormInput;
