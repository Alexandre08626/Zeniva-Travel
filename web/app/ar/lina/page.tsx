import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "تعرف على Lina — وكيل سفر AI من Zeniva | 24/7",
  description: "تعرف على Lina، وكيل السفر AI من Zeniva. حجوزات حقيقية (رحلات، فنادق، يخوت، فيلات، رحلات بحرية)، تصعيد بشري 24/7، متعدد اللغات. مجاني.",
  keywords: ["Lina AI", "وكيل سفر Lina", "وكالة سفر AI", "تقييم Lina"],
  alternates: { canonical: "https://www.zenivatravel.com/ar/lina", languages: { "en-US": "https://www.zenivatravel.com/lina" } },
  openGraph: { title: "تعرف على Lina | Zeniva", description: "وكيل سفر AI. حجوزات حقيقية + بشري 24/7.", url: "https://www.zenivatravel.com/ar/lina", siteName: "Zeniva Travel", locale: "ar", type: "profile", images: [{ url: "/branding/lina-avatar.png", width: 1200, height: 630, alt: "Lina Zeniva" }] },
};
export default function P() { return (
  <SeoPage h1="تعرف على Lina — وكيل سفر AI الخاص بك" subtitle="Lina هي الذكاء الاصطناعي وراء Zeniva. تخطط رحلتك في ثوانٍ، تحجز رحلات وفنادق حقيقية عبر شركاء مرخصين، وتنقلك بسلاسة إلى مستشار بشري عند الحاجة. متاحة على مدار الساعة بـ 6 لغات."
    heroImage="/branding/lina-avatar.png" heroGradient="from-blue-900/70 to-indigo-900/60" badge="وكيل سفر AI"
    sections={[
      { heading: "من هي Lina", content: `<p>Lina هي وكيل سفر بالذكاء الاصطناعي مصمم لغرض محدد — وليس روبوت دردشة عام. مبنية على Anthropic Claude مع بنية تحتية تتصل بشركاء الحجز المباشر (Duffel للرحلات، LiteAPI لأكثر من 1.5 مليون فندق)، يمكن لـ Lina التخطيط والحجز لرحلتك بأكملها من محادثة واحدة.</p>` },
      { heading: "ما تفعله Lina فعلياً", content: `<p><strong>حجز الرحلات الحقيقية:</strong> تستفسر Lina من Duffel API عن أسعار الرحلات المباشرة لأكثر من 300 شركة طيران.</p><p><strong>حجز الفنادق الحقيقية:</strong> أكثر من 1.5 مليون فندق عالمياً عبر LiteAPI.</p><p><strong>السفر المتخصص:</strong> تأجير اليخوت، الفيلات الخاصة، الرحلات البحرية، حفلات الزفاف في الوجهة.</p><p><strong>تتحدث لغتك:</strong> Lina تكشف تلقائياً اللغة العربية، الإنجليزية، الفرنسية، الإسبانية، البرتغالية، الألمانية، الإيطالية.</p><p><strong>خيار الصوت:</strong> تحدث مع Lina بالهاتف في /call — على مدار الساعة.</p><p><strong>تنقلك إلى إنسان:</strong> اكتب "أريد التحدث إلى إنسان" في أي وقت.</p>` },
      { heading: "كيف تتحدث مع Lina", content: `<p><strong>دردشة الويب:</strong> قم بزيارة <a href="/chat">/chat</a> من أي جهاز.</p><p><strong>مكالمة صوتية:</strong> قم بزيارة <a href="/call">/call</a> للتحدث بالصوت. 24/7، 6 لغات.</p>` },
    ]}
    highlights={[
      { icon: "star", title: "حجوزات حقيقية", description: "أسعار مباشرة عبر Duffel وLiteAPI — وليست تقديرات." },
      { icon: "shield", title: "شبكة أمان بشرية", description: "اكتب \"أريد التحدث إلى إنسان\" — مستشار حقيقي يتولى 24/7." },
      { icon: "phone", title: "صوت + دردشة", description: "ويب /chat أو مكالمات /call. كلاهما 24/7." },
      { icon: "map", title: "7 لغات تلقائي", description: "EN, FR, ES, PT, DE, IT, AR — Lina تكشف وترد." },
      { icon: "anchor", title: "سفر متخصص", description: "يخوت، فيلات، رحلات بحرية، حفلات زفاف — قابلة للحجز عبر Lina." },
      { icon: "gift", title: "مجاني", description: "$0 رسوم حجز. Zeniva تكسب من عمولات المورد." },
    ]}
    faqs={[
      { question: "هل Lina هي حقاً ذكاء اصطناعي؟", answer: "نعم، Lina هي وكيل ذكاء اصطناعي مبني على Anthropic Claude. إذا كنت تريد إنساناً، اكتب \"أريد التحدث إلى إنسان\" — مستشار Zeniva حقيقي يتولى 24/7." },
      { question: "هل Lina مجانية؟", answer: "نعم. الدردشة مع Lina مجانية، الحجز مجاني. Zeniva تكسب من عمولات المورد." },
      { question: "هل الأسعار حقيقية؟", answer: "نعم — كل سعر يأتي من استدعاء API مباشر إلى Duffel (الرحلات) أو LiteAPI (الفنادق)." },
      { question: "هل Lina تتحدث العربية؟", answer: "نعم — Lina تكشف تلقائياً اللغة العربية وترد بالعربية." },
      { question: "ماذا لو حدث خطأ في حجزي؟", answer: "اكتب \"أريد التحدث إلى إنسان\" في نفس الدردشة. مستشار Zeniva حقيقي يتولى 24/7." },
    ]}
    ctaText="تحدث مع Lina الآن" ctaPrompt="أريد تخطيط رحلة"
    internalLinks={[ { label: "الصفحة الرئيسية", href: "/ar" }, { label: "كيف تعمل Lina", href: "/lina/how-it-works" }, { label: "صوت Lina", href: "/call" } ]}
    jsonLd={{ "@context": "https://schema.org", "@type": "Service", name: "Lina AI وكيل سفر", provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, serviceType: "AI Travel Concierge", areaServed: "Worldwide", inLanguage: "ar" }}
  />
); }
