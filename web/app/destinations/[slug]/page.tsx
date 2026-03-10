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
    hero: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1400&q=80",
    photos: [
      "https://images.unsplash.com/photo-1540202404-1b927e27fa8b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1586500036706-41963de24d8b?auto=format&fit=crop&w=800&q=80",
    ],
    description: "The Maldives is the ultimate tropical paradise — a nation of 1,200 coral islands scattered across the Indian Ocean. Stay in iconic overwater bungalows perched above crystal-clear turquoise lagoons, snorkel with manta rays, and watch the sun set into the Indian Ocean from your private deck. Every resort is its own island, offering an unparalleled sense of exclusivity and serenity.",
    highlights: ["🌊 Overwater bungalows", "🐠 World-class snorkeling & diving", "🌅 Private beach sunsets", "🦈 Swim with whale sharks", "🍹 All-inclusive luxury resorts"],
    bestTime: "Nov – April", budget: "From $3,500 / person", duration: "7–14 days", language: "Dhivehi / English",
  },
  santorini: {
    name: "Santorini", country: "Greece", emoji: "🇬🇷", tag: "Romantic", tagColor: "#f43f5e",
    hero: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1400&q=80",
    photos: [
      "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1555993539-1732b0258235?auto=format&fit=crop&w=800&q=80",
    ],
    description: "Santorini is the most iconic island in Greece — a crescent-shaped volcanic island rising dramatically from the Aegean Sea. The cliffside villages of Oia and Fira are famous for their whitewashed buildings, blue-domed churches, and the world's most celebrated sunsets. Sip local wine at sunset, explore ancient ruins, and relax on black volcanic beaches unlike anywhere else on Earth.",
    highlights: ["🌅 World-famous Oia sunset", "🍷 Volcanic wine tasting", "🏛️ Ancient ruins of Akrotiri", "⛵ Caldera boat tours", "🏖️ Black volcanic beaches"],
    bestTime: "May – October", budget: "From $2,200 / person", duration: "5–10 days", language: "Greek / English",
  },
  bali: {
    name: "Bali", country: "Indonesia", emoji: "🇮🇩", tag: "Adventure", tagColor: "#10b981",
    hero: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1400&q=80",
    photos: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&w=800&q=80",
    ],
    description: "Bali is the Island of the Gods — a magical destination where ancient Hindu temples, emerald rice terraces, and world-class surf beaches coexist. From the spiritual town of Ubud to the vibrant beach clubs of Seminyak, Bali offers an extraordinary diversity of experiences. Attend a traditional Kecak fire dance, hike Mount Batur at sunrise, or simply unwind in a luxury jungle villa.",
    highlights: ["🌾 Tegallalang Rice Terraces", "🛕 Temple of Uluwatu at sunset", "🏄 World-class surfing in Kuta", "🧘 Yoga & wellness in Ubud", "🌋 Sunrise hike on Mount Batur"],
    bestTime: "April – October", budget: "From $1,800 / person", duration: "10–14 days", language: "Balinese / English",
  },
  dubai: {
    name: "Dubai", country: "UAE", emoji: "🇦🇪", tag: "Luxury", tagColor: "#E6B85A",
    hero: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1400&q=80",
    photos: [
      "https://images.unsplash.com/photo-1548813395-a8bde33f4e8c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1581428982868-e410dd047a90?auto=format&fit=crop&w=800&q=80",
    ],
    description: "Dubai is the city of the future — a dazzling metropolis that has risen from the desert to become one of the world's most glamorous destinations. Home to the Burj Khalifa (the world's tallest building), the world's largest shopping mall, and some of the most luxurious hotels ever built, Dubai never ceases to amaze. Experience a desert safari, ski indoors, or dine at a Michelin-starred restaurant with views of the illuminated skyline.",
    highlights: ["🏙️ Burj Khalifa observation deck", "🏜️ Desert safari & camel ride", "🛍️ Dubai Mall & Gold Souk", "🎿 Ski Dubai indoor slope", "🚀 Frame Dubai & Museum of the Future"],
    bestTime: "Oct – April", budget: "From $2,500 / person", duration: "5–7 days", language: "Arabic / English",
  },
  "cancun": {
    name: "Cancún", country: "Mexico", emoji: "🇲🇽", tag: "Beach", tagColor: "#06b6d4",
    hero: "https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?auto=format&fit=crop&w=1400&q=80",
    photos: [
      "https://images.unsplash.com/photo-1552074284-5e88ef1aef18?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1510097467424-192d713fd8b2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80",
    ],
    description: "Cancún is Mexico's crown jewel — a stunning Caribbean destination where powder-white beaches meet turquoise waters, and ancient Mayan ruins rise above the jungle canopy. By day, snorkel in the world's second-largest coral reef, explore the archaeological wonder of Chichen Itza, or swim in ethereal cenotes. By night, enjoy world-class restaurants and entertainment in the Hotel Zone.",
    highlights: ["🌊 Caribbean beaches & snorkeling", "🏛️ Chichen Itza day trip", "💎 Cenote swimming", "🐠 Cozumel dive sites", "🌮 Authentic Mexican cuisine"],
    bestTime: "Nov – April", budget: "From $1,500 / person", duration: "7–10 days", language: "Spanish / English",
  },
  tokyo: {
    name: "Tokyo", country: "Japan", emoji: "🇯🇵", tag: "Culture", tagColor: "#ec4899",
    hero: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1400&q=80",
    photos: [
      "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1513407030348-c983a97b98d8?auto=format&fit=crop&w=800&q=80",
    ],
    description: "Tokyo is the world's most extraordinary city — an overwhelming sensory experience where ancient tradition and cutting-edge technology collide. Explore the neon-lit streets of Shibuya and Shinjuku, find serenity at centuries-old Shinto shrines, and indulge in the finest sushi of your life at a hidden basement restaurant. Tokyo has more Michelin-starred restaurants than any other city on Earth, making it an unrivaled culinary destination.",
    highlights: ["🗼 Tokyo Skytree views", "🍣 World's best sushi & ramen", "⛩️ Senso-ji Temple in Asakusa", "🎮 Akihabara electronics district", "🌸 Cherry blossom season"],
    bestTime: "March – May / Oct – Nov", budget: "From $2,800 / person", duration: "10–14 days", language: "Japanese",
  },
  paris: {
    name: "Paris", country: "France", emoji: "🇫🇷", tag: "Romantic", tagColor: "#f43f5e",
    hero: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1400&q=80",
    photos: [
      "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1520939817895-060bdaf4fe1b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80",
    ],
    description: "Paris — the City of Light — is one of the most beautiful cities on Earth and the world's most visited destination. From the iconic Eiffel Tower sparkling at night to the world-class art collections of the Louvre, Paris is an inexhaustible source of wonder. Stroll through charming Montmartre, shop on the Champs-Élysées, and experience French gastronomy at its finest in intimate bistros and starred restaurants alike.",
    highlights: ["🗼 Eiffel Tower & Seine River cruise", "🎨 Louvre & Musée d'Orsay", "🥐 French pastries & cuisine", "👗 Fashion shopping on Champs-Élysées", "🏰 Versailles Palace day trip"],
    bestTime: "April – June / Sept – Oct", budget: "From $2,000 / person", duration: "5–7 days", language: "French",
  },
  miami: {
    name: "Miami", country: "USA", emoji: "🌴", tag: "Beach", tagColor: "#f43f5e",
    hero: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1400&q=80",
    photos: [
      "https://images.unsplash.com/photo-1535498730771-e735b998cd64?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1533106418989-88406c7cc8ca?auto=format&fit=crop&w=800&q=80",
    ],
    description: "Miami is America's most glamorous city — a vibrant fusion of Latin culture, Art Deco architecture, and some of the most beautiful beaches in the world. South Beach is legendary for its white sand and azure waters, while Wynwood's street art scene has transformed it into a global cultural hub. By night, Miami's nightlife is unmatched — from rooftop bars overlooking Biscayne Bay to world-renowned clubs.",
    highlights: ["🏖️ South Beach & Ocean Drive", "🎨 Wynwood Walls street art", "🌴 Art Deco Historic District", "🛥️ Biscayne Bay yacht tours", "🍹 Little Havana & Cuban cuisine"],
    bestTime: "Nov – April", budget: "From $1,800 / person", duration: "4–7 days", language: "English / Spanish",
  },
};

