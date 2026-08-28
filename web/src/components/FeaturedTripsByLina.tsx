"use client";
// FeaturedTripsByLina — voyages en vedette suggérés par Lina.
export default function FeaturedTripsByLina() {
  return (
    <section
      style={{
        padding: "32px 20px",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <h3
        style={{
          fontSize: 22,
          fontWeight: 800,
          color: "#0B1B4D",
          marginBottom: 4,
        }}
      >
        ✨ Voyages en vedette
      </h3>
      <p style={{ color: "#64748b", fontSize: 14, marginBottom: 20 }}>
        Lina a déniché ces destinations rien que pour vous.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        {[
          { emoji: "🏖️", title: "Soleil & Plage", desc: "Cancún, Punta Cana, Varadero" },
          { emoji: "🏔️", title: "Aventure", desc: "Randonnées et éco-tours" },
          { emoji: "⛵", title: "Croisières", desc: "Caraïbes, Méditerranée, Alaska" },
          { emoji: "💑", title: "Lune de miel", desc: "Escapades romantiques" },
        ].map((t) => (
          <div
            key={t.title}
            style={{
              borderRadius: 16,
              border: "1px solid #e5e7eb",
              background: "#fff",
              padding: 20,
              boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ fontSize: 32 }}>{t.emoji}</div>
            <div style={{ fontWeight: 700, color: "#0F172a", margin: "8px 0 2px" }}>{t.title}</div>
            <div style={{ fontSize: 13, color: "#64748b" }}>{t.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
