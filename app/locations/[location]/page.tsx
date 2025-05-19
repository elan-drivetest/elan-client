// app/locations/[location]/page.tsx
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { capitalizeLocation } from "@/lib/utils";
import { locationData, LocationData } from "@/lib/data/locations-data";
import RatingBar from "@/components/shared/RatingBar";
import { Marquee } from "@/components/magicui/marquee";

// Type definition for Next.js 15 page props
interface LocationPageProps {
  params: Promise<{ location: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const TestimonialCard = ({ testimonial }: { testimonial: { name: string; location: string; text: string; rating: number } }) => {
  return (
    <div className="w-80 mx-4 bg-white p-6 rounded-lg shadow-md border border-gray-100">
      {/* Card content remains the same */}
      <div className="flex items-center mb-4">
        <div className="flex">
          {[...Array(testimonial.rating)].map((_, i) => (
            <svg 
              key={i} 
              width="16" 
              height="16" 
              viewBox="0 0 16 16" 
              fill="#FFBB00" 
              xmlns="http://www.w3.org/2000/svg"
              className="mr-1"
            >
              <path d="M8 0L10.3511 5.18237L16 5.87336L11.768 9.77641L12.7023 16L8 12.8824L3.29772 16L4.23204 9.77641L0 5.87336L5.64886 5.18237L8 0Z" />
            </svg>
          ))}
        </div>
      </div>

      <p className="text-gray-700 text-sm mb-4">{testimonial.text}</p>
      
      <div className="flex items-center">
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
          <span className="font-bold text-gray-500">{testimonial.name.charAt(0)}</span>
        </div>
        <div>
          <p className="font-semibold text-sm">{testimonial.name}</p>
          <p className="text-gray-500 text-xs">{testimonial.location}</p>
        </div>
      </div>
    </div>
  );
};

export default async function LocationPage({ params, searchParams }: LocationPageProps) {
  // Await both params and searchParams
  const { location: locationSlug } = await params;
  await searchParams; // We're not using this, but need to await it
  
  const location = capitalizeLocation(locationSlug);
  const data = (locationData[locationSlug.toLowerCase()] || locationData.default) as LocationData;
  
  return (
    <main className="bg-white">
      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold mb-6">
              Best Road Test Rental in <span className="text-[#0C8B44]">{location}</span>
            </h1>
            <p className="text-lg text-gray-700 mb-8">
              {data.heroText}
            </p>
            
            <div className="space-y-4 mb-8">
              {data.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-[#0C8B44] flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium">{feature.title}</p>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Link href="/book-road-test-vehicle/road-test-details">
                <Button 
                  className="bg-[#0C8B44] hover:bg-[#0C8B44]/90 text-white"
                  size="lg"
                >
                  Book a Road Test Car
                </Button>
              </Link>
              <Link href="/contact-us">
                <Button 
                  variant="outline" 
                  className="border-gray-300"
                  size="lg"
                >
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="relative h-[400px] rounded-lg overflow-hidden">
            <Image 
              src={data.heroImage} 
              alt={`Road test car rental in ${location}`}
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>
      
      {/* Rest of the component remains the same */}
      {/* Services Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4">
          Our Road Test Services in {location}
        </h2>
        <p className="text-center text-gray-700 max-w-3xl mx-auto mb-12">
          {data.servicesDescription}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {data.services.map((service, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-6 hover:border-[#0C8B44] transition-colors">
              <div className="w-12 h-12 bg-[#0C8B44]/10 rounded-lg flex items-center justify-center mb-4">
                <service.icon className="h-6 w-6 text-[#0C8B44]" />
              </div>
              <h3 className="font-bold mb-2">{service.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{service.description}</p>
              <p className="text-[#0C8B44] font-bold">{service.price}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Link href="/book-road-test-vehicle/road-test-details">
            <Button 
              className="bg-[#0C8B44] hover:bg-[#0C8B44]/90 text-white px-8"
              size="lg"
            >
              Book Your Road Test Car Now
            </Button>
          </Link>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our {location} Customers Say</h2>
          <p className="text-gray-600">
            {"Thousands of successful drivers have trusted Elan for their road test needs in " + location + ". Here's what some of them have to say about their experience."}
          </p>
        </div>
      
        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
          <Marquee pauseOnHover className="[--duration:20s] py-4">
            {data.testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} />
            ))}
          </Marquee>
          <Marquee reverse pauseOnHover className="[--duration:20s] py-4">
            {data.testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} />
            ))}
          </Marquee>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-gray-50"></div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-gray-50"></div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-[#0C8B44] rounded-lg p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Book Your Road Test Car in {location}?</h2>
          <p className="text-lg mb-8 max-w-3xl mx-auto">
            Secure your test-ready vehicle today and boost your chances of passing your driving test.
          </p>
          <Link href="/book-road-test-vehicle/road-test-details">
            <Button 
              className="bg-white text-[#0C8B44] hover:bg-gray-100 px-8"
              size="lg"
            >
              Book Now
            </Button>
          </Link>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          Frequently Asked Questions About Road Tests in {location}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 max-w-4xl mx-auto">
          {data.faqs.map((faq, index) => (
            <div key={index}>
              <h3 className="font-bold mb-2">{faq.question}</h3>
              <p className="text-gray-700">{faq.answer}</p>
            </div>
          ))}
          <div className="col-span-2">
            <RatingBar />
          </div>
        </div>
      </section>
    </main>
  );
}