// components/shared/PhoneInput.tsx
"use client"

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { formatCanadianPhone } from "@/lib/utils/phone.utils";

export interface PhoneInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
  /**
   * When provided, controls error visibility (pair with a `touched` flag).
   * When omitted, the error shows whenever `error` is non-empty.
   */
  showError?: boolean;
  /** Extra classes for the outer wrapper (e.g. margins to match sibling fields). */
  containerClassName?: string;
}

function CanadaFlag() {
  return (
    <svg
      viewBox="0 0 1200 600"
      className="h-3.5 w-7 rounded-[2px] ring-1 ring-black/10"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="1200" height="600" fill="#fff" />
      <rect width="300" height="600" fill="#D52B1E" />
      <rect x="900" width="300" height="600" fill="#D52B1E" />
      <path
        fill="#D52B1E"
        d="M600 75l-54 100c-6 11-17 10-28 4l-39-20 29 155c6 28-14 28-23 16l-68-77-11 39c-1 5-7 10-15 9l-86-18 23 82c5 18 9 26-5 31l-31 14 148 120c6 5 9 13 7 20l-13 43c51-6 97-15 148-20 5 0 12 7 12 12l-7 156h25l-4-155c0-5 7-13 12-12 51 5 97 14 148 20l-13-43c-2-8 1-16 7-20l148-120-31-14c-14-5-10-13-5-31l23-82-86 18c-8 1-14-4-15-9l-11-39-68 77c-10 12-29 12-23-16l29-155-39 20c-11 6-22 7-28-4z"
      />
    </svg>
  );
}

/**
 * Canadian phone number input.
 *
 * Shows a Canada flag and a fixed "+1" prefix, and reformats whatever the
 * user types or pastes into the national display format "(647) 679-4321".
 * The parent receives the formatted value through the regular onChange
 * event; convert to API format with `toE164Canadian()` on submit.
 */
const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      label,
      error,
      showError,
      id,
      className,
      containerClassName,
      onChange,
      placeholder = "(647) 679-4321",
      ...props
    },
    ref
  ) => {
    const displayError = showError === undefined ? !!error : showError && !!error;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Reformat in place so existing generic form handlers keep working
      e.target.value = formatCanadianPhone(e.target.value);
      onChange?.(e);
    };

    return (
      <div className={cn("w-full", containerClassName)}>
        {label && (
          <label htmlFor={id} className="block text-sm text-gray-600 mb-1">
            {label}
          </label>
        )}

        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center gap-1.5 pl-3 pointer-events-none select-none">
            <CanadaFlag />
            <span className="text-sm font-semibold text-[#0C8B44]">+1</span>
            <span className="h-4 w-px bg-gray-300" aria-hidden="true" />
          </div>

          <input
            id={id}
            ref={ref}
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            maxLength={14}
            placeholder={placeholder}
            onChange={handleChange}
            className={cn(
              "w-full px-3 py-2 pl-20 text-sm border border-gray-300 rounded-md bg-white shadow-sm",
              "placeholder:text-gray-400",
              "focus:outline-none focus:ring-2 focus:ring-[#0C8B44] focus:border-transparent",
              "disabled:bg-gray-50 disabled:cursor-not-allowed",
              displayError && "border-red-500 focus:ring-red-500",
              className
            )}
            {...props}
          />
        </div>

        {displayError && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";

export default PhoneInput;
