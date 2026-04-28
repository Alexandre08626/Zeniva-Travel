import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";
const CITY = "Roma"; const AIRPORT = "FCO"; const URL_PATH = "/packages/from-rome";
export const metadata: Metadata = {
  title: `Pacchetti vacanze da ${CITY} (${AIRPORT}) — Caraibi, USA, Asia | Zeniva`,
  description: `Pacchetti vacanze da ${CITY} (Fiumicino). Caraibi, USA, Asia, Maldive. Voli diretti da Fiumicino, hotel e trasferimenti inclusi.`,
  keywords: [`pacchetti vacanze ${CITY}`, `voli ${AIRPORT}`, `vacanze da Roma`, `Roma a Cancún`, `Roma a Maldive`, `agenzia viaggi Roma`],
  openGraph: { title: `Pacchetti vacanze da ${CITY} | Zeniva`, description: `Pacchetti curati da Fiumicino. Caraibi, USA, Asia.`, url: `https://www.zenivatravel.com${URL_PATH}`, siteName: "Zeniva Travel", type: "website", images: [{ url: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: `Pacchetti da ${CITY}` }] },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}`, languages: { "it": `https://www.zenivatravel.com${URL_PATH}` } },
};
export default function P() { return (
  <SeoPage h1={`Pacchetti vacanze da ${CITY}`} subtitle={`Aeroporto di Fiumicino (${AIRPORT}) è il principale hub italiano. ITA Airways e voli diretti per Caraibi, USA, Asia, Africa. Lina parla italiano nativamente.`}
    heroImage="https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1600&q=85" heroGradient="from-amber-900/70 to-emerald-900/60" badge={`✈️ Diretto da FCO`}
    sections={[
      { heading: `Perché ${CITY} ha un network globale`, content: `<p>Fiumicino (${AIRPORT}) è l'hub di ITA Airways e principale gateway internazionale italiano. Voli diretti per Caraibi (Cancún, Punta Cana), USA (NYC, Miami, LA, Chicago), Asia (Tokyo, Bangkok), Africa (Nairobi, Johannesburg), Sud America (San Paolo, Buenos Aires). Compagnie europee, americane e asiatiche operano tutte da FCO.</p>` },
      { heading: `Top destinazioni da ${CITY}`, content: `<p><strong>Caraibi (Cancún, Punta Cana, Cuba):</strong> Diretto da FCO. Da €1.500/persona per 7 notti tutto incluso.</p><p><strong>Maldive, Seychelles, Mauritius:</strong> Diretto da FCO o via Dubai. Bungalow su palafitta. Da €3.500/persona per 7 notti.</p><p><strong>USA (NYC, Miami, LA):</strong> Diretto da FCO. Da €700/persona per voli.</p><p><strong>Asia (Tokyo, Bangkok, Bali):</strong> Diretto o uno stop. Da €1.200/persona voli.</p><p><strong>Africa (Sudafrica, Kenya, Tanzania):</strong> Safari + spiaggia combinazioni. Da €2.500/persona.</p>` },
      { heading: "Come prenotare", content: `<p>Chatta con Lina o chiama 24/7 su /call. Prezzi in EUR via ZeniPay. 25% di acconto, saldo in rate a 0% di interesse.</p>` },
    ]}
    highlights={[
      { icon: "star", title: `Diretto da FCO`, description: `Hub ITA Airways — diretto per Caraibi, USA, Asia, Africa.` },
      { icon: "gift", title: "Voli + Hotel + Trasferimenti", description: "Pacchetto in un prezzo trasparente." },
      { icon: "phone", title: "Lina parla italiano", description: "Servizio in italiano 24/7 — chat o voce." },
      { icon: "map", title: "Caraibi diretti", description: "Cancún, Punta Cana direct da Fiumicino." },
      { icon: "shield", title: "Supporto 24/7 in viaggio", description: "Umano raggiungibile da ovunque." },
    ]}
    faqs={[
      { question: `Qual è la vacanza più economica da ${CITY}?`, answer: `Mediterraneo (Spagna, Grecia, Turchia) da €500/persona per 7 notti tutto incluso. Caraibi da €1.500/persona.` },
      { question: "ITA Airways o low-cost?", answer: "ITA per lungo raggio + premium. Ryanair, easyJet, Wizz per Europa low-cost. Lina compara tutti." },
      { question: "Valuta?", answer: "EUR via ZeniPay. Piani di pagamento a 0% di interesse." },
      { question: "Lina parla italiano?", answer: "Sì, Lina rileva automaticamente l'italiano. Servizio completamente in italiano." },
      { question: "Crociere dall'Italia?", answer: "MSC e Costa hanno stagione italiana con partenze da Genova, Civitavecchia (Roma), Venezia. Reserviamo." },
    ]}
    ctaText={`Vedi pacchetti da ${CITY}`} ctaPrompt={`Voglio un pacchetto vacanze da ${CITY}`}
    internalLinks={[ { label: "Inizio IT", href: "/it" }, { label: "Tutti i pacchetti", href: "/packages" }, { label: "Pacchetti Cancún", href: "/packages/cancun" }, { label: "Destinazioni Caraibi", href: "/destinations/caribbean" } ]}
    jsonLd={{ "@context": "https://schema.org", "@type": "TravelAction", name: `Pacchetti da ${CITY}`, description: `Pacchetti vacanze da ${CITY} (Fiumicino).`, provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, fromLocation: { "@type": "City", name: CITY, address: { "@type": "PostalAddress", addressCountry: "IT" } } }}
  />
); }
