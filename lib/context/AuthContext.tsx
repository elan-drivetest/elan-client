// lib/context/AuthContext.tsx
"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/lib/api';
import type { UserProfile } from '@/lib/types/auth.types';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (user: UserProfile) => void;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated
  const checkAuthStatus = async () => {
    try {
      const result = await authApi.getCurrentUser();
      if (result.success && result.data) {
        setUser(result.data);
      } else {
        setUser(null);
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = (userData: UserProfile) => {
    setUser(userData);
  };

  // Logout function
  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      // Redirect to home page
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  };

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    checkAuthStatus,
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