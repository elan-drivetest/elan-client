// app/book-road-test-vehicle/payment/page.tsx
"use client"

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBooking } from "@/lib/context/BookingContext";
import { useAuth } from "@/lib/context/AuthContext";
import BookingStepsProgress from "@/components/booking/BookingStepsProgress";
import TestSummary from "@/components/booking/TestSummary";
import PickupOptions from "@/components/booking/PickupOptions";
import { CheckCircle, CreditCard, FileText, AlertTriangle, Loader2 } from "lucide-react";

const bookingSteps = [
  { id: 1, name: "Road Test Details", path: "/book-road-test-vehicle/road-test-details" },
  { id: 2, name: "Booking Details", path: "/book-road-test-vehicle/booking-details" },
  { id: 3, name: "Test Details", path: "/book-road-test-vehicle/test-details" },
  { id: 4, name: "Payment", path: "/book-road-test-vehicle/payment" },
];

export default function Payment() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { 
    bookingState, 
    setCurrentStep, 
    calculatePricing,
    updateBookingState,
    createBooking,
    validateBookingData
  } = useBooking();
  
  const [isProcessing, setIsProcessing] = useState(false);

  // Set current step and calculate pricing ONCE - fix infinite re-rendering
  useEffect(() => {
    setCurrentStep(4);
    if (calculatePricing) {
      calculatePricing();
    }
  }, []); // Empty dependency array to prevent infinite loops

  // Auto-populate user details from authenticated user - ONCE per auth change
  useEffect(() => {
    if (isAuthenticated && user && !bookingState.userDetails?.email) {
      const userDetails = {
        fullName: user.full_name || '',
        email: user.email,
        phone: user.phone_number || ''
      };
      
      // Only update if the data is actually different
      const currentUserDetails = bookingState.userDetails;
      const hasChanged = !currentUserDetails || 
        currentUserDetails.fullName !== userDetails.fullName ||
        currentUserDetails.email !== userDetails.email ||
        currentUserDetails.phone !== userDetails.phone;
        
      if (hasChanged) {
        updateBookingState({ userDetails });
      }
    }
  }, [isAuthenticated, user?.full_name, user?.email, user?.phone_number]); // Depend on specific user properties

  // Redirect if necessary fields aren't set - run only once on mount and when auth changes
  useEffect(() => {
    if (!bookingState.userDetails?.email && !isAuthenticated) {
      router.push("/book-road-test-vehicle/booking-details");
    }
  }, [isAuthenticated]); // Only depend on auth status, not bookingState

  const handleApplyPromo = (code: string) => {
    console.log("Applying promo code:", code);
    alert(`Promo code ${code} applied!`);
  };

  const handlePaymentSubmit = async () => {
    // Clear any previous booking errors first
    updateBookingState({ bookingError: undefined });
    
    // Validate data before submission using BookingContext validation
    const validation = validateBookingData();
    if (!validation.isValid) {
      alert(`Please fix the following issues:\n${validation.errors.join('\n')}`);
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log("🚀 Creating booking with data:", bookingState);
      
      // Use the BookingContext createBooking method
      const result = await createBooking();
      
      console.log("📊 Full API response:", result);
      
      if (result.success) {
        console.log("✅ Booking created successfully");
        
        // Check if result.data is a string (the Stripe URL directly)
        if (typeof result.data === 'string' && result.data.includes('checkout.stripe.com')) {
          console.log("💳 Redirecting to Stripe checkout (string response):", result.data);
          // Redirect to Stripe checkout
          window.location.href = result.data;
          return;
        }
        
        // Check if result.data is an object with checkout_url
        if (result.data && typeof result.data === 'object' && result.data.checkout_url) {
          console.log("💳 Redirecting to Stripe checkout (object response):", result.data.checkout_url);
          // Redirect to Stripe checkout
          window.location.href = result.data.checkout_url;
          return;
        }
        
        // If no Stripe URL found, log what we got
        console.log("⚠️ No Stripe checkout URL found");
        console.log("🔍 Response type:", typeof result.data);
        console.log("🔍 Response data:", result.data);
        
        if (result.data && typeof result.data === 'object') {
          console.log("🔍 Available keys in result.data:", Object.keys(result.data));
        }
        
        // Fallback to original confirmation page
        router.push("/book-road-test-vehicle/confirmation");
      } else {
        console.error("❌ Booking creation failed:", result.error);
        alert(`Booking failed: ${result.error}`);
      }
      
    } catch (error) {
      console.error("💥 Payment submission error:", error);
      alert('Network error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Initialize component state once
  useEffect(() => {
    const initializeComponent = () => {
      updateBookingState({ 
        bookingError: undefined,
        isCreatingBooking: false
      });
    };
    
    initializeComponent();
  }, []); // Run only once on mount

  // Helper function to truncate file name
  const truncateFileName = (fileName: string, maxLength: number = 25): string => {
    if (!fileName) return "";
    if (fileName.length <= maxLength) return fileName;
    
    const extension = fileName.split('.').pop();
    const nameWithoutExtension = fileName.substring(0, fileName.lastIndexOf('.'));
    const truncatedName = nameWithoutExtension.substring(0, maxLength - extension!.length - 4) + "...";
    
    return `${truncatedName}.${extension}`;
  };

  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file details from booking state
  const getRoadTestFileDetails = () => {
    // Check for uploaded file metadata first
    const uploadedUrl = bookingState.documents?.roadTestFile;
    const originalFileName = bookingState.documents?.roadTestFileMetadata?.originalName;
    const fileSize = bookingState.documents?.roadTestFileMetadata?.size;
    
    if (uploadedUrl && originalFileName) {
      return {
        name: truncateFileName(originalFileName),
        size: fileSize ? formatFileSize(fileSize) : "Unknown size"
      };
    }
    
    // Fallback to legacy file name storage
    const legacyFileName = bookingState.documents?.roadTestFile;
    if (typeof legacyFileName === 'string') {
      return {
        name: truncateFileName(legacyFileName),
        size: "Unknown size"
      };
    }
    
    return {
      name: "G2_Docs.pdf",
      size: "0.53 MB"
    };
  };

  const getLicenseFileDetails = () => {
    // Check for uploaded file metadata first
    const uploadedUrl = bookingState.documents?.licenseFile;
    const originalFileName = bookingState.documents?.licenseFileMetadata?.originalName;
    const fileSize = bookingState.documents?.licenseFileMetadata?.size;
    
    if (uploadedUrl && originalFileName) {
      return {
        name: truncateFileName(originalFileName),
        size: fileSize ? formatFileSize(fileSize) : "Unknown size"
      };
    }
    
    // Fallback to legacy file name storage
    const legacyFileName = bookingState.documents?.licenseFile;
    if (typeof legacyFileName === 'string') {
      return {
        name: truncateFileName(legacyFileName),
        size: "Unknown size"
      };
    }
    
    return {
      name: "G1_License.pdf",
      size: "0.76 MB"
    };
  };

  // Get dynamic file details
  const roadTestFile = getRoadTestFileDetails();
  const licenseFile = getLicenseFileDetails();

  // Create formatted start date
  const formattedStartDate = bookingState.testDate && bookingState.testTime
    ? `${bookingState.testDate} at ${bookingState.testTime}`
    : "Monday, April 7, 2025 at 10:00 am";

  // Check if all required data is available
  const hasRequiredDocuments = bookingState.documents?.roadTestFile && 
                               bookingState.documents?.licenseFile;
  const canSubmitBooking = hasRequiredDocuments && 
                          (isAuthenticated || bookingState.userDetails?.email);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <BookingStepsProgress steps={bookingSteps} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="col-span-1 md:col-span-1">
          <h1 className="text-2xl font-bold mb-1">We are almost done!</h1>
          <p className="text-gray-600 mb-6">Please check your road test details and summary.</p>
          
          {/* Validation Errors */}
          {bookingState.bookingError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-red-800 mb-2">
                    Booking Error:
                  </h3>
                  <p className="text-sm text-red-700">{bookingState.bookingError}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Test Type and Contact Details */}
          <div className="mb-8 grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium mb-1 text-primary">Contact Details</h3>
              <div className="text-sm">
                <p>{bookingState.userDetails?.fullName || ""}</p>
                <p>{bookingState.userDetails?.email || ""}</p>
                <p>{bookingState.userDetails?.phone || ""}</p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-1 text-primary">Road Test Type</h3>
              <div className="text-sm">{bookingState.testType || "G2"}</div>
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
                  <p className="text-sm font-medium">{roadTestFile.name}</p>
                  <p className="text-xs text-gray-500">{roadTestFile.size}</p>
                </div>
              </div>
              
              <div className="flex items-start border border-gray-200 rounded-md p-3 bg-gray-50 w-1/2">
                <div className="flex-shrink-0 mr-2 mt-1">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-gray-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{licenseFile.name}</p>
                  <p className="text-xs text-gray-500">{licenseFile.size}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Continue to Payment Button */}
          <button
            onClick={handlePaymentSubmit}
            disabled={!canSubmitBooking || isProcessing || bookingState.isCreatingBooking}
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-md font-medium transition-colors mb-8 ${
              canSubmitBooking && !isProcessing && !bookingState.isCreatingBooking
                ? 'bg-[#0C8B44] hover:bg-[#0A7A3C] text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {(isProcessing || bookingState.isCreatingBooking) ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Continue to Payment"
            )}
          </button>
          
          {!canSubmitBooking && !isProcessing && (
            <p className="text-sm text-gray-500 text-center mb-8">
              {!hasRequiredDocuments 
                ? "Please upload all required documents to continue"
                : "Please sign in to continue"
              }
            </p>
          )}
          
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
            testCentre={typeof bookingState.testCenter === 'object' ? bookingState.testCenter?.name ?? "" : bookingState.testCenter ?? ""}
            testCentreAddress={bookingState.testCenterAddress}
            onApplyPromo={handleApplyPromo}
            hasAddOn={!!bookingState.selectedAddOn}
            selectedAddOn={bookingState.selectedAddOn || null}
          />
        </div>
      </div>
    </div>
  );
}