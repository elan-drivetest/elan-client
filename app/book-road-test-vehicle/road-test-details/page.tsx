// // app/book-road-test-vehicle/road-test-details/page.tsx
// "use client"

// import React, { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import TestTypeCard from "@/components/booking/TestTypeCard";
// import TestCenterDropdown from "@/components/booking/TestCenterDropdown";
// import RatingBar from "@/components/booking/RatingBar";
// import { testCenters } from "@/lib/data/test-centers";
// import { useBooking } from "@/lib/context/BookingContext";
// import { TimePicker } from "@/components/ui/time-picker";
// import { DatePicker } from "@/components/ui/date-picker";
// import BookingStepsProgress from "@/components/booking/BookingStepsProgress";

// // Define booking steps with paths
// const bookingSteps = [
//   { id: 1, name: "Road Test Details", path: "/book-road-test-vehicle/road-test-details" },
//   { id: 2, name: "Booking Details", path: "/book-road-test-vehicle/booking-details" },
//   { id: 3, name: "Test Details", path: "/book-road-test-vehicle/test-details" },
//   { id: 4, name: "Payment", path: "/book-road-test-vehicle/payment" },
// ];

// export default function RoadTestDetails() {
//   const router = useRouter();
//   const { bookingState, updateBookingState, setCurrentStep } = useBooking();
//   const [selectedCenter, setSelectedCenter] = useState(
//     bookingState.testCenterId 
//       ? testCenters.find(center => center.id === bookingState.testCenterId) || null
//       : null
//   );
  
//   // New state for date/time picker
//   const [selectedDate, setSelectedDate] = useState<Date | undefined>(
//     bookingState.testDate && bookingState.testTime 
//       ? new Date(`${bookingState.testDate} ${bookingState.testTime}`)
//       : undefined
//   );

//   // Set current step
//   useEffect(() => {
//     setCurrentStep(1);
//   }, [setCurrentStep]);

//   const handleTypeSelection = (testType: 'G2' | 'G') => {
//     updateBookingState({ testType });
//   };

//   const handleCenterSelection = (center: typeof testCenters[0]) => {
//     setSelectedCenter(center);
//     updateBookingState({ 
//       testCenter: center.name, 
//       testCenterId: center.id,
//       testCenterAddress: center.address 
//     });
//   };
  
//   // Handler for date/time changes
//   const handleDateTimeChange = (date: Date | undefined) => {
//     setSelectedDate(date);
//     if (date) {
//       const formattedDate = date.toLocaleDateString('en-US', {
//         month: '2-digit',
//         day: '2-digit',
//         year: 'numeric'
//       });
      
//       const formattedTime = date.toLocaleTimeString('en-US', {
//         hour: '2-digit',
//         minute: '2-digit',
//         hour12: true
//       });
      
//       updateBookingState({
//         testDate: formattedDate,
//         testTime: formattedTime
//       });
//     }
//   };

//   const handleContinue = () => {
//     if (bookingState.testType && bookingState.testCenter && bookingState.testDate && bookingState.testTime) {
//       setCurrentStep(2);
//       router.push("/book-road-test-vehicle/booking-details");
//     } else {
//       // Show validation error
//       alert("Please fill in all required fields");
//     }
//   };

//   return (
//     <div className="max-w-4xl mx-auto px-4 py-8">
//       {/* Add BookingStepsProgress component */}
//       <BookingStepsProgress steps={bookingSteps} />
      
//       <h1 className="text-2xl font-bold text-center mb-1">{"Let's Get Started"}</h1>
//       <p className="text-gray-600 text-center mb-6">Select your road test type</p>

//       {/* Test Type Selection */}
//       <div className="space-y-4 mb-8">
//         <TestTypeCard
//           type="G2"
//           title="G2 Road Test"
//           description="For first-time drivers ready to hit the road solo."
//           isSelected={bookingState.testType === 'G2'}
//           onSelect={() => handleTypeSelection('G2')}
//         />
//         <TestTypeCard
//           type="G"
//           title="G Road Test"
//           description="For experienced drivers ready for full driving privileges."
//           isSelected={bookingState.testType === 'G'}
//           onSelect={() => handleTypeSelection('G')}
//         />
//       </div>

