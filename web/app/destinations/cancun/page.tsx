import SeoPage from "@/src/components/seo/SeoPage";
import ZeniStayTeaser from "@/src/components/ZeniStayTeaser";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cancun All Inclusive Deals 2026 | Zeniva",
  description:
    "Find the best Cancun all inclusive deals for 2026. Beachfront resorts, Chichen Itza day trips, cenotes & nightlife — AI-planned packages.",
  openGraph: {
    title: "Cancun All Inclusive Deals 2026 | Zeniva",
    description:
      "Find the best Cancun all inclusive deals for 2026. Beachfront resorts, Chichen Itza day trips, cenotes & nightlife — AI-planned packages.",
    url: "https://www.zenivatravel.com/destinations/cancun",
  },
  alternates: {
    canonical: "https://www.zenivatravel.com/destinations/cancun",
  },
};

export default function CancunPage() {
  return (
    <>
    <SeoPage
      h1="Cancun All Inclusive Deals"
      subtitle="14 miles of Caribbean beachfront, world-class resorts, ancient Mayan ruins, and legendary nightlife — all at prices that consistently beat every other tropical destination."
      heroImage="https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?auto=format&fit=crop&w=1600&q=85"
      heroGradient="from-teal-900/60 to-blue-900/40"
      badge="Cancun 2026"
      sections={[
        {
          heading: "Why Cancun Dominates the All-Inclusive Market",
          content:
            "<p>Cancun isn't just a popular vacation destination — it's the all-inclusive capital of the Western Hemisphere. With over 30,000 hotel rooms concentrated in the Hotel Zone, fierce competition among resorts keeps quality high and prices remarkably accessible. A week at a top-rated 4-star all-inclusive resort in Cancun, including flights from most US cities, frequently costs less than $1,500 per person — a value proposition that no other Caribbean destination can consistently match.</p><p>The Hotel Zone itself is a geographic marvel: a narrow, L-shaped barrier island stretching 14 miles, with the turquoise Caribbean Sea on one side and the calm Nichupte Lagoon on the other. Nearly every major international hotel brand operates here — Hyatt, Marriott, Hilton, Riu, Excellence, Secrets, Dreams — along with dozens of independent Mexican resort chains. The result is an enormous range of options, from budget-friendly party resorts to ultra-luxurious adults-only retreats.</p><p>What elevates Cancun beyond a simple beach destination is its position as a gateway to the Yucatan Peninsula's extraordinary cultural and natural attractions. Chichen Itza, one of the New Seven Wonders of the World, is a feasible day trip. Underground cenotes offer once-in-a-lifetime swimming experiences. And the nearby Riviera Maya extends the playground south through Playa del Carmen and Tulum, giving visitors options to explore far beyond the Hotel Zone.</p>",
        },
        {
          heading: "The Cancun Hotel Zone: Resort by Resort",
          content:
            "<p>The Hotel Zone is divided into sections, each with a slightly different character. Understanding the layout helps you choose the right resort for your trip.</p>",
          subSections: [
            {
              heading: "Northern Hotel Zone (Km 1–9)",
              content:
                "<p>The northern stretch faces Isla Mujeres and the Bay of Cancun, offering calmer water that's ideal for families with young children. Beaches here are wide and gentle, with minimal wave action. Top properties include the Hyatt Ziva Cancun (a standout family-and-couples all-inclusive), Dreams Vista Cancun, and the newly renovated JW Marriott Cancun. This section is closest to downtown Cancun, making it easy to pop out for local restaurants, shopping at La Isla, and the Cancun underwater museum (MUSA).</p>",
            },
            {
              heading: "Central Hotel Zone (Km 9–16)",
              content:
                "<p>The central section sits at the elbow of the L-shape, facing open Caribbean water. The waves here are stronger, the water deeper, and the views more dramatic. This is where you'll find many of the mega-resorts and the most vibrant stretch of beach. The Ritz-Carlton Cancun, Le Blanc Spa Resort (consistently rated Mexico's top adults-only property), Hard Rock Hotel Cancun, and Secrets The Vine Cancun all call this area home. The central zone is also closest to Cancun's legendary nightlife strip, with Coco Bongo, The City, and Mandala all within walking or short taxi distance.</p>",
            },
            {
              heading: "Southern Hotel Zone (Km 16–25)",
              content:
                "<p>The southern stretch is quieter and more spread out, with several of Cancun's most exclusive properties. Club Med Cancun occupies a prime point at the end of the peninsula, while the Nizuc Resort & Spa offers a boutique-luxury experience that feels worlds away from the Hotel Zone's energy. Iberostar Selection Cancun and Moon Palace (technically in Riviera Maya but just south of the Hotel Zone) provide enormous resort complexes with their own ecosystems of pools, restaurants, and activities. This area is also the closest to the airport, reducing transfer time significantly.</p>",
            },
          ],
        },
        {
          heading: "Day Trips & Excursions from Cancun",
          content:
            "<p>Half the appeal of a Cancun vacation is what lies beyond the Hotel Zone. These are the must-do excursions that transform a beach trip into an unforgettable adventure.</p>",
          subSections: [
            {
              heading: "Chichen Itza",
              content:
                "<p>The ancient Mayan city of Chichen Itza sits about 2 hours west of Cancun and is one of the most impressive archaeological sites in the Americas. The centerpiece is El Castillo (the Temple of Kukulkan), a 79-foot step pyramid that demonstrates the Maya's extraordinary astronomical knowledge — during the spring and fall equinoxes, shadows create the illusion of a serpent descending the stairs. Most tours depart early morning and include stops at a cenote and a Yucatecan lunch. Book a guided tour to understand the site's history; self-guided visits miss the rich context.</p>",
            },
            {
              heading: "Cenotes",
              content:
                "<p>The Yucatan Peninsula is honeycombed with thousands of cenotes — natural sinkholes formed by collapsed limestone that reveal crystal-clear freshwater pools, many connected by underground river systems. <strong>Cenote Ik Kil</strong>, near Chichen Itza, is a dramatic open-air pool surrounded by hanging vines. <strong>Gran Cenote</strong>, near Tulum, offers underground cavern swimming with stalactites. <strong>Cenote Dos Ojos</strong> is one of the world's longest underwater cave systems and a premier diving site. <strong>Cenote Suytun</strong> features a single beam of light illuminating a rock platform in the center of an underground dome — one of the most photographed spots in Mexico.</p>",
            },
            {
              heading: "Isla Mujeres",
              content:
                "<p>A quick 15-minute ferry ride from Cancun, Isla Mujeres is a laid-back island that feels like a different world from the Hotel Zone. Golf carts are the primary mode of transportation, and the tiny island is ringed with small beaches, seafood restaurants, and colorful streets. Playa Norte, at the northern tip, is considered one of the best beaches in Mexico — shallow, calm, impossibly turquoise water with powdery white sand. Many visitors spend a full day here, taking the morning ferry over and the sunset ferry back.</p>",
            },
          ],
        },
        {
          heading: "Cancun for Families",
          content:
            "<p>Cancun is one of the Caribbean's best family destinations, and many resorts cater specifically to travelers with children. <strong>Hyatt Ziva Cancun</strong> features a dedicated kids' zone with water play areas, a teens' club, and family suites with bunk beds. <strong>Moon Palace The Grand</strong> (just south of the Hotel Zone) includes a FlowRider surf simulator, bowling alley, and an enormous water park. <strong>Club Med Cancun</strong> offers its signature kids' clubs with supervised activities for ages 4–17, included in the all-inclusive rate.</p><p>Beyond the resorts, family-friendly excursions abound. <strong>Xcaret Park</strong> combines a lazy underground river float, snorkeling, a butterfly pavilion, a sea turtle nursery, and a spectacular evening show featuring traditional Mexican music and dance. <strong>Xel-Ha</strong> is an all-inclusive eco-water park built around a natural ocean inlet — kids and adults can snorkel among tropical fish in calm, shallow water all day. Both parks include food and drinks in the admission price, making them genuinely hassle-free for parents.</p>",
        },
        {
          heading: "Cancun Nightlife & Entertainment",
          content:
            "<p>Cancun's nightlife is legendary and unlike anything else in the Caribbean. The Hotel Zone's Party Center is a compact strip of mega-clubs, bars, and restaurants that comes alive after 10 PM. <strong>Coco Bongo</strong> is the headliner — a multi-level club that combines DJ sets with acrobatic performances, celebrity impersonators, confetti cannons, and champagne showers. It's part nightclub, part Cirque du Soleil, and it runs until 4 AM. <strong>The City</strong> is one of Latin America's largest nightclubs, hosting international DJs and themed party nights. <strong>Mandala</strong> and <strong>Palazzo</strong> offer a more intimate (but still high-energy) experience.</p><p>For a mellower evening, the Hotel Zone also offers sunset cocktail bars overlooking the lagoon, live music venues, and dinner cruises on the Nichupte Lagoon. Many all-inclusive resorts host their own nightly entertainment — from beach parties and fire shows to karaoke and themed buffets — so you never have to leave the property if you prefer a relaxed night.</p>",
        },
      ]}
      highlights={[
        {
          icon: "🏖️",
          title: "14-Mile Beach Strip",
          description:
            "The Hotel Zone stretches along a barrier island with Caribbean water on both sides.",
        },
        {
          icon: "🏛️",
          title: "Chichen Itza Access",
          description:
            "Day-trip to one of the New Seven Wonders of the World, just 2 hours from your resort.",
        },
        {
          icon: "💧",
          title: "Cenote Swimming",
          description:
            "Swim in crystal-clear natural sinkholes found nowhere else on Earth.",
        },
        {
          icon: "🎉",
          title: "Legendary Nightlife",
          description:
            "Coco Bongo, The City, and more — Cancun's club scene is unmatched in the Caribbean.",
        },
        {
          icon: "👨‍👩‍👧‍👦",
          title: "Family Friendly",
          description:
            "Kids' clubs, water parks, and eco-parks make Cancun a top pick for families.",
        },
        {
          icon: "💰",
          title: "Unbeatable Value",
          description:
            "All-inclusive weeks from $1,200/person including flights — the best deal in the tropics.",
        },
      ]}
      faqs={[
        {
          question: "When is the best time to visit Cancun?",
          answer:
            "The sweet spot is December through April for dry, sunny weather with temperatures in the low-to-mid 80s°F. February through April is spring break season, which means higher prices and livelier resorts. For the best value with great weather, visit in November or early December. The rainy season (June–October) brings afternoon showers and hurricane risk, but also the lowest prices — and many travelers enjoy rain-free mornings and discounted luxury resorts.",
        },
        {
          question: "How much does a Cancun all-inclusive vacation cost?",
          answer:
            "A 7-night all-inclusive Cancun vacation ranges from $1,000 to $4,000+ per person including roundtrip flights. Budget 3-star resorts start around $800–$1,200/person, mid-range 4-star properties (Hyatt Ziva, Riu, Dreams) run $1,500–$2,500/person, and luxury adults-only resorts (Le Blanc, Excellence Playa Mujeres) cost $2,500–$5,000/person. Zeniva's AI compares options across all price ranges to find the best match for your budget.",
        },
        {
          question: "Is Cancun safe for tourists in 2026?",
          answer:
            "The Cancun Hotel Zone is one of the safest tourist areas in Mexico. It's heavily patrolled by tourism police, and the resorts maintain strong security. Millions of Americans and Canadians visit annually without incident. Standard precautions apply: stay in well-traveled areas, use authorized transportation, and keep valuables secure. The US State Department rates the state of Quintana Roo with a Level 2 advisory (exercise increased caution), the same level as most popular tourist destinations worldwide.",
        },
        {
          question: "What are the best all-inclusive resorts in Cancun?",
          answer:
            "Top-rated all-inclusive resorts include Le Blanc Spa Resort (luxury adults-only), Hyatt Ziva Cancun (best for couples and families), Excellence Playa Mujeres (upscale adults-only just north of Cancun), Secrets The Vine (trendy adults-only), and Moon Palace The Grand (best for families wanting maximum activities). Each caters to a different traveler type, so the 'best' depends on whether you're traveling as a couple, family, or group.",
        },
        {
          question: "How long is the flight to Cancun?",
          answer:
            "Cancun International Airport (CUN) is one of the most connected airports in the Caribbean. Flight times: 2.5 hours from Houston or Miami, 3.5 hours from Dallas or Atlanta, 4 hours from New York or Chicago, 4.5 hours from Los Angeles, and 5 hours from Toronto. Direct flights are available from 40+ US and Canadian cities on major carriers including American, United, Delta, Southwest, JetBlue, Air Canada, and WestJet.",
        },
      ]}
      ctaText="Find Your Cancun All-Inclusive Deal"
      ctaPrompt="Find me the best Cancun all inclusive deal"
      internalLinks={[
        { label: "All Inclusive Mexico Vacations", href: "/destinations/mexico" },
        { label: "Punta Cana Resort Packages", href: "/destinations/punta-cana" },
        { label: "Honeymoon Travel", href: "/services/honeymoon" },
      ]}
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "TouristDestination",
        name: "Cancun",
        description:
          "Cancun all inclusive vacation deals with beachfront resorts, Chichen Itza day trips, cenotes, and nightlife in Mexico's Caribbean coast.",
        url: "https://www.zenivatravel.com/destinations/cancun",
        touristType: ["All Inclusive", "Beach Vacation", "Family Travel", "Nightlife"],
        geo: {
          "@type": "GeoCoordinates",
          latitude: 21.1619,
          longitude: -86.8515,
        },
        includesAttraction: [
          { "@type": "TouristAttraction", name: "Chichen Itza" },
          { "@type": "TouristAttraction", name: "Isla Mujeres" },
          { "@type": "TouristAttraction", name: "Xcaret Park" },
        ],
      }}
    />
    <ZeniStayTeaser
      region="mexico"
      badge="Cancún & Riviera Maya"
      title="🏠 ZeniStay villas, lofts & jungle cabins"
      subtitle="Boho jungle havens in Tulum, beachfront 2BR penthouses with pool, charming lofts steps from the beach — handpicked Riviera Maya properties."
    />
    </>
  );
}
