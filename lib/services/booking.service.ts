// lib/services/booking.service.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosInstance } from 'axios';
import { createApiClient } from '@/lib/http/auth-refresh';
import type {
  ApiResponse,
  ApiError,
  DriveTestCenter,
  Addon,
  Coupon,
  CouponVerifyRequest,
  AddressSearchResult,
  Booking,
  RecentBooking,
  CreateBookingRequest,
  DistanceCalculationRequest,
  DistanceCalculationResponse} from '@/lib/types/booking.types';

// ============================================================================
// BOOKING API SERVICE CLASS
// ============================================================================

class BookingApiService {
  private apiClient: AxiosInstance;

  constructor() {
    // Shares the single app-wide refresh coordinator with lib/api.ts and the
    // file-upload service. This class used to own a private isRefreshing flag
    // and queue, which meant a booking request and an auth request that 401'd at
    // the same moment each fired their own POST /auth/customer/refresh — and
    // with server-side refresh-token rotation, the loser of that race killed the
    // session. See lib/http/auth-refresh.ts.
    this.apiClient = createApiClient('booking');
  }

  // ============================================================================
  // ERROR HANDLING UTILITIES
  // ============================================================================

  private handleApiError(error: any): ApiError {
    if (error.response?.data) {
      return {
        status_code: error.response.status,
        message: error.response.data.message || 'An error occurred',
        errors: error.response.data.errors,
        timestamp: new Date().toISOString()
      };
    }

    return {
      status_code: error.response?.status || 500,
      message: error.message || 'Network error occurred',
      timestamp: new Date().toISOString()
    };
  }

  private createSuccessResponse<T>(data: T, message?: string): ApiResponse<T> {
    return {
      success: true,
      data,
      message
    };
  }

  private createErrorResponse(error: ApiError): ApiResponse {
    return {
      success: false,
      error
    };
  }

  // ============================================================================
  // DRIVE TEST CENTERS
  // ============================================================================

  async getDriveTestCenters(): Promise<ApiResponse<DriveTestCenter[]>> {
    try {
      const response = await this.apiClient.get<any[]>('/drive-test-centers');
      
      // Simple conversion - only handle lat/lng conversion and optional address
      const centers: DriveTestCenter[] = response.data.map(center => ({
        // Direct mapping from API response
        id: center.id,
        name: center.name,
        lat: typeof center.lat === 'string' ? parseFloat(center.lat) : center.lat,
        lng: typeof center.lng === 'string' ? parseFloat(center.lng) : center.lng,
        base_price: center.base_price,
        
        // These should come from API (will be added later)
        city: center.city,
        province: center.province,
        postal_code: center.postal_code,
        status: center.status,
        created_at: center.created_at,
        updated_at: center.updated_at,
        
        // Only address is optional
        address: center.address || undefined
      }));
      
      return this.createSuccessResponse(centers, 'Drive test centers fetched successfully');
    } catch (error) {
      const apiError = this.handleApiError(error);
      return this.createErrorResponse(apiError);
    }
  }

  async getDriveTestCenterById(id: number): Promise<ApiResponse<DriveTestCenter>> {
    try {
      const response = await this.apiClient.get<any>(`/drive-test-centers/${id}`);
      
      // Same simple conversion for single center
      const center: DriveTestCenter = {
        id: response.data.id,
        name: response.data.name,
        lat: typeof response.data.lat === 'string' ? parseFloat(response.data.lat) : response.data.lat,
        lng: typeof response.data.lng === 'string' ? parseFloat(response.data.lng) : response.data.lng,
        base_price: response.data.base_price,
        
        city: response.data.city,
        province: response.data.province,
        postal_code: response.data.postal_code,
        status: response.data.status,
        created_at: response.data.created_at,
        updated_at: response.data.updated_at,
        
        // Only address is optional
        address: response.data.address || undefined
      };
      
      return this.createSuccessResponse(center, 'Drive test center fetched successfully');
    } catch (error) {
      const apiError = this.handleApiError(error);
      return this.createErrorResponse(apiError);
    }
  }

  // ============================================================================
  // ADDONS
  // ============================================================================

