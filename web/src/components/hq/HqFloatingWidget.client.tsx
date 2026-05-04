"use client";

import { useEffect, useState } from "react";
import { useAuthStore, isHQ } from "../../lib/authStore";

const PITCH_PATH = "/pitch";

export default function HqFloatingWidget() {
  const user = useAuthStore((s) => s.user);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  if (!user || !isHQ(user)) return null;

  const pitchUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${PITCH_PATH}`
      : `https://www.zenivatravel.com${PITCH_PATH}`;

  const handleCopy = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(pitchUrl);
      } else if (typeof document !== "undefined") {
        const textarea = document.createElement("textarea");
        textarea.value = pitchUrl;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "absolute";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      aria-label="HQ widget"
      style={{
        position: "fixed",
        zIndex: 60,
        right: 16,
        bottom: 96,
        fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {open && (
        <div
          role="dialog"
          aria-modal="false"
          aria-label="HQ tools"
          style={{
            width: 280,
            maxWidth: "calc(100vw - 32px)",
            marginBottom: 10,
            padding: 16,
            borderRadius: 16,
            background: "white",
            boxShadow: "0 18px 48px rgba(11,27,77,0.22)",
            border: "1px solid #E5E7EB",
            color: "#0B1228",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#0F6CF5",
              }}
            >
              HQ · Founder
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close HQ panel"
              style={{
                appearance: "none",
                border: "none",
                background: "transparent",
                color: "#64748B",
                fontSize: 20,
                lineHeight: 1,
                cursor: "pointer",
                padding: 0,
              }}
            >
              ×
            </button>
          </div>

          <p style={{ margin: "0 0 12px", fontSize: 12, color: "#475569", lineHeight: 1.5 }}>
            Outils privés — visibles uniquement pour les comptes HQ.
          </p>

          <div
            style={{
              border: "1px solid #E5E7EB",
              borderRadius: 12,
              padding: 12,
              marginBottom: 10,
              background: "#F8FAFC",
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Investor pitch
            </div>
            <a
              href={PITCH_PATH}
              style={{
                display: "block",
                marginTop: 4,
                fontSize: 14,
                fontWeight: 700,
                color: "#0B1B4D",
                textDecoration: "none",
                wordBreak: "break-all",
              }}
            >
              {pitchUrl}
            </a>

            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              <a
                href={PITCH_PATH}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: "1 1 110px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "8px 12px",
                  borderRadius: 9999,
                  background: "linear-gradient(135deg,#0B1B4D,#0F6CF5)",
                  color: "white",
                  fontSize: 12,
                  fontWeight: 800,
                  textDecoration: "none",
                }}
              >
                Ouvrir
              </a>
              <button
                type="button"
                onClick={handleCopy}
                style={{
                  flex: "1 1 110px",
                  appearance: "none",
                  cursor: "pointer",
                  padding: "8px 12px",
                  borderRadius: 9999,
                  border: "1px solid #CBD5E1",
                  background: copied ? "#ECFDF5" : "white",
                  color: copied ? "#047857" : "#0B1228",
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                {copied ? "✓ Lien copié" : "Copier le lien"}
              </button>
            </div>
          </div>

          <p style={{ margin: 0, fontSize: 10, color: "#94A3B8", lineHeight: 1.5 }}>
            Confidentiel — page non indexée, ne pas partager publiquement.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open HQ panel"
        aria-expanded={open}
        style={{
          appearance: "none",
          cursor: "pointer",
          width: 56,
          height: 56,
          borderRadius: "50%",
          border: "none",
          background: "linear-gradient(135deg,#0B1B4D,#0F6CF5)",
          color: "white",
          fontWeight: 800,
          fontSize: 14,
          letterSpacing: "0.08em",
          boxShadow: "0 12px 28px rgba(11,27,77,0.3)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        HQ
      </button>
    </div>
  );
}
