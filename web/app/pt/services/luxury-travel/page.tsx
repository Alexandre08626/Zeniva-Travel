import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Concierge de viagens de luxo | Zeniva",
  description: "Planejamento de viagens de luxo. Vilas privadas, charter de iates, voos primeira classe, resorts 5 estrelas. Cada detalhe gerenciado pela Zeniva.",
  keywords: ["viagens luxo", "concierge viagens luxo", "vilas privadas", "iates luxo", "primeira classe", "resorts 5 estrelas"],
  openGraph: { title: "Concierge viagens luxo | Zeniva", description: "Vilas, iates, primeira classe, itinerários sob medida.", url: "https://www.zenivatravel.com/pt/services/luxury-travel", siteName: "Zeniva Travel", type: "website", locale: "pt_BR", images: [{ url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: "Viagens luxo — Zeniva" }] },
  alternates: { canonical: "https://www.zenivatravel.com/pt/services/luxury-travel", languages: { "en-US": "https://www.zenivatravel.com/services/luxury-travel", "es": "https://www.zenivatravel.com/es/services/luxury-travel" } },
};
export default function P() { return (
  <SeoPage h1="Serviço de concierge de viagens de luxo" subtitle="Vilas privadas, charter de iates, voos primeira classe e itinerários sob medida — cada detalhe gerenciado para você focar na experiência."
    heroImage="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=85" heroGradient="from-amber-900/70 to-stone-900/60" badge="Serviço premium"
    sections={[
      { heading: "O que viajar de luxo significa na Zeniva", content: `<p>Viagem de luxo não é só hotéis caros. É sobre tempo — economizar, aproveitar, não desperdiçar com logística. A Zeniva existe para eliminar cada ponto de atrito entre você e uma experiência extraordinária. Desde o primeiro contato, um consultor de viagens dedicado (com apoio da Lina AI para velocidade) assume sua viagem.</p><p>Trabalhamos com uma rede curada de parceiros premium: hotéis cinco estrelas, propriedades de vilas privadas, brokers de charter de iates, provedores de aviação privada, restaurantes com estrelas Michelin e operadores de experiências exclusivas. Não são parcerias que você encontra em sites de descontos — são relacionamentos construídos por anos.</p>` },
      { heading: "Vilas privadas e resorts ultra-luxo", content: `<p>Para viajantes que querem espaço, privacidade e o sentido do lugar, vilas privadas oferecem o que hotéis simplesmente não conseguem igualar. Nosso portfólio cobre Costa Amalfitana, Turks e Caicos, Bali, Alpes Suíços. Muitas vêm com equipe dedicada — chef privado, governanta, motorista, concierge.</p>` },
      { heading: "Charter de iates e aviação privada", content: `<p>Nada redefine umas férias como chegar em jato privado ou passar uma semana a bordo de um iate com tripulação. Conectamos você com operadores licenciados em todo o Caribe, Mediterrâneo, Pacífico Sul.</p>` },
      { heading: "Itinerários sob medida e experiências VIP", content: `<p>O selo do verdadeiro luxo é o acesso — a lugares, pessoas e experiências que não estão em nenhum menu público. Tour privado do Vaticano fora do horário com historiador de arte. Pouso de helicóptero em geleira na Nova Zelândia.</p>` },
    ]}
    highlights={[
      { icon: "star", title: "Consultor dedicado", description: "Um único ponto de contato que conhece suas preferências." },
      { icon: "home", title: "Propriedades verificadas", description: "Acesso a vilas privadas, resorts de luxo, hotéis boutique inspecionados." },
      { icon: "anchor", title: "Iates e jatos", description: "Charter com tripulação e aviação privada de operadores confiáveis." },
      { icon: "map", title: "Itinerários personalizados", description: "Planos dia-a-dia com acesso VIP e tours privados." },
      { icon: "gift", title: "Benefícios e upgrades VIP", description: "Upgrades grátis, créditos de resort, amenidades em propriedades parceiras." },
      { icon: "shield", title: "Suporte 24/7", description: "Assistência em tempo real durante sua viagem." },
    ]}
    faqs={[
      { question: "O que está incluso no serviço concierge de luxo?", answer: "Tudo. Consultor de viagens dedicado gerencia voos, acomodação, transfers, reservas de restaurantes, atividades e qualquer pedido especial. Itinerário completo dia-a-dia + suporte 24/7." },
      { question: "Quanto custa viajar de luxo?", answer: "Depende do destino, duração e nível. Vila no Caribe por uma semana pode começar em USD 5.000. Charter de iate no Mediterrâneo pode chegar a seis dígitos." },
      { question: "Reservam jatos privados e iates?", answer: "Sim. Trabalhamos com brokers licenciados mundialmente." },
      { question: "Gerenciam tudo ou só acomodação?", answer: "Tudo — voos, hotéis, transporte, restaurantes, atividades, spa, ingressos para eventos." },
      { question: "Especializados em quais destinos?", answer: "Caribe, México, Europa (Mediterrâneo, França, Itália), Sudeste Asiático, Maldivas, Bora Bora, África Oriental para safari." },
    ]}
    ctaText="Planejar sua viagem de luxo" ctaPrompt="Quero planejar férias de luxo"
    internalLinks={[ { label: "Início", href: "/pt" }, { label: "Agente IA", href: "/pt/services/ai-travel-agent" }, { label: "Cruzeiros", href: "/pt/services/cruises" } ]}
    jsonLd={{ "@context": "https://schema.org", "@type": "Service", name: "Concierge viagens luxo", provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, serviceType: "Luxury Travel", description: "Concierge de viagens de luxo com vilas privadas, charter de iates, primeira classe, itinerários sob medida.", areaServed: "Worldwide", inLanguage: "pt" }}
  />
); }
