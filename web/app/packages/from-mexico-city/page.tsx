import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";
const CITY = "Mexico City"; const AIRPORT = "MEX"; const URL_PATH = "/packages/from-mexico-city";
export const metadata: Metadata = {
  title: `Paquetes vacacionales desde ${CITY} (${AIRPORT}) — Caribe, USA, Europa | Zeniva`,
  description: `Paquetes vacacionales desde ${CITY} (${AIRPORT}). Caribe, USA, Europa, Asia. Vuelos directos desde Benito Juárez, hotel y traslados incluidos.`,
  keywords: [`paquetes vacacionales desde ${CITY}`, `vuelos desde ${AIRPORT}`, `vacaciones desde Ciudad de México`, `México a Cancún`, `México a Caribe`, `agencia viajes CDMX`],
  openGraph: { title: `Paquetes vacacionales desde ${CITY} | Zeniva`, description: `Paquetes curados desde MEX. Caribe, USA, Europa.`, url: `https://www.zenivatravel.com${URL_PATH}`, siteName: "Zeniva Travel", type: "website", images: [{ url: "https://images.unsplash.com/photo-1545569310-d31a30ee2dac?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: `Paquetes desde ${CITY}` }] },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}`, languages: { "es": `https://www.zenivatravel.com${URL_PATH}` } },
};
export default function P() { return (
  <SeoPage h1={`Paquetes vacacionales desde ${CITY}`} subtitle={`Aeropuerto Internacional Benito Juárez (${AIRPORT}) es el principal de México. Vuelos directos al Caribe, USA, Europa, América Latina. Aeroméxico, Volaris, VivaAerobus.`}
    heroImage="https://images.unsplash.com/photo-1545569310-d31a30ee2dac?auto=format&fit=crop&w=1600&q=85" heroGradient="from-emerald-900/70 to-rose-900/60" badge={`✈️ Direct desde MEX`}
    sections={[
      { heading: `Por qué ${CITY} tiene cobertura excepcional`, content: `<p>Aeropuerto Benito Juárez (${AIRPORT}) es el hub principal de Aeroméxico. Vuelos directos a Cancún, Punta Cana, La Habana, Aruba, Madrid, París, Tokio, Nueva York, Miami, LA. Las aerolíneas mexicanas (Aeroméxico, Volaris, VivaAerobus) compiten con las internacionales para precios competitivos.</p>` },
      { heading: `Top destinos desde ${CITY}`, content: `<p><strong>Cancún & Riviera Maya:</strong> 2 horas direct desde MEX. Desde MXN 8,000/persona para 4 noches todo-incluido.</p><p><strong>Punta Cana, Caribe:</strong> Direct desde MEX. Desde MXN 18,000/persona para 5 noches.</p><p><strong>La Habana, Cuba:</strong> Direct desde MEX. Desde MXN 12,000/persona para 5 noches.</p><p><strong>USA (NYC, Miami, LA, Las Vegas):</strong> Direct desde MEX. Desde MXN 10,000/persona vuelos.</p><p><strong>Europa (Madrid, París, Frankfurt):</strong> Direct desde MEX. Desde MXN 25,000/persona vuelos.</p><p><strong>Asia (Tokio, Seúl):</strong> Direct desde MEX en Aeroméxico (uno de los pocos vuelos directos México-Asia).</p>` },
      { heading: "Cómo reservar", content: `<p>Chatea con Lina o llama 24/7 en /call. Precios en MXN o USD via ZeniPay. 25% de depósito, saldo en cuotas al 0% de interés. Lina habla español nativamente.</p>` },
    ]}
    highlights={[
      { icon: "star", title: `Direct desde MEX`, description: `Hub Aeroméxico — direct al Caribe, USA, Europa, Asia.` },
      { icon: "gift", title: "Vuelos + Hotel + Traslados", description: "Empaquetado en un precio transparente." },
      { icon: "phone", title: "Lina habla español", description: "Servicio en español 24/7 — chat o voz." },
      { icon: "map", title: "Cuba direct", description: "Una de las rutas mexicanas tradicionales — direct a La Habana y Varadero." },
      { icon: "shield", title: "Soporte 24/7 en viaje", description: "Humano alcanzable desde cualquier lugar." },
    ]}
    faqs={[
      { question: `¿Cuál es la vacación más barata desde ${CITY}?`, answer: `Cancún todo-incluido desde MXN 8,000/persona para 4 noches incluyendo vuelos. Cuba desde MXN 12,000/persona.` },
      { question: "¿Aeroméxico, Volaris o VivaAerobus?", answer: "Aeroméxico para internacional + premium. Volaris y VivaAerobus para vuelos económicos en México y Caribe. Lina compara." },
      { question: "¿Moneda?", answer: "MXN o USD via ZeniPay. Planes de pago al 0% de interés." },
      { question: "¿Lina habla español?", answer: "Sí, Lina detecta el español automáticamente. Servicio totalmente en español." },
      { question: "¿Viajes multi-ciudad?", answer: "Sí — open-jaw soportado. Combinar destinos del Caribe + USA + Europa." },
    ]}
    ctaText={`Ver paquetes desde ${CITY}`} ctaPrompt={`Quiero un paquete de vacaciones desde ${CITY}`}
    internalLinks={[ { label: "Inicio ES", href: "/es" }, { label: "Todos los paquetes", href: "/packages" }, { label: "Paquetes Cancún", href: "/packages/cancun" }, { label: "Destinos Caribe", href: "/destinations/caribbean" } ]}
    jsonLd={{ "@context": "https://schema.org", "@type": "TravelAction", name: `Paquetes desde ${CITY}`, description: `Paquetes vacacionales desde ${CITY} (MEX).`, provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, fromLocation: { "@type": "City", name: CITY, address: { "@type": "PostalAddress", addressCountry: "MX" } } }}
  />
); }
