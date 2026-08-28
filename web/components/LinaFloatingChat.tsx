"use client";
// LinaFloatingChat — bouton flottant de chat avec Lina (dock).
import { useState } from "react";

export default function LinaFloatingChat() {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        zIndex: 9000,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {open && (
        <div
          style={{
            width: 320,
            maxWidth: "calc(100vw - 40px)",
            background: "#0B1B4D",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 16,
            boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
            overflow: "hidden",
            marginBottom: 12,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ color: "#fff", padding: "14px 16px", fontWeight: 700, fontSize: 14, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            💬 Lina AI
          </div>
          <div style={{ padding: 16, fontSize: 13, color: "rgba(255,255,255,0.7)", minHeight: 130, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            Salut ! Je suis Lina. Besoin d&apos;aide pour planifier un voyage ?
          </div>
          <div style={{ padding: 10, display: "flex", gap: 8 }}>
            <input
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setMsg("")}
              placeholder="Votre message..."
              style={{ flex: 1, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.06)", borderRadius: 8, padding: "8px 10px", fontSize: 13, color: "#fff", outline: "none" }}
            />
            <button
              onClick={() => setMsg("")}
              style={{ background: "#0F6CF5", color: "#fff", border: "none", borderRadius: 8, padding: "0 14px", fontWeight: 600, cursor: "pointer" }}
            >
              ➤
            </button>
          </div>
        </div>
      )}
      <button
        aria-label="Chat Lina"
        onClick={() => setOpen(!open)}
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          border: "none",
          cursor: "pointer",
          background: "linear-gradient(135deg,#0F6CF5,#0B1B4D)",
          boxShadow: "0 10px 30px rgba(15,108,245,0.45)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
        }}
      >
        {open ? "✕" : "💬"}
      </button>
    </div>
  );
}
