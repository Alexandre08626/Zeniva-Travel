import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Ontmoet Lina — Zeniva's AI Reisconciërge | 24/7",
  description: "Ontmoet Lina, Zeniva's AI-reisconciërge. Echte boekingen (vluchten, hotels, jachten, villa's, cruises), 24/7 menselijke escalatie, meertalig. Gratis.",
  keywords: ["Lina AI", "Lina reisagent", "Zeniva Lina", "AI reisconciërge", "wat is Lina AI"],
  alternates: { canonical: "https://www.zenivatravel.com/nl/lina", languages: { "en-US": "https://www.zenivatravel.com/lina" } },
  openGraph: { title: "Ontmoet Lina | Zeniva", description: "AI reisconciërge. Echte boekingen + mens 24/7.", url: "https://www.zenivatravel.com/nl/lina", siteName: "Zeniva Travel", locale: "nl_NL", type: "profile", images: [{ url: "/branding/lina-avatar.png", width: 1200, height: 630, alt: "Lina Zeniva" }] },
};
export default function P() { return (
  <SeoPage h1="Ontmoet Lina — Jouw AI-reisconciërge" subtitle="Lina is de AI achter Zeniva. Ze plant je reis in seconden, boekt echte vluchten en hotels via gelicentieerde partners, en geeft je naadloos door aan een menselijke adviseur wanneer nodig. Beschikbaar 24/7 in 6 talen."
    heroImage="/branding/lina-avatar.png" heroGradient="from-blue-900/70 to-indigo-900/60" badge="AI reisconciërge"
    sections={[
      { heading: "Wie is Lina", content: `<p>Lina is een doelgericht ontworpen AI-reisconciërge — geen generieke chatbot. Gebouwd op Anthropic Claude met infrastructuur die verbinding maakt met live boekingspartners (Duffel voor vluchten, LiteAPI voor 1,5M+ hotels), kan Lina je hele reis plannen EN boeken vanuit één gesprek.</p>` },
      { heading: "Wat Lina daadwerkelijk doet", content: `<p><strong>Echte vluchtboekingen:</strong> Lina vraagt Duffel API voor live vluchtprijzen van 300+ luchtvaartmaatschappijen.</p><p><strong>Echte hotelboekingen:</strong> 1,5M+ accommodaties wereldwijd via LiteAPI.</p><p><strong>Specialistische reizen:</strong> Jachtcharter, privévilla's, cruises, bestemmingsbruiloften.</p><p><strong>Spreekt jouw taal:</strong> Lina detecteert automatisch Nederlands, Engels, Frans, Spaans, Portugees, Duits, Italiaans.</p><p><strong>Spraakoptie:</strong> Praat met Lina per telefoon op /call — 24/7.</p><p><strong>Geeft door aan een mens:</strong> Typ "ik wil met een mens praten" op elk moment.</p>` },
      { heading: "Hoe je met Lina praat", content: `<p><strong>Webchat:</strong> Bezoek <a href="/chat">/chat</a> vanaf elk apparaat.</p><p><strong>Spraakoproep:</strong> Bezoek <a href="/call">/call</a> om via spraak te praten. 24/7, 6 talen.</p>` },
    ]}
    highlights={[
      { icon: "star", title: "Echte boekingen", description: "Live prijzen via Duffel en LiteAPI — geen schattingen." },
      { icon: "shield", title: "Menselijk vangnet", description: "Typ \"ik wil met een mens praten\" — echte adviseur 24/7." },
      { icon: "phone", title: "Spraak + chat", description: "Web /chat of bel /call. Beide 24/7." },
      { icon: "map", title: "7 talen automatisch", description: "EN, FR, ES, PT, DE, IT, NL — Lina detecteert en reageert." },
      { icon: "anchor", title: "Specialistische reizen", description: "Jachten, villa's, cruises, bruiloften — boekbaar via Lina." },
      { icon: "gift", title: "Gratis", description: "€0 boekingskosten. Zeniva verdient aan leverancierscommissies." },
    ]}
    faqs={[
      { question: "Is Lina echt AI of een mens?", answer: "Lina is een AI-agent gebouwd op Anthropic Claude. Voor een mens, typ \"ik wil met een mens praten\" — echte Zeniva-adviseur 24/7." },
      { question: "Is Lina gratis?", answer: "Ja. Chatten met Lina is gratis, boeken is gratis. Zeniva verdient aan leverancierscommissies." },
      { question: "Zijn de prijzen echt?", answer: "Ja — elke prijs komt van een live API-aanroep naar Duffel (vluchten) of LiteAPI (hotels)." },
      { question: "Spreekt Lina Nederlands?", answer: "Ja — Lina detecteert Nederlands automatisch en reageert in het Nederlands." },
      { question: "Wat als mijn boeking misgaat?", answer: "Typ \"ik wil met een mens praten\" in dezelfde chat. Echte Zeniva-adviseur 24/7." },
    ]}
    ctaText="Chat nu met Lina" ctaPrompt="Ik wil een reis plannen"
    internalLinks={[ { label: "Home", href: "/nl" }, { label: "Hoe Lina werkt", href: "/lina/how-it-works" }, { label: "Lina spraak", href: "/call" } ]}
    jsonLd={{ "@context": "https://schema.org", "@type": "Service", name: "Lina AI Reisconciërge", provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, serviceType: "AI Travel Concierge", areaServed: "Worldwide", inLanguage: "nl" }}
  />
); }
