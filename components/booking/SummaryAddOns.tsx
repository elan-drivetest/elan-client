"use client"

import React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import MockTestCard from "./MockTestCard";
import DrivingLessonCard from "./DrivingLessonCard";
import { AddOnType } from "@/app/book-road-test-vehicle/test-details/page";

interface SummaryAddOnsProps {
  className?: string;
  selectedAddOn: AddOnType;
  freeAddOn?: 'thirty-min-lesson' | 'one-hour-lesson' | null;
  toggleAddOn: (type: AddOnType) => void;
  onRemove: () => void;
}

export default function SummaryAddOns({
  className,
  selectedAddOn,
  freeAddOn,
  toggleAddOn,
  onRemove
}: SummaryAddOnsProps) {
  return (
    <div className={cn("mb-6", className)}>
      <div className="space-y-2">
        <div className="flex space-x-2">
          <MockTestCard 
            variant="compact" 
            isAdded={selectedAddOn === 'mock-test'} 
            onAdd={() => toggleAddOn('mock-test')}
          />
          
          <DrivingLessonCard
            variant="compact"
            duration="1 hour"
            description="One-on-one lesson with a professional instructor"
            isSelected={selectedAddOn === 'driving-lesson' || freeAddOn === 'one-hour-lesson'}
            onSelect={
              // If free 1-hour lesson, don't allow toggling
              freeAddOn === 'one-hour-lesson' 
                ? () => {} 
                : () => toggleAddOn('driving-lesson')
            }
          />
        </div>
        
        {/* Show free 30-min lesson if applicable */}
        {freeAddOn === 'thirty-min-lesson' && (
          <div className="mt-2 bg-green-50 border border-green-200 rounded-md p-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-[#0C8B44]">Free 30-minute driving lesson</h3>
                <p className="text-xs text-gray-600">You qualify for a free 30-minute lesson before your test</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Show free 1-hour lesson if applicable */}
        {freeAddOn === 'one-hour-lesson' && (
          <div className="mt-2 bg-green-50 border border-green-200 rounded-md p-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-[#0C8B44]">Free 1-hour driving lesson</h3>
                <p className="text-xs text-gray-600">You qualify for a free 1-hour lesson before your test</p>
              </div>
            </div>
          </div>
        )}
        
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
      
      {(selectedAddOn || freeAddOn) && (
        <div className="mt-4 flex justify-between items-center text-[#0C8B44] font-medium">
          <div>
            Total Payment
          </div>
          <div>
            $ 180.00 CAD
          </div>
        </div>
      )}
    </div>
  );
}