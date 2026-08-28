"use client";
// LinaWidget — widget flottant Lina AI pour le site des agences.
import { useState } from "react";

export default function LinaWidget() {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");

  return (
    <>
      <div
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        {open && (
          <div
            style={{
              width: 340,
              maxWidth: "calc(100vw - 48px)",
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 16,
              boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
              overflow: "hidden",
              marginBottom: 12,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg,#0F6CF5,#0B1B4D)",
                color: "#fff",
                padding: "14px 16px",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              Lina AI — Votre assistante voyage
            </div>
            <div style={{ padding: 16, fontSize: 13, color: "#334155", minHeight: 140 }}>
              Bonjour ! Je suis Lina, l'assistante virtuelle de votre agence de voyage.
              Comment puis-je vous aider aujourd'hui ?
            </div>
            <div style={{ borderTop: "1px solid #e5e7eb", padding: 10, display: "flex", gap: 8 }}>
              <input
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && setMsg("")}
                placeholder="Écrivez votre message..."
                style={{
                  flex: 1,
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  padding: "8px 10px",
                  fontSize: 13,
                  outline: "none",
                }}
              />
              <button
                onClick={() => setMsg("")}
                style={{
                  background: "#0F6CF5",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "0 14px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Envoyer
              </button>
            </div>
          </div>
        )}
        <button
          aria-label="Ouvrir Lina"
          onClick={() => setOpen(!open)}
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            border: "none",
            cursor: "pointer",
            background: "linear-gradient(135deg,#0F6CF5,#0B1B4D)",
            boxShadow: "0 10px 30px rgba(15,108,245,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <img src="/agents/lina.png" alt="Lina" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </button>
      </div>
    </>
  );
}
