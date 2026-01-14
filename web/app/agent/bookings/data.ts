export type BookingStatus = "Pending" | "Confirmed" | "Ticketed" | "Invoiced";

export type Booking = {
  id: string;
  tripId: string;
  client: string;
  destination: string;
  type: string;
  startDate: string;
  endDate: string;
  pax: number;
  amount: number;
  currency: string;
  status: BookingStatus;
  agent: string;
  createdAt: string;
};

export const bookings: Booking[] = [
  { id: "BK-1042", tripId: "trip-1042", client: "Dupuis", destination: "Cancun", type: "Package", startDate: "2026-02-12", endDate: "2026-02-19", pax: 2, amount: 6500, currency: "USD", status: "Ticketed", agent: "alice@zeniva.ca", createdAt: "2026-01-09T10:12:00Z" },
  { id: "BK-1043", tripId: "trip-1043", client: "NovaTech", destination: "Tokyo", type: "Flights", startDate: "2026-03-02", endDate: "2026-03-10", pax: 3, amount: 9800, currency: "USD", status: "Confirmed", agent: "sara@zeniva.ca", createdAt: "2026-01-08T08:45:00Z" },
  { id: "BK-1044", tripId: "trip-1044", client: "HQ Yacht", destination: "Mediterranean", type: "Yacht", startDate: "2026-06-05", endDate: "2026-06-12", pax: 6, amount: 48000, currency: "USD", status: "Confirmed", agent: "marco@zeniva.ca", createdAt: "2026-01-07T15:30:00Z" },
  { id: "BK-1045", tripId: "trip-1045", client: "Corporate – Lavoie", destination: "Paris", type: "Hotel", startDate: "2026-02-20", endDate: "2026-02-24", pax: 1, amount: 2100, currency: "USD", status: "Invoiced", agent: "lea@zeniva.ca", createdAt: "2026-01-06T11:05:00Z" },
];
