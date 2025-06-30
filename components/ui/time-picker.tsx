"use client"

import * as React from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

interface TimePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  className?: string;
  disabled?: boolean;
  minuteStep?: number; // Step for minutes (default: 15)
}

interface WheelPickerProps {
  values: string[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  unit?: string;
}

// iOS-style wheel picker component
function WheelPicker({ values, selectedValue, onValueChange, disabled = false, unit }: WheelPickerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [startY, setStartY] = React.useState(0);
  const [scrollTop, setScrollTop] = React.useState(0);
  
  const itemHeight = 40; // Height of each item
  const visibleItems = 5; // Number of visible items
  const centerIndex = Math.floor(visibleItems / 2);
  
  // Calculate scroll position based on selected value
  React.useEffect(() => {
    const selectedIndex = values.findIndex(v => v === selectedValue);
    if (selectedIndex !== -1 && containerRef.current) {
      const scrollPosition = selectedIndex * itemHeight;
      containerRef.current.scrollTop = scrollPosition;
    }
  }, [selectedValue, values, itemHeight]);

  // Handle scroll to snap to nearest item
  const handleScroll = React.useCallback(() => {
    if (!containerRef.current || disabled) return;
    
    const scrollTop = containerRef.current.scrollTop;
    const selectedIndex = Math.round(scrollTop / itemHeight);
    const clampedIndex = Math.max(0, Math.min(selectedIndex, values.length - 1));
    
    if (values[clampedIndex] !== selectedValue) {
      onValueChange(values[clampedIndex]);
    }
  }, [values, selectedValue, onValueChange, itemHeight, disabled]);

  // Smooth scroll to position
  const scrollToIndex = (index: number) => {
    if (!containerRef.current) return;
    containerRef.current.scrollTo({
      top: index * itemHeight,
      behavior: 'smooth'
    });
  };

  // Handle mouse/touch events
  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    setIsDragging(true);
    setStartY(e.clientY);
    setScrollTop(containerRef.current?.scrollTop || 0);
  };

  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current || disabled) return;
    
    const deltaY = e.clientY - startY;
    containerRef.current.scrollTop = scrollTop - deltaY;
  }, [isDragging, startY, scrollTop, disabled]);

  const handleMouseUp = React.useCallback(() => {
    setIsDragging(false);
    handleScroll();
  }, [handleScroll]);

  React.useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div className="relative w-20">
      {/* Selection indicator */}
      <div 
        className="absolute inset-x-0 bg-primary/20 border-2 border-primary rounded-lg pointer-events-none z-10 flex items-center justify-center"
        style={{
          top: `${centerIndex * itemHeight}px`,
          height: `${itemHeight}px`
        }}
      />
      
      {/* Scrollable container */}
      <div
        ref={containerRef}
        className={cn(
          "h-48 overflow-hidden scroll-smooth",
          disabled && "opacity-50"
        )}
        style={{
          scrollSnapType: 'y mandatory',
          maskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)'
        }}
        onScroll={handleScroll}
        onMouseDown={handleMouseDown}
      >
        {/* Padding items for smooth scrolling */}
        {Array.from({ length: centerIndex }, (_, i) => (
          <div key={`padding-top-${i}`} className="h-10" />
        ))}
        
        {/* Actual values */}
        {values.map((value, index) => {
          const isSelected = value === selectedValue;
          return (
            <div
              key={value}
              className={cn(
                "h-10 flex items-center justify-center text-lg font-medium cursor-pointer transition-all duration-200 relative z-20",
                "hover:bg-gray-50 select-none",
                isSelected 
                  ? "text-primary font-bold" 
                  : "text-gray-600"
              )}
              style={{ scrollSnapAlign: 'center' }}
              onClick={() => {
                if (!disabled) {
                  onValueChange(value);
                  scrollToIndex(index);
                }
              }}
            >
              {value}
              {unit && isSelected && (
                <span className="ml-1 text-sm text-gray-400">{unit}</span>
              )}
            </div>
          );
        })}
        
        {/* Padding items for smooth scrolling */}
        {Array.from({ length: centerIndex }, (_, i) => (
          <div key={`padding-bottom-${i}`} className="h-10" />
        ))}
      </div>
    </div>
  );
}

