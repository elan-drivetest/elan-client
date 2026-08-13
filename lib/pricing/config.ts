// lib/pricing/config.ts
//
// Pickup-fare configuration, fetched from the server.
//
// These three values live in the backend's `settings` table, are admin-editable,
// and take effect on the very next booking with no deploy. They used to be
// hardcoded in five different places on this client, which meant an admin edit
// silently made every price preview wrong. They are now served by
// GET /v1/pricing-config, which reads them through the same
// SettingsService.getPickupPricingSettings() the booking engine uses.

import { createApiClient } from '@/lib/http/auth-refresh';

export interface PricingConfig {
  /** Kilometres charged at `baseRate` before `normalRate` applies. */
  baseDistance: number;
  /** Cents per km for the first `baseDistance` km. */
  baseRate: number;
  /** Cents per km beyond `baseDistance`. */
  normalRate: number;
}

/**
 * Mirrors PICKUP_PRICING_FALLBACKS in the backend's SettingsService.
 *
 * This is NOT a hardcoded price list — it is the same last-resort default the
 * server itself falls back to when a settings row is missing or unparseable.
 * It is used only when the endpoint cannot be reached, so a network blip
 * degrades to the server's own default rather than to a blank price.
 */
export const PRICING_CONFIG_FALLBACK: PricingConfig = {
  baseDistance: 50,
  baseRate: 100,
  normalRate: 50,
};

// Public, unauthenticated endpoint — the booking form renders before login.
const client = createApiClient('pricing');

let cached: Promise<PricingConfig> | null = null;

const isValid = (config: PricingConfig): boolean =>
  Object.values(config).every((value) => Number.isFinite(value) && value >= 0);

/**
 * Fetch the pricing config once per session and cache it.
 *
 * A failed fetch is not cached, so the next caller retries rather than being
 * stuck on the fallback for the whole session.
 */
export function getPricingConfig(): Promise<PricingConfig> {
  if (!cached) {
    cached = client
      .get('/pricing-config')
      .then(({ data }) => {
        const config: PricingConfig = {
          baseDistance: Number(data?.base_distance),
          baseRate: Number(data?.base_rate),
          normalRate: Number(data?.normal_rate),
        };

        if (!isValid(config)) {
          console.warn(
            'Pricing config from server is not usable, falling back:',
            data
          );
          return PRICING_CONFIG_FALLBACK;
        }

        return config;
      })
      .catch((error) => {
        console.warn('Could not load pricing config, using fallback:', error);
        cached = null;
        return PRICING_CONFIG_FALLBACK;
      });
  }

  return cached;
}

/** Test seam — drops the cached config so the next call refetches. */
export function resetPricingConfigCache(): void {
  cached = null;
}
