// File path: app/book-road-test-vehicle/payment/page.tsx

"use client"

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBooking } from "@/lib/context/BookingContext";
import BookingStepsProgress from "@/components/booking/BookingStepsProgress";
import TestSummary from "@/components/booking/TestSummary";
import PickupOptions from "@/components/booking/PickupOptions";
import { CheckCircle, CreditCard, FileText } from "lucide-react";

const bookingSteps = [
  { id: 1, name: "Road Test Details", path: "/book-road-test-vehicle/road-test-details" },
  { id: 2, name: "Booking Details", path: "/book-road-test-vehicle/booking-details" },
  { id: 3, name: "Test Details", path: "/book-road-test-vehicle/test-details" },
  { id: 4, name: "Payment", path: "/book-road-test-vehicle/payment" },
];

export default function Payment() {
  const router = useRouter();
  const { bookingState, setCurrentStep, calculatePricing } = useBooking();
  const [isProcessing, setIsProcessing] = useState(false);
  
  useEffect(() => {
    setCurrentStep(4);
    calculatePricing();
  }, [setCurrentStep, calculatePricing]);
  
  // Redirect if necessary fields aren't set
  useEffect(() => {
    if (!bookingState.userDetails?.email) {
      router.push("/book-road-test-vehicle/booking-details");
    }
  }, [bookingState, router]);
  
  const handleApplyPromo = (code: string) => {
    console.log("Applying promo code:", code);
    alert(`Promo code ${code} applied!`);
  };
  
  const handlePaymentSubmit = () => {
    setIsProcessing(true);
    
    // Log all form data
    console.log("Submitting payment with the following booking data:", bookingState);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      
      // Redirect to confirmation page
      router.push("/book-road-test-vehicle/confirmation");
    }, 2000);
  };
  
  // Mock document details
  const g2DocsFile = bookingState.documents?.roadTestFile || "G2_Docs.pdf";
  const licenseFile = bookingState.documents?.licenseFile || "G1_License.pdf";
  
  // Create formatted start date
  const formattedStartDate = bookingState.testDate && bookingState.testTime
    ? `${bookingState.testDate} at ${bookingState.testTime}`
    : "Monday, April 7, 2025 at 10:00 am";
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <BookingStepsProgress steps={bookingSteps} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="col-span-1 md:col-span-1">
          <h1 className="text-2xl font-bold mb-1">We are almost done!</h1>
          <p className="text-gray-600 mb-6">Please check your road test details and summary.</p>
          
          {/* Test Type and Contact Details */}
          <div className="mb-8 grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium mb-1">Road Test Type</h3>
              <div className="text-sm">{bookingState.testType || "G2"}</div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-1">Contact Details</h3>
              <div className="text-sm">
                <p>{bookingState.userDetails?.fullName || "Toridul Islam Chayan"}</p>
                <p>{bookingState.userDetails?.email || "toridul@gmail.com"}</p>
                <p>{bookingState.userDetails?.phone || "+1 647 676 4519"}</p>
              </div>
            </div>
          </div>
          
          {/* Documents Section */}
          <div className="mb-8">
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
              <div className="flex items-start gap-2">
                <div className="bg-green-100 rounded-full p-1 mt-0.5">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">We need these documents for your road test booking.</p>
                  <p className="text-xs text-gray-600">These files are important for us to match your perfect instructor.</p>
                </div>
              </div>
            </div>
            
            {/* Document Files */}
            <div className="flex gap-4 w-full">
              <div className="flex items-start border border-gray-200 rounded-md p-3 bg-gray-50 w-1/2">
                <div className="flex-shrink-0 mr-2 mt-1">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <FileText className="h-4 w-4 text-gray-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{g2DocsFile}</p>
                  <p className="text-xs text-gray-500">0.53 MB</p>
                </div>
              </div>
              
              <div className="flex items-start border border-gray-200 rounded-md p-3 bg-gray-50 w-1/2">
                <div className="flex-shrink-0 mr-2 mt-1">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-gray-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{licenseFile}</p>
                  <p className="text-xs text-gray-500">0.76 MB</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Continue to Payment Button */}
          <button
            onClick={handlePaymentSubmit}
            disabled={isProcessing}
            className="w-full py-3 bg-[#0C8B44] hover:bg-[#0A7A3C] text-white rounded-md font-medium transition-colors mb-8"
          >
            {isProcessing ? "Processing..." : "Continue to Payment"}
          </button>
          
          {/* Pickup Options */}
          <PickupOptions />
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
          />
        </div>
      </div>
    </div>
  );
}








