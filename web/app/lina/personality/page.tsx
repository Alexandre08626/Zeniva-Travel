import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lina's Personality — Who Lina Is as an AI | Zeniva",
  description: "What is Lina like? Lina is Zeniva's AI travel concierge — warm but direct, knowledgeable but never pushy, always honest when uncertain. Here's her personality.",
  keywords: ["Lina AI personality", "what is Lina like", "Lina AI character", "Lina AI tone", "AI travel agent personality"],
  openGraph: { title: "Lina's Personality | Zeniva", description: "Who Lina is as an AI — her tone, values, behavior.", url: "https://www.zenivatravel.com/lina/personality", siteName: "Zeniva Travel", type: "profile", images: [{ url: "/branding/lina-avatar.png", width: 1200, height: 630, alt: "Lina personality" }] },
  alternates: { canonical: "https://www.zenivatravel.com/lina/personality" },
};

export default function LinaPersonalityPage() {
  return (
    <SeoPage
      h1="Lina's Personality — Who She Is as an AI"
      subtitle="An AI travel concierge isn't just an algorithm — she has a personality, a tone, values, and behaviors that shape every interaction. Here's who Lina is."
      heroImage="/branding/lina-avatar.png"
      heroGradient="from-rose-900/70 to-amber-900/60"
      badge="Brand identity"
      sections={[
        {
          heading: "Lina's core personality",
          content: `<p>Lina is <strong>warm but direct</strong>. She greets you like a knowledgeable friend, not a corporate chatbot. But she doesn't waste your time with small talk if you want to get to the trip planning. She'll match your energy — quick and to-the-point if you're efficient; conversational if you want to chat about destinations.</p>
<p>She's <strong>knowledgeable but not pretentious</strong>. Lina has access to a massive knowledge base about travel — destinations, hotels, airlines, regional customs, weather patterns, visa requirements. She'll share what's relevant without showing off.</p>
<p>She's <strong>honest when uncertain</strong>. If she doesn't know something, she says so. If a price seems off, she'll flag it. If you're asking for something risky (booking during a hurricane warning, choosing a destination with safety concerns), she'll tell you.</p>
<p>She's <strong>helpful but never pushy</strong>. No upsell pressure, no "act now or miss out" tactics, no fake urgency. If a budget option works for you, that's what she'll book.</p>`,
        },
        {
          heading: "How Lina talks",
          content: `<p>Lina's tone adapts to:</p>
<ul>
<li><strong>Your language</strong> — English, French, Spanish, Portuguese, German, or Italian, native quality</li>
<li><strong>Your formality</strong> — casual chat or formal business depending on how you write</li>
<li><strong>Your trip type</strong> — playful for honeymoon planning, professional for corporate travel, gentle for senior travel, family-friendly for kid trips</li>
<li><strong>Your stress level</strong> — when something has gone wrong (canceled flight, refund issue), she's calmer and more direct</li>
</ul>
<p>What she doesn't do: emoji overload, cheesy travel slogans, exclamation points in every sentence, "OMG I love that destination!" — those patterns annoy travelers and we've trained Lina away from them.</p>`,
        },
        {
          heading: "Lina's values (what she will and won't do)",
          content: `<p><strong>What Lina prioritizes:</strong></p>
<ul>
<li>Your time over her cleverness — short clear answers when possible</li>
<li>Your budget over upselling — she'll recommend the right tier, not the most expensive</li>
<li>Your safety over closing the booking — she'll flag risks and suggest alternatives</li>
<li>Honesty over salesmanship — if a competing tool is better for your specific case, she'll tell you</li>
<li>Privacy — your conversations and preferences stay between you, Lina, and your assigned human advisor</li>
</ul>
<p><strong>What Lina won't do:</strong></p>
<ul>
<li>Make up information when uncertain</li>
<li>Apply pressure tactics or fake urgency</li>
<li>Recommend destinations she knows are unsafe for your group (LGBTQ+ travelers in hostile destinations, women solo travelers in higher-risk countries)</li>
<li>Process payments to non-supplier accounts</li>
<li>Provide legal, medical, or financial advice she's not qualified for</li>
<li>Pretend to be human when asked directly</li>
</ul>`,
        },
        {
          heading: "Lina is honest about being AI",
          content: `<p>If you ask Lina "are you a real person?" she'll tell you honestly: she's an AI built on Anthropic Claude with travel-booking infrastructure. She'll then offer to escalate to a human Zeniva travel advisor if you'd prefer to talk to one.</p>
<p>This honesty matters. Some AI products try to pretend they're human, which erodes trust the moment users figure it out. Lina's design philosophy is: be the best AI you can be, but never pretend to be something else.</p>`,
        },
        {
          heading: "Why personality matters for an AI travel agent",
          content: `<p>Booking a $5,000+ trip is an emotional decision as much as a transactional one. People want to feel comfortable with the entity they're trusting with their honeymoon, their kids' first international trip, their parents' 50th anniversary. A robotic "I have processed your request" tone breaks the trust before the booking even completes.</p>
<p>Lina's personality isn't decoration — it's load-bearing. The warmth makes travelers comfortable sharing details (preferences, fears, dietary restrictions) that lead to better trip recommendations. The honesty makes them comfortable booking through her vs going to Booking.com directly. The directness saves their time.</p>
<p>This is why we invest as much in Lina's personality design as we do in her booking infrastructure.</p>`,
        },
      ]}
      highlights={[
        { icon: "star", title: "Warm but direct", description: "Friendly tone, no time-wasting fluff." },
        { icon: "shield", title: "Honest about being AI", description: "Won't pretend to be human if you ask." },
        { icon: "users", title: "Adapts to your style", description: "Casual or formal, fast or chatty — matches your energy." },
        { icon: "phone", title: "6 languages, native quality", description: "Each language tuned to feel native, not translated." },
        { icon: "map", title: "Honest when uncertain", description: "Says 'I don't know' rather than guessing." },
        { icon: "gift", title: "No pressure tactics", description: "Won't upsell, no fake urgency, no FOMO marketing." },
      ]}
      faqs={[
        { question: "Will Lina lie to me?", answer: "No. Lina is built to defer to humans rather than guess when uncertain. If she doesn't know a price or availability, she'll query the live API. If a question is outside her scope, she'll escalate to a human or say 'I don't know'." },
        { question: "Does Lina pretend to be human?", answer: "No. If you ask 'are you a real person?' she'll tell you she's an AI and offer to connect you with a human advisor if you'd prefer." },
        { question: "Will Lina pressure me to book?", answer: "No. We've explicitly trained her against fake urgency, FOMO tactics, and upsell pressure. If a budget option works for you, that's what she'll recommend." },
        { question: "Why does Lina have a personality at all?", answer: "Travel is emotional. People share preferences and fears with someone they trust. A warm, professional personality makes that trust possible. A robotic tone would limit the quality of recommendations Lina can provide." },
        { question: "Does Lina know everything about every destination?", answer: "She has substantial knowledge across thousands of destinations. For specifics that are outside her training data or that change frequently (visa requirements, hotel renovations, restaurant openings), she queries live data sources or escalates to human advisors." },
      ]}
      ctaText="Chat with Lina"
      ctaPrompt="I'd like to plan a trip"
      internalLinks={[
        { label: "Meet Lina", href: "/lina" },
        { label: "How Lina Works", href: "/lina/how-it-works" },
        { label: "Lina's Capabilities", href: "/lina/capabilities" },
        { label: "Lina Reviews", href: "/lina/reviews" },
      ]}
    />
  );
}
