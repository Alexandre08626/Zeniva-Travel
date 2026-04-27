import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Spring Break Vacation Packages 2026 — Cancun, Cabo, Bahamas | Zeniva",
  description: "Spring break packages for college students, families, and adults. Cancun, Cabo, Bahamas, Punta Cana, Daytona, South Padre. Real bookings via Lina AI.",
  keywords: ["spring break 2026", "spring break Cancun", "spring break Cabo", "spring break packages", "college spring break", "family spring break"],
  openGraph: { title: "Spring Break Packages 2026 | Zeniva", description: "Cancun, Cabo, Bahamas, Punta Cana, Daytona — for college, family, and adult spring break.", url: "https://www.zenivatravel.com/services/spring-break", siteName: "Zeniva Travel", type: "website", images: [{ url: "https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: "Spring Break — Zeniva" }] },
  alternates: { canonical: "https://www.zenivatravel.com/services/spring-break" },
};

export default function SpringBreakPage() {
  return (
    <SeoPage
      h1="Spring Break Vacation Specialists"
      subtitle="College spring break, family spring break, adult spring break — different vibes need different destinations. Zeniva matches your group to the right spot and books flights + hotel + transfers in seconds."
      heroImage="https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-pink-900/70 to-cyan-900/60"
      badge="March + April departures"
      sections={[
        { heading: "Spring break by audience", content: `<p><strong>College students:</strong> Cancun (especially the Hotel Zone), Cabo San Lucas, South Padre Island TX, Daytona Beach FL, Panama City Beach FL. Energetic nightlife, group-friendly resorts (Riu Caribe Cancun, Hard Rock Cancun, Grand Oasis Cancun). Book early — peak weeks sell out by January.</p><p><strong>Families with kids/teens:</strong> Beaches Turks and Caicos (the gold standard), Hyatt Ziva Cancun, Atlantis Bahamas, Disney Cruise Spring Break sailings, Hard Rock Family Suites. Spring break weeks have higher prices but strong supply.</p><p><strong>Adults seeking quiet:</strong> Punta Cana (Excellence Punta Cana, Sanctuary Cap Cana), Riviera Maya away from Cancun (Mayakoba, Hotel Xcaret Arte), Aruba, Turks and Caicos. Avoid Cancun Hotel Zone during peak college weeks.</p>` },
        { heading: "Top spring break destinations", content: `<p><strong>Cancun:</strong> The undisputed #1 college spring break destination. The Hotel Zone is loud and energetic during peak weeks (typically the first 3 weeks of March). Hard Rock Cancun, Riu Caribe, Grand Oasis target college groups. The southern Riviera Maya stays quiet.</p><p><strong>Cabo San Lucas:</strong> Pacific coast spring break alternative. Medano Beach is the action zone. ME Cabo, Riu Palace Cabo, Marquis Los Cabos for college; Esperanza, Grand Velas Los Cabos for adults seeking quiet.</p><p><strong>Bahamas (Nassau, Atlantis):</strong> Atlantis Paradise Island is family central. Sandyport and Cable Beach for adults.</p><p><strong>Punta Cana:</strong> Generally calmer than Cancun even during spring break. Most resorts are large enough that party energy is contained.</p><p><strong>Domestic (Florida + Texas):</strong> Daytona Beach, Panama City Beach, South Padre Island TX. No passport needed, drivable from many southern states.</p>` },
        { heading: "Booking timing for spring break", content: `<p><strong>Best weeks to book ASAP:</strong> Mid-February through early April. Peak weeks vary by school but typically the first 3 weeks of March. Book 6-9 months ahead for the best prices and availability.</p><p><strong>Last-minute deals:</strong> Sometimes available 2-4 weeks out for off-peak weeks (early February, late April). Spring break peak weeks rarely have last-minute deals — they sell out.</p><p><strong>Group bookings (10+ travelers):</strong> Group rates available 4+ months ahead. Lina handles room blocks, group flights, and rooming lists.</p>` },
      ]}
      highlights={[
        { icon: "star", title: "Audience matching", description: "College, family, or adult — different destinations, Lina picks the right fit." },
        { icon: "phone", title: "Lina AI 24/7", description: "Chat or voice — personalized package in seconds." },
        { icon: "users", title: "Group bookings", description: "Group rates for 10+ travelers. Room blocks, group flights, rooming lists." },
        { icon: "gift", title: "Flights + Hotel + Transfers", description: "Bundled into one transparent price." },
        { icon: "shield", title: "24/7 In-Trip Support", description: "Real human reachable from anywhere — critical during spring break chaos." },
        { icon: "map", title: "Domestic + International", description: "Mexico, Caribbean, Bahamas, plus US drivable options (Florida, Texas)." },
      ]}
      faqs={[
        { question: "Best spring break destination for college students?", answer: "Cancun Hotel Zone is the classic choice — energetic, large resorts catering to groups, easy logistics. Cabo San Lucas (Medano Beach) is the Pacific alternative. Both sell out 3-6 months ahead for peak March weeks." },
        { question: "Best spring break for families?", answer: "Beaches Turks and Caicos (#1 globally for families), Atlantis Paradise Island, Disney Cruise Spring Break sailings, Hyatt Ziva Cancun. Book by November for the best prices on March weeks." },
        { question: "Adults-only spring break?", answer: "Excellence Punta Cana, Sanctuary Cap Cana, Mayakoba, Hotel Xcaret Arte (adults-only), Le Blanc Spa Resort, Iberostar Grand. Avoid Cancun Hotel Zone during peak college weeks." },
        { question: "When should I book?", answer: "6-9 months ahead for peak weeks (first 3 weeks of March). Group bookings (10+) need 4+ months. Last-minute deals exist for off-peak weeks (early Feb, late April)." },
        { question: "Cheapest spring break package?", answer: "Cancun all-inclusive from US gateways start around $999 per person for 4 nights during peak weeks. Domestic options (Daytona, South Padre) can be cheaper for drive-in groups." },
      ]}
      ctaText="Plan Our Spring Break"
      ctaPrompt="I'm planning a spring break trip"
      internalLinks={[
        { label: "All-Inclusive", href: "/services/all-inclusive" },
        { label: "Cancun Packages", href: "/packages/cancun" },
        { label: "Group Travel", href: "/services/group-travel" },
        { label: "Family Vacations", href: "/services/family-vacations" },
        { label: "Adults-Only Resorts", href: "/services/adults-only-resorts" },
      ]}
      jsonLd={{ "@context": "https://schema.org", "@type": "Service", name: "Spring Break Vacation Booking", provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, serviceType: "Spring Break Travel", description: "Spring break vacation booking for college, family, and adult travelers — Cancun, Cabo, Bahamas, Punta Cana, domestic destinations.", areaServed: "Worldwide" }}
    />
  );
}
