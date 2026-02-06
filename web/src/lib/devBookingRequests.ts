export type BookingRequestStatus =
  | "pending_hq"
  | "needs_changes"
  | "rejected"
  | "approved"
  | "confirmed_paid"
  | "confirmed_unpaid";

export type BookingPaymentStatus = "paid" | "unpaid" | "unknown";

export type BookingRequest = {
  id: string;
  title: string;
  clientName: string;
  dossierId?: string;
  source: "agent" | "lina" | "api";
  provider: string;
  status: BookingRequestStatus;
  paymentStatus: BookingPaymentStatus;
  confirmationReference?: string;
  approvedBy?: string;
  approvedAt?: string;
  requestedBy?: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  flagged?: boolean;
};

export const bookingRequests: BookingRequest[] = [
  {
    id: "br-1001",
    title: "Paris + Rome flights",
    clientName: "Morales Family",
    dossierId: "TRIP-501",
    source: "agent",
    provider: "tbo",
    status: "pending_hq",
    paymentStatus: "unknown",
    requestedBy: "agent@zenivatravel.com",
    totalAmount: 4820,
    currency: "USD",
    createdAt: "2026-01-10T14:20:00Z",
    updatedAt: "2026-01-10T14:20:00Z",
  },
  {
    id: "br-1002",
    title: "Maldives resort booking",
    clientName: "Dupuis",
    dossierId: "TRIP-104",
    source: "lina",
    provider: "hotel_partner",
    status: "needs_changes",
    paymentStatus: "unknown",
    requestedBy: "lina@zeniva.ai",
    totalAmount: 9200,
    currency: "USD",
    createdAt: "2026-01-09T09:10:00Z",
    updatedAt: "2026-01-10T08:45:00Z",
  },
  {
    id: "br-2001",
    title: "Barcelona stay",
    clientName: "Germain",
    dossierId: "TRIP-402",
    source: "api",
    provider: "duffel",
    status: "confirmed_paid",
    paymentStatus: "paid",
    confirmationReference: "PNR-8XK29",
    totalAmount: 1650,
    currency: "USD",
    createdAt: "2026-01-11T12:02:00Z",
    updatedAt: "2026-01-11T12:02:00Z",
  },
];
