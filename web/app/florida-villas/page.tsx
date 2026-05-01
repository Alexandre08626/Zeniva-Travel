export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import SouthFloridaYachtsTeaser from "../../src/components/SouthFloridaYachtsTeaser";
import ZeniStayTeaser from "../../src/components/ZeniStayTeaser";

export const metadata: Metadata = {
  title: "Luxury Florida Villa Rentals — AI Travel Concierge | Zeniva",
  description: "Rent luxury villas in Miami Beach, Naples, Fort Lauderdale & Orlando. Lina AI finds the perfect Florida villa with pool, private beach & concierge. Book in seconds.",
  openGraph: {
    title: "Luxury Florida Villa Rentals — AI Planned by Lina",
    description: "Find & book the perfect Florida luxury villa. Pool, beachfront, private chef. Lina AI handles everything — 24/7 concierge included.",
    url: "https://zenivatravel.com/florida-villas",
    images: [{ url: "/branding/lina-hero.png" }],
  },
};

const VILLAS = [
  { city: "Miami Beach", desc: "Oceanfront estates on Star Island & South Beach. Private pools, concierge, boat access.", emoji: "🌊", price: "From $1,200/night" },
  { city: "Naples", desc: "Beachfront mansions on the Gulf Coast. Sunset views, golf, ultra-luxury amenities.", emoji: "🌅", price: "From $900/night" },
  { city: "Fort Lauderdale", desc: "Waterfront villas with private dock. Minutes from the beach and cruise terminals.", emoji: "⛵", price: "From $800/night" },
  { city: "Orlando", desc: "Resort-style villas near Disney & Universal. Private pool, game room, sleeps 10+.", emoji: "🎡", price: "From $600/night" },
  { city: "Key West", desc: "Island paradise villas. Snorkeling, fishing, sunsets. Laid-back Florida Keys luxury.", emoji: "🐠", price: "From $1,000/night" },
  { city: "Palm Beach", desc: "Billionaire Row estates. Designer interiors, private chefs, concierge-level service.", emoji: "💎", price: "From $2,000/night" },
];

const FAQS = [
  { q: "How does Lina AI find the best Florida villa for me?", a: "You tell Lina your dates, group size, budget and preferences. She searches 1,000+ villas and returns a personalized shortlist within seconds — including private pools, beachfront, pet-friendly and chef-staffed options." },
  { q: "Can I book a Florida villa last-minute?", a: "Yes. Lina specializes in last-minute luxury bookings. Many of our Florida villa partners hold inventory for urgent requests. Just chat with Lina and she'll find available options immediately." },
  { q: "Do Florida villas include a concierge?", a: "Most luxury properties we partner with include a dedicated concierge. Lina can also arrange airport transfers, private chefs, yacht charters, and day trips as part of your villa package." },
  { q: "What's the minimum rental period?", a: "Most Florida luxury villas require a 3-night minimum. Weekly rentals often come with significant discounts. Lina will always show you the best rate for your dates." },
  { q: "Is Zeniva licensed?", a: "Yes. Zeniva is incorporated in Delaware, USA and operates with full compliance. We are an AI-powered travel agency serving all 50 US states and Canada." },
];

