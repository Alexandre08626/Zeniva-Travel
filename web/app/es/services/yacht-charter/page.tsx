import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Charter de yate privado en todo el mundo | Zeniva",
  description: "Alquila un yate privado con Zeniva. Catamaranes con tripulación, motor yates y superyates en el Caribe, Mediterráneo, Bahamas y Polinesia. Cotizaciones en 24h vía Lina AI.",
  keywords: ["charter yate privado", "alquiler yate", "yate con tripulación", "catamarán Caribe", "yate Mediterráneo", "superyate"],
  openGraph: {
    title: "Charter de yate privado | Zeniva",
    description: "Catamaranes, motor yates y superyates con tripulación. Caribe, Mediterráneo, Polinesia.",
    url: "https://www.zenivatravel.com/es/services/yacht-charter",
    siteName: "Zeniva Travel", type: "website", locale: "es_US",
    images: [{ url: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: "Charter de yate — Zeniva" }],
  },
  alternates: {
    canonical: "https://www.zenivatravel.com/es/services/yacht-charter",
    languages: {
      "en-US": "https://www.zenivatravel.com/services/yacht-charter",
      "fr-CA": "https://www.zenivatravel.com/fr/services/yacht-charter",
    },
  },
};

export default function EsYachtCharterPage() {
  return (
    <SeoPage
      h1="Charter de yate privado en todo el mundo"
      subtitle="Yates con tripulación, catamaranes y superyates en los destinos náuticos más bellos — sourced y reservados por Lina AI en 24 horas."
      heroImage="https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-cyan-900/70 to-blue-900/60"
      badge="Con o sin tripulación"
      sections={[
        { heading: "Cómo funciona el charter de yate en Zeniva", content: `<p>Reservar un yate privado solía significar semanas de intercambios con brokers, precios opacos y decisiones tomadas con información incompleta. Zeniva reconstruyó la experiencia alrededor de la velocidad y la claridad. Le dices a Lina AI cuándo quieres navegar, dónde y el tamaño de tu grupo — en 24 horas recibes 3-5 opciones verificadas con precios completos, biografías de la tripulación y sugerencias de itinerario.</p><p>Cada yate en nuestra red es operado por una compañía de charter licenciada y asegurada. Trabajamos con brokers en las Islas Vírgenes Británicas, Bahamas, Grecia, Croacia, Turquía, Polinesia Francesa, Tailandia y todo el Caribe.</p>` },
        { heading: "Charter en el Caribe", content: `<p>El Caribe es nuestra región de charter más fuerte. Coordinamos viajes desde Tortola (BVI), Nassau (Bahamas), St. Martin, Santa Lucía, Antigua y Granada. Las Islas Vírgenes Británicas son el punto de partida más popular gracias a los cortos saltos entre fondeaderos protegidos, vientos alisios predecibles y la cadena de bares de playa que se han convertido en destinos por sí mismos.</p><p>Espera presupuestar entre USD $20,000 y $45,000 por semana para un catamarán de 50 pies con tripulación que duerme a 8 invitados, todo incluido (comida, bebidas, combustible, propinas).</p>` },
        { heading: "Charter en el Mediterráneo", content: `<p>La temporada mediterránea va de mayo a octubre, con julio y agosto en su punto máximo. Zeniva sourcing yates en Grecia (Atenas, Mykonos, Santorini), Croacia (Split, Dubrovnik), Italia (Nápoles, Cerdeña, Amalfi), Costa Azul (Cannes, St-Tropez), Turquía (Bodrum) y Baleares (Palma, Ibiza).</p><p>Un motor yate de 100 pies con una tripulación de 5 generalmente cuesta entre USD $80,000 y $150,000 por semana, más el APA estándar del 30% para combustible, comida y muelle.</p>` },
        { heading: "Qué está incluido y qué no", content: `<p>El precio del charter con tripulación normalmente incluye el yate, la tripulación (capitán, chef, marineros, azafata) y amenidades básicas. El APA — generalmente 25-35% de la tarifa base — cubre combustible, muelle, comida, bebidas, tasas portuarias y cualquier abastecimiento solicitado.</p><p>Las propinas son habituales y normalmente representan 10-20% de la tarifa base, pagadas directamente al capitán al final del viaje.</p>` },
      ]}
      highlights={[
        { icon: "anchor", title: "Operadores verificados", description: "Cada compañía de charter en nuestra red está totalmente licenciada, asegurada y verificada." },
        { icon: "star", title: "Cotizaciones en 24h", description: "Dile a Lina tus fechas y destino — recibe 3-5 opciones verificadas en un día hábil." },
        { icon: "users", title: "Con tripulación o sin", description: "Charter completo con capitán y chef, o sin tripulación (tú navegas) — ambos disponibles." },
        { icon: "map", title: "Itinerarios personalizados", description: "Tu capitán planifica los fondeaderos diarios alrededor del clima y tus intereses." },
        { icon: "shield", title: "Contrato MYBA", description: "Contrato MYBA estándar, pago en custodia y seguro completo — tu reserva está protegida." },
        { icon: "phone", title: "Concierge", description: "Listas de abastecimiento, requisitos dietéticos y solicitudes especiales gestionadas." },
      ]}
      faqs={[
        { question: "¿Cuánto cuesta un charter de yate?", answer: "Charter de catamarán con tripulación en el Caribe comienza alrededor de USD $20,000 por semana todo incluido para 8 invitados. Motor yates mediterráneos (60-80 pies) generalmente USD $40,000-$80,000 por semana base, más APA. Superyates (100+ pies) desde USD $100,000 por semana." },
        { question: "¿Necesito experiencia navegando?", answer: "No para charters con tripulación — el capitán maneja todo. Para charters sin tripulación, necesitas una certificación reconocida (ASA, RYA, IYT)." },
        { question: "¿Con cuánta antelación reservar?", answer: "Para semanas pico (Navidad/Año Nuevo en el Caribe, julio-agosto en el Mediterráneo), 9-12 meses. Para temporadas intermedias, 3-6 meses normalmente suficiente." },
        { question: "¿Pueden organizar vuelos y hoteles también?", answer: "Sí. Zeniva reserva tus vuelos al puerto de embarque, cualquier estadía pre/post-charter en hotel, y traslados terrestres." },
        { question: "¿Qué pasa si el clima es malo?", answer: "El capitán tiene autoridad final sobre el itinerario y lo ajustará para mantenerte seguro. La mayoría de charters tienen seguro de viaje que cubre cancelación o disrupciones climáticas significativas." },
      ]}
      ctaText="Obtén cotizaciones de yate"
      ctaPrompt="Quiero alquilar un yate privado"
      internalLinks={[
        { label: "Inicio", href: "/es" },
        { label: "Viajes de lujo", href: "/es/services/luxury-travel" },
        { label: "Cruceros", href: "/es/services/cruises" },
        { label: "Agente IA", href: "/es/services/ai-travel-agent" },
      ]}
      jsonLd={{ "@context": "https://schema.org", "@type": "Service", name: "Charter de yate privado", provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, serviceType: "Yacht Charter", description: "Charter de yates privados con o sin tripulación en el Caribe, Mediterráneo, Bahamas y Polinesia.", areaServed: "Worldwide", inLanguage: "es" }}
    />
  );
}
