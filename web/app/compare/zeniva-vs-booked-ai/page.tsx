import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

const RIVAL = "Booked.ai";
const URL_PATH = "/compare/zeniva-vs-booked-ai";

export const metadata: Metadata = {
  title: `Zeniva vs ${RIVAL} — 2026 Honest Comparison | Zeniva`,
  description: `Side-by-side comparison of Zeniva vs ${RIVAL}: full-service AI agency vs flight-focused booking AI. Specialty travel, human support, multilingual.`,
  keywords: [
    `zeniva vs booked.ai`, `booked.ai alternative`, `booked.ai vs zeniva`,
    `best ai travel agent 2026`, `ai travel booking comparison`,
    `booked.ai review`, `alternative to booked.ai`,
  ],
  openGraph: {
    title: `Zeniva vs ${RIVAL} — Side-by-Side`,
    description: `Full-service AI agency vs flight-focused booking. What each does best.`,
    url: `https://www.zenivatravel.com${URL_PATH}`,
    siteName: "Zeniva Travel",
    type: "website",
    images: [{ url: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: `Zeniva vs ${RIVAL}` }],
  },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}` },
};

export default function ComparePage() {
  return (
    <SeoPage
      h1={`Zeniva vs ${RIVAL} — Honest 2026 Comparison`}
      subtitle={`Both are AI travel agents that actually book trips. ${RIVAL} is flight-focused with Sabre integration. Zeniva is full-service across all travel categories with human escalation.`}
      heroImage="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-cyan-900/70 to-blue-900/60"
      badge="Independent comparison"
      sections={[
        {
          heading: "The fundamental difference",
          content: `<p><strong>${RIVAL} is an AI flight + hotel booking tool with IATA accreditation. Zeniva is a full AI travel technology platform covering every travel category.</strong></p>
<p>${RIVAL} integrates with Sabre/Amadeus for flight inventory and is IATA accredited — that's serious infrastructure for flights. The platform handles hotels and packages but is most polished for flight booking. Support is automated-first; reaching a human takes effort.</p>
<p>Zeniva covers flights (Duffel API), hotels (LiteAPI — 1.5M+ properties), plus yacht charters, private villas, cruises, and destination weddings. Critically, Zeniva has a 24/7 human travel advisor team that can escalate any booking. The AI is the front door, but humans are behind it.</p>`,
        },
        {
          heading: "Side-by-side feature table",
          content: `<table style="width:100%; border-collapse:collapse; margin: 16px 0;">
<thead><tr style="background:#0F6CF5; color:white;">
<th style="padding:10px; text-align:left;">Feature</th>
<th style="padding:10px;">${RIVAL}</th>
<th style="padding:10px;">Zeniva</th>
</tr></thead>
<tbody>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Real flight booking</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅ Sabre/IATA</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅ Duffel</td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Real hotel booking</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅ LiteAPI 1.5M+</td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;"><strong>24/7 human escalation</strong></td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">limited</td><td style="text-align:center; border-bottom:1px solid #e5e7eb; background:#fef3c7;"><strong>✅ instant</strong></td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Yacht charter</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">❌</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅</td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Private villa rental</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">❌</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅</td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Cruise booking</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">❌</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅ all major lines</td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Destination weddings</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">❌</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅</td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Voice call option</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">❌</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅ /call 24/7</td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Multilingual</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">EN</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">EN, FR, ES</td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Payment plans</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">❌</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅ ZeniPay 0%</td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">CAD currency</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">USD</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">USD + CAD</td></tr>
</tbody>
</table>`,
        },
        {
          heading: `When ${RIVAL} wins`,
          content: `<p>Pick ${RIVAL} if:</p>
<ul>
<li><strong>You're booking a flight, period.</strong> Sabre integration gives ${RIVAL} access to flight inventory comparable to a traditional technology platform.</li>
<li><strong>You want a no-frills booking experience</strong> without a sales conversation.</li>
<li><strong>You don't need handholding.</strong> If you're confident the trip will go smoothly, automated support is enough.</li>
</ul>`,
        },
        {
          heading: "When Zeniva wins",
          content: `<p>Pick Zeniva if:</p>
