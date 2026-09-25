// Google Ads landing page — "AI-planned luxury vacations" (US audience).
// Kept out of the sitemap and noindexed on purpose: paid traffic only, so
// it never competes with the SEO pages. Single goal: capture a lead
// (form) or push the visitor into Lina's chat.
import type { Metadata } from "next";
import LeadForm from "./LeadForm.client";

export const metadata: Metadata = {
  title: "Luxury Vacations Planned by AI in Minutes | Zeniva",
  description:
    "Tell Lina AI where you want to go — she builds a custom luxury itinerary, finds the best rates and books everything. Free, 24/7, serving all 50 states.",
  robots: { index: false, follow: true },
  alternates: { canonical: "https://zenivatravel.com/lp/luxury-vacation" },
  openGraph: {
    title: "Luxury Vacations Planned by AI in Minutes | Zeniva",
    description: "Custom itineraries, best rates, concierge included. Chat with Lina AI — free.",
    url: "https://zenivatravel.com/lp/luxury-vacation",
    images: [{ url: "/branding/lina-hero.png" }],
  },
};

const CHAT = "/chat?q=I%20want%20help%20planning%20a%20luxury%20vacation";

const BENEFITS = [
  { icon: "⚡", title: "Itinerary in minutes, not weeks", desc: "Lina drafts a day-by-day plan with hotels, flights and experiences the moment you tell her what you like." },
  { icon: "💎", title: "Luxury for less", desc: "Access to 500,000+ hotels, villas and yachts with agency-only rates. You pay the same or less than booking direct." },
  { icon: "🕐", title: "A human-level concierge, 24/7", desc: "Change dates, add a private chef, move a dinner — text Lina any time, before and during your trip." },
  { icon: "🛡️", title: "Booked & protected", desc: "Secure payment, real confirmations, US-incorporated company. A real team backs Lina on every booking." },
];

const TRIPS = [
  { name: "Caribbean All-Inclusive", price: "from $1,900 / person", q: "Plan an all-inclusive Caribbean vacation", emoji: "🏝️" },
  { name: "Italy & Amalfi Coast", price: "from $3,400 / person", q: "Plan a luxury trip to Italy and the Amalfi Coast", emoji: "🍋" },
  { name: "Miami & Florida Villas", price: "from $600 / night", q: "I want a luxury villa in Florida", emoji: "🌴" },
  { name: "Hawaii Escape", price: "from $2,800 / person", q: "Plan a Hawaii vacation", emoji: "🌺" },
  { name: "Cancun & Riviera Maya", price: "from $1,500 / person", q: "Plan a trip to Cancun or Tulum", emoji: "🌊" },
  { name: "Private Yacht Charter", price: "from $4,500 / day", q: "I want to charter a private yacht", emoji: "⛵" },
];

const STEPS = [
  { n: "1", title: "Tell Lina", desc: "Dates, budget, who is coming, what you love. Chat, call, or fill the form." },
  { n: "2", title: "Get your plan", desc: "A personalized itinerary with real prices lands in your inbox in minutes." },
  { n: "3", title: "Book & relax", desc: "Approve, pay securely, and Lina handles confirmations, transfers and extras." },
];

const FAQS = [
  { q: "Is it really free to get a trip plan?", a: "Yes. Planning with Lina is free and there is no obligation. Zeniva is paid by travel suppliers when you book, so you never pay a planning fee." },
  { q: "Is Lina a real travel agent or a chatbot?", a: "Lina is Zeniva's AI travel concierge, backed by a human team. She plans, prices and books in real time; a human agent reviews every booking before confirmation." },
  { q: "Will I pay more than booking myself?", a: "No. Zeniva has access to agency and wholesale rates on hotels, villas, yachts and packages, so most trips cost the same or less than booking direct — with concierge included." },
  { q: "Where can Zeniva book trips?", a: "Anywhere in the world. Zeniva is incorporated in Delaware, USA and serves travelers in all 50 states and Canada." },
  { q: "What if my plans change?", a: "Text Lina. She re-books, moves dates and adjusts your itinerary. Cancellation terms depend on each supplier and are shown clearly before you pay." },
];

