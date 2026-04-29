import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Zeniva — AI旅行管家 | Lina AI 24/7",
  description: "Zeniva是美国AI旅行社。Lina AI规划和预订豪华旅行、定制度假、游艇租赁、别墅、邮轮。中文24/7服务。",
  keywords: ["AI旅行社", "AI旅行管家", "Lina AI", "豪华旅行", "定制度假", "游艇租赁", "别墅租赁", "邮轮预订"],
  alternates: { canonical: "https://www.zenivatravel.com/zh", languages: { "en-US": "https://www.zenivatravel.com", "zh": "https://www.zenivatravel.com/zh", "ja": "https://www.zenivatravel.com/ja", "ko": "https://www.zenivatravel.com/ko" } },
  openGraph: { title: "Zeniva — AI旅行管家", description: "Lina AI规划和预订完美旅行。中文24/7。", url: "https://www.zenivatravel.com/zh", siteName: "Zeniva Travel", locale: "zh_CN", type: "website", images: [{ url: "/branding/lina-avatar.png", width: 1200, height: 630, alt: "Zeniva Lina AI" }] },
};

export default function HomeZH() {
  const jsonLd = { "@context": "https://schema.org", "@type": "TravelAgency", name: "Zeniva", url: "https://www.zenivatravel.com/zh", description: "美国AI旅行社。Lina AI 24/7中文服务。", inLanguage: "zh", areaServed: ["China", "Singapore", "Taiwan", "Hong Kong", "United States"] };
  return (
    <main lang="zh" style={{ minHeight: "100vh", background: "#F8FAFF", padding: 24, maxWidth: 1100, margin: "0 auto", fontFamily: "system-ui, sans-serif", color: "#0f172a" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: "1px solid #e2e8f0", marginBottom: 32 }}>
        <Link href="/zh" style={{ fontSize: 22, fontWeight: 800, color: "#0B1B4D", textDecoration: "none" }}>Zeniva</Link>
        <nav style={{ display: "flex", gap: 16, fontSize: 14 }}>
          <Link href="/zh/lina" style={{ color: "#475569", textDecoration: "none" }}>认识Lina</Link>
          <Link href="/chat" style={{ color: "#475569", textDecoration: "none" }}>聊天</Link>
          <Link href="/" style={{ color: "#0F6CF5", textDecoration: "none" }}>EN</Link>
        </nav>
      </header>
      <section style={{ textAlign: "center", padding: "48px 16px 64px" }}>
        <div style={{ display: "inline-block", background: "#FEF3C7", color: "#92400E", padding: "6px 16px", borderRadius: 999, fontSize: 12, fontWeight: 700, marginBottom: 20 }}>AI旅行社 · 美国</div>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 900, color: "#0B1B4D", lineHeight: 1.3, margin: "0 0 20px" }}>您的旅行,由AI规划和预订 — 24/7真人支持</h1>
        <p style={{ fontSize: 17, color: "#475569", lineHeight: 1.7, maxWidth: 720, margin: "0 auto 32px" }}>告诉Lina您想去的地方,她会在几秒钟内构建一个包含航班、酒店和接送服务的完整方案。如需真人帮助,输入"我想和真人交谈"。</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/chat?prompt=我想计划一次旅行" style={{ background: "linear-gradient(90deg, #0F6CF5, #0B1B4D)", color: "white", padding: "16px 32px", borderRadius: 14, textDecoration: "none", fontWeight: 800, fontSize: 16 }}>💬 与Lina聊天 — 免费</Link>
          <Link href="/call" style={{ background: "white", color: "#0B1B4D", padding: "16px 32px", borderRadius: 14, textDecoration: "none", fontWeight: 800, fontSize: 16, border: "2px solid #0B1B4D" }}>📞 24/7电话</Link>
        </div>
      </section>
      <section style={{ padding: "32px 0" }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: "#0B1B4D", marginBottom: 16 }}>Zeniva的不同之处</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {[
            { t: "真实预订", d: "通过Duffel(航班)和LiteAPI(150万+酒店)直接预订。" },
            { t: "24/7真人升级", d: "随时输入\"我想和真人交谈\" — 真正的顾问立即接管。" },
            { t: "专业旅行", d: "游艇租赁、私人别墅、邮轮、目的地婚礼。" },
            { t: "多语言自动", d: "中文、英语、法语、西班牙语、葡萄牙语、德语、意大利语。" },
            { t: "24/7语音电话", d: "在/call与Lina语音通话。" },
            { t: "ZeniPay分期付款", d: "0%利息分期。多种货币。" },
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
