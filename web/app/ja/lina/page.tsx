import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Linaに会う — ZenivaのAI旅行コンシェルジュ | 24/7",
  description: "ZenivaのAI旅行コンシェルジュLinaを紹介。実際の予約(フライト、ホテル、ヨット、ヴィラ、クルーズ)、24/7人間エスカレーション、多言語対応。無料。",
  keywords: ["Lina AI", "Linaコンシェルジュ", "AI旅行代理店", "Lina評判", "Linaとチャット"],
  alternates: { canonical: "https://www.zenivatravel.com/ja/lina", languages: { "en-US": "https://www.zenivatravel.com/lina" } },
  openGraph: { title: "Linaに会う | Zeniva", description: "AI旅行コンシェルジュ。実際の予約 + 24/7人間サポート。", url: "https://www.zenivatravel.com/ja/lina", siteName: "Zeniva Travel", locale: "ja_JP", type: "profile", images: [{ url: "/branding/lina-avatar.png", width: 1200, height: 630, alt: "Lina — Zeniva" }] },
};
export default function P() { return (
  <SeoPage h1="Linaに会う — あなたのAI旅行コンシェルジュ" subtitle="LinaはZenivaのAIです。あなたの旅行を秒で企画し、ライセンスを持つパートナーを通じて実際のフライトやホテルを予約します。必要に応じて人間のアドバイザーにスムーズに引き継ぎます。6言語で24/7利用可能。"
    heroImage="/branding/lina-avatar.png" heroGradient="from-blue-900/70 to-indigo-900/60" badge="AI旅行コンシェルジュ"
    sections={[
      { heading: "Linaとは", content: `<p>Linaは、汎用チャットボットではなく、目的を持って構築されたAI旅行コンシェルジュです。Anthropic Claudeをベースに、ライブ予約パートナー(フライトのDuffel、150万以上のホテルのLiteAPI)に接続するインフラストラクチャで構築されたLinaは、1つの会話からあなたの旅行全体を計画し、予約することができます。</p>` },
      { heading: "Linaができること", content: `<p><strong>本物のフライト予約:</strong> 300以上の航空会社のリアルタイム価格をDuffel APIで確認。</p><p><strong>本物のホテル予約:</strong> LiteAPI経由で世界中の150万以上の物件。</p><p><strong>専門旅行:</strong> ヨットチャーター、プライベートヴィラ、クルーズ、デスティネーションウェディング。</p><p><strong>あなたの言語:</strong> 日本語、英語、フランス語、スペイン語、ポルトガル語、ドイツ語、イタリア語を自動検出。</p><p><strong>音声オプション:</strong> /callで電話でLinaと話せます — 24/7。</p><p><strong>人間に渡す:</strong> いつでも「人と話したい」と入力。</p>` },
      { heading: "Linaと話す方法", content: `<p><strong>ウェブチャット:</strong> <a href="/chat">/chat</a>を任意のデバイスから訪問。</p><p><strong>音声通話:</strong> <a href="/call">/call</a>で音声で話す。24/7、6言語対応。</p>` },
    ]}
    highlights={[
      { icon: "star", title: "本物の予約", description: "DuffelとLiteAPI経由のライブ価格 — 推定ではない。" },
      { icon: "shield", title: "人間のセーフティネット", description: "「人と話したい」と入力 — 本物のアドバイザーが24/7対応。" },
      { icon: "phone", title: "音声 + チャット", description: "ウェブ /chat または通話 /call。両方24/7。" },
      { icon: "map", title: "6言語自動", description: "EN, FR, ES, PT, DE, IT, JA — Linaが検出して応答。" },
      { icon: "anchor", title: "専門旅行", description: "ヨット、ヴィラ、クルーズ、ウェディング — Linaで予約可能。" },
      { icon: "gift", title: "無料", description: "予約手数料$0。Zenivaはサプライヤー手数料で稼ぐ。" },
    ]}
    faqs={[
      { question: "Linaは本当にAIですか?", answer: "はい、LinaはAnthropic Claudeで構築されたAIエージェントです。人間が必要な場合は「人と話したい」と入力すると、本物のZenivaアドバイザーが24/7対応します。" },
      { question: "Linaは無料ですか?", answer: "はい。Linaとのチャットは無料、予約も無料です。Zenivaはサプライヤー手数料で稼ぎます。" },
      { question: "価格は本物ですか?", answer: "はい — Duffel(フライト)とLiteAPI(ホテル)へのライブAPI呼び出しから取得。Linaが表示した時点での実際の予約可能な価格です。" },
      { question: "Linaは日本語を話しますか?", answer: "はい — 日本語を自動検出し、日本語で応答します。" },
      { question: "予約に問題があった場合は?", answer: "同じチャットで「人と話したい」と入力。Zenivaの本物のアドバイザーが24/7対応します。" },
    ]}
    ctaText="今すぐLinaとチャット" ctaPrompt="旅行を計画したい"
    internalLinks={[ { label: "ホーム", href: "/ja" }, { label: "Linaの仕組み", href: "/lina/how-it-works" }, { label: "Linaの音声通話", href: "/call" } ]}
    jsonLd={{ "@context": "https://schema.org", "@type": "Service", name: "Lina AI旅行コンシェルジュ", provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, serviceType: "AI Travel Concierge", description: "24/7利用可能なAI旅行コンシェルジュ。実際の予約と人間エスカレーション付き。", areaServed: "Worldwide", inLanguage: "ja" }}
  />
); }