export default function LuxuryVacationLandingPage() {
  return (
    <main style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif", color: "#0f172a", background: "#ffffff" }}>
      {/* Minimal top bar — no site nav, keep the visitor on the page */}
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "#0B1B4D", fontWeight: 900, fontSize: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/branding/logo.png" alt="Zeniva" width={36} height={36} style={{ borderRadius: 8 }} />
          Zeniva
        </a>
        <a href={CHAT} style={{ background: "#0F6CF5", color: "white", fontWeight: 700, fontSize: 14, padding: "10px 18px", borderRadius: 10, textDecoration: "none" }}>
          💬 Chat with Lina
        </a>
      </header>

      {/* Hero + form */}
      <section style={{ background: "linear-gradient(135deg, #0B1B4D 0%, #0F6CF5 100%)", padding: "56px 24px 64px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 40, alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-block", background: "rgba(255,255,255,0.15)", borderRadius: 20, padding: "6px 16px", fontSize: 13, color: "white", fontWeight: 600, marginBottom: 20 }}>
              ⭐ AI Travel Concierge · Free · 24/7
            </div>
            <h1 style={{ fontSize: "clamp(34px,5vw,56px)", fontWeight: 900, color: "white", lineHeight: 1.08, margin: "0 0 18px" }}>
              Your Dream Vacation,<br />Planned by AI in Minutes
            </h1>
            <p style={{ fontSize: 18, color: "rgba(255,255,255,0.88)", lineHeight: 1.6, margin: "0 0 28px", maxWidth: 520 }}>
              Tell Lina where you want to go. She builds a custom luxury itinerary, finds agency-only rates and books everything — hotels, flights, villas, yachts.
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px", display: "grid", gap: 10, color: "white", fontSize: 15, fontWeight: 600 }}>
              <li>✔ Custom itinerary in minutes — no forms, no waiting</li>
              <li>✔ Same price or lower than booking direct</li>
              <li>✔ Concierge included before and during your trip</li>
            </ul>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href={CHAT} style={{ background: "#E6B85A", color: "#0B1B4D", fontWeight: 800, fontSize: 16, padding: "15px 28px", borderRadius: 12, textDecoration: "none" }}>
                💬 Chat with Lina — Free
              </a>
              <a href="/call" style={{ background: "rgba(255,255,255,0.15)", color: "white", fontWeight: 700, fontSize: 16, padding: "15px 28px", borderRadius: 12, textDecoration: "none", border: "1.5px solid rgba(255,255,255,0.3)" }}>
                📞 Call Lina
              </a>
            </div>
          </div>
          <LeadForm />
        </div>
      </section>

      {/* Trust bar */}
      <section style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", padding: "18px 24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", gap: 28, justifyContent: "center", flexWrap: "wrap", fontSize: 14, color: "#475569", fontWeight: 600 }}>
          {["🇺🇸 US company (Delaware)", "🏨 500,000+ hotels, villas & yachts", "🤖 AI concierge 24/7", "💳 Secure payment", "🧑‍💼 Human agents on every booking"].map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section style={{ padding: "64px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ fontSize: "clamp(28px,4vw,38px)", fontWeight: 800, textAlign: "center", margin: "0 0 12px" }}>Why travelers switch to Zeniva</h2>
        <p style={{ textAlign: "center", color: "#64748b", fontSize: 16, margin: "0 0 44px" }}>Everything a luxury travel agency does — instantly, and without the markup.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 22 }}>
          {BENEFITS.map((b) => (
            <div key={b.title} style={{ background: "white", border: "1.5px solid #e2e8f0", borderRadius: 18, padding: 26, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>{b.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8 }}>{b.title}</div>
              <div style={{ color: "#64748b", fontSize: 15, lineHeight: 1.6 }}>{b.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Popular trips */}
      <section style={{ background: "#f8fafc", padding: "64px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(28px,4vw,38px)", fontWeight: 800, textAlign: "center", margin: "0 0 12px" }}>Popular right now</h2>
          <p style={{ textAlign: "center", color: "#64748b", fontSize: 16, margin: "0 0 40px" }}>Tap a trip and Lina starts planning it for you.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 20 }}>
            {TRIPS.map((t) => (
              <a key={t.name} href={`/chat?q=${encodeURIComponent(t.q)}`} style={{ display: "block", background: "white", border: "1.5px solid #e2e8f0", borderRadius: 18, padding: 24, textDecoration: "none", color: "#0f172a" }}>
                <div style={{ fontSize: 34, marginBottom: 10 }}>{t.emoji}</div>
                <div style={{ fontWeight: 800, fontSize: 19, marginBottom: 4 }}>{t.name}</div>
                <div style={{ color: "#0F6CF5", fontWeight: 700, fontSize: 14, marginBottom: 12 }}>{t.price}</div>
                <div style={{ color: "#0F6CF5", fontWeight: 700, fontSize: 14 }}>Ask Lina →</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: "64px 24px", maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ fontSize: "clamp(28px,4vw,38px)", fontWeight: 800, margin: "0 0 12px" }}>How it works</h2>
        <p style={{ color: "#64748b", fontSize: 16, margin: "0 0 44px" }}>Three steps. Zero back-and-forth.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 22 }}>
          {STEPS.map((s) => (
            <div key={s.n} style={{ background: "#f8fafc", borderRadius: 18, padding: 26 }}>
              <div style={{ fontWeight: 900, fontSize: 34, color: "#0F6CF5", marginBottom: 6 }}>{s.n}</div>
              <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8 }}>{s.title}</div>
              <div style={{ color: "#64748b", fontSize: 14, lineHeight: 1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: "#f8fafc", padding: "64px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(28px,4vw,38px)", fontWeight: 800, textAlign: "center", margin: "0 0 36px" }}>Questions? Answered.</h2>
          <div style={{ display: "grid", gap: 14 }}>
            {FAQS.map((f) => (
              <div key={f.q} style={{ background: "white", borderRadius: 16, padding: 22, border: "1px solid #e2e8f0" }}>
                <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>{f.q}</div>
                <div style={{ color: "#475569", fontSize: 15, lineHeight: 1.7 }}>{f.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      }) }} />

      {/* Final CTA + second form */}
      <section style={{ background: "linear-gradient(135deg, #0B1B4D, #0F6CF5)", padding: "64px 24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 40, alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: "clamp(30px,4vw,42px)", fontWeight: 900, color: "white", margin: "0 0 14px" }}>Ready when you are.</h2>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 17, lineHeight: 1.6, margin: "0 0 24px" }}>
              Leave your email and Lina sends a first draft of your trip within minutes. Or skip the form and chat with her right now.
            </p>
            <a href={CHAT} style={{ display: "inline-block", background: "rgba(255,255,255,0.15)", color: "white", fontWeight: 700, fontSize: 16, padding: "14px 26px", borderRadius: 12, textDecoration: "none", border: "1.5px solid rgba(255,255,255,0.3)" }}>
              💬 Chat with Lina instead
            </a>
          </div>
          <LeadForm compact />
        </div>
      </section>

      <footer style={{ padding: "22px 24px", textAlign: "center", fontSize: 12, color: "#94a3b8" }}>
        © {new Date().getFullYear()} Zeniva Travel LLC · Delaware, USA ·{" "}
        <a href="/privacy-policy" style={{ color: "#94a3b8" }}>Privacy</a> · <a href="/terms" style={{ color: "#94a3b8" }}>Terms</a>
      </footer>
    </main>
  );
}
