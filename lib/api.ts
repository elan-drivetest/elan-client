// lib/api.ts - Updated to include booking services
import { AxiosError } from 'axios';
import { createApiClient, refreshSession } from '@/lib/http/auth-refresh';
import type {
  RegisterRequest, 
  LoginRequest, 
  UserProfile, 
  ApiResponse, 
  ApiError, 
  UpdateProfileRequest 
} from '@/lib/types/auth.types';

// Import booking service and types
import { bookingService } from '@/lib/services/booking.service';
import { getFriendlyErrorMessage } from '@/lib/utils/error-messages';
import type {
  CreateBookingRequest,
  CreateRefundRequestRequest,
  RefundRequestQueryParams} from '@/lib/types/booking.types';

// Create the main API client.
//
// The 401 -> refresh -> retry behaviour lives in lib/http/auth-refresh.ts and is
// shared with the booking and file-upload services, so all three coordinate on a
// SINGLE refresh request. They previously each ran their own refresh lock, which
// let concurrent 401s fire competing refreshes and log the user out.
const api = createApiClient('api');

// Convert an axios failure into our standard ApiError shape.
//
// Crucially this always carries a status_code: when the request never reached
// the backend (network drop, CORS, timeout) there is no `response`, and we
// report status_code 0. Callers — notably AuthContext — use that to tell
// "genuinely logged out" apart from "couldn't reach the server", instead of
// treating every failure as a logout.
const toApiError = (error: unknown, fallbackMessage: string): ApiError => {
  const axiosError = error as AxiosError<ApiError>;
  const data = axiosError.response?.data;

  // Keep the whole backend payload — `errors` in particular drives the friendly
  // message lookup in lib/utils/error-messages.ts — and only fill in the gaps.
  if (data && typeof data === 'object') {
    return {
      ...data,
      status_code: data.status_code ?? axiosError.response?.status ?? 0,
      message: data.message ?? fallbackMessage,
    };
  }

  return {
    status_code: axiosError.response?.status ?? 0,
    message: fallbackMessage,
  };
};

// Helper function to standardize error handling.
// Translates raw backend error codes (e.g. { password: "incorrectPassword" })
// into user-friendly copy — see lib/utils/error-messages.ts for the full map.
export const handleApiError = (error?: ApiError): string => {
  return getFriendlyErrorMessage(error);
};

