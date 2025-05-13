// components/landing/WhyChooseElanSection.tsx
import React from "react";
import Image from "next/image";

const FeatureCard = ({ number, title, description }: { number: string; title: string; description: string }) => {
  return (
    <div className="bg-gray-100 border border-transparent hover:border-[#0C8B44] transition-all duration-300 ease-in-out p-4 rounded-lg relative mb-8">
      <div className="absolute -top-4 -left-4 w-8 h-8 bg-[#0C8B44] rounded-full flex items-center justify-center border-2 border-white text-white text-xs">
        {number}
      </div>
      <h4 className="font-bold mb-2">{title}</h4>
      <p className="text-xs text-gray-700">
        {description}
      </p>
    </div>
  );
};

const WhyChooseElanSection = () => {
  const features = [
    {
      id: 1,
      number: "🟢",
      title: "Familiarization session",
      description: "Arrive 45 minutes early for a hands-on car introduction to boost your confidence."
    },
    {
      id: 2,
      number: "🟢",
      title: "Local knowledge",
      description: "Instructors familiar with test centres offering test minute tips to pass the road test."
    },
    {
      id: 3,
      number: "🟢",
      title: "Get your license first pay later",
      description: "0% Interest Financing on all packages. Use Klarna or Afterpay at checkout."
    },
    {
      id: 4,
      number: "🟢",
      title: "Convenient booking process",
      description: "Reserve your car instantly through a user-friendly website with flexible pick up and drop off options."
    },
    {
      id: 5,
      number: "🟢",
      title: "Fully Insured vehicles",
      description: "All vehicles are fully insured, providing peace of mind during your road test."
    },
    {
      id: 6,
      number: "🟢",
      title: "Dual Control Brakes",
      description: "Ensure safety during the test allowing the examiner to intervene if needed."
    }
  ];

  return (
    <section className="py-16 md:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-sm text-gray-600 mb-2">Why Choose Elan?</h2>
        <h3 className="text-3xl md:text-4xl font-bold flex items-center justify-center">
          Proudly Canadian <Image src="/Flag_of_Canada.png" alt="Canadian Flag" width={34} height={16} className="ml-2" />
        </h3>
      </div>
      
      <div className="text-center max-w-2xl mx-auto mb-12 md:mb-24">
        <p className="text-sm text-gray-700">
          Getting a car for your road test should be simple and stress free. So we made it that way. 
          Whether you need a car for road test or a little longer to practice, Elan makes renting a road test vehicle a breeze.
        </p>
      </div>
      
      {/* Desktop megaphone layout - hidden on mobile */}
      <div className="hidden md:block relative h-[800px] max-w-6xl mx-auto">
        {/* Megaphone in center */}
        <div className="absolute left-1/2 top-1/3 transform -translate-x-1/2 -translate-y-1/2 z-40">
          <Image 
            src="/megaphone.png" 
            alt="Megaphone with arrows" 
            width={360} 
            height={260} 
            priority 
          />
        </div>
        
        {/* Top row */}
        <div className="absolute left-[30%] top-0 w-4/12">
          <div className="bg-gray-100 border border-transparent hover:border-[#0C8B44] transition-all duration-300 ease-in-out p-4 rounded-lg relative">
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-[#0C8B44] rounded-full flex items-center justify-center border-2 border-white text-white text-xs">
              01
            </div>
            <h4 className="font-bold mb-2">Familiarization session</h4>
            <p className="text-xs text-gray-700">
              Arrive 45 minutes early for a hands-on car introduction to boost your confidence.
            </p>
          </div>
        </div>
        
        <div className="absolute right-0 top-40 w-4/12">
          <div className="bg-gray-100 border border-transparent hover:border-[#0C8B44] transition-all duration-300 ease-in-out p-4 rounded-lg relative">
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-[#0C8B44] rounded-full flex items-center justify-center border-2 border-white text-white text-xs">
              02
            </div>
            <h4 className="font-bold mb-2">Local knowledge</h4>
            <p className="text-xs text-gray-700">
              Instructors familiar with test centres offering test minute tips to pass the road test.
            </p>
          </div>
        </div>
        
        {/* Middle row */}
        <div className="absolute left-0 top-[20%] w-4/12">
          <div className="bg-gray-100 border border-transparent hover:border-[#0C8B44] transition-all duration-300 ease-in-out p-4 rounded-lg relative">
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-[#0C8B44] rounded-full flex items-center justify-center border-2 border-white text-white text-xs">
              06
            </div>
            <h4 className="font-bold mb-2">Dual Control Brakes</h4>
            <p className="text-xs text-gray-700">
              Ensure safety during the test allowing the examiner to intervene if needed.
            </p>
          </div>
        </div>
        
        <div className="absolute right-0 top-[45%] w-4/12">
          <div className="bg-gray-100 border border-transparent hover:border-[#0C8B44] transition-all duration-300 ease-in-out p-4 rounded-lg relative">
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-[#0C8B44] rounded-full flex items-center justify-center border-2 border-white text-white text-xs">
              03
            </div>
            <h4 className="font-bold mb-2">Get your license first pay later</h4>
            <p className="text-xs text-gray-700">
              0% Interest Financing on all packages. Use Klarna or Afterpay at checkout.
            </p>
          </div>
        </div>
        
        {/* Bottom row */}
        <div className="absolute left-20 top-[45%] w-4/12">
          <div className="bg-gray-100 border border-transparent hover:border-[#0C8B44] transition-all duration-300 ease-in-out p-4 rounded-lg relative">
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-[#0C8B44] rounded-full flex items-center justify-center border-2 border-white text-white text-xs">
              05
            </div>
            <h4 className="font-bold mb-2">Fully Insured vehicles</h4>
            <p className="text-xs text-gray-700">
              All vehicles are fully insured, providing peace of mind during your road test.
            </p>
          </div>
        </div>
        
        <div className="absolute right-60 top-[60%] w-4/12">
          <div className="bg-gray-100 border border-transparent hover:border-[#0C8B44] transition-all duration-300 ease-in-out p-4 rounded-lg relative">
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-[#0C8B44] rounded-full flex items-center justify-center border-2 border-white text-white text-xs">
              04
            </div>
            <h4 className="font-bold mb-2">Convenient booking process</h4>
            <p className="text-xs text-gray-700">
              Reserve your car instantly through a user-friendly website with flexible pick up and drop off options
            </p>
          </div>
        </div>
      </div>
      
      {/* Mobile layout - visible only on small screens */}
      <div className="md:hidden">
        
        <div className="grid grid-cols-1 px-6">
          {features.map((feature) => (
            <FeatureCard 
              key={feature.id}
              number={feature.number}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseElanSection;