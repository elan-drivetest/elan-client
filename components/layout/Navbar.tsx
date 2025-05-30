// components/layout/Navbar.tsx
"use client"

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { locations } from "@/lib/data/locations";
import LocationsDropdown from "./LocationsDropdown";
import { useAuth } from "@/lib/context/AuthContext";
import { ChevronDown, User, LogOut, LayoutDashboard } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const renderAuthButtons = () => {
    // Show loading skeleton while checking auth status
    if (isLoading) {
      return (
        <div className="flex items-center space-x-2">
          <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
      );
    }

    // Show authenticated user menu
    if (isAuthenticated && user) {
      return (
        <div className="flex items-center space-x-2">
          {/* Dashboard button for larger screens */}
          <Link href="/dashboard" className="hidden sm:inline-flex">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>

          {/* User dropdown menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{user.full_name}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-3 py-2 text-sm">
                <p className="font-medium">{user.full_name}</p>
                <p className="text-gray-500 text-xs">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              
              {/* Dashboard link for mobile */}
              <DropdownMenuItem asChild className="sm:hidden">
                <Link href="/dashboard" className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <Link href="/dashboard/bookings" className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  My Bookings
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-2 text-red-600 focus:text-red-600"
              >
                <LogOut className="h-4 w-4" />
                {isLoggingOut ? "Logging out..." : "Log out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    }

    // Show login/signup buttons for unauthenticated users
    return (
      <div className="flex items-center space-x-2">
        <Link href="/login">
          <Button variant="outline" size="sm" className="hidden sm:inline-flex">
            Log in
          </Button>
        </Link>
        <Link href="/signup">
          <Button 
            size="sm" 
            className="bg-[#0C8B44] hover:bg-[#0C8B44]/90 text-white"
          >
            Sign up
          </Button>
        </Link>
      </div>
    );
  };

  return (
    <div className="w-full border-b sticky top-0 bg-white z-50">
      {/* Announcement banner */}
      <div className="w-full bg-[#0C8B44] text-white text-center py-2 text-sm">
        Get a $50 coupon with your first test ride book. Offer ends March 13, 2025. 
        <Link href="/march-ride" className="underline ml-1">
          Book your March ride now!
        </Link>
      </div>
      
      {/* Main navbar */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/elan-logo.svg" 
            alt="Elan Logo"
            width={84}
            height={36}
            priority
          />
        </Link>
        
        {/* Navigation links */}
        <div className="hidden md:flex items-center space-x-8">
          <Link href="/how-it-works" className="text-sm font-medium hover:text-[#0C8B44]">
            How It Works
          </Link>
          
          <LocationsDropdown locations={locations.map(location => ({...location, id: location.id.toString()}))} />
          
          <Link href="/contact-us" className="text-sm font-medium hover:text-[#0C8B44]">
            Contact Us
          </Link>
          <Link href="/faq" className="text-sm font-medium hover:text-[#0C8B44]">
            FAQ
          </Link>
          <Link href="https://blog.elanroadtestrental.ca/" className="text-sm font-medium hover:text-[#0C8B44]">
            Blogs
          </Link>
        </div>
        
        {/* Dynamic Auth Section */}
        {renderAuthButtons()}
      </div>
    </div>
  );
};

export default Navbar;