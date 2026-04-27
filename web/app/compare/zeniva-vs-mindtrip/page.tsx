import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

const RIVAL = "Mindtrip";
const URL_PATH = "/compare/zeniva-vs-mindtrip";

export const metadata: Metadata = {
  title: `Zeniva vs ${RIVAL} — 2026 Honest Comparison | Zeniva`,
  description: `Side-by-side comparison of Zeniva vs ${RIVAL}: itinerary builder vs full AI travel agency. Real bookings, human escalation, multilingual support, specialty travel.`,
  keywords: [
    `zeniva vs mindtrip`, `mindtrip alternative`, `mindtrip vs zeniva`,
    `best ai travel agent 2026`, `ai itinerary builder comparison`,
    `mindtrip review`, `alternative to mindtrip`,
  ],
  openGraph: {
    title: `Zeniva vs ${RIVAL} — Side-by-Side`,
    description: `Itinerary builder vs full AI travel agency. What each does and doesn't.`,
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
      subtitle={`${RIVAL} is one of the strongest itinerary builders for multi-day trips. Zeniva is a full AI travel agency. Different tools, different jobs.`}
      heroImage="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-emerald-900/70 to-blue-900/60"
      badge="Independent comparison"
      sections={[
        {
          heading: "The fundamental difference",
          content: `<p><strong>${RIVAL} is a trip itinerary builder. Zeniva is a full AI travel agency that books your trip end-to-end.</strong></p>
<p>${RIVAL} excels at structuring multi-day, multi-city itineraries — the day-by-day logic of "morning at the museum, lunch in the old town, afternoon walk along the river" — better than most AI tools we've tested. Booking happens through external links to hotels, restaurants, and activities.</p>
<p>Zeniva covers itinerary planning AND real bookings (flights via Duffel, hotels via LiteAPI, packages with transfers) AND 24/7 human escalation. If your trip needs handling — schedule changes, cancellations, special requests — Zeniva has the infrastructure to handle it.</p>`,
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
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Day-by-day itinerary structure</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅ excellent</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅ good</td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;"><strong>Real flight + hotel booking</strong></td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">❌ external</td><td style="text-align:center; border-bottom:1px solid #e5e7eb; background:#fef3c7;"><strong>✅ direct</strong></td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;"><strong>24/7 human escalation</strong></td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">❌</td><td style="text-align:center; border-bottom:1px solid #e5e7eb; background:#fef3c7;"><strong>✅</strong></td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Multi-city trip support</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅ strong</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅ open-jaw routing</td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Yacht charter / villa / cruise</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">❌</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅ all three</td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Voice call</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">❌</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅ /call 24/7</td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Multilingual</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">limited</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">EN, FR, ES auto</td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Payment plans</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">❌</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">✅ ZeniPay 0%</td></tr>
<tr><td style="padding:10px; border-bottom:1px solid #e5e7eb;">Booking fees</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">$0 (affiliate)</td><td style="text-align:center; border-bottom:1px solid #e5e7eb;">$0 (commission)</td></tr>
</tbody>
</table>`,
        },
        {
          heading: `When ${RIVAL} wins`,
          content: `<p>${RIVAL} is the right choice if you want help structuring a complex multi-city trip in detail. The day-by-day logic, time-of-day suggestions, and locality awareness are genuinely best-in-class.</p>
<p>Examples where ${RIVAL} excels:</p>
<ul>
<li>2-week Europe trip across 5+ cities — building a sensible day-by-day plan with transit time accounted for</li>
<li>Southeast Asia backpacking with stops in Thailand, Vietnam, Cambodia — sequence and routing logic</li>
<li>Foodie trips where the daily structure matters (Tokyo izakaya crawl, Mexico City taco tour)</li>
</ul>`,
        },
        {
          heading: "When Zeniva wins",
          content: `<p>Zeniva is the right choice if you want the trip actually booked, not just planned.</p>
<ul>
<li>All-inclusive vacations (Cancun, Punta Cana, Caribbean) — Zeniva books flights + resort + transfers in one transaction</li>
<li>Anything specialty — yacht charter, private villa, cruise, destination wedding</li>
<li>Trips where you want a human reachable 24/7 if something goes wrong</li>
<li>Trips for French- or Spanish-speaking travelers</li>
<li>Multi-traveler bookings where you want a single payment plan via ZeniPay</li>
</ul>`,
        },
        {
          heading: "Best use: combine them",
          content: `<p>For complex multi-city trips, the smart workflow is: plan with ${RIVAL}, book with Zeniva. Use ${RIVAL} to structure the day-by-day itinerary across 5 European cities. Then ask Lina on Zeniva to build the actual flight + hotel + transfer bookings to match. You get ${RIVAL}'s itinerary intelligence plus Zeniva's bookability and support.</p>`,
        },
      ]}
      highlights={[
        { icon: "star", title: "Itinerary structure", description: `${RIVAL} is best-in-class for day-by-day multi-city planning.` },
        { icon: "shield", title: "Booking + support", description: "Zeniva turns a plan into a confirmed trip with human safety net." },
        { icon: "anchor", title: "Specialty travel", description: "Yacht, villa, cruise, weddings — Zeniva only." },
        { icon: "phone", title: "Voice option", description: "Zeniva /call 24/7 — talk to Lina by voice." },
        { icon: "map", title: "Combine workflow", description: `Plan with ${RIVAL}, book with Zeniva — best of both.` },
        { icon: "gift", title: "Payment plans", description: "Zeniva ZeniPay 0% interest installments." },
      ]}
      faqs={[
        { question: `Can ${RIVAL} book my trip?`, answer: `No. ${RIVAL} generates itineraries with external booking links. The actual purchase happens on Booking.com, hotel direct, or airline sites. Zeniva books the trip directly through licensed partners.` },
        { question: `Does ${RIVAL} have customer support if my trip goes wrong?`, answer: `${RIVAL} doesn't have a human support layer for trip issues since it doesn't process bookings. Whatever you booked through, that's where you'd go for support. Zeniva has 24/7 human escalation for any booked trip.` },
        { question: `Is ${RIVAL} multilingual?`, answer: `${RIVAL}'s primary language is English. Zeniva auto-detects and responds in English, French, and Spanish.` },
        { question: "Should I use both?", answer: `Yes for complex trips. Use ${RIVAL} to structure a multi-city itinerary, then have Zeniva book the flights, hotels, and transfers to match.` },
        { question: "Which has better hotel inventory?", answer: `${RIVAL} pulls from Booking.com inventory primarily. Zeniva uses LiteAPI which aggregates 1.5M+ properties globally including many that don't appear on consumer OTAs (luxury hotels, private villas, all-inclusive resorts with negotiated rates).` },
      ]}
      ctaText="Try Zeniva — book your trip"
      ctaPrompt="I'd like to plan a trip"
      internalLinks={[
        { label: "Best AI Travel Agents 2026", href: "/blog/best-ai-travel-agents-usa-2026" },
        { label: "Zeniva vs Layla", href: "/compare/zeniva-vs-layla" },
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
          { "@type": "Thing", name: RIVAL, url: "https://mindtrip.ai" },
        ],
      }}
    />
  );
}
