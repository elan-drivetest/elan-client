// lib/services/booking.service.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosInstance, AxiosError } from 'axios';
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
  DistanceCalculationResponse,
  PricingBreakdown,
  Coordinates} from '@/lib/types/booking.types';

// ============================================================================
// BOOKING API SERVICE CLASS
// ============================================================================

class BookingApiService {
  private apiClient: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
  }> = [];

  constructor() {
    this.apiClient = axios.create({
      baseURL: 'https://api-dev.elanroadtestrental.ca/v1',
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private processQueue(error: unknown = null): void {
    this.failedQueue.forEach(prom => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve();
      }
    });

    this.failedQueue = [];
  }

  // ============================================================================
  // INTERCEPTORS SETUP
  // ============================================================================

  private setupInterceptors(): void {
    // Request interceptor
    this.apiClient.interceptors.request.use(
      (config) => {
        console.log('🔍 Booking API Request:', config.method?.toUpperCase(), config.url);
        config.withCredentials = true;
        return config;
      },
      (error: AxiosError) => {
        console.error('❌ Booking API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor with automatic token refresh
    this.apiClient.interceptors.response.use(
      (response) => {
        console.log('✅ Booking API Response:', response.status, response.config.url);
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as typeof error.config & { _retry?: boolean };
        console.error('❌ Booking API Error:', error.response?.status, error.response?.data);

        // Handle 401 errors with automatic token refresh
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          const isRefreshEndpoint = originalRequest.url?.includes('/refresh');
          const isRegisterEndpoint = originalRequest.url?.includes('/register');
          const isLoginEndpoint = originalRequest.url?.includes('/login');
          const isConfirmEndpoint = originalRequest.url?.includes('/confirm');

          // Don't attempt refresh for auth endpoints
          if (isRefreshEndpoint || isRegisterEndpoint || isLoginEndpoint || isConfirmEndpoint) {
            return Promise.reject(error);
          }

          // NOTE: No client-side refresh-token pre-check here. The _elanAuthR
          // cookie is set by the API domain and/or is HttpOnly, so it is not
          // readable via document.cookie on the frontend — checking it would
          // always report "missing" and wrongly skip the refresh. We attempt
          // the refresh and let the backend reject with 401 if it is invalid.

          // If we're already refreshing, queue this request
          if (this.isRefreshing) {
            console.log('⏳ Token refresh in progress (booking service), queueing request...');
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then(() => {
                return this.apiClient(originalRequest);
              })
              .catch(err => {
                return Promise.reject(err);
              });
          }

          // Mark that we're refreshing
          originalRequest._retry = true;
          this.isRefreshing = true;

          console.log('🔄 Attempting token refresh (booking service)...');

          try {
            // Attempt to refresh the token
            await this.apiClient.post('/auth/customer/refresh');
            console.log('✅ Token refresh successful (booking service)');

            // Process queued requests
            this.processQueue();
            this.isRefreshing = false;

            // Retry the original request
            return this.apiClient(originalRequest);
          } catch (refreshError) {
            console.log('❌ Token refresh failed (booking service) - user likely unauthenticated');

            // Process queued requests with error
            this.processQueue(refreshError);
            this.isRefreshing = false;

            // Don't redirect for booking endpoints - let the page handle it
            // This allows unauthenticated users to browse the booking flow
            return Promise.reject(error);
          }
        }

        return Promise.reject(error);
      }
    );
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
   * Calculate distance between two coordinates using backend API with frontend fallback
   */
  async calculateDistance(pickup: { lat: number; lng: number }, testCenter: { lat: number; lng: number }): Promise<number> {
    try {
      const response = await this.calculateDistanceAPI(pickup.lat, pickup.lng, testCenter.lat, testCenter.lng);
      
      if (response.success && response.data) {
        console.log('✅ Backend distance calculation successful:', response.data.distance_km);
        return response.data.distance_km;
      } else {
        console.warn('⚠️ Backend distance calculation failed, falling back to frontend calculation');
        return this.calculateDistanceFrontend(pickup, testCenter);
      }
    } catch (error) {
      console.error('❌ Backend distance calculation error, falling back to frontend calculation:', error);
      return this.calculateDistanceFrontend(pickup, testCenter);
    }
  }

  /**
   * Frontend fallback distance calculation using Haversine formula
   */
  private calculateDistanceFrontend(pickup: { lat: number; lng: number }, testCenter: { lat: number; lng: number }): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(testCenter.lat - pickup.lat);
    const dLng = this.toRadians(testCenter.lng - pickup.lng);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(pickup.lat)) * Math.cos(this.toRadians(testCenter.lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Calculate comprehensive pricing breakdown - ENHANCED WITH BACKEND DISTANCE API
   */
  async calculatePricingBreakdownAsync(params: {
    basePrice: number;
    pickupCoordinates?: Coordinates;
    testCenterCoordinates?: Coordinates;
    meetAtCenter?: boolean;
    addon?: Addon | null;
    coupon?: Coupon | null;
  }): Promise<PricingBreakdown> {
    let pickup_price = 0;
    let addon_price = 0;
    let discount_amount = 0;

    // Calculate pickup price using backend distance calculation
    if (!params.meetAtCenter && params.pickupCoordinates && params.testCenterCoordinates) {
      try {
        const distance = await this.calculateDistance(params.pickupCoordinates, params.testCenterCoordinates);
        const pickupCalculation = this.calculatePickupPricing(distance);
        pickup_price = pickupCalculation.pickup_price;
      } catch (error) {
        console.error('❌ Error calculating pickup price:', error);
        // Pickup price remains 0 if calculation fails
      }
    }

    // Calculate addon price
    if (params.addon) {
      addon_price = params.addon.price;
    }

    // Calculate subtotal
    const subtotal = params.basePrice + pickup_price + addon_price;

    // Apply coupon discount
    if (params.coupon && subtotal >= params.coupon.min_purchase_amount) {
      discount_amount = Math.min(params.coupon.discount, subtotal);
    }

    // Calculate final total
    const total_price = Math.max(0, subtotal - discount_amount);

    return {
      base_price: params.basePrice,
      pickup_price,
      addon_price,
      subtotal,
      discount_amount,
      total_price,
      coupon_code: params.coupon?.code
    };
  }

  /**
   * Calculate pickup pricing based on distance
   */
  calculatePickupPricing(distanceKm: number): { pickup_price: number; is_free_pickup: boolean } {
    if (distanceKm <= 0) {
      return { pickup_price: 0, is_free_pickup: true };
    }

    // First 50km: $1/km, additional distance: $0.50/km
    let pickup_price = 0;
    
    if (distanceKm <= 50) {
      pickup_price = distanceKm * 100; // $1/km in cents
    } else {
      pickup_price = (50 * 100) + ((distanceKm - 50) * 50); // First 50km + additional at $0.50/km
    }

    return {
      pickup_price: Math.round(pickup_price),
      is_free_pickup: false
    };
  }

  /**
   * Calculate comprehensive pricing breakdown - LEGACY SYNC VERSION
   * Maintained for backward compatibility
   */
  calculatePricingBreakdown(params: {
    basePrice: number;
    pickupDistance?: number;
    meetAtCenter?: boolean;
    addon?: Addon | null;
    coupon?: Coupon | null;
  }): PricingBreakdown {
    let pickup_price = 0;
    let addon_price = 0;
    let discount_amount = 0;

    // Calculate pickup price
    if (!params.meetAtCenter && params.pickupDistance && params.pickupDistance > 0) {
      const pickupCalculation = this.calculatePickupPricing(params.pickupDistance);
      pickup_price = pickupCalculation.pickup_price;
    }

    // Calculate addon price
    if (params.addon) {
      addon_price = params.addon.price;
    }

    // Calculate subtotal
    const subtotal = params.basePrice + pickup_price + addon_price;

    // Apply coupon discount
    if (params.coupon && subtotal >= params.coupon.min_purchase_amount) {
      discount_amount = Math.min(params.coupon.discount, subtotal);
    }

    // Calculate final total
    const total_price = Math.max(0, subtotal - discount_amount);

    return {
      base_price: params.basePrice,
      pickup_price,
      addon_price,
      subtotal,
      discount_amount,
      total_price,
      coupon_code: params.coupon?.code
    };
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