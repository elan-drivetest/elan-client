// components/dashboard/BookingCard.tsx
import React from "react";
import { CheckCircle2, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { BookingCardProps } from "@/lib/types";

export default function BookingCard({ booking, instructor }: BookingCardProps) {
  return (
    <div className="bg-gray-100 rounded-lg p-6 h-full">
      <div className="text-2xl font-bold mb-4">{booking.testType}</div>
      
      <div className="space-y-3 mb-6">
        <div className="flex items-start gap-2">
          <CheckCircle2 className="h-5 w-5 text-[#0C8B44] flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-medium">Start date</div>
            <div className="text-sm text-gray-600">{booking.startDate}</div>
          </div>
        </div>
        
        <div className="flex items-start gap-2">
          <CheckCircle2 className="h-5 w-5 text-[#0C8B44] flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-medium">Road Test Centre</div>
            <div className="text-sm text-gray-600">{booking.testCentre}</div>
            <div className="text-sm text-gray-600">{booking.testCentreAddress}</div>
          </div>
        </div>
        
        {booking.pickupAddress && (
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 text-[#0C8B44] flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium">Pickup Address ({booking.pickupDistance} from Test Centre)</div>
              <div className="text-sm text-gray-600">{booking.pickupAddress}</div>
            </div>
          </div>
        )}
      </div>
      
      {/* Instructor information */}
      <div className="bg-white rounded-lg p-4 flex items-center justify-between">
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
          <Link href={`tel:${instructor.phone}`} className="flex items-center text-sm hover:text-[#0C8B44]">
            <Phone size={16} className="mr-1" />
            {instructor.phone}
          </Link>
          
          <div className="relative h-14 w-20">
            <Image
              src={booking.vehicleImage}
              alt="Test vehicle"
              fill
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}