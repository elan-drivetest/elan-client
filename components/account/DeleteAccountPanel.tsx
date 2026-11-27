"use client";

// Customer self-service deletion. DELETE /auth/customer/me anonymises the
// account server-side and clears the auth cookies; it answers 422
// { errors: { account: "hasActiveBookings" } } while a booking is confirmed
// or in progress — handleApiError() turns that into friendly copy.

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorAlert } from "@/components/ui/error-alert";
import Checkbox from "@/components/booking/Checkbox";
import { useAuth } from "@/lib/context/AuthContext";
import { authApi, handleApiError } from "@/lib/api";

export default function DeleteAccountPanel() {
  const { user, authStatus } = useAuth();
  const deleted = useSearchParams().get("deleted") === "1";
  const [confirmed, setConfirmed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (!confirmed || isDeleting) return;
    setIsDeleting(true);
    setError("");

    const result = await authApi.deleteAccount();
    if (!result.success) {
      setError(handleApiError(result.error));
      setIsDeleting(false);
      return;
    }

    // The server already cleared the session cookies. Reload so every piece of
    // in-memory state (auth, booking draft) is dropped with it.
    try {
      localStorage.removeItem("bookingState");
      localStorage.removeItem("currentStep");
    } catch {
      /* storage unavailable — nothing to clear */
    }
    window.location.href = "/delete-account?deleted=1";
  };

  if (deleted) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 flex gap-3">
        <CheckCircle className="h-6 w-6 text-green-600 shrink-0" aria-hidden="true" />
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">Your account has been deleted</h3>
          <p className="text-sm text-gray-700">
            You&apos;ve been signed out. You can register again with the same email address at any time.
          </p>
        </div>
      </div>
    );
  }

  if (authStatus === "unknown") {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Checking your session…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-xl border border-gray-200 p-6">
        <p className="text-gray-700 mb-4">
          Log in to your customer account to delete it yourself. Can&apos;t log in? Contact us using the details
          below and we&apos;ll process the request for you.
        </p>
        <Link href={`/login?redirect=${encodeURIComponent("/delete-account")}`}>
          <Button className="bg-[#0C8B44] hover:bg-[#0A7A3C] text-white">Log in to continue</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-red-200 p-6">
      <p className="text-sm text-gray-600 mb-4">
        Signed in as <span className="font-medium text-gray-900">{user.email}</span>
      </p>

      {error && <ErrorAlert title="We couldn't delete your account" message={error} className="mb-4" />}

      <Checkbox
        id="confirm-delete"
        checked={confirmed}
        onChange={(e) => setConfirmed(e.target.checked)}
        label="I understand that deleting my account is permanent and can't be undone."
        className="mb-5"
      />

      <Button
        onClick={handleDelete}
        disabled={!confirmed || isDeleting}
        className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 disabled:opacity-50"
      >
        {isDeleting ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        )}
        {isDeleting ? "Deleting…" : "Delete my account"}
      </Button>
    </div>
  );
}
