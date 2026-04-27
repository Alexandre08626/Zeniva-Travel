import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

const CITY = "Los Angeles";
const AIRPORT = "LAX";
const URL_PATH = "/packages/from-los-angeles";

export const metadata: Metadata = {
  title: `Vacation Packages from ${CITY} (${AIRPORT}) — All-Inclusive Deals 2026 | Zeniva`,
  description: `All-inclusive vacation deals departing from ${CITY} (${AIRPORT}). Hawaii, Mexico, Caribbean, Tahiti, Asia. Flights + hotel + transfers, planned by Lina AI.`,
  keywords: [
    `vacation packages from ${CITY}`, `${AIRPORT} vacation deals`, `all-inclusive from ${CITY}`,
    `${CITY} to Cancun`, `${CITY} to Hawaii`, `${CITY} to Tahiti`, `${CITY} to Bora Bora`,
    `LAX vacation deals`, `cheap vacations from ${CITY}`, `luxury packages from ${CITY}`,
    `honeymoon from ${CITY}`, `family vacation from ${CITY}`,
  ],
  openGraph: {
    title: `Vacation Packages from ${CITY} (${AIRPORT}) | Zeniva`,
    description: `Curated all-inclusive and luxury packages from LAX. Flights + hotel + transfers included.`,
    url: `https://www.zenivatravel.com${URL_PATH}`,
    siteName: "Zeniva Travel",
    type: "website",
    images: [{ url: "https://images.unsplash.com/photo-1503891450247-ee5f8ec46dc3?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: `Packages from ${CITY} — Zeniva` }],
  },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}` },
};

export default function FromLosAngelesPage() {
  return (
    <SeoPage
      h1={`Vacation Packages Departing from ${CITY}`}
      subtitle={`Hand-picked all-inclusive and luxury trips from ${AIRPORT}. Flights, hotel, and transfers included. Lina AI customizes every package to your dates and budget.`}
      heroImage="https://images.unsplash.com/photo-1503891450247-ee5f8ec46dc3?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-amber-900/70 to-rose-900/60"
      badge={`✈️ Direct from ${AIRPORT}`}
      sections={[
        {
          heading: `Why Book a Vacation Package from ${CITY}`,
          content: `<p>${CITY} is the West Coast gateway to the Pacific. From LAX, direct flights reach Hawaii in under six hours, Tahiti in eight, Tokyo in eleven, Sydney in fifteen. Mexico's beach destinations — Cabo, Puerto Vallarta, Cancún — are short two-to-five-hour hops. The Caribbean takes a layover but remains accessible. This page collects Zeniva's most popular packages departing from ${CITY}, all priced for two travelers and customizable in seconds with Lina AI.</p>
<p>Every package includes round-trip flights from ${AIRPORT}, a hand-picked hotel or all-inclusive resort, and airport transfers at the destination. Our concierge team has personally vetted the resorts. Pricing is transparent — no hidden fees, no surprise resort charges, no booking commissions.</p>`,
        },
        {
          heading: `Top Destinations from ${CITY}`,
          content: `<p><strong>Hawaii (Maui, Oahu, Big Island, Kauai):</strong> ${CITY}'s closest international beach destination. Five-hour flight, no passport required, no jet lag. All-inclusive resorts on Maui (Wailea, Kaanapali) and Oahu (Ko Olina, Waikiki) start around $1,400 per person for 5 nights including flights.</p>
<p><strong>Mexico (Cabo, Puerto Vallarta, Cancún, Riviera Maya):</strong> Short flights, dramatic value. All-inclusive packages from $999 per person for 4 nights. Cabo and Puerto Vallarta are the West Coast favorites — shorter flights than Cancún and equally impressive resorts.</p>
<p><strong>Tahiti & Bora Bora:</strong> Direct flights from ${CITY} make French Polynesia surprisingly accessible. Overwater bungalows from $5,000 per person for a week including flights. Honeymoon-ready year-round.</p>
<p><strong>Caribbean (one-stop):</strong> Cancún and Punta Cana are easy. The Eastern Caribbean (St. Lucia, Turks and Caicos, Aruba) typically requires a connection through Miami or Charlotte but remains worth the extra hour for the right resort.</p>
<p><strong>Asia (Tokyo, Bali, Bangkok):</strong> Direct flights to Tokyo and Seoul; one-stop to Bali, Bangkok, and Manila. ${CITY}'s position makes Asia faster from here than from any East Coast city.</p>`,
        },
        {
          heading: "What's Included in Every Package",
          content: `<p>Round-trip flights from ${AIRPORT} on a major airline (Delta, United, American, Hawaiian, Alaska, or international carrier depending on route). Hotel accommodation for the package length, in a vetted resort or luxury hotel. Airport transfers at the destination — private or shared depending on the tier. Travel insurance optional and recommended.</p>
<p>For all-inclusive resorts, food, drinks (alcoholic and non-alcoholic), most activities, and gratuities are included at the resort. For luxury hotel packages (Tahiti, Maldives, Maui), meals are typically not all-inclusive but Zeniva can add a meal plan. Lina will tell you exactly what's included before you book.</p>`,
        },
        {
          heading: "How to Book and Customize",
          content: `<p>Tap "Chat with Lina" below or visit any package on our site. Tell Lina your dates, group size, and any preferences (resort style, budget tier, dietary needs). Within seconds, she builds a complete proposal with flights, hotel, and transfers, all priced live and bookable with one tap.</p>
<p>If you prefer a human, our travel advisors take over any chat at any time — just type "I'd like to talk to a human" and a real advisor responds. Same prices, same booking, just human-handled. Voice calls also available 24/7 at /call.</p>`,
        },
      ]}
      highlights={[
        { icon: "star", title: `Direct from ${AIRPORT}`, description: `Curated packages on direct flights from ${CITY} — no unnecessary connections.` },
        { icon: "gift", title: "Flights + Hotel + Transfers", description: "Everything bundled into one transparent price. No hidden resort fees, no booking surprises." },
        { icon: "phone", title: "Lina AI 24/7", description: "Chat or voice — get a personalized package in seconds, any time." },
        { icon: "shield", title: "Vetted Resorts Only", description: "Every property in our portfolio has been personally verified for quality, location, and service." },
        { icon: "users", title: "Customize Anything", description: "Different dates, group size, room category, room location — every detail is editable." },
        { icon: "map", title: "Add Excursions", description: "Catamaran, snorkeling, golf, spa — bundled with the package or added separately." },
      ]}
      faqs={[
        { question: `What's the cheapest vacation from ${CITY}?`, answer: `All-inclusive Cabo or Puerto Vallarta packages start around $799 per person for 4 nights including flights from ${AIRPORT}. Hawaii starts around $1,200 per person for 4 nights at a 4-star resort. Tahiti and overseas Asia trips run higher.` },
        { question: `Are flights from ${AIRPORT} included?`, answer: `Yes — every package includes round-trip economy flights from ${AIRPORT}. Premium economy, business, and first class can be added at the additional fare difference. We also book one-way and open-jaw if you want to extend or split.` },
        { question: "Can I customize the dates and resort?", answer: "Absolutely. The dates shown are placeholders — Lina prices live for any dates you choose. The resort can be swapped for any property in our network or any property you specifically request." },
        { question: "Do you offer payment plans?", answer: "For most packages, yes. Pay 25% to lock the booking, 50% at 60 days out, balance at 30 days. ZeniPay handles installments at 0% interest." },
        { question: "What if I need to cancel?", answer: "Cancellation policies vary by hotel and airline. We strongly recommend trip insurance, which Zeniva can quote and add for typically 6–10% of the trip cost. Lina will explain the exact cancellation terms before you confirm." },
      ]}
      ctaText={`See Packages from ${CITY}`}
      ctaPrompt={`I want a vacation package from ${CITY}`}
      internalLinks={[
        { label: "All Packages", href: "/packages" },
        { label: "All-Inclusive Deals", href: "/packages/all-inclusive" },
        { label: "Cancun Packages", href: "/packages/cancun" },
        { label: "Caribbean Destinations", href: "/destinations/caribbean" },
        { label: "Mexico Destinations", href: "/destinations/mexico" },
      ]}
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "TravelAction",
        name: `Vacation Packages from ${CITY}`,
        description: `All-inclusive and luxury vacation packages departing from ${CITY} (${AIRPORT}).`,
        provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" },
        fromLocation: { "@type": "City", name: CITY, address: { "@type": "PostalAddress", addressCountry: "US", addressRegion: "CA" } },
      }}
    />
  );
}
