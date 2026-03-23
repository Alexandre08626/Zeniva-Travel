export const dynamic = "force-dynamic";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

const DESTINATIONS: Record<string, {
  name: string; country: string; emoji: string; tag: string; tagColor: string;
  hero: string; photos: string[]; description: string; highlights: string[];
  bestTime: string; budget: string; duration: string; language: string;
}> = {
  maldives: {
    name: "Maldives", country: "Indian Ocean", emoji: "🏝️", tag: "Paradise", tagColor: "#8b5cf6",
    hero: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1600&q=85",
    photos: [
      "https://images.unsplash.com/photo-1540202404-1b927e27fa8b?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1586500036706-41963de24d8b?auto=format&fit=crop&w=900&q=85",
    ],
    description: "The Maldives is the ultimate tropical paradise — a nation of 1,200 coral islands scattered across the Indian Ocean. Stay in iconic overwater bungalows perched above crystal-clear turquoise lagoons, snorkel with manta rays, and watch the sun set into the Indian Ocean from your private deck. Every resort is its own island, offering an unparalleled sense of exclusivity and serenity.",
    highlights: ["🌊 Overwater bungalows", "🐠 World-class snorkeling & diving", "🌅 Private beach sunsets", "🦈 Swim with whale sharks", "🍹 All-inclusive luxury resorts"],
    bestTime: "Nov – April", budget: "From $3,500 / person", duration: "7–14 days", language: "Dhivehi / English",
  },
  santorini: {
    name: "Santorini", country: "Greece", emoji: "🇬🇷", tag: "Romantic", tagColor: "#f43f5e",
    hero: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1600&q=85",
    photos: [
      "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1555993539-1732b0258235?auto=format&fit=crop&w=900&q=85",
    ],
    description: "Santorini is the most iconic island in Greece — a crescent-shaped volcanic island rising dramatically from the Aegean Sea. The cliffside villages of Oia and Fira are famous for their whitewashed buildings, blue-domed churches, and the world's most celebrated sunsets. Sip local wine at sunset, explore ancient ruins, and relax on black volcanic beaches unlike anywhere else on Earth.",
    highlights: ["🌅 World-famous Oia sunset", "🍷 Volcanic wine tasting", "🏛️ Ancient ruins of Akrotiri", "⛵ Caldera boat tours", "🏖️ Black volcanic beaches"],
    bestTime: "May – October", budget: "From $2,200 / person", duration: "5–10 days", language: "Greek / English",
  },
  bali: {
    name: "Bali", country: "Indonesia", emoji: "🇮🇩", tag: "Adventure", tagColor: "#10b981",
    hero: "https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=1400&q=85",
    photos: [
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=85",
      "https://images.unsplash.com/photo-1573790387438-4da905039392?auto=format&fit=crop&w=800&q=85",
      "https://images.unsplash.com/photo-1604928141608-198b2b03dd1e?auto=format&fit=crop&w=800&q=85",
    ],
    description: "Bali is the Island of the Gods — a magical destination where ancient Hindu temples, emerald rice terraces, and world-class surf beaches coexist. From the spiritual town of Ubud to the vibrant beach clubs of Seminyak, Bali offers an extraordinary diversity of experiences. Attend a traditional Kecak fire dance, hike Mount Batur at sunrise, or simply unwind in a luxury jungle villa.",
    highlights: ["🌾 Tegallalang Rice Terraces", "🛕 Temple of Uluwatu at sunset", "🏄 World-class surfing in Kuta", "🧘 Yoga & wellness in Ubud", "🌋 Sunrise hike on Mount Batur"],
    bestTime: "April – October", budget: "From $1,800 / person", duration: "10–14 days", language: "Balinese / English",
  },
  dubai: {
    name: "Dubai", country: "UAE", emoji: "🇦🇪", tag: "Luxury", tagColor: "#E6B85A",
    hero: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1600&q=85",
    photos: [
      "https://images.unsplash.com/photo-1548813395-a8bde33f4e8c?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1581428982868-e410dd047a90?auto=format&fit=crop&w=900&q=85",
    ],
    description: "Dubai is the city of the future — a dazzling metropolis that has risen from the desert to become one of the world's most glamorous destinations. Home to the Burj Khalifa (the world's tallest building), the world's largest shopping mall, and some of the most luxurious hotels ever built, Dubai never ceases to amaze. Experience a desert safari, ski indoors, or dine at a Michelin-starred restaurant with views of the illuminated skyline.",
    highlights: ["🏙️ Burj Khalifa observation deck", "🏜️ Desert safari & camel ride", "🛍️ Dubai Mall & Gold Souk", "🎿 Ski Dubai indoor slope", "🚀 Frame Dubai & Museum of the Future"],
    bestTime: "Oct – April", budget: "From $2,500 / person", duration: "5–7 days", language: "Arabic / English",
  },
  "cancun": {
    name: "Cancún", country: "Mexico", emoji: "🇲🇽", tag: "Beach", tagColor: "#06b6d4",
    hero: "https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?auto=format&fit=crop&w=1600&q=85",
    photos: [
      "https://images.unsplash.com/photo-1552074284-5e88ef1aef18?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1510097467424-192d713fd8b2?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=900&q=85",
    ],
    description: "Cancún is Mexico's crown jewel — a stunning Caribbean destination where powder-white beaches meet turquoise waters, and ancient Mayan ruins rise above the jungle canopy. By day, snorkel in the world's second-largest coral reef, explore the archaeological wonder of Chichen Itza, or swim in ethereal cenotes. By night, enjoy world-class restaurants and entertainment in the Hotel Zone.",
    highlights: ["🌊 Caribbean beaches & snorkeling", "🏛️ Chichen Itza day trip", "💎 Cenote swimming", "🐠 Cozumel dive sites", "🌮 Authentic Mexican cuisine"],
    bestTime: "Nov – April", budget: "From $1,500 / person", duration: "7–10 days", language: "Spanish / English",
  },
  tokyo: {
    name: "Tokyo", country: "Japan", emoji: "🇯🇵", tag: "Culture", tagColor: "#ec4899",
    hero: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1600&q=85",
    photos: [
      "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1513407030348-c983a97b98d8?auto=format&fit=crop&w=900&q=85",
    ],
    description: "Tokyo is the world's most extraordinary city — an overwhelming sensory experience where ancient tradition and cutting-edge technology collide. Explore the neon-lit streets of Shibuya and Shinjuku, find serenity at centuries-old Shinto shrines, and indulge in the finest sushi of your life at a hidden basement restaurant. Tokyo has more Michelin-starred restaurants than any other city on Earth, making it an unrivaled culinary destination.",
    highlights: ["🗼 Tokyo Skytree views", "🍣 World's best sushi & ramen", "⛩️ Senso-ji Temple in Asakusa", "🎮 Akihabara electronics district", "🌸 Cherry blossom season"],
    bestTime: "March – May / Oct – Nov", budget: "From $2,800 / person", duration: "10–14 days", language: "Japanese",
  },
  paris: {
    name: "Paris", country: "France", emoji: "🇫🇷", tag: "Romantic", tagColor: "#f43f5e",
    hero: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1600&q=85",
    photos: [
      "https://images.unsplash.com/photo-1431274172761-fcdff02c35d5?auto=format&fit=crop&w=800&q=85",
      "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=800&q=85",
      "https://images.unsplash.com/photo-1471623320832-752e8bbf8413?auto=format&fit=crop&w=800&q=85",
    ],
    description: "Paris — the City of Light — is one of the most beautiful cities on Earth and the world's most visited destination. From the iconic Eiffel Tower sparkling at night to the world-class art collections of the Louvre, Paris is an inexhaustible source of wonder. Stroll through charming Montmartre, shop on the Champs-Élysées, and experience French gastronomy at its finest in intimate bistros and starred restaurants alike.",
    highlights: ["🗼 Eiffel Tower & Seine River cruise", "🎨 Louvre & Musée d'Orsay", "🥐 French pastries & cuisine", "👗 Fashion shopping on Champs-Élysées", "🏰 Versailles Palace day trip"],
    bestTime: "April – June / Sept – Oct", budget: "From $2,000 / person", duration: "5–7 days", language: "French",
  },
  miami: {
    name: "Miami", country: "USA", emoji: "🌴", tag: "Beach", tagColor: "#f43f5e",
    hero: "https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?auto=format&fit=crop&w=1400&q=85",
    photos: [
      "https://images.unsplash.com/photo-1535498730771-e735b998cd64?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?auto=format&fit=crop&w=900&q=85",
    ],
    description: "Miami is America's most glamorous city — a vibrant fusion of Latin culture, Art Deco architecture, and some of the most beautiful beaches in the world. South Beach is legendary for its white sand and azure waters, while Wynwood's street art scene has transformed it into a global cultural hub. By night, Miami's nightlife is unmatched — from rooftop bars overlooking Biscayne Bay to world-renowned clubs.",
    highlights: ["🏖️ South Beach & Ocean Drive", "🎨 Wynwood Walls street art", "🌴 Art Deco Historic District", "🛥️ Biscayne Bay yacht tours", "🍹 Little Havana & Cuban cuisine"],
    bestTime: "Nov – April", budget: "From $1,800 / person", duration: "4–7 days", language: "English / Spanish",
  },
  "amalfi-coast": {
    name: "Amalfi Coast", country: "Italy", emoji: "🏔️", tag: "Romance", tagColor: "#ec4899",
    hero: "https://images.unsplash.com/photo-1633321088355-d338f27f6b40?auto=format&fit=crop&w=1600&q=85",
    photos: ["https://images.unsplash.com/photo-1571406761060-0c6ad72d5bf8?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1612698093158-e07ac200d44e?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1555993539-1732b0258235?auto=format&fit=crop&w=900&q=85"],
    description: "The Amalfi Coast is one of Europe's most dramatic coastlines — a 50km stretch of cliffs, pastel villages, lemon groves, and turquoise water. Towns like Positano, Ravello, and the namesake Amalfi cling to steep hillsides above the Tyrrhenian Sea. Seafood is superb, limoncello flows freely, and every vista is postcard-perfect.",
    highlights: ["🍋 Positano's cliffside village", "⛵ Private boat tours along the coast", "🏛️ Ravello's Villa Rufolo gardens", "🍝 Fresh pasta & seafood", "🌊 Hidden coves and grottos"],
    bestTime: "May – Oct", budget: "From $2,400 / person", duration: "5–8 days", language: "Italian",
  },
  "bora-bora": {
    name: "Bora Bora", country: "French Polynesia", emoji: "🌺", tag: "Honeymoon", tagColor: "#8b5cf6",
    hero: "https://images.unsplash.com/photo-1589979481223-deb893043163?auto=format&fit=crop&w=1600&q=85",
    photos: ["https://images.unsplash.com/photo-1580541631950-7282082b53ce?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1619846249031-0d4e47e8e0a8?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1517760444937-f6397edcbbcd?auto=format&fit=crop&w=900&q=85"],
    description: "Bora Bora is the ultimate romantic escape — a volcanic island surrounded by a stunning lagoon of impossibly blue water. Famous for its iconic overwater bungalows, the island offers world-class snorkeling, shark feeding tours, and jaw-dropping sunsets. The main attraction is simply the water — electric blue, crystal clear, and full of colorful marine life.",
    highlights: ["🛖 Overwater bungalows", "🦈 Shark & ray snorkeling tours", "🌅 Mount Otemanu views", "🤿 Crystal-clear lagoon diving", "🍹 Sunset cocktail cruises"],
    bestTime: "May – Oct", budget: "From $4,500 / person", duration: "7–10 days", language: "French / English",
  },
  "new-york": {
    name: "New York City", country: "USA", emoji: "🗽", tag: "City Break", tagColor: "#3b82f6",
    hero: "https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=1600&q=85",
    photos: ["https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1490644658840-3f2e3f8c5625?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1560390370-e4bccb18cb3c?auto=format&fit=crop&w=900&q=85"],
    description: "New York City is the city that never sleeps — a relentless, electric, endlessly fascinating metropolis. From the bright lights of Times Square to the tranquility of Central Park, from Michelin-starred restaurants to $1 pizza slices, NYC does everything at maximum intensity. World-class museums, Broadway shows, luxury shopping, and rooftop bars with skyline views await.",
    highlights: ["🗽 Statue of Liberty & Ellis Island", "🌳 Central Park picnics", "🎭 Broadway shows", "🏙️ Top of the Rock views", "🛍️ Fifth Avenue & SoHo shopping"],
    bestTime: "Apr – Jun, Sep – Nov", budget: "From $2,200 / person", duration: "4–7 days", language: "English",
  },
  "maui": {
    name: "Maui", country: "Hawaii, USA", emoji: "🌺", tag: "Nature", tagColor: "#10b981",
    hero: "https://images.unsplash.com/photo-1542259009477-d625272157b7?auto=format&fit=crop&w=1600&q=85",
    photos: ["https://images.unsplash.com/photo-1570789210967-2cac24afeb00?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1505852679233-d9fd70aff56d?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1540962351504-03099e0a754b?auto=format&fit=crop&w=900&q=85"],
    description: "Maui is the perfect blend of adventure and relaxation. The Road to Hana winds through tropical rainforest and past stunning waterfalls, while Haleakalā volcano offers sunrise views above the clouds. World-famous beaches like Ka'anapali and Wailea deliver perfect snorkeling, whale watching (Dec–Apr), and stunning sunset dinners.",
    highlights: ["🌅 Haleakalā volcano sunrise", "🐋 Whale watching tours", "🤿 Molokini crater snorkeling", "🌊 Ka'anapali & Wailea beaches", "🚗 Road to Hana adventure"],
    bestTime: "Apr – May, Sep – Nov", budget: "From $2,800 / person", duration: "5–9 days", language: "English",
  },
  "swiss-alps": {
    name: "Swiss Alps", country: "Switzerland", emoji: "⛷️", tag: "Adventure", tagColor: "#3b82f6",
    hero: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1600&q=85",
    photos: ["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1544984243-ec57ea16fe25?auto=format&fit=crop&w=900&q=85"],
    description: "The Swiss Alps are the ultimate mountain destination — dramatic peaks, pristine glaciers, charming alpine villages, and world-class ski resorts. Zermatt sits in the shadow of the iconic Matterhorn, while Interlaken offers adventure sports between two stunning lakes. In summer, hiking trails open up extraordinary views; in winter, the slopes are simply perfect.",
    highlights: ["⛷️ World-class skiing at Zermatt", "🏔️ Matterhorn viewpoints", "🚂 Glacier Express train", "🪂 Interlaken paragliding", "🧀 Fondue & Swiss chocolate"],
    bestTime: "Dec – Mar (ski), Jun – Sep (hike)", budget: "From $3,200 / person", duration: "5–8 days", language: "German / French",
  },
  "kenya-safari": {
    name: "Kenya Safari", country: "Kenya", emoji: "🦁", tag: "Wildlife", tagColor: "#f59e0b",
    hero: "https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=1600&q=85",
    photos: ["https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1549366021-119938b0f667?auto=format&fit=crop&w=900&q=85"],
    description: "Kenya is the birthplace of safari — the Maasai Mara hosts the world's greatest wildlife spectacle, the Great Migration, where over 1.5 million wildebeest cross crocodile-infested rivers each year. Game drives reveal lions, elephants, leopards, and cheetahs in their natural habitat. Luxury tented camps bring you as close to nature as possible while maintaining every comfort.",
    highlights: ["🦁 Great Migration wildebeest crossing", "🐘 Big Five game drives", "🏕️ Luxury tented safari camps", "🌋 Mount Kenya day hike", "🌅 Sundowner cocktails on the savanna"],
    bestTime: "Jul – Oct", budget: "From $4,000 / person", duration: "7–12 days", language: "English / Swahili",
  },
  "barcelona": {
    name: "Barcelona", country: "Spain", emoji: "🎨", tag: "Culture", tagColor: "#ec4899",
    hero: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=1600&q=85",
    photos: ["https://images.unsplash.com/photo-1562883676-8c7feb83f09b?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1478565250905-0d5de38bc1de?auto=format&fit=crop&w=900&q=85"],
    description: "Barcelona is one of Europe's most vibrant cities — a place where Gaudí's surreal architecture meets world-class beaches, tapas bars, and a legendary nightlife. The Gothic Quarter is a labyrinth of medieval streets, while La Barceloneta beach is a 10-minute walk from Las Ramblas. Catalan cuisine is among the best in the world, with Michelin-starred restaurants and incredible food markets.",
    highlights: ["🏛️ Sagrada Família & Park Güell", "🍷 La Boqueria food market", "🏖️ Barceloneta beach", "🌃 Gothic Quarter night walk", "⚽ Camp Nou stadium tour"],
    bestTime: "Apr – Jun, Sep – Oct", budget: "From $1,800 / person", duration: "4–6 days", language: "Spanish / Catalan",
  },
  "kyoto": {
    name: "Kyoto", country: "Japan", emoji: "⛩️", tag: "Culture", tagColor: "#f59e0b",
    hero: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1600&q=85",
    photos: ["https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1558862107-d49ef2a04d72?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?auto=format&fit=crop&w=900&q=85"],
    description: "Kyoto is Japan's cultural heart — a city of over 1,600 temples, traditional geisha districts, and some of the world's most serene gardens. The bamboo grove of Arashiyama, the 10,000 torii gates of Fushimi Inari, and the golden pavilion of Kinkaku-ji are just the beginning. In spring, cherry blossom season transforms the city into a dreamlike landscape.",
    highlights: ["⛩️ Fushimi Inari thousand torii gates", "🏯 Kinkaku-ji Golden Pavilion", "🌸 Cherry blossom season", "🎋 Arashiyama bamboo grove", "🍵 Traditional tea ceremony"],
    bestTime: "Mar – May, Oct – Nov", budget: "From $2,400 / person", duration: "5–7 days", language: "Japanese",
  },
  "phuket": {
    name: "Phuket", country: "Thailand", emoji: "🌴", tag: "Beach", tagColor: "#10b981",
    hero: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?auto=format&fit=crop&w=1600&q=85",
    photos: ["https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?auto=format&fit=crop&w=900&q=85"],
    description: "Phuket is Thailand's largest island and most popular beach destination — a mix of stunning Andaman Sea beaches, luxury resorts, vibrant nightlife, and authentic Thai culture. Patong Beach is the lively hub, while quieter spots like Surin and Kata offer more relaxed vibes. Day trips to the Phi Phi Islands, James Bond Island, and Phang Nga Bay are unforgettable.",
    highlights: ["🏖️ Patong & Surin beaches", "⛵ Phi Phi Islands boat tour", "🛕 Big Buddha viewpoint", "🥘 Thai cooking class", "🎆 Patong nightlife"],
    bestTime: "Nov – Apr", budget: "From $1,400 / person", duration: "5–9 days", language: "Thai / English",
  },
  "cape-town": {
    name: "Cape Town", country: "South Africa", emoji: "🏔️", tag: "Adventure", tagColor: "#ef4444",
    hero: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=1600&q=85",
    photos: ["https://images.unsplash.com/photo-1563656157432-67560011e209?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1604941811870-2abb46f1f3d7?auto=format&fit=crop&w=900&q=85"],
    description: "Cape Town is one of the most beautiful cities in the world — where dramatic Table Mountain meets two oceans at the Cape of Good Hope. The city offers world-class wine tasting in the Winelands, penguin colonies at Boulders Beach, shark cage diving, and a rich mix of cultures. The food scene is exceptional, the weather is Mediterranean, and the scenery is simply jaw-dropping.",
    highlights: ["⛰️ Table Mountain cable car", "🐧 Boulders Beach penguins", "🦈 Shark cage diving", "🍷 Stellenbosch wine tours", "🌊 Cape of Good Hope"],
    bestTime: "Oct – Apr", budget: "From $2,600 / person", duration: "6–10 days", language: "English / Afrikaans",
  },
  "tuscany": {
    name: "Tuscany", country: "Italy", emoji: "🍷", tag: "Romance", tagColor: "#ec4899",
    hero: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1600&q=85",
    photos: ["https://images.unsplash.com/photo-1553861580-b1f7d98da8c4?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1464207687429-7505649dae38?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=900&q=85"],
    description: "Tuscany is Italy's most iconic region — rolling green hills dotted with cypress trees, medieval hilltop towns, and some of the world's finest wines. Florence is a Renaissance masterpiece with the Uffizi Gallery and Michelangelo's David. Siena's Piazza del Campo is one of Europe's greatest medieval squares. And the Chianti wine road connects vineyard after vineyard through breathtaking countryside.",
    highlights: ["🎨 Florence & the Uffizi Gallery", "🍷 Chianti wine tasting", "🏛️ Siena medieval quarter", "🌿 Val d'Orcia rolling hills", "🫒 Truffle hunting experience"],
    bestTime: "Apr – Jun, Sep – Oct", budget: "From $2,200 / person", duration: "6–9 days", language: "Italian",
  },
  "iceland": {
    name: "Iceland", country: "Iceland", emoji: "🌋", tag: "Adventure", tagColor: "#6366f1",
    hero: "https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&w=1600&q=85",
    photos: ["https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=800&q=85", "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=800&q=85", "https://images.unsplash.com/photo-1452421374516-6d1d428e5ac2?auto=format&fit=crop&w=800&q=85"],
    description: "Iceland is a land of fire and ice — volcanoes, glaciers, geysers, and the mesmerizing Northern Lights. The Golden Circle day trip covers Þingvellir National Park, the Geysir geothermal area, and the powerful Gullfoss waterfall. The Blue Lagoon geothermal spa is a once-in-a-lifetime experience, and the midnight sun in summer creates an otherworldly atmosphere.",
    highlights: ["🌌 Northern Lights (Sep–Mar)", "♨️ Blue Lagoon geothermal spa", "🗺️ Golden Circle tour", "🧊 Glacier hiking & ice caves", "🌋 Lava field & volcano tours"],
    bestTime: "Jun – Aug (midnight sun), Sep – Mar (Northern Lights)", budget: "From $3,000 / person", duration: "5–8 days", language: "Icelandic / English",
  },
  "mykonos": {
    name: "Mykonos", country: "Greece", emoji: "🌊", tag: "Luxury", tagColor: "#3b82f6",
    hero: "https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?auto=format&fit=crop&w=1600&q=85",
    photos: ["https://images.unsplash.com/photo-1555993539-1732b0258235?auto=format&fit=crop&w=800&q=85", "https://images.unsplash.com/photo-1516789776736-b3048dc7ecab?auto=format&fit=crop&w=800&q=85", "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?auto=format&fit=crop&w=800&q=85"],
    description: "Mykonos is the jewel of the Cyclades — an island of dazzling white architecture, iconic windmills, and crystal-clear waters. Famous for its cosmopolitan atmosphere and legendary party scene, it also offers beautiful quiet beaches, fresh seafood tavernas, and charming Little Venice at sunset. Day trips to the ancient island of Delos add cultural depth to a sun-drenched escape.",
    highlights: ["🌅 Little Venice sunset cocktails", "⚓ Day trip to Delos ancient ruins", "🏖️ Paradise & Super Paradise beaches", "💃 World-famous nightlife", "🛥️ Private catamaran tours"],
    bestTime: "Jun – Sep", budget: "From $2,800 / person", duration: "4–7 days", language: "Greek / English",
  },
  "rio": {
    name: "Rio de Janeiro", country: "Brazil", emoji: "🎉", tag: "Culture", tagColor: "#f59e0b",
    hero: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1600&q=85",
    photos: ["https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1574440696462-4c5b5e6a5f8b?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1544961371-516024f4a0bd?auto=format&fit=crop&w=900&q=85"],
    description: "Rio de Janeiro is one of the world's most spectacular cities — where jungle mountains meet urban beaches in a symphony of color, music, and energy. Christ the Redeemer overlooks it all from Corcovado mountain, while Sugarloaf offers even more dramatic views. Ipanema and Copacabana beaches are legendary, and during Carnival, Rio becomes the greatest party on earth.",
    highlights: ["✝️ Christ the Redeemer statue", "🏖️ Copacabana & Ipanema beaches", "🚡 Sugarloaf Mountain cable car", "🎺 Samba show in Lapa", "🌴 Tijuca rainforest hike"],
    bestTime: "Dec – Mar (Carnival!), Jun – Sep", budget: "From $2,200 / person", duration: "5–8 days", language: "Portuguese",
  },
  "cote-dazur": {
    name: "Côte d'Azur", country: "France", emoji: "⛵", tag: "Luxury", tagColor: "#3b82f6",
    hero: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1600&q=85",
    photos: ["https://images.unsplash.com/photo-1561501900-3701fa6a0864?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?auto=format&fit=crop&w=900&q=85"],
    description: "The French Riviera — or Côte d'Azur — is synonymous with glamour, sunshine, and the good life. Nice, Cannes, Monaco, and Saint-Tropez line this legendary coastline where billionaires dock superyachts and film stars attend the Cannes Film Festival. The Old Town of Nice is a maze of pastel buildings and morning markets, and the sea is impossibly turquoise.",
    highlights: ["⛵ Superyacht watching in Monaco", "🎬 Cannes Film Festival walk", "🏺 Nice Old Town & Promenade", "🍷 Provence wine & lavender", "🌊 Saint-Tropez beach clubs"],
    bestTime: "Jun – Sep", budget: "From $3,200 / person", duration: "5–8 days", language: "French",
  },
  "queenstown": {
    name: "Queenstown", country: "New Zealand", emoji: "🪂", tag: "Adventure", tagColor: "#10b981",
    hero: "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=1600&q=85",
    photos: ["https://images.unsplash.com/photo-1469521669194-babb45599def?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1585082658857-a7f29b5c8571?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1523365154888-8a758819b722?auto=format&fit=crop&w=900&q=85"],
    description: "Queenstown is the adventure capital of the world — a compact, vibrant lakeside town surrounded by The Remarkables mountain range. Bungee jumping was invented here (AJ Hackett), and you can also skydive, go white-water rafting, paraglide, jet boat, or ski. The nearby Milford Sound is one of the world's most spectacular fjords, and Queenstown's food and bar scene punches well above its size.",
    highlights: ["🪂 World's first commercial bungee jump", "⛷️ The Remarkables ski resort", "🛥️ Milford Sound fjord cruise", "🚤 Shotover Jet boat", "🌄 Skyline Gondola views"],
    bestTime: "Dec – Feb (summer), Jun – Aug (ski)", budget: "From $2,800 / person", duration: "5–8 days", language: "English",
  },
  "marrakech": {
    name: "Marrakech", country: "Morocco", emoji: "🕌", tag: "Culture", tagColor: "#f59e0b",
    hero: "https://images.unsplash.com/photo-1597212618440-806262de4f3b?auto=format&fit=crop&w=1600&q=85",
    photos: ["https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=800&q=85", "https://images.unsplash.com/photo-1577948000111-9c970dfe3743?auto=format&fit=crop&w=800&q=85", "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=800&q=85"],
    description: "Marrakech is a feast for the senses — ancient medinas overflowing with spices and crafts, rooftop riads offering tranquil escapes from the chaos below, and the legendary Djemaa el-Fna square alive with snake charmers and storytellers at dusk. The Atlas Mountains frame the city and day trips to Sahara desert camps offer unforgettable camel rides and star-filled skies.",
    highlights: ["🕌 Djemaa el-Fna square at sunset", "🌹 Majorelle Garden & YSL Museum", "🧖 Traditional hammam spa", "🐪 Sahara desert camel trek", "🧶 Souk shopping & bargaining"],
    bestTime: "Mar – May, Sep – Nov", budget: "From $1,600 / person", duration: "4–7 days", language: "Arabic / French",
  },
  "seychelles": {
    name: "Seychelles", country: "Indian Ocean", emoji: "🏝️", tag: "Paradise", tagColor: "#8b5cf6",
    hero: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1600&q=85",
    photos: ["https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1582968415393-c291c7cb0e00?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=900&q=85"],
    description: "The Seychelles are 115 granite and coral islands scattered across the Indian Ocean — the definition of paradise. Mahé, Praslin, and La Digue feature some of the world's most beautiful beaches, with warm turquoise water, enormous granite boulders, and lush jungle. The islands are also one of the most bio-diverse places on earth, with giant tortoises and rare black parrots found nowhere else.",
    highlights: ["🪨 Anse Source d'Argent granite beach", "🐢 Giant Aldabra tortoises", "🤿 Coral reef snorkeling", "⛵ Island hopping by catamaran", "🏝️ Vallée de Mai nature reserve"],
    bestTime: "Apr – May, Oct – Nov", budget: "From $4,200 / person", duration: "7–10 days", language: "English / French",
  },
  "costa-rica": {
    name: "Costa Rica", country: "Costa Rica", emoji: "🦜", tag: "Nature", tagColor: "#10b981",
    hero: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1600&q=85",
    photos: ["https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1510942201312-84e7962f0a99?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1587502536575-6dfba0a6e017?auto=format&fit=crop&w=900&q=85"],
    description: "Costa Rica is one of the world's top eco-tourism destinations — a small country packed with extraordinary biodiversity, volcanoes, cloud forests, and Pacific coast beaches. Arenal Volcano dominates the skyline near hot springs, Monteverde's cloud forest is a canopy zip-lining paradise, and the Nicoya Peninsula offers perfect surf and yoga retreats. 25% of the country is protected national park.",
    highlights: ["🌋 Arenal Volcano hike & hot springs", "🦥 Sloth & wildlife watching", "🪂 Monteverde zip-line canopy", "🏄 Manuel Antonio beach & park", "☕ Coffee farm tour"],
    bestTime: "Dec – Apr", budget: "From $2,000 / person", duration: "7–12 days", language: "Spanish",
  },
  "tanzania": {
    name: "Tanzania", country: "Tanzania", emoji: "🦒", tag: "Wildlife", tagColor: "#f59e0b",
    hero: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1400&q=85",
    photos: ["https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1580746738099-0f4516aec4d3?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1621414050941-38ba9e3c2e1d?auto=format&fit=crop&w=900&q=85"],
    description: "Tanzania is home to Africa's most iconic destinations — the Serengeti, Ngorongoro Crater, and Mount Kilimanjaro. The Serengeti's annual Great Migration is one of nature's greatest spectacles, while the Ngorongoro Crater hosts the world's densest population of large mammals in a natural enclosure. Zanzibar's spice island adds a perfect beach ending to any safari adventure.",
    highlights: ["🦁 Serengeti game drives", "🌋 Ngorongoro Crater wildlife", "⛰️ Kilimanjaro summit trek", "🏖️ Zanzibar spice island beach", "🦒 Tarangire elephants"],
    bestTime: "Jun – Oct", budget: "From $4,500 / person", duration: "8–14 days", language: "Swahili / English",
  },
  "lisbon": {
    name: "Lisbon", country: "Portugal", emoji: "🚋", tag: "Culture", tagColor: "#ec4899",
    hero: "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=1600&q=85",
    photos: ["https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1558383331-f520f2888351?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1591457332174-1bfd6aecd2dd?auto=format&fit=crop&w=900&q=85"],
    description: "Lisbon is Europe's most captivating city — a mosaic of pastel-colored buildings, ancient trams climbing steep hills, Fado music drifting from candlelit taverns, and one of Europe's most exciting food scenes. The city's history as a global empire is visible everywhere, from the ornate Jerónimos Monastery to the Tower of Belém by the Tagus River. And just 30 minutes away, Sintra's fairy-tale palaces await.",
    highlights: ["🚋 Historic Tram 28 ride", "🏰 Sintra fairy-tale palaces", "🎵 Live Fado music evening", "🐟 Pastéis de nata & seafood", "⚓ Belém Tower & Monument"],
    bestTime: "Mar – May, Sep – Oct", budget: "From $1,600 / person", duration: "4–6 days", language: "Portuguese",
  },
  "zanzibar": {
    name: "Zanzibar", country: "Tanzania", emoji: "🌊", tag: "Beach", tagColor: "#06b6d4",
    hero: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1600&q=85",
    photos: ["https://images.unsplash.com/photo-1620051845864-48a2b9b3c742?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1560390370-e4bccb18cb3c?auto=format&fit=crop&w=900&q=85", "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&w=900&q=85"],
    description: "Zanzibar is the Spice Island — a magical archipelago off the coast of Tanzania where Arabic, African, and Indian cultures blend in a fragrant, colorful, historical paradise. Stone Town's labyrinthine medina is a UNESCO World Heritage Site, while the beaches of Nungwi and Kendwa deliver pristine white sand and warm Indian Ocean waters. Spice tours, dolphin swimming, and prison island tortoise visits complete the experience.",
    highlights: ["🏘️ Stone Town UNESCO old city", "🐬 Dolphin swimming tour", "🌶️ Spice farm tour & tasting", "🏖️ Nungwi & Kendwa beaches", "🐢 Prison Island giant tortoises"],
    bestTime: "Jun – Oct, Dec – Feb", budget: "From $2,200 / person", duration: "5–8 days", language: "Swahili / English",
  },
};

