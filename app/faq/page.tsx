// app/faq/page.tsx
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqCategories } from "@/lib/data/faq-data";
import RatingBar from "@/components/shared/RatingBar";

export default function FAQPage() {
  return (
    <main className="bg-white">
      {/* Hero Section */}
      <section className="bg-[#0C8B44]/5 py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-6">
            Frequently Asked <span className="text-[#0C8B44]">Questions</span>
          </h1>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            {"Find answers to the most common questions about our road test car rental services. Can't find what you're looking for? Contact our support team."}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact-us">
              <Button 
                className="bg-[#0C8B44] hover:bg-[#0C8B44]/90 text-white"
                size="lg"
              >
                Contact Support
              </Button>
            </Link>
            <Link href="/book-road-test-vehicle/road-test-details">
              <Button 
                variant="outline" 
                className="border-gray-300"
                size="lg"
              >
                Book a Road Test Car
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* FAQ Categories */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {faqCategories.map((category, index) => (
          <div key={index} className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <span className="w-8 h-8 bg-[#0C8B44] rounded-full flex items-center justify-center text-white text-sm mr-3">
                {index + 1}
              </span>
              {category.title}
            </h2>
            
            <Accordion type="single" collapsible className="w-full">
              {category.questions.map((faq, faqIndex) => (
                <AccordionItem key={faqIndex} value={`item-${faqIndex}`} className="border-b border-gray-200">
                  <AccordionTrigger className="text-left text-xl py-4 hover:text-[#0C8B44] hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 text-xl pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </section>
      
      {/* Still Have Questions Section */}
      <section className="py-16 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Still Have Questions?</h2>
          <p className="text-gray-700 mb-8">
            Our friendly support team is here to help. Reach out to us via phone, email, or our contact form.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6 mb-10">
            <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col items-center">
              <div className="w-12 h-12 bg-[#0C8B44]/10 rounded-full flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="#0C8B44" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="font-medium mb-2">Call Us</h3>
              <p className="text-gray-600 mb-2">+1 647-606-4519</p>
              <p className="text-xs text-gray-500">7 days a week, 8am-8pm</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col items-center">
              <div className="w-12 h-12 bg-[#0C8B44]/10 rounded-full flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#0C8B44" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="22,6 12,13 2,6" stroke="#0C8B44" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="font-medium mb-2">Email Us</h3>
              <p className="text-gray-600 mb-2">help@elanroadtestrental.ca</p>
              <p className="text-xs text-gray-500">{"We'll respond within 24 hours"}</p>
            </div>
          </div>
          
          <Link href="/contact-us">
            <Button 
              className="bg-[#0C8B44] hover:bg-[#0C8B44]/90 text-white"
              size="lg"
            >
              Contact Us
            </Button>
          </Link>
        </div>
      </section>
      
      {/* Rating */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <RatingBar />
      </section>
    </main>
  );
}