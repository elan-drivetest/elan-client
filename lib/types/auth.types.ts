// lib/types/auth.types.ts

export interface RegisterRequest {
  confirmPassword: string;
  phone: unknown;
  marketing: boolean | undefined;
  full_name: string;
  email: string;
  password: string;
  phone_number?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  full_name?: string;
  email?: string;
  password?: string;
  oldPassword?: string;
  phone_number?: string;
  address?: string;
}

export interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  phone_number?: string;
  address?: string;
  photo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  phone_number?: string;
  address?: string;
  photo_url?: string;
}

export interface UpdateProfileRequest {
  full_name?: string;
  email?: string;
  password?: string;
  oldPassword?: string;
  phone_number?: string;
  address?: string;
}

export interface ApiError {
  status_code: number;
  message: string;
  errors?: Record<string, string[] | string>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// lib/types/auth.types.ts

export interface RegisterRequest {
  confirmPassword: string;
  phone: unknown;
  marketing: boolean | undefined;
  full_name: string;
  email: string;
  password: string;
  phone_number?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  full_name?: string;
  email?: string;
  password?: string;
  oldPassword?: string;
  phone_number?: string;
  address?: string;
  photo_url?: string; // Added photo_url field
}

export interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  phone_number?: string;
  address?: string;
  photo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ApiError {
  status_code: number;
  message: string;
  errors?: Record<string, string[] | string>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}