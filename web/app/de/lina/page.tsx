import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Triff Lina — Zenivas KI-Reisekonzierge | 24/7",
  description: "Triff Lina, Zenivas KI-Reisekonzierge. Echte Buchungen (Flüge, Hotels, Yachten, Villen, Kreuzfahrten), menschliche Eskalation 24/7, mehrsprachig. Kostenlos.",
  keywords: ["Lina AI", "Lina Reiseberater", "Zeniva Lina", "KI Reisekonzierge", "was ist Lina AI", "mit Lina sprechen"],
  alternates: { canonical: "https://www.zenivatravel.com/de/lina", languages: { "en-US": "https://www.zenivatravel.com/lina" } },
  openGraph: { title: "Triff Lina | Zeniva", description: "KI-Reisekonzierge. Echte Buchungen + Mensch 24/7.", url: "https://www.zenivatravel.com/de/lina", siteName: "Zeniva Travel", locale: "de_DE", type: "profile", images: [{ url: "/branding/lina-avatar.png", width: 1200, height: 630, alt: "Lina — Zeniva" }] },
};
export default function P() { return (
  <SeoPage h1="Triff Lina — Dein KI-Reisekonzierge" subtitle="Lina ist die KI hinter Zeniva. Sie plant deine Reise in Sekunden, bucht echte Flüge und Hotels über lizenzierte Partner und übergibt dich an einen menschlichen Berater wenn du einen brauchst. Verfügbar 24/7 in 6 Sprachen."
    heroImage="/branding/lina-avatar.png" heroGradient="from-blue-900/70 to-indigo-900/60" badge="KI-Reisekonzierge"
    sections={[
      { heading: "Wer ist Lina", content: `<p>Lina ist ein speziell entwickelter KI-Reisekonzierge — kein generischer Chatbot. Gebaut auf Anthropic Claude mit Infrastruktur, die sich mit Live-Buchungspartnern verbindet (Duffel für Flüge, LiteAPI für über 1,5 Mio. Hotels), kann Lina deine gesamte Reise aus einem einzigen Chat planen UND buchen.</p><p>Sie ist die Eingangstür zu Zeniva, einem KI-Reisebüro mit Sitz in den USA, in Delaware eingetragen.</p>` },
      { heading: "Was Lina wirklich tut", content: `<p><strong>Echte Flüge buchen:</strong> Lina fragt Duffel API für Live-Flugpreise von 300+ Fluggesellschaften ab.</p><p><strong>Echte Hotels buchen:</strong> 1,5 Mio.+ Unterkünfte global via LiteAPI.</p><p><strong>Spezialreisen:</strong> Yachtcharter, Privatvillen, Kreuzfahrten, Hochzeiten am Ziel.</p><p><strong>Spricht deine Sprache:</strong> Lina erkennt Englisch, Französisch, Spanisch, Portugiesisch, Deutsch oder Italienisch.</p><p><strong>Sprachoption:</strong> Sprich mit Lina per Telefon unter /call — 24/7.</p><p><strong>Übergibt an einen Menschen:</strong> Schreib "Ich möchte mit einem Menschen sprechen" jederzeit.</p>` },
      { heading: "Wie du mit Lina sprichst", content: `<p><strong>Web-Chat:</strong> Besuche <a href="/chat">/chat</a>.</p><p><strong>Sprachanruf:</strong> Besuche <a href="/call">/call</a> 24/7 in 6 Sprachen.</p>` },
    ]}
    highlights={[
      { icon: "star", title: "Echte Buchungen", description: "Live-Preise via Duffel und LiteAPI — keine Schätzungen." },
      { icon: "shield", title: "Menschliches Sicherheitsnetz", description: "'Ich möchte mit einem Menschen sprechen' — echter Berater übernimmt 24/7." },
      { icon: "phone", title: "Sprache + Chat", description: "Web /chat oder Anruf /call. Beide 24/7." },
      { icon: "map", title: "6 Sprachen auto", description: "EN, FR, ES, PT, DE, IT." },
      { icon: "anchor", title: "Spezialreisen", description: "Yachten, Villen, Kreuzfahrten, Hochzeiten." },
      { icon: "gift", title: "Kostenlos", description: "0$ Buchungsgebühren." },
    ]}
    faqs={[
      { question: "Ist Lina wirklich KI oder ein Mensch?", answer: "Lina ist ein KI-Agent. Für einen Menschen schreib 'Ich möchte mit einem Menschen sprechen'." },
      { question: "Ist Lina kostenlos?", answer: "Ja. Zeniva verdient an Lieferantenprovisionen." },
      { question: "Sind die Preise echt?", answer: "Ja — Live-Daten via Duffel und LiteAPI." },
      { question: "Spricht Lina Deutsch?", answer: "Ja — automatische Erkennung EN/FR/ES/PT/DE/IT." },
      { question: "Was wenn meine Buchung schiefgeht?", answer: "Echter Zeniva-Berater übernimmt 24/7." },
    ]}
    ctaText="Jetzt mit Lina sprechen" ctaPrompt="Ich möchte eine Reise planen"
    internalLinks={[ { label: "Wie Lina funktioniert", href: "/lina/how-it-works" }, { label: "KI-Reiseberater Service", href: "/de/services/ai-travel-agent" }, { label: "Sprache mit Lina", href: "/call" } ]}
  />
); }
