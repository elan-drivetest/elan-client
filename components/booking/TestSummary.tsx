"use client"

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import SummaryItem from "@/components/booking/SummaryItem";
import RatingBar from "@/components/booking/RatingBar";
import HelpCard from "./HelpCard";
import SummaryAddOns from "./SummaryAddOns";
import { AddOnType } from "@/app/book-road-test-vehicle/test-details/page";
import { useBooking } from "@/lib/context/BookingContext";

interface PaymentBreakdownItem {
  label: string;
  price: string;
  isTotal?: boolean;
  isDiscount?: boolean;
  isFree?: boolean;
}

interface TestSummaryProps {
  vehicleImage: string;
  vehicleType: string;
  vehicleModel: string;
  vehicleFeatures: string[];
  startDate: string;
  testCentre: string;
  testCentreAddress: string;
  onApplyPromo: (code: string) => void;
  onRemoveAddOn?: () => void;
  hasAddOn?: boolean;
  selectedAddOn?: AddOnType;
  toggleAddOn?: (type: AddOnType) => void;
  className?: string;
  isConfirmationPage?: boolean; // Add this prop to handle confirmation page display
}

export default function TestSummary({
  vehicleImage,
  vehicleType,
  vehicleModel,
  vehicleFeatures,
  startDate,
  testCentre,
  testCentreAddress,
  onApplyPromo,
  onRemoveAddOn,
  selectedAddOn = null,
  toggleAddOn = () => {},
  className,
  isConfirmationPage = false, // Default to false for regular pages
}: TestSummaryProps) {
  const [promoCode, setPromoCode] = React.useState("");
  const { bookingState } = useBooking();

  const handleApplyPromo = () => {
    onApplyPromo(promoCode);
  };

  // Format currency
  const formatCurrency = (value: number): string => {
    return `$ ${value.toFixed(2)} CAD`;
  };

  // Calculate add-on price directly
  const calculateAddOnPrice = (): number => {
    if (!bookingState.selectedAddOn) return 0;
    
    const isG2 = bookingState.testType === 'G2';
    const isFreeLessonUpgrade = bookingState.freeAddOn === 'thirty-min-lesson';
    
    if (bookingState.selectedAddOn === 'mock-test') {
      if (isFreeLessonUpgrade) {
        return isG2 ? 29.99 : 34.99; // Upgrade pricing
      }
      return isG2 ? 54.99 : 64.99; // Regular pricing
    } else if (bookingState.selectedAddOn === 'driving-lesson') {
      if (isFreeLessonUpgrade) {
        return isG2 ? 25.00 : 30.00; // Upgrade pricing
      }
      return isG2 ? 50.00 : 60.00; // Regular pricing
    }
    
    return 0;
  };

  // Generate payment breakdown based on booking state and direct calculations
  const generatePaymentBreakdown = (): PaymentBreakdownItem[] => {
    const breakdown: PaymentBreakdownItem[] = [];
    const pricing = bookingState.pricing || {
      basePrice: 80.00,
      pickupPrice: 0,
      addOnPrice: 0, // This will be overridden
      discounts: 0,
      total: 80.00
    };
    
    // Calculate add-on price directly
    const addOnPrice = calculateAddOnPrice();
    
    // Base price
    breakdown.push({
      label: "Road Test Centre",
      price: formatCurrency(pricing.basePrice)
    });
    
    // Pickup price if applicable
    if (bookingState.locationOption === 'pickup' && bookingState.pickupAddress) {
      breakdown.push({
        label: `Pickup Price`,
        price: formatCurrency(pricing.pickupPrice)
      });
      
      // Add free dropoff line if eligible
      if (bookingState.pickupDistance && bookingState.pickupDistance > 50) {
        breakdown.push({
          label: `Free Drop-Off Service`,
          price: '$ 0.00 CAD',
          isFree: true
        });
      }
    }
    
    // Selected add-on if any
    if (bookingState.selectedAddOn === 'mock-test') {
      // If upgrading from free 30-min lesson to mock test
      if (bookingState.freeAddOn === 'thirty-min-lesson') {
        breakdown.push({
          label: "Mock Test Upgrade (from free 30-min lesson)",
          price: formatCurrency(addOnPrice)
        });
      } else {
        breakdown.push({
          label: "Complete Mock Test",
          price: formatCurrency(addOnPrice)
        });
      }
    } else if (bookingState.selectedAddOn === 'driving-lesson') {
      // If upgrading from free 30-min lesson to 1-hour lesson
      if (bookingState.freeAddOn === 'thirty-min-lesson') {
        breakdown.push({
          label: "1-hour Lesson Upgrade (from free 30-min lesson)",
          price: formatCurrency(addOnPrice)
        });
      } else {
        breakdown.push({
          label: "1 hour Driving Lesson",
          price: formatCurrency(addOnPrice)
        });
      }
    }
    
    // Free add-on if eligible - only show if not being upgraded
    const isUpgrading = bookingState.freeAddOn === 'thirty-min-lesson' && bookingState.selectedAddOn !== null;
    
    if (bookingState.freeAddOn === 'thirty-min-lesson' && !isUpgrading) {
      breakdown.push({
        label: "🎉 Free 30-minute driving lesson",
        price: '$ 0.00 CAD',
        isFree: true
      });
    } else if (bookingState.freeAddOn === 'one-hour-lesson') {
      breakdown.push({
        label: "🎉 Free 1-hour driving lesson",
        price: '$ 0.00 CAD',
        isFree: true
      });
    }
    
    // Discounts if any
    if (pricing.discounts > 0) {
      breakdown.push({
        label: "Discount (Free Dropoff)",
        price: `- ${formatCurrency(pricing.discounts)}`,
        isDiscount: true
      });
    }
    
    // Calculate total directly
    const total = pricing.basePrice + pricing.pickupPrice + addOnPrice - pricing.discounts;
    
    // Total
    breakdown.push({
      label: "Total Payment",
      price: formatCurrency(total),
      isTotal: true
    });
    
    return breakdown;
  };

  return (
    <div className={cn("border rounded-lg", className)}>
      <div className="p-6">
        <h2 className="text-xl font-medium mb-4">Summary</h2>
        
        <div className="mb-8">
          <Image
            src={vehicleImage}
            alt={vehicleModel}
            width={300}
            height={200}
            className="mx-auto"
          />
        </div>
        
        <div className="mb-6">
          <h3 className="font-medium mb-1">{vehicleType}</h3>
          <p className="text-sm text-gray-600">{vehicleModel}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
            {vehicleFeatures.map((feature, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span>•</span>}
                <span>{feature}</span>
              </React.Fragment>
            ))}
          </div>
        </div>
        
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
          
          {/* Show pickup address if option is pickup */}
          {bookingState.locationOption === 'pickup' && bookingState.pickupAddress && (
            <SummaryItem 
              label={`Pickup Address (${bookingState.pickupDistance}km from Test Centre)`}
              value={bookingState.pickupAddress}
              checked={true} 
            />
          )}
        </div>
        
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-2">Promo codes</h3>
          <p className="text-xs text-gray-600 mb-2">Unless stated otherwise, all discounts are one-time.</p>
          {!isConfirmationPage ? (
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
                className="px-4 py-2 bg-[#0C8B44] text-white rounded-md text-sm font-medium hover:bg-[#0A7A3C] transition-colors"
              >
                Apply
              </button>
            </div>
          ) : null}
        </div>
        
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-2">Payment Breakdown</h3>
          <div className="space-y-3">
            {generatePaymentBreakdown().map((item, index) => (
              <div 
                key={index} 
                className={cn(
                  "flex justify-between items-center",
                  item.isTotal && "pt-2 border-t border-gray-200 font-medium"
                )}
              >
                <span className={cn(
                  "text-sm",
                  item.isFree && "text-[#0C8B44]",
                  item.isDiscount && "text-red-500"
                )}>
                  {item.label}
                </span>
                <span 
                  className={cn(
                    "text-sm",
                    item.isTotal && "text-[#0C8B44] font-medium",
                    item.isFree && "text-[#0C8B44]",
                    item.isDiscount && "text-red-500"
                  )}
                >
                  {item.price}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Add-ons selection in summary */}
        {toggleAddOn && onRemoveAddOn && !isConfirmationPage && (
          <SummaryAddOns 
            selectedAddOn={selectedAddOn}
            toggleAddOn={toggleAddOn}
            onRemove={onRemoveAddOn}
            freeAddOn={bookingState.freeAddOn}
          />
        )}
        
        <HelpCard />
        <RatingBar />
      </div>
    </div>
  );
}