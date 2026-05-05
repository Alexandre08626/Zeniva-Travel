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
const GOLD = "#E6B85A";
const GOLD_DEEP = "#C9941F";
const INK = "#0B1228";
const MUTED = "#475569";
const SUBTLE = "#94A3B8";
const HAIRLINE = "#E5E7EB";

type Section = {
  id: string;
  num: string;
  eyebrow: string;
  title: string;
};

const TOC: Section[] = [
  { id: "problem", num: "01", eyebrow: "Problem", title: "Travel planning is still painful" },
  { id: "solution", num: "02", eyebrow: "Solution", title: "Lina AI — plan, book, support" },
  { id: "market", num: "03", eyebrow: "Market", title: "Large, online-shifting, AI-native" },
  { id: "product", num: "04", eyebrow: "Product", title: "From conversation to confirmed booking" },
  { id: "why-now", num: "05", eyebrow: "Why now", title: "LLMs finally close the booking loop" },
  { id: "business", num: "06", eyebrow: "Business model", title: "Commissions + take-rate + B2B" },
  { id: "traction", num: "07", eyebrow: "Traction", title: "Live product, expanding distribution" },
  { id: "moat", num: "08", eyebrow: "Moat", title: "Data + relationships compound" },
  { id: "competition", num: "09", eyebrow: "Competition", title: "Builders, OTAs, AI bolt-ons" },
  { id: "team", num: "10", eyebrow: "Team", title: "Operator-led, technology-first" },
  { id: "ask", num: "11", eyebrow: "The ask", title: "Seed round to extend our lead" },
  { id: "contact", num: "12", eyebrow: "Contact", title: "Direct line" },
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

function Bullet({
  marker,
  children,
}: {
  marker?: string;
  children: React.ReactNode;
}) {
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

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
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
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          color: MUTED,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 8,
          fontSize: 36,
          fontWeight: 800,
          color: NAVY,
          letterSpacing: "-0.025em",
          lineHeight: 1,
          background: `linear-gradient(135deg, ${NAVY} 0%, ${BLUE} 100%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        {value}
      </div>
      {sub ? (
        <div style={{ fontSize: 12, color: MUTED, marginTop: 8, lineHeight: 1.45 }}>
          {sub}
        </div>
      ) : null}
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

export default function PitchPage() {
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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
      {/* Hero — dark premium */}
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
            backgroundImage:
              "radial-gradient(rgba(230,184,90,0.06) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            mixBlendMode: "screen",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            maxWidth: 1080,
            margin: "0 auto",
            padding: "28px 24px 96px",
            position: "relative",
          }}
        >
          {/* Confidentiality bar */}
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

          {/* Brand mark */}
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
            <span
              style={{
                fontWeight: 800,
                letterSpacing: "0.32em",
                fontSize: 13,
                color: "rgba(255,255,255,0.85)",
              }}
            >
              ZENIVA · TRAVEL
            </span>
          </div>

          {/* Headline */}
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
            The AI travel <span style={{ color: GOLD }}>technology platform</span>{" "}
            people will actually book on.
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
            Lina, our AI concierge, plans and books real flights, hotels, yachts and villas in seconds — operated end-to-end on a software platform, fulfilled by third-party suppliers, backed by humans 24/7.
          </p>

          {/* Hero stats strip */}
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
              { k: "24/7", v: "Lina AI", s: "Chat + voice in 7 languages" },
              { k: "0%", v: "Customer fees", s: "Supplier-commission revenue" },
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
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: GOLD,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                  }}
                >
                  {stat.k}
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>{stat.v}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 4, lineHeight: 1.45 }}>
                  {stat.s}
                </div>
              </div>
            ))}
          </div>

          {/* Meta row */}
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

      {/* TOC strip */}
      <nav
        aria-label="Table of contents"
        style={{
          background: "white",
          borderBottom: `1px solid ${HAIRLINE}`,
          position: "sticky",
          top: 0,
          zIndex: 5,
        }}
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
              <span
                style={{
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  fontSize: 10,
                  fontWeight: 700,
                  color: SUBTLE,
                }}
              >
                {s.num}
              </span>
              <span>{s.eyebrow}</span>
            </a>
          ))}
        </div>
      </nav>

      {/* Body */}
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "0 24px 96px" }}>
        <SectionShell
          id="problem"
          num="01"
          eyebrow="Problem"
          title="Travel planning is still painful and high-friction"
        >
          <ul style={{ padding: 0, margin: 0 }}>
            <Bullet marker="•">
              Multi-supplier trips (flights + hotels + transfers + activities) require 6–8 tools and hours of work, even for experienced travelers.
            </Bullet>
            <Bullet marker="•">
              Existing AI travel tools generate inspiration but stop at booking — they hand off to OTAs and disappear when something goes wrong.
            </Bullet>
            <Bullet marker="•">
              Traditional agencies charge fees, are slow and can&apos;t be reached at 2 a.m. when a flight cancels.
            </Bullet>
            <Bullet marker="•">
              Travelers want one place to chat, plan, book and get help — across destinations, languages and budgets.
            </Bullet>
          </ul>
        </SectionShell>

        <SectionShell
          id="solution"
          num="02"
          eyebrow="Solution"
          title="Lina AI — a concierge that plans and books, with humans on standby"
        >
          <ul style={{ padding: 0, margin: 0 }}>
            <Bullet marker="01">
              <strong>Conversation-first:</strong> chat or voice in 7 languages, 24/7. Lina returns 3 personalized options in under 30 seconds.
            </Bullet>
            <Bullet marker="02">
              <strong>Real bookings:</strong> live inventory through Duffel (300+ airlines), LiteAPI (1.5M+ hotels), plus curated yacht, villa and cruise partners.
            </Bullet>
            <Bullet marker="03">
              <strong>Human escalation:</strong> &ldquo;parler à un humain&rdquo; routes to a senior advisor in minutes. Same brain handles the whole trip.
            </Bullet>
            <Bullet marker="04">
              <strong>Payments:</strong> Stripe + ZeniPay 0% installments — 25% deposit, balance through trip date.
            </Bullet>
            <Bullet marker="05">
              <strong>Platform-only positioning:</strong> Zeniva acts solely as a technology intermediary; supplier fulfilment is fully disclosed at checkout.
            </Bullet>
          </ul>
        </SectionShell>

        <SectionShell
          id="market"
          num="03"
          eyebrow="Market"
          title="Large, online-shifting, AI-native"
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 14,
              marginBottom: 22,
            }}
          >
            <Stat label="Global online travel" value="$833B" sub="2024 global online travel sales" />
            <Stat label="N. America TAM" value="$220B" sub="USA + Canada online leisure + business" />
            <Stat label="AI travel SOM" value="$8B+" sub="Conversational booking + concierge layer" />
          </div>
          <p style={{ margin: 0, lineHeight: 1.66, color: INK, fontSize: 16 }}>
            US/CA travelers shifted to mobile-first booking; AI-native interfaces are the next disruption after meta-search and OTAs. Zeniva targets the high-AOV slice: luxury, multi-supplier, group and specialty (yacht, villa, cruise, wedding).
          </p>
        </SectionShell>

        <SectionShell
          id="product"
          num="04"
          eyebrow="Product"
          title="From conversation to confirmed booking, end-to-end"
        >
          <ul style={{ padding: 0, margin: 0 }}>
            <Bullet marker="01">
              <strong>Discover:</strong> chat or voice on /chat or /call. Lina parses dates, group, budget, style.
            </Bullet>
            <Bullet marker="02">
              <strong>Compare:</strong> live multi-supplier search returns flights, hotels, ground, activities in one proposal.
            </Bullet>
            <Bullet marker="03">
              <strong>Book:</strong> traveler accepts a proposal; payment via Stripe or ZeniPay; supplier names disclosed on the confirmation.
            </Bullet>
            <Bullet marker="04">
              <strong>Travel:</strong> documents land in the traveler dashboard; Lina + advisor handle changes mid-trip.
            </Bullet>
            <Bullet marker="05">
              <strong>Loyalty:</strong> referral and ZeniGroup pricing pull travelers back per cohort.
            </Bullet>
          </ul>
        </SectionShell>

        <SectionShell
          id="why-now"
          num="05"
          eyebrow="Why now"
          title="LLMs finally close the booking loop"
        >
          <PullQuote>
            Production-grade tool calling makes &ldquo;plan + book + support&rdquo; a single conversation for the first time.
          </PullQuote>
          <ul style={{ padding: 0, margin: "12px 0 0" }}>
            <Bullet marker="•">
              Supplier APIs (Duffel, LiteAPI, etc.) are finally programmable end-to-end with NDC fares and instant confirmations.
            </Bullet>
            <Bullet marker="•">
              Consumer comfort with chat-first commerce has crossed the chasm post-2024.
            </Bullet>
            <Bullet marker="•">
              Embedded payment platforms (Stripe + installments) remove the last friction point at checkout.
            </Bullet>
          </ul>
        </SectionShell>

        <SectionShell
          id="business"
          num="06"
          eyebrow="Business model"
          title="Commission + take-rate, with installment fees"
        >
          <ul style={{ padding: 0, margin: 0 }}>
            <Bullet marker="•">
              <strong>Supplier commission</strong> on every booking (8–25% depending on vertical — yacht and villa highest).
            </Bullet>
            <Bullet marker="•">
              <strong>ZeniPay installment fee</strong> on plans (small spread on the financing).
            </Bullet>
            <Bullet marker="•">
              <strong>B2B platform fee</strong> from agencies using the Lina + CRM stack via /for-agencies.
            </Bullet>
            <Bullet marker="•">
              <strong>No customer-facing booking fee</strong> on the consumer site — increases conversion and fits the &ldquo;technology platform&rdquo; positioning.
            </Bullet>
          </ul>
        </SectionShell>

        <SectionShell
          id="traction"
          num="07"
          eyebrow="Traction"
          title="Live product, expanding distribution"
        >
          <ul style={{ padding: 0, margin: 0 }}>
            <Bullet marker="•">
              Lina concierge in production on zenivatravel.com with chat + voice (Groq + Google) in 6 languages.
            </Bullet>
            <Bullet marker="•">
              Booking pipeline live across flights (Duffel), hotels (LiteAPI), yachts (36-boat South-Florida fleet), villas, cruises.
            </Bullet>
            <Bullet marker="•">
              SEO footprint: 88+ indexed URLs, 22 new geo/intent landing pages, IndexNow auto-push.
            </Bullet>
            <Bullet marker="•">
              Paid acquisition piloted at $100/day in NYC; landing on /packages.
            </Bullet>
            <Bullet marker="•">
              Social presence (TikTok, IG, FB, X, LinkedIn) driving top-of-funnel for Lina.
            </Bullet>
          </ul>
        </SectionShell>

        <SectionShell
          id="moat"
          num="08"
          eyebrow="Moat"
          title="Data + relationships compound over time"
        >
          <ul style={{ padding: 0, margin: 0 }}>
            <Bullet marker="•">
              Proprietary trip-intent dataset trains better proposal ranking than generic LLM agents.
            </Bullet>
            <Bullet marker="•">
              Direct supplier relationships (yacht, villa, all-inclusive operators) gate inventory not available through OTAs.
            </Bullet>
            <Bullet marker="•">
              ZeniPay installment infrastructure shifts wallet share away from card-only competitors.
            </Bullet>
            <Bullet marker="•">
              Bilingual EN/FR product opens markets (Quebec, France, Caribbean francophone) that English-only AI agents can&apos;t serve.
            </Bullet>
          </ul>
        </SectionShell>

        <SectionShell
          id="competition"
          num="09"
          eyebrow="Competition"
          title="Itinerary builders, OTAs, and AI bolt-ons"
        >
          <ul style={{ padding: 0, margin: 0 }}>
            <Bullet marker="vs">
              <strong>Layla, Mindtrip, Wonderplan, Roam Around:</strong> generate inspiration, hand off to Booking.com — no booking ownership, no human escalation.
            </Bullet>
            <Bullet marker="vs">
              <strong>Hopper, Kayak AI, Penny:</strong> price-prediction and meta-search inside an OTA — locked inventory, narrow scope.
            </Bullet>
            <Bullet marker="vs">
              <strong>Traditional agencies / TMCs:</strong> human-only, slow, fee-heavy, not 24/7.
            </Bullet>
          </ul>
          <PullQuote>
            Zeniva is the only platform that combines AI-first chat, real bookings, human safety net, multilingual support and specialty inventory in one product.
          </PullQuote>
        </SectionShell>

        <SectionShell
          id="team"
          num="10"
          eyebrow="Team"
          title="Operator-led, technology-first"
        >
          <ul style={{ padding: 0, margin: 0 }}>
            <Bullet marker="•">
              <strong>Founder &amp; CEO:</strong> Alexandre — full-stack operator, builds + ships product end-to-end.
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

        <SectionShell
          id="ask"
          num="11"
          eyebrow="The ask"
          title="Seed round to extend distribution and data lead"
        >
          <div
            style={{
              borderRadius: 18,
              padding: 26,
              background: `linear-gradient(160deg, #ffffff 0%, #F5F8FF 100%)`,
              border: `1px solid ${HAIRLINE}`,
              boxShadow: "0 1px 0 rgba(11,27,77,0.04)",
            }}
          >
            <p style={{ margin: "0 0 16px", fontSize: 16, lineHeight: 1.62, color: INK }}>
              Capital used to (a) scale paid acquisition in proven channels, (b) deepen direct supplier relationships in yacht/villa/cruise, (c) ship the agency B2B SaaS and (d) build the data flywheel that compounds Lina&apos;s ranking quality.
            </p>
            <ul style={{ padding: 0, margin: 0 }}>
              <Bullet marker="01">
                Use of funds: ~50% growth, ~30% product/AI, ~20% partnerships &amp; ops.
              </Bullet>
              <Bullet marker="02">
                Milestones: bookings volume, supplier roster, advisor coverage, B2B agency pilots.
              </Bullet>
              <Bullet marker="03">
                Round details, KPIs and data room available on request — direct contact only.
              </Bullet>
            </ul>
          </div>
        </SectionShell>

        <SectionShell id="contact" num="12" eyebrow="Contact" title="Direct line">
          <div
            style={{
              borderRadius: 18,
              padding: 26,
              background: `linear-gradient(140deg, ${NAVY} 0%, ${NAVY_DEEP} 100%)`,
              color: "white",
              boxShadow: "0 18px 48px rgba(11,27,77,0.18)",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: GOLD,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
              }}
            >
              Founder
            </div>
            <div style={{ marginTop: 6, fontSize: 24, fontWeight: 800, letterSpacing: "-0.012em" }}>
              Alexandre Blais
            </div>
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
