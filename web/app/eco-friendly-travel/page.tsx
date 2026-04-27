import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Eco-Friendly & Sustainable Travel — Verified Green Resorts | Zeniva",
  description: "Genuine eco-friendly travel with Zeniva. LEED-certified resorts, conservation-focused properties, low-impact itineraries. No greenwashing — real sustainability.",
  keywords: ["eco friendly travel", "sustainable travel", "green resort", "LEED hotel", "conservation travel", "eco lodge", "carbon neutral travel"],
  openGraph: { title: "Eco-Friendly Travel | Zeniva", description: "Verified green resorts and conservation-focused properties.", url: "https://www.zenivatravel.com/eco-friendly-travel", siteName: "Zeniva Travel", type: "website", images: [{ url: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: "Eco Travel — Zeniva" }] },
  alternates: { canonical: "https://www.zenivatravel.com/eco-friendly-travel" },
};

export default function EcoTravelPage() {
  return (
    <SeoPage
      h1="Eco-Friendly & Sustainable Travel"
      subtitle="Most 'eco-friendly' resort marketing is greenwashing. Zeniva curates properties with verified sustainability practices — LEED certification, conservation programs, local sourcing, low-impact construction."
      heroImage="https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-emerald-900/70 to-stone-900/60"
      badge="No greenwashing"
      sections={[
        { heading: "What 'eco-friendly' really means at Zeniva", content: `<p>Many resorts claim "eco-friendly" status because they ask you to reuse towels and they have a recycling bin. That's not sustainability — that's marketing. Zeniva curates properties with measurable, third-party-verified sustainability practices: LEED certification, B Corp status, EarthCheck or Green Globe certification, documented carbon offset programs, on-site conservation efforts, local employment commitments.</p><p>For some travelers, "eco" means low-impact wilderness lodges. For others, it means urban hotels with strong ESG commitments. Zeniva works across the spectrum.</p>` },
        { heading: "Top eco-luxury resort destinations", content: `<p><strong>Six Senses (worldwide):</strong> Industry leader in sustainability. Properties in Maldives, Bali, Vietnam, Portugal all carbon-neutral commitments + conservation programs.</p><p><strong>Soneva (Maldives):</strong> Soneva Fushi and Soneva Jani are pioneers — solar-powered, glass-recycling on-site, zero plastic, marine conservation programs, organic on-site farms.</p><p><strong>1 Hotels (NYC, Miami, Hanalei Bay, San Francisco, West Hollywood):</strong> LEED-certified urban properties with strong sustainability operations.</p><p><strong>Pacuare Lodge (Costa Rica):</strong> Reachable only by raft. Solar-powered. Conservation reserve attached.</p><p><strong>Lapa Rios (Costa Rica):</strong> Carbon-positive jungle lodge. Local employment + reforestation programs.</p><p><strong>Singita lodges (Africa):</strong> Conservation-focused safari operator. Properties in South Africa, Tanzania, Rwanda. Direct funding to wildlife protection.</p><p><strong>And Beyond lodges (Africa):</strong> Conservation impact baked into every booking.</p>` },
        { heading: "Sustainable cruising", content: `<p>Cruise sustainability is improving but still complex. Hurtigruten leads with hybrid-electric ships and zero single-use plastic. Ponant operates the only LNG-powered luxury cruise ship. Lindblad/National Geographic donates a percentage of every booking to conservation. Viking Ocean operates with strong sustainability commitments.</p><p>For travelers who want minimal-impact cruising: small-ship expedition cruises (Lindblad, Hurtigruten, Ponant) have the lowest per-passenger footprint and the strongest conservation contribution.</p>` },
        { heading: "Carbon offsets and trip-level sustainability", content: `<p>For every booking, Zeniva can quote and add carbon offsets via Cool Effect, Atmosfair, or Sustainable Travel International. Typical cost: $20-100 per trip depending on flight distance.</p><p>Beyond offsets, Zeniva recommends low-impact travel choices: train where possible vs short flights in Europe, longer trips with fewer flights vs many short trips, locally-sourced meals at the destination, public transit + walking vs ground transfer for short distances.</p>` },
      ]}
      highlights={[
        { icon: "star", title: "Verified sustainability", description: "LEED, B Corp, EarthCheck, Green Globe certification — not just marketing." },
        { icon: "map", title: "Conservation-focused lodges", description: "Pacuare, Lapa Rios, Singita, &Beyond — direct conservation funding." },
        { icon: "anchor", title: "Sustainable cruise lines", description: "Hurtigruten (hybrid-electric), Ponant (LNG), Lindblad (conservation funded)." },
        { icon: "phone", title: "Lina AI 24/7", description: "Filter packages by sustainability criteria." },
        { icon: "gift", title: "Carbon offsets at booking", description: "Add Cool Effect or Atmosfair offsets to any trip — $20-100 typical." },
        { icon: "shield", title: "Local sourcing trips", description: "Itineraries that prioritize locally-owned restaurants, guides, transport." },
      ]}
      faqs={[
        { question: "Most sustainable luxury resort?", answer: "Soneva Fushi (Maldives) and Six Senses properties globally lead in third-party-verified sustainability. Pacuare Lodge (Costa Rica) for jungle/eco-lodge. Singita and &Beyond for African safari." },
        { question: "Lowest-impact cruise option?", answer: "Hurtigruten (hybrid-electric ships, zero single-use plastic), Ponant (LNG-powered luxury), Lindblad (small-ship expedition + conservation funded)." },
        { question: "Carbon offsets for flights?", answer: "Yes — we quote Cool Effect, Atmosfair, or Sustainable Travel International offsets at booking. Typical cost $20-100 depending on flight distance." },
        { question: "Eco-friendly all-inclusive?", answer: "Limited — most all-inclusive resorts have weak sustainability operations. Iberostar has stronger commitments than most. Hotel Xcaret operates large-scale conservation programs in their parks." },
        { question: "Sustainable group travel?", answer: "Yes — for destination weddings, corporate retreats, family reunions we coordinate with eco-lodges, sustainable transport, and carbon offsets at the group level." },
      ]}
      ctaText="Plan a Sustainable Trip"
      ctaPrompt="I want eco-friendly travel options"
      internalLinks={[
        { label: "Luxury Travel", href: "/services/luxury-travel" },
        { label: "Cruises", href: "/services/cruises" },
        { label: "Honeymoon Packages", href: "/services/honeymoon" },
        { label: "Yacht Charter", href: "/services/yacht-charter" },
        { label: "Group Travel", href: "/services/group-travel" },
      ]}
      jsonLd={{ "@context": "https://schema.org", "@type": "Service", name: "Eco-Friendly Travel Planning", provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, serviceType: "Sustainable Travel", description: "Sustainable and eco-friendly travel planning with verified green resorts, conservation lodges, sustainable cruise lines, and carbon offset options.", areaServed: "Worldwide" }}
    />
  );
}
