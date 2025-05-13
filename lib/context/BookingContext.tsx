"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';

// Define types for our booking state
export interface BookingState {
  testType: 'G2' | 'G' | '';
  testCenter: string;
  testCenterId: string;
  testCenterAddress: string;
  testDate: string;
  testTime: string;
  // Additional fields for form state
  userDetails?: {
    fullName?: string;
    email?: string;
    phone?: string;
  };
  locationOption?: 'test-centre' | 'pickup';
  pickupAddress?: string;
  pickupDistance?: number;
  selectedAddOn?: 'mock-test' | 'driving-lesson' | null;
  freeAddOn?: 'thirty-min-lesson' | 'one-hour-lesson' | null;
  documents?: {
    roadTestFile?: string;
    licenseFile?: string;
  };
  pricing?: {
    basePrice: number;
    pickupPrice: number;
    addOnPrice: number;
    discounts: number;
    total: number;
  };
}

// Define the context type
interface BookingContextType {
  bookingState: BookingState;
  updateBookingState: (updates: Partial<BookingState>) => void;
  resetBookingState: () => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  calculatePricing: () => void;
}

// Create the initial state
const initialState: BookingState = {
  testType: '',
  testCenter: '',
  testCenterId: '',
  testCenterAddress: '',
  testDate: '',
  testTime: '',
  locationOption: 'test-centre',
  selectedAddOn: null,
  freeAddOn: null,
  pricing: {
    basePrice: 80.00, // Default base price
    pickupPrice: 0,
    addOnPrice: 0,
    discounts: 0,
    total: 80.00
  }
};

// Create the context
const BookingContext = createContext<BookingContextType | undefined>(undefined);

// Create a provider component
export function BookingProvider({ children }: { children: ReactNode }) {
  // Load state from localStorage if available
  const [bookingState, setBookingState] = useState<BookingState>(initialState);
  const [currentStep, setCurrentStep] = useState<number>(1); // Track current step
  
  // Use a ref to prevent calculation loops
  const calculatingPricing = useRef(false);
  
  // Load saved state from localStorage on initial render
  useEffect(() => {
    const savedState = localStorage.getItem('bookingState');
    const savedStep = localStorage.getItem('currentStep');
    
    if (savedState) {
      try {
        setBookingState(JSON.parse(savedState));
      } catch (e) {
        console.error('Failed to parse saved booking state:', e);
      }
    }
    
    if (savedStep) {
      try {
        setCurrentStep(parseInt(savedStep, 10));
      } catch (e) {
        console.error('Failed to parse saved step:', e);
      }
    }
  }, []);
  
  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('bookingState', JSON.stringify(bookingState));
    localStorage.setItem('currentStep', currentStep.toString());
  }, [bookingState, currentStep]);

  // Update the state without triggering recalculations
  const updateStateWithoutRecalculation = (updates: Partial<BookingState>) => {
    setBookingState(prevState => ({
      ...prevState,
      ...updates
    }));
  };

  // Calculate pricing based on current booking state
  const calculatePricing = () => {
    // Prevent calculation loops
    if (calculatingPricing.current) {
      return;
    }
    
    calculatingPricing.current = true;
    
    // Create a new pricing object
    const pricing = {
      basePrice: 80.00, // Default base price
      pickupPrice: 0,
      addOnPrice: 0,
      discounts: 0,
      total: 80.00
    };
    
    // Set base price for road test
    pricing.basePrice = 80.00;
    
    // Calculate pickup price based on distance
    if (bookingState.locationOption === 'pickup' && bookingState.pickupDistance) {
      const distance = bookingState.pickupDistance;
      
      if (distance <= 50) {
        // $1/km for first 50km
        pricing.pickupPrice = distance * 1.00;
      } else {
        // $1/km for first 50km + $0.50/km for additional
        pricing.pickupPrice = 50 * 1.00 + (distance - 50) * 0.50;
      }
      
      // Round to 2 decimal places
      pricing.pickupPrice = parseFloat(pricing.pickupPrice.toFixed(2));
    } else {
      pricing.pickupPrice = 0;
    }
    
    // Calculate add-on price
    if (bookingState.selectedAddOn === 'mock-test') {
      pricing.addOnPrice = bookingState.testType === 'G2' ? 54.99 : 64.99;
    } else if (bookingState.selectedAddOn === 'driving-lesson') {
      pricing.addOnPrice = bookingState.testType === 'G2' ? 50.00 : 60.00;
    } else {
      pricing.addOnPrice = 0;
    }
    
    // Apply free dropoff for distances over 50km
    if (bookingState.locationOption === 'pickup' && bookingState.pickupDistance && bookingState.pickupDistance > 50) {
      // Free dropoff is considered a discount on the pickup price
      // We'll discount 50% of the pickup price for dropoff
      pricing.discounts = pricing.pickupPrice / 2;
    }
    
    // Calculate total
    pricing.total = pricing.basePrice + pricing.pickupPrice + pricing.addOnPrice - pricing.discounts;
    
    // Round to 2 decimal places
    pricing.total = parseFloat(pricing.total.toFixed(2));
    
    // Check if pricing has changed before updating
    const currentPricing = bookingState.pricing || initialState.pricing;
    if (
      currentPricing?.basePrice !== pricing.basePrice ||
      currentPricing?.pickupPrice !== pricing.pickupPrice ||
      currentPricing?.addOnPrice !== pricing.addOnPrice ||
      currentPricing?.discounts !== pricing.discounts ||
      currentPricing?.total !== pricing.total
    ) {
      // Only update if pricing has changed
      updateStateWithoutRecalculation({ pricing });
    }
    
    calculatingPricing.current = false;
  };

  // Update booking state with additional logic for location options and free add-ons
  const updateBookingState = (updates: Partial<BookingState>) => {
    setBookingState(prevState => {
      const newState = {
        ...prevState,
        ...updates,
      };
      
      // If updating location option, reset pickup-related fields if changing to test-centre
      if (updates.locationOption === 'test-centre') {
        newState.pickupAddress = undefined;
        newState.pickupDistance = undefined;
        newState.freeAddOn = null;
      }
      
      // If updating pickup distance, check if eligible for free lesson
      if (updates.pickupDistance !== undefined) {
        if (updates.pickupDistance >= 100) {
          newState.freeAddOn = 'one-hour-lesson';
        } else if (updates.pickupDistance >= 50) {
          newState.freeAddOn = 'thirty-min-lesson';
        } else {
          newState.freeAddOn = null;
        }
      }
      
      return newState;
    });
  };

  const resetBookingState = () => {
    setBookingState(initialState);
    setCurrentStep(1);
    localStorage.removeItem('bookingState');
    localStorage.removeItem('currentStep');
  };

  return (
    <BookingContext.Provider 
      value={{ 
        bookingState, 
        updateBookingState, 
        resetBookingState,
        currentStep,
        setCurrentStep,
        calculatePricing
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

// Create a custom hook to use the booking context
export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}