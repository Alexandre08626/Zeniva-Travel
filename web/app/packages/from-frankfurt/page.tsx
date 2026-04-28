import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";
const CITY = "Frankfurt"; const AIRPORT = "FRA"; const URL_PATH = "/packages/from-frankfurt";
export const metadata: Metadata = {
  title: `Urlaubspakete ab ${CITY} (${AIRPORT}) — Karibik, USA, Asien | Zeniva`,
  description: `Urlaubspakete ab ${CITY} (${AIRPORT}). Karibik, USA, Asien, Afrika. Direktflüge vom Frankfurt Airport, Hotel und Transfers inklusive. Service auf Deutsch.`,
  keywords: [`Urlaubspakete ab ${CITY}`, `Flüge ab ${AIRPORT}`, `Reisen ab Frankfurt`, `Frankfurt Karibik`, `Frankfurt USA`, `Reisebüro Frankfurt`],
  openGraph: { title: `Urlaubspakete ab ${CITY} | Zeniva`, description: `Kuratierte Pakete ab FRA. Karibik, USA, Asien.`, url: `https://www.zenivatravel.com${URL_PATH}`, siteName: "Zeniva Travel", type: "website", images: [{ url: "https://images.unsplash.com/photo-1577798979518-bdf80ed1f0a8?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: `Pakete ab ${CITY}` }] },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}`, languages: { "de": `https://www.zenivatravel.com${URL_PATH}` } },
};
export default function P() { return (
  <SeoPage h1={`Urlaubspakete ab ${CITY}`} subtitle={`Frankfurt Airport (${AIRPORT}) ist Lufthansas größter Hub. Direktflüge in die Karibik, USA, Asien, Afrika. Eines der bestvernetzten Drehkreuze Europas.`}
    heroImage="https://images.unsplash.com/photo-1577798979518-bdf80ed1f0a8?auto=format&fit=crop&w=1600&q=85" heroGradient="from-amber-900/70 to-blue-900/60" badge={`✈️ Direkt ab FRA`}
    sections={[
      { heading: `Warum ${CITY} außergewöhnliche Verbindungen hat`, content: `<p>Frankfurt Airport (${AIRPORT}) ist Lufthansas größter Hub und das wichtigste Drehkreuz Deutschlands. Direktflüge zu praktisch jedem globalen Ziel — Karibik (Punta Cana, Cancún), USA (NYC, Miami, LA), Asien (Tokio, Hongkong, Bangkok, Singapur, Bali), Afrika (Kapstadt, Johannesburg, Lagos), Australien (Sydney, Melbourne via einem Stopp).</p>` },
      { heading: `Top Ziele ab ${CITY}`, content: `<p><strong>Karibik (Punta Cana, Cancún, Varadero):</strong> Direkt ab FRA. Ab 1.500€/Person für 7 Nächte all-inclusive.</p><p><strong>USA (NYC, Miami, LA, San Francisco, Vegas):</strong> Direkt ab FRA. Ab 800€/Person Flüge.</p><p><strong>Malediven, Mauritius, Seychellen:</strong> Direkt ab FRA. Overwater-Bungalows ab 3.500€/Person für 7 Nächte.</p><p><strong>Asien (Tokio, Hongkong, Bangkok, Singapur, Bali):</strong> Direkt ab FRA. Ab 1.500€/Person Flüge.</p><p><strong>Südafrika, Kenia, Tansania:</strong> Direkt ab FRA. Safari + Strand Kombinationen ab 2.800€/Person.</p><p><strong>Mittelmeer (Türkei, Griechenland, Spanien):</strong> Direkt ab FRA. Ab 500€/Person für 7 Nächte all-inclusive.</p>` },
      { heading: "Wie buchen", content: `<p>Mit Lina chatten oder anrufen 24/7 unter /call. Preise in EUR via ZeniPay. 25% Anzahlung, Restbetrag in 0%-Raten. Lina spricht Deutsch nativ.</p>` },
    ]}
    highlights={[
      { icon: "star", title: `Direkt ab FRA`, description: `Lufthansas größter Hub — direkte Flüge weltweit.` },
      { icon: "gift", title: "Flüge + Hotel + Transfers", description: "Gebündelt in einen transparenten Preis." },
      { icon: "phone", title: "Lina spricht Deutsch", description: "Service auf Deutsch 24/7 — Chat oder Sprache." },
      { icon: "map", title: "Globale Direktverbindungen", description: "Eines der bestvernetzten Drehkreuze Europas." },
      { icon: "shield", title: "24/7-Reisesupport", description: "Echter Mensch erreichbar von überall." },
    ]}
    faqs={[
      { question: `Was ist der günstigste Urlaub ab ${CITY}?`, answer: `Mittelmeer-Pauschalreisen ab 500€/Person für 7 Nächte all-inclusive. Karibik ab 1.500€/Person.` },
      { question: "Beste Langstrecke direkt ab Frankfurt?", answer: "Tokio, Singapur, Hongkong, NYC, LA, Sydney (über einen Stopp). Alle direkt ab FRA." },
      { question: "Währung?", answer: "EUR via ZeniPay. Zahlungspläne 0% Zinsen." },
      { question: "Spricht Lina Deutsch?", answer: "Ja, Lina erkennt Deutsch automatisch. Vollständig deutscher Service." },
      { question: "Multi-City Europa?", answer: "Ja — ICE-Züge zu Paris/Brüssel/Amsterdam unterstützt zusammen mit Flügen." },
    ]}
    ctaText={`Pakete ab ${CITY} ansehen`} ctaPrompt={`Ich möchte ein Urlaubspaket ab ${CITY}`}
    internalLinks={[ { label: "Startseite DE", href: "/de" }, { label: "Alle Pakete", href: "/packages" }, { label: "Karibik", href: "/destinations/caribbean" }, { label: "Europa", href: "/destinations/europe" } ]}
    jsonLd={{ "@context": "https://schema.org", "@type": "TravelAction", name: `Urlaubspakete ab ${CITY}`, description: `Urlaubspakete ab ${CITY} (FRA).`, provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, fromLocation: { "@type": "City", name: CITY, address: { "@type": "PostalAddress", addressCountry: "DE", addressRegion: "HE" } } }}
  />
); }
