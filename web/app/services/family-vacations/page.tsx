import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Family Vacation Packages — All-Inclusive, Disney, Beaches | Zeniva",
  description: "Plan your family vacation with Zeniva. Beaches Turks & Caicos, Hard Rock, Disney Cruise, Atlantis Bahamas, Riviera Maya. Kids' clubs, family suites, multi-gen options.",
  keywords: ["family vacation packages", "all-inclusive family resort", "Beaches Turks and Caicos", "Disney Cruise family", "Atlantis Bahamas", "family Mexico vacation", "kid-friendly resort"],
  openGraph: { title: "Family Vacation Packages | Zeniva", description: "Top family resorts and cruises. Kids' clubs, family suites, multi-gen.", url: "https://www.zenivatravel.com/services/family-vacations", siteName: "Zeniva Travel", type: "website", images: [{ url: "https://images.unsplash.com/photo-1502136969935-8d8eef54d77b?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: "Family Vacations — Zeniva" }] },
  alternates: { canonical: "https://www.zenivatravel.com/services/family-vacations" },
};

export default function FamilyVacationsPage() {
  return (
    <SeoPage
      h1="Family Vacation Specialists"
      subtitle="Beaches Turks and Caicos, Hard Rock Family Suites, Disney Cruise Line, Atlantis Bahamas, Hyatt Ziva — Lina matches your family to the right property and handles the multi-generational logistics."
      heroImage="https://images.unsplash.com/photo-1502136969935-8d8eef54d77b?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-amber-900/70 to-cyan-900/60"
      badge="Multi-gen friendly"
      sections={[
        { heading: "What makes a family resort actually work", content: `<p>Family travel has 4 hard logistics: room configuration that sleeps everyone, meal service that handles picky eaters, kids' programming that's actually engaging, and adult time without abandoning the kids. The best family resorts solve all four. Many marketing themselves as "family-friendly" only solve one or two.</p><p>Zeniva's family travel team has personally vetted the top 30 family resorts globally. We know which ones have noisy pool areas at 7am (good if your kids wake early), which kids' clubs include lunch (matters for parents), and which suites actually fit 2 adults + 2 kids comfortably (some "family suites" are just regular rooms with a sofa bed).</p>` },
        { heading: "Top family resort recommendations", content: `<p><strong>Beaches Turks and Caicos:</strong> Consistently the #1 family all-inclusive globally. Sesame Street partnership, water park, full kids' programs by age, multiple pools.</p><p><strong>Hard Rock Punta Cana / Cancun / Riviera Maya:</strong> Family Suites with separate kids' rooms, water parks, kid-friendly menus. Adults still get the Hard Rock vibe.</p><p><strong>Hyatt Ziva Cancun:</strong> Peninsula location with beaches on three sides, KidZ Club, family-friendly restaurants, water park.</p><p><strong>Iberostar Family (Cancun, Riviera Maya, DR):</strong> Star Camp kids' programs, lazy rivers, wave pools.</p><p><strong>Atlantis Paradise Island, Bahamas:</strong> Aquaventure water park, dolphin encounters, marine habitats.</p><p><strong>Hotel Xcaret (Riviera Maya):</strong> Includes access to all 6 Xcaret parks — best activity-included family option in Mexico.</p>` },
        { heading: "Disney Cruise Line (the gold standard for family cruising)", content: `<p>Disney Cruise Line is unmatched for families with kids. 4 ships, multiple itineraries (Caribbean, Bahamas, Alaska, Europe), characters on board, age-appropriate kids' clubs, no-cost rotational dining, and the famous Aqua Mouse water coaster on Wish-class ships. Zeniva books across all 4 Disney ships and pre-cruise hotels at Disney resorts.</p>` },
        { heading: "Multi-generational trips", content: `<p>For trips with grandparents + parents + kids, Zeniva sources properties with adjacent rooms or villas with multiple bedrooms. Beaches Turks and Caicos has 4-5 bedroom villas. Many Riviera Maya properties have multi-room family suites. Private villas are often the best option for groups of 8+ — see our /services/villa-rental page.</p>` },
      ]}
      highlights={[
        { icon: "star", title: "Vetted family resorts", description: "Top 30 family properties globally — personally checked." },
        { icon: "users", title: "Multi-gen trips", description: "Adjacent rooms, multi-bedroom suites, private villas for grandparents + parents + kids." },
        { icon: "anchor", title: "Disney Cruise expert", description: "All 4 Disney ships + Caribbean/Bahamas/Alaska/Europe routes." },
        { icon: "phone", title: "Lina AI 24/7", description: "Chat or voice — Lina handles the kid logistics so you don't have to." },
        { icon: "gift", title: "Kids stay free deals", description: "We watch for promotions — many resorts include kids' meals, activities, sometimes flights." },
        { icon: "shield", title: "24/7 In-Trip Support", description: "Real human reachable when something goes wrong with kids in tow." },
      ]}
      faqs={[
        { question: "Best family all-inclusive in the Caribbean?", answer: "Beaches Turks and Caicos consistently ranks #1 globally. Sesame Street partnership, full water park, age-segmented kids' clubs, multiple restaurants." },
        { question: "Best family resort in Mexico?", answer: "Hyatt Ziva Cancun (peninsula location, water park, KidZ Club) and Hotel Xcaret (includes 6 parks) are both excellent. Hard Rock Riviera Maya for kids who like an active vibe." },
        { question: "Best family cruise?", answer: "Disney Cruise Line for ages 4-12. Royal Caribbean Oasis-class ships for teens. Norwegian for flexible dining." },
        { question: "Can you book multi-generational trips?", answer: "Yes — adjacent rooms, multi-bedroom suites, or private villas (often best for 8+). We handle group air rates and room blocks." },
        { question: "Do kids stay free?", answer: "Some resorts have kids-free promotions seasonally (Hard Rock, Iberostar, Hyatt Ziva). Lina watches for them when you book." },
      ]}
      ctaText="Plan Our Family Vacation"
      ctaPrompt="I'm planning a family vacation"
      internalLinks={[
        { label: "All-Inclusive", href: "/services/all-inclusive" },
        { label: "Cruises", href: "/services/cruises" },
        { label: "Villa Rental (multi-gen)", href: "/services/villa-rental" },
        { label: "Caribbean destinations", href: "/destinations/caribbean" },
        { label: "Cancun packages", href: "/packages/cancun" },
      ]}
      jsonLd={{ "@context": "https://schema.org", "@type": "Service", name: "Family Vacation Planning", provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, serviceType: "Family Travel", description: "Family vacation booking across all-inclusive resorts, Disney Cruise Line, multi-gen villas, and family-friendly luxury properties.", areaServed: "Worldwide" }}
    />
  );
}
