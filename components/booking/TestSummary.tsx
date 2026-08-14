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
import { getFriendlyErrorMessage } from "@/lib/utils/error-messages";

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
  const { verifyCoupon, loading: couponLoading } = useCouponVerification();

  const preview = bookingState.pricePreview;

  /**
   * Verify the code and record that it was accepted — nothing more.
   *
   * We deliberately do not compute or display a discount amount. POST
   * /coupons/verify strips `discount_type` and `min_purchase_amount` from the
   * customer response, so `discount: 10` is ambiguous between "10 percent" and
   * "10 cents". This used to be read as cents, quoting a $0.10 saving on a 10%
   * coupon. The server applies the real discount from `coupon_code` and returns
   * the authoritative `total_price` on the created booking.
   */
  const handleApplyPromo = async () => {
    const code = promoCode.trim();
    if (!code) return;

    setCouponError("");

    try {
      const result = await verifyCoupon(code);

      if (!result) {
        setCouponError("That coupon code isn't valid. Please check it and try again.");
        setAcceptedCoupon(null);
        return;
      }

      setAcceptedCoupon({ ...result, code: result.code || code });
      onApplyPromo(code);
      setPromoCode("");
    } catch (error) {
      console.error("Coupon verification error:", error);
      setCouponError(
        getFriendlyErrorMessage(undefined, "Failed to verify coupon. Please try again.")
      );
      setAcceptedCoupon(null);
    }
  };

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
      // coupon applied, and `discount_amount` is always null on the API — so
      // derive the gap. It bundles both, hence the generic label.
      const adjustment = deriveBookingAdjustment(serverBooking);
      if (adjustment > 0) {
        breakdown.push({
          label: serverBooking.coupon_code
            ? `Discounts (${serverBooking.coupon_code})`
            : "Discounts",
          price: `- ${formatCurrency(adjustment)}`,
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
        label: "Long-trip credit",
        price: `- ${formatCurrency(preview.concession)}`,
        isDiscount: true,
      });
    }

    breakdown.push({
      label: acceptedCoupon ? "Total before discount" : "Total Payment",
      price: formatCurrency(preview.total),
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
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Promo code"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#0C8B44]"
                />
                <button
                  onClick={handleApplyPromo}
                  disabled={couponLoading}
                  className="px-4 py-2 bg-[#0C8B44] text-white rounded-md text-sm font-medium hover:bg-[#0A7A3C] transition-colors disabled:opacity-50"
                >
                  {couponLoading ? "Applying..." : "Apply"}
                </button>
              </div>

              {couponError && (
                <p className="text-xs text-red-500 mt-1">{couponError}</p>
              )}

              {acceptedCoupon && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-xs font-medium text-green-800">
                    {`✅ Coupon "${acceptedCoupon.code}" accepted`}
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
                  <p className="text-xs text-green-700 mt-0.5">
                    Your discount is applied at checkout.
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
              {!serverBooking && acceptedCoupon && (
                <p className="text-xs text-gray-600 mt-2">
                  Your coupon discount is calculated at checkout and shown on your
                  confirmed booking.
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