//       {/* Test Center Selection */}
//       <div className="mb-8">
//         <p className="font-black mb-2 text-lg">Select Your Test Center</p>
//         <TestCenterDropdown
//           testCenters={testCenters}
//           selectedCenter={selectedCenter}
//           onSelect={handleCenterSelection}
//         />
//       </div>

//       {/* Date and Time Selection */}
//       <div className="mb-8">
//         <p className="font-black mb-2 text-lg">Select Road Test date</p>
//         <div className="space-y-4">
//           <div>
//             <label className="block text-sm font-black text-gray-600 mb-1">Road Test Date</label>
//             <DatePicker
//               date={selectedDate}
//               setDate={handleDateTimeChange}
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-black text-gray-600 mb-1">Road Test Time</label>
//             <TimePicker
//               date={selectedDate}
//               setDate={handleDateTimeChange}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Continue Button */}
//       <div className="mb-8">
//         <button
//           onClick={handleContinue}
//           className="w-full bg-[#0C8B44] hover:bg-[#0C8B44]/90 text-white py-3 px-4 rounded-md font-black transition-colors"
//         >
//           Continue
//         </button>
//       </div>

//       {/* Rating */}
//       <RatingBar />
//     </div>
//   );
// }

// app/book-road-test-vehicle/road-test-details/page.tsx - Enhanced with Real API Integration
"use client"

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TestTypeCard from "@/components/booking/TestTypeCard";
import TestCenterDropdown from "@/components/booking/TestCenterDropdown";
import RatingBar from "@/components/booking/RatingBar";
import { useBooking } from "@/lib/context/BookingContext";
import { TimePicker } from "@/components/ui/time-picker";
import { DatePicker } from "@/components/ui/date-picker";
import BookingStepsProgress from "@/components/booking/BookingStepsProgress";
import type { DriveTestCenter, TestType } from "@/lib/types/booking.types";
import { Loader2, AlertCircle } from "lucide-react";

// Define booking steps with paths
const bookingSteps = [
  { id: 1, name: "Road Test Details", path: "/book-road-test-vehicle/road-test-details" },
  { id: 2, name: "Booking Details", path: "/book-road-test-vehicle/booking-details" },
  { id: 3, name: "Test Details", path: "/book-road-test-vehicle/test-details" },
  { id: 4, name: "Payment", path: "/book-road-test-vehicle/payment" },
];

