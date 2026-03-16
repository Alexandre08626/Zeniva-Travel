"use client";
import { useState, useEffect } from "react";

const BLUE = "#0F6CF5", DARK = "#0B1B4D", GREEN = "#10B981", RED = "#EF4444";

export default function ZeniPayCheckout({ params }: { params: { paymentId: string } }) {
  const [step, setStep] = useState<"details" | "processing" | "success" | "failed">("details");
  const [payMethod, setPayMethod] = useState<"card" | "ach">("card");
  const [form, setForm] = useState({ name: "", email: "", cardNumber: "", expiry: "", cvc: "", zip: "", bank: "", routing: "", account: "" });
  const [amount, setAmount] = useState(0);
  const [currency, setCurrency] = useState("USD");
  const [desc, setDesc] = useState("Zeniva Travel");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState("");
  const [stripe, setStripe] = useState<unknown>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      setAmount(parseFloat(p.get("amount") || "0"));
      setCurrency(p.get("currency") || "USD");
      setDesc(decodeURIComponent(p.get("desc") || "Zeniva Travel"));
      const prefillName = decodeURIComponent(p.get("customer") || "");
      const prefillEmail = decodeURIComponent(p.get("email") || "");
      if (prefillName || prefillEmail) setForm(f => ({ ...f, name: prefillName, email: prefillEmail }));
    }
    // Load Stripe.js
    const pubKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (pubKey && typeof window !== "undefined" && !(window as typeof window & { Stripe?: unknown }).Stripe) {
      const script = document.createElement("script");
      script.src = "https://js.stripe.com/v3/";
      script.onload = () => {
        const s = (window as typeof window & { Stripe?: (key: string) => unknown }).Stripe?.(pubKey);
        setStripe(s);
      };
      document.head.appendChild(script);
    } else if ((window as typeof window & { Stripe?: (key: string) => unknown }).Stripe && pubKey) {
      setStripe((window as typeof window & { Stripe?: (key: string) => unknown }).Stripe!(pubKey));
    }
  }, []);

  const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.email.includes("@")) e.email = "Valid email required";
    if (payMethod === "card") {
      if (form.cardNumber.replace(/\s/g, "").length < 15) e.cardNumber = "Enter valid card number";
      if (!form.expiry.match(/^\d{2}\/\d{2}$/)) e.expiry = "MM/YY";
      if (form.cvc.length < 3) e.cvc = "3+ digits";
    } else {
      if (!form.routing.match(/^\d{9}$/)) e.routing = "9-digit routing #";
      if (!form.account) e.account = "Required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setStep("processing");
    setErrorMsg("");

    try {
      let stripePaymentMethodId: string | null = null;

      // Tokenize card via Stripe.js (PCI compliant — card never hits our server)
      if (stripe && payMethod === "card") {
        type StripeType = {
          createPaymentMethod: (opts: object) => Promise<{ paymentMethod?: { id: string }; error?: { message?: string } }>;
        };
        const result = await (stripe as StripeType).createPaymentMethod({
          type: "card",
          card: {
            number: form.cardNumber.replace(/\s/g, ""),
            exp_month: parseInt(form.expiry.split("/")[0]),
            exp_year: parseInt(`20${form.expiry.split("/")[1]}`),
            cvc: form.cvc,
          },
          billing_details: {
            name: form.name,
            email: form.email,
            address: { postal_code: form.zip },
          },
        });
        if (result.error) {
          setErrorMsg(result.error.message || "Card declined");
          setStep("failed");
          return;
        }
        stripePaymentMethodId = result.paymentMethod?.id || null;
      }

      // Process via ZeniPay API
      const res = await fetch("/api/zenipay/payments/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_id: params.paymentId,
          amount, currency,
          payment_method: payMethod,
          stripe_payment_method_id: stripePaymentMethodId,
          customer_email: form.email,
          customer_name: form.name,
          description: desc,
        }),
      });
      const data = await res.json();
      if (data.status === "completed") {
        setStep("success");
        // Redirect to confirmation after 2s
        setTimeout(() => {
          window.location.href = data.confirmation_url || `/booking/confirmation?ref=${params.paymentId}&total=${fmt(amount)}`;
        }, 2000);
      } else {
        setErrorMsg(data.error || "Payment declined");
        setStep("failed");
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Connection error");
      setStep("failed");
    }
  };

  const formatCard = (v: string) => v.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim().slice(0, 19);
  const formatExp = (v: string) => { const d = v.replace(/\D/g, ""); return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2, 4)}` : d; };

  // PROCESSING
  if (step === "processing") return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui,sans-serif" }}>
      <div style={{ textAlign: "center", padding: 40 }}>
        <div style={{ width: 56, height: 56, border: `4px solid ${BLUE}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 20px" }} />
        <h2 style={{ margin: "0 0 8px", fontWeight: 800, color: DARK }}>Securing Your Payment…</h2>
        <p style={{ color: "#64748b", margin: "0 0 8px", fontSize: 13 }}>Encrypted · PCI Compliant · Powered by ZeniPay</p>
        <p style={{ color: BLUE, fontWeight: 800, margin: 0, fontSize: 22 }}>{fmt(amount)}</p>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  // SUCCESS
  if (step === "success") return (
    <div style={{ minHeight: "100vh", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui,sans-serif" }}>
      <div style={{ textAlign: "center", padding: 40, background: "white", borderRadius: 20, boxShadow: "0 8px 32px rgba(0,0,0,0.1)", maxWidth: 440, width: "100%", margin: "0 16px" }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>✅</div>
        <h2 style={{ margin: "0 0 8px", fontWeight: 800, color: "#065f46", fontSize: 24 }}>Payment Confirmed!</h2>
        <p style={{ color: "#374151", margin: "0 0 4px", fontWeight: 700, fontSize: 20 }}>{fmt(amount)}</p>
        <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 8px" }}>{desc}</p>
        <p style={{ color: "#94a3b8", fontSize: 12, margin: "0 0 24px" }}>Redirecting to confirmation…</p>
      </div>
    </div>
  );

  // FAILED
  if (step === "failed") return (
    <div style={{ minHeight: "100vh", background: "#fff1f2", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui,sans-serif" }}>
      <div style={{ textAlign: "center", padding: 40, background: "white", borderRadius: 20, boxShadow: "0 8px 32px rgba(0,0,0,0.1)", maxWidth: 440, width: "100%", margin: "0 16px" }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>❌</div>
        <h2 style={{ margin: "0 0 8px", fontWeight: 800, color: "#991b1b" }}>Payment Failed</h2>
        <p style={{ color: "#64748b", margin: "0 0 24px" }}>{errorMsg || "Card declined. Please check your details."}</p>
        <button onClick={() => { setStep("details"); setErrorMsg(""); }} style={{ background: BLUE, color: "white", border: "none", borderRadius: 9999, padding: "14px 32px", fontWeight: 800, fontSize: 15, cursor: "pointer", width: "100%" }}>
          Try Again
        </button>
      </div>
    </div>
  );

  const inp = (key: string, label: string, ph: string, extra?: { maxLength?: number; type?: string }) => (
    <div>
      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#374151", marginBottom: 5, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>{label}</label>
      <input
        value={(form as Record<string, string>)[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        placeholder={ph} type={extra?.type || "text"} maxLength={extra?.maxLength}
        style={{ width: "100%", border: `1.5px solid ${errors[key] ? RED : "#e2e8f0"}`, borderRadius: 10, padding: "11px 14px", fontSize: 14, outline: "none", boxSizing: "border-box" as const }}
      />
      {errors[key] && <p style={{ margin: "3px 0 0", fontSize: 11, color: RED }}>{errors[key]}</p>}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4ff", fontFamily: "system-ui,sans-serif" }}>
      {/* HEADER */}
      <div style={{ background: `linear-gradient(135deg, ${DARK} 0%, #1e3a8a 100%)`, padding: "16px 20px" }}>
        <div style={{ maxWidth: 520, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 38, height: 38, background: BLUE, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>💳</div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontWeight: 800, fontSize: 16, color: "white" }}>ZeniPay Secure Checkout</p>
            <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.5)" }}>256-bit SSL · PCI Compliant</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: 0, fontWeight: 800, fontSize: 22, color: "white" }}>{fmt(amount)}</p>
            <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.6)" }}>{desc.slice(0, 30)}</p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 520, margin: "20px auto", padding: "0 16px" }}>
        {/* METHOD */}
        <div style={{ background: "white", borderRadius: 16, padding: 18, marginBottom: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
          <p style={{ margin: "0 0 12px", fontWeight: 700, fontSize: 13, color: "#374151" }}>Payment Method</p>
          <div style={{ display: "flex", gap: 8 }}>
            {[{ id: "card", icon: "💳", label: "Credit / Debit Card" }, { id: "ach", icon: "🏦", label: "Bank Transfer (ACH)" }].map(m => (
              <button key={m.id} onClick={() => setPayMethod(m.id as "card" | "ach")} style={{
                flex: 1, padding: "10px 12px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600, border: "none",
                background: payMethod === m.id ? "#eff6ff" : "#f8fafc",
                outline: payMethod === m.id ? `2px solid ${BLUE}` : "2px solid #e2e8f0",
                color: payMethod === m.id ? BLUE : "#374151",
              }}>{m.icon} {m.label}</button>
            ))}
          </div>
        </div>

        {/* BILLING */}
        <div style={{ background: "white", borderRadius: 16, padding: 18, marginBottom: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
          <p style={{ margin: "0 0 14px", fontWeight: 700, fontSize: 13, color: "#374151" }}>Your Information</p>
          <div style={{ display: "grid", gap: 12 }}>
            {inp("name", "Full Name", "John Smith")}
            {inp("email", "Email", "john@example.com", { type: "email" })}
          </div>
        </div>

        {/* CARD */}
        {payMethod === "card" && (
          <div style={{ background: "white", borderRadius: 16, padding: 18, marginBottom: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: "#374151" }}>Card Details</p>
              <div style={{ display: "flex", gap: 5 }}>
                {["VISA", "MC", "AMEX", "DISC"].map(b => <span key={b} style={{ background: "#f1f5f9", borderRadius: 4, padding: "2px 6px", fontSize: 9, fontWeight: 700, color: "#64748b" }}>{b}</span>)}
              </div>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#374151", marginBottom: 5, textTransform: "uppercase" as const }}>Card Number</label>
                <input value={form.cardNumber} onChange={e => setForm(f => ({ ...f, cardNumber: formatCard(e.target.value) }))}
                  placeholder="1234  5678  9012  3456" maxLength={19}
                  style={{ width: "100%", border: `1.5px solid ${errors.cardNumber ? RED : "#e2e8f0"}`, borderRadius: 10, padding: "11px 14px", fontSize: 15, letterSpacing: "3px", outline: "none", boxSizing: "border-box" as const }} />
                {errors.cardNumber && <p style={{ margin: "3px 0 0", fontSize: 11, color: RED }}>{errors.cardNumber}</p>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#374151", marginBottom: 5, textTransform: "uppercase" as const }}>Expiry</label>
                  <input value={form.expiry} onChange={e => setForm(f => ({ ...f, expiry: formatExp(e.target.value) }))} placeholder="MM/YY" maxLength={5}
                    style={{ width: "100%", border: `1.5px solid ${errors.expiry ? RED : "#e2e8f0"}`, borderRadius: 10, padding: "11px 12px", fontSize: 14, outline: "none", boxSizing: "border-box" as const }} />
                  {errors.expiry && <p style={{ margin: "3px 0 0", fontSize: 11, color: RED }}>{errors.expiry}</p>}
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#374151", marginBottom: 5, textTransform: "uppercase" as const }}>CVC</label>
                  <input value={form.cvc} onChange={e => setForm(f => ({ ...f, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) }))} placeholder="123" maxLength={4}
                    style={{ width: "100%", border: `1.5px solid ${errors.cvc ? RED : "#e2e8f0"}`, borderRadius: 10, padding: "11px 12px", fontSize: 14, outline: "none", boxSizing: "border-box" as const }} />
                  {errors.cvc && <p style={{ margin: "3px 0 0", fontSize: 11, color: RED }}>{errors.cvc}</p>}
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#374151", marginBottom: 5, textTransform: "uppercase" as const }}>ZIP</label>
                  <input value={form.zip} onChange={e => setForm(f => ({ ...f, zip: e.target.value.slice(0, 10) }))} placeholder="10001"
                    style={{ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "11px 12px", fontSize: 14, outline: "none", boxSizing: "border-box" as const }} />
                </div>
              </div>
            </div>
            <p style={{ margin: "10px 0 0", fontSize: 11, color: "#94a3b8" }}>🔒 Card data encrypted via Stripe.js — never stored on Zeniva servers</p>
          </div>
        )}

        {/* ACH */}
        {payMethod === "ach" && (
          <div style={{ background: "white", borderRadius: 16, padding: 18, marginBottom: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
            <p style={{ margin: "0 0 14px", fontWeight: 700, fontSize: 13, color: "#374151" }}>Bank Account</p>
            <div style={{ display: "grid", gap: 12 }}>
              {inp("bank", "Bank Name", "Chase, Bank of America…")}
              {inp("routing", "Routing Number", "021000021", { maxLength: 9 })}
              {inp("account", "Account Number", "••••••••••")}
            </div>
            <div style={{ background: "#fef3c7", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#92400e", marginTop: 12 }}>
              ⏱ ACH transfers take 1-3 business days to settle
            </div>
          </div>
        )}

        {/* TOTAL + PAY */}
        <div style={{ background: "white", borderRadius: 16, padding: 18, marginBottom: 14, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13, color: "#64748b" }}>
            <span>{desc.slice(0, 40)}</span><span>{fmt(amount)}</span>
          </div>
          <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 10, marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 700 }}>Total</span>
            <span style={{ fontWeight: 800, fontSize: 22, color: BLUE }}>{fmt(amount)}</span>
          </div>
          <button onClick={handleSubmit} style={{
            width: "100%", background: `linear-gradient(135deg, ${BLUE}, ${DARK})`, color: "white",
            border: "none", borderRadius: 9999, padding: "15px", fontSize: 17, fontWeight: 800, cursor: "pointer",
            boxShadow: `0 4px 20px ${BLUE}35`,
          }}>
            🔒 Pay {fmt(amount)} Now
          </button>
          <div style={{ textAlign: "center", marginTop: 12, fontSize: 11, color: "#94a3b8" }}>
            🛡️ Secured by ZeniPay · PCI DSS Level 1 · 256-bit SSL<br />
            💳 Visa · Mastercard · Amex · Discover · 🏦 ACH
          </div>
        </div>
      </div>
    </div>
  );
}
