"use client";
import { useState } from "react";

interface Props {
  amount: number;
  description: string;
  referenceId?: string;
  currency?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
}

export default function HelcimPayButton({
  amount, description, referenceId, currency = "CAD", disabled, className, label
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePay = async () => {
    if (disabled || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/payment/helcim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, description, referenceId, currency }),
      });
      const data = await res.json();
      if (data.checkoutToken) {
        // Load HelcimPay.js and show payment form
        if (typeof window !== "undefined") {
          // @ts-ignore
          if (typeof window.appendHelcimIframe === "function") {
            // @ts-ignore
            window.appendHelcimIframe(data.checkoutToken);
          } else {
            // Fallback: load the script then call it
            const script = document.createElement("script");
            script.src = "https://secure.helcim.app/helcim-pay/services/start.js";
            script.onload = () => {
              // @ts-ignore
              window.appendHelcimIframe(data.checkoutToken);
            };
            document.head.appendChild(script);
          }
        }
      } else {
        setError(data.error || "Payment initialization failed");
        setLoading(false);
      }
    } catch {
      setError("Connection error. Try again.");
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handlePay}
        disabled={disabled || loading}
        className={className || "w-full rounded-full px-4 py-4 text-sm font-extrabold text-white shadow-lg transition-all"}
        style={{
          background: (disabled || loading) ? "#94a3b8" : "linear-gradient(135deg, #0F6CF5, #0B1B4D)",
          cursor: (disabled || loading) ? "not-allowed" : "pointer",
          fontSize: "15px",
        }}
      >
        {loading ? "Initializing secure payment…" : disabled ? "Fill in your details first" : (label || `💳 Pay ${currency} ${amount} — Secure Checkout`)}
      </button>
      {error && <p className="text-red-500 text-xs mt-2 text-center">{error}</p>}
      {!disabled && <p className="text-xs text-center text-gray-400 mt-1">🔒 Secured by Helcim — Visa · Mastercard · Amex · Apple Pay</p>}
    </div>
  );
}
