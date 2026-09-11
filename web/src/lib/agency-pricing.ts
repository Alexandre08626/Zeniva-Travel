export const AGENCY_MONTHLY_PRICE = 599;
export const ADDITIONAL_ADVISOR_MONTHLY_PRICE = 49;
export const installationPlans = [
  { key: "essential", label: "Essential", price: 1500, features: [
    "Website customized to your agency’s brand",
    "Lina setup and inquiry capture",
    "Initial training",
  ] },
  { key: "professional", label: "Professional", price: 3500, features: [
    "Everything in Essential",
    "CRM setup and client assignment to advisors",
    "Automated follow-ups",
    "Import of a usable contact list",
  ] },
  { key: "integrated", label: "Integrated", price: 7500, features: [
    "Everything in Professional",
    "Integration with one business software system, such as PC Voyages",
    "Data exchanges defined in the quote",
    "Testing and training",
  ] },
] as const;
export const formatCAD = (amount: number) => new Intl.NumberFormat("en-CA", {
  style: "currency", currency: "CAD", maximumFractionDigits: 0,
}).format(amount);
export const agencyMonthlyTotal = (advisors: number) =>
  AGENCY_MONTHLY_PRICE + Math.max(0, Math.floor(advisors) - 1) * ADDITIONAL_ADVISOR_MONTHLY_PRICE;
