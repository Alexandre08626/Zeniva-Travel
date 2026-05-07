/**
 * Schema.org JSON-LD helpers for the /carrieres hub.
 * - Agent role → JobPosting (telecommute, commission-based, US-incorporated employer)
 * - Influencer role → WebPage describing the creator program (NOT a JobPosting — it's a partnership, not employment)
 */

const SITE_URL = "https://zenivatravel.com";
const EMPLOYER_NAME = "Zeniva LLC";
const EMPLOYER_LEGAL = "Zeniva LLC";
const EMPLOYER_LOGO = "https://www.zenivatravel.com/branding/logo.png";

export interface CareersSchemaParams {
  locale: "en" | "fr";
  pageUrl: string;
}

export function buildCareersJsonLd({ locale, pageUrl }: CareersSchemaParams): object[] {
  const isoDate = new Date().toISOString().slice(0, 10);
  const validThrough = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const jobTitle = locale === "fr" ? "Agent de voyage indépendant (commission 70%)" : "Independent Travel Agent (70% commission)";
  const jobDescription =
    locale === "fr"
      ? "Rejoins Zeniva comme agent de voyage indépendant. Commission de 70% sur le profit net de chaque réservation, assistante IA Lina, compte ZeniPay, numéro de téléphone professionnel et accès à 200+ destinations. Aucune expérience préalable requise — formation complète incluse. Travail à distance, partout dans le monde."
      : "Join Zeniva as an independent travel agent. Earn 70% commission on the net profit of every booking, with full tech setup: Lina AI personal assistant, ZeniPay merchant account, professional phone & email, and access to 200+ destinations. No prior experience required — complete training included. Fully remote, work from anywhere.";

  const jobPosting = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: jobTitle,
    description: jobDescription,
    datePosted: isoDate,
    validThrough,
    employmentType: "CONTRACTOR",
    hiringOrganization: {
      "@type": "Organization",
      name: EMPLOYER_NAME,
      legalName: EMPLOYER_LEGAL,
      sameAs: SITE_URL,
      logo: EMPLOYER_LOGO,
    },
    jobLocationType: "TELECOMMUTE",
    applicantLocationRequirements: [
      { "@type": "Country", name: "United States" },
      { "@type": "Country", name: "Canada" },
    ],
    baseSalary: {
      "@type": "MonetaryAmount",
      currency: "USD",
      value: {
        "@type": "QuantitativeValue",
        unitText: "COMMISSION",
        value: "70% of net profit per booking",
      },
    },
    incentiveCompensation: locale === "fr" ? "70% du profit net par réservation. Programme de parrainage : 1 mois offert / 299 $ remboursés / Ambassadeur Zeniva." : "70% of net profit per booking. Referral program: 1 free month / $299 setup reimbursed / Zeniva Ambassador status.",
    qualifications: locale === "fr" ? "Aucune expérience requise. Formation complète fournie." : "No prior experience required. Complete training provided.",
    skills: locale === "fr" ? "Communication, service client, esprit d'équipe" : "Communication, customer service, self-motivation",
    workHours: locale === "fr" ? "Flexible, à distance" : "Flexible, fully remote",
    url: pageUrl,
    directApply: false,
  };

  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: locale === "fr" ? "Programme Influenceur Zeniva" : "Zeniva Influencer Program",
    description:
      locale === "fr"
        ? "Programme partenariat pour créateurs de contenu : commission de 3 à 5% sur les réservations, dashboard CRM en temps réel, et statut Premium dès 150 clients confirmés."
        : "Creator partnership program: 3–5% commission on bookings, real-time CRM dashboard, and Premium status at 150 confirmed clients with agency-cost pricing on flights, hotels and transfers.",
    inLanguage: locale === "fr" ? "fr-CA" : "en-US",
    url: pageUrl,
    isPartOf: {
      "@type": "WebSite",
      name: "Zeniva",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: EMPLOYER_NAME,
      legalName: EMPLOYER_LEGAL,
      sameAs: SITE_URL,
      logo: EMPLOYER_LOGO,
    },
    audience: {
      "@type": "Audience",
      audienceType: locale === "fr" ? "Créateurs de contenu, influenceurs" : "Content creators, social media influencers",
    },
  };

  return [jobPosting, webPage];
}
