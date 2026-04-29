import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Zeniva — AI旅行コンシェルジュ | Lina AI 24/7",
  description: "Zenivaは米国拠点のAI旅行代理店です。Lina AIが豪華旅行、カスタムバケーション、ヨットチャーター、ヴィラ、クルーズを企画・予約します。日本語24/7サポート。",
  keywords: ["AI旅行代理店", "AI旅行コンシェルジュ", "Lina AI", "豪華旅行", "オーダーメイド旅行", "ヨットチャーター", "ヴィラレンタル", "クルーズ予約"],
  alternates: {
    canonical: "https://www.zenivatravel.com/ja",
    languages: { "en-US": "https://www.zenivatravel.com", "ja": "https://www.zenivatravel.com/ja", "ko": "https://www.zenivatravel.com/ko", "zh": "https://www.zenivatravel.com/zh" },
  },
  openGraph: { title: "Zeniva — AI旅行コンシェルジュ", description: "Lina AIが完璧な旅行を企画・予約。フライト、ホテル、ヨット、ヴィラ、クルーズ。日本語24/7。", url: "https://www.zenivatravel.com/ja", siteName: "Zeniva Travel", locale: "ja_JP", type: "website", images: [{ url: "/branding/lina-avatar.png", width: 1200, height: 630, alt: "Zeniva — Lina AI" }] },
};

export default function HomeJA() {
  const jsonLd = { "@context": "https://schema.org", "@type": "TravelAgency", name: "Zeniva", url: "https://www.zenivatravel.com/ja", description: "米国拠点のAI旅行代理店。Lina AIが日本語24/7対応。", inLanguage: "ja", areaServed: ["Japan", "United States"] };
  return (
    <main lang="ja" style={{ minHeight: "100vh", background: "#F8FAFF", padding: 24, maxWidth: 1100, margin: "0 auto", fontFamily: "system-ui, sans-serif", color: "#0f172a" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: "1px solid #e2e8f0", marginBottom: 32 }}>
        <Link href="/ja" style={{ fontSize: 22, fontWeight: 800, color: "#0B1B4D", textDecoration: "none" }}>Zeniva</Link>
        <nav style={{ display: "flex", gap: 16, fontSize: 14 }}>
          <Link href="/ja/lina" style={{ color: "#475569", textDecoration: "none" }}>Linaに会う</Link>
          <Link href="/chat" style={{ color: "#475569", textDecoration: "none" }}>チャット</Link>
          <Link href="/" style={{ color: "#0F6CF5", textDecoration: "none" }}>EN</Link>
        </nav>
      </header>
      <section style={{ textAlign: "center", padding: "48px 16px 64px" }}>
        <div style={{ display: "inline-block", background: "#FEF3C7", color: "#92400E", padding: "6px 16px", borderRadius: 999, fontSize: 12, fontWeight: 700, marginBottom: 20 }}>AI旅行代理店 · 米国</div>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 900, color: "#0B1B4D", lineHeight: 1.2, margin: "0 0 20px" }}>あなたの旅行、AIが企画・予約 — 24/7人間サポート付き</h1>
        <p style={{ fontSize: 17, color: "#475569", lineHeight: 1.7, maxWidth: 720, margin: "0 auto 32px" }}>Linaに行きたい場所を伝えてください。フライト、ホテル、送迎を含む完全な提案を秒で作成します。人間が必要な場合は「人と話したい」と入力すると、本物のアドバイザーが対応します。</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/chat?prompt=旅行を計画したい" style={{ background: "linear-gradient(90deg, #0F6CF5, #0B1B4D)", color: "white", padding: "16px 32px", borderRadius: 14, textDecoration: "none", fontWeight: 800, fontSize: 16 }}>💬 Linaとチャット — 無料</Link>
          <Link href="/call" style={{ background: "white", color: "#0B1B4D", padding: "16px 32px", borderRadius: 14, textDecoration: "none", fontWeight: 800, fontSize: 16, border: "2px solid #0B1B4D" }}>📞 24/7通話</Link>
        </div>
      </section>
      <section style={{ padding: "32px 0" }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: "#0B1B4D", marginBottom: 16 }}>Zenivaの違い</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {[
            { t: "本物の予約", d: "Duffel(フライト)とLiteAPI(150万以上のホテル)を介して直接予約。" },
            { t: "24/7人間エスカレーション", d: "「人と話したい」と入力するといつでも本物のアドバイザーが対応。" },
            { t: "専門旅行", d: "ヨットチャーター、ヴィラ、クルーズ、デスティネーションウェディング。" },
            { t: "多言語自動", d: "日本語、英語、フランス語、スペイン語、ポルトガル語、ドイツ語、イタリア語に対応。" },
            { t: "音声通話24/7", d: "/callで音声でLinaと話せます。" },
            { t: "ZeniPay分割払い", d: "0%金利の分割払い。USD、JPYなど複数通貨対応。" },
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
