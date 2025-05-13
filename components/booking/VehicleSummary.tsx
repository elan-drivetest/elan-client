"use client"

import React from "react";
import Image from "next/image";
import RatingBar from "@/components/booking/RatingBar";
import HelpCard from "./HelpCard";

interface VehicleSummaryProps {
  className?: string;
}

export default function VehicleSummary({ className }: VehicleSummaryProps) {
  return (
    <div className={`border rounded-lg p-6 ${className}`}>
      <h2 className="text-xl font-medium mb-4">Summary</h2>
      
      <div className="mb-8">
        <Image
          src="/vehicle-lexus.png"
          alt="Lexus UX Compact SUV"
          width={300}
          height={200}
          className="mx-auto"
        />
      </div>
      
      <div className="mb-6">
        <h3 className="font-medium mb-1">Subcompact SUV</h3>
        <p className="text-sm text-gray-600">Lexus UX or Similar</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
          <span>Gas</span>
          <span>•</span>
          <span>5 seats</span>
          <span>•</span>
          <span>Automatic</span>
        </div>
      </div>
      
      <HelpCard />
      
      <RatingBar />
    </div>
  );
}