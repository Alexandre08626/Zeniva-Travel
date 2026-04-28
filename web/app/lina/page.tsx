import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meet Lina — Zeniva's AI Travel Concierge | Available 24/7",
  description: "Meet Lina, Zeniva's AI travel concierge. Real bookings (flights, hotels, yachts, villas, cruises), 24/7 human escalation, multilingual EN/FR/ES/PT/DE/IT. Free to use.",
  keywords: [
    "Lina AI", "Lina travel agent", "Zeniva Lina", "AI travel concierge Lina",
    "what is Lina AI", "Lina AI review", "talk to Lina", "Lina Zeniva",
    "Lina AI travel review", "is Lina AI safe", "Lina AI booking",
  ],
  alternates: {
    canonical: "https://www.zenivatravel.com/lina",
    languages: {
      "en-US": "https://www.zenivatravel.com/lina",
      "fr-CA": "https://www.zenivatravel.com/fr/lina",
      "es": "https://www.zenivatravel.com/es/lina",
      "pt": "https://www.zenivatravel.com/pt/lina",
      "de": "https://www.zenivatravel.com/de/lina",
      "it": "https://www.zenivatravel.com/it/lina",
    },
  },
  openGraph: {
    title: "Meet Lina — Zeniva's AI Travel Concierge",
    description: "Real bookings, 24/7 human escalation, multilingual. Free to use.",
    url: "https://www.zenivatravel.com/lina",
    siteName: "Zeniva Travel",
    type: "profile",
    images: [{ url: "/branding/lina-avatar.png", width: 1200, height: 630, alt: "Lina — Zeniva AI Travel Concierge" }],
  },
};

