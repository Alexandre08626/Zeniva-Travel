import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Zeniva — Agência de viagens com IA | Lina AI 24/7",
  description: "Zeniva é uma agência de viagens com inteligência artificial sediada nos EUA. Lina AI planeja e reserva viagens de luxo, férias personalizadas, charter de iates, vilas e cruzeiros. Atendimento em português 24/7.",
  keywords: [
    "agência de viagens IA", "agência viagens inteligência artificial", "Lina AI",
    "viagens de luxo", "férias personalizadas", "concierge viagens",
    "agência de viagens online", "viagens Cancún", "charter iate", "aluguel vila",
  ],
  alternates: {
    canonical: "https://www.zenivatravel.com/pt",
    languages: {
      "en-US": "https://www.zenivatravel.com",
      "fr-CA": "https://www.zenivatravel.com/fr",
      "es": "https://www.zenivatravel.com/es",
      "pt": "https://www.zenivatravel.com/pt",
    },
  },
  openGraph: {
    title: "Zeniva — Agência de viagens com IA",
    description: "Lina AI planeja e reserva sua viagem completa. Voos, hotéis, iates, vilas, cruzeiros. Atendimento em português 24/7.",
    url: "https://www.zenivatravel.com/pt",
    siteName: "Zeniva Travel",
    locale: "pt_BR",
    type: "website",
    images: [{ url: "/branding/lina-avatar.png", width: 1200, height: 630, alt: "Zeniva — Lina AI" }],
  },
};

export default function HomePT() {
  const jsonLd = { "@context": "https://schema.org", "@type": "TravelAgency", name: "Zeniva", url: "https://www.zenivatravel.com/pt", description: "Agência de viagens com IA sediada nos EUA. Lina AI atende 24/7 em português.", inLanguage: "pt", areaServed: ["Brasil", "Portugal", "United States"] };

  return (
    <main style={{ minHeight: "100vh", background: "#F8FAFF", padding: "24px", maxWidth: 1100, margin: "0 auto", fontFamily: "system-ui, sans-serif", color: "#0f172a" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: "1px solid #e2e8f0", marginBottom: 32 }}>
        <Link href="/pt" style={{ fontSize: 22, fontWeight: 800, color: "#0B1B4D", textDecoration: "none" }}>Zeniva</Link>
        <nav style={{ display: "flex", gap: 16, fontSize: 14 }}>
          <Link href="/pt/services/ai-travel-agent" style={{ color: "#475569", textDecoration: "none" }}>Serviços</Link>
          <Link href="/chat" style={{ color: "#475569", textDecoration: "none" }}>Conversar com Lina</Link>
          <Link href="/" style={{ color: "#0F6CF5", textDecoration: "none" }}>EN</Link>
          <Link href="/fr" style={{ color: "#0F6CF5", textDecoration: "none" }}>FR</Link>
          <Link href="/es" style={{ color: "#0F6CF5", textDecoration: "none" }}>ES</Link>
        </nav>
      </header>

      <section style={{ textAlign: "center", padding: "48px 16px 64px" }}>
        <div style={{ display: "inline-block", background: "#FEF3C7", color: "#92400E", padding: "6px 16px", borderRadius: 999, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 20 }}>Agência de viagens com IA</div>
        <h1 style={{ fontSize: "clamp(32px, 6vw, 56px)", fontWeight: 900, color: "#0B1B4D", lineHeight: 1.1, margin: "0 0 20px" }}>Sua viagem, planejada e reservada por IA — com suporte humano 24/7</h1>
        <p style={{ fontSize: 18, color: "#475569", lineHeight: 1.6, maxWidth: 720, margin: "0 auto 32px" }}>Conte para a Lina onde você quer ir, ela monta uma proposta completa com voos, hotel e transfers — tudo reservado em segundos. Se precisar de um humano, escreva "quero falar com um humano" e um consultor real assume o caso.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/chat?prompt=Quero+planejar+uma+viagem" style={{ background: "linear-gradient(90deg, #0F6CF5, #0B1B4D)", color: "white", padding: "16px 32px", borderRadius: 14, textDecoration: "none", fontWeight: 800, fontSize: 16 }}>💬 Conversar com Lina — Grátis</Link>
          <Link href="/call" style={{ background: "white", color: "#0B1B4D", padding: "16px 32px", borderRadius: 14, textDecoration: "none", fontWeight: 800, fontSize: 16, border: "2px solid #0B1B4D" }}>📞 Ligação 24/7</Link>
        </div>
      </section>

      <section style={{ padding: "32px 0" }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: "#0B1B4D", marginBottom: 16 }}>O que torna a Zeniva diferente</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {[
            { title: "Reservas reais, não só itinerários", desc: "Diferente dos planejadores de IA gratuitos, a Zeniva reserva voos (Duffel) e hotéis (LiteAPI com +1.5M propriedades) diretamente." },
            { title: "Suporte humano 24/7", desc: "Escreva 'quero falar com um humano' a qualquer momento — um consultor real de viagens assume o caso na hora." },
            { title: "Viagens especializadas", desc: "Charter de iates, vilas privadas, cruzeiros e casamentos no destino — categorias que a maioria das agências IA não cobre." },
            { title: "Multilíngue automático", desc: "Lina detecta seu idioma e responde em português, inglês, francês ou espanhol." },
            { title: "Ligações de voz 24/7", desc: "Fale com a Lina por voz em /call. Disponível 24 horas, todos os dias." },
            { title: "Planos de pagamento ZeniPay", desc: "Divida sua reserva em parcelas a 0% de juros. Em USD ou outras moedas." },
          ].map((item, i) => (
            <div key={i} style={{ background: "white", padding: 24, borderRadius: 16, border: "1px solid #e2e8f0" }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: "#0B1B4D", margin: "0 0 8px" }}>{item.title}</h3>
              <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "32px 0" }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: "#0B1B4D", marginBottom: 16 }}>Serviços principais</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          {[
            { icon: "🤖", title: "Agente de viagens IA", href: "/pt/services/ai-travel-agent" },
            { icon: "✨", title: "Viagens de luxo", href: "/pt/services/luxury-travel" },
            { icon: "🚢", title: "Cruzeiros", href: "/pt/services/cruises" },
            { icon: "✈️", title: "Voos", href: "/search/flights" },
            { icon: "🏨", title: "Hotéis", href: "/partners/resorts" },
            { icon: "🏖️", title: "Pacotes", href: "/packages" },
            { icon: "💬", title: "Chat com Lina", href: "/chat" },
            { icon: "🛥️", title: "Iates", href: "/zeniyacht" },
          ].map((s, i) => (
            <Link key={i} href={s.href} style={{ background: "white", padding: 20, borderRadius: 14, border: "1px solid #e2e8f0", textDecoration: "none", color: "inherit", textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#0B1B4D" }}>{s.title}</div>
            </Link>
          ))}
        </div>
      </section>

      <footer style={{ borderTop: "1px solid #e2e8f0", padding: "24px 0", marginTop: 32, fontSize: 14, color: "#475569", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>© 2026 Zeniva LLC · Delaware, EUA</div>
        <div style={{ display: "flex", gap: 16 }}>
          <Link href="/" style={{ color: "#475569" }}>English</Link>
          <Link href="/fr" style={{ color: "#475569" }}>Français</Link>
          <Link href="/es" style={{ color: "#475569" }}>Español</Link>
          <Link href="/de" style={{ color: "#475569" }}>Deutsch</Link>
        </div>
      </footer>
    </main>
  );
}
