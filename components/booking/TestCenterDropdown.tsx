"use client"

import React, { useState } from "react";
import { ChevronDown, Check } from "lucide-react";

export type TestCenter = {
  id: string;
  name: string;
  address: string;
};

interface TestCenterDropdownProps {
  testCenters: TestCenter[];
  selectedCenter: TestCenter | null;
  onSelect: (center: TestCenter) => void;
}

export default function TestCenterDropdown({
  testCenters,
  selectedCenter,
  onSelect
}: TestCenterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (center: TestCenter) => {
    onSelect(center);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div
        className="border border-gray-300 rounded-lg p-4 flex justify-between items-center cursor-pointer"
        onClick={toggleDropdown}
      >
        {selectedCenter ? (
          <div>
            <div className="font-medium">{selectedCenter.name}</div>
            <div className="text-xs text-gray-500">{selectedCenter.address}</div>
          </div>
        ) : (
          <div className="text-gray-500">Select a test center</div>
        )}
        <div className="flex items-center">
          {selectedCenter && (
            <div className="w-6 h-6 bg-[#0C8B44] rounded-full flex items-center justify-center mr-2">
              <Check size={16} className="text-white" />
            </div>
          )}
          <ChevronDown 
            size={20} 
            className={`transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} 
          />
        </div>
      </div>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {testCenters.map((center) => (
            <div
              key={center.id}
              className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              onClick={() => handleSelect(center)}
            >
              <div className="font-medium">{center.name}</div>
              <div className="text-xs text-gray-500">{center.address}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}