// lib/data/faq-data.ts
//
// Answers are either a literal string or an `answerKey`, which the FAQ page
// resolves at render time from the server's live settings. Anything quoting a
// number an admin can change (refund windows, the partial rate) must use a key
// rather than a sentence, or it goes stale silently.

export type FaqAnswerKey = 'refund-ladder';

export interface FaqQuestion {
  question: string;
  answer?: string;
  answerKey?: FaqAnswerKey;
}

export interface FaqCategory {
  title: string;
  questions: FaqQuestion[];
}

export const faqCategories: FaqCategory[] = [
  {
    title: "Booking & Payments",
    questions: [
      {
        question: "How does the booking process work?",
        answer: "Our booking process is simple and fast. You can book a car for your test online through our website in just a few minutes. Select your test location, date, and whether you need pickup service. You'll receive confirmation immediately and reminders closer to your test date."
      },
      {
        question: "What types of payment do you accept?",
        answer: "We accept all major credit cards, debit cards, and digital payment methods like PayPal. We also offer 0% interest financing options through Klarna and Afterpay, allowing you to pay for your booking in installments."
      },
      {
        // Resolved at render time from the server's live refund settings — see
        // `answerKey` above. The windows and the partial rate are admin-tunable,
        // so this answer must never be a hardcoded sentence.
        question: "What is your cancellation policy?",
        answerKey: "refund-ladder" as const
      }
    ]
  },
  {
    title: "Road Test Services",
    questions: [
      {
        question: "What types of road tests do you offer car rentals for?",
        answer: "We offer car rentals for both G2 and G road tests across Ontario. Our vehicles are specifically prepared to meet all test requirements for each license class."
      },
      {
        question: "How early should I arrive for my road test?",
        answer: "We recommend arriving 45 minutes before your scheduled test time. This gives you time for our familiarization session where you'll get comfortable with the vehicle and receive last-minute tips specific to your test center."
      },
      {
        question: "Do I get time to practice with the car before the test?",
        answer: "Yes, we include a complimentary 30-minute familiarization session before your test. This gives you time to adjust the mirrors and seat, practice basic maneuvers, and get comfortable with the vehicle's handling."
      },
      {
        question: "What happens if I fail my test?",
        answer: "If you don't pass, we'll give you feedback on the areas to improve and help you book your next attempt. Test nerves are normal, and we're committed to helping you succeed next time."
      }
    ]
  },
  {
    title: "Pickup & Locations",
    questions: [
      {
        question: "Do you provide pickup and drop-off services?",
        answer: "Yes, we offer pickup and drop-off services from your location to the test center and back."
      },
      {
        question: "Which areas do you serve?",
        answer: "We provide road test car rental services across Ontario, including Toronto, Mississauga, Brampton, Ottawa, Hamilton, London, and many other locations. If you don't see your area listed, please contact us to check availability."
      }
    ]
  },
  {
    title: "Vehicles & Equipment",
    questions: [
      {
        question: "What type of vehicles do you offer?",
        answer: "We offer a range of vehicles for road tests, including compact cars, sedans, and SUVs. All our vehicles are late models (less than 3 years old), well-maintained, and equipped with dual control brakes for added safety."
      },
      {
        question: "Are your vehicles equipped with dual control brakes?",
        answer: "Yes, all our vehicles are equipped with dual control brakes, allowing the instructor or examiner to assist with braking if necessary. This safety feature provides peace of mind for both students and examiners."
      },
      {
        question: "Will the vehicle have insurance for my test?",
        answer: "Yes, all our vehicles come fully insured for your road test. Insurance coverage is included with your rental, so you don't need to worry about obtaining additional coverage."
      }
    ]
  }
];