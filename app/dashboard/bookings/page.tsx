// app/dashboard/bookings/page.tsx
"use client"

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Check, Phone, Loader2, Clock, AlertCircle, Calendar, MapPin, X, DollarSign, RefreshCw } from "lucide-react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import HelpCard from "@/components/booking/HelpCard";
import { useAuth } from "@/lib/context/AuthContext";
import { useRouter } from "next/navigation";
import { bookingApi } from "@/lib/api";
import { useRefundRequest } from "@/lib/hooks/useBooking";
import type { ApiResponse } from "@/lib/types/auth.types";
import type { RefundRequest } from "@/lib/types/booking.types";

type TabType = "Active" | "Completed";

// Define the booking interface based on the ACTUAL API response (not documentation)
interface APIBooking {
  id: number;
  instructor_id: number | null;
  base_price: number;
  pickup_price: number;
  addons_price: number;
  total_price: number;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "rescheduled" | "succeeded" | "expired";
  test_result?: "PASS" | "FAIL" | null;
  coupon_code?: string | null;
  discount_amount?: number | null;
  is_rescheduled: boolean;
  timezone: string;
  road_test_doc_url?: string;
  g1_license_doc_url?: string;
  payment_url?: string; // Stripe checkout URL for pending payments (actual field name from API)

  // Fields from API documentation that may be missing in actual response
  user_id?: number;
  full_name?: string;
  phone_number?: string;
  test_center_id?: number;
  test_center_name?: string;
  test_center_address?: string;
  test_type?: "G2" | "G";
  test_date?: string;
  meet_at_center?: boolean;
  pickup_address?: string;
  pickup_latitude?: number;
  pickup_longitude?: number;
  pickup_distance?: number;
  previous_booking_id?: number;
  addon_id?: number;
  addon_duration?: number;
  created_at?: string;
  updated_at?: string;

  // Instructor fields from API
  instructor_full_name?: string;
  instructor_email?: string;
  instructor_phone_number?: string;
  instructor_vehicle_brand?: string;
  instructor_vehicle_model?: string;
  instructor_vehicle_year?: number;
  instructor_vehicle_color?: string;
  instructor_vehicle_license_plate?: string;
  instructor_vehicle_image_url?: string;
}

