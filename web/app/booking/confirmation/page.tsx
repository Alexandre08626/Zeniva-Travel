"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";

const GOLD = "#E6B85A";
const BLUE = "#0F6CF5";
const NAVY = "#0B1B4D";

export default function BookingConfirmationPage() {
  const [bookingRef, setBookingRef] = useState("");
  const [tripName, setTripName] = useState("Your Trip");
  const [total, setTotal] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const p = new URLSearchParams(window.location.search);
    setBookingRef(p.get("ref") || `ZNV-${Math.random().toString(36).slice(2, 8).toUpperCase()}`);
    setTripName(p.get("trip") || "Your Trip");
    setTotal(p.get("total") || "");
  }, []);

  if (!mounted) return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, #020810 0%, ${NAVY} 100%)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 48, height: 48, border: `3px solid ${BLUE}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, #020810 0%, ${NAVY} 60%, #0F1E5A 100%)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui,sans-serif", padding: 20 }}>
      <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: 48, maxWidth: 520, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>✈️</div>
        <div style={{ background: `${GOLD}22`, border: `1px solid ${GOLD}44`, borderRadius: 12, padding: "10px 20px", display: "inline-block", marginBottom: 24 }}>
          <span style={{ color: GOLD, fontWeight: 700, fontSize: 13 }}>✅ Booking Confirmed</span>
        </div>
        <h1 style={{ color: "white", fontSize: 28, fontWeight: 800, margin: "0 0 8px" }}>You&apos;re all set!</h1>
        <p style={{ color: "rgba(255,255,255,0.6)", margin: "0 0 32px", fontSize: 15 }}>{tripName}</p>
        <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 16, padding: 24, marginBottom: 24, textAlign: "left" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Booking Reference</span>
            <span style={{ color: GOLD, fontWeight: 800, fontFamily: "monospace" }}>{bookingRef}</span>
          </div>
          {total && <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Total Paid</span>
            <span style={{ color: "white", fontWeight: 700 }}>{total.startsWith("$") ? total : `$${total}`}</span>
          </div>}
        </div>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginBottom: 24 }}>A confirmation email will be sent within 24 hours. Our team will contact you to finalize details.</p>
        <button onClick={() => typeof window !== 'undefined' && (window.location.href = '/')} style={{ background: `linear-gradient(135deg, ${BLUE}, ${NAVY})`, color: "white", border: "none", borderRadius: 9999, padding: "14px 32px", fontWeight: 800, fontSize: 15, cursor: "pointer", width: "100%" }}>
          ✈️ Back to Zeniva Travel
        </button>
      </div>
    </div>
  );
}
