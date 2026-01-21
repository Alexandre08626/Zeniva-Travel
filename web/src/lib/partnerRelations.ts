import { getAgentById } from "./agent/agents";

export type PartnerOrganization = {
  id: string;
  displayName: string;
  legalName: string;
  primaryContactEmail: string;
  phone: string;
  ownerId: string;
};

export type PropertyOwner = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city?: string;
  country?: string;
};

export type ListingAssignment = {
  listingId: string;
  partnerId: string;
  ownerId: string;
  agentId: string;
  managedSince: string;
  serviceLevel: "standard" | "premium" | "priority";
};

export const partnerOrganizations: PartnerOrganization[] = [
  {
    id: "partner-yacht-01",
    displayName: "YCN Yacht Collective",
    legalName: "Yacht Collective Network LLC",
    primaryContactEmail: "partners@ycn.miami",
    phone: "+1 (305) 555-2200",
    ownerId: "owner-001",
  },
  {
    id: "partner-home-01",
    displayName: "Alpine Retreats",
    legalName: "Alpine Retreats SARL",
    primaryContactEmail: "partners@alpineretreats.fr",
    phone: "+33 4 50 12 45 90",
    ownerId: "owner-002",
  },
  {
    id: "partner-resort-01",
    displayName: "Aegean Luxury Resorts",
    legalName: "Aegean Luxury Resorts SA",
    primaryContactEmail: "lux@aegeanresorts.gr",
    phone: "+30 2286 0 22311",
    ownerId: "owner-003",
  },
  {
    id: "partner-resort-02",
    displayName: "Pearl Resort Bora Bora",
    legalName: "Pearl Resort Collection",
    primaryContactEmail: "reservations@pearlresort.com",
    phone: "+689 40 55 77 00",
    ownerId: "owner-005",
  },
  {
    id: "partner-resort-03",
    displayName: "Tribe Resort",
    legalName: "Tribe Hospitality Group",
    primaryContactEmail: "partners@triberesort.com",
    phone: "+1 (809) 555-7722",
    ownerId: "owner-006",
  },
  {
    id: "partner-home-02",
    displayName: "Barcelona City Stays",
    legalName: "Barcelona City Stays SL",
    primaryContactEmail: "host@barcelonacitystays.es",
    phone: "+34 93 123 88 70",
    ownerId: "owner-004",
  },
  {
    id: "partner-home-03",
    displayName: "Zeniva Mexico Residences",
    legalName: "Zeniva Mexico Residences SA",
    primaryContactEmail: "partners@zeniva.mx",
    phone: "+52 55 5555 7788",
    ownerId: "owner-007",
  },
  {
    id: "partner-home-04",
    displayName: "Polynesia Villa Collection",
    legalName: "Polynesia Villa Collection SARL",
    primaryContactEmail: "partners@polynesiavillas.pf",
    phone: "+689 40 55 78 11",
    ownerId: "owner-008",
  },
  {
    id: "partner-home-05",
    displayName: "Zeniva Florida Homes",
    legalName: "Zeniva Florida Homes LLC",
    primaryContactEmail: "partners@zeniva.us",
    phone: "+1 (305) 555-7711",
    ownerId: "owner-009",
  },
  {
    id: "partner-home-06",
    displayName: "Caribbean Shores Collection",
    legalName: "Caribbean Shores Collection SRL",
    primaryContactEmail: "partners@caribbeanshores.do",
    phone: "+1 (809) 555-7788",
    ownerId: "owner-010",
  },
  {
    id: "partner-home-07",
    displayName: "Madagascar Escape Homes",
    legalName: "Madagascar Escape Homes SARL",
    primaryContactEmail: "partners@madagascarescape.mg",
    phone: "+261 20 22 555 11",
    ownerId: "owner-011",
  },
];

