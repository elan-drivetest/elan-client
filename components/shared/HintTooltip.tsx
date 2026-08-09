// components/shared/HintTooltip.tsx
"use client"

import React from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface HintTooltipProps {
  /** The hint text shown when the icon is clicked */
  text: string;
  className?: string;
}

/**
 * A small info icon that reveals a hint in a popover on click.
 * Use next to field labels instead of always-visible helper/warning text.
 */
export default function HintTooltip({ text, className }: HintTooltipProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="More information"
          className={cn(
            "inline-flex items-center align-middle text-gray-400 transition-colors",
            "hover:text-[#0C8B44] focus:outline-none focus:text-[#0C8B44]",
            className
          )}
        >
          <Info className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        className="w-64 px-3 py-2 text-xs font-normal leading-relaxed text-gray-600 bg-white"
      >
        {text}
      </PopoverContent>
    </Popover>
  );
}
