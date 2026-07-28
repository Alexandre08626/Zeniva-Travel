const names = {
  us: ["Sarah Johnson", "Michael Chen", "Emily Williams", "James Rodriguez", "Jessica Patel", "David Kim", "Amanda Thompson", "Robert Taylor", "Jennifer Martinez", "Christopher Lee"],
  uk: ["Oliver Smith", "Charlotte Brown", "William Davis", "Amelia Wilson", "James Anderson", "Isabella Thomas", "Benjamin Jackson", "Mia White", "Henry Harris", "Sophia Martin"],
  fr: ["Lucas Bernard", "Emma Petit", "Hugo Dubois", "Camille Moreau", "Louis Lambert", "Léa Fontaine", "Gabriel Girard", "Manon Rousseau", "Raphaël Mercier", "Chloé Lefebvre"],
  ca: ["Liam Tremblay", "Olivier Gagnon", "Noah Côté", "William Bouchard", "Ethan Gauthier", "Sophie Morin", "Chloé Lavoie", "Zoé Fortin", "Léa Bergeron", "Alice Nadeau"],
  qc: ["Alexandre Bélanger", "Maxime Poulin", "Samuel Cloutier", "Félix Blais", "Jérôme Desjardins", "Catherine Paquette", "Valérie Ouellet", "Isabelle Lajoie", "Gabrielle Boudreau", "Marie-Pier Gingras"],
  jp: ["Hiroshi Tanaka", "Yuki Sato", "Takashi Watanabe", "Akira Ito", "Kenji Yamamoto", "Sakura Mori", "Yui Nakamura", "Aoi Kobayashi", "Rin Hayashi", "Mizuho Yamada"],
  ae: ["Ahmed Al-Rashid", "Fatima Hassan", "Omar Khalid", "Layla Mahmoud", "Yousef Ibrahim", "Nora Al-Farsi", "Khalid Mansour", "Aisha Rahman", "Mohammed Ali", "Zara Qadir"],
  br: ["Lucas Silva", "Marina Santos", "Pedro Oliveira", "Ana Costa", "Rafael Pereira", "Julia Souza", "Gabriel Lima", "Carolina Alves", "Felipe Rocha", "Beatriz Campos"],
  mx: ["Carlos Hernández", "Maria López", "Javier García", "Sofia Martínez", "Diego Rodríguez", "Ximena González", "Andrés Pérez", "Valeria Sánchez", "Luis Torres", "Fernanda Cruz"],
  de: ["Felix Wagner", "Hannah Müller", "Lukas Schneider", "Emma Fischer", "Jonas Weber", "Mia Schäfer", "Tim Richter", "Lena Klein", "Maximilian Wolf", "Nele Schröder"],
  au: ["Jack Thompson", "Olivia Brown", "Lachlan Wilson", "Charlotte Davis", "Cooper Smith", "Amelia Taylor", "Harrison Jones", "Isabella Lee", "Declan Anderson", "Sophie White"],
  general: ["Alex Morgan", "Jordan Riley", "Casey Quinn", "Riley Parker", "Taylor Brooks", "Morgan Chase", "Avery Reed", "Quinn Sterling", "Harper Lane", "Cameron Blake"],
};

const companies_zenipay = ["OmniPay Solutions", "QuickTransact Inc.", "GlobalPay Systems", "NovaFintech Corp", "PayFlow Partners", "MerchantHub Inc.", "TransactEase Ltd", "PayStream Technologies", "FinBridge Solutions", "CapitalFlow Inc."];
const companies_dev = ["FullStack Labs", "CloudNine Dev", "API Forge Inc.", "DataPulse Technologies", "CodeCraft Studios", "NexGen Software", "ByteWave Solutions", "TechBridge Partners", "Quantum Dev Inc.", "StreamLine Coding"];
const agencies_qc = ["Voyages Québecor", "Agence Globetrotter", "Destination Québec", "Tourisme Élite", "Aventure Boréale", "Escapade Québec", "Voyages Francœur", "Croisières St-Laurent", "Séjours Québec", "Horizon Voyages"];

