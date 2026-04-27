import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Adults-Only Resorts — Mexico, Caribbean, Worldwide | Zeniva",
  description: "Book adults-only resorts (18+ or 21+) with Zeniva. Excellence, Secrets, Le Blanc, Sandals, Hotel Xcaret Arte, Iberostar Grand. Quiet, sophisticated, no kids.",
  keywords: ["adults-only resort", "adults only all-inclusive", "no-kids resort", "Sandals", "Excellence Resorts", "Secrets Resorts", "Le Blanc Spa Resort", "Hotel Xcaret Arte", "Iberostar Grand"],
  openGraph: { title: "Adults-Only Resorts | Zeniva", description: "Adults-only resorts in Mexico, Caribbean, worldwide. Excellence, Secrets, Sandals, Le Blanc, Iberostar Grand.", url: "https://www.zenivatravel.com/services/adults-only-resorts", siteName: "Zeniva Travel", type: "website", images: [{ url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: "Adults-Only Resorts — Zeniva" }] },
  alternates: { canonical: "https://www.zenivatravel.com/services/adults-only-resorts" },
};

export default function AdultsOnlyResortsPage() {
  return (
    <SeoPage
      h1="Adults-Only Resort Specialists"
      subtitle="Quiet pools, no children's menu noise, sophisticated atmosphere — Zeniva books across every major adults-only brand. Excellence, Secrets, Sandals, Couples, Le Blanc, Iberostar Grand, Hotel Xcaret Arte."
      heroImage="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-rose-900/70 to-purple-900/60"
      badge="18+ and 21+ properties"
      sections={[
        { heading: "Why book adults-only through Zeniva", content: `<p>Adults-only resorts vary in age policy (18+ vs 21+), atmosphere (relaxed vs party), included amenities, and quality. Choosing the wrong one — landing at a party-focused property when you wanted quiet, or vice versa — can sour a trip.</p><p>Zeniva's team has personally stayed at the major adults-only brands. We know which Excellence properties are quietest, which Hard Rock Heaven section actually delivers, and which Secrets resorts have the best food. Lina matches you to the right vibe.</p>` },
        { heading: "Top adults-only resort brands", content: `<p><strong>Excellence Resorts (Riviera Cancun, Playa Mujeres, Punta Cana, Riviera Cancun):</strong> Refined adults-only luxury. Best overall pick for couples seeking polished service.</p><p><strong>Secrets Resorts (Hyatt's adults-only brand):</strong> Maroma Beach, The Vine Cancun, Cap Cana, Akumal. Unlimited-Luxury concept includes 24-hour room service, top-shelf spirits.</p><p><strong>Le Blanc Spa Resort (Cancun, Los Cabos):</strong> The most luxurious adults-only in Cancun. Butler service, 20-min daily spa included.</p><p><strong>Sandals (Caribbean only — Jamaica, St. Lucia, Antigua, Barbados, Bahamas):</strong> Couples-only (must be 2 adults). Romantic + active. Quality varies by property; we know which to recommend.</p><p><strong>Couples Resorts (Jamaica only):</strong> Couples-only, all-inclusive. More relaxed than Sandals.</p><p><strong>Hard Rock Heaven section (adults-only wing of Hard Rock):</strong> For those who want the Hard Rock energy without kids.</p><p><strong>Iberostar Grand (Cancun, Bavaro, Costa Mujeres):</strong> Adults-only premium tier of Iberostar.</p><p><strong>Hotel Xcaret Arte (Riviera Maya):</strong> Adults-only with included access to all 6 Xcaret parks. Most unique experience in Mexico.</p><p><strong>Zoëtry Resorts:</strong> Smaller, intimate, holistic. Best for wellness-focused couples.</p>` },
        { heading: "Adults-only vs couples-only — what's the difference", content: `<p><strong>Adults-only (18+ or 21+):</strong> No children allowed but solo travelers, friend groups, and couples are all welcome. Examples: Excellence, Secrets, Le Blanc, Hotel Xcaret Arte, Iberostar Grand.</p><p><strong>Couples-only:</strong> Only couples (typically defined as 2 adults sharing a room) — no solo travelers, no friend groups. Examples: Sandals, Couples Resorts, parts of Excellence.</p><p>Sandals specifically defines couple as "2 people in love" — they don't ask for proof but do ban single travelers and same-room friends.</p>` },
        { heading: "Best adults-only by trip type", content: `<p><strong>Honeymoon:</strong> Sandals Royal Caribbean Jamaica, Sanctuary Cap Cana, Le Blanc Spa Resort Cancun, Excellence Playa Mujeres, Hotel Xcaret Arte.</p><p><strong>Anniversary / romantic getaway:</strong> Maroma (Belmond), Secrets Maroma Beach, Excellence Riviera Cancun.</p><p><strong>Girls' trip / friends:</strong> Excellence Playa Mujeres, Iberostar Grand, Hard Rock Heaven (for nightlife). Avoid Sandals/Couples.</p><p><strong>Wellness focus:</strong> Zoëtry Resorts, Sanctuary Cap Cana, Six Senses (worldwide).</p>` },
      ]}
      highlights={[
        { icon: "star", title: "Every major brand", description: "Excellence, Secrets, Sandals, Couples, Le Blanc, Hard Rock Heaven, Iberostar Grand, Hotel Xcaret Arte, Zoëtry." },
        { icon: "users", title: "Right vibe match", description: "We know which property is quiet/sophisticated vs lively/party — Lina matches you." },
        { icon: "phone", title: "Lina AI 24/7", description: "Chat or voice — personalized recommendation in seconds." },
        { icon: "gift", title: "VIP perks", description: "Complimentary room upgrades, resort credits, late check-out at partner properties." },
        { icon: "shield", title: "Honeymoon specialty", description: "Honeymoon registries, anniversary perks, special arrangements coordinated." },
        { icon: "anchor", title: "Spa packages", description: "Most adults-only resorts have premium spas; we book treatments + packages." },
      ]}
      faqs={[
        { question: "What's the best adults-only resort in Cancun?", answer: "Le Blanc Spa Resort for ultra-luxury. Excellence Playa Mujeres for refined value. Hotel Xcaret Arte for unique cultural/active experience. Secrets The Vine for couples on a budget." },
        { question: "Sandals vs Excellence — which is better?", answer: "Sandals is couples-only and Caribbean-only (Jamaica, St. Lucia, Antigua, Barbados, Bahamas). Excellence accepts all adults (couples, friends, solo) and operates in Mexico + DR. Excellence tends to be more refined; Sandals more activity-packed and pool-party energetic." },
        { question: "Can solo travelers go to adults-only resorts?", answer: "Yes for adults-only properties (Excellence, Secrets, Le Blanc, Iberostar Grand, Hotel Xcaret Arte). NOT for couples-only properties (Sandals, Couples Resorts)." },
        { question: "Is the food better at adults-only?", answer: "Generally yes — adults-only resorts tend to invest more in fine dining (no kids' menus to maintain). Le Blanc, Hotel Xcaret Arte, Grand Velas, Excellence all have AAA Five Diamond restaurants." },
        { question: "Best adults-only for honeymoon?", answer: "Sandals Royal Caribbean Jamaica, Sanctuary Cap Cana, Le Blanc Spa Resort, Excellence Playa Mujeres, Hotel Xcaret Arte. All have honeymoon packages." },
      ]}
      ctaText="Find My Adults-Only Resort"
      ctaPrompt="I want an adults-only resort"
      internalLinks={[
        { label: "All-Inclusive", href: "/services/all-inclusive" },
        { label: "Honeymoon Packages", href: "/services/honeymoon" },
        { label: "Luxury Travel", href: "/services/luxury-travel" },
        { label: "Caribbean Destinations", href: "/destinations/caribbean" },
        { label: "Mexico Destinations", href: "/destinations/mexico" },
      ]}
      jsonLd={{ "@context": "https://schema.org", "@type": "Service", name: "Adults-Only Resort Booking", provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, serviceType: "Adults-Only Resort", description: "Adults-only resort booking across Excellence, Secrets, Sandals, Le Blanc, Hard Rock Heaven, Iberostar Grand, Hotel Xcaret Arte.", areaServed: "Worldwide" }}
    />
  );
}
