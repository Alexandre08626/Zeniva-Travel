export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import Header from "../../../src/components/Header";
import Footer from "../../../src/components/Footer";

export const metadata: Metadata = {
  title: "Best All-Inclusive Vacation Packages 2025 — From $599 | Zeniva Travel USA",
  description:
    "Best all-inclusive vacation deals 2025. Mexico, Caribbean, Dominican Republic, Jamaica — flights & hotel included from $599/person. Planned by Lina AI in 60 seconds. USA & Canada.",
  alternates: { canonical: "https://zenivatravel.com/packages/all-inclusive" },
  keywords: [
    "all-inclusive vacation packages 2025", "best all-inclusive resorts", "all-inclusive deals USA",
    "cheap all-inclusive vacations", "all-inclusive Mexico", "all-inclusive Caribbean",
    "all-inclusive Dominican Republic", "all-inclusive Jamaica", "couples all-inclusive",
    "family all-inclusive packages", "all-inclusive vacation from USA", "all-inclusive from Canada"
  ],
  openGraph: {
    title: "Best All-Inclusive Vacation Packages 2025 | Zeniva Travel USA",
    description: "Top all-inclusive deals — Mexico, Caribbean, Dominican Republic, Jamaica. From $599/person with flights. Planned by Lina AI.",
    url: "https://zenivatravel.com/packages/all-inclusive",
    type: "website",
    locale: "en_US",
  },
};

const destinations = [
  { emoji: "🌴", name: "Cancun, Mexico", price: "from $799", highlight: "Most Popular", desc: "Crystal-clear water, perfect beaches, vibrant nightlife. Best value all-inclusive in the world." },
  { emoji: "🏝️", name: "Punta Cana, Dominican Republic", price: "from $699", highlight: "Best Beaches", desc: "27 miles of white sand beaches, warm turquoise water, and incredible resorts." },
  { emoji: "🌺", name: "Montego Bay, Jamaica", price: "from $899", highlight: "Best Vibes", desc: "Reggae, rum, and world-class resorts. Jamaica's all-inclusive scene is legendary." },
  { emoji: "🦩", name: "Varadero, Cuba", price: "from $599", highlight: "Best Price", desc: "One of the Caribbean's best-kept secrets. Stunning beaches at unbeatable prices." },
  { emoji: "🌊", name: "Nassau, Bahamas", price: "from $1,099", highlight: "Closest to USA", desc: "30 minutes from Miami. Luxury resorts, paradise beaches, and world-class casinos." },
  { emoji: "🏖️", name: "Riviera Maya, Mexico", price: "from $949", highlight: "Luxury Pick", desc: "Tulum, Playa del Carmen, cenotes, and the most luxurious boutique resorts in Mexico." },
];

export default function AllInclusivePage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Best All-Inclusive Vacation Packages 2025",
    "description": "Top all-inclusive vacation deals planned by Lina AI for US and Canada travelers",
    "url": "https://zenivatravel.com/packages/all-inclusive",
    "numberOfItems": destinations.length,
    "itemListElement": destinations.map((d, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": `All-Inclusive ${d.name}`,
      "description": d.desc,
    }))
  };

  return (
    <>
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <main className="min-h-screen bg-white">
        <section className="bg-gradient-to-br from-orange-500 via-pink-600 to-blue-700 text-white py-20 px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="text-6xl mb-4">🍹</div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Best All-Inclusive Vacation Packages 2025</h1>
            <p className="text-xl text-white/90 mb-2">Flights + Resort + Meals + Drinks — Everything Included</p>
            <p className="text-white/70 mb-8">From $599/person · Mexico, Caribbean, Dominican Republic & more</p>
            <Link href="/chat?q=all-inclusive+vacation+package" className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-8 py-4 rounded-2xl hover:bg-blue-50 transition-colors text-lg shadow-lg">
              💬 Find My All-Inclusive Deal
            </Link>
          </div>
        </section>

        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Top All-Inclusive Destinations</h2>
            <p className="text-gray-500 text-center mb-12">Tell Lina your preferred destination — she'll find the best resort and price for your dates.</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {destinations.map((d) => (
                <div key={d.name} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                  <div className="text-4xl mb-3">{d.emoji}</div>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-900 text-lg leading-tight">{d.name}</h3>
                    <span className="text-xs bg-blue-50 text-blue-600 font-bold px-2 py-1 rounded-full ml-2 shrink-0">{d.highlight}</span>
                  </div>
                  <div className="text-green-600 font-bold mb-3">{d.price} <span className="text-gray-400 font-normal text-sm">/ person</span></div>
                  <p className="text-gray-600 text-sm mb-4">{d.desc}</p>
                  <Link href={`/chat?q=All-inclusive+${d.name}`} className="block w-full text-center bg-blue-600 text-white font-bold py-2.5 rounded-xl hover:bg-blue-700 transition-colors text-sm">
                    Plan This Trip →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-6 bg-gradient-to-br from-blue-700 to-blue-900 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Let Lina Find Your Perfect All-Inclusive</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">Not sure where to go? Tell Lina your budget and she'll compare hundreds of resorts to find the best deal — in 60 seconds.</p>
          <Link href="/chat?q=best+all-inclusive+vacation+for+my+budget" className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-8 py-4 rounded-2xl hover:bg-blue-50 transition-colors text-lg">
            Ask Lina for Best Deal →
          </Link>
          <p className="text-blue-200 text-sm mt-4">Free · No commitment · Available 24/7</p>
        </section>
      </main>
      <Footer />
    </>
  );
}
