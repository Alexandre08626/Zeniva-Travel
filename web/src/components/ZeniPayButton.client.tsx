"use client";
import { useState } from "react";

interface Props {
  amount: number;
  currency?: string;
  description?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  /** Proposal / trip id: lets the team match the ZeniPay payment to the trip. */
  proposalId?: string;
  disabled?: boolean;
  /** Shown on the button while disabled (e.g. "Fill in your details first"). */
  disabledLabel?: string;
  label?: string;
  className?: string;
  lang?: "en" | "fr";
}

const TEXT = {
  en: {
    loading: "🔄 Preparing secure payment…",
    disabled: "Fill in your details first",
    pay: (amount: string) => `🔒 Pay ${amount} — Secure payment`,
    unavailable: "Online payment is temporarily unavailable. Our team has been notified and will send you a secure payment link.",
  },
  fr: {
    loading: "🔄 Préparation du paiement…",
    disabled: "Complétez vos informations d'abord",
    pay: (amount: string) => `🔒 Payer ${amount} — Paiement sécurisé`,
    unavailable: "Le paiement en ligne est momentanément indisponible. Notre équipe est avisée et vous enverra un lien de paiement sécurisé.",
  },
};

export default function ZeniPayButton({
  amount,
  currency = "USD",
  description,
  customerName,
  customerEmail,
  customerPhone,
  proposalId,
  disabled,
  disabledLabel,
  label,
  className,
  lang = "en",
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const t = TEXT[lang];
  const noAmount = !(Number.isFinite(amount) && amount > 0);
  const isDisabled = Boolean(disabled) || noAmount;

  const handlePay = async () => {
    if (isDisabled || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/zenipay/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, currency, description, customerName, customerEmail, customerPhone, proposalId }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.payment_id && data.checkout_url) {
        window.location.href = data.checkout_url;
        return;
      }
      setError(data.message || t.unavailable);
    } catch {
      setError(t.unavailable);
    }
    setLoading(false);
  };

  const displayAmount = new Intl.NumberFormat(lang === "fr" ? "fr-CA" : "en-US", { style: "currency", currency: currency === "CAD" ? "CAD" : "USD" }).format(noAmount ? 0 : amount);

  return (
    <>
      <button
        onClick={handlePay}
        disabled={isDisabled || loading}
        className={className}
        style={{
          width: "100%",
          borderRadius: "9999px",
          padding: "14px 24px",
          fontSize: "15px",
          fontWeight: 800,
          color: "white",
          background: isDisabled || loading
            ? "#94a3b8"
            : "linear-gradient(135deg, #0F6CF5 0%, #0B1B4D 100%)",
          cursor: isDisabled || loading ? "not-allowed" : "pointer",
          border: "none",
          boxShadow: "0 4px 20px rgba(15,108,245,0.3)",
          transition: "all 0.2s",
          letterSpacing: "-0.3px",
        }}
      >
        {loading
          ? t.loading
          : isDisabled
          ? disabledLabel || t.disabled
          : label || t.pay(displayAmount)}
      </button>
      {error && (
        <p role="alert" style={{ marginTop: 8, fontSize: 13, color: "#b45309", textAlign: "center" }}>
          {error}
        </p>
      )}
    </>
  );
}
