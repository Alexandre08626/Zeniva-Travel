"use client";
import { useState, useEffect } from "react";

const BLUE = "#0F6CF5", DARK = "#0B1B4D", GREEN = "#10B981", RED = "#EF4444", GOLD = "#F59E0B";

export default function ZeniPayCheckout({ params }: { params: { paymentId: string } }) {
  const [step, setStep] = useState<"details" | "processing" | "success" | "failed">("details");
  const [payMethod, setPayMethod] = useState<"card" | "ach">("card");
  const [form, setForm] = useState({ name: "", email: "", phone: "",
    cardNumber: "", expiry: "", cvc: "", zip: "",
    bank: "", routing: "", account: "" });
  const [amount, setAmount] = useState(0);
  const [currency, setCurrency] = useState("USD");
  const [desc, setDesc] = useState("Zeniva Travel");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState("");
  const [paymentId, setPaymentId] = useState<string>("");

  useEffect(() => {
    // Read paymentId from URL path (params may not resolve correctly in Next.js 16 client)
    const pathParts = window.location.pathname.split("/");
    const pidFromUrl = pathParts[pathParts.length - 1] || params?.paymentId || "";
    setPaymentId(pidFromUrl);

    const p = new URLSearchParams(window.location.search);
    const amt = parseFloat(p.get("amount") || "0");
    setAmount(amt);
    setCurrency(p.get("currency") || "USD");
    setDesc(decodeURIComponent(p.get("desc") || "Zeniva Travel"));
    const name = decodeURIComponent(p.get("customer") || "");
    const email = decodeURIComponent(p.get("email") || "");
    if (name || email) setForm(f => ({ ...f, name, email }));
  }, []);

  const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.email.includes("@")) e.email = "Valid email required";
    if (payMethod === "card") {
      const rawCard = form.cardNumber.replace(/\s/g, "");
      if (rawCard.length < 15) e.cardNumber = "Enter valid card number";
      if (!form.expiry.match(/^\d{2}\/\d{2}$/)) e.expiry = "MM/YY format";
      if (form.cvc.length < 3) e.cvc = "3 or 4 digits";
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

    try {
      const [expMonth, expYear] = form.expiry.split("/");
      const res = await fetch("/api/zenipay/payments/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_id: paymentId,
          amount, currency,
          payment_method: payMethod,
          card_number: form.cardNumber.replace(/\s/g, ""),
          expiry_month: expMonth,
          expiry_year: expYear,
          cvc: form.cvc,
          cardholder_name: form.name,
          billing_zip: form.zip,
          bank_name: form.bank,
          routing_number: form.routing,
          account_number_last4: form.account.slice(-4),
          customer_email: form.email,
          customer_name: form.name,
          description: desc,
        }),
      });
      const data = await res.json();
      if (data.status === "completed" || data.status === "succeeded" || data.success === true) {
        setStep("success");
        setTimeout(() => {
          window.location.href = data.confirmation_url || `/booking/confirmation?ref=${paymentId}&total=${fmt(amount)}`;
        }, 2200);
      } else {
        setErrorMsg(data.error || "Payment declined. Please try another card.");
        setStep("failed");
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Connection error");
      setStep("failed");
    }
  };

  const fmtCard = (v: string) => v.replace(/\D/g,"").replace(/(.{4})/g,"$1 ").trim().slice(0,19);
  const fmtExp  = (v: string) => { const d=v.replace(/\D/g,""); return d.length>=3?`${d.slice(0,2)}/${d.slice(2,4)}`:d; };
  const getCardIcon = () => {
    const n = form.cardNumber.replace(/\s/g,"");
    if (n.startsWith("4")) return "💳 VISA";
    if (/^5[1-5]/.test(n)) return "💳 MC";
    if (n.startsWith("34") || n.startsWith("37")) return "💳 AMEX";
    return "💳";
  };

  // PROCESSING SCREEN
  if (step === "processing") return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#020810,#0B1B4D)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"system-ui,sans-serif" }}>
      <div style={{ textAlign:"center", padding:40 }}>
        <div style={{ position:"relative", width:80, height:80, margin:"0 auto 28px" }}>
          <div style={{ position:"absolute", inset:0, border:`4px solid ${BLUE}`, borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.9s linear infinite" }} />
          <div style={{ position:"absolute", inset:8, background:`${BLUE}20`, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28 }}>💳</div>
        </div>
        <h2 style={{ margin:"0 0 8px", fontWeight:900, color:"white", fontSize:22 }}>Securing Your Payment…</h2>
        <p style={{ color:"rgba(255,255,255,0.5)", margin:"0 0 16px", fontSize:13 }}>ZeniPay Encrypted · Tilled Secured · PCI Compliant</p>
        <p style={{ color:BLUE, fontWeight:900, fontSize:28, margin:0 }}>{fmt(amount)}</p>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  // SUCCESS SCREEN
  if (step === "success") return (
    <div style={{ minHeight:"100vh", background:"#f0fdf4", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"system-ui,sans-serif" }}>
      <div style={{ textAlign:"center", padding:48, background:"white", borderRadius:24, boxShadow:"0 12px 48px rgba(0,0,0,0.12)", maxWidth:460, width:"100%", margin:"0 16px" }}>
        <div style={{ width:80, height:80, background:"#dcfce7", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:40, margin:"0 auto 20px" }}>✅</div>
        <h2 style={{ margin:"0 0 6px", fontWeight:900, color:"#065f46", fontSize:26 }}>Payment Confirmed!</h2>
        <p style={{ color:"#374151", margin:"0 0 4px", fontWeight:800, fontSize:22 }}>{fmt(amount)}</p>
        <p style={{ color:"#64748b", fontSize:14, margin:"0 0 4px" }}>{desc}</p>
        <p style={{ color:"#94a3b8", fontSize:12, marginBottom:24 }}>Ref: {params.paymentId}</p>
        <div style={{ background:"#f8fafc", borderRadius:12, padding:16, marginBottom:20, display:"flex", justifyContent:"space-between", fontSize:13 }}>
          <span style={{ color:"#64748b" }}>Processed by</span>
          <span style={{ fontWeight:700, color:DARK }}>ZeniPay · Tilled Network</span>
        </div>
        <p style={{ color:"#94a3b8", fontSize:12 }}>Redirecting to confirmation…</p>
      </div>
    </div>
  );

  // FAILED SCREEN
  if (step === "failed") return (
    <div style={{ minHeight:"100vh", background:"#fff1f2", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"system-ui,sans-serif" }}>
      <div style={{ textAlign:"center", padding:48, background:"white", borderRadius:24, boxShadow:"0 12px 48px rgba(0,0,0,0.12)", maxWidth:460, width:"100%", margin:"0 16px" }}>
        <div style={{ width:80, height:80, background:"#fee2e2", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:40, margin:"0 auto 20px" }}>❌</div>
        <h2 style={{ margin:"0 0 8px", fontWeight:900, color:"#991b1b", fontSize:24 }}>Payment Failed</h2>
        <p style={{ color:"#64748b", margin:"0 0 28px", fontSize:14 }}>{errorMsg || "Your card was declined. Please check your details or try another card."}</p>
        <button onClick={() => { setStep("details"); setErrorMsg(""); }} style={{
          width:"100%", background:`linear-gradient(135deg,${BLUE},${DARK})`, color:"white",
          border:"none", borderRadius:9999, padding:"15px", fontWeight:800, fontSize:16, cursor:"pointer"
        }}>Try Again</button>
      </div>
    </div>
  );

  // CHECKOUT FORM
  const inputStyle = (hasError?: boolean): React.CSSProperties => ({
    width:"100%", border:`1.5px solid ${hasError ? RED : "#e2e8f0"}`, borderRadius:12,
    padding:"12px 14px", fontSize:14, outline:"none", boxSizing:"border-box",
    background:"#fafbff", fontFamily:"system-ui,sans-serif"
  });
  const labelStyle: React.CSSProperties = { display:"block", fontSize:11, fontWeight:700, color:"#374151", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" };

  return (
    <div style={{ minHeight:"100vh", background:"#f0f4ff", fontFamily:"system-ui,sans-serif" }}>
      {/* HEADER */}
      <div style={{ background:`linear-gradient(135deg,${DARK} 0%,#1e3a8a 100%)`, padding:"18px 20px", boxShadow:"0 4px 20px rgba(0,0,0,0.3)" }}>
        <div style={{ maxWidth:560, margin:"0 auto", display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ width:44, height:44, background:BLUE, borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>💳</div>
          <div style={{ flex:1 }}>
            <p style={{ margin:0, fontWeight:900, fontSize:17, color:"white" }}>ZeniPay Secure Checkout</p>
            <p style={{ margin:0, fontSize:11, color:"rgba(255,255,255,0.45)" }}>256-bit SSL · PCI DSS Level 1 · Powered by Tilled</p>
          </div>
          <div style={{ textAlign:"right" }}>
            <p style={{ margin:0, fontWeight:900, fontSize:26, color:"white" }}>{fmt(amount)}</p>
            <p style={{ margin:0, fontSize:11, color:"rgba(255,255,255,0.5)" }}>{desc.slice(0,32)}{desc.length>32?"…":""}</p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:560, margin:"24px auto", padding:"0 16px 40px" }}>
        {/* TRIP SUMMARY */}
        <div style={{ background:`linear-gradient(135deg,${DARK},#1a2f6e)`, borderRadius:18, padding:20, marginBottom:16, color:"white" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
            <span style={{ opacity:0.6, fontSize:12 }}>Booking</span>
            <span style={{ fontWeight:700, fontSize:12, fontFamily:"monospace", color:GOLD }}>{paymentId || "loading…"}</span>
          </div>
          <p style={{ margin:"0 0 4px", fontWeight:700, fontSize:16 }}>{desc}</p>
          <div style={{ borderTop:"1px solid rgba(255,255,255,0.15)", marginTop:12, paddingTop:12, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ opacity:0.6 }}>Total Due</span>
            <span style={{ fontWeight:900, fontSize:22, color:GOLD }}>{fmt(amount)}</span>
          </div>
        </div>

        {/* PAYMENT METHOD */}
        <div style={{ background:"white", borderRadius:18, padding:20, marginBottom:14, boxShadow:"0 2px 12px rgba(0,0,0,0.07)" }}>
          <p style={{ margin:"0 0 14px", fontWeight:700, fontSize:14, color:"#1e293b" }}>Payment Method</p>
          <div style={{ display:"flex", gap:10 }}>
            {[{ id:"card", icon:"💳", label:"Credit / Debit Card" }, { id:"ach", icon:"🏦", label:"Bank Transfer (ACH)" }].map(m => (
              <button key={m.id} onClick={() => setPayMethod(m.id as "card"|"ach")} style={{
                flex:1, padding:"11px 12px", borderRadius:12, cursor:"pointer", fontSize:13, fontWeight:700, border:"none",
                background: payMethod===m.id ? "#eff6ff" : "#f8fafc",
                outline: payMethod===m.id ? `2px solid ${BLUE}` : "2px solid #e2e8f0",
                color: payMethod===m.id ? BLUE : "#64748b",
              }}>{m.icon} {m.label}</button>
            ))}
          </div>
        </div>

        {/* CUSTOMER INFO */}
        <div style={{ background:"white", borderRadius:18, padding:20, marginBottom:14, boxShadow:"0 2px 12px rgba(0,0,0,0.07)" }}>
          <p style={{ margin:"0 0 16px", fontWeight:700, fontSize:14, color:"#1e293b" }}>Your Information</p>
          <div style={{ display:"grid", gap:14 }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} placeholder="John Smith" style={inputStyle(!!errors.name)} />
              {errors.name && <p style={{ margin:"4px 0 0", fontSize:11, color:RED }}>{errors.name}</p>}
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} placeholder="john@example.com" type="email" style={inputStyle(!!errors.email)} />
              {errors.email && <p style={{ margin:"4px 0 0", fontSize:11, color:RED }}>{errors.email}</p>}
            </div>
          </div>
        </div>

        {/* CARD FORM */}
        {payMethod === "card" && (
          <div style={{ background:"white", borderRadius:18, padding:20, marginBottom:14, boxShadow:"0 2px 12px rgba(0,0,0,0.07)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <p style={{ margin:0, fontWeight:700, fontSize:14, color:"#1e293b" }}>Card Details</p>
              <div style={{ display:"flex", gap:5 }}>
                {["VISA","MC","AMEX","DISC"].map(b => <span key={b} style={{ background:"#f1f5f9", borderRadius:5, padding:"2px 7px", fontSize:9, fontWeight:800, color:"#64748b" }}>{b}</span>)}
              </div>
            </div>
            <div style={{ display:"grid", gap:14 }}>
              <div>
                <label style={labelStyle}>Card Number {form.cardNumber && <span style={{ color:BLUE, fontWeight:800 }}>{getCardIcon()}</span>}</label>
                <input value={form.cardNumber} onChange={e => setForm(f=>({...f,cardNumber:fmtCard(e.target.value)}))} placeholder="1234  5678  9012  3456" maxLength={19}
                  style={{ ...inputStyle(!!errors.cardNumber), letterSpacing:"3px", fontSize:16 }} />
                {errors.cardNumber && <p style={{ margin:"4px 0 0", fontSize:11, color:RED }}>{errors.cardNumber}</p>}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
                <div>
                  <label style={labelStyle}>Expiry</label>
                  <input value={form.expiry} onChange={e => setForm(f=>({...f,expiry:fmtExp(e.target.value)}))} placeholder="MM/YY" maxLength={5} style={inputStyle(!!errors.expiry)} />
                  {errors.expiry && <p style={{ margin:"4px 0 0", fontSize:11, color:RED }}>{errors.expiry}</p>}
                </div>
                <div>
                  <label style={labelStyle}>CVC</label>
                  <input value={form.cvc} onChange={e => setForm(f=>({...f,cvc:e.target.value.replace(/\D/g,"").slice(0,4)}))} placeholder="123" maxLength={4} style={inputStyle(!!errors.cvc)} />
                  {errors.cvc && <p style={{ margin:"4px 0 0", fontSize:11, color:RED }}>{errors.cvc}</p>}
                </div>
                <div>
                  <label style={labelStyle}>ZIP Code</label>
                  <input value={form.zip} onChange={e => setForm(f=>({...f,zip:e.target.value.slice(0,10)}))} placeholder="10001" style={inputStyle()} />
                </div>
              </div>
            </div>
            <div style={{ marginTop:14, background:"#f0f9ff", borderRadius:10, padding:"10px 14px", fontSize:12, color:"#0369a1", display:"flex", gap:8, alignItems:"center" }}>
              🔒 Card tokenized via Tilled secure gateway — never stored on Zeniva servers
            </div>
          </div>
        )}

        {/* ACH FORM */}
        {payMethod === "ach" && (
          <div style={{ background:"white", borderRadius:18, padding:20, marginBottom:14, boxShadow:"0 2px 12px rgba(0,0,0,0.07)" }}>
            <p style={{ margin:"0 0 16px", fontWeight:700, fontSize:14, color:"#1e293b" }}>Bank Account</p>
            <div style={{ display:"grid", gap:14 }}>
              {[
                { label:"Bank Name", key:"bank", ph:"Chase, Bank of America, Wells Fargo…" },
                { label:"Routing Number (9 digits)", key:"routing", ph:"021000021" },
                { label:"Account Number", key:"account", ph:"••••••••••" },
              ].map(f => (
                <div key={f.key}>
                  <label style={labelStyle}>{f.label}</label>
                  <input value={(form as Record<string,string>)[f.key]} onChange={e => setForm(p=>({...p,[f.key]:e.target.value}))} placeholder={f.ph}
                    style={inputStyle(!!errors[f.key])} />
                  {errors[f.key] && <p style={{ margin:"4px 0 0", fontSize:11, color:RED }}>{errors[f.key]}</p>}
                </div>
              ))}
            </div>
            <div style={{ marginTop:14, background:"#fef3c7", borderRadius:10, padding:"10px 14px", fontSize:12, color:"#92400e" }}>
              ⏱ ACH transfers take 1-3 business days to settle in ZeniPay
            </div>
          </div>
        )}

        {/* PAY BUTTON */}
        <div style={{ background:"white", borderRadius:18, padding:22, boxShadow:"0 4px 20px rgba(15,108,245,0.12)", border:`1px solid ${BLUE}20` }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6, fontSize:14, color:"#64748b" }}>
            <span>{desc.slice(0,42)}</span><span>{fmt(amount)}</span>
          </div>
          <div style={{ borderTop:"1px solid #f1f5f9", paddingTop:12, marginBottom:20, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontWeight:700, fontSize:16 }}>Total Due</span>
            <span style={{ fontWeight:900, fontSize:30, color:BLUE }}>{fmt(amount)}</span>
          </div>
          <button onClick={handleSubmit} style={{
            width:"100%", background:`linear-gradient(135deg,${BLUE} 0%,${DARK} 100%)`,
            color:"white", border:"none", borderRadius:9999, padding:"17px",
            fontSize:19, fontWeight:900, cursor:"pointer", boxShadow:`0 6px 24px ${BLUE}50`,
            letterSpacing:"-0.3px",
          }}>
            🔒 Pay {fmt(amount)} Now
          </button>
          <div style={{ textAlign:"center", marginTop:14, fontSize:11, color:"#94a3b8", lineHeight:1.6 }}>
            🛡️ <strong>ZeniPay</strong> Secured · PCI DSS Level 1 · 256-bit Encryption<br/>
            Processed by <strong>Tilled</strong> financial infrastructure<br/>
            💳 Visa · Mastercard · Amex · Discover · 🏦 ACH
          </div>
        </div>
      </div>
    </div>
  );
}
