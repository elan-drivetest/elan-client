// lib/context/AuthContext.tsx - Fixed to not auto-check auth on mount
"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { authApi } from '@/lib/api';
import type { UserProfile } from '@/lib/types/auth.types';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (user: UserProfile) => void;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  refreshAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Changed: start as false, not true

  // Check if user is authenticated by calling the API
  const checkAuthStatus = async () => {
    console.log('🔍 Checking authentication status...');
    setIsLoading(true);
    
    try {
      // Call the API to get current user
      const result = await authApi.getCurrentUser();
      
      if (result.success && result.data) {
        console.log('✅ User authenticated:', {
          id: result.data.id,
          email: result.data.email,
          name: result.data.full_name
        });
        setUser(result.data);
      } else {
        console.log('❌ User not authenticated');
        setUser(null);
      }
    } catch (error) {
      console.error('💥 Auth check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Set user data after successful login
  const login = (userData: UserProfile) => {
    console.log('✅ Setting user data in context:', {
      id: userData.id,
      email: userData.email,
      name: userData.full_name
    });
    setUser(userData);
  };

  // Manually refresh authentication token
  const refreshAuth = async (): Promise<boolean> => {
    console.log('🔄 Manually refreshing authentication...');
    setIsLoading(true);

    try {
      const result = await authApi.refreshToken();

      if (result.success && result.data) {
        console.log('✅ Auth refresh successful, updating user data');
        setUser(result.data);
        return true;
      } else {
        console.log('❌ Auth refresh failed');
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error('💥 Auth refresh error:', error);
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    console.log('🚪 Starting logout process...');
    setIsLoading(true);

    try {
      // Call backend logout API
      await authApi.logout();
      console.log('✅ Backend logout successful');
    } catch (error) {
      console.error('❌ Backend logout error:', error);
      // Continue with frontend logout even if backend fails
    } finally {
      console.log('🧹 Clearing user data and redirecting...');
      setUser(null);
      setIsLoading(false);

      // Redirect to home page
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  };

  // Removed: useEffect that auto-checks auth on mount
  // The auth check will only happen when explicitly called

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    checkAuthStatus,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}