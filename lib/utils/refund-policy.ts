// lib/utils/refund-policy.ts
//
// Renders the cancellation ladder from the server's live settings.
//
// The three values (`refund_full_hours`, `refund_partial_hours`,
// `refund_partial_percentage`) are admin-editable. This copy used to be
// hardcoded as "48 hours / 50% fee" in four places and described a two-band
// model with no hard cutoff — so a customer inside the partial window was told
// they'd get a partial refund when the server refuses outright.

import type { PolicyConfig } from '@/lib/config/app-config';

export interface RefundLadder {
  fullHours: number;
  partialHours: number;
  partialPercentage: number;
}

/**
 * The ladder, or null when the server hasn't given us all three.
 *
 * Partial data is treated as no data on purpose: half a refund policy is worse
 * than a sentence that points at the policy page.
 */
export function getRefundLadder(config: PolicyConfig | null): RefundLadder | null {
  if (!config) return null;

  const { refundFullHours, refundPartialHours, refundPartialPercentage } = config;

  if (
    refundFullHours === null ||
    refundPartialHours === null ||
    refundPartialPercentage === null
  ) {
    return null;
  }

  return {
    fullHours: refundFullHours,
    partialHours: refundPartialHours,
    partialPercentage: refundPartialPercentage,
  };
}

/** e.g. "48 hours" / "24 hours" / "1 hour" */
export const formatHours = (hours: number): string =>
  `${hours} hour${hours === 1 ? '' : 's'}`;

/**
 * When the partial band can't pay a partial amount, the ladder is really a
 * single cutoff. Returns that cutoff (hours), or null when there's a genuine
 * three-band ladder.
 *  - 0% partial, or partial window empty (partial >= full) → cutoff at `full`
 *    (this is ToS §13: under 48h is non-refundable)
 *  - 100% partial → the partial band is a full refund → cutoff at `partial`
 */
function singleCutoff(ladder: RefundLadder): number | null {
  if (ladder.partialPercentage <= 0 || ladder.partialHours >= ladder.fullHours) return ladder.fullHours;
  if (ladder.partialPercentage >= 100) return ladder.partialHours;
  return null;
}

/**
 * The bands as display rows, mirroring the server's
 * `calculateRefundPercentage()`: >= full → 100%, >= partial → partial rate,
 * otherwise nothing. Collapses to two rows when there's no real partial band,
 * rather than printing a "0% refund" row.
 */
export function describeRefundLadder(
  ladder: RefundLadder
): Array<{ window: string; outcome: string }> {
  const cutoff = singleCutoff(ladder);
  if (cutoff !== null) {
    return [
      { window: `${formatHours(cutoff)} or more before your test`, outcome: 'Full refund' },
      { window: `Less than ${formatHours(cutoff)} before`, outcome: 'Not refundable' },
    ];
  }

  return [
    {
      window: `${formatHours(ladder.fullHours)} or more before your test`,
      outcome: 'Full refund',
    },
    {
      window: `Between ${formatHours(ladder.partialHours)} and ${formatHours(ladder.fullHours)} before`,
      outcome: `${ladder.partialPercentage}% refund`,
    },
    {
      window: `Less than ${formatHours(ladder.partialHours)} before`,
      outcome: 'Not refundable',
    },
  ];
}

/** One-line version, for prose contexts like the FAQ. */
export function describeRefundLadderSentence(ladder: RefundLadder | null): string {
  if (!ladder) {
    return 'Your refund depends on how far ahead of your test you cancel. The exact amount is confirmed when you submit the request from your dashboard.';
  }

  const cutoff = singleCutoff(ladder);
  if (cutoff !== null) {
    return (
      `Cancel ${formatHours(cutoff)} or more before your scheduled time for a full refund. ` +
      `Cancellations less than ${formatHours(cutoff)} before are not refundable, and no-shows are charged ` +
      `the full amount. Your exact refund amount is confirmed when you submit the request from your dashboard.`
    );
  }

  return (
    `Cancel ${formatHours(ladder.fullHours)} or more before your scheduled time for a full refund. ` +
    `Between ${formatHours(ladder.partialHours)} and ${formatHours(ladder.fullHours)} before, you're refunded ` +
    `${ladder.partialPercentage}%. Inside ${formatHours(ladder.partialHours)} we can't process a refund, and ` +
    `no-shows are charged the full amount. Your exact refund amount is confirmed when you submit the request ` +
    `from your dashboard.`
  );
}