export const propertyOwners: PropertyOwner[] = [
  {
    id: "owner-001",
    name: "Julien Marchand",
    email: "julien@medyachtcollective.com",
    phone: "+33 6 44 55 11 90",
    city: "Monaco",
    country: "MC",
  },
  {
    id: "owner-002",
    name: "Claire Dupont",
    email: "claire@alpineretreats.fr",
    phone: "+33 6 12 98 44 02",
    city: "Lac-Beauport",
    country: "CA",
  },
  {
    id: "owner-003",
    name: "Nikos Papadakis",
    email: "nikos@aegeanresorts.gr",
    phone: "+30 694 832 1010",
    city: "Santorini",
    country: "GR",
  },
  {
    id: "owner-004",
    name: "Marina Soler",
    email: "marina@barcelonacitystays.es",
    phone: "+34 699 112 700",
    city: "Barcelona",
    country: "ES",
  },
  {
    id: "owner-007",
    name: "Sofia Ramirez",
    email: "sofia@zeniva.mx",
    phone: "+52 55 5555 7711",
    city: "Tulum",
    country: "MX",
  },
  {
    id: "owner-008",
    name: "Teiki Marama",
    email: "teiki@polynesiavillas.pf",
    phone: "+689 87 55 12 34",
    city: "Papeete",
    country: "PF",
  },
  {
    id: "owner-009",
    name: "Ethan Parker",
    email: "ethan@zeniva.us",
    phone: "+1 (305) 555-7722",
    city: "Fort Lauderdale",
    country: "US",
  },
  {
    id: "owner-010",
    name: "Isabel Peralta",
    email: "isabel@caribbeanshores.do",
    phone: "+1 (809) 555-7799",
    city: "Juan Dolio",
    country: "DO",
  },
  {
    id: "owner-011",
    name: "Andry Razafindrazaka",
    email: "andry@madagascarescape.mg",
    phone: "+261 34 55 555 11",
    city: "Antananarivo",
    country: "MG",
  },
  {
    id: "owner-005",
    name: "Teva Mahina",
    email: "teva@pearlresort.com",
    phone: "+689 87 45 90 11",
    city: "Bora Bora",
    country: "PF",
  },
  {
    id: "owner-006",
    name: "Carlos Santana",
    email: "carlos@triberesort.com",
    phone: "+1 (809) 555-7701",
    city: "Punta Cana",
    country: "DO",
  },
];

export const listingAssignments: ListingAssignment[] = [
  {
    listingId: "listing-1",
    partnerId: "partner-yacht-01",
    ownerId: "owner-001",
    agentId: "agent-jason",
    managedSince: "2025-08-01",
    serviceLevel: "premium",
  },
  {
    listingId: "listing-2",
    partnerId: "partner-home-01",
    ownerId: "owner-002",
    agentId: "agent-jason",
    managedSince: "2025-06-10",
    serviceLevel: "standard",
  },
  {
    listingId: "listing-3",
    partnerId: "partner-resort-01",
    ownerId: "owner-003",
    agentId: "agent-jason",
    managedSince: "2025-05-05",
    serviceLevel: "priority",
  },
  {
    listingId: "listing-4",
    partnerId: "partner-home-02",
    ownerId: "owner-004",
    agentId: "agent-jason",
    managedSince: "2026-01-10",
    serviceLevel: "standard",
  },
  {
    listingId: "listing-5",
    partnerId: "partner-resort-02",
    ownerId: "owner-005",
    agentId: "agent-jason",
    managedSince: "2025-11-12",
    serviceLevel: "premium",
  },
  {
    listingId: "listing-6",
    partnerId: "partner-resort-02",
    ownerId: "owner-005",
    agentId: "agent-jason",
    managedSince: "2025-11-12",
    serviceLevel: "premium",
  },
  {
    listingId: "listing-7",
    partnerId: "partner-resort-03",
    ownerId: "owner-006",
    agentId: "agent-jason",
    managedSince: "2025-12-05",
    serviceLevel: "standard",
  },
  {
    listingId: "listing-8",
    partnerId: "partner-yacht-01",
    ownerId: "owner-001",
    agentId: "agent-jason",
    managedSince: "2025-09-20",
    serviceLevel: "premium",
  },
];

export function getPartnerById(id?: string) {
  if (!id) return undefined;
  return partnerOrganizations.find((partner) => partner.id === id);
}

export function getOwnerById(id?: string) {
  if (!id) return undefined;
  return propertyOwners.find((owner) => owner.id === id);
}

export function getAssignmentForListing(listingId?: string) {
  if (!listingId) return undefined;
  return listingAssignments.find((assignment) => assignment.listingId === listingId);
}

export function getListingRelations(listingId?: string) {
  const assignment = getAssignmentForListing(listingId);
  const partner = getPartnerById(assignment?.partnerId);
  const owner = getOwnerById(assignment?.ownerId);
  const agent = assignment?.agentId ? getAgentById(assignment.agentId) : undefined;
  return { assignment, partner, owner, agent };
}
