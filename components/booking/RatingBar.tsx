"use client"

import React from "react";
import { Star } from "lucide-react";

interface RatingBarProps {
  rating?: number;
  text?: string;
  className?: string;
}

export default function RatingBar({
  text = "Elan is rated 4.8 stars on Google and trusted by thousands of first-time drivers and instructors.",
  className = "",
}: RatingBarProps) {
  return (
    <div className={`bg-gray-100 p-4 rounded-lg ${className}`}>
      <div className="flex items-center mb-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            size={16} 
            fill="#FFBB00" 
            color="#FFBB00" 
          />
        ))}
      </div>
      <p className="text-xs text-gray-600">
        {text}
      </p>
    </div>
  );
}