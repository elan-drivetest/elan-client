// components/ui/error-alert.tsx
"use client"

import React from "react";
import { AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorAlertProps {
  message?: React.ReactNode;
  title?: string;
  onDismiss?: () => void;
  className?: string;
}

/**
 * Shared error banner: icon + optional title + friendly message, with a
 * gentle entrance animation. Renders nothing when there is no message.
 */
export function ErrorAlert({
  message,
  title,
  onDismiss,
  className,
}: ErrorAlertProps) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4",
        "animate-in fade-in slide-in-from-top-2 duration-300",
        className
      )}
    >
      <AlertCircle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        {title && (
          <p className="text-sm font-semibold text-red-800">{title}</p>
        )}
        <p className={cn("text-sm text-red-700", title && "mt-0.5")}>
          {message}
        </p>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-md p-0.5 text-red-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
          aria-label="Dismiss error"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