  async getAddons(): Promise<ApiResponse<Addon[]>> {
    try {
      const response = await this.apiClient.get<Addon[]>('/addons');
      return this.createSuccessResponse(response.data, 'Addons fetched successfully');
    } catch (error) {
      const apiError = this.handleApiError(error);
      return this.createErrorResponse(apiError);
    }
  }

  async getAddonById(id: number): Promise<ApiResponse<Addon>> {
    try {
      const response = await this.apiClient.get<Addon>(`/addons/${id}`);
      return this.createSuccessResponse(response.data, 'Addon fetched successfully');
    } catch (error) {
      const apiError = this.handleApiError(error);
      return this.createErrorResponse(apiError);
    }
  }

  // ============================================================================
  // COUPONS
  // ============================================================================

  async verifyCoupon(couponCode: string): Promise<ApiResponse<Coupon>> {
    try {
      const requestData: CouponVerifyRequest = { code: couponCode };
      const response = await this.apiClient.post<Coupon>('/coupons/verify', requestData);
      return this.createSuccessResponse(response.data, 'Coupon verified successfully');
    } catch (error) {
      const apiError = this.handleApiError(error);
      return this.createErrorResponse(apiError);
    }
  }

  // ============================================================================
  // ADDRESS SEARCH
  // ============================================================================

  async searchAddresses(query: string, limit = 5): Promise<ApiResponse<AddressSearchResult[]>> {
    try {
      // New API format: POST with { address: "query" }
      const requestData = { 
        address: query,
        // Note: limit parameter not supported by new API
      };
      
      console.log('🔍 Address Search Request (NEW API):', requestData);
      
      // Updated interface for new response structure
      interface NewAddressSearchResponse {
        addresses: {
          formatted_address: string;
          latitude: number;
          longitude: number;
          postal_code: string;
          city: string;
          province: string;
          country: string;
        }[];
      }
      
      const response = await this.apiClient.post<NewAddressSearchResponse>('/address-search', requestData);
      
      console.log('✅ Raw Address Search Response:', response.data);
      
      // Handle new API response structure
      if (response.data && response.data.addresses && Array.isArray(response.data.addresses)) {
        // Transform the new API response to match existing interface expectations
        const transformedResults: AddressSearchResult[] = response.data.addresses.map(address => ({
          // New API fields (primary)
          formatted_address: address.formatted_address,
          latitude: address.latitude,
          longitude: address.longitude,
          postal_code: address.postal_code,
          city: address.city,
          province: address.province,
          country: address.country,
          
          // Legacy compatibility fields (computed for backward compatibility)
          address: address.formatted_address, // Use formatted_address as fallback
          lat: address.latitude, // Map latitude to lat for existing components
          lng: address.longitude, // Map longitude to lng for existing components
        }));
        
        // Apply limit on frontend since API doesn't support it
        const limitedResults = limit > 0 ? transformedResults.slice(0, limit) : transformedResults;
        
        console.log('✅ Transformed Address Results:', limitedResults);
        
        return this.createSuccessResponse(limitedResults, 'Address search completed successfully');
      } else {
        console.warn('⚠️ No addresses found in API response');
        return this.createSuccessResponse([], 'No addresses found');
      }
      
    } catch (error) {
      const apiError = this.handleApiError(error);
      console.error('❌ Address Search Error:', apiError);
      return this.createErrorResponse(apiError);
    }
  }

  // ============================================================================
  // DISTANCE CALCULATION - NEW BACKEND API
  // ============================================================================

