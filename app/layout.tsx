// app/layout.tsx
import type { Metadata } from "next";
import { IBM_Plex_Sans_JP, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/lib/context/AuthContext";

// Configure IBM Plex Sans JP font
const ibmPlexSansJP = IBM_Plex_Sans_JP({
  weight: ['400', '500', '600', '700'],
  subsets: ["latin"],
  display: 'swap',
  variable: "--font-ibm-plex-sans-jp",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Elan Road Test Rental",
  description: "Book cars and instructors for road tests across Ontario",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${ibmPlexSansJP.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <Navbar />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}