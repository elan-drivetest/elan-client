"use client"

import * as React from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TimePickerInput } from "@/components/ui/time-picker-input";
import { Period } from "./time-picker-utils";
import { format } from "date-fns";

interface TimePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  className?: string;
}

export function TimePicker({ date, setDate, className }: TimePickerProps) {
  const [selectedPeriod, setSelectedPeriod] = React.useState<Period>(
    date && date.getHours() >= 12 ? "PM" : "AM"
  );

  const handleSelectPeriod = (period: Period) => {
    if (!date) return;
    
    setSelectedPeriod(period);
    
    const hours = date.getHours();
    const newDate = new Date(date);
    
    if (period === "AM" && hours >= 12) {
      newDate.setHours(hours - 12);
    } else if (period === "PM" && hours < 12) {
      newDate.setHours(hours + 12);
    }
    
    setDate(newDate);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {date ? format(date, "p") : <span>Pick a time</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium mr-2">Time</h4>
            <div className="flex gap-1">
              <Button
                variant={selectedPeriod === "AM" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSelectPeriod("AM")}
                className="h-7 text-xs"
              >
                AM
              </Button>
              <Button
                variant={selectedPeriod === "PM" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSelectPeriod("PM")}
                className="h-7 text-xs"
              >
                PM
              </Button>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="flex items-center gap-2 text-center">
              <TimePickerInput
                picker="12hours"
                date={date}
                setDate={setDate}
                period={selectedPeriod}
              />
              <span className="text-sm">:</span>
              <TimePickerInput picker="minutes" date={date} setDate={setDate} />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}