export default function RoadTestDetails() {
  const router = useRouter();
  const { 
    bookingState, 
    updateBookingState, 
    setCurrentStep, 
    testCenters, 
    isLoadingCenters,
    calculatePricing 
  } = useBooking();

  // Local state for form management
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    bookingState.testDate && bookingState.testTime 
      ? (() => {
          try {
            // Parse existing date/time from booking state
            return new Date(`${bookingState.testDate} ${bookingState.testTime}`);
          } catch {
            return undefined;
          }
        })()
      : undefined
  );
  
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Set current step on mount
  useEffect(() => {
    setCurrentStep(1);
  }, [setCurrentStep]);

  // Find selected center from real API data
  const selectedCenter = React.useMemo(() => {
    if (!bookingState.testCenter || !testCenters.length) return null;
    
    // Handle both legacy string IDs and new API center objects
    if (typeof bookingState.testCenterId === 'string') {
      return testCenters.find(center => center.id.toString() === bookingState.testCenterId);
    } else if (typeof bookingState.testCenterId === 'number') {
      return testCenters.find(center => center.id === bookingState.testCenterId);
    } else if (bookingState.testCenter && typeof bookingState.testCenter === 'object') {
      return bookingState.testCenter as DriveTestCenter;
    }
    
    return null;
  }, [bookingState.testCenter, bookingState.testCenterId, testCenters]);

  const handleTypeSelection = (testType: 'G2' | 'G') => {
    // FIXED: Cast to TestType enum
    updateBookingState({ testType: testType as TestType });
    setValidationErrors([]);
    
    // Recalculate pricing when test type changes
    setTimeout(() => calculatePricing(), 100);
  };

  const handleCenterSelection = (center: DriveTestCenter) => {
    updateBookingState({ 
      testCenter: center,
      testCenterId: center.id,
      testCenterAddress: center.address || `${center.city}, ${center.province}`
    });
    setValidationErrors([]);
    
    // Recalculate pricing when test center changes
    setTimeout(() => calculatePricing(), 100);
  };
  
  // Handler for date/time changes with proper API format
  const handleDateTimeChange = (date: Date | undefined) => {
    setSelectedDate(date);
    setValidationErrors([]);
    
    if (date) {
      // Format date as YYYY-MM-DD for API compatibility
      const formattedDate = date.toISOString().split('T')[0];
      
      // Format time as HH:mm for API compatibility
      const formattedTime = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      
      updateBookingState({
        testDate: formattedDate,
        testTime: formattedTime
      });
    } else {
      updateBookingState({
        testDate: '',
        testTime: ''
      });
    }
  };

  // Validation function
  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    if (!bookingState.testType) {
      errors.push('Please select a test type (G2 or G)');
    }
    
    if (!selectedCenter) {
      errors.push('Please select a test center');
    }
    
    if (!bookingState.testDate) {
      errors.push('Please select a test date');
    }
    
    if (!bookingState.testTime) {
      errors.push('Please select a test time');
    }

    // Validate date is not in the past
    if (bookingState.testDate && bookingState.testTime) {
      const selectedDateTime = new Date(`${bookingState.testDate}T${bookingState.testTime}`);
      const now = new Date();
      
      if (selectedDateTime <= now) {
        errors.push('Please select a future date and time');
      }
    }
    
    return errors;
  };

  const handleContinue = () => {
    const errors = validateForm();
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    // All validations passed, proceed to next step
    setCurrentStep(2);
    router.push("/book-road-test-vehicle/booking-details");
  };

  // Display loading state while fetching test centers
  if (isLoadingCenters) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <BookingStepsProgress steps={bookingSteps} />
        
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#0C8B44]" />
            <p className="text-gray-600">Loading test centers...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <BookingStepsProgress steps={bookingSteps} />
      
      <h1 className="text-2xl font-bold text-center mb-1">{"Let's Get Started"}</h1>
      <p className="text-gray-600 text-center mb-6">Select your road test type</p>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800 mb-2">
                Please fix the following issues:
              </h3>
              <ul className="text-sm text-red-700 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

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
        {testCenters.length > 0 ? (
          <TestCenterDropdown
            selectedCenter={selectedCenter ?? null}
            onSelect={handleCenterSelection}
            testType={bookingState.testType}
            placeholder="Search for a test center..."
            disabled={!bookingState.testType}
          />
        ) : (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <p className="text-gray-600">
                Unable to load test centers. Please refresh the page or try again later.
              </p>
            </div>
          </div>
        )}
        
        {!bookingState.testType && (
          <p className="text-sm text-gray-500 mt-2">
            Please select a test type first to choose a test center
          </p>
        )}
      </div>

      {/* Date and Time Selection */}
      <div className="mb-8">
        <p className="font-black mb-2 text-lg">Select Road Test Date & Time</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-black text-gray-600 mb-1">
              Road Test Date
            </label>
            <DatePicker
              date={selectedDate}
              setDate={handleDateTimeChange}
              disabled={!selectedCenter}
            />
            {!selectedCenter && (
              <p className="text-sm text-gray-500 mt-1">
                Please select a test center first
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-black text-gray-600 mb-1">
              Road Test Time
            </label>
            <TimePicker
              date={selectedDate}
              setDate={handleDateTimeChange}
              disabled={!selectedCenter || !bookingState.testDate}
            />
            {(!selectedCenter || !bookingState.testDate) && (
              <p className="text-sm text-gray-500 mt-1">
                Please select a test center and date first
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <div className="mb-8">
        <button
          onClick={handleContinue}
          disabled={isLoadingCenters}
          className="w-full bg-[#0C8B44] hover:bg-[#0C8B44]/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-md font-black transition-colors"
        >
          {isLoadingCenters ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading...
            </span>
          ) : (
            'Continue'
          )}
        </button>
      </div>

      {/* Rating */}
      <RatingBar />
    </div>
  );
}