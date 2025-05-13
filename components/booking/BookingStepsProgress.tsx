// components/booking/BookingStepsProgress.tsx
"use client"

import React from "react";
import { Check, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useBooking } from "@/lib/context/BookingContext";

type Step = {
  id: number;
  name: string;
  path: string; // Add path for navigation
};

interface BookingStepsProgressProps {
  steps: Step[];
  className?: string;
}

export default function BookingStepsProgress({
  steps,
  className,
}: BookingStepsProgressProps) {
  const router = useRouter();
  const { currentStep, setCurrentStep } = useBooking();
  
  // Handler for navigating to a previous step
  const handleStepClick = (stepId: number, path: string) => {
    // Only allow navigating to previous steps or current step
    if (stepId <= currentStep) {
      setCurrentStep(stepId);
      router.push(path);
    }
  };
  
  // Handler for back button
  const handleBack = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      const prevPath = steps.find(step => step.id === prevStep)?.path || "/";
      setCurrentStep(prevStep);
      router.push(prevPath);
    }
  };

  return (
    <div className={cn("w-full mb-8", className)}>
      {currentStep > 1 && (
        <button 
          onClick={handleBack}
          className="flex items-center text-sm text-gray-600 hover:text-[#0C8B44] mb-4 transition-colors"
        >
          <ChevronLeft size={16} />
          <span>Back</span>
        </button>
      )}
      
      <div className="flex items-center">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={step.id}>
              <div 
                className={cn(
                  "flex flex-col items-center relative",
                  step.id <= currentStep ? "cursor-pointer" : "cursor-not-allowed"
                )}
                onClick={() => handleStepClick(step.id, step.path)}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    isCompleted
                      ? "bg-[#0C8B44] text-white"
                      : isCurrent
                      ? "bg-[#0C8B44] text-white"
                      : "bg-gray-300 text-gray-500"
                  )}
                >
                  {isCompleted ? (
                    <Check size={16} />
                  ) : (
                    <span className="text-sm">{step.id}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "mt-1 text-xs",
                    isCurrent ? "text-black font-medium" : "text-gray-500"
                  )}
                >
                  {step.name}
                </span>
              </div>

              {!isLast && (
                <div className="flex-1 h-[2px] mx-1">
                  <div
                    className={cn(
                      "h-full",
                      step.id < currentStep
                        ? "bg-[#0C8B44]"
                        : "bg-gray-300"
                    )}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}