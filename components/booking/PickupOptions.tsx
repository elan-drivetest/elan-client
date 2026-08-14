"use client"

import React, { useState } from "react";
import Checkbox from "@/components/booking/Checkbox";

interface PickupOptionProps {
  title: string;
  description: string;
  className?: string;
}

const PickupOption = ({ title, description, className }: PickupOptionProps) => {
  const [isChecked, setIsChecked] = useState(true);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(e.target.checked);
  };
  
  return (
    <div className={`flex items-start gap-2 mb-3 ${className}`}>
      <div className="flex-shrink-0 mt-1">
        <Checkbox
          id={`option-${title.toLowerCase().replace(/\s/g, '-')}`}
          name={`option-${title.toLowerCase().replace(/\s/g, '-')}`}
          checked={isChecked}
          onChange={handleChange}
          label=""
        />
      </div>
      <div>
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-gray-600">{description}</p>
      </div>
    </div>
  );
};

// Cancellation windows and refund percentages are admin-tunable server settings
// that customer clients cannot read (BUSINESS_LOGIC.md §17.13). This copy used
// to promise "free cancellation up to 48 hours" three times over; an admin
// changing refund_full_hours would have made all three wrong with no deploy.
// Kept deliberately policy-neutral — the exact figures live in the refund policy
// and are enforced (and reported) by the server at request time.
export default function PickupOptions() {
  return (
    <div className="mt-8">
      <div className="space-y-6">
        <PickupOption
          title="Simple & Flexible"
          description="Plans changed? Free cancellation within our refund policy window. Book online anytime—no counters, no waiting."
        />
        <PickupOption
          title="You're in Control"
          description="Cancel early for a full refund under our refund policy. Reserve your car online in minutes—fast, easy, stress-free."
        />
        <PickupOption
          title="No Hassles, Just Driving"
          description="Need to cancel? Request it from your dashboard and we'll confirm your refund amount. Skip the desk—book your test car 100% online, anytime."
        />
      </div>
    </div>
  );
}