import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Punta Cana Resort Packages | Zeniva",
  description:
    "Book Punta Cana resort packages with AI. Bavaro Beach, Saona Island, golf & eco-parks — all inclusive deals with flights and hotels.",
  openGraph: {
    title: "Punta Cana Resort Packages | Zeniva",
    description:
      "Book Punta Cana resort packages with AI. Bavaro Beach, Saona Island, golf & eco-parks — all inclusive deals with flights and hotels.",
    url: "https://www.zenivatravel.com/destinations/punta-cana",
  },
  alternates: {
    canonical: "https://www.zenivatravel.com/destinations/punta-cana",
  },
};

export default function PuntaCanaPage() {
  return (
    <SeoPage
      h1="Punta Cana Resort Packages"
      subtitle="25 miles of palm-lined Caribbean beach, world-class all-inclusive resorts, championship golf, and natural eco-parks — the Dominican Republic's crown jewel awaits."
      heroImage="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-emerald-900/60 to-blue-900/40"
      badge="Punta Cana 2026"
      sections={[
        {
          heading: "Why Punta Cana Is the Caribbean's Best Value Destination",
          content:
            "<p>Punta Cana has quietly become one of the most popular vacation destinations in the entire Caribbean, welcoming over 7 million visitors annually to the eastern tip of the Dominican Republic. The reason is simple: Punta Cana delivers a premium all-inclusive experience at prices that consistently undercut Cancun, Jamaica, and virtually every other Caribbean competitor.</p><p>The star of the show is <strong>Bavaro Beach</strong>, a 25-mile sweep of coconut palm-lined, white-sand beach that regularly appears on global best-beach lists. The water is warm, shallow, and impossibly clear — you can wade out 50 yards and still see your toes. The beach is protected by a coral reef that calms the waves, making it ideal for families with young children and swimmers of all levels.</p><p>Behind the beach, an enormous concentration of all-inclusive resorts — over 40,000 rooms — creates fierce competition that benefits travelers. Brands like Hard Rock, Hyatt Zilara/Ziva, Secrets, Excellence, Lopesan, Barcelo, and Iberostar all operate flagship properties here, each trying to outdo the others with bigger pools, more restaurants, better entertainment, and more luxurious rooms. The result is exceptional value: a week at a 4-star all-inclusive in Punta Cana, including flights, often costs under $1,200 per person.</p>",
        },
        {
          heading: "Top Punta Cana Resorts for Every Traveler",
          content:
            "<p>With dozens of resorts to choose from, finding the right match for your travel style matters. Here's how the top properties break down.</p>",
          subSections: [
            {
              heading: "For Couples & Honeymooners",
              content:
                "<p><strong>Excellence El Carmen</strong> is a standout adults-only property with swim-up suites, rooftop terraces, and 14 restaurants — it's the kind of resort where you can eat somewhere different every night and never repeat. <strong>Secrets Royal Beach</strong> offers a similar adults-only vibe with the Unlimited-Luxury concept: premium spirits, 24-hour room service, and a world-class spa. <strong>Zoetry Agua</strong>, tucked away from the main resort strip, provides a boutique wellness experience with cacao ceremonies, beach yoga, and farm-to-table dining in an intimate setting.</p>",
            },
            {
              heading: "For Families",
              content:
                "<p><strong>Hard Rock Hotel & Casino Punta Cana</strong> is a family powerhouse with 13 pools, a water park, bowling alley, mini-golf, and the largest casino in the Caribbean. Kids get their own check-in experience and complimentary supervised activities. <strong>Hyatt Ziva Cap Cana</strong> combines family friendliness with genuine luxury — the rooftop infinity pool overlooking the marina is stunning, and the kids' club keeps children engaged all day. <strong>Barcelo Bavaro Palace</strong> is a massive resort complex with a pirate-themed water park, theater shows, and spacious family rooms at an excellent price point.</p>",
            },
            {
              heading: "For Luxury Seekers",
              content:
                "<p><strong>Cap Cana</strong> is Punta Cana's most exclusive enclave, a gated resort community featuring the Hyatt Regency, Margaritaville Island Reserve, and a Jack Nicklaus-designed golf course. Juanillo Beach, inside Cap Cana, is arguably the most beautiful beach in the entire Dominican Republic — fine white sand, swaying palms, and a laid-back beach club atmosphere. <strong>Eden Roc Cap Cana</strong> offers private pool suites, a marina, and Michelin-quality dining in an intimate setting that rivals anything in the Maldives or Bora Bora at a fraction of the cost.</p>",
            },
          ],
        },
        {
          heading: "Bavaro Beach & Beyond: What to See and Do",
          content:
            "<p>While Bavaro Beach is the main attraction, Punta Cana offers a surprising range of activities and excursions that go far beyond sunbathing.</p>",
          subSections: [
            {
              heading: "Saona Island",
              content:
                "<p>Saona Island is Punta Cana's most popular excursion, and rightfully so. This protected island in Parque Nacional del Este is reached by catamaran or speedboat, and the journey itself is half the experience — many tours stop at a natural sandbar pool in the middle of the ocean where you can stand in waist-deep, crystal-clear water surrounded by starfish. The island's beaches are pristine and uncrowded, with palm trees providing natural shade. Most tours include a Dominican lunch of grilled fish, rice, and fresh fruit, plus an open bar. It's a full-day trip that consistently ranks as the highlight of travelers' visits.</p>",
            },
            {
              heading: "Golf in Paradise",
              content:
                "<p>Punta Cana has established itself as the Caribbean's premier golf destination, with over a dozen championship courses designed by legends like Jack Nicklaus, Tom Fazio, P.B. Dye, and Nick Faldo. <strong>Punta Espada Golf Club</strong> at Cap Cana, designed by Nicklaus, has hosted multiple PGA Tour events and features eight holes along the ocean — it's consistently ranked the #1 course in the Caribbean. <strong>Corales Golf Course</strong> at the Puntacana Resort & Club is equally stunning, with its signature 18th hole perched on a cliff above a turquoise cove. Green fees range from $150 to $400 per round, with resort guests often receiving discounted rates.</p>",
            },
            {
              heading: "Eco-Parks & Adventure",
              content:
                "<p><strong>Scape Park at Cap Cana</strong> is an eco-adventure park featuring zip-lines over cenotes, cave exploration through underground lagoons, dune buggy tours through tropical trails, and the stunning Hoyo Azul — a natural cenote at the base of a 75-foot cliff with water so blue it looks artificially enhanced. <strong>Monkeyland</strong> offers an ethical wildlife encounter with rescued squirrel monkeys in a jungle setting. <strong>Indigenous Eyes Ecological Park</strong> protects 1,500 acres of subtropical forest with 12 freshwater lagoons, walking trails, and a petting zoo — it's a peaceful counterpoint to the resort buzz.</p>",
            },
          ],
        },
        {
          heading: "Dominican Cuisine & Culture",
          content:
            "<p>Dominican food is hearty, flavorful, and deeply rooted in the island's Taino, African, and Spanish heritage. The national dish, <strong>la bandera</strong> (rice, red beans, and stewed meat), appears on virtually every local lunch table. <strong>Mangu</strong> — mashed green plantains topped with sauteed onions and fried cheese — is the quintessential Dominican breakfast. Fresh seafood is abundant: grilled lobster, shrimp in coconut sauce, and ceviche appear on both resort and local restaurant menus.</p><p>While the all-inclusive resorts have multiple themed restaurants (expect Italian, Japanese, steakhouse, and buffet options at minimum), venturing outside the resort gates rewards adventurous eaters. The town of <strong>El Cortecito</strong>, just behind Bavaro Beach, has a strip of Dominican restaurants serving massive plates of grilled fish and tostones (fried plantains) for a fraction of resort prices. <strong>La Yola</strong> at the Puntacana Marina offers upscale Dominican-Mediterranean fusion right on the water.</p><p>Dominican culture extends beyond food. <strong>Merengue</strong> and <strong>bachata</strong> music pulsate through every corner of the island — many resorts offer free dance lessons, and local bars in the towns provide authentic dance-floor experiences. Cigar-making is another Dominican tradition: the country produces some of the world's finest cigars, and several Punta Cana resorts have dedicated cigar lounges with expert rollers.</p>",
        },
        {
          heading: "Getting to Punta Cana & Practical Tips",
          content:
            "<p>Punta Cana International Airport (PUJ) is the busiest airport in the Caribbean, with direct flights from over 50 cities worldwide. From the US, flight times are remarkably short: 2.5 hours from Miami, 3.5 hours from New York, 4 hours from Chicago, and 5 hours from Los Angeles. Major carriers including JetBlue, American, Delta, United, Southwest, and Spirit offer competitive fares, with roundtrip tickets frequently available under $350 from East Coast cities.</p><p>Most resorts are just 20–30 minutes from the airport, and transfers are typically included in resort packages or available for $30–$50 per person each way. The Dominican Republic uses the Dominican Peso, but US dollars are widely accepted at resorts and in tourist areas. Tipping at all-inclusive resorts is appreciated but not required — $1–$2 per service interaction is standard.</p><p>Zeniva's AI travel agent handles every detail of your Punta Cana trip, from comparing resort options to booking flights and arranging transfers. Tell us your dates and budget, and we'll build a custom package in minutes.</p>",
        },
      ]}
      highlights={[
        {
          icon: "🏖️",
          title: "Bavaro Beach",
          description:
            "25 miles of palm-lined white sand, warm shallow water, and reef-protected Caribbean perfection.",
        },
        {
          icon: "🏝️",
          title: "Saona Island",
          description:
            "Catamaran to a protected paradise island with natural pools, starfish, and pristine beaches.",
        },
        {
          icon: "⛳",
          title: "Championship Golf",
          description:
            "12+ Jack Nicklaus and Tom Fazio courses, including the Caribbean's #1-ranked Punta Espada.",
        },
        {
          icon: "🌿",
          title: "Eco-Parks & Cenotes",
          description:
            "Zip-line over cenotes, explore caves, and swim in the stunning Hoyo Azul at Scape Park.",
        },
        {
          icon: "👨‍👩‍👧‍👦",
          title: "Family Resorts",
          description:
            "Water parks, kids' clubs, and family suites at Hard Rock, Hyatt Ziva, and Barcelo.",
        },
        {
          icon: "💰",
          title: "Incredible Value",
          description:
            "All-inclusive weeks from under $1,200/person with flights — the Caribbean's best price-to-quality ratio.",
        },
      ]}
      faqs={[
        {
          question: "What is the best time to visit Punta Cana?",
          answer:
            "Punta Cana enjoys warm weather year-round, with temperatures averaging 80–85°F. The driest months are January through April, coinciding with peak season and the highest prices. May, June, November, and December offer excellent weather at lower rates. The rainy season (July–October) brings short afternoon showers but rarely ruins full days — and prices drop 30–50%. Punta Cana sits outside the main hurricane corridor, so storm risk is lower than many Caribbean islands.",
        },
        {
          question: "How much does a Punta Cana all-inclusive vacation cost?",
          answer:
            "Punta Cana offers the Caribbean's best all-inclusive value. A 7-night trip including flights typically costs $900–$3,000 per person. Budget 3-star resorts start at $700–$1,000/person, popular 4-star properties (Barcelo, Riu, Iberostar) run $1,200–$2,000/person, and luxury 5-star resorts (Excellence, Hyatt Zilara, Eden Roc) cost $2,000–$4,000/person. Zeniva consistently finds deals 15–25% below standard booking sites.",
        },
        {
          question: "Is Punta Cana safe for tourists?",
          answer:
            "Punta Cana is one of the safest tourist areas in the Caribbean. The resort zone is well-secured, and tourism is the region's primary economic driver. Millions of North Americans visit annually without incident. Standard precautions apply: use authorized transportation, keep valuables in room safes, and exercise normal awareness when venturing outside resort areas. The Dominican Republic maintains a dedicated tourist police force (POLITUR) specifically to ensure visitor safety.",
        },
        {
          question: "What is the difference between Punta Cana and Bavaro?",
          answer:
            "Punta Cana and Bavaro are adjacent areas that together form one continuous resort region. Bavaro refers to the northern section with the famous Bavaro Beach, where most mid-range and family resorts are located. Punta Cana technically refers to the southern area near the airport and the original Puntacana Resort & Club. Cap Cana, further south, is the newest luxury enclave. In practice, the entire region is marketed as 'Punta Cana' and the distinctions matter mainly for choosing a specific resort location.",
        },
        {
          question: "Do I need a passport to visit Punta Cana?",
          answer:
            "Yes, US and Canadian citizens need a valid passport to enter the Dominican Republic. Your passport should be valid for at least 6 months beyond your travel dates. No visa is required for stays of up to 30 days — a tourist card (included in your airline ticket) covers the entry fee. Make sure to keep your passport secure at the resort, and carry a photocopy when venturing outside the property.",
        },
      ]}
      ctaText="Book Your Punta Cana Paradise"
      ctaPrompt="Plan my Punta Cana all inclusive vacation"
      internalLinks={[
        { label: "Caribbean Vacation Packages", href: "/destinations/caribbean" },
        { label: "Cancun All Inclusive Deals", href: "/destinations/cancun" },
        { label: "All Inclusive Mexico Vacations", href: "/destinations/mexico" },
      ]}
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "TouristDestination",
        name: "Punta Cana",
        description:
          "Punta Cana resort packages featuring Bavaro Beach, Saona Island excursions, championship golf, and all-inclusive deals in the Dominican Republic.",
        url: "https://www.zenivatravel.com/destinations/punta-cana",
        touristType: ["All Inclusive", "Beach Vacation", "Golf", "Family Travel"],
        geo: {
          "@type": "GeoCoordinates",
          latitude: 18.5601,
          longitude: -68.3725,
        },
        includesAttraction: [
          { "@type": "TouristAttraction", name: "Bavaro Beach" },
          { "@type": "TouristAttraction", name: "Saona Island" },
          { "@type": "TouristAttraction", name: "Punta Espada Golf Club" },
        ],
      }}
    />
  );
}
