// lib/types/booking.types.ts - Minimal addition for distance calculation API
/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================================================
// DISTANCE CALCULATION API TYPES (NEW - MINIMAL ADDITION)
// ============================================================================

export interface DistanceCalculationRequest {
  pickupLat: number;
  pickupLng: number;
  testCenterLat: number;
  testCenterLng: number;
}

export interface DistanceCalculationResponse {
  distance_km: number;
  pickup_price: number; // in cents
  is_free_pickup: boolean;
  coordinates: {
    pickup: Coordinates;
    test_center: Coordinates;
  };
  // `distance_breakdown` (first_50km / beyond_50km) and `free_benefits`
  // (free_dropoff / free_30min_lesson / free_1hr_lesson) used to be declared
  // here. The server sends neither: the 50 km tier names baked in a threshold
  // that is now admin-tunable, and the free-benefit flags described a model the
  // backend has never had. Both were unused. Do not reintroduce them.
}

// ============================================================================
// EXISTING CODE REMAINS UNCHANGED BELOW
// ============================================================================

// ============================================================================
// CORE ENUMS
// ============================================================================

export enum TestType {
  G = 'G',
  G2 = 'G2'
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum TestResult {
  PASS = 'PASS',
  FAIL = 'FAIL'
}

export enum DriveTestCenterStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export enum AddonType {
  LESSON_G = 'LESSON_G',
  LESSON_G2 = 'LESSON_G2',
  MOCK_TEST_G = 'MOCK_TEST_G',
  MOCK_TEST_G2 = 'MOCK_TEST_G2'
}

// ============================================================================
// BASE INTERFACES
// ============================================================================

export interface BaseEntity {
  id: number;
  created_at: string;
  updated_at: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Address {
  address: string;
  city?: string;
  province?: string;
  postal_code?: string;
  coordinates?: Coordinates;
}

// ============================================================================
// DRIVE TEST CENTERS
// ============================================================================

export interface DriveTestCenter extends BaseEntity {
  name: string;
  city: string;
  province: string;
  postal_code: string;
  lat: number;
  lng: number;
  base_price: number; // in cents
  // Omitted by the public GET /drive-test-centers (admin-only serialization group)
  status?: DriveTestCenterStatus;

  // Only address is optional - will be added later to API
  address?: string;
}

export interface DriveTestCentersResponse {
  centers: DriveTestCenter[];
}

// ============================================================================
// ADDONS
// ============================================================================

export interface Addon extends BaseEntity {
  name: string;
  type: AddonType;
  description: string;
  price: number; // in cents
  duration: number; // in seconds
}

export interface AddonsResponse {
  addons: Addon[];
}

// ============================================================================
// COUPONS
// ============================================================================

/**
 * A coupon as the CUSTOMER sees it (serialization group `me`).
 *
 * `discount` is deliberately typed as ambiguous: the server means percent when
 * `discount_type` is 'percentage' (or `is_failure_coupon` is set) and cents
 * otherwise — but `discount_type`, `min_purchase_amount`, `is_recurrent` and
 * `is_failure_coupon` are all stripped from this response, so the client cannot
 * tell which. Treating it as cents quoted a $0.10 saving on a 10% coupon.
 *
 * Do not compute a discount from this. Show the coupon as accepted, send
 * `coupon_code` on create, and display the server's `total_price`.
 */
export interface Coupon extends BaseEntity {
  code: string;
  name?: string;
  description?: string;
  /** Percent OR cents — not determinable client-side. Display only. */
  discount: number;
  start_date?: string;
  expires_at?: string;
}

export interface CouponVerifyRequest {
  code: string;
}

export interface CouponVerifyResponse {
  coupon: Coupon;
  isValid: boolean;
  message?: string;
}

// ============================================================================
// ADDRESS SEARCH
// ============================================================================

export interface AddressSearchResult {
  // New API fields (primary)
  formatted_address: string;
  latitude: number;
  longitude: number;
  postal_code: string;
  city: string;
  province: string;
  country: string;
  
