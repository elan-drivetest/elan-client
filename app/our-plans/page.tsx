// app/our-plans/page.tsx
"use client";

import React from "react";
import Image from "next/image";
import WhyChooseElanSection from "@/components/landing/WhyChooseElanSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";

export default function OurPlansPage() {

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-gray-50 to-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 flex items-center gap-3">
              Our Plans
              <Image src="/Flag_of_Canada.png" alt="Canadian Flag" width={48} height={24} />
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Choose the perfect plan for your road test needs. All packages include our signature
            familiarization session and are backed by our 100% satisfaction guarantee.
          </p>
        </div>
      </div>

      {/* Why Choose Elan Section */}
      <WhyChooseElanSection />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Book Your Road Test?</h2>
          <p className="text-gray-600 mb-8">
            Join thousands of successful drivers who have trusted Elan for their road test needs.
            Book your package today and take the first step towards getting your license.
          </p>
          <a
            href="/book-road-test-vehicle/road-test-details"
            className="inline-block bg-[#0C8B44] hover:bg-[#0A7A3C] text-white font-semibold px-8 py-3 rounded-md transition-colors"
          >
            Book Your Test Now
          </a>
        </div>
      </section>
    </main>
  );
}
