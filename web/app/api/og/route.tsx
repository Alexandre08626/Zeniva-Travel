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

const AGENCY_AGENTS = [
  { name: "Lina", role: "AI Concierge", image: "lina.png" },
  { name: "Sofia", role: "Operations", image: "sofia.png" },
  { name: "Luna", role: "Client Relations", image: "luna.png" },
  { name: "Rex", role: "Intelligence", image: "rex.png" },
];

function AgenciesOG({ baseUrl }: { baseUrl: string }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "linear-gradient(135deg, #0D9488 0%, #7C3AED 60%, #EC4899 100%)",
        fontFamily: "system-ui, -apple-system, sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background circles */}
      <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "350px", height: "350px", borderRadius: "50%", background: "rgba(255,255,255,0.06)", display: "flex" }} />
      <div style={{ position: "absolute", bottom: "-60px", left: "300px", width: "250px", height: "250px", borderRadius: "50%", background: "rgba(255,255,255,0.04)", display: "flex" }} />

      {/* Left side - Text */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "50px 40px 50px 55px", width: "550px" }}>
        {/* Top badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: "20px", padding: "6px 16px", color: "white", fontSize: "14px", fontWeight: 700, display: "flex" }}>
            For Travel Agencies
          </div>
        </div>

        {/* Title */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ color: "white", fontSize: "44px", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-1px", display: "flex", flexDirection: "column" }}>
            <span>8 AI Agents</span>
            <span>Working 24/7</span>
            <span>for Your Agency</span>
          </div>
          <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "18px", fontWeight: 400, display: "flex" }}>
            CRM, Proposals, Invoicing — 0% Commission
          </div>
        </div>

        {/* Bottom */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: "10px", padding: "8px 16px", color: "rgba(255,255,255,0.9)", fontSize: "14px", fontWeight: 600, display: "flex" }}>
            zenivatravel.com/for-agencies
          </div>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", fontWeight: 800, letterSpacing: "2px", display: "flex" }}>
            ZENIVA
          </div>
        </div>
      </div>

      {/* Right side - Agent avatars */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", flex: 1, paddingRight: "20px", paddingBottom: "0px", gap: "-10px" }}>
        {AGENCY_AGENTS.map((agent, i) => (
          <div
            key={agent.name}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginLeft: i > 0 ? "-15px" : "0",
              marginBottom: i === 0 || i === 3 ? "20px" : i === 1 ? "40px" : "0px",
            }}
          >
            <div
              style={{
                width: "130px",
                height: "130px",
                borderRadius: "24px",
                overflow: "hidden",
                border: "3px solid rgba(255,255,255,0.3)",
                background: "rgba(255,255,255,0.1)",
                display: "flex",
                boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${baseUrl}/agents/${agent.image}`}
                alt={agent.name}
                width={130}
                height={130}
                style={{ width: "130px", height: "130px", objectFit: "cover" }}
              />
            </div>
            <div
              style={{
                marginTop: "8px",
                background: "rgba(255,255,255,0.2)",
                borderRadius: "12px",
                padding: "4px 12px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <span style={{ color: "white", fontSize: "13px", fontWeight: 800 }}>{agent.name}</span>
              <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "10px", fontWeight: 500 }}>{agent.role}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DefaultOG({ title, description, config }: { title: string; description: string; config: { gradient: string; icon: string; badge?: string } }) {
  return (
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
      <div style={{ position: "absolute", top: 0, right: 0, width: "400px", height: "400px", borderRadius: "50%", background: "rgba(255,255,255,0.08)", transform: "translate(100px, -100px)", display: "flex" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, width: "300px", height: "300px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", transform: "translate(-100px, 100px)", display: "flex" }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ fontSize: "42px", display: "flex" }}>{config.icon}</div>
          {config.badge && (
            <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: "24px", padding: "8px 20px", color: "white", fontSize: "18px", fontWeight: 700, display: "flex" }}>
              {config.badge}
            </div>
          )}
        </div>
        <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "20px", fontWeight: 800, letterSpacing: "3px", display: "flex" }}>
          ZENIVA
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ color: "white", fontSize: title.length > 40 ? "42px" : "52px", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-1px", display: "flex" }}>
          {title}
        </div>
        <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "22px", fontWeight: 400, lineHeight: 1.4, display: "flex" }}>
          {description}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: "12px", padding: "10px 20px", color: "rgba(255,255,255,0.9)", fontSize: "16px", fontWeight: 500, display: "flex" }}>
          zenivatravel.com
        </div>
        <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", fontWeight: 500, display: "flex" }}>
          Powered by AI
        </div>
      </div>
    </div>
  );
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") || "Zeniva Travel";
  const description = searchParams.get("description") || "AI-Powered Travel Platform";
  const type = searchParams.get("type") || "default";

  const config = CONFIGS[type] || CONFIGS.default;

  // Build base URL for images
  const proto = req.headers.get("x-forwarded-proto") || "https";
  const host = req.headers.get("host") || "www.zenivatravel.com";
  const baseUrl = `${proto}://${host}`;

  if (type === "agencies") {
    return new ImageResponse(<AgenciesOG baseUrl={baseUrl} />, { width: 1200, height: 630 });
  }

  return new ImageResponse(
    <DefaultOG title={title} description={description} config={config} />,
    { width: 1200, height: 630 },
  );
}
