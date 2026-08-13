// lib/context/BookingContext.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect, useRef, useCallback } from 'react';
import { useDriveTestCenters, useAddons, useBookingCreation } from '@/lib/hooks/useBooking';
import { getFriendlyErrorMessage } from '@/lib/utils/error-messages';
import {
  findThirtyMinuteLesson,
  previewBookingPrice,
  type BookingPricePreview,
} from '@/lib/pricing/calculate';
import {
  getPricingConfig,
  PRICING_CONFIG_FALLBACK,
  type PricingConfig,
} from '@/lib/pricing/config';
import type {
  DriveTestCenter,
  Addon,
  CreateBookingRequest,
  TestType
} from '@/lib/types/booking.types';

// File metadata interface for uploaded documents
export interface FileMetadata {
  originalName: string;
  size: number;
  filename: string;
}

// Enhanced booking state that aligns with API requirements
export interface BookingState {
  // Step 1: Road Test Details
  testType: TestType | '';
  testCenter: DriveTestCenter | null;
  testCenterId: string | number;
  testCenterAddress: string;
  testDate: string;
  testTime: string;
  
  // Step 2: Booking Details
  userDetails?: {
    fullName?: string;
    email?: string;
    phone?: string;
  };
  locationOption?: 'test-centre' | 'pickup';
  pickupAddress?: string;
  pickupDistance?: number;
  pickupCoordinates?: { lat: number; lng: number; }; 
  
  // Step 3: Test Details & Add-ons
  selectedAddOn?: 'mock-test' | 'driving-lesson' | null;
  selectedAddonData?: Addon | null; // Store the actual addon data from API
  documents?: {
    roadTestFile?: string;
    licenseFile?: string;
    roadTestFileMetadata?: FileMetadata;
    licenseFileMetadata?: FileMetadata;
  };

  // Step 4: Payment
  couponCode?: string;

  /**
   * Display-only price preview, in integer cents, mirroring the server engine.
   *
   * NOT the amount charged — the server recomputes everything on create. Read
   * `total_price` off the created booking for that.
   */
  pricePreview?: BookingPricePreview;

  // Booking creation state
  isCreatingBooking?: boolean;
  createdBooking?: any;
  bookingError?: string;
}

// Enhanced context type with API integration
interface BookingContextType {
  bookingState: BookingState;
  updateBookingState: (updates: Partial<BookingState>) => void;
  resetBookingState: () => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  calculatePricing: () => void;

  // API integration methods
  createBooking: () => Promise<{ success: boolean; data?: any; error?: string }>;
  validateBookingData: () => { isValid: boolean; errors: string[] };
  transformToApiFormat: () => CreateBookingRequest | null;

  // Real-time data from APIs
  testCenters: DriveTestCenter[];
  addons: Addon[];
  isLoadingCenters: boolean;
  isLoadingAddons: boolean;

  /** Pickup fare tiers from GET /pricing-config. Never hardcode these. */
  pricingConfig: PricingConfig;

  // Refetch method - call after authentication
  refetchBookingData: () => void;
}

// Create the initial state
const initialState: BookingState = {
  testType: '',
  testCenter: null,
  testCenterId: '',
  testCenterAddress: '',
  testDate: '',
  testTime: '',
  locationOption: 'test-centre',
  selectedAddOn: null,
  selectedAddonData: null,
  // No seeded price. There is no such thing as a default base fare — it comes
  // from the selected test centre. Seeding one meant a failed centre lookup
  // silently quoted $80 instead of showing nothing.
  pricePreview: undefined,
};

// Create the context
const BookingContext = createContext<BookingContextType | undefined>(undefined);

