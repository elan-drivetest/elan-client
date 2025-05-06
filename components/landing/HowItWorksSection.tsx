// components/landing/HowItWorksSection.tsx
import React from "react";
import Image from "next/image";

const HowItWorksSection = () => {
  return (
    <section className="py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-sm text-gray-600 mb-2">How it Works?</h2>
        <h3 className="text-3xl md:text-4xl font-bold">Hassle Free Booking</h3>
      </div>
      
      {/* Timeline images */}
      <div className="space-y-12">
        {/* First timeline */}
        <div className="w-full relative">
          <Image
            src="/hiw-1.png"
            alt="Meet at drive test centre process"
            width={1200}
            height={200}
            quality={100}
            className="w-full h-auto"
          />
        </div>
        
        {/* Second timeline */}
        <div className="w-full relative">
          <Image
            src="/hiw-2.png"
            alt="Pick-up and drop-off process"
            width={1200}
            height={200}
            quality={100}
            className="w-full h-auto"
          />
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;