"use client"

import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryItemProps {
  label: string;
  value: string;
  checked?: boolean;
  className?: string;
}

export default function SummaryItem({ 
  label, 
  value,
  checked = false,
  className 
}: SummaryItemProps) {
  return (
    <div className={cn("flex items-start gap-2 mb-4", className)}>
      {checked && (
        <div className="flex-shrink-0 mt-0.5">
          <div className="w-4 h-4 bg-[#0C8B44] rounded-full flex items-center justify-center">
            <Check size={10} className="text-white" />
          </div>
        </div>
      )}
      <div className={checked ? "ml-0" : "ml-6"}>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}