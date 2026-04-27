import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Zeniva — Agencia de viajes con IA en EE.UU. | Lina AI 24/7",
  description: "Zeniva es una agencia de viajes con IA en Estados Unidos. Lina AI planifica y reserva viajes de lujo, vacaciones a medida, charters de yates, villas y cruceros. Servicio en español 24/7.",
  keywords: [
    "agencia de viajes IA", "agencia viajes inteligencia artificial", "Lina AI",
    "viajes de lujo EE.UU.", "vacaciones a medida", "concierge viajes",
    "agencia de viajes Estados Unidos", "viajes Cancún desde EE.UU.",
    "charter de yate", "alquiler de villa", "cruceros 2026",
    "mejor agencia de viajes IA", "agencia viajes en español USA",
  ],
  alternates: {
    canonical: "https://www.zenivatravel.com/es",
    languages: {
      "en-US": "https://www.zenivatravel.com",
      "fr-CA": "https://www.zenivatravel.com/fr",
      "es": "https://www.zenivatravel.com/es",
    },
  },
  openGraph: {
    title: "Zeniva — Agencia de viajes con IA",
    description: "Lina AI planifica y reserva tu viaje completo. Vuelos, hoteles, yates, villas, cruceros. Servicio en español 24/7.",
    url: "https://www.zenivatravel.com/es",
    siteName: "Zeniva Travel",
    locale: "es_US",
    type: "website",
    images: [{ url: "/branding/lina-avatar.png", width: 1200, height: 630, alt: "Zeniva — Lina AI" }],
  },
};

