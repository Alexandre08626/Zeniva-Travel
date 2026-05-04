import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

const RIVAL = "Penny by Priceline";
const URL_PATH = "/compare/zeniva-vs-penny";

export const metadata: Metadata = {
  title: `Zeniva vs ${RIVAL} — 2026 Honest Comparison | Zeniva`,
  description: `Side-by-side comparison: Zeniva (full AI travel technology platform) vs ${RIVAL} (Priceline's in-app AI). Specialty travel, multilingual, payment plans.`,
  keywords: [`zeniva vs penny`, `priceline penny alternative`, `penny ai travel`, `priceline ai`, `best ai travel agent`, `alternative to priceline`],
  openGraph: { title: `Zeniva vs ${RIVAL} — Side-by-Side`, description: `Full AI agency vs Priceline's in-app AI assistant.`, url: `https://www.zenivatravel.com${URL_PATH}`, siteName: "Zeniva Travel", type: "website", images: [{ url: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: `Zeniva vs ${RIVAL}` }] },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}` },
};

export default function ComparePage() {
  return (
    <SeoPage
      h1={`Zeniva vs ${RIVAL} — Honest 2026 Comparison`}
      subtitle={`${RIVAL} is Priceline's in-app AI assistant — locked to Priceline inventory. Zeniva is an independent full AI travel technology platform with multi-supplier inventory and human escalation.`}
      heroImage="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-indigo-900/70 to-blue-900/60"
      badge="Independent comparison"
      sections={[
        { heading: "The fundamental difference", content: `<p><strong>${RIVAL} is a smart search interface inside the Priceline app. Zeniva is a standalone AI travel platform.</strong></p><p>Penny helps you navigate Priceline's existing inventory faster — answering questions like "what's the cheapest hotel in Cancun in March" using Priceline's data. The booking happens through Priceline's checkout. Support routes through Priceline.</p><p>Zeniva is independent — Lina AI sources from Duffel (flights), LiteAPI (hotels — 1.5M+ properties globally including ones not on Priceline), and direct partners for yacht/villa/cruise. Booking and support happen through Zeniva with 24/7 human escalation.</p>` },
        { heading: "Side-by-side feature table", content: `<table style="width:100%; border-collapse:collapse; margin: 16px 0;">
<thead><tr style="background:#0F6CF5; color:white;"><th style="padding:10px; text-align:left;">Feature</th><th style="padding:10px;">${RIVAL}</th><th style="padding:10px;">Zeniva</th></tr></thead>
<tbody>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Inventory access</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">Priceline only</td><td style="text-align:center; border-bottom:1px solid #e5e7eb; background:#fef3c7;"><strong>Multi-supplier (1.5M+ hotels)</strong></td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Real bookings</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">via Priceline</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅ direct</td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;"><strong>24/7 human escalation</strong></td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">via Priceline support</td><td style="text-align:center; border-bottom:1px solid #e5e7eb; background:#fef3c7;"><strong>✅ instant in chat</strong></td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Yacht / villa / cruise / weddings</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">❌</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅ all four</td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Voice call</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">❌</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅ /call 24/7</td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Multilingual auto</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">FR-CA</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">EN, FR, ES</td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Payment plans</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">Priceline payment options</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅ ZeniPay 0%</td></tr>
</tbody></table>` },
        { heading: `When ${RIVAL} wins`, content: `<p>Pick ${RIVAL} if you're already a Priceline power user. The integration with their massive inventory + Express Deals means you stay in one app. ${RIVAL} also supports French Canadian which is rare for AI travel tools.</p>` },
        { heading: "When Zeniva wins", content: `<p>Pick Zeniva if you want:</p><ul><li>Inventory beyond Priceline (especially luxury hotels, all-inclusive resorts with negotiated rates, private villas)</li><li>Specialty travel — yacht, villa, cruise, destination wedding</li><li>Human escalation directly from chat (not routed through Priceline support)</li><li>Voice option (/call 24/7)</li><li>Spanish support (in addition to EN and FR)</li><li>0% installment payment plans (ZeniPay)</li></ul>` },
      ]}
      highlights={[
        { icon: "star", title: "Independent agency", description: "Zeniva sources from multiple suppliers; Penny is locked to Priceline." },
        { icon: "shield", title: "Direct human escalation", description: "Type 'human' in Zeniva chat — real advisor takes over instantly." },
        { icon: "anchor", title: "Specialty travel", description: "Yacht, villa, cruise, weddings — Zeniva only." },
        { icon: "phone", title: "Voice option", description: "Zeniva /call 24/7." },
        { icon: "map", title: "Multi-language", description: "EN, FR, ES auto-detect." },
        { icon: "gift", title: "0% installment plans", description: "ZeniPay splits payment over time." },
      ]}
      faqs={[
        { question: `Can ${RIVAL} book yacht charters or destination weddings?`, answer: `No. Penny is for flights, hotels, and rental cars within Priceline's catalog. Yacht, villa, cruise, and wedding travel require a full agency like Zeniva.` },
        { question: `Is ${RIVAL} a real AI agent?`, answer: `Penny is more accurately a smart search interface for Priceline's existing inventory. Zeniva's Lina AI is closer to a real agent — handles open-ended trip planning, multi-step booking, and complex changes.` },
        { question: `Does ${RIVAL} have human escalation?`, answer: `Penny routes you to Priceline customer support if needed. Zeniva has direct human escalation in-chat — type "I want to talk to a human" and a real travel advisor takes the case.` },
        { question: "Which has better hotel inventory?", answer: `${RIVAL} = Priceline's catalog. Zeniva = LiteAPI (1.5M+ properties globally including luxury and all-inclusive with negotiated rates not on consumer OTAs).` },
        { question: "Best for budget travel?", answer: `${RIVAL} for Express Deals on Priceline. Zeniva for negotiated package rates that bundle flight + hotel + transfers.` },
      ]}
      ctaText="Try Zeniva — chat with Lina"
      ctaPrompt="I'd like to plan a trip"
      internalLinks={[
        { label: "Best AI Travel Agents 2026", href: "/blog/best-ai-travel-agents-usa-2026" },
        { label: "Zeniva vs Layla", href: "/compare/zeniva-vs-layla" },
        { label: "Zeniva vs Mindtrip", href: "/compare/zeniva-vs-mindtrip" },
        { label: "Zeniva vs Booked.ai", href: "/compare/zeniva-vs-booked-ai" },
        { label: "AI Travel Agent Service", href: "/services/ai-travel-agent" },
      ]}
      jsonLd={{ "@context": "https://schema.org", "@type": "Article", headline: `Zeniva vs ${RIVAL} — Honest 2026 Comparison`, author: { "@type": "Organization", name: "Zeniva Travel" }, datePublished: "2026-04-27", dateModified: "2026-04-27", publisher: { "@type": "Organization", name: "Zeniva Travel", logo: { "@type": "ImageObject", url: "https://www.zenivatravel.com/branding/logo.png" } }, about: [{ "@type": "Thing", name: "Zeniva", url: "https://www.zenivatravel.com" }, { "@type": "Thing", name: RIVAL, url: "https://www.priceline.com/penny" }] }}
    />
  );
}
