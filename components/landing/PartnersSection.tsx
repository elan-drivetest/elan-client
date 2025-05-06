// components/landing/PartnersSection.tsx
import React from "react";
import Image from "next/image";

const PartnersSection = () => {
  return (
    <section className="pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-xl md:text-2xl font-bold">Our Trusted Partners</h2>
      </div>
      
      <div className="flex flex-wrap justify-center items-center gap-8 md:gap-20">
        <div className="w-32">
          <Image 
            src="/partners/grayjays.png" 
            alt="Gray Jays" 
            width={160} 
            height={60} 
            className="w-full h-auto" 
          />
        </div>
        
        <div className="w-32">
          <Image 
            src="/partners/oonkoo.png" 
            alt="AVO" 
            width={160} 
            height={60} 
            className="w-full h-auto" 
          />
        </div>
        
        <div className="w-32">
          <Image 
            src="/partners/sony.png" 
            alt="Sony" 
            width={160} 
            height={60} 
            className="w-full h-auto" 
          />
        </div>
        
        <div className="w-32">
          <Image 
            src="/partners/whoworkswhen.png" 
            alt="Who Works When" 
            width={160} 
            height={60} 
            className="w-full h-auto" 
          />
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;