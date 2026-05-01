import type { Metadata } from "next";
import SouthFloridaYachtsTeaser from "@/src/components/SouthFloridaYachtsTeaser";

export const metadata: Metadata = {
  title: "Palm Beach Yacht Charters — Private Boats & Catamarans | ZeniYacht",
  description:
    "Charter a private yacht serving Palm Beach. Departures from Fort Lauderdale and Miami marinas — Sunreef, Azimut, Lagoon, Princess, Leopard. Lina AI 24/7 books captain, gratuity, marina and concierge add-ons.",
  keywords: [
    "Palm Beach yacht charter",
    "Palm Beach yacht rental",
    "private yacht Palm Beach",
    "Lake Worth yacht charter",
    "Palm Beach catamaran",
    "luxury yacht South Florida",
  ],
  alternates: { canonical: "https://www.zenivatravel.com/yacht-charters/palm-beach" },
  openGraph: {
    title: "Palm Beach Yacht Charters | ZeniYacht by Zeniva",
    description: "Private yacht charters serving Palm Beach. Boats based in Fort Lauderdale and Miami — pickup arranged in Palm Beach on request.",
    url: "https://www.zenivatravel.com/yacht-charters/palm-beach",
    siteName: "Zeniva Travel",
    type: "website",
    images: [{ url: "/yachts/princess-88/photo_001.jpg", width: 1200, height: 630, alt: "Princess 88 — Palm Beach yacht charter" }],
  },
};

export default function PalmBeachYachtCharterPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-slate-900 via-emerald-900 to-emerald-700 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <div className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest">🛥️ Palm Beach service</div>
          <h1 className="mt-4 text-4xl md:text-5xl font-black leading-tight">Palm Beach Yacht Charters</h1>
          <p className="mt-4 max-w-2xl text-lg text-white/85">
            Private yacht charters serving Palm Beach, Lake Worth, Singer Island and Jupiter. Our Fort Lauderdale and
            Miami fleet repositions to a Palm Beach pickup on request — same all-in pricing, same 24/7 Lina AI concierge,
            same real boats with captain and stew included.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="/zeniyacht" className="rounded-full bg-yellow-400 px-6 py-3 text-sm font-bold text-slate-900 hover:bg-yellow-300">Browse the full fleet</a>
            <a href="/chat?prompt=I+want+to+charter+a+yacht+in+Palm+Beach" className="rounded-full bg-white/10 border border-white/20 px-6 py-3 text-sm font-bold text-white hover:bg-white/20">💬 Chat with Lina</a>
          </div>
        </div>
      </section>

      <SouthFloridaYachtsTeaser
        badge="Repositionable to Palm Beach"
        title="Yachts available for Palm Beach charters"
        subtitle="Boats based in Fort Lauderdale (≈1h cruise to Palm Beach) and Miami. Tell Lina the date — she arranges pickup at Lake Worth, Singer Island, Jupiter, or any Palm Beach marina."
        limit={12}
      />

      <section className="mx-auto max-w-4xl px-4 py-16">
        <h2 className="text-2xl font-black text-slate-900">How Palm Beach charters work</h2>
        <div className="mt-4 space-y-4 text-slate-700">
          <p>
            <strong>Why our boats are based in Fort Lauderdale and Miami:</strong> the highest concentration of
            charter-grade yachts on the US east coast sit in those two harbors. Fort Lauderdale → Palm Beach is a
            ~1-hour scenic cruise up the Intracoastal; Miami → Palm Beach is ~2 hours offshore. Most charters
            absorb that repositioning into the day; longer trips just add a small fuel adjustment.
          </p>
          <p>
            <strong>Pickup options:</strong> Sailfish Marina (Palm Beach Shores), Riviera Beach Marina, Lake Worth
            municipal docks, Singer Island, Jupiter Inlet — any Palm Beach County marina with depth for the boat.
          </p>
          <p>
            <strong>Best routes from Palm Beach:</strong> Singer Island sandbar swim stop, Peanut Island, Jupiter
            Inlet sandbar, Lake Worth Lagoon, evening cruise past Mar-a-Lago, sunset offshore with champagne service.
          </p>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: "Palm Beach Yacht Charter",
            provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" },
            serviceType: "Private Yacht Charter",
            areaServed: { "@type": "City", name: "Palm Beach", address: { "@type": "PostalAddress", addressCountry: "US", addressRegion: "FL" } },
          }),
        }}
      />
    </main>
  );
}
