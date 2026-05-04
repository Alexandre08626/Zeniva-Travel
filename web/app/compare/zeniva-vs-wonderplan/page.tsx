import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

const RIVAL = "Wonderplan";
const URL_PATH = "/compare/zeniva-vs-wonderplan";

export const metadata: Metadata = {
  title: `Zeniva vs ${RIVAL} — 2026 Honest Comparison | Zeniva`,
  description: `Side-by-side: Zeniva (full AI travel technology platform with bookings) vs ${RIVAL} (free AI itinerary generator). Different jobs, both useful.`,
  keywords: [`zeniva vs wonderplan`, `wonderplan alternative`, `wonderplan ai review`, `free ai itinerary generator`, `ai trip planner`],
  openGraph: { title: `Zeniva vs ${RIVAL} — Side-by-Side`, description: `Full AI agency vs free itinerary generator.`, url: `https://www.zenivatravel.com${URL_PATH}`, siteName: "Zeniva Travel", type: "website", images: [{ url: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: `Zeniva vs ${RIVAL}` }] },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}` },
};

export default function ComparePage() {
  return (
    <SeoPage
      h1={`Zeniva vs ${RIVAL} — Honest 2026 Comparison`}
      subtitle={`${RIVAL} is a free AI itinerary generator. Zeniva is a full AI travel technology platform that books your trip end-to-end. Use them together or pick the right one for the job.`}
      heroImage="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-pink-900/70 to-purple-900/60"
      badge="Independent comparison"
      sections={[
        { heading: "The fundamental difference", content: `<p><strong>${RIVAL} is a free AI tool that generates day-by-day travel itineraries. Zeniva is a full AI travel technology platform that books your trip with real flights, hotels, transfers, and human support.</strong></p><p>Wonderplan is great for early-stage trip planning — you give it a destination, dates, interests, and it spits out a structured day-by-day plan with attractions, restaurants, and rough logistics. No booking happens.</p><p>Zeniva picks up where Wonderplan ends. Lina AI takes your trip vision, builds a real bookable proposal (flights via Duffel, hotels via LiteAPI), books it, and a human travel advisor escalates any complex case 24/7.</p>` },
        { heading: "Side-by-side feature table", content: `<table style="width:100%; border-collapse:collapse; margin: 16px 0;">
<thead><tr style="background:#0F6CF5; color:white;"><th style="padding:10px; text-align:left;">Feature</th><th style="padding:10px;">${RIVAL}</th><th style="padding:10px;">Zeniva</th></tr></thead>
<tbody>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Free to use</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅ (no booking fees)</td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">AI itinerary generation</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅ strong</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅ via Lina chat</td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;"><strong>Real flight + hotel booking</strong></td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">❌</td><td style="text-align:center; border-bottom:1px solid #e5e7eb; background:#fef3c7;"><strong>✅</strong></td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;"><strong>24/7 human escalation</strong></td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">❌</td><td style="text-align:center; border-bottom:1px solid #e5e7eb; background:#fef3c7;"><strong>✅</strong></td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Yacht / villa / cruise / weddings</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">❌</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅ all four</td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Voice option</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">❌</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅ /call 24/7</td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Multilingual</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">limited</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">EN, FR, ES</td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Payment plans</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">N/A</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅ ZeniPay 0%</td></tr>
</tbody></table>` },
        { heading: `When ${RIVAL} wins`, content: `<p>Pick ${RIVAL} for early-stage research. The free itinerary generator is genuinely useful for getting a structured day-by-day starting point on a new destination. No login required, no commitment.</p>` },
        { heading: "When Zeniva wins", content: `<p>Pick Zeniva when you want to actually book the trip. Zeniva turns your travel vision into confirmed flights + hotels + transfers + ongoing support. Specialty travel like yacht, villa, cruise, destination weddings — only Zeniva covers these.</p>` },
        { heading: "Best workflow: combine", content: `<p>Use ${RIVAL} to generate your draft itinerary. Then bring it to <a href="/chat">Lina at Zeniva</a> to convert into a real bookable trip with flights and hotels matching your itinerary. You get the planning intelligence + the booking infrastructure + the human safety net.</p>` },
      ]}
      highlights={[
        { icon: "star", title: "Different jobs", description: "Wonderplan plans, Zeniva books." },
        { icon: "shield", title: "Human escalation", description: "Zeniva: type 'human' anytime." },
        { icon: "anchor", title: "Specialty travel", description: "Yacht/villa/cruise/weddings — Zeniva only." },
        { icon: "phone", title: "Voice support", description: "Zeniva /call 24/7." },
        { icon: "map", title: "Combine workflow", description: "Wonderplan plan → Zeniva book." },
        { icon: "gift", title: "Payment plans", description: "ZeniPay 0% installments." },
      ]}
      faqs={[
        { question: `Can ${RIVAL} book my trip?`, answer: `No. Wonderplan generates itinerary plans only. Booking happens externally. Zeniva books directly.` },
        { question: `Is ${RIVAL} free?`, answer: `Yes, both Wonderplan and Zeniva are free for the planning/chat experience. Zeniva also charges $0 booking fees (revenue from supplier commissions).` },
        { question: "Should I use both?", answer: "Yes — smart workflow: generate your draft itinerary on Wonderplan, then bring it to Lina on Zeniva to convert into a real booking with flights and hotels." },
        { question: "Yacht or villa booking?", answer: "Wonderplan doesn't cover specialty travel. Zeniva books yacht charters, private villas, cruises, and destination weddings." },
        { question: "Multi-language?", answer: "Zeniva auto-detects EN/FR/ES. Wonderplan is primarily English." },
      ]}
      ctaText="Try Zeniva — chat with Lina"
      ctaPrompt="I'd like to plan a trip"
      internalLinks={[
        { label: "Best AI Travel Agents 2026", href: "/blog/best-ai-travel-agents-usa-2026" },
        { label: "Zeniva vs Layla", href: "/compare/zeniva-vs-layla" },
        { label: "Zeniva vs Mindtrip", href: "/compare/zeniva-vs-mindtrip" },
        { label: "Zeniva vs ChatGPT for Travel", href: "/compare/zeniva-vs-chatgpt-for-travel" },
        { label: "AI Travel Agent Service", href: "/services/ai-travel-agent" },
      ]}
      jsonLd={{ "@context": "https://schema.org", "@type": "Article", headline: `Zeniva vs ${RIVAL} — Honest 2026 Comparison`, author: { "@type": "Organization", name: "Zeniva Travel" }, datePublished: "2026-04-27", dateModified: "2026-04-27", publisher: { "@type": "Organization", name: "Zeniva Travel", logo: { "@type": "ImageObject", url: "https://www.zenivatravel.com/branding/logo.png" } }, about: [{ "@type": "Thing", name: "Zeniva", url: "https://www.zenivatravel.com" }, { "@type": "Thing", name: RIVAL, url: "https://wonderplan.ai" }] }}
    />
  );
}
