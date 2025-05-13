"use client"

import React, { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, label, error, id, leftIcon, ...props }, ref) => {
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
        
        <div className={cn(leftIcon ? "relative flex items-center" : "")}>
          {leftIcon && (
            <div className="absolute left-3 pointer-events-none">
              {leftIcon}
            </div>
          )}
          
          <input
            id={id}
            ref={ref}
            className={cn(
              "w-full border border-gray-300 rounded-md p-2 text-sm",
              leftIcon && "pl-10",
              error && "border-red-500",
              className
            )}
            {...props}
          />
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