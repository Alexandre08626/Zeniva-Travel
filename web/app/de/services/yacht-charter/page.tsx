import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Yachtcharter weltweit | Zeniva",
  description: "Yachtcharter mit Zeniva. Crew-Katamarane, Motoryachten und Superyachten in der Karibik, im Mittelmeer, auf den Bahamas und in Polynesien. Angebote in 24h via Lina AI.",
  keywords: ["Yachtcharter", "Yacht mieten", "Yacht mit Crew", "Katamaran Karibik", "Yacht Mittelmeer", "Superyacht"],
  openGraph: { title: "Yachtcharter | Zeniva", description: "Crew-Katamarane, Motoryachten und Superyachten weltweit.", url: "https://www.zenivatravel.com/de/services/yacht-charter", siteName: "Zeniva Travel", type: "website", locale: "de_DE", images: [{ url: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: "Yachtcharter — Zeniva" }] },
  alternates: { canonical: "https://www.zenivatravel.com/de/services/yacht-charter", languages: { "en-US": "https://www.zenivatravel.com/services/yacht-charter" } },
};
export default function P() { return (
  <SeoPage h1="Privater Yachtcharter weltweit" subtitle="Yachten mit Crew, Katamarane und Superyachten in den schönsten Segelzielen — sourced und gebucht von Lina AI in 24 Stunden."
    heroImage="https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=1600&q=85" heroGradient="from-cyan-900/70 to-blue-900/60" badge="Mit oder ohne Crew"
    sections={[
      { heading: "Wie Yachtcharter bei Zeniva funktioniert", content: `<p>Eine private Yacht zu buchen bedeutete früher Wochen des Hin und Her mit Brokern, intransparente Preise und Entscheidungen mit unvollständigen Informationen. Zeniva hat das Erlebnis um Geschwindigkeit und Klarheit neu aufgebaut. Sie sagen Lina AI, wann Sie segeln möchten, wo, und die Größe Ihrer Gruppe — innerhalb von 24 Stunden erhalten Sie 3-5 geprüfte Optionen mit kompletten Preisen, Crew-Bios und Reiserouten-Vorschlägen.</p><p>Jede Yacht in unserem Netzwerk wird von einer lizenzierten und versicherten Charterfirma betrieben. Wir arbeiten mit Brokern auf den Britischen Jungferninseln, Bahamas, Griechenland, Kroatien, Türkei, Französisch-Polynesien, Thailand und in der Karibik.</p>` },
      { heading: "Karibik & Bahamas", content: `<p>Die Karibik ist unsere stärkste Charter-Region. Wir koordinieren Reisen ab Tortola (BVI), Nassau (Bahamas), St. Martin, Saint Lucia, Antigua und Grenada. Rechnen Sie mit USD 20.000-45.000 pro Woche für einen 50-Fuß-Crew-Katamaran für 8 Gäste, alles inklusive (Essen, Getränke, Treibstoff, Crew-Trinkgeld).</p>` },
      { heading: "Mittelmeer", content: `<p>Die Mittelmeersaison läuft etwa Mai bis Oktober. Sourcen Yachten in Griechenland, Kroatien, Italien, an der Côte d'Azur, in der Türkei und auf den Balearen. Eine 100-Fuß-Motoryacht mit Crew von 5 kostet typischerweise USD 80.000-150.000 pro Woche zuzüglich der Standard-APA von 30%.</p>` },
      { heading: "Was inbegriffen ist", content: `<p>Crew-Charter-Preise enthalten typischerweise die Yacht, die Crew (Kapitän, Koch, Decksleute, Stewardess) und Grundausstattung. Die APA — typischerweise 25-35% der Grundgebühr — deckt Treibstoff, Anlegen, Essen, Getränke, Hafengebühren und Versorgung. Trinkgeld ist üblich (10-20% der Grundgebühr) und wird direkt am Ende dem Kapitän gezahlt.</p>` },
    ]}
    highlights={[
      { icon: "anchor", title: "Geprüfte Operatoren", description: "Jede Charterfirma in unserem Netzwerk ist vollständig lizenziert, versichert und persönlich geprüft." },
      { icon: "star", title: "Angebote in 24h", description: "Sagen Sie Lina Daten und Ziel — erhalten Sie 3-5 geprüfte Optionen in einem Werktag." },
      { icon: "users", title: "Mit oder ohne Crew", description: "Voll mit Crew (Kapitän, Koch inklusive) oder ohne (Sie skippern) — beides verfügbar." },
      { icon: "map", title: "Personalisierte Reiserouten", description: "Ihr Kapitän plant tägliche Ankerplätze um Wetter und Ihre Interessen." },
      { icon: "shield", title: "MYBA-Vertrag", description: "Standard MYBA-Vertrag, Treuhandzahlung und vollständige Versicherung." },
      { icon: "phone", title: "Concierge", description: "Versorgungslisten, Diätanforderungen und Sonderwünsche werden gemanagt." },
    ]}
    faqs={[
      { question: "Wie viel kostet ein Yachtcharter?", answer: "Crew-Katamaran-Charter in der Karibik beginnt bei USD 20.000 pro Woche all-inclusive für 8 Gäste. Mediterrane Motoryachten (60-80 Fuß) typischerweise USD 40.000-80.000 pro Woche Grundgebühr, plus APA. Superyachten (100+ Fuß) ab USD 100.000 pro Woche." },
      { question: "Brauche ich Segelerfahrung?", answer: "Nicht für Crew-Charter — der Kapitän übernimmt alles. Für Bareboat-Charter benötigen Sie eine anerkannte Segelzertifizierung." },
      { question: "Wie weit im Voraus buchen?", answer: "Für Spitzenwochen (Weihnachten/Neujahr in der Karibik, Juli-August im Mittelmeer), 9-12 Monate. Für Schultersaison reichen 3-6 Monate normalerweise." },
      { question: "Können Sie auch Flüge und Hotels arrangieren?", answer: "Ja. Zeniva bucht Ihre Flüge zum Einschiffungshafen, Pre/Post-Charter-Hotelaufenthalte und Bodentransfers." },
      { question: "Was wenn das Wetter schlecht ist?", answer: "Der Kapitän hat die letzte Autorität über die Route und passt sie an, um Sie sicher zu halten. Die meisten Charter haben Reiseversicherung, die Stornierung oder erhebliche Wetterstörungen abdeckt." },
    ]}
    ctaText="Yachtangebote anfordern" ctaPrompt="Ich möchte eine private Yacht chartern"
    internalLinks={[ { label: "Startseite", href: "/de" }, { label: "Luxusreisen", href: "/de/services/luxury-travel" }, { label: "KI-Reiseberater", href: "/de/services/ai-travel-agent" } ]}
    jsonLd={{ "@context": "https://schema.org", "@type": "Service", name: "Privater Yachtcharter", provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, serviceType: "Yacht Charter", description: "Privater Yachtcharter mit oder ohne Crew in der Karibik, im Mittelmeer, auf den Bahamas und in Polynesien.", areaServed: "Worldwide", inLanguage: "de" }}
  />
); }
