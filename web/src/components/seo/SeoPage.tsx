import Link from "next/link";

const GOLD = "#E6B85A";
const BLUE = "#0F6CF5";
const NAVY = "#0B1B4D";

export type SeoFaq = { question: string; answer: string };
export type SeoSection = { heading: string; content: string; subSections?: { heading: string; content: string }[] };
export type SeoHighlight = { icon: string; title: string; description: string };

type Props = {
  h1: string;
  subtitle: string;
  heroImage: string;
  heroGradient?: string;
  badge?: string;
  sections: SeoSection[];
  highlights?: SeoHighlight[];
  faqs?: SeoFaq[];
  ctaText?: string;
  ctaPrompt?: string;
  internalLinks?: { label: string; href: string }[];
  jsonLd?: Record<string, unknown>;
};

export default function SeoPage({
  h1, subtitle, heroImage, heroGradient, badge, sections, highlights, faqs,
  ctaText = "Chat with Lina — It's Free", ctaPrompt = "I want to plan a trip",
  internalLinks, jsonLd,
}: Props) {
  const grad = heroGradient || "linear-gradient(135deg, #0B1B4D, #0F6CF5)";

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", color: "#0f172a" }}>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      {faqs && faqs.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map(f => ({
            "@type": "Question", name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }) }} />
      )}

      {/* Hero */}
      <section style={{ position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${heroImage})`, backgroundSize: "cover", backgroundPosition: "center", filter: "brightness(0.4)" }} />
        <div style={{ position: "absolute", inset: 0, background: grad, opacity: 0.7 }} />
        <div style={{ position: "relative", padding: "100px 24px 80px", textAlign: "center", maxWidth: 800, margin: "0 auto" }}>
          {badge && (
            <div style={{ display: "inline-block", background: "rgba(255,255,255,0.15)", borderRadius: 20, padding: "6px 16px", fontSize: 13, color: "white", fontWeight: 600, marginBottom: 20 }}>{badge}</div>
          )}
          <h1 style={{ fontSize: "clamp(28px,5vw,50px)", fontWeight: 900, color: "white", lineHeight: 1.1, marginBottom: 20 }}>{h1}</h1>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.85)", marginBottom: 36, lineHeight: 1.6, maxWidth: 640, margin: "0 auto 36px" }}>{subtitle}</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href={`/chat?prompt=${encodeURIComponent(ctaPrompt)}`} style={{ background: GOLD, color: NAVY, fontWeight: 800, fontSize: 16, padding: "16px 32px", borderRadius: 14, textDecoration: "none" }}>
              {ctaText}
            </Link>
            <Link href="/call" style={{ background: "rgba(255,255,255,0.15)", color: "white", fontWeight: 700, fontSize: 16, padding: "16px 32px", borderRadius: 14, textDecoration: "none", border: "1.5px solid rgba(255,255,255,0.3)" }}>
              Call Lina
            </Link>
          </div>
        </div>
      </section>

      {/* Highlights */}
      {highlights && highlights.length > 0 && (
        <section style={{ padding: "64px 24px", maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 20 }}>
            {highlights.map(h => (
              <div key={h.title} style={{ background: "#fff", borderRadius: 16, padding: "28px 20px", border: "1.5px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{h.icon}</div>
                <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 8, color: NAVY }}>{h.title}</h3>
                <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6 }}>{h.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Content Sections */}
      {sections.map((section, i) => (
        <section key={i} style={{ padding: "48px 24px", maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{ fontSize: 30, fontWeight: 800, marginBottom: 20, color: NAVY }}>{section.heading}</h2>
          <div style={{ fontSize: 16, lineHeight: 1.8, color: "#334155" }} dangerouslySetInnerHTML={{ __html: section.content }} />
          {section.subSections?.map((sub, j) => (
            <div key={j} style={{ marginTop: 28 }}>
              <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12, color: NAVY }}>{sub.heading}</h3>
              <div style={{ fontSize: 16, lineHeight: 1.8, color: "#334155" }} dangerouslySetInnerHTML={{ __html: sub.content }} />
            </div>
          ))}
        </section>
      ))}

      {/* FAQ */}
      {faqs && faqs.length > 0 && (
        <section style={{ padding: "48px 24px", maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{ fontSize: 30, fontWeight: 800, marginBottom: 28, color: NAVY }}>Frequently Asked Questions</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {faqs.map((faq, i) => (
              <details key={i} style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #e2e8f0", padding: "20px 24px", cursor: "pointer" }}>
                <summary style={{ fontSize: 17, fontWeight: 700, color: NAVY, listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  {faq.question} <span style={{ fontSize: 20, color: "#94a3b8" }}>+</span>
                </summary>
                <p style={{ marginTop: 12, fontSize: 15, lineHeight: 1.7, color: "#475569" }}>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Internal Links */}
      {internalLinks && internalLinks.length > 0 && (
        <section style={{ padding: "32px 24px 16px", maxWidth: 800, margin: "0 auto" }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#64748b", marginBottom: 12 }}>Explore More</h3>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {internalLinks.map(link => (
              <Link key={link.href} href={link.href} style={{ background: "#f1f5f9", color: BLUE, padding: "8px 16px", borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>
                {link.label} →
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section style={{ background: `linear-gradient(135deg, ${NAVY}, ${BLUE})`, padding: "64px 24px", textAlign: "center", marginTop: 40 }}>
        <h2 style={{ fontSize: 32, fontWeight: 900, color: "white", marginBottom: 16 }}>Ready to Plan Your Trip?</h2>
        <p style={{ fontSize: 17, color: "rgba(255,255,255,0.8)", marginBottom: 32, maxWidth: 500, margin: "0 auto 32px" }}>
          Talk to Lina, your AI travel concierge. She'll plan flights, hotels, and experiences in seconds — for free.
        </p>
        <Link href={`/chat?prompt=${encodeURIComponent(ctaPrompt)}`} style={{ display: "inline-block", background: GOLD, color: NAVY, fontWeight: 800, fontSize: 17, padding: "18px 40px", borderRadius: 14, textDecoration: "none" }}>
          {ctaText}
        </Link>
      </section>
    </main>
  );
}
