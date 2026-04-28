import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Luxusreise-Concierge | Zeniva",
  description: "Erleben Sie White-Glove Luxusreiseplanung. Privatvillen, Yachtcharter, First-Class-Flüge, 5-Sterne-Resorts und maßgeschneiderte Reiserouten von Zeniva.",
  keywords: ["Luxusreisen", "Reisekonzierge Luxus", "Privatvillen", "Yachten Luxus", "First Class", "5 Sterne Resorts"],
  openGraph: { title: "Luxusreise-Concierge | Zeniva", description: "Privatvillen, Yachtcharter, First Class, maßgeschneiderte Reiserouten.", url: "https://www.zenivatravel.com/de/services/luxury-travel", siteName: "Zeniva Travel", type: "website", locale: "de_DE", images: [{ url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: "Luxusreisen — Zeniva" }] },
  alternates: { canonical: "https://www.zenivatravel.com/de/services/luxury-travel", languages: { "en-US": "https://www.zenivatravel.com/services/luxury-travel" } },
};
export default function P() { return (
  <SeoPage h1="Luxusreise-Concierge-Service" subtitle="Privatvillen, Yachtcharter, First-Class-Flüge und maßgeschneiderte Reiserouten — jedes Detail gemanagt, damit Sie sich auf das Erlebnis konzentrieren können."
    heroImage="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=85" heroGradient="from-amber-900/70 to-stone-900/60" badge="Premium-Service"
    sections={[
      { heading: "Was Luxusreisen bei Zeniva bedeutet", content: `<p>Luxusreisen geht nicht nur um teure Hotels. Es geht um Zeit — sie sparen, genießen und nicht für Logistik verschwenden. Zeniva existiert, um jeden Reibungspunkt zwischen Ihnen und einem außergewöhnlichen Reiseerlebnis zu beseitigen. Ab dem ersten Kontakt übernimmt ein engagierter Reiseberater (mit Unterstützung von Lina AI für Geschwindigkeit) Ihre Reise.</p><p>Wir arbeiten mit einem kuratierten Netzwerk von Premium-Partnern: Fünf-Sterne-Hotels, Privatvilla-Eigentümer, Yachtcharter-Broker, Privatluftfahrt-Anbieter, Michelin-Restaurants und exklusive Erlebnisanbieter.</p>` },
      { heading: "Privatvillen und Ultra-Luxus-Resorts", content: `<p>Für Reisende, die Raum, Privatsphäre und ein Ortsgefühl möchten, bieten Privatvillen etwas, das Hotels einfach nicht bieten können. Unser Portfolio umfasst Amalfiküste, Turks und Caicos, Bali, Schweizer Alpen.</p>` },
      { heading: "Yachtcharter und Privatluftfahrt", content: `<p>Nichts definiert einen Urlaub neu wie die Ankunft mit dem Privatjet oder eine Woche an Bord einer Crew-Yacht. Wir verbinden Sie mit lizenzierten Charter-Operatoren in der Karibik, im Mittelmeer und im Südpazifik.</p>` },
      { heading: "Maßgeschneiderte Reiserouten und VIP-Erlebnisse", content: `<p>Das Markenzeichen wahren Luxus ist Zugang — zu Orten, Menschen und Erlebnissen, die nicht auf öffentlichen Menüs stehen. Privatführung des Vatikans außerhalb der Geschäftszeiten mit Kunsthistoriker. Hubschrauberlandung auf Gletscher in Neuseeland.</p>` },
    ]}
    highlights={[
      { icon: "star", title: "Engagierter Berater", description: "Ein einziger Ansprechpartner, der Ihre Vorlieben kennt." },
      { icon: "home", title: "Geprüfte Unterkünfte", description: "Zugang zu Privatvillen, Luxusresorts, Boutique-Hotels persönlich inspiziert." },
      { icon: "anchor", title: "Yachten und Jets", description: "Crew-Charter und Privatluftfahrt von vertrauenswürdigen Operatoren." },
      { icon: "map", title: "Personalisierte Reiserouten", description: "Tagespläne mit VIP-Zugang und Privatführungen." },
      { icon: "gift", title: "VIP-Vorteile und Upgrades", description: "Kostenlose Upgrades, Resortguthaben, Annehmlichkeiten in Partnerunterkünften." },
      { icon: "shield", title: "24/7-Reisesupport", description: "Echtzeit-Unterstützung während Ihrer Reise." },
    ]}
    faqs={[
      { question: "Was ist im Luxus-Concierge-Service enthalten?", answer: "Alles. Engagierter Reiseberater managt Flüge, Unterkunft, Bodentransfers, Restaurantreservierungen, Aktivitäten und Sonderwünsche. Komplette Reiseroute + 24/7-Support." },
      { question: "Wie viel kostet Luxusreisen?", answer: "Hängt von Ziel, Dauer und Service-Level ab. Karibik-Villa für eine Woche kann bei USD 5.000 beginnen. Mediterrane Yachtcharter können sechsstellig sein." },
      { question: "Buchen Sie Privatjets und Yachten?", answer: "Ja. Wir arbeiten mit lizenzierten Brokern weltweit." },
      { question: "Managen Sie alles oder nur Unterkunft?", answer: "Alles — Flüge, Hotels, Bodentransport, Restaurants, Aktivitäten, Spa, Veranstaltungstickets." },
      { question: "Auf welche Ziele spezialisiert?", answer: "Karibik, Mexiko, Europa (Mittelmeer, Frankreich, Italien), Südostasien, Malediven, Bora Bora, Ostafrika für Safari." },
    ]}
    ctaText="Luxusreise planen" ctaPrompt="Ich möchte einen Luxusurlaub planen"
    internalLinks={[ { label: "Startseite", href: "/de" }, { label: "KI-Reiseberater", href: "/de/services/ai-travel-agent" }, { label: "Yachtcharter", href: "/de/services/yacht-charter" } ]}
    jsonLd={{ "@context": "https://schema.org", "@type": "Service", name: "Luxusreise-Concierge", provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, serviceType: "Luxury Travel", description: "Luxusreise-Concierge mit Privatvillen, Yachtcharter, First Class, maßgeschneiderten Reiserouten.", areaServed: "Worldwide", inLanguage: "de" }}
  />
); }
