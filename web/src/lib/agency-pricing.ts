export const AGENCY_MONTHLY_PRICE = 599;
export const ADDITIONAL_ADVISOR_MONTHLY_PRICE = 49;
export const installationPlans = [
  { key: "essential", label: "Essentielle", price: 1500, features: [
    "Site Web à l’image de votre agence",
    "Configuration de Lina et collecte des demandes",
    "Formation de départ",
  ] },
  { key: "professional", label: "Professionnelle", price: 3500, features: [
    "Tout le forfait Essentielle",
    "Configuration du CRM et attribution des clients aux conseillers",
    "Suivis automatisés",
    "Importation d’une liste de contacts exploitable",
  ] },
  { key: "integrated", label: "Intégrée", price: 7500, features: [
    "Tout le forfait Professionnelle",
    "Connexion à un logiciel métier, comme PC Voyages",
    "Échanges de données définis dans la soumission",
    "Tests et formation",
  ] },
] as const;
export const formatCAD = (amount: number) => new Intl.NumberFormat("fr-CA", {
  style: "currency", currency: "CAD", maximumFractionDigits: 0,
}).format(amount);
export const agencyMonthlyTotal = (advisors: number) =>
  AGENCY_MONTHLY_PRICE + Math.max(0, Math.floor(advisors) - 1) * ADDITIONAL_ADVISOR_MONTHLY_PRICE;
