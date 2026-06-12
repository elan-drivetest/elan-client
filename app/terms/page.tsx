// app/terms/page.tsx
import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { FileText, Mail, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | Elan Road Test Rental",
  description:
    "The terms and conditions that govern your use of Elan Road Test Rental's vehicle booking, pickup, and instructor services across Ontario.",
};

const LAST_UPDATED = "May 1, 2026";

const sections: { id: string; title: string; body: React.ReactNode }[] = [
  {
    id: "acceptance",
    title: "Acceptance of Terms",
    body: (
      <>
        <p>
          By accessing or using elanroadtestrental.ca (the &ldquo;Site&rdquo;) or any of our
          booking, pickup, or instructor services (the &ldquo;Services&rdquo;), you agree to
          be bound by these Terms of Service. If you do not agree to any part of these
          terms, you may not use the Services.
        </p>
        <p>
          You must be at least 16 years old and hold a valid Ontario G1 licence (or
          higher) to book a road test vehicle through Elan.
        </p>
      </>
    ),
  },
  {
    id: "bookings",
    title: "Bookings & Eligibility",
    body: (
      <>
        <p>
          All bookings are subject to vehicle and instructor availability at the
          DriveTest centre you select. You are responsible for providing accurate
          information including your test type (G2 or G), test centre, date, time,
          and a valid road test confirmation issued by DriveTest Ontario.
        </p>
        <p>
          Bookings must be made at least <strong>2 days in advance</strong> of your
          scheduled DriveTest appointment. We reserve the right to refuse or cancel
          a booking if your documents are incomplete, the booking conflicts with
          another reservation, or the requested time falls outside our service
          hours.
        </p>
      </>
    ),
  },
  {
    id: "pickup",
    title: "Pickup & Drop-off Service",
    body: (
      <>
        <p>
          If you select our pickup service, you must be ready at the pickup address
          at least <strong>15 minutes</strong> before the scheduled pickup time. Pickup
          pricing is calculated based on distance from the selected DriveTest centre:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>$2.00 per kilometre for the first 50&nbsp;km</li>
          <li>$1.00 per kilometre beyond 50&nbsp;km</li>
          <li>Complimentary drop-off applies to qualifying distances</li>
        </ul>
        <p>
          Distance is measured by our routing engine; the calculation displayed
          at checkout is final for that booking.
        </p>
      </>
    ),
  },
  {
    id: "payment",
    title: "Payment, Refunds & Cancellations",
    body: (
      <>
        <p>
          Payment is processed through Stripe at the time of booking. By submitting
          payment you authorize Elan to charge the full amount shown on the
          checkout summary, including any selected add-ons.
        </p>
        <p>
          Cancellation requests submitted at least <strong>48 hours</strong> before
          your scheduled test are eligible for a full refund. Cancellations made
          within 48 hours of the test may be subject to a service fee. No refund
          is issued for no-shows or for tests cancelled by DriveTest Ontario due
          to incomplete documentation on the part of the customer.
        </p>
      </>
    ),
  },
  {
    id: "conduct",
    title: "User Conduct & Vehicle Use",
    body: (
      <>
        <p>
          While in the rental vehicle, you agree to:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Follow all instructions from the Elan instructor</li>
          <li>Refrain from any conduct that is unsafe, illegal, or disrespectful</li>
          <li>Not consume alcohol, cannabis, or any impairing substance before or during the appointment</li>
          <li>Reimburse Elan for any damage caused by negligence or wilful misconduct</li>
        </ul>
        <p>
          We reserve the right to refuse service or terminate an appointment in
          progress if the conditions above are not met. No refund will be issued
          in such cases.
        </p>
      </>
    ),
  },
  {
    id: "liability",
    title: "Limitation of Liability",
    body: (
      <>
        <p>
          The Services are provided on an &ldquo;as is&rdquo; basis. To the maximum extent
          permitted by Ontario law, Elan, its owners, employees, and instructors are
          not liable for indirect, incidental, or consequential damages arising
          from your use of the Services, including but not limited to failing a
          road test, delays caused by traffic or weather, or DriveTest Ontario
          rescheduling.
        </p>
        <p>
          Our total liability for any single booking is limited to the amount you
          paid for that booking.
        </p>
      </>
    ),
  },
  {
    id: "accounts",
    title: "Accounts & Account Termination",
    body: (
      <>
        <p>
          You are responsible for keeping your login credentials confidential. You
          may close your account at any time from your dashboard; doing so will
          not automatically refund pending or completed bookings.
        </p>
        <p>
          We may suspend or terminate an account that violates these terms, abuses
          our staff, or attempts to defraud our payment systems.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to These Terms",
    body: (
      <>
        <p>
          We may update these Terms of Service from time to time. Material changes
          will be reflected in the &ldquo;Last updated&rdquo; date above and, where
          appropriate, communicated by email. Continued use of the Services after a
          change constitutes acceptance of the revised terms.
        </p>
      </>
    ),
  },
  {
    id: "governing-law",
    title: "Governing Law",
    body: (
      <>
        <p>
          These terms are governed by the laws of the Province of Ontario and the
          federal laws of Canada applicable therein. Any dispute will be resolved
          in the courts located in Toronto, Ontario.
        </p>
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="bg-[#0C8B44]/5 py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#0C8B44]/10 mb-6">
            <FileText className="h-6 w-6 text-[#0C8B44]" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-6">
            Terms of <span className="text-[#0C8B44]">Service</span>
          </h1>
          <p className="text-lg text-gray-700 mb-4 max-w-2xl mx-auto">
            The rules of the road for using Elan&apos;s booking, pickup, and instructor
            services. Please read carefully before booking your test.
          </p>
          <p className="text-sm text-gray-500">Last updated: {LAST_UPDATED}</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-[260px_1fr] gap-10">
          {/* Sticky TOC */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <h2 className="text-sm font-medium text-[#0C8B44] mb-4 uppercase tracking-wide">
              On this page
            </h2>
            <nav>
              <ol className="space-y-2 text-sm">
                {sections.map((s, i) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="text-gray-600 hover:text-[#0C8B44] flex gap-2"
                    >
                      <span className="text-gray-400 tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span>{s.title}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          {/* Sections */}
          <div className="space-y-12 min-w-0">
            {sections.map((s, i) => (
              <article key={s.id} id={s.id} className="scroll-mt-24">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <span className="w-8 h-8 bg-[#0C8B44] rounded-full flex items-center justify-center text-white text-sm mr-3 shrink-0">
                    {i + 1}
                  </span>
                  {s.title}
                </h2>
                <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed space-y-4">
                  {s.body}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            Questions about these terms?
          </h2>
          <p className="text-gray-700 mb-8">
            Our team is happy to clarify anything before you book. Reach out by phone
            or email — we&apos;ll get back to you within one business day.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-6 mb-10">
            <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col items-center">
              <div className="w-12 h-12 bg-[#0C8B44]/10 rounded-full flex items-center justify-center mb-4">
                <Phone className="h-5 w-5 text-[#0C8B44]" />
              </div>
              <h3 className="font-medium mb-2">Call Us</h3>
              <p className="text-gray-600 mb-2">+1 (416) 407-4757</p>
              <p className="text-xs text-gray-500">7 days a week, 8am–8pm</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col items-center">
              <div className="w-12 h-12 bg-[#0C8B44]/10 rounded-full flex items-center justify-center mb-4">
                <Mail className="h-5 w-5 text-[#0C8B44]" />
              </div>
              <h3 className="font-medium mb-2">Email Us</h3>
              <p className="text-gray-600 mb-2">elan.drivetestrental@gmail.com</p>
              <p className="text-xs text-gray-500">We&apos;ll respond within 24 hours</p>
            </div>
          </div>

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
