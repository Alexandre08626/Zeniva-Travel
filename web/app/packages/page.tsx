import type { Metadata } from "next";
import Link from "next/link";
import Header from "../../src/components/Header";
import Footer from "../../src/components/Footer";

export const metadata: Metadata = {
  title: "Travel Packages 2025 — Luxury Vacations, All-Inclusive Deals | Zeniva Travel USA",
  description:
    "Discover the best travel packages for 2025. Luxury vacations, all-inclusive deals, Caribbean getaways, Europe tours, and more — planned by Lina AI in seconds. Serving USA & Canada.",
  alternates: {
    canonical: "https://zenivatravel.com/packages",
    languages: { "en-US": "https://zenivatravel.com/packages" },
  },
  keywords: [
    "travel packages 2025", "vacation packages USA", "all-inclusive vacation deals",
    "luxury vacation packages", "Caribbean vacation packages", "Cancun vacation packages",
    "Europe vacation packages", "cheap vacation packages", "best travel deals",
    "group vacation packages", "honeymoon packages", "beach vacation packages"
  ],
  openGraph: {
    title: "Best Travel Packages 2025 | Zeniva Travel — AI Concierge USA",
    description: "Luxury vacations, all-inclusive deals, Caribbean & Europe packages. Planned by Lina AI — America's #1 AI travel concierge.",
    url: "https://zenivatravel.com/packages",
    type: "website",
    locale: "en_US",
  },
};

const packages = [
  {
    href: "/packages/cancun",
    emoji: "🌴",
    title: "Cancun All-Inclusive",
    subtitle: "7 nights from $799/person",
    desc: "Pristine beaches, unlimited food & drinks, and non-stop entertainment. Lina finds the best Cancun resort deals in seconds.",
    tags: ["All-Inclusive", "Beach", "Popular"],
    img: "🏖️",
  },
  {
    href: "/packages/caribbean",
    emoji: "🏝️",
    title: "Caribbean Getaways",
    subtitle: "5 nights from $1,199/person",
    desc: "From the Bahamas to Turks & Caicos, Jamaica to St. Lucia — Lina AI picks the perfect island for your vibe.",
    tags: ["Beach", "Luxury", "Couples"],
    img: "🌊",
  },
  {
    href: "/packages/europe",
    emoji: "🗼",
    title: "Europe Vacation Packages",
    subtitle: "8 nights from $1,899/person",
    desc: "Paris, Rome, Barcelona, Santorini — full packages with flights, hotels, and curated experiences. Let Lina plan it all.",
    tags: ["Culture", "Adventure", "Luxury"],
    img: "✈️",
  },
  {
    href: "/packages/all-inclusive",
    emoji: "🍹",
    title: "All-Inclusive Deals",
    subtitle: "From $599/person",
    desc: "The best all-inclusive resorts in Mexico, Dominican Republic, Jamaica and more. Zero stress, unlimited everything.",
    tags: ["All-Inclusive", "Family", "Couples"],
    img: "🥂",
  },
  {
    href: "/chat",
    emoji: "🛥️",
    title: "Yacht Charter",
    subtitle: "Custom pricing",
    desc: "Private yacht for groups, honeymoons, or special events. Mediterranean, Caribbean, or anywhere in the world.",
    tags: ["Luxury", "Groups", "Premium"],
    img: "⛵",
  },
  {
    href: "/chat",
    emoji: "👥",
    title: "Group Travel",
    subtitle: "10+ people — best rates",
    desc: "Corporate retreats, wedding groups, family reunions. Lina AI negotiates group rates and handles all logistics.",
    tags: ["Groups", "Corporate", "Family"],
    img: "🎉",
  },
];

export default function PackagesPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Zeniva Travel — Best Travel Packages 2025",
    "description": "Luxury vacation packages, all-inclusive deals, and custom trips planned by Lina AI for travelers in USA and Canada",
    "url": "https://zenivatravel.com/packages",
    "numberOfItems": packages.length,
    "itemListElement": packages.map((p, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": p.title,
      "description": p.desc,
      "url": `https://zenivatravel.com${p.href}`,
    }))
  };

  return (
    <>
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <main className="min-h-screen bg-white">
        {/* Hero */}
        <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white py-20 px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm font-semibold mb-6">
              ✨ Powered by Lina AI — Your 24/7 Travel Concierge
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Best Travel Packages 2025</h1>
            <p className="text-xl text-blue-100 mb-8">Tell Lina where you want to go — she'll build the perfect trip proposal in under 60 seconds. All-inclusive deals, luxury vacations, group trips & more.</p>
            <Link href="/chat" className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-8 py-4 rounded-2xl hover:bg-blue-50 transition-colors text-lg shadow-lg">
              💬 Ask Lina for a Custom Package
            </Link>
          </div>
        </section>

        {/* Packages Grid */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-3">Popular Travel Packages</h2>
            <p className="text-gray-500 text-center mb-12">All packages can be 100% customized by Lina AI — just tell her your dates, budget, and preferences.</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <Link key={pkg.title} href={pkg.href} className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 h-32 flex items-center justify-center text-6xl">
                    {pkg.img}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{pkg.emoji}</span>
                      <h3 className="font-bold text-gray-900 text-lg">{pkg.title}</h3>
                    </div>
                    <div className="text-blue-600 font-semibold text-sm mb-3">{pkg.subtitle}</div>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">{pkg.desc}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {pkg.tags.map(t => (
                        <span key={t} className="bg-blue-50 text-blue-600 text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-100">{t}</span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Lina CTA */}
        <section className="py-16 px-6 bg-gradient-to-br from-blue-700 to-blue-900 text-white text-center">
          <div className="max-w-2xl mx-auto">
            <div className="text-6xl mb-4">🤖</div>
            <h2 className="text-3xl font-bold mb-4">Don't See Your Destination?</h2>
            <p className="text-blue-100 text-lg mb-8">Lina AI plans trips to <strong>any destination worldwide</strong>. Just tell her where you want to go, your budget, and she'll build the perfect proposal — in seconds.</p>
            <Link href="/chat" className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-8 py-4 rounded-2xl hover:bg-blue-50 transition-colors text-lg">
              Start Planning for Free →
            </Link>
            <p className="text-blue-200 text-sm mt-4">No credit card. No commitment. Just your dream trip.</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
