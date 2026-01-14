import type { Locale } from "./config";

export type Messages = {
  common: {
    localeLabel: string;
    switchTo: string;
  };
  nav: {
    bookings: string;
    proposals: string;
    clients: string;
    dashboard: string;
  };
  bookings: {
    label: string;
    title: string;
    subtitle: string;
    total: string;
    ticketed: string;
    confirmed: string;
    invoiced: string;
    searchPlaceholder: string;
    statusAll: string;
    statusConfirmed: string;
    statusTicketed: string;
    statusInvoiced: string;
    viewFile: string;
    noResults: string;
    auditTitle: string;
    auditOne: string;
    auditTwo: string;
  };
};

const en: Messages = {
  common: {
    localeLabel: "Language",
    switchTo: "Switch to",
  },
  nav: {
    bookings: "Bookings",
    proposals: "Proposals",
    clients: "Clients",
    dashboard: "Dashboard",
  },
  bookings: {
    label: "Bookings",
    title: "Confirmed & ticketed files",
    subtitle: "Pipeline of finalized trips with payment, ticketing, and invoice status.",
    total: "Total",
    ticketed: "Ticketed",
    confirmed: "Confirmed",
    invoiced: "Invoiced",
    searchPlaceholder: "Search booking, client, destination",
    statusAll: "All",
    statusConfirmed: "Confirmed",
    statusTicketed: "Ticketed",
    statusInvoiced: "Invoiced",
    viewFile: "View file",
    noResults: "No bookings match your filters.",
    auditTitle: "Audit trail (sample)",
    auditOne: "Ticketed BK-1042 · e-tickets sent to Dupuis",
    auditTwo: "Invoice sent for BK-1045 (Paris)",
  },
};

const fr: Messages = {
  common: {
    localeLabel: "Langue",
    switchTo: "Passer en",
  },
  nav: {
    bookings: "Dossiers",
    proposals: "Propositions",
    clients: "Clients",
    dashboard: "Tableau de bord",
  },
  bookings: {
    label: "Dossiers",
    title: "Dossiers confirmés et émis",
    subtitle: "Pipeline des voyages finalisés avec paiement, émission et facturation.",
    total: "Total",
    ticketed: "Émis",
    confirmed: "Confirmé",
    invoiced: "Facturé",
    searchPlaceholder: "Rechercher dossier, client, destination",
    statusAll: "Tous",
    statusConfirmed: "Confirmé",
    statusTicketed: "Émis",
    statusInvoiced: "Facturé",
    viewFile: "Ouvrir le dossier",
    noResults: "Aucun dossier ne correspond aux filtres.",
    auditTitle: "Journal (exemple)",
    auditOne: "Émission BK-1042 · billets envoyés à Dupuis",
    auditTwo: "Facture envoyée pour BK-1045 (Paris)",
  },
};

const dictionaries: Record<Locale, Messages> = { en, fr };

export function getDictionary(locale: Locale): Messages {
  return dictionaries[locale] || dictionaries.en;
}