// Fallback for unlisted destinations
function getDestination(slug: string) {
  const key = slug.toLowerCase().replace(/-/g, " ").replace(/\s+/g, "-");
  return DESTINATIONS[key] || DESTINATIONS[slug.toLowerCase()] || null;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const dest = getDestination(params.slug);
  if (!dest) return { title: "Destination — Zeniva Travel" };
  return {
    title: `${dest.name}, ${dest.country} — Zeniva Travel`,
    description: dest.description.slice(0, 155),
  };
}

export default function DestinationPage({ params }: { params: { slug: string } }) {
  const dest = getDestination(params.slug);

  // Generic fallback for destinations not in the detail list
  const destName = params.slug.charAt(0).toUpperCase() + params.slug.slice(1).replace(/-/g, " ");

  const GOLD = "#E6B85A";
  const BLUE = "#0F6CF5";

  if (!dest) {
    // Generic page for destinations without detailed data
    return (
      <main style={{ minHeight: "100dvh", background: "#040d1f" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "48px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🌍</div>
          <h1 style={{ color: "white", fontSize: 32, fontWeight: 900, marginBottom: 12 }}>{destName}</h1>
          <p style={{ color: "#64748b", fontSize: 16, marginBottom: 32 }}>Let Lina plan your perfect trip to {destName} — flights, hotels, transfers all included.</p>
          <Link href={`/chat?prompt=I want to plan a trip to ${destName}`} style={{ display: "inline-block", background: `linear-gradient(135deg, ${GOLD}, #C9941F)`, color: "#0B1B4D", borderRadius: 50, padding: "16px 36px", fontWeight: 900, fontSize: 16, textDecoration: "none" }}>
            💬 Plan with Lina →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100dvh", background: "#040d1f", paddingBottom: 60 }}>
      {/* ── HERO ── */}
      <div style={{ position: "relative", height: 380, overflow: "hidden" }}>
        <img src={dest.hero} alt={dest.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(4,13,31,0.9) 100%)" }} />
        {/* Back button */}
        <Link href="/destinations" style={{ position: "absolute", top: 20, left: 20, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", borderRadius: 50, padding: "8px 16px", color: "white", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
          ← All Destinations
        </Link>
        {/* Tag */}
        <div style={{ position: "absolute", top: 20, right: 20, background: dest.tagColor + "cc", borderRadius: 30, padding: "6px 14px", color: "white", fontSize: 12, fontWeight: 700 }}>
          {dest.tag}
        </div>
        {/* Title */}
        <div style={{ position: "absolute", bottom: 28, left: 20, right: 20 }}>
          <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, marginBottom: 4 }}>{dest.emoji} {dest.country}</div>
          <h1 style={{ color: "white", fontSize: 38, fontWeight: 900, lineHeight: 1.1, margin: 0 }}>{dest.name}</h1>
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
            <div key={i.label} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "14px 16px" }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{i.icon}</div>
              <div style={{ color: "#64748b", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>{i.label}</div>
              <div style={{ color: "white", fontSize: 14, fontWeight: 700 }}>{i.val}</div>
            </div>
          ))}
        </div>

        {/* ── DESCRIPTION ── */}
        <p style={{ color: "#94a3b8", fontSize: 15, lineHeight: 1.75, marginBottom: 28 }}>{dest.description}</p>

        {/* ── HIGHLIGHTS ── */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ color: "white", fontSize: 18, fontWeight: 800, marginBottom: 14 }}>✨ Highlights</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {dest.highlights.map((h, i) => (
              <div key={i} style={{ background: "rgba(15,108,245,0.08)", border: "1px solid rgba(15,108,245,0.2)", borderRadius: 12, padding: "12px 16px", color: "white", fontSize: 14, fontWeight: 600 }}>{h}</div>
            ))}
          </div>
        </div>

        {/* ── PHOTO GALLERY ── */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ color: "white", fontSize: 18, fontWeight: 800, marginBottom: 14 }}>📸 Gallery</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {dest.photos.map((p, i) => (
              <div key={i} style={{ borderRadius: 14, overflow: "hidden", aspectRatio: i === 0 ? "16/9" : "4/3", gridColumn: i === 0 ? "1 / -1" : undefined }}>
                <img src={p} alt={`${dest.name} ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <div style={{ background: `linear-gradient(135deg, rgba(230,184,90,0.12), rgba(230,184,90,0.05))`, border: `1.5px solid ${GOLD}33`, borderRadius: 24, padding: "28px 24px", textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✈️</div>
          <h2 style={{ color: "white", fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Ready to go to {dest.name}?</h2>
          <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 20, lineHeight: 1.5 }}>
            Lina will plan your full trip — flights, hotel, transfers & activities.<br />100% free, personalized, instant.
          </p>
          <Link href={`/chat?prompt=I want to plan a trip to ${dest.name}, ${dest.country}`} style={{ display: "block", background: `linear-gradient(135deg, ${GOLD}, #C9941F)`, color: "#0B1B4D", borderRadius: 50, padding: "17px", fontWeight: 900, fontSize: 17, textDecoration: "none", marginBottom: 12 }}>
            💬 Plan my {dest.name} trip with Lina →
          </Link>
          <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 11 }}>🎁 15% OFF your first booking · No credit card needed</p>
        </div>

      </div>
    </main>
  );
}
