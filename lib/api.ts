// lib/api.ts - Updated to include booking services
import axios, { AxiosError } from 'axios';
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
import type {
  Addon,
  Coupon,
  CreateBookingRequest} from '@/lib/types/booking.types';

// Create the main API client
const api = axios.create({
  baseURL: 'https://api-dev.elanroadtestrental.ca/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for debugging and cookie handling
api.interceptors.request.use(
  (config) => {
    console.log('🌐 API Request:', config.method?.toUpperCase(), config.url);
    
    // Ensure withCredentials is set for cross-domain cookies
    config.withCredentials = true;
    
    return config;
  },
  (error: AxiosError) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors and cookie debugging
api.interceptors.response.use(
  (response) => {
    // Log successful responses
    const setCookieHeader = response.headers['set-cookie'];
    if (setCookieHeader) {
      console.log('🍪 Response set-cookie header:', setCookieHeader);
    }
    
    return response;
  },
  async (error: AxiosError) => {
    console.log('❌ API Error:', error.response?.status, error.response?.data);
    
    // Handle 401 unauthorized errors - but NOT for login and getCurrentUser endpoints
    if (error.response?.status === 401) {
      const isLoginEndpoint = error.config?.url?.includes('/login');
      const isGetUserEndpoint = error.config?.url?.includes('/auth/customer/me');
      const isRefreshEndpoint = error.config?.url?.includes('/refresh');
      
      // Don't redirect on login, getCurrentUser, or refresh endpoints
      if (isLoginEndpoint || isGetUserEndpoint || isRefreshEndpoint) {
        console.log('🚫 401 on auth endpoint - not redirecting');
        return Promise.reject(error);
      }
      
      console.log('🚨 401 Unauthorized - redirecting to login');
      
      // Clear any stored auth state and redirect
      if (typeof window !== 'undefined') {
        // Clear any auth cookies
        document.cookie = '_elanAuth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + window.location.hostname;
        document.cookie = '_elanAuthR=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + window.location.hostname;
        
        // Redirect to login
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Helper function to standardize error handling
export const handleApiError = (error?: ApiError): string => {
  if (!error) {
    return 'An unexpected error occurred. Please try again.';
  }

  // Return the main error message
  let message = error.message || 'An unexpected error occurred.';

  // If there are specific field errors, append them
  if (error.errors && typeof error.errors === 'object') {
    const fieldErrors = Object.entries(error.errors)
      .map(([field, messages]) => {
        const messageArray = Array.isArray(messages) ? messages : [messages];
        return `${field}: ${messageArray.join(', ')}`;
      })
      .join('; ');
    
    if (fieldErrors) {
      message += ` (${fieldErrors})`;
    }
  }

  return message;
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
      await api.post('/auth/customer/email/confirm', { hash });
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

  // Initiate password reset process
  forgotPassword: async (email: string): Promise<ApiResponse> => {
    try {
      await api.post('/auth/customer/forgot/password', { email });
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
      await api.post('/auth/customer/reset/password', { 
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
        error: axiosError.response?.data 
      };
    }
  },

  // Get current authenticated user
  getCurrentUser: async (): Promise<ApiResponse<UserProfile>> => {
    try {
      const response = await api.get('/auth/customer/me');
      return { success: true, data: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      return { success: false, error: axiosError.response?.data };
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
      return { success: false, error: axiosError.response?.data };
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
  getRecentBookings: () => bookingService.getRecentBookings(),
  getBookingById: (id: number) => bookingService.getBookingById(id),
  createBooking: (bookingData: CreateBookingRequest) => bookingService.createBooking(bookingData),
  
  // Distance Calculation - NEW BACKEND API
  calculateDistanceAPI: (pickupLat: number, pickupLng: number, testCenterLat: number, testCenterLng: number) => 
    bookingService.calculateDistanceAPI(pickupLat, pickupLng, testCenterLat, testCenterLng),
  
  // Utility methods
  calculateDistance: (pickup: { lat: number; lng: number }, testCenter: { lat: number; lng: number }) => 
    bookingService.calculateDistance(pickup, testCenter),
  calculatePricingBreakdown: (params: {
    basePrice: number;
    pickupDistance?: number;
    meetAtCenter?: boolean;
    addon?: Addon | null;
    coupon?: Coupon | null;
  }) => bookingService.calculatePricingBreakdown(params),
  validateBookingData: (data: CreateBookingRequest) => bookingService.validateBookingData(data),
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