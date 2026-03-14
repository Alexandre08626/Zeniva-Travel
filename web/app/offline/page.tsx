"use client";
export const dynamic = "force-dynamic";
export default function OfflinePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #050E1F 0%, #0A1E4A 50%, #0F3A8A 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <img src="/branding/logo.png" alt="Zeniva Travel" style={{ height: 60, marginBottom: "2rem", opacity: 0.9 }} />
      <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>✈️</div>
      <h1 style={{ color: "white", fontSize: "1.75rem", fontWeight: 900, marginBottom: "0.75rem" }}>
        You're offline
      </h1>
      <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1rem", maxWidth: 320, lineHeight: 1.6 }}>
        No internet connection. Check your connection and try again — Lina will be waiting for you.
      </p>
      <button
        onClick={() => window.location.reload()}
        style={{
          marginTop: "2rem",
          background: "#E6B85A",
          color: "#0B1B4D",
          border: "none",
          borderRadius: "999px",
          padding: "0.875rem 2rem",
          fontWeight: 800,
          fontSize: "1rem",
          cursor: "pointer",
        }}
      >
        Try Again
      </button>
    </div>
  );
}
