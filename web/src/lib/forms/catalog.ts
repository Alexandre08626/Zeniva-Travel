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
    title: "Travel Form",
    division: "TRAVEL",
    description: "Standard form for Travel campaigns.",
    origin: "marketing-facebook",
    leadSource: "marketing travel",
    ownerPolicy: "fixed",
    fixedOwnerEmail: "info@zenivatravel.com",
    fields: [
      { id: "name", label: "Full name", type: "text", required: true },
      { id: "email", label: "Email", type: "email", required: true },
      { id: "phone", label: "Phone", type: "tel", required: true },
      { id: "pax", label: "Travelers", type: "number" },
      { id: "tripType", label: "Trip type", type: "select", options: ["Leisure", "Honeymoon", "Business", "Family"], required: false },
    ],
  },
];

export function getFormDefinition(id: string) {
  return FORM_DEFINITIONS.find((f) => f.id === id) || null;
}
