// app/book-road-test-vehicle/booking-details/page.tsx
"use client"

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BookingStepsProgress from "@/components/booking/BookingStepsProgress";
import SignupForm, { SignupFormData } from "@/components/auth/SignupForm";
import LoginForm, { LoginFormData } from "@/components/auth/LoginForm";
import VehicleSummary from "@/components/booking/VehicleSummary";
import PickupOptions from "@/components/booking/PickupOptions";
import { useBooking } from "@/lib/context/BookingContext";

const bookingSteps = [
  { id: 1, name: "Road Test Details", path: "/book-road-test-vehicle/road-test-details" },
  { id: 2, name: "Booking Details", path: "/book-road-test-vehicle/booking-details" },
  { id: 3, name: "Test Details", path: "/book-road-test-vehicle/test-details" },
  { id: 4, name: "Payment", path: "/book-road-test-vehicle/payment" },
];

export default function BookingDetails() {
  const router = useRouter();
  const { bookingState, updateBookingState, setCurrentStep } = useBooking();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  // Set current step
  useEffect(() => {
    setCurrentStep(2);
  }, [setCurrentStep]);

  // Redirect to first step if needed fields aren't set
  useEffect(() => {
    if (!bookingState.testType || !bookingState.testCenter || !bookingState.testDate || !bookingState.testTime) {
      router.push("/book-road-test-vehicle/road-test-details");
    }
  }, [bookingState, router]);

  const handleCreateAccount = (data: SignupFormData) => {
    setIsProcessing(true);
    
    // Store user data in booking state
    updateBookingState({
      userDetails: {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
      }
    });
    
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      setCurrentStep(3);
      router.push("/book-road-test-vehicle/test-details");
    }, 1000);
  };

  const handleLogin = (data: LoginFormData) => {
    setIsProcessing(true);
    
    // Store user email in booking state
    updateBookingState({
      userDetails: {
        ...bookingState.userDetails,
        email: data.email,
      }
    });
    
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      setCurrentStep(3);
      router.push("/book-road-test-vehicle/test-details");
    }, 1000);
  };

  const toggleAuthMode = () => {
    setShowLogin(!showLogin);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <BookingStepsProgress steps={bookingSteps} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="col-span-1 md:col-span-1">
          <h1 className="text-2xl font-bold mb-1">Booking details</h1>
          <p className="text-gray-600 mb-6">{showLogin ? "Log in" : "Sign up"} to continue</p>

          {showLogin ? (
            <>
              <LoginForm 
                onSubmit={handleLogin} 
                buttonText={isProcessing ? "Processing..." : "Log in"}
                showRememberMe={false}
                className="mb-4"
              />
              
              <div className="mt-4 text-sm">
                <span className="text-gray-600">{"Don't have an account? "}</span>
                <button 
                  onClick={toggleAuthMode}
                  className="text-[#0C8B44] hover:underline font-medium bg-transparent border-none p-0 cursor-pointer"
                >
                  Sign up
                </button>
              </div>
            </>
          ) : (
            <>
              <SignupForm 
                onSubmit={handleCreateAccount} 
                buttonText={isProcessing ? "Processing..." : "Create account"}
                className="mb-4"
              />
              
              <div className="mt-4 text-sm">
                <span className="text-gray-600">Have an account? </span>
                <button 
                  onClick={toggleAuthMode}
                  className="text-[#0C8B44] hover:underline font-medium bg-transparent border-none p-0 cursor-pointer"
                >
                  Log in
                </button>
              </div>
            </>
          )}
          
          <PickupOptions />
          
        </div>
        
        <div className="col-span-1">
          <VehicleSummary />
        </div>
      </div>
    </div>
  );
}