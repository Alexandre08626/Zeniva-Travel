"use client";
import { useState, useEffect } from "react";

const BLUE = "#0F6CF5", DARK = "#0B1B4D";

export default function ZeniPayCheckout({ params }: { params: { paymentId: string } }) {
  const [step, setStep] = useState<"details"|"processing"|"success"|"failed">("details");
  const [payMethod, setPayMethod] = useState<"card"|"ach">("card");
  const [form, setForm] = useState({ name: "", email: "", card: "", expiry: "", cvc: "", zip: "", bank: "", routing: "", account: "" });
  const [amount, setAmount] = useState(0);
  const [currency, setCurrency] = useState("USD");
  const [desc, setDesc] = useState("Zeniva Travel");
  const [errors, setErrors] = useState<Record<string,string>>({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search);
      setAmount(parseFloat(p.get("amount") || "0"));
      setCurrency(p.get("currency") || "USD");
      setDesc(decodeURIComponent(p.get("desc") || "Zeniva Travel"));
    }
  }, []);

  const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  const validate = () => {
    const e: Record<string,string> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.email.includes("@")) e.email = "Valid email required";
    if (payMethod === "card") {
      if (form.card.replace(/\s/g,"").length < 16) e.card = "Enter 16-digit card number";
      if (!form.expiry.match(/^\d{2}\/\d{2}$/)) e.expiry = "Format: MM/YY";
      if (form.cvc.length < 3) e.cvc = "3-4 digits";
    } else {
      if (!form.routing.match(/^\d{9}$/)) e.routing = "9-digit routing number";
      if (!form.account) e.account = "Required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setStep("processing");
    // Simulate payment processing — replace with real gateway call
    await new Promise(r => setTimeout(r, 2500));
    // 95% success rate simulation
    if (Math.random() > 0.05) {
      setStep("success");
    } else {
      setStep("failed");
    }
  };

  const formatCard = (v: string) => v.replace(/\D/g,"").replace(/(.{4})/g,"$1 ").trim().slice(0,19);
  const formatExpiry = (v: string) => { const d = v.replace(/\D/g,""); return d.length >= 3 ? `${d.slice(0,2)}/${d.slice(2,4)}` : d; };

  if (step === "processing") return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui,sans-serif" }}>
      <div style={{ textAlign: "center", padding: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 16, animation: "spin 1s linear infinite", display: "inline-block" }}>⚙️</div>
        <h2 style={{ margin: "0 0 8px", fontWeight: 800, color: DARK }}>Processing Payment…</h2>
        <p style={{ color: "#64748b", margin: 0 }}>Please don't close this window</p>
        <p style={{ color: BLUE, fontWeight: 700, marginTop: 12 }}>{fmt(amount)}</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  if (step === "success") return (
    <div style={{ minHeight: "100vh", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui,sans-serif" }}>
      <div style={{ textAlign: "center", padding: 40, background: "white", borderRadius: 20, boxShadow: "0 8px 32px rgba(0,0,0,0.1)", maxWidth: 440, width: "100%" }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>✅</div>
        <h2 style={{ margin: "0 0 8px", fontWeight: 800, color: "#065f46", fontSize: 24 }}>Payment Successful!</h2>
        <p style={{ color: "#374151", margin: "0 0 4px" }}>{fmt(amount)} received</p>
        <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 24px" }}>{desc} · Ref: {params.paymentId}</p>
        <div style={{ background: "#f0fdf4", borderRadius: 12, padding: 16, marginBottom: 24, textAlign: "left" }}>
          <p style={{ margin: "0 0 4px", fontSize: 13, color: "#64748b" }}>Confirmation sent to</p>
          <p style={{ margin: 0, fontWeight: 700, color: "#0f172a" }}>{form.email}</p>
        </div>
        <a href="/" style={{ display: "block", background: BLUE, color: "white", borderRadius: 9999, padding: "12px 24px", textDecoration: "none", fontWeight: 800, fontSize: 14 }}>
          Back to Zeniva Travel
        </a>
      </div>
    </div>
  );

  if (step === "failed") return (
    <div style={{ minHeight: "100vh", background: "#fff1f2", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui,sans-serif" }}>
      <div style={{ textAlign: "center", padding: 40, background: "white", borderRadius: 20, boxShadow: "0 8px 32px rgba(0,0,0,0.1)", maxWidth: 440, width: "100%" }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>❌</div>
        <h2 style={{ margin: "0 0 8px", fontWeight: 800, color: "#991b1b" }}>Payment Failed</h2>
        <p style={{ color: "#64748b", margin: "0 0 24px" }}>Please check your details and try again.</p>
        <button onClick={() => setStep("details")} style={{ background: BLUE, color: "white", border: "none", borderRadius: 9999, padding: "12px 32px", fontWeight: 800, fontSize: 14, cursor: "pointer", width: "100%" }}>Try Again</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "system-ui,sans-serif" }}>
      {/* HEADER */}
      <div style={{ background: `linear-gradient(135deg, ${DARK}, #1e3a8a)`, padding: "16px 24px", color: "white" }}>
        <div style={{ maxWidth: 520, margin: "0 auto", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: BLUE, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>💳</div>
          <div>
            <p style={{ margin: 0, fontWeight: 800, fontSize: 16 }}>ZeniPay Checkout</p>
            <p style={{ margin: 0, fontSize: 11, opacity: 0.7 }}>Secure · Encrypted · PCI Compliant</p>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <p style={{ margin: 0, fontWeight: 800, fontSize: 20 }}>{fmt(amount)}</p>
            <p style={{ margin: 0, fontSize: 11, opacity: 0.7 }}>{desc}</p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 520, margin: "24px auto", padding: "0 16px" }}>
        {/* PAYMENT METHOD SELECTOR */}
        <div style={{ background: "white", borderRadius: 14, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.07)", marginBottom: 16 }}>
          <p style={{ margin: "0 0 12px", fontWeight: 700, fontSize: 13, color: "#374151" }}>Payment Method</p>
          <div style={{ display: "flex", gap: 8 }}>
            {[{ id: "card", icon: "💳", label: "Credit / Debit Card" }, { id: "ach", icon: "🏦", label: "Bank Transfer (ACH)" }].map(m => (
              <button key={m.id} onClick={() => setPayMethod(m.id as "card"|"ach")} style={{
                flex: 1, padding: "10px 12px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all 0.15s",
                background: payMethod === m.id ? "#eff6ff" : "#f8fafc",
                border: payMethod === m.id ? `2px solid ${BLUE}` : "2px solid #e2e8f0",
                color: payMethod === m.id ? BLUE : "#374151",
              }}>
                {m.icon} {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* BILLING DETAILS */}
        <div style={{ background: "white", borderRadius: 14, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.07)", marginBottom: 16 }}>
          <p style={{ margin: "0 0 14px", fontWeight: 700, fontSize: 13, color: "#374151" }}>Billing Details</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label: "Full Name", key: "name", ph: "John Smith", cols: 2 },
              { label: "Email", key: "email", ph: "john@example.com", cols: 2, type: "email" },
            ].map(f => (
              <div key={f.key} style={{ gridColumn: `span ${f.cols}` }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#374151", marginBottom: 5 }}>{f.label}</label>
                <input
                  type={(f as {type?:string}).type || "text"}
                  value={(form as Record<string,string>)[f.key]}
                  onChange={e => setForm(p => ({...p, [f.key]: e.target.value}))}
                  placeholder={f.ph}
                  style={{ width: "100%", border: `1px solid ${errors[f.key]?"#ef4444":"#e2e8f0"}`, borderRadius: 8, padding: "10px 12px", fontSize: 14, outline: "none", boxSizing: "border-box" }}
                />
                {errors[f.key] && <p style={{ margin: "3px 0 0", fontSize: 11, color: "#ef4444" }}>{errors[f.key]}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* CARD DETAILS */}
        {payMethod === "card" && (
          <div style={{ background: "white", borderRadius: 14, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.07)", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: "#374151" }}>Card Details</p>
              <div style={{ display: "flex", gap: 4 }}>
                {["VISA", "MC", "AMEX"].map(b => <span key={b} style={{ background: "#f1f5f9", borderRadius: 4, padding: "2px 6px", fontSize: 10, fontWeight: 700, color: "#64748b" }}>{b}</span>)}
              </div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#374151", marginBottom: 5 }}>Card Number</label>
              <input
                value={form.card} onChange={e => setForm(p => ({...p, card: formatCard(e.target.value)}))}
                placeholder="1234 5678 9012 3456" maxLength={19}
                style={{ width: "100%", border: `1px solid ${errors.card?"#ef4444":"#e2e8f0"}`, borderRadius: 8, padding: "10px 12px", fontSize: 14, outline: "none", boxSizing: "border-box", letterSpacing: "2px" }}
              />
              {errors.card && <p style={{ margin: "3px 0 0", fontSize: 11, color: "#ef4444" }}>{errors.card}</p>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {[
                { label: "Expiry (MM/YY)", key: "expiry", ph: "12/26", format: formatExpiry },
                { label: "CVC", key: "cvc", ph: "123" },
                { label: "Billing ZIP", key: "zip", ph: "10001" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#374151", marginBottom: 5 }}>{f.label}</label>
                  <input
                    value={(form as Record<string,string>)[f.key]}
                    onChange={e => setForm(p => ({...p, [f.key]: f.format ? f.format(e.target.value) : e.target.value}))}
                    placeholder={f.ph} maxLength={f.key === "expiry" ? 5 : f.key === "cvc" ? 4 : 10}
                    style={{ width: "100%", border: `1px solid ${errors[f.key]?"#ef4444":"#e2e8f0"}`, borderRadius: 8, padding: "10px 12px", fontSize: 14, outline: "none", boxSizing: "border-box" }}
                  />
                  {errors[f.key] && <p style={{ margin: "3px 0 0", fontSize: 11, color: "#ef4444" }}>{errors[f.key]}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACH */}
        {payMethod === "ach" && (
          <div style={{ background: "white", borderRadius: 14, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.07)", marginBottom: 16 }}>
            <p style={{ margin: "0 0 14px", fontWeight: 700, fontSize: 13, color: "#374151" }}>Bank Account (ACH)</p>
            {[
              { label: "Bank Name", key: "bank", ph: "Chase, Bank of America…" },
              { label: "Routing Number", key: "routing", ph: "021000021" },
              { label: "Account Number", key: "account", ph: "••••••••••" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 10 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#374151", marginBottom: 5 }}>{f.label}</label>
                <input
                  value={(form as Record<string,string>)[f.key]}
                  onChange={e => setForm(p => ({...p, [f.key]: e.target.value}))}
                  placeholder={f.ph}
                  style={{ width: "100%", border: `1px solid ${errors[f.key]?"#ef4444":"#e2e8f0"}`, borderRadius: 8, padding: "10px 12px", fontSize: 14, outline: "none", boxSizing: "border-box" }}
                />
                {errors[f.key] && <p style={{ margin: "3px 0 0", fontSize: 11, color: "#ef4444" }}>{errors[f.key]}</p>}
              </div>
            ))}
            <div style={{ background: "#fef3c7", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#92400e" }}>
              ⏱ ACH transfers take 1-3 business days to process
            </div>
          </div>
        )}

        {/* SUMMARY + PAY BUTTON */}
        <div style={{ background: "white", borderRadius: 14, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.07)", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: "#64748b" }}>{desc}</span>
            <span style={{ fontSize: 13, fontWeight: 700 }}>{fmt(amount)}</span>
          </div>
          <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 8, display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>Total</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: BLUE }}>{fmt(amount)}</span>
          </div>
          <button onClick={handleSubmit} style={{
            width: "100%", background: `linear-gradient(135deg, ${BLUE}, ${DARK})`, color: "white", border: "none",
            borderRadius: 9999, padding: "14px", fontSize: 16, fontWeight: 800, cursor: "pointer",
            boxShadow: "0 4px 20px rgba(15,108,245,0.3)",
          }}>
            🔒 Pay {fmt(amount)} Now
          </button>
          <p style={{ textAlign: "center", fontSize: 11, color: "#94a3b8", margin: "10px 0 0" }}>
            🛡️ 256-bit SSL encryption · PCI DSS Level 1 · Powered by ZeniPay
          </p>
        </div>

        {/* PAYMENT TRUST LOGOS */}
        <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 11 }}>
          💳 Visa · Mastercard · Amex · 🏦 ACH / Wire Transfer
        </div>
      </div>
    </div>
  );
}
