// lib/pricing/calculate.ts
//
// The client-side price preview. This is a deliberate, line-for-line mirror of
// the server's customer pricing engine in
// `elan-backend/src/bookings/bookings.service.ts` (`BookingsService.create()`,
// and `calculatePickupPrice()`), which is the only authority on what a customer
// is charged.
//
// Why a mirror exists at all: `CreateBookingDto` requires the client to send
// base_price / pickup_price / total_price before the server tells it what they
// are. The server recomputes and overwrites all of them, so these numbers are
// for display and DTO validation only — never treat them as the amount charged.
// After creation, read `total_price` off the created booking.
//
// If you change anything here, change it against the backend source, not
// against a markdown file.

import { AddonType, type Addon, type TestType } from '@/lib/types/booking.types';
import type { PickupPricingConfig } from '@/lib/config/app-config';

// ---------------------------------------------------------------------------
// Add-on lookup — mirrors bookings.service.ts
// ---------------------------------------------------------------------------

/**
 * The add-on `type` that belongs to a test type.
 *
 * Note the seeder files mock tests under LESSON_G / LESSON_G2 as well, so this
 * one type is the whole catalogue for a given test type. The MOCK_TEST_* enum
 * members exist but are unused by the data.
 */
export const ADDON_TYPE_BY_TEST_TYPE: Record<TestType, AddonType> = {
  G: AddonType.LESSON_G,
  G2: AddonType.LESSON_G2,
};

/**
 * The server finds the concession add-on by exact name. Matching that string is
 * not a preference — it is the lookup key the charge depends on.
 * (`bookings.service.ts`: `formatAddonName`)
 */
const THIRTY_MINUTE_LESSON_NAME: Record<TestType, string> = {
  G: '30 Minutes Lesson Of G',
  G2: '30 Minutes Lesson Of G2',
};

/** Add-ons the customer may pick for this test type. */
export function addonsForTestType(
  addons: Addon[],
  testType: TestType
): Addon[] {
  return addons.filter(
    (addon) => addon.type === ADDON_TYPE_BY_TEST_TYPE[testType]
  );
}

/**
 * The 30-minute lesson whose price the server credits back on long pickups.
 * Returns null when the catalogue has no such row, in which case the server
 * grants no concession either.
 */
export function findThirtyMinuteLesson(
  addons: Addon[],
  testType: TestType
): Addon | null {
  return (
    addons.find(
      (addon) =>
        addon.type === ADDON_TYPE_BY_TEST_TYPE[testType] &&
        addon.name === THIRTY_MINUTE_LESSON_NAME[testType]
    ) ?? null
  );
}

/** Seconds. Mock tests are untimed and carry `duration: null`. */
const ONE_HOUR_LESSON_DURATION = 3600;

/**
 * The two add-ons a customer can pick on Step 3.
 *
 * Resolved STRUCTURALLY — by `type` plus `duration` — rather than by reading
 * the name. An admin may rename these rows (`PUT /admin/settings/addons/:id`
 * only protects the two 30-minute lessons, because the server's long-trip
 * credit is keyed on those exact names), and a renamed row that no longer
 * matched a hardcoded string used to resolve to `null`. That is silent: the
 * card still lit up as selected, the preview priced the add-on at zero, and the
 * server then charged its real price.
 *
 * The name prefixes are kept only as a fallback for catalogues whose durations
 * were edited to something unexpected.
 */
export function findMockTestAddon(
  addons: Addon[],
  testType: TestType
): Addon | null {
  const forType = addonsForTestType(addons, testType);

  return (
    forType.find((addon) => !addon.duration) ??
    forType.find((addon) => addon.name.toLowerCase().startsWith('mock test')) ??
    null
  );
}

export function findOneHourLessonAddon(
  addons: Addon[],
  testType: TestType
): Addon | null {
  const forType = addonsForTestType(addons, testType);

  return (
    forType.find((addon) => addon.duration === ONE_HOUR_LESSON_DURATION) ??
    forType.find((addon) =>
      addon.name.toLowerCase().startsWith('1 hour lesson')
    ) ??
    null
  );
}

