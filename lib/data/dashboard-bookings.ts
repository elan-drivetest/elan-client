// lib/data/dashboard-bookings.ts
export const dashboardBookings = {
  bookings: [
    {
      id: 1,
      testType: "G2 Test",
      vehicleType: "Subcompact SUV",
      vehicleModel: "Lexus UX or Similar",
      vehicleImage: "/vehicle-lexus.png",
      vehicleFeatures: ["Gas", "5 seats", "Automatic"],
      startDate: "Monday, April 7, 2025 at 10:00 am",
      testCentre: "Road Test Centre",
      testCentreAddress: "5555 Eglinton Ave W Etobicoke ON M9C 5M1",
      pickupAddress: "154 Lake St Peterborough ON K9J 2H3",
      pickupDistance: "120km",
      paymentBreakdown: [
        {
          label: "Road Test Centre",
          address: "5555 Eglinton Ave W Etobicoke ON M9C 5M1",
          amount: "$ 80.00 CAD"
        },
        {
          label: "Pickup Price",
          address: "154 Lake St Peterborough ON K9J 2H3",
          amount: "$ 95.00 CAD"
        },
        {
          label: "Free Drop-Off Service",
          address: "154 Lake St Peterborough ON K9J 2H3",
          amount: "$ 0.00 CAD",
          isDiscount: true
        },
        {
          label: "Complete Mock Test",
          description: "Practice your test with our experienced instructors",
          address: "",
          amount: "$ 0.00 CAD",
          strikethrough: "$ 100.00 CAD",
          isDiscount: true
        }
      ],
      totalPayment: "$ 175.00 CAD",
      status: "Active"
    }
  ],
  instructor: {
    name: "Joe Morgan",
    avatar: "/instructor.jpeg",
    phone: "1-648-468-4589",
    rating: 5
  }
};