export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import Header from "../../src/components/Header";
import Footer from "../../src/components/Footer";

export const metadata: Metadata = {
  title: "Travel Packages 2025 — Luxury Vacations, All-Inclusive Deals | Zeniva USA",
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
    title: "Best Travel Packages 2025 | Zeniva — AI Concierge USA",
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
    title: "ZeniYacht",
    subtitle: "Custom pricing",
    desc: "Private yacht for groups, honeymoons, or special events. Mediterranean, Caribbean, or anywhere in the world.",
    tags: ["Luxury", "Groups", "Premium"],
    img: "⛵",
  },
  {
    href: "/chat",
    emoji: "👥",
    title: "ZeniGroup",
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
    "name": "Zeniva — Best Travel Packages 2025",
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
            <p className="text-xl text-blue-100 mb-8">Tell Lina where you want to go — she'll build the perfect trip proposal in under 60 seconds. All-inclusive deals, luxury vacations, ZeniGroup & more.</p>
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

        {/* ── 30 Destinations Grid ── */}
        <section className="py-16 px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-2 text-sm font-semibold text-blue-600 mb-4">🌍 World-Class Destinations</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Top 30 Destinations</h2>
              <p className="text-gray-500 max-w-xl mx-auto">From overwater bungalows in the Maldives to safari camps in Kenya — Lina AI plans every detail for you.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { name:"Maldives",       slug:"maldives",     emoji:"🏝️", img:"https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=600w=400&q=75q=82",        tag:"Paradise" },
                { name:"Santorini",      slug:"santorini",    emoji:"🌅", img:"https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600w=400&q=75q=82",        tag:"Romantic" },
                { name:"Bali",           slug:"bali",         emoji:"🌴", img:"https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=600w=400&q=75q=82",        tag:"Adventure" },
                { name:"Dubai",          slug:"dubai",        emoji:"🏙️", img:"https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600w=400&q=75q=82",        tag:"Luxury" },
                { name:"Cancún",         slug:"cancun",       emoji:"🏖️", img:"https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=600w=400&q=75q=82",          tag:"Beach" },
                { name:"Tokyo",          slug:"tokyo",        emoji:"🗼", img:"https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600w=400&q=75q=82",        tag:"Culture" },
                { name:"Paris",          slug:"paris",        emoji:"🥐", img:"https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600w=400&q=75q=82",        tag:"Romantic" },
                { name:"Amalfi Coast",   slug:"amalfi-coast", emoji:"🍋", img:"https://images.unsplash.com/photo-1510131883639-7d2dd2e34fca?w=600w=400&q=75q=82",        tag:"Scenic" },
                { name:"Bora Bora",      slug:"bora-bora",    emoji:"🌺", img:"https://images.unsplash.com/photo-1589979481223-deb893043163?w=600w=400&q=75q=82",        tag:"Paradise" },
                { name:"New York",       slug:"new-york",     emoji:"🗽", img:"https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?w=600w=400&q=75q=82",        tag:"City" },
                { name:"Maui",           slug:"maui",         emoji:"🌊", img:"https://images.unsplash.com/photo-1505852679233-d9fd70aff56d?w=600w=400&q=75q=82",        tag:"Beach" },
                { name:"Swiss Alps",     slug:"swiss-alps",   emoji:"⛷️", img:"https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600w=400&q=75q=82",        tag:"Ski" },
                { name:"Kenya Safari",   slug:"kenya-safari", emoji:"🦁", img:"https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600w=400&q=75q=82",        tag:"Wildlife" },
                { name:"Barcelona",      slug:"barcelona",    emoji:"🎨", img:"https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600w=400&q=75q=82",        tag:"Culture" },
                { name:"Kyoto",          slug:"kyoto",        emoji:"⛩️", img:"https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600w=400&q=75q=82",        tag:"Culture" },
                { name:"Phuket",         slug:"phuket",       emoji:"🌴", img:"https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600w=400&q=75q=82",          tag:"Beach" },
                { name:"Cape Town",      slug:"cape-town",    emoji:"🏔️", img:"https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600w=400&q=75q=82",        tag:"Adventure" },
                { name:"Tuscany",        slug:"tuscany",      emoji:"🍷", img:"https://images.unsplash.com/photo-1464207687429-7505649dae38?w=600w=400&q=75q=82",        tag:"Romance" },
                { name:"Iceland",        slug:"iceland",      emoji:"🌌", img:"https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=600w=400&q=75q=82",        tag:"Aurora" },
                { name:"Mykonos",        slug:"mykonos",      emoji:"🌊", img:"https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?w=600w=400&q=75q=82",        tag:"Luxury" },
                { name:"Miami",          slug:"miami",        emoji:"🌴", img:"https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?w=600w=400&q=75q=82",        tag:"Beach" },
                { name:"Rio de Janeiro", slug:"rio",          emoji:"🎉", img:"https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=600w=400&q=75q=82",        tag:"Vibrant" },
                { name:"Côte d'Azur",   slug:"cote-dazur",   emoji:"⛵", img:"https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600w=400&q=75q=82",        tag:"Luxury" },
                { name:"Queenstown",     slug:"queenstown",   emoji:"🪂", img:"https://images.unsplash.com/photo-1469521669194-babb45599def?w=600w=400&q=75q=82",        tag:"Adventure" },
                { name:"Marrakech",      slug:"marrakech",    emoji:"🕌", img:"https://images.unsplash.com/photo-1597212618440-806262de4f3b?w=600w=400&q=75q=82",        tag:"Culture" },
                { name:"Seychelles",     slug:"seychelles",   emoji:"🏝️", img:"https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=600w=400&q=75q=82",        tag:"Paradise" },
                { name:"Costa Rica",     slug:"costa-rica",   emoji:"🦜", img:"https://images.unsplash.com/photo-1518638150340-f706e86654de?w=600w=400&q=75q=82",        tag:"Nature" },
                { name:"Tanzania",       slug:"tanzania",     emoji:"🦒", img:"https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=600w=400&q=75q=82",          tag:"Safari" },
                { name:"Lisbon",         slug:"lisbon",       emoji:"🚋", img:"https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=600w=400&q=75q=82",          tag:"Culture" },
                { name:"Zanzibar",       slug:"zanzibar",     emoji:"🌊", img:"https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600w=400&q=75q=82",        tag:"Beach" },
              ].map((d) => (
                <Link key={d.slug} href={`/destinations/${d.slug}`} className="group relative overflow-hidden rounded-2xl aspect-square shadow-sm hover:shadow-xl transition-all hover:-translate-y-1" style={{ textDecoration: "none" }}>
                  <img src={d.img} alt={d.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute top-2 left-2 bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5 text-white text-xs font-bold">{d.tag}</div>
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="text-white font-bold text-sm leading-tight">{d.emoji} {d.name}</div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/chat" className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold px-8 py-4 rounded-2xl text-lg hover:opacity-90 transition-opacity shadow-lg" style={{ textDecoration: "none" }}>
                💬 Plan any destination with Lina →
              </Link>
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
