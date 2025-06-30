// lib/hooks/useBooking.ts - Custom hooks for booking operations
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useCallback } from 'react';
import { bookingApi } from '@/lib/api';
import { bookingUtils } from '@/lib/utils/booking.utils';
import type {
  ApiResponse,
  DriveTestCenter,
  Addon,
  Coupon,
  AddressSearchResult,
  Booking,
  CreateBookingRequest,
  PricingBreakdown,
  TestType} from '@/lib/types/booking.types';

// ============================================================================
// DRIVE TEST CENTERS HOOK
// ============================================================================

export const useDriveTestCenters = () => {
  const [centers, setCenters] = useState<DriveTestCenter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCenters = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await bookingApi.getDriveTestCenters();
      
      if (response.success && response.data) {
        setCenters(response.data);
      } else {
        setError(response.error?.message || 'Failed to fetch test centers');
      }
    } catch (err) {
      setError('Network error occurred while fetching test centers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCenters();
  }, [fetchCenters]);

  const getCenterById = useCallback((id: number): DriveTestCenter | undefined => {
    return centers.find(center => center.id === id);
  }, [centers]);

  const getCentersByProvince = useCallback((province: string): DriveTestCenter[] => {
    return centers.filter(center => center.province === province);
  }, [centers]);

  return {
    centers,
    loading,
    error,
    refetch: fetchCenters,
    getCenterById,
    getCentersByProvince
  };
};

// ============================================================================
// ADDONS HOOK
// ============================================================================

export const useAddons = (testType?: TestType) => {
  const [addons, setAddons] = useState<Addon[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAddons = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await bookingApi.getAddons();
      
      if (response.success && response.data) {
        let filteredAddons = response.data;
        
        // Filter by test type if provided
        if (testType) {
          filteredAddons = bookingUtils.getAddonsForTestType(response.data, testType);
        }
        
        setAddons(filteredAddons);
      } else {
        setError(response.error?.message || 'Failed to fetch addons');
      }
    } catch (err) {
      setError('Network error occurred while fetching addons');
    } finally {
      setLoading(false);
    }
  }, [testType]);

  useEffect(() => {
    fetchAddons();
  }, [fetchAddons]);

  const getAddonById = useCallback((id: number): Addon | undefined => {
    return addons.find(addon => addon.id === id);
  }, [addons]);

  const getAddonsByType = useCallback((type: string): Addon[] => {
    return addons.filter(addon => addon.type === type);
  }, [addons]);

  return {
    addons,
    loading,
    error,
    refetch: fetchAddons,
    getAddonById,
    getAddonsByType
  };
};

// ============================================================================
// COUPON VERIFICATION HOOK
// ============================================================================

