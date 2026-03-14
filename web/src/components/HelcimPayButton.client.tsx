"use client";
import { useState } from "react";

interface Props {
  amount: number;
  currency?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
}

declare global {
  interface Window {
    appendHelcimPayIframe: (checkoutToken: string) => void;
  }
}

export default function HelcimPayButton({
  amount,
  currency = "CAD",
  disabled,
  className,
  label,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadHelcimScript = (): Promise<void> => {
    return new Promise((resolve) => {
      if (typeof window.appendHelcimPayIframe === "function") {
        resolve();
        return;
      }
      const existing = document.getElementById("helcim-pay-js");
      if (existing) {
        existing.addEventListener("load", () => resolve());
        return;
      }
      const script = document.createElement("script");
      script.id = "helcim-pay-js";
      script.src = "https://secure.helcim.app/helcim-pay/services/start.js";
      script.onload = () => resolve();
      document.head.appendChild(script);
    });
  };

  const handlePay = async () => {
    if (disabled || loading) return;
    setLoading(true);
    setError("");

    try {
      // 1. Initialize session on backend
      const res = await fetch("/api/helcim/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, currency }),
      });
      const data = await res.json();

      if (!res.ok || !data.checkoutToken) {
        setError(data.error || "Payment initialization failed. Try again.");
        setLoading(false);
        return;
      }

      // 2. Load HelcimPay.js and open iframe
      await loadHelcimScript();
      window.appendHelcimPayIframe(data.checkoutToken);
      setLoading(false);
    } catch {
      setError("Connection error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handlePay}
        disabled={disabled || loading}
        style={{
          width: "100%",
          borderRadius: "9999px",
          padding: "1rem 1.5rem",
          fontSize: "15px",
          fontWeight: 800,
          color: "white",
          background: disabled || loading ? "#94a3b8" : "linear-gradient(135deg, #0F6CF5, #0B1B4D)",
          cursor: disabled || loading ? "not-allowed" : "pointer",
          border: "none",
          boxShadow: "0 4px 12px rgba(15,108,245,0.25)",
          transition: "all 0.2s",
        }}
        className={className}
      >
        {loading
          ? "🔄 Initializing secure payment…"
          : disabled
          ? "Fill in your details first"
          : label || `💳 Pay CAD $${amount} — Secure Checkout`}
      </button>
      {error && <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "8px", textAlign: "center" }}>{error}</p>}
      {!disabled && (
        <p style={{ color: "#94a3b8", fontSize: "11px", marginTop: "6px", textAlign: "center" }}>
          🔒 Secured by Helcim — Visa · Mastercard · Amex · Apple Pay
        </p>
      )}
    </div>
  );
}
