import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #020810 0%, #0B1B4D 50%, #0F1E5A 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow orbs */}
        <div style={{ position: "absolute", top: -60, left: 80, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(15,108,245,0.3) 0%, transparent 70%)", display: "flex" }} />
        <div style={{ position: "absolute", bottom: -80, right: 60, width: 450, height: 450, borderRadius: "50%", background: "radial-gradient(circle, rgba(230,184,90,0.2) 0%, transparent 70%)", display: "flex" }} />

        {/* Content */}
        <div style={{ display: "flex", flexDirection: "column", padding: "55px 65px", flex: 1, position: "relative", zIndex: 1 }}>
          {/* Top: Logo + badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 38, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em" }}>Zeniva</div>
              <div style={{ fontSize: 38, fontWeight: 900, color: "#E6B85A", letterSpacing: "-0.02em" }}>Travel</div>
            </div>
            <div style={{ display: "flex", background: "rgba(15,108,245,0.2)", border: "1px solid rgba(15,108,245,0.4)", borderRadius: 100, padding: "8px 24px" }}>
              <span style={{ color: "#60a5fa", fontSize: 15, fontWeight: 800, letterSpacing: "0.08em" }}>AGENT PROGRAM</span>
            </div>
          </div>

          {/* Main headline */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
            <div style={{ fontSize: 72, fontWeight: 900, color: "#ffffff", lineHeight: 1.05, letterSpacing: "-0.03em" }}>
              Become a
            </div>
            <div style={{ fontSize: 72, fontWeight: 900, color: "#E6B85A", lineHeight: 1.05, letterSpacing: "-0.03em" }}>
              Zeniva Agent.
            </div>
            <div style={{ fontSize: 22, color: "rgba(255,255,255,0.65)", marginTop: 20, lineHeight: 1.5, maxWidth: 620 }}>
              AI-powered CRM, automatic proposals, and commissions on every booking. Lina does the work, you collect.
            </div>
          </div>

          {/* Bottom: Feature pills */}
          <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
            {[
              { icon: "🤖", label: "AI Assistant Lina", color: "#60a5fa" },
              { icon: "📋", label: "Full CRM", color: "#34d399" },
              { icon: "💰", label: "Commissions", color: "#E6B85A" },
              { icon: "✈️", label: "Luxury Travel", color: "#c084fc" },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 14,
                  padding: "12px 20px",
                }}
              >
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span style={{ color: item.color, fontSize: 14, fontWeight: 700 }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
