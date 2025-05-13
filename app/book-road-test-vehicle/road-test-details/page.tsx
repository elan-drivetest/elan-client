// app/book-road-test-vehicle/road-test-details/page.tsx
"use client"

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TestTypeCard from "@/components/booking/TestTypeCard";
import TestCenterDropdown from "@/components/booking/TestCenterDropdown";
import RatingBar from "@/components/booking/RatingBar";
import { testCenters } from "@/lib/data/test-centers";
import { useBooking } from "@/lib/context/BookingContext";
import { TimePicker } from "@/components/ui/time-picker";
import { DatePicker } from "@/components/ui/date-picker";
import BookingStepsProgress from "@/components/booking/BookingStepsProgress";

// Define booking steps with paths
const bookingSteps = [
  { id: 1, name: "Road Test Details", path: "/book-road-test-vehicle/road-test-details" },
  { id: 2, name: "Booking Details", path: "/book-road-test-vehicle/booking-details" },
  { id: 3, name: "Test Details", path: "/book-road-test-vehicle/test-details" },
  { id: 4, name: "Payment", path: "/book-road-test-vehicle/payment" },
];

export default function RoadTestDetails() {
  const router = useRouter();
  const { bookingState, updateBookingState, setCurrentStep } = useBooking();
  const [selectedCenter, setSelectedCenter] = useState(
    bookingState.testCenterId 
      ? testCenters.find(center => center.id === bookingState.testCenterId) || null
      : null
  );
  
  // New state for date/time picker
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    bookingState.testDate && bookingState.testTime 
      ? new Date(`${bookingState.testDate} ${bookingState.testTime}`)
      : undefined
  );

  // Set current step
  useEffect(() => {
    setCurrentStep(1);
  }, [setCurrentStep]);

  const handleTypeSelection = (testType: 'G2' | 'G') => {
    updateBookingState({ testType });
  };

  const handleCenterSelection = (center: typeof testCenters[0]) => {
    setSelectedCenter(center);
    updateBookingState({ 
      testCenter: center.name, 
      testCenterId: center.id,
      testCenterAddress: center.address 
    });
  };
  
  // Handler for date/time changes
  const handleDateTimeChange = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      const formattedDate = date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      });
      
      const formattedTime = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      
      updateBookingState({
        testDate: formattedDate,
        testTime: formattedTime
      });
    }
  };

  const handleContinue = () => {
    if (bookingState.testType && bookingState.testCenter && bookingState.testDate && bookingState.testTime) {
      setCurrentStep(2);
      router.push("/book-road-test-vehicle/booking-details");
    } else {
      // Show validation error
      alert("Please fill in all required fields");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Add BookingStepsProgress component */}
      <BookingStepsProgress steps={bookingSteps} />
      
      <h1 className="text-2xl font-bold text-center mb-1">{"Let's Get Started"}</h1>
      <p className="text-gray-600 text-center mb-6">Select your road test type</p>

      {/* Test Type Selection */}
      <div className="space-y-4 mb-8">
        <TestTypeCard
          type="G2"
          title="G2 Road Test"
          description="For first-time drivers ready to hit the road solo."
          isSelected={bookingState.testType === 'G2'}
          onSelect={() => handleTypeSelection('G2')}
        />
        <TestTypeCard
          type="G"
          title="G Road Test"
          description="For experienced drivers ready for full driving privileges."
          isSelected={bookingState.testType === 'G'}
          onSelect={() => handleTypeSelection('G')}
        />
      </div>

      {/* Test Center Selection */}
      <div className="mb-8">
        <p className="font-black mb-2 text-lg">Select Your Test Center</p>
        <TestCenterDropdown
          testCenters={testCenters}
          selectedCenter={selectedCenter}
          onSelect={handleCenterSelection}
        />
      </div>

      {/* Date and Time Selection */}
      <div className="mb-8">
        <p className="font-black mb-2 text-lg">Select Road Test date</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-black text-gray-600 mb-1">Road Test Date</label>
            <DatePicker
              date={selectedDate}
              setDate={handleDateTimeChange}
            />
          </div>
          <div>
            <label className="block text-sm font-black text-gray-600 mb-1">Road Test Time</label>
            <TimePicker
              date={selectedDate}
              setDate={handleDateTimeChange}
            />
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <div className="mb-8">
        <button
          onClick={handleContinue}
          className="w-full bg-[#0C8B44] hover:bg-[#0C8B44]/90 text-white py-3 px-4 rounded-md font-black transition-colors"
        >
          Continue
        </button>
      </div>

      {/* Rating */}
      <RatingBar />
    </div>
  );
}