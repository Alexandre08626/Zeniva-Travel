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
const BLUE = "#0F6CF5";
const GOLD = "#E6B85A";
const INK = "#0B1228";
const MUTED = "#475569";
const HAIRLINE = "#E5E7EB";

type SectionProps = { id: string; eyebrow: string; title: string; children: React.ReactNode };

function Section({ id, eyebrow, title, children }: SectionProps) {
  return (
    <section
      id={id}
      style={{
        padding: "56px 0",
        borderTop: `1px solid ${HAIRLINE}`,
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 11,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          fontWeight: 800,
          color: BLUE,
        }}
      >
        {eyebrow}
      </p>
      <h2
        style={{
          margin: "8px 0 22px",
          fontSize: 30,
          lineHeight: 1.18,
          fontWeight: 800,
          color: INK,
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div
      style={{
        flex: "1 1 180px",
        minWidth: 180,
        padding: "18px 20px",
        borderRadius: 14,
        border: `1px solid ${HAIRLINE}`,
        background: "white",
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: "0.12em", textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: INK, marginTop: 4, letterSpacing: "-0.01em" }}>{value}</div>
      {sub ? (
        <div style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>{sub}</div>
      ) : null}
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li style={{ margin: "0 0 10px", lineHeight: 1.6, color: INK }}>{children}</li>
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
        fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 880,
          margin: "0 auto",
          padding: "44px 24px 96px",
        }}
      >
        {/* Confidentiality bar */}
        <div
          style={{
            background: NAVY,
            color: "white",
            borderRadius: 12,
            padding: "10px 16px",
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.04em",
          }}
        >
          <span style={{ color: GOLD }}>● PRIVATE — INVESTOR USE ONLY</span>
          <span style={{ color: "rgba(255,255,255,0.7)" }}>Confidential. Do not distribute.</span>
        </div>

        {/* Hero */}
        <header style={{ padding: "40px 0 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 36,
                height: 36,
                borderRadius: 10,
                background: NAVY,
                color: "white",
                fontWeight: 800,
                letterSpacing: "0.04em",
              }}
            >
              Z
            </span>
            <span style={{ fontWeight: 800, letterSpacing: "0.18em", color: INK }}>ZENIVA</span>
          </div>
          <h1
            style={{
              margin: "0 0 14px",
              fontSize: 44,
              lineHeight: 1.08,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: INK,
            }}
          >
            Zeniva — the AI travel technology platform
          </h1>
          <p style={{ margin: "0 0 6px", fontSize: 18, lineHeight: 1.55, color: MUTED }}>
            Lina, our AI concierge, plans and books real flights, hotels, yachts and villas in seconds — operated end-to-end on a software platform, fulfilled by third-party suppliers.
          </p>
          <p style={{ margin: 0, fontSize: 12, color: MUTED }}>
            Investor pitch · {formattedDate} · {LEGAL_OPERATOR} (Delaware, USA)
          </p>
        </header>

        <Section id="problem" eyebrow="Problem" title="Travel planning is still painful and high-friction">
          <ul style={{ paddingLeft: 18, margin: 0 }}>
            <Bullet>
              Multi-supplier trips (flights + hotels + transfers + activities) require 6-8 tools and hours of work, even for experienced travelers.
            </Bullet>
            <Bullet>
              Existing AI travel tools generate inspiration but stop at booking — they hand off to OTAs and disappear when something goes wrong.
            </Bullet>
            <Bullet>
              Traditional agencies charge fees, are slow and can't be reached at 2 a.m. when a flight cancels.
            </Bullet>
            <Bullet>
              Travelers want one place to chat, plan, book and get help — across destinations, languages and budgets.
            </Bullet>
          </ul>
        </Section>

        <Section id="solution" eyebrow="Solution" title="Lina AI — a concierge that plans and books, with humans on standby">
          <ul style={{ paddingLeft: 18, margin: 0 }}>
            <Bullet>
              <strong>Conversation-first:</strong> chat or voice in 7 languages, 24/7. Lina returns 3 personalized options in under 30 seconds.
            </Bullet>
            <Bullet>
              <strong>Real bookings:</strong> live inventory through Duffel (300+ airlines), LiteAPI (1.5M+ hotels), plus curated yacht, villa and cruise partners.
            </Bullet>
            <Bullet>
              <strong>Human escalation:</strong> &ldquo;parler à un humain&rdquo; routes to a senior advisor in minutes. Same brain handles the whole trip.
            </Bullet>
            <Bullet>
              <strong>Payments:</strong> Stripe + ZeniPay 0% installments — 25% deposit, balance through trip date.
            </Bullet>
            <Bullet>
              <strong>Platform-only positioning:</strong> Zeniva acts solely as a technology intermediary; supplier fulfilment is fully disclosed at checkout.
            </Bullet>
          </ul>
        </Section>

        <Section id="market" eyebrow="Market" title="Large, online-shifting, AI-native">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
            <Stat label="Global online travel" value="$833B" sub="2024 global online travel sales" />
            <Stat label="N. America TAM" value="$220B" sub="USA + Canada online leisure + business" />
            <Stat label="AI travel SOM" value="$8B+" sub="Conversational booking + concierge layer" />
          </div>
          <p style={{ margin: 0, lineHeight: 1.6, color: INK }}>
            US/CA travelers shifted to mobile-first booking; AI-native interfaces are the next disruption after meta-search and OTAs. Zeniva targets the high-AOV slice: luxury, multi-supplier, group and specialty (yacht, villa, cruise, wedding).
          </p>
        </Section>

        <Section id="product" eyebrow="Product" title="From conversation to confirmed booking, end-to-end">
          <ol style={{ paddingLeft: 18, margin: 0 }}>
            <Bullet>
              <strong>Discover:</strong> chat or voice on /chat or /call. Lina parses dates, group, budget, style.
            </Bullet>
            <Bullet>
              <strong>Compare:</strong> live multi-supplier search returns flights, hotels, ground, activities in one proposal.
            </Bullet>
            <Bullet>
              <strong>Book:</strong> traveler accepts a proposal; payment via Stripe or ZeniPay; supplier names disclosed on the confirmation.
            </Bullet>
            <Bullet>
              <strong>Travel:</strong> documents land in the traveler dashboard; Lina + advisor handle changes mid-trip.
            </Bullet>
            <Bullet>
              <strong>Loyalty:</strong> referral and ZeniGroup pricing pull travelers back per cohort.
            </Bullet>
          </ol>
        </Section>

        <Section id="why-now" eyebrow="Why now" title="LLMs finally close the booking loop">
          <ul style={{ paddingLeft: 18, margin: 0 }}>
            <Bullet>
              Production-grade tool calling makes &ldquo;plan + book + support&rdquo; a single conversation for the first time.
            </Bullet>
            <Bullet>
              Supplier APIs (Duffel, LiteAPI, etc.) are finally programmable end-to-end with NDC fares and instant confirmations.
            </Bullet>
            <Bullet>
              Consumer comfort with chat-first commerce has crossed the chasm post-2024.
            </Bullet>
            <Bullet>
              Embedded payment platforms (Stripe + installments) remove the last friction point at checkout.
            </Bullet>
          </ul>
        </Section>

        <Section id="business" eyebrow="Business model" title="Commission + take-rate, with installment fees">
          <ul style={{ paddingLeft: 18, margin: 0 }}>
            <Bullet>
              <strong>Supplier commission</strong> on every booking (8-25% depending on vertical — yacht and villa highest).
            </Bullet>
            <Bullet>
              <strong>ZeniPay installment fee</strong> on plans (small spread on the financing).
            </Bullet>
            <Bullet>
              <strong>B2B platform fee</strong> from agencies using the Lina + CRM stack via /for-agencies.
            </Bullet>
            <Bullet>
              <strong>No customer-facing booking fee</strong> on the consumer site — increases conversion and fits the &ldquo;technology platform&rdquo; positioning.
            </Bullet>
          </ul>
        </Section>

        <Section id="traction" eyebrow="Traction" title="Live product, expanding distribution">
          <ul style={{ paddingLeft: 18, margin: 0 }}>
            <Bullet>
              Lina concierge in production on zenivatravel.com with chat + voice (Groq + Google) in 6 languages.
            </Bullet>
            <Bullet>
              Booking pipeline live across flights (Duffel), hotels (LiteAPI), yachts (36-boat South-Florida fleet), villas, cruises.
            </Bullet>
            <Bullet>
              SEO footprint: 88+ indexed URLs, 22 new geo/intent landing pages, IndexNow auto-push.
            </Bullet>
            <Bullet>
              Paid acquisition piloted at $100/day in NYC; landing on /packages.
            </Bullet>
            <Bullet>
              Social presence (TikTok, IG, FB, X, LinkedIn) driving top-of-funnel for Lina.
            </Bullet>
          </ul>
        </Section>

        <Section id="moat" eyebrow="Moat" title="Data + relationships compound over time">
          <ul style={{ paddingLeft: 18, margin: 0 }}>
            <Bullet>
              Proprietary trip-intent dataset trains better proposal ranking than generic LLM agents.
            </Bullet>
            <Bullet>
              Direct supplier relationships (yacht, villa, all-inclusive operators) gate inventory not available through OTAs.
            </Bullet>
            <Bullet>
              ZeniPay installment infrastructure shifts wallet share away from card-only competitors.
            </Bullet>
            <Bullet>
              Bilingual EN/FR product opens markets (Quebec, France, Caribbean francophone) that English-only AI agents can&apos;t serve.
            </Bullet>
          </ul>
        </Section>

        <Section id="competition" eyebrow="Competition" title="Itinerary builders, OTAs, and AI bolts-ons">
          <ul style={{ paddingLeft: 18, margin: 0 }}>
            <Bullet>
              <strong>Layla, Mindtrip, Wonderplan, Roam Around:</strong> generate inspiration, hand off to Booking.com — no booking ownership, no human escalation.
            </Bullet>
            <Bullet>
              <strong>Hopper, Kayak AI, Penny:</strong> price-prediction and meta-search inside an OTA — locked inventory, narrow scope.
            </Bullet>
            <Bullet>
              <strong>Traditional agencies / TMCs:</strong> human-only, slow, fee-heavy, not 24/7.
            </Bullet>
            <Bullet>
              <strong>Zeniva:</strong> the only platform that combines AI-first chat, real bookings, human safety net, multilingual support and specialty inventory in one product.
            </Bullet>
          </ul>
        </Section>

        <Section id="team" eyebrow="Team" title="Operator-led, technology-first">
          <ul style={{ paddingLeft: 18, margin: 0 }}>
            <Bullet>
              <strong>Founder & CEO:</strong> Alexandre — full-stack operator, builds + ships product end-to-end.
            </Bullet>
            <Bullet>
              <strong>Lina (AI concierge):</strong> in-house assistant, multilingual, voice-enabled.
            </Bullet>
            <Bullet>
              <strong>Senior advisors:</strong> human escalation team backing every AI booking 24/7.
            </Bullet>
            <Bullet>
              <strong>Hiring:</strong> growth engineer, partnerships lead (yacht/villa), brand designer.
            </Bullet>
          </ul>
        </Section>

        <Section id="ask" eyebrow="The ask" title="Seed round to extend distribution and data lead">
          <div
            style={{
              borderRadius: 16,
              border: `1px solid ${HAIRLINE}`,
              padding: 22,
              background: "white",
            }}
          >
            <p style={{ margin: "0 0 12px", fontSize: 16, color: INK }}>
              Capital used to (a) scale paid acquisition in proven channels, (b) deepen direct supplier relationships in yacht/villa/cruise, (c) ship the agency B2B SaaS and (d) build the data flywheel that compounds Lina&apos;s ranking quality.
            </p>
            <ul style={{ paddingLeft: 18, margin: 0 }}>
              <Bullet>Use of funds: ~50% growth, ~30% product/AI, ~20% partnerships & ops.</Bullet>
              <Bullet>Milestones: bookings volume, supplier roster, advisor coverage, B2B agency pilots.</Bullet>
              <Bullet>Round details, KPIs and data room available on request — direct contact only.</Bullet>
            </ul>
          </div>
        </Section>

        <Section id="contact" eyebrow="Contact" title="Direct line">
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6 }}>
            Founder · Alexandre &nbsp;·&nbsp;{" "}
            <a href="mailto:info@zeniva.ca" style={{ color: BLUE, fontWeight: 700 }}>
              info@zeniva.ca
            </a>{" "}
            &nbsp;·&nbsp; +1 (332) 290-0021
          </p>
          <p style={{ margin: "8px 0 0", fontSize: 13, color: MUTED }}>
            Materials shared under NDA on request.
          </p>
        </Section>

        <footer
          style={{
            borderTop: `1px solid ${HAIRLINE}`,
            marginTop: 40,
            paddingTop: 24,
            fontSize: 11,
            color: MUTED,
            lineHeight: 1.6,
          }}
        >
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
