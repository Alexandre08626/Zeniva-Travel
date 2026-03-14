import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Travel Agent Online — Plan & Book Trips Instantly | Zeniva Travel",
  description: "Zeniva Travel's AI travel agent plans your perfect trip in seconds. Flights, hotels, villas, yachts & experiences — all in one chat. Available 24/7. No fees.",
  openGraph: {
    title: "AI Travel Agent — Plan Any Trip in Seconds",
    description: "Talk to Lina, your AI travel agent. She plans flights, hotels, luxury villas, yacht charters and custom itineraries — 24/7, instantly, no booking fees.",
    url: "https://zenivatravel.com/ai-travel-agent",
  },
};

export default function AITravelAgentPage() {
  const comparisons = [
    { feature: "Available 24/7", lina: true, trad: false },
    { feature: "Instant personalized quotes", lina: true, trad: false },
    { feature: "No booking fees", lina: true, trad: false },
    { feature: "Multi-language (EN/FR/ES)", lina: true, trad: false },
    { feature: "Voice call available", lina: true, trad: false },
    { feature: "Yachts & villa rentals", lina: true, trad: false },
    { feature: "Group & corporate travel", lina: true, trad: true },
    { feature: "Real human backup", lina: true, trad: true },
  ];

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", color: "#0f172a" }}>
      <section style={{ background: "linear-gradient(135deg, #0B1B4D, #0F6CF5)", padding: "80px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ display: "inline-block", background: "rgba(255,255,255,0.15)", borderRadius: 20, padding: "6px 16px", fontSize: 13, color: "white", fontWeight: 600, marginBottom: 20 }}>🤖 The Future of Travel Planning</div>
          <h1 style={{ fontSize: "clamp(30px,5vw,54px)", fontWeight: 900, color: "white", lineHeight: 1.1, marginBottom: 20 }}>
            Your AI Travel Agent<br />Available 24/7 — Free
          </h1>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.85)", marginBottom: 36, lineHeight: 1.6 }}>
            Lina plans flights, hotels, luxury villas, yacht charters and custom itineraries in seconds.<br />No forms. No waiting. No fees. Just describe your dream trip.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/chat" style={{ background: "#E6B85A", color: "#0B1B4D", fontWeight: 800, fontSize: 16, padding: "16px 32px", borderRadius: 14, textDecoration: "none" }}>💬 Chat with Lina — Free</a>
            <a href="/call" style={{ background: "rgba(255,255,255,0.15)", color: "white", fontWeight: 700, fontSize: 16, padding: "16px 32px", borderRadius: 14, textDecoration: "none", border: "1.5px solid rgba(255,255,255,0.3)" }}>📞 Voice Call</a>
          </div>
        </div>
      </section>

      <section style={{ padding: "64px 24px", maxWidth: 900, margin: "0 auto" }}>
        <h2 style={{ fontSize: 36, fontWeight: 800, textAlign: "center", marginBottom: 40 }}>Lina vs. Traditional Travel Agent</h2>
        <div style={{ background: "white", border: "1.5px solid #e2e8f0", borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", background: "#f8fafc", borderBottom: "1.5px solid #e2e8f0" }}>
            <div style={{ padding: "16px 24px", fontWeight: 700, fontSize: 14, color: "#64748b" }}>Feature</div>
            <div style={{ padding: "16px 24px", fontWeight: 800, fontSize: 14, color: "#0F6CF5", textAlign: "center" }}>🤖 Lina AI (Zeniva)</div>
            <div style={{ padding: "16px 24px", fontWeight: 700, fontSize: 14, color: "#94a3b8", textAlign: "center" }}>Traditional Agent</div>
          </div>
          {comparisons.map((c, i) => (
            <div key={c.feature} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderBottom: i < comparisons.length - 1 ? "1px solid #f1f5f9" : "none" }}>
              <div style={{ padding: "14px 24px", fontSize: 15 }}>{c.feature}</div>
              <div style={{ padding: "14px 24px", textAlign: "center", fontSize: 18 }}>{c.lina ? "✅" : "❌"}</div>
              <div style={{ padding: "14px 24px", textAlign: "center", fontSize: 18 }}>{c.trad ? "✅" : "❌"}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: "#f8fafc", padding: "64px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 40 }}>What Lina Can Plan For You</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 16 }}>
            {[
              { icon: "✈️", label: "ZeniFlights" },
              { icon: "🏨", label: "Hotels & Resorts" },
              { icon: "🏠", label: "Luxury Villas" },
              { icon: "⛵", label: "Yacht Charters" },
              { icon: "🚗", label: "Car Rentals" },
              { icon: "🚌", label: "ZeniTransfers" },
              { icon: "🎭", label: "Experiences" },
              { icon: "🛳️", label: "ZeniCruise" },
              { icon: "🎽", label: "ZeniGroup" },
              { icon: "💼", label: "Corporate Trips" },
              { icon: "🌍", label: "Honeymoons" },
              { icon: "👨‍👩‍👧", label: "Family Vacations" },
            ].map(s => (
              <div key={s.label} style={{ background: "white", borderRadius: 16, padding: "24px 16px", textAlign: "center", border: "1.5px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Lina AI Travel Agent",
        "provider": { "@type": "TravelAgency", "name": "Zeniva Travel", "url": "https://zenivatravel.com" },
        "description": "AI-powered travel agent available 24/7. Plans flights, hotels, luxury villas, yacht charters and custom itineraries instantly.",
        "areaServed": "US",
        "hasOfferCatalog": { "@type": "OfferCatalog", "name": "Travel Services" }
      })}} />
    </main>
  );
}
