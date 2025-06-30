// app/book-road-test-vehicle/payment-success/page.tsx
"use client"

import React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Calendar, MapPin, Clock, ArrowRight } from "lucide-react";
import { useBooking } from "@/lib/context/BookingContext";

export default function PaymentSuccess() {
  const router = useRouter();
  const { bookingState } = useBooking();

  const handleContinueToConfirmation = () => {
    router.push("/book-road-test-vehicle/confirmation");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600">
            Your road test booking has been confirmed and payment processed successfully.
          </p>
        </div>

        {/* Booking Summary Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h2>
          
          <div className="space-y-3">
            {/* Test Type */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Calendar size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Test Type</p>
                <p className="font-medium">{bookingState.testType === 'G2' ? 'G2 Road Test' : 'Full G Road Test'}</p>
              </div>
            </div>

            {/* Test Center */}
            {bookingState.testCenter && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <MapPin size={16} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Test Center</p>
                  <p className="font-medium">
                    {typeof bookingState.testCenter === 'string' 
                      ? bookingState.testCenter 
                      : bookingState.testCenter.name}
                  </p>
                </div>
              </div>
            )}

            {/* Date & Time */}
            {bookingState.testDate && bookingState.testTime && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Clock size={16} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date & Time</p>
                  <p className="font-medium">
                    {new Date(bookingState.testDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })} at {bookingState.testTime}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-primary mb-2">{"What's Next?"}</h3>
          <ul className="text-sm text-gray-500 space-y-1">
            <li>{"• You'll receive a confirmation email shortly"}</li>
            <li>{"• We'll send you a reminder 24 hours before your test"}</li>
            <li>{"• Bring all required documents on test day"}</li>
          </ul>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinueToConfirmation}
          className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary/80 cursor-pointer transition-colors flex items-center justify-center gap-2"
        >
          View Full Confirmation
          <ArrowRight size={16} />
        </button>

        {/* Support Link */}
        <p className="text-center text-sm text-gray-600 mt-4">
          Need help? <a href="mailto:support@elanroadtestrental.ca" className="text-primary hover:underline">Contact Support</a>
        </p>
      </div>
    </div>
  );
}