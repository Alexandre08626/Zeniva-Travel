import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How Lina AI Works — Technical Deep Dive | Zeniva",
  description: "How Lina, Zeniva's AI travel concierge, actually works. LLM architecture (Claude), live data (Duffel + LiteAPI), booking flow, human escalation, multilingual.",
  keywords: ["how Lina AI works", "Lina AI architecture", "Lina AI technology", "Anthropic Claude travel", "AI travel agent how it works"],
  openGraph: { title: "How Lina AI Works | Zeniva", description: "Technical deep dive — LLM, live data, booking flow, human escalation.", url: "https://www.zenivatravel.com/lina/how-it-works", siteName: "Zeniva Travel", type: "article", images: [{ url: "/branding/lina-avatar.png", width: 1200, height: 630, alt: "How Lina works" }] },
  alternates: { canonical: "https://www.zenivatravel.com/lina/how-it-works" },
};

export default function HowLinaWorksPage() {
  return (
    <SeoPage
      h1="How Lina AI Actually Works — Behind the Scenes"
      subtitle="An honest technical walkthrough of what Lina is, what infrastructure powers her, and how she's different from generic LLMs like ChatGPT or general AI travel chatbots."
      heroImage="/branding/lina-avatar.png"
      heroGradient="from-indigo-900/70 to-blue-900/60"
      badge="Technical deep dive"
      sections={[
        {
          heading: "1. The conversation layer (LLM)",
          content: `<p>Lina's conversational ability is built on Anthropic Claude — currently the same family of model behind Claude.ai. We chose Claude over GPT-class models for a few reasons: stronger instruction following for structured outputs (which matters when Lina needs to extract dates, group sizes, and budget from natural language), better refusal behavior when something is uncertain (vs hallucinating), and explicit Constitutional AI training that aligns with the kind of careful, professional tone we want for travel advice.</p>
<p>The base model gets a custom system prompt that gives Lina her personality (warm, direct, knowledgeable), her boundaries (never makes up flight numbers, always grounds prices in live data, escalates to human when uncertain), and her tools (the structured ways she can call booking APIs, save trips, request payments).</p>`,
        },
        {
          heading: "2. The live data layer (Duffel + LiteAPI + direct partners)",
          content: `<p>This is where Lina differs most from generic LLMs. When you ask Lina "what's the cheapest flight from Miami to Punta Cana on October 15th," she doesn't guess. She makes a real API call to Duffel (which aggregates 300+ airlines including Delta, American, JetBlue, KLM, Lufthansa, Air France, ANA, Singapore Airlines, plus low-cost carriers).</p>
<p>For hotels, Lina queries LiteAPI which aggregates 1.5+ million properties globally — including all-inclusive resort networks (Iberostar, Excellence, Hard Rock, Hyatt Ziva), luxury chains (Ritz-Carlton, Four Seasons, Aman, Six Senses), boutique hotels, and vacation rentals.</p>
<p>For specialty travel (yacht charters, private villas, cruises, destination weddings) Lina works with direct partner networks — relationships built and maintained by Zeniva's human team. These don't have public APIs, so Lina pulls from a curated database that the team updates.</p>
<p>The result: every price Lina shows is the actual bookable price at that moment. Not an estimate. Not a guess based on training data. A real number Duffel or LiteAPI just returned in the last few hundred milliseconds.</p>`,
        },
        {
          heading: "3. The booking layer (transactional)",
          content: `<p>When you confirm a trip with Lina, she doesn't just send you to another website. She processes the booking through Duffel/LiteAPI APIs — which means a real reservation gets created in the airline's system + the hotel's system. You receive confirmation emails directly from those suppliers (e.g., from American Airlines or Iberostar) plus a unified itinerary from Zeniva.</p>
<p>Payment flows through ZeniPay, our payment processor that supports USD, CAD, EUR, GBP, and other currencies. We offer 0% interest installment plans (split into 4 payments over 12-24 weeks) for any booking above $500.</p>
<p>The booking is fully traceable, refundable per supplier policy, and supported by Zeniva for the entire trip lifecycle.</p>`,
        },
        {
          heading: "4. The human escalation layer (24/7 advisors)",
          content: `<p>The biggest design decision in Lina's architecture is that she <em>doesn't try to be all things</em>. When a conversation requires human judgment — complex multi-city itineraries with constraints she can't fully model, refund disputes, real-time issues during travel, group bookings with special requirements — Lina hands the chat off to a real Zeniva travel advisor. The same chat thread continues, but a human takes over.</p>
<p>Trigger words: "I want to talk to a human", "talk to advisor", "this is too complex", and similar phrases all route to the human team. Advisors are available 24/7 across 6 languages (English, French, Spanish, Portuguese, German, Italian).</p>
<p>The escalation is bidirectional — humans can also bring Lina back into the conversation when they need her to handle research or quote generation.</p>`,
        },
        {
          heading: "5. The multilingual layer",
          content: `<p>Lina detects the language you're writing in and responds in the same language. This works because Claude has strong multilingual capabilities trained into the base model — it's not a separate translation layer.</p>
<p>For each supported language (EN, FR, ES, PT, DE, IT), the system prompt and response patterns have been tuned to match how a native speaker would actually communicate. Spanish from Madrid sounds slightly different from Spanish from Mexico City; we account for that.</p>`,
        },
        {
          heading: "6. The privacy + safety layer",
          content: `<p>Conversations are stored to provide service continuity (so you can resume a planning session days later) but are not used to train external models. Zeniva is a US LLC incorporated in Delaware with bank-grade encryption for payments and standard travel-industry data handling for personal information.</p>
<p>Lina has built-in refusals for things she shouldn't do (creating fake bookings, processing payments to non-supplier accounts, providing legal/medical advice). When she's uncertain, she defers to humans rather than making things up.</p>`,
        },
      ]}
      highlights={[
        { icon: "star", title: "Built on Claude", description: "Anthropic Claude as the conversation engine — chosen for instruction following + safety." },
        { icon: "anchor", title: "Live booking data", description: "Duffel for flights, LiteAPI for 1.5M hotels — every price is real-time." },
        { icon: "shield", title: "Real transactions", description: "Bookings processed through supplier APIs — not affiliate redirects." },
        { icon: "phone", title: "Human escalation 24/7", description: "Trigger words route to live travel advisors in 6 languages." },
        { icon: "map", title: "Multilingual native", description: "EN, FR, ES, PT, DE, IT — Claude's multilingual base + tuned prompts per language." },
        { icon: "gift", title: "Privacy + safety", description: "Conversations stored for continuity, not for external training. Built-in refusals for uncertain cases." },
      ]}
      faqs={[
        { question: "What LLM does Lina use?", answer: "Anthropic Claude. We chose Claude over GPT for stronger instruction following on structured booking outputs and safer refusal behavior on uncertain cases." },
        { question: "Are the prices Lina shows real?", answer: "Yes — every flight price comes from a live Duffel API call (300+ airlines), every hotel rate from LiteAPI (1.5M+ properties). Prices are real-time bookable rates, not estimates." },
        { question: "Can Lina hallucinate?", answer: "Modern LLMs can hallucinate but Lina is grounded in live data for everything price/availability-related. The system prompt also explicitly tells her to defer to humans when uncertain rather than guess." },
        { question: "Who answers when I escalate to a human?", answer: "Real Zeniva travel advisors — credentialed agents who work for Zeniva. Available 24/7 across 6 languages." },
        { question: "Is my conversation private?", answer: "Yes. Conversations are stored only to provide service continuity (so you can resume a saved trip), not used for external model training. Bank-grade encryption for payments." },
        { question: "Why not just use ChatGPT for travel?", answer: "ChatGPT is great for research but can't book real trips, doesn't have live pricing, and can't escalate to humans when something goes wrong. Lina is purpose-built for the booking + support job that ChatGPT can't do." },
      ]}
      ctaText="Chat with Lina now"
      ctaPrompt="I'd like to plan a trip"
      internalLinks={[
        { label: "Meet Lina", href: "/lina" },
        { label: "AI Travel Agent Service", href: "/services/ai-travel-agent" },
        { label: "Zeniva vs ChatGPT for Travel", href: "/compare/zeniva-vs-chatgpt-for-travel" },
        { label: "Best AI Travel Agents 2026", href: "/blog/best-ai-travel-agents-usa-2026" },
      ]}
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "TechArticle",
        headline: "How Lina AI Works — Technical Deep Dive",
        author: { "@type": "Organization", name: "Zeniva Travel" },
        datePublished: "2026-04-28",
        publisher: { "@type": "Organization", name: "Zeniva Travel", logo: { "@type": "ImageObject", url: "https://www.zenivatravel.com/branding/logo.png" } },
        about: { "@type": "Person", name: "Lina", jobTitle: "AI Travel Concierge" },
      }}
    />
  );
}
