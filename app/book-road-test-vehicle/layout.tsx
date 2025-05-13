"use client"

import { BookingProvider } from "@/lib/context/BookingContext";
import { ReactNode } from "react";

export default function BookRoadTestLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <BookingProvider>
      <div className="min-h-screen bg-white">
        {children}
      </div>
    </BookingProvider>
  );
}