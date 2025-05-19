// app/dashboard/bookings/page.tsx
"use client"

import React, { useState } from "react";
import Image from "next/image";
import { Check, Phone } from "lucide-react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { dashboardBookings } from "@/lib/data/dashboard-bookings";
import HelpCard from "@/components/booking/HelpCard";

type TabType = "Active" | "Completed";

export default function Bookings() {
  const [activeTab, setActiveTab] = useState<TabType>("Active");
  const { bookings, instructor } = dashboardBookings;
  const booking = bookings[0]; // Using the first booking for now
  
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
              "px-4 py-2 text-sm font-medium rounded-md  flex justify-center items-center",
              activeTab === "Completed"
                ? "bg-[#0C8B44] text-white"
                : "bg-gray-100 text-gray-600"
            )}
            onClick={() => setActiveTab("Completed")}
          >
            Completed
          </Button>
        </div>
        
        {/* Booking card */}
        <div className="border border-gray-200 rounded-lg p-6 mb-8">
          {/* Title and Car Image */}
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">{booking.testType}</h2>
            <div className="relative h-48 w-full mb-4">
              <Image
                src={booking.vehicleImage}
                alt={booking.vehicleModel}
                fill
                className="object-contain"
              />
            </div>
            
            {/* Vehicle details */}
            <div className="mb-4">
              <h3 className="font-medium">{booking.vehicleType}</h3>
              <p className="text-sm text-gray-600">{booking.vehicleModel}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                {booking.vehicleFeatures.map((feature, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && <span>•</span>}
                    <span>{feature}</span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
          
          {/* Booking details with checkmarks */}
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-4 h-4 bg-[#0C8B44] rounded text-white flex items-center justify-center">
                  <Check size={12} />
                </div>
              </div>
              <div>
                <div className="font-medium">Start date</div>
                <div className="text-sm text-gray-600">{booking.startDate}</div>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-4 h-4 bg-[#0C8B44] rounded text-white flex items-center justify-center">
                  <Check size={12} />
                </div>
              </div>
              <div>
                <div className="font-medium">Road Test Centre</div>
                <div className="text-sm text-gray-600">{booking.testCentre}</div>
                <div className="text-sm text-gray-600">{booking.testCentreAddress}</div>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-4 h-4 bg-[#0C8B44] rounded text-white flex items-center justify-center">
                  <Check size={12} />
                </div>
              </div>
              <div>
                <div className="font-medium">Pickup Address ({booking.pickupDistance} from Test Centre)</div>
                <div className="text-sm text-gray-600">{booking.pickupAddress}</div>
              </div>
            </div>
          </div>
          
          {/* Payment breakdown */}
          <div className="mb-6">
            <h3 className="font-bold mb-4">Payment Breakdown</h3>
            
            {booking.paymentBreakdown.map((item, index) => (
              <div key={index} className="flex justify-between py-2">
                <div>
                  <div className="font-medium">{item.label}</div>
                  <div className="text-sm text-gray-600">{item.address}</div>
                  {item.description && (
                    <div className="text-sm text-gray-600">{item.description}</div>
                  )}
                </div>
                <div className={cn(
                  "font-medium",
                  item.isDiscount && "text-[#0C8B44]"
                )}>
                  {item.amount}
                </div>
              </div>
            ))}
            
            {/* Total payment */}
            <div className="flex justify-between py-2 border-t border-gray-200 mt-4">
              <div className="font-bold text-[#0C8B44]">Total Payment</div>
              <div className="font-bold text-[#0C8B44]">{booking.totalPayment}</div>
            </div>
          </div>
          
          {/* Help card */}
          <HelpCard />
          
          {/* Instructor information */}
          <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative h-12 w-12 rounded-full overflow-hidden">
                <Image 
                  src={instructor.avatar} 
                  alt={instructor.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <div className="text-sm text-[#0C8B44]">Your Instructor</div>
                <div className="flex items-center gap-1 mt-1 mb-1">
                  {Array(5).fill(0).map((_, i) => (
                    <svg key={i} width="16" height="16" viewBox="0 0 16 16" fill="#FFBB00" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 0L10.3511 5.18237L16 5.87336L11.768 9.77641L12.7023 16L8 12.8824L3.29772 16L4.23204 9.77641L0 5.87336L5.64886 5.18237L8 0Z" />
                    </svg>
                  ))}
                </div>
                <div className="font-medium">{instructor.name}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <a href={`tel:${instructor.phone}`} className="flex items-center text-sm">
                <Phone size={16} className="mr-1" />
                {instructor.phone}
              </a>
              
              <div className="relative h-14 w-20">
                <Image
                  src="/vehicle-lexus.png"
                  alt="Test vehicle"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>
          
          {/* Reschedule button */}
          <Button
            className="w-full bg-black hover:bg-black/90 text-white py-3"
          >
            Reschedule Your Booking
          </Button>
        </div>
      </div>
    </div>
  );
}