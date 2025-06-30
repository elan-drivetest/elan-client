// lib/hooks/useForgotPassword.ts
"use client"

import { useState } from 'react';
import { authApi, handleApiError } from '@/lib/api';

export const useForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState<string>('');

  const validateEmail = (email: string): { isValid: boolean; message?: string } => {
    if (!email) {
      return { isValid: false, message: 'Email is required' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, message: 'Please enter a valid email address' };
    }

    return { isValid: true };
  };

  const validatePassword = (password: string): { isValid: boolean; message?: string } => {
    if (!password) {
      return { isValid: false, message: 'Password is required' };
    }

    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters long' };
    }

    return { isValid: true };
  };

  const requestReset = async (email: string) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setMessage('');

    try {
      // Validate email first
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        setError(emailValidation.message || 'Invalid email');
        return { success: false, error: emailValidation.message };
      }

      const result = await authApi.forgotPassword(email);
      
      if (result.success) {
        setSuccess(true);
        setMessage('Password reset email sent!');
        return result;
      } else {
        const errorMessage = handleApiError(result.error);
        setError(errorMessage);
        return result;
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      const errorMessage = 'Network error. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (hash: string, password: string) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setMessage('');

    try {
      // Validate password first
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        setError(passwordValidation.message || 'Invalid password');
        return { success: false, error: passwordValidation.message };
      }

      const result = await authApi.resetPassword(hash, password);
      
      if (result.success) {
        setSuccess(true);
        setMessage('Password reset successfully!');
        return result;
      } else {
        const errorMessage = handleApiError(result.error);
        setError(errorMessage);
        return result;
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      const errorMessage = 'Network error. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setError(null);
    setSuccess(false);
    setMessage('');
  };

  return {
    requestReset,
    resetPassword,
    isLoading,
    error,
    success,
    message,
    resetState,
    validateEmail,
    validatePassword
  };
};