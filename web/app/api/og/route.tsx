import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const CONFIGS: Record<string, { gradient: string; icon: string; badge?: string }> = {
  default:    { gradient: "linear-gradient(135deg, #0D9488, #7C3AED, #EC4899)", icon: "\u2708\uFE0F" },
  agencies:   { gradient: "linear-gradient(135deg, #0D9488, #7C3AED)", icon: "\uD83C\uDFE2", badge: "For Agencies" },
  zenistay:   { gradient: "linear-gradient(135deg, #7C3AED, #EC4899)", icon: "\uD83C\uDFE8", badge: "ZeniStay" },
  zeniyacht:  { gradient: "linear-gradient(135deg, #0369A1, #0D9488)", icon: "\u26F5", badge: "ZeniYacht" },
  proposal:   { gradient: "linear-gradient(135deg, #7C3AED, #EC4899)", icon: "\uD83D\uDCCB", badge: "Trip Proposal" },
  chat:       { gradient: "linear-gradient(135deg, #0D9488, #06B6D4)", icon: "\uD83D\uDCAC", badge: "AI Chat" },
  deals:      { gradient: "linear-gradient(135deg, #EA580C, #EAB308)", icon: "\uD83D\uDD25", badge: "Deals" },
  destination:{ gradient: "linear-gradient(135deg, #0D9488, #7C3AED)", icon: "\uD83C\uDF0D", badge: "Destination" },
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") || "Zeniva Travel";
  const description = searchParams.get("description") || "AI-Powered Travel Agency";
  const type = searchParams.get("type") || "default";
  const imageUrl = searchParams.get("image") || null;

  const config = CONFIGS[type] || CONFIGS.default;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px",
          background: config.gradient,
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background pattern */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
            transform: "translate(100px, -100px)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
            transform: "translate(-100px, 100px)",
            display: "flex",
          }}
        />

        {/* Top - Badge + Logo */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                fontSize: "42px",
                display: "flex",
              }}
            >
              {config.icon}
            </div>
            {config.badge && (
              <div
                style={{
                  background: "rgba(255,255,255,0.2)",
                  borderRadius: "24px",
                  padding: "8px 20px",
                  color: "white",
                  fontSize: "18px",
                  fontWeight: 700,
                  display: "flex",
                }}
              >
                {config.badge}
              </div>
            )}
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: "20px",
              fontWeight: 800,
              letterSpacing: "3px",
              textTransform: "uppercase" as const,
              display: "flex",
            }}
          >
            ZENIVA
          </div>
        </div>

        {/* Middle - Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: imageUrl ? "650px" : "100%" }}>
          <div
            style={{
              color: "white",
              fontSize: title.length > 40 ? "42px" : "52px",
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: "-1px",
              display: "flex",
            }}
          >
            {title}
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.8)",
              fontSize: "22px",
              fontWeight: 400,
              lineHeight: 1.4,
              display: "flex",
            }}
          >
            {description}
          </div>
        </div>

        {/* Bottom - URL bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              background: "rgba(255,255,255,0.15)",
              borderRadius: "12px",
              padding: "10px 20px",
              color: "rgba(255,255,255,0.9)",
              fontSize: "16px",
              fontWeight: 500,
              display: "flex",
            }}
          >
            zenivatravel.com
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: "14px",
              fontWeight: 500,
              display: "flex",
            }}
          >
            Powered by AI
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
