import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Servicio de concierge de viajes de lujo | Zeniva",
  description: "Experimenta planificación de viajes de lujo con servicio personalizado. Villas privadas, charter de yates, vuelos en primera clase, resorts 5 estrellas — diseñados por Zeniva.",
  keywords: ["viajes de lujo", "concierge viajes lujo", "villas privadas", "yates de lujo", "primera clase", "resorts 5 estrellas"],
  openGraph: {
    title: "Concierge de viajes de lujo | Zeniva",
    description: "Villas privadas, charter de yates, primera clase, itinerarios a medida — todo manejado por Zeniva.",
    url: "https://www.zenivatravel.com/es/services/luxury-travel",
    siteName: "Zeniva Travel", type: "website", locale: "es_US",
    images: [{ url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: "Viajes de lujo — Zeniva" }],
  },
  alternates: {
    canonical: "https://www.zenivatravel.com/es/services/luxury-travel",
    languages: {
      "en-US": "https://www.zenivatravel.com/services/luxury-travel",
      "fr-CA": "https://www.zenivatravel.com/fr/services/yacht-charter",
    },
  },
};

export default function EsLuxuryTravelPage() {
  return (
    <SeoPage
      h1="Servicio de concierge de viajes de lujo"
      subtitle="Villas privadas, charter de yates, vuelos en primera clase e itinerarios a medida — cada detalle gestionado para que te enfoques en la experiencia."
      heroImage="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-amber-900/70 to-stone-900/60"
      badge="Servicio premium"
      sections={[
        { heading: "Qué significa viajar de lujo con Zeniva", content: `<p>Viajar de lujo no se trata solo de hoteles caros. Se trata del tiempo — ahorrarlo, disfrutarlo, no desperdiciarlo en logística. Zeniva existe para eliminar cada punto de fricción entre tú y una experiencia de viaje extraordinaria. Desde el momento en que nos contactas, un asesor de viajes dedicado (con apoyo de Lina AI para velocidad) toma posesión de tu viaje y maneja cada detalle.</p><p>Trabajamos con una red curada de socios premium: hoteles de cinco estrellas, propiedades de villas privadas, brokers de charter de yates, proveedores de aviación privada, restaurantes con estrellas Michelin y operadores de experiencias exclusivas. Estas no son alianzas que encontrarás en sitios de descuentos — son relaciones construidas durante años que dan a los clientes de Zeniva acceso a tarifas preferenciales, mejoras de habitación, amenidades VIP y disponibilidad en propiedades a menudo agotadas para el público.</p>` },
        { heading: "Villas privadas y resorts ultra-lujo", content: `<p>Para viajeros que quieren espacio, privacidad y un sentido del lugar, las villas privadas ofrecen algo que los hoteles simplemente no pueden igualar. La cartera de villas de Zeniva abarca los destinos más codiciados del mundo — fincas en acantilados de la Costa Amalfitana, complejos en la playa de Turcas y Caicos, retiros en la jungla de Bali y chalets ski-in en los Alpes Suizos.</p><p>Cada villa en nuestra red ha sido evaluada por calidad, ubicación y estándares de servicio. Muchas vienen con personal dedicado — chefs privados, amas de llaves, conductores y equipos de concierge en el sitio.</p>` },
        { heading: "Charter de yates y aviación privada", content: `<p>Nada redefine unas vacaciones como llegar en jet privado o pasar una semana a bordo de un yate con tripulación. Zeniva te conecta con operadores de charter licenciados en todo el Caribe, Mediterráneo, Pacífico Sur y más allá.</p><p>En el lado de la aviación, nos asociamos con brokers de jets privados y especialistas en empty-leg para encontrar el enrutamiento y los precios más eficientes.</p>` },
        { heading: "Itinerarios a medida y experiencias VIP", content: `<p>El sello distintivo del verdadero viaje de lujo es el acceso — a lugares, personas y experiencias que no están en ningún menú público. Zeniva se especializa en construir itinerarios alrededor de momentos que el dinero solo no puede comprar. Un tour privado del Vaticano fuera de horario con un historiador de arte. Un aterrizaje en helicóptero sobre un glaciar en Nueva Zelanda seguido de un picnic con champaña.</p>` },
      ]}
      highlights={[
        { icon: "star", title: "Asesor dedicado", description: "Un único punto de contacto que conoce tus preferencias y maneja cada detalle de inicio a fin." },
        { icon: "home", title: "Propiedades verificadas", description: "Acceso a villas privadas, resorts de lujo y hoteles boutique inspeccionados personalmente." },
        { icon: "anchor", title: "Yates y jets", description: "Charter de yates con tripulación y opciones de aviación privada de operadores confiables y licenciados." },
        { icon: "map", title: "Itinerarios personalizados", description: "Planes día por día diseñados alrededor de tu ritmo, con acceso VIP y tours privados." },
        { icon: "gift", title: "Beneficios y mejoras VIP", description: "Mejoras gratuitas, créditos de resort y amenidades en propiedades aliadas — beneficios no disponibles en línea." },
        { icon: "shield", title: "Soporte 24/7", description: "Asistencia en tiempo real durante tu viaje. ¿Vuelo retrasado? Tu asesor lo maneja al instante." },
      ]}
      faqs={[
        { question: "¿Qué incluye el servicio de concierge de lujo?", answer: "Todo. Un asesor de viajes dedicado maneja tus vuelos, alojamiento, transferencias terrestres, reservas de restaurantes, reservas de actividades y cualquier solicitud especial. Recibes un itinerario completo día por día y soporte 24/7 durante el viaje." },
        { question: "¿Cuánto cuesta viajar de lujo?", answer: "Depende del destino, duración y nivel de servicio. Una villa de lujo en el Caribe por una semana puede comenzar en USD $5,000, mientras que un charter de yate extenso en el Mediterráneo puede alcanzar seis cifras. La tarifa de Zeniva está incluida en el costo del viaje." },
        { question: "¿Reservan jets privados y yates?", answer: "Sí. Trabajamos con brokers de jets privados licenciados y compañías de charter de yates en todo el mundo. Cada operador en nuestra red está totalmente licenciado y asegurado." },
        { question: "¿Manejan todo el viaje o solo el alojamiento?", answer: "Manejamos el viaje completo — vuelos, hoteles o villas, transporte terrestre, reservas de restaurantes, actividades, citas de spa, entradas a eventos." },
        { question: "¿En qué destinos se especializan?", answer: "La red de lujo de Zeniva abarca todos los continentes. Nuestra cobertura más fuerte incluye el Caribe, México, Europa (Mediterráneo, Francia, Italia), Sudeste Asiático, Maldivas, Bora Bora y África Oriental para safari." },
      ]}
      ctaText="Planifica tu viaje de lujo"
      ctaPrompt="Quiero planificar unas vacaciones de lujo"
      internalLinks={[
        { label: "Inicio", href: "/es" },
        { label: "Agente de viajes IA", href: "/es/services/ai-travel-agent" },
        { label: "Charter de yates", href: "/es/services/yacht-charter" },
        { label: "Cruceros", href: "/es/services/cruises" },
      ]}
      jsonLd={{ "@context": "https://schema.org", "@type": "Service", name: "Concierge de viajes de lujo", provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, serviceType: "Luxury Travel Planning", description: "Servicio de concierge de viajes de lujo con villas privadas, charter de yates, primera clase, itinerarios a medida y experiencias VIP.", areaServed: "Worldwide", inLanguage: "es" }}
    />
  );
}
