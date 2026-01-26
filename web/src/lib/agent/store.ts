import { addAudit } from "../authStore";
import { Client, TripFile, TripComponent, Payment, DocumentEntry, TripStatus, LedgerEntry, Division } from "./types";
import { computeTripSplit } from "./billing";

const IS_PROD = process.env.NODE_ENV === "production";
const STORAGE_KEY = "zeniva_agent_store_v1";

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

let clients: Client[] = IS_PROD ? [] : [
  {
    id: "C-100",
    name: "Morales Family",
    email: "morales@example.com",
    ownerEmail: "agent@zenivatravel.com",
    phone: "+1 (312) 555-0123",
    origin: "agent",
    assignedAgents: ["agent@zenivatravel.com"],
    primaryDivision: "TRAVEL",
  },
  {
    id: "C-101",
    name: "Jason Yacht",
    email: "jason.yacht@example.com",
    ownerEmail: "agent@zenivatravel.com",
    phone: "+1 (212) 555-4455",
    origin: "agent",
    assignedAgents: ["agent@zenivatravel.com"],
    primaryDivision: "YACHT",
  },
  {
    id: "C-102",
    name: "House Account",
    email: "ops@zeniva.travel",
    ownerEmail: "house@zeniva.travel",
    phone: "+1 (416) 555-8899",
    origin: "house",
    primaryDivision: "TRAVEL",
  },
];

let trips: TripFile[] = IS_PROD ? [] : [
  { id: "T-501", clientId: "C-100", title: "Paris + Rome", ownerEmail: "agent@zenivatravel.com", status: "Draft", division: "TRAVEL", components: [], payments: [], documents: [] },
  { id: "T-502", clientId: "C-101", title: "Med Yacht Week", ownerEmail: "agent@zenivatravel.com", status: "Draft", division: "YACHT", components: [], payments: [], documents: [] },
];

let ledger: LedgerEntry[] = IS_PROD ? [] : [];

function persist() {
  if (IS_PROD || typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ clients, trips, ledger }));
  } catch (_) {
    // ignore
  }
}

function hydrate() {
  if (IS_PROD || typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      clients = parsed.clients || clients;
      trips = parsed.trips || trips;
      ledger = (parsed.ledger || ledger || []).map((l: LedgerEntry) => ({ ...l, entryType: l.entryType || "split" }));
    }
  } catch (_) {
    // ignore
  }
}

hydrate();

export function listClients() {
  return clients;
}

export function addClient(params: { name: string; email: string; ownerEmail: string; phone: string; primaryDivision: Division; assignedAgent?: string; origin?: Client["origin"] }) {
  const id = `C-${clients.length + 100}`;
  const origin = params.origin ?? (params.assignedAgent ? "agent" : "house");
  const entry: Client = {
    id,
    name: params.name,
    email: params.email,
    ownerEmail: params.ownerEmail,
    phone: params.phone,
    origin,
    primaryDivision: params.primaryDivision,
    assignedAgents: params.assignedAgent ? [params.assignedAgent] : [],
  };
  clients = [entry, ...clients];
  addAudit("client:create", "client", id, { division: params.primaryDivision, assignedAgent: params.assignedAgent || null });
  persist();
  return entry;
}

export function listTrips() {
  return trips;
}

export function listLedger() {
  return ledger;
}

export function addComponentToTrip(tripId: string, component: TripComponent) {
  const trip = trips.find((t) => t.id === tripId);
  if (!trip) return;
  trip.components.unshift(component);
  addAudit("trip:add-component", "trip", tripId, { type: component.type, id: component.id });
  persist();
}

export function addPayment(tripId: string, payment: Payment) {
  const trip = trips.find((t) => t.id === tripId);
  if (!trip) return;
  trip.payments.unshift(payment);
  addAudit("payment:link", "trip", tripId, { amount: payment.amount, currency: payment.currency });
  persist();
}

export function setPaymentStatus(tripId: string, paymentId: string, status: Payment["status"]) {
  const trip = trips.find((t) => t.id === tripId);
  if (!trip) return;
  const payment = trip.payments.find((p) => p.id === paymentId);
  if (!payment) return;
  const prev = payment.status;
  payment.status = status;
  addAudit("payment:status", "trip", tripId, { paymentId, status });
  if (status === "Paid" && prev !== "Paid") {
    addLedgerForPayment(trip, payment);
  }
  persist();
}

export function addDocument(tripId: string, doc: DocumentEntry) {
  const trip = trips.find((t) => t.id === tripId);
  if (!trip) return;
  trip.documents.unshift(doc);
  addAudit("docs:generate", "trip", tripId, { doc: doc.title });
  persist();
}

export function getClientById(id: string) {
  return clients.find((c) => c.id === id);
}

export function getTripById(id: string) {
  return trips.find((t) => t.id === id);
}

const STATUSES: TripStatus[] = ["Draft", "Quoted", "Approved", "Pending Payment", "Booked", "Ticketed", "Completed"];

