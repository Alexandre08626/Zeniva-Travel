import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Zeniva — AI 여행 컨시어지 | Lina AI 24/7",
  description: "Zeniva는 미국 기반 AI 여행사입니다. Lina AI가 럭셔리 여행, 맞춤 휴가, 요트 차터, 빌라, 크루즈를 계획하고 예약합니다. 한국어 24/7 서비스.",
  keywords: ["AI 여행사", "AI 여행 컨시어지", "Lina AI", "럭셔리 여행", "맞춤 휴가", "요트 차터", "빌라 렌탈"],
  alternates: { canonical: "https://www.zenivatravel.com/ko", languages: { "en-US": "https://www.zenivatravel.com", "ko": "https://www.zenivatravel.com/ko", "ja": "https://www.zenivatravel.com/ja", "zh": "https://www.zenivatravel.com/zh" } },
  openGraph: { title: "Zeniva — AI 여행 컨시어지", description: "Lina AI가 완벽한 여행을 계획하고 예약합니다. 한국어 24/7.", url: "https://www.zenivatravel.com/ko", siteName: "Zeniva Travel", locale: "ko_KR", type: "website", images: [{ url: "/branding/lina-avatar.png", width: 1200, height: 630, alt: "Zeniva Lina AI" }] },
};

export default function HomeKO() {
  const jsonLd = { "@context": "https://schema.org", "@type": "TravelAgency", name: "Zeniva", url: "https://www.zenivatravel.com/ko", description: "미국 기반 AI 여행사. Lina AI 24/7 한국어 서비스.", inLanguage: "ko", areaServed: ["South Korea", "United States"] };
  return (
    <main lang="ko" style={{ minHeight: "100vh", background: "#F8FAFF", padding: 24, maxWidth: 1100, margin: "0 auto", fontFamily: "system-ui, sans-serif", color: "#0f172a" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: "1px solid #e2e8f0", marginBottom: 32 }}>
        <Link href="/ko" style={{ fontSize: 22, fontWeight: 800, color: "#0B1B4D", textDecoration: "none" }}>Zeniva</Link>
        <nav style={{ display: "flex", gap: 16, fontSize: 14 }}>
          <Link href="/ko/lina" style={{ color: "#475569", textDecoration: "none" }}>Lina 만나기</Link>
          <Link href="/chat" style={{ color: "#475569", textDecoration: "none" }}>채팅</Link>
          <Link href="/" style={{ color: "#0F6CF5", textDecoration: "none" }}>EN</Link>
        </nav>
      </header>
      <section style={{ textAlign: "center", padding: "48px 16px 64px" }}>
        <div style={{ display: "inline-block", background: "#FEF3C7", color: "#92400E", padding: "6px 16px", borderRadius: 999, fontSize: 12, fontWeight: 700, marginBottom: 20 }}>AI 여행사 · 미국</div>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 900, color: "#0B1B4D", lineHeight: 1.3, margin: "0 0 20px" }}>당신의 여행, AI가 계획하고 예약 — 24/7 인간 지원</h1>
        <p style={{ fontSize: 17, color: "#475569", lineHeight: 1.7, maxWidth: 720, margin: "0 auto 32px" }}>Lina에게 가고 싶은 곳을 알려주세요. 항공편, 호텔, 교통편을 포함한 완전한 제안을 몇 초 안에 작성합니다. 인간이 필요하면 "인간과 대화하고 싶어요"라고 입력하세요.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/chat?prompt=여행을 계획하고 싶어요" style={{ background: "linear-gradient(90deg, #0F6CF5, #0B1B4D)", color: "white", padding: "16px 32px", borderRadius: 14, textDecoration: "none", fontWeight: 800, fontSize: 16 }}>💬 Lina와 채팅 — 무료</Link>
          <Link href="/call" style={{ background: "white", color: "#0B1B4D", padding: "16px 32px", borderRadius: 14, textDecoration: "none", fontWeight: 800, fontSize: 16, border: "2px solid #0B1B4D" }}>📞 24/7 전화</Link>
        </div>
      </section>
      <section style={{ padding: "32px 0" }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: "#0B1B4D", marginBottom: 16 }}>Zeniva가 다른 점</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {[
            { t: "실제 예약", d: "Duffel(항공편)과 LiteAPI(150만+ 호텔)를 통해 직접 예약." },
            { t: "24/7 인간 에스컬레이션", d: "언제든 \"인간과 대화하고 싶어요\" 입력 — 실제 어드바이저가 즉시 인계." },
            { t: "전문 여행", d: "요트 차터, 프라이빗 빌라, 크루즈, 데스티네이션 웨딩." },
            { t: "다국어 자동", d: "한국어, 영어, 프랑스어, 스페인어, 포르투갈어, 독일어, 이탈리아어." },
            { t: "24/7 음성 통화", d: "/call에서 음성으로 Lina와 대화." },
            { t: "ZeniPay 할부", d: "0% 이자 할부. 여러 통화 지원." },
          ].map((x, i) => (
            <div key={i} style={{ background: "white", padding: 22, borderRadius: 14, border: "1px solid #e2e8f0" }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0B1B4D", margin: "0 0 8px" }}>{x.t}</h3>
              <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.7, margin: 0 }}>{x.d}</p>
            </div>
          ))}
        </div>
      </section>
      <footer style={{ borderTop: "1px solid #e2e8f0", padding: "24px 0", marginTop: 32, fontSize: 13, color: "#475569", textAlign: "center" }}>© 2026 Zeniva LLC · Delaware, USA</footer>
    </main>
  );
}
