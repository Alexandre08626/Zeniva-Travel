import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Group Travel Planning | Zeniva",
  description:
    "Plan group trips for 10+ travelers with Zeniva. Family reunions, corporate retreats, destination weddings — group rates, one invoice, dedicated planner.",
  openGraph: {
    title: "Group Travel Planning | Zeniva",
    description:
      "Plan group trips for 10+ travelers with Zeniva. Family reunions, corporate retreats, destination weddings — group rates, one invoice, dedicated planner.",
    url: "https://www.zenivatravel.com/services/group-travel",
    siteName: "Zeniva Travel",
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Group Travel Planning — Zeniva",
      },
    ],
  },
  alternates: {
    canonical: "https://www.zenivatravel.com/services/group-travel",
  },
};

export default function GroupTravelPage() {
  return (
    <SeoPage
      h1="Group Travel Planning & Custom Trips"
      subtitle="Family reunions, corporate retreats, bachelor parties, destination weddings — one planner, group rates, single invoice."
      heroImage="https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-emerald-900/70 to-teal-900/60"
      badge="Groups of 10+"
      sections={[
        {
          heading: "Why Group Travel Needs a Dedicated Planner",
          content: `<p>Coordinating travel for a large group is exponentially harder than booking for two. Different budgets, schedules, dietary needs, room preferences, and flight connections turn what should be an exciting trip into a logistical headache. Zeniva's group travel service exists to take that burden off your shoulders entirely.</p>
<p>When you bring your group trip to Zeniva, a dedicated planner is assigned to your booking. They become the single point of contact for every traveler in your party — handling flights, room assignments, ground transportation, group activities, and payments. Instead of a dozen people trying to coordinate in a group chat, everyone gets clear information, confirmed reservations, and a single itinerary they can access from their phone.</p>
<p>We've planned group trips for family reunions of 50+ across three generations, corporate retreats for tech companies, bachelor and bachelorette weekends, sports teams traveling to tournaments, and destination weddings with guests flying in from multiple countries. No group is too complex when there's a system behind it.</p>`,
        },
        {
          heading: "Types of Group Trips We Plan",
          content: `<p>Every group is different, and Zeniva builds each trip around the specific needs of yours.</p>`,
          subSections: [
            {
              heading: "Family Reunions",
              content: `<p>Getting the whole family together — grandparents, parents, kids, cousins — requires accommodations that work for every age group and budget. We source resorts and villa compounds that offer both togetherness and privacy, with amenities for kids, accessible rooms for older travelers, and communal spaces for group dinners and celebrations. Popular family reunion destinations include all-inclusive resorts in Mexico and the Caribbean, ranch retreats in the American West, and beachfront villa complexes in Costa Rica and the Dominican Republic.</p>`,
            },
            {
              heading: "Corporate Retreats & Team Travel",
              content: `<p>Corporate groups need meeting spaces, reliable Wi-Fi, team-building activities, and accommodations that reflect the company's culture. Zeniva handles venue sourcing, A/V setup coordination, activity planning (from cooking classes to catamaran sailing), and group dining. We provide a single itemized invoice for your finance team and can manage per-diem budgets, individual room billing, and tax-compliant documentation for international groups.</p>`,
            },
            {
              heading: "Bachelor & Bachelorette Trips",
              content: `<p>Whether it's a beachfront villa in Tulum, a wine country weekend in Napa, or a nightlife-focused trip to Miami or Las Vegas, we plan bachelor and bachelorette getaways that are fun, organized, and stress-free. We coordinate group flights, shared accommodations, VIP reservations, pool parties, boat charters, and any surprise elements the organizer wants to include. Everything is handled discreetly with the organizer as the main contact.</p>`,
            },
            {
              heading: "Destination Weddings",
              content: `<p>A destination wedding means managing not just the couple's travel but the logistics for every guest. Zeniva coordinates room blocks at negotiated rates, group flight bookings, welcome bags, airport transfers, rehearsal dinner venues, and post-wedding excursions. We work alongside your wedding planner (or can recommend one) to make sure the travel side is seamless, so you can focus on the ceremony and celebration.</p>`,
            },
            {
              heading: "Sports Teams & Clubs",
              content: `<p>Teams traveling to tournaments, training camps, or away games need efficient, budget-conscious planning that keeps the group together and on schedule. We handle flights, hotels near the venue, bus charters, meal plans, and equipment transport logistics. Coaches and team managers get a single dashboard to track all bookings and payments.</p>`,
            },
          ],
        },
        {
          heading: "Group Rates & Negotiated Pricing",
          content: `<p>One of the biggest advantages of booking group travel through Zeniva is access to rates you simply can't get on your own. Hotels, airlines, and activity operators offer significant discounts for group bookings — but only when the booking is coordinated through a single channel with guaranteed numbers.</p>
<p>Zeniva negotiates directly with properties on your behalf. For hotel room blocks of 10 or more rooms, we typically secure 15-30% below published rates, plus added perks like complimentary meeting rooms, welcome cocktails, or resort credits. For flights, group fares lock in pricing for your entire party and often include more flexible change policies than individual tickets.</p>
<p>Every group receives a single, consolidated invoice. No more chasing individuals for payment or splitting charges across a dozen credit cards. We can also set up individual payment links so each traveler pays their share directly to Zeniva, and we handle the reconciliation.</p>`,
        },
        {
          heading: "How the Planning Process Works",
          content: `<p>Getting started is simple. Reach out to Zeniva with the basics: approximate group size, preferred destination (or ask us to recommend one), travel dates, and overall budget. Your dedicated planner will respond within 24 hours with initial options and a proposed timeline for the planning process.</p>
<p>From there, we move through destination confirmation, accommodation selection, flight coordination, activity planning, and payment collection in a structured timeline. Each phase has clear milestones, and your planner keeps you updated with regular check-ins. For the rest of your group, we send clear, branded communications with booking instructions, itinerary details, and a FAQ document so everyone knows exactly what to expect.</p>
<p>Most group trips benefit from starting the planning process 4-6 months in advance, though we can turn around shorter timelines when needed. For destination weddings and large corporate events, 6-12 months of lead time ensures the best availability and pricing at top venues.</p>`,
        },
      ]}
      highlights={[
        {
          icon: "users",
          title: "Dedicated Group Planner",
          description:
            "One planner manages every detail for your entire group — flights, rooms, transfers, and activities coordinated centrally.",
        },
        {
          icon: "percent",
          title: "Negotiated Group Rates",
          description:
            "15-30% below published hotel rates for groups of 10+ rooms, plus group airfares and bulk activity pricing.",
        },
        {
          icon: "file-text",
          title: "Single Invoice",
          description:
            "One consolidated invoice for the entire group, with optional individual payment links for each traveler.",
        },
        {
          icon: "calendar",
          title: "Shared Itinerary",
          description:
            "Every traveler gets access to a clear, up-to-date itinerary with all reservations, meeting points, and contact info.",
        },
        {
          icon: "message-circle",
          title: "Group Communication",
          description:
            "Branded emails and updates sent directly to your group so everyone stays informed without endless group chat threads.",
        },
        {
          icon: "shield",
          title: "Flexible Policies",
          description:
            "Group booking terms with more flexible cancellation and change policies than individual reservations.",
        },
      ]}
      faqs={[
        {
          question: "How large can the group be?",
          answer:
            "There's no upper limit. We've coordinated trips for groups ranging from 10 to over 200 travelers. The planning process scales — larger groups simply get more dedicated coordination resources. Whether it's a small corporate team or a multi-generational family reunion, we have the systems and supplier relationships to handle it.",
        },
        {
          question: "Do we get group rates?",
          answer:
            "Yes. Groups of 10+ rooms at a hotel unlock negotiated group pricing, which typically runs 15-30% below published rates. We also secure group airfares, bulk pricing on activities and excursions, and added perks like complimentary meeting rooms, welcome amenities, or resort credits. The larger the group, the stronger the negotiating position.",
        },
        {
          question: "How far in advance should we book?",
          answer:
            "For most group trips, 4-6 months of lead time is ideal. This gives us the best selection of accommodations and flight options at competitive rates. Destination weddings and large corporate events (50+ travelers) benefit from 6-12 months of planning time. That said, we can work with shorter timelines when availability allows — just reach out and we'll let you know what's possible.",
        },
        {
          question: "Can each person customize their booking?",
          answer:
            "Absolutely. While the group benefits from centralized coordination and negotiated rates, individual travelers can customize room types, upgrade their flights, add extra nights before or after the group dates, and choose which group activities to join. Everyone pays for their own customizations, and our planner tracks it all in one place.",
        },
        {
          question: "Do you handle corporate travel and events?",
          answer:
            "Yes, corporate travel is one of our specialties. We manage team retreats, off-sites, conferences, incentive trips, and client entertainment travel. Services include venue sourcing, meeting space coordination, team-building activity planning, group dining, transportation logistics, and consolidated invoicing with full expense documentation for your finance team.",
        },
      ]}
      ctaText="Start Planning Your Group Trip"
      ctaPrompt="I need to plan a group trip"
      internalLinks={[
        { label: "Mexico Destinations", href: "/destinations/mexico" },
        { label: "Caribbean Getaways", href: "/destinations/caribbean" },
        { label: "AI Travel Agent", href: "/services/ai-travel-agent" },
        { label: "Honeymoon Packages", href: "/services/honeymoon" },
      ]}
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Group Travel Planning",
        provider: {
          "@type": "Organization",
          name: "Zeniva Travel",
          url: "https://www.zenivatravel.com",
        },
        serviceType: "Group Travel Coordination",
        description:
          "Dedicated group travel planning for family reunions, corporate retreats, destination weddings, and groups of 10+ travelers with negotiated rates and single invoicing.",
        areaServed: "Worldwide",
      }}
    />
  );
}