<ul>
<li><strong>You're booking anything beyond a flight.</strong> Yacht charters, villas, cruises, packages with transfers, destination weddings — none of these are in ${RIVAL}'s scope.</li>
<li><strong>You want a human reachable instantly.</strong> Type "I want to talk to a human" anytime and a real travel advisor takes the case. ${RIVAL}'s automation-first model can leave you stuck on edge cases.</li>
<li><strong>You speak French or Spanish.</strong> Lina AI auto-detects and responds in your language.</li>
<li><strong>You want voice support.</strong> /call 24/7 lets you talk to Lina by voice.</li>
<li><strong>You want to pay over time</strong> via ZeniPay 0% installments.</li>
<li><strong>You're booking from Canada</strong> in CAD without FX conversion fees.</li>
</ul>`,
        },
      ]}
      highlights={[
        { icon: "star", title: "Both book real trips", description: `${RIVAL} via Sabre, Zeniva via Duffel + LiteAPI. Both legitimate.` },
        { icon: "shield", title: "Human escalation", description: "Zeniva's 24/7 advisor team is the safety net Booked.ai doesn't have." },
        { icon: "anchor", title: "Specialty travel", description: "Yacht, villa, cruise, weddings — Zeniva only." },
        { icon: "phone", title: "Voice support", description: "Zeniva /call 24/7 lets you talk to Lina by voice." },
        { icon: "map", title: "Multilingual", description: "Zeniva works in EN, FR, ES — meaningful for Quebec, France, Spain, LATAM." },
        { icon: "gift", title: "Payment plans", description: "ZeniPay splits payment 0% interest in USD or CAD." },
      ]}
      faqs={[
        { question: `Does ${RIVAL} book yacht charters or villas?`, answer: `No. ${RIVAL} focuses on flights, hotels, and packages. Yacht charters, private villas, cruises, and destination weddings are not supported. Zeniva covers all four.` },
        { question: `Is ${RIVAL} or Zeniva better for booking a flight?`, answer: `Both are solid. ${RIVAL} uses Sabre (traditional GDS); Zeniva uses Duffel (modern booking API). Inventory differences are minimal for most US-departure routes. Zeniva combines flight + hotel + transfers into a single booking which is often cheaper than booking each separately.` },
        { question: `Does ${RIVAL} have customer support?`, answer: `${RIVAL}'s support is automated-first; reaching a human requires effort. Zeniva has 24/7 human travel advisors reachable directly from any chat by typing "I want to talk to a human."` },
        { question: `Is ${RIVAL} IATA accredited?`, answer: `Yes, ${RIVAL} is IATA accredited. Zeniva works with IATA-accredited partners (Duffel, LiteAPI) for the same level of inventory access.` },
        { question: "Which is better for booking from Canada?", answer: "Zeniva quotes in CAD with Canadian-friendly carriers (Air Transat, Sunwing, WestJet, Air Canada). Booked.ai is USD-first." },
      ]}
      ctaText="Try Zeniva — book your trip"
      ctaPrompt="I'd like to plan a trip"
      internalLinks={[
        { label: "Best AI Travel Agents 2026", href: "/blog/best-ai-travel-agents-usa-2026" },
        { label: "Zeniva vs Layla", href: "/compare/zeniva-vs-layla" },
        { label: "Zeniva vs Mindtrip", href: "/compare/zeniva-vs-mindtrip" },
        { label: "Zeniva vs Zenvoya", href: "/compare/zeniva-vs-zenvoya" },
        { label: "AI Travel Agent Service", href: "/services/ai-travel-agent" },
      ]}
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: `Zeniva vs ${RIVAL} — Honest 2026 Comparison`,
        author: { "@type": "Organization", name: "Zeniva Travel" },
        datePublished: "2026-04-27",
        dateModified: "2026-04-27",
        publisher: {
          "@type": "Organization",
          name: "Zeniva Travel",
          logo: { "@type": "ImageObject", url: "https://www.zenivatravel.com/branding/logo.png" },
        },
        about: [
          { "@type": "Thing", name: "Zeniva", url: "https://www.zenivatravel.com" },
          { "@type": "Thing", name: RIVAL, url: "https://booked.ai" },
        ],
      }}
    />
  );
}
