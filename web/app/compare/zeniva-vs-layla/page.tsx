import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

const RIVAL = "Layla AI";
const URL_PATH = "/compare/zeniva-vs-layla";

export const metadata: Metadata = {
  title: `Zeniva vs ${RIVAL} — 2026 Honest Comparison | Zeniva`,
  description: `Side-by-side comparison of Zeniva vs ${RIVAL}: real bookings, human escalation, yacht/villa coverage, multilingual support, and pricing. Honest 2026 verdict.`,
  keywords: [
    `zeniva vs layla`, `layla ai alternative`, `layla ai vs zeniva`,
    `best ai travel agent 2026`, `ai trip planner comparison`,
    `layla ai review`, `ai technology platform comparison`, `alternative to layla`,
  ],
  openGraph: {
    title: `Zeniva vs ${RIVAL} — Side-by-Side`,
    description: `Real bookings vs trip-planning only. Human escalation, yacht/villa, multilingual — what each does and doesn't.`,
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
      subtitle={`Both call themselves "AI travel agents" but they do very different things. Here's the side-by-side: what each handles, what each doesn't, and which one fits your trip.`}
      heroImage="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-purple-900/70 to-blue-900/60"
      badge="Independent comparison"
      sections={[
        {
          heading: "The fundamental difference in one sentence",
          content: `<p><strong>${RIVAL} is a trip-planning chatbot. Zeniva is a full AI travel technology platform.</strong></p>
<p>${RIVAL} generates inspiration and itineraries with strong vibes — beautiful Pinterest-style boards, mood-based suggestions for vibey destinations like Tulum, Marrakech, or Lisbon. The actual booking happens elsewhere — typically Booking.com or Expedia via affiliate links. If your flight gets canceled or your hotel is wrong, you contact Booking.com, not Layla.</p>
<p>Zeniva does the inspiration AND the booking AND the support. Lina AI talks to you, builds a real proposal with live Duffel flight prices and LiteAPI hotel inventory, books it through licensed travel partners, and a human travel advisor escalates any issue 24/7.</p>`,
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
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Trip inspiration / itinerary builder</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅</td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;"><strong>Real flight + hotel booking</strong></td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">❌ external</td><td style="text-align:center; border-bottom:1px solid #e5e7eb; background:#fef3c7;"><strong>✅ direct</strong></td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;"><strong>24/7 human escalation</strong></td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">❌</td><td style="text-align:center; border-bottom:1px solid #e5e7eb; background:#fef3c7;"><strong>✅</strong></td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Voice call option</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">❌</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅ /call 24/7</td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Yacht charter</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">❌</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅</td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Private villa rental</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">❌</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅</td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Cruise booking</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">❌</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅ all major lines</td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Destination weddings</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">❌</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅ group travel</td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Multilingual</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">limited</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">EN, FR, ES auto-detect</td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Payment plans</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">❌</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅ ZeniPay 0%</td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">CAD / multi-currency</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">USD only</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">USD + CAD</td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Booking fees</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">$0 (affiliate)</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">$0 (commission)</td></tr>
</tbody>
</table>`,
        },
        {
          heading: `When ${RIVAL} is the better choice`,
          content: `<p>Pick ${RIVAL} if:</p>
<ul>
<li><strong>You want trip inspiration</strong> and you're early in the planning process. Layla's mood-board approach is genuinely best-in-class for "vibey" destinations.</li>
<li><strong>You're price-sensitive</strong> and willing to do the booking yourself on Booking.com or Expedia after Layla suggests a hotel.</li>
<li><strong>You don't anticipate issues.</strong> Cancellation, room change, refund — these route through whoever you booked with (not Layla).</li>
<li><strong>Domestic US trips with simple logistics.</strong> Layla handles these well as inspiration.</li>
</ul>`,
        },
        {
          heading: "When Zeniva is the better choice",
          content: `<p>Pick Zeniva if:</p>
<ul>
<li><strong>You want one-stop booking.</strong> Zeniva quotes flights + hotels + transfers and books all of it on your behalf.</li>
<li><strong>You want a human safety net.</strong> Type "I want to talk to a human" anytime; a real travel advisor takes the case. Critical when something goes wrong on a $5,000+ trip.</li>
<li><strong>You're booking specialty travel</strong> — yacht charter, private villa, cruise, destination wedding. Layla doesn't cover these. Zeniva does.</li>
<li><strong>You speak French or Spanish.</strong> Lina AI auto-detects and responds in your language. Layla is English-first.</li>
<li><strong>You want to pay over time</strong> via 0% installments (ZeniPay).</li>
<li><strong>You're booking from Canada</strong> and want CAD pricing without FX surprises.</li>
</ul>`,
        },
        {
          heading: "How they compare on price",
          content: `<p>Both ${RIVAL} and Zeniva charge the customer $0 in booking fees. The economics differ:</p>
<p><strong>${RIVAL}</strong> earns affiliate commissions when you click through to Booking.com, Expedia, or hotel direct. The hotel rate you pay is the same as the public rate.</p>
<p><strong>Zeniva</strong> earns supplier commissions on confirmed bookings (industry standard 8–15% for travel agencies). The rate you pay is the same as direct booking — but Zeniva often unlocks rates that aren't available publicly through partner agreements (especially on luxury hotels and packages).</p>
<p>For Cancun all-inclusive packages from major US cities, Zeniva pricing typically ranges $899–$1,500 per person for 4–5 nights including flights from JFK, MIA, ORD, LAX, etc. Layla shows hotel-only suggestions; you add the flight separately.</p>`,
        },
      ]}
      highlights={[
        { icon: "star", title: "Use both, even", description: `${RIVAL} for early inspiration, Zeniva for the actual booking. Many travelers do exactly this.` },
        { icon: "shield", title: "Human backup matters", description: "On a luxury trip or a destination wedding, having a human advisor reachable 24/7 is the differentiator." },
        { icon: "anchor", title: "Specialty travel", description: "Yacht, villa, cruise, weddings — not in Layla's wheelhouse, fully covered by Zeniva." },
        { icon: "phone", title: "Voice option", description: "Zeniva has /call 24/7 — talk to Lina by voice. Layla is text-only." },
        { icon: "map", title: "Multilingual", description: "EN, FR, ES on Zeniva — meaningful for Quebec, France, LATAM, Spain travelers." },
        { icon: "gift", title: "Payment plans", description: "Zeniva ZeniPay splits payment 0% interest. Layla doesn't handle payment." },
      ]}
      faqs={[
        { question: `Is ${RIVAL} or Zeniva better for booking a trip?`, answer: `Zeniva, if you want one-stop booking with human backup. ${RIVAL} is better as an inspiration tool but you'll still book elsewhere (Booking.com / Expedia / airline). Zeniva books flights + hotel + transfers in a single transaction.` },
        { question: `Can I book a yacht charter through ${RIVAL}?`, answer: `No. ${RIVAL} doesn't cover yacht charters, private villas, cruises, or destination weddings. Zeniva covers all four.` },
        { question: `Does ${RIVAL} speak French?`, answer: `${RIVAL}'s primary language is English with limited multilingual support. Zeniva's Lina AI auto-detects and responds fluently in English, French, and Spanish.` },
        { question: "Do either charge booking fees?", answer: "No, both are free for customers. Layla earns affiliate commissions; Zeniva earns supplier commissions on confirmed bookings (industry standard)." },
        { question: "Which has better customer support?", answer: "Zeniva — type 'I want to talk to a human' any time and a real travel advisor takes over the chat. Layla doesn't have a human escalation path for trip support." },
        { question: `Should I use ${RIVAL} and Zeniva together?`, answer: `Yes — that's a smart workflow. Browse Layla for inspiration to lock in a destination and vibe. Then ask Lina on Zeniva to build the actual bookable proposal with flights, hotel, and transfers.` },
      ]}
      ctaText="Try Zeniva — chat with Lina"
      ctaPrompt="I'd like to plan a trip"
      internalLinks={[
        { label: "Best AI Travel Agents 2026", href: "/blog/best-ai-travel-agents-usa-2026" },
        { label: "Zeniva vs Mindtrip", href: "/compare/zeniva-vs-mindtrip" },
        { label: "Zeniva vs Booked.ai", href: "/compare/zeniva-vs-booked-ai" },
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
          { "@type": "Thing", name: RIVAL, url: "https://layla.ai" },
        ],
      }}
    />
  );
}
