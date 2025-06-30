// app/book-road-test-vehicle/payment-failed/page.tsx
"use client"

import React from "react";
import { useRouter } from "next/navigation";
import { XCircle, RefreshCw, ArrowLeft, HelpCircle } from "lucide-react";
import HelpCard from "@/components/booking/HelpCard";

export default function PaymentFailed() {
  const router = useRouter();

  const handleRetryPayment = () => {
    router.push("/book-road-test-vehicle/payment");
  };

  const handleGoBackToBooking = () => {
    router.push("/book-road-test-vehicle/test-details");
  };

  const handleStartOver = () => {
    router.push("/book-road-test-vehicle/road-test-details");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Error Icon */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle size={40} className="text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
          <p className="text-gray-600">
            {"We couldn't process your payment. Don't worry, your booking details are still saved."}
          </p>
        </div>

        {/* Common Reasons */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <HelpCircle size={20} className="text-gray-600" />
            Common Reasons
          </h2>
          
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span>Insufficient funds in your account</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span>Card declined by your bank</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span>Incorrect card details entered</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span>Card expired or blocked</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span>Network connection issue</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Retry Payment */}
          <button
            onClick={handleRetryPayment}
            className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary/80 cursor-pointer transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw size={16} />
            Try Payment Again
          </button>

          {/* Go Back to Edit Booking */}
          <button
            onClick={handleGoBackToBooking}
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Booking Details
          </button>

          {/* Start Over */}
          <button
            onClick={handleStartOver}
            className="w-full text-gray-600 py-2 px-4 rounded-lg font-medium hover:text-gray-800 transition-colors"
          >
            Start New Booking
          </button>
        </div>

        {/* Help Section */}
        <HelpCard/>

        {/* Security Note */}
        <p className="text-center text-xs text-gray-500 my-4">
          Your payment information is secure and encrypted. No charges were applied to your card.
        </p>
      </div>
    </div>
  );
}