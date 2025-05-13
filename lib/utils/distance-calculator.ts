// lib/utils/distance-calculator.ts

// Define interface for distance calculation results
export interface DistanceCalculationResult {
  distanceKm: number;
  basePrice: number;
  distancePrice: number;
  totalPrice: number;
  freeDropoff: boolean;
  freeDrivingLesson: string | null; // '30min' | '1hour' | null
}

// Base prices for test types
export const BASE_PRICES = {
  'G2': 75,
  'G': 85,
};

// Add-on prices
export const ADD_ON_PRICES = {
  'mock-test': {
    'G2': 54.99,
    'G': 64.99,
  },
  'driving-lesson': {
    'G2': 50.00,
    'G': 60.00,
  },
};

// Upgrade costs
export const UPGRADE_COSTS = {
  // From 30min to 1hour lesson
  '30min-to-1hour': {
    'G2': 25.00,
    'G': 30.00,
  },
  // From 30min lesson to mock test
  '30min-to-mock': {
    'G2': 29.99,
    'G': 34.99,
  },
  // From 1hour lesson to mock test
  '1hour-to-mock': {
    'G2': 4.99,
    'G': 4.99,
  },
};

/**
 * Calculate pricing and perks based on distance and test type
 * @param distanceKm Distance in kilometers
 * @param testType 'G2' or 'G' test type
 * @returns Calculation result with prices and perks
 */
export function calculateDistanceBasedPricing(
  distanceKm: number,
  testType: 'G2' | 'G' | '' = 'G2'
): DistanceCalculationResult {
  // Default to G2 if not specified
  const type = testType || 'G2';
  const basePrice = BASE_PRICES[type];
  
  // Calculate distance price
  let distancePrice = 0;
  
  if (distanceKm > 0) {
    // First 50km: $1/km
    if (distanceKm <= 50) {
      distancePrice = distanceKm * 1;
    } else {
      // First 50km at $1/km
      const first50km = 50 * 1;
      // Remaining distance at $0.50/km
      const remainingDistance = distanceKm - 50;
      const remainingPrice = remainingDistance * 0.5;
      
      distancePrice = first50km + remainingPrice;
    }
  }
  
  // Determine perks based on distance
  const freeDropoff = distanceKm > 50;
  let freeDrivingLesson = null;
  
  if (distanceKm > 100) {
    freeDrivingLesson = '1hour';
  } else if (distanceKm > 50) {
    freeDrivingLesson = '30min';
  }
  
  // Calculate total price
  const totalPrice = basePrice + distancePrice;
  
  return {
    distanceKm,
    basePrice,
    distancePrice,
    totalPrice,
    freeDropoff,
    freeDrivingLesson,
  };
}

// Function to estimate distance between two addresses
// In a real application, this would use Google Maps or similar API
export function estimateDistance(pickupAddress: string): number {
  // This is a mock implementation
  // In a real app, you would call a geocoding API and calculate actual distance
  
  // For mock purposes, generate a distance based on address length
  // This is just for demonstration
  const addressLength = pickupAddress.length;
  
  // Create a semi-random distance that's more realistic
  let distance = 0;
  
  // Generate distance based on some arbitrary logic for demo purposes
  if (addressLength < 20) {
    // Short address, likely nearby
    distance = 10 + (addressLength % 40);
  } else if (addressLength < 40) {
    // Medium address, moderate distance
    distance = 30 + (addressLength % 50);
  } else {
    // Longer address, farther away
    distance = 60 + (addressLength % 100);
  }
  
  return Math.round(distance);
}