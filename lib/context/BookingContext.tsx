// lib/context/BookingContext.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect, useRef, useCallback } from 'react';
import { bookingApi } from '@/lib/api';
import { useDriveTestCenters, useAddons, useBookingCreation } from '@/lib/hooks/useBooking';
import type { 
  DriveTestCenter, 
  Addon, 
  Coupon, 
  CreateBookingRequest, 
  PricingBreakdown,
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
  freeAddOn?: 'thirty-min-lesson' | 'one-hour-lesson' | null;
  documents?: {
    roadTestFile?: string;
    licenseFile?: string;
    roadTestFileMetadata?: FileMetadata;
    licenseFileMetadata?: FileMetadata;
  };
  
  // Step 4: Payment
  couponCode?: string;
  appliedCoupon?: Coupon | null;
  pricing?: {
    basePrice: number; // Legacy format for compatibility
    pickupPrice: number;
    addOnPrice: number;
    discounts: number;
    total: number;
  };
  
  // API-compatible pricing breakdown
  apiPricing?: PricingBreakdown;
  
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
  freeAddOn: null,
  pricing: {
    basePrice: 80.00, // Default base price
    pickupPrice: 0,
    addOnPrice: 0,
    discounts: 0,
    total: 80.00
  },
  apiPricing: {
    base_price: 8000, // In cents
    pickup_price: 0,
    addon_price: 0,
    subtotal: 8000,
    discount_amount: 0,
    total_price: 8000
  }
};

// Create the context
const BookingContext = createContext<BookingContextType | undefined>(undefined);

// Create a provider component
export function BookingProvider({ children }: { children: ReactNode }) {
  // Load state from localStorage if available
  const [bookingState, setBookingState] = useState<BookingState>(initialState);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const isInitialized = useRef(false);

  // API hooks for real-time data (FIXED: Use correct hook name)
  const { centers: testCenters, loading: isLoadingCenters } = useDriveTestCenters();
  const { addons, loading: isLoadingAddons } = useAddons();
  const { createBooking: apiCreateBooking } = useBookingCreation();

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

  // Update booking state with API pricing sync
  const updateBookingState = (updates: Partial<BookingState>) => {
    setBookingState(prevState => {
      const newState = { ...prevState, ...updates };
      
      // Sync legacy pricing with API pricing if needed
      if (updates.apiPricing && !updates.pricing) {
        newState.pricing = {
          basePrice: updates.apiPricing.base_price / 100,
          pickupPrice: updates.apiPricing.pickup_price / 100,
          addOnPrice: updates.apiPricing.addon_price / 100,
          discounts: updates.apiPricing.discount_amount / 100,
          total: updates.apiPricing.total_price / 100
        };
      }
      
      return newState;
    });
  };

  // Function to reset booking state
  const resetBookingState = () => {
    setBookingState(initialState);
    setCurrentStep(1);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bookingState');
      localStorage.removeItem('currentStep');
    }
  };

  // Enhanced pricing calculation with API integration
  const calculatePricing = useCallback(() => {
    const { testCenter, pickupDistance, locationOption, selectedAddonData, appliedCoupon } = bookingState;
    
    if (!testCenter) return;

    try {
      const meetAtCenter = locationOption === 'test-centre';
      const basePrice = testCenter.base_price;
      
      const pricingBreakdown = bookingApi.calculatePricingBreakdown({
        basePrice,
        pickupDistance: meetAtCenter ? 0 : (pickupDistance || 0),
        meetAtCenter,
        addon: selectedAddonData,
        coupon: appliedCoupon
      });

      updateBookingState({
        apiPricing: pricingBreakdown,
        pricing: {
          basePrice: basePrice / 100,
          pickupPrice: pricingBreakdown.pickup_price / 100,
          addOnPrice: pricingBreakdown.addon_price / 100,
          discounts: pricingBreakdown.discount_amount / 100,
          total: pricingBreakdown.total_price / 100
        }
      });
    } catch (error) {
      console.error('Error calculating pricing:', error);
    }
  }, [bookingState.testCenter, bookingState.pickupDistance, bookingState.locationOption, bookingState.selectedAddonData, bookingState.appliedCoupon, updateBookingState]);

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
      apiPricing,
      couponCode
    } = bookingState;

    if (!testCenter || !testType || !testDate || !testTime || !documents?.roadTestFile || !documents?.licenseFile || !apiPricing) {
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
      base_price: apiPricing.base_price,
      pickup_price: apiPricing.pickup_price,
      addon_id: selectedAddonData?.id,
      total_price: apiPricing.total_price,
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
        const errorMessage = result.error?.message || 'Failed to create booking';
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
    isLoadingAddons
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