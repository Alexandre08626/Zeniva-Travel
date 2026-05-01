import type { Metadata } from "next";
import SouthFloridaYachtsTeaser from "@/src/components/SouthFloridaYachtsTeaser";

export const metadata: Metadata = {
  title: "Miami Yacht Charters — Real Boats, Live Pricing | ZeniYacht",
  description:
    "Book a private yacht charter in Miami: Miami Beach, Coconut Grove, Key Biscayne, Haulover, Bayside, Miami River. 36-boat fleet — Leopard, Azimut, Lagoon, Sunreef, Princess. Half-day, full-day or weekly. 24/7 concierge by Lina AI.",
  keywords: [
    "Miami yacht charter",
    "Miami Beach yacht rental",
    "private yacht Miami",
    "Coconut Grove yacht charter",
    "Key Biscayne yacht",
    "Haulover yacht rental",
    "luxury yacht Miami",
    "Sunreef Miami",
    "Azimut Miami",
  ],
  alternates: { canonical: "https://www.zenivatravel.com/yacht-charters/miami" },
  openGraph: {
    title: "Miami Yacht Charters | ZeniYacht by Zeniva",
    description: "36-boat South Florida fleet. Half-day, full-day or weekly charters out of Miami, Miami Beach, Coconut Grove, Key Biscayne and Haulover.",
    url: "https://www.zenivatravel.com/yacht-charters/miami",
    siteName: "Zeniva Travel",
    type: "website",
    images: [{ url: "/yachts/sunreef-70/photo_001.jpg", width: 1200, height: 630, alt: "Sunreef 70 — Miami yacht charter" }],
  },
};

export default function MiamiYachtCharterPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-blue-700 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <div className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest">🛥️ Miami fleet</div>
          <h1 className="mt-4 text-4xl md:text-5xl font-black leading-tight">Miami Yacht Charters — Real Boats, Live Pricing</h1>
          <p className="mt-4 max-w-2xl text-lg text-white/80">
            Charter a private yacht in Miami today. 36-boat fleet across Miami Beach, Coconut Grove, Key Biscayne, Haulover, Bayside and the
            Miami River — Leopard, Azimut, Sunreef, Lagoon, Princess and more. Half-day, full-day, multi-day or weekly. Lina AI handles the
            booking, the gratuity, the marina and the captain.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="/zeniyacht" className="rounded-full bg-yellow-400 px-6 py-3 text-sm font-bold text-slate-900 hover:bg-yellow-300">Browse the full fleet</a>
            <a href="/chat?prompt=I+want+to+charter+a+yacht+in+Miami" className="rounded-full bg-white/10 border border-white/20 px-6 py-3 text-sm font-bold text-white hover:bg-white/20">💬 Chat with Lina</a>
          </div>
        </div>
      </section>

      <SouthFloridaYachtsTeaser
        badge="Available right now in Miami"
        title="Miami yacht charters — pick a boat"
        subtitle="All boats below are real ZeniYacht inventory in South Florida. Click any card to view full specs, photos, captain and pricing."
        limit={12}
      />

      <section className="mx-auto max-w-4xl px-4 py-16">
        <h2 className="text-2xl font-black text-slate-900">Why charter through Zeniva</h2>
        <ul className="mt-4 space-y-3 text-slate-700">
          <li>✅ <strong>One quote, all-in.</strong> Captain, stew, gratuity, fuel and marina included where applicable.</li>
          <li>✅ <strong>Real availability.</strong> Live calendar — no fake "from $X" listings.</li>
          <li>✅ <strong>Concierge add-ons.</strong> Floating mat, paddleboard, snorkel gear, chef on board, restaurant pickup at Bayside or Coconut Grove.</li>
          <li>✅ <strong>24/7 human backup.</strong> Real Zeniva advisor reachable from your boat if anything goes sideways.</li>
        </ul>

        <h2 className="mt-10 text-2xl font-black text-slate-900">Pickup marinas we serve</h2>
        <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-700">
          {["Miami Beach Marina", "Bayside Marketplace", "Coconut Grove (Dinner Key)", "Key Biscayne", "Haulover Marina", "Miami River", "N. Bay Village", "Island Gardens (Watson Island)"].map((m) => (
            <span key={m} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">{m}</span>
          ))}
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: "Miami Yacht Charter",
            provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" },
            serviceType: "Private Yacht Charter",
            areaServed: { "@type": "City", name: "Miami", address: { "@type": "PostalAddress", addressCountry: "US", addressRegion: "FL" } },
          }),
        }}
      />
    </main>
  );
}
