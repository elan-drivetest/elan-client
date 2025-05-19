// lib/data/locations-data.ts
import { Car, Clock, LucideIcon } from "lucide-react";

interface Feature {
  title: string;
  description: string;
}

interface Service {
  icon: LucideIcon;
  title: string;
  description: string;
  price: string;
}

interface Testimonial {
  name: string;
  location: string;
  text: string;
  rating: number;
}

interface FAQ {
  question: string;
  answer: string;
}

export interface LocationData {
  heroImage: string;
  heroText: string;
  features: Feature[];
  servicesDescription: string;
  services: Service[];
  testimonials: Testimonial[];
  faqs: FAQ[];
}

export const locationData: Record<string, LocationData> = {
  brampton: {
    heroImage: "/hero-image.png",
    heroText: "Ace your road test in Brampton with our specially prepared vehicles and experienced instructors familiar with local test routes and requirements.",
    features: [
      {
        title: "Local Test Route Knowledge",
        description: "Our instructors know Brampton's test routes inside out."
      },
      {
        title: "Pickup Available Throughout Brampton",
        description: "We'll pick you up from anywhere in Brampton and drop you off after your test."
      },
      {
        title: "Competitive Pricing",
        description: "Best rates in Brampton with transparent pricing and no hidden fees."
      },
      {
        title: "Free 30-Minute Familiarization",
        description: "Get comfortable with the vehicle before your test."
      }
    ],
    servicesDescription: "We offer comprehensive road test services to help Brampton residents prepare for and pass their driving tests with confidence.",
    services: [
      {
        icon: Car,
        title: "G2 Road Test Car Rental",
        description: "Fully equipped vehicle for your G2 road test with dual brakes for safety.",
        price: "From $80.00"
      },
      {
        icon: Car,
        title: "G Road Test Car Rental",
        description: "Premium vehicles for your full G license test with all safety features.",
        price: "From $85.00"
      },
      {
        icon: Clock,
        title: "Mock Road Test",
        description: "Practice test with an instructor who will simulate the real test experience.",
        price: "From $54.99"
      }
    ],
    testimonials: [
      {
        name: "Raj Patel",
        location: "Brampton",
        text: "The car was in perfect condition and the instructor gave me excellent last-minute tips about the Brampton test route. Passed my G test first try!",
        rating: 5
      },
      {
        name: "Sarah Johnson",
        location: "Brampton",
        text: "I was nervous about my road test, but the 30-minute familiarization session helped me feel confident. The pickup service was on time and very convenient.",
        rating: 5
      },
      {
        name: "Mohammad Ali",
        location: "Brampton",
        text: "Great experience with Elan! The car was clean and well-maintained. The instructor knew all the tricky spots in the Brampton test route.",
        rating: 5
      }
    ],
    faqs: [
      {
        question: "Which DriveTest centre in Brampton has the highest pass rate?",
        answer: "While official pass rates aren't published, our clients generally report similar success rates at both Brampton DriveTest locations. The key to success is preparation and familiarity with the test routes."
      },
      {
        question: "Do you offer pickup service anywhere in Brampton?",
        answer: "Yes, we offer pickup and drop-off service throughout Brampton and surrounding areas. Additional fees may apply based on distance."
      },
      {
        question: "How far in advance should I book a car for my road test in Brampton?",
        answer: "We recommend booking at least 1-2 weeks in advance, especially during busy summer months. However, we do our best to accommodate last-minute bookings as well."
      },
      {
        question: "What happens if I fail my road test in Brampton?",
        answer: "If you don't pass your test, we offer a 25% discount on your next booking with us. We'll also provide feedback on areas for improvement."
      }
    ]
  },
  
  // Default template (used for locations without specific data)
  default: {
    heroImage: "/hero-image.png",
    heroText: "Get ready to ace your road test with our well-maintained vehicles and expert instructors who know the local test routes and requirements.",
    features: [
      {
        title: "Local Test Route Knowledge",
        description: "Our instructors are familiar with all the local test routes."
      },
      {
        title: "Convenient Pickup Service",
        description: "We'll pick you up from your location and drop you off after your test."
      },
      {
        title: "Competitive Pricing",
        description: "Best rates with transparent pricing and no hidden fees."
      },
      {
        title: "Free 30-Minute Familiarization",
        description: "Get comfortable with the vehicle before your test."
      }
    ],
    servicesDescription: "We offer comprehensive road test services to help you prepare for and pass your driving tests with confidence.",
    services: [
      {
        icon: Car,
        title: "G2 Road Test Car Rental",
        description: "Fully equipped vehicle for your G2 road test with dual brakes for safety.",
        price: "From $80.00"
      },
      {
        icon: Car,
        title: "G Road Test Car Rental",
        description: "Premium vehicles for your full G license test with all safety features.",
        price: "From $85.00"
      },
      {
        icon: Clock,
        title: "Mock Road Test",
        description: "Practice test with an instructor who will simulate the real test experience.",
        price: "From $54.99"
      }
    ],
    testimonials: [
      {
        name: "Jane Doe",
        location: "Ontario",
        text: "The car was in perfect condition and the instructor gave me excellent tips. Passed my test first try!",
        rating: 5
      },
      {
        name: "John Smith",
        location: "Ontario",
        text: "I was nervous about my road test, but the familiarization session helped me feel confident. The service was very convenient.",
        rating: 5
      },
      {
        name: "Sarah Wilson",
        location: "Ontario",
        text: "Great experience with Elan! The car was clean and well-maintained. The instructor was very helpful.",
        rating: 5
      }
    ],
    faqs: [
      {
        question: "How does the booking process work?",
        answer: "Our booking process is simple. Select your test location, date, and whether you need pickup service. You'll receive confirmation immediately."
      },
      {
        question: "Do you offer pickup service?",
        answer: "Yes, we offer pickup and drop-off service throughout the area. Additional fees may apply based on distance."
      },
      {
        question: "How far in advance should I book?",
        answer: "We recommend booking at least 1-2 weeks in advance, especially during busy summer months."
      },
      {
        question: "What happens if I fail my road test?",
        answer: "If you don't pass your test, we offer a 25% discount on your next booking with us."
      }
    ]
  }
};