// ---------------------------------------------------------------------------
// Pickup fare
// ---------------------------------------------------------------------------

/**
 * Distance-based pickup fare, in cents.
 *
 * `baseRate` per km for the first `baseDistance` km, then `normalRate` per km
 * beyond it, rounded once at the end.
 */
export function previewPickupPrice(
  distanceKm: number,
  config: PickupPricingConfig
): number {
  if (distanceKm <= 0) {
    return 0;
  }

  const { baseDistance, baseRate, normalRate } = config;

  const raw =
    distanceKm > baseDistance
      ? baseDistance * baseRate + (distanceKm - baseDistance) * normalRate
      : distanceKm * baseRate;

  return Math.round(raw);
}

// ---------------------------------------------------------------------------
// Full preview
// ---------------------------------------------------------------------------

export interface BookingPricePreview {
  /** The test centre's base fare, verbatim. */
  basePrice: number;
  /** Distance fare. 0 when meeting at the centre. */
  pickupPrice: number;
  /** FULL undiscounted price of the selected add-on — what the server stores. */
  addonsPrice: number;
  /** Long-trip credit deducted from the add-on. 0 when it does not apply. */
  concession: number;
  /**
   * The amount the server will charge, BEFORE any coupon.
   *
   * A coupon is deliberately not modelled here: POST /coupons/verify hides
   * `discount_type` and `min_purchase_amount` from customers, so `discount: 10`
   * is irreducibly ambiguous between "10 percent" and "10 cents". Show the
   * coupon as accepted and let the server return the real total.
   */
  total: number;
}

/**
 * Mirrors the pricing block of `BookingsService.create()`.
 *
 * Every amount is integer cents in and integer cents out — no float dollars at
 * any point.
 */
export function previewBookingPrice(args: {
  config: PickupPricingConfig;
  /** Selected test centre's `base_price`, in cents, from GET /drive-test-centers. */
  centerBasePrice: number;
  /** Driving distance from GET-backed /bookings/calculate-distance, in km. */
  distanceKm?: number;
  meetAtCenter: boolean;
  selectedAddon?: Addon | null;
  /** Result of findThirtyMinuteLesson() for this booking's test type. */
  thirtyMinuteLesson?: Addon | null;
}): BookingPricePreview {
  const {
    config,
    centerBasePrice,
    meetAtCenter,
    selectedAddon,
    thirtyMinuteLesson,
  } = args;

  // The server short-circuits distance to 0 for meet-at-centre and never calls
  // the Maps API in that case.
  const distanceKm = meetAtCenter ? 0 : (args.distanceKm ?? 0);

  const pickupPrice =
    distanceKm > 0 ? previewPickupPrice(distanceKm, config) : 0;

  let total = pickupPrice + centerBasePrice;

  const addonsPrice = selectedAddon?.price ?? 0;

  // The credit requires BOTH an add-on and a pickup strictly beyond
  // baseDistance — the same `>` the server uses, so exactly at the threshold
  // there is no concession.
  const concession =
    selectedAddon && distanceKm > config.baseDistance && thirtyMinuteLesson
      ? thirtyMinuteLesson.price
      : 0;

  if (selectedAddon) {
    total += addonsPrice - concession;
  }

  return {
    basePrice: centerBasePrice,
    pickupPrice,
    addonsPrice,
    concession,
    total,
  };
}

// ---------------------------------------------------------------------------
// Reading back a created booking
// ---------------------------------------------------------------------------

/**
 * The customer-visible saving on a booking that already exists.
 *
 * `base_price + pickup_price + addons_price` does NOT equal `total_price`
 * whenever a long-trip concession or a coupon applied, and `discount_amount` is
 * always null on the API (the real figure lives in `coupon_usages`, which no
 * customer endpoint exposes). So derive it from the components, and label it
 * generically — the number bundles concession and coupon together.
 */
export function deriveBookingAdjustment(booking: {
  base_price: number;
  pickup_price: number;
  addons_price: number;
  total_price: number;
}): number {
  const components =
    booking.base_price + booking.pickup_price + booking.addons_price;

  return Math.max(0, components - booking.total_price);
}
