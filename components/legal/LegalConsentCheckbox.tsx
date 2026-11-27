"use client";

// Required, never pre-ticked consent to the customer legal documents
// (ToS §20.9 — electronic acceptance via an agreement checkbox).
// Links open in a new tab so reading the terms never loses booking progress.

import React from "react";
import Link from "next/link";
import Checkbox from "@/components/booking/Checkbox";
import { LEGAL_DOCUMENTS } from "@/lib/legal/documents";

interface LegalConsentCheckboxProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  className?: string;
}

const linkClass = "font-medium text-[#0C8B44] underline underline-offset-2 hover:text-[#0A7A3C]";

export default function LegalConsentCheckbox({
  id = "legal-consent",
  checked,
  onChange,
  error,
  className = "",
}: LegalConsentCheckboxProps) {
  const errorId = `${id}-error`;
  return (
    <div className={className}>
      <Checkbox
        id={id}
        name={id}
        checked={checked}
        required
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        onChange={(e) => onChange(e.target.checked)}
        label={
          <>
            I have read and agree to the{" "}
            <Link href={LEGAL_DOCUMENTS.terms.path} target="_blank" rel="noopener" className={linkClass}>
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href={LEGAL_DOCUMENTS.privacy.path} target="_blank" rel="noopener" className={linkClass}>
              Privacy Policy
            </Link>
            .
          </>
        }
      />
      {error && (
        <p id={errorId} role="alert" className="mt-1 ml-7 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
