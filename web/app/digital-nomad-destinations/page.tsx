import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Best Digital Nomad Destinations 2026 — Visa, WiFi, Cost | Zeniva",
  description: "Best digital nomad destinations 2026 with nomad visa availability, WiFi quality, monthly cost. Lisbon, Bali, Mexico City, Medellín, Bangkok and more. Booked by Zeniva.",
  keywords: ["digital nomad destinations", "nomad visa", "best places work remotely", "digital nomad 2026", "nomad cities", "remote work travel", "long-stay travel"],
  openGraph: { title: "Digital Nomad Destinations 2026 | Zeniva", description: "Best digital nomad destinations with visa, WiFi, cost details.", url: "https://www.zenivatravel.com/digital-nomad-destinations", siteName: "Zeniva Travel", type: "website", images: [{ url: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: "Digital Nomad Travel — Zeniva" }] },
  alternates: { canonical: "https://www.zenivatravel.com/digital-nomad-destinations" },
};

export default function NomadPage() {
  return (
    <SeoPage
      h1="Best Digital Nomad Destinations 2026"
      subtitle="Where to work remotely from in 2026 — with nomad visa availability, real WiFi quality (not just hotel claims), monthly cost of living, and English-speaking ecosystem. Long-stay bookings handled by Zeniva."
      heroImage="https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-orange-900/70 to-blue-900/60"
      badge="Long-stay specialists"
      sections={[
        { heading: "What 'digital nomad friendly' actually requires", content: `<p>The digital nomad market exploded post-2020 with marketing for "best nomad destinations" lists everywhere. The reality is more practical: a workable destination requires reliable WiFi (50+ Mbps minimum, ideally 100+), legal long-stay status (tourist visa or nomad visa), reasonable cost of living (under $3,000/month all-in for most travelers), an existing remote-work community for connection, and time-zone overlap with your main work hours.</p><p>Zeniva books long-stay travel (1-6 months) including monthly apartment rentals, co-working day passes or memberships, and SIM cards / eSIM for connectivity.</p>` },
        { heading: "Top digital nomad destinations 2026", content: `<p><strong>Lisbon, Portugal:</strong> Portugal's D7/D8 nomad visa, vibrant nomad community in Príncipe Real, 100+ Mbps WiFi standard, $2,500-3,500/month all-in. Time zone overlap with both US and Europe.</p><p><strong>Bali (Canggu, Ubud):</strong> Indonesia's nomad visa launched 2024. Coworking ecosystem (Outpost, BWork). $1,500-2,500/month all-in. Time zone good for Asia, tough for US.</p><p><strong>Mexico City:</strong> Tourist visa allows 180 days. Roma Norte and Condesa neighborhoods. $2,000-3,500/month. Best US time-zone overlap of any nomad destination.</p><p><strong>Medellín, Colombia:</strong> Colombia nomad visa launched 2023. El Poblado and Laureles. $1,800-3,000/month. US time zone.</p><p><strong>Bangkok, Thailand:</strong> Long-Term Resident visa for high-income remote workers. Sukhumvit and Thonglor. $1,800-3,500/month. Time zone tough for US.</p><p><strong>Buenos Aires, Argentina:</strong> Nomad visa. Palermo and San Telmo. Currency situation makes it very cheap for USD earners ($1,500-2,500/month). Time zone US-friendly.</p><p><strong>Tbilisi, Georgia:</strong> 1-year tourist visa for many nationalities. Vibrant nomad scene. $1,200-2,200/month. European-leaning time zone.</p><p><strong>Chiang Mai, Thailand:</strong> Established nomad classic. $1,200-2,000/month. Multiple coworking spaces.</p>` },
        { heading: "Booking long-stay through Zeniva", content: `<p>Long-stay travel (1-6 months) requires different booking infrastructure than vacation travel. Zeniva books monthly furnished apartments via partner property managers in major nomad cities, coordinates 30+ day hotel stays at negotiated long-stay rates, books co-working memberships (WeWork, Outpost, Selina, Regus) at the destination, arranges airport pickup and SIM card setup on arrival.</p><p>For nomad visa applications, we coordinate with destination-country immigration consultants but don't directly process visa paperwork (that's a regulated activity).</p>` },
        { heading: "Insurance for nomads", content: `<p>Standard travel insurance doesn't cover long-stay nomad travel well. Specialized nomad health insurance (SafetyWing Nomad, Genki, IMG Global) covers extended international stays + remote work activities + repatriation. Zeniva quotes appropriate coverage for every long-stay booking.</p><p>For high-value equipment (laptop, camera gear), separate equipment insurance recommended (or homeowner's rider).</p>` },
      ]}
      highlights={[
        { icon: "star", title: "Long-stay rates", description: "30+ day discounted rates at hotels + monthly apartment rentals via partner property managers." },
        { icon: "map", title: "Visa coordination", description: "Destination nomad visa requirements + recommended immigration consultants." },
        { icon: "phone", title: "Lina AI 24/7", description: "Long-stay logistics handled in chat — apartment, coworking, SIM card." },
        { icon: "gift", title: "Coworking memberships", description: "WeWork, Outpost, Selina, Regus — booked at destination." },
        { icon: "shield", title: "Nomad health insurance", description: "SafetyWing, Genki, IMG Global — quoted at every booking." },
        { icon: "users", title: "Nomad community intel", description: "We know which cities have vibrant nomad scenes vs which are isolating." },
      ]}
      faqs={[
        { question: "Best digital nomad destination 2026?", answer: "Lisbon for European-leaning nomads. Mexico City or Medellín for US time zone. Bali for Asia + low cost. Each has trade-offs — Lina helps match your needs." },
        { question: "Do you book monthly apartment rentals?", answer: "Yes — via partner property managers in major nomad cities. We also book 30+ day hotel stays at negotiated long-stay rates." },
        { question: "What about nomad visas?", answer: "We coordinate with destination-country immigration consultants. We don't directly process visa paperwork (regulated activity)." },
        { question: "Health insurance for nomads?", answer: "Standard travel insurance doesn't cover well. Specialized nomad health insurance (SafetyWing, Genki, IMG Global) covers long stays + remote work + repatriation. We quote appropriate coverage." },
        { question: "Best WiFi destinations?", answer: "Lisbon, Mexico City, Singapore, Tokyo, Seoul, Tallinn all have 100+ Mbps WiFi standard. Bali and Bangkok variable by neighborhood. Tbilisi mostly good. Medellín improving rapidly." },
      ]}
      ctaText="Plan My Nomad Trip"
      ctaPrompt="I'd like to plan a long-stay digital nomad trip"
      internalLinks={[
        { label: "AI Travel Agent", href: "/services/ai-travel-agent" },
        { label: "Luxury Travel", href: "/services/luxury-travel" },
        { label: "Europe Destinations", href: "/destinations/europe" },
        { label: "Mexico Destinations", href: "/destinations/mexico" },
        { label: "Group Travel", href: "/services/group-travel" },
      ]}
      jsonLd={{ "@context": "https://schema.org", "@type": "Service", name: "Digital Nomad Travel Planning", provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, serviceType: "Long-Stay Travel", description: "Digital nomad and long-stay travel planning including monthly apartments, coworking, nomad visa coordination, and specialized health insurance.", areaServed: "Worldwide" }}
    />
  );
}
