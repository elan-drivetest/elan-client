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
import { useDriveTestCenters, useCouponVerification, useAddons } from "@/lib/hooks/useBooking";
import { formatPrice } from "@/lib/types/booking.types";
import { getDistancePerks, UPGRADE_PRICING } from "@/lib/utils/distance-calculator";

/* eslint-disable @typescript-eslint/no-explicit-any */

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
  isConfirmationPage?: boolean;
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
  toggleAddOn = () => {},
  className,
  isConfirmationPage = false,
}: TestSummaryProps) {
  const [promoCode, setPromoCode] = React.useState("");
  const [couponError, setCouponError] = React.useState("");
  const [appliedCoupon, setAppliedCoupon] = React.useState<any>(null);
  
  const { bookingState } = useBooking();
  
  // API hooks
  const { addons } = useAddons();
  const { centers: testCenters, getCenterById } = useDriveTestCenters();
  const { verifyCoupon, loading: couponLoading } = useCouponVerification();

  // Get selected test center details
  const getSelectedTestCenter = () => {
    if (bookingState.testCenterId && testCenters.length > 0) {
      const centerId = typeof bookingState.testCenterId === 'string' 
        ? parseInt(bookingState.testCenterId) 
        : bookingState.testCenterId;
      return getCenterById(centerId);
    }
    return null;
  };

  // Get real base price from selected test center
  const getRealBasePrice = (): number => {
    const selectedTestCenter = getSelectedTestCenter();
    if (selectedTestCenter) {
      return selectedTestCenter.base_price; // Already in cents from API
    }
    return 8000; // Default $80.00 in cents
  };

  // Get mock test addon
  const getMockTestAddon = () => {
    if (!addons || addons.length === 0) return null;
    
    const testType = bookingState.testType;
    if (!testType) return null;
    
    const mockTestAddon = addons.find(addon => {
      const isMockTest = addon.name.toLowerCase().includes('mock test');
      if (!isMockTest) return false;
      
      if (testType === 'G') {
        return addon.name.toLowerCase().includes('of g') && !addon.name.toLowerCase().includes('g2');
      } else if (testType === 'G2') {
        return addon.name.toLowerCase().includes('of g2');
      }
      
      return false;
    });
    
    return mockTestAddon || null;
  };

  // Get driving lesson addon
  const getDrivingLessonAddon = () => {
    if (!addons || addons.length === 0) return null;
    
    const testType = bookingState.testType;
    if (!testType) return null;
    
    const lessonAddon = addons.find(addon => {
      const isLesson = addon.name.toLowerCase().includes('lesson') && 
                     addon.name.toLowerCase().includes('1 hour');
      if (!isLesson) return false;
      
      if (testType === 'G') {
        return addon.name.toLowerCase().includes('of g') && !addon.name.toLowerCase().includes('g2');
      } else if (testType === 'G2') {
        return addon.name.toLowerCase().includes('of g2');
      }
      
      return false;
    });
    
    return lessonAddon || null;
  };

  // FIXED: Handle API response with detailed debugging for coupon verification
  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    
    setCouponError("");
    
    try {
      const result = await verifyCoupon(promoCode);
      
      // DETAILED DEBUGGING: Log the exact response structure
      console.log('🔍 Raw coupon API result:', result);
      console.log('🔍 Result type:', typeof result);
      console.log('🔍 Result keys:', result ? Object.keys(result) : 'null');
      
      // Handle different possible response structures
      if (result) {
        let couponData = null;
        let isValid = false;
        
        // Case 1: API wrapper response like {success: true, data: {coupon: {...}}}
        if (typeof result === 'object' && 'success' in result) {
          const apiResult = result as { success: boolean; data?: any; error?: { message?: string } };
          console.log('📦 API wrapper detected:', apiResult);
          
          if (apiResult.success && apiResult.data) {
            // Try different nested structures
            couponData = apiResult.data.coupon || apiResult.data;
            isValid = true;
          } else {
            setCouponError(apiResult.error?.message || "Invalid coupon code");
            return;
          }
        }
        // Case 2: Direct coupon object like {code: "QT0NFO1", discount: 1000}
        else if (typeof result === 'object' && ('code' in result || 'discount' in result)) {
          const couponResult = result as { code?: string; discount?: number };
          console.log('🎯 Direct coupon object detected:', couponResult);
          console.log('🎯 Discount value:', couponResult.discount, 'Type:', typeof couponResult.discount);
          couponData = result;
          isValid = true;
        }
        // FIXED: Handle the case where verifyCoupon returns the coupon directly
        else if (typeof result === 'object' && result !== null) {
          console.log('🎯 Processing coupon object:', result);
          couponData = result;
          isValid = true;
        }
        // Case 3: Boolean response (true/false) - This shouldn't happen with a proper API
        // else if (typeof result === 'boolean') {
        //   console.log('🔘 Boolean result:', result);
        //   console.warn('⚠️ API returned boolean instead of coupon object. This indicates an issue with the verifyCoupon hook.');
        //   if (result) {
        //     // FIXED: Don't create a coupon with 0 discount - this is wrong!
        //     setCouponError("API returned invalid response format. Please check the verifyCoupon implementation.");
        //     return;
        //   } else {
        //     setCouponError("Invalid coupon code");
        //     return;
        //   }
        // }
        // Case 4: Any other truthy value
        else {
          console.log('❓ Unknown result format:', result);
          couponData = result;
          isValid = true;
        }
        
        console.log('✅ Final coupon data:', couponData);
        console.log('✅ Is valid:', isValid);
        
        if (isValid && couponData) {
          console.log('🔍 Before processing - couponData:', couponData);
          
          // Ensure we have at least a code
          if (!couponData.code) {
            couponData.code = promoCode;
            console.log('📝 Added missing code:', couponData.code);
          }
          
          // FIXED: Preserve the original discount value from API (it's already in cents)
          // Don't override the discount if it exists and is a valid number
          console.log('🔍 Checking discount - Value:', couponData.discount, 'Type:', typeof couponData.discount, 'Is undefined?', couponData.discount === undefined);
          
          if (typeof couponData.discount !== 'number' || couponData.discount === undefined || isNaN(couponData.discount)) {
            console.warn('⚠️ Discount is not a valid number, setting to 0. Original value was:', couponData.discount);
            couponData.discount = 0;
          } else {
            console.log('✅ Discount is valid:', couponData.discount);
          }
          
          console.log('🎉 Final coupon data before setting state:', couponData);
          console.log('💰 Final discount amount (in cents):', couponData.discount);
          
          setAppliedCoupon(couponData);
          onApplyPromo(promoCode);
          setPromoCode("");
        } else {
          console.error('❌ Coupon validation failed');
          setCouponError("Invalid coupon response");
          setAppliedCoupon(null);
        }
      } else {
        console.log('❌ No result received');
        setCouponError("Invalid coupon code");
        setAppliedCoupon(null);
      }
    } catch (error) {
      console.error('❌ Coupon verification error:', error);
      setCouponError("Failed to verify coupon. Please try again.");
      setAppliedCoupon(null);
    }
  };

  // Format currency from cents to CAD
  const formatCurrency = (valueInCents: number): string => {
    return formatPrice(valueInCents);
  };

  // Calculate add-on price using real API data with proper upgrade logic
  const calculateAddOnPrice = (): number => {
    if (!bookingState.selectedAddOn) return 0;
    
    const testType = bookingState.testType as 'G2' | 'G';
    const isFreeLessonUpgrade30min = bookingState.freeAddOn === 'thirty-min-lesson';
    const isFreeLessonUpgrade1hr = bookingState.freeAddOn === 'one-hour-lesson';
    
    if (bookingState.selectedAddOn === 'mock-test') {
      const mockTestAddon = getMockTestAddon();
      
      if (!mockTestAddon) {
        // Fallback to original pricing logic
        if (isFreeLessonUpgrade30min) {
          return testType === 'G2' ? 2999 : 3499; // $29.99 or $34.99 in cents
        } else if (isFreeLessonUpgrade1hr) {
          return testType === 'G2' ? 499 : 499; // $4.99 in cents for both G2 and G
        }
        return testType === 'G2' ? 5499 : 6499; // $54.99 or $64.99 in cents
      }
      
      // Use real API pricing with upgrade logic
      if (isFreeLessonUpgrade30min) {
        return testType === 'G2' ? UPGRADE_PRICING.G2.LESSON_30MIN_TO_MOCK : UPGRADE_PRICING.G.LESSON_30MIN_TO_MOCK;
      } else if (isFreeLessonUpgrade1hr) {
        return testType === 'G2' ? UPGRADE_PRICING.G2.LESSON_1HR_TO_MOCK : UPGRADE_PRICING.G.LESSON_1HR_TO_MOCK;
      }
      return mockTestAddon.price; // Full price if no free lesson
      
    } else if (bookingState.selectedAddOn === 'driving-lesson') {
      const lessonAddon = getDrivingLessonAddon();
      
      if (!lessonAddon) {
        // Fallback to original pricing logic
        if (isFreeLessonUpgrade30min) {
          return testType === 'G2' ? 2500 : 3000; // $25.00 or $30.00 in cents
        }
        return testType === 'G2' ? 5000 : 6000; // $50.00 or $60.00 in cents
      }
      
      // Use real API pricing
      if (isFreeLessonUpgrade30min) {
        return testType === 'G2' ? UPGRADE_PRICING.G2.LESSON_30MIN_TO_1HR : UPGRADE_PRICING.G.LESSON_30MIN_TO_1HR;
      }
      return lessonAddon.price; // Full price if no free lesson
    }
    
    return 0;
  };

  // Get pickup distance display with actual distance from booking state
  const getPickupDistanceDisplay = (): string => {
    if (bookingState.locationOption === 'test-centre') {
      return '';
    }
    
    if (!bookingState.pickupDistance || bookingState.pickupDistance === 0) {
      return '0.0km from Test Centre';
    }
    
    return `${bookingState.pickupDistance.toFixed(1)}km from Test Centre`;
  };

  // Calculate pickup price based on actual distance
  const calculatePickupPrice = (): number => {
    if (bookingState.locationOption === 'pickup' && bookingState.pickupDistance) {
      const distance = bookingState.pickupDistance;
      if (distance <= 50) {
        return Math.round(distance * 100); // $1/km in cents
      } else {
        return Math.round((50 * 100) + ((distance - 50) * 50)); // First 50km + $0.50/km for rest
      }
    }
    return 0;
  };

  // Get distance benefits for free services display
  const getDistanceBenefits = () => {
    if (!bookingState.pickupDistance || bookingState.locationOption === 'test-centre') {
      return { free_dropoff: false, free_30min_lesson: false, free_1hr_lesson: false };
    }
    return getDistancePerks(bookingState.pickupDistance);
  };

  // Generate payment breakdown with proper upgrade logic
  const generatePaymentBreakdown = (): PaymentBreakdownItem[] => {
    const breakdown: PaymentBreakdownItem[] = [];
    
    // Use real base price from selected test center
    const realBasePrice = getRealBasePrice();
    
    // Calculate pickup price using actual distance
    const pickupPriceInCents = calculatePickupPrice();
    
    // Calculate add-on price using real API data
    const addOnPriceInCents = calculateAddOnPrice();

    breakdown.push({
      label: "Road Test Centre",
      price: formatCurrency(realBasePrice)
    });
    
    // Pickup price if applicable with real distance
    if (bookingState.locationOption === 'pickup' && bookingState.pickupAddress) {
      breakdown.push({
        label: `Pickup Price`,
        price: formatCurrency(pickupPriceInCents)
      });
      
      // Add free services based on distance
      const distanceBenefits = getDistanceBenefits();
      if (distanceBenefits.free_dropoff) {
        breakdown.push({
          label: `🎉 Free Drop-Off Service`,
          price: formatCurrency(0),
          isFree: true
        });
      }
    }
    
    // Selected add-on with proper upgrade logic
    if (bookingState.selectedAddOn === 'mock-test') {
      const mockTestAddon = getMockTestAddon();
      const addonName = mockTestAddon?.name || "Complete Mock Test";
      
      // Handle upgrade from free 30-min lesson to mock test
      if (bookingState.freeAddOn === 'thirty-min-lesson') {
        breakdown.push({
          label: "Mock Test Upgrade (from free 30-min lesson)",
          price: formatCurrency(addOnPriceInCents)
        });
      } 
      // Handle upgrade from free 1-hour lesson to mock test
      else if (bookingState.freeAddOn === 'one-hour-lesson') {
        breakdown.push({
          label: "Mock Test Upgrade (from free 1-hour lesson)",
          price: formatCurrency(addOnPriceInCents)
        });
      } 
      // Full price mock test (no free lesson)
      else {
        breakdown.push({
          label: addonName,
          price: formatCurrency(addOnPriceInCents)
        });
      }
    } else if (bookingState.selectedAddOn === 'driving-lesson') {
      const lessonAddon = getDrivingLessonAddon();
      const addonName = lessonAddon?.name || "1 hour Driving Lesson";
      
      // Handle upgrade from free 30-min lesson to 1-hour lesson
      if (bookingState.freeAddOn === 'thirty-min-lesson') {
        breakdown.push({
          label: "1-hour Lesson Upgrade (from free 30-min lesson)",
          price: formatCurrency(addOnPriceInCents)
        });
      } 
      // Full price lesson (no free lesson)
      else {
        breakdown.push({
          label: addonName,
          price: formatCurrency(addOnPriceInCents)
        });
      }
    }
    
    // Free add-on display logic - only show if not being upgraded
    const isUpgrading = bookingState.selectedAddOn !== null;
    const distanceBenefits = getDistanceBenefits();
    
    // Show free 30-min lesson only if not upgrading from it
    if (bookingState.freeAddOn === 'thirty-min-lesson' && !isUpgrading) {
      breakdown.push({
        label: "🎉 Free 30-minute driving lesson",
        price: formatCurrency(0),
        isFree: true
      });
    } 
    // Show free 1-hour lesson only if not upgrading from it
    else if ((bookingState.freeAddOn === 'one-hour-lesson' || distanceBenefits.free_1hr_lesson) && !isUpgrading) {
      breakdown.push({
        label: "🎉 Free 1-hour driving lesson",
        price: formatCurrency(0),
        isFree: true
      });
    }
    
    // Applied coupon discount
    if (appliedCoupon && appliedCoupon.code && typeof appliedCoupon.discount === 'number') {
      console.log('💳 Adding coupon to breakdown:', appliedCoupon.code, 'Discount:', appliedCoupon.discount);
      breakdown.push({
        label: `Discount (${appliedCoupon.code})`,
        price: `- ${formatCurrency(appliedCoupon.discount)}`,
        isDiscount: true
      });
    } else if (appliedCoupon) {
      console.warn('⚠️ Coupon exists but invalid:', appliedCoupon);
    }
    
    // Calculate total with real pricing
    const subtotal = realBasePrice + pickupPriceInCents + addOnPriceInCents;
    const discountAmount = (appliedCoupon && typeof appliedCoupon.discount === 'number') ? appliedCoupon.discount : 0;
    const total = Math.max(0, subtotal - discountAmount);
    
    // Total
    breakdown.push({
      label: "Total Payment",
      price: formatCurrency(total),
      isTotal: true
    });
    
    return breakdown;
  };

  // FIXED: Determine what should be shown in SummaryAddOns based on upgrade logic
  const getSummaryAddOnProps = () => {
    // If user has free 1-hour lesson and upgrades to mock test, show only mock test as selected
    if (bookingState.freeAddOn === 'one-hour-lesson' && bookingState.selectedAddOn === 'mock-test') {
      return {
        selectedAddOn: 'mock-test' as AddOnType,
        freeAddOn: null // Hide free lesson since it's being upgraded
      };
    }
    
    // If user has free 30-min lesson and upgrades to something, show only the upgrade
    if (bookingState.freeAddOn === 'thirty-min-lesson' && bookingState.selectedAddOn) {
      return {
        selectedAddOn: bookingState.selectedAddOn,
        freeAddOn: null // Hide free lesson since it's being upgraded
      };
    }
    
    // Default: show current state
    return {
      selectedAddOn: bookingState.selectedAddOn,
      freeAddOn: bookingState.freeAddOn
    };
  };

  const summaryAddOnProps = getSummaryAddOnProps();

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
              
              {/* Coupon error message */}
              {couponError && (
                <p className="text-xs text-red-500 mt-1">{couponError}</p>
              )}
              
              {/* Applied coupon success */}
              {appliedCoupon && appliedCoupon.code && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-xs text-green-700">
                    {`✅ Coupon "${appliedCoupon.code}" applied! You saved ${formatCurrency(appliedCoupon.discount || 0)}`}
                  </p>
                </div>
              )}
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
        
        {/* FIXED: Add-ons selection in summary with proper mutual exclusion */}
        {toggleAddOn && onRemoveAddOn && !isConfirmationPage && (
          <SummaryAddOns 
            selectedAddOn={summaryAddOnProps.selectedAddOn ?? null}
            toggleAddOn={toggleAddOn}
            onRemove={onRemoveAddOn}
            freeAddOn={summaryAddOnProps.freeAddOn}
          />
        )}
        
        <HelpCard />
        <RatingBar />
      </div>
    </div>
  );
}