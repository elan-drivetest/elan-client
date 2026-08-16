// lib/config/app-config.ts
//
// Every server setting this app is allowed to read, fetched from the public
// GET /v1/pricing-config endpoint.
//
// All of these are admin-editable and take effect on the next request with no
// deploy, so anything hardcoded here drifts silently. The endpoint is an
// explicit allow-list on the server; it resolves each key through the same code
// path the booking/refund engines use, so what we render cannot disagree with
// what the server enforces.
//
// The server remains authoritative in every case. These values drive
// *presentation* — a price preview, a date-picker floor, a refund sentence —
// while the server independently re-resolves and enforces them on write.

import { API_BASE_URL } from '@/lib/config/api';

/**
 * The three values the price preview cannot run without.
 *
 * Kept as its own type because lib/pricing/calculate.ts takes exactly these and
 * nothing else — the pricing engine has no business seeing refund policy.
 */
export interface PickupPricingConfig {
  /** Kilometres charged at `baseRate` before `normalRate` applies. */
  baseDistance: number;
  /** Cents per km for the first `baseDistance` km. */
  baseRate: number;
  /** Cents per km beyond `baseDistance`. */
  normalRate: number;
}

/**
 * Policy numbers used for copy and input constraints.
 *
 * `null` means the server did not supply the key — an older backend, or a
 * key that was renamed. Callers MUST degrade (omit the number, relax the
 * constraint) rather than substitute a guess: stating the wrong refund window
 * or blocking a date the server would accept is worse than saying less.
 */
export interface PolicyConfig {
  /** Days ahead of now a test date must be. 0 means same-day booking is open. */
  bookingMinLeadDays: number | null;
  /** Hours before the test at or above which a refund is 100%. */
  refundFullHours: number | null;
  /** Hours before the test at or above which the partial rate applies. */
  refundPartialHours: number | null;
  /** The partial refund rate, as a percentage. */
  refundPartialPercentage: number | null;
  /** Discount percentage on the coupon issued after a failed test. */
  failureCouponPercentage: number | null;
  /** How long that coupon stays valid, in months. */
  failureCouponValidityMonths: number | null;
  /**
   * Furthest a pickup may be from the test centre, in km.
   *
   * A *serviceability* limit, not a pricing knob: past it the server refuses the
   * booking rather than pricing it. Nothing bounded this before, so a geocode
   * that landed in the wrong province produced a four-figure road-test fare and
   * published a multi-thousand-kilometre job to the instructor board.
   *
   * `null` on a backend that predates the setting — impose no constraint then,
   * exactly as with `bookingMinLeadDays`. The server enforces regardless.
   */
  maxPickupDistanceKm: number | null;
}

export type AppConfig = PickupPricingConfig & PolicyConfig;

// The endpoint also publishes instructor pay, referral bonuses and ride-window
// settings. They belong to the instructor app and are deliberately NOT surfaced
// here — a customer-facing bundle should not carry Elan's margin structure
// around, and anything typed tends to eventually get rendered.

// Public and unauthenticated, so this deliberately uses plain `fetch` rather
// than the app's axios client: no credentials, no 401/refresh interceptor, and
// no browser-only dependencies — which lets Server Components (Terms, FAQ) use
// the same parser and the same endpoint.
const CONFIG_URL = `${API_BASE_URL}/pricing-config`;

const asNumber = (value: unknown): number | null => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
function parseAppConfig(data: any): AppConfig | null {
  const baseDistance = asNumber(data?.base_distance);
  const baseRate = asNumber(data?.base_rate);
  const normalRate = asNumber(data?.normal_rate);

  // Without the fare trio there is no honest price to show, so this is a hard
  // failure rather than a partial config.
  if (baseDistance === null || baseRate === null || normalRate === null) {
    return null;
  }

  return {
    baseDistance,
    baseRate,
    normalRate,
    bookingMinLeadDays: asNumber(data?.booking_min_lead_days),
    refundFullHours: asNumber(data?.refund_full_hours),
    refundPartialHours: asNumber(data?.refund_partial_hours),
    refundPartialPercentage: asNumber(data?.refund_partial_percentage),
    failureCouponPercentage: asNumber(data?.failure_coupon_percentage),
    failureCouponValidityMonths: asNumber(data?.failure_coupon_validity_months),
    maxPickupDistanceKm: asNumber(data?.max_pickup_distance_km),
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

let cached: Promise<AppConfig> | null = null;

/**
 * Fetch the config once per session.
 *
 * Rejects rather than falling back to constants. There used to be a 50/100/50
 * fallback here, copied from the server's own defaults — but those are what the
 * server uses when a settings ROW IS MISSING, not what it charges. With rows
 * present at 100/200/250 that fallback under-quoted a 120 km pickup by $165.
 * A wrong price is worse than no price, so callers handle the failure.
 *
 * A failed fetch is not cached, so the next caller retries.
 */
export function getAppConfig(): Promise<AppConfig> {
  if (!cached) {
    cached = fetch(CONFIG_URL)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Pricing config request failed (${response.status})`);
        }

        const config = parseAppConfig(await response.json());

        if (!config) {
          throw new Error('Pricing config response was missing the fare rates');
        }

        return config;
      })
      .catch((error) => {
        cached = null;
        throw error;
      });
  }

  return cached;
}

/** Drops the cached config so the next call refetches. */
export function resetAppConfigCache(): void {
  cached = null;
}

/**
 * Server Component variant.
 *
 * Static pages (Terms, FAQ) state the refund ladder and booking notice, so they
 * need the same values without shipping a client bundle or losing SSR. Cached
 * by Next for `revalidateSeconds`, so an admin change reaches these pages within
 * that window rather than at the next deploy.
 *
 * Returns null on any failure — callers render number-free copy instead.
 */
export async function fetchAppConfigOnServer(
  revalidateSeconds = 300
): Promise<AppConfig | null> {
  try {
    const response = await fetch(CONFIG_URL, {
      next: { revalidate: revalidateSeconds },
    });

    if (!response.ok) return null;

    return parseAppConfig(await response.json());
  } catch (error) {
    console.error('Could not load pricing config on the server:', error);
    return null;
  }
}
