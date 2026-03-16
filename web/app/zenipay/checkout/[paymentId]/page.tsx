"use client";
import { useState, useEffect } from "react";

const BLUE = "#0F6CF5", DARK = "#0B1B4D";

declare global {
  interface Window {
    Accept?: {
      dispatchData: (data: object, callback: (response: AcceptResponse) => void) => void;
    };
  }
}
interface AcceptResponse {
  messages: { resultCode: string; message: { code: string; text: string }[] };
  opaqueData?: { dataDescriptor: string; dataValue: string };
}

export default function ZeniPayCheckout({ params }: { params: { paymentId: string } }) {
  const [step, setStep] = useState<"details" | "processing" | "success" | "failed">("details");
  const [payMethod, setPayMethod] = useState<"card" | "ach">("card");
  const [form, setForm] = useState({ name: "", email: "", cardNumber: "", expiry: "", cvc: "", zip: "", bank: "", routing: "", account: "" });
  const [amount, setAmount] = useState(0);
  const [currency, setCurrency] = useState("USD");
  const [desc, setDesc] = useState("Zeniva Travel");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState("");

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
    // Load Accept.js (Authorize.net)
    const env = process.env.NEXT_PUBLIC_AUTHORIZENET_ENV || "sandbox";
    const scriptSrc = env === "production"
      ? "https://js.authorize.net/v1/Accept.js"
      : "https://jstest.authorize.net/v1/Accept.js";
    if (!document.querySelector(`script[src="${scriptSrc}"]`)) {
      const s = document.createElement("script"); s.src = scriptSrc; s.async = true;
      document.body.appendChild(s);
    }
  }, []);

  const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.email.includes("@")) e.email = "Valid email required";
    if (payMethod === "card") {
      if (form.cardNumber.replace(/\s/g, "").length < 15) e.cardNumber = "Enter valid card number";
      if (!form.expiry.match(/^\d{2}\/\d{2}$/)) e.expiry = "MM/YY format";
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
    setErrorMsg("");

    // === TOKENIZE CARD VIA ACCEPT.JS (PCI Compliant — no card data hits our server) ===
    try {
      let opaqueDescriptor = "COMMON.ACCEPT.INAPP.PAYMENT";
      let opaqueValue = `sim_${params.paymentId}_${Date.now()}`;

      if (typeof window !== "undefined" && window.Accept) {
        await new Promise<void>((resolve, reject) => {
          const [expMonth, expYear] = form.expiry.split("/");
          window.Accept!.dispatchData({
            authData: {
              clientKey: process.env.NEXT_PUBLIC_AUTHORIZENET_CLIENT_KEY || "",
              apiLoginID: process.env.NEXT_PUBLIC_AUTHORIZENET_API_LOGIN_ID || "",
            },
            cardData: {
              cardNumber: form.cardNumber.replace(/\s/g, ""),
              month: expMonth,
              year: `20${expYear}`,
              cardCode: form.cvc,
              zip: form.zip,
              fullName: form.name,
            },
          }, (response: AcceptResponse) => {
            if (response.messages.resultCode === "Ok" && response.opaqueData) {
              opaqueDescriptor = response.opaqueData.dataDescriptor;
              opaqueValue = response.opaqueData.dataValue;
              resolve();
            } else {
              reject(new Error(response.messages.message?.[0]?.text || "Tokenization failed"));
            }
          });
        });
      }

      // === CALL ZENIPAY PAYMENT API ===
      const res = await fetch("/api/zenipay/payments/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_id: params.paymentId,
          amount, currency,
          payment_method: payMethod,
          opaque_data_descriptor: opaqueDescriptor,
          opaque_data_value: opaqueValue,
          customer_email: form.email,
          customer_name: form.name,
          description: desc,
        }),
      });
      const data = await res.json();
      if (data.status === "completed") {
        setStep("success");
      } else {
        setErrorMsg(data.error || "Payment declined");
        setStep("failed");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Payment error";
      setErrorMsg(msg);
      setStep("failed");
    }
  };

  const formatCard = (v: string) => v.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim().slice(0, 19);
  const formatExpiry = (v: string) => { const d = v.replace(/\D/g, ""); return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2, 4)}` : d; };

  if (step === "processing") return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui,sans-serif" }}>
      <div style={{ textAlign: "center", padding: 40 }}>
        <div style={{ width: 56, height: 56, border: `4px solid ${BLUE}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 20px" }} />
        <h2 style={{ margin: "0 0 8px", fontWeight: 800, color: DARK }}>Processing Payment…</h2>
        <p style={{ color: "#64748b", margin: "0 0 8px" }}>Securing your transaction via ZeniPay</p>
        <p style={{ color: BLUE, fontWeight: 700, margin: 0, fontSize: 20 }}>{fmt(amount)}</p>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  if (step === "success") return (
    <div style={{ minHeight: "100vh", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui,sans-serif" }}>
      <div style={{ textAlign: "center", padding: 40, background: "white", borderRadius: 20, boxShadow: "0 8px 32px rgba(0,0,0,0.1)", maxWidth: 440, width: "100%", margin: "0 16px" }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>✅</div>
        <h2 style={{ margin: "0 0 8px", fontWeight: 800, color: "#065f46", fontSize: 24 }}>Payment Confirmed!</h2>
        <p style={{ color: "#374151", margin: "0 0 4px", fontWeight: 700, fontSize: 20 }}>{fmt(amount)}</p>
        <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 24px" }}>{desc}</p>
        <div style={{ background: "#f0fdf4", borderRadius: 12, padding: 16, marginBottom: 24, textAlign: "left" }}>
          <p style={{ margin: "0 0 4px", fontSize: 12, color: "#64748b" }}>Confirmation sent to</p>
          <p style={{ margin: "0 0 4px", fontWeight: 700, color: "#0f172a" }}>{form.email}</p>
          <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>Ref: {params.paymentId}</p>
        </div>
        <a href="/" style={{ display: "block", background: BLUE, color: "white", borderRadius: 9999, padding: "14px 24px", textDecoration: "none", fontWeight: 800, fontSize: 15 }}>
          ✈️ Back to Zeniva Travel
        </a>
      </div>
    </div>
  );

  if (step === "failed") return (
    <div style={{ minHeight: "100vh", background: "#fff1f2", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui,sans-serif" }}>
      <div style={{ textAlign: "center", padding: 40, background: "white", borderRadius: 20, boxShadow: "0 8px 32px rgba(0,0,0,0.1)", maxWidth: 440, width: "100%", margin: "0 16px" }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>❌</div>
        <h2 style={{ margin: "0 0 8px", fontWeight: 800, color: "#991b1b" }}>Payment Failed</h2>
        <p style={{ color: "#64748b", margin: "0 0 24px" }}>{errorMsg || "Please check your card details and try again."}</p>
        <button onClick={() => { setStep("details"); setErrorMsg(""); }} style={{ background: BLUE, color: "white", border: "none", borderRadius: 9999, padding: "14px 32px", fontWeight: 800, fontSize: 15, cursor: "pointer", width: "100%" }}>
          Try Again
        </button>
      </div>
    </div>
  );

  // ======= CHECKOUT FORM =======
  const inp = (key: string, label: string, ph: string, extra: Partial<React.InputHTMLAttributes<HTMLInputElement>> = {}) => (
    <div>
      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#374151", marginBottom: 5, letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</label>
      <input
        value={(form as Record<string, string>)[key]}
        onChange={e => setForm(f => ({ ...f, [key]: extra.onChange ? e.target.value : e.target.value }))}
        placeholder={ph} {...extra}
        style={{ width: "100%", border: `1.5px solid ${errors[key] ? "#ef4444" : "#e2e8f0"}`, borderRadius: 10, padding: "11px 14px", fontSize: 14, outline: "none", boxSizing: "border-box", background: "white", transition: "border-color 0.15s" }}
      />
      {errors[key] && <p style={{ margin: "3px 0 0", fontSize: 11, color: "#ef4444" }}>{errors[key]}</p>}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "system-ui,sans-serif" }}>
      {/* HEADER */}
      <div style={{ background: `linear-gradient(135deg, ${DARK} 0%, #1e3a8a 100%)`, padding: "16px 20px" }}>
        <div style={{ maxWidth: 520, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, background: BLUE, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>💳</div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontWeight: 800, fontSize: 15, color: "white" }}>ZeniPay Secure Checkout</p>
            <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.6)" }}>256-bit SSL · PCI DSS Compliant · Powered by Authorize.net</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: 0, fontWeight: 800, fontSize: 22, color: "white" }}>{fmt(amount)}</p>
            <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.6)" }}>{desc.slice(0, 30)}</p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 520, margin: "20px auto", padding: "0 16px" }}>
        {/* PAYMENT METHOD */}
        <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", marginBottom: 14 }}>
          <p style={{ margin: "0 0 12px", fontWeight: 700, fontSize: 13, color: "#374151" }}>Payment Method</p>
          <div style={{ display: "flex", gap: 8 }}>
            {[{ id: "card", icon: "💳", label: "Credit / Debit" }, { id: "ach", icon: "🏦", label: "Bank (ACH)" }].map(m => (
              <button key={m.id} onClick={() => setPayMethod(m.id as "card" | "ach")} style={{
                flex: 1, padding: "10px 12px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600,
                background: payMethod === m.id ? "#eff6ff" : "#f8fafc",
                border: `2px solid ${payMethod === m.id ? BLUE : "#e2e8f0"}`,
                color: payMethod === m.id ? BLUE : "#374151",
              }}>
                {m.icon} {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* BILLING */}
        <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", marginBottom: 14 }}>
          <p style={{ margin: "0 0 14px", fontWeight: 700, fontSize: 13, color: "#374151" }}>Billing Information</p>
          <div style={{ display: "grid", gap: 12 }}>
            {inp("name", "Full Name", "John Smith")}
            {inp("email", "Email Address", "john@example.com", { type: "email" })}
          </div>
        </div>

        {/* CARD */}
        {payMethod === "card" && (
          <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: "#374151" }}>Card Details</p>
              <div style={{ display: "flex", gap: 6 }}>
                {["VISA", "MC", "AMEX", "DISC"].map(b => <span key={b} style={{ background: "#f1f5f9", borderRadius: 4, padding: "2px 7px", fontSize: 9, fontWeight: 700, color: "#64748b", letterSpacing: "0.05em" }}>{b}</span>)}
              </div>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#374151", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>Card Number</label>
                <input
                  value={form.cardNumber}
                  onChange={e => setForm(f => ({ ...f, cardNumber: formatCard(e.target.value) }))}
                  placeholder="1234  5678  9012  3456" maxLength={19}
                  style={{ width: "100%", border: `1.5px solid ${errors.cardNumber ? "#ef4444" : "#e2e8f0"}`, borderRadius: 10, padding: "11px 14px", fontSize: 15, letterSpacing: "3px", outline: "none", boxSizing: "border-box" }}
                />
                {errors.cardNumber && <p style={{ margin: "3px 0 0", fontSize: 11, color: "#ef4444" }}>{errors.cardNumber}</p>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#374151", marginBottom: 5, textTransform: "uppercase" }}>Expiry</label>
                  <input value={form.expiry} onChange={e => setForm(f => ({ ...f, expiry: formatExpiry(e.target.value) }))} placeholder="MM/YY" maxLength={5}
                    style={{ width: "100%", border: `1.5px solid ${errors.expiry ? "#ef4444" : "#e2e8f0"}`, borderRadius: 10, padding: "11px 12px", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                  {errors.expiry && <p style={{ margin: "3px 0 0", fontSize: 11, color: "#ef4444" }}>{errors.expiry}</p>}
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#374151", marginBottom: 5, textTransform: "uppercase" }}>CVC</label>
                  <input value={form.cvc} onChange={e => setForm(f => ({ ...f, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) }))} placeholder="123" maxLength={4}
                    style={{ width: "100%", border: `1.5px solid ${errors.cvc ? "#ef4444" : "#e2e8f0"}`, borderRadius: 10, padding: "11px 12px", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                  {errors.cvc && <p style={{ margin: "3px 0 0", fontSize: 11, color: "#ef4444" }}>{errors.cvc}</p>}
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#374151", marginBottom: 5, textTransform: "uppercase" }}>ZIP</label>
                  <input value={form.zip} onChange={e => setForm(f => ({ ...f, zip: e.target.value.slice(0, 10) }))} placeholder="10001"
                    style={{ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "11px 12px", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>
            </div>
            <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 6, color: "#94a3b8", fontSize: 11 }}>
              🔒 <span>Card data is tokenized via Accept.js — never stored on Zeniva servers</span>
            </div>
          </div>
        )}

        {/* ACH */}
        {payMethod === "ach" && (
          <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", marginBottom: 14 }}>
            <p style={{ margin: "0 0 14px", fontWeight: 700, fontSize: 13, color: "#374151" }}>Bank Account (ACH)</p>
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

        {/* ORDER SUMMARY + PAY BUTTON */}
        <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13, color: "#64748b" }}>
            <span>{desc.slice(0, 40)}</span><span>{fmt(amount)}</span>
          </div>
          <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 10, marginBottom: 18, display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>Total Due</span>
            <span style={{ fontWeight: 800, fontSize: 22, color: BLUE }}>{fmt(amount)}</span>
          </div>
          <button onClick={handleSubmit} style={{
            width: "100%", background: `linear-gradient(135deg, ${BLUE}, ${DARK})`, color: "white",
            border: "none", borderRadius: 9999, padding: "15px", fontSize: 17, fontWeight: 800, cursor: "pointer",
            boxShadow: "0 4px 20px rgba(15,108,245,0.35)", letterSpacing: "-0.01em",
          }}>
            🔒 Confirm Payment — {fmt(amount)}
          </button>
          <div style={{ textAlign: "center", marginTop: 12, fontSize: 11, color: "#94a3b8", lineHeight: 1.6 }}>
            🛡️ Secured by ZeniPay · Authorize.net · PCI DSS Level 1<br />
            💳 Visa · Mastercard · Amex · Discover · 🏦 ACH
          </div>
        </div>
      </div>
    </div>
  );
}