  // Legacy fields for backward compatibility (computed)
  address?: string; // Fallback to formatted_address
  lat?: number; // Fallback to latitude
  lng?: number; // Fallback to longitude
  place_id?: string;
  types?: string[];
}

export interface AddressSearchRequest {
  address: string;
}

export interface AddressSearchResponse {
  addresses: AddressSearchResult[]; // Changed from results to addresses
}

// ============================================================================
// BOOKINGS
// ============================================================================

export interface Booking extends BaseEntity {
  user_id: number;
  instructor_id: number;
  test_center_id: number;
  test_center_name: string;
  test_center_address: string;
  test_type: TestType;
  test_date: string; // "YYYY-MM-DD HH:mm:ss"
  meet_at_center: boolean;
  pickup_address?: string;
  pickup_latitude?: number;
  pickup_longitude?: number;
  pickup_distance?: number; // in kilometers
  base_price: number; // in cents
  pickup_price: number; // in cents
  addons_price: number; // in cents
  total_price: number; // in cents
  status: BookingStatus;
  test_result: TestResult | null;
  coupon_code?: string;
  discount_amount: number; // in cents
  is_rescheduled: boolean;
  previous_booking_id?: number;
  timezone: string;
  addon_id?: number;
  addon_duration?: number; // in seconds
  road_test_doc_url: string;
  g1_license_doc_url: string;
  payment_url?: string; // Stripe checkout URL for pending payments (actual field name from API)
}

// Extended booking response from /bookings/recent endpoint
export interface RecentBooking extends Booking {
  full_name: string;
  phone_number: string;
  email: string;
  instructor_full_name?: string;
  instructor_email?: string;
  instructor_phone_number?: string;
  instructor_vehicle_brand?: string;
  instructor_vehicle_model?: string;
  instructor_vehicle_year?: number;
  instructor_vehicle_color?: string;
  instructor_vehicle_license_plate?: string;
  instructor_vehicle_image_url?: string;
  total_ride_hour?: number;
  ride_price?: number; // in cents
}

export interface CreateBookingRequest {
  test_center_id: number;
  road_test_doc_url: string;
  g1_license_doc_url: string;
  test_type: TestType;
  test_date: string; // "YYYY-MM-DD HH:mm:ss"
  meet_at_center: boolean;
  pickup_address?: string;
  pickup_latitude?: number;
  pickup_longitude?: number;
  pickup_distance?: number;
  base_price: number; // in cents
  pickup_price: number; // in cents
  addon_id?: number;
  total_price: number; // in cents
  coupon_code?: string;
  previous_booking_id?: number; // for rebookings
  timezone: string;
}

export interface BookingsResponse {
  bookings: Booking[];
}

export interface CreateBookingResponse {
  booking?: Booking;
  checkout_url?: string; // Stripe checkout URL (can be named checkout_url or payment_url depending on endpoint)
  payment_url?: string; // Alternative field name for Stripe checkout URL
  message?: string;
}

// ============================================================================
// PRICING CALCULATIONS
// ============================================================================

export interface PricingBreakdown {
  base_price: number; // in cents
  pickup_price: number; // in cents
  addon_price: number; // in cents
  subtotal: number; // in cents
  discount_amount: number; // in cents
  total_price: number; // in cents
  coupon_code?: string;
}

export interface DistanceCalculation {
  distance_km: number;
  pickup_price: number; // in cents
  is_free_pickup: boolean;
  coordinates: {
    pickup: Coordinates;
    test_center: Coordinates;
  };
}

// ============================================================================
// API RESPONSE WRAPPERS
// ============================================================================

export interface ApiError {
  status_code: number;
  message: string;
  errors?: Record<string, string[] | string>;
  timestamp?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

// ============================================================================
// FRONTEND STATE TYPES
// ============================================================================

export interface BookingFormData {
  // Step 1: Road Test Details
  testType: TestType | '';
  testCenter: DriveTestCenter | null;
  
  // Step 2: Booking Details  
  testDate: string;
  testTime: string;
  meetAtCenter: boolean;
  pickupAddress?: string;
  pickupCoordinates?: Coordinates;
  pickupDistance?: number;
  
  // Step 3: Test Details
  contactInfo: {
    fullName: string;
    email: string;
    phone: string;
  };
  documents: {
    roadTestDocUrl?: string;
    g1LicenseDocUrl?: string;
  };
  selectedAddon?: Addon | null;
  
  // Step 4: Payment
  couponCode?: string;
  pricing: PricingBreakdown;
  timezone: string;
}

export interface BookingContextState {
  formData: BookingFormData;
  isLoading: boolean;
  errors: Record<string, string>;
  currentStep: number;
  completedSteps: number[];
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type BookingFormField = keyof BookingFormData;

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const BOOKING_STEPS = [
  { id: 1, name: "Road Test Details", path: "/book-road-test-vehicle/road-test-details" },
  { id: 2, name: "Booking Details", path: "/book-road-test-vehicle/booking-details" },
  { id: 3, name: "Test Details", path: "/book-road-test-vehicle/test-details" },
  { id: 4, name: "Payment", path: "/book-road-test-vehicle/payment" },
] as const;

export const ONTARIO_TIMEZONE = "America/Toronto";

export const PRICE_DISPLAY_CURRENCY = "CAD";

// Helper function to convert cents to dollars
export const centsToDollars = (cents: number): number => cents / 100;

// Helper function to convert dollars to cents
export const dollarsToCents = (dollars: number): number => Math.round(dollars * 100);

// Helper function to format price for display
export const formatPrice = (cents: number, currency = PRICE_DISPLAY_CURRENCY): string => {
  const dollars = centsToDollars(cents);
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: currency,
  }).format(dollars);
};

// Helper function to format date for API
export const formatDateForApi = (date: Date, timezone = ONTARIO_TIMEZONE): string => {
  return date.toLocaleString('sv-SE', { timeZone: timezone }).replace('T', ' ');
};

// Helper function to parse API date
export const parseApiDate = (dateStr: string): Date => {
  return new Date(dateStr.replace(' ', 'T'));
};

// ============================================================================
// REFUND REQUESTS
// ============================================================================

export enum RefundStatus {
  PENDING = 'pending',
  PROCESSED = 'processed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}

export interface RefundRequest extends BaseEntity {
  booking_id: number;
  customer_id: number;
  customer_name: string;
  customer_email: string;
  customer_phone_number: string;
  customer_address: string;
  payment_transaction_id: number;
  amount: number; // in cents
  refund_percentage: number;
  request_date: string;
  status: RefundStatus | string;
  processed_at: string | null;
  stripe_refund_id: string | null;
  refund_reason: string;
  metadata?: Record<string, any>;
  admin_notes?: string | null;
}

export interface CreateRefundRequestRequest {
  booking_id: number;
  refund_reason: string;
}

export interface RefundRequestsResponse {
  refunds: RefundRequest[];
}

export interface RefundRequestQueryParams {
  limit?: number;
  cursor?: string;
  direction?: 'forward' | 'backward';
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  search?: string;
  baseUrl?: string;
}