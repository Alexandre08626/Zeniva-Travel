import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";
const RIVAL = "Hopper"; const URL_PATH = "/compare/zeniva-vs-hopper";
export const metadata: Metadata = {
  title: `Zeniva vs ${RIVAL} — 2026 Honest Comparison | Zeniva`,
  description: `Side-by-side comparison: Zeniva (full AI travel agency with human escalation) vs ${RIVAL} (price-prediction flight/hotel app). Specialty travel, multilingual, support.`,
  keywords: [`zeniva vs hopper`, `hopper alternative`, `hopper review`, `flight price prediction`, `ai travel agent`],
  openGraph: { title: `Zeniva vs ${RIVAL} — Side-by-Side`, description: `Full AI travel agency vs price-prediction app.`, url: `https://www.zenivatravel.com${URL_PATH}`, siteName: "Zeniva Travel", type: "website", images: [{ url: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: `Zeniva vs ${RIVAL}` }] },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}` },
};
export default function P() { return (
  <SeoPage h1={`Zeniva vs ${RIVAL} — Honest 2026 Comparison`}
    subtitle={`${RIVAL} is a price-prediction app with bookings (flights + hotels). Zeniva is a full AI travel agency. Different jobs — and Zeniva doesn't have Hopper's controversial price freeze fees.`}
    heroImage="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=1600&q=85" heroGradient="from-rose-900/70 to-blue-900/60" badge="Independent comparison"
    sections={[
      { heading: "The fundamental difference", content: `<p>${RIVAL} built its reputation on price prediction — telling you when to book a flight for the lowest fare. They've expanded into hotel and car bookings. The app is great for budget-conscious travelers focused on individual flight or hotel deals. But it has well-documented support issues and controversial cancellation/refund practices ("price freeze" fees that don't always work as advertised).</p><p>Zeniva is a full travel agency with AI conversation, real bookings (Duffel for flights, LiteAPI for hotels), 24/7 human escalation, and specialty categories ${RIVAL} doesn't touch (yacht, villa, cruise, destination weddings).</p>` },
      { heading: "Side-by-side", content: `<table style="width:100%; border-collapse:collapse; margin: 16px 0;">
<thead><tr style="background:#0F6CF5; color:white;"><th style="padding:10px; text-align:left;">Feature</th><th style="padding:10px;">${RIVAL}</th><th style="padding:10px;">Zeniva</th></tr></thead>
<tbody>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Real flight + hotel booking</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅</td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Price prediction</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅ signature</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">limited</td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;"><strong>24/7 human escalation</strong></td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">⚠️ documented issues</td><td style="text-align:center; border-bottom:1px solid #e5e7eb; background:#fef3c7;"><strong>✅ instant</strong></td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Yacht / villa / cruise / weddings</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">❌</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅ all four</td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Voice option</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">❌</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅ /call 24/7</td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Multilingual</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">limited</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">EN, FR, ES auto</td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Hidden fees / fee transparency</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">⚠️ price freeze fees</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">$0 booking fees</td></tr>
</tbody></table>` },
      { heading: `When ${RIVAL} wins`, content: `<p>Pick ${RIVAL} for individual flight or hotel deal hunting where you're confident the trip will go smoothly. Their price prediction is genuinely useful for "should I book now or wait" decisions on common routes.</p>` },
      { heading: "When Zeniva wins", content: `<p>Pick Zeniva when you want a full trip booked + supported (not just a flight), specialty travel (yacht/villa/cruise/weddings), human reachable when something goes wrong, multilingual support, or when Hopper's documented support issues are a deal-breaker.</p>` },
    ]}
    highlights={[
      { icon: "star", title: "Different scopes", description: "Hopper = flight/hotel deals. Zeniva = full agency." },
      { icon: "shield", title: "Real human support", description: "Zeniva: 24/7 instant escalation. Hopper: documented support issues." },
      { icon: "anchor", title: "Specialty travel", description: "Yacht/villa/cruise/weddings — Zeniva only." },
      { icon: "phone", title: "Voice + chat", description: "Zeniva /call 24/7." },
      { icon: "map", title: "Trilingual", description: "EN/FR/ES auto." },
      { icon: "gift", title: "$0 booking fees", description: "Zeniva: no hidden fees, no price freeze charges." },
    ]}
    faqs={[
      { question: `Is ${RIVAL} reliable?`, answer: `${RIVAL}'s flight booking works for most simple cases. Issues arise with cancellations, refunds, schedule changes, and the controversial "price freeze" feature. Trustpilot and BBB show many support complaints.` },
      { question: `Can ${RIVAL} book yacht charters or villas?`, answer: `No. Hopper covers flights, hotels, cars. Yacht charter, villa rental, cruise, destination weddings — Zeniva only.` },
      { question: "Hopper's price prediction — is it accurate?", answer: "Often, for common US routes. Less accurate for international and shoulder-season pricing. Lina compares live prices in real time without prediction." },
      { question: "Multi-language?", answer: "Hopper is English-first. Zeniva auto-detects EN/FR/ES." },
      { question: "Should I use both?", answer: "Use Hopper for flight price tracking on a known route. Use Zeniva to actually book a full trip." },
    ]}
    ctaText="Try Zeniva — chat with Lina" ctaPrompt="I'd like to plan a trip"
    internalLinks={[ { label: "Best AI Travel Agents 2026", href: "/blog/best-ai-travel-agents-usa-2026" }, { label: "Zeniva vs Booked.ai", href: "/compare/zeniva-vs-booked-ai" }, { label: "Zeniva vs Penny", href: "/compare/zeniva-vs-penny" }, { label: "AI Travel Agent Service", href: "/services/ai-travel-agent" } ]}
    jsonLd={{ "@context": "https://schema.org", "@type": "Article", headline: `Zeniva vs ${RIVAL} — Honest 2026 Comparison`, author: { "@type": "Organization", name: "Zeniva Travel" }, datePublished: "2026-04-27", dateModified: "2026-04-27", publisher: { "@type": "Organization", name: "Zeniva Travel", logo: { "@type": "ImageObject", url: "https://www.zenivatravel.com/branding/logo.png" } }, about: [{ "@type": "Thing", name: "Zeniva", url: "https://www.zenivatravel.com" }, { "@type": "Thing", name: RIVAL, url: "https://hopper.com" }] }}
  />
); }
