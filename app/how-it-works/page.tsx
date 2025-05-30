// app/how-it-works/page.tsx
"use client"

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Car, 
  Clock, 
  CheckCircle, 
  Users, 
  Shield, 
  Star,
  ArrowRight,
  Calendar,
  CreditCard,
  Phone
} from "lucide-react";

const HowItWorksPage = () => {
  const processSteps = [
    {
      id: "01",
      title: "Choose Your Service",
      description: "Select between meeting at the test centre or our convenient pickup service",
      icon: <MapPin className="h-8 w-8" />,
      details: [
        "Meet at drive test centre - Lower cost option",
        "Pickup & dropoff service - Maximum convenience",
        "Free dropoff for distances over 50km",
        "Available across all Ontario test centers"
      ]
    },
    {
      id: "02", 
      title: "Registration Assistance",
      description: "We help you prepare all necessary documents and registration details",
      icon: <Users className="h-8 w-8" />,
      details: [
        "Document verification assistance",
        "Registration form guidance", 
        "Test center familiarization",
        "Pre-test preparation tips"
      ]
    },
    {
      id: "03",
      title: "Pre-Test Briefing", 
      description: "45-minute familiarization session to get comfortable with the vehicle",
      icon: <Clock className="h-8 w-8" />,
      details: [
        "Vehicle controls walkthrough",
        "Adjustment of mirrors and seat",
        "Test route overview and tips",
        "Confidence-building practice"
      ]
    },
    {
      id: "04",
      title: "Complete Your Test",
      description: "Take your road test with confidence in our well-maintained vehicle",
      icon: <CheckCircle className="h-8 w-8" />,
      details: [
        "Fully insured test-ready vehicles",
        "Dual control brakes for safety",
        "Professional instructor support",
        "Clean, well-maintained cars"
      ]
    },
    {
      id: "05",
      title: "Post-Test Support",
      description: "We handle vehicle return and provide ongoing support",
      icon: <Car className="h-8 w-8" />,
      details: [
        "Vehicle return handled for you",
        "Results discussion and feedback",
        "25% discount if retake needed",
        "Celebrate your success!"
      ]
    }
  ];

  const pricingTiers = [
    {
      title: "Meet at Test Centre",
      price: "From $80",
      description: "Budget-friendly option",
      features: [
        "Meet instructor at test center",
        "45-minute familiarization session", 
        "Fully insured vehicle",
        "Professional instructor support",
        "25% discount on retakes"
      ],
      popular: false
    },
    {
      title: "Pickup & Dropoff",
      price: "From $80 + distance",
      description: "Maximum convenience",
      features: [
        "Pickup from your location",
        "Free dropoff (50km+ distances)",
        "Free 30-min lesson (50km+ distances)",
        "Free 1-hour lesson (100km+ distances)",
        "All test centre benefits included"
      ],
      popular: true
    }
  ];

  const addOns = [
    {
      title: "Mock Test",
      price: "G2: $54.99 | G: $64.99",
      description: "Complete practice test simulation",
      icon: <CheckCircle className="h-6 w-6" />
    },
    {
      title: "1-Hour Driving Lesson", 
      price: "G2: $50.00 | G: $60.00",
      description: "One-on-one practice with instructor",
      icon: <Clock className="h-6 w-6" />
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#0C8B44] to-[#0A7A3C] text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            How <span className="text-yellow-300">Elan</span> Works
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            Your complete guide to booking cars and instructors for road tests across Ontario
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book-road-test-vehicle/road-test-details">
              <Button size="lg" className="bg-white text-[#0C8B44] hover:bg-gray-100 font-semibold">
                Book Your Test Car Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="border-white text-white bg-transparent hover:bg-white/10">
              <Phone className="mr-2 h-5 w-5" />
              Call Us: +1-647-606-4519
            </Button>
          </div>
        </div>
      </section>

      {/* Process Overview */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple 5-Step Process
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {"From booking to passing your test, we've streamlined everything to make your experience seamless"}
          </p>
        </div>

        {/* Process Timeline */}
        <div className="space-y-16">
          {processSteps.map((step, index) => (
            <div key={step.id} className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12`}>
              {/* Step Content */}
              <div className="flex-1 max-w-lg">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-[#0C8B44] text-white rounded-full flex items-center justify-center font-bold text-lg">
                    {step.id}
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg text-[#0C8B44]">
                    {step.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-600 text-lg mb-6">{step.description}</p>
                <ul className="space-y-2">
                  {step.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-[#0C8B44] mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Visual Element */}
              <div className="flex-1 max-w-md">
                <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 border border-green-100">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-[#0C8B44] rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                      {step.icon}
                    </div>
                    <h4 className="font-semibold text-lg text-gray-800">{step.title}</h4>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Visual Process Flow */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Two Service Options</h2>
            <p className="text-xl text-gray-600">Choose the option that works best for you</p>
          </div>
          
          {/* Original Timeline Images */}
          <div className="space-y-12">
            <div className="w-full relative">
              <Image
                src="/hiw-1.png"
                alt="Meet at drive test centre process"
                width={1200}
                height={200}
                quality={100}
                className="w-full h-auto rounded-lg"
              />
            </div>
            
            <div className="w-full relative">
              <Image
                src="/hiw-2.png"
                alt="Pick-up and drop-off process"
                width={1200}
                height={200}
                quality={100}
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose your service level and add optional extras to enhance your test experience
          </p>
        </div>

        {/* Main Service Options */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {pricingTiers.map((tier, index) => (
            <div key={index} className={`relative rounded-2xl p-8 border-2 ${
              tier.popular 
                ? 'border-[#0C8B44] bg-gradient-to-br from-green-50 to-white' 
                : 'border-gray-200 bg-white'
            }`}>
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[#0C8B44] text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{tier.title}</h3>
                <div className="text-3xl font-bold text-[#0C8B44] mb-2">{tier.price}</div>
                <p className="text-gray-600">{tier.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-[#0C8B44] mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/book-road-test-vehicle/road-test-details" className="block">
                <Button className={`w-full ${
                  tier.popular 
                    ? 'bg-[#0C8B44] hover:bg-[#0A7A3C]' 
                    : 'bg-gray-800 hover:bg-gray-700'
                } text-white`}>
                  Select This Option
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Add-ons Section */}
        <div className="bg-gray-50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold mb-6 text-center">Optional Add-ons</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {addOns.map((addon, index) => (
              <div key={index} className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-[#0C8B44] rounded-lg text-white">
                    {addon.icon}
                  </div>
                  <h4 className="text-lg font-semibold">{addon.title}</h4>
                </div>
                <p className="text-gray-600 mb-3">{addon.description}</p>
                <div className="text-[#0C8B44] font-semibold">{addon.price}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Distance-Based Perks */}
      <section className="py-20 bg-gradient-to-r from-[#0C8B44] to-[#0A7A3C] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            Free Perks Based on Distance
          </h2>
          <p className="text-xl mb-12 opacity-90">
            The further you are, the more value you get!
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur rounded-xl p-6">
              <div className="text-4xl mb-4">🚗</div>
              <h3 className="text-xl font-bold mb-2">50km+</h3>
              <p className="opacity-90">Free dropoff service after your test</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur rounded-xl p-6">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-bold mb-2">50km+</h3>
              <p className="opacity-90">Free 30-minute driving lesson</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur rounded-xl p-6">
              <div className="text-4xl mb-4">🎓</div>
              <h3 className="text-xl font-bold mb-2">100km+</h3>
              <p className="opacity-90">Free 1-hour driving lesson</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Elan */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose Elan?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {"We're committed to your success with features designed for your peace of mind"}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#0C8B44] rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3">Fully Insured</h3>
            <p className="text-gray-600">All our vehicles are fully insured and equipped with dual control brakes for your safety</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-[#0C8B44] rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3">Local Expertise</h3>
            <p className="text-gray-600">Our instructors know every test center and provide route-specific tips</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-[#0C8B44] rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3">Flexible Payment</h3>
            <p className="text-gray-600">0% interest financing available through Klarna and Afterpay</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Book Your Road Test?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of successful drivers who chose Elan for their road test
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book-road-test-vehicle/road-test-details">
              <Button size="lg" className="bg-[#0C8B44] hover:bg-[#0A7A3C] text-white font-semibold">
                <Calendar className="mr-2 h-5 w-5" />
                Book Your Test Car
              </Button>
            </Link>
            
            <Link href="/signup">
              <Button variant="outline" size="lg" className="border-gray-300 text-gray-700 hover:bg-gray-100">
                Create Free Account
              </Button>
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-gray-600">
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">4.9/5</span>
            <span>from 1,200+ happy customers</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorksPage;