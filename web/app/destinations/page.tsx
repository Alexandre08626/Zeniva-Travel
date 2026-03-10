import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Top Destinations — Zeniva Travel",
  description: "Discover the 30 most beautiful destinations in the world. Plan your dream trip with Lina AI — free, instant, personalized.",
};

const ALL_DESTINATIONS = [
  { name: "Maldives", country: "Indian Ocean", emoji: "🏝️", img: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=800&q=80", tag: "Paradise", color: "#8b5cf6", desc: "Overwater bungalows, crystal lagoons" },
  { name: "Santorini", country: "Greece", emoji: "🇬🇷", img: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80", tag: "Romantic", color: "#0F6CF5", desc: "White villages, sunset views" },
  { name: "Bali", country: "Indonesia", emoji: "🇮🇩", img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80", tag: "Adventure", color: "#10b981", desc: "Temples, rice terraces & beaches" },
  { name: "Dubai", country: "UAE", emoji: "🇦🇪", img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80", tag: "Luxury", color: "#E6B85A", desc: "Skyline, desert & world-class hotels" },
  { name: "Cancún", country: "Mexico", emoji: "🇲🇽", img: "https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?auto=format&fit=crop&w=800&q=80", tag: "Beach", color: "#06b6d4", desc: "White sand, turquoise Caribbean" },
  { name: "Tokyo", country: "Japan", emoji: "🇯🇵", img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80", tag: "Culture", color: "#ec4899", desc: "Neon lights, sushi & temples" },
  { name: "Paris", country: "France", emoji: "🇫🇷", img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80", tag: "Romantic", color: "#f43f5e", desc: "Eiffel Tower, art & cuisine" },
  { name: "Amalfi Coast", country: "Italy", emoji: "🇮🇹", img: "https://images.unsplash.com/photo-1534570122623-99e8378a9aa7?auto=format&fit=crop&w=800&q=80", tag: "Scenic", color: "#f59e0b", desc: "Clifftop villages & blue sea" },
  { name: "Bora Bora", country: "French Polynesia", emoji: "🌺", img: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=800&q=80", tag: "Paradise", color: "#06b6d4", desc: "Turquoise lagoon & Mount Otemanu" },
  { name: "New York", country: "USA", emoji: "🗽", img: "https://images.unsplash.com/photo-1490644658840-3f2e3f8c5625?auto=format&fit=crop&w=800&q=80", tag: "City", color: "#0F6CF5", desc: "Broadway, Central Park & skyline" },
  { name: "Maui", country: "Hawaii, USA", emoji: "🌺", img: "https://images.unsplash.com/photo-1562091558-ccb3fe1efb3b?auto=format&fit=crop&w=800&q=80", tag: "Beach", color: "#10b981", desc: "Volcanic beaches & Road to Hana" },
  { name: "Swiss Alps", country: "Switzerland", emoji: "🏔️", img: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=800&q=80", tag: "Adventure", color: "#64748b", desc: "Skiing, chalets & mountain views" },
  { name: "Safari Kenya", country: "Kenya", emoji: "🦁", img: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80", tag: "Adventure", color: "#f59e0b", desc: "Big Five & Maasai Mara" },
  { name: "Barcelona", country: "Spain", emoji: "🇪🇸", img: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=800&q=80", tag: "Culture", color: "#f43f5e", desc: "Gaudí, tapas & La Barceloneta" },
  { name: "Kyoto", country: "Japan", emoji: "⛩️", img: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80", tag: "Culture", color: "#ec4899", desc: "Geishas, temples & cherry blossoms" },
  { name: "Phuket", country: "Thailand", emoji: "🇹🇭", img: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=800&q=80", tag: "Beach", color: "#06b6d4", desc: "Emerald bays & vibrant nightlife" },
  { name: "Cape Town", country: "South Africa", emoji: "🇿🇦", img: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=800&q=80", tag: "Scenic", color: "#10b981", desc: "Table Mountain & Cape Winelands" },
  { name: "Tuscany", country: "Italy", emoji: "🍷", img: "https://images.unsplash.com/photo-1543429258-7dab6fd0dfff?auto=format&fit=crop&w=800&q=80", tag: "Romantic", color: "#f59e0b", desc: "Rolling hills, villas & fine wine" },
  { name: "Iceland", country: "Iceland", emoji: "🌌", img: "https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&w=800&q=80", tag: "Adventure", color: "#8b5cf6", desc: "Northern lights & geysers" },
  { name: "Mykonos", country: "Greece", emoji: "🏳️", img: "https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?auto=format&fit=crop&w=800&q=80", tag: "Party", color: "#0F6CF5", desc: "Whitewashed streets & beach clubs" },
  { name: "Miami", country: "USA", emoji: "🌴", img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80", tag: "Beach", color: "#f43f5e", desc: "Art Deco, South Beach & nightlife" },
  { name: "Rio de Janeiro", country: "Brazil", emoji: "🇧🇷", img: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=800&q=80", tag: "Vibrant", color: "#10b981", desc: "Christ the Redeemer & Copacabana" },
  { name: "Côte d'Azur", country: "France", emoji: "⛵", img: "https://images.unsplash.com/photo-1562883676-8c7feb83f09b?auto=format&fit=crop&w=800&q=80", tag: "Luxury", color: "#06b6d4", desc: "Nice, Monaco & Saint-Tropez" },
  { name: "Queenstown", country: "New Zealand", emoji: "🇳🇿", img: "https://images.unsplash.com/photo-1469521669194-babb45599def?auto=format&fit=crop&w=800&q=80", tag: "Adventure", color: "#64748b", desc: "Bungee jumping & fjords" },
  { name: "Marrakech", country: "Morocco", emoji: "🇲🇦", img: "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=800&q=80", tag: "Culture", color: "#f59e0b", desc: "Souks, riads & Atlas Mountains" },
  { name: "Seychelles", country: "Seychelles", emoji: "🌊", img: "https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?auto=format&fit=crop&w=800&q=80", tag: "Paradise", color: "#06b6d4", desc: "Granite boulders & turquoise sea" },
  { name: "Costa Rica", country: "Costa Rica", emoji: "🦜", img: "https://images.unsplash.com/photo-1518259102261-b40117eabbc9?auto=format&fit=crop&w=800&q=80", tag: "Nature", color: "#10b981", desc: "Rainforest, volcanoes & sloths" },
  { name: "Arusha", country: "Tanzania", emoji: "🦒", img: "https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=800&q=80", tag: "Safari", color: "#f59e0b", desc: "Serengeti & Kilimanjaro" },
  { name: "Lisbon", country: "Portugal", emoji: "🇵🇹", img: "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?auto=format&fit=crop&w=800&q=80", tag: "Culture", color: "#f43f5e", desc: "Trams, Fado music & pastéis" },
  { name: "Zanzibar", country: "Tanzania", emoji: "🏖️", img: "https://images.unsplash.com/photo-1610641818989-c2051b5e2cfd?auto=format&fit=crop&w=800&q=80", tag: "Beach", color: "#8b5cf6", desc: "Spice island & powder-white beaches" },
];

const TAG_COLORS: Record<string, string> = {
  Paradise: "#8b5cf6", Romantic: "#f43f5e", Adventure: "#10b981",
  Luxury: "#E6B85A", Beach: "#06b6d4", Culture: "#ec4899",
  City: "#0F6CF5", Scenic: "#64748b", Safari: "#f59e0b",
  Nature: "#10b981", Party: "#f43f5e", Vibrant: "#10b981",
};

export default function DestinationsPage() {
  return (
    <main style={{ minHeight: "100dvh", background: "#040d1f", paddingBottom: 48 }}>
      {/* ── HEADER ── */}
      <div style={{ background: "linear-gradient(180deg, #0B1B4D 0%, #040d1f 100%)", padding: "48px 20px 32px", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🌍</div>
        <h1 style={{ color: "white", fontSize: 32, fontWeight: 900, marginBottom: 8 }}>Top 30 Destinations</h1>
        <p style={{ color: "#64748b", fontSize: 15, maxWidth: 440, margin: "0 auto 24px" }}>
          The world's most beautiful places — planned by Lina AI in minutes
        </p>
        <Link href="/forms/travel?agent=info%40zeniva.ca" style={{ display: "inline-block", background: "linear-gradient(135deg, #E6B85A, #C9941F)", color: "#0B1B4D", borderRadius: 50, padding: "12px 28px", fontWeight: 900, fontSize: 15, textDecoration: "none" }}>
          🎁 Plan my trip — 15% OFF →
        </Link>
      </div>

      {/* ── GRID ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {ALL_DESTINATIONS.map((d, i) => (
            <Link key={d.name} href={`/chat?prompt=I want to go to ${d.name}`} style={{ textDecoration: "none", display: "block", borderRadius: 20, overflow: "hidden", position: "relative", aspectRatio: "4/3" }}>
              <img src={d.img} alt={d.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(0,0,0,0.75) 0%, transparent 55%)" }} />
              {/* Rank */}
              <div style={{ position: "absolute", top: 12, left: 12, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", borderRadius: 8, padding: "4px 10px", color: "white", fontSize: 12, fontWeight: 800 }}>
                #{i + 1}
              </div>
              {/* Tag */}
              <div style={{ position: "absolute", top: 12, right: 12, background: (TAG_COLORS[d.tag] || "#0F6CF5") + "cc", borderRadius: 30, padding: "4px 10px", color: "white", fontSize: 11, fontWeight: 700 }}>
                {d.tag}
              </div>
              {/* Info */}
              <div style={{ position: "absolute", bottom: 0, left: 0, padding: "16px" }}>
                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{d.emoji} {d.country}</div>
                <div style={{ color: "white", fontSize: 20, fontWeight: 900, marginBottom: 3 }}>{d.name}</div>
                <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>{d.desc}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* ── CTA BOTTOM ── */}
        <div style={{ textAlign: "center", marginTop: 48, padding: "32px 20px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>✈️</div>
          <h2 style={{ color: "white", fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Ready to book your dream trip?</h2>
          <p style={{ color: "#64748b", fontSize: 14, marginBottom: 24 }}>Lina plans everything in minutes — flights, hotels, transfers. 100% free.</p>
          <Link href="/forms/travel?agent=info%40zeniva.ca" style={{ display: "inline-block", background: "linear-gradient(135deg, #E6B85A, #C9941F)", color: "#0B1B4D", borderRadius: 50, padding: "16px 36px", fontWeight: 900, fontSize: 16, textDecoration: "none" }}>
            🎁 Start for free — Get 15% OFF →
          </Link>
        </div>
      </div>
    </main>
  );
}
