// app/testimonials/page.tsx
import React from "react";
import TestimonialsSection from "@/components/landing/TestimonialsSection";

export const metadata = {
  title: "Customer Testimonials | Elan Road Test Rental",
  description: "Read what our customers have to say about their road test experience with Elan. Thousands of successful drivers have trusted us for their road test needs.",
};

export default function TestimonialsPage() {
  return (
    <main className="min-h-screen">
      {/* Page Header */}
      <div className="bg-gradient-to-b from-gray-50 to-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Customer Testimonials
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Don&apos;t just take our word for it. See what our customers have to say about their experience with Elan Road Test Rental.
          </p>
        </div>
      </div>

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Join Our Happy Customers?</h2>
          <p className="text-gray-600 mb-8">
            Book your road test vehicle today and experience the Elan difference for yourself.
          </p>
          <a
            href="/book-road-test-vehicle/road-test-details"
            className="inline-block bg-[#0C8B44] hover:bg-[#0A7A3C] text-white font-semibold px-8 py-3 rounded-md transition-colors"
          >
            Book Now
          </a>
        </div>
      </section>
    </main>
  );
}