  async calculateDistanceAPI(
    pickupLat: number,
    pickupLng: number,
    testCenterLat: number,
    testCenterLng: number
  ): Promise<ApiResponse<DistanceCalculationResponse>> {
    try {
      const request: DistanceCalculationRequest = {
        pickupLat,
        pickupLng,
        testCenterLat,
        testCenterLng
      };

      console.log('🔄 Calculating distance via API:', request);
      const response = await this.apiClient.post<any>('/bookings/calculate-distance', request);
      
      // FIXED: Add detailed response debugging
      console.log('🔍 Raw API Response Data:', response.data);
      console.log('🔍 Response Status:', response.status);
      console.log('🔍 Response Headers:', response.headers);
      
      // FIXED: Handle different possible response structures
      let distanceData: DistanceCalculationResponse;
      
      if (response.data) {
        // Check if response.data has the distance directly
        if (typeof response.data.distance_km === 'number') {
          distanceData = response.data as DistanceCalculationResponse;
        }
        // Check if response.data has a nested data property
        else if (response.data.data && typeof response.data.data.distance_km === 'number') {
          distanceData = response.data.data as DistanceCalculationResponse;
        }
        // Check for alternative field names
        else if (typeof response.data.distance === 'number') {
          distanceData = {
            distance_km: response.data.distance,
            pickup_price: response.data.pickup_price || 0,
            is_free_pickup: response.data.is_free_pickup || false,
            coordinates: response.data.coordinates || {
              pickup: { lat: pickupLat, lng: pickupLng },
              test_center: { lat: testCenterLat, lng: testCenterLng }
            }
          };
        }
        // Check for snake_case vs camelCase
        else if (typeof response.data.distanceKm === 'number') {
          distanceData = {
            distance_km: response.data.distanceKm,
            pickup_price: response.data.pickupPrice || 0,
            is_free_pickup: response.data.isFreePickup || false,
            coordinates: response.data.coordinates || {
              pickup: { lat: pickupLat, lng: pickupLng },
              test_center: { lat: testCenterLat, lng: testCenterLng }
            }
          };
        }
        else {
          console.warn('⚠️ Unexpected API response structure:', response.data);
          console.warn('⚠️ Available fields:', Object.keys(response.data));
          
          // Try to extract any numeric value that might be the distance
          const possibleDistanceFields = ['distance', 'distance_km', 'distanceKm', 'km', 'kilometers'];
          let foundDistance: number | undefined;
          
          for (const field of possibleDistanceFields) {
            if (typeof response.data[field] === 'number') {
              foundDistance = response.data[field];
              console.log(`🎯 Found distance in field '${field}':`, foundDistance);
              break;
            }
          }
          
          if (foundDistance !== undefined) {
            distanceData = {
              distance_km: foundDistance,
              pickup_price: response.data.pickup_price || response.data.pickupPrice || 0,
              is_free_pickup: response.data.is_free_pickup || response.data.isFreePickup || false,
              coordinates: {
                pickup: { lat: pickupLat, lng: pickupLng },
                test_center: { lat: testCenterLat, lng: testCenterLng }
              }
            };
          } else {
            throw new Error('No distance field found in API response');
          }
        }
        
        console.log('✅ Parsed distance data:', distanceData);
        return this.createSuccessResponse(distanceData, 'Distance calculated successfully');
      } else {
        throw new Error('Empty response data');
      }
      
    } catch (error) {
      const apiError = this.handleApiError(error);
      console.error('❌ Distance calculation API error:', apiError);
      return this.createErrorResponse(apiError);
    }
  }

  // ============================================================================
  // BOOKINGS
  // ============================================================================

  async getBookings(): Promise<ApiResponse<Booking[]>> {
    try {
      const response = await this.apiClient.get<Booking[]>('/bookings');
      return this.createSuccessResponse(response.data, 'Bookings fetched successfully');
    } catch (error) {
      const apiError = this.handleApiError(error);
      return this.createErrorResponse(apiError);
    }
  }

  async getRecentBooking(): Promise<ApiResponse<RecentBooking | null>> {
    try {
      const response = await this.apiClient.get<RecentBooking>('/bookings/recent');
      return this.createSuccessResponse(response.data, 'Recent booking fetched successfully');
    } catch (error) {
      const apiError = this.handleApiError(error);
      // Return null if no recent booking found (404)
      if (apiError.status_code === 404) {
        return this.createSuccessResponse(null, 'No recent booking found');
      }
      return this.createErrorResponse(apiError);
    }
  }

  async getBookingById(id: number): Promise<ApiResponse<Booking>> {
    try {
      const response = await this.apiClient.get<Booking>(`/bookings/${id}`);
      return this.createSuccessResponse(response.data, 'Booking fetched successfully');
    } catch (error) {
      const apiError = this.handleApiError(error);
      return this.createErrorResponse(apiError);
    }
  }

