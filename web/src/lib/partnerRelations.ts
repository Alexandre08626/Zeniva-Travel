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
    displayName: "Mediterranean Yacht Collective",
    legalName: "Mediterranean Yacht Collective Ltd.",
    primaryContactEmail: "ops@medyachtcollective.com",
    phone: "+377 97 70 55 12",
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
    id: "partner-home-02",
    displayName: "Barcelona City Stays",
    legalName: "Barcelona City Stays SL",
    primaryContactEmail: "host@barcelonacitystays.es",
    phone: "+34 93 123 88 70",
    ownerId: "owner-004",
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
    city: "Chamonix",
    country: "FR",
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
    agentId: "agent-justine",
    managedSince: "2025-06-10",
    serviceLevel: "standard",
  },
  {
    listingId: "listing-3",
    partnerId: "partner-resort-01",
    ownerId: "owner-003",
    agentId: "agent-justine",
    managedSince: "2025-05-05",
    serviceLevel: "priority",
  },
  {
    listingId: "listing-4",
    partnerId: "partner-home-02",
    ownerId: "owner-004",
    agentId: "agent-amine",
    managedSince: "2026-01-10",
    serviceLevel: "standard",
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
