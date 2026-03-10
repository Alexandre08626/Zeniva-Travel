"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

const BLUE = "#0F6CF5";
const GOLD = "#E6B85A";
const HQ_EMAIL = "info@zeniva.ca";

const DESTINATIONS = [
  { emoji: "🏝", label: "Maldives" },
  { emoji: "🏖", label: "Miami" },
  { emoji: "🌴", label: "Cancun" },
  { emoji: "🏔", label: "Swiss Alps" },
  { emoji: "🌊", label: "Bali" },
  { emoji: "🗼", label: "Paris" },
  { emoji: "🇮🇹", label: "Amalfi Coast" },
  { emoji: "🌅", label: "Santorini" },
];

const REVIEWS = [
  { name: "Sarah M.", city: "New York, NY", avatar: "S", color: "#0F6CF5", text: "Lina planned our Maldives trip in 48 hours. Stunning resort, perfect price. 10/10!" },
  { name: "James T.", city: "Richmond, VA", avatar: "J", color: "#7c3aed", text: "The Miami villa was beyond our expectations. Zero fees, no surprises. Highly recommend." },
  { name: "Emily R.", city: "Brooklyn, NY", avatar: "E", color: "#0891b2", text: "Got 15% off AND zero booking fees. Zeniva saved us over $800 on our Cancun trip." },
];

