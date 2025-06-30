// lib/utils/distance-calculator.ts - Enhanced with backend API integration
import { Coordinates, PricingBreakdown, Addon, Coupon } from '@/lib/types/booking.types';
import { bookingService } from '@/lib/services/booking.service';

// ============================================================================
// PRICING CONSTANTS (in cents)
// ============================================================================

// Distance-based pricing tiers
export const PRICING_TIERS = {
  FIRST_50KM_RATE: 100,    // $1.00 per km in cents
  BEYOND_50KM_RATE: 50,    // $0.50 per km in cents
  FREE_DROPOFF_THRESHOLD: 50,    // 50km threshold for free dropoff
  FREE_30MIN_LESSON_THRESHOLD: 50,  // 50km threshold for free 30-min lesson
  FREE_1HR_LESSON_THRESHOLD: 100,   // 100km threshold for free 1-hour lesson
} as const;

// Add-on pricing (in cents) - these will be overridden by API data
export const DEFAULT_ADDON_PRICING = {
  MOCK_TEST_G2: 5499,    // $54.99
  MOCK_TEST_G: 6499,     // $64.99
  LESSON_G2_1HR: 5000,   // $50.00
  LESSON_G_1HR: 6000,    // $60.00
  LESSON_G2_30MIN: 2500, // $25.00 (for upgrade calculations)
  LESSON_G_30MIN: 3000,  // $30.00 (for upgrade calculations)
} as const;

// Upgrade pricing (in cents)
export const UPGRADE_PRICING = {
  G2: {
    LESSON_30MIN_TO_1HR: 2500,     // $25.00 upgrade
    LESSON_30MIN_TO_MOCK: 2999,    // $29.99 upgrade
    LESSON_1HR_TO_MOCK: 499,       // $4.99 upgrade
  },
  G: {
    LESSON_30MIN_TO_1HR: 3000,     // $30.00 upgrade
    LESSON_30MIN_TO_MOCK: 3499,    // $34.99 upgrade
    LESSON_1HR_TO_MOCK: 499,       // $4.99 upgrade
  }
} as const;

// ============================================================================
// DISTANCE CALCULATION FUNCTIONS - ENHANCED WITH BACKEND API
// ============================================================================

/**
 * Calculate distance between two coordinates using backend API with frontend fallback
 * Returns distance in kilometers
 */
export async function calculateDistance(point1: Coordinates, point2: Coordinates): Promise<number> {
  try {
    // Use backend API through booking service
    const distance = await bookingService.calculateDistance(
      { lat: point1.lat, lng: point1.lng },
      { lat: point2.lat, lng: point2.lng }
    );
    console.log('✅ Backend distance calculation successful:', distance);
    return distance;
  } catch (error) {
    console.error('❌ Backend distance calculation failed, using frontend fallback:', error);
    // Fallback to frontend calculation
    return calculateDistanceFrontend(point1, point2);
  }
}

/**
 * Frontend fallback distance calculation using Haversine formula
 * Returns distance in kilometers
 */
function calculateDistanceFrontend(point1: Coordinates, point2: Coordinates): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(point2.lat - point1.lat);
  const dLng = toRadians(point2.lng - point1.lng);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.lat)) * Math.cos(toRadians(point2.lat)) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// ============================================================================
// PICKUP PRICING CALCULATIONS
// ============================================================================

/**
 * Calculate pickup pricing based on distance
 * Returns pricing breakdown in cents
 */
export function calculatePickupPricing(distance: number): {
  pickup_price: number;
  distance_breakdown: {
    first_50km: number;
    beyond_50km: number;
    first_50km_cost: number;
    beyond_50km_cost: number;
  };
  free_benefits: {
    free_dropoff: boolean;
    free_30min_lesson: boolean;
    free_1hr_lesson: boolean;
  };
} {
  if (distance <= 0) {
    return {
      pickup_price: 0,
      distance_breakdown: {
        first_50km: 0,
        beyond_50km: 0,
        first_50km_cost: 0,
        beyond_50km_cost: 0,
      },
      free_benefits: {
        free_dropoff: false,
        free_30min_lesson: false,
        free_1hr_lesson: false,
      }
    };
  }

  // Calculate distance breakdown
  const first_50km = Math.min(distance, 50);
  const beyond_50km = Math.max(0, distance - 50);
  
  // Calculate costs in cents
  const first_50km_cost = Math.round(first_50km * PRICING_TIERS.FIRST_50KM_RATE);
  const beyond_50km_cost = Math.round(beyond_50km * PRICING_TIERS.BEYOND_50KM_RATE);
  
  const pickup_price = first_50km_cost + beyond_50km_cost;

  // Determine free benefits
  const free_benefits = {
    free_dropoff: distance >= PRICING_TIERS.FREE_DROPOFF_THRESHOLD,
    free_30min_lesson: distance >= PRICING_TIERS.FREE_30MIN_LESSON_THRESHOLD && distance < PRICING_TIERS.FREE_1HR_LESSON_THRESHOLD,
    free_1hr_lesson: distance >= PRICING_TIERS.FREE_1HR_LESSON_THRESHOLD,
  };

  return {
    pickup_price,
    distance_breakdown: {
      first_50km,
      beyond_50km,
      first_50km_cost,
      beyond_50km_cost,
    },
    free_benefits
  };
}

