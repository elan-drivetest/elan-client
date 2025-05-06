// components/landing/CTASection.tsx
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="bg-[#0C8B44]">
      <div className="flex flex-col md:flex-row items-center max-w-7xl mx-auto">
        {/* Left side - Text and CTA */}
        <div className="w-full md:w-1/2 p-8 md:p-12 text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Ready to book your road test?
          </h2>
          <p className="text-lg mb-6">
            Secure your test-ready rental car in minutes!
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Link href="/book-now">
              <Button 
                variant="outline" 
                size="lg" 
                className="bg-white text-[#0C8B44] hover:bg-white/90 border-white"
              >
                Rent a drive test car
              </Button>
            </Link>
            
            <Link href="/signup">
              <Button 
                variant="outline" 
                size="lg" 
                className="border-white text-white bg-transparent hover:text-white hover:bg-white/10"
              >
                {"Sign up - it's free"}
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Right side - Image */}
        <div className="w-full md:w-1/2 py-5">
          <Image
            src="/cta-image.png"
            alt="Happy driver receiving keys"
            width={600}
            height={400}
            className="w-full h-auto"
          />
        </div>
      </div>
    </section>
  );
};

export default CTASection;