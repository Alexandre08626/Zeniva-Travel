import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Luxury Travel Concierge Service | Zeniva",
  description:
    "Experience white-glove luxury travel planning. Private villas, yacht charters, first-class flights, 5-star resorts, and personalized itineraries crafted by Zeniva.",
  openGraph: {
    title: "Luxury Travel Concierge Service | Zeniva",
    description:
      "Experience white-glove luxury travel planning. Private villas, yacht charters, first-class flights, 5-star resorts, and personalized itineraries crafted by Zeniva.",
    url: "https://www.zenivatravel.com/services/luxury-travel",
    siteName: "Zeniva Travel",
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Luxury Travel Concierge — Zeniva",
      },
    ],
  },
  alternates: {
    canonical: "https://www.zenivatravel.com/services/luxury-travel",
  },
};

export default function LuxuryTravelPage() {
  return (
    <SeoPage
      h1="Luxury Travel Concierge Service"
      subtitle="Private villas, yacht charters, first-class flights, and bespoke itineraries — every detail handled so you can focus on the experience."
      heroImage="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-amber-900/70 to-stone-900/60"
      badge="White-Glove Service"
      sections={[
        {
          heading: "What Luxury Travel Means at Zeniva",
          content: `<p>Luxury travel isn't just about expensive hotels. It's about time — saving it, savoring it, and never wasting it on logistics. Zeniva's luxury concierge service exists to remove every friction point between you and an extraordinary travel experience. From the moment you reach out, a dedicated travel advisor (supported by Lina AI for speed) takes ownership of your trip and handles every detail.</p>
<p>We work with a curated network of premium partners: five-star hotel groups, private villa management companies, yacht charter brokers, private aviation providers, Michelin-starred restaurants, and exclusive experience operators. These aren't partnerships you'll find on discount booking sites — they're relationships built over years that give Zeniva clients access to preferred rates, room upgrades, VIP amenities, and availability at properties that are often fully booked to the public.</p>
<p>Whether you're planning a two-week Mediterranean sailing trip, a long weekend at an overwater bungalow in Bora Bora, or a multi-city European tour with private museum access, our concierge team builds it from scratch around your preferences, pace, and budget.</p>`,
        },
        {
          heading: "Private Villas & Ultra-Luxury Resorts",
          content: `<p>For travelers who want space, privacy, and a sense of place, private villas offer something hotels simply can't match. Zeniva's villa portfolio spans the world's most sought-after destinations — cliffside estates on the Amalfi Coast, beachfront compounds in Turks and Caicos, jungle retreats in Bali, and ski-in chalets in the Swiss Alps.</p>
<p>Every villa in our network has been vetted for quality, location, and service standards. Many come with dedicated staff — private chefs, housekeepers, drivers, and concierge teams on-site. We handle the booking, coordinate pre-arrival provisioning (groceries, flowers, champagne on ice), and arrange any additional services you need during your stay.</p>
<p>For those who prefer the polish of a world-class resort, we maintain preferred relationships with brands like Aman, Four Seasons, Rosewood, One&Only, and Six Senses. Through these partnerships, Zeniva clients frequently receive complimentary upgrades, resort credits, spa treatments, and early check-in or late checkout — perks that aren't available when booking directly online.</p>`,
        },
        {
          heading: "Yacht Charters & Private Aviation",
          content: `<p>Nothing redefines a vacation quite like arriving by private jet or spending a week aboard a crewed yacht. Zeniva connects you with licensed charter operators across the Caribbean, Mediterranean, South Pacific, and beyond. Whether you want a sleek 50-foot catamaran for island-hopping in the Grenadines or a 200-foot superyacht with a full crew for the French Riviera, we source options, negotiate terms, and manage every logistical detail.</p>
<p>On the aviation side, we partner with private jet brokers and empty-leg specialists to find the most efficient routing and pricing. For clients who fly commercial but want the premium experience, Lina can source first-class and business-class fares on the world's top-rated airlines — Singapore Airlines Suites, Emirates First, Cathay Pacific Business — often at rates below published pricing thanks to consolidator access.</p>`,
        },
        {
          heading: "Bespoke Itineraries & VIP Experiences",
          content: `<p>The hallmark of true luxury travel is access — to places, people, and experiences that aren't on any public menu. Zeniva specializes in building itineraries around moments that money alone can't buy. A private after-hours tour of the Vatican with an art historian. A helicopter landing on a glacier in New Zealand followed by a champagne picnic. A multi-course dinner prepared by a Michelin-starred chef in the wine cellar of a Tuscan estate.</p>
<p>Our itinerary designers research every destination in depth, balancing must-see highlights with hidden gems and local recommendations. We build in downtime so your schedule doesn't feel like a march, and we time activities to avoid crowds. Every itinerary comes with a detailed day-by-day plan, reservation confirmations, transfer schedules, and a direct line to your advisor if anything needs adjusting on the go.</p>
<p>Private transfers are included as standard in our luxury packages. No waiting for taxis, no navigating unfamiliar public transit. A driver meets you at the airport, takes you to your accommodation, and is available for day trips, dinner reservations, and any spontaneous detours you want to make.</p>`,
        },
        {
          heading: "Dining & Culinary Experiences",
          content: `<p>Food is one of the most memorable parts of any trip, and Zeniva treats it accordingly. Our concierge team secures reservations at the world's hardest-to-book restaurants — places where the waitlist stretches months. We know which local spots are worth the detour, which hotel restaurants genuinely deliver, and which new openings are generating buzz.</p>
<p>Beyond restaurant bookings, we arrange private culinary experiences: cooking classes with local chefs, truffle hunting in Provence, sake tastings in Kyoto, wine tours through Napa or Bordeaux with private sommeliers, and market tours in cities like Marrakech, Bangkok, and Mexico City. These aren't cookie-cutter group tours — they're tailored to your interests and group size.</p>`,
        },
      ]}
      highlights={[
        {
          icon: "star",
          title: "Dedicated Advisor",
          description:
            "A single point of contact who knows your preferences and manages every detail of your trip from start to finish.",
        },
        {
          icon: "home",
          title: "Vetted Properties",
          description:
            "Access to private villas, luxury resorts, and boutique hotels that have been personally inspected and approved.",
        },
        {
          icon: "anchor",
          title: "Yacht & Jet Access",
          description:
            "Crewed yacht charters and private aviation options sourced from trusted, licensed operators worldwide.",
        },
        {
          icon: "map",
          title: "Custom Itineraries",
          description:
            "Day-by-day plans designed around your pace, with VIP access, private tours, and exclusive experiences woven in.",
        },
        {
          icon: "gift",
          title: "VIP Perks & Upgrades",
          description:
            "Complimentary upgrades, resort credits, and amenities at partner properties — benefits you won't find booking online.",
        },
        {
          icon: "shield",
          title: "24/7 Trip Support",
          description:
            "Real-time assistance throughout your trip. Flight delayed? Restaurant change? Your advisor handles it instantly.",
        },
      ]}
      faqs={[
        {
          question: "What's included in the luxury concierge service?",
          answer:
            "Everything. A dedicated travel advisor handles your flights, accommodations, ground transfers, restaurant reservations, activity bookings, and any special requests. You receive a complete day-by-day itinerary, all confirmations in one place, and 24/7 support during your trip. We also coordinate VIP perks like room upgrades, resort credits, and early check-in at partner properties.",
        },
        {
          question: "How much does luxury travel cost?",
          answer:
            "It depends entirely on the destination, duration, and level of service. A week-long luxury villa stay in the Caribbean might start around $5,000 while an extended Mediterranean yacht charter could reach six figures. Zeniva's concierge fee is built into the trip cost — there's no separate planning charge. We work within your budget to maximize value at every price point.",
        },
        {
          question: "Can you book private jets and yachts?",
          answer:
            "Yes. We partner with licensed private jet brokers and yacht charter companies worldwide. For jets, we source on-demand charters, empty legs, and jet card options. For yachts, we offer crewed and bareboat charters across the Caribbean, Mediterranean, and South Pacific. Every operator in our network is fully licensed and insured.",
        },
        {
          question: "Do you handle everything or just accommodations?",
          answer:
            "We handle the complete trip — flights, hotels or villas, ground transportation, dining reservations, activities, spa appointments, event tickets, and any special arrangements. If it's part of your travel experience, it's part of our service. Many clients hand us a set of dates and a destination and let us build the entire trip.",
        },
        {
          question: "What destinations do you specialize in?",
          answer:
            "Zeniva's luxury network spans every continent. Our strongest coverage includes the Caribbean, Mexico, Europe (especially the Mediterranean coast, France, and Italy), Southeast Asia, the Maldives, Bora Bora, and East Africa for safari. That said, we plan luxury trips worldwide — from Antarctica expeditions to Japanese ryokan tours.",
        },
      ]}
      ctaText="Plan Your Luxury Trip"
      ctaPrompt="I'd like to plan a luxury vacation"
      internalLinks={[
        { label: "Bora Bora", href: "/destinations/bora-bora" },
        { label: "Europe Destinations", href: "/destinations/europe" },
        { label: "Honeymoon Packages", href: "/services/honeymoon" },
        { label: "AI Travel Agent", href: "/services/ai-travel-agent" },
      ]}
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Luxury Travel Concierge",
        provider: {
          "@type": "Organization",
          name: "Zeniva Travel",
          url: "https://www.zenivatravel.com",
        },
        serviceType: "Luxury Travel Planning",
        description:
          "White-glove luxury travel concierge service including private villas, yacht charters, first-class flights, bespoke itineraries, and VIP experiences.",
        areaServed: "Worldwide",
      }}
    />
  );
}
