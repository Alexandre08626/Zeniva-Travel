import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Business Travel Service — Corporate Bookings, MICE | Zeniva",
  description: "Corporate business travel with Zeniva. Flights, hotels, ground transport, MICE coordination. Lina AI handles last-minute changes 24/7 with human escalation.",
  keywords: ["business travel agency", "corporate travel management", "TMC", "MICE travel", "business class booking", "corporate flights", "executive travel"],
  openGraph: { title: "Business Travel Service | Zeniva", description: "Corporate flights, hotels, ground, MICE. AI speed + human handling.", url: "https://www.zenivatravel.com/services/business-travel", siteName: "Zeniva Travel", type: "website", images: [{ url: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: "Business Travel — Zeniva" }] },
  alternates: { canonical: "https://www.zenivatravel.com/services/business-travel" },
};

export default function BusinessTravelPage() {
  return (
    <SeoPage
      h1="Business Travel — AI Speed, Human Handling"
      subtitle="Corporate flights, hotel stays, ground transport, and MICE event coordination. Lina AI books in seconds; a real travel advisor handles changes, cancellations, and complex itineraries."
      heroImage="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-slate-900/70 to-blue-900/60"
      badge="24/7 corporate support"
      sections={[
        { heading: "Why companies use Zeniva for business travel", content: `<p>Traditional Travel Management Companies (TMCs — Concur, BCD, Egencia) charge per-trip fees and require enterprise contracts. Most freelance travel agents lack 24/7 coverage. Zeniva fills the gap: AI-driven self-service for routine bookings, with a real human advisor reachable instantly for complex cases.</p><p>For SMBs and growth-stage companies, this means business travel costs less in fees, books faster, and handles edge cases (visa issues, last-minute schedule changes, missed connections) without the corporate-TMC bureaucracy.</p>` },
        { heading: "What Zeniva handles", content: `<p><strong>Flights:</strong> Economy, premium economy, business, first class. Multi-city, open-jaw, last-minute fares. Duffel API access to the same inventory as traditional GDS.</p><p><strong>Hotels:</strong> Corporate-friendly chains (Marriott, Hilton, Hyatt, IHG) plus boutique. Negotiated rates available for repeat business volume.</p><p><strong>Ground transportation:</strong> Black car, executive sedan, group transfers.</p><p><strong>MICE (Meetings, Incentives, Conferences, Events):</strong> Group flights, room blocks, venue coordination, F&B, attendee management. Particularly strong for events of 20-200 attendees.</p><p><strong>Visa & travel documentation:</strong> Coordination with visa services for complex international itineraries.</p>` },
        { heading: "How Zeniva differs from a traditional TMC", content: `<p><strong>No per-trip fees</strong> — Zeniva earns supplier commissions, not transaction fees. SMBs save thousands per year vs Concur or Egencia.</p><p><strong>No enterprise contract required</strong> — start using Zeniva for the next trip, no procurement cycle.</p><p><strong>AI-first self-service</strong> for routine bookings — your travelers chat with Lina, book in seconds, no need to fill out request forms.</p><p><strong>Human escalation 24/7</strong> — for complex itineraries, schedule changes, or emergency rebookings.</p><p><strong>Multilingual</strong> — Lina handles English, French, Spanish for global teams.</p>` },
      ]}
      highlights={[
        { icon: "star", title: "AI-first self-service", description: "Your team books in seconds — no paperwork, no approval queues." },
        { icon: "shield", title: "24/7 human escalation", description: "Real advisor reachable instantly for changes, cancellations, emergencies." },
        { icon: "phone", title: "Voice + chat", description: "Voice calls 24/7 + chat — works during international travel." },
        { icon: "gift", title: "No per-trip fees", description: "Saves SMBs thousands vs traditional TMCs (Concur, Egencia)." },
        { icon: "users", title: "MICE coordination", description: "Group flights, room blocks, venue + F&B for events 20-200 attendees." },
        { icon: "map", title: "Multilingual EN/FR/ES", description: "Lina works for global teams — auto-detects language." },
      ]}
      faqs={[
        { question: "How does Zeniva compare to Concur or Egencia?", answer: "Zeniva is best for SMBs and growth-stage companies. We don't charge per-trip fees (Zeniva earns supplier commissions). No enterprise contract required. AI handles routine bookings, humans handle complex cases. Concur/Egencia are better for Fortune 500 with mature procurement cycles." },
        { question: "Can you book business class and first class?", answer: "Yes — we have access to negotiated business and first-class fares on most major carriers via Duffel + consolidator partnerships." },
        { question: "Do you handle visas?", answer: "We coordinate with visa services and can recommend providers for complex international itineraries. We also flag visa requirements during booking." },
        { question: "Group bookings for events?", answer: "Yes — for 20-200 attendees we handle group flight contracts, room blocks at the venue or partner hotels, ground transfers, F&B coordination, and on-site logistics." },
        { question: "What about expense reporting?", answer: "Zeniva integrates with Expensify, Brex, Ramp, and most expense platforms. Booking confirmations include the structured data needed for automated expense entries." },
      ]}
      ctaText="Talk to Zeniva for Business"
      ctaPrompt="I need business travel coordination"
      internalLinks={[
        { label: "AI Travel Agent Service", href: "/services/ai-travel-agent" },
        { label: "Group Travel", href: "/services/group-travel" },
        { label: "Luxury Travel", href: "/services/luxury-travel" },
        { label: "Yacht Charter (corporate)", href: "/services/yacht-charter" },
      ]}
      jsonLd={{ "@context": "https://schema.org", "@type": "Service", name: "Business Travel Management", provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, serviceType: "Corporate Travel", description: "Business travel coordination including flights, hotels, ground transport, MICE event coordination with 24/7 human escalation.", areaServed: "Worldwide" }}
    />
  );
}
