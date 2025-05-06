import BlogSection from "@/components/landing/BlogSection";
import CTASection from "@/components/landing/CTASection";
import FAQSection from "@/components/landing/FAQSection";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import PartnersSection from "@/components/landing/PartnersSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import WhyChooseElanSection from "@/components/landing/WhyChooseElanSection";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <HowItWorksSection />
      <WhyChooseElanSection />
      <PartnersSection />
      <TestimonialsSection />
      <CTASection />
      <BlogSection />
      <FAQSection />
    </main>
  );
}
