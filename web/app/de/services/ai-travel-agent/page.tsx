import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "KI-Reiseberater — Buchen mit Lina 24/7 | Zeniva",
  description: "Planen und buchen Sie Ihre perfekte Reise mit Lina, dem KI-Reiseberater von Zeniva. Flüge, Hotels, Villen — sofortige Angebote, 24/7, ohne Gebühren.",
  keywords: ["KI Reiseberater", "AI Reiseberater", "Lina AI", "KI Reisebüro Deutschland", "automatisches Reisebüro"],
  openGraph: { title: "KI-Reiseberater | Zeniva", description: "Lina, der KI-Reiseberater. Flüge, Hotels, Villen. Ohne Gebühren.", url: "https://www.zenivatravel.com/de/services/ai-travel-agent", siteName: "Zeniva Travel", type: "website", locale: "de_DE", images: [{ url: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: "KI-Reiseberater — Zeniva" }] },
  alternates: { canonical: "https://www.zenivatravel.com/de/services/ai-travel-agent", languages: { "en-US": "https://www.zenivatravel.com/services/ai-travel-agent", "fr-CA": "https://www.zenivatravel.com/fr/services/ai-travel-agent" } },
};
export default function P() { return (
  <SeoPage h1="KI-Reiseberater — Lina, 24/7, auf Deutsch" subtitle="Lina ist der KI-Reiseberater von Zeniva. Sagen Sie ihr Ziel, Daten und Budget — in Sekunden erstellt sie einen kompletten Vorschlag mit Flügen, Hotel und Transfers. Spricht Deutsch, Englisch, Französisch und Spanisch."
    heroImage="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=1600&q=85" heroGradient="from-blue-900/70 to-purple-900/60" badge="Verfügbar 24/7"
    sections={[
      { heading: "Wie Lina funktioniert", content: `<p>Lina ist ein KI-Reiseberater, gebaut auf Anthropic Claude mit echter Buchungsinfrastruktur über Duffel (Flüge) und LiteAPI (über 1,5 Millionen Hotels). Anders als allgemeine Chatbots macht Lina echte Buchungen — nicht nur Vorschläge.</p><p>Sagen Sie Lina, wohin Sie möchten, wann, wie viele Reisende, Ihr Budget. In Sekunden liefert sie 3-5 echte Optionen mit Live-Preisen. Bestätigen, mit ZeniPay zahlen, Bestätigung erhalten.</p><p>Wird das Gespräch komplex oder möchten Sie einen Menschen, schreiben Sie "Ich möchte mit einem Menschen sprechen" — ein echter Berater übernimmt sofort.</p>` },
      { heading: "Was Lina buchen kann", content: `<p><strong>Flüge:</strong> Jede globale Route über Duffel. Economy, Premium, Business, First Class. Multi-City unterstützt.</p><p><strong>Hotels:</strong> Über 1,5 Millionen Unterkünfte über LiteAPI. Boutique, Luxus, All-Inclusive.</p><p><strong>Pakete:</strong> Flug + Hotel + Transfers in einer Transaktion.</p><p><strong>Spezialitäten:</strong> Yachtcharter, Privatvillen, Kreuzfahrten und Hochzeiten am Ziel.</p>` },
      { heading: "Sprachen und Support", content: `<p>Lina erkennt automatisch Ihre Sprache und antwortet auf Deutsch, Englisch, Französisch oder Spanisch. Für deutschsprachige Reisende bedeutet das eine vollständig deutsche Erfahrung ohne maschinelle Übersetzungsgefühl.</p>` },
    ]}
    highlights={[
      { icon: "star", title: "Echte Buchungen", description: "Flüge über Duffel, Hotels über LiteAPI — Live-Preise." },
      { icon: "shield", title: "Menschliche Eskalation 24/7", description: "Schreiben Sie 'Ich möchte mit einem Menschen sprechen' — Berater übernimmt." },
      { icon: "phone", title: "Sprachanruf 24/7", description: "Sprechen Sie per Sprache mit Lina unter /call." },
      { icon: "map", title: "Mehrsprachig automatisch", description: "DE, EN, FR, ES — ohne manuellen Sprachwechsel." },
      { icon: "anchor", title: "Spezialreisen", description: "Yachten, Villen, Kreuzfahrten, Hochzeiten am Ziel." },
      { icon: "gift", title: "Keine Buchungsgebühren", description: "Kostenlos für Reisende — Zeniva verdient an Lieferantenprovisionen." },
    ]}
    faqs={[
      { question: "Ist Lina wirklich KI oder ein Mensch?", answer: "Lina ist ein KI-Agent. Möchten Sie einen Menschen, schreiben Sie 'Ich möchte mit einem Menschen sprechen' — echter Berater übernimmt." },
      { question: "Berechnen Sie Buchungsgebühren?", answer: "Nein — kostenlos für Reisende. Zeniva verdient an Lieferantenprovisionen." },
      { question: "Spricht Lina Deutsch?", answer: "Ja, Lina erkennt automatisch und antwortet auf Deutsch wenn Sie auf Deutsch schreiben." },
      { question: "Kann ich in Raten zahlen?", answer: "Ja, ZeniPay teilt Ihre Buchung in Raten zu 0% Zinsen auf." },
      { question: "Was wenn mein Flug ausfällt?", answer: "Ein echter Berater von Zeniva übernimmt 24/7 — Umbuchung und Erstattungen." },
    ]}
    ctaText="Jetzt mit Lina chatten" ctaPrompt="Ich möchte eine Reise planen"
    internalLinks={[ { label: "Startseite", href: "/de" }, { label: "Luxusreisen", href: "/de/services/luxury-travel" }, { label: "Yachtcharter", href: "/de/services/yacht-charter" } ]}
    jsonLd={{ "@context": "https://schema.org", "@type": "Service", name: "KI-Reiseberater Lina", provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, serviceType: "AI Travel Concierge", description: "KI-Reiseberater 24/7 mit echten Buchungen und menschlicher Eskalation. DE, EN, FR, ES.", areaServed: "Worldwide", inLanguage: "de" }}
  />
); }
