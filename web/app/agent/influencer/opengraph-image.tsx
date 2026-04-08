import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Become a Zeniva Travel Creator — Earn commissions on luxury travel";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
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
        <div style={{ position: "absolute", top: -60, left: 100, width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(15,108,245,0.3) 0%, transparent 70%)", display: "flex" }} />
        <div style={{ position: "absolute", bottom: -40, right: 80, width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle, rgba(230,184,90,0.2) 0%, transparent 70%)", display: "flex" }} />
        <div style={{ position: "absolute", top: 100, right: 200, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(236,72,153,0.2) 0%, transparent 70%)", display: "flex" }} />

        {/* Content */}
        <div style={{ display: "flex", flexDirection: "column", padding: "60px 70px", flex: 1, position: "relative", zIndex: 1 }}>
          {/* Top: Logo + badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 40 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em" }}>
                Zeniva
              </div>
              <div style={{ fontSize: 36, fontWeight: 900, color: "#E6B85A", letterSpacing: "-0.02em" }}>
                Travel
              </div>
            </div>
            <div style={{ display: "flex", background: "rgba(236,72,153,0.2)", border: "1px solid rgba(236,72,153,0.4)", borderRadius: 100, padding: "8px 20px" }}>
              <span style={{ color: "#ec4899", fontSize: 16, fontWeight: 800, letterSpacing: "0.05em" }}>CREATOR PROGRAM</span>
            </div>
          </div>

          {/* Main headline */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
            <div style={{ fontSize: 64, fontWeight: 900, color: "#ffffff", lineHeight: 1.1, letterSpacing: "-0.03em" }}>
              Share. Earn.
            </div>
            <div style={{ fontSize: 64, fontWeight: 900, color: "#E6B85A", lineHeight: 1.1, letterSpacing: "-0.03em" }}>
              Get Paid.
            </div>
            <div style={{ fontSize: 24, color: "rgba(255,255,255,0.7)", marginTop: 16, lineHeight: 1.4, maxWidth: 650 }}>
              Earn 5% commission on every luxury booking. Share your link, generate leads, Lina AI closes the sale.
            </div>
          </div>

          {/* Bottom: Stats preview */}
          <div style={{ display: "flex", gap: 24, marginTop: 20 }}>
            {[
              { icon: "🎬", label: "Share Videos", color: "#60a5fa" },
              { icon: "🔗", label: "Your Unique Link", color: "#34d399" },
              { icon: "💰", label: "Auto Commissions", color: "#E6B85A" },
              { icon: "📱", label: "Track Everything", color: "#ec4899" },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 16,
                  padding: "14px 22px",
                }}
              >
                <span style={{ fontSize: 22 }}>{item.icon}</span>
                <span style={{ color: item.color, fontSize: 15, fontWeight: 700 }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