// Create a provider component
export function BookingProvider({ children }: { children: ReactNode }) {
  // Load state from localStorage if available
  const [bookingState, setBookingState] = useState<BookingState>(initialState);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const isInitialized = useRef(false);

  // API hooks for real-time data
  // Test centers: Enabled on Step 1 (needed for dropdown)
  // Addons: Disabled initially, only fetch on Step 3 or after auth
  const { centers: testCenters, loading: isLoadingCenters, refetch: refetchCenters } = useDriveTestCenters(true);
  const { addons, loading: isLoadingAddons, refetch: refetchAddons } = useAddons(undefined, false);
  const { createBooking: apiCreateBooking } = useBookingCreation();

  // Pickup fare tiers, served by the backend. Starts on the same fallback the
  // server itself uses so the first render has something sane, then swaps to
  // the live values. Fetched once per provider mount.
  const [pricingConfig, setPricingConfig] = useState<PricingConfig>(
    PRICING_CONFIG_FALLBACK
  );

  useEffect(() => {
    let active = true;

    getPricingConfig().then((config) => {
      if (active) setPricingConfig(config);
    });

    return () => {
      active = false;
    };
  }, []);

  // Method to refetch all booking data (call after authentication or on Step 3)
  const refetchBookingData = useCallback(() => {
    console.log('🔄 Refetching booking data after authentication...');
    refetchCenters();
    refetchAddons();
  }, [refetchCenters, refetchAddons]);

  // Load state from localStorage on client-side
  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialized.current) {
      try {
        const savedState = localStorage.getItem('bookingState');
        if (savedState) {
          const parsedState = JSON.parse(savedState);
          setBookingState({ ...initialState, ...parsedState });
        }
        
        const savedStep = localStorage.getItem('currentStep');
        if (savedStep) {
          setCurrentStep(parseInt(savedStep, 10));
        }
      } catch (error) {
        console.error('Error loading booking state from localStorage:', error);
      } finally {
        isInitialized.current = true;
      }
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized.current && typeof window !== 'undefined') {
      try {
        localStorage.setItem('bookingState', JSON.stringify(bookingState));
      } catch (error) {
        console.error('Error saving booking state to localStorage:', error);
      }
    }
  }, [bookingState]);

  // Save current step to localStorage
  useEffect(() => {
    if (isInitialized.current && typeof window !== 'undefined') {
      try {
        localStorage.setItem('currentStep', currentStep.toString());
      } catch (error) {
        console.error('Error saving current step to localStorage:', error);
      }
    }
  }, [currentStep]);

  const updateBookingState = useCallback((updates: Partial<BookingState>) => {
    setBookingState(prevState => ({ ...prevState, ...updates }));
  }, []);

  // Function to reset booking state
  const resetBookingState = () => {
    setBookingState(initialState);
    setCurrentStep(1);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bookingState');
      localStorage.removeItem('currentStep');
    }
  };

  /**
   * Recompute the display-only price preview.
   *
   * Every input is server-supplied: the fare tiers from GET /pricing-config,
   * the base fare from the selected centre, add-on prices (including the
   * 30-minute lesson the long-trip concession credits back) from GET /addons,
   * and the distance from POST /bookings/calculate-distance.
   */
  const calculatePricing = useCallback(() => {
    const { testCenter, pickupDistance, locationOption, selectedAddonData, testType } = bookingState;

    if (!testCenter) return;

    try {
      const meetAtCenter = locationOption === 'test-centre';

      const preview = previewBookingPrice({
        config: pricingConfig,
        centerBasePrice: testCenter.base_price,
        distanceKm: pickupDistance,
        meetAtCenter,
        selectedAddon: selectedAddonData,
        thirtyMinuteLesson: testType
          ? findThirtyMinuteLesson(addons, testType)
          : null,
      });

      updateBookingState({ pricePreview: preview });
    } catch (error) {
      console.error('Error calculating pricing:', error);
    }
  }, [bookingState, updateBookingState, pricingConfig, addons]);

  // Transform booking state to API format
  const transformToApiFormat = (): CreateBookingRequest | null => {
    const {
      testCenter,
      testType,
      testDate,
      testTime,
      locationOption,
      pickupAddress,
      pickupCoordinates,
      pickupDistance,
      selectedAddonData,
      documents,
      pricePreview,
      couponCode
    } = bookingState;

    if (!testCenter || !testType || !testDate || !testTime || !documents?.roadTestFile || !documents?.licenseFile || !pricePreview) {
      return null;
    }

    // Format datetime for API: "YYYY-MM-DD HH:mm:ss"
    // const formattedDateTime = `${testDate} ${testTime}:00`;
const formattedDateTime = (() => {
  // Create a proper datetime by combining date and time
  const dateTimeString = `${testDate}T${testTime}:00`;
  const dateObj = new Date(dateTimeString);
  
  // Validate the date is at least 2 days from now
  const now = new Date();
  const twoDaysFromNow = new Date(now.getTime() + (2 * 24 * 60 * 60 * 1000));
  
  if (dateObj < twoDaysFromNow) {
    throw new Error('Test date must be at least 2 days from today');
  }
  
  // Format as YYYY-MM-DD HH:mm:ss for API
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:00`;
})();
    const meetAtCenter = locationOption === 'test-centre';

    return {
      test_center_id: typeof testCenter.id === 'string' ? parseInt(testCenter.id) : testCenter.id,
      road_test_doc_url: documents.roadTestFile,
      g1_license_doc_url: documents.licenseFile,
      test_type: testType as TestType,
      test_date: formattedDateTime,
      meet_at_center: meetAtCenter,
      pickup_address: meetAtCenter ? undefined : pickupAddress,
      pickup_latitude: meetAtCenter ? undefined : pickupCoordinates?.lat,
      pickup_longitude: meetAtCenter ? undefined : pickupCoordinates?.lng,
      pickup_distance: meetAtCenter ? undefined : pickupDistance,
      // The DTO marks these @IsNotEmpty(), so the request fails validation
      // without them — but BookingsService.create() recomputes and overwrites
      // all of them before insert. They satisfy validation; they do not set the
      // price. The coupon is applied server-side from `coupon_code`.
      base_price: pricePreview.basePrice,
      pickup_price: pricePreview.pickupPrice,
      addon_id: selectedAddonData?.id,
      total_price: pricePreview.total,
      coupon_code: couponCode,
      timezone: 'America/Toronto' // Default timezone for Ontario
    };
  };

  // Validate booking data before submission
  const validateBookingData = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const { testCenter, testType, testDate, testTime, documents, userDetails } = bookingState;

    if (!testType) errors.push('Test type is required');
    if (!testCenter) errors.push('Test center is required');
    if (!testDate) errors.push('Test date is required');
    if (!testTime) errors.push('Test time is required');
    if (!documents?.roadTestFile) errors.push('Road test document is required');
    if (!documents?.licenseFile) errors.push('G1 license document is required');
    if (!userDetails?.email) errors.push('Email is required');
    if (!userDetails?.fullName) errors.push('Full name is required');

    // Validate pickup details if pickup option is selected
    if (bookingState.locationOption === 'pickup') {
      if (!bookingState.pickupAddress) errors.push('Pickup address is required');
      if (!bookingState.pickupCoordinates) errors.push('Pickup coordinates are required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // Create booking with API integration
  const createBooking = async (): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      // Validate data first
      const validation = validateBookingData();
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      // Transform to API format
      const apiData = transformToApiFormat();
      if (!apiData) {
        return {
          success: false,
          error: 'Failed to prepare booking data'
        };
      }

      updateBookingState({ isCreatingBooking: true, bookingError: undefined });

      // Call API
      const result = await apiCreateBooking(apiData);

      if (result.success && result.data) {
        updateBookingState({
          isCreatingBooking: false,
          createdBooking: result.data,
          bookingError: undefined
        });
        
        return {
          success: true,
          data: result.data
        };
      } else {
        const errorMessage = getFriendlyErrorMessage(result.error, "We couldn't create your booking. Please try again.");
        updateBookingState({
          isCreatingBooking: false,
          bookingError: errorMessage
        });
        
        return {
          success: false,
          error: errorMessage
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
      updateBookingState({
        isCreatingBooking: false,
        bookingError: errorMessage
      });
      
      return {
        success: false,
        error: errorMessage
      };
    }
  };

  const value: BookingContextType = {
    bookingState,
    updateBookingState,
    resetBookingState,
    currentStep,
    setCurrentStep,
    calculatePricing,
    createBooking,
    validateBookingData,
    transformToApiFormat,
    testCenters,
    addons,
    isLoadingCenters,
    isLoadingAddons,
    pricingConfig,
    refetchBookingData
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
}

// Custom hook to use the booking context
export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}