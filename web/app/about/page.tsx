export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import Header from "../../src/components/Header";
import Footer from "../../src/components/Footer";

export const metadata: Metadata = {
  title: "About Zeniva Travel — Who We Are, What We Book, How It Works",
  description:
    "Zeniva Travel is an online travel agency founded by Quebec entrepreneur Alexandre Blais (legal entity: Zeniva LLC, Delaware). All-inclusive vacations, cruises, group trips and yacht charters for Canada and the US, in English and French.",
  alternates: {
    canonical: "https://www.zenivatravel.com/about",
    languages: {
      "en-US": "https://www.zenivatravel.com/about",
      "en-CA": "https://www.zenivatravel.com/about",
    },
  },
  openGraph: {
    title: "About Zeniva Travel",
    description:
      "Online travel agency founded by Alexandre Blais. All-inclusive vacations, cruises, group trips and yacht charters for Canada and the US, with a 24/7 AI concierge, Lina.",
    url: "https://www.zenivatravel.com/about",
    type: "website",
    locale: "en_US",
  },
};

// L'entite complete (TravelAgency, @id #organization) est declaree dans layout.tsx ;
// ici on la reference seulement pour eviter deux entites concurrentes.
const schemaOrg = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "url": "https://www.zenivatravel.com/about",
  "name": "About Zeniva Travel",
  "about": { "@id": "https://www.zenivatravel.com/#organization" },
  "mainEntity": { "@id": "https://www.zenivatravel.com/#organization" }
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
      />
      <main className="min-h-screen bg-white">
        {/* Hero */}
        <section className="bg-gradient-to-br from-blue-900 to-blue-700 text-white py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm font-semibold mb-6">
              🇨🇦 🇺🇸 Canada &amp; United States · English &amp; French
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              About Zeniva Travel
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Zeniva Travel is an online travel agency founded by Quebec entrepreneur Alexandre Blais. We combine an AI concierge, Lina, with human follow-up to plan all-inclusive vacations, cruises, group trips and custom travel.
            </p>
          </div>
        </section>

        {/* Company Info */}
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Who We Are</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Zeniva Travel is operated by Zeniva LLC, a company incorporated in the state of Delaware, United States. It was founded in 2024 by <Link href="/alexandre-blais" className="text-blue-700 underline">Alexandre Blais</Link>, an entrepreneur from Quebec City, and serves travelers in Canada and the United States.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                Our flagship product, <strong>Lina AI</strong>, is a 24/7 AI travel concierge that helps travelers plan luxury vacations, custom trips, ZeniGroup, and ZeniYacht — in minutes, not hours.
              </p>
              <p className="text-gray-600 leading-relaxed">
                We're a fully digital travel agency. No brick-and-mortar storefront, no waiting on hold. Just fast, intelligent trip planning — available anytime.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">How to reach us</h2>

              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                <div className="font-bold text-gray-900 mb-1">Online agency — no storefront</div>
                <p className="text-gray-600 text-sm">We work remotely and by appointment, by phone, video call, chat and email, in English and French.</p>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                <div className="font-bold text-gray-900 mb-1">Contact</div>
                <p className="text-gray-600 text-sm">
                  📧 <a href="mailto:info@zeniva.ca" className="text-blue-700 underline">info@zeniva.ca</a><br />
                  📞 <a href="tel:+15817487017" className="text-blue-700 underline">+1 581-748-7017</a><br />
                  💬 <Link href="/chat" className="text-blue-700 underline">Chat with Lina, 24/7</Link>
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                <div className="font-bold text-gray-900 mb-1">Legal entity</div>
                <p className="text-gray-600 text-sm">Zeniva LLC — registered office: 8 The Green STE A, Dover, DE 19901, USA (Delaware registered agent address).</p>
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="py-16 px-6 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">What We Offer</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: "✈️", title: "Custom Trip Planning", desc: "AI-powered custom vacation planning for individuals, couples, and families. Any destination, any budget." },
                { icon: "🛥️", title: "ZeniYacht", desc: "Private yacht charters worldwide. Lina AI finds the perfect vessel and itinerary for your group." },
                { icon: "🏖️", title: "ZeniPackages", desc: "Curated all-inclusive resort packages to top destinations — Mexico, Caribbean, Europe, and beyond." },
                { icon: "👥", title: "ZeniGroup", desc: "Stress-free group trip planning for corporate retreats, weddings, bachelor/bachelorette parties, and more." },
                { icon: "🏡", title: "Luxury Rentals", desc: "Private villas, chalets, and short-term luxury rentals curated by Zeniva concierge experts." },
                { icon: "🤖", title: "Lina AI — 24/7 Concierge", desc: "Our AI travel concierge is available around the clock. Ask anything — she'll plan your dream trip in minutes." },
              ].map((s) => (
                <div key={s.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="text-3xl mb-3">{s.icon}</div>
                  <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Service area */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Serving All 50 US States & Canada</h2>
            <p className="text-gray-600 text-lg mb-8">
              Zeniva is a fully digital travel agency. We serve customers in every US state — including California, Texas, Florida, New York, Illinois, Pennsylvania, Ohio, Georgia, North Carolina, Michigan — and across all Canadian provinces.
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-sm">
              {["New York", "California", "Texas", "Florida", "Illinois", "Virginia", "Delaware", "Pennsylvania", "Georgia", "North Carolina", "Ohio", "Michigan", "New Jersey", "Washington", "Colorado", "Arizona", "Ontario", "Quebec", "British Columbia", "Alberta"].map(state => (
                <span key={state} className="bg-blue-50 border border-blue-100 text-blue-700 rounded-full px-3 py-1 font-medium">{state}</span>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-6 bg-blue-700 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Plan Your Trip?</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">Talk to Lina AI — available 24/7. Tell her your dream destination and she'll have a full proposal ready in minutes.</p>
          <Link href="/chat" className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-8 py-4 rounded-2xl hover:bg-blue-50 transition-colors text-lg">
            Start Planning Now →
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