export default function HomeES() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: "Zeniva",
    url: "https://www.zenivatravel.com/es",
    description: "Agencia de viajes con IA en Estados Unidos. Lina AI planifica y reserva viajes con servicio en español 24/7.",
    inLanguage: "es",
    areaServed: ["United States", "Mexico", "Spain", "Latin America"],
  };

  return (
    <main style={{ minHeight: "100vh", background: "#F8FAFF", padding: "24px", maxWidth: 1100, margin: "0 auto", fontFamily: "system-ui, sans-serif", color: "#0f172a" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: "1px solid #e2e8f0", marginBottom: 32 }}>
        <Link href="/es" style={{ fontSize: 22, fontWeight: 800, color: "#0B1B4D", textDecoration: "none" }}>Zeniva</Link>
        <nav style={{ display: "flex", gap: 16, fontSize: 14 }}>
          <Link href="/es/services/ai-travel-agent" style={{ color: "#475569", textDecoration: "none" }}>Servicios</Link>
          <Link href="/chat" style={{ color: "#475569", textDecoration: "none" }}>Chat con Lina</Link>
          <Link href="/" style={{ color: "#0F6CF5", textDecoration: "none" }}>EN</Link>
          <Link href="/fr" style={{ color: "#0F6CF5", textDecoration: "none" }}>FR</Link>
        </nav>
      </header>

      <section style={{ textAlign: "center", padding: "48px 16px 64px" }}>
        <div style={{ display: "inline-block", background: "#FEF3C7", color: "#92400E", padding: "6px 16px", borderRadius: 999, fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 20 }}>
          Agencia de viajes con IA · EE.UU.
        </div>
        <h1 style={{ fontSize: "clamp(32px, 6vw, 56px)", fontWeight: 900, color: "#0B1B4D", lineHeight: 1.1, margin: "0 0 20px" }}>
          Tu viaje, planificado y reservado por IA — con respaldo humano 24/7
        </h1>
        <p style={{ fontSize: 18, color: "#475569", lineHeight: 1.6, maxWidth: 720, margin: "0 auto 32px" }}>
          Zeniva es una agencia de viajes con IA en Estados Unidos. Cuéntale a Lina dónde quieres ir, ella te construye una propuesta completa con vuelos, hotel y traslados — todo reservado en segundos. Si necesitas un humano, escribe "quiero hablar con un humano" y un asesor real toma el caso.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/chat?prompt=Quiero+planificar+un+viaje" style={{ background: "linear-gradient(90deg, #0F6CF5, #0B1B4D)", color: "white", padding: "16px 32px", borderRadius: 14, textDecoration: "none", fontWeight: 800, fontSize: 16 }}>
            💬 Chatear con Lina — Es gratis
          </Link>
          <Link href="/call" style={{ background: "white", color: "#0B1B4D", padding: "16px 32px", borderRadius: 14, textDecoration: "none", fontWeight: 800, fontSize: 16, border: "2px solid #0B1B4D" }}>
            📞 Llamada de voz 24/7
          </Link>
        </div>
      </section>

      <section style={{ padding: "32px 0" }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: "#0B1B4D", marginBottom: 16 }}>Lo que hace diferente a Zeniva</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {[
            { title: "Reservas reales, no solo itinerarios", desc: "A diferencia de los planificadores de IA gratuitos, Zeniva reserva vuelos (Duffel) y hoteles (LiteAPI con +1.5M propiedades) directamente." },
            { title: "Escalada humana 24/7", desc: "Escribe 'quiero hablar con un humano' en cualquier momento — un asesor real de viajes toma el caso al instante." },
            { title: "Viajes especializados", desc: "Charter de yates, villas privadas, cruceros y bodas en destino — categorías que la mayoría de agencias IA no tocan." },
            { title: "Trilingüe automático", desc: "Lina detecta tu idioma y responde en español, inglés o francés. Sin cambio de idioma manual." },
            { title: "Llamadas de voz 24/7", desc: "Habla con Lina por voz en /call. Disponible las 24 horas, todos los días." },
            { title: "Planes de pago ZeniPay", desc: "Divide tu reserva en cuotas al 0% de interés. Pago en USD o CAD sin sorpresas de cambio." },
          ].map((item, i) => (
            <div key={i} style={{ background: "white", padding: 24, borderRadius: 16, border: "1px solid #e2e8f0" }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: "#0B1B4D", margin: "0 0 8px" }}>{item.title}</h3>
              <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "32px 0" }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: "#0B1B4D", marginBottom: 16 }}>Servicios principales</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          {[
            { icon: "🤖", title: "Agente de viajes IA", href: "/es/services/ai-travel-agent" },
            { icon: "✨", title: "Viajes de lujo", href: "/es/services/luxury-travel" },
            { icon: "🛥️", title: "Charter de yates", href: "/es/services/yacht-charter" },
            { icon: "🚢", title: "Cruceros", href: "/es/services/cruises" },
            { icon: "✈️", title: "Vuelos", href: "/search/flights" },
            { icon: "🏨", title: "Hoteles", href: "/partners/resorts" },
            { icon: "🏖️", title: "Paquetes", href: "/packages" },
            { icon: "💬", title: "Chat con Lina", href: "/chat" },
          ].map((s, i) => (
            <Link key={i} href={s.href} style={{ background: "white", padding: 20, borderRadius: 14, border: "1px solid #e2e8f0", textDecoration: "none", color: "inherit", textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#0B1B4D" }}>{s.title}</div>
            </Link>
          ))}
        </div>
      </section>

      <section style={{ padding: "32px 0" }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: "#0B1B4D", marginBottom: 16 }}>Destinos populares</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          {[
            { name: "Cancún", href: "/destinations/cancun" },
            { name: "Punta Cana", href: "/destinations/punta-cana" },
            { name: "Bora Bora", href: "/destinations/bora-bora" },
            { name: "México", href: "/destinations/mexico" },
            { name: "Caribe", href: "/destinations/caribbean" },
            { name: "Europa", href: "/destinations/europe" },
            { name: "Villas Florida", href: "/florida-villas" },
            { name: "Todos los paquetes", href: "/packages" },
          ].map((d, i) => (
            <Link key={i} href={d.href} style={{ background: "white", padding: "14px 16px", borderRadius: 10, border: "1px solid #e2e8f0", textDecoration: "none", color: "#0B1B4D", fontSize: 14, fontWeight: 700, textAlign: "center" }}>
              {d.name}
            </Link>
          ))}
        </div>
      </section>

      <section style={{ padding: "48px 24px", background: "linear-gradient(135deg, #0B1B4D, #0F6CF5)", borderRadius: 20, color: "white", textAlign: "center", margin: "32px 0" }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 12px" }}>Empieza tu viaje en 60 segundos</h2>
        <p style={{ fontSize: 16, opacity: 0.9, marginBottom: 24 }}>Cuéntale a Lina dónde quieres ir y ella se encarga del resto.</p>
        <Link href="/chat?prompt=Quiero+planificar+un+viaje" style={{ background: "white", color: "#0B1B4D", padding: "16px 32px", borderRadius: 14, textDecoration: "none", fontWeight: 800, fontSize: 16, display: "inline-block" }}>
          💬 Chatear con Lina ahora
        </Link>
      </section>

      <footer style={{ borderTop: "1px solid #e2e8f0", padding: "24px 0", marginTop: 32, fontSize: 14, color: "#475569", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>© 2026 Zeniva LLC · Delaware, EE.UU.</div>
        <div style={{ display: "flex", gap: 16 }}>
          <Link href="/" style={{ color: "#475569" }}>English</Link>
          <Link href="/fr" style={{ color: "#475569" }}>Français</Link>
          <Link href="/privacy-policy" style={{ color: "#475569" }}>Privacidad</Link>
          <Link href="/terms" style={{ color: "#475569" }}>Términos</Link>
        </div>
      </footer>
    </main>
  );
}