export const useCouponVerification = () => {
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);

  // FIXED: Return the actual coupon data instead of boolean
  const verifyCoupon = useCallback(async (couponCode: string): Promise<Coupon | null> => {
    if (!couponCode.trim()) {
      setError('Please enter a coupon code');
      return null;
    }

    setLoading(true);
    setError(null);
    setCoupon(null);
    setIsVerified(false);

    try {
      const response = await bookingApi.verifyCoupon(couponCode);
      
      if (response.success && response.data) {
        setCoupon(response.data);
        setIsVerified(true);
        // FIXED: Return the actual coupon data
        return response.data;
      } else {
        setError(response.error?.message || 'Invalid coupon code');
        return null;
      }
    } catch (err) {
      setError('Network error occurred while verifying coupon');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearCoupon = useCallback(() => {
    setCoupon(null);
    setIsVerified(false);
    setError(null);
  }, []);

  const resetState = useCallback(() => {
    setCoupon(null);
    setIsVerified(false);
    setError(null);
    setLoading(false);
  }, []);

  return {
    coupon,
    loading,
    error,
    isVerified,
    verifyCoupon,
    clearCoupon,
    resetState
  };
};

// ============================================================================
// ADDRESS SEARCH HOOK
// ============================================================================

export const useAddressSearch = () => {
  const [results, setResults] = useState<AddressSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchAddresses = useCallback(async (query: string, limit = 5): Promise<AddressSearchResult[]> => {
    // Add validation to prevent API calls with short queries
    if (!query.trim() || query.trim().length < 3) {
      setResults([]);
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const response = await bookingApi.searchAddresses(query.trim(), limit);
      
      if (response.success && response.data) {
        setResults(response.data);
        return response.data;
      } else {
        setError(response.error?.message || 'Failed to search addresses');
        setResults([]);
        return [];
      }
    } catch (err) {
      setError('Network error occurred while searching addresses');
      setResults([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    searchAddresses,
    clearResults
  };
};

// ============================================================================
// BOOKINGS MANAGEMENT HOOK
// ============================================================================

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await bookingApi.getBookings();
      
      if (response.success && response.data) {
        setBookings(response.data);
      } else {
        setError(response.error?.message || 'Failed to fetch bookings');
      }
    } catch (err) {
      setError('Network error occurred while fetching bookings');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRecentBookings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await bookingApi.getRecentBookings();
      
      if (response.success && response.data) {
        setRecentBookings(response.data);
      } else {
        setError(response.error?.message || 'Failed to fetch recent bookings');
      }
    } catch (err) {
      setError('Network error occurred while fetching recent bookings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
    fetchRecentBookings();
  }, [fetchBookings, fetchRecentBookings]);

  const getBookingById = useCallback((id: number): Booking | undefined => {
    return bookings.find(booking => booking.id === id);
  }, [bookings]);

  const getBookingsByStatus = useCallback((status: string): Booking[] => {
    return bookings.filter(booking => booking.status === status);
  }, [bookings]);

  return {
    bookings,
    recentBookings,
    loading,
    error,
    refetch: fetchBookings,
    refetchRecent: fetchRecentBookings,
    getBookingById,
    getBookingsByStatus
  };
};

// ============================================================================
// BOOKING CREATION HOOK
// ============================================================================

export const useBookingCreation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);

  const createBooking = useCallback(async (bookingData: CreateBookingRequest): Promise<ApiResponse<Booking>> => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    setCreatedBooking(null);

    try {
      // Validate booking data first
      const validation = bookingApi.validateBookingData(bookingData);
      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        return {
          success: false,
          error: {
            status_code: 400,
            message: validation.errors.join(', ')
          }
        };
      }

      const response = await bookingApi.createBooking(bookingData);
      
      if (response.success && response.data) {
        setSuccess(true);
        setCreatedBooking(response.data);
        return response;
      } else {
        setError(response.error?.message || 'Failed to create booking');
        return response;
      }
    } catch (err) {
      const errorMessage = 'Network error occurred while creating booking';
      setError(errorMessage);
      return {
        success: false,
        error: {
          status_code: 500,
          message: errorMessage
        }
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const resetState = useCallback(() => {
    setLoading(false);
    setError(null);
    setSuccess(false);
    setCreatedBooking(null);
  }, []);

  return {
    loading,
    error,
    success,
    createdBooking,
    createBooking,
    resetState
  };
};

// ============================================================================
// PRICING CALCULATION HOOK
// ============================================================================

export const usePricingCalculation = () => {
  const [pricing, setPricing] = useState<PricingBreakdown>({
    base_price: 0,
    pickup_price: 0,
    addon_price: 0,
    subtotal: 0,
    discount_amount: 0,
    total_price: 0
  });

  const calculatePricing = useCallback(({
    basePrice,
    pickupDistance = 0,
    meetAtCenter = true,
    addon = null,
    coupon = null
  }: {
    basePrice: number;
    pickupDistance?: number;
    meetAtCenter?: boolean;
    addon?: Addon | null;
    coupon?: Coupon | null;
  }) => {
    const newPricing = bookingApi.calculatePricingBreakdown({
      basePrice,
      pickupDistance,
      meetAtCenter,
      addon,
      coupon
    });
    
    setPricing(newPricing);
    return newPricing;
  }, []);

  const updateBasePrice = useCallback((basePrice: number) => {
    setPricing(prev => {
      const updated = { ...prev, base_price: basePrice };
      updated.subtotal = updated.base_price + updated.pickup_price + updated.addon_price;
      updated.total_price = Math.max(0, updated.subtotal - updated.discount_amount);
      return updated;
    });
  }, []);

  const updatePickupPrice = useCallback((pickupPrice: number) => {
    setPricing(prev => {
      const updated = { ...prev, pickup_price: pickupPrice };
      updated.subtotal = updated.base_price + updated.pickup_price + updated.addon_price;
      updated.total_price = Math.max(0, updated.subtotal - updated.discount_amount);
      return updated;
    });
  }, []);

  const resetPricing = useCallback(() => {
    setPricing({
      base_price: 0,
      pickup_price: 0,
      addon_price: 0,
      subtotal: 0,
      discount_amount: 0,
      total_price: 0
    });
  }, []);

  return {
    pricing,
    calculatePricing,
    updateBasePrice,
    updatePickupPrice,
    resetPricing
  };
};