import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Zeniva — وكيل سفر بالذكاء الاصطناعي | Lina AI 24/7",
  description: "Zeniva هي وكالة سفر بالذكاء الاصطناعي مقرها الولايات المتحدة. Lina AI تخطط وتحجز رحلات فاخرة، عطلات مخصصة، تأجير يخوت، فيلات، رحلات بحرية. خدمة باللغة العربية 24/7.",
  keywords: ["وكالة سفر بالذكاء الاصطناعي", "Lina AI", "سفر فاخر", "تأجير يخوت", "حجز رحلات بحرية", "فيلات خاصة"],
  alternates: { canonical: "https://www.zenivatravel.com/ar", languages: { "en-US": "https://www.zenivatravel.com", "ar": "https://www.zenivatravel.com/ar" } },
  openGraph: { title: "Zeniva — وكيل سفر بالذكاء الاصطناعي", description: "Lina AI تخطط وتحجز رحلتك بالكامل. عربية 24/7.", url: "https://www.zenivatravel.com/ar", siteName: "Zeniva Travel", locale: "ar", type: "website", images: [{ url: "/branding/lina-avatar.png", width: 1200, height: 630, alt: "Zeniva Lina AI" }] },
};

export default function HomeAR() {
  const jsonLd = { "@context": "https://schema.org", "@type": "TravelAgency", name: "Zeniva", url: "https://www.zenivatravel.com/ar", description: "وكالة سفر بالذكاء الاصطناعي مقرها الولايات المتحدة. Lina AI 24/7 بالعربية.", inLanguage: "ar", areaServed: ["United Arab Emirates", "Saudi Arabia", "Egypt", "Qatar", "Kuwait", "United States"] };
  return (
    <main lang="ar" dir="rtl" style={{ minHeight: "100vh", background: "#F8FAFF", padding: 24, maxWidth: 1100, margin: "0 auto", fontFamily: "system-ui, sans-serif", color: "#0f172a" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderBottom: "1px solid #e2e8f0", marginBottom: 32 }}>
        <Link href="/ar" style={{ fontSize: 22, fontWeight: 800, color: "#0B1B4D", textDecoration: "none" }}>Zeniva</Link>
        <nav style={{ display: "flex", gap: 16, fontSize: 14 }}>
          <Link href="/ar/lina" style={{ color: "#475569", textDecoration: "none" }}>تعرف على Lina</Link>
          <Link href="/chat" style={{ color: "#475569", textDecoration: "none" }}>دردشة</Link>
          <Link href="/" style={{ color: "#0F6CF5", textDecoration: "none" }}>EN</Link>
        </nav>
      </header>
      <section style={{ textAlign: "center", padding: "48px 16px 64px" }}>
        <div style={{ display: "inline-block", background: "#FEF3C7", color: "#92400E", padding: "6px 16px", borderRadius: 999, fontSize: 12, fontWeight: 700, marginBottom: 20 }}>وكيل سفر بالذكاء الاصطناعي · أمريكا</div>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 900, color: "#0B1B4D", lineHeight: 1.5, margin: "0 0 20px" }}>رحلتك مخططة ومحجوزة بالذكاء الاصطناعي — مع دعم بشري على مدار الساعة</h1>
        <p style={{ fontSize: 17, color: "#475569", lineHeight: 1.9, maxWidth: 720, margin: "0 auto 32px" }}>أخبر Lina أين تريد الذهاب، وستبني اقتراحًا كاملاً يتضمن الرحلات الجوية والفنادق ووسائل النقل في ثوانٍ. إذا احتجت إلى مساعدة بشرية، اكتب "أريد التحدث إلى إنسان".</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/chat?prompt=أريد تخطيط رحلة" style={{ background: "linear-gradient(90deg, #0F6CF5, #0B1B4D)", color: "white", padding: "16px 32px", borderRadius: 14, textDecoration: "none", fontWeight: 800, fontSize: 16 }}>💬 دردش مع Lina — مجاناً</Link>
          <Link href="/call" style={{ background: "white", color: "#0B1B4D", padding: "16px 32px", borderRadius: 14, textDecoration: "none", fontWeight: 800, fontSize: 16, border: "2px solid #0B1B4D" }}>📞 اتصال 24/7</Link>
        </div>
      </section>
      <section style={{ padding: "32px 0" }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: "#0B1B4D", marginBottom: 16 }}>ما يميز Zeniva</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {[
            { t: "حجوزات حقيقية", d: "حجز مباشر عبر Duffel (الرحلات) وLiteAPI (1.5 مليون+ فندق)." },
            { t: "تصعيد بشري 24/7", d: "اكتب \"أريد التحدث إلى إنسان\" في أي وقت — مستشار حقيقي يتولى فوراً." },
            { t: "سفر متخصص", d: "تأجير يخوت، فيلات خاصة، رحلات بحرية، حفلات زفاف في الوجهة." },
            { t: "متعدد اللغات تلقائي", d: "العربية، الإنجليزية، الفرنسية، الإسبانية، البرتغالية، الألمانية، الإيطالية." },
            { t: "مكالمات صوتية 24/7", d: "تحدث مع Lina بالصوت في /call." },
            { t: "خطط دفع ZeniPay", d: "أقساط بدون فوائد. عملات متعددة." },
          ].map((x, i) => (
            <div key={i} style={{ background: "white", padding: 22, borderRadius: 14, border: "1px solid #e2e8f0" }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "#0B1B4D", margin: "0 0 8px" }}>{x.t}</h3>
              <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.9, margin: 0 }}>{x.d}</p>
            </div>
          ))}
        </div>
      </section>
      <footer style={{ borderTop: "1px solid #e2e8f0", padding: "24px 0", marginTop: 32, fontSize: 13, color: "#475569", textAlign: "center" }}>© 2026 Zeniva LLC · Delaware, USA</footer>
    </main>
  );
}
