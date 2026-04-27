import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";
const URL_PATH = "/pet-friendly-travel";
export const metadata: Metadata = {
  title: "Pet-Friendly Travel — Resorts, Flights, Vacations With Pets | Zeniva",
  description: "Pet-friendly travel planning with Zeniva. Resorts that welcome pets, airlines for pet travel, road trips with dogs. Real research, not just 'pets welcome' marketing.",
  keywords: ["pet friendly travel", "dog friendly resort", "travel with pet", "airlines pet travel", "pet vacation", "dog travel", "Florida pet friendly resort"],
  openGraph: { title: "Pet-Friendly Travel | Zeniva", description: "Pet-friendly resorts, airlines, road trips. Real planning for travel with pets.", url: `https://www.zenivatravel.com${URL_PATH}`, siteName: "Zeniva Travel", type: "website", images: [{ url: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: "Pet-Friendly Travel — Zeniva" }] },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}` },
};
export default function P() { return (
  <SeoPage h1="Pet-Friendly Travel — Real Research"
    subtitle="Most 'pet-friendly' marketing means a $50/night fee + a small dog bed. Zeniva curates resorts with actual pet amenities — dog walking trails, pet menus, in-room treats — plus the practical stuff (airline policies, weight limits, paperwork)."
    heroImage="https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=1600&q=85" heroGradient="from-amber-900/70 to-emerald-900/60" badge="With dogs welcome"
    sections={[
      { heading: "What pet-friendly actually means", content: `<p>"Pet-friendly" varies wildly. At one end: a hotel that allows pets in 5 specific rooms with a $200 cleaning fee + 25-pound limit. At the other: properties built around pets with dedicated dog beaches, pet menus, on-site groomers, and pet concierge service.</p><p>Zeniva curates the second category — actually pet-welcoming, not just pet-tolerating. We also handle the practical: airline weight/size limits, paperwork (rabies certs, health certificates), pet customs at international destinations, and ground transport that allows pets.</p>` },
      { heading: "Top pet-friendly destinations", content: `<p><strong>Florida (Naples, Sarasota, Sanibel, Keys):</strong> Strong pet-friendly hotel inventory. Naples Bay Resort, LaPlaya, Sundial Sanibel. Many beaches allow leashed dogs.</p><p><strong>Coastal California (Carmel, Mendocino, La Jolla):</strong> Carmel-by-the-Sea is one of America's most dog-friendly towns. Cypress Inn, La Playa Carmel.</p><p><strong>Northeast (Hamptons, Cape Cod, Coastal Maine):</strong> Many B&Bs and inns welcome pets. Wequassett Resort, Castle Hill Inn.</p><p><strong>Mountains (Aspen, Park City, Telluride):</strong> Hotel Jerome (Aspen), Stein Eriksen Lodge (Park City). Mountain trails are dog paradise.</p><p><strong>European destinations (Italy, France, UK):</strong> Italy is exceptionally pet-friendly — most restaurants welcome dogs. UK strict on pet import (need pet passport + 6 months prep).</p>` },
      { heading: "Airline pet travel", content: `<p>Pets in cabin: Allowed on most US carriers if they fit under the seat in a soft carrier (Delta, American, United, JetBlue, Alaska — typically 17-20 lb max combined with carrier). Pet-in-cargo: Larger pets travel in temperature-controlled cargo on Delta, American, United, Alaska. Some restrictions in summer/winter weather.</p><p>For international: rabies certificate (within 1 year), health certificate (within 10 days), microchip, sometimes import permit (UK, Australia, NZ require quarantine prep). Zeniva coordinates with veterinary services for the documentation.</p>` },
    ]}
    highlights={[
      { icon: "star", title: "Genuinely pet-welcoming", description: "Curated resorts with actual pet amenities, not just $50 fees." },
      { icon: "map", title: "Top pet destinations", description: "Florida, Coastal California, Northeast, Mountain towns, Italy." },
      { icon: "phone", title: "Lina AI 24/7", description: "Chat or voice — Lina filters to pet-welcoming options + handles paperwork." },
      { icon: "anchor", title: "Airline policies", description: "We know which airlines/routes work for your pet's size and travel dates." },
      { icon: "shield", title: "International paperwork", description: "Rabies certs, health certs, microchips, import permits coordinated." },
      { icon: "gift", title: "Pet-specific amenities", description: "Dog beds, pet menus, walking services, groomers, dog beaches." },
    ]}
    faqs={[
      { question: "Best pet-friendly resort?", answer: "Wequassett Resort (Cape Cod) — actively dog-welcoming with dog beds, treats, beach access. Cypress Inn (Carmel) — owned by Doris Day, all pets welcome. Hotel Jerome (Aspen) — luxe + dog beds + pet concierge." },
      { question: "Can my dog fly in cabin?", answer: "Most US carriers allow small pets (17-20 lb combined with carrier) under the seat in a soft carrier. International varies — Lufthansa, Air France, KLM more pet-welcoming than US carriers." },
      { question: "Pet paperwork for Europe?", answer: "Rabies certificate (within 1 year), health certificate (within 10 days of travel), microchip. Zeniva coordinates with vet services. UK requires extensive prep — start 6+ months ahead." },
      { question: "Pet-friendly all-inclusive?", answer: "Limited — most all-inclusive resorts don't accept pets due to food service complexity. The exceptions are some boutique Caribbean villas (which we book) and Hotel Xcaret in Mexico (pet-friendly with restrictions)." },
      { question: "Pet sitting at the resort?", answer: "Some properties offer in-room pet sitting; we book this in advance. For day excursions, partner pet day-care services in major destinations." },
    ]}
    ctaText="Plan a Trip With My Pet" ctaPrompt="I'd like to travel with my pet"
    internalLinks={[ { label: "Florida Villas", href: "/florida-villas" }, { label: "Family Vacations", href: "/services/family-vacations" }, { label: "Luxury Travel", href: "/services/luxury-travel" }, { label: "Solo Travel", href: "/solo-travel" } ]}
    jsonLd={{ "@context": "https://schema.org", "@type": "Service", name: "Pet-Friendly Travel Planning", provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, serviceType: "Pet Travel", description: "Pet-friendly travel planning including pet-welcoming resorts, airline coordination, international paperwork, and pet-specific amenities.", areaServed: "Worldwide" }}
  />
); }
