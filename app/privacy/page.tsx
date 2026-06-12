// app/privacy/page.tsx
import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Mail, Phone, Lock, Eye, Database, Share2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | Elan Road Test Rental",
  description:
    "How Elan Road Test Rental collects, uses, stores, and protects your personal information when you book a road test vehicle in Ontario.",
};

const LAST_UPDATED = "May 1, 2026";

const principles = [
  {
    icon: <Lock className="h-5 w-5 text-[#0C8B44]" />,
    title: "Encrypted in transit",
    body: "All traffic between your device and Elan is protected by TLS 1.3.",
  },
  {
    icon: <Eye className="h-5 w-5 text-[#0C8B44]" />,
    title: "No surprise tracking",
    body: "We do not sell your data or use third-party ad trackers.",
  },
  {
    icon: <Database className="h-5 w-5 text-[#0C8B44]" />,
    title: "Hosted in Canada",
    body: "Customer records and uploaded documents are stored in ca-central-1.",
  },
  {
    icon: <Share2 className="h-5 w-5 text-[#0C8B44]" />,
    title: "Minimal sharing",
    body: "We share data only with the processors required to deliver your booking.",
  },
];

const sections: { id: string; title: string; body: React.ReactNode }[] = [
  {
    id: "scope",
    title: "Scope of this Policy",
    body: (
      <>
        <p>
          This Privacy Policy explains how Elan Road Test Rental (&ldquo;Elan,&rdquo;
          &ldquo;we,&rdquo; &ldquo;us&rdquo;) collects, uses, and discloses personal
          information about visitors to elanroadtestrental.ca and customers of our
          road test rental, pickup, and instructor services in Ontario.
        </p>
        <p>
          We comply with the Personal Information Protection and Electronic
          Documents Act (PIPEDA) and applicable provincial privacy laws.
        </p>
      </>
    ),
  },
  {
    id: "collected",
    title: "Information We Collect",
    body: (
      <>
        <p>To provide our Services, we collect the following categories of information:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Account information:</strong> name, email address, phone number,
            password (stored hashed), and account preferences.
          </li>
          <li>
            <strong>Booking information:</strong> selected DriveTest centre, test
            type (G2/G), date and time, pickup address, add-ons, and notes.
          </li>
          <li>
            <strong>Uploaded documents:</strong> your DriveTest confirmation and a
            photo or scan of your G1 licence. These are stored in encrypted S3
            buckets in the Canadian region.
          </li>
          <li>
            <strong>Payment metadata:</strong> Stripe handles your card details
            directly — we receive only the payment status, last 4 digits, and
            charge identifier.
          </li>
          <li>
            <strong>Technical data:</strong> IP address, browser type, device
            type, and basic usage events collected via first-party analytics.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "use",
    title: "How We Use Your Information",
    body: (
      <>
        <p>We use the information above to:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Create and manage your Elan account</li>
          <li>Schedule, confirm, and fulfil your road test booking</li>
          <li>Verify eligibility against DriveTest Ontario requirements</li>
          <li>Process payments and issue refunds when applicable</li>
          <li>Send booking reminders, receipts, and important service notices</li>
          <li>Diagnose technical issues and improve the booking experience</li>
        </ul>
        <p>
          We do not use your information for unrelated marketing without your
          explicit consent.
        </p>
      </>
    ),
  },
  {
    id: "sharing",
    title: "Who We Share With",
    body: (
      <>
        <p>
          We share personal information with a small set of trusted processors,
          each bound by data-protection agreements:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            <strong>Stripe</strong> — payment processing
          </li>
          <li>
            <strong>Amazon Web Services (Canada)</strong> — hosting, file storage,
            and database
          </li>
          <li>
            <strong>Email service provider</strong> — booking confirmations and
            password resets
          </li>
          <li>
            <strong>Elan instructors</strong> — your name, phone, pickup address,
            and test details, shared only for the assigned appointment
          </li>
        </ul>
        <p>
          We may also disclose information when required by law, court order, or
          a legitimate legal process.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies & Local Storage",
    body: (
      <>
        <p>
          We use cookies and browser storage for essential functions only:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>
            A secure, HTTP-only cookie to keep you signed in
          </li>
          <li>
            Local storage to remember your in-progress booking so you can resume
            later
          </li>
          <li>
            First-party analytics to understand which pages need improvement
          </li>
        </ul>
        <p>
          You may clear cookies or local storage at any time through your browser
          settings. Doing so will sign you out and clear unfinished bookings.
        </p>
      </>
    ),
  },
  {
    id: "retention",
    title: "Data Retention",
    body: (
      <>
        <p>
          We retain account and booking records for as long as your account is
          active, and for up to <strong>7 years</strong> thereafter to meet
          financial and regulatory record-keeping obligations. Uploaded test
          documents are deleted within <strong>90 days</strong> after the
          associated appointment, unless required for a refund or dispute.
        </p>
      </>
    ),
  },
  {
    id: "rights",
    title: "Your Rights",
    body: (
      <>
        <p>
          Under PIPEDA you have the right to:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Access the personal information we hold about you</li>
          <li>Request correction of inaccurate information</li>
          <li>Withdraw consent and request deletion of your account</li>
          <li>File a complaint with the Office of the Privacy Commissioner of Canada</li>
        </ul>
        <p>
          You can exercise the first three rights directly from your account
          dashboard, or by emailing us at the address below.
        </p>
      </>
    ),
  },
  {
    id: "security",
    title: "Security",
    body: (
      <>
        <p>
          We use industry-standard safeguards including TLS in transit,
          encryption at rest for stored documents, hashed passwords, and least-privilege
          access controls for our team. No system is perfect — if we ever detect
          a breach affecting your data, we will notify you and the appropriate
          authorities as required by law.
        </p>
      </>
    ),
  },
  {
    id: "children",
    title: "Children",
    body: (
      <>
        <p>
          Elan&apos;s Services are intended for users 16 and older (the minimum age
          to hold an Ontario G1 licence). We do not knowingly collect
          information from anyone under 16. If you believe a child has provided
          us with personal information, please contact us so we can delete it.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to this Policy",
    body: (
      <>
        <p>
          We may revise this Privacy Policy from time to time. The &ldquo;Last
          updated&rdquo; date at the top of this page reflects the most recent
          revision. Material changes will be communicated by email to active
          customers.
        </p>
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="bg-[#0C8B44]/5 py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#0C8B44]/10 mb-6">
            <ShieldCheck className="h-6 w-6 text-[#0C8B44]" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-6">
            Privacy <span className="text-[#0C8B44]">Policy</span>
          </h1>
          <p className="text-lg text-gray-700 mb-4 max-w-2xl mx-auto">
            What we collect, why we collect it, and the choices you have. Written
            in plain English, the way a privacy policy should be.
          </p>
          <p className="text-sm text-gray-500">Last updated: {LAST_UPDATED}</p>
        </div>
      </section>

      {/* Principles */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {principles.map((p) => (
            <div
              key={p.title}
              className="bg-white border border-gray-200 rounded-lg p-5 hover:border-[#0C8B44]/40 transition-colors"
            >
              <div className="w-10 h-10 bg-[#0C8B44]/10 rounded-full flex items-center justify-center mb-3">
                {p.icon}
              </div>
              <h3 className="font-medium mb-1">{p.title}</h3>
              <p className="text-sm text-gray-600">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
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
            Privacy questions or requests?
          </h2>
          <p className="text-gray-700 mb-8">
            We respond to access, correction, and deletion requests within 30 days.
            Reach out and we&apos;ll take it from there.
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
