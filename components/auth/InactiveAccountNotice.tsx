"use client"

import React, { useState } from "react";
import { AlertCircle, CheckCircle, Mail } from "lucide-react";
import { authApi, handleApiError } from "@/lib/api";

/**
 * Shown when a login is refused only because the account was never activated.
 *
 * Previously this case rendered as a bare red sentence telling people to check
 * an inbox for a link that, by the time they came back to log in, had usually
 * expired — with nothing to click and no way forward short of contacting
 * support. The account exists and the password was right; the only thing
 * missing is a working link, so offer to send one.
 *
 * The resend endpoint answers the same way for every address, so a success here
 * means "we've handled it" and never confirms that the account exists.
 */
export default function InactiveAccountNotice({
  email,
  className = "",
}: {
  email: string;
  className?: string;
}) {
  const [isSending, setIsSending] = useState(false);
  const [wasSent, setWasSent] = useState(false);
  const [sendError, setSendError] = useState("");

  const handleResend = async () => {
    if (!email || isSending) return;

    setIsSending(true);
    setSendError("");

    try {
      const result = await authApi.resendConfirmationEmail(email);

      if (result.success) {
        setWasSent(true);
      } else {
        setSendError(handleApiError(result.error));
      }
    } catch {
      setSendError("We couldn't send that email. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  if (wasSent) {
    return (
      <div
        className={`p-4 bg-green-50 border border-green-200 rounded-lg ${className}`}
      >
        <div className="flex items-start gap-3">
          <CheckCircle
            size={20}
            className="text-green-600 flex-shrink-0 mt-0.5"
          />
          <div className="text-sm text-green-800">
            <p className="font-medium mb-1">Activation email sent</p>
            <p>
              We&apos;ve sent a fresh activation link to{" "}
              <strong className="break-all">{email}</strong>. Click it to
              activate your account, then come back and log in.
            </p>
            <p className="mt-2 text-xs text-green-700">
              It can take a minute to arrive — remember to check your spam
              folder.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}
    >
      <div className="flex items-start gap-3">
        <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-red-800 font-medium mb-1">
            Your account hasn&apos;t been activated yet
          </p>
          <p className="text-sm text-red-700 mb-3">
            Activate it with the link we emailed you. If that link has expired
            or never arrived, we can send you a new one.
          </p>

          {sendError && (
            <p className="text-sm text-red-700 mb-3">{sendError}</p>
          )}

          <button
            type="button"
            onClick={handleResend}
            disabled={isSending || !email}
            className="inline-flex items-center gap-2 bg-[#0C8B44] hover:bg-[#0C8B44]/90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2 px-4 rounded-md transition-colors"
          >
            <Mail size={16} />
            {isSending ? "Sending…" : "Resend activation email"}
          </button>
        </div>
      </div>
    </div>
  );
}
