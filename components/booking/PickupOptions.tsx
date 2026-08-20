"use client"

import React from "react";

// Cancellation windows and refund percentages are admin-tunable server settings
// that customer clients cannot read (BUSINESS_LOGIC.md §17.13). This copy used
// to promise "free cancellation up to 48 hours" three times over; an admin
// changing refund_full_hours would have made all three wrong with no deploy.
// Kept deliberately policy-neutral — the exact figures live in the refund policy
// and are enforced (and reported) by the server at request time.
export default function PickupOptions() {
  return (
    <div className="mt-8">

    </div>
  );
}