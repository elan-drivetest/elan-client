// app/delete-account/page.tsx
//
// Public account-deletion page. Google Play requires a web URL where users of
// an app with accounts can request deletion of their account and data, so this
// must stay reachable without logging in. Customers can delete themselves;
// instructors are pointed to the app and to a contact request.

import React, { Suspense } from "react";
import type { Metadata } from "next";
import { Mail, Phone, Smartphone, UserX } from "lucide-react";
import DeleteAccountPanel from "@/components/account/DeleteAccountPanel";

export const metadata: Metadata = {
  title: "Delete Your Account | Elan Road Test Rental",
  description:
    "How to delete your Elan customer or instructor account, and what happens to your data when you do.",
  alternates: { canonical: "/delete-account" },
};

const CONTACT_EMAIL = "elan.drivetestrental@gmail.com";
const CONTACT_PHONE = "+1 (416) 407-4757";

export default function DeleteAccountPage() {
  return (
    <main className="bg-white">
      <section className="bg-[#0C8B44]/5 py-14 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#0C8B44]/10 mb-6">
            <UserX className="h-6 w-6 text-[#0C8B44]" aria-hidden="true" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-5">Delete your account</h1>
          <p className="text-base md:text-lg text-gray-700 max-w-2xl mx-auto">
            You can delete your Elan account at any time. This page explains how, for customers and for
            instructors using the Elan Instructor App, and what happens to your information.
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
        <section id="customers" className="scroll-mt-28">
          <h2 className="text-2xl font-bold mb-2">Customers</h2>
          <p className="text-gray-700 mb-6">
            Delete your account yourself below. You can&apos;t delete an account while a booking is confirmed or
            in progress — wait until it&apos;s completed or cancelled first.
          </p>
          <Suspense fallback={null}>
            <DeleteAccountPanel />
          </Suspense>
        </section>

        <section id="instructors" className="scroll-mt-28">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-[#0C8B44]" aria-hidden="true" /> Instructors and vehicle providers
          </h2>
          <p className="text-gray-700">
            Delete your account from your account settings in the Elan Instructor App, or send us a deletion
            request from the email address or phone number registered to your account using the contact details
            below. We&apos;ll confirm your identity before processing the request.
          </p>
        </section>

        <section id="what-happens" className="scroll-mt-28">
          <h2 className="text-2xl font-bold mb-4">What happens to your data</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold mb-3">Deleted or anonymised</h3>
              <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-700 marker:text-[#0C8B44]">
                <li>Your name and email address</li>
                <li>Your phone number, address and profile photo</li>
                <li>Pickup addresses and locations on your bookings</li>
                <li>Identity documents uploaded with your bookings</li>
                <li>Your login sessions, on every device</li>
              </ul>
            </div>
            <div className="rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold mb-3">Kept</h3>
              <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-700 marker:text-[#0C8B44]">
                <li>
                  Booking and payment records (dates, amounts, refunds), no longer linked to your name, for
                  accounting, tax and legal obligations
                </li>
              </ul>
              <p className="text-sm text-gray-600 mt-4">
                See our{" "}
                <a href="/privacy#section-7" className="text-[#0C8B44] underline underline-offset-2">
                  Privacy Policy — Data Retention
                </a>{" "}
                for details.
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            After deletion you can register again with the same email address as a new account.
          </p>
        </section>

        <section id="contact" className="scroll-mt-28">
          <h2 className="text-2xl font-bold mb-4">Request deletion by email or phone</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Account deletion request")}`}
              className="flex-1 rounded-xl border border-gray-200 p-5 flex items-center gap-3 hover:border-[#0C8B44] transition-colors"
            >
              <Mail className="h-5 w-5 text-[#0C8B44] shrink-0" aria-hidden="true" />
              <span className="text-sm break-all">{CONTACT_EMAIL}</span>
            </a>
            <a
              href="tel:+14164074757"
              className="flex-1 rounded-xl border border-gray-200 p-5 flex items-center gap-3 hover:border-[#0C8B44] transition-colors"
            >
              <Phone className="h-5 w-5 text-[#0C8B44] shrink-0" aria-hidden="true" />
              <span className="text-sm">{CONTACT_PHONE}</span>
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
