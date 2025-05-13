"use client"

import React from "react";

interface TestTypeCardProps {
  type: 'G2' | 'G';
  title: string;
  description: string;
  isSelected: boolean;
  onSelect: () => void;
}

export default function TestTypeCard({
  type,
  title,
  description,
  isSelected,
  onSelect
}: TestTypeCardProps) {
  return (
    <div 
      className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'border-[#0C8B44] text-[#0C8B44] bg-[#F7FDF9]' 
          : 'border-gray-200 hover:border-[#0C8B44]/50 bg-gray-100'
      }`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-center mb-1">
        <span className="text-base font-black">{title}</span>
        <div className={`size-8 flex items-center text-lg justify-center rounded-md ${
          isSelected ? 'bg-[#0C8B44] text-white' : 'bg-white border border-gray-300'
        }`}>
          {type === 'G2' ? 'G2' : 'G'}
        </div>
      </div>
      <p className="text-sm text-gray-600">
        {description}
      </p>
    </div>
  );
}