import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Zeniva — KI-Reisebüro | Lina AI 24/7",
  description: "Zeniva ist ein KI-Reisebüro mit Sitz in den USA. Lina AI plant und bucht Luxusreisen, individuelle Urlaube, Yachtcharter, Villen und Kreuzfahrten. Service auf Deutsch 24/7.",
  keywords: ["KI Reisebüro", "AI Reisebüro", "Lina AI", "Luxusreisen", "individuelle Urlaube", "Reisekonzierge", "Yachtcharter", "Villenmiete", "Kreuzfahrt"],
  alternates: {
    canonical: "https://www.zenivatravel.com/de",
    languages: {
      "en-US": "https://www.zenivatravel.com",
      "fr-CA": "https://www.zenivatravel.com/fr",
      "es": "https://www.zenivatravel.com/es",
      "pt": "https://www.zenivatravel.com/pt",
      "de": "https://www.zenivatravel.com/de",
    },
  },
  openGraph: {
    title: "Zeniva — KI-Reisebüro",
    description: "Lina AI plant und bucht Ihre komplette Reise. Flüge, Hotels, Yachten, Villen, Kreuzfahrten. Service auf Deutsch 24/7.",
    url: "https://www.zenivatravel.com/de", siteName: "Zeniva Travel", locale: "de_DE", type: "website",
    images: [{ url: "/branding/lina-avatar.png", width: 1200, height: 630, alt: "Zeniva — Lina AI" }],
  },
};