const techRoles = ["CTO", "Lead Developer", "API Engineer", "Founder", "Tech Lead", "Software Architect", "Full Stack Developer", "Engineering Manager", "Senior Developer", "Technical Director"];
const techStacks = ["Node.js/TypeScript", "Python/Django", "PHP/Laravel", "Ruby on Rails", "Go/Golang", "Java/Spring", "Rust/Actix", "Next.js/React"];

const destinations = ["Paris", "Tokyo", "Bali", "Santorini", "Maldives", "Barcelona", "Rome", "Dubai", "Bora Bora", "New York", "Kyoto", "Phuket", "Cappadocia", "Machu Picchu", "Queenstown", "Reykjavik", "Marrakech", "Positano", "Tulum", "Seychelles"];

const sources = ["facebook", "google", "instagram", "referral", "reddit", "tiktok", "website", "youtube"];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generatePhone(countryCode: string): string {
  if (countryCode.startsWith("+1")) return `+1${Math.floor(Math.random() * 900 + 200)}${Math.floor(Math.random() * 9000000 + 1000000)}`;
  if (countryCode === "+33") return `+33${Math.floor(Math.random() * 700000000 + 100000000)}`;
  if (countryCode === "+44") return `+44${Math.floor(Math.random() * 7000000000 + 1000000000)}`;
  if (countryCode === "+81") return `+81${Math.floor(Math.random() * 9000000000 + 1000000000)}`;
  if (countryCode === "+971") return `+971${Math.floor(Math.random() * 500000000 + 100000000)}`;
  if (countryCode === "+55") return `+55${Math.floor(Math.random() * 90000000000 + 11000000000)}`;
  if (countryCode === "+52") return `+52${Math.floor(Math.random() * 9000000000 + 1000000000)}`;
  if (countryCode === "+49") return `+49${Math.floor(Math.random() * 9000000000 + 1000000000)}`;
  if (countryCode === "+61") return `+61${Math.floor(Math.random() * 900000000 + 100000000)}`;
  return `+1${Math.floor(Math.random() * 900 + 200)}${Math.floor(Math.random() * 9000000 + 1000000)}`;
}

const emailDomains = ["gmail.com", "outlook.com", "yahoo.com", "proton.me", "icloud.com", "hotmail.com", "aol.com", "mail.com"];

function generateEmails(name: string): string[] {
  const base = name.toLowerCase().replace(/[^a-z]/g, "").replace(/\s+/g, ".");
  const domains = [...emailDomains].sort(() => Math.random() - 0.5);
  return [
    `${base}@${domains[0]}`,
    `${base}.travel@${domains[1]}`,
    `${base.slice(0, 3)}${Math.floor(Math.random() * 999)}@${domains[2]}`,
    `${base.split(".")[0]}.${Math.floor(Math.random() * 9999)}@${domains[3]}`,
  ];
}

export interface LocalLead {
  name: string;
  emails: string[];
  email_count: number;
  phone: string;
  country: string;
  source: string;
  destination?: string;
  budget?: string;
  notes?: string;
  lead_type: string;
  agency?: string;
  company?: string;
  city?: string;
  size?: string;
  role?: string;
  tech_stack?: string;
}

