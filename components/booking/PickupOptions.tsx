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

export default function PickupOptions() {
  return (
    <div className="mt-8">
      <div className="space-y-6">
        <PickupOption
          title="Simple & Flexible"
          description="Plans changed? Cancel free up to 48 hours before pickup or delivery. Book online anytime—no counters, no waiting."
        />
        <PickupOption
          title="You're in Control"
          description="Cancel up to 48 hours before your road test with zero penalties. Reserve your car online in minutes—fast, easy, stress-free."
        />
        <PickupOption
          title="No Hassles, Just Driving"
          description="Need to cancel? Do it up to 48 hours ahead with no fees. Skip the desk—book your test car 100% online, anytime."
        />
      </div>
    </div>
  );
}