import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "认识Lina — Zeniva的AI旅行管家 | 24/7",
  description: "认识Lina,Zeniva的AI旅行管家。真实预订(航班、酒店、游艇、别墅、邮轮),24/7真人升级,多语言。免费。",
  keywords: ["Lina AI", "Lina旅行管家", "AI旅行社", "Lina评论"],
  alternates: { canonical: "https://www.zenivatravel.com/zh/lina", languages: { "en-US": "https://www.zenivatravel.com/lina" } },
  openGraph: { title: "认识Lina | Zeniva", description: "AI旅行管家。真实预订 + 24/7真人。", url: "https://www.zenivatravel.com/zh/lina", siteName: "Zeniva Travel", locale: "zh_CN", type: "profile", images: [{ url: "/branding/lina-avatar.png", width: 1200, height: 630, alt: "Lina Zeniva" }] },
};
export default function P() { return (
  <SeoPage h1="认识Lina — 您的AI旅行管家" subtitle="Lina是Zeniva背后的AI。她在几秒钟内规划您的旅行,通过持牌合作伙伴预订真实的航班和酒店,并在您需要时无缝转交给真人顾问。6种语言24/7可用。"
    heroImage="/branding/lina-avatar.png" heroGradient="from-blue-900/70 to-indigo-900/60" badge="AI旅行管家"
    sections={[
      { heading: "Lina是谁", content: `<p>Lina是一个专门构建的AI旅行管家 — 不是通用聊天机器人。建立在Anthropic Claude之上,具有连接到实时预订合作伙伴(航班使用Duffel,150万+酒店使用LiteAPI)的基础设施,Lina可以从一次对话中规划并预订您的整个旅行。</p>` },
      { heading: "Lina实际上做什么", content: `<p><strong>预订真实航班:</strong> Lina通过Duffel API查询300+航空公司的实时航班价格。</p><p><strong>预订真实酒店:</strong> 通过LiteAPI在全球150万+物业。</p><p><strong>专业旅行:</strong> 游艇租赁、私人别墅、邮轮、目的地婚礼。</p><p><strong>说您的语言:</strong> Lina自动检测中文、英语、法语、西班牙语、葡萄牙语、德语、意大利语。</p><p><strong>语音选项:</strong> 在/call通过电话与Lina交谈 — 24/7。</p><p><strong>转给真人:</strong> 随时输入"我想和真人交谈"。</p>` },
      { heading: "如何与Lina交谈", content: `<p><strong>网页聊天:</strong> 从任何设备访问 <a href="/chat">/chat</a>。</p><p><strong>语音通话:</strong> 访问 <a href="/call">/call</a> 通过语音交谈。24/7,6种语言。</p>` },
    ]}
    highlights={[
      { icon: "star", title: "真实预订", description: "通过Duffel和LiteAPI实时价格 — 不是估计。" },
      { icon: "shield", title: "真人安全网", description: "输入\"我想和真人交谈\" — 真正的顾问24/7接管。" },
      { icon: "phone", title: "语音 + 聊天", description: "网页/chat或电话/call。两者都24/7。" },
      { icon: "map", title: "6种语言自动", description: "EN, FR, ES, PT, DE, IT, ZH — Lina检测并响应。" },
      { icon: "anchor", title: "专业旅行", description: "游艇、别墅、邮轮、婚礼 — 通过Lina预订。" },
      { icon: "gift", title: "免费", description: "$0预订费。Zeniva从供应商佣金赚取。" },
    ]}
    faqs={[
      { question: "Lina真的是AI吗?", answer: "是的,Lina是建立在Anthropic Claude上的AI代理。如果您想要真人,输入\"我想和真人交谈\" — 真正的Zeniva顾问24/7接管。" },
      { question: "Lina是免费的吗?", answer: "是的。与Lina聊天免费,预订免费。Zeniva从供应商佣金赚取。" },
      { question: "价格是真实的吗?", answer: "是的 — 每个价格都来自Duffel(航班)或LiteAPI(酒店)的实时API调用。" },
      { question: "Lina会说中文吗?", answer: "是的 — Lina自动检测中文并以中文响应。" },
      { question: "如果预订出错怎么办?", answer: "在同一聊天中输入\"我想和真人交谈\"。真正的Zeniva顾问24/7接管。" },
    ]}
    ctaText="立即与Lina聊天" ctaPrompt="我想计划一次旅行"
    internalLinks={[ { label: "首页", href: "/zh" }, { label: "Lina如何工作", href: "/lina/how-it-works" }, { label: "与Lina语音", href: "/call" } ]}
    jsonLd={{ "@context": "https://schema.org", "@type": "Service", name: "Lina AI旅行管家", provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, serviceType: "AI Travel Concierge", areaServed: "Worldwide", inLanguage: "zh" }}
  />
); }
