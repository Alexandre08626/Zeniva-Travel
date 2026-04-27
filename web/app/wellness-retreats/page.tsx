import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";
const URL_PATH = "/wellness-retreats";
export const metadata: Metadata = {
  title: "Wellness Retreats — Yoga, Spa, Detox, Meditation 2026 | Zeniva",
  description: "Wellness retreat planning with Zeniva. Yoga retreats Bali, spa retreats Thailand, detox retreats Costa Rica, meditation Bhutan. Real bookings via Lina AI.",
  keywords: ["wellness retreat", "yoga retreat Bali", "spa retreat Thailand", "detox retreat", "meditation retreat", "ayurveda retreat", "wellness vacation"],
  openGraph: { title: "Wellness Retreats | Zeniva", description: "Yoga, spa, detox, meditation retreats worldwide.", url: `https://www.zenivatravel.com${URL_PATH}`, siteName: "Zeniva Travel", type: "website", images: [{ url: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: "Wellness Retreats — Zeniva" }] },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}` },
};
export default function P() { return (
  <SeoPage h1="Wellness Retreats — Yoga, Spa, Detox, Meditation"
    subtitle="From COMO Shambhala in Bali to Ananda in the Himalayas, Zeniva books the world's most rigorous wellness retreats — yoga, spa, detox, ayurveda, meditation. Curated by what works, not by sponsorship."
    heroImage="https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1600&q=85" heroGradient="from-emerald-900/70 to-stone-900/60" badge="Vetted retreats only"
    sections={[
      { heading: "Why retreat planning is harder than it looks", content: `<p>The wellness retreat market is flooded with marketing — every Instagram-friendly hotel calls itself a "wellness retreat" because they have a yoga mat and a juice bar. The real wellness retreats are different — they have certified practitioners, structured programs (not just à la carte spa treatments), measurable outcomes, and a holistic philosophy beyond aesthetics.</p><p>Zeniva works specifically with the small set of retreats that deliver real wellness outcomes — not the generic "spa hotel with a yoga class" that dominate search results.</p>` },
      { heading: "Top wellness retreat destinations", content: `<p><strong>Bali (Ubud, Canggu):</strong> COMO Shambhala (silent retreat option), Fivelements Bali, The Yoga Barn, Bagus Jati. Yoga + ayurveda + plant-based food. From $3,000-$8,000 for 7 nights.</p><p><strong>Thailand (Koh Samui, Phuket):</strong> Kamalaya (industry leader), COMO Point Yamu, Six Senses Yao Noi. Detox, weight management, traditional Thai medicine.</p><p><strong>India (Rishikesh, Kerala):</strong> Ananda in the Himalayas (premier ayurveda), Soukya, Vana, Niraamaya Surya Samudra. Multi-week ayurveda + yoga programs.</p><p><strong>Costa Rica:</strong> Pranamar Villas, Blue Spirit, The Sanctuary at Two Rivers. Yoga + jungle + raw food.</p><p><strong>Mexico (Tulum, Riviera Maya):</strong> Ahau Tulum, Sanara, Habitas. Yoga + Mexican wellness traditions + cenote ceremonies.</p><p><strong>European (Italy, France, Iceland):</strong> Lefay (Italy), Sha (Spain), Borgo Egnazia (Italy), Brösarp Retreat (Sweden), GeoSea (Iceland). Premium spa + thermal medicine.</p>` },
      { heading: "Choosing the right retreat", content: `<p>Before booking, clarify: <strong>what outcome you want</strong> (detox, weight loss, stress relief, deep yoga practice, meditation, fertility support). <strong>Length</strong> (3-day intro vs 7-day immersion vs 14-21 day full program). <strong>Diet philosophy</strong> (plant-based, raw, intermittent fasting, ayurveda). <strong>Group vs private</strong>. <strong>Activity level</strong> (gentle to advanced).</p><p>Lina asks these questions in chat to filter to the right retreat for you.</p>` },
    ]}
    highlights={[
      { icon: "star", title: "Vetted retreats only", description: "Real wellness outcomes — not just spa hotels with yoga mats." },
      { icon: "map", title: "Top destinations", description: "Bali, Thailand, India, Costa Rica, Mexico, European spa towns." },
      { icon: "phone", title: "Lina AI 24/7", description: "Chat or voice — Lina matches outcome + length + diet to retreat." },
      { icon: "shield", title: "Certified practitioners", description: "Only retreats with certified yoga teachers, ayurveda doctors, or licensed therapists." },
      { icon: "users", title: "Group or private", description: "Group retreats for community + private retreats for deep work." },
      { icon: "gift", title: "Multi-week programs", description: "Ayurveda 14-21 day programs require deep commitment — we coordinate." },
    ]}
    faqs={[
      { question: "Best wellness retreat for first-timers?", answer: "Kamalaya (Koh Samui), COMO Shambhala (Bali), Ananda (Himalayas). All offer structured introductory 5-7 day programs with assessment + practitioners." },
      { question: "Best detox retreat?", answer: "Kamalaya (Thailand) for medical detox. Sha (Spain) for premium European detox. Ananda (India) for ayurvedic detox." },
      { question: "Best yoga retreat in Bali?", answer: "The Yoga Barn for community + tradition. COMO Shambhala for premium + silent retreat option. Fivelements Bali for plant-based + healing focus." },
      { question: "How long is ideal?", answer: "5-7 days for introduction. 10-14 days for meaningful change. 21+ days for transformation work (especially ayurveda)." },
      { question: "Cost ranges?", answer: "Bali $3,000-$8,000 per 7 nights. Thailand $4,000-$10,000. India $2,500-$7,000. Premium European retreats $8,000-$20,000+." },
    ]}
    ctaText="Plan a Wellness Retreat" ctaPrompt="I'd like to book a wellness retreat"
    internalLinks={[ { label: "Solo Travel", href: "/solo-travel" }, { label: "Luxury Travel", href: "/services/luxury-travel" }, { label: "Eco-Friendly Travel", href: "/eco-friendly-travel" }, { label: "Honeymoon Packages", href: "/services/honeymoon" } ]}
    jsonLd={{ "@context": "https://schema.org", "@type": "Service", name: "Wellness Retreat Planning", provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, serviceType: "Wellness Travel", description: "Wellness retreat planning including yoga, spa, detox, ayurveda, meditation programs with certified practitioners.", areaServed: "Worldwide" }}
  />
); }
