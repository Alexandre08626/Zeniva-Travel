import SeoPage from "@/src/components/seo/SeoPage";
import type { Metadata } from "next";
const URL_PATH = "/gourmet-food-travel";
export const metadata: Metadata = {
  title: "Gourmet Food Travel — Michelin Tours, Wine Trips, Cooking Schools | Zeniva",
  description: "Gourmet food travel with Zeniva. Michelin-starred restaurant access, wine country tours, cooking schools, market tours. Curated culinary itineraries.",
  keywords: ["food travel", "gourmet vacation", "Michelin restaurant tour", "wine tour France", "Italy food tour", "cooking school vacation", "culinary travel"],
  openGraph: { title: "Gourmet Food Travel | Zeniva", description: "Michelin tours, wine trips, cooking schools, market tours.", url: `https://www.zenivatravel.com${URL_PATH}`, siteName: "Zeniva Travel", type: "website", images: [{ url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80", width: 1200, height: 630, alt: "Gourmet Food Travel — Zeniva" }] },
  alternates: { canonical: `https://www.zenivatravel.com${URL_PATH}` },
};
export default function P() { return (
  <SeoPage h1="Gourmet Food Travel — Michelin Access, Wine, Cooking"
    subtitle="From dinner at Osteria Francescana to truffle hunting in Alba to sushi training in Tokyo, Zeniva designs culinary itineraries with insider access — including reservations at restaurants that don't take public reservations."
    heroImage="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=85" heroGradient="from-amber-900/70 to-rose-900/60" badge="Insider access"
    sections={[
      { heading: "What gourmet travel actually delivers", content: `<p>Anyone can google "best restaurants in Paris." The hard part is reservations 6 months ahead at the spots that book up + private cooking experiences with chefs who don't normally take strangers + access to wineries closed to walk-ins. Zeniva's culinary travel team has personal relationships with restaurant managers in major food cities and access to private experiences not on any consumer booking platform.</p>` },
      { heading: "Top gourmet travel destinations", content: `<p><strong>Italy (Modena, Florence, Naples, Sicily):</strong> Osteria Francescana, Le Calandre, Reale, Mèta. Truffle hunting Alba, balsamic vinegar Modena, Naples pizza tour, Sicily wine + olive oil.</p><p><strong>France (Paris, Lyon, Bordeaux, Provence):</strong> Three-star Paris restaurants, Lyon bouchons, Bordeaux winery private tastings, Provence olive harvest.</p><p><strong>Spain (San Sebastian, Barcelona, Madrid, Andalucía):</strong> Pintxos crawl Donostia, El Celler de Can Roca, Disfrutar, jamón ibérico tasting in Andalucía.</p><p><strong>Japan (Tokyo, Kyoto, Osaka):</strong> Sushi Saito (3-star, byinvitation only), Den, Narisawa, kaiseki in Kyoto, sake brewery tours, sushi-making with Edomae masters.</p><p><strong>Mexico City + Oaxaca:</strong> Pujol, Quintonil, Sud 777, mezcal road trips Oaxaca, mole-making with traditional families.</p><p><strong>Peru (Lima, Cusco):</strong> Central, Maido, Astrid y Gastón. Amazon ingredient sourcing trips, ceviche workshops with Lima chefs.</p>` },
      { heading: "Hard-to-book restaurant access", content: `<p>For the world's hardest restaurants (Sushi Saito, El Celler de Can Roca, Geranium, Atomix, Single Thread), reservations open months ahead and sell out in minutes. Zeniva's network of restaurant managers + concierge desks + private guides can secure tables our clients couldn't book independently. We don't guarantee every spot every time but our success rate is 80%+ on requests with 6+ months lead time.</p>` },
    ]}
    highlights={[
      { icon: "star", title: "Michelin reservations", description: "Insider access to hardest-to-book restaurants — 80%+ success with 6+ months lead." },
      { icon: "map", title: "Wine country tours", description: "Bordeaux, Burgundy, Tuscany, Napa, Mendoza, Stellenbosch — private tastings." },
      { icon: "phone", title: "Lina AI 24/7", description: "Chat or voice — match cuisine focus to itinerary." },
      { icon: "users", title: "Private cooking experiences", description: "Cook with chefs who don't normally take strangers — sushi, pasta, mole, paella, gelato." },
      { icon: "anchor", title: "Market + farm tours", description: "Tsukiji breakfast, Provence farmers' market, Oaxaca mercado, Hong Kong wet markets." },
      { icon: "gift", title: "Multi-city culinary trips", description: "Italy + France + Spain combined into one curated culinary tour." },
    ]}
    faqs={[
      { question: "Best food destination in 2026?", answer: "Mexico City (most undervalued food scene globally), Lima (Central + Maido drive a culinary renaissance), Tokyo (still the world capital of fine dining), San Sebastian (highest Michelin density per capita)." },
      { question: "Can you book Sushi Saito or El Celler de Can Roca?", answer: "We can attempt — both require 6+ months lead time and have low success rates. Our network gives us better odds than booking direct. We're transparent about success probability before you commit to the trip." },
      { question: "Best wine tour?", answer: "Bordeaux for breadth (multiple appellations in one trip). Burgundy for premium pinot noir + chardonnay. Tuscany for Brunello + Chianti + warmth. Mendoza Argentina for Malbec + Andean scenery. Stellenbosch SA for value + scenery." },
      { question: "Cooking schools?", answer: "Apicius (Florence), Le Cordon Bleu (Paris, London, Tokyo), Hattori Nutrition (Tokyo), Toscana Mia (Tuscany). Day classes vs week-long immersions all bookable." },
      { question: "Vegetarian / dietary restrictions?", answer: "We coordinate with restaurants and tour operators on every dietary need — vegetarian, vegan, kosher, halal, allergy-specific. Most premium spots accommodate with advance notice." },
    ]}
    ctaText="Plan a Gourmet Trip" ctaPrompt="I'd like to plan a gourmet food trip"
    internalLinks={[ { label: "Luxury Travel", href: "/services/luxury-travel" }, { label: "Europe Destinations", href: "/destinations/europe" }, { label: "Honeymoon Packages", href: "/services/honeymoon" }, { label: "Solo Travel", href: "/solo-travel" } ]}
    jsonLd={{ "@context": "https://schema.org", "@type": "Service", name: "Gourmet Food Travel Planning", provider: { "@type": "Organization", name: "Zeniva Travel", url: "https://www.zenivatravel.com" }, serviceType: "Culinary Travel", description: "Gourmet food travel with Michelin restaurant reservations, wine country tours, private cooking experiences, market tours.", areaServed: "Worldwide" }}
  />
); }
