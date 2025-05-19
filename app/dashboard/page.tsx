// app/dashboard/page.tsx
"use client"

import React from "react";
import { dashboardData } from "@/lib/data/dashboard";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import BookingCard from "@/components/dashboard/BookingCard";
import HelpCard from "@/components/booking/HelpCard";

export default function Dashboard() {
  const { currentBooking, instructor } = dashboardData;
  
  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <DashboardSidebar />
      
      {/* Main content */}
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Your Current Booking</h1>
        
        {/* Grid layout for content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Booking card in 2/3 of the grid */}
          <div className="md:col-span-2">
            <BookingCard booking={currentBooking} instructor={instructor} />
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