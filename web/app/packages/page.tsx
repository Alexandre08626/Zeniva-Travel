export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import Header from "../../src/components/Header";
import Footer from "../../src/components/Footer";
import FeaturedTripsByLina from "../../src/components/FeaturedTripsByLina";
import featuredTrips from "../../src/data/lina_featured_trips.json";

export const metadata: Metadata = {
  title: "Hot Deals from New York 2026 — All-Inclusive Vacations & Luxury Trips | Zeniva",
  description:
    "22 hand-picked vacation deals departing from New York (JFK). Cancun, Caribbean, Europe, Tokyo, Maldives & more — flights, hotels and transfers included. Planned by Lina AI.",
  alternates: {
    canonical: "https://zenivatravel.com/packages",
    languages: { "en-US": "https://zenivatravel.com/packages" },
  },
  keywords: [
    "vacation packages from New York", "JFK vacation deals", "all-inclusive deals from NYC",
    "Cancun from New York", "Caribbean from JFK", "luxury vacation packages",
    "honeymoon packages from NYC", "Europe packages from New York", "best travel deals 2026",
    "all-inclusive resorts deals", "NYC departures vacation"
  ],
  openGraph: {
    title: "Hot Deals Departing from New York | Zeniva — AI Concierge",
    description: "22 luxury & all-inclusive vacation packages from JFK. Cancun, Caribbean, Europe, Asia. Planned by Lina AI.",
    url: "https://zenivatravel.com/packages",
    type: "website",
    locale: "en_US",
  },
};

