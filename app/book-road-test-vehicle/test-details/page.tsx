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
import { addonsForTestType, findThirtyMinuteLesson } from "@/lib/pricing/calculate";
import { formatPrice } from "@/lib/types/booking.types";
import PickupOptions from "@/components/booking/PickupOptions";
import { useFileUpload } from "@/lib/hooks/useFileUpload";

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
    testCenters,
    calculatePricing,
    pricingConfig
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
  
  // Add-ons available for this booking's test type, filtered by `type` — the
  // field the server keys off — rather than by matching words in the name.
  const availableAddons = bookingState.testType
    ? addonsForTestType(addons, bookingState.testType)
    : [];

  // The mock test for this test type. Both mock tests and lessons are seeded
  // under LESSON_G / LESSON_G2, so the name is what separates them within a
  // type; `duration: null` also distinguishes mock tests from lessons.
  const getMockTestAddon = () =>
    availableAddons.find(addon => addon.name.toLowerCase().startsWith('mock test')) ?? null;

  // The 1-hour lesson for this test type.
  const getDrivingLessonAddon = () =>
    availableAddons.find(addon => addon.name.toLowerCase().startsWith('1 hour lesson')) ?? null;


  // Use ref to track pricing calculation
  const lastPricingStateRef = useRef<string>('');

  // Set current step - FIXED: No dependencies to prevent infinite renders
  useEffect(() => {
    setCurrentStep(3);
  }, [setCurrentStep]);

  // Recalculate pricing when relevant primitive values change
  useEffect(() => {
    // Create a stable key from primitive values only.
    //
    // The fare tiers and the add-on catalogue are part of this key because both
    // arrive asynchronously: GET /pricing-config resolves after the initial
    // render (until then we're on the server's fallback tiers) and GET /addons
    // is not fetched until Step 3. Without them the guard below would keep the
    // first preview and never pick up the real config or the 30-minute lesson
    // that the long-trip credit is derived from.
    const pricingKey = JSON.stringify({
      testCenterId: bookingState.testCenterId,
      pickupDistance: bookingState.pickupDistance,
      locationOption: bookingState.locationOption,
      selectedAddOn: bookingState.selectedAddOn,
      couponCode: bookingState.couponCode,
      addonId: bookingState.selectedAddonData?.id,
      pricingConfig,
      addonCount: addons.length
    });

    // Only recalculate if the key has changed
    if (pricingKey !== lastPricingStateRef.current) {
      lastPricingStateRef.current = pricingKey;
      if (calculatePricing) {
        calculatePricing();
      }
    }
  }, [
    bookingState.testCenterId,
    bookingState.pickupDistance,
    bookingState.locationOption,
    bookingState.selectedAddOn,
    bookingState.couponCode,
    bookingState.selectedAddonData?.id,
    pricingConfig,
    addons,
    calculatePricing
  ]);

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
  }, [isAuthenticated, user, bookingState.userDetails?.email, updateBookingState]);
  
  // Redirect to booking-details if user hasn't completed that step.
  // Skip the redirect while the user is authenticated: they just completed
  // login, and userDetails may not have synced into booking state yet. The
  // auto-populate effect above fills it from the authoritative `user` object.
  // Without this guard, a freshly-logged-in user bounces back on their first
  // click before the details land.
  useEffect(() => {
    if (!isAuthenticated && !bookingState.userDetails?.email) {
      // User hasn't completed the booking-details step, redirect them there
      router.push("/book-road-test-vehicle/booking-details");
    }
  }, [isAuthenticated, bookingState.userDetails?.email, router]);
  
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
    
    // Record the pickup. Pricing is derived from this by the effect below, via
    // the shared engine in lib/pricing — this handler no longer computes money.
    updateBookingState({
      pickupAddress: address,
      pickupCoordinates: coordinates,
      pickupDistance: distance
    });
  };

  const handleSelectAddOn = (type: AddOnType) => {
    // Toggle: selecting the current add-on again clears it.
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

  // Long-trip credit eligibility, derived entirely from server data: the
  // threshold from GET /pricing-config and the credited lesson from GET /addons.
  // Mirrors the server's `distance > baseDistance` (strict) comparison.
  const thirtyMinuteLesson = bookingState.testType
    ? findThirtyMinuteLesson(addons, bookingState.testType)
    : null;
  const pickupDistanceKm =
    locationOption === 'pickup' ? (bookingState.pickupDistance ?? 0) : 0;
  const qualifiesForLongTripCredit =
    pickupDistanceKm > pricingConfig.baseDistance && !!thirtyMinuteLesson;

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
          
          {/* Long-trip credit.
              The server credits the price of the matching 30-minute lesson off
              any add-on when the pickup is beyond base_distance. Both the
              threshold and the credit amount come from the server — the tiers
              from GET /pricing-config and the lesson price from GET /addons —
              so this copy cannot drift from what is actually charged. */}
          {qualifiesForLongTripCredit && (
            <div className="mb-8 bg-green-50 border border-green-200 rounded-md p-4">
              <h3 className="font-medium text-[#0C8B44] mb-1">
                Long-trip credit: {formatPrice(thirtyMinuteLesson!.price)} off any add-on
              </h3>
              <p className="text-sm text-gray-700">
                {selectedAddOn
                  ? `Your pickup is ${pickupDistanceKm.toFixed(1)} km, past the ${pricingConfig.baseDistance} km mark, so we've taken ${formatPrice(thirtyMinuteLesson!.price)} off your add-on.`
                  : `Your pickup is ${pickupDistanceKm.toFixed(1)} km, past the ${pricingConfig.baseDistance} km mark. Add a lesson or mock test below and we'll take ${formatPrice(thirtyMinuteLesson!.price)} off it.`}
              </p>
            </div>
          )}

          {/* Add-ons. Mutually exclusive — picking one replaces the other, and
              picking the current one clears it. */}
          <div className="mb-8">
            <MockTestCard
              isAdded={selectedAddOn === 'mock-test'}
              onAdd={() => handleSelectAddOn('mock-test')}
              testType={bookingState.testType || undefined}
              addon={getMockTestAddon()}
              isLoading={isLoadingAddons}
            />
          </div>

          <div className="mb-8">
            <DrivingLessonCard
              duration="1 hour"
              description="One-on-one practice session with a professional instructor before your test"
              isSelected={selectedAddOn === 'driving-lesson'}
              onSelect={() => handleSelectAddOn('driving-lesson')}
            />
          </div>

          
          {/* Document Uploads.
              Deliberately below the pickup / meet-at-centre choice and the
              add-ons: those drive pricing and are the decisions users come to
              this step to make, so they lead. */}
          <div className="mb-8">
            <DocumentUpload
              title="Upload Your G2/G Road Test Booking Confirmation"
              description="PNG, JPG, PDF or TXT file"
              actionText={roadTestDocUrl ? "Change Document" : "Upload Your Road Test Documents"}
              icon={<FileText className="h-4 w-4 text-gray-600" />}
              onFileSelect={handleRoadTestFileSelect}
              error={roadTestUploadError}
              success={roadTestUploadSuccess}
              isUploading={isUploadingRoadTest}
              maxSizeMB={5}
              existingFile={roadTestDocUrl ? {
                name: bookingState.documents?.roadTestFileMetadata?.originalName || "Road test confirmation",
                size: bookingState.documents?.roadTestFileMetadata?.size,
                url: roadTestDocUrl
              } : undefined}
            />

            <DocumentUpload
              title="Upload Your Ontario License"
              description="PNG, JPG, PDF or TXT file"
              actionText={licenseDocUrl ? "Change Document" : "Upload Your License"}
              icon={<CreditCard className="h-4 w-4 text-gray-600" />}
              onFileSelect={handleLicenseFileSelect}
              error={licenseUploadError}
              success={licenseUploadSuccess}
              isUploading={isUploadingLicense}
              maxSizeMB={5}
              existingFile={licenseDocUrl ? {
                name: bookingState.documents?.licenseFileMetadata?.originalName || "Ontario license",
                size: bookingState.documents?.licenseFileMetadata?.size,
                url: licenseDocUrl
              } : undefined}
            />
          </div>

          <Separator className="mb-8" />

          {/* Bottom Additional Benefits */}
          <PickupOptions />

          {/* Continue Button */}
          <div className="mb-8">
            <button
              onClick={handleContinue}
              disabled={isUploadingRoadTest || isUploadingLicense || !roadTestDocUrl || !licenseDocUrl}
              className="w-full py-3 bg-[#0C8B44] hover:bg-[#0A7A3C] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-md font-medium transition-colors"
            >
              {(isUploadingRoadTest || isUploadingLicense) ? 'Uploading...' : 'Continue'}
            </button>

            {/* Show message if documents are missing */}
            {!roadTestDocUrl || !licenseDocUrl ? (
              <p className="text-sm text-gray-500 text-center mt-2">
                {!roadTestDocUrl && !licenseDocUrl
                  ? "Please upload both required documents to continue"
                  : !roadTestDocUrl
                    ? "Please upload your G2/G Road Test Booking Confirmation"
                    : "Please upload your Ontario License"
                }
              </p>
            ) : null}
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