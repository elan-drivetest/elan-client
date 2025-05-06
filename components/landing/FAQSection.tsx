// components/landing/FAQSection.tsx
import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { faqData } from "@/lib/data/faq";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQSection = () => {
  return (
    <section className="py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
          <p className="text-gray-600">
            Find answers to common questions about our road test car rental services.
          </p>
        </div>
        
        <Accordion type="single" collapsible className="w-full">
          {faqData.map((faq) => (
            <AccordionItem key={faq.id} value={`item-${faq.id}`} className="border-b border-gray-200">
              <AccordionTrigger className="text-left font-medium py-4 hover:text-[#0C8B44] hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        
        <div className="text-center mt-10">
          <Link 
            href="/faq" 
            className="group inline-flex items-center text-[#0C8B44] font-medium hover:underline transition-all duration-200 ease-in-out"
          >
            Read more FAQs <ArrowRight size={16} className="ml-1 transition-all duration-300 group-hover:ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;