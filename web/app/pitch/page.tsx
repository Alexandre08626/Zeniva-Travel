/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import {
  LEGAL_OPERATOR,
} from "../../src/components/legal/legal-constants";

// Private investor pitch deck. Direct-URL access only — no internal links
// from the public site, robots fully blocked, no canonical published.
export const metadata: Metadata = {
  title: "Zeniva — Investor Pitch (Private)",
  description:
    "Private investor materials for Zeniva. Confidential, do not distribute.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    noarchive: true,
    nosnippet: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      noarchive: true,
      nosnippet: true,
    },
  },
  alternates: { canonical: undefined },
  openGraph: { title: "Zeniva — Private", description: "Confidential.", images: [] },
  twitter: { card: "summary", title: "Zeniva — Private", description: "Confidential." },
};

export const dynamic = "force-dynamic";

const NAVY = "#0B1B4D";
const NAVY_DEEP = "#060F35";
const BLUE = "#0F6CF5";
const TEAL = "#0D9488";
const TEAL_LIGHT = "#CCFBF1";
const GOLD = "#E6B85A";
const GOLD_DEEP = "#C9941F";
const CREAM = "#FFFBF0";
const INK = "#0B1228";
const MUTED = "#475569";
const SUBTLE = "#94A3B8";
const HAIRLINE = "#E5E7EB";

type TocItem = { id: string; num: string; eyebrow: string };

const TOC: TocItem[] = [
  { id: "problem", num: "01", eyebrow: "Problem" },
  { id: "solution", num: "02", eyebrow: "Solution" },
  { id: "agents", num: "03", eyebrow: "12 AI Agents" },
  { id: "market", num: "04", eyebrow: "Market" },
  { id: "product", num: "05", eyebrow: "Product" },
  { id: "why-now", num: "06", eyebrow: "Why now" },
  { id: "business", num: "07", eyebrow: "Business" },
  { id: "traction", num: "08", eyebrow: "Traction" },
  { id: "moat", num: "09", eyebrow: "Moat" },
  { id: "zenipay", num: "10", eyebrow: "ZeniPay asset" },
  { id: "competition", num: "11", eyebrow: "Competition" },
  { id: "team", num: "12", eyebrow: "Team" },
  { id: "financials", num: "13", eyebrow: "Financials" },
  { id: "ask", num: "14", eyebrow: "The ask" },
  { id: "contact", num: "15", eyebrow: "Contact" },
];

function SectionShell({
  id,
  num,
  eyebrow,
  title,
  children,
}: {
  id: string;
  num: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      style={{
        scrollMarginTop: 24,
        padding: "72px 0",
        borderTop: `1px solid ${HAIRLINE}`,
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 16, marginBottom: 8 }}>
        <span
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 12,
            fontWeight: 700,
            color: GOLD_DEEP,
            letterSpacing: "0.18em",
          }}
        >
          {num}
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 800,
            color: BLUE,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
          }}
        >
          {eyebrow}
        </span>
      </div>
      <h2
        style={{
          margin: "0 0 28px",
          fontSize: "clamp(28px, 4vw, 38px)",
          lineHeight: 1.12,
          fontWeight: 800,
          color: INK,
          letterSpacing: "-0.022em",
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function Bullet({ marker, children }: { marker?: string; children: React.ReactNode }) {
  return (
    <li
      style={{
        position: "relative",
        listStyle: "none",
        padding: "10px 0 10px 38px",
        borderBottom: `1px solid ${HAIRLINE}`,
        lineHeight: 1.62,
        color: INK,
        fontSize: 15,
      }}
    >
      <span
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          top: 12,
          minWidth: 28,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: 11,
          fontWeight: 700,
          color: GOLD_DEEP,
          letterSpacing: "0.08em",
        }}
      >
        {marker || "→"}
      </span>
      {children}
    </li>
  );
}

