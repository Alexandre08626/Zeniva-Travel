import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All-Inclusive Vacation Service — Mexico, Caribbean, World | Zeniva",
  description: "Book all-inclusive vacations with Zeniva. Mexico, Caribbean, Dominican Republic, Jamaica. Excellence, Iberostar, Hard Rock, Sandals, Beaches. Lina AI quotes in seconds.",
  keywords: ["all-inclusive vacations", "all-inclusive resorts", "all-inclusive Mexico", "all-inclusive Caribbean", "Sandals", "Beaches", "Excellence", "Iberostar", "Hard Rock all-inclusive"],
  openGraph: { title: "All-Inclusive Vacations | Zeniva", description: "Mexico, Caribbean, all major all-inclusive brands. Real bookings via Lina AI.", url: "https://www.zenivatravel.com/services/all-inclusive", siteName: "Zeniva Travel", type: "website", images: [{ url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: "All-Inclusive Vacations — Zeniva" }] },
  alternates: { canonical: "https://www.zenivatravel.com/services/all-inclusive" },
};

export default function AllInclusiveServicePage() {
  return (
    <SeoPage
      h1="All-Inclusive Vacation Specialists"
      subtitle="Mexico, Caribbean, Dominican Republic, Jamaica — every major all-inclusive brand bookable with Lina AI in seconds. Real prices, real availability, real human advisor backup."
      heroImage="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-cyan-900/70 to-emerald-900/60"
      badge="200+ resorts, all major brands"
      sections={[
        { heading: "Every all-inclusive brand bookable through Zeniva", content: `<p>Zeniva books across every major all-inclusive resort brand: Excellence Resorts, Iberostar, Hard Rock Hotels, Hyatt Ziva/Zilara, Karisma (Azul, El Dorado, Generations), Sandals, Beaches, Couples, Palace Resorts, Riu, Bahia Principe, Barcelo, Secrets, Dreams, Now, Reflect, Zoëtry, Atelier, Hotel Xcaret, Grand Velas, Le Blanc.</p><p>For every booking, Lina AI compares live prices across our partner network (LiteAPI, direct supplier deals) and gives you 3-5 vetted options matching your dates, group size, and budget. Most all-inclusive packages from US gateways start around $899-1,500 per person for 4-5 nights including flights.</p>` },
        { heading: "Top all-inclusive destinations", content: `<p><strong>Cancún & Riviera Maya:</strong> The largest all-inclusive market globally. Hyatt Ziva, Excellence Riviera Cancun, Hard Rock Riviera Maya, Hotel Xcaret Arte (adults-only with park access), Le Blanc Spa Resort.</p><p><strong>Punta Cana, Dominican Republic:</strong> Hard Rock Punta Cana, Excellence Punta Cana, Sanctuary Cap Cana, Sandals Royal Bavaro, Iberostar Grand Bavaro.</p><p><strong>Jamaica:</strong> Sandals Royal Caribbean, Couples Sans Souci, Beaches Negril, Hard Rock Hotel Riviera Maya extension.</p><p><strong>Other Caribbean:</strong> Sandals St. Lucia, Sandals Antigua, Beaches Turks and Caicos.</p>` },
        { heading: "Adults-only vs family vs couples", content: `<p><strong>Adults-only (18+):</strong> Excellence, Secrets, Zoëtry, Hotel Xcaret Arte, Le Blanc, Hard Rock Heaven section, Iberostar Grand. Quieter, no kids, often higher service standards.</p><p><strong>Family-friendly:</strong> Beaches (Sandals' family brand), Hard Rock Family Suites, Iberostar Family, Hyatt Ziva, Karisma Generations, Atlantis Bahamas. Kids' clubs, water parks, supervised activities.</p><p><strong>Couples-only:</strong> Sandals (Caribbean), Couples (Jamaica). Designed specifically for couples — no families.</p>` },
        { heading: "What's included (and what isn't)", content: `<p>Standard all-inclusive packages include: room, all meals (often multiple à la carte restaurants), most drinks (wine, beer, spirits), non-motorized water sports, fitness center, daily entertainment, taxes, and tips at the resort.</p><p>Typically NOT included: airport transfers (we add these), spa treatments, premium experiences (cabanas, fine-dining wine pairings), excursions off-property, motorized water sports, gratuity for personal services. Lina will tell you exactly what's included before you book.</p>` },
      ]}
      highlights={[
        { icon: "star", title: "Every major brand", description: "Excellence, Iberostar, Hard Rock, Sandals, Beaches, Karisma, Palace Resorts, Hyatt Ziva, Hotel Xcaret." },
        { icon: "gift", title: "Flights + Hotel + Transfers", description: "Bundled into one transparent price. No hidden fees." },
        { icon: "phone", title: "Lina AI 24/7", description: "Chat or voice — personalized package in seconds." },
        { icon: "users", title: "Adults / Family / Couples", description: "Lina matches you to the right resort tier and category." },
        { icon: "shield", title: "24/7 In-Trip Support", description: "Real human advisor reachable from anywhere if anything goes wrong." },
        { icon: "map", title: "Negotiated rates", description: "Group + supplier-direct rates often beat what you'd find on consumer OTAs." },
      ]}
      faqs={[
        { question: "What's the cheapest all-inclusive vacation?", answer: "Cancún or Punta Cana from major US gateways start around $899 per person for 4 nights all-inclusive including flights. Cabo and Dominican Republic similar." },
        { question: "Are gratuities included?", answer: "At the resort, yes — tips for restaurant staff and bartenders are part of the all-inclusive. Spa, excursions, and exceptional service typically warrant additional gratuity." },
        { question: "Can I get a deal on adults-only?", answer: "Yes — Excellence Playa Mujeres, Iberostar Grand, Secrets all have promotions year-round. Lina watches for them." },
        { question: "Best brand for families?", answer: "Beaches Turks and Caicos consistently ranks #1 for families. Hard Rock Family Suites, Iberostar Family, Hyatt Ziva are also strong." },
        { question: "Can I do a destination wedding at an all-inclusive?", answer: "Yes — most brands offer wedding packages. See our /services/destination-weddings page for full coordination." },
      ]}
      ctaText="Find My All-Inclusive Resort"
      ctaPrompt="I want an all-inclusive vacation"
      internalLinks={[
        { label: "All-Inclusive Mexico packages", href: "/packages/all-inclusive" },
        { label: "Cancun packages", href: "/packages/cancun" },
        { label: "Caribbean destinations", href: "/destinations/caribbean" },
        { label: "Mexico destinations", href: "/destinations/mexico" },
        { label: "Family Vacations", href: "/services/family-vacations" },
        { label: "Destination Weddings", href: "/services/destination-weddings" },
      ]}
      jsonLd={{ "@context": "https://schema.org", "@type": "Service", name: "All-Inclusive Vacation Booking", provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, serviceType: "All-Inclusive Vacation", description: "All-inclusive vacation booking across every major resort brand in Mexico, Caribbean, Dominican Republic, Jamaica.", areaServed: "Worldwide" }}
    />
  );
}
