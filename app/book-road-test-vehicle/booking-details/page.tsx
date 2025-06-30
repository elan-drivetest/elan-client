// app/book-road-test-vehicle/booking-details/page.tsx
"use client"

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import BookingStepsProgress from "@/components/booking/BookingStepsProgress";
import SignupForm, { SignupFormData } from "@/components/auth/SignupForm";
import LoginForm, { LoginFormData } from "@/components/auth/LoginForm";
import VehicleSummary from "@/components/booking/VehicleSummary";
import PickupOptions from "@/components/booking/PickupOptions";
import { useBooking } from "@/lib/context/BookingContext";
import { useAuth } from "@/lib/context/AuthContext";
import { authApi, handleApiError } from "@/lib/api";
import type { RegisterRequest, LoginRequest } from "@/lib/types/auth.types";
import { CheckCircle } from "lucide-react";

const bookingSteps = [
  { id: 1, name: "Road Test Details", path: "/book-road-test-vehicle/road-test-details" },
  { id: 2, name: "Booking Details", path: "/book-road-test-vehicle/booking-details" },
  { id: 3, name: "Test Details", path: "/book-road-test-vehicle/test-details" },
  { id: 4, name: "Payment", path: "/book-road-test-vehicle/payment" },
];

export default function BookingDetails() {
  const router = useRouter();
  const { bookingState, updateBookingState, setCurrentStep } = useBooking();
  const { isAuthenticated, user, login, checkAuthStatus } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [errors, setErrors] = useState({ general: "" });
  const [showSuccessState, setShowSuccessState] = useState(false);
  
  // Use refs to prevent infinite re-renders
  const hasSetCurrentStep = useRef(false);
  const hasCheckedAuth = useRef(false);
  const hasValidatedBooking = useRef(false);
  const hasUpdatedUserDetails = useRef(false);

  // Set current step ONCE
  useEffect(() => {
    if (!hasSetCurrentStep.current) {
      setCurrentStep(2);
      hasSetCurrentStep.current = true;
    }
  }, []); // Empty dependency array

  // Check authentication status ONCE on mount
  useEffect(() => {
    if (!hasCheckedAuth.current) {
      checkAuthStatus();
      hasCheckedAuth.current = true;
    }
  }, []); // Empty dependency array

  // Redirect to first step if needed fields aren't set - ONCE
  useEffect(() => {
    if (!hasValidatedBooking.current) {
      if (!bookingState.testType || !bookingState.testCenter || !bookingState.testDate || !bookingState.testTime) {
        router.push("/book-road-test-vehicle/road-test-details");
      }
      hasValidatedBooking.current = true;
    }
  }, []); // Empty dependency array - check once on mount

  // Update booking state when user is authenticated - ONCE per authentication
  useEffect(() => {
    if (isAuthenticated && user && !showSuccessState && !hasUpdatedUserDetails.current) {
      updateBookingState({
        userDetails: {
          fullName: user.full_name,
          email: user.email,
          phone: user.phone_number || "",
        }
      });
      setShowSuccessState(true);
      hasUpdatedUserDetails.current = true;
    }
  }, [isAuthenticated, user]); // Only depend on auth state changes

  // Reset the user update flag when auth state changes
  useEffect(() => {
    if (!isAuthenticated) {
      hasUpdatedUserDetails.current = false;
    }
  }, [isAuthenticated]);

  const handleCreateAccount = async (data: SignupFormData) => {
    setIsProcessing(true);
    setErrors({ general: "" });
    
    try {
      // Prepare data for API (map form fields to API fields)
      const apiData: RegisterRequest = {
        full_name: data.fullName,
        email: data.email,
        password: data.password,
        phone_number: data.phone || undefined,
        confirmPassword: "", // Not used by API but required by type
        phone: undefined,    // Not used by API but required by type
        marketing: undefined // Not used by API but required by type
      };

      console.log('🚀 Registering user:', { email: apiData.email, name: apiData.full_name });
      
      // Call the real registration API
      const result = await authApi.register(apiData);
      
      if (result.success) {
        console.log('✅ Registration successful');
        
        // Store user data in booking state
        updateBookingState({
          userDetails: {
            fullName: data.fullName,
            email: data.email,
            phone: data.phone || "",
          }
        });
        
        // Show success state instead of auto-redirecting
        setShowSuccessState(true);
      } else {
        // Handle API errors
        const errorMessage = handleApiError(result.error);
        setErrors({ general: errorMessage });
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      setErrors({ general: "Registration failed. Please try again." });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogin = async (data: LoginFormData) => {
    setIsProcessing(true);
    setErrors({ general: "" });
    
    try {
      // Prepare data for API
      const apiData: LoginRequest = {
        email: data.email,
        password: data.password,
      };

      console.log('🚀 Logging in user:', { email: apiData.email });
      
      // Call the real login API
      const result = await authApi.login(apiData);
      
      if (result.success && result.data) {
        console.log('✅ Login successful');
        
        // Set user in auth context
        login(result.data);
        
        // Store user data in booking state
        updateBookingState({
          userDetails: {
            fullName: result.data.full_name,
            email: result.data.email,
            phone: result.data.phone_number || "",
          }
        });
        
        // Show success state instead of auto-redirecting
        setShowSuccessState(true);
      } else {
        // Handle API errors
        const errorMessage = handleApiError(result.error);
        setErrors({ general: errorMessage });
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setErrors({ general: "Login failed. Please check your credentials." });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProceedToNext = () => {
    setCurrentStep(3);
    router.push("/book-road-test-vehicle/test-details");
  };

  const toggleAuthMode = () => {
    setShowLogin(!showLogin);
    setErrors({ general: "" }); // Clear errors when switching
  };

  // Show success state with user info and next button
  if (showSuccessState && (isAuthenticated || bookingState.userDetails?.email)) {
    const userDetails = bookingState.userDetails;
    
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <BookingStepsProgress steps={bookingSteps} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="col-span-1 md:col-span-1">
            <h1 className="text-2xl font-bold mb-1">Booking details</h1>
            <p className="text-gray-600 mb-6">Account verified - ready to continue</p>

            {/* Success Message */}
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle size={24} className="text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-green-900 mb-2">
                    {isAuthenticated ? "Welcome back!" : "Account created successfully!"}
                  </h3>
                  <div className="space-y-1 text-sm text-green-800">
                    <p><strong>Name:</strong> {userDetails?.fullName}</p>
                    <p><strong>Email:</strong> {userDetails?.email}</p>
                    {userDetails?.phone && (
                      <p><strong>Phone:</strong> {userDetails.phone}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <PickupOptions />

            {/* Next Button */}
            <div className="mt-6">
              <button
                onClick={handleProceedToNext}
                className="w-full bg-[#0C8B44] hover:bg-[#0C8B44]/90 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                Continue to Test Details
              </button>
            </div>
          </div>
          
          <div className="col-span-1">
            <VehicleSummary />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <BookingStepsProgress steps={bookingSteps} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="col-span-1 md:col-span-1">
          <h1 className="text-2xl font-bold mb-1">Booking details</h1>
          <p className="text-gray-600 mb-6">{showLogin ? "Log in" : "Sign up"} to continue</p>

          {/* Show general errors */}
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{errors.general}</p>
            </div>
          )}

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