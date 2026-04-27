import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

const RIVAL = "Acai Travel";
const URL_PATH = "/compare/zeniva-vs-acai-travel";

export const metadata: Metadata = {
  title: `Zeniva vs ${RIVAL} — 2026 Honest Comparison | Zeniva`,
  description: `Side-by-side: Zeniva (consumer AI travel agency) vs ${RIVAL} (B2B AI agents for travel platforms). Different audiences, different jobs.`,
  keywords: [`zeniva vs acai travel`, `acai travel alternative`, `acai travel review`, `consumer ai travel agent`, `b2b travel ai`],
  openGraph: { title: `Zeniva vs ${RIVAL} — Side-by-Side`, description: `Consumer AI travel agency vs B2B AI agent platform.`, url: `https://www.zenivatravel.com${URL_PATH}`, siteName: "Zeniva Travel", type: "website", images: [{ url: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: `Zeniva vs ${RIVAL}` }] },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}` },
};

export default function ComparePage() {
  return (
    <SeoPage
      h1={`Zeniva vs ${RIVAL} — Honest 2026 Comparison`}
      subtitle={`${RIVAL} sells AI agents to travel companies (B2B). Zeniva is a consumer-facing AI travel agency that books your trip. Different products for different audiences.`}
      heroImage="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-violet-900/70 to-pink-900/60"
      badge="Independent comparison"
      sections={[
        { heading: "The fundamental difference", content: `<p><strong>${RIVAL} is a B2B AI infrastructure company. They sell AI agents that travel agencies, OTAs, and travel suppliers can deploy on their own platforms.</strong></p><p>If you're a travel business looking for AI tooling to add to your existing site or call center, Acai is one option to evaluate. They're a vendor.</p><p><strong>Zeniva is a consumer-facing travel agency.</strong> You as a traveler chat directly with Lina AI on zenivatravel.com to plan and book your own trip. These two companies don't really compete — they serve different audiences.</p>` },
        { heading: "Audience comparison", content: `<table style="width:100%; border-collapse:collapse; margin: 16px 0;">
<thead><tr style="background:#0F6CF5; color:white;"><th style="padding:10px; text-align:left;">Aspect</th><th style="padding:10px;">${RIVAL}</th><th style="padding:10px;">Zeniva</th></tr></thead>
<tbody>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Audience</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">Travel businesses</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">Travelers (consumers)</td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Product type</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">B2B AI infrastructure</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">B2C AI travel agency</td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Can a traveler book a trip?</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">Only via clients deploying their AI</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅ directly</td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Pricing</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">Enterprise contracts</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">Free for travelers (commission from suppliers)</td></tr>
</tbody></table>` },
        { heading: "If you're a traveler", content: `<p>Zeniva is the right choice. Chat with <a href="/chat">Lina</a> or call <a href="/call">/call</a> to plan and book your trip.</p>` },
        { heading: "If you're a travel business", content: `<p>Acai sells AI agents you can integrate. Zeniva isn't a vendor in this category — but if you're an agency interested in white-labeling Zeniva's tech for internal use, contact us at <a href="/contact">our contact page</a> to discuss.</p>` },
      ]}
      highlights={[
        { icon: "star", title: "Different audiences", description: "Acai = B2B for businesses. Zeniva = B2C for travelers." },
        { icon: "users", title: "Travelers go to Zeniva", description: "Acai doesn't sell directly to travelers." },
        { icon: "anchor", title: "Specialty travel", description: "Yacht, villa, cruise, weddings — Zeniva covers." },
        { icon: "phone", title: "Voice + chat", description: "Zeniva /chat and /call 24/7." },
        { icon: "map", title: "Multilingual", description: "EN/FR/ES auto." },
        { icon: "shield", title: "Human escalation", description: "Zeniva: instant in-chat." },
      ]}
      faqs={[
        { question: `Is ${RIVAL} for travelers or travel companies?`, answer: `${RIVAL} is a B2B platform that sells AI agents to travel companies. Travelers don't directly use Acai; they use products built on Acai's tech.` },
        { question: "If I'm a traveler, who should I use?", answer: "Zeniva — direct consumer-facing AI travel agency. Chat at /chat or call /call 24/7." },
        { question: "Can I book a yacht charter with Acai?", answer: "Acai is infrastructure, not a booking platform. For yacht charters, Zeniva covers Caribbean, Mediterranean, Bahamas, Polynesia." },
        { question: "Are these companies competitors?", answer: "Not really — different audiences. Acai = enterprise tooling. Zeniva = consumer agency." },
        { question: "Does Zeniva offer B2B?", answer: "Not currently as a packaged product. Contact us for white-label discussions." },
      ]}
      ctaText="Try Zeniva — chat with Lina"
      ctaPrompt="I'd like to plan a trip"
      internalLinks={[
        { label: "Best AI Travel Agents 2026", href: "/blog/best-ai-travel-agents-usa-2026" },
        { label: "Zeniva vs Layla", href: "/compare/zeniva-vs-layla" },
        { label: "Zeniva vs Mindtrip", href: "/compare/zeniva-vs-mindtrip" },
        { label: "Zeniva vs Penny", href: "/compare/zeniva-vs-penny" },
        { label: "AI Travel Agent Service", href: "/services/ai-travel-agent" },
      ]}
      jsonLd={{ "@context": "https://schema.org", "@type": "Article", headline: `Zeniva vs ${RIVAL} — Honest 2026 Comparison`, author: { "@type": "Organization", name: "Zeniva Travel" }, datePublished: "2026-04-27", dateModified: "2026-04-27", publisher: { "@type": "Organization", name: "Zeniva Travel", logo: { "@type": "ImageObject", url: "https://www.zenivatravel.com/branding/logo.png" } }, about: [{ "@type": "Thing", name: "Zeniva", url: "https://www.zenivatravel.com" }, { "@type": "Thing", name: RIVAL, url: "https://www.acaitravel.com" }] }}
    />
  );
}
