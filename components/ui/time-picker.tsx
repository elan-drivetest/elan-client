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
  minDateTime?: Date; // Minimum allowed date/time (for 48-hour validation)
}

interface WheelPickerProps {
  values: string[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  unit?: string;
  disabledValues?: string[]; // Array of disabled values (for 48-hour validation)
}

// Wheel geometry
const ITEM_HEIGHT = 40; // px height of each row
const VISIBLE_ITEMS = 5; // odd number so there's a clear center row
const SNAP_TRANSITION = "transform 320ms cubic-bezier(0.23, 1, 0.32, 1)";

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

// iOS-style inertial wheel picker.
//
// Implemented with a single CSS transform (translateY) on the list plus a
// per-item rotateX for the curved-drum look — NOT native scroll. This avoids
// the scroll/snap/effect race that made the old version shaky and made taps
// get reverted. `position` is a continuous float index; the centered item is
// Math.round(position). Drag moves it live, release applies momentum + snaps
// to the nearest enabled value, and tapping a row animates straight to it.
function WheelPicker({ values, selectedValue, onValueChange, disabled = false, unit, disabledValues = [] }: WheelPickerProps) {
  const centerIndex = Math.floor(VISIBLE_ITEMS / 2);
  const containerHeight = ITEM_HEIGHT * VISIBLE_ITEMS;

  const selectedIndex = Math.max(0, values.findIndex(v => v === selectedValue));

  const [position, setPosition] = React.useState<number>(selectedIndex);
  const [isDragging, setIsDragging] = React.useState(false);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const positionRef = React.useRef(position);
  positionRef.current = position;
  const draggingRef = React.useRef(false);
  const justDraggedRef = React.useRef(false);
  const lastWheelRef = React.useRef(0);

  const isIndexDisabled = React.useCallback(
    (i: number) => i < 0 || i >= values.length || disabledValues.includes(values[i]),
    [values, disabledValues]
  );

  // Nearest selectable index to a (possibly fractional) target, searching outward.
  const nearestEnabled = React.useCallback((target: number) => {
    const start = clamp(Math.round(target), 0, values.length - 1);
    if (!isIndexDisabled(start)) return start;
    for (let d = 1; d < values.length; d++) {
      if (start - d >= 0 && !isIndexDisabled(start - d)) return start - d;
      if (start + d < values.length && !isIndexDisabled(start + d)) return start + d;
    }
    return start;
  }, [values.length, isIndexDisabled]);

  const commitIndex = React.useCallback((i: number) => {
    setPosition(i);
    positionRef.current = i;
    if (values[i] !== undefined && values[i] !== selectedValue && !isIndexDisabled(i)) {
      onValueChange(values[i]);
    }
  }, [values, selectedValue, isIndexDisabled, onValueChange]);

  // Keep the wheel aligned with external value changes (but never fight an active drag).
  React.useEffect(() => {
    if (!draggingRef.current) {
      setPosition(selectedIndex);
      positionRef.current = selectedIndex;
    }
  }, [selectedIndex]);

  // Mouse-wheel / trackpad support via a non-passive native listener (so we can
  // preventDefault and not scroll the page behind the popover).
  const apiRef = React.useRef({ disabled, nearestEnabled, commitIndex });
  apiRef.current = { disabled, nearestEnabled, commitIndex };
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      const api = apiRef.current;
      if (api.disabled) return;
      e.preventDefault();
      const now = performance.now();
      if (now - lastWheelRef.current < 70) return; // throttle rapid wheel bursts
      lastWheelRef.current = now;
      const dir = e.deltaY > 0 ? 1 : -1;
      api.commitIndex(api.nearestEnabled(Math.round(positionRef.current) + dir));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    // NOTE: do NOT preventDefault here — that would swallow the click used for tap-to-select.
    draggingRef.current = true;
    setIsDragging(true);
    justDraggedRef.current = false;

    const startY = e.clientY;
    const startPos = positionRef.current;
    let lastY = e.clientY;
    let lastT = performance.now();
    let velocity = 0; // index units per ms
    let moved = false;
    let liveIndex = clamp(Math.round(startPos), 0, values.length - 1);

    const move = (ev: PointerEvent) => {
      const dy = ev.clientY - startY;
      if (Math.abs(dy) > 3) moved = true;
      const next = clamp(startPos - dy / ITEM_HEIGHT, -0.6, values.length - 1 + 0.6);
      setPosition(next);
      positionRef.current = next;

      const now = performance.now();
      const dt = now - lastT;
      if (dt > 0) {
        velocity = (-(ev.clientY - lastY) / ITEM_HEIGHT) / dt;
        lastY = ev.clientY;
        lastT = now;
      }

      // Update the big time display live as the wheel crosses each row.
      const rounded = clamp(Math.round(next), 0, values.length - 1);
      if (rounded !== liveIndex && !isIndexDisabled(rounded)) {
        liveIndex = rounded;
        if (values[rounded] !== selectedValue) onValueChange(values[rounded]);
      }
    };

    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      draggingRef.current = false;
      setIsDragging(false);
      if (moved) {
        // Suppress the click that fires right after a drag so it doesn't re-select.
        justDraggedRef.current = true;
        window.setTimeout(() => { justDraggedRef.current = false; }, 60);
        const projected = positionRef.current + velocity * 140; // momentum
        commitIndex(nearestEnabled(projected));
      }
      // A pure tap (not moved) falls through to the row's onClick handler.
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
  };

