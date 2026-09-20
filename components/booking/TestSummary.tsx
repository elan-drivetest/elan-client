"use client"

import React from "react";
import { cn } from "@/lib/utils";
import SummaryItem from "@/components/booking/SummaryItem";
import RatingBar from "@/components/booking/RatingBar";
import HelpCard from "./HelpCard";
import SummaryAddOns from "./SummaryAddOns";
import { AddOnType } from "@/app/book-road-test-vehicle/test-details/page";
import { useBooking } from "@/lib/context/BookingContext";
import { useCouponVerification } from "@/lib/hooks/useBooking";
import { formatPrice, type Coupon } from "@/lib/types/booking.types";
import { deriveBookingAdjustment } from "@/lib/pricing/calculate";

interface PaymentBreakdownItem {
  label: string;
  price: string;
  isTotal?: boolean;
  isDiscount?: boolean;
}

/**
 * The money fields of a booking that already exists server-side.
 * When present these are authoritative and the local preview is ignored.
 */
export interface ServerBookingSummary {
  base_price: number;
  pickup_price: number;
  addons_price: number;
  total_price: number;
  coupon_code?: string | null;
  /**
   * `null` means either no coupon was applied, or this booking predates the
   * backend writing this field — treat null as "unknown", not "zero". `0`
   * means a coupon was applied but was worth nothing here.
   */
  discount_amount?: number | null;
}

interface TestSummaryProps {
  // Vehicle fields are still accepted by callers but no longer rendered here.
  vehicleImage?: string;
  vehicleType?: string;
  vehicleModel?: string;
  vehicleFeatures?: string[];
  startDate: string;
  testCentre: string;
  testCentreAddress: string;
  onApplyPromo: (code: string) => void;
  /** Called when a coupon stops applying (verify failed, or the order no longer meets its minimum). */
  onRemovePromo?: () => void;
  onRemoveAddOn?: () => void;
  hasAddOn?: boolean;
  selectedAddOn?: AddOnType;
  toggleAddOn?: (type: AddOnType) => void;
  className?: string;
  isConfirmationPage?: boolean;
  /** Set once the booking exists — switches the breakdown to server values. */
  serverBooking?: ServerBookingSummary | null;
}

