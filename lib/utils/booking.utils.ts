// lib/utils/booking.utils.ts - Utility functions for booking operations

import type {
  TestType,
  BookingStatus,
  TestResult,
  Addon,
  BookingFormData,
  CreateBookingRequest,
  ValidationResult,
  Coordinates
} from '@/lib/types/booking.types';

// Import the booking service for backend distance calculation
import { bookingService } from '@/lib/services/booking.service';

// ============================================================================
// PRICE FORMATTING UTILITIES
// ============================================================================

/**
 * Convert cents to dollars
 */
export const centsToDollars = (cents: number): number => cents / 100;

/**
 * Convert dollars to cents
 */
export const dollarsToCents = (dollars: number): number => Math.round(dollars * 100);

/**
 * Format price value for display
 */
export const formatPriceValue = (cents: number): string => {
  const dollars = centsToDollars(cents);
  return dollars.toLocaleString('en-CA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

/**
 * Format price with currency symbol
 */
export const formatPrice = (cents: number): string => {
  const dollars = centsToDollars(cents);
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(dollars);
};

// ============================================================================
// DATE FORMATTING UTILITIES
// ============================================================================

/**
 * Format date for API (YYYY-MM-DD HH:mm:ss)
 */
export const formatDateForApi = (date: string, time: string): string => {
  return `${date} ${time}:00`;
};

/**
 * Parse API date string to Date object
 */
export const parseApiDate = (dateStr: string): Date => {
  return new Date(dateStr.replace(' ', 'T'));
};

/**
 * Format date for display
 */
export const formatDateForDisplay = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-CA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Format time for display
 */
export const formatTimeForDisplay = (timeStr: string): string => {
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

/**
 * Format date and time for display
 */
export const formatDateTimeForDisplay = (dateStr: string, timeStr: string): string => {
  return `${formatDateForDisplay(dateStr)} at ${formatTimeForDisplay(timeStr)}`;
};

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format
 */
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate postal code format
 */
export const validatePostalCode = (postalCode: string): boolean => {
  const canadianPostalRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
  return canadianPostalRegex.test(postalCode);
};

/**
 * Validate booking form data
 */
export const validateBookingForm = (formData: BookingFormData): ValidationResult => {
  const errors: Record<string, string> = {};

  // Step 1 validation
  if (!formData.testType) {
    errors.testType = 'Test type is required';
  }
  if (!formData.testCenter) {
    errors.testCenter = 'Test center selection is required';
  }

  // Step 2 validation
  if (!formData.testDate) {
    errors.testDate = 'Test date is required';
  }
  if (!formData.testTime) {
    errors.testTime = 'Test time is required';
  }
  if (!formData.meetAtCenter && !formData.pickupAddress) {
    errors.pickupAddress = 'Pickup address is required when not meeting at center';
  }

  // Step 3 validation
  if (!formData.contactInfo.fullName) {
    errors.fullName = 'Full name is required';
  }
  if (!formData.contactInfo.email || !validateEmail(formData.contactInfo.email)) {
    errors.email = 'Valid email is required';
  }
  if (!formData.contactInfo.phone || !validatePhone(formData.contactInfo.phone)) {
    errors.phone = 'Valid phone number is required';
  }
  if (!formData.documents.roadTestDocUrl) {
    errors.roadTestDoc = 'Road test document is required';
  }
  if (!formData.documents.g1LicenseDocUrl) {
    errors.g1LicenseDoc = 'G1 license document is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ============================================================================
// DATA TRANSFORMATION UTILITIES
// ============================================================================

/**
 * Transform booking form data to API request format
 */
export const transformBookingFormToRequest = (formData: BookingFormData): CreateBookingRequest => {
  if (!formData.testCenter) {
    throw new Error('Test center is required');
  }

  const testDateTime = formatDateForApi(formData.testDate, formData.testTime);

  return {
    test_center_id: formData.testCenter.id,
    road_test_doc_url: formData.documents.roadTestDocUrl || '',
    g1_license_doc_url: formData.documents.g1LicenseDocUrl || '',
    test_type: formData.testType as TestType,
    test_date: testDateTime,
    meet_at_center: formData.meetAtCenter,
    pickup_address: formData.pickupAddress,
    pickup_latitude: formData.pickupCoordinates?.lat,
    pickup_longitude: formData.pickupCoordinates?.lng,
    pickup_distance: formData.pickupDistance,
    base_price: formData.pricing.base_price,
    pickup_price: formData.pricing.pickup_price,
    addon_id: formData.selectedAddon?.id,
    total_price: formData.pricing.total_price,
    coupon_code: formData.couponCode,
    timezone: formData.timezone
  };
};

/**
 * Get human-readable test type label
 */
export const getTestTypeLabel = (testType: TestType): string => {
  const labels = {
    G: 'Full G Road Test',
    G2: 'G2 Road Test'
  };
  return labels[testType];
};

/**
 * Get human-readable booking status label
 */
export const getBookingStatusLabel = (status: BookingStatus): string => {
  const labels = {
    pending: 'Pending Confirmation',
    confirmed: 'Confirmed',
    completed: 'Completed',
    cancelled: 'Cancelled'
  };
  return labels[status];
};

/**
 * Get booking status color for UI display
 */
export const getBookingStatusColor = (status: BookingStatus): string => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };
  return colors[status];
};

/**
 * Get test result label and color
 */
export const getTestResultDisplay = (result: TestResult): { label: string; color: string } => {
  if (result === 'PASS') {
    return { label: 'Passed', color: 'bg-green-100 text-green-800' };
  } else if (result === 'FAIL') {
    return { label: 'Failed', color: 'bg-red-100 text-red-800' };
  } else {
    return { label: 'Pending', color: 'bg-gray-100 text-gray-800' };
  }
};

// ============================================================================
// DISTANCE AND PRICING UTILITIES - ENHANCED WITH BACKEND API
// ============================================================================

/**
 * Calculate distance between two coordinates using backend API with frontend fallback
 */
export const calculateDistance = async (coord1: Coordinates, coord2: Coordinates): Promise<number> => {
  try {
    // Use backend API through booking service
    const distance = await bookingService.calculateDistance(
      { lat: coord1.lat, lng: coord1.lng },
      { lat: coord2.lat, lng: coord2.lng }
    );
    return distance;
  } catch (error) {
    console.error('❌ Distance calculation failed:', error);
    // Fallback to frontend calculation
    return calculateDistanceFrontend(coord1, coord2);
  }
};

/**
 * Frontend fallback distance calculation using Haversine formula
 */
const calculateDistanceFrontend = (coord1: Coordinates, coord2: Coordinates): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = deg2rad(coord2.lat - coord1.lat);
  const dLng = deg2rad(coord2.lng - coord1.lng);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(coord1.lat)) * Math.cos(deg2rad(coord2.lat)) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI/180);
};