// Validation helper for email
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validation helper for user registration data
export const validateRegistrationData = (userData: RegisterRequest) => {
  const errors: Record<string, string> = {};

  // Name validation
  if (!userData.full_name || userData.full_name.trim().length < 2) {
    errors.full_name = 'Full name must be at least 2 characters long';
  }

  // Email validation  
  if (!userData.email || userData.email.trim().length === 0) {
    errors.email = 'Email is required';
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      errors.email = 'Please enter a valid email address';
    }
  }

  // Password validation
  if (!userData.password) {
    errors.password = 'Password is required';
  } else if (userData.password.length < 6) {
    errors.password = 'Password must be at least 6 characters long';
  }

  // Phone number validation (if provided)
  if (userData.phone_number && userData.phone_number.trim().length > 0) {
    const phoneRegex = /^\+?[\d\s\-()]+$/;
    if (!phoneRegex.test(userData.phone_number)) {
      errors.phone_number = 'Please enter a valid phone number';
    }
    if (userData.phone_number.length > 20) {
      errors.phone_number = 'Phone number is too long';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Authentication API endpoints
export const authApi = {
  // Register a new customer account
  register: async (userData: RegisterRequest): Promise<ApiResponse> => {
    try {
      await api.post('/auth/customer/email/register', userData);
      return { 
        success: true,
        data: { message: 'Registration successful! Please check your email to verify your account.' }
      };
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      const errorData = axiosError.response?.data;
      
      return { 
        success: false, 
        error: errorData || {
          status_code: 500,
          message: 'Registration failed. Please try again.'
        }
      };
    }
  },

  // Confirm email address after registration
  confirmEmail: async (hash: string): Promise<ApiResponse> => {
    try {
      // Endpoint returns 204 No Content on success
      await api.post('/auth/email/confirm', { hash });
      return {
        success: true,
        data: { message: 'Email verified successfully! You can now login to your account.' }
      };
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      const errorData = axiosError.response?.data;

      return {
        success: false,
        error: errorData || {
          status_code: 500,
          message: 'Email verification failed. Please try again.'
        }
      };
    }
  },

  // Resend confirmation email
  resendConfirmationEmail: async (email: string): Promise<ApiResponse> => {
    try {
      console.log('📧 Resending confirmation email to:', email);
      await api.post('/auth/email/confirm/new', { email });
      return {
        success: true,
        data: { message: 'Confirmation email has been resent! Please check your inbox.' }
      };
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      const errorData = axiosError.response?.data;
      console.error('❌ Resend confirmation email failed:', errorData);

      return {
        success: false,
        error: errorData || {
          status_code: 500,
          message: 'Failed to resend confirmation email. Please try again.'
        }
      };
    }
  },

  // Initiate password reset process
  forgotPassword: async (email: string): Promise<ApiResponse> => {
    try {
      // Endpoint: POST /v1/auth/forgot/password
      await api.post('/auth/forgot/password', { email });
      return {
        success: true,
        data: { message: 'If an account with this email exists, you will receive a password reset link shortly.' }
      };
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      const errorData = axiosError.response?.data;

      return {
        success: false,
        error: errorData || {
          status_code: 500,
          message: 'Failed to send password reset email. Please try again.'
        }
      };
    }
  },

  // Reset password using hash from email
  resetPassword: async (hash: string, newPassword: string): Promise<ApiResponse> => {
    try {
      // Endpoint: POST /v1/auth/reset/password
      await api.post('/auth/reset/password', {
        hash,
        password: newPassword
      });
      return {
        success: true,
        data: { message: 'Password has been reset successfully! You can now login with your new password.' }
      };
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      const errorData = axiosError.response?.data;

      return {
        success: false,
        error: errorData || {
          status_code: 500,
          message: 'Password reset failed. Please try again.'
        }
      };
    }
  },

  // Login with email and password
  login: async (credentials: LoginRequest): Promise<ApiResponse<UserProfile>> => {
    try {
      console.log('🔐 Attempting login...');
      const response = await api.post('/auth/customer/email/login', credentials);
      console.log('✅ Login successful:', response.data);
      
      return { 
        success: true, 
        data: response.data
      };
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      console.error('❌ Login failed:', axiosError.response?.data);
      return {
        success: false,
        error: toApiError(error, 'Login failed. Please try again.'),
      };
    }
  },

  // Get current authenticated user
  getCurrentUser: async (): Promise<ApiResponse<UserProfile>> => {
    try {
      const response = await api.get('/auth/customer/me');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: toApiError(error, 'Could not verify your session. Please try again.'),
      };
    }
  },

  // Update user profile
  updateProfile: async (updateData: UpdateProfileRequest): Promise<ApiResponse<UserProfile>> => {
    try {
      console.log('🔄 Updating profile with data:', updateData);
      const response = await api.patch('/auth/customer/me', updateData);
      console.log('✅ Profile update successful:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      console.error('❌ Profile update failed:', axiosError.response?.data);
      return {
        success: false,
        error: toApiError(error, 'Could not update your profile. Please try again.'),
      };
    }
  },

  // Refresh authentication token.
  //
  // Routed through the shared coordinator so a manual refresh can never race the
  // interceptor-driven one. The refresh endpoint only rotates cookies — it does
  // not return a profile — so the caller must re-read /auth/customer/me
  // afterwards to get user data (see AuthContext.refreshAuth).
  refreshToken: async (): Promise<ApiResponse> => {
    try {
      console.log('🔄 Refreshing authentication token...');
      await refreshSession();
      console.log('✅ Token refresh successful');
      return { success: true };
    } catch (error) {
      console.error('❌ Token refresh failed');
      return {
        success: false,
        error: toApiError(error, 'Your session could not be renewed. Please log in again.'),
      };
    }
  },

  // Logout
  logout: async (): Promise<ApiResponse> => {
    try {
      console.log('🚪 Logging out...');
      await api.post('/auth/customer/logout');
      console.log('✅ Logout successful');
      return { success: true };
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      console.error('❌ Logout error:', axiosError.response?.data);
      // Even if logout fails on backend, we'll clear frontend state
      return { success: true };
    }
  },

  // Soft delete user account
  deleteAccount: async (): Promise<ApiResponse> => {
    try {
      await api.delete('/auth/customer/me');
      return { success: true };
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      return { success: false, error: axiosError.response?.data };
    }
  },
};

// ============================================================================
// BOOKING API EXPORTS
// ============================================================================

// Export booking service methods for easy access
export const bookingApi = {
  // Drive Test Centers
  getDriveTestCenters: () => bookingService.getDriveTestCenters(),
  getDriveTestCenterById: (id: number) => bookingService.getDriveTestCenterById(id),
  
  // Addons
  getAddons: () => bookingService.getAddons(),
  getAddonById: (id: number) => bookingService.getAddonById(id),
  
  // Coupons
  verifyCoupon: (couponCode: string) => bookingService.verifyCoupon(couponCode),
  
  // Address Search
  searchAddresses: (query: string, limit?: number) => bookingService.searchAddresses(query, limit),
  
  // Bookings
  getBookings: () => bookingService.getBookings(),
  getRecentBooking: () => bookingService.getRecentBooking(),
  getBookingById: (id: number) => bookingService.getBookingById(id),
  createBooking: (bookingData: CreateBookingRequest) => bookingService.createBooking(bookingData),
  
  // Distance Calculation - NEW BACKEND API
  calculateDistanceAPI: (pickupLat: number, pickupLng: number, testCenterLat: number, testCenterLng: number) =>
    bookingService.calculateDistanceAPI(pickupLat, pickupLng, testCenterLat, testCenterLng),

  // Utility methods.
  // NOTE: there is deliberately no pricing helper here. All price maths lives
  // in lib/pricing/, which mirrors the server engine in one place.
  calculateDistance: (pickup: { lat: number; lng: number }, testCenter: { lat: number; lng: number }) =>
    bookingService.calculateDistance(pickup, testCenter),
  validateBookingData: (data: CreateBookingRequest) => bookingService.validateBookingData(data),

  // Refund Requests
  createRefundRequest: (refundData: CreateRefundRequestRequest) => bookingService.createRefundRequest(refundData),
  getRefundRequests: (params?: RefundRequestQueryParams) => bookingService.getRefundRequests(params),
  getRefundRequestById: (id: number) => bookingService.getRefundRequestById(id),
  validateRefundRequestData: (data: CreateRefundRequestRequest) => bookingService.validateRefundRequestData(data),
};

// Export the booking service instance for direct access if needed
export { bookingService };

// Export types for easy importing
export type {
  DriveTestCenter,
  Addon,
  Coupon,
  AddressSearchResult,
  Booking,
  CreateBookingRequest,
  PricingBreakdown,
  TestType,
  DistanceCalculationResponse
} from '@/lib/types/booking.types';

export default api;