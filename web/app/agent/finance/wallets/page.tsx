"use client";
import { useState } from "react";

const BLUE = "#0F6CF5", DARK = "#0B1B4D", GREEN = "#10B981", GOLD = "#F59E0B";

export default function WalletSettings() {
  const [activeTab, setActiveTab] = useState<"company" | "agents" | "influencers">("company");
  const [form, setForm] = useState({ holder: "", bank: "", routing: "", account: "", confirm_account: "", type: "checking" });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setSaved(true);
    setLoading(false);
  };

  const agents = [
    { id: "AGT-001", name: "Ben Martin", role: "ZeniPay Finance Agent", status: "verified", bank: "Chase", last4: "4242", pending: 8400 },
    { id: "AGT-002", name: "Sofia Rivera", role: "Marketing Lead", status: "pending", bank: "—", last4: "—", pending: 5200 },
    { id: "AGT-003", name: "Luna Park", role: "Content & Social", status: "not_set", bank: "—", last4: "—", pending: 2800 },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4ff", fontFamily: "system-ui,sans-serif" }}>
      <div style={{ background: `linear-gradient(135deg, ${DARK}, #1a2f6e)`, padding: "16px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
          <a href="/agent/finance" style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, textDecoration: "none" }}>← ZeniPay</a>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>/</span>
          <span style={{ color: "white", fontWeight: 700 }}>🏦 Wallet Settings</span>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "24px auto", padding: "0 24px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {[{ id: "company", label: "🏛️ Zeniva Company Wallet" }, { id: "agents", label: "👤 Agent Wallets" }, { id: "influencers", label: "⭐ Influencer Wallets" }].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id as typeof activeTab)} style={{
              padding: "10px 20px", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer", border: "none",
              background: activeTab === t.id ? BLUE : "white",
              color: activeTab === t.id ? "white" : "#374151",
              boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
            }}>{t.label}</button>
          ))}
        </div>

        {activeTab === "company" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
              <h3 style={{ margin: "0 0 6px", fontWeight: 800 }}>🏛️ Zeniva Bank Account</h3>
              <p style={{ margin: "0 0 20px", color: "#64748b", fontSize: 13 }}>ZeniPay will deposit your net revenue here every Friday.</p>
              {saved ? (
                <div style={{ background: "#f0fdf4", borderRadius: 12, padding: 20, textAlign: "center" }}>
                  <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
                  <p style={{ fontWeight: 700, color: GREEN }}>Bank account saved!</p>
                  <p style={{ fontSize: 12, color: "#64748b" }}>Verification deposits will arrive in 1-2 business days.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gap: 12 }}>
                  {[
                    { label: "Account Holder Name", key: "holder", ph: "Zeniva LLC" },
                    { label: "Bank Name", key: "bank", ph: "Chase, Bank of America, Wells Fargo…" },
                    { label: "Routing Number", key: "routing", ph: "021000021", max: 9 },
                    { label: "Account Number", key: "account", ph: "••••••••••" },
                    { label: "Confirm Account Number", key: "confirm_account", ph: "••••••••••" },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#374151", marginBottom: 4, textTransform: "uppercase" as const }}>{f.label}</label>
                      <input value={(form as Record<string,string>)[f.key]} onChange={e => setForm(p => ({...p,[f.key]:e.target.value}))} placeholder={f.ph} maxLength={f.max}
                        style={{ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", fontSize: 13, outline: "none", boxSizing: "border-box" as const }} />
                    </div>
                  ))}
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#374151", marginBottom: 4, textTransform: "uppercase" as const }}>Account Type</label>
                    <select value={form.type} onChange={e => setForm(p => ({...p,type:e.target.value}))}
                      style={{ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", fontSize: 13, outline: "none" }}>
                      <option value="checking">Checking</option>
                      <option value="savings">Savings</option>
                    </select>
                  </div>
                  <button onClick={handleSave} disabled={loading} style={{ background: `linear-gradient(135deg, ${BLUE}, ${DARK})`, color: "white", border: "none", borderRadius: 9999, padding: "13px", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
                    {loading ? "Saving…" : "💾 Save Bank Account"}
                  </button>
                </div>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ background: `linear-gradient(135deg, ${DARK}, #1a2f6e)`, borderRadius: 16, padding: 24, color: "white" }}>
                <h4 style={{ margin: "0 0 12px", fontWeight: 700 }}>💰 Weekly Payout Schedule</h4>
                <div style={{ display: "grid", gap: 8 }}>
                  {[
                    { label: "Payout Day", value: "Every Friday" },
                    { label: "Net Revenue", value: "$94,302" },
                    { label: "Next Payout", value: "March 7, 2026" },
                    { label: "Method", value: "Direct Deposit (ACH)" },
                  ].map(s => (
                    <div key={s.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                      <span style={{ opacity: 0.6 }}>{s.label}</span>
                      <span style={{ fontWeight: 700, color: GOLD }}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
                <h4 style={{ margin: "0 0 12px", fontWeight: 700, fontSize: 14 }}>🔒 Security</h4>
                {["End-to-end encryption", "Bank-grade TLS 1.3", "Account verification required", "Manual review for large transfers"].map(s => (
                  <div key={s} style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 13 }}>
                    <span style={{ color: GREEN }}>✓</span><span style={{ color: "#374151" }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "agents" && (
          <div>
            <div style={{ display: "grid", gap: 16 }}>
              {agents.map(a => (
                <div key={a.id} style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", display: "flex", alignItems: "center", gap: 20 }}>
                  <div style={{ width: 44, height: 44, background: `${BLUE}15`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>👤</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: "0 0 2px", fontWeight: 700 }}>{a.name}</p>
                    <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>{a.role}</p>
                    {a.status === "verified" && <p style={{ margin: "4px 0 0", fontSize: 12, color: GREEN }}>✅ {a.bank} ••••{a.last4}</p>}
                    {a.status === "pending" && <p style={{ margin: "4px 0 0", fontSize: 12, color: GOLD }}>⏳ Verification pending</p>}
                    {a.status === "not_set" && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#ef4444" }}>❌ No bank account set</p>}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ margin: "0 0 4px", fontWeight: 800, color: BLUE }}>${a.pending.toLocaleString()}</p>
                    <p style={{ margin: "0 0 8px", fontSize: 11, color: "#94a3b8" }}>Pending payout</p>
                    <button style={{ background: `${BLUE}15`, color: BLUE, border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                      {a.status === "verified" ? "Update Bank" : "Add Bank Account"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "influencers" && (
          <div style={{ background: "white", borderRadius: 16, padding: 40, textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⭐</div>
            <h3 style={{ margin: "0 0 8px", fontWeight: 700 }}>Influencer Payouts</h3>
            <p style={{ color: "#64748b", marginBottom: 24 }}>Influencers receive commissions via PayPal or direct deposit. They set up their payout method via the influencer portal.</p>
            <button style={{ background: BLUE, color: "white", border: "none", borderRadius: 9999, padding: "12px 28px", fontWeight: 700, cursor: "pointer" }}>
              📧 Invite Influencers to Set Up Payout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