function Stat({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div
      style={{
        flex: "1 1 200px",
        minWidth: 180,
        padding: "22px 22px 20px",
        borderRadius: 18,
        background: "linear-gradient(180deg, #ffffff 0%, #F8FAFC 100%)",
        border: `1px solid ${HAIRLINE}`,
        boxShadow: "0 1px 0 rgba(11,27,77,0.04)",
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 800, color: MUTED, letterSpacing: "0.16em", textTransform: "uppercase" }}>
        {label}
      </div>
      <div
        style={{
          marginTop: 8,
          fontSize: 36,
          fontWeight: 800,
          letterSpacing: "-0.025em",
          lineHeight: 1,
          background: accent || `linear-gradient(135deg, ${NAVY} 0%, ${BLUE} 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        {value}
      </div>
      {sub ? <div style={{ fontSize: 12, color: MUTED, marginTop: 8, lineHeight: 1.45 }}>{sub}</div> : null}
    </div>
  );
}

function PullQuote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote
      style={{
        margin: "24px 0 8px",
        padding: "18px 20px",
        borderLeft: `3px solid ${GOLD}`,
        background: "rgba(230,184,90,0.07)",
        borderRadius: "0 12px 12px 0",
        fontSize: 16,
        lineHeight: 1.55,
        color: INK,
        fontWeight: 600,
      }}
    >
      {children}
    </blockquote>
  );
}

function ColumnCard({
  num,
  title,
  tagline,
  bullets,
  accent,
}: {
  num: string;
  title: string;
  tagline: string;
  bullets: string[];
  accent: string;
}) {
  return (
    <div
      style={{
        flex: "1 1 240px",
        minWidth: 240,
        padding: "22px 22px 24px",
        borderRadius: 18,
        background: "white",
        border: `1px solid ${HAIRLINE}`,
        boxShadow: "0 1px 0 rgba(11,27,77,0.04)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden
        style={{ position: "absolute", left: 0, top: 0, height: "100%", width: 4, background: accent }}
      />
      <div
        style={{
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: 11,
          fontWeight: 700,
          color: SUBTLE,
          letterSpacing: "0.18em",
        }}
      >
        {num}
      </div>
      <div style={{ marginTop: 6, fontSize: 20, fontWeight: 800, color: INK, letterSpacing: "-0.012em" }}>{title}</div>
      <div style={{ marginTop: 6, fontSize: 13, color: MUTED, lineHeight: 1.5 }}>{tagline}</div>
      <ul style={{ marginTop: 14, padding: 0 }}>
        {bullets.map((b, i) => (
          <li
            key={i}
            style={{
              listStyle: "none",
              padding: "8px 0 8px 22px",
              position: "relative",
              fontSize: 13.5,
              color: INK,
              lineHeight: 1.55,
              borderTop: i === 0 ? "none" : `1px dashed ${HAIRLINE}`,
            }}
          >
            <span aria-hidden style={{ position: "absolute", left: 0, top: 8, color: accent, fontWeight: 800 }}>
              ✦
            </span>
            {b}
          </li>
        ))}
      </ul>
    </div>
  );
}

type Agent = { id: string; name: string; role: string; img: string };

const AGENTS: Agent[] = [
  { id: "lina", name: "Lina", role: "AI Travel Concierge — chat, voice, booking", img: "/agents/lina.png" },
  { id: "marco", name: "Marco", role: "Lead Hunter — 5-engine scraper, 24/7", img: "/agents/marco.png" },
  { id: "sofia", name: "Sofia", role: "Email Marketing — AI copy, EN/FR/ES/AR", img: "/agents/sofia.png" },
  { id: "ben", name: "Ben", role: "ZeniPay Finance Agent — payments + AML", img: "/agents/ben.png" },
  { id: "luna", name: "Luna", role: "Voice & SMS — Twilio inbound/outbound", img: "/agents/luna.png" },
  { id: "atlas", name: "Atlas", role: "Security Guardian — services, SSL, SSH", img: "/agents/atlas.png" },
  { id: "mia", name: "Mia", role: "Social Media — captions, visuals, scheduling", img: "/agents/mia.png" },
  { id: "leo", name: "Leo", role: "Analytics — conversions, LTV, agent ROI", img: "/agents/leo.png" },
  { id: "rex", name: "Rex", role: "Platform Engineer — APIs, monitoring, auto-fix", img: "/agents/rex.png" },
  { id: "max", name: "Max", role: "Compliance & Risk — fraud, chargebacks, AML", img: "/agents/max.png" },
  { id: "jade", name: "Jade", role: "Agent Success — onboarding, coaching, retention", img: "/agents/jade.png" },
  { id: "kai", name: "Kai", role: "Revenue Intelligence — margins, routes, pricing", img: "/agents/kai.png" },
];

function AgentCard({ agent }: { agent: Agent }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        alignItems: "center",
        padding: "12px 14px",
        borderRadius: 14,
        background: "white",
        border: `1px solid ${HAIRLINE}`,
        boxShadow: "0 1px 0 rgba(11,27,77,0.04)",
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 12,
          overflow: "hidden",
          flexShrink: 0,
          background: `linear-gradient(135deg, ${NAVY} 0%, ${BLUE} 100%)`,
          border: `1px solid ${HAIRLINE}`,
        }}
      >
        <img
          src={agent.img}
          alt={`${agent.name} — ${agent.role}`}
          width={52}
          height={52}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: INK, letterSpacing: "-0.005em" }}>{agent.name}</div>
        <div style={{ marginTop: 2, fontSize: 12.5, color: MUTED, lineHeight: 1.4 }}>{agent.role}</div>
      </div>
    </div>
  );
}

type TimelineEntry = { when: string; what: string };

const TIMELINE: TimelineEntry[] = [
  { when: "Q1 2024", what: "Founded — Delaware incorporation, brand & domain locked" },
  { when: "Q3 2024", what: "Lina v1 in production — chat-first AI concierge" },
  { when: "Q4 2024", what: "Duffel + LiteAPI live — real flight & hotel bookings" },
  { when: "Q1 2025", what: "Voice mode — Groq + Google stack, 6 languages" },
  { when: "Q2 2025", what: "ZeniYacht — 36-boat South-Florida fleet onboarded" },
  { when: "Q3 2025", what: "ZeniPay alpha — 0% installments via in-house infra" },
  { when: "Q4 2025", what: "B2B agency pilot — white-label Lina + CRM" },
  { when: "Q1 2026", what: "SEO breakout — 88+ indexed URLs, IndexNow auto-push" },
  { when: "Q2 2026", what: "Paid acquisition pilot live in NYC market" },
];

function Timeline() {
  return (
    <ol style={{ padding: 0, margin: 0, position: "relative" }}>
      {TIMELINE.map((row, i) => (
        <li
          key={i}
          style={{
            listStyle: "none",
            position: "relative",
            display: "grid",
            gridTemplateColumns: "112px 1fr",
            gap: 16,
            padding: "12px 0",
            borderBottom: i === TIMELINE.length - 1 ? "none" : `1px dashed ${HAIRLINE}`,
          }}
        >
          <div
            style={{
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 12,
              fontWeight: 700,
              color: GOLD_DEEP,
              letterSpacing: "0.08em",
              paddingTop: 2,
            }}
          >
            {row.when}
          </div>
          <div style={{ fontSize: 14.5, color: INK, lineHeight: 1.55 }}>{row.what}</div>
        </li>
      ))}
    </ol>
  );
}

type BarRow = { year: string; value: number; label: string };

const FORECAST: BarRow[] = [
  { year: "2026", value: 0.7, label: "$0.7M" },
  { year: "2027", value: 1.8, label: "$1.8M" },
  { year: "2028", value: 4.8, label: "$4.8M" },
  { year: "2029", value: 13.7, label: "$13.7M" },
  { year: "2030", value: 39.5, label: "$39.5M" },
];

function BarChart() {
  const max = Math.max(...FORECAST.map((r) => r.value));
  return (
    <div
      style={{
        padding: "24px 20px 16px",
        borderRadius: 18,
        background: "linear-gradient(180deg, #ffffff 0%, #F5F8FF 100%)",
        border: `1px solid ${HAIRLINE}`,
        boxShadow: "0 1px 0 rgba(11,27,77,0.04)",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          color: BLUE,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          marginBottom: 12,
        }}
      >
        Revenue forecast (USD)
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 14,
          height: 180,
          paddingBottom: 4,
          borderBottom: `1px solid ${HAIRLINE}`,
        }}
      >
        {FORECAST.map((row) => {
          const h = Math.max(8, Math.round((row.value / max) * 160));
          return (
            <div key={row.year} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: INK,
                  marginBottom: 6,
                  whiteSpace: "nowrap",
                }}
              >
                {row.label}
              </div>
              <div
                style={{
                  width: "100%",
                  maxWidth: 64,
                  height: h,
                  borderRadius: "8px 8px 0 0",
                  background:
                    row.year === "2030"
                      ? `linear-gradient(180deg, ${GOLD} 0%, ${GOLD_DEEP} 100%)`
                      : `linear-gradient(180deg, ${BLUE} 0%, ${NAVY} 100%)`,
                  boxShadow: "0 -2px 0 rgba(11,27,77,0.06) inset",
                }}
              />
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
        {FORECAST.map((row) => (
          <div
            key={row.year}
            style={{ flex: 1, textAlign: "center", fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: "0.08em" }}
          >
            {row.year}
          </div>
        ))}
      </div>
    </div>
  );
}

type Cell = "yes3" | "yes" | "partial" | "no";

const COMP_HEADERS = ["Zeniva", "Hopper", "Layla", "Booking", "Airbnb", "TripActions"];
const COMP_ROWS: { criterion: string; cells: Cell[] }[] = [
  { criterion: "AI native multi-modes", cells: ["yes3", "partial", "yes", "no", "no", "no"] },
  { criterion: "Direct booking", cells: ["yes3", "yes", "no", "yes", "yes", "yes"] },
  { criterion: "Supplier marketplace", cells: ["yes3", "no", "no", "no", "yes", "no"] },
  { criterion: "B2B agency white-label", cells: ["yes3", "no", "no", "no", "no", "partial"] },
  { criterion: "Native EN/FR bilingual", cells: ["yes3", "no", "no", "partial", "partial", "no"] },
  { criterion: "Integrated payments (0% APR)", cells: ["yes3", "partial", "no", "no", "no", "no"] },
];

const CELL_RENDER: Record<Cell, { label: string; color: string; bg: string }> = {
  yes3: { label: "✓✓✓", color: TEAL, bg: "transparent" },
  yes: { label: "✓", color: "#16A34A", bg: "transparent" },
  partial: { label: "Partiel", color: GOLD_DEEP, bg: "transparent" },
  no: { label: "✗", color: "#DC2626", bg: "transparent" },
};

function CompTable() {
  return (
    <div style={{ overflowX: "auto", borderRadius: 18, border: `1px solid ${HAIRLINE}`, background: "white" }}>
      <table
        style={{
          width: "100%",
          minWidth: 720,
          borderCollapse: "collapse",
          fontSize: 13,
          color: INK,
        }}
      >
        <thead>
          <tr style={{ background: NAVY, color: "white" }}>
            <th
              style={{
                textAlign: "left",
                padding: "14px 16px",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: GOLD,
              }}
            >
              Criterion
            </th>
            {COMP_HEADERS.map((h, i) => (
              <th
                key={h}
                style={{
                  padding: "14px 12px",
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: "0.04em",
                  textAlign: "center",
                  background: i === 0 ? TEAL : NAVY,
                  color: "white",
                  borderLeft: i === 0 ? `1px solid ${TEAL}` : `1px solid rgba(255,255,255,0.1)`,
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {COMP_ROWS.map((row, ri) => (
            <tr key={ri} style={{ borderTop: `1px solid ${HAIRLINE}` }}>
              <td
                style={{
                  padding: "12px 16px",
                  fontWeight: 700,
                  color: INK,
                  background: ri % 2 === 0 ? "white" : "#F8FAFC",
                }}
              >
                {row.criterion}
              </td>
              {row.cells.map((cell, ci) => {
                const r = CELL_RENDER[cell];
                const isZeniva = ci === 0;
                return (
                  <td
                    key={ci}
                    style={{
                      padding: "12px 12px",
                      textAlign: "center",
                      fontWeight: 800,
                      fontSize: 14,
                      color: r.color,
                      background: isZeniva ? TEAL_LIGHT : ri % 2 === 0 ? "white" : "#F8FAFC",
                      borderLeft: `1px solid ${HAIRLINE}`,
                    }}
                  >
                    {r.label}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AskCard({
  num,
  title,
  body,
  bullets,
  tone = "light",
}: {
  num: string;
  title: string;
  body?: string;
  bullets?: string[];
  tone?: "light" | "cream" | "dark";
}) {
  const palette =
    tone === "dark"
      ? { bg: `linear-gradient(140deg, ${NAVY} 0%, ${NAVY_DEEP} 100%)`, color: "white", border: "rgba(255,255,255,0.1)", muted: "rgba(255,255,255,0.7)" }
      : tone === "cream"
      ? { bg: CREAM, color: INK, border: HAIRLINE, muted: MUTED }
      : { bg: "linear-gradient(160deg, #ffffff 0%, #F5F8FF 100%)", color: INK, border: HAIRLINE, muted: MUTED };
  return (
    <div
      style={{
        flex: "1 1 280px",
        minWidth: 260,
        borderRadius: 18,
        padding: 24,
        background: palette.bg,
        color: palette.color,
        border: `1px solid ${palette.border}`,
        boxShadow: "0 1px 0 rgba(11,27,77,0.04)",
      }}
    >
      <div
        style={{
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: 11,
          fontWeight: 700,
          color: tone === "dark" ? GOLD : GOLD_DEEP,
          letterSpacing: "0.18em",
        }}
      >
        {num}
      </div>
      <div style={{ marginTop: 8, fontSize: 18, fontWeight: 800, letterSpacing: "-0.012em" }}>{title}</div>
      {body ? (
        <p style={{ margin: "10px 0 0", fontSize: 14, lineHeight: 1.62, color: palette.muted }}>{body}</p>
      ) : null}
      {bullets && bullets.length ? (
        <ul style={{ margin: "12px 0 0", padding: 0 }}>
          {bullets.map((b, i) => (
            <li
              key={i}
              style={{
                listStyle: "none",
                padding: "6px 0 6px 18px",
                position: "relative",
                fontSize: 13.5,
                lineHeight: 1.55,
                color: palette.color,
              }}
            >
              <span aria-hidden style={{ position: "absolute", left: 0, top: 6, color: tone === "dark" ? GOLD : GOLD_DEEP, fontWeight: 800 }}>
                •
              </span>
              {b}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export default function PitchPage() {
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "white",
        color: INK,
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      {/* Hero */}
      <header
        style={{
          background: `radial-gradient(140% 110% at 8% 0%, ${BLUE} 0%, transparent 55%), linear-gradient(180deg, ${NAVY} 0%, ${NAVY_DEEP} 100%)`,
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(rgba(230,184,90,0.06) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            mixBlendMode: "screen",
            pointerEvents: "none",
          }}
        />
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "28px 24px 96px", position: "relative" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              padding: "10px 14px",
              border: "1px solid rgba(230,184,90,0.45)",
              borderRadius: 999,
              background: "rgba(230,184,90,0.08)",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: GOLD,
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span
                aria-hidden
                style={{
                  display: "inline-block",
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: GOLD,
                  boxShadow: "0 0 0 4px rgba(230,184,90,0.18)",
                }}
              />
              Private · Investor use only
            </span>
            <span style={{ color: "rgba(255,255,255,0.6)", fontWeight: 600, letterSpacing: "0.08em" }}>
              Confidential — do not distribute
            </span>
          </div>

          <div style={{ marginTop: 56, display: "flex", alignItems: "center", gap: 12 }}>
            <span
              aria-hidden
              style={{
                display: "inline-flex",
                width: 44,
                height: 44,
                borderRadius: 12,
                background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_DEEP} 100%)`,
                color: NAVY,
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 18,
                letterSpacing: "0.04em",
              }}
            >
              Z
            </span>
            <span style={{ fontWeight: 800, letterSpacing: "0.32em", fontSize: 13, color: "rgba(255,255,255,0.85)" }}>
              ZENIVA · TRAVEL
            </span>
          </div>

          <h1
            style={{
              margin: "28px 0 18px",
              fontSize: "clamp(40px, 6.4vw, 72px)",
              lineHeight: 1.02,
              letterSpacing: "-0.035em",
              fontWeight: 800,
              maxWidth: 880,
            }}
          >
            The AI travel <span style={{ color: GOLD }}>technology platform</span> people will actually book on.
          </h1>
          <p
            style={{
              margin: "0 0 28px",
              maxWidth: 720,
              fontSize: "clamp(16px, 1.8vw, 19px)",
              lineHeight: 1.55,
              color: "rgba(255,255,255,0.82)",
            }}
          >
            Lina, our AI concierge, plans and books real flights, hotels, yachts and villas in seconds — operated end-to-end on a software platform, fulfilled by third-party suppliers, backed by 12 specialized AI agents and humans 24/7.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 12,
              maxWidth: 720,
              marginTop: 12,
            }}
          >
            {[
              { k: "Live", v: "Bookings", s: "Flights · hotels · yachts · villas" },
              { k: "12", v: "AI agents", s: "Lina + ops + finance + growth" },
              { k: "0%", v: "Customer fees", s: "Supplier-commission + SaaS revenue" },
            ].map((stat) => (
              <div
                key={stat.k}
                style={{
                  border: "1px solid rgba(255,255,255,0.18)",
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 14,
                  padding: "14px 16px",
                  backdropFilter: "blur(6px)",
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 800, color: GOLD, letterSpacing: "0.18em", textTransform: "uppercase" }}>
                  {stat.k}
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>{stat.v}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 4, lineHeight: 1.45 }}>{stat.s}</div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 40,
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 14,
              fontSize: 12,
              color: "rgba(255,255,255,0.6)",
              letterSpacing: "0.04em",
            }}
          >
            <span>Investor pitch · {formattedDate}</span>
            <span aria-hidden style={{ color: "rgba(255,255,255,0.3)" }}>·</span>
            <span>{LEGAL_OPERATOR} · Delaware, USA</span>
          </div>
        </div>
      </header>

      {/* TOC */}
      <nav
        aria-label="Table of contents"
        style={{ background: "white", borderBottom: `1px solid ${HAIRLINE}`, position: "sticky", top: 0, zIndex: 5 }}
      >
        <div
          style={{
            maxWidth: 1080,
            margin: "0 auto",
            padding: "10px 24px",
            display: "flex",
            gap: 6,
            overflowX: "auto",
            scrollbarWidth: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {TOC.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 700,
                color: MUTED,
                textDecoration: "none",
                whiteSpace: "nowrap",
                border: `1px solid ${HAIRLINE}`,
                background: "white",
              }}
            >
              <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 10, fontWeight: 700, color: SUBTLE }}>
                {s.num}
              </span>
              <span>{s.eyebrow}</span>
            </a>
          ))}
        </div>
      </nav>

      {/* Body */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px 96px" }}>
        {/* 01 Problem */}
        <SectionShell id="problem" num="01" eyebrow="Problem" title="Travel planning is still painful and high-friction">
          <ul style={{ padding: 0, margin: 0 }}>
            <Bullet marker="•">Multi-supplier trips (flights + hotels + transfers + activities) require 6–8 tools and hours of work, even for experienced travelers.</Bullet>
            <Bullet marker="•">Existing AI travel tools generate inspiration but stop at booking — they hand off to OTAs and disappear when something goes wrong.</Bullet>
            <Bullet marker="•">Traditional agencies charge fees, are slow and can&apos;t be reached at 2 a.m. when a flight cancels.</Bullet>
            <Bullet marker="•">Travelers want one place to chat, plan, book and get help — across destinations, languages and budgets.</Bullet>
          </ul>
        </SectionShell>

        {/* 02 Solution — 3 modes */}
        <SectionShell id="solution" num="02" eyebrow="Solution" title="One AI platform, three go-to-market modes">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
            <ColumnCard
              num="MODE 1"
              title="B2C — Travelers"
              tagline="Lina chats, plans, books and supports the trip end-to-end."
              accent={BLUE}
              bullets={[
                "Chat + voice in 7 languages, 24/7",
                "Live flight + hotel + yacht + villa inventory",
                "Human escalation in minutes",
                "ZeniPay 0% installments",
              ]}
            />
            <ColumnCard
              num="MODE 2"
              title="B2B — Agencies (white-label)"
              tagline="Travel agencies run their business on Lina + the 12-agent ops stack."
              accent={TEAL}
              bullets={[
                "Starter — $99/mo (solo agent, core CRM + Lina chat)",
                "Pro — $1,999/mo (full Lina + CRM + proposals + invoicing + commissions)",
                "Enterprise — variable (custom branding + featured marketplace placement)",
                "Same supplier inventory across every tier; zero booking commission",
              ]}
            />
            <ColumnCard
              num="MODE 3"
              title="B2B — Suppliers (marketplace)"
              tagline="Yacht, villa and resort partners list inventory directly into the platform."
              accent={GOLD_DEEP}
              bullets={[
                "Direct supplier onboarding",
                "Specialty inventory not on OTAs",
                "Higher margins (yacht, villa, cruise)",
                "Featured placement options",
              ]}
            />
          </div>
        </SectionShell>

        {/* 03 The 12 AI Agents */}
        <SectionShell id="agents" num="03" eyebrow="The 12 AI Agents" title="One product surface, twelve specialized agents under the hood">
          <p style={{ margin: "0 0 22px", fontSize: 16, lineHeight: 1.62, color: INK, maxWidth: 760 }}>
            Lina is the customer-facing concierge. Behind her, a fleet of specialized agents runs lead generation, payments, voice, security, social, analytics, infrastructure, compliance, success and revenue intelligence — 24/7.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 12,
            }}
          >
            {AGENTS.map((a) => (
              <AgentCard key={a.id} agent={a} />
            ))}
          </div>
        </SectionShell>

        {/* 04 Market */}
        <SectionShell id="market" num="04" eyebrow="Market" title="Large, online-shifting, AI-native">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 22 }}>
            <Stat label="Global online travel" value="$833B" sub="2024 global online travel sales" />
            <Stat label="N. America TAM" value="$220B" sub="USA + Canada online leisure + business" />
            <Stat label="AI travel SOM" value="$8B+" sub="Conversational booking + concierge layer" />
          </div>
          <p style={{ margin: 0, lineHeight: 1.66, color: INK, fontSize: 16 }}>
            US/CA travelers shifted to mobile-first booking; AI-native interfaces are the next disruption after meta-search and OTAs. Zeniva targets the high-AOV slice: luxury, multi-supplier, group and specialty (yacht, villa, cruise, wedding) — plus the long tail of independent travel agencies via white-label SaaS.
          </p>
        </SectionShell>

        {/* 05 Product — 3 columns */}
        <SectionShell id="product" num="05" eyebrow="Product" title="From conversation to confirmed booking — three pillars">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
            <ColumnCard
              num="PILLAR 1"
              title="Plan"
              tagline="Discover and compare in one conversation."
              accent={BLUE}
              bullets={[
                "Lina chat + voice on /chat and /call",
                "Multi-supplier search in 30 seconds",
                "3 personalized proposals per request",
                "Multilingual auto-detect (7 languages)",
              ]}
            />
            <ColumnCard
              num="PILLAR 2"
              title="Book"
              tagline="Real bookings with full supplier disclosure."
              accent={TEAL}
              bullets={[
                "Duffel (300+ airlines), LiteAPI (1.5M+ hotels)",
                "Yacht, villa and cruise via direct partners",
                "Stripe + ZeniPay 0% installments",
                "Supplier name on every confirmation",
              ]}
            />
            <ColumnCard
              num="PILLAR 3"
              title="Support"
              tagline="Humans on standby, documents centralized."
              accent={GOLD_DEEP}
              bullets={[
                "24/7 advisor escalation in minutes",
                "Traveler dashboard with all documents",
                "Mid-trip changes & rebooking handled",
                "Loyalty + ZeniGroup pricing for cohorts",
              ]}
            />
          </div>
        </SectionShell>

        {/* 06 Why now */}
        <SectionShell id="why-now" num="06" eyebrow="Why now" title="LLMs finally close the booking loop">
          <PullQuote>
            Production-grade tool calling makes &ldquo;plan + book + support&rdquo; a single conversation for the first time.
          </PullQuote>
          <ul style={{ padding: 0, margin: "12px 0 0" }}>
            <Bullet marker="•">Supplier APIs (Duffel, LiteAPI, etc.) are finally programmable end-to-end with NDC fares and instant confirmations.</Bullet>
            <Bullet marker="•">Consumer comfort with chat-first commerce has crossed the chasm post-2024.</Bullet>
            <Bullet marker="•">Embedded payment platforms (Stripe + installments) remove the last friction point at checkout.</Bullet>
            <Bullet marker="•">Independent travel agencies under pressure from OTAs need a software stack — not just inventory.</Bullet>
          </ul>
        </SectionShell>

        {/* 07 Business model — 3 streams */}
        <SectionShell id="business" num="07" eyebrow="Business model" title="Three revenue streams, complementary by design">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
            <ColumnCard
              num="STREAM 1"
              title="B2C — Supplier commission"
              tagline="Transactional revenue per booking."
              accent={BLUE}
              bullets={[
                "8–25% commission depending on vertical",
                "Yacht and villa highest (specialty inventory)",
                "Zero customer-facing booking fee",
                "Drives top-line scale",
              ]}
            />
            <ColumnCard
              num="STREAM 2"
              title="B2B — Agency SaaS"
              tagline="Recurring software revenue."
              accent={TEAL}
              bullets={[
                "From $1,999/mo per agency",
                "Lina + CRM + invoicing + commissions",
                "Marketplace featured placement (variable)",
                "70%+ of projected ARR by 2030",
              ]}
            />
            <ColumnCard
              num="STREAM 3"
              title="ZeniPay take-rate"
              tagline="Fintech margin on installment plans."
              accent={GOLD_DEEP}
              bullets={[
                "0% APR financing for travelers",
                "Spread on the underlying capital cost",
                "Captures wallet share at checkout",
                "Independent strategic asset (see slide 10)",
              ]}
            />
          </div>
        </SectionShell>

        {/* 08 Traction with timeline */}
        <SectionShell id="traction" num="08" eyebrow="Traction" title="Live product, two years of compounding milestones">
          {/* Dominant revenue proof — only concrete revenue today */}
          <div
            style={{
              position: "relative",
              padding: "28px 32px",
              borderRadius: 22,
              background: `linear-gradient(135deg, ${CREAM} 0%, #FFF6DC 100%)`,
              border: `2px solid ${GOLD}`,
              boxShadow: "0 18px 38px rgba(230,184,90,0.22)",
              marginBottom: 28,
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 24,
              justifyContent: "space-between",
            }}
          >
            <div
              aria-hidden
              style={{
                position: "absolute",
                top: -1,
                right: 22,
                background: GOLD,
                color: NAVY,
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                padding: "4px 10px",
                borderRadius: "0 0 8px 8px",
              }}
            >
              Concrete revenue · pre-platform
            </div>
            <div style={{ minWidth: 240 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: GOLD_DEEP,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                }}
              >
                2025 revenue
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: "clamp(48px, 8vw, 84px)",
                  fontWeight: 800,
                  letterSpacing: "-0.035em",
                  lineHeight: 0.95,
                  background: `linear-gradient(135deg, ${NAVY} 0%, ${GOLD_DEEP} 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                $400K
              </div>
              <div style={{ marginTop: 6, fontSize: 14, color: INK, fontWeight: 600 }}>
                Manual LiteAPI sales, pre-platform launch.
              </div>
            </div>
            <div style={{ flex: "0 1 320px", fontSize: 13.5, color: MUTED, lineHeight: 1.6 }}>
              Achieved by the founder hand-selling hotel and package bookings through the LiteAPI supplier network — without any AI platform automation, paid acquisition channel or sales team. Validates demand and unlocks the platform-led revenue scale modeled on slide 13.
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)", gap: 32, alignItems: "start" }}>
            <Timeline />
            <div style={{ display: "grid", gap: 12 }}>
              <Stat label="Languages" value="7" sub="EN, FR, ES, PT, DE, IT, AR" />
              <Stat label="Hotel inventory" value="1.5M+" sub="LiteAPI direct integration" />
              <Stat label="Yacht fleet" value="36" sub="South-Florida boats, direct contracts" />
              <Stat label="Indexed URLs" value="88+" sub="IndexNow auto-push to Bing/Yandex" />
            </div>
          </div>
        </SectionShell>

        {/* 09 Moat */}
        <SectionShell id="moat" num="09" eyebrow="Moat" title="Data + relationships compound over time">
          <ul style={{ padding: 0, margin: 0 }}>
            <Bullet marker="•">Proprietary trip-intent dataset trains better proposal ranking than generic LLM agents.</Bullet>
            <Bullet marker="•">Direct supplier relationships (yacht, villa, all-inclusive operators) gate inventory not available through OTAs.</Bullet>
            <Bullet marker="•">ZeniPay installment infrastructure shifts wallet share away from card-only competitors.</Bullet>
            <Bullet marker="•">Bilingual EN/FR product opens markets (Quebec, France, Caribbean francophone) that English-only AI agents can&apos;t serve.</Bullet>
            <Bullet marker="•">The 12-agent ops stack is a moat in itself: each agent compounds proprietary data the next agent uses.</Bullet>
          </ul>
        </SectionShell>

        {/* 10 ZeniPay strategic asset */}
        <SectionShell id="zenipay" num="10" eyebrow="ZeniPay strategic asset" title="An owned payment & financing layer — independently exitable">
          <p style={{ margin: "0 0 22px", fontSize: 16, lineHeight: 1.62, color: INK, maxWidth: 760 }}>
            ZeniPay is our in-house payment & 0%-installment infrastructure, operated as a separate company (Canada). It de-risks Zeniva Travel by removing dependency on third-party financing, and creates a second exit path for investors.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
            <ColumnCard
              num="ASSET 1"
              title="Owned payment rail"
              tagline="Payments + installments under our roof."
              accent={BLUE}
              bullets={[
                "Stripe orchestration + own ledger",
                "0% APR consumer financing",
                "Wallet, refunds, dispute handling",
                "AML / fraud agents (Max + Ben)",
              ]}
            />
            <ColumnCard
              num="ASSET 2"
              title="Financing margin captured"
              tagline="Spread on every installment plan."
              accent={TEAL}
              bullets={[
                "Margin instead of paying Affirm/Klarna",
                "Ben (Finance agent) automates accounting",
                "Higher AOV via instalment psychology",
                "Embedded in B2B agency offering",
              ]}
            />
            <ColumnCard
              num="ASSET 3"
              title="Two independent exits"
              tagline="Reduces risk, doubles upside."
              accent={GOLD_DEEP}
              bullets={[
                "Travel-tech acquirer for Zeniva Travel",
                "Fintech acquirer or IPO for ZeniPay",
                "Either can clear the round on its own",
                "Cross-licensing keeps both products alive",
              ]}
            />
          </div>
        </SectionShell>

        {/* 11 Competition */}
        <SectionShell id="competition" num="11" eyebrow="Competition" title="Itinerary builders, OTAs, marketplaces and AI bolt-ons">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14, marginBottom: 24 }}>
            <div style={{ padding: 16, border: `1px solid ${HAIRLINE}`, borderRadius: 14, background: "white" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: BLUE, letterSpacing: "0.16em", textTransform: "uppercase" }}>vs Layla, Mindtrip, Wonderplan, Roam Around</div>
              <p style={{ margin: "8px 0 0", fontSize: 14, color: INK, lineHeight: 1.55 }}>
                Generate inspiration, hand off to Booking.com — no booking ownership, no human escalation.
              </p>
            </div>
            <div style={{ padding: 16, border: `1px solid ${HAIRLINE}`, borderRadius: 14, background: "white" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: BLUE, letterSpacing: "0.16em", textTransform: "uppercase" }}>vs Hopper, Kayak AI, Penny</div>
              <p style={{ margin: "8px 0 0", fontSize: 14, color: INK, lineHeight: 1.55 }}>
                Price-prediction and meta-search inside an OTA — locked inventory, narrow scope.
              </p>
            </div>
            <div style={{ padding: 16, border: `1px solid ${HAIRLINE}`, borderRadius: 14, background: "white" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: BLUE, letterSpacing: "0.16em", textTransform: "uppercase" }}>vs Traditional agencies / TMCs</div>
              <p style={{ margin: "8px 0 0", fontSize: 14, color: INK, lineHeight: 1.55 }}>
                Human-only, slow, fee-heavy, not 24/7 — and now their software vendor.
              </p>
            </div>
            <div style={{ padding: 16, border: `1px solid ${HAIRLINE}`, borderRadius: 14, background: "white" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: BLUE, letterSpacing: "0.16em", textTransform: "uppercase" }}>vs Airbnb / Vrbo / Booking marketplaces</div>
              <p style={{ margin: "8px 0 0", fontSize: 14, color: INK, lineHeight: 1.55 }}>
                Short-term rentals only, no AI-native conversation, 15–25% commissions, no B2B agency integration.
              </p>
            </div>
          </div>

          <CompTable />

          <div
            style={{
              marginTop: 22,
              padding: "18px 22px",
              borderRadius: 16,
              background: `linear-gradient(140deg, ${TEAL} 0%, #0F766E 100%)`,
              color: "white",
              boxShadow: "0 12px 28px rgba(13,148,136,0.2)",
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: TEAL_LIGHT }}>
              Defensibility
            </div>
            <div style={{ marginTop: 6, fontSize: 18, fontWeight: 800, letterSpacing: "-0.012em" }}>
              Projected 2030 ARR: <span style={{ color: GOLD }}>$26.8M</span> — 70% of revenue is recurring SaaS.
            </div>
          </div>

          <PullQuote>
            Zeniva is the only platform that combines AI-first chat, real bookings, human safety net, multilingual support, specialty inventory and a B2B agency stack — in one product.
          </PullQuote>
        </SectionShell>

        {/* 12 Team */}
        <SectionShell id="team" num="12" eyebrow="Team" title="Operator-led, technology-first">
          <ul style={{ padding: 0, margin: 0 }}>
            <Bullet marker="•">
              <strong>Founder &amp; CEO:</strong> Alexandre Blais — full-stack operator, builds + ships product end-to-end.
            </Bullet>
            <Bullet marker="•">
              <strong>Lina (AI concierge):</strong> in-house assistant, multilingual, voice-enabled.
            </Bullet>
            <Bullet marker="•">
              <strong>Senior advisors:</strong> human escalation team backing every AI booking 24/7.
            </Bullet>
            <Bullet marker="•">
              <strong>Hiring:</strong> growth engineer, partnerships lead (yacht/villa), brand designer.
            </Bullet>
          </ul>
        </SectionShell>

        {/* 13 Financials */}
        <SectionShell id="financials" num="13" eyebrow="Financials" title="Revenue $39M and profitable within 5 years.">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, alignItems: "start" }}>
            <BarChart />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
              <Stat label="B2B agencies (cumulative 2030)" value="2,480" sub="White-label SaaS pipeline" accent={`linear-gradient(135deg, ${TEAL} 0%, #0F766E 100%)`} />
              <Stat label="ARR end of 2030" value="$26.8M" sub="70% of total revenue (recurring)" accent={`linear-gradient(135deg, ${TEAL} 0%, #0F766E 100%)`} />
              <Stat label="Gross margin (steady-state)" value="82%" sub="Software-economics tilted" />
              <Stat label="EBITDA 2030" value="+$9.6M" sub="Profitable run-rate" />
              <Stat label="Cash-flow break-even" value="Q3 2029" sub="On current capital plan" />
              <Stat label="LTV / CAC ratio" value="8.4×" sub="Bookings + SaaS retention" accent={`linear-gradient(135deg, ${GOLD} 0%, ${GOLD_DEEP} 100%)`} />
            </div>
          </div>
          <p style={{ margin: "22px 0 0", fontSize: 12, color: MUTED, fontStyle: "italic" }}>
            Forward-looking estimates based on current product, supplier roster and pricing. Detailed model in the data room on request.
          </p>
        </SectionShell>

        {/* 14 The Ask */}
        <SectionShell id="ask" num="14" eyebrow="The ask" title="Seed round to extend distribution and data lead">
          <p style={{ margin: "0 0 18px", fontSize: 16, lineHeight: 1.62, color: INK, maxWidth: 760 }}>
            Capital used to (a) scale paid acquisition in proven channels, (b) deepen direct supplier relationships in yacht/villa/cruise, (c) ship the agency B2B SaaS at scale, and (d) build the data flywheel that compounds Lina&apos;s ranking quality.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
            <AskCard
              num="CARD 1"
              title="Use of funds"
              tone="light"
              bullets={[
                "~50% growth — paid acquisition + content + SEO",
                "~30% product & AI — agents, voice, ranking models",
                "~20% partnerships & ops — supplier roster, advisor coverage",
              ]}
            />
            <AskCard
              num="CARD 2"
              title="Milestones to next round"
              tone="cream"
              bullets={[
                "Bookings volume target locked by quarter",
                "Supplier roster x3 in yacht/villa/cruise",
                "B2B agency pilots converted to paying SaaS",
                "ZeniPay GMV inflection on installments",
              ]}
            />
            <AskCard
              num="CARD 3"
              title="Exit strategy"
              tone="dark"
              body="Two independent exit paths: Zeniva Travel (travel-tech acquirer) and ZeniPay (fintech acquirer or IPO). Reduces risk, doubles the upside."
            />
          </div>
        </SectionShell>

        {/* 15 Contact */}
        <SectionShell id="contact" num="15" eyebrow="Contact" title="Direct line">
          <div
            style={{
              borderRadius: 18,
              padding: 26,
              background: `linear-gradient(140deg, ${NAVY} 0%, ${NAVY_DEEP} 100%)`,
              color: "white",
              boxShadow: "0 18px 48px rgba(11,27,77,0.18)",
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 800, color: GOLD, letterSpacing: "0.22em", textTransform: "uppercase" }}>
              Founder
            </div>
            <div style={{ marginTop: 6, fontSize: 24, fontWeight: 800, letterSpacing: "-0.012em" }}>Alexandre Blais</div>
            <div
              style={{
                marginTop: 16,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 12,
                fontSize: 14,
              }}
            >
              <a
                href="mailto:info@zeniva.ca"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "12px 14px",
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "white",
                  textDecoration: "none",
                }}
              >
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 700 }}>
                  Email
                </span>
                <span style={{ marginTop: 4, fontWeight: 700 }}>info@zeniva.ca</span>
              </a>
              <a
                href="tel:+15817487017"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "12px 14px",
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "white",
                  textDecoration: "none",
                }}
              >
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 700 }}>
                  Phone
                </span>
                <span style={{ marginTop: 4, fontWeight: 700 }}>+1 (581) 748-7017</span>
              </a>
            </div>
            <p style={{ margin: "16px 0 0", fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
              Materials shared under NDA on request.
            </p>
          </div>
        </SectionShell>

        {/* Footer */}
        <footer
          style={{
            marginTop: 48,
            paddingTop: 24,
            borderTop: `1px solid ${HAIRLINE}`,
            fontSize: 11,
            color: MUTED,
            lineHeight: 1.65,
          }}
        >
          <div
            aria-hidden
            style={{
              height: 2,
              width: 56,
              background: `linear-gradient(90deg, ${GOLD} 0%, ${GOLD_DEEP} 100%)`,
              marginBottom: 16,
              borderRadius: 2,
            }}
          />
          <p style={{ margin: 0 }}>
            Confidential — for the named recipient only. © {today.getFullYear()} Zeniva Travel — {LEGAL_OPERATOR}. All rights reserved.
          </p>
          <p style={{ margin: "4px 0 0" }}>
            Zeniva Travel acts solely as a technology intermediary. Travel services are provided by third-party suppliers.
          </p>
        </footer>
      </div>
    </main>
  );
}
