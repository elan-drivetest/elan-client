"use client"

import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { TestType, Addon } from "@/lib/types/booking.types";

interface DrivingLessonCardProps {
  className?: string;
  duration: string;
  description: string;
  variant?: "default" | "compact";
  isSelected?: boolean;
  onSelect?: () => void;
  // New API props - ONLY ADDITION
  testType?: TestType;
  addon?: Addon | null;
  isLoading?: boolean;
}

export default function DrivingLessonCard({
  className,
  duration,
  description,
  variant = "default",
  isSelected = false,
  onSelect,
  addon}: DrivingLessonCardProps) {
    
  // Format duration from API (seconds to readable format) - ONLY ADDITION
  const formatDuration = (seconds?: number): string => {
    if (!seconds) return duration; // fallback to prop
    
    const minutes = Math.round(seconds / 60);
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    }
    return `${minutes} minutes`;
  };

  // Get formatted duration - ONLY ADDITION
  const displayDuration = addon?.duration ? formatDuration(addon.duration) : duration;
  
  if (variant === "compact") {
    return (
      <div 
        className={cn(
          "border rounded-md p-4 text-sm cursor-pointer",
          isSelected 
            ? "border-[#0C8B44] bg-white" 
            : "border-gray-200 bg-gray-100",
          className
        )}
        onClick={onSelect}
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className={cn("font-medium", isSelected ? "text-[#0C8B44]" : "")}>
              {displayDuration} Driving Lesson
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {description}
            </p>
          </div>
          
          {isSelected && (
            <div className="size-4 bg-[#0C8B44] rounded-full flex items-center justify-center">
              <Check size={16} className="text-white" />
            </div>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className={cn(
        "mb-6 border-2 rounded-md p-4 transition-all duration-200",
        isSelected 
          ? "border-[#0C8B44] bg-gray-50" 
          : "border-gray-200 hover:border-gray-300",
        "cursor-pointer",
        className
      )}
      onClick={onSelect}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-gray-600">{displayDuration} Driving Lesson</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        
        {isSelected && (
          <div className="size-6 bg-[#0C8B44] rounded-full flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12L10 17L20 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}