import axios, { AxiosError } from 'axios';
import type {
  RegisterRequest,
  LoginRequest,
  UserProfile,
  UpdateProfileRequest,
  ApiResponse,
  ApiError,
  ValidationResult
} from '@/lib/types/auth.types';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'https://api-dev.elanroadtestrental.ca/v1',
  timeout: 10000,
  withCredentials: true, // Essential for cookie handling
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for debugging and cookie handling
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.baseURL ? config.baseURL + config.url : 'BaseURL or URL is undefined');
    
    // Ensure withCredentials is set
    config.withCredentials = true;
    // Log cookies being sent (for debugging)
    if (typeof window !== 'undefined') {
      const cookies = document.cookie;
      console.log('🍪 Cookies being sent:', cookies);
      
      // Manually extract and add auth cookies if they exist
      const authCookie = getCookieValue('_elanAuth');
      const authRefreshCookie = getCookieValue('_elanAuthR');
      
      if (authCookie && authRefreshCookie) {
        // Ensure cookies are being sent
        config.headers.Cookie = `_elanAuth=${authCookie}; _elanAuthR=${authRefreshCookie}`;
        console.log('🔐 Auth cookies found and added to request');
      }
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors and cookie debugging
api.interceptors.response.use(
  (response) => {
    // Enhanced cookie debugging
    const setCookieHeader = response.headers['set-cookie'];
    if (setCookieHeader) {
      console.log('🍪 Response set-cookie header:', setCookieHeader);
      
      // Check if our auth cookies are being set
      const hasAuthCookie = setCookieHeader.some(cookie => cookie.includes('_elanAuth'));
      const hasRefreshCookie = setCookieHeader.some(cookie => cookie.includes('_elanAuthR'));
      
      console.log('🔍 Auth cookies in response:', {
        _elanAuth: hasAuthCookie,
        _elanAuthR: hasRefreshCookie
      });
    } else {
      console.log('⚠️ No set-cookie header in response');
    }
    
    // Log all response headers for debugging
    console.log('📋 All response headers:', response.headers);
    
    return response;
  },
  (error: AxiosError) => {
    // Log errors but don't automatically redirect
    console.log('API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// Helper function to get cookie value
function getCookieValue(name: string): string | null {
  if (typeof window === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

// Helper function to manually set cookie (fallback) - removed as not used

// Error handling helper
export const handleApiError = (error: ApiError | undefined): string => {
  if (error?.errors) {
    // Extract first error message
    const firstError = Object.values(error.errors)[0];
    if (Array.isArray(firstError)) {
      return firstError[0];
    }
    
    // Handle specific error codes
    if (typeof firstError === 'string') {
      switch (firstError) {
        case 'emailAlreadyExists':
          return 'An account with this email already exists. Please try logging in instead.';
        case 'invalidHash':
          return 'Invalid or expired verification link. Please register again.';
        default:
          return firstError;
      }
    }
  }
  return error?.message || 'An unexpected error occurred';
};

// Validation utilities
export const validateRegistrationData = (userData: RegisterRequest): ValidationResult => {
  const errors: Record<string, string> = {};

  // Full name validation
  if (!userData.full_name || userData.full_name.trim().length === 0) {
    errors.full_name = 'Full name is required';
  }

  // Email validation
  if (!userData.email) {
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
      
      // Handle specific error cases
      if (errorData?.errors?.email === 'emailAlreadyExists') {
        return {
          success: false,
          error: {
            ...errorData,
            message: 'An account with this email already exists.'
          }
        };
      }

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
      
      // Handle specific error cases
      if (errorData?.errors?.hash === 'invalidHash') {
        return {
          success: false,
          error: {
            ...errorData,
            message: 'Invalid or expired verification link. Please try registering again.'
          }
        };
      }

      if (errorData?.status_code === 404) {
        return {
          success: false,
          error: {
            ...errorData,
            message: 'User not found. Please register again.'
          }
        };
      }

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
  resendConfirmation: async (email: string): Promise<ApiResponse> => {
    try {
      // Use registration endpoint for unverified emails
      await api.post('/auth/customer/email/register', { email });
      return { 
        success: true,
        data: { message: 'Confirmation email sent! Please check your inbox.' }
      };
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      const errorData = axiosError.response?.data;
      
      // If email already exists and is verified
      if (errorData?.errors?.email === 'emailAlreadyExists') {
        return {
          success: false,
          error: {
            ...errorData,
            message: 'This email is already registered and verified. Please try logging in.'
          }
        };
      }

      return { 
        success: false, 
        error: errorData || {
          status_code: 500,
          message: 'Failed to resend confirmation email. Please try again.'
        }
      };
    }
  },

  // Login user and set JWT cookies
  login: async (credentials: LoginRequest): Promise<ApiResponse> => {
    try {
      const response = await api.post('/auth/customer/email/login', credentials);
      console.log('✅ Login successful, checking if cookies were set...');
      
      // Wait a bit for browser to process cookies
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check if cookies are now available
      const authCookie = getCookieValue('_elanAuth');
      const authRefreshCookie = getCookieValue('_elanAuthR');
      
      console.log('🔍 Post-login cookie check:', {
        _elanAuth: !!authCookie,
        _elanAuthR: !!authRefreshCookie,
        allCookies: document.cookie
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      return { success: false, error: axiosError.response?.data };
    }
  },

  // Get current user profile
  getCurrentUser: async (): Promise<ApiResponse<UserProfile>> => {
    try {
      console.log('🔍 Fetching current user from:', api.defaults.baseURL + '/auth/customer/me');
      
      // Enhanced cookie debugging
      const allCookies = document.cookie;
      console.log('🍪 All available cookies:', allCookies);
      
      // Check if cookies exist before making request
      const authCookie = getCookieValue('_elanAuth');
      const authRefreshCookie = getCookieValue('_elanAuthR');
      
      console.log('🔍 Cookie check details:', {
        _elanAuth: authCookie ? `Found (${authCookie.length} chars)` : 'Not found',
        _elanAuthR: authRefreshCookie ? `Found (${authRefreshCookie.length} chars)` : 'Not found',
        rawCookieString: allCookies
      });
      
      if (!authCookie || !authRefreshCookie) {
        console.log('❌ Auth cookies not found:', { 
          authCookie: !!authCookie, 
          authRefreshCookie: !!authRefreshCookie,
          availableCookies: allCookies.split(';').map(c => c.trim().split('=')[0])
        });
        return { 
          success: false, 
          error: { 
            status_code: 401, 
            message: 'No authentication cookies found' 
          } 
        };
      }
      
      console.log('🔐 Auth cookies found, making request...');
      const response = await api.get<UserProfile>('/auth/customer/me');
      console.log('✅ User data received:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      console.error('❌ Get current user error:', {
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
        url: axiosError.config?.url,
        baseURL: axiosError.config?.baseURL
      });
      return { success: false, error: axiosError.response?.data };
    }
  },

  // Update user profile
  updateProfile: async (updateData: UpdateProfileRequest): Promise<ApiResponse<UserProfile>> => {
    try {
      const response = await api.patch<UserProfile>('/auth/customer/me', updateData);
      return { success: true, data: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      return { success: false, error: axiosError.response?.data };
    }
  },

  // Refresh JWT tokens
  refreshToken: async (): Promise<ApiResponse> => {
    try {
      await api.post('/auth/customer/refresh');
      return { success: true };
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      return { success: false, error: axiosError.response?.data };
    }
  },

  // Logout user and clear cookies
  logout: async (): Promise<ApiResponse> => {
    try {
      await api.post('/auth/customer/logout');
      return { success: true };
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      return { success: false, error: axiosError.response?.data };
    }
  },

  // Initiate password reset process
  forgotPassword: async (email: string): Promise<ApiResponse> => {
    try {
      await api.post('/auth/customer/forgot/password', { email });
      return { success: true };
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      return { success: false, error: axiosError.response?.data };
    }
  },

  // Reset password using token from email
  resetPassword: async (hash: string, password: string): Promise<ApiResponse> => {
    try {
      await api.post('/auth/customer/reset/password', { hash, password });
      return { success: true };
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      return { success: false, error: axiosError.response?.data };
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

export default api;