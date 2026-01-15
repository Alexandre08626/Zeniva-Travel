import React from "react";

export default function LinaFloatingButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: "fixed",
        bottom: 32,
        right: 32,
        zIndex: 1000,
        background: "linear-gradient(90deg, #7f5af0 0%, #f0a500 100%)",
        color: "#fff",
        border: "none",
        borderRadius: 999,
        boxShadow: "0 4px 24px rgba(127,90,240,0.2)",
        padding: "18px 32px 18px 24px",
        fontWeight: 700,
        fontSize: 20,
        letterSpacing: 1,
        display: "flex",
        alignItems: "center",
        gap: 12,
        cursor: "pointer"
      }}
      aria-label="Ouvrir Lina, copilote IA"
    >
      <span style={{ fontSize: 40, marginRight: 8 }}>🤖</span>
      Lina
      <span style={{
        background: "#fff",
        color: "#7f5af0",
        borderRadius: 8,
        fontWeight: 800,
        fontSize: 13,
        marginLeft: 12,
        padding: "2px 8px"
      }}>IA</span>
    </button>
  );
}
