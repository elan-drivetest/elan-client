// components/layout/Navbar.tsx
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { locations } from "@/lib/data/locations";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  return (
    <div className="w-full border-b">
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
          <Link href="/how-it-works" className="text-sm font-medium">
            How It Works
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center text-sm font-medium">
              Our Locations <ChevronDown className="ml-1 h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-48">
              {locations.map((location) => (
                <DropdownMenuItem key={location.id} asChild>
                  <Link href={location.href} className="w-full">
                    {location.name}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Link href="/contact-us" className="text-sm font-medium">
            Contact Us
          </Link>
          <Link href="/faq" className="text-sm font-medium">
            FAQ
          </Link>
          <Link href="/blogs" className="text-sm font-medium">
            Blogs
          </Link>
        </div>
        
        {/* Auth buttons */}
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
      </div>
    </div>
  );
};

export default Navbar;