  const handleItemClick = (index: number) => {
    if (disabled || isIndexDisabled(index) || justDraggedRef.current) return;
    commitIndex(index);
  };

  const transition = isDragging ? "none" : SNAP_TRANSITION;

  return (
    <div className="relative w-20" style={{ height: containerHeight }}>
      {/* Center selection band */}
      <div
        className="absolute inset-x-0 z-10 rounded-lg border-y-2 border-primary/60 bg-primary/5 pointer-events-none"
        style={{ top: centerIndex * ITEM_HEIGHT, height: ITEM_HEIGHT }}
      />

      {/* Wheel viewport */}
      <div
        ref={containerRef}
        className={cn(
          "relative h-full overflow-hidden select-none touch-none",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-grab active:cursor-grabbing"
        )}
        style={{
          perspective: "700px",
          maskImage: "linear-gradient(to bottom, transparent, black 25%, black 75%, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent, black 25%, black 75%, transparent)",
        }}
        onPointerDown={handlePointerDown}
      >
        <div
          style={{
            transform: `translateY(${(centerIndex - position) * ITEM_HEIGHT}px)`,
            transition,
            transformStyle: "preserve-3d",
          }}
        >
          {values.map((value, index) => {
            const dist = index - position;
            const abs = Math.abs(dist);
            const isSelected = Math.round(position) === index;
            const isDisabled = disabledValues.includes(value);
            const rotate = clamp(dist * 22, -70, 70);
            const opacity = abs > 2.5 ? 0 : Math.max(0.15, 1 - abs * 0.33);
            const scale = Math.max(0.8, 1 - abs * 0.07);
            return (
              <div
                key={value}
                onClick={() => handleItemClick(index)}
                className={cn(
                  "flex items-center justify-center text-lg font-medium",
                  isDisabled
                    ? "text-gray-300 cursor-not-allowed"
                    : "cursor-pointer",
                  isSelected && !isDisabled ? "text-primary font-bold" : "text-gray-600"
                )}
                style={{
                  height: ITEM_HEIGHT,
                  transform: `rotateX(${rotate}deg) scale(${scale})`,
                  opacity,
                  transition: isDragging
                    ? "none"
                    : "transform 320ms cubic-bezier(0.23, 1, 0.32, 1), opacity 320ms ease",
                  backfaceVisibility: "hidden",
                }}
              >
                {value}
                {unit && isSelected && !isDisabled && (
                  <span className="ml-1 text-sm text-gray-400">{unit}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function TimePicker({
  date,
  setDate,
  className,
  disabled = false,
  minDateTime}: TimePickerProps) {
  // Generate time options (stable references so they don't churn memo deps)
  const hours = React.useMemo(
    () => Array.from({ length: 12 }, (_, i) => String(i === 0 ? 12 : i).padStart(2, '0')),
    []
  );

  const minutes = React.useMemo(
    () => Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')),
    []
  );

  const periods = React.useMemo(() => ['AM', 'PM'], []);

  // Calculate disabled hours, minutes, and periods based on minDateTime
  const { disabledHours, disabledMinutes, disabledPeriods } = React.useMemo(() => {
    if (!minDateTime || !date) {
      return { disabledHours: [], disabledMinutes: [], disabledPeriods: [] };
    }

    // Check if the selected date is the same day as the minimum date
    const selectedDateOnly = new Date(date);
    selectedDateOnly.setHours(0, 0, 0, 0);

    const minDateOnly = new Date(minDateTime);
    minDateOnly.setHours(0, 0, 0, 0);

    // If selected date is before minimum date, all times are disabled
    if (selectedDateOnly < minDateOnly) {
      return {
        disabledHours: hours,
        disabledMinutes: minutes,
        disabledPeriods: periods
      };
    }

    // If selected date is after minimum date, no times are disabled
    if (selectedDateOnly > minDateOnly) {
      return { disabledHours: [], disabledMinutes: [], disabledPeriods: [] };
    }

    // Same day - need to disable times before minDateTime
    const minHour24 = minDateTime.getHours();
    const minMinute = minDateTime.getMinutes();
    const minPeriod = minHour24 >= 12 ? 'PM' : 'AM';
    const minHour12 = minHour24 === 0 ? 12 : minHour24 > 12 ? minHour24 - 12 : minHour24;

    // Get current selections
    const currentHour = date.getHours();
    const currentPeriod = currentHour >= 12 ? 'PM' : 'AM';
    const currentHour12 = currentHour === 0 ? 12 : currentHour > 12 ? currentHour - 12 : currentHour;

    // Disable AM if minimum time is in PM
    const disabledPeriodsArr: string[] = [];
    if (minPeriod === 'PM') {
      disabledPeriodsArr.push('AM');
    }

    // Disable hours before minimum hour in the same period
    const disabledHoursArr: string[] = [];
    hours.forEach(hourStr => {
      const hour = parseInt(hourStr);

      if (currentPeriod === minPeriod) {
        if (hour < minHour12) {
          disabledHoursArr.push(hourStr);
        }
      } else if (currentPeriod === 'AM' && minPeriod === 'PM') {
        // If current is AM but min is PM, all AM hours are disabled
        disabledHoursArr.push(hourStr);
      }
    });

    // Disable minutes before minimum minute if on same hour and period
    const disabledMinutesArr: string[] = [];
    if (currentPeriod === minPeriod && currentHour12 === minHour12) {
      minutes.forEach(minuteStr => {
        const minute = parseInt(minuteStr);
        if (minute < minMinute) {
          disabledMinutesArr.push(minuteStr);
        }
      });
    }

    return {
      disabledHours: disabledHoursArr,
      disabledMinutes: disabledMinutesArr,
      disabledPeriods: disabledPeriodsArr
    };
  }, [minDateTime, date, hours, minutes, periods]);

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
            {minDateTime && (
              <p className="text-xs text-amber-600 mt-2 font-medium">
                Must be at least 48 hours from now
              </p>
            )}
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
                disabledValues={disabledHours}
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
                disabledValues={disabledMinutes}
              />
            </div>

            <div className="text-center">
              <label className="text-xs font-medium text-gray-500 block mb-2">Period</label>
              <WheelPicker
                values={periods}
                selectedValue={currentPeriod}
                onValueChange={handlePeriodChange}
                disabled={disabled}
                disabledValues={disabledPeriods}
              />
            </div>
          </div>
          
          {/* Quick time buttons */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center mb-3">Quick Select</p>
            <div className="flex gap-2 justify-center">
              {['9:00 AM', '12:00 PM', '3:00 PM', '6:00 PM'].map((time) => {
                const [timeStr, period] = time.split(' ');
                const [hour, minute] = timeStr.split(':');

                // Check if this quick time would be disabled
                let isQuickTimeDisabled = false;
                if (minDateTime && date) {
                  const testDate = new Date(date);
                  let hour24 = parseInt(hour);
                  if (period === 'PM' && hour24 !== 12) {
                    hour24 += 12;
                  } else if (period === 'AM' && hour24 === 12) {
                    hour24 = 0;
                  }
                  testDate.setHours(hour24, parseInt(minute), 0, 0);
                  isQuickTimeDisabled = testDate < minDateTime;
                }

                return (
                  <Button
                    key={time}
                    variant="outline"
                    size="sm"
                    disabled={disabled || isQuickTimeDisabled}
                    className={cn(
                      "text-xs h-8 px-3",
                      isQuickTimeDisabled && "opacity-30"
                    )}
                    onClick={() => {
                      updateTime(hour, minute, period);
                    }}
                  >
                    {time}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}