export default function TravelFormClient() {
  const searchParams = useSearchParams();
  const agentEmail = searchParams.get("agent") || "";
  const prefilledDest = searchParams.get("destination") || "";

  const [step, setStep] = useState(prefilledDest ? 2 : 1);
  const [destination, setDestination] = useState(prefilledDest);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [countdown, setCountdown] = useState({ h: 4, m: 23, s: 47 });

  // Countdown timer for urgency
  useEffect(() => {
    const iv = setInterval(() => {
      setCountdown(prev => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 0; m = 0; s = 0; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  const handleDestinationSelect = (dest: string) => {
    setDestination(dest);
    setTimeout(() => setStep(2), 250);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !destination.trim()) return;
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/forms/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formId: "travel-agent",
          name, email, phone: "", destination,
          ...(agentEmail ? { agentEmail, referredBy: agentEmail } : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Submission failed");
      if (data?.setupUrl) { window.location.href = data.setupUrl; return; }
      setStatus("success");
    } catch (err: any) {
      setStatus("error");
      setError(err?.message || "Something went wrong. Try again.");
    }
  };

  // ── SUCCESS ───────────────────────────────────────────────────────────────
  if (status === "success") {
    return (
      <main style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(160deg, #040d1f 0%, #0B1B4D 100%)", padding: "24px 20px" }}>
        <div style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: 72, marginBottom: 16 }}>🎉</div>
          <div style={{ background: `linear-gradient(135deg, ${GOLD}33, ${GOLD}11)`, border: `2px solid ${GOLD}66`, borderRadius: 20, padding: "20px 24px", marginBottom: 24 }}>
            <div style={{ color: GOLD, fontSize: 22, fontWeight: 900 }}>🎁 Your 15% discount is confirmed!</div>
            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, marginTop: 8, lineHeight: 1.6 }}>
              It will be <strong style={{ color: "white" }}>automatically applied</strong> to your first booking — no code needed.<br />
              Check your inbox for your account link + trip plan.
            </div>
          </div>
          <h1 style={{ color: "white", fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Welcome, {name.split(" ")[0]}! ✈️</h1>
          <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
            Lina is already preparing your <strong style={{ color: "white" }}>{destination}</strong> proposal.
          </p>
          <a href="https://zenivatravel.com" style={{ display: "inline-block", background: `linear-gradient(135deg, ${BLUE}, #0851c4)`, color: "white", borderRadius: 50, padding: "14px 32px", fontWeight: 700, fontSize: 15, textDecoration: "none" }}>
            🌍 Explore destinations →
          </a>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100dvh", background: "linear-gradient(160deg, #040d1f 0%, #0B1B4D 80%, #040d1f 100%)", padding: "28px 16px 48px" }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { box-shadow: 0 0 24px rgba(230,184,90,0.3); } 50% { box-shadow: 0 0 40px rgba(230,184,90,0.65); } }
        @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-4px)} 75%{transform:translateX(4px)} }
        input::placeholder { color: #94a3b8 !important; }
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 1000px #0d2259 inset !important; -webkit-text-fill-color: white !important; }
        .dest-chip:active { transform: scale(0.94); }
      `}</style>

      <div style={{ maxWidth: 420, margin: "0 auto" }}>

        {/* ── URGENCY BAR ── */}
        <div style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 12, padding: "10px 16px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 8px #ef4444" }} />
            <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>Offer expires in</span>
          </div>
          <span style={{ color: "#ef4444", fontWeight: 900, fontSize: 15, fontVariantNumeric: "tabular-nums" }}>
            {pad(countdown.h)}:{pad(countdown.m)}:{pad(countdown.s)}
          </span>
        </div>

        {/* ── GOLD BANNER ── */}
        <div style={{ background: `linear-gradient(135deg, ${GOLD} 0%, #C9941F 100%)`, borderRadius: 18, padding: "16px 20px", marginBottom: 24, display: "flex", alignItems: "center", gap: 14, animation: "pulse 2s ease-in-out infinite" }}>
          <span style={{ fontSize: 36 }}>🎁</span>
          <div>
            <div style={{ color: "#0B1B4D", fontWeight: 900, fontSize: 18, lineHeight: 1.2 }}>15% OFF your first trip</div>
            <div style={{ color: "#0B1B4D", fontSize: 13, opacity: 0.75, marginTop: 2 }}>Answer 2 quick questions to claim it — free, no card</div>
          </div>
          <div style={{ marginLeft: "auto", background: "#0B1B4D", borderRadius: 10, padding: "5px 10px", flexShrink: 0, textAlign: "center" }}>
            <div style={{ color: GOLD, fontSize: 10, fontWeight: 900 }}>LIMITED</div>
            <div style={{ color: "white", fontSize: 9, opacity: 0.6 }}>OFFER</div>
          </div>
        </div>

        {/* ── PROGRESS BAR ── */}
        <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
          <div style={{ flex: 1, height: 4, borderRadius: 4, background: BLUE }} />
          <div style={{ flex: 1, height: 4, borderRadius: 4, background: step >= 2 ? BLUE : "rgba(255,255,255,0.1)", transition: "background 0.3s" }} />
        </div>

        {/* ── STEP 1: Destination ── */}
        {step === 1 && (
          <div style={{ animation: "fadeUp 0.35s ease both" }}>
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", border: `3px solid ${GOLD}`, overflow: "hidden", background: "#0B1B4D", margin: "0 auto 14px", boxShadow: `0 0 28px ${GOLD}44` }}>
                <img src="/branding/lina-avatar.png" alt="Lina" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <h1 style={{ color: "white", fontSize: 26, fontWeight: 900, marginBottom: 6, lineHeight: 1.2 }}>
                Where do you dream of going? 🌍
              </h1>
              <p style={{ color: "#64748b", fontSize: 14 }}>Tap your destination — Lina handles the rest</p>
            </div>

            {/* Destination grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
              {DESTINATIONS.map(d => (
                <button key={d.label} className="dest-chip" type="button" onClick={() => handleDestinationSelect(d.label)}
                  style={{ background: destination === d.label ? `linear-gradient(135deg, ${BLUE}, #0851c4)` : "rgba(255,255,255,0.05)", border: `1.5px solid ${destination === d.label ? BLUE : "rgba(255,255,255,0.1)"}`, borderRadius: 16, padding: "16px 12px", cursor: "pointer", transition: "all 0.2s", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 28 }}>{d.emoji}</span>
                  <span style={{ color: "white", fontSize: 14, fontWeight: 700 }}>{d.label}</span>
                </button>
              ))}
            </div>

            {/* Other destination input */}
            <div style={{ position: "relative", marginBottom: 20 }}>
              <input type="text" value={destination} onChange={e => setDestination(e.target.value)}
                placeholder="✏️  Or type your destination…"
                style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.12)", borderRadius: 14, padding: "14px 16px", color: "white", fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
            </div>

            <button type="button" onClick={() => destination.trim() && setStep(2)} disabled={!destination.trim()}
              style={{ width: "100%", background: destination.trim() ? `linear-gradient(135deg, ${GOLD}, #C9941F)` : "rgba(255,255,255,0.06)", color: destination.trim() ? "#0B1B4D" : "rgba(255,255,255,0.2)", border: "none", borderRadius: 50, padding: "17px", fontSize: 17, fontWeight: 900, cursor: destination.trim() ? "pointer" : "not-allowed", transition: "all 0.25s", boxShadow: destination.trim() ? `0 8px 28px ${GOLD}55` : "none" }}>
              Continue → Get my 15% discount
            </button>

            <p style={{ textAlign: "center", color: "rgba(255,255,255,0.18)", fontSize: 11, marginTop: 12 }}>
              🔒 Free · No credit card · 30 seconds
            </p>
          </div>
        )}

        {/* ── STEP 2: Contact Info ── */}
        {step === 2 && (
          <div style={{ animation: "fadeUp 0.35s ease both" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
              <button type="button" onClick={() => setStep(1)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "6px 12px", color: "rgba(255,255,255,0.5)", fontSize: 14, cursor: "pointer" }}>← Back</button>
              <div style={{ background: `${BLUE}22`, border: `1px solid ${BLUE}44`, borderRadius: 30, padding: "6px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>🌍</span>
                <span style={{ color: "white", fontSize: 14, fontWeight: 700 }}>{destination}</span>
              </div>
            </div>

            <h2 style={{ color: "white", fontSize: 24, fontWeight: 900, marginBottom: 6 }}>Almost there! 🎉</h2>
            <p style={{ color: "#64748b", fontSize: 14, marginBottom: 24 }}>Where should Lina send your free trip plan?</p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Name */}
              <div>
                <label style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, fontWeight: 600, display: "block", marginBottom: 7 }}>👤 Your full name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  onFocus={() => setFocusedField("name")} onBlur={() => setFocusedField(null)}
                  placeholder="John Smith" required autoComplete="name"
                  style={{ width: "100%", background: focusedField === "name" ? "rgba(15,108,245,0.15)" : "rgba(255,255,255,0.06)", border: `1.5px solid ${focusedField === "name" ? BLUE : "rgba(255,255,255,0.12)"}`, borderRadius: 14, padding: "15px 16px", color: "white", fontSize: 16, outline: "none", boxSizing: "border-box", fontFamily: "inherit", transition: "all 0.2s" }} />
              </div>

              {/* Email */}
              <div>
                <label style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, fontWeight: 600, display: "block", marginBottom: 7 }}>📧 Your email address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")} onBlur={() => setFocusedField(null)}
                  placeholder="you@email.com" required autoComplete="email"
                  style={{ width: "100%", background: focusedField === "email" ? "rgba(15,108,245,0.15)" : "rgba(255,255,255,0.06)", border: `1.5px solid ${focusedField === "email" ? BLUE : "rgba(255,255,255,0.12)"}`, borderRadius: 14, padding: "15px 16px", color: "white", fontSize: 16, outline: "none", boxSizing: "border-box", fontFamily: "inherit", transition: "all 0.2s" }} />
              </div>

              {/* 15% reminder */}
              <div style={{ background: `linear-gradient(135deg, ${GOLD}18, transparent)`, border: `1px solid ${GOLD}33`, borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20 }}>🎁</span>
                <span style={{ color: GOLD, fontSize: 13, fontWeight: 700 }}>15% discount applied automatically on your account</span>
              </div>

              {error && (
                <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "10px 14px", color: "#fca5a5", fontSize: 13, animation: "shake 0.3s ease" }}>
                  ⚠️ {error}
                </div>
              )}

              <button type="submit" disabled={status === "sending" || !name.trim() || !email.trim()}
                style={{ width: "100%", marginTop: 4, background: name.trim() && email.trim() ? `linear-gradient(135deg, ${GOLD}, #C9941F)` : "rgba(255,255,255,0.06)", color: name.trim() && email.trim() ? "#0B1B4D" : "rgba(255,255,255,0.2)", border: "none", borderRadius: 50, padding: "18px", fontSize: 17, fontWeight: 900, cursor: name.trim() && email.trim() ? "pointer" : "not-allowed", transition: "all 0.25s", boxShadow: name.trim() && email.trim() ? `0 8px 32px ${GOLD}55` : "none" }}>
                {status === "sending" ? "⏳ Preparing your trip plan…" : "🎁 Claim my 15% — Get my free plan →"}
              </button>

              <p style={{ textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 11, margin: 0, lineHeight: 1.5 }}>
                🔒 256-bit SSL · No credit card · No spam · Cancel anytime
              </p>
            </form>
          </div>
        )}

        {/* ── SOCIAL PROOF (always visible) ── */}
        <div style={{ marginTop: 36 }}>
          <div style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>
            ⭐⭐⭐⭐⭐ Trusted by travelers across the US
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {REVIEWS.map((r, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 7 }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: r.color, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
                    {r.avatar}
                  </div>
                  <div>
                    <div style={{ color: "white", fontWeight: 700, fontSize: 13 }}>{r.name}</div>
                    <div style={{ color: "#475569", fontSize: 11 }}>📍 {r.city}</div>
                  </div>
                  <div style={{ marginLeft: "auto", color: GOLD, fontSize: 12 }}>★★★★★</div>
                </div>
                <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.5, margin: 0, fontStyle: "italic" }}>"{r.text}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── FOOTER TRUST ── */}
        <div style={{ marginTop: 28, textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 18, flexWrap: "wrap", marginBottom: 12 }}>
            {[{ icon: "🏢", text: "Delaware Inc." }, { icon: "🤝", text: "No hidden fees" }, { icon: "📞", text: "24/7 AI support" }, { icon: "✈️", text: "400+ destinations" }].map(b => (
              <div key={b.text} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ fontSize: 14 }}>{b.icon}</span>
                <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 11 }}>{b.text}</span>
              </div>
            ))}
          </div>
          <p style={{ color: "rgba(255,255,255,0.1)", fontSize: 10, lineHeight: 1.6 }}>
            Zeniva Travel Inc. · Incorporated in Delaware, USA · Your info is protected under US privacy law
          </p>
        </div>

      </div>
    </main>
  );
}
