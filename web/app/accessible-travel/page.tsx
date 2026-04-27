import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accessible Travel — ADA-Compliant Resorts & Destinations | Zeniva",
  description: "Accessible travel planning with Zeniva. Wheelchair-accessible resorts, accessible cruises, mobility-friendly destinations. Real research, not marketing claims.",
  keywords: ["accessible travel", "wheelchair accessible resort", "ADA travel", "accessible cruise", "disability friendly travel", "mobility accessible vacation"],
  openGraph: { title: "Accessible Travel | Zeniva", description: "Wheelchair-accessible resorts and accessible cruises with verified accommodations.", url: "https://www.zenivatravel.com/accessible-travel", siteName: "Zeniva Travel", type: "website", images: [{ url: "https://images.unsplash.com/photo-1517898717281-8e4385a41802?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: "Accessible Travel — Zeniva" }] },
  alternates: { canonical: "https://www.zenivatravel.com/accessible-travel" },
};

export default function AccessibleTravelPage() {
  return (
    <SeoPage
      h1="Accessible Travel — Verified Accommodations"
      subtitle="Most 'wheelchair accessible' marketing falls apart on inspection. Zeniva verifies the actual accessibility of resorts, cruises, and destinations — measured doorways, transfer-equipped pools, beach wheelchairs, and accessible transfers."
      heroImage="https://images.unsplash.com/photo-1517898717281-8e4385a41802?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-emerald-900/70 to-blue-900/60"
      badge="Verified, not just claimed"
      sections={[
        { heading: "What 'accessible' actually means at Zeniva", content: `<p>The word "accessible" is overused and under-verified in travel marketing. Many resorts claim accessible rooms but mean a single sliding shower door + grab bar — not enough for many travelers. Zeniva's accessible travel team has verified the actual specs at major properties: doorway widths (32"+ standard, 36" for power chairs), shower configurations (roll-in, transfer bench, hand-held), bed heights, transfer equipment availability.</p><p>For cruises specifically, we know which lines have transfer chairs at every pool, which excursions are accessible vs require walking, and which ports have accessible shore tours.</p>` },
        { heading: "Best accessible resort destinations", content: `<p><strong>Beaches Turks and Caicos:</strong> One of the few all-inclusive resorts with full ADA compliance + the Sesame Street partnership for kids with autism. Beach wheelchairs available. Pool transfer chairs. Accessible rooms in every village.</p><p><strong>Walt Disney World resorts and Disney Cruise Line:</strong> Industry leaders in accessibility. Magic Kingdom + EPCOT + Hollywood Studios + Animal Kingdom all wheelchair-accessible. Disney Cruise Line ships have accessible cabins, transfer-equipped pools, ramped accessible excursions.</p><p><strong>Hyatt Ziva Cancun:</strong> Roll-in showers in select rooms, beach access ramps, accessible pool transfers.</p><p><strong>Atlantis Paradise Island Bahamas:</strong> ADA-compliant rooms, beach wheelchairs, accessible water park areas.</p><p><strong>Royal Caribbean and Norwegian:</strong> Two of the most accessible cruise lines. Multiple cabin categories with roll-in showers, automatic doors, and pool transfer chairs.</p>` },
        { heading: "Accessible cruise specifics", content: `<p>Cruise lines vary dramatically in accessibility. Royal Caribbean and Norwegian lead — most ships have multiple ADA-compliant cabin categories, transfer chairs at every pool, and accessible shore excursions in 70%+ of ports. Holland America, Princess, and Celebrity are also strong. Older ships (some Carnival, MSC) have limited accessible cabins.</p><p>Cruise booking tip: ADA-compliant cabins sell out 12+ months ahead for popular sailings. Book early. Specify the specific accessibility need — wheelchair-only rolling, walker, deaf/HOH (visual alarms available), low vision (braille menus on some lines).</p>` },
        { heading: "Accessible transfers and ground", content: `<p>Airport transfers in destination countries are often the weakest link — wheelchair-accessible vans require advance booking, especially in Mexico, Caribbean, and Europe. Zeniva books accessible transfers at every booking when needed. For destination weddings or group trips with accessible needs, we coordinate accessible coach services.</p><p>For mobility devices: most airlines transport personal wheelchairs free + provide loaner aisle chairs. We confirm specifics with the carrier and resort before travel.</p>` },
      ]}
      highlights={[
        { icon: "star", title: "Verified accessibility", description: "We verify actual specs (doorway widths, shower types, transfer equipment) — not just marketing claims." },
        { icon: "anchor", title: "Accessible cruises", description: "Royal Caribbean, Norwegian, Holland America — verified ADA cabins + accessible shore excursions." },
        { icon: "users", title: "Family-friendly accessible", description: "Beaches TC + Disney for accessible family travel." },
        { icon: "phone", title: "Lina AI 24/7", description: "Specify needs in chat — Lina filters to verified accessible options." },
        { icon: "shield", title: "Accessible transfers", description: "Wheelchair-accessible airport pickups + ground transport coordinated." },
        { icon: "map", title: "Multi-need coordination", description: "Mobility, vision, hearing, autism-friendly — we research each property's specific accommodations." },
      ]}
      faqs={[
        { question: "Best accessible all-inclusive resort?", answer: "Beaches Turks and Caicos leads — full ADA compliance + autism-friendly programming. Hyatt Ziva Cancun and Atlantis Paradise Island also strong." },
        { question: "Most accessible cruise line?", answer: "Royal Caribbean and Norwegian lead with multiple ADA cabin categories per ship + accessible shore excursions in most ports. Holland America and Princess also strong." },
        { question: "Are airport transfers accessible?", answer: "We book wheelchair-accessible transfers at every booking when needed. In Mexico, Caribbean, and Europe these require advance reservation — we handle." },
        { question: "When should I book accessible cabins on cruises?", answer: "12+ months ahead for popular sailings. ADA-compliant cabins are limited inventory and sell out fastest." },
        { question: "Special needs beyond mobility?", answer: "We coordinate for vision (braille menus, audio descriptions), hearing (visual alarms, sign language interpreters), autism (sensory-friendly programs at Beaches, Universal, Disney), and dietary (medical-grade allergen handling)." },
      ]}
      ctaText="Plan an Accessible Trip"
      ctaPrompt="I need accessible travel planning"
      internalLinks={[
        { label: "Cruises", href: "/services/cruises" },
        { label: "Family Vacations", href: "/services/family-vacations" },
        { label: "Senior Travel", href: "/senior-travel" },
        { label: "All-Inclusive", href: "/services/all-inclusive" },
        { label: "Group Travel", href: "/services/group-travel" },
      ]}
      jsonLd={{ "@context": "https://schema.org", "@type": "Service", name: "Accessible Travel Planning", provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, serviceType: "Accessible Travel", description: "Verified accessible travel planning including wheelchair-accessible resorts, accessible cruises, accessible transfers and multi-need coordination.", areaServed: "Worldwide" }}
    />
  );
}
