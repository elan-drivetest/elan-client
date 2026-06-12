// app/sitemap/page.tsx
import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import {
  Map,
  ArrowUpRight,
  Car,
  Home,
  Users,
  Building2,
  ShieldCheck,
  FileText,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Sitemap | Elan Road Test Rental",
  description:
    "A complete map of pages on elanroadtestrental.ca — booking, locations, customer support, account, and legal resources.",
};

type LinkItem = { label: string; href: string; description?: string; external?: boolean };

type Group = {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  links: LinkItem[];
};

const groups: Group[] = [
  {
    id: "main",
    title: "Main Pages",
    icon: <Home className="h-5 w-5 text-[#0C8B44]" />,
    description: "The core pages most visitors land on first.",
    links: [
      { label: "Home", href: "/", description: "Overview of Elan's road test rental services." },
      { label: "How It Works", href: "/how-it-works", description: "The end-to-end booking and test-day experience." },
      { label: "Our Plans", href: "/our-plans", description: "Service tiers and what each includes." },
      { label: "Locations", href: "/locations", description: "DriveTest centres we serve across Ontario." },
      { label: "Testimonials", href: "/testimonials", description: "Stories from drivers who passed with Elan." },
    ],
  },
  {
    id: "booking",
    title: "Booking Flow",
    icon: <Car className="h-5 w-5 text-[#0C8B44]" />,
    description: "The four steps of reserving a vehicle and instructor.",
    links: [
      {
        label: "1. Road Test Details",
        href: "/book-road-test-vehicle/road-test-details",
        description: "Pick test type, centre, date, and time.",
      },
      {
        label: "2. Booking Details",
        href: "/book-road-test-vehicle/booking-details",
        description: "Your info, pickup or meet-at-centre.",
      },
      {
        label: "3. Test Details",
        href: "/book-road-test-vehicle/test-details",
        description: "Upload documents and select add-ons.",
      },
      {
        label: "4. Payment",
        href: "/book-road-test-vehicle/payment",
        description: "Apply coupons and complete checkout.",
      },
    ],
  },
  {
    id: "account",
    title: "Account",
    icon: <Users className="h-5 w-5 text-[#0C8B44]" />,
    description: "Sign in, manage your profile, and view bookings.",
    links: [
      { label: "Log In", href: "/login", description: "Access your existing Elan account." },
      { label: "Sign Up", href: "/signup", description: "Create a new account in under a minute." },
      { label: "Forgot Password", href: "/forgot-password", description: "Request a password reset link." },
      { label: "Dashboard", href: "/dashboard", description: "Your bookings, profile, and history." },
    ],
  },
  {
    id: "support",
    title: "Support & Resources",
    icon: <Building2 className="h-5 w-5 text-[#0C8B44]" />,
    description: "Answers, guidance, and ways to reach our team.",
    links: [
      { label: "FAQ", href: "/faq", description: "Common questions about bookings and pickup." },
      { label: "Contact Us", href: "/contact-us", description: "Phone, email, and contact form." },
      {
        label: "Blog",
        href: "https://blog.elanroadtestrental.ca/",
        description: "Driving tips and road test guides.",
        external: true,
      },
    ],
  },
  {
    id: "legal",
    title: "Legal",
    icon: <ShieldCheck className="h-5 w-5 text-[#0C8B44]" />,
    description: "The terms that govern your use of Elan.",
    links: [
      { label: "Terms of Service", href: "/terms", description: "Booking rules, cancellations, and conduct." },
      { label: "Privacy Policy", href: "/privacy", description: "What we collect, how we use it, your rights." },
      { label: "Sitemap", href: "/sitemap", description: "This page." },
    ],
  },
];

export default function SitemapPage() {
  const totalLinks = groups.reduce((acc, g) => acc + g.links.length, 0);

  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="bg-[#0C8B44]/5 py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#0C8B44]/10 mb-6">
            <Map className="h-6 w-6 text-[#0C8B44]" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-6">
            Site<span className="text-[#0C8B44]">map</span>
          </h1>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            Every page on Elan, organized by what you&apos;re trying to do.
            {totalLinks} pages across {groups.length} sections.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/book-road-test-vehicle/road-test-details">
              <Button className="bg-[#0C8B44] hover:bg-[#0C8B44]/90 text-white" size="lg">
                Book a Road Test Car
              </Button>
            </Link>
            <Link href="/contact-us">
              <Button variant="outline" className="border-gray-300" size="lg">
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick anchor nav */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <nav
          aria-label="Sitemap sections"
          className="flex flex-wrap gap-2 justify-center"
        >
          {groups.map((g) => (
            <a
              key={g.id}
              href={`#${g.id}`}
              className="text-sm px-3 py-1.5 rounded-full border border-gray-200 text-gray-700 hover:border-[#0C8B44] hover:text-[#0C8B44] transition-colors"
            >
              {g.title}
            </a>
          ))}
        </nav>
      </section>

      {/* Groups */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="space-y-12">
          {groups.map((group, i) => (
            <section
              key={group.id}
              id={group.id}
              className="scroll-mt-24"
              aria-labelledby={`${group.id}-heading`}
            >
              <header className="flex items-center mb-6">
                <span className="w-8 h-8 bg-[#0C8B44] rounded-full flex items-center justify-center text-white text-sm mr-3">
                  {i + 1}
                </span>
                <div>
                  <h2 id={`${group.id}-heading`} className="text-2xl font-bold flex items-center gap-2">
                    {group.icon}
                    {group.title}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                </div>
              </header>

              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {group.links.map((link) => {
                  const content = (
                    <div className="group h-full bg-white border border-gray-200 rounded-lg p-4 hover:border-[#0C8B44] hover:shadow-sm transition-all">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 group-hover:text-[#0C8B44]">
                            {link.label}
                          </div>
                          {link.description && (
                            <p className="text-sm text-gray-600 mt-1">{link.description}</p>
                          )}
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-[#0C8B44] shrink-0 mt-1" />
                      </div>
                    </div>
                  );
                  return (
                    <li key={link.href}>
                      {link.external ? (
                        <a href={link.href} target="_blank" rel="noopener noreferrer" className="block h-full">
                          {content}
                        </a>
                      ) : (
                        <Link href={link.href} className="block h-full">
                          {content}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 bg-gray-50 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#0C8B44]/10 mb-4">
            <FileText className="h-5 w-5 text-[#0C8B44]" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Can&apos;t find what you&apos;re looking for?
          </h2>
          <p className="text-gray-700 mb-8">
            If a page you expected is missing — or you have a suggestion for one we
            should add — let us know.
          </p>
          <Link href="/contact-us">
            <Button className="bg-[#0C8B44] hover:bg-[#0C8B44]/90 text-white" size="lg">
              Contact Us
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
