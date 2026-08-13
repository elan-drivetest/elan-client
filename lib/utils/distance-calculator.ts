// lib/utils/distance-calculator.ts
//
// Distance lookup only. All pricing now lives in lib/pricing/, which is a
// single mirror of the server engine.
//
// This file used to carry a second copy of the pickup fare tiers, an invented
// "free lesson at 50/100 km" model that the backend has no concept of, and a
// hand-written UPGRADE_PRICING table. None of that existed server-side; the
// real rule is the long-trip concession in lib/pricing/calculate.ts.

import { Coordinates } from '@/lib/types/booking.types';
import { bookingService } from '@/lib/services/booking.service';

/**
 * Driving distance between two points, in kilometres.
 *
 * Delegates to POST /bookings/calculate-distance, which is Google Distance
 * Matrix driving distance — the same source the server prices against.
 *
 * There is deliberately NO local fallback. The previous Haversine fallback
 * returned straight-line distance, which is always shorter than the driving
 * route, so a failed API call silently under-quoted the pickup fare. Failing
 * loudly is correct: without a real distance there is no honest price to show.
 */
export async function calculateDistance(
  point1: Coordinates,
  point2: Coordinates
): Promise<number> {
  return bookingService.calculateDistance(
    { lat: point1.lat, lng: point1.lng },
    { lat: point2.lat, lng: point2.lng }
  );
}
