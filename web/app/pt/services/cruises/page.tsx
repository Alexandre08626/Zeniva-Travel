import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Planejamento de cruzeiros — Caribe, Mediterrâneo, Alasca | Zeniva",
  description: "Reserve seu cruzeiro com a Zeniva. Caribe, Mediterrâneo, Alasca, Europa do Norte. Todas as grandes empresas de cruzeiro mais embarcações de luxo.",
  keywords: ["reserva cruzeiros", "cruzeiro Caribe", "cruzeiro Mediterrâneo", "cruzeiro Alasca", "Royal Caribbean", "MSC", "Norwegian"],
  openGraph: { title: "Cruzeiros | Zeniva", description: "Caribe, Mediterrâneo, Alasca. Todas as grandes empresas.", url: "https://www.zenivatravel.com/pt/services/cruises", siteName: "Zeniva Travel", type: "website", locale: "pt_BR", images: [{ url: "https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: "Cruzeiros — Zeniva" }] },
  alternates: { canonical: "https://www.zenivatravel.com/pt/services/cruises", languages: { "en-US": "https://www.zenivatravel.com/services/cruises", "es": "https://www.zenivatravel.com/es/services/cruises" } },
};
export default function P() { return (
  <SeoPage h1="Planejamento de cruzeiros mundialmente" subtitle="De cruzeiros caribenhos de 7 noites a voltas ao mundo de um mês — Zeniva reserva todas as grandes empresas mais cruzeiros pequenos de luxo e expedição."
    heroImage="https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=1600&q=85" heroGradient="from-blue-900/70 to-cyan-900/60" badge="Todas as empresas + pequenos navios"
    sections={[
      { heading: "Por que reservar cruzeiro pela Zeniva", content: `<p>Preços de cruzeiros são opacos, promoções mudam diariamente, e a diferença entre uma cabine excelente e uma barulhenta pode ser poucos metros. Zeniva reserva em todas as grandes empresas — Royal Caribbean, Carnival, Norwegian, Disney, MSC, Celebrity, Princess, Holland America — mais operadores de luxo (Viking, Seabourn, Silversea, Regent, Ponant, Lindblad).</p>` },
      { heading: "Cruzeiros caribenhos", content: `<p>O Caribe é o maior mercado mundial de cruzeiros. Saídas de portos da Flórida (Miami, Port Canaveral, Fort Lauderdale, Tampa) para Bahamas, Caribe Oriental e Ocidental.</p>` },
      { heading: "Mediterrâneo e Europa", content: `<p>Temporada europeia abril-outubro. Itinerários do Mediterrâneo de Roma, Barcelona, Veneza ou Atenas tocam Costa Amalfitana, Costa Azul, ilhas gregas, Croácia.</p>` },
      { heading: "Alasca, expedição e volta ao mundo", content: `<p>Cruzeiros para Alasca de maio a setembro de Seattle e Vancouver. Para expedição (Galápagos, Antártida) embarcações pequenas são essenciais.</p>` },
    ]}
    highlights={[
      { icon: "anchor", title: "Todas as grandes empresas", description: "Royal Caribbean, MSC, Norwegian, Disney, Princess + todas as de luxo." },
      { icon: "gift", title: "Tarifas de grupo + benefícios", description: "Crédito a bordo, pacotes de bebidas, gorjetas pré-pagas." },
      { icon: "map", title: "Comparação de itinerário", description: "Lina compara empresas, navios e datas." },
      { icon: "shield", title: "Seleção de cabine", description: "Sabemos quais cabines têm ruído ou vista obstruída." },
      { icon: "phone", title: "Hotéis pré e pós", description: "Hotéis de embarque e transfers gerenciados." },
      { icon: "users", title: "Reservas de grupo", description: "Múltiplas cabines familiares, aniversários, grupos corporativos." },
    ]}
    faqs={[
      { question: "Quanto custa um cruzeiro?", answer: "Caribenhos começam abaixo de USD 500 por pessoa em cabine interior. Balcão na Royal Caribbean ou Norwegian: USD 900-1.500 por pessoa para 7 noites." },
      { question: "Gorjetas e bebidas inclusas?", answer: "Em empresas mainstream, não — gorjetas adicionadas diariamente (USD 16-18/pessoa/dia). Em luxo, geralmente inclusas." },
      { question: "Reservam excursões em terra?", answer: "Sim — pela empresa de cruzeiro (mais cara mas garantia de retorno) ou operadores independentes confiáveis." },
      { question: "E seguro de viagem?", answer: "Altamente recomendado. Cotamos cobertura de cancelamento, médica, bagagem." },
      { question: "Quando reservar?", answer: "12-18 meses antes para semanas de pico (Natal/Ano Novo Caribe, verão Mediterrâneo, Alasca verão)." },
    ]}
    ctaText="Encontrar meu cruzeiro" ctaPrompt="Quero planejar um cruzeiro"
    internalLinks={[ { label: "Início", href: "/pt" }, { label: "Viagens de luxo", href: "/pt/services/luxury-travel" }, { label: "Agente IA", href: "/pt/services/ai-travel-agent" } ]}
    jsonLd={{ "@context": "https://schema.org", "@type": "Service", name: "Serviço de cruzeiros", provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, serviceType: "Cruise Booking", description: "Reserva de cruzeiros em todas as grandes empresas oceânicas, fluviais e de expedição.", areaServed: "Worldwide", inLanguage: "pt" }}
  />
); }
