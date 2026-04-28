import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Zeniva — Agenzia di viaggi con IA | Lina AI 24/7",
  description: "Zeniva è un'agenzia di viaggi con intelligenza artificiale con sede negli Stati Uniti. Lina AI pianifica e prenota viaggi di lusso, vacanze su misura, charter di yacht, ville e crociere. Servizio in italiano 24/7.",
  keywords: ["agenzia viaggi IA", "agenzia viaggi intelligenza artificiale", "Lina AI", "viaggi di lusso", "vacanze su misura", "concierge viaggi", "noleggio yacht", "affitto villa", "crociere"],
  alternates: {
    canonical: "https://www.zenivatravel.com/it",
    languages: {
      "en-US": "https://www.zenivatravel.com",
      "fr-CA": "https://www.zenivatravel.com/fr",
      "es": "https://www.zenivatravel.com/es",
      "pt": "https://www.zenivatravel.com/pt",
      "de": "https://www.zenivatravel.com/de",
      "it": "https://www.zenivatravel.com/it",
    },
  },
  openGraph: {
    title: "Zeniva — Agenzia di viaggi con IA",
    description: "Lina AI pianifica e prenota il tuo viaggio completo. Voli, hotel, yacht, ville, crociere. Servizio in italiano 24/7.",
    url: "https://www.zenivatravel.com/it", siteName: "Zeniva Travel", locale: "it_IT", type: "website",
    images: [{ url: "/branding/lina-avatar.png", width: 1200, height: 630, alt: "Zeniva — Lina AI" }],
  },
};

export default function HomeIT() {
  const jsonLd = { "@context": "https://schema.org", "@type": "TravelAgency", name: "Zeniva", url: "https://www.zenivatravel.com/it", description: "Agenzia di viaggi con IA con sede negli USA. Lina AI 24/7 in italiano.", inLanguage: "it", areaServed: ["Italia", "Svizzera", "United States"] };

  return (
    <main style={{ minHeight: "100vh", background: "#F8FAFF", padding: "24px", maxWidth: 1100, margin: "0 auto", fontFamily: "system-ui, sans-serif", color: "#0f172a" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: "1px solid #e2e8f0", marginBottom: 32 }}>
        <Link href="/it" style={{ fontSize: 22, fontWeight: 800, color: "#0B1B4D", textDecoration: "none" }}>Zeniva</Link>
        <nav style={{ display: "flex", gap: 16, fontSize: 14 }}>
          <Link href="/it/services/ai-travel-agent" style={{ color: "#475569", textDecoration: "none" }}>Servizi</Link>
          <Link href="/chat" style={{ color: "#475569", textDecoration: "none" }}>Chatta con Lina</Link>
          <Link href="/" style={{ color: "#0F6CF5", textDecoration: "none" }}>EN</Link>
          <Link href="/fr" style={{ color: "#0F6CF5", textDecoration: "none" }}>FR</Link>
          <Link href="/es" style={{ color: "#0F6CF5", textDecoration: "none" }}>ES</Link>
        </nav>
      </header>

      <section style={{ textAlign: "center", padding: "48px 16px 64px" }}>
        <div style={{ display: "inline-block", background: "#FEF3C7", color: "#92400E", padding: "6px 16px", borderRadius: 999, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 20 }}>Agenzia viaggi IA · USA</div>
        <h1 style={{ fontSize: "clamp(32px, 6vw, 56px)", fontWeight: 900, color: "#0B1B4D", lineHeight: 1.1, margin: "0 0 20px" }}>Il tuo viaggio, pianificato e prenotato dall'IA — con supporto umano 24/7</h1>
        <p style={{ fontSize: 18, color: "#475569", lineHeight: 1.6, maxWidth: 720, margin: "0 auto 32px" }}>Dì a Lina dove vuoi andare, lei costruisce una proposta completa con voli, hotel e trasferimenti — tutto prenotato in pochi secondi. Se hai bisogno di un umano, scrivi "voglio parlare con un umano" e un consulente reale prende in carico.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/chat?prompt=Voglio+pianificare+un+viaggio" style={{ background: "linear-gradient(90deg, #0F6CF5, #0B1B4D)", color: "white", padding: "16px 32px", borderRadius: 14, textDecoration: "none", fontWeight: 800, fontSize: 16 }}>💬 Chatta con Lina — Gratis</Link>
          <Link href="/call" style={{ background: "white", color: "#0B1B4D", padding: "16px 32px", borderRadius: 14, textDecoration: "none", fontWeight: 800, fontSize: 16, border: "2px solid #0B1B4D" }}>📞 Chiamata 24/7</Link>
        </div>
      </section>

      <section style={{ padding: "32px 0" }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: "#0B1B4D", marginBottom: 16 }}>Cosa rende Zeniva diverso</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {[
            { title: "Prenotazioni reali, non solo itinerari", desc: "A differenza dei pianificatori IA gratuiti, Zeniva prenota voli (Duffel) e hotel (LiteAPI con +1.5M proprietà) direttamente." },
            { title: "Escalation umana 24/7", desc: "Scrivi 'voglio parlare con un umano' in qualsiasi momento — un consulente reale prende in carico immediatamente." },
            { title: "Viaggi specializzati", desc: "Charter di yacht, ville private, crociere e matrimoni a destinazione — categorie che la maggior parte delle agenzie IA non copre." },
            { title: "Multilingue automatico", desc: "Lina rileva la tua lingua e risponde in italiano, inglese, francese o spagnolo." },
            { title: "Chiamate vocali 24/7", desc: "Parla con Lina via voce su /call. Disponibile 24 ore su 24, tutti i giorni." },
            { title: "Piani di pagamento ZeniPay", desc: "Dividi la tua prenotazione in rate a 0% di interesse. In USD o EUR." },
          ].map((item, i) => (
            <div key={i} style={{ background: "white", padding: 24, borderRadius: 16, border: "1px solid #e2e8f0" }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: "#0B1B4D", margin: "0 0 8px" }}>{item.title}</h3>
              <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "32px 0" }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: "#0B1B4D", marginBottom: 16 }}>Servizi principali</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          {[
            { icon: "🤖", title: "Agente di viaggi IA", href: "/it/services/ai-travel-agent" },
            { icon: "✨", title: "Viaggi di lusso", href: "/it/services/luxury-travel" },
            { icon: "🛥️", title: "Charter yacht", href: "/services/yacht-charter" },
            { icon: "🚢", title: "Crociere", href: "/services/cruises" },
            { icon: "✈️", title: "Voli", href: "/search/flights" },
            { icon: "🏨", title: "Hotel", href: "/partners/resorts" },
            { icon: "🏖️", title: "Pacchetti", href: "/packages" },
            { icon: "💬", title: "Chat con Lina", href: "/chat" },
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
          <Link href="/de" style={{ color: "#475569" }}>Deutsch</Link>
        </div>
      </footer>
    </main>
  );
}