// Refund Request Modal Component
const RefundRequestModal: React.FC<{
  booking: APIBooking;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ booking, isOpen, onClose, onSuccess }) => {
  const { createRefundRequest, loading, error, success } = useRefundRequest();
  const [refundReason, setRefundReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatPrice = (priceInCents: number): string => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(priceInCents / 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!refundReason.trim()) {
      alert('Please provide a reason for the refund request');
      return;
    }

    if (refundReason.trim().length < 10) {
      alert('Please provide a more detailed reason (at least 10 characters)');
      return;
    }

    setIsSubmitting(true);

    // Prepare refund request data - ONLY booking_id and refund_reason
    const refundData = {
      booking_id: booking.id,
      refund_reason: refundReason.trim(),
    };

    try {
      const response = await createRefundRequest(refundData);

      if (response.success) {
        // Success - show confirmation and close modal
        alert('Refund request submitted successfully! We will process your request within 3-5 business days.');
        onSuccess();
        onClose();
        setRefundReason('');
      } else {
        alert(`Failed to submit refund request: ${response.error?.message || 'Unknown error'}`);
      }
    } catch {
      alert('An error occurred while submitting your refund request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Request Refund</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Booking Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Booking Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Booking ID:</span>
                <span className="font-medium">#{booking.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Test Type:</span>
                <span className="font-medium">{booking.test_type || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Test Date:</span>
                <span className="font-medium">
                  {booking.test_date
                    ? new Date(booking.test_date).toLocaleDateString('en-CA', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })
                    : 'TBD'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-medium">{formatPrice(booking.total_price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium capitalize">{booking.status}</span>
              </div>
            </div>
          </div>

          {/* Refund Reason */}
          <div>
            <label htmlFor="refundReason" className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Refund Request <span className="text-red-500">*</span>
            </label>
            <textarea
              id="refundReason"
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0C8B44] focus:border-transparent resize-none"
              placeholder="Example: Unable to attend the test due to emergency"
              required
              minLength={10}
            />
            <p className="mt-1 text-xs text-gray-500">
              Please provide a detailed reason (minimum 10 characters). This will help us process your request faster.
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Success Display */}
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span className="text-sm text-green-700">Refund request submitted successfully!</span>
              </div>
            </div>
          )}

          {/* Refund Policy Notice */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Important Information</h4>
                <p className="text-sm text-blue-800">
                  Your refund request will be reviewed by our team. Processing time is typically 3-5 business days.
                  The refund amount will be determined based on our cancellation policy and the timing of your request.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
              disabled={isSubmitting || loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#0C8B44] hover:bg-[#0C8B44]/90 text-white"
              disabled={isSubmitting || loading || !refundReason.trim()}
            >
              {isSubmitting || loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </span>
              ) : (
                'Submit Refund Request'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Component for individual booking card
const BookingCard: React.FC<{
  booking: APIBooking;
  onRefundSuccess: () => void;
  refundRequest?: RefundRequest | null;
}> = ({ booking, onRefundSuccess, refundRequest }) => {
  const [showRefundModal, setShowRefundModal] = useState(false);

  // Determine if we have instructor info from the API
  const hasInstructor = !!(booking.instructor_full_name && booking.instructor_phone_number);
  const isSearchingInstructor = !hasInstructor && ['pending', 'confirmed', 'succeeded'].includes(booking.status);
  const hasVehicleInfo = !!(booking.instructor_vehicle_brand || booking.instructor_vehicle_model);
  
  const formatPrice = (priceInCents: number): string => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(priceInCents / 100);
  };

  const formatDateTime = (dateStr?: string): string => {
    if (!dateStr) return 'Date TBD';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-CA', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const formatCreatedDate = (dateStr?: string): string => {
    if (!dateStr) return 'Unknown';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-CA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Unknown';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'completed': return 'text-blue-600 bg-blue-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      case 'rescheduled': return 'text-purple-600 bg-purple-50';
      case 'succeeded': return 'text-green-600 bg-green-50';
      case 'expired': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTestResultColor = (result: string | null): string => {
    if (result === 'PASS') return 'text-green-600 bg-green-50';
    if (result === 'FAIL') return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getRefundStatusColor = (status?: string): string => {
    if (!status) return 'text-yellow-600 bg-yellow-50 border-yellow-200'; // Default to pending style

    switch (status.toLowerCase()) {
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'processed': return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
      case 'cancelled': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getRefundStatusIcon = (status?: string) => {
    if (!status) return Clock; // Default to pending icon

    switch (status.toLowerCase()) {
      case 'pending': return Clock;
      case 'processed': return Check;
      case 'rejected': return X;
      case 'cancelled': return X;
      default: return RefreshCw;
    }
  };

  const getTestTypeDisplay = (): string => {
    return booking.test_type || 'Road Test';
  };

  const getTestCenterDisplay = (): { name: string; address: string } => {
    return {
      name: booking.test_center_name || 'Test Center TBD',
      address: booking.test_center_address || 'Address will be provided closer to test date'
    };
  };

  const getPickupDisplay = () => {
    if (booking.meet_at_center === true) {
      return null; // User is meeting at center
    }

    if (booking.pickup_address) {
      return {
        address: booking.pickup_address,
        distance: typeof booking.pickup_distance === 'number' ? booking.pickup_distance : parseFloat(String(booking.pickup_distance || 0)) || 0
      };
    }

    // If pickup_price > 0 but no address, assume pickup service was selected
    if (booking.pickup_price > 0) {
      return {
        address: 'Pickup address TBD',
        distance: typeof booking.pickup_distance === 'number' ? booking.pickup_distance : parseFloat(String(booking.pickup_distance || 0)) || 0
      };
    }

    return null;
  };

  const testCenter = getTestCenterDisplay();
  const pickupInfo = getPickupDisplay();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      {/* Header with booking info */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            {getTestTypeDisplay()} Road Test
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Booking #{booking.id} • Created {formatCreatedDate(booking.created_at)}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className={cn(
              "px-2 py-1 text-xs font-medium rounded-full",
              getStatusColor(booking.status)
            )}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
            {booking.test_result && (
              <span className={cn(
                "px-2 py-1 text-xs font-medium rounded-full",
                getTestResultColor(booking.test_result)
              )}>
                {booking.test_result}
              </span>
            )}
            {booking.is_rescheduled && (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-600">
                Rescheduled
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold text-gray-900">
            {formatPrice(booking.total_price)}
          </div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
      </div>

      {/* Test details - Always show with fallbacks */}
      <div className="space-y-4">
        {/* Test Date & Time */}
        <div className="flex items-start gap-2">
          <Calendar className="h-5 w-5 text-[#0C8B44] flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-medium">Test Date & Time</div>
            <div className="text-sm text-gray-600">{formatDateTime(booking.test_date)}</div>
            {booking.timezone && (
              <div className="text-xs text-gray-500">Timezone: {booking.timezone}</div>
            )}
          </div>
        </div>
        
        {/* Test Centre */}
        <div className="flex items-start gap-2">
          <MapPin className="h-5 w-5 text-[#0C8B44] flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-medium">Test Centre</div>
            <div className="text-sm text-gray-600">{testCenter.name}</div>
            <div className="text-sm text-gray-600">{testCenter.address}</div>
            {booking.test_center_id && (
              <div className="text-xs text-gray-500">Center ID: {booking.test_center_id}</div>
            )}
          </div>
        </div>
        
        {/* Pickup Information */}
        {pickupInfo && (
          <div className="flex items-start gap-2">
            <Check className="h-5 w-5 text-[#0C8B44] flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium">
                Pickup Service 
                {pickupInfo.distance > 0 && ` (${pickupInfo.distance.toFixed(1)}km from Test Centre)`}
              </div>
              <div className="text-sm text-gray-600">{pickupInfo.address}</div>
              {booking.pickup_latitude && booking.pickup_longitude && (
                <div className="text-xs text-gray-500">
                  Coordinates: {Number(booking.pickup_latitude).toFixed(4)}, {Number(booking.pickup_longitude).toFixed(4)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Customer Information */}
        {(booking.full_name || booking.phone_number || booking.user_id) && (
          <div className="flex items-start gap-2">
            <Check className="h-5 w-5 text-[#0C8B44] flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium">Customer Information</div>
              {booking.full_name && (
                <div className="text-sm text-gray-600">Name: {booking.full_name}</div>
              )}
              {booking.phone_number && (
                <div className="text-sm text-gray-600">Phone: {booking.phone_number}</div>
              )}
              {booking.user_id && (
                <div className="text-xs text-gray-500">User ID: {booking.user_id}</div>
              )}
            </div>
          </div>
        )}

        {/* Add-on Information */}
        {(booking.addon_id || booking.addon_duration || booking.addons_price > 0) && (
          <div className="flex items-start gap-2">
            <Check className="h-5 w-5 text-[#0C8B44] flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium">Add-on Services</div>
              {booking.addon_id && (
                <div className="text-sm text-gray-600">Add-on ID: {booking.addon_id}</div>
              )}
              {booking.addon_duration && (
                <div className="text-sm text-gray-600">
                  Duration: {Math.round(booking.addon_duration / 60)} minutes
                </div>
              )}
              {booking.addons_price > 0 && (
                <div className="text-sm text-gray-600">
                  Add-on Price: {formatPrice(booking.addons_price)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Documents */}
        {(booking.road_test_doc_url || booking.g1_license_doc_url) && (
          <div className="flex items-start gap-2">
            <Check className="h-5 w-5 text-[#0C8B44] flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium">Uploaded Documents</div>
              <div className="space-y-1">
                {booking.road_test_doc_url && (
                  <div className="text-sm text-gray-600">
                    <a 
                      href={booking.road_test_doc_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#0C8B44] hover:underline"
                    >
                      Road Test Document
                    </a>
                  </div>
                )}
                {booking.g1_license_doc_url && (
                  <div className="text-sm text-gray-600">
                    <a 
                      href={booking.g1_license_doc_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#0C8B44] hover:underline"
                    >
                      G1 License Document
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Rebooking Information */}
        {booking.previous_booking_id && (
          <div className="flex items-start gap-2">
            <Check className="h-5 w-5 text-[#0C8B44] flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium">Rebooking Information</div>
              <div className="text-sm text-gray-600">
                Previous Booking: #{booking.previous_booking_id}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment breakdown */}
      <div className="border-t pt-4">
        <h4 className="font-medium mb-3">Payment Breakdown</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Base Price</span>
            <span>{formatPrice(booking.base_price)}</span>
          </div>
          {booking.pickup_price > 0 && (
            <div className="flex justify-between">
              <span>Pickup Service</span>
              <span>{formatPrice(booking.pickup_price)}</span>
            </div>
          )}
          {booking.addons_price > 0 && (
            <div className="flex justify-between">
              <span>Add-ons</span>
              <span>{formatPrice(booking.addons_price)}</span>
            </div>
          )}
          {booking.discount_amount && booking.discount_amount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount {booking.coupon_code && `(${booking.coupon_code})`}</span>
              <span>-{formatPrice(booking.discount_amount)}</span>
            </div>
          )}
          <div className="flex justify-between font-medium border-t pt-2">
            <span>Total</span>
            <span>{formatPrice(booking.total_price)}</span>
          </div>
        </div>
      </div>

      {/* Refund Request Status - Show if refund request exists */}
      {refundRequest && (
        <div className={cn(
          "border rounded-lg p-4",
          getRefundStatusColor(refundRequest.status)
        )}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              {React.createElement(getRefundStatusIcon(refundRequest.status), {
                className: "h-5 w-5"
              })}
              <h4 className="font-semibold">Refund Request</h4>
            </div>
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-white">
              {refundRequest.status
                ? refundRequest.status.charAt(0).toUpperCase() + refundRequest.status.slice(1)
                : 'Pending'
              }
            </span>
          </div>

          <div className="space-y-2 text-sm">
            {refundRequest.id && (
              <div className="flex justify-between">
                <span className="font-medium">Request ID:</span>
                <span>#{refundRequest.id}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="font-medium">Refund Amount:</span>
              <span className="font-semibold">{formatPrice(refundRequest.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Refund Percentage:</span>
              <span>{refundRequest.refund_percentage}%</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Requested On:</span>
              <span>
                {new Date(refundRequest.request_date).toLocaleDateString('en-CA', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
            {refundRequest.processed_at && (
              <div className="flex justify-between">
                <span className="font-medium">Processed On:</span>
                <span>
                  {new Date(refundRequest.processed_at).toLocaleDateString('en-CA', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
            )}
            {refundRequest.refund_reason && (
              <div className="pt-2 border-t">
                <span className="font-medium">Reason:</span>
                <p className="mt-1 text-xs opacity-90">{refundRequest.refund_reason}</p>
              </div>
            )}
          </div>

          {/* Status-specific messages */}
          {(!refundRequest.status || refundRequest.status === 'pending') && (
            <div className="mt-3 p-2 bg-white bg-opacity-50 rounded text-xs">
              <p>Your refund request is being reviewed. We typically process requests within 3-5 business days.</p>
            </div>
          )}
          {refundRequest.status === 'processed' && (
            <div className="mt-3 p-2 bg-white bg-opacity-50 rounded text-xs">
              <p>Your refund has been processed. Please allow 5-10 business days for the amount to appear in your account.</p>
            </div>
          )}
          {refundRequest.status === 'rejected' && (
            <div className="mt-3 p-2 bg-white bg-opacity-50 rounded text-xs">
              <p>Your refund request was not approved. Please contact support for more information.</p>
            </div>
          )}
        </div>
      )}

      {/* Instructor information */}
      <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative size-18 rounded-full overflow-hidden bg-gray-200">
            {hasInstructor ? (
              <Image
                src="/instructor.png"
                alt={booking.instructor_full_name || 'Instructor'}
                fill
                className="object-cover scale-125 hover:scale-100 transition-transform"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {isSearchingInstructor ? (
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-gray-400" />
                )}
              </div>
            )}
          </div>
          <div>
            <div className="text-sm text-[#0C8B44]">Your Instructor</div>
            {hasInstructor ? (
              <>
                <div className="font-medium">{booking.instructor_full_name}</div>
                {booking.instructor_phone_number && (
                  <a href={`tel:${booking.instructor_phone_number}`} className="flex items-center text-sm hover:text-[#0C8B44] transition-colors">
                    <Phone size={16} className="mr-1" />
                    {booking.instructor_phone_number}
                  </a>
                )}
                <div className="flex items-center gap-1 mt-1 mb-1">
                  {Array(5).fill(0).map((_, i) => (
                    <svg key={i} width="16" height="16" viewBox="0 0 16 16" fill="#FFBB00" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 0L10.3511 5.18237L16 5.87336L11.768 9.77641L12.7023 16L8 12.8824L3.29772 16L4.23204 9.77641L0 5.87336L5.64886 5.18237L8 0Z" />
                    </svg>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 mt-1">
                {isSearchingInstructor ? (
                  <>
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Connecting to instructor...</span>
                  </>
                ) : (
                  <>
                    <span className="text-sm text-gray-600">No instructor assigned</span>
                    {booking.instructor_id && (
                      <span className="text-xs text-gray-500">(ID: {booking.instructor_id})</span>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Vehicle info */}
          <div className="flex items-center gap-3">
            {hasVehicleInfo && (
              <div className="text-right text-xs">
                <div className="font-medium text-gray-900 capitalize">
                  {booking.instructor_vehicle_brand} {booking.instructor_vehicle_model}
                </div>
                <div className="text-gray-500">
                  {booking.instructor_vehicle_year} • {booking.instructor_vehicle_color}
                </div>
                <div className="text-gray-500">
                  {booking.instructor_vehicle_license_plate}
                </div>
              </div>
            )}
            <div className="relative h-14 w-20 flex-shrink-0">
              <Image
                src={booking.instructor_vehicle_image_url || "/vehicle-lexus.png"}
                alt={hasVehicleInfo ? `${booking.instructor_vehicle_brand} ${booking.instructor_vehicle_model}` : "Test vehicle"}
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Complete Payment Button - Show for pending bookings with payment URL */}
      {booking.status === 'pending' && booking.payment_url && (
        <div className="mt-3">
          <Button
            onClick={() => {
              console.log('🔗 Redirecting to payment URL:', booking.payment_url);
              window.location.href = booking.payment_url!;
            }}
            className="w-full flex items-center justify-center gap-2 bg-[#0C8B44] hover:bg-[#0A7A3C] text-white"
          >
            <DollarSign className="h-4 w-4" />
            Complete Payment
          </Button>
        </div>
      )}

      {/* Refund Request Button - Show for eligible bookings (except pending with checkout URL or if refund already exists) */}
      {['confirmed', 'succeeded'].includes(booking.status) && !refundRequest && (
        <div className="mt-3">
          <Button
            onClick={() => setShowRefundModal(true)}
            variant="outline"
            className="w-full flex items-center justify-center gap-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
          >
            <DollarSign className="h-4 w-4" />
            Request Refund
          </Button>
        </div>
      )}

      {/* Show warning for pending bookings without payment URL */}
      {booking.status === 'pending' && !booking.payment_url && (
        <div className="mt-3">
          <div className="mb-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Payment Pending</p>
                <p className="text-xs text-yellow-700 mt-1">
                  Your booking is awaiting payment confirmation. If you didn&apos;t complete the payment, please contact support.
                </p>
              </div>
            </div>
          </div>
          {!refundRequest && (
            <Button
              onClick={() => setShowRefundModal(true)}
              variant="outline"
              className="w-full flex items-center justify-center gap-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
            >
              <DollarSign className="h-4 w-4" />
              Request Refund
            </Button>
          )}
        </div>
      )}

      {/* Refund Request Modal */}
      <RefundRequestModal
        booking={booking}
        isOpen={showRefundModal}
        onClose={() => setShowRefundModal(false)}
        onSuccess={onRefundSuccess}
      />
    </div>
  );
};

// Main dashboard bookings component
export default function Bookings() {
  const [activeTab, setActiveTab] = useState<TabType>("Active");
  const [bookings, setBookings] = useState<APIBooking[]>([]);
  const [refundRequests, setRefundRequests] = useState<Record<number, RefundRequest>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoading: authLoading, isAuthenticated, checkAuthStatus } = useAuth();
  const router = useRouter();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  // Fetch refund requests for all bookings
  const fetchRefundRequests = useCallback(async () => {
    try {
      const response = await bookingApi.getRefundRequests();

      if (response.success && response.data) {
        // The API returns { data: [...], meta: {...} }
        const refunds = (response.data as unknown as { data: RefundRequest[] }).data || [];

        // Map refund requests by booking_id for easy lookup
        const refundMap: Record<number, RefundRequest> = {};
        refunds.forEach(refund => {
          refundMap[refund.booking_id] = refund;
        });

        setRefundRequests(refundMap);
      } else {
        console.error('Failed to fetch refund requests:', response.error);
      }
    } catch (err) {
      console.error('Error fetching refund requests:', err);
    }
  }, []);

  // Fetch bookings from API
  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response: ApiResponse<APIBooking[]> = await bookingApi.getBookings();

      if (response.success && response.data) {
        console.log('📊 Fetched bookings:', response.data);

        // Debug: Check if any pending bookings have payment_url
        const pendingBookings = response.data.filter(b => b.status === 'pending');
        if (pendingBookings.length > 0) {
          console.log('⏳ Pending bookings:', pendingBookings);
          pendingBookings.forEach(booking => {
            console.log(`Booking #${booking.id} - Status: ${booking.status}, payment_url:`, booking.payment_url);
          });
        }

        setBookings(response.data);

        // Fetch refund requests after bookings are loaded
        await fetchRefundRequests();
      } else {
        setError(response.error?.message || 'Failed to fetch bookings');
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Network error occurred while fetching bookings');
    } finally {
      setLoading(false);
    }
  }, [fetchRefundRequests]);

  // Auth check effect
  useEffect(() => {
    if (!user && !hasCheckedAuth && !authLoading) {
      console.log('Bookings: No user data, checking auth status once...');
      setHasCheckedAuth(true);
      checkAuthStatus();
    }
  }, [user, hasCheckedAuth, authLoading, checkAuthStatus]);

  // Redirect if not authenticated
  useEffect(() => {
    if (hasCheckedAuth && !authLoading && !isAuthenticated) {
      console.log('Bookings: User not authenticated, redirecting to login...');
      router.push('/login');
    }
  }, [hasCheckedAuth, authLoading, isAuthenticated, router]);

  // Fetch bookings when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchBookings();
    }
  }, [isAuthenticated, user, fetchBookings]);

  // Filter bookings based on active tab
  const getFilteredBookings = (): APIBooking[] => {
    if (activeTab === "Active") {
      return bookings.filter(booking => 
        ['pending', 'confirmed', 'rescheduled', 'succeeded'].includes(booking.status)
      );
    } else {
      return bookings.filter(booking => 
        ['completed', 'cancelled', 'expired'].includes(booking.status)
      );
    }
  };

  const filteredBookings = getFilteredBookings();

  // Show loading state during auth check or initial load
  if (authLoading || (!user && !hasCheckedAuth)) {
    return (
      <div className="flex min-h-screen bg-white">
        <DashboardSidebar />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#0C8B44]"></div>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (hasCheckedAuth && !isAuthenticated) {
    return (
      <div className="flex min-h-screen bg-white">
        <DashboardSidebar />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="text-xl font-semibold text-gray-600 mb-4">Authentication Required</div>
            <div className="text-gray-500 mb-6">Please log in to access your bookings.</div>
            <button 
              onClick={() => router.push('/login')}
              className="bg-[#0C8B44] hover:bg-[#0C8B44]/90 text-white px-6 py-2 rounded-md"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <DashboardSidebar />
      
      {/* Main content */}
      <div className="flex-1 p-8 max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">Your Bookings</h1>
        
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md flex justify-center items-center",
              activeTab === "Active"
                ? "bg-[#0C8B44] text-white"
                : "bg-gray-100 text-gray-600"
            )}
            onClick={() => setActiveTab("Active")}
          >
            Active
          </Button>
          <Button
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md flex justify-center items-center",
              activeTab === "Completed"
                ? "bg-[#0C8B44] text-white"
                : "bg-gray-100 text-gray-600"
            )}
            onClick={() => setActiveTab("Completed")}
          >
            Completed
          </Button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bookings list in 2/3 of the grid */}
          <div className="md:col-span-2 space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#0C8B44]" />
                <span className="ml-2 text-gray-600">Loading bookings...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <div className="text-red-600 font-medium">Error loading bookings</div>
                  <div className="text-gray-600 text-sm mt-1">{error}</div>
                  <Button 
                    onClick={fetchBookings}
                    className="mt-4 bg-[#0C8B44] hover:bg-[#0C8B44]/90"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="text-gray-600 font-medium">
                    No {activeTab.toLowerCase()} bookings found
                  </div>
                  <div className="text-gray-500 text-sm mt-1">
                    {activeTab === "Active" 
                      ? "Book your first road test to get started" 
                      : "Your completed bookings will appear here"
                    }
                  </div>
                  {activeTab === "Active" && (
                    <Button 
                      onClick={() => router.push('/book-road-test-vehicle/road-test-details')}
                      className="mt-4 bg-[#0C8B44] hover:bg-[#0C8B44]/90"
                    >
                      Book a Test
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              filteredBookings.map((booking) => {
                const refundRequest = refundRequests[booking.id] || null;

                return (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onRefundSuccess={fetchBookings}
                    refundRequest={refundRequest}
                  />
                );
              })
            )}
          </div>
          
          {/* Help section in 1/3 of the grid */}
          <div className="md:col-span-1">
            <h2 className="text-2xl font-bold mb-6">Have Questions?</h2>
            <HelpCard />
          </div>
        </div>
      </div>
    </div>
  );
}