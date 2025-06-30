// app/dashboard/page.tsx - Updated to show most recent booking from API
"use client"

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import HelpCard from "@/components/booking/HelpCard";
import { useAuth } from "@/lib/context/AuthContext";
import { bookingApi } from "@/lib/api";
import { CheckCircle2, Phone, Loader2, Calendar, MapPin, AlertCircle, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ApiResponse } from "@/lib/types/auth.types";

// Define the booking interface based on the API response
interface APIBooking {
  id: number;
  instructor_id: number | null;
  base_price: number;
  pickup_price: number;
  addons_price: number;
  total_price: number;
  status: "pending" | "confirmed" | "completed" | "cancelled" | "rescheduled" | "succeeded" | "expired";
  test_result?: "PASS" | "FAIL" | null;
  coupon_code?: string;
  discount_amount?: number | null;
  is_rescheduled: boolean;
  timezone: string;
  road_test_doc_url?: string;
  g1_license_doc_url?: string;
  
  // Optional fields that may be missing
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
}

// Mock instructor data structure
interface Instructor {
  id: number;
  name: string;
  avatar: string;
  phone: string;
  rating: number;
}

// Enhanced booking card component for dashboard
const DashboardBookingCard: React.FC<{ 
  booking: APIBooking; 
  instructor: Instructor | null; 
  isSearchingInstructor: boolean;
}> = ({ booking, instructor, isSearchingInstructor }) => {
  
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
      return 'Date TBD';
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
        distance: booking.pickup_distance || 0
      };
    }
    
    // If pickup_price > 0 but no address, assume pickup service was selected
    if (booking.pickup_price > 0) {
      return {
        address: 'Pickup address TBD',
        distance: booking.pickup_distance || 0
      };
    }
    
    return null;
  };

  const testCenter = getTestCenterDisplay();
  const pickupInfo = getPickupDisplay();

  return (
    <div className="bg-gray-100 rounded-lg p-6 h-full">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-2xl font-bold mb-2">{getTestTypeDisplay()}</div>
          <div className="flex items-center gap-2">
            <span className={cn(
              "px-2 py-1 text-xs font-medium rounded-full",
              getStatusColor(booking.status)
            )}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
            <span className="text-sm text-gray-600">#{booking.id}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold text-gray-900">
            {formatPrice(booking.total_price)}
          </div>
          <div className="text-xs text-gray-600">Total</div>
        </div>
      </div>
      
      <div className="space-y-3 mb-6">
        {/* Test Date & Time */}
        <div className="flex items-start gap-2">
          <Calendar className="h-5 w-5 text-[#0C8B44] flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-medium text-sm">Test Date & Time</div>
            <div className="text-sm text-gray-600">{formatDateTime(booking.test_date)}</div>
          </div>
        </div>
        
        {/* Test Centre */}
        <div className="flex items-start gap-2">
          <MapPin className="h-5 w-5 text-[#0C8B44] flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-medium text-sm">Test Centre</div>
            <div className="text-sm text-gray-600">{testCenter.name}</div>
            <div className="text-xs text-gray-500">{testCenter.address}</div>
          </div>
        </div>
        
        {/* Pickup Information */}
        {pickupInfo && (
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 text-[#0C8B44] flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-sm">
                Pickup Service
                {pickupInfo.distance > 0 && ` (${pickupInfo.distance.toFixed(1)}km)`}
              </div>
              <div className="text-sm text-gray-600">{pickupInfo.address}</div>
            </div>
          </div>
        )}
      </div>
      
      {/* Instructor information */}
      <div className="bg-white rounded-lg p-4 flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gray-200">
            {instructor ? (
              <Image 
                src={instructor.avatar} 
                alt={instructor.name}
                fill
                className="object-cover"
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
            {instructor ? (
              <>
                <div className="flex items-center gap-1 mt-1 mb-1">
                  {Array(5).fill(0).map((_, i) => (
                    <svg key={i} width="16" height="16" viewBox="0 0 16 16" fill="#FFBB00" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 0L10.3511 5.18237L16 5.87336L11.768 9.77641L12.7023 16L8 12.8824L3.29772 16L4.23204 9.77641L0 5.87336L5.64886 5.18237L8 0Z" />
                    </svg>
                  ))}
                </div>
                <div className="font-medium">{instructor.name}</div>
              </>
            ) : (
              <div className="flex items-center gap-2 mt-1">
                {isSearchingInstructor ? (
                  <>
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Connecting...</span>
                  </>
                ) : (
                  <span className="text-sm text-gray-600">Searching for instructor...</span>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {instructor && (
            <Link href={`tel:${instructor.phone}`} className="flex items-center text-sm hover:text-[#0C8B44]">
              <Phone size={16} className="mr-1" />
              {instructor.phone}
            </Link>
          )}
          
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
      
      {/* Action buttons */}
      <div className="space-y-2">
        <Button 
          asChild
          className="w-full bg-[#0C8B44] hover:bg-[#0C8B44]/90 text-white"
        >
          <Link href="/dashboard/bookings">View All Bookings</Link>
        </Button>
        
        {(booking.status === 'confirmed' || booking.status === 'succeeded') && (
          <Button 
            variant="outline"
            className="w-full"
          >
            Reschedule Booking
          </Button>
        )}
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { user, isLoading, isAuthenticated, checkAuthStatus } = useAuth();
  const router = useRouter();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const [recentBooking, setRecentBooking] = useState<APIBooking | null>(null);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState<string | null>(null);

  // Mock instructor data - in real implementation, this would come from booking.instructor_id
  const mockInstructors: Record<number, Instructor> = {
    1: {
      id: 1,
      name: "Joe Morgan",
      avatar: "/instructor.jpeg",
      phone: "1-648-468-4589",
      rating: 5
    },
    2: {
      id: 2,
      name: "Sarah Chen",
      avatar: "/instructor.jpeg", 
      phone: "1-647-123-4567",
      rating: 5
    }
  };

  // Fetch most recent booking
  const fetchRecentBooking = async () => {
    try {
      setBookingsLoading(true);
      setBookingsError(null);
      
      const response: ApiResponse<APIBooking[]> = await bookingApi.getBookings();
      
      if (response.success && response.data && response.data.length > 0) {
        // Sort bookings by created_at date (most recent first) or by ID if no date
        const sortedBookings = response.data.sort((a, b) => {
          if (a.created_at && b.created_at) {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          }
          // Fallback to ID sorting (higher ID = more recent)
          return b.id - a.id;
        });
        
        // Get the most recent active booking, or any booking if no active ones
        const activeBooking = sortedBookings.find(booking => 
          ['pending', 'confirmed', 'succeeded'].includes(booking.status)
        );
        
        setRecentBooking(activeBooking || sortedBookings[0]);
      } else {
        setRecentBooking(null);
        if (response.error) {
          setBookingsError(response.error.message || 'Failed to fetch bookings');
        }
      }
    } catch (err) {
      console.error('Error fetching recent booking:', err);
      setBookingsError('Network error occurred while fetching bookings');
      setRecentBooking(null);
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    // If no user data and we haven't checked auth yet, try once
    if (!user && !hasCheckedAuth && !isLoading) {
      console.log('Dashboard: No user data, checking auth status once...');
      setHasCheckedAuth(true);
      checkAuthStatus();
    }
  }, [user, hasCheckedAuth, isLoading, checkAuthStatus]);

  useEffect(() => {
    // After we've checked auth and we're not loading, redirect if not authenticated
    if (hasCheckedAuth && !isLoading && !isAuthenticated) {
      console.log('Dashboard: User not authenticated, redirecting to login...');
      router.push('/login');
    }
  }, [hasCheckedAuth, isLoading, isAuthenticated, router]);

  // Fetch bookings when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchRecentBooking();
    }
  }, [isAuthenticated, user]);

  // Show loading state only while actually loading or during initial auth check
  if (isLoading || (!user && !hasCheckedAuth)) {
    return (
      <div className="flex min-h-screen bg-white">
        <DashboardSidebar />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#0C8B44]"></div>
        </div>
      </div>
    );
  }

  // Show login prompt if we've checked auth and user is not authenticated
  if (hasCheckedAuth && !isAuthenticated) {
    return (
      <div className="flex min-h-screen bg-white">
        <DashboardSidebar />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="text-xl font-semibold text-gray-600 mb-4">Authentication Required</div>
            <div className="text-gray-500 mb-6">Please log in to access your dashboard.</div>
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

  // Show dashboard content
  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <DashboardSidebar />
      
      {/* Main content */}
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">
          Welcome back, {user?.full_name || 'there'}!
        </h1>
        
        {/* Grid layout for content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Booking card in 2/3 of the grid */}
          <div className="md:col-span-2">
            {bookingsLoading ? (
              <div className="bg-gray-100 rounded-lg p-6 h-64 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-[#0C8B44] mx-auto mb-2" />
                  <span className="text-gray-600">Loading your recent booking...</span>
                </div>
              </div>
            ) : bookingsError ? (
              <div className="bg-gray-100 rounded-lg p-6 h-64 flex items-center justify-center">
                <div className="text-center">
                  <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <div className="text-red-600 font-medium mb-2">Error loading booking</div>
                  <div className="text-gray-600 text-sm mb-4">{bookingsError}</div>
                  <Button 
                    onClick={fetchRecentBooking}
                    className="bg-[#0C8B44] hover:bg-[#0C8B44]/90"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            ) : recentBooking ? (
              <>
                <h2 className="text-xl font-semibold mb-4">Your Recent Booking</h2>
                <DashboardBookingCard 
                  booking={recentBooking} 
                  instructor={recentBooking.instructor_id ? mockInstructors[recentBooking.instructor_id] : null}
                  isSearchingInstructor={!recentBooking.instructor_id && ['pending', 'confirmed', 'succeeded'].includes(recentBooking.status)}
                />
              </>
            ) : (
              <div className="bg-gray-100 rounded-lg p-6 h-64 flex items-center justify-center">
                <div className="text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <div className="text-gray-600 font-medium mb-2">No bookings yet</div>
                  <div className="text-gray-500 text-sm mb-4">
                    Book your first road test to get started
                  </div>
                  <Button 
                    asChild
                    className="bg-[#0C8B44] hover:bg-[#0C8B44]/90"
                  >
                    <Link href="/book-road-test-vehicle/road-test-details">
                      Book Your Test
                    </Link>
                  </Button>
                </div>
              </div>
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