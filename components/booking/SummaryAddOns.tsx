"use client"

import React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import MockTestCard from "./MockTestCard";
import DrivingLessonCard from "./DrivingLessonCard";
import { AddOnType } from "@/app/book-road-test-vehicle/test-details/page";
import { useBooking } from "@/lib/context/BookingContext";
import {
  findMockTestAddon,
  findOneHourLessonAddon,
} from "@/lib/pricing/calculate";

interface SummaryAddOnsProps {
  className?: string;
  selectedAddOn: AddOnType;
  toggleAddOn: (type: AddOnType) => void;
  onRemove: () => void;
}

export default function SummaryAddOns({
  className,
  selectedAddOn,
  toggleAddOn,
  onRemove
}: SummaryAddOnsProps) {
  // Resolved here rather than passed down so the summary's compact cards show
  // the same live prices as the full cards on Step 3.
  const { bookingState, addons } = useBooking();
  const testType = bookingState.testType || null;

  const mockTestAddon = testType ? findMockTestAddon(addons, testType) : null;
  const drivingLessonAddon = testType
    ? findOneHourLessonAddon(addons, testType)
    : null;

  return (
    <div className={cn("mb-6", className)}>
      <div className="space-y-2">
        <div className="flex space-x-2">
          <MockTestCard
            variant="compact"
            isAdded={selectedAddOn === 'mock-test'}
            onAdd={() => toggleAddOn('mock-test')}
            testType={testType || undefined}
            addon={mockTestAddon}
          />

          <DrivingLessonCard
            variant="compact"
            duration="1 hour"
            description="One-on-one lesson with a professional instructor"
            isSelected={selectedAddOn === 'driving-lesson'}
            onSelect={() => toggleAddOn('driving-lesson')}
            testType={testType || undefined}
            addon={drivingLessonAddon}
          />
        </div>

        {/* Only show remove button for paid add-ons */}
        {selectedAddOn && (
          <div className="flex items-center mt-2 cursor-pointer">
            <button
              onClick={onRemove}
              className="text-xs text-red-500 inline-flex items-center cursor-pointer hover:text-red-700"
            >
              <X size={14} className="mr-1" /> Remove any extra add-ons for this time.
            </button>
          </div>
        )}
      </div>
    </div>
  );
}