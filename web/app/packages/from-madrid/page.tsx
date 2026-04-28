import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";
const CITY = "Madrid"; const AIRPORT = "MAD"; const URL_PATH = "/packages/from-madrid";
export const metadata: Metadata = {
  title: `Paquetes vacacionales desde ${CITY} (${AIRPORT}) — Caribe, USA, Asia | Zeniva`,
  description: `Paquetes vacacionales desde ${CITY} (Barajas). Caribe, USA, Asia, América Latina. Iberia hub con vuelos directos a destinos en español.`,
  keywords: [`paquetes vacaciones ${CITY}`, `vuelos ${AIRPORT}`, `vacaciones desde Madrid`, `Madrid a Cancún`, `Madrid a USA`, `agencia viajes Madrid`],
  openGraph: { title: `Paquetes vacacionales desde ${CITY} | Zeniva`, description: `Paquetes curados desde Barajas. Caribe, USA, América Latina.`, url: `https://www.zenivatravel.com${URL_PATH}`, siteName: "Zeniva Travel", type: "website", images: [{ url: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: `Paquetes desde ${CITY}` }] },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}`, languages: { "es": `https://www.zenivatravel.com${URL_PATH}` } },
};
export default function P() { return (
  <SeoPage h1={`Paquetes vacacionales desde ${CITY}`} subtitle={`Aeropuerto Madrid-Barajas (${AIRPORT}) es el hub de Iberia y principal puerta a América Latina. Vuelos directos a Caribe, USA, Asia, África.`}
    heroImage="https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=1600&q=85" heroGradient="from-rose-900/70 to-amber-900/60" badge={`✈️ Direct de MAD`}
    sections={[
      { heading: `Por qué ${CITY} es la puerta a América Latina`, content: `<p>Barajas (${AIRPORT}) es el hub de Iberia y la principal puerta de Europa hacia América Latina. Más vuelos directos a México, Argentina, Chile, Perú, Colombia, Venezuela que cualquier otro aeropuerto europeo. También directo a USA (NYC, Miami, LA, Chicago), Asia (Tokio, Bangkok), África (Marruecos, Sudáfrica).</p>` },
      { heading: `Top destinos desde ${CITY}`, content: `<p><strong>Caribe (Cancún, Punta Cana, Cuba):</strong> Direct desde MAD. Desde €1.500/persona por 7 noches todo incluido.</p><p><strong>América Latina (México DF, Buenos Aires, Lima, Bogotá, Caracas):</strong> Vuelos directos desde MAD. Iberia tiene la red más densa de Europa.</p><p><strong>USA (NYC, Miami, LA, Chicago):</strong> Direct desde MAD. Desde €700/persona vuelos.</p><p><strong>Maldivas, Mauricio:</strong> Direct desde MAD o vía Dubai. Desde €3.500/persona para 7 noches.</p><p><strong>Asia (Tokio, Bangkok, Bali):</strong> Direct o un stop. Desde €1.200/persona.</p>` },
      { heading: "Cómo reservar", content: `<p>Chatea con Lina o llama 24/7 en /call. Precios en EUR via ZeniPay. 25% de depósito, saldo en cuotas al 0% de interés.</p>` },
    ]}
    highlights={[
      { icon: "star", title: `Direct desde MAD`, description: `Hub Iberia — la mejor red europea hacia América Latina.` },
      { icon: "gift", title: "Vuelos + Hotel + Traslados", description: "Empaquetado en un precio transparente." },
      { icon: "phone", title: "Lina habla español", description: "Servicio en español 24/7 — chat o voz." },
      { icon: "map", title: "Latinoamérica direct", description: "México, Argentina, Chile, Perú, Colombia direct desde MAD." },
      { icon: "shield", title: "Soporte 24/7 en viaje", description: "Humano alcanzable desde cualquier lugar." },
    ]}
    faqs={[
      { question: `¿Cuál es la vacación más barata desde ${CITY}?`, answer: `Mediterráneo (Marruecos, Grecia, Turquía) desde €500/persona por 7 noches todo incluido. Caribe desde €1.500/persona.` },
      { question: "¿Iberia o low-cost?", answer: "Iberia para largo recorrido + premium + Latinoamérica. Ryanair, Vueling, Wizz para Europa low-cost. Lina compara." },
      { question: "¿Moneda?", answer: "EUR via ZeniPay. Planes de pago al 0% de interés." },
      { question: "¿Lina habla español?", answer: "Sí, Lina detecta el español automáticamente. Servicio totalmente en español." },
      { question: "¿Cruceros desde España?", answer: "MSC y Costa tienen temporada española con salidas desde Barcelona, Valencia, Málaga. Reservamos." },
    ]}
    ctaText={`Ver paquetes desde ${CITY}`} ctaPrompt={`Quiero un paquete de vacaciones desde ${CITY}`}
    internalLinks={[ { label: "Inicio ES", href: "/es" }, { label: "Todos los paquetes", href: "/packages" }, { label: "Paquetes Cancún", href: "/packages/cancun" }, { label: "Destinos Caribe", href: "/destinations/caribbean" } ]}
    jsonLd={{ "@context": "https://schema.org", "@type": "TravelAction", name: `Paquetes desde ${CITY}`, description: `Paquetes vacacionales desde ${CITY} (Barajas).`, provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, fromLocation: { "@type": "City", name: CITY, address: { "@type": "PostalAddress", addressCountry: "ES" } } }}
  />
); }
