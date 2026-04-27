import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Senior Travel & Vacations 55+ — Cruises, Tours, All-Inclusive | Zeniva",
  description: "Senior travel planning with Zeniva. Cruises, escorted tours, all-inclusive resorts designed for 55+ travelers. Mobility-friendly, slower-pace, multi-gen options.",
  keywords: ["senior travel", "vacations for seniors", "55+ travel", "senior cruises", "escorted senior tours", "senior all-inclusive", "mobility friendly travel"],
  openGraph: { title: "Senior Travel & Vacations 55+ | Zeniva", description: "Cruises, tours, resorts designed for 55+ travelers.", url: "https://www.zenivatravel.com/senior-travel", siteName: "Zeniva Travel", type: "website", images: [{ url: "https://images.unsplash.com/photo-1565006447554-c6c2e3a37e10?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: "Senior Travel — Zeniva" }] },
  alternates: { canonical: "https://www.zenivatravel.com/senior-travel" },
};

export default function SeniorTravelPage() {
  return (
    <SeoPage
      h1="Senior Travel — Vacations for 55+ Travelers"
      subtitle="Cruises, escorted tours, all-inclusive resorts, and slower-pace itineraries designed around what 55+ travelers actually want — comfortable accommodation, quality dining, mobility-friendly logistics, and reliable support."
      heroImage="https://images.unsplash.com/photo-1565006447554-c6c2e3a37e10?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-blue-900/70 to-amber-900/60"
      badge="Mobility & comfort focused"
      sections={[
        { heading: "What senior travelers actually need", content: `<p>"Senior travel" marketing often patronizes — slow pace, simple meals, low expectations. The reality is that travelers 55+ are increasingly active, have time for longer trips, and want quality without the hassle. What they DO need: rooms with walk-in showers, restaurants without 30-minute waits, ground transport that handles luggage, and a real human reachable when something goes wrong (not an AI chatbot).</p><p>Zeniva's senior travel team focuses on the practical: properties with elevators, ground-floor room availability, English-speaking staff in international destinations, dietary accommodations (low-sodium, diabetic-friendly), and 24/7 human escalation when an itinerary issue arises.</p>` },
        { heading: "Best senior travel categories", content: `<p><strong>Cruises:</strong> Far and away the #1 senior travel category. Seabourn, Silversea, Crystal, Regent, Viking Ocean, Holland America, Princess all known for excellent senior experience. Smaller ships (Seabourn, Silversea) skew older + more intimate; Holland America/Princess have all ages but very strong 55+ programming.</p><p><strong>Escorted tours:</strong> Tauck, Trafalgar, Globus, Insight Vacations all run guided multi-week European and worldwide tours with porter-handled luggage, included activities, and small groups. Ideal for seniors who want to see Italy/France/Egypt/Japan without DIY logistics.</p><p><strong>River cruises:</strong> Viking, AmaWaterways, Avalon, Uniworld. Particularly strong for Europe (Rhine, Danube, Rhône) and the Mekong/Yangtze. River cruises often feel like a moving 5-star hotel — unpacking once for 1-2 weeks.</p><p><strong>All-inclusive resorts (specific brands):</strong> Sandals (couples-only, 55+ couples are common), Iberostar Grand (adults-only), Excellence (adults-only). Avoid family/spring-break properties.</p><p><strong>Multi-gen trips:</strong> Many seniors travel with adult children + grandchildren. Beaches Turks and Caicos, private villa rentals, multi-bedroom suites at Iberostar Family or Hyatt Ziva all work well.</p>` },
        { heading: "Mobility-friendly travel", content: `<p>For travelers with mobility considerations, Zeniva specifies room requirements at booking: ground floor access or elevator-served rooms, walk-in showers vs tubs, accessible bathroom, ramps not stairs at the entrance. We also coordinate ground transfers with assistance, ensure airport wheelchair service is requested, and select shore excursions on cruises that don't require extensive walking.</p><p>For more substantial accessibility needs, see our /accessible-travel page for ADA-equivalent properties and dedicated accessible travel planning.</p>` },
        { heading: "Senior travel insurance and medical", content: `<p>Travel insurance is critical for senior travelers — pre-existing condition coverage, medical evacuation (international flights for emergency care can exceed $100,000), and trip cancellation/interruption are all worth more for older travelers. Zeniva quotes appropriate insurance for every booking.</p><p>For international destinations, we coordinate with hotels on medical access, identify English-speaking doctors in advance, and ensure prescriptions can be refilled or extended if needed.</p>` },
      ]}
      highlights={[
        { icon: "star", title: "Cruises specialty", description: "All major lines + small-ship luxury. Senior-focused programming." },
        { icon: "anchor", title: "River cruises", description: "Viking, AmaWaterways, Avalon, Uniworld. Unpack once, see multiple cities." },
        { icon: "users", title: "Escorted tours", description: "Tauck, Trafalgar, Globus, Insight. Porter-handled luggage, English-speaking guides." },
        { icon: "phone", title: "24/7 human support", description: "Real travel advisor reachable — not just AI when something goes wrong." },
        { icon: "shield", title: "Mobility-friendly", description: "Walk-in showers, elevators, ground-floor rooms, accessible transfers." },
        { icon: "gift", title: "Insurance + medical", description: "Pre-existing condition coverage, medical evacuation, trip protection." },
      ]}
      faqs={[
        { question: "Best cruise line for seniors?", answer: "Holland America and Princess for great experience at moderate price. Viking Ocean and Oceania for upscale mid-luxury. Seabourn, Silversea, Crystal, Regent for ultra-luxury small-ship." },
        { question: "Best escorted tour company?", answer: "Tauck for premium guided tours. Trafalgar and Globus for value. Insight Vacations for premium small groups. Each has senior-focused departures and itineraries." },
        { question: "All-inclusive for seniors?", answer: "Adults-only properties: Excellence, Sandals (couples), Iberostar Grand, Le Blanc. Avoid family-focused or spring-break properties." },
        { question: "What about mobility issues?", answer: "We specify room requirements (walk-in shower, elevator access, ground floor) at booking and coordinate ground transfers with assistance. For substantial accessibility needs see our accessible-travel page." },
        { question: "Travel insurance for seniors?", answer: "Critical. We quote pre-existing condition coverage, medical evacuation, and trip protection appropriate for older travelers and international destinations." },
      ]}
      ctaText="Plan a Senior-Friendly Trip"
      ctaPrompt="I'd like to plan a trip for senior travelers"
      internalLinks={[
        { label: "Cruises", href: "/services/cruises" },
        { label: "Adults-Only Resorts", href: "/services/adults-only-resorts" },
        { label: "Luxury Travel", href: "/services/luxury-travel" },
        { label: "Accessible Travel", href: "/accessible-travel" },
        { label: "Group Travel", href: "/services/group-travel" },
      ]}
      jsonLd={{ "@context": "https://schema.org", "@type": "Service", name: "Senior Travel Planning", provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, serviceType: "Senior Travel", description: "Travel planning for 55+ travelers including cruises, escorted tours, all-inclusive resorts, and multi-generational trips with mobility-friendly options.", areaServed: "Worldwide" }}
    />
  );
}
