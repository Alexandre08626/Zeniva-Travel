import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Press Kit — Zeniva & Lina AI | Media Resources",
  description: "Press kit for Zeniva and Lina AI. Logos, brand assets, executive bios, fact sheet, screenshots. For journalists, podcasters, content creators covering AI travel.",
  keywords: ["Zeniva press kit", "Lina AI press", "Zeniva media kit", "Zeniva fact sheet", "AI travel agency press"],
  openGraph: { title: "Zeniva & Lina AI Press Kit", description: "Media resources for journalists and content creators.", url: "https://www.zenivatravel.com/press", siteName: "Zeniva Travel", type: "article", images: [{ url: "/branding/lina-avatar.png", width: 1200, height: 630, alt: "Zeniva press kit" }] },
  alternates: { canonical: "https://www.zenivatravel.com/press" },
};

export default function PressPage() {
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Zeniva Travel",
    legalName: "Zeniva LLC",
    foundingDate: "2024",
    foundingLocation: { "@type": "Place", name: "Delaware, USA" },
    founder: { "@type": "Person", name: "Alexandre", jobTitle: "President" },
    description: "Zeniva is a US-based AI travel agency. Lina AI is its 24/7 multilingual concierge.",
    url: "https://www.zenivatravel.com",
    logo: "https://www.zenivatravel.com/branding/logo.png",
    sameAs: [
      "https://www.tiktok.com/@zeniva.travel",
      "https://www.instagram.com/zeniva_travel/",
      "https://www.facebook.com/p/Zeniva-61557743041715/",
      "https://x.com/ZenivaLina",
      "https://www.linkedin.com/company/zeniva-lina/",
    ],
    contactPoint: { "@type": "ContactPoint", email: "info@zeniva.ca", contactType: "media" },
  };

  return (
    <main style={{ minHeight: "100vh", background: "#F8FAFF", padding: 24, maxWidth: 1100, margin: "0 auto", fontFamily: "system-ui, sans-serif", color: "#0f172a" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
      <header style={{ padding: "16px 0", borderBottom: "1px solid #e2e8f0", marginBottom: 32 }}>
        <Link href="/" style={{ fontSize: 22, fontWeight: 800, color: "#0B1B4D", textDecoration: "none" }}>Zeniva</Link>
      </header>

      <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 900, color: "#0B1B4D", marginBottom: 12 }}>Zeniva & Lina AI — Press Kit</h1>
      <p style={{ fontSize: 17, color: "#475569", lineHeight: 1.7, marginBottom: 32 }}>
        Resources for journalists, podcasters, YouTubers, and content creators covering Zeniva and Lina AI. Everything below is freely usable with attribution. For interview requests or custom asset needs, email <a href="mailto:info@zeniva.ca" style={{ color: "#0F6CF5" }}>info@zeniva.ca</a>.
      </p>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0B1B4D", marginBottom: 12 }}>One-line description</h2>
        <p style={{ background: "white", padding: 16, borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 15, color: "#334155" }}>
          Zeniva is a US-based AI travel agency where Lina AI plans and books real trips — flights, hotels, yachts, villas, cruises — across 7 languages with 24/7 human travel advisor escalation.
        </p>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0B1B4D", marginBottom: 12 }}>Fact sheet</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", background: "white", borderRadius: 10, overflow: "hidden" }}>
          <tbody>
            {[
              ["Company name", "Zeniva LLC"],
              ["Brand", "Zeniva (consumer-facing) · Lina AI (the agent)"],
              ["Founded", "2024"],
              ["Incorporation", "Delaware, USA"],
              ["Offices", "Delaware (HQ) · New York · Virginia (Williamsburg)"],
              ["Founder & President", "Alexandre"],
              ["Industry", "Travel · AI · Travel Technology"],
              ["AI model", "Built on Anthropic Claude"],
              ["Booking partners", "Duffel (flights, 300+ airlines) · LiteAPI (1.5M+ hotels)"],
              ["Languages supported", "English, French, Spanish, Portuguese, German, Italian, Japanese, Chinese, Korean, Arabic, Dutch (11 native)"],
              ["Service area", "USA + Canada (priority) · Worldwide"],
              ["Currencies", "USD, CAD, EUR, GBP, MXN, BRL, AUD, JPY, AED, SGD"],
              ["Customer fees", "$0 — Zeniva earns supplier commissions"],
              ["Specialty travel", "Yacht charter · Private villa · Cruise · Destination weddings"],
              ["Customer support", "24/7 human escalation in 6 languages"],
              ["Average rating", "4.9 / 5 from 47 verified travelers"],
              ["Website", "zenivatravel.com"],
              ["Press contact", "info@zeniva.ca"],
            ].map(([k, v], i) => (
              <tr key={i} style={{ borderBottom: i < 17 ? "1px solid #e2e8f0" : "none" }}>
                <td style={{ padding: "10px 16px", fontWeight: 700, color: "#0B1B4D", verticalAlign: "top", width: "30%" }}>{k}</td>
                <td style={{ padding: "10px 16px", color: "#475569", fontSize: 14 }}>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0B1B4D", marginBottom: 12 }}>Brand assets</h2>
        <p style={{ color: "#475569", marginBottom: 16 }}>Free to use with attribution to Zeniva Travel.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          <div style={{ background: "white", padding: 16, borderRadius: 10, border: "1px solid #e2e8f0", textAlign: "center" }}>
            <img src="/branding/logo.png" alt="Zeniva logo" style={{ height: 48, marginBottom: 8 }} />
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0B1B4D" }}>Logo (PNG)</div>
            <a href="/branding/logo.png" download style={{ fontSize: 12, color: "#0F6CF5" }}>Download</a>
          </div>
          <div style={{ background: "white", padding: 16, borderRadius: 10, border: "1px solid #e2e8f0", textAlign: "center" }}>
            <img src="/branding/lina-avatar.png" alt="Lina avatar" style={{ height: 64, marginBottom: 8, borderRadius: "50%" }} />
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0B1B4D" }}>Lina avatar</div>
            <a href="/branding/lina-avatar.png" download style={{ fontSize: 12, color: "#0F6CF5" }}>Download</a>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0B1B4D", marginBottom: 12 }}>Story angles</h2>
        <ul style={{ background: "white", padding: "16px 32px", borderRadius: 10, border: "1px solid #e2e8f0", color: "#334155", lineHeight: 1.9 }}>
          <li><strong>"AI agents that actually book trips"</strong> — Most "AI travel agents" are itinerary generators. Lina is the agent that turns research into a confirmed reservation with human safety net.</li>
          <li><strong>"The real architecture of an AI travel concierge"</strong> — Claude LLM + Duffel + LiteAPI + 24/7 human escalation. Honest technical breakdown at /lina/how-it-works.</li>
          <li><strong>"Why 'Lina' has a personality (and why it matters)"</strong> — Brand persona design for a $5,000+ trip transaction. Why we chose warm-but-direct over robotic.</li>
          <li><strong>"AI travel agency vs ChatGPT"</strong> — The gap between "research with LLM" and "book with agency". Real-world examples at /compare/zeniva-vs-chatgpt-for-travel.</li>
          <li><strong>"Multilingual AI for travel"</strong> — Why a French-Canadian booking from Quebec to Cuba is different from a French-French booking from Paris to Maldives — and why Lina handles both natively.</li>
          <li><strong>"The rise of AI-first US travel agencies"</strong> — Zeniva as a case study of post-2024 US travel agency formation built around AI from day one.</li>
        </ul>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0B1B4D", marginBottom: 12 }}>Suggested screenshots</h2>
        <p style={{ color: "#475569", marginBottom: 8 }}>For visuals in your story, point to:</p>
        <ul style={{ background: "white", padding: "16px 32px", borderRadius: 10, border: "1px solid #e2e8f0", color: "#334155", lineHeight: 1.9 }}>
          <li><a href="/chat" style={{ color: "#0F6CF5" }}>Lina chat interface</a> — main conversation view</li>
          <li><a href="/lina" style={{ color: "#0F6CF5" }}>Meet Lina page</a> — brand/avatar showcase</li>
          <li><a href="/packages" style={{ color: "#0F6CF5" }}>NYC packages</a> — booking surface example</li>
          <li><a href="/lina/reviews" style={{ color: "#0F6CF5" }}>Lina reviews</a> — social proof</li>
          <li><a href="/compare/zeniva-vs-chatgpt-for-travel" style={{ color: "#0F6CF5" }}>vs ChatGPT comparison</a> — positioning</li>
        </ul>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0B1B4D", marginBottom: 12 }}>Social media</h2>
        <ul style={{ background: "white", padding: "16px 32px", borderRadius: 10, border: "1px solid #e2e8f0", color: "#334155", lineHeight: 1.9 }}>
          <li><strong>TikTok:</strong> <a href="https://www.tiktok.com/@zeniva.travel" style={{ color: "#0F6CF5" }}>@zeniva.travel</a></li>
          <li><strong>Instagram:</strong> <a href="https://www.instagram.com/zeniva_travel/" style={{ color: "#0F6CF5" }}>@zeniva_travel</a></li>
          <li><strong>Facebook:</strong> <a href="https://www.facebook.com/p/Zeniva-61557743041715/" style={{ color: "#0F6CF5" }}>Zeniva page</a></li>
          <li><strong>X (Twitter):</strong> <a href="https://x.com/ZenivaLina" style={{ color: "#0F6CF5" }}>@ZenivaLina</a></li>
          <li><strong>LinkedIn:</strong> <a href="https://www.linkedin.com/company/zeniva-lina/" style={{ color: "#0F6CF5" }}>Zeniva Lina</a></li>
        </ul>
      </section>

      <section style={{ marginBottom: 40, background: "#0B1B4D", color: "white", padding: 24, borderRadius: 14 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Press contact</h2>
        <p style={{ marginBottom: 4, opacity: 0.9 }}>Email: <a href="mailto:info@zeniva.ca" style={{ color: "white", textDecoration: "underline" }}>info@zeniva.ca</a></p>
        <p style={{ marginBottom: 0, opacity: 0.9 }}>Response time: typically within 24 hours.</p>
      </section>
    </main>
  );
}
