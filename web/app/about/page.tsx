export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import Header from "../../src/components/Header";
import Footer from "../../src/components/Footer";

export const metadata: Metadata = {
  title: "About Zeniva — US AI Travel Agency | Delaware, New York, Virginia",
  description:
    "Zeniva is an AI-powered travel agency incorporated in Delaware, USA, with offices in New York and Virginia. We serve travelers across all 50 US states and Canada. Meet Lina AI, your 24/7 travel concierge.",
  alternates: {
    canonical: "https://zenivatravel.com/about",
    languages: {
      "en-US": "https://zenivatravel.com/about",
      "en-CA": "https://zenivatravel.com/about",
    },
  },
  openGraph: {
    title: "About Zeniva — US AI Travel Agency",
    description:
      "AI-powered travel agency based in the USA (Delaware, NY, Virginia). Serving all 50 states & Canada with luxury trip planning, custom vacations, and 24/7 AI concierge.",
    url: "https://zenivatravel.com/about",
    type: "website",
    locale: "en_US",
  },
};

const schemaOrg = {
  "@context": "https://schema.org",
  "@type": ["TravelAgency", "Organization"],
  "name": "Zeniva",
  "legalName": "Zeniva LLC",
  "url": "https://zenivatravel.com",
  "logo": "https://zenivatravel.com/branding/logo.png",
  "description": "AI-powered travel agency incorporated in Delaware, USA. Offices in New York and Virginia. Serving all 50 US states and Canada.",
  "foundingDate": "2024",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "US",
    "addressRegion": "DE"
  },
  "areaServed": [
    { "@type": "Country", "name": "United States" },
    { "@type": "Country", "name": "Canada" }
  ]
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
              🇺🇸 Incorporated in Delaware, USA
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              America's AI Travel Agency
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Zeniva is a US-based travel technology company. We combine artificial intelligence with human expertise to plan the perfect trip — for every traveler, every destination, every budget.
            </p>
          </div>
        </section>

        {/* Company Info */}
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Who We Are</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Zeniva LLC is a travel technology company incorporated in the state of Delaware, United States. We operate nationally across all 50 US states and serve customers throughout Canada.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                Our flagship product, <strong>Lina AI</strong>, is a 24/7 AI travel concierge that helps travelers plan luxury vacations, custom trips, ZeniGroup, and ZeniYacht — in minutes, not hours.
              </p>
              <p className="text-gray-600 leading-relaxed">
                We're a fully digital travel agency. No brick-and-mortar storefront, no waiting on hold. Just fast, intelligent trip planning — available anytime.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Locations</h2>

              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🏢</span>
                  <div>
                    <div className="font-bold text-gray-900">Main Office</div>
                    <div className="text-sm text-blue-600 font-semibold">Williamsburg, Virginia</div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">114 Arden Dr, Williamsburg, VA 23185<br />📞 (332) 290-0021</p>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🏛️</span>
                  <div>
                    <div className="font-bold text-gray-900">Registered Office</div>
                    <div className="text-sm text-blue-600 font-semibold">Dover, Delaware</div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">8 The Green STE A, Dover, DE 19901<br />Incorporated in the State of Delaware.</p>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🗽</span>
                  <div>
                    <div className="font-bold text-gray-900">New York Office</div>
                    <div className="text-sm text-blue-600 font-semibold">New York, USA</div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">Operations and partnerships hub in New York — the world's travel capital.</p>
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
