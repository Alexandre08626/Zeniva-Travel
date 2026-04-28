import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Conoce a Lina — Concierge de viajes IA de Zeniva | 24/7",
  description: "Conoce a Lina, el concierge de viajes IA de Zeniva. Reservas reales (vuelos, hoteles, yates, villas, cruceros), escalada humana 24/7, multilingüe. Gratis.",
  keywords: ["Lina AI", "Lina agente viajes", "Zeniva Lina", "concierge IA viajes", "qué es Lina AI", "hablar con Lina"],
  alternates: { canonical: "https://www.zenivatravel.com/es/lina", languages: { "en-US": "https://www.zenivatravel.com/lina", "fr-CA": "https://www.zenivatravel.com/fr/lina" } },
  openGraph: { title: "Conoce a Lina | Zeniva", description: "Concierge de viajes IA. Reservas reales + humano 24/7.", url: "https://www.zenivatravel.com/es/lina", siteName: "Zeniva Travel", locale: "es_US", type: "profile", images: [{ url: "/branding/lina-avatar.png", width: 1200, height: 630, alt: "Lina — Zeniva" }] },
};
export default function P() { return (
  <SeoPage h1="Conoce a Lina — Tu concierge de viajes IA" subtitle="Lina es la IA detrás de Zeniva. Planifica tu viaje en segundos, reserva vuelos y hoteles reales con socios licenciados, y te transfiere a un asesor humano cuando lo necesitas. Disponible 24/7 en 6 idiomas."
    heroImage="/branding/lina-avatar.png" heroGradient="from-blue-900/70 to-indigo-900/60" badge="Concierge IA viajes"
    sections={[
      { heading: "Quién es Lina", content: `<p>Lina es un concierge IA de viajes construido a propósito — no un chatbot genérico. Construida sobre Anthropic Claude con infraestructura que se conecta a socios de reserva en vivo (Duffel para vuelos, LiteAPI para 1.5M+ hoteles), Lina puede planificar Y reservar todo tu viaje desde una sola conversación.</p><p>Es la puerta de entrada a Zeniva, una agencia de viajes IA con sede en USA, incorporada en Delaware. Cuando hablas con Lina, hablas con el mismo cerebro que maneja miles de viajes por mes — pero personalizado a tus fechas, grupo, presupuesto y estilo.</p>` },
      { heading: "Qué hace Lina realmente", content: `<p><strong>Reserva vuelos reales:</strong> Lina consulta API Duffel para precios de vuelos en vivo de 300+ aerolíneas.</p><p><strong>Reserva hoteles reales:</strong> 1.5M+ propiedades globalmente via LiteAPI.</p><p><strong>Viajes especializados:</strong> Charters de yates, villas privadas, cruceros, bodas en destino.</p><p><strong>Habla tu idioma:</strong> Lina detecta si escribes en inglés, francés, español, portugués, alemán o italiano y responde en el mismo idioma.</p><p><strong>Opción voz:</strong> Habla con Lina por teléfono en /call — 24/7.</p><p><strong>Te pasa a un humano:</strong> Escribe "quiero hablar con un humano" en cualquier momento.</p>` },
      { heading: "Cómo hablar con Lina", content: `<p><strong>Chat web:</strong> Visita <a href="/chat">/chat</a> desde cualquier dispositivo.</p><p><strong>Llamada de voz:</strong> Visita <a href="/call">/call</a> para hablar por voz. Disponible 24/7 en 6 idiomas.</p>` },
    ]}
    highlights={[
      { icon: "star", title: "Reservas reales", description: "Precios de vuelos + hoteles en vivo via Duffel y LiteAPI — no estimaciones." },
      { icon: "shield", title: "Red de seguridad humana", description: "Escribe 'quiero hablar con un humano' — asesor real toma el caso 24/7." },
      { icon: "phone", title: "Voz + chat", description: "Web chat /chat o llamadas /call. Ambos 24/7." },
      { icon: "map", title: "6 idiomas auto", description: "EN, FR, ES, PT, DE, IT — Lina detecta y responde." },
      { icon: "anchor", title: "Viajes especializados", description: "Yates, villas, cruceros, bodas — reservables via Lina." },
      { icon: "gift", title: "Gratis", description: "$0 cargos de reserva. Zeniva gana de comisiones de proveedores." },
    ]}
    faqs={[
      { question: "¿Lina es realmente IA o humano?", answer: "Lina es un agente IA construido sobre Anthropic Claude. Si quieres un humano, escribe 'quiero hablar con un humano' — asesor real toma el caso 24/7." },
      { question: "¿Lina es gratis?", answer: "Sí. Sin cargos para chatear con Lina, sin cargos para reservar. Zeniva gana de comisiones de proveedores (estándar de la industria)." },
      { question: "¿Los precios que muestra Lina son reales?", answer: "Sí — cada precio viene de una llamada API en vivo a Duffel (vuelos) o LiteAPI (hoteles). Son los precios reales reservables en el momento que Lina los muestra." },
      { question: "¿Lina habla español?", answer: "Sí. Lina soporta EN/FR/ES/PT/DE/IT — detección automática." },
      { question: "¿Qué pasa si mi reserva sale mal?", answer: "Escribe 'quiero hablar con un humano' en el mismo chat. Asesor real de Zeniva toma el caso 24/7." },
    ]}
    ctaText="Habla con Lina ahora" ctaPrompt="Quiero planificar un viaje"
    internalLinks={[ { label: "Cómo funciona Lina", href: "/lina/how-it-works" }, { label: "Servicio Agente IA", href: "/es/services/ai-travel-agent" }, { label: "Voz con Lina", href: "/call" } ]}
  />
); }
