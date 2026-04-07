import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Travel Agent — Book With Lina 24/7 | Zeniva",
  description:
    "Plan and book your perfect trip with Lina, Zeniva's AI travel agent. Flights, hotels, villas — instant quotes, 24/7, no fees.",
  openGraph: {
    title: "AI Travel Agent — Book With Lina 24/7 | Zeniva",
    description:
      "Plan and book your perfect trip with Lina, Zeniva's AI travel agent. Flights, hotels, villas — instant quotes, 24/7, no fees.",
    url: "https://www.zenivatravel.com/services/ai-travel-agent",
    siteName: "Zeniva Travel",
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "AI Travel Agent — Zeniva",
      },
    ],
  },
  alternates: {
    canonical: "https://www.zenivatravel.com/services/ai-travel-agent",
  },
};

export default function AITravelAgentPage() {
  return (
    <SeoPage
      h1="AI Travel Agent — Book With Lina 24/7"
      subtitle="Your always-on travel assistant that finds the best flights, hotels, villas, and experiences in seconds — no booking fees, ever."
      heroImage="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-blue-900/80 to-indigo-900/60"
      badge="Powered by AI"
      sections={[
        {
          heading: "Meet Lina — Your Personal AI Travel Agent",
          content: `<p>Planning a trip used to mean hours of searching through dozens of tabs, comparing prices across different booking sites, and hoping you didn't miss a better deal somewhere else. Lina changes all of that. She's Zeniva's AI-powered travel agent, built from the ground up to handle every aspect of trip planning — from the first spark of inspiration to the final booking confirmation.</p>
<p>Lina connects directly to live inventory from airlines, hotel chains, boutique properties, villa networks, yacht charters, car rental agencies, and experience providers worldwide. When you ask her to find a beachfront villa in Tulum for eight guests in March, she doesn't just give you a generic list — she searches real-time availability, compares rates across suppliers, and presents you with curated options that match your budget, travel dates, and preferences.</p>
<p>Unlike traditional travel agents who work business hours and charge service fees, Lina is available around the clock, every single day of the year. Whether it's 2 AM and you just realized you need to rebook a connecting flight, or Sunday morning and you want to add a sunset sailing excursion to your Santorini itinerary, Lina is ready to help instantly.</p>`,
        },
        {
          heading: "How Lina Works — From Chat to Confirmation",
          content: `<p>Using Lina is as simple as having a conversation. Open the chat on Zeniva's website, describe what you're looking for in plain language, and Lina takes it from there. There are no forms to fill out, no dropdowns to navigate — just tell her what you want.</p>`,
          subSections: [
            {
              heading: "Step 1: Tell Lina What You Need",
              content: `<p>Start by describing your ideal trip. You can be as vague as "I want a warm beach vacation in February for under $3,000" or as specific as "I need a direct flight from JFK to Cancun on March 15, a 4-star all-inclusive resort for 5 nights, and a private airport transfer." Lina understands natural language in English, French, Spanish, Portuguese, and several other languages, so you can communicate in whichever feels most comfortable.</p>`,
            },
            {
              heading: "Step 2: Review Your Personalized Proposals",
              content: `<p>Within seconds, Lina searches across hundreds of suppliers and presents you with a tailored proposal. Each option includes real pricing, photos, key details like cancellation policies, and a clear breakdown of what's included. She'll highlight the best value picks and flag any time-sensitive deals that might expire soon.</p>`,
            },
            {
              heading: "Step 3: Refine and Customize",
              content: `<p>Not quite right? Just tell Lina what to change. "Can you find something closer to the beach?" or "I'd prefer a non-stop flight" — she'll instantly adjust the search and present updated options. This back-and-forth process is what makes Lina so much faster than traditional booking. There's no waiting for an agent to call you back or re-run a search manually.</p>`,
            },
            {
              heading: "Step 4: Book and Pay Securely",
              content: `<p>Once you've found the perfect option, confirm your booking directly in the chat. Lina processes your payment through ZeniPay, Zeniva's secure payment platform. You'll receive an instant confirmation email with all your booking details, and your itinerary is saved in your Zeniva dashboard for easy access anytime.</p>`,
            },
          ],
        },
        {
          heading: "What Can Lina Book?",
          content: `<p>Lina isn't limited to flights and hotels. She's connected to a vast network of travel suppliers, giving you access to virtually every type of travel product you might need:</p>
<p><strong>Flights:</strong> Economy to first class on major and regional airlines worldwide. Lina finds the best fares, flags price drops, and can handle complex multi-city itineraries with ease. She monitors baggage policies, seat selection availability, and layover times to make sure every connection works smoothly.</p>
<p><strong>Hotels & Resorts:</strong> From budget-friendly stays to ultra-luxury five-star resorts. Lina searches across all major hotel booking platforms plus exclusive inventory you won't find on consumer sites, including negotiated Zeniva-exclusive rates at select properties.</p>
<p><strong>Villas & Vacation Rentals:</strong> Private villas, beachfront condos, mountain chalets, and city apartments. Ideal for families, groups, or anyone who wants more space and privacy than a hotel room. Lina verifies availability in real time and can coordinate cleaning, concierge, and chef services at many properties.</p>
<p><strong>Yacht Charters:</strong> Crewed and bareboat yacht charters across the Caribbean, Mediterranean, and beyond. Whether you want a catamaran for a week in the BVI or a superyacht in the French Riviera, Lina connects you with vetted charter companies.</p>
<p><strong>Car Rentals & Transfers:</strong> Airport pickups, private drivers, luxury car rentals, and shuttle services. Lina ensures seamless ground transportation so you never waste time figuring out how to get from point A to point B.</p>
<p><strong>Experiences & Activities:</strong> Guided tours, cooking classes, diving excursions, wine tastings, helicopter rides, and thousands of other curated experiences. Lina can weave these into your itinerary so everything fits together perfectly.</p>`,
        },
        {
          heading: "Why Choose an AI Agent Over Traditional Booking?",
          content: `<p>Traditional online travel agencies give you a search box and thousands of results to sort through yourself. Traditional human agents offer personalized service but charge fees and work limited hours. Lina combines the best of both worlds — personalized, intelligent recommendations with the speed and availability of software.</p>
<p>There are no booking fees when you use Lina. Zeniva earns its commission from supplier partnerships, which means the price you see is the price you pay. In many cases, Lina can actually surface better rates than you'd find booking directly, thanks to Zeniva's negotiated deals and volume pricing with hotel groups and airlines.</p>
<p>Speed matters when travel deals are involved. Flash sales, limited inventory at boutique properties, and fluctuating airfare mean that the faster you can search and book, the more likely you are to lock in the best price. Lina returns results in seconds, not hours or days.</p>`,
        },
        {
          heading: "Human Backup — Always Available",
          content: `<p>While Lina handles the vast majority of trip planning seamlessly, some situations call for a human touch. Complex multi-destination itineraries spanning several countries, special accessibility requirements, group travel coordination for 20+ guests, or high-value luxury bookings that involve bespoke negotiations — these are moments where Zeniva's human travel advisors step in.</p>
<p>You can request a human advisor at any point during your conversation with Lina. There's no runaround — just say "I'd like to speak to a person" and a Zeniva team member will pick up the conversation with full context of everything you've already discussed. No repeating yourself, no starting over. The handoff is seamless, and the human team has access to all the same inventory and pricing tools that Lina uses.</p>
<p>This hybrid approach means you get the instant, 24/7 convenience of AI for straightforward bookings and the expertise of seasoned travel professionals when you need it most.</p>`,
        },
      ]}
      highlights={[
        {
          icon: "clock",
          title: "Available 24/7",
          description:
            "Lina never sleeps. Get instant help booking flights, hotels, and activities at any hour — weekends and holidays included.",
        },
        {
          icon: "dollar-sign",
          title: "No Booking Fees",
          description:
            "Zero service charges. The price Lina quotes is the price you pay, with no hidden markups or surprise fees at checkout.",
        },
        {
          icon: "zap",
          title: "Instant Quotes",
          description:
            "Real-time pricing from hundreds of suppliers delivered in seconds. No waiting for callbacks or email quotes.",
        },
        {
          icon: "globe",
          title: "Multi-Language Support",
          description:
            "Chat with Lina in English, French, Spanish, Portuguese, and more. She adapts to your preferred language automatically.",
        },
        {
          icon: "layers",
          title: "All-in-One Booking",
          description:
            "Flights, hotels, villas, yachts, cars, transfers, and experiences — plan and book everything in a single conversation.",
        },
        {
          icon: "users",
          title: "Human Backup Team",
          description:
            "Need a real person? Request a human advisor anytime and they'll pick up right where Lina left off, with full context.",
        },
      ]}
      faqs={[
        {
          question: "Is Lina really free to use?",
          answer:
            "Yes. There are absolutely no fees for using Lina. Zeniva earns commissions from travel suppliers, so you pay the same price — or often less — than booking directly. Lina's service, recommendations, and itinerary planning are completely free.",
        },
        {
          question: "What can Lina book?",
          answer:
            "Lina can book flights on major and regional airlines, hotels and resorts worldwide, private villas and vacation rentals, yacht charters, car rentals, airport transfers, and thousands of curated experiences and activities. If it's travel-related, Lina can likely help.",
        },
        {
          question: "How accurate are the quotes Lina provides?",
          answer:
            "Lina pulls live pricing directly from supplier inventory systems, so quotes reflect real-time availability and rates. Prices are locked in once you confirm your booking. In rare cases where a supplier's inventory changes between quote and booking, Lina will notify you immediately and offer alternatives.",
        },
        {
          question: "Can I talk to a human instead?",
          answer:
            "Absolutely. At any point during your conversation, just ask to speak with a human advisor. A Zeniva travel expert will join the chat with full context of your conversation — no need to repeat anything. The transition is seamless.",
        },
        {
          question: "What languages does Lina speak?",
          answer:
            "Lina communicates fluently in English, French, Spanish, and Portuguese, with growing support for additional languages. She automatically detects your preferred language and responds accordingly. You can also switch languages mid-conversation.",
        },
      ]}
      ctaText="Chat with Lina — It's Free"
      ctaPrompt="Help me plan my next trip"
      internalLinks={[
        { label: "Mexico Destinations", href: "/destinations/mexico" },
        { label: "Caribbean Getaways", href: "/destinations/caribbean" },
        { label: "Luxury Travel", href: "/services/luxury-travel" },
        { label: "Honeymoon Packages", href: "/services/honeymoon" },
      ]}
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Lina AI Travel Agent",
        provider: {
          "@type": "Organization",
          name: "Zeniva Travel",
          url: "https://www.zenivatravel.com",
        },
        serviceType: "Travel Planning",
        description:
          "AI-powered travel agent that plans and books flights, hotels, villas, and experiences 24/7 with no booking fees.",
        areaServed: "Worldwide",
        availableChannel: {
          "@type": "ServiceChannel",
          serviceUrl: "https://www.zenivatravel.com/services/ai-travel-agent",
          availableLanguage: ["English", "French", "Spanish", "Portuguese"],
        },
      }}
    />
  );
}
