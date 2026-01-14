export type Division = "TRAVEL" | "YACHT" | "VILLAS" | "GROUPS" | "RESORTS";
export type ProductKind = "travel" | "yacht" | "villa" | "group" | "luxury";

export type Client = {
  id: string;
  name: string;
  email?: string;
  ownerEmail: string;
  phone?: string;
  origin: "house" | "agent";
  assignedAgents?: string[];
  primaryDivision?: Division;
  budget?: string;
  preferences?: string;
  notes?: string;
};

export type Traveler = {
  id: string;
  clientId: string;
  fullName: string;
  passport?: string;
  dob?: string;
  notes?: string;
};

export type TripStatus = "Draft" | "Quoted" | "Approved" | "Pending Payment" | "Booked" | "Ticketed" | "Completed";
export type ComponentStatus = "Draft" | "Quoted" | "Approved" | "Pending Payment" | "Booked" | "Ticketed" | "Cancelled";

export type ComponentType = "flight" | "hotel" | "activity" | "transfer" | "car" | "package" | "yacht";

export type Money = {
  currency: string;
  net: number;
  sell: number;
};

export type Pricing = Money & {
  marginAmount: number;
  marginPct: number;
  commissionAmount: number;
  commissionPct: number;
};

export type BaseComponent = {
  id: string;
  type: ComponentType;
  productKind: ProductKind;
  status: ComponentStatus;
  supplier?: string;
  provider?: string;
  confirmation?: string;
  allowHold?: boolean;
  supersedesId?: string;
  pricing: Pricing;
  notes?: string;
};

export type FlightComponent = BaseComponent & {
  type: "flight";
  from: string;
  to: string;
  dep: string;
  arr: string;
  carrier: string;
  cabin: string;
};

export type HotelComponent = BaseComponent & {
  type: "hotel";
  hotel: string;
  location: string;
  checkIn: string;
  checkOut: string;
  room: string;
  board: string;
};

export type YachtComponent = BaseComponent & {
  type: "yacht";
  name: string;
  location: string;
  length: string;
  guests: number;
  weekStart: string;
  includesCrew: boolean;
};

export type ActivityComponent = BaseComponent & {
  type: "activity";
  title: string;
  date: string;
  time: string;
  location: string;
};

export type TransferComponent = BaseComponent & {
  type: "transfer";
  from: string;
  to: string;
  date: string;
  vehicle: string;
  shared?: boolean;
};

export type CarComponent = BaseComponent & {
  type: "car";
  pickup: string;
  dropoff: string;
  start: string;
  end: string;
  category: string;
};

export type PackageComponent = BaseComponent & {
  type: "package";
  title: string;
};

export type TripComponent =
  | FlightComponent
  | HotelComponent
  | YachtComponent
  | ActivityComponent
  | TransferComponent
  | CarComponent
  | PackageComponent;

export type PaymentStatus = "Pending" | "Paid" | "Failed" | "Refunded";
export type Payment = {
  id: string;
  link: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  createdAt: string;
};

export type DocumentEntry = {
  id: string;
  title: string;
  url?: string;
  content?: string;
};

export type LedgerEntry = {
  id: string;
  tripId: string;
  paymentId?: string;
  componentId?: string;
  account: "TRAVEL" | "YACHT";
  entryType: "split" | "commission" | "fee";
  label: string;
  amount: number;
  currency: string;
  createdAt: string;
};

export type TripFile = {
  id: string;
  clientId: string;
  title: string;
  ownerEmail?: string;
  status: TripStatus;
  division: Division;
  components: TripComponent[];
  payments: Payment[];
  documents: DocumentEntry[];
  quoteTotal?: Pricing;
  marginOverridePct?: number;
  commissionOverridePct?: number;
};