/**
 * Calculate pickup pricing based on distance
 */
export const calculatePickupPrice = (distanceKm: number): number => {
  if (distanceKm <= 0) return 0;
  
  if (distanceKm <= 50) {
    // $1 per km for first 50km
    return Math.round(distanceKm * 100); // in cents
  } else {
    // $1 per km for first 50km + $0.50 per km for additional distance
    const first50km = 50 * 100; // $50 in cents
    const additionalDistance = distanceKm - 50;
    const additionalCost = Math.round(additionalDistance * 50); // $0.50 per km in cents
    return first50km + additionalCost;
  }
};

/**
 * Check if distance qualifies for free perks
 */
export const getDistancePerks = (distanceKm: number): {
  freeDropoff: boolean;
  freeDrivingLesson: '30min' | '1hour' | null;
} => {
  if (distanceKm > 100) {
    return {
      freeDropoff: true,
      freeDrivingLesson: '1hour'
    };
  } else if (distanceKm > 50) {
    return {
      freeDropoff: true,
      freeDrivingLesson: '30min'
    };
  } else {
    return {
      freeDropoff: false,
      freeDrivingLesson: null
    };
  }
};

// ============================================================================
// ADDON UTILITIES
// ============================================================================

/**
 * Filter addons by test type
 */
export const getAddonsForTestType = (addons: Addon[], testType: TestType): Addon[] => {
  return addons.filter(addon => 
    addon.type.includes(testType) || 
    !addon.type.includes('G2') && !addon.type.includes('G')
  );
};

/**
 * Get addon duration in human-readable format
 */
export const formatAddonDuration = (durationSeconds: number): string => {
  const hours = Math.floor(durationSeconds / 3600);
  const minutes = Math.floor((durationSeconds % 3600) / 60);
  
  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  } else {
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
};

// ============================================================================
// EXPORT ALL UTILITIES
// ============================================================================

export const bookingUtils = {
  // Price utilities
  centsToDollars,
  dollarsToCents,
  formatPrice,
  formatPriceValue,
  
  // Date utilities
  formatDateForApi,
  parseApiDate,
  formatDateForDisplay,
  formatTimeForDisplay,
  formatDateTimeForDisplay,
  
  // Validation utilities
  validateEmail,
  validatePhone,
  validatePostalCode,
  validateBookingForm,
  
  // Transformation utilities
  transformBookingFormToRequest,
  getTestTypeLabel,
  getBookingStatusLabel,
  getBookingStatusColor,
  getTestResultDisplay,
  
  // Distance utilities - ENHANCED WITH BACKEND API
  calculateDistance,
  calculatePickupPrice,
  getDistancePerks,
  
  // Addon utilities
  getAddonsForTestType,
  formatAddonDuration
};