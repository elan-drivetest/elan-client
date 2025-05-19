"use client"

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import BookingStepsProgress from "@/components/booking/BookingStepsProgress";
import ContactDetails from "@/components/booking/ContactDetails";
import DocumentUpload from "@/components/booking/DocumentUpload";
import LocationSelection, { LocationOption } from "@/components/booking/LocationSelection";
import MockTestCard from "@/components/booking/MockTestCard";
import DrivingLessonCard from "@/components/booking/DrivingLessonCard";
import TestSummary from "@/components/booking/TestSummary";
import { useBooking } from "@/lib/context/BookingContext";
import { FileText, CreditCard } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import PickupOptions from "@/components/booking/PickupOptions";

const bookingSteps = [
  { id: 1, name: "Road Test Details", path: "/book-road-test-vehicle/road-test-details" },
  { id: 2, name: "Booking Details", path: "/book-road-test-vehicle/booking-details" },
  { id: 3, name: "Test Details", path: "/book-road-test-vehicle/test-details" },
  { id: 4, name: "Payment", path: "/book-road-test-vehicle/payment" },
];

// Type for the add-on options
export type AddOnType = 'mock-test' | 'driving-lesson' | null;

export default function TestDetails() {
  const router = useRouter();
  const { bookingState, updateBookingState, setCurrentStep, calculatePricing } = useBooking();
  
  // Initialize with data from context or defaults
  const [locationOption, setLocationOption] = useState<LocationOption>(
    bookingState.locationOption || "test-centre"
  );
  const [selectedAddOn, setSelectedAddOn] = useState<AddOnType>(
    bookingState.selectedAddOn || null
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [roadTestFile, setRoadTestFile] = useState<File | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  
  // Set current step and make sure pricing is calculated correctly
  useEffect(() => {
    setCurrentStep(3);
    // Calculate initial pricing
    calculatePricing();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setCurrentStep]);
  
  // Update pricing when relevant booking state changes
  useEffect(() => {
    calculatePricing();
  }, [
    bookingState.locationOption, 
    bookingState.pickupDistance,
    bookingState.selectedAddOn,
    bookingState.freeAddOn,
    bookingState.testType,
    calculatePricing
  ]);
  
  // Redirect if necessary fields aren't set
  useEffect(() => {
    if (!bookingState.userDetails?.email) {
      router.push("/book-road-test-vehicle/booking-details");
    }
  }, [bookingState, router]);
  
  // Mock user data - use data from context if available
  const userData = {
    fullName: bookingState.userDetails?.fullName || "Toridul Islam Chayan",
    email: bookingState.userDetails?.email || "toridul@gmail.com",
    phone: bookingState.userDetails?.phone || "+1 647 676 4519"
  };
  
  const handleLocationChange = (option: LocationOption) => {
    setLocationOption(option);
    updateBookingState({ locationOption: option });
    
    // Reset add-ons when changing location option
    if (option === 'test-centre') {
      setSelectedAddOn(null);
      updateBookingState({ 
        selectedAddOn: null,
        freeAddOn: null,
        pickupAddress: undefined,
        pickupDistance: undefined
      });
    }
  };
  
  const handlePickupLocationSelect = (address: string, distance: number) => {
    updateBookingState({ 
      pickupAddress: address,
      pickupDistance: distance
    });
    
    // Check if eligible for free add-ons based on distance
    if (distance >= 100) {
      // Free 1-hour lesson
      updateBookingState({ freeAddOn: 'one-hour-lesson' });
    } else if (distance >= 50) {
      // Free 30-minute lesson
      updateBookingState({ freeAddOn: 'thirty-min-lesson' });
    } else {
      updateBookingState({ freeAddOn: null });
    }
  };
  
  const handleSelectAddOn = (type: AddOnType) => {
    // Check if there's a free add-on
    if (bookingState.freeAddOn && bookingState.freeAddOn === 'one-hour-lesson' && type === 'driving-lesson') {
      // Don't allow selection if already getting a free 1-hour lesson
      alert("You already qualify for a free 1-hour driving lesson!");
      return;
    }
    
    const newAddOn = type === selectedAddOn ? null : type;
    setSelectedAddOn(newAddOn);
    updateBookingState({ selectedAddOn: newAddOn });
  };
  
  const handleApplyPromo = (code: string) => {
    console.log("Applying promo code:", code);
    alert(`Promo code ${code} applied!`);
  };
  
  const handleContinue = () => {
    setCurrentStep(4);
    router.push("/book-road-test-vehicle/payment");
  };
  
  const handleFileSelect = (type: 'roadTest' | 'license', file: File) => {
    if (type === 'roadTest') {
      setRoadTestFile(file);
    } else {
      setLicenseFile(file);
    }
    
    // Update the booking state with file information (just store file name for now)
    updateBookingState({
      documents: {
        ...bookingState.documents,
        [type === 'roadTest' ? 'roadTestFile' : 'licenseFile']: file.name
      }
    });
  };
  
  // Create formatted start date
  const formattedStartDate = bookingState.testDate && bookingState.testTime
    ? `${bookingState.testDate} at ${bookingState.testTime}`
    : "Monday, April 7, 2025 at 10:00 am";

  // Helper function to check free add-on type
  const hasFreeOneHourLesson = bookingState.freeAddOn === 'one-hour-lesson';
  const hasFreeThirtyMinLesson = bookingState.freeAddOn === 'thirty-min-lesson';
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <BookingStepsProgress steps={bookingSteps} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="col-span-1 md:col-span-1">
          <h1 className="text-2xl font-bold mb-1">Test Details</h1>
          <p className="text-gray-600 mb-6">Contact Details</p>

          {/* Contact Details */}
          <ContactDetails
            fullName={userData.fullName}
            email={userData.email}
            phone={userData.phone}
          />
          
          {/* Document Uploads */}
          <div className="mb-8">
            <DocumentUpload
              title="Upload Your G2/G Road Test Booking Confirmation"
              description="PNG, JPG, PDF or TXT file"
              actionText="Upload Your Road Test Documents"
              icon={<FileText className="h-4 w-4 text-gray-600" />}
              onFileSelect={(file) => handleFileSelect('roadTest', file)}
            />
            
            <DocumentUpload
              title="Upload Your Ontario License"
              description="PNG, JPG, PDF or TXT file"
              actionText="Upload Your License"
              icon={<CreditCard className="h-4 w-4 text-gray-600" />}
              onFileSelect={(file) => handleFileSelect('license', file)}
            />
          </div>
          
          {/* Location Selection */}
          <LocationSelection
            selectedOption={locationOption}
            onOptionChange={handleLocationChange}
            onPickupLocationSelect={handlePickupLocationSelect}
          />

          <Separator className="mb-8" />
          
          {/* Show Add-on options if not already eligible for free 1-hour lesson */}
          {!hasFreeOneHourLesson && (
            <>
              {/* If mock-test is not selected, show mock test recommendation */}
              {selectedAddOn !== "mock-test" && !selectedAddOn && (
                <div className="mb-8">
                  <MockTestCard 
                    onAdd={() => handleSelectAddOn('mock-test')} 
                  />
                </div>
              )}
              
              {/* If mock test added, show confirmation */}
              {selectedAddOn === 'mock-test' && (
                <div className="mb-8">
                  <MockTestCard 
                    isAdded={true} 
                    onAdd={() => handleSelectAddOn(null)}
                  />
                </div>
              )}
              
              {/* If driving lesson is not selected and free 1-hour lesson is not available, show option */}
              {selectedAddOn !== "driving-lesson" && !selectedAddOn && !hasFreeOneHourLesson && (
                <div className="mb-8">
                  <DrivingLessonCard
                    duration="1 hour"
                    description="One-on-one practice session with a professional instructor before your test"
                    isSelected={false}
                    onSelect={() => handleSelectAddOn('driving-lesson')}
                  />
                </div>
              )}
              
              {/* If driving lesson is added, show confirmation */}
              {selectedAddOn === 'driving-lesson' && (
                <div className="mb-8">
                  <DrivingLessonCard
                    duration="1 hour"
                    description="One-on-one practice session with a professional instructor before your test"
                    isSelected={true}
                    onSelect={() => handleSelectAddOn(null)}
                  />
                </div>
              )}
            </>
          )}
          
          {/* If eligible for free 1-hour lesson, show that instead */}
          {hasFreeOneHourLesson && (
            <div className="mb-8 bg-green-50 border border-green-200 rounded-md p-4">
              <h3 className="font-medium text-[#0C8B44] mb-2">🎉 Free 1-hour Driving Lesson</h3>
              <p className="text-sm text-gray-700 mb-3">
                Congratulations! You qualify for a free 1-hour driving lesson before your test due to your pickup distance.
              </p>
              
              <DrivingLessonCard
                duration="1 hour"
                description="One-on-one practice session with a professional instructor before your test"
                isSelected={true}
                // Disable clicking since this is free and automatic
                onSelect={() => {}}
              />
            </div>
          )}
          
          {/* If eligible for free 30-minute lesson, show that and offer upgrade options */}
          {hasFreeThirtyMinLesson && !selectedAddOn && (
            <div className="mb-8 bg-green-50 border border-green-200 rounded-md p-4">
              <h3 className="font-medium text-[#0C8B44] mb-2">🎉 Free 30-minute Driving Lesson</h3>
              <p className="text-sm text-gray-700 mb-3">
                You qualify for a free 30-minute driving lesson before your test due to your pickup distance.
              </p>
              
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Upgrade Options:</p>
                
                <div className="space-y-2">
                  <button 
                    onClick={() => handleSelectAddOn('driving-lesson')}
                    className="block w-full text-left p-3 border border-gray-300 rounded-md text-sm hover:border-[#0C8B44] hover:bg-green-50"
                  >
                    <span className="font-medium">Upgrade to 1-hour lesson</span>
                    <span className="text-xs text-gray-600 block mt-1">
                      Pay only $25 more for a full hour (Regular price: $50)
                    </span>
                  </button>
                  
                  <button 
                    onClick={() => handleSelectAddOn('mock-test')}
                    className="block w-full text-left p-3 border border-gray-300 rounded-md text-sm hover:border-[#0C8B44] hover:bg-green-50"
                  >
                    <span className="font-medium">Upgrade to mock test</span>
                    <span className="text-xs text-gray-600 block mt-1">
                      Pay only $29.99 more for a complete mock test (Regular price: $54.99)
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Bottom Additional Benefits */}
          <PickupOptions />
          
          {/* Continue Button */}
          <div className="mb-8">
            <button
              onClick={handleContinue}
              className="w-full py-3 bg-[#0C8B44] hover:bg-[#0A7A3C] text-white rounded-md font-medium transition-colors"
            >
              Continue
            </button>
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
            onRemoveAddOn={() => handleSelectAddOn(null)}
            hasAddOn={!!selectedAddOn}
            selectedAddOn={selectedAddOn}
            toggleAddOn={handleSelectAddOn}
          />
        </div>
      </div>
    </div>
  );
}