// ============================================================================
// COMPREHENSIVE PRICING CALCULATION - ENHANCED WITH BACKEND DISTANCE
// ============================================================================

/**
 * Calculate complete pricing breakdown for a booking
 * All amounts in cents
 * Uses backend distance calculation
 */
export async function calculateCompletePricing(params: {
  basePrice: number;           // Test center base price in cents
  pickupCoordinates?: Coordinates; // Pickup location coordinates
  testCenterCoordinates?: Coordinates; // Test center coordinates
  meetAtCenter?: boolean;      // Whether meeting at center (no pickup)
  addon?: Addon | null;       // Selected addon
  coupon?: Coupon | null;     // Applied coupon
  testType?: string;          // Test type for addon filtering
}): Promise<PricingBreakdown> {
  let pickup_price = 0;
  let addon_price = 0;
  let discount_amount = 0;

  // Calculate pickup price using backend distance calculation
  if (!params.meetAtCenter && params.pickupCoordinates && params.testCenterCoordinates) {
    try {
      const distance = await calculateDistance(params.pickupCoordinates, params.testCenterCoordinates);
      const pickupCalculation = calculatePickupPricing(distance);
      pickup_price = pickupCalculation.pickup_price;
    } catch (error) {
      console.error('❌ Error calculating pickup price:', error);
      // Pickup price remains 0 if calculation fails
    }
  }

  // Calculate addon price
  if (params.addon) {
    addon_price = params.addon.price;
  }

  // Calculate subtotal
  const subtotal = params.basePrice + pickup_price + addon_price;

  // Apply coupon discount
  if (params.coupon && subtotal >= params.coupon.min_purchase_amount) {
    discount_amount = Math.min(params.coupon.discount, subtotal);
  }

  // Calculate final total
  const total_price = Math.max(0, subtotal - discount_amount);

  return {
    base_price: params.basePrice,
    pickup_price,
    addon_price,
    subtotal,
    discount_amount,
    total_price,
    coupon_code: params.coupon?.code
  };
}

/**
 * Legacy synchronous pricing calculation (uses provided distance)
 * Maintained for backward compatibility
 */
export function calculateCompletePricingSync(params: {
  basePrice: number;
  pickupDistance?: number;
  meetAtCenter?: boolean;
  addon?: Addon | null;
  coupon?: Coupon | null;
  testType?: string;
}): PricingBreakdown {
  let pickup_price = 0;
  let addon_price = 0;
  let discount_amount = 0;

  // Calculate pickup price
  if (!params.meetAtCenter && params.pickupDistance && params.pickupDistance > 0) {
    const pickupCalculation = calculatePickupPricing(params.pickupDistance);
    pickup_price = pickupCalculation.pickup_price;
  }

  // Calculate addon price
  if (params.addon) {
    addon_price = params.addon.price;
  }

  // Calculate subtotal
  const subtotal = params.basePrice + pickup_price + addon_price;

  // Apply coupon discount
  if (params.coupon && subtotal >= params.coupon.min_purchase_amount) {
    discount_amount = Math.min(params.coupon.discount, subtotal);
  }

  // Calculate final total
  const total_price = Math.max(0, subtotal - discount_amount);

  return {
    base_price: params.basePrice,
    pickup_price,
    addon_price,
    subtotal,
    discount_amount,
    total_price,
    coupon_code: params.coupon?.code
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if distance qualifies for free perks
 */
export function getDistancePerks(distance: number): {
  free_dropoff: boolean;
  free_30min_lesson: boolean;
  free_1hr_lesson: boolean;
} {
  return {
    free_dropoff: distance >= PRICING_TIERS.FREE_DROPOFF_THRESHOLD,
    free_30min_lesson: distance >= PRICING_TIERS.FREE_30MIN_LESSON_THRESHOLD && distance < PRICING_TIERS.FREE_1HR_LESSON_THRESHOLD,
    free_1hr_lesson: distance >= PRICING_TIERS.FREE_1HR_LESSON_THRESHOLD,
  };
}

/**
 * Calculate distance and pricing in one call (backend API)
 */
export async function calculateDistanceAndPricing(
  pickupCoordinates: Coordinates,
  testCenterCoordinates: Coordinates
): Promise<{
  distance: number;
  pricing: ReturnType<typeof calculatePickupPricing>;
}> {
  const distance = await calculateDistance(pickupCoordinates, testCenterCoordinates);
  const pricing = calculatePickupPricing(distance);
  
  return {
    distance,
    pricing
  };
}