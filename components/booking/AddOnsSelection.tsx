"use client"

import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddOnProps {
  id: string;
  title: string;
  description: string;
  price: string;
  selected: boolean;
  badge?: string;
  onSelect: () => void;
  className?: string;
}

const AddOnCard: React.FC<AddOnProps> = ({
  title,
  description,
  price,
  selected,
  badge,
  onSelect,
  className,
}) => {
  return (
    <div
      className={cn(
        "border rounded-md p-4 mb-4 cursor-pointer transition-all duration-200",
        selected ? "border-[#0C8B44] bg-green-50" : "border-gray-200",
        className
      )}
      onClick={onSelect}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium">{title}</h3>
            {badge && (
              <span className="bg-[#0C8B44] text-white text-xs px-2 py-0.5 rounded">
                {badge}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium">{price}</span>
          {selected && (
            <div className="w-6 h-6 bg-[#0C8B44] rounded-full flex items-center justify-center">
              <Check size={16} className="text-white" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export interface AddOnOption {
  id: string;
  title: string;
  description: string;
  price: string;
  badge?: string;
}

interface AddOnsSelectionProps {
  title: string;
  description?: string;
  options: AddOnOption[];
  selectedOption: string | null;
  onOptionChange: (id: string) => void;
  className?: string;
}

export default function AddOnsSelection({
  title,
  description,
  options,
  selectedOption,
  onOptionChange,
  className,
}: AddOnsSelectionProps) {
  return (
    <div className={cn("mb-8", className)}>
      <h2 className="text-xl font-medium mb-1">{title}</h2>
      {description && <p className="text-sm text-gray-600 mb-4">{description}</p>}
      
      <div className="space-y-4">
        {options.map((option) => (
          <AddOnCard
            key={option.id}
            id={option.id}
            title={option.title}
            description={option.description}
            price={option.price}
            badge={option.badge}
            selected={selectedOption === option.id}
            onSelect={() => onOptionChange(option.id)}
          />
        ))}
      </div>
    </div>
  );
}