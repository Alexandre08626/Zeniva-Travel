"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

const BLUE = "#0F6CF5";
const GOLD = "#E6B85A";
const HQ_EMAIL = "info@zeniva.ca";

export default function TravelFormClient() {
  const searchParams = useSearchParams();
  const agentEmail = searchParams.get("agent") || "";
  const isHQ = !agentEmail || agentEmail === HQ_EMAIL;
  const agentName = agentEmail
    ? agentEmail.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())
    : "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [destination, setDestination] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState("");

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
      if (!res.ok) {
        throw new Error(data?.error || "Submission failed");
      }
      // Auto-login the new client and redirect to set-password page
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

  // ── SUCCESS ────────────────────────────────────────────────────────────────
  if (status === "success") {
    return (
      <main style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(160deg, #040d1f 0%, #0B1B4D 60%, #040d1f 100%)", padding: "24px 20px" }}>
        <div style={{ maxWidth: 440, width: "100%", textAlign: "center" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", border: `3px solid ${GOLD}`, overflow: "hidden", margin: "0 auto 20px", background: "#0B1B4D" }}>
            <img src="/branding/lina-avatar.png" alt="Lina" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
          <h1 style={{ color: "white", fontSize: 26, fontWeight: 900, marginBottom: 10 }}>
            Welcome, {name.split(" ")[0]}!
          </h1>
          <p style={{ color: "#94a3b8", fontSize: 15, marginBottom: 8, lineHeight: 1.6 }}>
            Your account has been created. Lina is already working on your trip to{" "}
            <strong style={{ color: "white" }}>{destination}</strong>! ✈️
          </p>
          <p style={{ color: "#64748b", fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
            📧 Check your email <strong style={{ color: "#94a3b8" }}>{email}</strong> — we sent you a confirmation with next steps and a link to access your account.
          </p>
          {/* Steps */}
          <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, padding: "20px 24px", textAlign: "left", marginBottom: 28 }}>
            {[
              { icon: "📧", text: "Check your email for your account link" },
              { icon: "💬", text: "Chat with Lina to plan your perfect trip" },
              { icon: "✈️", text: "Receive personalized travel proposals" },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: i < 2 ? 12 : 0 }}>
                <span style={{ fontSize: 20 }}>{s.icon}</span>
                <span style={{ color: "#94a3b8", fontSize: 14 }}>{s.text}</span>
              </div>
            ))}
          </div>
          <a href="https://zenivatravel.com" style={{ display: "inline-block", background: `linear-gradient(135deg, ${BLUE}, #0851c4)`, color: "white", borderRadius: 50, padding: "14px 32px", fontWeight: 700, fontSize: 15, textDecoration: "none" }}>
            🌍 Explore destinations
          </a>
        </div>
      </main>
    );
  }

  // ── FORM ───────────────────────────────────────────────────────────────────
  return (
    <main style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(160deg, #040d1f 0%, #0B1B4D 60%, #040d1f 100%)", padding: "24px 20px" }}>
      <div style={{ maxWidth: 420, width: "100%" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 68, height: 68, borderRadius: "50%", border: `3px solid ${isHQ ? GOLD : BLUE}`, overflow: "hidden", margin: "0 auto 14px", background: "#0B1B4D" }}>
            <img src="/branding/lina-avatar.png" alt="Lina" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <h1 style={{ color: "white", fontSize: 26, fontWeight: 900, marginBottom: 6 }}>Plan Your Dream Trip ✈️</h1>
          <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.5 }}>
            {isHQ
              ? "30 seconds to get started — Lina handles the rest!"
              : `Your specialist ${agentName} · Lina will build your perfect trip`}
          </p>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          style={{ background: "rgba(255,255,255,0.04)", border: "1.5px solid rgba(15,108,245,0.25)", borderRadius: 24, padding: "28px 24px", backdropFilter: "blur(12px)", display: "flex", flexDirection: "column", gap: 14 }}
        >
          {/* Name */}
          <div>
            <label style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Full name *</label>
            <input
              type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="John Smith" required autoComplete="name"
              style={inputStyle}
            />
          </div>

          {/* Email */}
          <div>
            <label style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Email *</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@email.com" required autoComplete="email"
              style={inputStyle}
            />
          </div>

          {/* Phone */}
          <div>
            <label style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Phone *</label>
            <input
              type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="+1 (555) 555-5555" required autoComplete="tel"
              style={inputStyle}
            />
          </div>

          {/* Destination */}
          <div>
            <label style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Dream destination *</label>
            <input
              type="text" value={destination} onChange={e => setDestination(e.target.value)}
              placeholder="Bali, Japan, Italy, Caribbean…" required
              style={inputStyle}
            />
          </div>

          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "10px 14px", color: "#fca5a5", fontSize: 13 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={status === "sending" || !allFilled}
            style={{
              width: "100%", background: allFilled ? `linear-gradient(135deg, ${BLUE}, #0851c4)` : "rgba(255,255,255,0.08)",
              color: allFilled ? "white" : "rgba(255,255,255,0.3)",
              border: "none", borderRadius: 50, padding: "15px", fontSize: 15, fontWeight: 700,
              cursor: allFilled ? "pointer" : "not-allowed", transition: "all 0.2s", marginTop: 4,
            }}
          >
            {status === "sending" ? "Creating your account…" : "🚀 Start planning my trip"}
          </button>

          <p style={{ textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 11, marginTop: -4 }}>
            🔒 Secure · No spam · Cancel anytime
          </p>
        </form>
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.06)",
  border: "1.5px solid rgba(255,255,255,0.12)",
  borderRadius: 12,
  padding: "13px 16px",
  color: "white",
  fontSize: 15,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
};
