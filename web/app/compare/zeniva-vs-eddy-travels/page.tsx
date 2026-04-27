import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

const RIVAL = "Eddy Travels";
const URL_PATH = "/compare/zeniva-vs-eddy-travels";

export const metadata: Metadata = {
  title: `Zeniva vs ${RIVAL} — 2026 Honest Comparison | Zeniva`,
  description: `Side-by-side comparison: Zeniva (full AI travel agency) vs ${RIVAL} (chat-based AI travel assistant). Bookings, human escalation, specialty travel.`,
  keywords: [`zeniva vs eddy travels`, `eddy travels alternative`, `eddy travels review`, `messenger ai travel`, `chat ai travel agent`],
  openGraph: { title: `Zeniva vs ${RIVAL} — Side-by-Side`, description: `Full AI agency vs chat-based travel assistant.`, url: `https://www.zenivatravel.com${URL_PATH}`, siteName: "Zeniva Travel", type: "website", images: [{ url: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: `Zeniva vs ${RIVAL}` }] },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}` },
};

export default function ComparePage() {
  return (
    <SeoPage
      h1={`Zeniva vs ${RIVAL} — Honest 2026 Comparison`}
      subtitle={`${RIVAL} is a chat-first travel assistant primarily for finding flight and hotel deals. Zeniva is a full AI travel agency with end-to-end booking, human escalation, and specialty travel.`}
      heroImage="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-emerald-900/70 to-teal-900/60"
      badge="Independent comparison"
      sections={[
        { heading: "The fundamental difference", content: `<p>${RIVAL} began as a Messenger/WhatsApp-based travel deals chatbot — strong at quickly surfacing flight and hotel options through chat. Booking typically happens via redirect to OTA partners.</p><p>Zeniva is a full standalone agency with Lina AI conversation, real direct booking via Duffel + LiteAPI + specialty partners (yacht, villa, cruise), 24/7 human escalation in-chat, and multilingual support (EN/FR/ES).</p>` },
        { heading: "Side-by-side feature table", content: `<table style="width:100%; border-collapse:collapse; margin: 16px 0;">
<thead><tr style="background:#0F6CF5; color:white;"><th style="padding:10px; text-align:left;">Feature</th><th style="padding:10px;">${RIVAL}</th><th style="padding:10px;">Zeniva</th></tr></thead>
<tbody>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Chat-based interface</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅</td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;"><strong>Direct in-platform booking</strong></td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">limited / external</td><td style="text-align:center; border-bottom:1px solid #e5e7eb; background:#fef3c7;"><strong>✅ in-platform</strong></td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;"><strong>24/7 human escalation</strong></td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">limited</td><td style="text-align:center; border-bottom:1px solid #e5e7eb; background:#fef3c7;"><strong>✅</strong></td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Voice call</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">❌</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅ /call 24/7</td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Yacht / villa / cruise / weddings</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">❌</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅ all four</td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Multilingual auto</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">limited</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">EN, FR, ES</td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Payment plans</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">❌</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅ ZeniPay 0%</td></tr>
</tbody></table>` },
        { heading: `When ${RIVAL} wins`, content: `<p>Pick ${RIVAL} if you want quick flight/hotel deal alerts in your existing messaging app (Messenger, WhatsApp). It's lightweight and good for rapid price discovery.</p>` },
        { heading: "When Zeniva wins", content: `<p>Pick Zeniva if you want:</p><ul><li>End-to-end booking in one place (no redirect to other sites)</li><li>Specialty travel — yacht, villa, cruise, destination weddings</li><li>Real human escalation 24/7 in the same chat</li><li>Voice option for trip planning</li><li>Trilingual auto-detect (EN/FR/ES)</li><li>Payment plans via ZeniPay</li></ul>` },
      ]}
      highlights={[
        { icon: "star", title: "End-to-end booking", description: "Zeniva books directly; Eddy redirects to partners." },
        { icon: "shield", title: "Human escalation", description: "Zeniva: type 'human' anytime. Eddy: limited." },
        { icon: "anchor", title: "Specialty travel", description: "Yacht/villa/cruise/weddings — Zeniva only." },
        { icon: "phone", title: "Voice option", description: "Zeniva /call 24/7." },
        { icon: "map", title: "Trilingual", description: "EN/FR/ES auto." },
        { icon: "gift", title: "Payment plans", description: "ZeniPay 0% installments." },
      ]}
      faqs={[
        { question: `Does ${RIVAL} book directly?`, answer: `${RIVAL} primarily surfaces deals and routes you to partners for booking. Zeniva books directly through Duffel (flights) and LiteAPI (hotels).` },
        { question: `Can ${RIVAL} handle yacht or villa bookings?`, answer: `No — these specialty categories are not in Eddy's scope. Zeniva covers all four.` },
        { question: `Is ${RIVAL} multilingual?`, answer: `${RIVAL} is primarily English. Zeniva auto-detects and responds in EN, FR, ES.` },
        { question: "Voice support?", answer: "Zeniva /call 24/7. Eddy is text-only." },
        { question: "Payment plans?", answer: "Zeniva ZeniPay 0% interest. Eddy doesn't offer split payments." },
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
      jsonLd={{ "@context": "https://schema.org", "@type": "Article", headline: `Zeniva vs ${RIVAL} — Honest 2026 Comparison`, author: { "@type": "Organization", name: "Zeniva Travel" }, datePublished: "2026-04-27", dateModified: "2026-04-27", publisher: { "@type": "Organization", name: "Zeniva Travel", logo: { "@type": "ImageObject", url: "https://www.zenivatravel.com/branding/logo.png" } }, about: [{ "@type": "Thing", name: "Zeniva", url: "https://www.zenivatravel.com" }, { "@type": "Thing", name: RIVAL, url: "https://www.eddytravels.com" }] }}
    />
  );
}
