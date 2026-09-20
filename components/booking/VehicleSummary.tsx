"use client"

import React from "react";
import RatingBar from "@/components/booking/RatingBar";
import HelpCard from "./HelpCard";

interface VehicleSummaryProps {
  className?: string;
}

export default function VehicleSummary({ className }: VehicleSummaryProps) {
  return (
    <div className={`border rounded-lg p-6 ${className}`}>      
      <HelpCard />      
      <RatingBar />
    </div>
  );
}