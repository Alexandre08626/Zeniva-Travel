import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Lina 만나기 — Zeniva의 AI 여행 컨시어지 | 24/7",
  description: "Zeniva의 AI 여행 컨시어지 Lina를 만나세요. 실제 예약(항공편, 호텔, 요트, 빌라, 크루즈), 24/7 인간 에스컬레이션, 다국어. 무료.",
  keywords: ["Lina AI", "Lina 여행 에이전트", "AI 여행사", "Lina 리뷰"],
  alternates: { canonical: "https://www.zenivatravel.com/ko/lina", languages: { "en-US": "https://www.zenivatravel.com/lina" } },
  openGraph: { title: "Lina 만나기 | Zeniva", description: "AI 여행 컨시어지. 실제 예약 + 24/7 인간.", url: "https://www.zenivatravel.com/ko/lina", siteName: "Zeniva Travel", locale: "ko_KR", type: "profile", images: [{ url: "/branding/lina-avatar.png", width: 1200, height: 630, alt: "Lina Zeniva" }] },
};
export default function P() { return (
  <SeoPage h1="Lina 만나기 — 당신의 AI 여행 컨시어지" subtitle="Lina는 Zeniva 뒤에 있는 AI입니다. 그녀는 몇 초 안에 여행을 계획하고, 라이센스가 있는 파트너를 통해 실제 항공편과 호텔을 예약하며, 필요할 때 인간 어드바이저에게 매끄럽게 인계합니다. 6개 언어로 24/7 사용 가능."
    heroImage="/branding/lina-avatar.png" heroGradient="from-blue-900/70 to-indigo-900/60" badge="AI 여행 컨시어지"
    sections={[
      { heading: "Lina는 누구인가요", content: `<p>Lina는 일반 챗봇이 아닌, 목적을 가지고 만들어진 AI 여행 컨시어지입니다. Anthropic Claude를 기반으로 라이브 예약 파트너(항공편 Duffel, 150만+ 호텔 LiteAPI)에 연결되는 인프라로 구축된 Lina는 한 번의 대화로 여행 전체를 계획하고 예약할 수 있습니다.</p>` },
      { heading: "Lina가 실제로 하는 일", content: `<p><strong>실제 항공편 예약:</strong> Lina는 300개 이상 항공사의 실시간 항공편 가격을 Duffel API에서 조회.</p><p><strong>실제 호텔 예약:</strong> LiteAPI를 통해 전 세계 150만+ 객실.</p><p><strong>전문 여행:</strong> 요트 차터, 프라이빗 빌라, 크루즈, 데스티네이션 웨딩.</p><p><strong>당신의 언어:</strong> Lina는 한국어, 영어, 프랑스어, 스페인어, 포르투갈어, 독일어, 이탈리아어를 자동 감지.</p><p><strong>음성 옵션:</strong> /call에서 전화로 Lina와 대화 — 24/7.</p><p><strong>인간에게 인계:</strong> 언제든 "인간과 대화하고 싶어요" 입력.</p>` },
      { heading: "Lina와 대화하는 방법", content: `<p><strong>웹 채팅:</strong> 어떤 기기에서든 <a href="/chat">/chat</a> 방문.</p><p><strong>음성 통화:</strong> <a href="/call">/call</a>에서 음성으로 대화. 24/7, 6개 언어.</p>` },
    ]}
    highlights={[
      { icon: "star", title: "실제 예약", description: "Duffel과 LiteAPI를 통한 라이브 가격 — 추정이 아님." },
      { icon: "shield", title: "인간 안전망", description: "\"인간과 대화하고 싶어요\" 입력 — 실제 어드바이저가 24/7 인계." },
      { icon: "phone", title: "음성 + 채팅", description: "웹 /chat 또는 통화 /call. 둘 다 24/7." },
      { icon: "map", title: "6개 언어 자동", description: "EN, FR, ES, PT, DE, IT, KO — Lina가 감지하고 응답." },
      { icon: "anchor", title: "전문 여행", description: "요트, 빌라, 크루즈, 웨딩 — Lina를 통해 예약 가능." },
      { icon: "gift", title: "무료", description: "예약 수수료 $0. Zeniva는 공급업체 수수료로 수익." },
    ]}
    faqs={[
      { question: "Lina는 정말 AI인가요?", answer: "네, Lina는 Anthropic Claude로 구축된 AI 에이전트입니다. 인간이 필요하면 \"인간과 대화하고 싶어요\" 입력 — 실제 Zeniva 어드바이저가 24/7 인계합니다." },
      { question: "Lina는 무료인가요?", answer: "네. Lina와의 채팅은 무료, 예약도 무료입니다. Zeniva는 공급업체 수수료로 수익을 얻습니다." },
      { question: "가격은 실제인가요?", answer: "네 — 모든 가격은 Duffel(항공편) 또는 LiteAPI(호텔)에 대한 라이브 API 호출에서 가져옵니다." },
      { question: "Lina는 한국어를 합니까?", answer: "네 — Lina는 한국어를 자동으로 감지하고 한국어로 응답합니다." },
      { question: "예약에 문제가 생기면?", answer: "동일한 채팅에서 \"인간과 대화하고 싶어요\" 입력. 실제 Zeniva 어드바이저가 24/7 인계합니다." },
    ]}
    ctaText="지금 Lina와 채팅" ctaPrompt="여행을 계획하고 싶어요"
    internalLinks={[ { label: "홈", href: "/ko" }, { label: "Lina 작동 방식", href: "/lina/how-it-works" }, { label: "Lina 음성 통화", href: "/call" } ]}
    jsonLd={{ "@context": "https://schema.org", "@type": "Service", name: "Lina AI 여행 컨시어지", provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, serviceType: "AI Travel Concierge", areaServed: "Worldwide", inLanguage: "ko" }}
  />
); }
