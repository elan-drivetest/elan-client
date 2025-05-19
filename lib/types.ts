// lib/types.ts
export interface BookingDetails {
  testType: string;
  startDate: string;
  testCentre: string;
  testCentreAddress: string;
  pickupAddress?: string;
  pickupDistance?: string;
  vehicleImage: string;
}

export interface InstructorDetails {
  name: string;
  avatar: string;
  phone: string;
  rating: number;
}

export interface BookingCardProps {
  booking: BookingDetails;
  instructor: InstructorDetails;
}