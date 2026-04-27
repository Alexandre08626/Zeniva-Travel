import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Yacht Charter Service — Private & Crewed Yachts Worldwide | Zeniva",
  description:
    "Charter a private yacht with Zeniva. Crewed catamarans and superyachts in the Caribbean, Mediterranean, and South Pacific. Lina AI sources options in 24h.",
  keywords: [
    "yacht charter", "private yacht charter", "crewed yacht charter", "luxury yacht charter",
    "yacht charter Caribbean", "yacht charter Mediterranean", "yacht charter Bahamas",
    "yacht charter BVI", "superyacht charter USA", "catamaran charter",
  ],
  openGraph: {
    title: "Yacht Charter Service Worldwide | Zeniva",
    description: "Crewed catamarans, motor yachts and superyachts. Caribbean, Mediterranean, South Pacific. Sourced by Lina AI.",
    url: "https://www.zenivatravel.com/services/yacht-charter",
    siteName: "Zeniva Travel",
    type: "website",
    images: [{ url: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: "Yacht Charter — Zeniva" }],
  },
  alternates: { canonical: "https://www.zenivatravel.com/services/yacht-charter" },
};

export default function YachtCharterPage() {
  return (
    <SeoPage
      h1="Private Yacht Charter Worldwide"
      subtitle="Crewed yachts, catamarans, and superyachts in the world's most beautiful sailing destinations — sourced and booked by Lina AI in 24 hours."
      heroImage="https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-cyan-900/70 to-blue-900/60"
      badge="Crewed & Bareboat"
      sections={[
        {
          heading: "How Yacht Charter Works at Zeniva",
          content: `<p>Booking a private yacht used to mean weeks of back-and-forth with brokers, opaque pricing, and decisions made on incomplete information. Zeniva rebuilt the experience around speed and clarity. You tell Lina AI when you want to sail, where, and the size of your group — within 24 hours, you receive 3 to 5 vetted options with full pricing, crew bios, and itinerary suggestions.</p>
<p>Every yacht in our network is operated by a licensed and insured charter company. We work with brokers in the British Virgin Islands, Bahamas, Greece, Croatia, Turkey, French Polynesia, Thailand, and the Caribbean. Whether you want a 45-foot catamaran for a family of six or a 180-foot motor yacht with a crew of ten, the process is the same: describe the trip, review the options, book.</p>`,
        },
        {
          heading: "Caribbean & Bahamas Charters",
          content: `<p>The Caribbean is Zeniva's strongest charter region. We coordinate trips out of Tortola (BVI), Nassau (Bahamas), St. Martin, St. Lucia, Antigua, and Grenada. The British Virgin Islands remain the most popular starting point thanks to short hops between protected anchorages, predictable trade winds, and a chain of beach bars that have become destinations in their own right — Soggy Dollar, Foxy's, the Willy T.</p>
<p>Catamarans dominate the Caribbean fleet because they handle shallow anchorages well and offer more living space than monohulls of similar length. Expect to budget $20,000 to $45,000 per week for a fully crewed 50-foot catamaran sleeping 8 guests, all-inclusive of food, drinks, fuel, and crew gratuity.</p>`,
        },
        {
          heading: "Mediterranean Charters",
          content: `<p>The Mediterranean season runs roughly May through October, with July and August being peak. Zeniva sources yachts in Greece (Athens, Mykonos, Santorini, the Ionian), Croatia (Split, Dubrovnik), Italy (Naples, Sardinia, Amalfi), the French Riviera (Cannes, St. Tropez), Turkey (Bodrum, Göcek), and the Balearics (Palma, Ibiza).</p>
<p>Mediterranean charters tend toward larger motor yachts because the distances between marquee destinations are longer. A 100-foot motor yacht with a crew of 5 typically runs $80,000 to $150,000 per week plus the standard 30% APA (advanced provisioning allowance) for fuel, food, and dockage. Smaller sailing yachts in Greece or Turkey can be had for under $20,000 per week.</p>`,
        },
        {
          heading: "What's Included & What's Not",
          content: `<p>Crewed charter pricing typically includes the yacht itself, the crew (captain, chef, deckhands, stewardess), and basic amenities. The APA — usually 25–35% of the base charter fee — covers fuel, dockage, food, drinks, port fees, and any provisioning you request. Anything left over at the end of the trip is refunded.</p>
<p>Tips are customary and typically run 10–20% of the base charter fee, paid directly to the captain at the end of the trip. Travel insurance, flights to the embarkation point, and any pre/post-charter hotel stays are not included — Zeniva can coordinate all of these as part of the same booking.</p>`,
        },
      ]}
      highlights={[
        { icon: "anchor", title: "Vetted Operators", description: "Every charter company in our network is fully licensed, insured, and personally vetted by Zeniva's yacht team." },
        { icon: "star", title: "24-Hour Quotes", description: "Tell Lina your dates and destination — receive 3 to 5 vetted options with full pricing within one business day." },
        { icon: "users", title: "Crewed or Bareboat", description: "Full crewed (captain, chef, crew included) or bareboat (you skipper) — both available worldwide." },
        { icon: "map", title: "Custom Itineraries", description: "Your captain plans daily anchorages around weather, your interests, and the best snorkeling, beaches, and restaurants." },
        { icon: "shield", title: "Charter Agreement", description: "Standard MYBA contract, escrow payment, and full insurance — your booking is protected end-to-end." },
        { icon: "phone", title: "Concierge Support", description: "Pre-trip provisioning lists, dietary requirements, and special requests handled by your Zeniva advisor." },
      ]}
      faqs={[
        { question: "How much does a yacht charter cost?", answer: "Crewed catamaran charters in the Caribbean start around $20,000 per week all-inclusive for 8 guests. Mediterranean motor yachts (60–80 ft) typically run $40,000 to $80,000 per week base, plus APA. Superyachts (100 ft+) start around $100,000 per week. Bareboat charters (you skipper) can be much less — from $4,000 per week in Greece." },
        { question: "Do I need sailing experience?", answer: "Not for crewed charters — the captain handles everything. For bareboat charters, you'll need a recognized sailing certification (ASA, RYA, IYT) and demonstrated experience appropriate for the yacht size and sailing area." },
        { question: "How far in advance should I book?", answer: "For peak weeks (Christmas/New Year in the Caribbean, July–August in the Mediterranean), book 9–12 months ahead. For shoulder seasons, 3–6 months is usually sufficient. Last-minute deals occasionally appear for unsold inventory." },
        { question: "Can you arrange flights and hotels too?", answer: "Yes. Zeniva books your flights to the embarkation port, any pre/post-charter hotel stays, and ground transfers. Everything goes on a single itinerary with one point of contact." },
        { question: "What happens if the weather is bad?", answer: "The captain has final authority on routing and will adjust the itinerary to keep you safe. Most charters carry trip insurance that covers cancellation or significant weather disruption — we'll walk you through the options." },
      ]}
      ctaText="Get Yacht Charter Quotes"
      ctaPrompt="I'd like to charter a private yacht"
      internalLinks={[
        { label: "Luxury Travel", href: "/services/luxury-travel" },
        { label: "ZeniYacht Collection", href: "/zeniyacht" },
        { label: "Honeymoon Packages", href: "/services/honeymoon" },
        { label: "Caribbean Destinations", href: "/destinations/caribbean" },
      ]}
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Yacht Charter Service",
        provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" },
        serviceType: "Yacht Charter",
        description: "Private crewed and bareboat yacht charters in the Caribbean, Mediterranean, Bahamas, and South Pacific.",
        areaServed: "Worldwide",
      }}
    />
  );
}