export default function HomeDE() {
  const jsonLd = { "@context": "https://schema.org", "@type": "TravelAgency", name: "Zeniva", url: "https://www.zenivatravel.com/de", description: "KI-Reisebüro mit Sitz in den USA. Lina AI rund um die Uhr auf Deutsch.", inLanguage: "de", areaServed: ["Deutschland", "Österreich", "Schweiz", "United States"] };

  return (
    <main style={{ minHeight: "100vh", background: "#F8FAFF", padding: "24px", maxWidth: 1100, margin: "0 auto", fontFamily: "system-ui, sans-serif", color: "#0f172a" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: "1px solid #e2e8f0", marginBottom: 32 }}>
        <Link href="/de" style={{ fontSize: 22, fontWeight: 800, color: "#0B1B4D", textDecoration: "none" }}>Zeniva</Link>
        <nav style={{ display: "flex", gap: 16, fontSize: 14 }}>
          <Link href="/de/services/ai-travel-agent" style={{ color: "#475569", textDecoration: "none" }}>Dienste</Link>
          <Link href="/chat" style={{ color: "#475569", textDecoration: "none" }}>Mit Lina chatten</Link>
          <Link href="/" style={{ color: "#0F6CF5", textDecoration: "none" }}>EN</Link>
          <Link href="/fr" style={{ color: "#0F6CF5", textDecoration: "none" }}>FR</Link>
          <Link href="/es" style={{ color: "#0F6CF5", textDecoration: "none" }}>ES</Link>
        </nav>
      </header>

      <section style={{ textAlign: "center", padding: "48px 16px 64px" }}>
        <div style={{ display: "inline-block", background: "#FEF3C7", color: "#92400E", padding: "6px 16px", borderRadius: 999, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 20 }}>KI-Reisebüro · USA</div>
        <h1 style={{ fontSize: "clamp(32px, 6vw, 56px)", fontWeight: 900, color: "#0B1B4D", lineHeight: 1.1, margin: "0 0 20px" }}>Ihre Reise, geplant und gebucht von KI — mit menschlicher Unterstützung 24/7</h1>
        <p style={{ fontSize: 18, color: "#475569", lineHeight: 1.6, maxWidth: 720, margin: "0 auto 32px" }}>Sagen Sie Lina, wohin Sie reisen möchten. Sie erstellt einen kompletten Vorschlag mit Flügen, Hotel und Transfers — alles in Sekunden gebucht. Wenn Sie einen Menschen brauchen, schreiben Sie "Ich möchte mit einem Menschen sprechen" und ein echter Berater übernimmt.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/chat?prompt=Ich+möchte+eine+Reise+planen" style={{ background: "linear-gradient(90deg, #0F6CF5, #0B1B4D)", color: "white", padding: "16px 32px", borderRadius: 14, textDecoration: "none", fontWeight: 800, fontSize: 16 }}>💬 Mit Lina chatten — Kostenlos</Link>
          <Link href="/call" style={{ background: "white", color: "#0B1B4D", padding: "16px 32px", borderRadius: 14, textDecoration: "none", fontWeight: 800, fontSize: 16, border: "2px solid #0B1B4D" }}>📞 Anruf 24/7</Link>
        </div>
      </section>

      <section style={{ padding: "32px 0" }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: "#0B1B4D", marginBottom: 16 }}>Was Zeniva einzigartig macht</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {[
            { title: "Echte Buchungen, nicht nur Reisepläne", desc: "Anders als kostenlose KI-Planer bucht Zeniva Flüge (Duffel) und Hotels (LiteAPI mit über 1,5 Mio. Unterkünften) direkt." },
            { title: "Menschliche Eskalation 24/7", desc: "Schreiben Sie jederzeit 'Ich möchte mit einem Menschen sprechen' — ein echter Reiseberater übernimmt sofort." },
            { title: "Spezialreisen", desc: "Yachtcharter, Privatvillen, Kreuzfahrten und Hochzeiten am Ziel — Kategorien, die die meisten KI-Agenturen nicht abdecken." },
            { title: "Mehrsprachig automatisch", desc: "Lina erkennt Ihre Sprache und antwortet auf Deutsch, Englisch, Französisch oder Spanisch." },
            { title: "Sprachanrufe 24/7", desc: "Sprechen Sie per Sprache mit Lina unter /call. Verfügbar rund um die Uhr." },
            { title: "ZeniPay Zahlungspläne", desc: "Teilen Sie Ihre Buchung in Raten zu 0% Zinsen auf. In USD oder EUR." },
          ].map((item, i) => (
            <div key={i} style={{ background: "white", padding: 24, borderRadius: 16, border: "1px solid #e2e8f0" }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: "#0B1B4D", margin: "0 0 8px" }}>{item.title}</h3>
              <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "32px 0" }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: "#0B1B4D", marginBottom: 16 }}>Hauptdienste</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          {[
            { icon: "🤖", title: "KI-Reiseberater", href: "/de/services/ai-travel-agent" },
            { icon: "✨", title: "Luxusreisen", href: "/de/services/luxury-travel" },
            { icon: "🛥️", title: "Yachtcharter", href: "/de/services/yacht-charter" },
            { icon: "✈️", title: "Flüge", href: "/search/flights" },
            { icon: "🏨", title: "Hotels", href: "/partners/resorts" },
            { icon: "🏖️", title: "Pakete", href: "/packages" },
            { icon: "💬", title: "Chat mit Lina", href: "/chat" },
            { icon: "🚢", title: "Kreuzfahrten", href: "/services/cruises" },
          ].map((s, i) => (
            <Link key={i} href={s.href} style={{ background: "white", padding: 20, borderRadius: 14, border: "1px solid #e2e8f0", textDecoration: "none", color: "inherit", textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#0B1B4D" }}>{s.title}</div>
            </Link>
          ))}
        </div>
      </section>

      <footer style={{ borderTop: "1px solid #e2e8f0", padding: "24px 0", marginTop: 32, fontSize: 14, color: "#475569", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>© 2026 Zeniva LLC · Delaware, USA</div>
        <div style={{ display: "flex", gap: 16 }}>
          <Link href="/" style={{ color: "#475569" }}>English</Link>
          <Link href="/fr" style={{ color: "#475569" }}>Français</Link>
          <Link href="/es" style={{ color: "#475569" }}>Español</Link>
          <Link href="/pt" style={{ color: "#475569" }}>Português</Link>
        </div>
      </footer>
    </main>
  );
}