export default function LinaPage() {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Lina",
    jobTitle: "AI Travel Concierge",
    worksFor: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" },
    image: "https://www.zenivatravel.com/branding/lina-avatar.png",
    description: "Lina is Zeniva's AI travel concierge — built on Anthropic Claude with real booking infrastructure (Duffel + LiteAPI) and 24/7 human travel advisor escalation. Multilingual: English, French, Spanish, Portuguese, German, Italian.",
    knowsLanguage: ["English", "French", "Spanish", "Portuguese", "German", "Italian"],
    url: "https://www.zenivatravel.com/lina",
    sameAs: [
      "https://www.zenivatravel.com/chat",
      "https://www.zenivatravel.com/call",
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      <SeoPage
        h1="Meet Lina — Your AI Travel Concierge"
        subtitle="Lina is the AI behind Zeniva. She plans your trip in seconds, books real flights and hotels through licensed partners, and seamlessly hands you off to a human travel advisor when you need one. Available 24/7 in 6 languages."
        heroImage="/branding/lina-avatar.png"
        heroGradient="from-blue-900/70 to-indigo-900/60"
        badge="AI Travel Concierge"
        sections={[
          {
            heading: "Who is Lina",
            content: `<p>Lina is a purpose-built AI travel concierge — not a generic chatbot. Built on Anthropic Claude with custom infrastructure that connects to live booking partners (Duffel for flights, LiteAPI for 1.5M+ hotels), Lina can plan AND book your entire trip from a single chat.</p>
<p>She's the front door to Zeniva, a US-based AI travel agency incorporated in Delaware. When you talk to Lina, you're talking to the same brain that handles thousands of trips per month — but personalized to your dates, group size, budget, and style.</p>
<p>Lina has a personality designed to be warm, knowledgeable, and direct. She won't waste your time with sales tactics. If your question requires human judgment (complex itineraries, refund disputes, real-time emergencies), she escalates instantly to one of Zeniva's licensed travel advisors — 24/7.</p>`,
          },
          {
            heading: "What Lina actually does",
            content: `<p><strong>Books real flights:</strong> Lina queries Duffel API for live flight prices across 300+ airlines. The number she shows you is the actual bookable price, not a guess.</p>
<p><strong>Books real hotels:</strong> 1.5M+ properties globally via LiteAPI partner, including all-inclusive resorts, boutique hotels, luxury chains, vacation rentals.</p>
<p><strong>Coordinates specialty travel:</strong> Yacht charters, private villas, cruises (every major line), destination weddings — categories most AI chatbots don't touch.</p>
<p><strong>Speaks your language:</strong> Lina detects whether you're writing in English, French, Spanish, Portuguese, German, or Italian and responds in the same language. No manual switching.</p>
<p><strong>Voice option:</strong> Talk to Lina by phone at /call — 24/7 voice conversation in any of her languages.</p>
<p><strong>Hands you to a human:</strong> Type "I want to talk to a human" any time. A real travel advisor takes the case immediately. This is the differentiator versus pure-AI chatbots.</p>`,
          },
          {
            heading: "How Lina is different from ChatGPT, Claude, or other LLMs",
            content: `<p>You can ask ChatGPT or Claude to "plan a trip to Bali" and get a decent answer. But neither can <em>book</em> the trip. Neither knows the real-time price of a hotel room next Tuesday. Neither can take responsibility when your flight gets canceled at midnight.</p>
<p>Lina is built on the same class of LLM (Anthropic Claude under the hood) but adds:</p>
<ul>
<li><strong>Live data grounding</strong> — every flight price, every hotel rate, every availability check is queried in real time from booking partners</li>
<li><strong>Real booking transactions</strong> — Lina processes payment via ZeniPay and creates real reservations in supplier systems</li>
<li><strong>Human handoff</strong> — when AI isn't enough, Zeniva's travel advisor team takes over the same chat thread</li>
<li><strong>Trip-lifecycle support</strong> — Lina remembers your trip and is reachable during travel, not just at booking</li>
</ul>
<p>Generic LLMs are great for research. Lina is the agent that turns research into a booked trip with support behind it.</p>`,
          },
          {
            heading: "How to talk to Lina",
            content: `<p><strong>Web chat:</strong> Visit <a href="/chat">zenivatravel.com/chat</a> from any device. Type what you want, Lina responds in seconds.</p>
<p><strong>Voice call:</strong> Visit <a href="/call">zenivatravel.com/call</a> to talk by voice. Available 24/7 in 6 languages.</p>
<p><strong>Specific trip request:</strong> Use prompts like "Plan me a 5-night honeymoon in Bora Bora for two travelers, $8,000 budget, leaving in October" — Lina builds the full proposal in 30-60 seconds.</p>
<p><strong>From any service page:</strong> Service pages on Zeniva (yacht charter, villa rental, cruises, etc) all have a chat button that pre-fills the conversation context.</p>`,
          },
          {
            heading: "Privacy and trust",
            content: `<p>Conversations with Lina are private and stored only to provide service continuity (so you can come back to a saved trip). Zeniva is a US LLC incorporated in Delaware with offices in New York and Virginia. We're members of the relevant industry bodies and use bank-grade encryption for payments.</p>
<p>Booking confirmations come from licensed travel partners (Duffel-backed airlines, LiteAPI-backed hotels). Your trip is real, traceable, and supported.</p>`,
          },
        ]}
        highlights={[
          { icon: "star", title: "Real bookings", description: "Live flight + hotel prices via Duffel and LiteAPI — not estimates." },
          { icon: "shield", title: "Human safety net", description: "Type 'I want to talk to a human' — real advisor takes over 24/7." },
          { icon: "phone", title: "Voice + chat", description: "Web chat at /chat or voice calls at /call. Both 24/7." },
          { icon: "map", title: "6 languages auto", description: "EN, FR, ES, PT, DE, IT — Lina detects and responds." },
          { icon: "anchor", title: "Specialty travel", description: "Yacht, villa, cruise, destination weddings — bookable through Lina." },
          { icon: "gift", title: "Free to use", description: "$0 booking fees. Zeniva earns supplier commissions." },
        ]}
        faqs={[
          { question: "Is Lina really an AI or actually a human?", answer: "Lina is an AI agent built on Anthropic Claude with custom travel infrastructure. If you want a human, type 'I want to talk to a human' anytime — a real Zeniva travel advisor takes over the same chat 24/7." },
          { question: "Is Lina free to use?", answer: "Yes. There's no fee to chat with Lina, no fee to book a trip through her. Zeniva earns supplier commissions (industry standard for travel agencies) — that's how we monetize, not customer fees." },
          { question: "How accurate are the prices Lina shows?", answer: "Prices are queried live from Duffel (flights) and LiteAPI (hotels) at the moment Lina shows them. They're the actual bookable prices, not estimates. Final price at confirmation may vary slightly if you change dates or room category, but never with hidden fees." },
          { question: "Can Lina speak my language?", answer: "Lina supports English, French, Spanish, Portuguese, German, and Italian — auto-detected. Write in your language, she responds in your language. No manual switching." },
          { question: "What happens if my booking goes wrong?", answer: "Type 'I want to talk to a human' in the same chat. A real Zeniva travel advisor takes the case 24/7 — they handle cancellations, rebookings, refunds, supplier disputes." },
          { question: "Where can I talk to Lina?", answer: "Web chat: zenivatravel.com/chat. Voice call: zenivatravel.com/call. Both 24/7." },
          { question: "Does Lina work outside the USA?", answer: "Yes. Zeniva is US-based but Lina serves travelers globally — we have dedicated departure-city pages for 12 international cities (London, Paris, Sydney, Tokyo, Singapore, Dubai, Mexico City, São Paulo, Frankfurt, Rome, Madrid, Amsterdam) plus 40 USA + Canada cities." },
          { question: "Is Lina the same as ChatGPT?", answer: "No. ChatGPT is a general-purpose LLM. Lina is built on a similar class of LLM (Anthropic Claude) but with live booking data, real transaction infrastructure, and human travel advisor escalation. ChatGPT can suggest trips; Lina books them and supports them." },
        ]}
        ctaText="Chat with Lina now"
        ctaPrompt="I'd like to plan a trip"
        internalLinks={[
          { label: "How Lina Works (deep dive)", href: "/lina/how-it-works" },
          { label: "AI Travel Agent Service", href: "/services/ai-travel-agent" },
          { label: "Voice Call Lina", href: "/call" },
          { label: "Best AI Travel Agents 2026", href: "/blog/best-ai-travel-agents-usa-2026" },
          { label: "Zeniva vs ChatGPT for Travel", href: "/compare/zeniva-vs-chatgpt-for-travel" },
        ]}
      />
    </>
  );
}
