"use client"

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import BookingStepsProgress from "@/components/booking/BookingStepsProgress";
import ContactDetails from "@/components/booking/ContactDetails";
import DocumentUpload from "@/components/booking/DocumentUpload";
import LocationSelection, { LocationOption } from "@/components/booking/LocationSelection";
import MockTestCard from "@/components/booking/MockTestCard";
import DrivingLessonCard from "@/components/booking/DrivingLessonCard";
import TestSummary from "@/components/booking/TestSummary";
import { useBooking } from "@/lib/context/BookingContext";
import { useAuth } from "@/lib/context/AuthContext";
import { FileText, CreditCard } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { calculatePickupPricing } from "@/lib/utils/distance-calculator";
import PickupOptions from "@/components/booking/PickupOptions";
import { useFileUpload } from "@/lib/hooks/useFileUpload";
/* eslint-disable @typescript-eslint/no-explicit-any */

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
  const { user, isAuthenticated } = useAuth();
  const { 
    bookingState, 
    updateBookingState, 
    setCurrentStep,
    addons,
    isLoadingAddons,
    testCenters
  } = useBooking();
  
  // File upload hooks
  const {
    uploadFile: uploadRoadTestDoc,
    isUploading: isUploadingRoadTest,
    error: roadTestUploadError,
    success: roadTestUploadSuccess,
    /* eslint-disable @typescript-eslint/no-unused-vars */
    uploadedFile: uploadedRoadTestFile,
    resetState: resetRoadTestUpload
  } = useFileUpload();
  
  const {
    uploadFile: uploadLicenseDoc,
    isUploading: isUploadingLicense,
    error: licenseUploadError,
    success: licenseUploadSuccess,
    uploadedFile: uploadedLicenseFile,
    resetState: resetLicenseUpload
  } = useFileUpload();
  
  // Initialize with data from context or defaults
  const [locationOption, setLocationOption] = useState<LocationOption>(
    bookingState.locationOption || "test-centre"
  );
  const [selectedAddOn, setSelectedAddOn] = useState<AddOnType>(
    bookingState.selectedAddOn || null
  );
  // Document upload states
  const [roadTestDocUrl, setRoadTestDocUrl] = useState<string | null>(
    bookingState.documents?.roadTestFile || null
  );
  const [licenseDocUrl, setLicenseDocUrl] = useState<string | null>(
    bookingState.documents?.licenseFile || null
  );
  
  // Get mock test addon based on test type
  const getMockTestAddon = () => {
    if (!addons || addons.length === 0) return null;
    
    const testType = bookingState.testType;
    if (!testType) return null;
    
    // Based on API response:
    // - Mock Test Of G (id: 5) for G test
    // - Mock Test Of G2 (id: 6) for G2 test
    const mockTestAddon = addons.find(addon => {
      const isMockTest = addon.name.toLowerCase().includes('mock test');
      if (!isMockTest) return false;
      
      if (testType === 'G') {
        return addon.name.toLowerCase().includes('of g') && !addon.name.toLowerCase().includes('g2');
      } else if (testType === 'G2') {
        return addon.name.toLowerCase().includes('of g2');
      }
      
      return false;
    });
    
    return mockTestAddon || null;
  };

  // Get driving lesson addon based on test type
  const getDrivingLessonAddon = () => {
    if (!addons || addons.length === 0) return null;
    
    const testType = bookingState.testType;
    if (!testType) return null;
    
    // Get 1-hour lesson addon for the test type
    const lessonAddon = addons.find(addon => {
      const isLesson = addon.name.toLowerCase().includes('lesson') && 
                     addon.name.toLowerCase().includes('1 hour');
      if (!isLesson) return false;
      
      if (testType === 'G') {
        return addon.name.toLowerCase().includes('of g') && !addon.name.toLowerCase().includes('g2');
      } else if (testType === 'G2') {
        return addon.name.toLowerCase().includes('of g2');
      }
      
      return false;
    });
    
    return lessonAddon || null;
  };
  
  // Set current step - FIXED: No dependencies to prevent infinite renders
  useEffect(() => {
    setCurrentStep(3);
  }, [setCurrentStep]);
  
  // Auto-populate user details from authenticated user - FIXED: Proper dependencies
  const hasUpdatedUserDetails = useRef(false);

  useEffect(() => {
    if (isAuthenticated && user && !bookingState.userDetails?.email && !hasUpdatedUserDetails.current) {
      hasUpdatedUserDetails.current = true;
      updateBookingState({
        userDetails: {
          fullName: user.full_name || '',
          email: user.email,
          phone: user.phone_number || ''
        }
      });
    }
  }, [isAuthenticated, user?.email, user?.full_name, user?.phone_number, bookingState.userDetails?.email, updateBookingState]);
  
  // Redirect if necessary fields aren't set
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/book-road-test-vehicle/booking-details");
    }
  }, [isAuthenticated, router]);
  
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
        selectedAddonData: null,
        freeAddOn: null,
        pickupAddress: undefined,
        pickupDistance: undefined
      });
    }
  };
  
  const handlePickupLocationSelect = async (address: string, coordinates: { lat: number; lng: number; }, distance?: number) => {
    console.log('📍 Pickup location selected with distance:', { address, distance });
    
    if (!distance || distance === 0) {
      console.warn('⚠️ No distance provided, skipping pricing calculation');
      return;
    }
    
    // Update booking state with the new pickup information
    updateBookingState({ 
      pickupAddress: address,
      pickupCoordinates: coordinates,
      pickupDistance: distance
    });
    
    // Calculate pickup price based on distance
    const pickupPricingResult = calculatePickupPricing(distance);
    const pickupPriceInCents = pickupPricingResult.pickup_price;
    
    console.log('💰 Calculated pickup pricing:', {
      distance,
      pickupPriceInCents,
      freeBenefits: pickupPricingResult.free_benefits
    });
    
    // Update booking state with pickup price
    updateBookingState({
      pricing: {
        basePrice: bookingState.pricing?.basePrice || 80.00,
        pickupPrice: pickupPriceInCents / 100, // Convert cents to dollars
        addOnPrice: bookingState.pricing?.addOnPrice || 0,
        discounts: bookingState.pricing?.discounts || 0,
        total: (bookingState.pricing?.basePrice || 80.00) + (pickupPriceInCents / 100)
      }
    });
    
    // Check if eligible for free add-ons based on distance
    if (distance >= 100) {
      console.log('🎉 Eligible for free 1-hour lesson');
      updateBookingState({ freeAddOn: 'one-hour-lesson' });
    } else if (distance >= 50) {
      console.log('🎉 Eligible for free 30-min lesson');
      updateBookingState({ freeAddOn: 'thirty-min-lesson' });
    } else {
      console.log('❌ Not eligible for free lessons');
      updateBookingState({ freeAddOn: null });
    }
  };
  
  // FIXED: handleSelectAddOn with proper mutual exclusion
  const handleSelectAddOn = (type: AddOnType) => {
    console.log('🎯 Add-on selection:', { type, currentSelection: selectedAddOn, freeAddOn: bookingState.freeAddOn });
    
    // Check if there's a free add-on and prevent selecting paid version of same service
    if (bookingState.freeAddOn === 'one-hour-lesson' && type === 'driving-lesson') {
      // Don't allow selection if already getting a free 1-hour lesson
      alert("You already qualify for a free 1-hour driving lesson!");
      return;
    }
    
    // FIXED: Toggle logic - if same type is selected, deselect it, otherwise select new type
    const newAddOn = type === selectedAddOn ? null : type;
    
    console.log('✅ Setting new add-on:', newAddOn);
    
    // Update local state
    setSelectedAddOn(newAddOn);
    
    // Get addon data for API integration
    let addonData = null;
    if (newAddOn === 'mock-test') {
      addonData = getMockTestAddon();
    } else if (newAddOn === 'driving-lesson') {
      addonData = getDrivingLessonAddon();
    }
    
    // Update booking state
    updateBookingState({ 
      selectedAddOn: newAddOn,
      selectedAddonData: addonData
    });
    
    console.log('🔄 Updated booking state with add-on:', { newAddOn, addonData });
  };
  
  const handleApplyPromo = (code: string) => {
    updateBookingState({ couponCode: code });
  };
  
  const handleContinue = () => {
    // Ensure document URLs are saved for API submission
    if (roadTestDocUrl && licenseDocUrl) {
      updateBookingState({
        documents: {
          ...bookingState.documents,
          roadTestFile: roadTestDocUrl,
          licenseFile: licenseDocUrl
        }
      });
    }
    
    setCurrentStep(4);
    router.push("/book-road-test-vehicle/payment");
  };
  
  // Handle road test document upload
  const handleRoadTestFileSelect = async (file: File) => {
    try {
      resetRoadTestUpload();
      const result = await uploadRoadTestDoc(file, 'g2', 'Road test booking confirmation');
      
      if (result.success && result.data) {
        const uploadedUrl = result.data.url;
        setRoadTestDocUrl(uploadedUrl);
        
        // Update booking state with both URL and file metadata
        updateBookingState({
          documents: {
            ...bookingState.documents,
            roadTestFile: uploadedUrl,
            roadTestFileMetadata: {
              originalName: result.data.originalName || file.name,
              size: file.size,
              filename: result.data.filename
            }
          }
        });
      }
    } catch (error) {
      console.error('Road test document upload failed:', error);
    }
  };
  
  // Handle license document upload
  const handleLicenseFileSelect = async (file: File) => {
    try {
      resetLicenseUpload();
      const result = await uploadLicenseDoc(file, 'license', 'G1 license document');
      
      if (result.success && result.data) {
        const uploadedUrl = result.data.url;
        setLicenseDocUrl(uploadedUrl);
        
        // Update booking state with both URL and file metadata
        updateBookingState({
          documents: {
            ...bookingState.documents,
            licenseFile: uploadedUrl,
            licenseFileMetadata: {
              originalName: result.data.originalName || file.name,
              size: file.size,
              filename: result.data.filename
            }
          }
        });
      }
    } catch (error) {
      console.error('License document upload failed:', error);
    }
  };
  
  // Create formatted start date
  const formattedStartDate = bookingState.testDate && bookingState.testTime
    ? `${bookingState.testDate} at ${bookingState.testTime}`
    : "Monday, April 7, 2025 at 10:00 am";

  // Helper function to check free add-on type
  const hasFreeOneHourLesson = bookingState.freeAddOn === 'one-hour-lesson';
  const hasFreeThirtyMinLesson = bookingState.freeAddOn === 'thirty-min-lesson';
  
  // Get display values for TestSummary
  const displayTestCentre = typeof bookingState.testCenter === 'string' 
    ? bookingState.testCenter 
    : bookingState.testCenter?.name || "Test center";
  const displayTestCentreAddress = bookingState.testCenterAddress || "Address to be confirmed";
  
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
              description={
                isUploadingRoadTest 
                  ? "Uploading..." 
                  : roadTestUploadError 
                    ? `Error: ${roadTestUploadError}` 
                    : roadTestUploadSuccess || roadTestDocUrl
                      ? `✅ Uploaded: ${bookingState.documents?.roadTestFileMetadata?.originalName || "Document uploaded"}` 
                      : "PNG, JPG, PDF or TXT file"
              }
              actionText={
                isUploadingRoadTest 
                  ? "Uploading..." 
                  : roadTestDocUrl 
                    ? "Change Document" 
                    : "Upload Your Road Test Documents"
              }
              icon={<FileText className="h-4 w-4 text-gray-600" />}
              onFileSelect={handleRoadTestFileSelect}
            />
            
            <DocumentUpload
              title="Upload Your Ontario License"
              description={
                isUploadingLicense 
                  ? "Uploading..." 
                  : licenseUploadError 
                    ? `Error: ${licenseUploadError}` 
                    : licenseUploadSuccess || licenseDocUrl
                      ? `✅ Uploaded: ${bookingState.documents?.licenseFileMetadata?.originalName || "Document uploaded"}` 
                      : "PNG, JPG, PDF or TXT file"
              }
              actionText={
                isUploadingLicense 
                  ? "Uploading..." 
                  : licenseDocUrl 
                    ? "Change Document" 
                    : "Upload Your License"
              }
              icon={<CreditCard className="h-4 w-4 text-gray-600" />}
              onFileSelect={handleLicenseFileSelect}
            />
          </div>
          
          {/* Location Selection */}
          <LocationSelection
            selectedOption={locationOption}
            onOptionChange={handleLocationChange}
            onPickupLocationSelect={handlePickupLocationSelect}
            testCenterCoordinates={
              testCenters.length > 0 && bookingState.testCenter
                ? testCenters.find(c => 
                    c.id === bookingState.testCenterId || 
                    c.name === (typeof bookingState.testCenter === 'string' ? bookingState.testCenter : bookingState.testCenter?.name)
                  ) 
                  ? { 
                      lat: testCenters.find(c => 
                        c.id === bookingState.testCenterId || 
                        c.name === (typeof bookingState.testCenter === 'string' ? bookingState.testCenter : bookingState.testCenter?.name)
                      )!.lat, 
                      lng: testCenters.find(c => 
                        c.id === bookingState.testCenterId || 
                        c.name === (typeof bookingState.testCenter === 'string' ? bookingState.testCenter : bookingState.testCenter?.name)
                      )!.lng 
                    }
                  : undefined
                : undefined
            }
          />

          <Separator className="mb-8" />
          
          {/* FIXED: Add-on Selection Logic with Proper Mutual Exclusion */}
          
          {/* Case 1: User has free 1-hour lesson and has NOT selected any paid upgrade */}
          {hasFreeOneHourLesson && !selectedAddOn && (
            <div className="mb-8 bg-green-50 border border-green-200 rounded-md p-4">
              <h3 className="font-medium text-[#0C8B44] mb-2">🎉 Free 1-hour Driving Lesson</h3>
              <p className="text-sm text-gray-700 mb-3">
                Congratulations! You qualify for a free 1-hour driving lesson before your test due to your pickup distance.
              </p>
              
              <DrivingLessonCard
                duration="1 hour"
                description="One-on-one practice session with a professional instructor before your test"
                isSelected={true}
                onSelect={() => {}}
              />
              
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Upgrade Options:</p>
                <button 
                  onClick={() => handleSelectAddOn('mock-test')}
                  className="block w-full text-left p-3 border border-gray-300 rounded-md text-sm hover:border-[#0C8B44] hover:bg-green-50 transition-colors"
                >
                  <span className="font-medium">Upgrade to mock test</span>
                  <span className="text-xs text-gray-600 block mt-1">
                    Pay only $4.99 more for a complete mock test (Upgrade from free 1-hour lesson)
                  </span>
                </button>
              </div>
            </div>
          )}
          
          {/* Case 2: User has free 1-hour lesson and has selected mock test upgrade */}
          {hasFreeOneHourLesson && selectedAddOn === 'mock-test' && (
            <div className="mb-8">
              <MockTestCard 
                isAdded={true} 
                onAdd={() => handleSelectAddOn(null)}
                testType={bookingState.testType as any}
                addon={getMockTestAddon()}
                isLoading={isLoadingAddons}
              />
            </div>
          )}
          
          {/* Case 3: User has free 30-min lesson and has NOT selected any paid upgrade */}
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
          
          {/* Case 4: User has free 30-min lesson and has selected 1-hour lesson upgrade */}
          {hasFreeThirtyMinLesson && selectedAddOn === 'driving-lesson' && (
            <div className="mb-8">
              <DrivingLessonCard
                duration="1 hour"
                description="One-on-one practice session with a professional instructor before your test"
                isSelected={true}
                onSelect={() => handleSelectAddOn(null)}
              />
            </div>
          )}
          
          {/* Case 5: User has free 30-min lesson and has selected mock test upgrade */}
          {hasFreeThirtyMinLesson && selectedAddOn === 'mock-test' && (
            <div className="mb-8">
              <MockTestCard 
                isAdded={true} 
                onAdd={() => handleSelectAddOn(null)}
                testType={bookingState.testType as any}
                addon={getMockTestAddon()}
                isLoading={isLoadingAddons}
              />
            </div>
          )}
          
          {/* Case 6: User has NO free lessons - show standard add-on options */}
          {!hasFreeOneHourLesson && !hasFreeThirtyMinLesson && (
            <>
              {/* Show mock test if not selected */}
              {selectedAddOn !== "mock-test" && (
                <div className="mb-8">
                  <MockTestCard 
                    onAdd={() => handleSelectAddOn('mock-test')}
                    testType={bookingState.testType as any}
                    addon={getMockTestAddon()}
                    isLoading={isLoadingAddons}
                  />
                </div>
              )}
              
              {/* Show mock test confirmation if selected */}
              {selectedAddOn === 'mock-test' && (
                <div className="mb-8">
                  <MockTestCard 
                    isAdded={true} 
                    onAdd={() => handleSelectAddOn(null)}
                    testType={bookingState.testType as any}
                    addon={getMockTestAddon()}
                    isLoading={isLoadingAddons}
                  />
                </div>
              )}
              
              {/* Show driving lesson if not selected */}
              {selectedAddOn !== "driving-lesson" && (
                <div className="mb-8">
                  <DrivingLessonCard
                    duration="1 hour"
                    description="One-on-one practice session with a professional instructor before your test"
                    isSelected={false}
                    onSelect={() => handleSelectAddOn('driving-lesson')}
                  />
                </div>
              )}
              
              {/* Show driving lesson confirmation if selected */}
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
          
          {/* Bottom Additional Benefits */}
          <PickupOptions />
          
          {/* Continue Button */}
          <div className="mb-8">
            <button
              onClick={handleContinue}
              disabled={isUploadingRoadTest || isUploadingLicense}
              className="w-full py-3 bg-[#0C8B44] hover:bg-[#0A7A3C] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-md font-medium transition-colors"
            >
              {(isUploadingRoadTest || isUploadingLicense) ? 'Uploading...' : 'Continue'}
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
            testCentre={displayTestCentre}
            testCentreAddress={displayTestCentreAddress}
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