export default function FloridaVillasPage() {
  return (
    <main style={{ fontFamily: "system-ui, sans-serif", color: "#0f172a", background: "#ffffff" }}>
      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, #0B1B4D 0%, #0F6CF5 100%)", padding: "80px 24px 60px", textAlign: "center" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ display: "inline-block", background: "rgba(255,255,255,0.15)", borderRadius: 20, padding: "6px 16px", fontSize: 13, color: "white", fontWeight: 600, marginBottom: 20 }}>✈️ AI-Planned Florida Villa Rentals</div>
          <h1 style={{ fontSize: "clamp(32px,5vw,56px)", fontWeight: 900, color: "white", lineHeight: 1.1, margin: "0 0 20px" }}>
            Luxury Florida Villas<br />Planned by AI in Seconds
          </h1>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.85)", marginBottom: 36, lineHeight: 1.6 }}>
            Miami Beach · Naples · Fort Lauderdale · Key West · Palm Beach<br />
            Tell Lina your dates — she finds the perfect villa, handles booking & concierge.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/chat?q=I%20want%20to%20rent%20a%20luxury%20villa%20in%20Florida"
              style={{ background: "#E6B85A", color: "#0B1B4D", fontWeight: 800, fontSize: 16, padding: "16px 32px", borderRadius: 14, textDecoration: "none", display: "inline-block" }}>
              💬 Chat with Lina — Free
            </a>
            <a href="/call"
              style={{ background: "rgba(255,255,255,0.15)", color: "white", fontWeight: 700, fontSize: 16, padding: "16px 32px", borderRadius: 14, textDecoration: "none", border: "1.5px solid rgba(255,255,255,0.3)", display: "inline-block" }}>
              📞 Call Lina AI
            </a>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", padding: "18px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", gap: 32, justifyContent: "center", flexWrap: "wrap", fontSize: 14, color: "#475569", fontWeight: 600 }}>
          {["⭐ 4.9/5 Average Rating", "🏠 1,000+ Florida Villas", "🤖 AI Concierge 24/7", "🇺🇸 Incorporated in Delaware", "💳 Secure Payment"].map(t => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </section>

      {/* Markets */}
      <section style={{ padding: "64px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ fontSize: 36, fontWeight: 800, textAlign: "center", marginBottom: 12 }}>Top Florida Villa Markets</h2>
        <p style={{ textAlign: "center", color: "#64748b", fontSize: 16, marginBottom: 48 }}>Lina knows every market — tell her your vibe and she finds the right city.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 24 }}>
          {VILLAS.map(v => (
            <div key={v.city} style={{ background: "white", border: "1.5px solid #e2e8f0", borderRadius: 20, padding: 28, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{v.emoji}</div>
              <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>{v.city}</h3>
              <p style={{ color: "#64748b", fontSize: 15, lineHeight: 1.6, marginBottom: 16 }}>{v.desc}</p>
              <div style={{ fontWeight: 700, color: "#0F6CF5", fontSize: 15, marginBottom: 16 }}>{v.price}</div>
              <a href={`/chat?q=I want a luxury villa in ${v.city} Florida`}
                style={{ display: "block", textAlign: "center", background: "#0F6CF5", color: "white", fontWeight: 700, padding: "12px", borderRadius: 10, textDecoration: "none", fontSize: 14 }}>
                Ask Lina about {v.city} →
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: "#f8fafc", padding: "64px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12 }}>How Lina Plans Your Florida Villa Trip</h2>
          <p style={{ color: "#64748b", fontSize: 16, marginBottom: 48 }}>No forms, no waiting, no back-and-forth with agents.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 24 }}>
            {[
              { n: "1", title: "Tell Lina", desc: "Chat or call — tell her your dates, group size, budget and what you're looking for.", icon: "💬" },
              { n: "2", title: "Get Options", desc: "Lina searches 1,000+ Florida villas and returns a personalized shortlist in seconds.", icon: "🔍" },
              { n: "3", title: "Book & Relax", desc: "Confirm your villa, pay securely. Lina handles concierge, transfers and extras.", icon: "✅" },
            ].map(s => (
              <div key={s.n} style={{ background: "white", borderRadius: 18, padding: 28, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>{s.icon}</div>
                <div style={{ fontWeight: 800, fontSize: 32, color: "#0F6CF5", marginBottom: 4 }}>{s.n}</div>
                <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{s.title}</div>
                <div style={{ color: "#64748b", fontSize: 14, lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ — schema */}
      <section style={{ padding: "64px 24px", maxWidth: 800, margin: "0 auto" }}>
        <h2 style={{ fontSize: 36, fontWeight: 800, textAlign: "center", marginBottom: 40 }}>Frequently Asked Questions</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {FAQS.map(f => (
            <div key={f.q} style={{ background: "#f8fafc", borderRadius: 16, padding: 24, border: "1px solid #e2e8f0" }}>
              <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>{f.q}</div>
              <div style={{ color: "#475569", fontSize: 15, lineHeight: 1.7 }}>{f.a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ JSON-LD schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": FAQS.map(f => ({
          "@type": "Question",
          "name": f.q,
          "acceptedAnswer": { "@type": "Answer", "text": f.a }
        }))
      })}} />

      <ZeniStayTeaser
        region="florida"
        badge="Florida — chalets, villas & condos"
        title="🏠 ZeniStay villas & condos in Florida"
        subtitle="Curated short-term rentals across Florida — beachfront condos, pool villas, downtown lofts. Chat with Lina to lock in your dates."
      />

      <SouthFloridaYachtsTeaser
        badge="Pair with your villa"
        title="South Florida yacht charters"
        subtitle="Add a half-day or full-day yacht to your Florida villa stay — Miami, Miami Beach, Fort Lauderdale, Key West and Palm Beach (chartered from Fort Lauderdale)."
      />

      {/* CTA */}
      <section style={{ background: "linear-gradient(135deg, #0B1B4D, #0F6CF5)", padding: "64px 24px", textAlign: "center" }}>
        <h2 style={{ fontSize: 40, fontWeight: 900, color: "white", marginBottom: 16 }}>Ready to Find Your Florida Villa?</h2>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 18, marginBottom: 36 }}>Chat with Lina now — she's available 24/7, it's free, and she finds what no search engine can.</p>
        <a href="/chat?q=I want to rent a luxury villa in Florida with a pool"
          style={{ background: "#E6B85A", color: "#0B1B4D", fontWeight: 800, fontSize: 18, padding: "18px 40px", borderRadius: 14, textDecoration: "none", display: "inline-block" }}>
          🏖️ Find My Florida Villa Now
        </a>
      </section>
    </main>
  );
}
