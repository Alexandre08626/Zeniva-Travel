import type { Metadata } from "next";
import Link from "next/link";
import Header from "../../../src/components/Header";
import Footer from "../../../src/components/Footer";

export const metadata: Metadata = {
  title: "Cancun Vacation Packages 2025 — All-Inclusive Deals from $799 | Zeniva Travel",
  description:
    "Best Cancun all-inclusive vacation packages 2025. 7 nights from $799/person with flights & hotel. Planned by Lina AI — book the perfect Cancun getaway in minutes. USA & Canada travelers.",
  alternates: { canonical: "https://zenivatravel.com/packages/cancun" },
  keywords: [
    "Cancun vacation packages 2025", "Cancun all-inclusive deals", "cheap Cancun vacations",
    "best Cancun resorts", "Cancun packages from USA", "Cancun packages from Canada",
    "Cancun 7 nights all-inclusive", "Cancun travel deals", "Mexico vacation packages",
    "Cancun honeymoon packages", "Cancun family vacation"
  ],
  openGraph: {
    title: "Cancun Vacation Packages 2025 — All-Inclusive from $799 | Zeniva Travel",
    description: "Plan your perfect Cancun vacation with Lina AI. All-inclusive deals, luxury resorts, custom itineraries — for USA & Canada travelers.",
    url: "https://zenivatravel.com/packages/cancun",
    type: "website",
    locale: "en_US",
  },
};

const deals = [
  { title: "7 Nights Cancun All-Inclusive", price: "$799", per: "/person", resort: "4★ Hotel Zone Resort", includes: ["Round-trip flights", "All meals & drinks", "Pool & beach access", "Airport transfers"], badge: "Best Value" },
  { title: "7 Nights Cancun Luxury", price: "$1,299", per: "/person", resort: "5★ Beachfront Resort", includes: ["Round-trip flights", "All-inclusive premium", "Spa credits $200", "Private check-in"], badge: "Most Popular" },
  { title: "10 Nights Cancun Escape", price: "$1,599", per: "/person", resort: "5★ Playa Mujeres", includes: ["Round-trip flights", "All-inclusive", "Day trip to Isla Mujeres", "Cenote tour included"], badge: "Extended Stay" },
];

export default function CancunPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    "name": "Cancun All-Inclusive Vacation Package 2025",
    "description": "All-inclusive Cancun vacation packages planned by Lina AI — flights + hotel + meals from $799/person for US and Canada travelers.",
    "url": "https://zenivatravel.com/packages/cancun",
    "touristType": ["Beach", "Leisure", "Honeymoon", "Family"],
    "itinerary": { "@type": "ItemList", "name": "7-Night Cancun Itinerary" },
    "provider": {
      "@type": "TravelAgency",
      "name": "Zeniva Travel",
      "url": "https://zenivatravel.com"
    }
  };

  return (
    <>
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <main className="min-h-screen bg-white">
        <section className="bg-gradient-to-br from-cyan-700 via-blue-700 to-blue-900 text-white py-20 px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="text-6xl mb-4">🌴</div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Cancun Vacation Packages 2025</h1>
            <p className="text-xl text-blue-100 mb-2">All-Inclusive Deals · Flights + Hotel · From $799/person</p>
            <p className="text-blue-200 mb-8">Tell Lina your dates & budget — she'll find the best Cancun deal in 60 seconds.</p>
            <Link href="/chat?q=Cancun+all-inclusive+vacation" className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-8 py-4 rounded-2xl hover:bg-blue-50 transition-colors text-lg shadow-lg">
              💬 Get My Cancun Deal Now
            </Link>
          </div>
        </section>

        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Featured Cancun Packages</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {deals.map((d) => (
                <div key={d.title} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all">
                  <div className="bg-cyan-600 text-white px-5 py-4">
                    <div className="text-xs font-bold bg-white/20 rounded-full px-3 py-1 inline-block mb-2">{d.badge}</div>
                    <h3 className="font-bold text-lg">{d.title}</h3>
                    <div className="text-sm opacity-80">{d.resort}</div>
                  </div>
                  <div className="px-5 py-5">
                    <div className="text-3xl font-bold text-gray-900 mb-1">{d.price}<span className="text-base font-normal text-gray-500">{d.per}</span></div>
                    <div className="space-y-2 my-4">
                      {d.includes.map(i => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="text-green-500">✓</span> {i}
                        </div>
                      ))}
                    </div>
                    <Link href={`/chat?q=Cancun+${d.title}`} className="block w-full text-center bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors">
                      Book with Lina →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-6 bg-blue-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Why Book Cancun with Zeniva Travel?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { icon: "🤖", title: "Lina AI Plans in 60 Seconds", desc: "Tell Lina your dates, budget, and group size — she instantly finds the best Cancun deals for you." },
                { icon: "💰", title: "Best Price Guarantee", desc: "We compare hundreds of resorts and flight combinations to find you the lowest all-inclusive price." },
                { icon: "🏖️", title: "Expert Resort Selection", desc: "From budget-friendly to ultra-luxury — Lina knows every resort in Cancun's Hotel Zone and Riviera Maya." },
                { icon: "🇺🇸", title: "Serving USA & Canada", desc: "Flights from any US or Canadian city. Zeniva Travel is incorporated in the USA (Delaware)." },
                { icon: "📱", title: "24/7 AI Concierge", desc: "Questions at 2am? Lina is always available. No hold music, no wait times." },
                { icon: "✈️", title: "Everything Included", desc: "Flights, hotels, transfers — one complete package. Nothing to figure out." },
              ].map(f => (
                <div key={f.title} className="flex gap-4">
                  <span className="text-3xl">{f.icon}</span>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{f.title}</h3>
                    <p className="text-gray-600 text-sm">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-6 bg-blue-700 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Book Cancun?</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">Talk to Lina — she'll build your perfect Cancun package in under 60 seconds. No fees, no commitment.</p>
          <Link href="/chat?q=I+want+to+go+to+Cancun" className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-8 py-4 rounded-2xl hover:bg-blue-50 transition-colors text-lg">
            Plan My Cancun Trip →
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
