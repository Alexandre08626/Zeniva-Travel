"use client";
// LinaVideoCall — interface d'appel audio/vidéo simulée avec l'agent Lina.
import { useState } from "react";

export default function LinaVideoCall({ tripId }: { tripId?: string }) {
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);

  void tripId; // placeholder — appel en cours pour ce voyage

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 560,
        minHeight: 420,
        borderRadius: 24,
        background: "linear-gradient(160deg,#0B1B4D,#0F172a)",
        border: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
        fontFamily: "Inter, system-ui, sans-serif",
        color: "#fff",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 18,
          left: 18,
          background: "rgba(15,108,245,0.25)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 10,
          padding: "6px 12px",
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        📞 Appel en cours — Agent Voice
      </div>

      <img
        src="/agents/lina.png"
        alt="Lina"
        style={{
          width: 128,
          height: 128,
          borderRadius: 64,
          objectFit: "cover",
          border: "3px solid rgba(15,108,245,0.6)",
          boxShadow: "0 0 40px rgba(15,108,245,0.4)",
        }}
      />
      <div style={{ fontSize: 20, fontWeight: 800, marginTop: 16 }}>Lina AI</div>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginTop: 4 }}>
        {muted ? "🔇 Micro coupé" : camOff ? "📷 Caméra éteinte" : "Assistante voyage — en ligne"}
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
        <ControlBtn label="🖥" onClick={() => setCamOff(!camOff)} active={!camOff} />
        <ControlBtn label="🎙" onClick={() => setMuted(!muted)} active={!muted} />
        <button
          onClick={() => {}}
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            border: "none",
            background: "#ef4444",
            color: "#fff",
            fontSize: 20,
            cursor: "pointer",
          }}
        >
          Raccrocher
        </button>
      </div>
    </div>
  );
}

function ControlBtn({ label, onClick, active }: { label: string; onClick: () => void; active: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 56,
        height: 56,
        borderRadius: 28,
        border: active ? "1px solid rgba(15,108,245,0.6)" : "1px solid rgba(255,255,255,0.2)",
        background: active ? "rgba(15,108,245,0.3)" : "rgba(255,255,255,0.08)",
        color: "#fff",
        fontSize: 20,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}
