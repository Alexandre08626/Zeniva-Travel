import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Agente di viaggi con IA — Prenota con Lina 24/7 | Zeniva",
  description: "Pianifica e prenota il tuo viaggio perfetto con Lina, l'agente di viaggi IA di Zeniva. Voli, hotel, ville — preventivi istantanei, 24/7, senza commissioni.",
  keywords: ["agente viaggi IA", "agente viaggi intelligenza artificiale", "Lina AI", "agenzia viaggi IA Italia"],
  openGraph: { title: "Agente di viaggi IA | Zeniva", description: "Lina, l'agente IA. Voli, hotel, ville. Senza commissioni.", url: "https://www.zenivatravel.com/it/services/ai-travel-agent", siteName: "Zeniva Travel", type: "website", locale: "it_IT", images: [{ url: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: "Agente IA — Zeniva" }] },
  alternates: { canonical: "https://www.zenivatravel.com/it/services/ai-travel-agent", languages: { "en-US": "https://www.zenivatravel.com/services/ai-travel-agent", "fr-CA": "https://www.zenivatravel.com/fr/services/ai-travel-agent" } },
};
export default function P() { return (
  <SeoPage h1="Agente di viaggi con IA — Lina, 24/7, in italiano" subtitle="Lina è l'agente di viaggi IA di Zeniva. Dille la tua destinazione, le date e il budget — in pochi secondi crea una proposta completa con voli, hotel e trasferimenti. Parla italiano, inglese, francese e spagnolo."
    heroImage="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=1600&q=85" heroGradient="from-blue-900/70 to-purple-900/60" badge="Disponibile 24/7"
    sections={[
      { heading: "Come funziona Lina", content: `<p>Lina è un agente di viaggi IA costruito su Anthropic Claude con infrastruttura reale di prenotazione collegata a Duffel (voli) e LiteAPI (oltre 1.5 milioni di hotel). A differenza dei chatbot generici, Lina effettua prenotazioni reali — non solo suggerimenti.</p><p>Dì a Lina dove vuoi andare, quando, quanti viaggiatori, il tuo budget. In pochi secondi consegna 3-5 opzioni reali con prezzi in tempo reale. Confermi, paghi con ZeniPay, ricevi la conferma.</p><p>Se la conversazione si complica o vuoi un umano, scrivi "voglio parlare con un umano" — un consulente reale di Zeniva prende in carico subito.</p>` },
      { heading: "Cosa può prenotare Lina", content: `<p><strong>Voli:</strong> Qualsiasi rotta globale tramite Duffel. Economy, premium, business, prima classe. Multi-città supportato.</p><p><strong>Hotel:</strong> Oltre 1.5 milioni di proprietà tramite LiteAPI. Boutique, lusso, all-inclusive.</p><p><strong>Pacchetti:</strong> Volo + hotel + trasferimenti in una sola transazione.</p><p><strong>Specialità:</strong> Charter di yacht, ville private, crociere (tutte le grandi linee) e coordinamento matrimoni a destinazione.</p>` },
      { heading: "Lingue e supporto", content: `<p>Lina rileva automaticamente la tua lingua e risponde in italiano, inglese, francese o spagnolo. Per i viaggiatori italiani, significa un'esperienza completamente in italiano senza percepire l'effetto traduzione automatica.</p>` },
    ]}
    highlights={[
      { icon: "star", title: "Prenotazioni reali", description: "Voli via Duffel, hotel via LiteAPI — prezzi in tempo reale." },
      { icon: "shield", title: "Escalation umana 24/7", description: "Scrivi 'voglio parlare con un umano' — consulente reale prende in carico." },
      { icon: "phone", title: "Chiamata vocale 24/7", description: "Parla con Lina via voce su /call." },
      { icon: "map", title: "Multilingue automatico", description: "IT, EN, FR, ES — senza cambio lingua manuale." },
      { icon: "anchor", title: "Viaggi specializzati", description: "Yacht, ville, crociere, matrimoni a destinazione." },
      { icon: "gift", title: "Nessuna commissione", description: "Gratis per i viaggiatori — Zeniva guadagna sulle commissioni dei fornitori." },
    ]}
    faqs={[
      { question: "Lina è davvero un'IA o un umano?", answer: "Lina è un agente IA. Se vuoi un umano, scrivi 'voglio parlare con un umano' — un consulente reale prende in carico." },
      { question: "Ci sono commissioni di prenotazione?", answer: "No — gratis per i viaggiatori. Zeniva guadagna sulle commissioni dei fornitori." },
      { question: "Lina parla italiano?", answer: "Sì, Lina rileva automaticamente l'italiano. Risponde in italiano quando le scrivi in italiano." },
      { question: "Posso pagare a rate?", answer: "Sì, ZeniPay divide la prenotazione in rate a 0% di interesse." },
      { question: "Cosa succede se il volo viene cancellato?", answer: "Un consulente reale di Zeniva prende in carico il caso 24/7 — gestisce il riprenotazione e i rimborsi." },
    ]}
    ctaText="Chatta con Lina ora" ctaPrompt="Voglio pianificare un viaggio"
    internalLinks={[ { label: "Inizio", href: "/it" }, { label: "Viaggi di lusso", href: "/it/services/luxury-travel" }, { label: "Charter yacht", href: "/services/yacht-charter" }, { label: "Crociere", href: "/services/cruises" } ]}
    jsonLd={{ "@context": "https://schema.org", "@type": "Service", name: "Agente di viaggi IA Lina", provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, serviceType: "AI Travel Concierge", description: "Agente IA disponibile 24/7 con prenotazioni reali e escalation umana. IT, EN, FR, ES.", areaServed: "Worldwide", inLanguage: "it" }}
  />
); }
