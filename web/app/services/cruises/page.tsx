import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cruise Planning — Caribbean, Mediterranean, Alaska Cruises | Zeniva",
  description:
    "Book a cruise with Zeniva. Caribbean, Mediterranean, Alaska, Northern Europe, Asia. Major cruise lines, river cruises, and luxury small-ship expeditions.",
  keywords: [
    "cruise booking", "cruise planning", "Caribbean cruise", "Mediterranean cruise",
    "Alaska cruise", "river cruise Europe", "luxury cruise", "Disney cruise",
    "Royal Caribbean", "Norwegian cruise", "Celebrity cruises", "Viking cruises",
  ],
  openGraph: {
    title: "Cruise Planning Worldwide | Zeniva",
    description: "Caribbean, Mediterranean, Alaska, river, expedition cruises. All major lines plus luxury small-ship.",
    url: "https://www.zenivatravel.com/services/cruises",
    siteName: "Zeniva Travel",
    type: "website",
    images: [{ url: "https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: "Cruise Planning — Zeniva" }],
  },
  alternates: { canonical: "https://www.zenivatravel.com/services/cruises" },
};

export default function CruisesPage() {
  return (
    <SeoPage
      h1="Cruise Planning Worldwide"
      subtitle="From 7-night Caribbean sailings to month-long world cruises — Zeniva books every major line plus luxury small-ship and expedition cruises."
      heroImage="https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-blue-900/70 to-cyan-900/60"
      badge="All Major Lines + Luxury Small-Ship"
      sections={[
        {
          heading: "Why Book Your Cruise Through Zeniva",
          content: `<p>Cruise pricing is opaque, promotions change daily, and the difference between a great cabin and a noisy one can be a few feet. Zeniva's cruise team books across every major line — Royal Caribbean, Carnival, Norwegian, Disney, MSC, Celebrity, Princess, Holland America — plus the luxury and expedition operators (Viking, Seabourn, Silversea, Regent, Crystal, Ponant, Lindblad, Hurtigruten).</p>
<p>Because we book volume, we receive group rates, onboard credit promotions, free upgrades, and added perks (drinks packages, dining packages, gratuity prepaid) that aren't always available when booking direct. Lina AI compares pricing across lines for your dates and destination, then presents the 3 to 5 best options with the actual after-perks total — not the misleading per-night rate cruise sites lead with.</p>`,
        },
        {
          heading: "Caribbean Cruises",
          content: `<p>The Caribbean is the world's largest cruise market. From Florida ports (Miami, Port Canaveral, Fort Lauderdale, Tampa) you can sail to the Bahamas, Eastern Caribbean (St. Thomas, St. Maarten), Western Caribbean (Cozumel, Grand Cayman, Jamaica), or Southern Caribbean (Aruba, Curaçao, Barbados). Sailings run year-round with peak season December through April.</p>
<p>For families, Disney Cruise Line and Royal Caribbean's Oasis-class ships offer the most onboard activities. Couples often prefer Celebrity, Princess, or Holland America for a calmer atmosphere. Norwegian's freestyle dining suits travelers who hate fixed schedules. Zeniva's cruise advisors will match your group to the right line — not just sell you whatever has commission.</p>`,
        },
        {
          heading: "Mediterranean & European Cruises",
          content: `<p>European cruise season runs roughly April through October. Mediterranean itineraries from Rome (Civitavecchia), Barcelona, Venice, or Athens hit highlights like the Amalfi Coast, the French Riviera, the Greek Islands, Croatia, Malta, and Sicily. Northern European cruises (the Baltic and the Norwegian Fjords) launch from Copenhagen, Stockholm, Hamburg, and Southampton.</p>
<p>European river cruises — Viking, AmaWaterways, Avalon, Uniworld — operate on the Rhine, Danube, Rhône, Douro, and beyond. River cruise pricing is higher per night than ocean cruises but typically all-inclusive (drinks, excursions, gratuities). Most rivers cruises run 7 to 14 nights with one-way itineraries between two cities.</p>`,
        },
        {
          heading: "Alaska, Expedition & World Cruises",
          content: `<p>Alaska cruises run May through September from Seattle and Vancouver. The most popular itineraries include Glacier Bay, Hubbard Glacier, the Inside Passage, and ports of call at Juneau, Skagway, and Ketchikan. Princess and Holland America have the strongest Alaska presence; Disney operates a few Alaska sailings; Lindblad and Ponant offer small-ship expeditions that reach places the big ships can't.</p>
<p>For expedition cruising — the Galápagos, Antarctica, the Arctic, the Amazon — small ships are essential. Zeniva books Lindblad/National Geographic, Ponant, Silversea Expeditions, Hurtigruten, and Atlas Ocean Voyages. World cruises (90 to 180 nights, one full circumnavigation) book 18 months ahead and sell out quickly — Cunard's Queen Victoria, Holland America's Volendam, and Viking's Star Pride are the most established options.</p>`,
        },
      ]}
      highlights={[
        { icon: "anchor", title: "Every Major Line", description: "Royal Caribbean, Norwegian, Carnival, Disney, Princess, Holland America, MSC, Celebrity — plus all the luxury operators." },
        { icon: "gift", title: "Group Rates & Perks", description: "Onboard credit, free drink packages, prepaid gratuities, and complimentary upgrades from our group bookings." },
        { icon: "map", title: "Itinerary Matching", description: "Lina compares lines, ships, and dates against your priorities — not just whatever pays the highest commission." },
        { icon: "shield", title: "Cabin Selection", description: "We know which cabins on which ships have noise, vibration, or obstructed views — and which are quietly the best on board." },
        { icon: "phone", title: "Pre & Post Hotels", description: "Embarkation hotels, port transfers, and any pre/post-cruise extensions handled on the same itinerary." },
        { icon: "users", title: "Group Bookings", description: "Multi-cabin family bookings, milestone birthdays, and corporate groups — coordinated end-to-end." },
      ]}
      faqs={[
        { question: "How much does a cruise cost?", answer: "Caribbean cruises start under $500 per person for an interior cabin on a budget line. A balcony on Royal Caribbean or Norwegian typically runs $900 to $1,500 per person for a 7-night Caribbean. Luxury lines (Seabourn, Regent, Silversea) start around $4,000 per person and include almost everything (drinks, excursions, gratuities)." },
        { question: "Are gratuities and drinks included?", answer: "On mainstream lines, no — gratuities are added daily ($16–$18/person/day) and drinks are à la carte unless you buy a package. On luxury and most river cruise lines, drinks and gratuities are typically included. Always read the fine print; Zeniva will tell you the actual all-in cost." },
        { question: "Can you book shore excursions through Zeniva?", answer: "Yes. We book through the cruise line (more expensive but guaranteed return-to-ship) or through trusted independent operators in each port (often half the price for the same tour). Both have tradeoffs — your advisor will explain." },
        { question: "What about travel insurance?", answer: "Strongly recommended for cruises, especially given recent cancellations and itinerary changes. We quote and book trip insurance covering cancellation, medical, and lost baggage as part of the booking." },
        { question: "When should I book a cruise?", answer: "12 to 18 months ahead for peak weeks (Christmas/New Year Caribbean, summer Mediterranean, Alaska peak summer). Last-minute deals exist for off-peak sailings, but cabin selection is poor and you may pay full price for hotels and flights." },
      ]}
      ctaText="Find My Cruise"
      ctaPrompt="I'd like to plan a cruise"
      internalLinks={[
        { label: "Caribbean Destinations", href: "/destinations/caribbean" },
        { label: "Europe Destinations", href: "/destinations/europe" },
        { label: "Yacht Charter", href: "/services/yacht-charter" },
        { label: "Group Travel", href: "/services/group-travel" },
      ]}
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Cruise Planning Service",
        provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" },
        serviceType: "Cruise Booking",
        description: "Cruise booking across all major ocean, river, and expedition lines — Caribbean, Mediterranean, Alaska, Northern Europe, Asia, and worldwide.",
        areaServed: "Worldwide",
      }}
    />
  );
}
