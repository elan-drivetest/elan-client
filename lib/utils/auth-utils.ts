// lib/utils/auth-utils.ts - Fixed for client-only Next.js project

// Helper function to get cookie value (works for same-domain cookies only)
export function getCookieValue(name: string): string | null {
  if (typeof window === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

// Check if authentication cookies exist
export function hasAuthCookies(): boolean {
  if (typeof window === 'undefined') return false;
  
  const authCookie = getCookieValue('_elanAuth');
  const refreshCookie = getCookieValue('_elanAuthR');
  
  return !!(authCookie && refreshCookie);
}

// This is the main authentication check function
// For cross-domain setup, we can't rely on cookie detection alone
// So we return true here and let the API calls determine the actual auth status
export function isAuthenticated(): boolean {
  // For cross-domain cookies between localhost and api-dev.elanroadtestrental.ca
  // The browser will still send cookies with withCredentials: true
  // But we can't detect them via document.cookie
  
  // Try to check local cookies first
  const hasLocalCookies = hasAuthCookies();
  
  if (hasLocalCookies) {
    return true;
  }
  
  // For cross-domain setup, we can't reliably detect cookies
  // So we'll assume authenticated and let API calls handle 401s
  return false; // Changed: Don't assume authenticated
}

// Debug function to log cookie status
export function debugCookieStatus(): void {
  if (typeof window === 'undefined') return;
  
  const allCookies = document.cookie;
  const authCookie = getCookieValue('_elanAuth');
  const refreshCookie = getCookieValue('_elanAuthR');
  
  console.log('🔍 Cookie Debug:', {
    domain: window.location.hostname,
    allCookies: allCookies || 'No cookies found',
    authCookie: authCookie ? 'Present' : 'Missing',
    refreshCookie: refreshCookie ? 'Present' : 'Missing',
    timestamp: new Date().toISOString()
  });
}

// Remove cookies (for logout)
export function clearAuthCookies(): void {
  if (typeof window === 'undefined') return;
  
  // Clear cookies on current domain
  document.cookie = '_elanAuth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + window.location.hostname;
  document.cookie = '_elanAuthR=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + window.location.hostname;
  
  // Also try to clear without domain specification
  document.cookie = '_elanAuth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = '_elanAuthR=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  
  console.log('🧹 Auth cookies cleared');
}