export function TimePicker({ 
  date, 
  setDate, 
  className, 
  disabled = false}: TimePickerProps) {
  // Generate time options
  const hours = Array.from({ length: 12 }, (_, i) => 
    String(i === 0 ? 12 : i).padStart(2, '0')
  );
  
  const minutes = Array.from({ length: 60 }, (_, i) => 
    String(i).padStart(2, '0')
  );
  
  const periods = ['AM', 'PM'];

  // Current values
  const currentHour = date ? 
    String(date.getHours() === 0 ? 12 : date.getHours() > 12 ? date.getHours() - 12 : date.getHours()).padStart(2, '0') 
    : '12';
  
  const currentMinute = date ? 
    String(date.getMinutes()).padStart(2, '0') 
    : '00';
  
  const currentPeriod = date && date.getHours() >= 12 ? 'PM' : 'AM';

  // Update time handlers
  const updateTime = (hour: string, minute: string, period: string) => {
    if (disabled) return;
    
    const newDate = date ? new Date(date) : new Date();
    let hour24 = parseInt(hour);
    
    if (period === 'PM' && hour24 !== 12) {
      hour24 += 12;
    } else if (period === 'AM' && hour24 === 12) {
      hour24 = 0;
    }
    
    newDate.setHours(hour24, parseInt(minute), 0, 0);
    setDate(newDate);
  };

  const handleHourChange = (hour: string) => {
    updateTime(hour, currentMinute, currentPeriod);
  };

  const handleMinuteChange = (minute: string) => {
    updateTime(currentHour, minute, currentPeriod);
  };

  const handlePeriodChange = (period: string) => {
    updateTime(currentHour, currentMinute, period);
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
          <Clock className="mr-2 h-4 w-4" />
          {date ? format(date, "h:mm a") : <span>Pick a time</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="p-6 bg-white rounded-lg">
          {/* Header */}
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Select Time</h3>
            <p className="text-sm text-gray-500">Scroll or tap to select</p>
          </div>
          
          {/* Time display */}
          <div className="text-center mb-6">
            <div className="text-3xl font-bold text-primary">
              {currentHour}:{currentMinute} {currentPeriod}
            </div>
          </div>
          
          {/* Wheel pickers */}
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <label className="text-xs font-medium text-gray-500 block mb-2">Hour</label>
              <WheelPicker
                values={hours}
                selectedValue={currentHour}
                onValueChange={handleHourChange}
                disabled={disabled}
              />
            </div>
            
            <div className="text-2xl font-bold text-gray-400 mt-6">:</div>
            
            <div className="text-center">
              <label className="text-xs font-medium text-gray-500 block mb-2">Minute</label>
              <WheelPicker
                values={minutes}
                selectedValue={currentMinute}
                onValueChange={handleMinuteChange}
                disabled={disabled}
              />
            </div>
            
            <div className="text-center">
              <label className="text-xs font-medium text-gray-500 block mb-2">Period</label>
              <WheelPicker
                values={periods}
                selectedValue={currentPeriod}
                onValueChange={handlePeriodChange}
                disabled={disabled}
              />
            </div>
          </div>
          
          {/* Quick time buttons */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center mb-3">Quick Select</p>
            <div className="flex gap-2 justify-center">
              {['9:00 AM', '12:00 PM', '3:00 PM', '6:00 PM'].map((time) => (
                <Button
                  key={time}
                  variant="outline"
                  size="sm"
                  disabled={disabled}
                  className="text-xs h-8 px-3"
                  onClick={() => {
                    const [timeStr, period] = time.split(' ');
                    const [hour, minute] = timeStr.split(':');
                    updateTime(hour, minute, period);
                  }}
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}