export function advanceTripStatus(tripId: string) {
  const trip = trips.find((t) => t.id === tripId);
  if (!trip) return;
  const idx = STATUSES.indexOf(trip.status as TripStatus);
  const next = STATUSES[Math.min(idx + 1, STATUSES.length - 1)];
  if (next !== trip.status) {
    trip.status = next;
    addAudit("trip:status", "trip", tripId, { status: next });
    persist();
  }
}

export function setTripStatus(tripId: string, status: TripStatus) {
  const trip = trips.find((t) => t.id === tripId);
  if (!trip) return;
  trip.status = status;
  addAudit("trip:status", "trip", tripId, { status });
  persist();
}

export function setTripMarginOverride(tripId: string, pct?: number) {
  const trip = trips.find((t) => t.id === tripId);
  if (!trip) return;
  trip.marginOverridePct = pct;
  addAudit("pricing:margin-override", "trip", tripId, { pct });
  persist();
}

export function setTripCommissionOverride(tripId: string, pct?: number) {
  const trip = trips.find((t) => t.id === tripId);
  if (!trip) return;
  trip.commissionOverridePct = pct;
  addAudit("pricing:commission-override", "trip", tripId, { pct });
  persist();
}

export function reassignClientOwner(clientId: string, newOwnerEmail: string) {
  const client = clients.find((c) => c.id === clientId);
  if (!client) return;
  client.ownerEmail = newOwnerEmail;
  addAudit("client:reassign-owner", "client", clientId, { owner: newOwnerEmail });
  persist();
}

function addLedgerForPayment(trip: TripFile, payment: Payment) {
  const client = getClientById(trip.clientId);
  const hasAgent = (client?.assignedAgents || []).length > 0 || client?.origin === "agent";
  const agentPct = hasAgent ? 0.2 : 0;
  const split = computeTripSplit(trip.components || [], agentPct);
  if (split.totalSell <= 0) return;
  const travelRatio = split.travelSell / split.totalSell;
  const yachtRatio = split.yachtSell / split.totalSell;
  const travelAmount = Math.round(payment.amount * travelRatio);
  const yachtAmount = Math.round(payment.amount * yachtRatio);
  const travelAgentAmount = Math.round(travelAmount * agentPct);
  const travelNetAmount = travelAmount - travelAgentAmount;
  if (travelNetAmount > 0) {
    const entry: LedgerEntry = {
      id: uid(),
      tripId: trip.id,
      paymentId: payment.id,
      account: "TRAVEL",
      entryType: "split",
      label: "Travel share",
      amount: travelNetAmount,
      currency: payment.currency,
      createdAt: new Date().toISOString(),
    };
    ledger.unshift(entry);
    addAudit("ledger:split", "trip", trip.id, { account: "TRAVEL", amount: travelNetAmount, currency: payment.currency });
  }
  if (travelAgentAmount > 0) {
    const entry: LedgerEntry = {
      id: uid(),
      tripId: trip.id,
      paymentId: payment.id,
      account: "TRAVEL",
      entryType: "commission",
      label: "Travel agent 20%",
      amount: travelAgentAmount,
      currency: payment.currency,
      createdAt: new Date().toISOString(),
    };
    ledger.unshift(entry);
    addAudit("ledger:commission", "trip", trip.id, { account: "TRAVEL", amount: travelAgentAmount, currency: payment.currency });
  }
  if (yachtAmount > 0) {
    const entry: LedgerEntry = {
      id: uid(),
      tripId: trip.id,
      paymentId: payment.id,
      account: "YACHT",
      entryType: "split",
      label: "Yacht share",
      amount: yachtAmount,
      currency: payment.currency,
      createdAt: new Date().toISOString(),
    };
    ledger.unshift(entry);
    addAudit("ledger:split", "trip", trip.id, { account: "YACHT", amount: yachtAmount, currency: payment.currency });
  }
}

export function addLedgerCommission(tripId: string, amount: number, currency: string, label = "Commission accrual", componentId?: string) {
  const entry: LedgerEntry = {
    id: uid(),
    tripId,
    componentId,
    account: "TRAVEL",
    entryType: "commission",
    label,
    amount: Math.round(amount),
    currency,
    createdAt: new Date().toISOString(),
  };
  ledger.unshift(entry);
  addAudit("ledger:commission", "trip", tripId, { amount: entry.amount, currency, componentId });
  persist();
}

export function addLedgerFee(tripId: string, amount: number, currency: string, account: "TRAVEL" | "YACHT" = "TRAVEL", label = "Fee") {
  const entry: LedgerEntry = {
    id: uid(),
    tripId,
    account,
    entryType: "fee",
    label,
    amount: Math.round(amount),
    currency,
    createdAt: new Date().toISOString(),
  };
  ledger.unshift(entry);
  addAudit("ledger:fee", "trip", tripId, { amount: entry.amount, currency, account });
  persist();
}
