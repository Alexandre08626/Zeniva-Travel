import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";
const CITY = "São Paulo"; const AIRPORT = "GRU"; const URL_PATH = "/packages/from-sao-paulo";
export const metadata: Metadata = {
  title: `Pacotes de viagem de ${CITY} (${AIRPORT}) — Caribe, USA, Europa | Zeniva`,
  description: `Pacotes de viagem de ${CITY} (${AIRPORT}). Caribe, USA, Europa, Ásia. Voos diretos do Guarulhos, hotel e traslados inclusos. Atendimento em português.`,
  keywords: [`pacotes viagem ${CITY}`, `voos do ${AIRPORT}`, `viagens de São Paulo`, `São Paulo a Cancún`, `São Paulo a Caribe`, `agência viagem São Paulo`],
  openGraph: { title: `Pacotes de viagem de ${CITY} | Zeniva`, description: `Pacotes curados do GRU. Caribe, USA, Europa.`, url: `https://www.zenivatravel.com${URL_PATH}`, siteName: "Zeniva Travel", type: "website", images: [{ url: "https://images.unsplash.com/photo-1554168848-228452c09d60?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: `Pacotes de ${CITY}` }] },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}`, languages: { "pt-BR": `https://www.zenivatravel.com${URL_PATH}` } },
};
export default function P() { return (
  <SeoPage h1={`Pacotes de viagem de ${CITY}`} subtitle={`Aeroporto Internacional de Guarulhos (${AIRPORT}) é o principal hub do Brasil. Voos diretos para Caribe, USA, Europa, Ásia. LATAM, GOL, Azul, internacionais.`}
    heroImage="https://images.unsplash.com/photo-1554168848-228452c09d60?auto=format&fit=crop&w=1600&q=85" heroGradient="from-emerald-900/70 to-yellow-900/60" badge={`✈️ Direto de GRU`}
    sections={[
      { heading: `Por que ${CITY} tem cobertura excepcional`, content: `<p>Aeroporto Internacional de Guarulhos (${AIRPORT}) é o maior hub da América do Sul. LATAM e GOL têm hubs aqui mais ANA, United, American, Air France, KLM, Lufthansa operam diariamente. Voos diretos para Caribe (Punta Cana, Cancún), USA (Miami, NYC, Orlando), Europa (Lisboa, Madrid, Paris, Frankfurt), Tóquio, Buenos Aires.</p>` },
      { heading: `Top destinos de ${CITY}`, content: `<p><strong>Cancún & Riviera Maya:</strong> Direto de GRU em LATAM/GOL. Desde R$ 4.500/pessoa para 5 noites todo-incluído.</p><p><strong>Punta Cana, Caribe:</strong> Direto de GRU. Desde R$ 5.500/pessoa para 5 noites.</p><p><strong>Aruba, Curaçao:</strong> Conexão por Caracas ou Panamá. Desde R$ 6.500/pessoa.</p><p><strong>USA (Miami, Orlando, NYC, LA):</strong> Direto de GRU. Desde R$ 4.000/pessoa voos.</p><p><strong>Europa (Lisboa, Madrid, Paris, Frankfurt, Roma):</strong> Direto de GRU. Desde R$ 5.500/pessoa voos.</p><p><strong>Buenos Aires, Santiago, Lima:</strong> Direto. Vinhos argentinos + Patagônia.</p><p><strong>Tóquio:</strong> Direto de GRU em ANA — uma das poucas rotas Brasil-Ásia diretas.</p>` },
      { heading: "Como reservar", content: `<p>Converse com a Lina ou ligue 24/7 em /call. Preços em BRL ou USD via ZeniPay. 25% de entrada, saldo em parcelas a 0% de juros. Lina fala português brasileiro nativamente.</p>` },
    ]}
    highlights={[
      { icon: "star", title: `Direto de GRU`, description: `Maior hub da América do Sul — direto para Caribe, USA, Europa, Ásia.` },
      { icon: "gift", title: "Voos + Hotel + Traslados", description: "Empacotado em um preço transparente." },
      { icon: "phone", title: "Lina fala português", description: "Atendimento em português 24/7 — chat ou voz." },
      { icon: "map", title: "Tóquio direto", description: "Uma das poucas rotas Brasil-Ásia diretas (ANA)." },
      { icon: "shield", title: "Suporte 24/7 em viagem", description: "Humano alcançável de qualquer lugar." },
    ]}
    faqs={[
      { question: `Qual é a viagem mais barata de ${CITY}?`, answer: `Cancún todo-incluído a partir de R$ 4.500/pessoa para 5 noites incluindo voos de GRU. Punta Cana a partir de R$ 5.500/pessoa.` },
      { question: "LATAM, GOL ou Azul?", answer: "LATAM para internacional + premium. GOL para América + Caribe. Azul para América + algumas internacionais. Lina compara." },
      { question: "Moeda?", answer: "BRL ou USD via ZeniPay. Parcelamento a 0% de juros." },
      { question: "A Lina fala português?", answer: "Sim, Lina detecta português automaticamente. Atendimento totalmente em português brasileiro." },
      { question: "Cruzeiros do Brasil?", answer: "MSC e Costa têm temporada brasileira (novembro-março) saindo de Santos. Reservamos." },
    ]}
    ctaText={`Ver pacotes de ${CITY}`} ctaPrompt={`Quero um pacote de viagem de ${CITY}`}
    internalLinks={[ { label: "Início PT", href: "/pt" }, { label: "Todos os pacotes", href: "/packages" }, { label: "Pacotes Cancún", href: "/packages/cancun" }, { label: "Destinos Caribe", href: "/destinations/caribbean" } ]}
    jsonLd={{ "@context": "https://schema.org", "@type": "TravelAction", name: `Pacotes de ${CITY}`, description: `Pacotes de viagem de ${CITY} (GRU).`, provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, fromLocation: { "@type": "City", name: CITY, address: { "@type": "PostalAddress", addressCountry: "BR", addressRegion: "SP" } } }}
  />
); }