export default function TestSummary({
  startDate,
  testCentre,
  testCentreAddress,
  onApplyPromo,
  onRemovePromo,
  onRemoveAddOn,
  toggleAddOn = () => {},
  className,
  isConfirmationPage = false,
  serverBooking = null,
}: TestSummaryProps) {
  const [promoCode, setPromoCode] = React.useState("");
  const [couponError, setCouponError] = React.useState("");
  const [acceptedCoupon, setAcceptedCoupon] = React.useState<Coupon | null>(null);

  const { bookingState } = useBooking();
  const {
    verifyCoupon,
    coupon: verifiedCoupon,
    error: verifyError,
    loading: couponLoading,
  } = useCouponVerification();

  const preview = bookingState.pricePreview;

  // `base_price + pickup_price + addons_price`, in cents — sent as `subtotal`
  // on every verify call so the server can compute a real discount_amount
  // instead of the client having to guess at it.
  const subtotal = preview
    ? preview.basePrice + preview.pickupPrice + preview.addonsPrice
    : undefined;

  // A coupon whose order no longer meets its minimum is a valid response, not
  // an error — but it isn't applied either.
  const needsMoreForCoupon = acceptedCoupon?.meets_minimum === false;

  /**
   * Sync local display state once a verify call SETTLES, rather than the
   * moment it starts. The hook clears its `coupon`/`error` eagerly on every
   * call (including the automatic re-verify below), and reacting to that
   * immediately would blank the "applied" box every time the order changes,
   * for the half-second before the new response lands.
   */
  React.useEffect(() => {
    if (couponLoading) return;

    if (verifiedCoupon) {
      setAcceptedCoupon(verifiedCoupon);
      setCouponError("");
      setPromoCode("");

      if (verifiedCoupon.meets_minimum === false) {
        // Valid code, but this order doesn't qualify yet — don't apply it.
        onRemovePromo?.();
      } else {
        onApplyPromo(verifiedCoupon.code);
      }
    } else if (verifyError) {
      setAcceptedCoupon(null);
      setCouponError(verifyError);
      onRemovePromo?.();
    }
    // onApplyPromo/onRemovePromo intentionally excluded: this should react
    // only to a verify call settling, not to the parent re-rendering.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [couponLoading, verifiedCoupon, verifyError]);

  const lastVerifiedSubtotalRef = React.useRef<number | undefined>(undefined);

  /**
   * Re-verify when the order changes under an already-accepted coupon.
   *
   * `discount_amount` is computed against the `subtotal` we sent — if the
   * customer changes centre, pickup address or add-on afterwards, that number
   * is stale (a percentage coupon especially), and `meets_minimum` can flip in
   * either direction.
   */
  React.useEffect(() => {
    if (!acceptedCoupon || subtotal === undefined) return;
    if (lastVerifiedSubtotalRef.current === subtotal) return;

    lastVerifiedSubtotalRef.current = subtotal;
    verifyCoupon(acceptedCoupon.code, subtotal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal]);

  const handleApplyPromo = async () => {
    const code = promoCode.trim();
    if (!code) return;

    lastVerifiedSubtotalRef.current = subtotal;
    await verifyCoupon(code, subtotal);
    // The effect above picks up the result once the call settles.
  };

  // Once a code is recognized (applied, or just short of its minimum), the
  // field locks to show it rather than going blank — emptying the input after
  // a successful apply reads as "did that even work?".
  const isCouponLocked = !!acceptedCoupon;

  const handleChangePromo = () => {
    setPromoCode(acceptedCoupon?.code ?? "");
    setAcceptedCoupon(null);
    setCouponError("");
    onRemovePromo?.();
  };

  /** "10% off" for a percentage coupon, "$15.00 off" for a fixed one. Label only — never re-derive an amount from it. */
  const couponLabel = (coupon: Coupon): string =>
    coupon.discount_type === "percentage"
      ? `${coupon.discount}% off`
      : `${formatPrice(coupon.discount)} off`;

  const formatCurrency = (valueInCents: number): string => formatPrice(valueInCents);

  const getPickupDistanceDisplay = (): string => {
    if (bookingState.locationOption === "test-centre") return "";

    const distance = bookingState.pickupDistance;
    if (!distance) return "0.0km from Test Centre";

    return `${distance.toFixed(1)}km from Test Centre`;
  };

  /**
   * Rows for the payment breakdown.
   *
   * Two modes. Once the booking exists we render exactly what the server
   * stored. Before that we render the local preview, which mirrors the server
   * engine but cannot know the coupon discount.
   */
  const generatePaymentBreakdown = (): PaymentBreakdownItem[] => {
    const breakdown: PaymentBreakdownItem[] = [];

    if (serverBooking) {
      breakdown.push({
        label: "Road Test Centre",
        price: formatCurrency(serverBooking.base_price),
      });

      if (serverBooking.pickup_price > 0) {
        breakdown.push({
          label: "Pickup Price",
          price: formatCurrency(serverBooking.pickup_price),
        });
      }

      if (serverBooking.addons_price > 0) {
        breakdown.push({
          label: bookingState.selectedAddonData?.name || "Add-on",
          price: formatCurrency(serverBooking.addons_price),
        });
      }

      // The components do not sum to the total whenever a long-trip credit or a
      // coupon applied. `discount_amount` is now populated on new bookings, so
      // when it's a known number we can split the gap into the two things that
      // can open it; a `null` (a booking created before this field existed)
      // falls back to one bundled row, same as before.
      const totalAdjustment = deriveBookingAdjustment(serverBooking);
      const hasKnownDiscount = typeof serverBooking.discount_amount === "number";
      const couponDiscount = hasKnownDiscount ? serverBooking.discount_amount as number : 0;
      const longTripCredit = hasKnownDiscount
        ? Math.max(0, totalAdjustment - couponDiscount)
        : 0;

      if (longTripCredit > 0) {
        breakdown.push({
          label: "🎉 Long-trip credit",
          price: `- ${formatCurrency(longTripCredit)}`,
          isDiscount: true,
        });
      }

      if (hasKnownDiscount ? couponDiscount > 0 : totalAdjustment > 0) {
        breakdown.push({
          label: serverBooking.coupon_code
            ? `Discounts (${serverBooking.coupon_code})`
            : "Discounts",
          price: `- ${formatCurrency(hasKnownDiscount ? couponDiscount : totalAdjustment)}`,
          isDiscount: true,
        });
      }

      breakdown.push({
        label: "Total Payment",
        price: formatCurrency(serverBooking.total_price),
        isTotal: true,
      });

      return breakdown;
    }

    if (!preview) {
      return [
        { label: "Road Test Centre", price: "—" },
        { label: "Total Payment", price: "—", isTotal: true },
      ];
    }

    breakdown.push({
      label: "Road Test Centre",
      price: formatCurrency(preview.basePrice),
    });

    if (bookingState.locationOption === "pickup" && bookingState.pickupAddress) {
      breakdown.push({
        label: "Pickup Price",
        price: formatCurrency(preview.pickupPrice),
      });
    }

    if (preview.addonsPrice > 0) {
      breakdown.push({
        label: bookingState.selectedAddonData?.name || "Add-on",
        price: formatCurrency(preview.addonsPrice),
      });
    }

    // On pickups beyond the configured base distance, an add-on is credited the
    // price of the matching 30-minute lesson.
    if (preview.concession > 0) {
      breakdown.push({
        label: "🎉 Long-trip credit",
        price: `- ${formatCurrency(preview.concession)}`,
        isDiscount: true,
      });
    }

    // A coupon that doesn't meet its minimum yet isn't applied — no discount
    // row, no change to the total.
    const appliedDiscount =
      acceptedCoupon && !needsMoreForCoupon
        ? acceptedCoupon.discount_amount
        : undefined;

    if (typeof appliedDiscount === "number" && appliedDiscount > 0) {
      breakdown.push({
        label: `${acceptedCoupon!.code} (${couponLabel(acceptedCoupon!)})`,
        price: `- ${formatCurrency(appliedDiscount)}`,
        isDiscount: true,
      });
    }

    const total =
      typeof appliedDiscount === "number"
        ? Math.max(0, preview.total - appliedDiscount)
        : preview.total;

    breakdown.push({
      label: "Total Payment",
      price: formatCurrency(total),
      isTotal: true,
    });

    return breakdown;
  };

  const breakdown = generatePaymentBreakdown();

  return (
    <div className={cn("border rounded-lg", className)}>
      <div className="p-6">
        <h2 className="text-xl font-medium mb-4">Summary</h2>

        <div className="space-y-2 mb-6">
          <SummaryItem
            label="Start date"
            value={startDate}
            checked={true}
          />
          <SummaryItem
            label="Road Test Centre"
            value={`${testCentre}\n${testCentreAddress}`}
            checked={true}
          />

          {/* Show pickup address with actual distance */}
          {bookingState.locationOption === 'pickup' && bookingState.pickupAddress && (
            <SummaryItem
              label={`Pickup Address (${getPickupDistanceDisplay()})`}
              value={bookingState.pickupAddress}
              checked={true}
            />
          )}
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-medium mb-2">Promo codes</h3>
          <p className="text-xs text-gray-600 mb-2">Unless stated otherwise, all discounts are one-time.</p>
          {!isConfirmationPage ? (
            <div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={isCouponLocked ? acceptedCoupon!.code : promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Promo code"
                  disabled={isCouponLocked}
                  className={cn(
                    "flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#0C8B44]",
                    isCouponLocked && "bg-gray-50 text-gray-700"
                  )}
                />
                {isCouponLocked ? (
                  <button
                    onClick={handleChangePromo}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Change
                  </button>
                ) : (
                  <button
                    onClick={handleApplyPromo}
                    disabled={couponLoading}
                    className="px-4 py-2 bg-[#0C8B44] text-white rounded-md text-sm font-medium hover:bg-[#0A7A3C] transition-colors disabled:opacity-50"
                  >
                    {couponLoading ? "Applying..." : "Apply"}
                  </button>
                )}
              </div>

              {couponError && (
                <p className="text-xs text-red-500 mt-1">{couponError}</p>
              )}

              {acceptedCoupon && needsMoreForCoupon && (
                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
                  <p className="text-xs font-medium text-amber-800">
                    {`This code needs an order of ${formatPrice(acceptedCoupon.min_purchase_amount)} or more.`}
                  </p>
                  {typeof subtotal === "number" && (
                    <p className="text-xs text-amber-700 mt-0.5">
                      {`Add ${formatPrice(Math.max(0, acceptedCoupon.min_purchase_amount - subtotal))} to use it.`}
                    </p>
                  )}
                </div>
              )}

              {acceptedCoupon && !needsMoreForCoupon && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-xs font-medium text-green-800">
                    {`✅ Coupon "${acceptedCoupon.code}" accepted — ${couponLabel(acceptedCoupon)}`}
                  </p>
                  {/* The server builds `name`/`description` from the live
                      settings — e.g. "10% Off - Test Failed" is rendered from
                      failure_coupon_percentage. Showing them means the stated
                      discount stays correct if an admin changes that value,
                      which a hardcoded "10% off" would not. */}
                  {(acceptedCoupon.description || acceptedCoupon.name) && (
                    <p className="text-xs text-green-700 mt-0.5">
                      {acceptedCoupon.description || acceptedCoupon.name}
                    </p>
                  )}
                  <p className="text-xs text-green-700 mt-0.5 font-medium">
                    {typeof acceptedCoupon.discount_amount === "number"
                      ? `You save ${formatPrice(acceptedCoupon.discount_amount)}`
                      : "Your discount is applied at checkout."}
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-medium mb-2">Payment Breakdown</h3>
          <div className="space-y-3">
            {breakdown.filter(item => !item.isTotal).map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center"
              >
                <span className={cn("text-sm", item.isDiscount && "text-[#0C8B44]")}>
                  {item.label}
                </span>
                <span className={cn("text-sm", item.isDiscount && "text-[#0C8B44]")}>
                  {item.price}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Add-ons selection in summary */}
        {toggleAddOn && onRemoveAddOn && !isConfirmationPage && (
          <SummaryAddOns
            selectedAddOn={bookingState.selectedAddOn ?? null}
            toggleAddOn={toggleAddOn}
            onRemove={onRemoveAddOn}
          />
        )}

        {/* Total Payment - shown after add-ons selection */}
        <div className="mb-6">
          {breakdown.filter(item => item.isTotal).map((item, index) => (
            <div key={index}>
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="text-base font-semibold">
                  {item.label}
                </span>
                <span className="text-lg font-bold text-[#0C8B44]">
                  {item.price}
                </span>
              </div>
              {/* The total above already reflects the coupon (via
                  discount_amount from /coupons/verify), so this note only
                  covers the rare case where we couldn't compute one — e.g.
                  the price preview hadn't loaded when the code was applied. */}
              {!serverBooking &&
                acceptedCoupon &&
                !needsMoreForCoupon &&
                typeof acceptedCoupon.discount_amount !== "number" && (
                  <p className="text-xs text-gray-600 mt-2">
                    Your coupon discount is calculated at checkout and shown on
                    your confirmed booking.
                  </p>
                )}
            </div>
          ))}
        </div>

        <HelpCard />
        <RatingBar />
      </div>
    </div>
  );
}
