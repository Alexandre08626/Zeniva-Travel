import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

const RIVAL = "Zenvoya";
const URL_PATH = "/compare/zeniva-vs-zenvoya";

export const metadata: Metadata = {
  title: `Zeniva vs ${RIVAL} — 2026 Honest Comparison | Zeniva`,
  description: `Side-by-side comparison of Zeniva vs ${RIVAL}: two AI travel agencies compared on bookings, human escalation, specialty travel, and multilingual support.`,
  keywords: [
    `zeniva vs zenvoya`, `zenvoya alternative`, `zenvoya vs zeniva`,
    `best ai travel agent 2026`, `ai travel agency comparison`,
    `zenvoya review`, `alternative to zenvoya`,
  ],
  openGraph: {
    title: `Zeniva vs ${RIVAL} — Side-by-Side`,
    description: `Two AI travel agencies compared. Bookings, support, specialty travel, language.`,
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
      subtitle={`The two AI travel agencies that compete most directly. Both book real trips with AI. The differentiators are specialty travel, language support, and human escalation.`}
      heroImage="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-violet-900/70 to-blue-900/60"
      badge="Independent comparison"
      sections={[
        {
          heading: "The fundamental difference",
          content: `<p>${RIVAL} and Zeniva are the closest direct competitors in the AI travel agency category. Both let you describe a trip in conversation, both build a real bookable proposal with flights and hotels, and both charge $0 in customer fees.</p>
<p>The differentiators show up in specialty travel coverage, language support, voice option, and human escalation depth.</p>`,
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
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">AI conversation</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅ (Lina AI)</td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Real flight + hotel booking</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅ Duffel + LiteAPI</td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;"><strong>24/7 human escalation</strong></td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">limited</td><td style="text-align:center; border-bottom:1px solid #e5e7eb; background:#fef3c7;"><strong>✅ instant</strong></td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Yacht charter</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">❌</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅</td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Private villa rental</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">limited</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅ curated portfolio</td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Cruise booking</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">❌</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅ all major lines</td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Destination weddings</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">❌</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅ group travel team</td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Voice call option</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">❌</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅ /call 24/7</td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Multilingual auto-detect</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">EN</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">EN, FR, ES</td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Payment plans</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">❌</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅ ZeniPay 0%</td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">CAD pricing</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">USD</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">USD + CAD</td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">USA service area</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅ all 50 states</td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Canada service</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">limited</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅ full</td></tr>
</tbody>
</table>`,
        },
        {
          heading: `When ${RIVAL} is the right pick`,
          content: `<p>Pick ${RIVAL} if you've used it before and like the conversation style, you're an English-only US traveler, and your trips fit into the standard flight + hotel + activities pattern. ${RIVAL} is a competent AI travel agency for those use cases.</p>`,
        },
        {
          heading: "When Zeniva is the right pick",
          content: `<p>Pick Zeniva if any of these apply:</p>
<ul>
<li><strong>You need specialty travel</strong> — yacht charter, private villa, cruise, destination wedding</li>
<li><strong>You want guaranteed human escalation</strong> — type "human" any time, a real travel advisor takes the case immediately</li>
<li><strong>You speak French or Spanish</strong> — Lina auto-detects and responds in your language</li>
<li><strong>You want voice support</strong> — /call 24/7 talks to Lina directly</li>
<li><strong>You want payment plans</strong> — ZeniPay splits any booking 0% interest</li>
<li><strong>You're booking from Canada</strong> — CAD pricing, Air Transat/Sunwing/WestJet partners</li>
<li><strong>You want a single contact for the whole trip</strong> — flights, hotel, transfers, excursions, support — all through Zeniva</li>
</ul>`,
        },
        {
          heading: "Try both for 5 minutes",
          content: `<p>Both Zenvoya and Zeniva are free with no signup required to start a chat. The fastest way to compare is to start a conversation on each with the same trip request — for example "Plan me a 5-night honeymoon in Bora Bora for two travelers, $8,000 budget, leaving in October" — and see which proposal is more useful.</p>
<p>Try Zeniva: <a href="/chat">/chat</a> or call <a href="/call">/call</a>.</p>`,
        },
      ]}
      highlights={[
        { icon: "star", title: "Closest competitor", description: `${RIVAL} is the most direct AI agency competitor — try both.` },
        { icon: "shield", title: "Human escalation depth", description: "Zeniva's 24/7 instant human handoff is the differentiator." },
        { icon: "anchor", title: "Specialty travel", description: "Yacht, villa, cruise, weddings — Zeniva covers, Zenvoya doesn't." },
        { icon: "phone", title: "Voice option", description: "Zeniva /call 24/7 — talk to Lina by voice." },
        { icon: "map", title: "Multilingual + CAD", description: "EN/FR/ES + Canadian dollar pricing." },
        { icon: "gift", title: "Payment plans", description: "ZeniPay 0% installments in USD or CAD." },
      ]}
      faqs={[
        { question: `Is Zeniva better than ${RIVAL}?`, answer: `It depends on what you need. ${RIVAL} is competent for standard flight + hotel + activities trips for English-speaking US travelers. Zeniva wins on specialty travel (yacht/villa/cruise/weddings), human escalation, multilingual support, voice option, and Canadian market.` },
        { question: `Does ${RIVAL} book yacht charters or destination weddings?`, answer: `Not in our last evaluation. Zeniva specifically covers yacht charter, private villa, cruise booking, and destination wedding group travel.` },
        { question: `Is ${RIVAL} multilingual?`, answer: `${RIVAL} is English-first. Zeniva auto-detects and responds in English, French, and Spanish.` },
        { question: "Do both have payment plans?", answer: `Zeniva has ZeniPay (0% interest installments in USD or CAD). ${RIVAL} doesn't offer this in our last review.` },
        { question: "Which is better for Canadian travelers?", answer: "Zeniva — CAD pricing, Canadian carriers (Air Transat, Sunwing, WestJet, Air Canada), and Cuba destination expertise. Zenvoya is USD-first." },
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
          { "@type": "Thing", name: RIVAL, url: "https://zenvoya.ai" },
        ],
      }}
    />
  );
}
