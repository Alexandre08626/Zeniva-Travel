import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Zeniva — AI Reisbureau | Lina AI 24/7",
  description: "Zeniva is een AI-reisbureau gevestigd in de VS. Lina AI plant en boekt luxe reizen, op maat gemaakte vakanties, jachtcharter, villa's en cruises. Service in het Nederlands 24/7.",
  keywords: ["AI reisbureau", "AI reisconciërge", "Lina AI", "luxe reizen", "op maat gemaakte vakanties", "jachtcharter", "villa verhuur"],
  alternates: { canonical: "https://www.zenivatravel.com/nl", languages: { "en-US": "https://www.zenivatravel.com", "nl": "https://www.zenivatravel.com/nl" } },
  openGraph: { title: "Zeniva — AI Reisbureau", description: "Lina AI plant en boekt je hele reis. Nederlands 24/7.", url: "https://www.zenivatravel.com/nl", siteName: "Zeniva Travel", locale: "nl_NL", type: "website", images: [{ url: "/branding/lina-avatar.png", width: 1200, height: 630, alt: "Zeniva Lina AI" }] },
};

export default function HomeNL() {
  const jsonLd = { "@context": "https://schema.org", "@type": "TravelAgency", name: "Zeniva", url: "https://www.zenivatravel.com/nl", description: "AI-reisbureau gevestigd in de VS. Lina AI 24/7 in het Nederlands.", inLanguage: "nl", areaServed: ["Netherlands", "Belgium", "United States"] };
  return (
    <main lang="nl" style={{ minHeight: "100vh", background: "#F8FAFF", padding: 24, maxWidth: 1100, margin: "0 auto", fontFamily: "system-ui, sans-serif", color: "#0f172a" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: "1px solid #e2e8f0", marginBottom: 32 }}>
        <Link href="/nl" style={{ fontSize: 22, fontWeight: 800, color: "#0B1B4D", textDecoration: "none" }}>Zeniva</Link>
        <nav style={{ display: "flex", gap: 16, fontSize: 14 }}>
          <Link href="/nl/lina" style={{ color: "#475569", textDecoration: "none" }}>Ontmoet Lina</Link>
          <Link href="/chat" style={{ color: "#475569", textDecoration: "none" }}>Chat</Link>
          <Link href="/" style={{ color: "#0F6CF5", textDecoration: "none" }}>EN</Link>
        </nav>
      </header>
      <section style={{ textAlign: "center", padding: "48px 16px 64px" }}>
        <div style={{ display: "inline-block", background: "#FEF3C7", color: "#92400E", padding: "6px 16px", borderRadius: 999, fontSize: 12, fontWeight: 700, marginBottom: 20 }}>AI Reisbureau · VS</div>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 900, color: "#0B1B4D", lineHeight: 1.3, margin: "0 0 20px" }}>Jouw reis, gepland en geboekt door AI — met menselijke ondersteuning 24/7</h1>
        <p style={{ fontSize: 17, color: "#475569", lineHeight: 1.7, maxWidth: 720, margin: "0 auto 32px" }}>Vertel Lina waar je heen wilt, ze bouwt een compleet voorstel met vluchten, hotel en transfers — alles in seconden geboekt. Als je een mens nodig hebt, typ "ik wil met een mens praten" en een echte adviseur neemt het over.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/chat?prompt=Ik wil een reis plannen" style={{ background: "linear-gradient(90deg, #0F6CF5, #0B1B4D)", color: "white", padding: "16px 32px", borderRadius: 14, textDecoration: "none", fontWeight: 800, fontSize: 16 }}>💬 Chat met Lina — Gratis</Link>
          <Link href="/call" style={{ background: "white", color: "#0B1B4D", padding: "16px 32px", borderRadius: 14, textDecoration: "none", fontWeight: 800, fontSize: 16, border: "2px solid #0B1B4D" }}>📞 24/7 telefoon</Link>
        </div>
      </section>
      <section style={{ padding: "32px 0" }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: "#0B1B4D", marginBottom: 16 }}>Wat Zeniva anders maakt</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {[
            { t: "Echte boekingen", d: "Direct boeken via Duffel (vluchten) en LiteAPI (1,5M+ hotels)." },
            { t: "24/7 menselijke escalatie", d: "Typ \"ik wil met een mens praten\" — echte adviseur neemt het over." },
            { t: "Specialistische reizen", d: "Jachtcharter, privévilla's, cruises, bestemmingsbruiloften." },
            { t: "Meertalig automatisch", d: "Nederlands, Engels, Frans, Spaans, Portugees, Duits, Italiaans." },
            { t: "24/7 spraakoproepen", d: "Praat met Lina via spraak op /call." },
            { t: "ZeniPay betalingsplannen", d: "0% rente termijnbetalingen. Meerdere valuta." },
          ].map((x, i) => (
            <div key={i} style={{ background: "white", padding: 22, borderRadius: 14, border: "1px solid #e2e8f0" }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0B1B4D", margin: "0 0 8px" }}>{x.t}</h3>
              <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.7, margin: 0 }}>{x.d}</p>
            </div>
          ))}
        </div>
      </section>
      <footer style={{ borderTop: "1px solid #e2e8f0", padding: "24px 0", marginTop: 32, fontSize: 13, color: "#475569", textAlign: "center" }}>© 2026 Zeniva LLC · Delaware, USA</footer>
    </main>
  );
}
