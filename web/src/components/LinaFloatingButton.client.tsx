"use client";
import React from "react";

export default function LinaFloatingButton() {
  const handleClick = () => {
    window.location.href = "/agent/lina";
  };
  return (
    <button
      onClick={handleClick}
      style={{
        position: "fixed",
        bottom: 32,
        right: 32,
        zIndex: 1000,
        background: "#181f36",
        color: "#fff",
        border: "none",
        borderRadius: 999,
        boxShadow: "0 4px 24px rgba(24,31,54,0.18)",
        padding: "14px 28px 14px 18px",
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
      <img src="/branding/lina-avatar.png" alt="Lina" style={{ width: 32, height: 32, borderRadius: "50%", marginRight: 10, background: "#fff" }} />
      Lina
    </button>
  );
}
