import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Destination Weddings — Caribbean, Mexico, Italy, Greece | Zeniva",
  description:
    "Plan your destination wedding with Zeniva. Caribbean, Mexico, Italy, Greece, Bali. Venue sourcing, group flights, room blocks, vendors, and welcome bags handled.",
  keywords: [
    "destination wedding", "destination wedding planner", "destination wedding Caribbean",
    "destination wedding Mexico", "destination wedding Italy", "destination wedding Greece",
    "all-inclusive wedding resort", "wedding group travel", "wedding room block",
    "wedding planner USA", "elopement abroad",
  ],
  openGraph: {
    title: "Destination Weddings Worldwide | Zeniva",
    description: "Venues, group flights, room blocks, vendors. Caribbean, Mexico, Italy, Greece, Bali. Coordinated by Zeniva.",
    url: "https://www.zenivatravel.com/services/destination-weddings",
    siteName: "Zeniva Travel",
    type: "website",
    images: [{ url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: "Destination Weddings — Zeniva" }],
  },
  alternates: { canonical: "https://www.zenivatravel.com/services/destination-weddings" },
};

export default function DestinationWeddingsPage() {
  return (
    <SeoPage
      h1="Destination Weddings Worldwide"
      subtitle="Venue sourcing, group flights, room blocks, vendor coordination, welcome bags, and excursions for your guests — Zeniva handles the travel side so your planner can focus on the day."
      heroImage="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-rose-900/70 to-amber-900/60"
      badge="Group Travel Specialists"
      sections={[
        {
          heading: "What Zeniva Handles for Destination Weddings",
          content: `<p>A destination wedding is two events stacked on top of each other: the wedding itself and a multi-day trip for 20 to 200 guests. Most wedding planners handle the day. Few handle the travel — group flight blocks, room rates, transfers, welcome bags, group excursions, late arrivals, and the inevitable changes when a flight gets canceled.</p>
<p>Zeniva specializes in the travel side. Once you've chosen a venue and date, our wedding-group team negotiates a room block at the resort or partner hotels, sources group air rates for your guest list, builds a custom RSVP and booking site, manages payments, coordinates pre/post excursions, and arranges welcome bags or care packages for arriving guests. Your planner stays focused on the ceremony and reception.</p>`,
        },
        {
          heading: "Top Wedding Destinations We Cover",
          content: `<p><strong>Mexico:</strong> Riviera Maya, Cancún, Playa del Carmen, Tulum, Los Cabos. All-inclusive resort weddings dominate here — Excellence, Iberostar, Karisma, Hard Rock, Palace Resorts. Most all-inclusive packages include the ceremony fee, basic décor, and a discounted room block when a minimum number of guests book.</p>
<p><strong>Caribbean:</strong> Jamaica (Sandals, Couples), Dominican Republic (Punta Cana, Cap Cana), Turks and Caicos, St. Lucia, Bahamas. Sandals and Couples specialize in adults-only weddings; Beaches handles family-friendly multigenerational events.</p>
<p><strong>Italy & Greece:</strong> Amalfi Coast, Lake Como, Tuscany, Capri, Santorini, Mykonos, Crete. Villa weddings are popular for smaller groups (20–80 guests). Larger weddings work better at hotels with event facilities. Local civil ceremonies in Italy and Greece have specific paperwork — your planner and Zeniva will walk you through it.</p>
<p><strong>Bali, Thailand, Maldives:</strong> Strong choices for adventurous couples. Bali villas and Phuket resorts handle weddings of 30 to 150. Maldives weddings tend to be intimate (10–30 guests) due to logistics and cost — many resorts have dedicated wedding pavilions over the water.</p>`,
        },
        {
          heading: "Group Flights & Room Blocks",
          content: `<p>For weddings with 20+ guests, group air rates can save $100 to $400 per ticket compared to individual booking, and they lock pricing for your guests months in advance. Zeniva works with airlines on group fare contracts (typically 10+ travelers from the same origin city), and we handle name changes, late additions, and the inevitable cancellations.</p>
<p>Room blocks at the resort give your guests a discounted rate (typically 15–30% off published) and let everyone stay in the same place. We negotiate the block, set up a dedicated booking link, and manage the rooming list. Most resorts offer perks once the block hits a minimum (e.g., complimentary suite for the couple, welcome reception, or discounted spa treatments).</p>`,
        },
        {
          heading: "Welcome Bags, Excursions & Logistics",
          content: `<p>The little touches turn a wedding trip into a memorable experience. We coordinate welcome bags delivered to each guest's room on arrival (water, snacks, hangover kit, custom map, schedule). We arrange group excursions — catamaran day, cenote tour, wine tasting, golf — at group rates. We handle airport transfers in shared shuttles or private cars depending on the budget.</p>
<p>For the rehearsal dinner and after-events, we book restaurants, beach setups, or villa caterers. For elderly or mobility-limited guests, we arrange specific room locations and transfer assistance. Late arrivals, missed connections, and lost luggage during the wedding week — we have a 24/7 contact during the trip to handle every issue without bothering the couple.</p>`,
        },
      ]}
      highlights={[
        { icon: "users", title: "Group Air Contracts", description: "10+ travelers from the same origin? We can lock group fares 12 months ahead with name-change flexibility." },
        { icon: "home", title: "Negotiated Room Blocks", description: "15–30% off published rates plus complimentary perks for the couple at most major resorts." },
        { icon: "gift", title: "Welcome Bags & Touches", description: "Custom welcome bags, schedules, maps, and care packages delivered to each guest's room on arrival." },
        { icon: "map", title: "Group Excursions", description: "Catamarans, golf, spa, wine tours — booked at group rates and coordinated around your wedding schedule." },
        { icon: "phone", title: "24/7 Wedding-Week Concierge", description: "Dedicated Zeniva contact during the trip to handle missed flights, cabin changes, and any guest emergencies." },
        { icon: "shield", title: "RSVP & Payment Management", description: "Custom booking site, RSVP tracking, payment plans, and rooming list — your planner sees a single dashboard." },
      ]}
      faqs={[
        { question: "Do I need a wedding planner if I book through Zeniva?", answer: "Yes. Zeniva handles the travel side — flights, hotels, transfers, excursions, group logistics. You still need a wedding planner (often included with all-inclusive resort wedding packages, or hired separately for villa weddings) to handle the ceremony, reception, vendors, and decor." },
        { question: "How much does a destination wedding cost?", answer: "All-inclusive resort weddings in Mexico or the Caribbean can run $5,000 to $15,000 for the ceremony and basic reception (excluding guests' rooms and travel). Villa weddings in Italy or Greece typically start at $30,000 for the venue alone, plus catering. Group travel (flights + rooms) is separate and varies wildly by location and guest count." },
        { question: "Can guests pay individually?", answer: "Yes. We set up a custom booking site where each guest reserves and pays for their own room and flight at the negotiated group rate. The couple isn't on the hook for guests' travel costs unless they choose to subsidize." },
        { question: "What about marriage paperwork abroad?", answer: "Each country has different requirements. Mexico and most Caribbean destinations make it relatively easy (some require a few extra days in-country before the ceremony). Italy and Greece have stricter civil ceremony requirements — many couples do a legal ceremony at home and a symbolic ceremony abroad." },
        { question: "How far in advance should we book?", answer: "12 to 18 months for peak season (December–April Caribbean, May–September Europe). Allow 9–12 months minimum for guests to plan and budget. Save-the-dates should go out 8–12 months ahead." },
      ]}
      ctaText="Plan Our Wedding Trip"
      ctaPrompt="We're planning a destination wedding"
      internalLinks={[
        { label: "Honeymoon Packages", href: "/services/honeymoon" },
        { label: "Group Travel", href: "/services/group-travel" },
        { label: "Caribbean Destinations", href: "/destinations/caribbean" },
        { label: "Mexico Destinations", href: "/destinations/mexico" },
      ]}
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Destination Wedding Travel Planning",
        provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" },
        serviceType: "Destination Wedding",
        description: "Group travel coordination for destination weddings — venue sourcing, group flights, room blocks, vendor coordination, welcome bags, and excursions.",
        areaServed: "Worldwide",
      }}
    />
  );
}
