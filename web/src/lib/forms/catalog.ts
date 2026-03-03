import type { Division } from "../agent/types";

export type FormField = {
  id: string;
  label: string;
  type: "text" | "email" | "tel" | "number" | "select" | "textarea" | "checkbox" | "date";
  placeholder?: string;
  options?: string[];
  required?: boolean;
};

export type FormDefinition = {
  id: string;
  title: string;
  division: Division;
  description: string;
  fields: FormField[];
  origin: string;
  leadSource: string;
  ownerPolicy: "fixed" | "agent";
  fixedOwnerEmail?: string;
};

export const FORM_DEFINITIONS: FormDefinition[] = [
  {
    id: "yacht-jason",
    title: "Yacht Form",
    division: "YACHT",
    description: "Specialized form for Yacht campaigns.",
    origin: "marketing-facebook",
    leadSource: "marketing Jason",
    ownerPolicy: "agent",
    fields: [
      { id: "name", label: "Full name", type: "text", required: true },
      { id: "email", label: "Email", type: "email", required: true },
      { id: "phone", label: "Phone", type: "tel", required: true },
      { id: "pax", label: "Number of guests", type: "number" },
    ],
  },
  {
    id: "travel-agent",
    title: "Plan Your Dream Trip ✈️",
    division: "TRAVEL",
    description: "Fill out this form and our AI travel assistant Lina will start building your perfect trip!",
    origin: "marketing-facebook",
    leadSource: "marketing travel",
    ownerPolicy: "fixed",
    fixedOwnerEmail: "info@zenivatravel.com",
    fields: [
      { id: "name", label: "Full name", type: "text", placeholder: "John Smith", required: true },
      { id: "email", label: "Email", type: "email", placeholder: "you@email.com", required: true },
      { id: "phone", label: "Phone number", type: "tel", placeholder: "+1 (555) 555-5555", required: true },
      { id: "destination", label: "Dream destination", type: "text", placeholder: "Bali, Japan, Italy..." },
      { id: "departureDate", label: "Departure date", type: "date" },
      { id: "returnDate", label: "Return date", type: "date" },
      { id: "pax", label: "Number of travelers", type: "number", placeholder: "2" },
      { id: "budget", label: "Budget per person (USD)", type: "select", options: ["Under $2,000", "$2,000 - $5,000", "$5,000 - $10,000", "$10,000+", "Flexible"] },
      { id: "tripType", label: "Trip type", type: "select", options: ["Leisure", "Honeymoon", "Business", "Family", "Adventure", "Luxury", "All-Inclusive"] },
    ],
  },
];

export function getFormDefinition(id: string) {
  return FORM_DEFINITIONS.find((f) => f.id === id) || null;
}
