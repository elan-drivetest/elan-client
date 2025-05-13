"use client"

import React, { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string | React.ReactNode;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, checked, ...props }, ref) => {
    return (
      <div className={cn("flex items-start gap-2", className)}>
        <div className="flex items-center h-5 mt-0.5">
          <div className="relative flex items-center justify-center">
            <input
              id={id}
              type="checkbox"
              ref={ref}
              checked={checked}
              className="appearance-none h-5 w-5 border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-[#0C8B44] focus:border-[#0C8B44] checked:bg-[#0C8B44] checked:border-[#0C8B44]"
              {...props}
            />
            {checked && (
              <Check className="absolute text-white h-3 w-3 pointer-events-none" />
            )}
          </div>
        </div>
        <div className="text-sm text-gray-600">
          <label htmlFor={id} className="cursor-pointer">
            {label}
          </label>
        </div>
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;