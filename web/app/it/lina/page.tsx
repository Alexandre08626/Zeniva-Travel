import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Conosci Lina — Concierge viaggi IA di Zeniva | 24/7",
  description: "Conosci Lina, il concierge di viaggi IA di Zeniva. Prenotazioni reali (voli, hotel, yacht, ville, crociere), escalation umana 24/7, multilingue. Gratis.",
  keywords: ["Lina AI", "Lina agente viaggi", "Zeniva Lina", "concierge IA viaggi", "cos'è Lina AI"],
  alternates: { canonical: "https://www.zenivatravel.com/it/lina", languages: { "en-US": "https://www.zenivatravel.com/lina" } },
  openGraph: { title: "Conosci Lina | Zeniva", description: "Concierge viaggi IA. Prenotazioni reali + umano 24/7.", url: "https://www.zenivatravel.com/it/lina", siteName: "Zeniva Travel", locale: "it_IT", type: "profile", images: [{ url: "/branding/lina-avatar.png", width: 1200, height: 630, alt: "Lina — Zeniva" }] },
};
export default function P() { return (
  <SeoPage h1="Conosci Lina — Il tuo concierge di viaggi IA" subtitle="Lina è l'IA dietro Zeniva. Pianifica il tuo viaggio in pochi secondi, prenota voli e hotel reali tramite partner licenziati, e ti trasferisce a un consulente umano quando ne hai bisogno. Disponibile 24/7 in 6 lingue."
    heroImage="/branding/lina-avatar.png" heroGradient="from-blue-900/70 to-indigo-900/60" badge="Concierge IA viaggi"
    sections={[
      { heading: "Chi è Lina", content: `<p>Lina è un concierge di viaggi IA costruito su misura — non un chatbot generico. Costruita su Anthropic Claude con infrastruttura che si collega a partner di prenotazione in tempo reale (Duffel per voli, LiteAPI per oltre 1,5 milioni di hotel), Lina può pianificare E prenotare l'intero viaggio da una sola conversazione.</p><p>È la porta d'ingresso a Zeniva, un'agenzia di viaggi IA con sede negli USA, incorporata in Delaware.</p>` },
      { heading: "Cosa fa Lina realmente", content: `<p><strong>Prenota voli reali:</strong> Lina interroga API Duffel per prezzi voli in tempo reale di oltre 300 compagnie aeree.</p><p><strong>Prenota hotel reali:</strong> 1,5 milioni+ proprietà globalmente tramite LiteAPI.</p><p><strong>Viaggi specializzati:</strong> Charter di yacht, ville private, crociere, matrimoni a destinazione.</p><p><strong>Parla la tua lingua:</strong> Lina rileva italiano, inglese, francese, spagnolo, portoghese o tedesco.</p><p><strong>Opzione vocale:</strong> Parla con Lina al telefono su /call — 24/7.</p><p><strong>Ti passa a un umano:</strong> Scrivi "voglio parlare con un umano" in qualsiasi momento.</p>` },
      { heading: "Come parlare con Lina", content: `<p><strong>Chat web:</strong> Visita <a href="/chat">/chat</a>.</p><p><strong>Chiamata vocale:</strong> Visita <a href="/call">/call</a> 24/7 in 6 lingue.</p>` },
    ]}
    highlights={[
      { icon: "star", title: "Prenotazioni reali", description: "Prezzi voli + hotel in tempo reale via Duffel e LiteAPI." },
      { icon: "shield", title: "Rete di sicurezza umana", description: "Scrivi 'voglio parlare con un umano' — consulente reale prende in carico 24/7." },
      { icon: "phone", title: "Voce + chat", description: "Web /chat o chiamate /call. Entrambi 24/7." },
      { icon: "map", title: "6 lingue auto", description: "EN, FR, ES, PT, DE, IT." },
      { icon: "anchor", title: "Viaggi specializzati", description: "Yacht, ville, crociere, matrimoni." },
      { icon: "gift", title: "Gratis", description: "0€ commissioni di prenotazione." },
    ]}
    faqs={[
      { question: "Lina è davvero IA o un umano?", answer: "Lina è un agente IA. Per un umano scrivi 'voglio parlare con un umano'." },
      { question: "Lina è gratuita?", answer: "Sì. Zeniva guadagna sulle commissioni dei fornitori." },
      { question: "I prezzi sono reali?", answer: "Sì — in tempo reale via Duffel e LiteAPI." },
      { question: "Lina parla italiano?", answer: "Sì — rilevamento automatico EN/FR/ES/PT/DE/IT." },
      { question: "Cosa succede se la prenotazione va male?", answer: "Consulente reale Zeniva prende in carico 24/7." },
    ]}
    ctaText="Parla con Lina ora" ctaPrompt="Voglio pianificare un viaggio"
    internalLinks={[ { label: "Come funziona Lina", href: "/lina/how-it-works" }, { label: "Servizio Agente IA", href: "/it/services/ai-travel-agent" }, { label: "Voce con Lina", href: "/call" } ]}
  />
); }