export function generateTravelLeads(count: number = 5): LocalLead[] {
  const leads: LocalLead[] = [];
  const countryPools = ["us", "uk", "fr", "ca", "jp", "ae", "br", "mx", "de", "au", "general"];
  for (let i = 0; i < count; i++) {
    const pool = pick(countryPools);
    const name = pick(names[pool as keyof typeof names]);
    const countryMap: Record<string, string> = {
      us: "United States", uk: "United Kingdom", fr: "France", ca: "Canada",
      jp: "Japan", ae: "UAE", br: "Brazil", mx: "Mexico", de: "Germany",
      au: "Australia", general: "Canada",
    };
    const phoneCodes: Record<string, string> = {
      us: "+1", uk: "+44", fr: "+33", ca: "+1", jp: "+81", ae: "+971",
      br: "+55", mx: "+52", de: "+49", au: "+61", general: "+1",
    };
    const budgets = ["$2,000-$5,000", "$5,000-$10,000", "$10,000-$20,000", "$3,000-$8,000", "$8,000-$15,000", "$15,000-$30,000", "$1,000-$3,000"];
    if (pool === "us" && i < 2) {
      const techNames = pick(names.us);
      leads.push({
        name: techNames, emails: generateEmails(techNames), email_count: 4,
        phone: generatePhone("+1"), country: "United States",
        source: pick(sources), lead_type: "travel",
        destination: pick(destinations),
        budget: pick(budgets), notes: "US tech professional — AI/software industry",
      });
    } else {
      leads.push({
        name, emails: generateEmails(name), email_count: 4,
        phone: generatePhone(phoneCodes[pool]), country: countryMap[pool],
        source: pick(sources), lead_type: "travel",
        destination: pick(destinations),
        budget: pick(budgets), notes: "Travel lead — interested in luxury travel",
      });
    }
  }
  return leads;
}

export function generateAgencyLeads(count: number = 3): LocalLead[] {
  const leads: LocalLead[] = [];
  const qcCities = ["Montreal", "Quebec City", "Laval", "Gatineau", "Longueuil", "Sherbrooke", "Saguenay", "Trois-Rivieres"];
  for (let i = 0; i < count; i++) {
    const name = pick(names.qc);
    leads.push({
      name, emails: generateEmails(name), email_count: 4,
      phone: generatePhone("+1"), country: "Quebec, Canada",
      agency: pick(agencies_qc), city: pick(qcCities),
      size: pick(["independant", "small 2-5", "medium 5-20"]),
      source: pick(sources), lead_type: "agency",
      notes: "Agence de voyage québécoise — partenaire potentiel",
    });
  }
  return leads;
}

export function generateZeniPayLeads(count: number = 3): LocalLead[] {
  const cities: Record<string, string[]> = {
    "Canada": ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa"],
    "United States": ["New York", "San Francisco", "Chicago", "Austin", "Miami"],
  };
  const businessTypes = ["travel agency", "hotel", "ecommerce", "SaaS", "fintech", "retail"];
  const leads: LocalLead[] = [];
  for (let i = 0; i < count; i++) {
    const country = pick(["Canada", "United States"]);
    const name = pick([...names.ca, ...names.us, ...names.general]);
    const volume = pick(["$50K-100K/mo", "$100K-500K/mo", "$500K-2M/mo", "$25K-50K/mo"]);
    leads.push({
      name, emails: generateEmails(name), email_count: 4,
      phone: generatePhone("+1"), country, city: pick(cities[country]),
      company: pick(companies_zenipay),
      source: pick(sources), lead_type: "zenipay",
      notes: `Business: ${pick(companies_zenipay)}, Type: ${pick(businessTypes)}, Volume: ${volume}`,
    });
  }
  return leads;
}

export function generateDevLeads(count: number = 3): LocalLead[] {
  const locations = [
    { country: "Canada", city: "Toronto", pool: "ca" },
    { country: "Canada", city: "Vancouver", pool: "ca" },
    { country: "Quebec, Canada", city: "Montreal", pool: "qc" },
    { country: "Quebec, Canada", city: "Quebec City", pool: "qc" },
    { country: "France", city: "Paris", pool: "fr" },
    { country: "France", city: "Lyon", pool: "fr" },
    { country: "France", city: "Bordeaux", pool: "fr" },
  ];
  const leads: LocalLead[] = [];
  for (let i = 0; i < count; i++) {
    const loc = pick(locations);
    const n = pick(names[loc.pool as keyof typeof names]);
    leads.push({
      name: n, emails: generateEmails(n), email_count: 4,
      phone: loc.country === "France" ? generatePhone("+33") : generatePhone("+1"),
      country: loc.country, city: loc.city,
      company: pick(companies_dev),
      role: pick(techRoles), tech_stack: pick(techStacks),
      source: pick(sources), lead_type: "dev",
      notes: `Role: ${pick(techRoles)}, Stack: ${pick(techStacks)}`,
    });
  }
  return leads;
}
