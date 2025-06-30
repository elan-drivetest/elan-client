"use client"

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, addDays, isBefore, isAfter, startOfDay } from "date-fns";

interface DatePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  className?: string;
  disabled?: boolean;
  unavailableDates?: Date[]; // Array of unavailable dates
  minDaysFromToday?: number; // Minimum days from today (default: 2)
  maxDate?: Date; // Maximum selectable date (optional)
}

export function DatePicker({ 
  date, 
  setDate, 
  className, 
  disabled = false,
  unavailableDates = [],
  minDaysFromToday = 2,
  maxDate
}: DatePickerProps) {
  
  // Calculate minimum date (today + minDaysFromToday)
  const today = startOfDay(new Date());
  const minDate = addDays(today, minDaysFromToday);
  
  // Function to check if a date should be disabled
  const isDateDisabled = (date: Date) => {
    // Disable if date is before minimum date
    if (isBefore(date, minDate)) {
      return true;
    }
    
    // Disable if date is after maximum date (if provided)
    if (maxDate && isAfter(date, maxDate)) {
      return true;
    }
    
    // Disable if date is in unavailable dates array
    const isUnavailable = unavailableDates.some(unavailableDate => {
      const unavailableDay = startOfDay(unavailableDate);
      const checkDay = startOfDay(date);
      return unavailableDay.getTime() === checkDay.getTime();
    });
    
    return isUnavailable;
  };

  // Custom date modifier for styling unavailable dates
  const modifiers = {
    disabled: isDateDisabled,
    unavailable: (date: Date) => {
      return unavailableDates.some(unavailableDate => {
        const unavailableDay = startOfDay(unavailableDate);
        const checkDay = startOfDay(date);
        return unavailableDay.getTime() === checkDay.getTime();
      });
    },
    beforeMinDate: (date: Date) => isBefore(date, minDate)
  };

  // Custom styles for different date states
  const modifiersStyles = {
    disabled: {
      color: '#9CA3AF', // Gray-400
      backgroundColor: 'transparent',
      cursor: 'not-allowed',
      opacity: 0.5
    },
    unavailable: {
      color: '#EF4444', // Red-500
      backgroundColor: '#FEE2E2', // Red-50
      textDecoration: 'line-through',
      cursor: 'not-allowed'
    },
    beforeMinDate: {
      color: '#9CA3AF', // Gray-400
      backgroundColor: 'transparent',
      cursor: 'not-allowed',
      opacity: 0.3
    }
  };

  // Handle date selection with validation
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate || disabled) return;
    
    // Double check if the selected date is valid
    if (!isDateDisabled(selectedDate)) {
      setDate(selectedDate);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="p-3">
          {/* Info text about date restrictions */}
          <div className="text-xs text-gray-600 mb-3 px-1">
            <p>• Minimum {minDaysFromToday} days from today</p>
            {unavailableDates.length > 0 && (
              <p>• <span className="text-red-500">Red dates</span> are unavailable</p>
            )}
          </div>
          
          <Calendar
            mode="single"
            selected={date}
            onSelect={disabled ? undefined : handleDateSelect}
            initialFocus
            disabled={isDateDisabled}
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
            fromDate={minDate} // Don't show dates before minimum
            toDate={maxDate} // Don't show dates after maximum (if provided)
            className="rounded-md border-0"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}