import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Agente de viagens com IA — Reserve com Lina 24/7 | Zeniva",
  description: "Planeje e reserve sua viagem perfeita com Lina, o agente de viagens IA da Zeniva. Voos, hotéis, vilas — cotações instantâneas, 24/7, sem taxas.",
  keywords: ["agente viagens IA", "agente viagens inteligência artificial", "Lina AI", "agência viagens IA português"],
  openGraph: { title: "Agente de viagens IA | Zeniva", description: "Lina, o agente IA. Voos, hotéis, vilas. Sem taxas.", url: "https://www.zenivatravel.com/pt/services/ai-travel-agent", siteName: "Zeniva Travel", type: "website", locale: "pt_BR", images: [{ url: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: "Agente IA — Zeniva" }] },
  alternates: { canonical: "https://www.zenivatravel.com/pt/services/ai-travel-agent", languages: { "en-US": "https://www.zenivatravel.com/services/ai-travel-agent", "fr-CA": "https://www.zenivatravel.com/fr/services/ai-travel-agent", "es": "https://www.zenivatravel.com/es/services/ai-travel-agent" } },
};
export default function P() { return (
  <SeoPage h1="Agente de viagens com IA — Lina, 24/7, em português" subtitle="Lina é o agente de viagens IA da Zeniva. Conte para ela seu destino, datas e orçamento — em segundos ela monta uma proposta completa com voos, hotel e transfers. Fala português, inglês, francês e espanhol."
    heroImage="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=1600&q=85" heroGradient="from-blue-900/70 to-purple-900/60" badge="Disponível 24/7"
    sections={[
      { heading: "Como funciona a Lina", content: `<p>Lina é um agente de viagens IA construído sobre Anthropic Claude com infraestrutura real de reserva conectada ao Duffel (voos) e LiteAPI (mais de 1.5 milhões de hotéis). Diferente dos chatbots genéricos, Lina faz reservas reais — não apenas sugestões.</p><p>Conte para a Lina onde quer ir, quando, quantos viajantes e seu orçamento. Em segundos ela entrega 3-5 opções reais com preços ao vivo. Você confirma, paga com ZeniPay, recebe a confirmação.</p><p>Se a conversa ficar complexa ou você quiser um humano, escreva "quero falar com um humano" — um consultor real assume na hora.</p>` },
      { heading: "O que a Lina pode reservar", content: `<p><strong>Voos:</strong> Qualquer rota global via Duffel. Econômica, premium, executiva, primeira classe. Multi-cidade suportado.</p><p><strong>Hotéis:</strong> Mais de 1.5 milhões de propriedades via LiteAPI. Boutique, luxo, all-inclusive.</p><p><strong>Pacotes:</strong> Voo + hotel + transfers em uma única transação.</p><p><strong>Especialidades:</strong> Charter de iates, vilas privadas, cruzeiros (todas as grandes empresas) e casamentos no destino.</p>` },
      { heading: "Idiomas e suporte", content: `<p>Lina detecta automaticamente seu idioma e responde em português, inglês, francês ou espanhol. Para viajantes brasileiros e portugueses, isso significa uma experiência totalmente em português sem sentir que está usando tradução automática.</p>` },
    ]}
    highlights={[
      { icon: "star", title: "Reservas reais", description: "Voos via Duffel, hotéis via LiteAPI — preços ao vivo." },
      { icon: "shield", title: "Suporte humano 24/7", description: "Escreva 'quero falar com um humano' — consultor real assume." },
      { icon: "phone", title: "Ligação de voz 24/7", description: "Fale com a Lina por voz em /call." },
      { icon: "map", title: "Multilíngue automático", description: "PT, EN, FR, ES — sem trocar idioma manualmente." },
      { icon: "anchor", title: "Viagens especializadas", description: "Iates, vilas, cruzeiros, casamentos no destino." },
      { icon: "gift", title: "Sem taxas de reserva", description: "Grátis para viajantes — Zeniva ganha de comissões." },
    ]}
    faqs={[
      { question: "A Lina é IA ou humana?", answer: "Lina é um agente IA. Se quiser um humano, escreva 'quero falar com um humano' — consultor real assume." },
      { question: "Cobra taxas?", answer: "Não — grátis para viajantes. Zeniva tem receita de comissões de fornecedores." },
      { question: "Fala português brasileiro?", answer: "Sim, Lina detecta automaticamente. Responde em PT-BR ou PT-PT conforme você escrever." },
      { question: "Posso pagar parcelado?", answer: "Sim, ZeniPay divide em parcelas a 0% de juros." },
      { question: "E se meu voo for cancelado?", answer: "Um consultor real da Zeniva assume o caso 24/7 — gerencia rebooking e reembolsos." },
    ]}
    ctaText="Conversar com Lina agora" ctaPrompt="Quero planejar uma viagem"
    internalLinks={[ { label: "Início", href: "/pt" }, { label: "Viagens de luxo", href: "/pt/services/luxury-travel" }, { label: "Cruzeiros", href: "/pt/services/cruises" } ]}
    jsonLd={{ "@context": "https://schema.org", "@type": "Service", name: "Agente de viagens IA Lina", provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, serviceType: "AI Travel Concierge", description: "Agente IA disponível 24/7 com reservas reais e escalonamento humano. PT, EN, FR, ES.", areaServed: "Worldwide", inLanguage: "pt" }}
  />
); }
