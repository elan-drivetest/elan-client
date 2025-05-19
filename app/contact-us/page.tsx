// app/contact-us/page.tsx
import React from "react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="bg-white">
      {/* Hero Section */}
      <section className="bg-[#0C8B44]/5 py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-6">
            Contact <span className="text-[#0C8B44]">Elan</span>
          </h1>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            Have questions or need assistance? Our friendly team is here to help. Reach out to us through any of the methods below.
          </p>
        </div>
      </section>
      
      {/* Contact Information */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Get in Touch</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#0C8B44]/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="h-5 w-5 text-[#0C8B44]" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Phone</h3>
                  <p className="text-gray-700">+1 647-606-4519</p>
                  <p className="text-sm text-gray-500 mt-1">Monday to Sunday, 8am to 8pm</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#0C8B44]/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="h-5 w-5 text-[#0C8B44]" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Email</h3>
                  <p className="text-gray-700">help@elanroadtestrental.ca</p>
                  <p className="text-sm text-gray-500 mt-1">{"We'll respond within 24 hours"}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#0C8B44]/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5 text-[#0C8B44]" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Headquarters</h3>
                  <p className="text-gray-700">123 Driving Avenue</p>
                  <p className="text-gray-700">Toronto, ON M5V 2H1</p>
                  <p className="text-gray-700">Canada</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#0C8B44]/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 text-[#0C8B44]" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Business Hours</h3>
                  <p className="text-gray-700">Monday - Friday: 8am - 8pm</p>
                  <p className="text-gray-700">Saturday - Sunday: 9am - 6pm</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg text-center mb-8">
            <h3 className="font-medium mb-4">Connect With Us</h3>
            <div className="flex justify-center gap-4">
              <a href="https://facebook.com" className="w-10 h-10 bg-[#0C8B44] rounded-full flex items-center justify-center text-white" aria-label="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
              <a href="https://instagram.com" className="w-10 h-10 bg-[#0C8B44] rounded-full flex items-center justify-center text-white" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="2" width="20" height="20" rx="5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 11.37C16.2531 12.2022 16.1925 13.0982 15.7 13.8475C15.4368 14.2625 15.0677 14.5992 14.6258 14.8275C14.1838 15.0558 13.6835 15.1684 13.1761 15.1549C12.6688 15.1413 12.1759 15.0022 11.7474 14.7512C11.3188 14.5002 10.9694 14.1449 10.7301 13.7173C10.4909 13.2897 10.3701 12.8047 10.3797 12.3141C10.3893 11.8236 10.5289 11.3438 10.785 10.9248C11.0411 10.5059 11.4051 10.1632 11.84 9.927" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="16.5" cy="7.5" r="1.5" fill="white"/>
                </svg>
              </a>
              <a href="https://twitter.com" className="w-10 h-10 bg-[#0C8B44] rounded-full flex items-center justify-center text-white" aria-label="Twitter">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23 3C22.0424 3.67548 20.9821 4.19211 19.86 4.53C19.2577 3.83751 18.4573 3.34669 17.567 3.12393C16.6767 2.90116 15.7395 2.9572 14.8821 3.28445C14.0247 3.61171 13.2884 4.1944 12.773 4.95372C12.2575 5.71303 11.9877 6.61234 12 7.53V8.53C10.2426 8.57557 8.50127 8.18581 6.93101 7.39545C5.36074 6.60508 4.01032 5.43864 3 4C3 4 -1 13 8 17C5.94053 18.398 3.48716 19.0989 1 19C10 24 21 19 21 7.5C20.9991 7.22145 20.9723 6.94359 20.92 6.67C21.9406 5.66349 22.6608 4.39271 23 3V3Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>
          </div>
          
          <div className="text-center">
            <Link href="/book-road-test-vehicle/road-test-details">
              <Button 
                className="bg-[#0C8B44] hover:bg-[#0C8B44]/90 text-white"
                size="lg"
              >
                Book a Road Test Car
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* FAQ Link Section */}
      <section className="py-16 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Got Questions?</h2>
          <p className="text-gray-700 mb-6">
            Check out our frequently asked questions page to find quick answers to common questions.
          </p>
          <Button 
            className="bg-[#0C8B44] hover:bg-[#0C8B44]/90 text-white"
            size="lg"
            asChild
          >
            <Link href="/faq">Visit FAQ Page</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}