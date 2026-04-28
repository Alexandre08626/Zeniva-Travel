import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Conheça Lina — Concierge de viagens IA da Zeniva | 24/7",
  description: "Conheça Lina, o concierge de viagens IA da Zeniva. Reservas reais (voos, hotéis, iates, vilas, cruzeiros), escalonamento humano 24/7, multilíngue. Grátis.",
  keywords: ["Lina AI", "Lina agente viagens", "Zeniva Lina", "concierge IA viagens", "o que é Lina AI"],
  alternates: { canonical: "https://www.zenivatravel.com/pt/lina", languages: { "en-US": "https://www.zenivatravel.com/lina" } },
  openGraph: { title: "Conheça Lina | Zeniva", description: "Concierge de viagens IA. Reservas reais + humano 24/7.", url: "https://www.zenivatravel.com/pt/lina", siteName: "Zeniva Travel", locale: "pt_BR", type: "profile", images: [{ url: "/branding/lina-avatar.png", width: 1200, height: 630, alt: "Lina — Zeniva" }] },
};
export default function P() { return (
  <SeoPage h1="Conheça Lina — Seu concierge de viagens IA" subtitle="Lina é a IA por trás da Zeniva. Planeja sua viagem em segundos, reserva voos e hotéis reais com parceiros licenciados, e te transfere para um consultor humano quando necessário. Disponível 24/7 em 6 idiomas."
    heroImage="/branding/lina-avatar.png" heroGradient="from-blue-900/70 to-indigo-900/60" badge="Concierge IA viagens"
    sections={[
      { heading: "Quem é Lina", content: `<p>Lina é um concierge de viagens IA construído sob medida — não um chatbot genérico. Construída sobre Anthropic Claude com infraestrutura que conecta a parceiros de reserva ao vivo (Duffel para voos, LiteAPI para mais de 1,5 milhão de hotéis), Lina pode planejar E reservar toda sua viagem em uma única conversa.</p><p>Ela é a porta de entrada da Zeniva, uma agência de viagens IA sediada nos EUA, incorporada em Delaware.</p>` },
      { heading: "O que Lina realmente faz", content: `<p><strong>Reserva voos reais:</strong> via API Duffel com 300+ companhias aéreas.</p><p><strong>Reserva hotéis reais:</strong> 1,5M+ propriedades via LiteAPI.</p><p><strong>Viagens especializadas:</strong> Charters de iates, vilas privadas, cruzeiros, casamentos no destino.</p><p><strong>Fala seu idioma:</strong> Lina detecta português, inglês, francês, espanhol, alemão ou italiano e responde no mesmo idioma.</p><p><strong>Opção de voz:</strong> Fale com Lina por telefone em /call — 24/7.</p><p><strong>Te passa para um humano:</strong> Escreva "quero falar com um humano" a qualquer momento.</p>` },
      { heading: "Como falar com Lina", content: `<p><strong>Chat web:</strong> Visite <a href="/chat">/chat</a>.</p><p><strong>Ligação:</strong> Visite <a href="/call">/call</a> 24/7 em 6 idiomas.</p>` },
    ]}
    highlights={[
      { icon: "star", title: "Reservas reais", description: "Preços ao vivo via Duffel e LiteAPI — não estimativas." },
      { icon: "shield", title: "Suporte humano", description: "Escreva 'quero falar com um humano' — consultor real assume 24/7." },
      { icon: "phone", title: "Voz + chat", description: "Web /chat ou ligação /call. Ambos 24/7." },
      { icon: "map", title: "6 idiomas auto", description: "EN, FR, ES, PT, DE, IT." },
      { icon: "anchor", title: "Viagens especializadas", description: "Iates, vilas, cruzeiros, casamentos." },
      { icon: "gift", title: "Grátis", description: "$0 taxas de reserva." },
    ]}
    faqs={[
      { question: "Lina é IA ou humana?", answer: "Lina é um agente IA. Para humano, escreva 'quero falar com um humano'." },
      { question: "Lina é grátis?", answer: "Sim. Zeniva ganha de comissões de fornecedores." },
      { question: "Os preços são reais?", answer: "Sim — em tempo real via Duffel e LiteAPI." },
      { question: "Lina fala português?", answer: "Sim — detecção automática EN/FR/ES/PT/DE/IT." },
      { question: "E se a reserva falhar?", answer: "Consultor real Zeniva assume 24/7." },
    ]}
    ctaText="Falar com Lina agora" ctaPrompt="Quero planejar uma viagem"
    internalLinks={[ { label: "Como Lina funciona", href: "/lina/how-it-works" }, { label: "Serviço Agente IA", href: "/pt/services/ai-travel-agent" }, { label: "Voz com Lina", href: "/call" } ]}
  />
); }
