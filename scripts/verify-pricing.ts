// Verifies lib/pricing/calculate.ts against the worked examples in the
// backend's docs/BUSINESS_LOGIC.md §15.
//
//   npm run verify:pricing
//
// Run this after touching anything in lib/pricing/. The client preview has to
// reproduce the server's arithmetic exactly, and these are the server's own
// published examples — including the cases the previous implementation got
// wrong (>100 km with an add-on, and the exactly-at-threshold boundary).
import {
  previewPickupPrice,
  previewBookingPrice,
  findThirtyMinuteLesson,
  addonsForTestType,
  deriveBookingAdjustment,
} from '@/lib/pricing/calculate';
import { AddonType, TestType, type Addon } from '@/lib/types/booking.types';

const CONFIG = { baseDistance: 50, baseRate: 100, normalRate: 50 };

const addon = (id: number, name: string, type: AddonType, price: number): Addon =>
  ({ id, name, type, price, duration: 0, description: '' } as unknown as Addon);

// Seeded catalogue, BUSINESS_LOGIC.md §4.2
const ADDONS: Addon[] = [
  addon(1, '30 Minutes Lesson Of G', AddonType.LESSON_G, 3000),
  addon(2, '1 Hour Lesson Of G', AddonType.LESSON_G, 6000),
  addon(3, '30 Minutes Lesson Of G2', AddonType.LESSON_G2, 2500),
  addon(4, '1 Hour Lesson Of G2', AddonType.LESSON_G2, 5000),
  addon(5, 'Mock Test Of G', AddonType.LESSON_G, 6499),
  addon(6, 'Mock Test Of G2', AddonType.LESSON_G2, 5499),
];

const BARRIE_BASE = 8000;

let failures = 0;
const check = (label: string, actual: unknown, expected: unknown) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok ? '' : `\n        expected ${JSON.stringify(expected)}\n        actual   ${JSON.stringify(actual)}`}`);
};

// ---- Example A: meet at centre -------------------------------------------
check(
  'A: meet at centre → 8000',
  previewBookingPrice({
    config: CONFIG,
    centerBasePrice: BARRIE_BASE,
    meetAtCenter: true,
    distanceKm: 999, // must be ignored
  }),
  { basePrice: 8000, pickupPrice: 0, addonsPrice: 0, concession: 0, total: 8000 }
);

// ---- Example B: 12.4 km, no add-on ---------------------------------------
check('B: pickup fare 12.4 km → 1240', previewPickupPrice(12.4, CONFIG), 1240);
check(
  'B: total → 9240',
  previewBookingPrice({
    config: CONFIG,
    centerBasePrice: BARRIE_BASE,
    meetAtCenter: false,
    distanceKm: 12.4,
  }).total,
  9240
);

// ---- Example C: 82.6 km, G, 1 Hour Lesson Of G → concession fires --------
check('C: pickup fare 82.6 km → 6630', previewPickupPrice(82.6, CONFIG), 6630);

const exampleC = previewBookingPrice({
  config: CONFIG,
  centerBasePrice: BARRIE_BASE,
  meetAtCenter: false,
  distanceKm: 82.6,
  selectedAddon: ADDONS.find((a) => a.id === 2), // 1 Hour Lesson Of G, 6000
  thirtyMinuteLesson: findThirtyMinuteLesson(ADDONS, TestType.G),
});
check('C: full breakdown', exampleC, {
  basePrice: 8000,
  pickupPrice: 6630,
  addonsPrice: 6000,
  concession: 3000,
  total: 17630,
});
check(
  'C: components do NOT sum to total (8000+6630+6000=20630 vs 17630)',
  exampleC.basePrice + exampleC.pickupPrice + exampleC.addonsPrice !== exampleC.total,
  true
);
check(
  'C: derived adjustment from stored booking → 3000',
  deriveBookingAdjustment({
    base_price: 8000,
    pickup_price: 6630,
    addons_price: 6000,
    total_price: 17630,
  }),
  3000
);

// ---- Concession lookup per test type -------------------------------------
check('30-min lesson for G → 3000', findThirtyMinuteLesson(ADDONS, TestType.G)?.price, 3000);
check('30-min lesson for G2 → 2500', findThirtyMinuteLesson(ADDONS, TestType.G2)?.price, 2500);
check(
  'add-ons for G2 are only LESSON_G2',
  addonsForTestType(ADDONS, TestType.G2).map((a) => a.id),
  [3, 4, 6]
);

// ---- The >100 km case the OLD code got wrong -----------------------------
// G2, 120 km, Mock Test Of G2. Server: 50*100 + 70*50 = 8500 pickup;
// 8500 + 8000 = 16500; + 5499 - 2500 = 19499.
check('120 km pickup fare → 8500', previewPickupPrice(120, CONFIG), 8500);
check(
  '>100 km + mock test (previously under-quoted by $25) → 19499',
  previewBookingPrice({
    config: CONFIG,
    centerBasePrice: BARRIE_BASE,
    meetAtCenter: false,
    distanceKm: 120,
    selectedAddon: ADDONS.find((a) => a.id === 6), // Mock Test Of G2, 5499
    thirtyMinuteLesson: findThirtyMinuteLesson(ADDONS, TestType.G2),
  }).total,
  19499
);

// ---- Boundary: exactly baseDistance → NO concession (server uses `>`) ----
check(
  'exactly 50 km with add-on → no concession',
  previewBookingPrice({
    config: CONFIG,
    centerBasePrice: BARRIE_BASE,
    meetAtCenter: false,
    distanceKm: 50,
    selectedAddon: ADDONS.find((a) => a.id === 2),
    thirtyMinuteLesson: findThirtyMinuteLesson(ADDONS, TestType.G),
  }),
  { basePrice: 8000, pickupPrice: 5000, addonsPrice: 6000, concession: 0, total: 19000 }
);

// ---- No add-on beyond baseDistance → NO concession -----------------------
check(
  '82.6 km, no add-on → no concession',
  previewBookingPrice({
    config: CONFIG,
    centerBasePrice: BARRIE_BASE,
    meetAtCenter: false,
    distanceKm: 82.6,
    thirtyMinuteLesson: findThirtyMinuteLesson(ADDONS, TestType.G),
  }).total,
  14630
);

// ---- Picking the 30-min lesson itself beyond baseDistance → free --------
check(
  '30-min lesson itself beyond 50 km → add-on costs nothing (§5.2)',
  previewBookingPrice({
    config: CONFIG,
    centerBasePrice: BARRIE_BASE,
    meetAtCenter: false,
    distanceKm: 82.6,
    selectedAddon: ADDONS.find((a) => a.id === 1), // 30 Minutes Lesson Of G
    thirtyMinuteLesson: findThirtyMinuteLesson(ADDONS, TestType.G),
  }).total,
  14630
);

// ---- Admin changes the tiers → preview follows, no deploy ---------------
check(
  'live config change (bd 40 / br 200 / nr 25) is honoured',
  previewPickupPrice(82.6, { baseDistance: 40, baseRate: 200, normalRate: 25 }),
  Math.round(40 * 200 + 42.6 * 25)
);

console.log(failures === 0 ? '\nAll checks passed.' : `\n${failures} check(s) FAILED.`);
process.exit(failures === 0 ? 0 : 1);
