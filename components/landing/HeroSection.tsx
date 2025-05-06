// components/landing/HeroSection.tsx
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import RatingBar from "../shared/RatingBar";

const HeroSection = () => {
  return (
    <div className="flex flex-col md:flex-row items-start justify-between gap-6 px-4 sm:px-6 lg:px-8 py-10 md:py-32 max-w-7xl mx-auto">
      {/* Left side - Image */}
      <div className="w-full md:w-1/2 rounded-lg overflow-hidden">
        <div className="relative mx-auto aspect-square md:max-h-[480px]">
          <Image
            src="/hero-image.png"
            alt="Driver's hands on steering wheel"
            fill
            className="object-cover rounded-lg"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </div>

      {/* Right side - Content */}
      <div className="w-full md:w-1/2 space-y-10">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
          First Ever <span className="text-[#0C8B44]">Road Test</span>
          <br />
          <Image 
            src="/car-icon.png" 
            alt="Car icon" 
            width={120} 
            height={120} 
            quality={100}
            className="inline-block mr-2 mb-1" 
          />
          <span className="text-[#4CAF50]">Car Solutions</span>
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Hassle-Free Online Booking */}
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 mt-1">
              <div className="w-4 h-4 rounded-full bg-[#0C8B44] flex items-center justify-center">
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 4L3 6L7 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div>
              <p className="font-medium">
                <span className="text-[#0C8B44]">Hassle-Free Online Booking</span> –
              </p>
              <p className="text-sm text-gray-700">
                Reserve your car in minutes with a seamless process.
              </p>
            </div>
          </div>

          {/* Road-test-ready vehicles */}
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 mt-1">
              <div className="w-4 h-4 rounded-full bg-[#0C8B44] flex items-center justify-center">
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 4L3 6L7 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div>
              <p className="font-medium">
                <span className="text-[#0C8B44]">Road-test-ready vehicles</span> –
              </p>
              <p className="text-sm text-gray-700">
                Well-maintained and Test-approved vehicle for your test.
              </p>
            </div>
          </div>

          {/* Same Car, Better Value */}
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 mt-1">
              <div className="w-4 h-4 rounded-full bg-[#0C8B44] flex items-center justify-center">
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 4L3 6L7 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div>
              <p className="font-medium">
                <span className="text-[#0C8B44]">Same Car, Better Value</span> –
              </p>
              <p className="text-sm text-gray-700">
                {"Drive the same instructor's car, but at a lower price."}
              </p>
            </div>
          </div>

          {/* Local Business */}
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 mt-1">
              <div className="flex items-center gap-1">
                <Image src="/Flag_of_Canada.png" alt="Canadian Flag" width={16} height={12} />
              </div>
            </div>
            <div>
              <p className="font-medium">
                <span className="text-[#0C8B44]">Local Business</span> –
              </p>
              <p className="text-sm text-gray-700">
                Elan is completely Canadian owned and operated.
              </p>
            </div>
          </div>
        </div>

        {/* Call-to-action buttons */}
        <div className="flex flex-wrap gap-4 pt-2">
          <Link href="/book-now">
            <Button 
              size="lg" 
              className="bg-[#0C8B44] hover:bg-[#0C8B44]/90 text-white font-medium"
            >
              Book Car for Road test
            </Button>
          </Link>
          <Link href="/how-it-works">
            <Button 
              variant="outline" 
              size="lg" 
              className="border-gray-300 text-gray-800 font-medium"
            >
              How it works
            </Button>
          </Link>
          <Link href="/success-stories">
            <Button 
              variant="link" 
              size="lg" 
              className="border-gray-300 text-gray-800 font-medium"
            >
              Success Stories
            </Button>
          </Link>
        </div>

        {/* Rating */}
        <RatingBar />
      </div>
    </div>
  );
};

export default HeroSection;