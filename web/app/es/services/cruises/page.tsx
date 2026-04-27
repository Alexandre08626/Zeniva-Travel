import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Planificación de cruceros — Caribe, Mediterráneo, Alaska | Zeniva",
  description: "Reserva tu crucero con Zeniva. Caribe, Mediterráneo, Alaska, Europa del Norte, Asia. Todas las grandes líneas, cruceros fluviales y expediciones de lujo.",
  keywords: ["reserva cruceros", "crucero Caribe", "crucero Mediterráneo", "crucero Alaska", "crucero fluvial Europa", "Royal Caribbean", "Norwegian", "Princess"],
  openGraph: {
    title: "Cruceros en todo el mundo | Zeniva",
    description: "Caribe, Mediterráneo, Alaska, fluviales, expediciones. Todas las grandes líneas.",
    url: "https://www.zenivatravel.com/es/services/cruises",
    siteName: "Zeniva Travel", type: "website", locale: "es_US",
    images: [{ url: "https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: "Cruceros — Zeniva" }],
  },
  alternates: {
    canonical: "https://www.zenivatravel.com/es/services/cruises",
    languages: {
      "en-US": "https://www.zenivatravel.com/services/cruises",
      "fr-CA": "https://www.zenivatravel.com/fr/services/cruises",
    },
  },
};

export default function EsCruisesPage() {
  return (
    <SeoPage
      h1="Planificación de cruceros en todo el mundo"
      subtitle="Desde cruceros caribeños de 7 noches hasta vueltas al mundo de un mes — Zeniva reserva todas las grandes líneas más cruceros de lujo de barcos pequeños y expediciones."
      heroImage="https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-blue-900/70 to-cyan-900/60"
      badge="Todas las líneas + barcos pequeños lujo"
      sections={[
        { heading: "Por qué reservar tu crucero con Zeniva", content: `<p>Los precios de los cruceros son opacos, las promociones cambian a diario, y la diferencia entre una excelente cabina y una ruidosa puede ser de unos pocos metros. El equipo de cruceros de Zeniva reserva en todas las grandes líneas — Royal Caribbean, Carnival, Norwegian, Disney, MSC, Celebrity, Princess, Holland America — más los operadores de lujo y expedición (Viking, Seabourn, Silversea, Regent, Ponant, Lindblad).</p><p>Como reservamos en volumen, recibimos tarifas de grupo, créditos a bordo, mejoras gratuitas y beneficios adicionales (paquetes de bebidas, cenas, propinas pre-pagadas) que no siempre están disponibles al reservar directamente.</p>` },
        { heading: "Cruceros caribeños", content: `<p>El Caribe es el mercado de cruceros más grande del mundo. Desde puertos de Florida (Miami, Port Canaveral, Fort Lauderdale, Tampa) puedes navegar hacia las Bahamas, Caribe Oriental, Caribe Occidental o Caribe Sur. Las salidas son durante todo el año con temporada alta de diciembre a abril.</p><p>Para familias, Disney Cruise Line y los barcos clase Oasis de Royal Caribbean ofrecen las mayores actividades a bordo. Las parejas a menudo prefieren Celebrity, Princess o Holland America por un ambiente más tranquilo.</p>` },
        { heading: "Mediterráneo y Europa", content: `<p>La temporada europea va de abril a octubre. Los itinerarios mediterráneos desde Roma, Barcelona, Venecia o Atenas tocan los puntos destacados como la Costa Amalfitana, Costa Azul, islas griegas, Croacia, Malta y Sicilia.</p><p>Los cruceros fluviales europeos — Viking, AmaWaterways, Avalon, Uniworld — operan en el Rin, Danubio, Ródano, Duero y más allá. Los precios por noche son más altos pero típicamente todo incluido (bebidas, excursiones, propinas).</p>` },
        { heading: "Alaska, expedición y vueltas al mundo", content: `<p>Los cruceros a Alaska van de mayo a septiembre desde Seattle y Vancouver. Los itinerarios populares incluyen Glacier Bay, Hubbard Glacier, Inside Passage y escalas en Juneau, Skagway y Ketchikan. Princess y Holland America tienen la presencia más fuerte en Alaska.</p><p>Para cruceros de expedición — Galápagos, Antártida, Ártico, Amazonas — los barcos pequeños son esenciales. Zeniva reserva Lindblad/National Geographic, Ponant, Silversea Expeditions, Hurtigruten.</p>` },
      ]}
      highlights={[
        { icon: "anchor", title: "Todas las grandes líneas", description: "Royal Caribbean, Norwegian, Carnival, Disney, Princess, Holland America, MSC, Celebrity — más todos los de lujo." },
        { icon: "gift", title: "Tarifas de grupo y beneficios", description: "Crédito a bordo, paquetes de bebidas gratis, propinas pre-pagadas y mejoras gratuitas." },
        { icon: "map", title: "Emparejamiento de itinerario", description: "Lina compara líneas, barcos y fechas según tus prioridades." },
        { icon: "shield", title: "Selección de cabina", description: "Sabemos qué cabinas en qué barcos tienen ruido o vistas obstruidas — y cuáles son las mejores silenciosamente." },
        { icon: "phone", title: "Hoteles pre y post", description: "Hoteles de embarque, traslados al puerto y cualquier extensión gestionada en el mismo itinerario." },
        { icon: "users", title: "Reservas de grupo", description: "Reservas multi-cabina familiares, cumpleaños hito y grupos corporativos — coordinados de extremo a extremo." },
      ]}
      faqs={[
        { question: "¿Cuánto cuesta un crucero?", answer: "Cruceros caribeños comienzan bajo USD $500 por persona para una cabina interior en una línea económica. Un balcón en Royal Caribbean o Norwegian generalmente USD $900-$1,500 por persona para 7 noches." },
        { question: "¿Las propinas y bebidas están incluidas?", answer: "En las líneas estándar, no — las propinas se agregan diariamente (USD $16-$18 por persona por día) y las bebidas son a la carta a menos que compres un paquete. En las líneas de lujo y la mayoría de cruceros fluviales, las bebidas y propinas suelen estar incluidas." },
        { question: "¿Pueden reservar excursiones a tierra?", answer: "Sí. Reservamos a través de la línea de crucero (más caro pero garantizado regreso al barco) o a través de operadores independientes confiables en cada puerto (a menudo mitad del precio)." },
        { question: "¿Y el seguro de viaje?", answer: "Altamente recomendado para cruceros. Cotizamos y reservamos seguro que cubre cancelación, médico y equipaje perdido." },
        { question: "¿Cuándo reservar un crucero?", answer: "12-18 meses antes para semanas pico (Navidad/Año Nuevo Caribe, verano Mediterráneo, Alaska verano)." },
      ]}
      ctaText="Encuentra mi crucero"
      ctaPrompt="Quiero planificar un crucero"
      internalLinks={[
        { label: "Inicio", href: "/es" },
        { label: "Charter de yate", href: "/es/services/yacht-charter" },
        { label: "Viajes de lujo", href: "/es/services/luxury-travel" },
        { label: "Agente IA", href: "/es/services/ai-travel-agent" },
      ]}
      jsonLd={{ "@context": "https://schema.org", "@type": "Service", name: "Servicio de cruceros", provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, serviceType: "Cruise Booking", description: "Reserva de cruceros en todas las grandes líneas oceánicas, fluviales y de expedición.", areaServed: "Worldwide", inLanguage: "es" }}
    />
  );
}
