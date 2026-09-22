"use client";
// Lead form for the Google Ads landing page. Posts to /api/lead-capture
// (Supabase `leads` table + VPS outreach webhook) and fires the Google Ads
// conversion event when NEXT_PUBLIC_GOOGLE_ADS_LEAD_CONVERSION is set
// (format: "AW-XXXXXXXXX/abcDEFghi").
import { useState } from "react";

type Status = "idle" | "submitting" | "ok" | "error";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const DESTINATIONS = [
  "Caribbean / All-inclusive",
  "Europe (Italy, France, Greece…)",
  "Florida / Miami",
  "Hawaii",
  "Mexico (Cancun, Cabo, Tulum)",
  "Yacht charter",
  "Group / family trip",
  "Not sure yet — surprise me",
];

export default function LeadForm({ compact = false }: { compact?: boolean }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();
    const phone = String(fd.get("phone") ?? "").trim();
    const destination = String(fd.get("destination") ?? "").trim();
    if (String(fd.get("website") ?? "")) return; // honeypot

    if (!email.includes("@")) {
      setError("Please enter a valid email so Lina can send your itinerary.");
      return;
    }
    setStatus("submitting");
    setError("");
    try {
      const res = await fetch("/api/lead-capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, destination, source: "google-ads-lp" }),
      });
      if (!res.ok) throw new Error("bad status");
      setStatus("ok");
      const sendTo = process.env.NEXT_PUBLIC_GOOGLE_ADS_LEAD_CONVERSION;
      if (sendTo && typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "conversion", { send_to: sendTo });
      }
    } catch {
      setStatus("error");
      setError("Something went wrong. You can also chat with Lina directly below.");
    }
  }

  if (status === "ok") {
    return (
      <div style={{ ...card, textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
        <div style={{ fontWeight: 800, fontSize: 20, color: "#0B1B4D", marginBottom: 8 }}>You're in!</div>
        <p style={{ color: "#475569", fontSize: 15, lineHeight: 1.6, margin: "0 0 18px" }}>
          Lina is already working on ideas for you. Check your inbox — or skip the wait and chat with her now.
        </p>
        <a href="/chat?q=I%20just%20signed%20up%20from%20Google%20—%20help%20me%20plan%20my%20trip" style={primaryBtn}>
          💬 Chat with Lina now
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={card} noValidate>
      {!compact && (
        <>
          <div style={{ fontWeight: 800, fontSize: 22, color: "#0B1B4D", marginBottom: 4 }}>Get your free trip plan</div>
          <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 18px" }}>
            Takes 30 seconds. Lina replies within minutes, 24/7.
          </p>
        </>
      )}
      <label style={label}>Your name</label>
      <input name="name" placeholder="Jane Smith" autoComplete="name" style={input} />
      <label style={label}>Email *</label>
      <input name="email" type="email" required placeholder="jane@email.com" autoComplete="email" style={input} />
      <label style={label}>Phone (optional)</label>
      <input name="phone" type="tel" placeholder="+1 (305) 555-0123" autoComplete="tel" style={input} />
      <label style={label}>Where do you want to go?</label>
      <select name="destination" defaultValue="" style={input}>
        <option value="" disabled>Pick a destination</option>
        {DESTINATIONS.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>
      {/* honeypot */}
      <input name="website" tabIndex={-1} autoComplete="off" style={{ position: "absolute", left: -9999, opacity: 0 }} />
      {error && <div style={{ color: "#dc2626", fontSize: 13, marginBottom: 10 }}>{error}</div>}
      <button type="submit" disabled={status === "submitting"} style={{ ...primaryBtn, width: "100%", opacity: status === "submitting" ? 0.7 : 1 }}>
        {status === "submitting" ? "Sending…" : "✈️ Plan My Trip — Free"}
      </button>
      <p style={{ fontSize: 12, color: "#94a3b8", textAlign: "center", margin: "12px 0 0" }}>
        No spam. No obligation. Cancel anytime.
      </p>
    </form>
  );
}

const card: React.CSSProperties = {
  position: "relative",
  background: "white",
  borderRadius: 20,
  padding: 28,
  boxShadow: "0 20px 60px rgba(11,27,77,0.18)",
  border: "1px solid #e2e8f0",
  color: "#0f172a",
  textAlign: "left",
};
const label: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 700, color: "#334155", margin: "0 0 6px" };
const input: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 14px",
  borderRadius: 10,
  border: "1.5px solid #e2e8f0",
  fontSize: 15,
  fontWeight: 500,
  marginBottom: 14,
  background: "#fff",
  color: "#0f172a",
};
const primaryBtn: React.CSSProperties = {
  display: "inline-block",
  background: "#E6B85A",
  color: "#0B1B4D",
  fontWeight: 800,
  fontSize: 16,
  padding: "15px 28px",
  borderRadius: 12,
  border: "none",
  cursor: "pointer",
  textDecoration: "none",
  textAlign: "center",
};
