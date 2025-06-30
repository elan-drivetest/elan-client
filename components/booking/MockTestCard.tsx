"use client"

import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { TestType, Addon } from "@/lib/types/booking.types";

interface MockTestCardProps {
  className?: string;
  isAdded?: boolean;
  percentage?: number;
  onAdd?: () => void;
  variant?: "default" | "compact";
  // New API props
  testType?: TestType;
  addon?: Addon | null;
  isLoading?: boolean;
}

export default function MockTestCard({
  className,
  isAdded = false,
  percentage = 95,
  onAdd,
  variant = "default",
  testType,
  isLoading = false
}: MockTestCardProps) {
  
  // Get testType from props or fallback to G2
  const displayTestType = testType || 'G2';
  
  // Get mock test addon from the API response

  // Get price from API or fallback

  if (variant === "compact") {
    return (
      <div 
        className={cn(
          "border rounded-md p-4 text-sm cursor-pointer",
          isAdded 
            ? "border-[#0C8B44] bg-white" 
            : "border-gray-200 bg-gray-100",
          className
        )}
        onClick={onAdd}
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className={cn("font-medium", isAdded ? "text-[#0C8B44]" : "")}>
              {isAdded ? `Complete ${displayTestType} Mock Test Added` : "Complete Mock Test"}
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              {percentage}% of our customers choose this pass their exam at first chance
            </p>
          </div>
          
          {isAdded && (
            <div className="size-4 bg-[#0C8B44] rounded-full flex items-center justify-center">
              <Check size={16} className="text-white" />
            </div>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn(className)}>
      {isAdded ? (
        <div 
          className="border-2 border-[#0C8B44] rounded-md p-4 bg-green-50"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium text-[#0C8B44]">
                Complete {displayTestType} Mock Test Added
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {percentage}% of our customers choose this pass their exam at first chance
              </p>
            </div>
            
            <div className="w-6 h-6 bg-[#0C8B44] rounded-full flex items-center justify-center">
              <Check size={16} className="text-white" />
            </div>
          </div>
        </div>
      ) : (
        <div className={cn("mb-8", className)}>
        <div className="rounded-lg border-2 border-green-600 overflow-hidden">
          {/* Top label */}
          <div className="bg-green-600 text-white py-2 px-4 font-medium">
            {percentage}% Customers Marked This Important
          </div>
          
          {/* Content area with background image */}
          <div 
            className="p-5 relative"
            style={{
              backgroundImage: "url('/checkmark.png')",
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
          >
            <div className="flex flex-col gap-8 items-start justify-between">
              <div>
                <h3 className="font-medium text-[#0C8B44] text-xl">
                  Upgrade to a Complete {displayTestType} Mock Test
                </h3>
                <p className="text-gray-600 mt-1">
                  {percentage}% of our customers choose this pass their exam at first chance
                </p>
              </div>
              
              <Button 
                onClick={onAdd}
                disabled={isLoading}
                className="px-3 py-1 w-full cursor-pointer bg-black text-white rounded-md text-sm hover:bg-black/80 transition-colors disabled:opacity-50"
              >
                🎉 {isLoading ? "Loading..." : "Upgrade to Mock Test"} 🎉
              </Button>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}