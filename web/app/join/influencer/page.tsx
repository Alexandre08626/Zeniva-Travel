"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "../../../src/lib/authStore";

const GOLD = "#E6B85A";

export default function JoinInfluencerPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    // Already logged in as influencer → go to dashboard
    if (user) {
      const roles = user.roles || (user.role ? [user.role] : []);
      if (roles.includes("influencer")) {
        router.replace("/agent/influencer");
        return;
      }
    }
  }, [user, router]);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #020810 0%, #0B1B4D 50%, #0F1E5A 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px", position: "relative", overflow: "hidden" }}>
      {/* Glow orbs */}
      <div style={{ position: "absolute", top: "10%", left: "5%", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(15,108,245,0.2) 0%, transparent 70%)", filter: "blur(40px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "10%", right: "5%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)", filter: "blur(40px)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 520, position: "relative", zIndex: 1, textAlign: "center" }}>
        {/* Logo */}
        <div style={{ marginBottom: 32 }}>
          <img src="/branding/lina-avatar.png" alt="Lina" style={{ width: 80, height: 80, borderRadius: "50%", border: `3px solid ${GOLD}`, marginBottom: 16 }} />
          <div style={{ fontSize: 28, fontWeight: 900, color: "#fff" }}>
            Zeniva <span style={{ color: GOLD }}>Travel</span>
          </div>
          <div style={{ display: "inline-block", marginTop: 12, background: "rgba(236,72,153,0.2)", border: "1px solid rgba(236,72,153,0.4)", borderRadius: 100, padding: "6px 20px" }}>
            <span style={{ color: "#ec4899", fontSize: 12, fontWeight: 800, letterSpacing: "0.1em" }}>CREATOR PROGRAM</span>
          </div>
        </div>

        {/* Headline */}
        <h1 style={{ fontSize: 48, fontWeight: 900, color: "#fff", lineHeight: 1.1, margin: "0 0 8px" }}>
          Share. Earn. <span style={{ color: GOLD }}>Win.</span>
        </h1>
        <p style={{ fontSize: 18, color: "rgba(255,255,255,0.6)", margin: "16px auto 32px", maxWidth: 420, lineHeight: 1.5 }}>
          Ready-to-share content, personalized links, built-in CRM and commissions on every booking. You share, we do the rest.
        </p>

        {/* Features */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 32, textAlign: "left" }}>
          {[
            { icon: "🎬", text: "Ready-to-share videos" },
            { icon: "🔗", text: "Your own unique link" },
            { icon: "💰", text: "5% auto commission" },
            { icon: "📊", text: "Real-time dashboard" },
            { icon: "🎯", text: "Built-in lead CRM" },
            { icon: "🤖", text: "Lina AI closes the sale" },
          ].map((f) => (
            <div key={f.text} style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "12px 14px" }}>
              <span style={{ fontSize: 20 }}>{f.icon}</span>
              <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 600 }}>{f.text}</span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <a
            href="/signup?space=influencer"
            style={{ display: "block", padding: "18px", background: "linear-gradient(135deg, #ec4899, #a855f7)", borderRadius: 16, color: "#fff", fontSize: 18, fontWeight: 800, textDecoration: "none", textAlign: "center", boxShadow: "0 8px 32px rgba(236,72,153,0.3)" }}
          >
            Create my influencer account →
          </a>
          <a
            href="/login?space=influencer"
            style={{ display: "block", padding: "14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 14, color: "rgba(255,255,255,0.6)", fontSize: 14, fontWeight: 600, textDecoration: "none", textAlign: "center" }}
          >
            Already have an account → Sign in
          </a>
        </div>

        <div style={{ marginTop: 24, fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
          Zeniva Travel — AI-Powered Luxury Travel — Delaware, USA
        </div>
      </div>
    </div>
  );
}
