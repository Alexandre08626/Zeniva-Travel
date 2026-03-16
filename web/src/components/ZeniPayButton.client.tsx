"use client";
import { useState } from "react";

interface Props {
  amount: number;
  currency?: string;
  description?: string;
  customerName?: string;
  customerEmail?: string;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export default function ZeniPayButton({
  amount,
  currency = "USD",
  description,
  customerName,
  customerEmail,
  disabled,
  label,
  className,
}: Props) {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    if (disabled || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/zenipay/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, currency, description, customerName, customerEmail }),
      });
      const data = await res.json();
      if (data.paymentId) {
        window.location.href = `/zenipay/checkout/${data.paymentId}?amount=${amount}&currency=${currency}&desc=${encodeURIComponent(description || "Zeniva Travel")}`;
      }
    } catch {
      setLoading(false);
    }
  };

  const displayAmount = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  return (
    <button
      onClick={handlePay}
      disabled={disabled || loading}
      className={className}
      style={{
        width: "100%",
        borderRadius: "9999px",
        padding: "14px 24px",
        fontSize: "15px",
        fontWeight: 800,
        color: "white",
        background: disabled || loading
          ? "#94a3b8"
          : "linear-gradient(135deg, #0F6CF5 0%, #0B1B4D 100%)",
        cursor: disabled || loading ? "not-allowed" : "pointer",
        border: "none",
        boxShadow: "0 4px 20px rgba(15,108,245,0.3)",
        transition: "all 0.2s",
        letterSpacing: "-0.3px",
      }}
    >
      {loading
        ? "🔄 Preparing checkout…"
        : disabled
        ? "Complete your details first"
        : label || `💳 Pay ${displayAmount} — Secure Checkout`}
    </button>
  );
}
