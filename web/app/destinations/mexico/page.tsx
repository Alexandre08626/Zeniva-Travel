import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Inclusive Mexico Vacations | Zeniva",
  description:
    "Book all inclusive Mexico vacation packages with AI. Cancun, Riviera Maya, Cabo — flights, hotels & more planned instantly.",
  openGraph: {
    title: "All Inclusive Mexico Vacations | Zeniva",
    description:
      "Book all inclusive Mexico vacation packages with AI. Cancun, Riviera Maya, Cabo — flights, hotels & more planned instantly.",
    url: "https://www.zenivatravel.com/destinations/mexico",
  },
  alternates: {
    canonical: "https://www.zenivatravel.com/destinations/mexico",
  },
};

export default function MexicoPage() {
  return (
    <SeoPage
      h1="All Inclusive Mexico Vacation Packages"
      subtitle="From the turquoise waters of Cancun to the dramatic arches of Cabo, discover why Mexico is the top all-inclusive destination for travelers seeking sun, culture, and unbeatable value."
      heroImage="https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-amber-900/60 to-sky-900/40"
      badge="Mexico Travel 2026"
      sections={[
        {
          heading: "Why Mexico Is the Ultimate All-Inclusive Destination",
          content:
            "<p>Mexico has cemented its reputation as the world's premier all-inclusive vacation destination, and for good reason. With over 6,000 miles of coastline spanning the Pacific Ocean, Gulf of Mexico, and Caribbean Sea, the country delivers a staggering variety of beach experiences — from the powdery white sands of the Riviera Maya to the rugged desert-meets-ocean landscapes of Los Cabos.</p><p>What sets Mexico apart is the sheer value of its all-inclusive resorts. Travelers consistently find that Mexico offers more luxurious accommodations, better dining, and richer entertainment for significantly less than comparable destinations in the Caribbean or Southeast Asia. A week-long all-inclusive stay at a top-rated resort in Cancun or Playa del Carmen can cost less than a basic hotel-and-flights package to many European cities.</p><p>Beyond the resorts, Mexico's cultural depth is unmatched. Ancient Mayan ruins rise from the jungle canopy just minutes from your beach chair. Colonial towns like Valladolid and Merida offer cobblestone streets, vibrant markets, and centuries of history. The cuisine — recognized by UNESCO as an Intangible Cultural Heritage — goes far beyond tacos and guacamole, encompassing complex moles, fresh ceviche, and regional specialties that vary dramatically from coast to coast.</p>",
        },
        {
          heading: "Top Mexico Destinations for All-Inclusive Vacations",
          content:
            "<p>Choosing the right destination within Mexico depends on what kind of experience you're after. Each region has a distinct personality, and understanding the differences helps you plan the perfect trip.</p>",
          subSections: [
            {
              heading: "Cancun & the Hotel Zone",
              content:
                "<p>Cancun remains Mexico's most popular resort destination, welcoming over 30 million visitors annually. The Hotel Zone is a 14-mile strip of land bordered by the Caribbean Sea on one side and the Nichupte Lagoon on the other, packed with world-class all-inclusive resorts. Properties like the Hyatt Ziva, Excellence Playa Mujeres, and Le Blanc Spa Resort offer swim-up bars, gourmet restaurants, and pristine private beaches. Cancun is also the gateway to the region's best archaeological sites, snorkeling reefs, and cenotes.</p>",
            },
            {
              heading: "Riviera Maya & Playa del Carmen",
              content:
                "<p>Stretching south from Cancun to Tulum, the Riviera Maya is where nature and luxury intersect. Playa del Carmen anchors the region with its walkable Fifth Avenue, boutique shopping, and lively nightlife. All-inclusive resorts here tend to feel more intimate and tropical, nestled among mangroves and palms. The Riviera Maya is also home to Xcaret and Xel-Ha eco-parks, the biosphere reserve of Sian Ka'an, and dozens of cenotes — natural limestone sinkholes filled with crystal-clear freshwater perfect for swimming and diving.</p>",
            },
            {
              heading: "Tulum",
              content:
                "<p>Tulum has evolved from a backpacker haven into one of Mexico's most stylish destinations. The clifftop Mayan ruins overlooking the Caribbean are iconic, and the town's bohemian-chic beach clubs, yoga retreats, and farm-to-table restaurants attract a design-conscious crowd. While Tulum has fewer traditional all-inclusive resorts, several boutique properties offer curated packages that include meals, excursions, and wellness treatments. It's the ideal pick for travelers who want a more authentic, less commercialized Mexico experience.</p>",
            },
            {
              heading: "Los Cabos (Cabo San Lucas & San Jose del Cabo)",
              content:
                "<p>On Mexico's Pacific coast, Los Cabos delivers a dramatically different landscape — desert cliffs plunging into deep blue waters, punctuated by the famous El Arco rock formation. Cabo San Lucas is known for its vibrant marina, sport fishing, and party atmosphere, while the quieter San Jose del Cabo offers art galleries, colonial architecture, and world-class golf. All-inclusive resorts here, including Garza Blanca, Grand Velas, and Marquis Los Cabos, tend to skew upscale, with exceptional dining programs and spa facilities.</p>",
            },
          ],
        },
        {
          heading: "Mayan Ruins, Cenotes & Cultural Excursions",
          content:
            "<p>No Mexico vacation is complete without exploring the country's extraordinary archaeological heritage. <strong>Chichen Itza</strong>, one of the New Seven Wonders of the World, is a two-hour drive from Cancun and features the iconic El Castillo pyramid. <strong>Tulum's ruins</strong> sit dramatically on a cliff above the sea, making them the most photogenic archaeological site in the Americas. <strong>Coba</strong>, still partially buried in jungle, lets visitors climb the tallest pyramid in the Yucatan.</p><p>Cenotes are equally unforgettable. These natural sinkholes, formed by collapsed limestone, were sacred to the Maya and now serve as otherworldly swimming and diving spots. Cenote Ik Kil near Chichen Itza, Gran Cenote near Tulum, and the underground river systems of Cenote Dos Ojos offer experiences you simply cannot find anywhere else on Earth. Many all-inclusive resorts arrange day trips that combine ruins and cenotes into a single excursion.</p>",
        },
        {
          heading: "Mexican Cuisine & Nightlife",
          content:
            "<p>Mexican cuisine is one of the most diverse and celebrated food traditions in the world. All-inclusive resorts in Mexico have dramatically raised their culinary game, with many properties featuring 8 to 12 specialty restaurants spanning Japanese, Italian, French, and of course authentic Mexican cuisine. Expect fresh-caught seafood ceviches, slow-roasted cochinita pibil, handmade tortillas, and artisanal mezcal tastings.</p><p>For nightlife, Cancun's Hotel Zone is legendary, with mega-clubs like Coco Bongo delivering circus-style performances alongside DJ sets. Playa del Carmen's Fifth Avenue offers a more relaxed bar-hopping scene, while Cabo's marina district pulses with energy from sunset to sunrise. Many resorts also host their own themed evening entertainment, from beach bonfires to live mariachi performances.</p>",
        },
      ]}
      highlights={[
        {
          icon: "🏖️",
          title: "World-Class Beaches",
          description:
            "Pristine Caribbean and Pacific coastlines with white sand and turquoise waters stretching for miles.",
        },
        {
          icon: "🏛️",
          title: "Ancient Mayan Ruins",
          description:
            "Explore Chichen Itza, Tulum, and Coba — UNESCO World Heritage sites steeped in history.",
        },
        {
          icon: "🍽️",
          title: "UNESCO-Honored Cuisine",
          description:
            "From street tacos to gourmet moles, Mexican food is a world-class culinary journey.",
        },
        {
          icon: "🎶",
          title: "Vibrant Nightlife",
          description:
            "Cancun mega-clubs, Playa del Carmen bars, and Cabo marina parties keep the energy alive after dark.",
        },
        {
          icon: "💧",
          title: "Magical Cenotes",
          description:
            "Swim in crystal-clear underground sinkholes unique to the Yucatan Peninsula.",
        },
        {
          icon: "🏨",
          title: "All-Inclusive Resorts",
          description:
            "Premium properties with gourmet dining, swim-up bars, and beachfront luxury at unbeatable prices.",
        },
      ]}
      faqs={[
        {
          question: "What is the best time to visit Mexico for an all-inclusive vacation?",
          answer:
            "The best time is between December and April, during the dry season. You'll enjoy sunny skies, low humidity, and warm temperatures in the low 80s°F. The shoulder months of November and May offer great weather with lower prices. Hurricane season runs June through October, but resorts rarely see direct impacts and you can find significant discounts.",
        },
        {
          question: "How much does an all-inclusive Mexico vacation cost per person?",
          answer:
            "A week-long all-inclusive Mexico vacation typically costs between $1,200 and $3,500 per person including flights and resort. Budget-friendly 3-star resorts in Cancun start around $800–$1,200 per person, while luxury 5-star properties like Le Blanc or Grand Velas range from $2,500 to $5,000+. Zeniva's AI finds the best value for your budget and preferences.",
        },
        {
          question: "Is an all-inclusive resort in Mexico worth it?",
          answer:
            "For most travelers, absolutely yes. All-inclusive resorts eliminate the stress of budgeting for meals, drinks, and activities. In Mexico specifically, the value proposition is exceptional — you get gourmet dining, premium liquor, water sports, and entertainment included. Families especially benefit since kids' meals, clubs, and activities are covered. The only time it may not be worth it is if you plan to spend most days exploring off-resort.",
        },
        {
          question: "What are the safest areas in Mexico for tourists?",
          answer:
            "The major resort areas — Cancun, Riviera Maya, Playa del Carmen, Tulum, and Los Cabos — are among the safest places in Mexico for tourists. These regions depend on tourism economically, and security is a top priority. The Hotel Zone in Cancun and gated resort complexes along the Riviera Maya are particularly well-protected. Standard travel precautions apply, as they would anywhere.",
        },
        {
          question: "Are there direct flights to Mexico from the US and Canada?",
          answer:
            "Yes, Mexico has excellent flight connectivity. Cancun International Airport (CUN) receives direct flights from over 40 US and Canadian cities, making it one of the easiest Caribbean-area destinations to reach. Los Cabos (SJD) has direct service from most major West Coast cities and several Midwest hubs. Flight times range from 2.5 hours from Houston or Miami to about 5 hours from New York or Toronto.",
        },
      ]}
      ctaText="Ready to Book Your Mexico Getaway?"
      ctaPrompt="Plan my all inclusive Mexico vacation"
      internalLinks={[
        { label: "Cancun All Inclusive Deals", href: "/destinations/cancun" },
        { label: "Punta Cana Resort Packages", href: "/destinations/punta-cana" },
        { label: "Caribbean Vacation Packages", href: "/destinations/caribbean" },
        { label: "AI Travel Agent", href: "/services/ai-travel-agent" },
      ]}
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "TouristDestination",
        name: "Mexico",
        description:
          "All inclusive Mexico vacation packages with flights, hotels, and activities in Cancun, Riviera Maya, Cabo, and more.",
        url: "https://www.zenivatravel.com/destinations/mexico",
        touristType: ["Beach Vacation", "All Inclusive", "Cultural Tourism"],
        geo: {
          "@type": "GeoCoordinates",
          latitude: 21.1619,
          longitude: -86.8515,
        },
        includesAttraction: [
          { "@type": "TouristAttraction", name: "Chichen Itza" },
          { "@type": "TouristAttraction", name: "Tulum Ruins" },
          { "@type": "TouristAttraction", name: "Cenote Ik Kil" },
        ],
      }}
    />
  );
}
