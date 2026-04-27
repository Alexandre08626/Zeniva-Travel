import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agente de viajes con IA — Reserva con Lina 24/7 | Zeniva",
  description: "Planifica y reserva tu viaje perfecto con Lina, el agente de viajes IA de Zeniva. Vuelos, hoteles, villas — cotizaciones instantáneas, 24/7, sin cargos.",
  keywords: ["agente viajes IA", "agente viajes inteligencia artificial", "Lina AI", "agente viajes 24/7", "agencia viajes IA español"],
  openGraph: {
    title: "Agente de viajes con IA | Zeniva",
    description: "Lina, el agente de viajes IA. Vuelos, hoteles, villas. Sin cargos.",
    url: "https://www.zenivatravel.com/es/services/ai-travel-agent",
    siteName: "Zeniva Travel", type: "website", locale: "es_US",
    images: [{ url: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: "Agente de viajes IA — Zeniva" }],
  },
  alternates: {
    canonical: "https://www.zenivatravel.com/es/services/ai-travel-agent",
    languages: {
      "en-US": "https://www.zenivatravel.com/services/ai-travel-agent",
      "fr-CA": "https://www.zenivatravel.com/fr/services/ai-travel-agent",
    },
  },
};

export default function EsAiTravelAgentPage() {
  return (
    <SeoPage
      h1="Agente de viajes con IA — Lina, 24/7, en español"
      subtitle="Lina es el agente de viajes IA de Zeniva. Cuéntale tu destino, fechas y presupuesto — ella construye una propuesta completa con vuelos, hotel y traslados en segundos. Habla español, inglés y francés."
      heroImage="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-blue-900/70 to-purple-900/60"
      badge="Disponible 24/7"
      sections={[
        { heading: "Cómo funciona Lina", content: `<p>Lina es un agente de viajes IA construido sobre Anthropic Claude con infraestructura de reserva real conectada a Duffel (vuelos) y LiteAPI (más de 1.5 millones de hoteles). A diferencia de los chatbots de planificación general, Lina hace reservas reales — no solo sugerencias.</p><p>Cuéntale a Lina dónde quieres ir, cuándo, cuántos viajeros, tu presupuesto. En segundos te entrega 3-5 opciones reales con precios en vivo. Confirmas la opción que prefieres, pagas con ZeniPay (USD o CAD, planes de cuotas al 0%), recibes la confirmación.</p><p>Si la conversación se complica o quieres un humano, escribe "quiero hablar con un humano" y un asesor real de Zeniva toma el caso de inmediato — disponible 24/7.</p>` },
        { heading: "Qué puede reservar Lina", content: `<p><strong>Vuelos:</strong> Cualquier ruta global vía Duffel (acceso al mismo inventario que las agencias tradicionales). Económica, premium, business, primera clase. Multi-ciudad y open-jaw soportados.</p><p><strong>Hoteles:</strong> Más de 1.5 millones de propiedades vía LiteAPI. Boutique, lujo, todo-incluido, resorts familiares.</p><p><strong>Paquetes:</strong> Vuelo + hotel + traslados en una sola transacción.</p><p><strong>Especialidad:</strong> Charter de yates, villas privadas, cruceros (todas las grandes líneas) y coordinación de bodas en destino.</p>` },
        { heading: "Idiomas y soporte", content: `<p>Lina detecta automáticamente tu idioma y responde en español, inglés o francés. No tienes que cambiar el idioma manualmente. Para viajeros hispanohablantes en EE.UU., México, España y América Latina, esto significa una experiencia totalmente en español sin sentir que estás usando una traducción automática.</p><p>El soporte humano también es trilingüe — todos los asesores de Zeniva pueden manejar casos en español, inglés y francés.</p>` },
      ]}
      highlights={[
        { icon: "star", title: "Reservas reales", description: "Vuelos vía Duffel, hoteles vía LiteAPI — precios en vivo, no estimaciones." },
        { icon: "shield", title: "Escalada humana 24/7", description: "Escribe 'quiero hablar con un humano' — asesor real toma el caso." },
        { icon: "phone", title: "Llamada de voz 24/7", description: "Habla con Lina por voz en /call." },
        { icon: "map", title: "Trilingüe automático", description: "Español, inglés, francés — sin cambio manual." },
        { icon: "anchor", title: "Viajes especializados", description: "Yates, villas, cruceros, bodas en destino — Zeniva los reserva." },
        { icon: "gift", title: "Sin cargos por reserva", description: "Gratis para viajeros — Zeniva gana de comisiones de proveedores." },
      ]}
      faqs={[
        { question: "¿Lina es realmente IA o un humano?", answer: "Lina es un agente de IA construido sobre Anthropic Claude con infraestructura de viajes. Si quieres un humano, escribe 'quiero hablar con un humano' y un asesor real toma el caso." },
        { question: "¿Cobra por reservar?", answer: "No — gratis para viajeros. Zeniva genera ingresos de comisiones de proveedores (vuelos, hoteles), no de cargos al cliente." },
        { question: "¿Habla español?", answer: "Sí, Lina detecta tu idioma automáticamente. Responde en español, inglés o francés según cómo le escribas." },
        { question: "¿Puedo pagar en cuotas?", answer: "Sí, ZeniPay divide tu reserva en cuotas al 0% de interés. USD o CAD." },
        { question: "¿Qué pasa si mi vuelo se cancela?", answer: "Un asesor real de Zeniva toma el caso 24/7 — gestiona el rebooking y los reembolsos." },
      ]}
      ctaText="Chatea con Lina ahora"
      ctaPrompt="Quiero planificar un viaje"
      internalLinks={[
        { label: "Inicio", href: "/es" },
        { label: "Viajes de lujo", href: "/es/services/luxury-travel" },
        { label: "Charter de yates", href: "/es/services/yacht-charter" },
        { label: "Cruceros", href: "/es/services/cruises" },
      ]}
      jsonLd={{ "@context": "https://schema.org", "@type": "Service", name: "Agente de viajes IA Lina", provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, serviceType: "AI Travel Concierge", description: "Agente de viajes IA disponible 24/7 con reservas reales y escalada humana. Servicio en español, inglés y francés.", areaServed: "Worldwide", inLanguage: "es" }}
    />
  );
}
