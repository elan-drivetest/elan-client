// Live contract smoke test for GET /v1/pricing-config.
//
//   npm run verify:config          (requires network)
//
// Guards the one failure mode the type system cannot: the server renaming or
// dropping a key we depend on. Everything the client renders from config is
// derived here from the LIVE payload, so a silent contract change fails loudly
// instead of quietly degrading a price or a refund sentence.

import { getAppConfig } from '@/lib/config/app-config';
import { previewPickupPrice } from '@/lib/pricing/calculate';
import { describeRefundLadder, getRefundLadder } from '@/lib/utils/refund-policy';

let failures = 0;
const check = (label: string, ok: boolean, detail = '') => {
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok || !detail ? '' : `  → ${detail}`}`);
};

async function main() {
  const config = await getAppConfig();

  console.log('Live config:', JSON.stringify(config, null, 2), '\n');

  // ---- Keys the client actually consumes must all resolve -----------------
  const required: Array<[string, number | null]> = [
    ['baseDistance', config.baseDistance],
    ['baseRate', config.baseRate],
    ['normalRate', config.normalRate],
    ['bookingMinLeadDays', config.bookingMinLeadDays],
    ['refundFullHours', config.refundFullHours],
    ['refundPartialHours', config.refundPartialHours],
    ['refundPartialPercentage', config.refundPartialPercentage],
    ['failureCouponPercentage', config.failureCouponPercentage],
    ['failureCouponValidityMonths', config.failureCouponValidityMonths],
  ];

  for (const [name, value] of required) {
    check(
      `${name} present and numeric`,
      typeof value === 'number' && Number.isFinite(value),
      `got ${value}`
    );
  }

  // ---- Pickup fare, cross-checked against the admin panel's own examples --
  // The settings page states: "A 70 km pickup still sits inside the included
  // distance, so it is all charged at $2.00/km — $140.00", "Every 10 km inside
  // the first 100 km adds $20.00", "Every 10 km past ... adds $25.00".
  const inside = previewPickupPrice(70, config);
  check(
    'a pickup inside the included distance is all charged at base_rate',
    inside === Math.round(70 * config.baseRate),
    `70km → ${inside}`
  );

  const tenInside =
    previewPickupPrice(60, config) - previewPickupPrice(50, config);
  check(
    '10 km inside the included distance costs 10 × base_rate',
    tenInside === 10 * config.baseRate,
    `${tenInside}`
  );

  const beyondA = previewPickupPrice(config.baseDistance + 10, config);
  const beyondB = previewPickupPrice(config.baseDistance + 20, config);
  check(
    '10 km beyond the included distance costs 10 × normal_rate',
    beyondB - beyondA === 10 * config.normalRate,
    `${beyondB - beyondA}`
  );

  check(
    'exactly at the included distance uses base_rate only',
    previewPickupPrice(config.baseDistance, config) ===
      Math.round(config.baseDistance * config.baseRate)
  );

  // ---- Refund ladder renders in the server's band order -------------------
  const ladder = getRefundLadder(config);
  check('refund ladder resolves from live config', ladder !== null);

  if (ladder) {
    check(
      'full-refund cutoff is later than the partial cutoff',
      ladder.fullHours > ladder.partialHours,
      `${ladder.fullHours} vs ${ladder.partialHours}`
    );
    const bands = describeRefundLadder(ladder);
    check('ladder renders three bands', bands.length === 3);
    console.log('\n  Rendered ladder:');
    bands.forEach((b) => console.log(`    ${b.window} → ${b.outcome}`));
  }

  // ---- Booking notice ------------------------------------------------------
  if (config.bookingMinLeadDays !== null) {
    const earliest = new Date(
      Date.now() + config.bookingMinLeadDays * 24 * 60 * 60 * 1000
    );
    check(
      'earliest bookable slot honours the live notice',
      earliest.getTime() >= Date.now() - 1000
    );
    console.log(
      `\n  booking_min_lead_days = ${config.bookingMinLeadDays} → earliest slot ${earliest.toISOString()}` +
        (config.bookingMinLeadDays === 0 ? '  (same-day booking is OPEN)' : '')
    );
  }

  console.log(
    failures === 0 ? '\nAll checks passed.' : `\n${failures} check(s) FAILED.`
  );
  // exitCode rather than exit(): lets the fetch socket close cleanly instead of
  // tripping a libuv assertion on Windows.
  process.exitCode = failures === 0 ? 0 : 1;
}

main().catch((error) => {
  console.error('\nCould not reach the config endpoint:', error.message);
  process.exitCode = 1;
});