  async createBooking(bookingData: CreateBookingRequest): Promise<ApiResponse<Booking>> {
    try {
      console.log('🔄 Creating booking with data:', bookingData);
      const response = await this.apiClient.post<Booking>('/bookings', bookingData);
      return this.createSuccessResponse(response.data, 'Booking created successfully');
    } catch (error) {
      const apiError = this.handleApiError(error);
      return this.createErrorResponse(apiError);
    }
  }

  // ============================================================================
  // UTILITY METHODS - ENHANCED WITH BACKEND API
  // ============================================================================

  /**
   * Driving distance to the test centre, in kilometres.
   *
   * Sourced from POST /bookings/calculate-distance (Google Distance Matrix),
   * the same figure the server prices against.
   *
   * There is deliberately no local fallback. The previous Haversine fallback
   * returned straight-line distance, which is always shorter than the driving
   * route, so an API failure silently under-quoted the pickup fare. Rejecting
   * is correct: without a real distance there is no honest price to show.
   */
  async calculateDistance(pickup: { lat: number; lng: number }, testCenter: { lat: number; lng: number }): Promise<number> {
    const response = await this.calculateDistanceAPI(pickup.lat, pickup.lng, testCenter.lat, testCenter.lng);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Could not calculate the distance to the test centre');
    }

    return response.data.distance_km;
  }

  /**
   * Validate booking data before submission
   */
  validateBookingData(data: CreateBookingRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.test_center_id) {
      errors.push('Test center is required');
    }

    if (!data.test_type || !['G', 'G2'].includes(data.test_type)) {
      errors.push('Valid test type is required');
    }

    if (!data.test_date) {
      errors.push('Test date is required');
    }

    if (!data.road_test_doc_url) {
      errors.push('Road test document is required');
    }

    if (!data.g1_license_doc_url) {
      errors.push('G1 license document is required');
    }

    if (!data.meet_at_center && !data.pickup_address) {
      errors.push('Pickup address is required when not meeting at center');
    }

    if (data.total_price <= 0) {
      errors.push('Total price must be greater than 0');
    }

    if (!data.timezone) {
      errors.push('Timezone is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // ============================================================================
  // REFUND REQUESTS
  // ============================================================================

  /**
   * Create a new refund request
   */
  async createRefundRequest(refundData: any): Promise<ApiResponse<any>> {
    try {
      console.log('🔄 Creating refund request:', refundData);
      const response = await this.apiClient.post<any>('/refund-requests', refundData);
      return this.createSuccessResponse(response.data, 'Refund request created successfully');
    } catch (error) {
      const apiError = this.handleApiError(error);
      return this.createErrorResponse(apiError);
    }
  }

  /**
   * Get all refund requests with optional filtering
   */
  async getRefundRequests(params?: any): Promise<ApiResponse<any[]>> {
    try {
      const response = await this.apiClient.get<any[]>('/refund-requests', { params });
      return this.createSuccessResponse(response.data, 'Refund requests fetched successfully');
    } catch (error) {
      const apiError = this.handleApiError(error);
      return this.createErrorResponse(apiError);
    }
  }

  /**
   * Get a specific refund request by ID
   */
  async getRefundRequestById(id: number): Promise<ApiResponse<any>> {
    try {
      const response = await this.apiClient.get<any>(`/refund-requests/${id}`);
      return this.createSuccessResponse(response.data, 'Refund request fetched successfully');
    } catch (error) {
      const apiError = this.handleApiError(error);
      return this.createErrorResponse(apiError);
    }
  }

  /**
   * Validate refund request data before submission
   */
  validateRefundRequestData(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.booking_id) {
      errors.push('Booking ID is required');
    }

    if (!data.refund_reason || data.refund_reason.trim().length === 0) {
      errors.push('Refund reason is required');
    }

    if (data.refund_reason && data.refund_reason.trim().length < 10) {
      errors.push('Refund reason must be at least 10 characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const bookingService = new BookingApiService();
export default bookingService;