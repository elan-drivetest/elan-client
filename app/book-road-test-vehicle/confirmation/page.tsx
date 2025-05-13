// File path: app/book-road-test-vehicle/confirmation/page.tsx

"use client"

import React, { useEffect } from "react";
import Link from "next/link";
import { useBooking } from "@/lib/context/BookingContext";
import BookingStepsProgress from "@/components/booking/BookingStepsProgress";
import TestSummary from "@/components/booking/TestSummary";

const bookingSteps = [
  { id: 1, name: "Road Test Details", path: "/book-road-test-vehicle/road-test-details" },
  { id: 2, name: "Booking Details", path: "/book-road-test-vehicle/booking-details" },
  { id: 3, name: "Test Details", path: "/book-road-test-vehicle/test-details" },
  { id: 4, name: "Payment", path: "/book-road-test-vehicle/payment" },
];

export default function Confirmation() {
  const { bookingState, setCurrentStep, calculatePricing } = useBooking();
  
  useEffect(() => {
    setCurrentStep(4); // Still at step 4 but completed
    calculatePricing();
  }, [setCurrentStep, calculatePricing]);
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleApplyPromo = (code: string) => {
    console.log("Promo application disabled on confirmation page");
  };
  
  // Create formatted start date
  const formattedStartDate = bookingState.testDate && bookingState.testTime
    ? `${bookingState.testDate} at ${bookingState.testTime}`
    : "Monday, April 7, 2025 at 10:00 am";
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <BookingStepsProgress steps={bookingSteps} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="col-span-1 md:col-span-1">
          <h1 className="text-2xl font-bold mb-4">Booking confirmation</h1>
          <p className="text-gray-700 mb-6">{"Thank you! We've received your booking request."}</p>
          
          <div className="space-y-6">
            <p className="text-gray-700">Thank You!</p>
            
            <p className="text-gray-700">
              {"We've received your payment and are currently reviewing your details. A team member will contact you shortly by email or phone to confirm everything and arrange your refundable security deposit."}
            </p>
            
            <p className="text-gray-700">
              Feel free to leave this page. You can check your booking status anytime from{" "}
              <Link href="/dashboard" className="text-[#0C8B44] hover:underline">
                your account
              </Link>
              .
            </p>
            
            <Link href="/dashboard">
              <button
                className="w-full py-3 bg-[#0C8B44] hover:bg-[#0A7A3C] text-white rounded-md font-medium transition-colors"
              >
                Go to Dashboard
              </button>
            </Link>
          </div>
        </div>
        
        {/* Summary Section */}
        <div className="col-span-1">
          <TestSummary
            vehicleImage="/vehicle-lexus.png"
            vehicleType="Subcompact SUV"
            vehicleModel="Lexus UX or Similar"
            vehicleFeatures={["Gas", "5 seats", "Automatic"]}
            startDate={formattedStartDate}
            testCentre={bookingState.testCenter || "Road Test Centre"}
            testCentreAddress={bookingState.testCenterAddress || "5555 Eglinton Ave W Etobicoke ON M9C 5M1"}
            onApplyPromo={handleApplyPromo}
            hasAddOn={!!bookingState.selectedAddOn}
            selectedAddOn={bookingState.selectedAddOn || null}
            isConfirmationPage={true} // Add this prop to disable interactive elements
          />
        </div>
      </div>
    </div>
  );
}