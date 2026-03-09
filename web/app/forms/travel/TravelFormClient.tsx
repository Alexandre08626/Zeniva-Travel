"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

const BLUE = "#0F6CF5";
const GOLD = "#E6B85A";
const HQ_EMAIL = "info@zeniva.ca";

const TRUST_BADGES = [
  { icon: "🔒", text: "SSL Secured" },
  { icon: "✅", text: "No credit card" },
  { icon: "⭐", text: "4.9/5 rating" },
  { icon: "🇺🇸", text: "US-based" },
];

const SOCIAL_PROOF = [
  { name: "Sarah M.", city: "New York, NY", text: "Lina planned our Maldives trip in 48h. Absolutely stunning!", stars: 5 },
  { name: "James T.", city: "Richmond, VA", text: "Best travel experience. The villa in Miami was perfect.", stars: 5 },
  { name: "Emily R.", city: "Brooklyn, NY", text: "15% off and zero fees — Zeniva is a game changer.", stars: 5 },
];

export default function TravelFormClient() {
  const searchParams = useSearchParams();
  const agentEmail = searchParams.get("agent") || "";
  const isHQ = !agentEmail || agentEmail === HQ_EMAIL;
  const agentName = agentEmail && !isHQ
    ? agentEmail.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())
    : "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [destination, setDestination] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const allFilled = name.trim() && email.trim() && phone.trim() && destination.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allFilled) return;
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/forms/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formId: "travel-agent",
          name, email, phone, destination,
          ...(agentEmail ? { agentEmail, referredBy: agentEmail } : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Submission failed");
      if (data?.setupUrl) {
        window.location.href = data.setupUrl;
        return;
      }
      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      setError(err?.message || "Something went wrong. Try again.");
    }
  };

  // ── SUCCESS ──────────────────────────────────────────────────────────────
  if (status === "success") {
    return (
      <main style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(160deg, #040d1f 0%, #0B1B4D 60%, #040d1f 100%)", padding: "24px 20px" }}>
        <div style={{ maxWidth: 440, width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
          <div style={{ background: `linear-gradient(135deg, ${GOLD}22, ${GOLD}11)`, border: `2px solid ${GOLD}55`, borderRadius: 20, padding: "16px 24px", marginBottom: 24 }}>
            <div style={{ color: GOLD, fontSize: 22, fontWeight: 900 }}>🎁 Your 15% discount is locked in!</div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, marginTop: 6 }}>Check your email — we sent your discount code + account link</div>
          </div>
          <h1 style={{ color: "white", fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Welcome, {name.split(" ")[0]}! ✈️</h1>
          <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
            Lina is already working on your trip to <strong style={{ color: "white" }}>{destination}</strong>. Your personalized proposal is on its way!
          </p>
          <a href="https://zenivatravel.com" style={{ display: "inline-block", background: `linear-gradient(135deg, ${BLUE}, #0851c4)`, color: "white", borderRadius: 50, padding: "14px 32px", fontWeight: 700, fontSize: 15, textDecoration: "none" }}>
            🌍 Explore destinations →
          </a>
        </div>
      </main>
    );
  }

  // ── FORM ─────────────────────────────────────────────────────────────────
  return (
    <main style={{ minHeight: "100dvh", background: "linear-gradient(160deg, #040d1f 0%, #0B1B4D 60%, #040d1f 100%)", padding: "32px 20px 48px" }}>
      <div style={{ maxWidth: 460, margin: "0 auto" }}>

        <style>{`
            @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
            input::placeholder { color: rgba(255,255,255,0.25) !important; }
            input:-webkit-autofill { -webkit-box-shadow: 0 0 0 1000px rgba(15,108,245,0.15) inset !important; -webkit-text-fill-color: white !important; }
        `}</style>

        {/* ── HEADER ── */}
        <div style={{ textAlign: "center", marginBottom: 24, animation: "fadeUp 0.4s ease both" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", border: `3px solid ${GOLD}`, overflow: "hidden", background: "#0B1B4D", boxShadow: `0 0 24px ${GOLD}44` }}>
              <img src="/branding/lina-avatar.png" alt="Lina" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          </div>
          <h1 style={{ color: "white", fontSize: 27, fontWeight: 900, marginBottom: 8, lineHeight: 1.2 }}>
            Plan Your Dream Trip ✈️
          </h1>
          <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.6, maxWidth: 340, margin: "0 auto" }}>
            {agentName
              ? `Your specialist ${agentName} + Lina AI will build your perfect trip`
              : "30 seconds to start — Lina AI handles everything, 100% free"}
          </p>
        </div>

        {/* ── TRUST BADGES ── */}
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
          {TRUST_BADGES.map(b => (
            <div key={b.text} style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 30, padding: "5px 12px" }}>
              <span style={{ fontSize: 14 }}>{b.icon}</span>
              <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 600 }}>{b.text}</span>
            </div>
          ))}
        </div>

        {/* ── FORM CARD ── */}
        <form onSubmit={handleSubmit} style={{ background: "rgba(255,255,255,0.04)", border: "1.5px solid rgba(15,108,245,0.3)", borderRadius: 24, padding: "28px 24px", backdropFilter: "blur(16px)", display: "flex", flexDirection: "column", gap: 16, marginBottom: 28, animation: "fadeUp 0.5s ease 0.1s both" }}>

          {/* Name */}
          <Field label="Full name" icon="👤">
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              onFocus={() => setFocusedField("name")} onBlur={() => setFocusedField(null)}
              placeholder="John Smith" required autoComplete="name"
              style={inputStyle(focusedField === "name")} />
          </Field>

          {/* Email */}
          <Field label="Email address" icon="📧">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              onFocus={() => setFocusedField("email")} onBlur={() => setFocusedField(null)}
              placeholder="you@email.com" required autoComplete="email"
              style={inputStyle(focusedField === "email")} />
          </Field>

          {/* Phone */}
          <Field label="Phone number" icon="📱">
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              onFocus={() => setFocusedField("phone")} onBlur={() => setFocusedField(null)}
              placeholder="+1 (555) 555-5555" required autoComplete="tel"
              style={inputStyle(focusedField === "phone")} />
          </Field>

          {/* Destination */}
          <Field label="Where do you want to go?" icon="🌍">
            <input type="text" value={destination} onChange={e => setDestination(e.target.value)}
              onFocus={() => setFocusedField("dest")} onBlur={() => setFocusedField(null)}
              placeholder="Maldives, Cancun, Paris, Miami…" required
              style={inputStyle(focusedField === "dest")} />
          </Field>

          {/* Popular chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {["🏝 Maldives", "🏖 Miami", "🗺 Cancun", "🏔 Swiss Alps", "🌴 Bali"].map(d => (
              <button key={d} type="button" onClick={() => setDestination(d.split(" ").slice(1).join(" "))}
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 30, padding: "5px 12px", color: "rgba(255,255,255,0.55)", fontSize: 12, cursor: "pointer", fontWeight: 500 }}>
                {d}
              </button>
            ))}
          </div>

          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "10px 14px", color: "#fca5a5", fontSize: 13 }}>
              ⚠️ {error}
            </div>
          )}

          {/* CTA */}
          <button type="submit" disabled={status === "sending" || !allFilled} style={{
            width: "100%", marginTop: 4,
            background: allFilled
              ? `linear-gradient(135deg, ${GOLD} 0%, #C9941F 100%)`
              : "rgba(255,255,255,0.06)",
            color: allFilled ? "#0B1B4D" : "rgba(255,255,255,0.25)",
            border: "none", borderRadius: 50, padding: "16px", fontSize: 16, fontWeight: 900,
            cursor: allFilled ? "pointer" : "not-allowed",
            transition: "all 0.25s",
            boxShadow: allFilled ? `0 8px 32px ${GOLD}55` : "none",
            letterSpacing: "-0.01em",
          }}>
            {status === "sending" ? "⏳ Creating your account…" : "🚀 Start planning my trip →"}
          </button>

          <p style={{ textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 11, margin: 0 }}>
            🔒 256-bit SSL · No credit card required · Cancel anytime · US-based company
          </p>
        </form>

        {/* ── SOCIAL PROOF ── */}
        <div style={{ animation: "fadeUp 0.5s ease 0.2s both" }}>
          <div style={{ textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
            ⭐⭐⭐⭐⭐ Trusted by travelers from New York to California
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {SOCIAL_PROOF.map((r, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: `hsl(${i * 60 + 200}, 60%, 45%)`, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                    {r.name[0]}
                  </div>
                  <div>
                    <div style={{ color: "white", fontWeight: 700, fontSize: 14 }}>{r.name}</div>
                    <div style={{ color: "#64748b", fontSize: 12 }}>📍 {r.city}</div>
                  </div>
                  <div style={{ marginLeft: "auto", color: GOLD, fontSize: 14 }}>{"★".repeat(r.stars)}</div>
                </div>
                <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.5, margin: 0, fontStyle: "italic" }}>"{r.text}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── BOTTOM REASSURANCE ── */}
        <div style={{ marginTop: 28, textAlign: "center", animation: "fadeUp 0.5s ease 0.3s both" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap", marginBottom: 14 }}>
            {[
              { icon: "🏢", text: "Delaware Inc." },
              { icon: "🤝", text: "No hidden fees" },
              { icon: "📞", text: "24/7 AI support" },
              { icon: "✈️", text: "400+ destinations" },
            ].map(b => (
              <div key={b.text} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 16 }}>{b.icon}</span>
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>{b.text}</span>
              </div>
            ))}
          </div>
          <p style={{ color: "rgba(255,255,255,0.15)", fontSize: 11, lineHeight: 1.6, maxWidth: 340, margin: "0 auto" }}>
            Zeniva Travel Inc. · Incorporated in Delaware, USA · Your information is protected under US privacy law
          </p>
        </div>

      </div>
    </main>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function Field({ label, icon, children }: { label: string; icon: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <span>{icon}</span> {label}
      </label>
      {children}
    </div>
  );
}

function inputStyle(focused: boolean): React.CSSProperties {
  return {
    width: "100%",
    background: focused ? "rgba(15,108,245,0.12)" : "rgba(255,255,255,0.06)",
    border: `1.5px solid ${focused ? "rgba(15,108,245,0.6)" : "rgba(255,255,255,0.12)"}`,
    borderRadius: 14,
    padding: "14px 16px",
    color: "white",
    fontSize: 16,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    transition: "all 0.2s ease",
  };
}
