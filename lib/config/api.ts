// lib/config/api.ts
//
// Single source of truth for the backend base URL.
//
// This used to be hardcoded in three separate files (lib/api.ts,
// lib/services/booking.service.ts, lib/services/fileUpload.service.ts), which
// meant an environment switch had to be made in three places and missing the
// fileUpload one sent document uploads to the wrong backend silently.
//
// Set NEXT_PUBLIC_API_BASE_URL at build time to point at a different
// environment. The fallback preserves the previous hardcoded dev value so
// existing deploys keep working unchanged.
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api-dev.elanroadtestrental.ca/v1';