// Fallback for unlisted destinations
function getDestination(slug: string) {
  const key = slug.toLowerCase().replace(/-/g, " ").replace(/\s+/g, "-");
  return DESTINATIONS[key] || DESTINATIONS[slug.toLowerCase()] || null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const dest = getDestination(slug);
  if (!dest) return { title: "Destination — Zeniva" };
  return {
    title: `${dest.name}, ${dest.country} — Zeniva`,
    description: dest.description.slice(0, 155),
  };
}

export default async function DestinationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const dest = getDestination(slug);

  // Generic fallback for destinations not in the detail list
  const destName = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ");

  const GOLD = "#E6B85A";
  const BLUE = "#0F6CF5";

  if (!dest) {
    return (
      <main style={{ minHeight: "100dvh", background: "#f8fafc" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "80px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🌍</div>
          <h1 style={{ color: "#0B1B4D", fontSize: 32, fontWeight: 900, marginBottom: 12 }}>{destName}</h1>
          <p style={{ color: "#64748b", fontSize: 16, marginBottom: 32 }}>Let Lina plan your perfect trip to {destName} — flights, hotels, transfers all included.</p>
          <Link href={`/chat?prompt=I want to plan a trip to ${destName}`} style={{ display: "inline-block", background: `linear-gradient(135deg, ${GOLD}, #C9941F)`, color: "#0B1B4D", borderRadius: 50, padding: "16px 36px", fontWeight: 900, fontSize: 16, textDecoration: "none" }}>
            💬 Plan with Lina →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100dvh", background: "#f8fafc", paddingBottom: 60 }}>

      {/* ── HERO ── */}
      <div style={{ position: "relative", height: 380, overflow: "hidden" }}>
        <img src={dest.hero} alt={dest.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.55) 100%)" }} />
        {/* Back */}
        <Link href="/destinations" style={{ position: "absolute", top: 20, left: 20, background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)", borderRadius: 50, padding: "8px 16px", color: "#0B1B4D", textDecoration: "none", fontSize: 14, fontWeight: 700 }}>
          ← Destinations
        </Link>
        {/* Tag */}
        <div style={{ position: "absolute", top: 20, right: 20, background: dest.tagColor, borderRadius: 30, padding: "6px 14px", color: "white", fontSize: 12, fontWeight: 700 }}>
          {dest.tag}
        </div>
        {/* Title */}
        <div style={{ position: "absolute", bottom: 28, left: 20, right: 20 }}>
          <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, marginBottom: 4 }}>{dest.emoji} {dest.country}</div>
          <h1 style={{ color: "white", fontSize: 38, fontWeight: 900, lineHeight: 1.1, margin: 0, textShadow: "0 2px 12px rgba(0,0,0,0.4)" }}>{dest.name}</h1>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 16px" }}>

        {/* ── QUICK INFO ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, margin: "24px 0" }}>
          {[
            { icon: "📅", label: "Best Time", val: dest.bestTime },
            { icon: "💰", label: "Starting From", val: dest.budget },
            { icon: "⏱️", label: "Ideal Duration", val: dest.duration },
            { icon: "🗣️", label: "Language", val: dest.language },
          ].map(i => (
            <div key={i.label} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 14, padding: "14px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{i.icon}</div>
              <div style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>{i.label}</div>
              <div style={{ color: "#0B1B4D", fontSize: 14, fontWeight: 700 }}>{i.val}</div>
            </div>
          ))}
        </div>

        {/* ── DESCRIPTION ── */}
        <p style={{ color: "#475569", fontSize: 15, lineHeight: 1.8, marginBottom: 28 }}>{dest.description}</p>

        {/* ── HIGHLIGHTS ── */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ color: "#0B1B4D", fontSize: 18, fontWeight: 800, marginBottom: 14 }}>✨ Highlights</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {dest.highlights.map((h, i) => (
              <div key={i} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, padding: "12px 16px", color: "#0B1B4D", fontSize: 14, fontWeight: 600, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>{h}</div>
            ))}
          </div>
        </div>

        {/* ── PHOTO GALLERY ── */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ color: "#0B1B4D", fontSize: 18, fontWeight: 800, marginBottom: 14 }}>📸 Gallery</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {dest.photos.map((p, i) => (
              <div key={i} style={{ borderRadius: 14, overflow: "hidden", aspectRatio: i === 0 ? "16/9" : "4/3", gridColumn: i === 0 ? "1 / -1" : undefined }}>
                <img src={p} alt={`${dest.name} ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <div style={{ background: "white", border: `2px solid ${GOLD}55`, borderRadius: 24, padding: "28px 24px", textAlign: "center", marginBottom: 20, boxShadow: "0 4px 20px rgba(230,184,90,0.12)" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✈️</div>
          <h2 style={{ color: "#0B1B4D", fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Ready to go to {dest.name}?</h2>
          <p style={{ color: "#64748b", fontSize: 14, marginBottom: 20, lineHeight: 1.5 }}>
            Lina will plan your full trip — flights, hotel, transfers & activities.<br />100% free, personalized, instant.
          </p>
          <Link href={`/chat?prompt=I want to plan a trip to ${dest.name}, ${dest.country}`} style={{ display: "block", background: `linear-gradient(135deg, ${GOLD}, #C9941F)`, color: "#0B1B4D", borderRadius: 50, padding: "17px", fontWeight: 900, fontSize: 17, textDecoration: "none", marginBottom: 12 }}>
            💬 Plan my {dest.name} trip with Lina →
          </Link>
          <p style={{ color: "#94a3b8", fontSize: 12 }}>🎁 15% OFF your first booking · No credit card needed</p>
        </div>

      </div>
    </main>
  );
}
