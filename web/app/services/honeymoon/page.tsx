import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Honeymoon Packages & Getaways | Zeniva",
  description:
    "Plan the perfect honeymoon with Zeniva. Bora Bora, Maldives, Santorini, Bali — overwater bungalows, couples spa, sunset cruises, and all-inclusive romance packages.",
  openGraph: {
    title: "Honeymoon Packages & Getaways | Zeniva",
    description:
      "Plan the perfect honeymoon with Zeniva. Bora Bora, Maldives, Santorini, Bali — overwater bungalows, couples spa, sunset cruises, and all-inclusive romance packages.",
    url: "https://www.zenivatravel.com/services/honeymoon",
    siteName: "Zeniva Travel",
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1529903384028-629a1e58af4c?auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Honeymoon Packages — Zeniva",
      },
    ],
  },
  alternates: {
    canonical: "https://www.zenivatravel.com/services/honeymoon",
  },
};

export default function HoneymoonPage() {
  return (
    <SeoPage
      h1="Honeymoon Packages & Romantic Getaways"
      subtitle="Overwater bungalows, sunset cruises, couples spa retreats, and unforgettable destinations — your dream honeymoon, planned to perfection."
      heroImage="https://images.unsplash.com/photo-1529903384028-629a1e58af4c?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-rose-900/70 to-pink-900/50"
      badge="Romance & Luxury"
      sections={[
        {
          heading: "Your Honeymoon Deserves More Than a Template",
          content: `<p>After months of wedding planning, the honeymoon should feel effortless. No more spreadsheets, no more coordinating with vendors, no more decision fatigue. Zeniva's honeymoon planning service takes everything off your plate so you can focus on celebrating the start of your life together.</p>
<p>Every honeymoon we plan is built from scratch around you as a couple. We start by understanding what matters most — do you want pure relaxation on a private beach, or adventure and exploration in a new culture? Are you foodies who want to eat your way through Italy, or ocean lovers who want to snorkel a different reef every day? Your answers shape every recommendation, from the destination down to which room category faces the sunset.</p>
<p>Zeniva's honeymoon specialists have first-hand experience with the world's most romantic destinations and properties. We know which overwater bungalow at the Conrad Maldives has the best reef access, which suite at Canaves Oia in Santorini offers a private plunge pool with caldera views, and which secluded beach in the Seychelles you'll have almost entirely to yourselves. This kind of insider knowledge is what transforms a nice trip into the honeymoon you'll talk about for decades.</p>`,
        },
        {
          heading: "Top Honeymoon Destinations",
          content: `<p>While we plan honeymoons to virtually any destination worldwide, these are the places couples ask us about most — and for good reason.</p>`,
          subSections: [
            {
              heading: "Bora Bora, French Polynesia",
              content: `<p>The quintessential honeymoon destination. Bora Bora's iconic overwater bungalows, turquoise lagoon, and lush volcanic peaks create a setting that's almost impossibly romantic. We book at the top properties — Four Seasons, Conrad, St. Regis, and InterContinental — and arrange private lagoon tours, couples massages over the water, and sunset dinner cruises with just the two of you. Most couples stay 5-7 nights, often combining Bora Bora with a few nights in Moorea or Tahiti for variety.</p>`,
            },
            {
              heading: "Maldives",
              content: `<p>If seclusion is what you crave, the Maldives delivers like nowhere else. Each resort occupies its own private island, surrounded by crystal-clear Indian Ocean waters and some of the world's best house reefs. We recommend properties like Soneva Fushi for barefoot luxury, Joali for art and design lovers, and Gili Lankanfushi for the ultimate Robinson Crusoe-meets-five-star experience. Snorkeling with manta rays, underwater dining, and dolphin cruises at sunset are just a few of the experiences we build into Maldives honeymoon itineraries.</p>`,
            },
            {
              heading: "Santorini & the Greek Islands",
              content: `<p>Santorini's whitewashed villages perched above the deep blue caldera are the backdrop to thousands of honeymoon photos for good reason. But the Greek Islands offer so much more than Oia at sunset. We help couples explore Mykonos for its energy and beach clubs, Crete for its food and history, Milos for its wild beaches, and Paros for its charm. A multi-island itinerary by ferry or private yacht is one of the most romantic ways to experience Greece, and Zeniva handles every transfer and booking seamlessly.</p>`,
            },
            {
              heading: "Amalfi Coast, Italy",
              content: `<p>Lemon groves, cliffside villages, fresh pasta, and limoncello — the Amalfi Coast is romance distilled into a coastline. We book boutique hotels in Positano and Ravello, arrange private boat tours to Capri, secure reservations at hidden trattorias, and build in day trips to Pompeii or the vineyards of Campania. Many couples combine the Amalfi Coast with a few nights in Rome or Florence for a complete Italian honeymoon lasting 10-14 days.</p>`,
            },
            {
              heading: "Bali, Indonesia",
              content: `<p>Bali offers an unbeatable combination of luxury, culture, and natural beauty at a price point that stretches further than most destinations. Jungle-view infinity pools in Ubud, beachfront villas in Seminyak, sacred temples, rice terrace treks, and world-class spa treatments make Bali a honeymoon that feels both adventurous and deeply relaxing. We pair it with a few nights on the Gili Islands or Nusa Penida for beach time and incredible snorkeling.</p>`,
            },
          ],
        },
        {
          heading: "What's Included in a Zeniva Honeymoon Package",
          content: `<p>Every Zeniva honeymoon is fully customized, but most packages include the following elements, tailored to your budget and preferences:</p>
<p><strong>Flights:</strong> Business or first-class options for long-haul honeymoons, with optimal routing to minimize travel fatigue. We monitor fare prices and book at the right moment to get the best deal.</p>
<p><strong>Accommodations:</strong> Hand-selected rooms, suites, or villas at properties we know and trust. We request honeymoon-specific perks — room upgrades, champagne on arrival, turndown service with rose petals, and late checkout so your last morning isn't rushed.</p>
<p><strong>Romantic Experiences:</strong> Sunset sailing, couples spa treatments, private dinners on the beach, hot air balloon rides, wine tastings, cooking classes for two, and whatever else fits your idea of romance. These aren't generic add-ons — we choose experiences that match your interests.</p>
<p><strong>Transfers & Logistics:</strong> Private airport transfers, inter-island flights or ferries, and any ground transportation you need. You won't have to figure out a single taxi or shuttle — it's all arranged in advance.</p>
<p><strong>Honeymoon Registry Option:</strong> For couples who'd rather receive travel experiences than physical gifts, we can set up a honeymoon fund where wedding guests contribute toward specific elements of your trip — a spa day, a sunset cruise, a night in an overwater bungalow.</p>`,
        },
        {
          heading: "All-Inclusive vs. Luxury Resort — Which Is Right for You?",
          content: `<p>This is one of the most common questions honeymoon couples ask, and the right answer depends entirely on your travel style.</p>
<p><strong>All-inclusive resorts</strong> work beautifully for couples who want zero financial stress during their trip. Everything — meals, drinks, activities, entertainment — is covered upfront. Top-tier all-inclusive brands like Sandals, Excellence, Secrets, and UNICO 20°87° have elevated the concept far beyond buffet dining. Expect gourmet restaurants, premium spirits, and curated excursions included in the rate. This format is especially popular for Caribbean and Mexico honeymoons where beachfront relaxation is the priority.</p>
<p><strong>Luxury boutique resorts and private villas</strong> offer more flexibility and exclusivity. You choose where to eat, set your own schedule, and enjoy a level of privacy and personalization that all-inclusive properties can't always match. The overall cost may be higher because dining and activities are a la carte, but the experience feels more bespoke. This is the preferred option for destinations like Bora Bora, the Maldives, Santorini, and the Amalfi Coast where the destination itself is the attraction and you'll want to explore beyond the resort.</p>
<p>Many couples choose a hybrid approach — starting with a few nights at an all-inclusive for decompression after the wedding, then moving to a boutique property or villa for the second half of the trip. Zeniva's planners help you find the right balance.</p>`,
        },
      ]}
      highlights={[
        {
          icon: "heart",
          title: "Personalized Romance",
          description:
            "Every detail crafted around you as a couple — from the destination to the room view to the surprise dinner on the beach.",
        },
        {
          icon: "sun",
          title: "Top Destinations",
          description:
            "Bora Bora, Maldives, Santorini, Amalfi Coast, Bali, Seychelles, and dozens more romantic destinations worldwide.",
        },
        {
          icon: "home",
          title: "Overwater Bungalows & Villas",
          description:
            "Access to the most sought-after rooms at the world's best honeymoon properties, with upgrade requests on your behalf.",
        },
        {
          icon: "gift",
          title: "Honeymoon Perks",
          description:
            "Champagne on arrival, spa credits, room upgrades, late checkout, and romantic turndown — arranged as part of your package.",
        },
        {
          icon: "compass",
          title: "Curated Experiences",
          description:
            "Sunset cruises, couples cooking classes, private island excursions, and more — woven into your itinerary, not bolted on.",
        },
        {
          icon: "credit-card",
          title: "Honeymoon Registry",
          description:
            "Let wedding guests contribute to specific trip experiences — a night in an overwater bungalow, a spa day, a sunset sail.",
        },
      ]}
      faqs={[
        {
          question: "What are the best honeymoon destinations?",
          answer:
            "The most popular honeymoon destinations among Zeniva couples are Bora Bora, the Maldives, Santorini, the Amalfi Coast, Bali, Turks and Caicos, St. Lucia, the Seychelles, and Fiji. The best destination for your honeymoon depends on your priorities — beach relaxation, cultural exploration, adventure, food, or a mix. Our planners help you narrow it down based on your travel style, budget, and time of year.",
        },
        {
          question: "What does a honeymoon typically cost?",
          answer:
            "Honeymoon costs vary widely. A 7-night all-inclusive Caribbean honeymoon typically ranges from $4,000 to $8,000 per couple including flights. Luxury resort honeymoons in Bora Bora or the Maldives generally run $10,000 to $25,000+ for 7-10 nights. European honeymoons spanning multiple cities average $8,000 to $15,000. Zeniva works with every budget and finds ways to maximize value — whether that means timing your trip for shoulder season, combining destinations strategically, or leveraging our partner perks.",
        },
        {
          question: "How far in advance should we book our honeymoon?",
          answer:
            "We recommend starting the planning process 6-9 months before your wedding date, especially for popular destinations like Bora Bora and the Maldives where top properties book out quickly. This also gives you the best flight options and pricing. If you're planning a shorter-lead honeymoon, reach out as soon as possible — we can often find excellent availability even 2-3 months out, particularly during shoulder seasons.",
        },
        {
          question: "Should we choose all-inclusive or a luxury resort?",
          answer:
            "All-inclusive is ideal if you want everything prepaid and stress-free — perfect for beach destinations in the Caribbean and Mexico. Luxury boutique resorts offer more flexibility and exclusivity, which works better in destinations like Santorini, Bali, or the Amalfi Coast where you'll want to explore. Many couples do both: a few all-inclusive nights for decompression, then a boutique property for the rest of the trip. Your Zeniva planner will recommend the best fit based on your style.",
        },
        {
          question: "Can Lina help plan a surprise honeymoon?",
          answer:
            "Yes! Surprise honeymoons are one of our favorite things to plan. One partner works with Lina or a human advisor to design the entire trip while keeping the destination and details secret. We provide a packing guide with climate hints (without revealing the location), coordinate any necessary documents like passports, and reveal the destination at the airport — or whenever you choose. Everything is handled through the planning partner's account for complete discretion.",
        },
      ]}
      ctaText="Start Planning Your Honeymoon"
      ctaPrompt="I want to plan my honeymoon"
      internalLinks={[
        { label: "Bora Bora", href: "/destinations/bora-bora" },
        { label: "Caribbean Getaways", href: "/destinations/caribbean" },
        { label: "Europe Destinations", href: "/destinations/europe" },
        { label: "Luxury Travel", href: "/services/luxury-travel" },
      ]}
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Honeymoon Packages & Romantic Getaways",
        provider: {
          "@type": "Organization",
          name: "Zeniva Travel",
          url: "https://www.zenivatravel.com",
        },
        serviceType: "Honeymoon Planning",
        description:
          "Custom honeymoon packages featuring overwater bungalows, couples spa retreats, sunset cruises, and romantic experiences at top destinations worldwide.",
        areaServed: "Worldwide",
      }}
    />
  );
}
