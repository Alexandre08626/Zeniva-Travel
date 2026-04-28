import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lina AI Languages — 6 Native Languages Auto-Detected | Zeniva",
  description: "Lina AI speaks English, French, Spanish, Portuguese, German, Italian — all natively, auto-detected. Mid-conversation language switching supported.",
  keywords: ["Lina AI languages", "multilingual AI travel", "AI travel agent French Spanish Portuguese German Italian", "Lina AI multilingual"],
  openGraph: { title: "Lina AI Languages — 6 Languages Native | Zeniva", description: "Auto-detected, native quality, mid-conversation switching.", url: "https://www.zenivatravel.com/lina/languages", siteName: "Zeniva Travel", type: "article", images: [{ url: "/branding/lina-avatar.png", width: 1200, height: 630, alt: "Lina languages" }] },
  alternates: { canonical: "https://www.zenivatravel.com/lina/languages" },
};

export default function LinaLanguagesPage() {
  return (
    <SeoPage
      h1="Lina AI Languages — 6 Native Languages, Auto-Detected"
      subtitle="Lina speaks English, French, Spanish, Portuguese, German, Italian — all native quality, all auto-detected from how you write. Switch mid-conversation, mix languages, no manual setting required."
      heroImage="/branding/lina-avatar.png"
      heroGradient="from-emerald-900/70 to-blue-900/60"
      badge="6 languages · auto-detected"
      sections={[
        {
          heading: "How language detection works",
          content: `<p>When you write to Lina, the underlying LLM (Anthropic Claude) detects your language from the first message. Lina then responds in the same language. There's no language toggle, no menu, no setting — just write in whatever language you're comfortable with.</p>
<p>Mid-conversation switching is supported. Start in English, ask a question in French, switch back to English — Lina handles all of it without confusion.</p>`,
        },
        {
          heading: "English (EN)",
          content: `<p>Native quality across US, UK, Canada, Australia variants. Lina detects regional spelling (color vs colour, traveler vs traveller) and matches accordingly.</p>
<p>Strongest knowledge base since most travel data trains in English. Pricing, hotel descriptions, route information all originate in English then translate.</p>
<p>Available everywhere on Zeniva. Default for /chat and /call.</p>`,
        },
        {
          heading: "French (FR)",
          content: `<p>Native French and Quebec French both supported. Detection picks up regional vocabulary differences (week-end vs fin de semaine, parking vs stationnement, voiture vs char).</p>
<p>Localized pages: /fr (homepage), /fr/lina, /fr/services/yacht-charter, /fr/services/villa-rental, /fr/services/cruises, /fr/services/destination-weddings, /fr/chat, /fr/call.</p>
<p>Particularly strong on Caribbean French destinations (Martinique, Guadeloupe, Réunion) and France/Quebec markets.</p>`,
        },
        {
          heading: "Spanish (ES)",
          content: `<p>Native Spanish across Spain, Mexico, Argentina, Colombia, Chile, Peru variants. Lina handles vocabulary differences (coger vs tomar, vosotros vs ustedes) appropriately.</p>
<p>Localized pages: /es (homepage), /es/lina, /es/services/ai-travel-agent, /es/services/luxury-travel, /es/services/yacht-charter, /es/services/cruises.</p>
<p>Strongest knowledge for Mexico, Spain, Latin America destinations.</p>`,
        },
        {
          heading: "Portuguese (PT)",
          content: `<p>Brazilian Portuguese (PT-BR) primary, European Portuguese (PT-PT) fully supported.</p>
<p>Localized pages: /pt (homepage), /pt/lina, /pt/services/ai-travel-agent, /pt/services/luxury-travel, /pt/services/cruises.</p>
<p>Strong on Brazil-departing trips (São Paulo, Rio) and Portugal/Algarve destinations.</p>`,
        },
        {
          heading: "German (DE)",
          content: `<p>Standard German with awareness of Germany, Austria, Switzerland variants.</p>
<p>Localized pages: /de (homepage), /de/lina, /de/services/ai-travel-agent, /de/services/luxury-travel, /de/services/yacht-charter.</p>
<p>Particularly strong on Frankfurt-departing trips, Mediterranean charter holidays, ski destinations.</p>`,
        },
        {
          heading: "Italian (IT)",
          content: `<p>Standard Italian with Swiss-Italian awareness.</p>
<p>Localized pages: /it (homepage), /it/lina, /it/services/ai-travel-agent, /it/services/luxury-travel.</p>
<p>Strong on Mediterranean destinations, Italian wine regions, charter trips departing Italian ports.</p>`,
        },
        {
          heading: "Languages NOT yet supported (honest)",
          content: `<p>Lina does not yet have native support for: <strong>Mandarin Chinese, Korean, Japanese, Arabic, Hindi, Russian</strong>, and most other languages.</p>
<p>If you write in one of these, Lina may understand the basic intent but the response quality will be poor. The recommended path is to escalate to a human advisor who can route to a translator service.</p>
<p>Roadmap: we evaluate native support based on traveler demand. Highest priority for next addition: Japanese, Mandarin, Korean.</p>`,
        },
      ]}
      highlights={[
        { icon: "star", title: "Auto-detected", description: "Write in any of 6 languages — Lina detects and responds." },
        { icon: "users", title: "Mid-conversation switching", description: "Mix languages freely — Lina handles transitions cleanly." },
        { icon: "phone", title: "Voice + chat both multilingual", description: "/chat and /call both support all 6 languages 24/7." },
        { icon: "map", title: "Regional variant awareness", description: "Quebec French vs France French, Mexican Spanish vs Spain Spanish, PT-BR vs PT-PT." },
        { icon: "shield", title: "Native quality", description: "Each language tuned with native-speaker review — not raw machine translation." },
        { icon: "gift", title: "Localized pages 6 languages", description: "Homepage + key services pages translated for each language." },
      ]}
      faqs={[
        { question: "Does Lina speak my regional dialect?", answer: "She detects and responds appropriately for major regional variants of all 6 supported languages — US/UK/CA/AU English, France/Quebec French, Spain/Mexico/LATAM Spanish, BR/PT Portuguese, DE/AT/CH German, IT/CH-IT Italian." },
        { question: "Can I switch languages mid-chat?", answer: "Yes. Start in English, switch to French, switch back — Lina handles seamlessly. No manual toggle." },
        { question: "What if I write in a language Lina doesn't speak?", answer: "Mandarin, Korean, Japanese, Arabic, Hindi, Russian aren't natively supported yet. Escalate to a human advisor by typing the equivalent of 'human help' in your language — the team will route to a translator service." },
        { question: "Are voice calls multilingual too?", answer: "Yes. /call supports all 6 languages 24/7 — speech recognition + voice synthesis match your spoken language." },
        { question: "When will Japanese / Mandarin be added?", answer: "We evaluate based on traveler demand. Highest priority for next native language additions are Japanese, Mandarin, Korean." },
      ]}
      ctaText="Chat with Lina in your language"
      ctaPrompt="Hello"
      internalLinks={[
        { label: "Meet Lina (EN)", href: "/lina" },
        { label: "Lina FR", href: "/fr/lina" },
        { label: "Lina ES", href: "/es/lina" },
        { label: "Lina PT", href: "/pt/lina" },
        { label: "Lina DE", href: "/de/lina" },
        { label: "Lina IT", href: "/it/lina" },
        { label: "How Lina Works", href: "/lina/how-it-works" },
      ]}
    />
  );
}
