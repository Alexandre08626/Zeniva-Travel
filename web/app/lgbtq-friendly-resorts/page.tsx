import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LGBTQ+ Friendly Resorts & Destinations 2026 | Zeniva",
  description: "LGBTQ+ friendly travel from Zeniva. Curated resorts, cities, and destinations that welcome and celebrate LGBTQ+ travelers. Real bookings via Lina AI.",
  keywords: ["lgbtq friendly resorts", "gay friendly travel", "lgbtq vacation packages", "gay friendly cities", "lgbtq honeymoon", "out and proud travel", "rainbow resorts"],
  openGraph: { title: "LGBTQ+ Friendly Travel | Zeniva", description: "Curated resorts and destinations that welcome LGBTQ+ travelers.", url: "https://www.zenivatravel.com/lgbtq-friendly-resorts", siteName: "Zeniva Travel", type: "website", images: [{ url: "https://images.unsplash.com/photo-1519834785169-98be25ec3f84?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: "LGBTQ Travel — Zeniva" }] },
  alternates: { canonical: "https://www.zenivatravel.com/lgbtq-friendly-resorts" },
};

export default function LGBTQPage() {
  return (
    <SeoPage
      h1="LGBTQ+ Friendly Resorts & Destinations"
      subtitle="Not all 'gay-friendly' marketing is real. Zeniva curates resorts and destinations that genuinely welcome LGBTQ+ travelers — from Provincetown to Mykonos to Mexico's most inclusive properties."
      heroImage="https://images.unsplash.com/photo-1519834785169-98be25ec3f84?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-pink-900/70 to-violet-900/60"
      badge="Vetted welcoming properties"
      sections={[
        { heading: "What 'LGBTQ+ friendly' actually means at Zeniva", content: `<p>Many resorts call themselves "LGBTQ+ friendly" because they accept gay couples without harassment. That's the floor, not the ceiling. Zeniva's curated properties go further — they're places where you don't have to think twice about holding your partner's hand at dinner, where staff use correct pronouns, where the local destination supports LGBTQ+ rights legally and culturally.</p><p>We work with resorts that have explicit non-discrimination policies, host LGBTQ+ travel weeks, employ openly LGBTQ+ staff in visible positions, and operate in destinations where being out is genuinely safe.</p>` },
        { heading: "Top LGBTQ+ destinations for 2026", content: `<p><strong>Mexico (Puerto Vallarta, Mexico City):</strong> Puerto Vallarta is one of the most LGBTQ+-friendly destinations in Latin America — Zona Romántica is legendary. Almar Resort, Casa Cupula are LGBTQ+-owned/operated. Mexico City's Zona Rosa has a vibrant scene.</p><p><strong>Greece (Mykonos):</strong> Super Paradise Beach and the Mykonos town scene have been LGBTQ+ central since the 1970s. JK Place, Cavo Tagoo, and Belvedere all welcoming.</p><p><strong>Spain (Sitges, Madrid, Ibiza):</strong> Sitges is Spain's most famous gay destination. Madrid's Chueca neighborhood. Ibiza for the party scene.</p><p><strong>Provincetown MA, Fort Lauderdale FL, Palm Springs CA:</strong> US LGBTQ+ destinations with concentrated welcoming property options.</p><p><strong>Caribbean (specific properties only):</strong> Many Caribbean countries have legal restrictions on LGBTQ+ travelers. The exceptions: Curaçao, Aruba, Saint Martin, Puerto Rico, USVI all welcoming. Specific resorts in Jamaica and Dominican Republic also welcoming despite local laws.</p><p><strong>Thailand (Bangkok, Phuket, Koh Samui):</strong> Generally welcoming. Le Méridien, Marriott, W Hotels in major cities all LGBTQ+-affirming. Phuket gay scene at Patong.</p>` },
        { heading: "LGBTQ+ honeymoon destinations", content: `<p>For LGBTQ+ honeymoons specifically, Zeniva recommends destinations that not only welcome but where same-sex marriage is legally recognized: Mexico, Spain, Greece, Portugal, Iceland, Argentina, Australia, New Zealand, Canada, USA, Brazil, South Africa, plus the Netherlands, France, Germany, UK.</p><p>For overwater bungalow honeymoons, Tahiti and Maldives have welcoming properties — Soneva Fushi, Six Senses Laamu, Conrad Maldives. Bora Bora resorts (Four Seasons, Conrad, St. Regis) all welcoming.</p>` },
        { heading: "Destinations to research carefully (or avoid)", content: `<p>We won't book trips to destinations with active legal persecution of LGBTQ+ travelers. Zeniva specifically does not recommend Saudi Arabia, UAE (carefully — Dubai/Abu Dhabi safer than rest), Egypt, Morocco (legal risk), Russia, Iran, much of sub-Saharan Africa outside South Africa.</p><p>Caribbean countries with anti-LGBTQ+ laws (Jamaica, Saint Lucia, Barbados) — we book specific welcoming resorts in these countries but advise caution off-property.</p>` },
      ]}
      highlights={[
        { icon: "star", title: "Vetted welcoming resorts", description: "Properties with explicit non-discrimination + active LGBTQ+ welcome." },
        { icon: "users", title: "LGBTQ+-owned options", description: "We highlight LGBTQ+-owned and operated properties when available." },
        { icon: "phone", title: "Discreet planning", description: "Lina AI conversation is private. Human escalation respects your privacy." },
        { icon: "shield", title: "Legal & cultural safety", description: "We flag destinations with legal/cultural risk and recommend safer alternatives." },
        { icon: "gift", title: "Honeymoon expertise", description: "LGBTQ+-friendly honeymoon destinations where marriage is legally recognized." },
        { icon: "map", title: "Group travel friendly", description: "LGBTQ+ group travel including Pride trips and friend group reunions." },
      ]}
      faqs={[
        { question: "Best LGBTQ+ honeymoon destination?", answer: "Greece (Mykonos), Mexico (Puerto Vallarta or Riviera Maya specific properties), Spain (Sitges or Mallorca), Tahiti/Bora Bora overwater bungalows. All welcoming and where same-sex marriage is legally recognized or respected." },
        { question: "Are all-inclusive resorts LGBTQ+ friendly?", answer: "Most major brands (Sandals, Hard Rock, Iberostar, Hyatt, Excellence) have non-discrimination policies. Sandals specifically markets to LGBTQ+ couples in 2026. We book the properties we know are genuinely welcoming, not just legally compliant." },
        { question: "Caribbean destinations to avoid?", answer: "Jamaica, Saint Lucia, Barbados have anti-LGBTQ+ laws on the books. Specific resorts in these countries are still welcoming but we advise off-property caution. Curaçao, Aruba, Saint Martin, Puerto Rico, USVI all welcoming." },
        { question: "Can I do an LGBTQ+ wedding destination trip?", answer: "Yes — see our /services/destination-weddings page. We coordinate group travel, room blocks, and local vendors who actively welcome LGBTQ+ couples." },
        { question: "Privacy when booking?", answer: "Yes. Conversations with Lina AI and our human advisors are private. Your relationship status and details aren't shared with third parties beyond what's needed for the booking." },
      ]}
      ctaText="Plan an LGBTQ+ Friendly Trip"
      ctaPrompt="I'd like LGBTQ+ friendly travel recommendations"
      internalLinks={[
        { label: "Honeymoon Packages", href: "/services/honeymoon" },
        { label: "Adults-Only Resorts", href: "/services/adults-only-resorts" },
        { label: "Destination Weddings", href: "/services/destination-weddings" },
        { label: "Mexico Destinations", href: "/destinations/mexico" },
        { label: "Caribbean Destinations", href: "/destinations/caribbean" },
      ]}
      jsonLd={{ "@context": "https://schema.org", "@type": "Service", name: "LGBTQ+ Friendly Travel Planning", provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, serviceType: "LGBTQ+ Travel", description: "Curated LGBTQ+ friendly resorts and destinations with vetted welcoming properties.", areaServed: "Worldwide" }}
    />
  );
}