export default function PackagesPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Zeniva — Hot Deals Departing from New York 2026",
    "description": "Hand-picked all-inclusive and luxury vacation packages departing from New York (JFK), planned by Lina AI",
    "url": "https://zenivatravel.com/packages",
    "numberOfItems": featuredTrips.length,
    "itemListElement": featuredTrips.map((t, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": t.title,
      "description": t.description,
      "url": `https://zenivatravel.com/packages/${t.id}`,
    }))
  };

  return (
    <>
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <main className="min-h-screen bg-white">
        {/* Hero */}
        <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white py-12 sm:py-16 md:py-20 px-5 sm:px-6 text-center overflow-hidden">
          <div className="absolute top-0 right-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full opacity-20" style={{ background: "radial-gradient(circle, #E6B85A, transparent)", filter: "blur(80px)" }} />
          <div className="absolute bottom-0 left-0 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] rounded-full opacity-10" style={{ background: "radial-gradient(circle, #6366f1, transparent)", filter: "blur(60px)" }} />
          <div className="max-w-3xl mx-auto relative z-10">
            <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-sm font-semibold mb-4 sm:mb-6">
              🔥 Hot Deals · Departing from New York (JFK)
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 leading-tight">Top 22 Trips from NYC by Lina</h1>
            <p className="text-base sm:text-lg md:text-xl text-blue-100 mb-6 sm:mb-8 leading-relaxed">Hand-picked all-inclusive & luxury packages from New York. Flights, hotels and transfers — all included. Lina AI customizes to your dates and budget.</p>
            <Link href="/chat" className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 font-bold px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl hover:bg-blue-50 transition-colors text-base sm:text-lg shadow-lg w-full sm:w-auto max-w-md">
              💬 Ask Lina for a Custom Package
            </Link>
          </div>
        </section>

        {/* ── 22 NYC Hot Deals Grid (matches homepage) ── */}
        <section className="w-full px-3 sm:px-6 lg:px-8 xl:px-16 py-10 sm:py-14 md:py-16">
          <div className="max-w-[1400px] mx-auto">
            <div className="text-center mb-8 sm:mb-10 px-3">
              <p className="text-[11px] sm:text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">🔥 22 Exclusive Deals · Direct from JFK</p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 mb-3 leading-tight">Every Hot Deal from New York</h2>
              <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">Flights, hotels and transfers included. 100% customizable by Lina AI — just tell her your dates, group size, and preferences.</p>
            </div>
            <FeaturedTripsByLina />
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {[
                { name:"Maldives",       slug:"maldives",     emoji:"🏝️", img:"https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=600&q=82",        tag:"Paradise" },
                { name:"Santorini",      slug:"santorini",    emoji:"🌅", img:"https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&q=82",        tag:"Romantic" },
                { name:"Bali",           slug:"bali",         emoji:"🌴", img:"https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=600&q=82",        tag:"Adventure" },
                { name:"Dubai",          slug:"dubai",        emoji:"🏙️", img:"https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=82",        tag:"Luxury" },
                { name:"Cancún",         slug:"cancun",       emoji:"🏖️", img:"https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=600&q=82",          tag:"Beach" },
                { name:"Tokyo",          slug:"tokyo",        emoji:"🗼", img:"https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=82",        tag:"Culture" },
                { name:"Paris",          slug:"paris",        emoji:"🥐", img:"https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=82",        tag:"Romantic" },
                { name:"Amalfi Coast",   slug:"amalfi-coast", emoji:"🍋", img:"https://images.unsplash.com/photo-1510131883639-7d2dd2e34fca?w=600&q=82",        tag:"Scenic" },
                { name:"Bora Bora",      slug:"bora-bora",    emoji:"🌺", img:"https://images.unsplash.com/photo-1589979481223-deb893043163?w=600&q=82",        tag:"Paradise" },
                { name:"New York",       slug:"new-york",     emoji:"🗽", img:"https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?w=600&q=82",        tag:"City" },
                { name:"Maui",           slug:"maui",         emoji:"🌊", img:"https://images.unsplash.com/photo-1505852679233-d9fd70aff56d?w=600&q=82",        tag:"Beach" },
                { name:"Swiss Alps",     slug:"swiss-alps",   emoji:"⛷️", img:"https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&q=82",        tag:"Ski" },
                { name:"Kenya Safari",   slug:"kenya-safari", emoji:"🦁", img:"https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&q=82",        tag:"Wildlife" },
                { name:"Barcelona",      slug:"barcelona",    emoji:"🎨", img:"https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600&q=82",        tag:"Culture" },
                { name:"Kyoto",          slug:"kyoto",        emoji:"⛩️", img:"https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=82",        tag:"Culture" },
                { name:"Phuket",         slug:"phuket",       emoji:"🌴", img:"https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&q=82",          tag:"Beach" },
                { name:"Cape Town",      slug:"cape-town",    emoji:"🏔️", img:"https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600&q=82",        tag:"Adventure" },
                { name:"Tuscany",        slug:"tuscany",      emoji:"🍷", img:"https://images.unsplash.com/photo-1464207687429-7505649dae38?w=600&q=82",        tag:"Romance" },
                { name:"Iceland",        slug:"iceland",      emoji:"🌌", img:"https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=600&q=82",        tag:"Aurora" },
                { name:"Mykonos",        slug:"mykonos",      emoji:"🌊", img:"https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?w=600&q=82",        tag:"Luxury" },
                { name:"Miami",          slug:"miami",        emoji:"🌴", img:"https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?w=600&q=82",        tag:"Beach" },
                { name:"Rio de Janeiro", slug:"rio",          emoji:"🎉", img:"https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=600&q=82",        tag:"Vibrant" },
                { name:"Côte d'Azur",   slug:"cote-dazur",   emoji:"⛵", img:"https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&q=82",        tag:"Luxury" },
                { name:"Queenstown",     slug:"queenstown",   emoji:"🪂", img:"https://images.unsplash.com/photo-1469521669194-babb45599def?w=600&q=82",        tag:"Adventure" },
                { name:"Marrakech",      slug:"marrakech",    emoji:"🕌", img:"https://images.unsplash.com/photo-1597212618440-806262de4f3b?w=600&q=82",        tag:"Culture" },
                { name:"Seychelles",     slug:"seychelles",   emoji:"🏝️", img:"https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=600&q=82",        tag:"Paradise" },
                { name:"Costa Rica",     slug:"costa-rica",   emoji:"🦜", img:"https://images.unsplash.com/photo-1518638150340-f706e86654de?w=600&q=82",        tag:"Nature" },
                { name:"Tanzania",       slug:"tanzania",     emoji:"🦒", img:"https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=600&q=82",          tag:"Safari" },
                { name:"Lisbon",         slug:"lisbon",       emoji:"🚋", img:"https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=600&q=82",          tag:"Culture" },
                { name:"Zanzibar",       slug:"zanzibar",     emoji:"🌊", img:"https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=82",        tag:"Beach" },
              ].map((d) => (
                <Link key={d.slug} href={`/destinations/${d.slug}`} className="group relative overflow-hidden rounded-xl sm:rounded-2xl aspect-square shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 active:scale-[0.98]" style={{ textDecoration: "none" }}>
                  <img src={d.img} alt={d.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-white/25 backdrop-blur-sm rounded-full px-1.5 sm:px-2 py-0.5 text-white text-[10px] sm:text-xs font-bold">{d.tag}</div>
                  <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
                    <div className="text-white font-bold text-xs sm:text-sm leading-tight">{d.emoji} {d.name}</div>
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
