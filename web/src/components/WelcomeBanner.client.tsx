"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "../lib/authStore";

const EXCLUDED = ["/forms/", "/set-password", "/login", "/signup", "/agent", "/payment", "/booking"];

export default function WelcomeBanner() {
  const { user } = useAuthStore();
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (user?.email) return; // logged in — never show
    if (typeof window === "undefined") return;
    const path = window.location.pathname;
    if (EXCLUDED.some(p => path.startsWith(p))) return;
    const gone = sessionStorage.getItem("zeniva_welcome_dismissed");
    if (gone) return;
    // Show after 1.5s
    const t = setTimeout(() => setShow(true), 1500);
    return () => clearTimeout(t);
  }, [user?.email]);

  // Always hide if logged in (auth may load after timer)
  if (user?.email) return null;
  if (!show || dismissed) return null;

  const GOLD = "#E6B85A";

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 4000,
      padding: "0 12px 20px", pointerEvents: "none",
    }}>
      <div style={{
        background: "white",
        borderRadius: 20,
        padding: "16px 18px",
        boxShadow: "0 -4px 40px rgba(0,0,0,0.15)",
        border: "1.5px solid #e2e8f0",
        pointerEvents: "all",
        maxWidth: 480,
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}>
        {/* Close */}
        <button onClick={() => { setDismissed(true); sessionStorage.setItem("zeniva_welcome_dismissed", "1"); }}
          style={{ position: "absolute", top: 10, right: 14, background: "none", border: "none", fontSize: 16, color: "#94a3b8", cursor: "pointer", lineHeight: 1, padding: 4 }}>✕</button>

        {/* Gold icon */}
        <div style={{ fontSize: 36, flexShrink: 0 }}>🎁</div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 900, fontSize: 14, color: "#0B1B4D", marginBottom: 2 }}>
            15% OFF your first booking
          </div>
          <div style={{ color: "#64748b", fontSize: 12, lineHeight: 1.4 }}>
            Create your free account — applied automatically on villa, yacht, hotel, or flight.
          </div>
        </div>

        {/* CTA */}
        <Link href="/signup"
          style={{ flexShrink: 0, background: `linear-gradient(135deg, ${GOLD}, #C9941F)`, color: "#0B1B4D", borderRadius: 50, padding: "9px 16px", fontWeight: 900, fontSize: 13, textDecoration: "none", whiteSpace: "nowrap" }}>
          Claim →
        </Link>
      </div>
    </div>
  );
}
