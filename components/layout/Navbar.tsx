// components/layout/Navbar.tsx
"use client"

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { locations } from "@/lib/data/locations";
import LocationsDropdown from "./LocationsDropdown";
import { useAuth } from "@/lib/context/AuthContext";
import { ChevronDown, User, LogOut, LayoutDashboard, Sparkles, ArrowRight, Menu, X } from "lucide-react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  // Publish the navbar's (variable) height as a CSS variable so other sticky
  // elements — e.g. the dashboard sidebar — can offset themselves below it
  // regardless of the announcement banner wrapping at different widths.
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;

    const setHeight = () => {
      document.documentElement.style.setProperty('--navbar-height', `${el.offsetHeight}px`);
    };

    setHeight();
    const observer = new ResizeObserver(setHeight);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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
          <div className="w-28 h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
      );
    }

    // Show authenticated user menu
    if (isAuthenticated && user) {
      return (
        <div className="flex items-center space-x-2">
          {/* Book Car for Road Test button */}
          <Link href="/book-road-test-vehicle/road-test-details">
            <Button
              size="sm"
              className="bg-[#0C8B44] hover:bg-[#0C8B44]/90 text-white"
            >
              Book Car for Road Test
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

              {/* Dashboard link - now always visible */}
              <DropdownMenuItem asChild>
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
        {/* Book Car for Road Test button */}
        <Link href="/book-road-test-vehicle/road-test-details">
          <Button
            size="sm"
            className="bg-[#0C8B44] hover:bg-[#0C8B44]/90 text-white"
          >
            Book Car for Road Test
          </Button>
        </Link>

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
    <div ref={navRef} className="w-full border-b sticky top-0 bg-white z-50">
      {/* Announcement banner */}
      <Link
        href="/book-road-test-vehicle/road-test-details"
        className="block w-full bg-[#0C8B44] text-white py-2 text-sm hover:bg-[#0C8B44]/90 transition-colors"
      >
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-x-2 gap-y-1 flex-wrap text-center">
          <Sparkles className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            <span className="font-semibold">Free 1-hour driving lesson</span>
            <span className="opacity-90"> on pickups 100&nbsp;km+</span>
            <span className="mx-2 opacity-60">•</span>
            <span className="font-semibold">Free drop-off</span>
            <span className="opacity-90"> at 50&nbsp;km+</span>
          </span>
          <span className="inline-flex items-center gap-1 underline underline-offset-2">
            Book now
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        </div>
      </Link>
      
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
        
        {/* Dynamic Auth Section + mobile menu toggle */}
        <div className="flex items-center gap-2">
          {renderAuthButtons()}

          {/* Hamburger (mobile only) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white px-4 py-3 space-y-1">
          <Link
            href="/how-it-works"
            onClick={closeMobileMenu}
            className="block px-2 py-2.5 text-base font-medium text-gray-700 rounded-md hover:text-[#0C8B44] hover:bg-gray-50 transition-colors"
          >
            How It Works
          </Link>
          <Link
            href="/locations"
            onClick={closeMobileMenu}
            className="block px-2 py-2.5 text-base font-medium text-gray-700 rounded-md hover:text-[#0C8B44] hover:bg-gray-50 transition-colors"
          >
            Our Locations
          </Link>
          <Link
            href="/contact-us"
            onClick={closeMobileMenu}
            className="block px-2 py-2.5 text-base font-medium text-gray-700 rounded-md hover:text-[#0C8B44] hover:bg-gray-50 transition-colors"
          >
            Contact Us
          </Link>
          <Link
            href="/faq"
            onClick={closeMobileMenu}
            className="block px-2 py-2.5 text-base font-medium text-gray-700 rounded-md hover:text-[#0C8B44] hover:bg-gray-50 transition-colors"
          >
            FAQ
          </Link>
          <Link
            href="https://blog.elanroadtestrental.ca/"
            onClick={closeMobileMenu}
            className="block px-2 py-2.5 text-base font-medium text-gray-700 rounded-md hover:text-[#0C8B44] hover:bg-gray-50 transition-colors"
          >
            Blogs
          </Link>
        </div>
      )}
    </div>
  );
};

export default Navbar;