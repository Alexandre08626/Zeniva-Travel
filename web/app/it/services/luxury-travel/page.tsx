import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Concierge viaggi di lusso | Zeniva",
  description: "Pianificazione viaggi di lusso con Zeniva. Ville private, charter yacht, voli prima classe, resort 5 stelle, itinerari su misura.",
  keywords: ["viaggi lusso", "concierge viaggi lusso", "ville private", "yacht lusso", "prima classe", "resort 5 stelle"],
  openGraph: { title: "Concierge viaggi lusso | Zeniva", description: "Ville, yacht, prima classe, itinerari su misura.", url: "https://www.zenivatravel.com/it/services/luxury-travel", siteName: "Zeniva Travel", type: "website", locale: "it_IT", images: [{ url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: "Viaggi lusso — Zeniva" }] },
  alternates: { canonical: "https://www.zenivatravel.com/it/services/luxury-travel", languages: { "en-US": "https://www.zenivatravel.com/services/luxury-travel" } },
};
export default function P() { return (
  <SeoPage h1="Servizio concierge viaggi di lusso" subtitle="Ville private, charter di yacht, voli prima classe e itinerari su misura — ogni dettaglio gestito perché tu possa concentrarti sull'esperienza."
    heroImage="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=85" heroGradient="from-amber-900/70 to-stone-900/60" badge="Servizio premium"
    sections={[
      { heading: "Cosa significa viaggiare di lusso con Zeniva", content: `<p>Viaggiare di lusso non è solo hotel costosi. È tempo — risparmiarlo, godersi, non sprecarlo in logistica. Zeniva esiste per eliminare ogni punto di attrito tra te e un'esperienza di viaggio straordinaria. Dal primo contatto, un consulente di viaggi dedicato (con il supporto di Lina AI per la velocità) prende in carico il tuo viaggio.</p><p>Lavoriamo con una rete curata di partner premium: hotel cinque stelle, proprietà di ville private, broker di charter di yacht, fornitori di aviazione privata, ristoranti stellati Michelin e operatori di esperienze esclusive.</p>` },
      { heading: "Ville private e resort ultra-lusso", content: `<p>Per i viaggiatori che vogliono spazio, privacy e un senso del luogo, le ville private offrono qualcosa che gli hotel semplicemente non possono eguagliare. Il nostro portafoglio copre Costiera Amalfitana, Turks e Caicos, Bali, Alpi Svizzere. Molte arrivano con personale dedicato — chef privato, governante, autista, concierge.</p>` },
      { heading: "Charter di yacht e aviazione privata", content: `<p>Niente ridefinisce una vacanza come arrivare in jet privato o passare una settimana a bordo di uno yacht con equipaggio. Ti colleghiamo con operatori di charter licenziati nei Caraibi, nel Mediterraneo, nel Pacifico Meridionale.</p>` },
      { heading: "Itinerari su misura ed esperienze VIP", content: `<p>Il segno distintivo del vero lusso è l'accesso — a luoghi, persone ed esperienze che non sono in nessun menu pubblico. Tour privato del Vaticano fuori orario con uno storico dell'arte. Atterraggio in elicottero su un ghiacciaio in Nuova Zelanda.</p>` },
    ]}
    highlights={[
      { icon: "star", title: "Consulente dedicato", description: "Un unico punto di contatto che conosce le tue preferenze." },
      { icon: "home", title: "Proprietà verificate", description: "Accesso a ville private, resort di lusso, hotel boutique ispezionati." },
      { icon: "anchor", title: "Yacht e jet", description: "Charter con equipaggio e aviazione privata da operatori affidabili." },
      { icon: "map", title: "Itinerari personalizzati", description: "Piani giornalieri con accesso VIP e tour privati." },
      { icon: "gift", title: "Vantaggi e upgrade VIP", description: "Upgrade gratuiti, crediti resort, servizi nelle proprietà partner." },
      { icon: "shield", title: "Supporto 24/7", description: "Assistenza in tempo reale durante il tuo viaggio." },
    ]}
    faqs={[
      { question: "Cosa è incluso nel servizio concierge di lusso?", answer: "Tutto. Consulente di viaggi dedicato gestisce voli, alloggio, trasferimenti terrestri, prenotazioni di ristoranti, attività e qualsiasi richiesta speciale. Itinerario completo + supporto 24/7." },
      { question: "Quanto costa viaggiare di lusso?", answer: "Dipende dalla destinazione, durata e livello di servizio. Una villa caraibica per una settimana può iniziare da USD 5.000. Charter di yacht mediterraneo può raggiungere sei cifre." },
      { question: "Prenotate jet privati e yacht?", answer: "Sì. Lavoriamo con broker licenziati a livello mondiale." },
      { question: "Gestite tutto il viaggio o solo l'alloggio?", answer: "Tutto — voli, hotel, trasporto terrestre, ristoranti, attività, spa, biglietti per eventi." },
      { question: "Su quali destinazioni siete specializzati?", answer: "Caraibi, Messico, Europa (Mediterraneo, Francia, Italia), Sud-est asiatico, Maldive, Bora Bora, Africa Orientale per safari." },
    ]}
    ctaText="Pianifica il tuo viaggio di lusso" ctaPrompt="Voglio pianificare una vacanza di lusso"
    internalLinks={[ { label: "Inizio", href: "/it" }, { label: "Agente IA", href: "/it/services/ai-travel-agent" }, { label: "Charter yacht", href: "/services/yacht-charter" } ]}
    jsonLd={{ "@context": "https://schema.org", "@type": "Service", name: "Concierge viaggi di lusso", provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, serviceType: "Luxury Travel", description: "Concierge viaggi di lusso con ville private, charter yacht, prima classe, itinerari su misura.", areaServed: "Worldwide", inLanguage: "it" }}
  />
); }
