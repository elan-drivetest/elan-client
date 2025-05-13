"use client"

import React, { useState, useEffect } from "react";
import { Check, AlertTriangle, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBooking } from "@/lib/context/BookingContext";

export type LocationOption = "test-centre" | "pickup";

// Mock data for location suggestions
const mockLocationSuggestions = [
  { id: 1, address: "154 Lake St, Peterborough, ON K9J 2H3, Canada", distance: 80 },
  { id: 2, address: "154 Shaw St, Peterborough, ON K9J 2H3, Canada", distance: 65 },
  { id: 3, address: "160 Lake St, Peterborough, ON K9J 2H3, Canada", distance: 78 },
  { id: 4, address: "170 Lake St, Peterborough, ON K9J 2H4, Canada", distance: 120 },
  { id: 5, address: "180 Lake St, Peterborough, ON K9J 2H4, Canada", distance: 45 },
];

interface LocationOptionProps {
  option: LocationOption;
  selected: boolean;
  title: string;
  description: string;
  onClick: () => void;
  className?: string;
}

const LocationOptionItem: React.FC<LocationOptionProps> = ({
  selected,
  title,
  description,
  onClick,
  className,
}) => {
  return (
    <div
      className={cn(
        "border rounded-md p-4 cursor-pointer transition-all duration-200 mb-4",
        selected ? "border-[#0C8B44]" : "border-gray-200",
        className
      )}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
        {selected && (
          <div className="w-6 h-6 bg-[#0C8B44] rounded-full flex items-center justify-center">
            <Check size={16} className="text-white" />
          </div>
        )}
      </div>
    </div>
  );
};

interface LocationSelectionProps {
  selectedOption: LocationOption;
  onOptionChange: (option: LocationOption) => void;
  className?: string;
  onPickupLocationSelect?: (address: string, distance: number) => void;
}

export default function LocationSelection({
  selectedOption,
  onOptionChange,
  className,
  onPickupLocationSelect,
}: LocationSelectionProps) {
  const { bookingState, updateBookingState, calculatePricing } = useBooking();
  const [pickupLocation, setPickupLocation] = useState(bookingState.pickupAddress || "");
  const [pickupDistance, setPickupDistance] = useState<number | undefined>(bookingState.pickupDistance);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState(mockLocationSuggestions);
  
  // Re-calculate pricing when pickup distance changes
  useEffect(() => {
    if (pickupDistance !== undefined) {
      calculatePricing();
    }
  }, [pickupDistance, calculatePricing]);
  
  const handleLocationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPickupLocation(value);
    
    if (value.length > 2) {
      // Filter mock suggestions based on input
      const filteredSuggestions = mockLocationSuggestions.filter(loc => 
        loc.address.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };
  
  const handleSuggestionSelect = (address: string, distance: number) => {
    setPickupLocation(address);
    setPickupDistance(distance);
    setShowSuggestions(false);
    
    // Update booking state with pickup location and distance
    updateBookingState({ 
      pickupAddress: address,
      pickupDistance: distance
    });
    
    // Call parent component handler if provided
    onPickupLocationSelect?.(address, distance);
  };

  return (
    <div className={cn("mb-6", className)}>
      <h2 className="text-xl font-medium mb-4">Pick up or Meet at Drive Test Centre</h2>
      
      <LocationOptionItem
        option="pickup"
        selected={selectedOption === "pickup"}
        title="Pick me up from my location"
        description="Our instructor will pick you up from your location and drop you off after the test"
        onClick={() => onOptionChange("pickup")}
      />
      
      <LocationOptionItem
        option="test-centre"
        selected={selectedOption === "test-centre"}
        title="I'll meet at the test centre"
        description="You'll meet our instructor directly at the test centre"
        onClick={() => onOptionChange("test-centre")}
      />
      
      {selectedOption === "pickup" && (
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Your Pickup Location</h3>
          <p className="text-sm text-gray-600 mb-2">Type your address</p>
          <div className="relative">
            <input
              type="text"
              value={pickupLocation}
              onChange={handleLocationInputChange}
              placeholder="Enter your address"
              className="w-full p-3 border border-gray-300 rounded-md pl-10 focus:outline-none focus:ring-1 focus:ring-[#0C8B44] focus:border-[#0C8B44]"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <MapPin size={18} />
            </div>
            
            {showSuggestions && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {suggestions.map(suggestion => (
                  <div
                    key={suggestion.id}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => handleSuggestionSelect(suggestion.address, suggestion.distance)}
                  >
                    <div className="flex items-start">
                      <MapPin size={16} className="flex-shrink-0 mr-2 mt-0.5 text-gray-400" />
                      <span className="text-sm">{suggestion.address}</span>
                      <span className="ml-auto text-xs text-gray-500">{suggestion.distance} km</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {pickupDistance !== undefined && pickupDistance >= 50 && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-[#0C8B44] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm">You qualify for special perks!</h4>
                  <ul className="ml-2 mt-2">
                    <li className="flex items-center gap-1 text-xs text-gray-700 mb-1">
                      <Check size={14} className="text-[#0C8B44]" />
                      <span>Free dropoff for distances over 50km</span>
                    </li>
                    {pickupDistance >= 50 && pickupDistance < 100 && (
                      <li className="flex items-center gap-1 text-xs text-gray-700">
                        <Check size={14} className="text-[#0C8B44]" />
                        <span>Free 30-minute driving lesson for distances over 50km</span>
                      </li>
                    )}
                    {pickupDistance >= 100 && (
                      <li className="flex items-center gap-1 text-xs text-gray-700">
                        <Check size={14} className="text-[#0C8B44]" />
                        <span>Free 1-hour driving lesson for distances over 100km</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {selectedOption === "test-centre" && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-sm text-amber-800">Unlock Premium Benefits!</h4>
              <p className="text-xs text-amber-700">
                By selecting our pick me up service instead of meeting at the test center
              </p>
            </div>
          </div>
          
          <ul className="ml-7 mt-2">
            <li className="flex items-center gap-1 text-xs text-amber-700 mb-1">
              <Check size={14} className="text-[#0C8B44]" />
              <span>Free dropoff for distances over 50km</span>
            </li>
            <li className="flex items-center gap-1 text-xs text-amber-700 mb-1">
              <Check size={14} className="text-[#0C8B44]" />
              <span>Free 30-minute driving lesson for distances over 50km</span>
            </li>
            <li className="flex items-center gap-1 text-xs text-amber-700">
              <Check size={14} className="text-[#0C8B44]" />
              <span>Free 1-hour driving lesson for distances over 100km</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
