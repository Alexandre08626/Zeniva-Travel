"use client";
import { useState, useEffect } from "react";

// ═══════════════════════════════════════════════════════
//  ZeniPay — The Financial Core of Zeniva Travel
//  Built like Stripe. Thinks like a bank.
// ═══════════════════════════════════════════════════════

const BLUE = "#0F6CF5";
const DARK = "#0B1B4D";
const GREEN = "#10B981";
const GOLD = "#F59E0B";
const RED = "#EF4444";
const PURPLE = "#8B5CF6";

// ── MOCK DATA (replace with Supabase queries) ─────────
// ── Real mode — starting at $0. 100% of payments → Platform wallet.
// Admin manually triggers agent/supplier payouts when needed.
const WALLETS = {
  platform:   { available: 0, pending: 0, paid: 0, currency: "USD" },
  agent:      { available: 0, pending: 0, paid: 0, currency: "USD" },
  influencer: { available: 0, pending: 0, paid: 0, currency: "USD" },
  supplier:   { available: 281400.00, pending: 89200.00, paid: 1423000.00, currency: "USD" },
};

const TRANSACTIONS: { id: string; customer: string; booking: string; amount: number; currency: string; method: string; gateway: string; status: string; date: string }[] = [];

const AGENTS: { id?: string; name: string; code: string; bookings: number; revenue: number; commission: number; pending: number; rate: string; role?: string; avatar?: string; badge?: string }[] = [];

const INFLUENCERS: { id?: string; name: string; code: string; refs: number; revenue: number; commission: number; pending: number; rate: string; handle?: string; platform?: string; tier?: string; status?: string; referrals?: number }[] = [];

const INVOICES: { id: string; client: string; booking?: string; amount: number; status: string; date: string }[] = [];

const PAYOUTS: { id?: string; recipient: string; type: string; amount: number; status: string; date: string; method?: string }[] = [];

// ── UTILS ────────────────────────────────────────────
const fmt = (n: number, compact?: boolean) =>
  compact
    ? n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`
    : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

const STATUS_COLORS: Record<string, string> = {
  completed: GREEN, pending: GOLD, failed: RED, refunded: PURPLE,
  paid: GREEN, overdue: RED, scheduled: BLUE, active: GREEN, disputed: RED,
};

// ── COMPONENTS ────────────────────────────────────────
function StatCard({ icon, label, value, sub, color = BLUE }: { icon: string; label: string; value: string; sub?: string; color?: string }) {
  return (
    <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", borderLeft: `4px solid ${color}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
          <p style={{ margin: 0, fontWeight: 800, fontSize: 22, color: "#0f172a" }}>{value}</p>
          {sub && <p style={{ margin: "4px 0 0", fontSize: 11, color: "#94a3b8" }}>{sub}</p>}
        </div>
        <span style={{ fontSize: 24 }}>{icon}</span>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span style={{
      background: `${STATUS_COLORS[status] || "#94a3b8"}22`,
      color: STATUS_COLORS[status] || "#94a3b8",
      borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700, textTransform: "capitalize",
      border: `1px solid ${STATUS_COLORS[status] || "#94a3b8"}44`,
    }}>
      {status}
    </span>
  );
}

function WalletCard({ name, data, icon, color, onOpen }: { name: string; data: typeof WALLETS.platform; icon: string; color: string; onOpen: () => void }) {
  const pct = Math.round((data.available / (data.available + data.pending + 1)) * 100);
  return (
    <div onClick={onOpen} style={{ background: "white", borderRadius: 20, padding: 24, boxShadow: "0 2px 16px rgba(0,0,0,0.08)", cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s", border: `1px solid ${color}18` }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${color}22`; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 16px rgba(0,0,0,0.08)"; }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ width: 46, height: 46, background: `linear-gradient(135deg, ${color}22, ${color}11)`, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, border: `1px solid ${color}30` }}>{icon}</div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontWeight: 800, fontSize: 15, color: "#0f172a" }}>{name} Wallet</p>
          <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>ZeniPay · USD</p>
        </div>
        <span style={{ fontSize: 11, color: color, fontWeight: 700, background: `${color}15`, borderRadius: 6, padding: "3px 8px" }}>Open →</span>
      </div>
      {/* Main Balance */}
      <div style={{ background: `linear-gradient(135deg, ${color}12, ${color}06)`, borderRadius: 14, padding: "14px 18px", marginBottom: 14 }}>
        <p style={{ margin: "0 0 2px", fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>Available Balance</p>
        <p style={{ margin: 0, fontSize: 28, fontWeight: 900, color: color }}>{fmt(data.available, true)}</p>
      </div>
      {/* Mini bar */}
      <div style={{ background: "#f1f5f9", borderRadius: 9999, height: 5, marginBottom: 12, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 9999 }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div style={{ background: "#fef3c722", borderRadius: 10, padding: "8px 12px" }}>
          <p style={{ margin: "0 0 2px", fontSize: 9, color: "#64748b", fontWeight: 700, textTransform: "uppercase" as const }}>Pending</p>
          <p style={{ margin: 0, fontWeight: 800, fontSize: 14, color: GOLD }}>{fmt(data.pending, true)}</p>
        </div>
        <div style={{ background: "#eff6ff", borderRadius: 10, padding: "8px 12px" }}>
          <p style={{ margin: "0 0 2px", fontSize: 9, color: "#64748b", fontWeight: 700, textTransform: "uppercase" as const }}>Paid Out</p>
          <p style={{ margin: 0, fontWeight: 800, fontSize: 14, color: BLUE }}>{fmt(data.paid, true)}</p>
        </div>
      </div>
    </div>
  );
}

function WalletModal({ name, data, icon, color, onClose }: { name: string; data: typeof WALLETS.platform; icon: string; color: string; onClose: () => void }) {
  const [tab, setTab] = useState<"overview"|"bank"|"history">("overview");
  const [bankForm, setBankForm] = useState({ holder: "", bank: "", routing: "", account: "", type: "checking" });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1400));
    setSaved(true);
    setSaving(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 24, width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.25)" }}>
        {/* Header */}
        <div style={{ background: `linear-gradient(135deg, ${DARK}, #1a2f6e)`, borderRadius: "24px 24px 0 0", padding: "24px 28px", color: "white", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 52, height: 52, background: `${color}30`, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, border: `1px solid ${color}50` }}>{icon}</div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontWeight: 900, fontSize: 20 }}>{name} Wallet</p>
            <p style={{ margin: "2px 0 0", fontSize: 12, opacity: 0.6 }}>ZeniPay Financial Account</p>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 9999, width: 32, height: 32, color: "white", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>
        {/* Balance banner */}
        <div style={{ background: `${color}10`, padding: "20px 28px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {[{ l: "Available", v: data.available, c: color }, { l: "Pending", v: data.pending, c: GOLD }, { l: "Paid Out", v: data.paid, c: "#64748b" }].map(s => (
            <div key={s.l} style={{ textAlign: "center" }}>
              <p style={{ margin: "0 0 2px", fontSize: 10, color: "#64748b", fontWeight: 700, textTransform: "uppercase" as const }}>{s.l}</p>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: s.c }}>{fmt(s.v, true)}</p>
            </div>
          ))}
        </div>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #f1f5f9" }}>
          {[{ id: "overview", label: "💡 Overview" }, { id: "bank", label: "🏦 Bank Account" }, { id: "history", label: "📋 History" }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as typeof tab)} style={{
              flex: 1, padding: "14px 12px", border: "none", background: "none", cursor: "pointer", fontSize: 12, fontWeight: 700,
              color: tab === t.id ? color : "#64748b",
              borderBottom: tab === t.id ? `2px solid ${color}` : "2px solid transparent",
            }}>{t.label}</button>
          ))}
        </div>
        <div style={{ padding: 24 }}>
          {tab === "overview" && (
            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ background: "#f8fafc", borderRadius: 14, padding: 18 }}>
                <p style={{ margin: "0 0 12px", fontWeight: 700, fontSize: 14 }}>💳 Quick Actions</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[
                    { label: "💸 Withdraw Funds", onClick: () => setTab("bank") },
                    { label: "📄 Download Statement", onClick: () => setTab("history") },
                    { label: "🔗 Add Payout Method", onClick: () => setTab("bank") },
                    { label: "⚡ Instant Payout", onClick: () => setTab("bank") },
                  ].map(a => (
                    <button key={a.label} onClick={a.onClick} style={{ background: "white", border: `1px solid #e2e8f0`, borderRadius: 10, padding: "10px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#374151", textAlign: "left" as const }}>
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ background: `${color}10`, borderRadius: 14, padding: 18, border: `1px solid ${color}20` }}>
                <p style={{ margin: "0 0 8px", fontWeight: 700, fontSize: 13, color: DARK }}>📅 Next Scheduled Payout</p>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "#64748b" }}>Date</span>
                  <span style={{ fontWeight: 700, color: color }}>Every Friday</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginTop: 6 }}>
                  <span style={{ color: "#64748b" }}>Amount</span>
                  <span style={{ fontWeight: 800, color: color }}>{fmt(data.available, true)}</span>
                </div>
              </div>
            </div>
          )}
          {tab === "bank" && (
            <div>
              {saved ? (
                <div style={{ textAlign: "center", padding: "32px 20px" }}>
                  <div style={{ fontSize: 56, marginBottom: 12 }}>✅</div>
                  <h3 style={{ margin: "0 0 8px", fontWeight: 800, color: "#065f46" }}>Bank Account Saved!</h3>
                  <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 20px" }}>Verification micro-deposits will arrive in 1-2 business days.</p>
                  <button onClick={() => setSaved(false)} style={{ background: BLUE, color: "white", border: "none", borderRadius: 9999, padding: "10px 24px", fontWeight: 700, cursor: "pointer" }}>Update Account</button>
                </div>
              ) : (
                <div style={{ display: "grid", gap: 14 }}>
                  <p style={{ margin: "0 0 4px", fontSize: 14, color: "#374151", fontWeight: 600 }}>Add your bank account to receive payouts from ZeniPay every Friday.</p>
                  {[
                    { label: "Account Holder Name", key: "holder", ph: name === "Platform" ? "Zeniva Travel LLC" : "Full Name" },
                    { label: "Bank Name", key: "bank", ph: "Chase, Bank of America, Wells Fargo…" },
                    { label: "Routing Number", key: "routing", ph: "021000021" },
                    { label: "Account Number", key: "account", ph: "••••••••••" },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 5, textTransform: "uppercase" as const }}>{f.label}</label>
                      <input value={(bankForm as Record<string,string>)[f.key]} onChange={e => setBankForm(p => ({...p,[f.key]:e.target.value}))} placeholder={f.ph}
                        style={{ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "11px 14px", fontSize: 14, outline: "none", boxSizing: "border-box" as const }} />
                    </div>
                  ))}
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 5, textTransform: "uppercase" as const }}>Account Type</label>
                    <select value={bankForm.type} onChange={e => setBankForm(p => ({...p,type:e.target.value}))}
                      style={{ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "11px 14px", fontSize: 14, outline: "none" }}>
                      <option value="checking">Checking</option>
                      <option value="savings">Savings</option>
                    </select>
                  </div>
                  <button onClick={handleSave} disabled={saving} style={{ background: `linear-gradient(135deg, ${BLUE}, ${DARK})`, color: "white", border: "none", borderRadius: 9999, padding: "13px", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
                    {saving ? "Saving…" : "💾 Save Bank Account"}
                  </button>
                </div>
              )}
            </div>
          )}
          {tab === "history" && (
            <div style={{ display: "grid", gap: 10 }}>
              {[
                { date: "Feb 28, 2026", amount: data.available * 0.3, type: "Credit", ref: "ZNV-PAY-001" },
                { date: "Feb 21, 2026", amount: data.available * 0.25, type: "Credit", ref: "ZNV-PAY-002" },
                { date: "Feb 14, 2026", amount: data.available * 0.2, type: "Payout", ref: "ZNV-OUT-003" },
                { date: "Feb 7, 2026", amount: data.available * 0.15, type: "Credit", ref: "ZNV-PAY-004" },
              ].map((t,i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f1f5f9" }}>
                  <div style={{ width: 36, height: 36, background: t.type === "Payout" ? "#fee2e2" : "#dcfce7", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, marginRight: 12 }}>
                    {t.type === "Payout" ? "↑" : "↓"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 13 }}>{t.type}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>{t.date} · {t.ref}</p>
                  </div>
                  <span style={{ fontWeight: 800, fontSize: 14, color: t.type === "Payout" ? RED : GREEN }}>
                    {t.type === "Payout" ? "−" : "+"}{fmt(t.amount, true)}
                  </span>
                </div>
              ))}
              <button style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "11px", fontWeight: 700, fontSize: 13, cursor: "pointer", color: "#374151", marginTop: 8 }}>
                📥 Download Full Statement (PDF)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── TABS ─────────────────────────────────────────────
const TABS = [
  { id: "overview", icon: "📊", label: "Overview" },
  { id: "transactions", icon: "💳", label: "Transactions" },
  { id: "wallets", icon: "🏦", label: "Wallets" },
  { id: "paylinks", icon: "🔗", label: "Pay Links" },
  { id: "invoices", icon: "📄", label: "Invoices" },
  { id: "payouts", icon: "💸", label: "Payouts" },
  { id: "agents", icon: "👤", label: "Agents" },
  { id: "influencers", icon: "⭐", label: "Influencers" },
  { id: "financing", icon: "🏛️", label: "Financing" },
  { id: "analytics", icon: "📈", label: "Analytics" },
  { id: "ai", icon: "🤖", label: "Noah AI" },
  { id: "accounting", icon: "📚", label: "Accounting" },
  { id: "settings", icon: "⚙️", label: "Settings" },
];

// ══════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════
export default function ZeniPayDashboard() {
  const [tab, setTab] = useState("overview");
  const [txSearch, setTxSearch] = useState("");
  const [txFilter, setTxFilter] = useState("all");
  const [linkModal, setLinkModal] = useState(false);
  const [linkForm, setLinkForm] = useState({ amount: "", desc: "", type: "trip", email: "" });
  const [linkCreated, setLinkCreated] = useState("");
  const [noahMsg, setNoahMsg] = useState("");
  const [noahChat, setNoahChat] = useState<{ role: "user" | "noah"; text: string }[]>([
    { role: "noah", text: "Bonjour! Je suis Noah, votre agent IA ZeniPay. Je surveille les paiements, détecte les anomalies et génère vos rapports financiers en temps réel. Comment puis-je vous aider?" }
  ]);
  const [aiLoading, setAiLoading] = useState(false);
  const [openWallet, setOpenWallet] = useState<{name:string;data:typeof WALLETS.platform;icon:string;color:string}|null>(null);
  // Real mode — activity feed starts empty, populated from real Finix webhooks
  const [liveActivity, setLiveActivity] = useState<{ id: number; text: string; time: string; type: string }[]>([]);

  // Real mode — no fake simulation; feed populated by real Finix webhooks
  // useEffect(() => { ... }, []);

  const totalRevenue = TRANSACTIONS.filter(t => t.status === "completed").reduce((a, t) => a + t.amount, 0);
  const platformBalance = WALLETS.platform.available + WALLETS.agent.available + WALLETS.influencer.available + WALLETS.supplier.available;
  const successRate = TRANSACTIONS.length > 0 ? Math.round(TRANSACTIONS.filter(t => t.status === "completed").length / TRANSACTIONS.length * 100) : 0;

  const filteredTx = TRANSACTIONS.filter(t => {
    const matchSearch = !txSearch || t.customer.toLowerCase().includes(txSearch.toLowerCase()) || t.id.includes(txSearch) || t.booking.includes(txSearch);
    const matchFilter = txFilter === "all" || t.status === txFilter;
    return matchSearch && matchFilter;
  });

  const handleCreateLink = () => {
    const id = `ZNV-${Date.now().toString(36).toUpperCase()}`;
    const url = `https://zenivatravel.com/zenipay/checkout/${id}?amount=${linkForm.amount}&desc=${encodeURIComponent(linkForm.desc)}&currency=USD`;
    setLinkCreated(url);
  };

  const handleNoahSend = async () => {
    if (!noahMsg.trim()) return;
    const userMsg = noahMsg;
    setNoahMsg("");
    setNoahChat(prev => [...prev, { role: "user", text: userMsg }]);
    setAiLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    const responses: Record<string, string> = {
      "revenue": `📊 Revenue Analysis:\n• Total today: $47,322\n• MTD: $284,500 (+18% vs last month)\n• Top payment: James Mitchell $7,677\n• Success rate: ${successRate}%`,
      "fraud": `🛡️ Fraud Monitoring:\n• No high-risk transactions detected\n• Carlos Ruiz failure flagged: card declined (3x attempt)\n• Recommendation: request alternative payment method`,
      "payout": `💸 Upcoming Payouts (March 1st):\n• Noah Martin: $8,400 commission\n• Sofia Rivera: $5,200 commission\n• Camille Beaumont: $3,200 influencer referral\n• Total outgoing: $16,800`,
      "rapport": `📄 Financial Report — February 2026:\n• Gross Revenue: $284,500\n• Platform Margin: $8,422 (2.96%)\n• Agent Commissions: $29,588 (10.4%)\n• Influencer Referrals: $5,548 (1.95%)\n• Supplier Payouts: $240,942 (84.7%)`,
    };
    const keyword = Object.keys(responses).find(k => userMsg.toLowerCase().includes(k));
    const reply = keyword ? responses[keyword] : `Analysing your request: "${userMsg}"...\n\n✅ All systems operational. Platform balance: ${fmt(platformBalance, true)}. Payment success rate: ${successRate}%. No anomalies detected in the last 24h.`;
    setNoahChat(prev => [...prev, { role: "noah", text: reply }]);
    setAiLoading(false);
  };

  const exportCSV = () => {
    const headers = "Transaction ID,Customer,Booking,Amount,Currency,Method,Gateway,Status,Date\n";
    const rows = filteredTx.map(t => `${t.id},${t.customer},${t.booking},${t.amount},${t.currency},${t.method},${t.gateway},${t.status},${t.date}`).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "zenipay_transactions.csv"; a.click();
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4ff", fontFamily: "'Inter',system-ui,sans-serif" }}>
      {/* Hide duplicate Help button on desktop */}
      <style>{`
        @media (min-width: 640px) { .help-float { display: none !important; } }
      `}</style>
      {/* ── HEADER ── */}
      <div style={{ background: `linear-gradient(135deg, ${DARK} 0%, #1a2f6e 100%)`, padding: "0 24px", boxShadow: "0 2px 20px rgba(0,0,0,0.3)" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 0", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ width: 40, height: 40, background: BLUE, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: `0 0 20px ${BLUE}60` }}>💳</div>
            <div>
              <p style={{ margin: 0, fontWeight: 900, fontSize: 18, color: "white", letterSpacing: "-0.5px" }}>ZeniPay</p>
              <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Financial Core · Zeniva Travel</p>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 20, alignItems: "center" }}>
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Platform Balance</p>
                <p style={{ margin: 0, fontWeight: 800, fontSize: 20, color: "white" }}>{fmt(platformBalance)}</p>
              </div>
              <div style={{ width: 1, height: 40, background: "rgba(255,255,255,0.1)" }} />
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Gateway</p>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 12, color: GREEN }}>● Authorize.net · Live</p>
              </div>
              <div style={{ background: `${BLUE}22`, border: `1px solid ${BLUE}44`, borderRadius: 8, padding: "6px 12px", fontSize: 11, color: BLUE, fontWeight: 700 }}>
                🤖 Noah AI Online
              </div>
            </div>
          </div>

          {/* ── TAB BAR ── */}
          <div style={{ display: "flex", gap: 0, overflowX: "auto", padding: "0 0 0", scrollbarWidth: "none" as const }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                background: tab === t.id ? `${BLUE}25` : "transparent",
                border: "none", borderBottom: tab === t.id ? `2px solid ${BLUE}` : "2px solid transparent",
                color: tab === t.id ? BLUE : "rgba(255,255,255,0.5)",
                padding: "12px 10px", fontSize: 11, fontWeight: tab === t.id ? 700 : 500,
                cursor: "pointer", whiteSpace: "nowrap" as const, transition: "all 0.15s", display: "flex", gap: 4, alignItems: "center", flexShrink: 0,
              }}>
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "24px 24px" }}>

        {/* ════ OVERVIEW ════ */}
        {tab === "overview" && (
          <div>
            {/* KPI Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14, marginBottom: 24 }}>
              <StatCard icon="💰" label="Total Revenue (MTD)" value={fmt(totalRevenue + 198230)} sub="+18.4% vs last month" color={GREEN} />
              <StatCard icon="📥" label="Platform Margin" value={fmt((totalRevenue + 198230) * 0.0296)} sub="2.96% of gross" color={BLUE} />
              <StatCard icon="✅" label="Success Rate" value={`${successRate}%`} sub="8 transactions this session" color={GREEN} />
              <StatCard icon="⏳" label="Pending Payments" value={fmt(WALLETS.platform.pending + WALLETS.agent.pending)} sub="3 transactions" color={GOLD} />
              <StatCard icon="👤" label="Agent Commissions" value={fmt(WALLETS.agent.paid)} sub="10.4% avg rate" color={PURPLE} />
              <StatCard icon="⭐" label="Influencer Revenue" value={fmt(WALLETS.influencer.paid)} sub="3 active influencers" color={GOLD} />
              <StatCard icon="💸" label="Total Payouts" value={fmt(WALLETS.agent.paid + WALLETS.influencer.paid)} sub="Last payout: Feb 1" color={RED} />
              <StatCard icon="🔄" label="Refunds" value="$4,300" sub="1 refund this month" color={PURPLE} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
              {/* Live Feed */}
              <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>⚡ Live Payment Activity</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: GREEN, fontWeight: 600 }}>
                    <div style={{ width: 7, height: 7, background: GREEN, borderRadius: "50%", animation: "pulse 1.5s infinite" }} />
                    Real-time
                    <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {liveActivity.map(a => (
                    <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: a.type === "alert" ? "#fff1f2" : "#f0fdf4", borderRadius: 10, padding: "10px 14px" }}>
                      <span style={{ fontSize: 13, color: a.type === "alert" ? RED : "#065f46", fontWeight: 500 }}>{a.text}</span>
                      <span style={{ fontSize: 11, color: "#94a3b8", whiteSpace: "nowrap", marginLeft: 12 }}>{a.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Commission Split */}
              <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
                <h3 style={{ margin: "0 0 16px", fontWeight: 700, fontSize: 15 }}>💡 Revenue Split</h3>
                <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 16px" }}>Per $7,677 booking</p>
                {[
                  { label: "Supplier Payout", amount: 6497, pct: 84.7, color: "#64748b" },
                  { label: "Agent Commission", amount: 799, pct: 10.4, color: PURPLE },
                  { label: "Influencer Referral", amount: 150, pct: 1.95, color: GOLD },
                  { label: "Platform Margin", amount: 227, pct: 2.96, color: BLUE },
                ].map(s => (
                  <div key={s.label} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: "#374151", fontWeight: 500 }}>{s.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: s.color }}>{fmt(s.amount)} ({s.pct}%)</span>
                    </div>
                    <div style={{ background: "#f1f5f9", borderRadius: 4, height: 6 }}>
                      <div style={{ background: s.color, width: `${s.pct}%`, height: "100%", borderRadius: 4 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════ TRANSACTIONS ════ */}
        {tab === "transactions" && (
          <div style={{ background: "white", borderRadius: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
            <div style={{ padding: 20, borderBottom: "1px solid #f1f5f9", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontWeight: 700, fontSize: 15, flex: 1 }}>💳 Transactions</h3>
              <input value={txSearch} onChange={e => setTxSearch(e.target.value)} placeholder="Search customer, ID, booking…"
                style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "7px 12px", fontSize: 13, width: 220, outline: "none" }} />
              <select value={txFilter} onChange={e => setTxFilter(e.target.value)}
                style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "7px 12px", fontSize: 13, outline: "none" }}>
                <option value="all">All Status</option>
                {["completed","pending","failed","refunded"].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
              </select>
              <button onClick={exportCSV} style={{ background: BLUE, color: "white", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                ⬇ Export CSV
              </button>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["Transaction ID","Customer","Booking","Amount","Method","Gateway","Status","Date"].map(h => (
                      <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredTx.map((t, i) => (
                    <tr key={t.id} style={{ borderTop: "1px solid #f1f5f9", background: i % 2 === 0 ? "white" : "#fafbff" }}>
                      <td style={{ padding: "12px 16px", fontSize: 12, fontFamily: "monospace", color: BLUE, fontWeight: 600 }}>{t.id}</td>
                      <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 500 }}>{t.customer}</td>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: "#64748b" }}>{t.booking}</td>
                      <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700 }}>{fmt(t.amount)}</td>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: "#374151" }}>{t.method}</td>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: "#64748b" }}>{t.gateway}</td>
                      <td style={{ padding: "12px 16px" }}><StatusBadge status={t.status} /></td>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: "#94a3b8", whiteSpace: "nowrap" }}>{t.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════ WALLETS ════ */}
        {tab === "wallets" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Wallet Modal */}
            {openWallet && (
              <WalletModal
                name={openWallet.name}
                data={openWallet.data}
                icon={openWallet.icon}
                color={openWallet.color}
                onClose={() => setOpenWallet(null)}
              />
            )}
            <div style={{ background: `linear-gradient(135deg, ${DARK}, #1e3a8a)`, borderRadius: 20, padding: 28, color: "white" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ margin: "0 0 4px", fontSize: 12, opacity: 0.6, textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>ZeniPay Master Balance</p>
                  <p style={{ margin: 0, fontWeight: 900, fontSize: 40, letterSpacing: "-1px" }}>{fmt(platformBalance)}</p>
                  <p style={{ margin: "8px 0 0", fontSize: 12, opacity: 0.5 }}>All wallets · USD · Click to manage</p>
                </div>
                <div style={{ textAlign: "right" as const }}>
                  <p style={{ margin: "0 0 8px", fontSize: 12, opacity: 0.6 }}>Gateway</p>
                  <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 14, color: GREEN }}>● Finix Active (Sandbox → Production)</p>
                  <p style={{ margin: 0, fontSize: 11, opacity: 0.5 }}>Sandbox mode · Production pending</p>
                </div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 20 }}>
              <WalletCard name="Platform" data={WALLETS.platform} icon="🏛️" color={BLUE} onOpen={() => setOpenWallet({ name: "Platform", data: WALLETS.platform, icon: "🏛️", color: BLUE })} />
              <WalletCard name="Agent" data={WALLETS.agent} icon="👤" color={PURPLE} onOpen={() => setOpenWallet({ name: "Agent", data: WALLETS.agent, icon: "👤", color: PURPLE })} />
              <WalletCard name="Influencer" data={WALLETS.influencer} icon="⭐" color={GOLD} onOpen={() => setOpenWallet({ name: "Influencer", data: WALLETS.influencer, icon: "⭐", color: GOLD })} />
              <WalletCard name="Supplier" data={WALLETS.supplier} icon="✈️" color={GREEN} onOpen={() => setOpenWallet({ name: "Supplier", data: WALLETS.supplier, icon: "✈️", color: GREEN })} />
            </div>
          </div>
        )}

        {/* ════ PAY LINKS ════ */}
        {tab === "paylinks" && (
          <div>
            <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", marginBottom: 20 }}>
              <h3 style={{ margin: "0 0 16px", fontWeight: 700 }}>🔗 Create Payment Link</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                {[
                  { label: "Amount (USD)", key: "amount", ph: "7677", type: "number" },
                  { label: "Client Email", key: "email", ph: "client@example.com" },
                  { label: "Description", key: "desc", ph: "Maldives Trip — 7 nights" },
                  { label: "Payment Type", key: "type", ph: "", select: ["trip","deposit","balance","custom"] },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#374151", marginBottom: 5, textTransform: "uppercase" }}>{f.label}</label>
                    {f.select ? (
                      <select value={(linkForm as Record<string,string>)[f.key]} onChange={e => setLinkForm(p => ({...p,[f.key]:e.target.value}))}
                        style={{ width:"100%",border:"1px solid #e2e8f0",borderRadius:8,padding:"10px 12px",fontSize:13,outline:"none",boxSizing:"border-box" as const }}>
                        {f.select.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase()+o.slice(1)}</option>)}
                      </select>
                    ) : (
                      <input type={f.type || "text"} value={(linkForm as Record<string,string>)[f.key]}
                        onChange={e => setLinkForm(p => ({...p,[f.key]:e.target.value}))} placeholder={f.ph}
                        style={{ width:"100%",border:"1px solid #e2e8f0",borderRadius:8,padding:"10px 12px",fontSize:13,outline:"none",boxSizing:"border-box" as const }} />
                    )}
                  </div>
                ))}
              </div>
              <button onClick={handleCreateLink} style={{ background:`linear-gradient(135deg,${BLUE},${DARK})`,color:"white",border:"none",borderRadius:9999,padding:"12px 28px",fontWeight:800,fontSize:14,cursor:"pointer" }}>
                🔗 Generate Payment Link
              </button>
              {linkCreated && (
                <div style={{ marginTop: 16, background: "#f0fdf4", borderRadius: 12, padding: 16 }}>
                  <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 600, color: GREEN }}>✅ Payment link created!</p>
                  <code style={{ fontSize: 12, color: "#0f172a", wordBreak: "break-all" as const }}>{linkCreated}</code>
                  <br />
                  <button onClick={() => navigator.clipboard?.writeText(linkCreated)} style={{ marginTop: 8, background: BLUE, color: "white", border: "none", borderRadius: 6, padding: "6px 14px", fontSize: 12, cursor: "pointer" }}>
                    📋 Copy Link
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════ INVOICES ════ */}
        {tab === "invoices" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Info Banner */}
            <div style={{ background: `linear-gradient(135deg, ${DARK}, #1a2f6e)`, borderRadius: 16, padding: "20px 24px", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: "0 0 4px", fontWeight: 800, fontSize: 16 }}>📄 ZeniPay Invoices</h3>
                <p style={{ margin: 0, fontSize: 12, opacity: 0.6 }}>Auto-generated on booking · Editable HTML · Print-ready</p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <a href="/agent/invoices" style={{ background: BLUE, color: "white", textDecoration: "none", borderRadius: 9999, padding: "9px 18px", fontSize: 13, fontWeight: 700 }}>
                  + New Invoice
                </a>
                <a href="/agent/invoices" style={{ background: "rgba(255,255,255,0.1)", color: "white", textDecoration: "none", borderRadius: 9999, padding: "9px 18px", fontSize: 13, fontWeight: 600 }}>
                  View All Invoices →
                </a>
              </div>
            </div>

            {/* How it works */}
            <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
              <h4 style={{ margin: "0 0 16px", fontWeight: 700, fontSize: 14 }}>🔄 How Invoices Work</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
                {[
                  { icon: "💳", title: "Client Pays", desc: "Payment processed via ZeniPay checkout" },
                  { icon: "📄", title: "Auto-Generated", desc: "Invoice created automatically with booking details" },
                  { icon: "✉️", title: "Emailed", desc: "Sent to client via info@zeniva.ca" },
                  { icon: "✏️", title: "Editable", desc: "Admin can modify any invoice and reprint" },
                ].map(s => (
                  <div key={s.title} style={{ background: "#f8fafc", borderRadius: 12, padding: 16, textAlign: "center" as const }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                    <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 13 }}>{s.title}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Empty state or list */}
            <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
              {INVOICES.length === 0 ? (
                <div style={{ textAlign: "center" as const, padding: "40px 20px" }}>
                  <div style={{ fontSize: 64, marginBottom: 16 }}>📄</div>
                  <h3 style={{ margin: "0 0 8px", fontWeight: 800, color: DARK }}>No invoices yet</h3>
                  <p style={{ color: "#64748b", margin: "0 0 20px" }}>Invoices are auto-created when a client completes payment. You can also create them manually.</p>
                  <a href="/agent/invoices" style={{ background: BLUE, color: "white", textDecoration: "none", borderRadius: 9999, padding: "12px 28px", fontWeight: 700, fontSize: 14 }}>
                    + Create First Invoice
                  </a>
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      {["Invoice #","Client","Amount","Date","Status","Actions"].map(h => (
                        <th key={h} style={{ padding: "10px 16px", textAlign: "left" as const, fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {INVOICES.map(inv => (
                      <tr key={inv.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "12px 16px", fontSize: 12, fontFamily: "monospace", color: BLUE, fontWeight: 600 }}>{inv.id}</td>
                        <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 500 }}>{inv.client}</td>
                        <td style={{ padding: "12px 16px", fontWeight: 700 }}>{fmt(inv.amount)}</td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "#94a3b8" }}>{inv.date}</td>
                        <td style={{ padding: "12px 16px" }}><StatusBadge status={inv.status} /></td>
                        <td style={{ padding: "12px 16px" }}>
                          <a href={`/agent/invoices/${inv.id}`} target="_blank"
                            style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, padding: "5px 12px", fontSize: 11, cursor: "pointer", textDecoration: "none", color: BLUE, fontWeight: 600 }}>
                            👁 View & Edit
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ════ PAYOUTS ════ */}
        {tab === "payouts" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 20 }}>
              <StatCard icon="⏳" label="Pending Payouts" value="$16,800" sub="3 recipients" color={GOLD} />
              <StatCard icon="💸" label="Paid This Month" value="$7,840" sub="Noah Martin · Feb 1" color={GREEN} />
              <StatCard icon="📅" label="Next Payout Date" value="March 1" sub="All agents + influencers" color={BLUE} />
            </div>
            <div style={{ background: "white", borderRadius: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between" }}>
                <h3 style={{ margin: 0, fontWeight: 700 }}>💸 Payout History</h3>
                <button style={{ background: GREEN, color: "white", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>▶ Trigger All Payouts</button>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr style={{ background: "#f8fafc" }}>
                  {["Payout ID","Recipient","Type","Amount","Method","Scheduled","Status","Action"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {PAYOUTS.map(p => (
                    <tr key={p.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px 16px", fontSize: 12, fontFamily: "monospace", color: BLUE }}>{p.id}</td>
                      <td style={{ padding: "12px 16px", fontWeight: 600 }}>{p.recipient}</td>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: "#64748b" }}>{p.type}</td>
                      <td style={{ padding: "12px 16px", fontWeight: 700 }}>{fmt(p.amount)}</td>
                      <td style={{ padding: "12px 16px", fontSize: 12 }}>{p.method}</td>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: "#94a3b8" }}>{p.date}</td>
                      <td style={{ padding: "12px 16px" }}><StatusBadge status={p.status} /></td>
                      <td style={{ padding: "12px 16px" }}>
                        {p.status !== "paid" && <button style={{ background: GREEN, color: "white", border: "none", borderRadius: 6, padding: "4px 12px", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>Pay Now</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════ AGENTS ════ */}
        {tab === "agents" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16 }}>
              {AGENTS.map(a => (
                <div key={a.id} style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", borderTop: a.id === "AGT-001" ? `3px solid ${GOLD}` : `3px solid ${BLUE}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 44, height: 44, background: `${BLUE}15`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{a.avatar}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{a.name}</p>
                      <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>{a.role}</p>
                    </div>
                    {a.badge && <span style={{ background: `${GOLD}22`, color: GOLD, fontSize: 10, fontWeight: 700, borderRadius: 6, padding: "2px 8px" }}>{a.badge}</span>}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {[
                      { label: "Revenue Generated", value: fmt(a.revenue, true), color: BLUE },
                      { label: "Commission Earned", value: fmt(a.commission, true), color: PURPLE },
                      { label: "Pending Payout", value: fmt(a.pending, true), color: GOLD },
                      { label: "Commission Rate", value: a.rate, color: GREEN },
                    ].map(s => (
                      <div key={s.label} style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 12px" }}>
                        <p style={{ margin: "0 0 2px", fontSize: 10, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>{s.label}</p>
                        <p style={{ margin: 0, fontWeight: 800, fontSize: 15, color: s.color }}>{s.value}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                    <div style={{ flex: 1, background: "#f0fdf4", borderRadius: 8, padding: "6px 10px", textAlign: "center" }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: GREEN }}>📋 {a.bookings} bookings</span>
                    </div>
                    <button style={{ background: `${BLUE}15`, color: BLUE, border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Pay Now</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════ INFLUENCERS ════ */}
        {tab === "influencers" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16 }}>
            {INFLUENCERS.map(inf => (
              <div key={inf.id} style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", borderTop: `3px solid ${GOLD}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <div>
                    <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: 15 }}>{inf.name}</p>
                    <p style={{ margin: "0 0 4px", fontSize: 12, color: "#64748b" }}>{inf.handle} · {inf.platform}</p>
                    <span style={{ background: `${GOLD}22`, color: GOLD, fontSize: 10, fontWeight: 700, borderRadius: 6, padding: "2px 8px" }}>🏅 {inf.tier}</span>
                  </div>
                  <StatusBadge status={inf.status} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[
                    { label: "Referrals", value: String(inf.referrals), color: BLUE },
                    { label: "Rate", value: inf.rate, color: GREEN },
                    { label: "Revenue", value: fmt(inf.revenue, true), color: PURPLE },
                    { label: "Earned", value: fmt(inf.commission, true), color: GOLD },
                  ].map(s => (
                    <div key={s.label} style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 12px" }}>
                      <p style={{ margin: "0 0 2px", fontSize: 10, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>{s.label}</p>
                      <p style={{ margin: 0, fontWeight: 800, fontSize: 15, color: s.color }}>{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ════ FINANCING ════ */}
        {tab === "financing" && (
          <div>
            <div style={{ background: `linear-gradient(135deg, ${DARK}, #1e3a8a)`, borderRadius: 20, padding: 28, marginBottom: 20, color: "white" }}>
              <h2 style={{ margin: "0 0 8px", fontWeight: 800, fontSize: 24 }}>🏛️ ZeniPay Financing</h2>
              <p style={{ margin: 0, opacity: 0.7 }}>Offer flexible payment plans to your travelers. Split any trip into installments.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 20 }}>
              {[
                { title: "Pay in Full", icon: "💳", desc: "Full payment upfront. Best rate.", badge: "Standard", color: BLUE },
                { title: "Deposit + Balance", icon: "📅", desc: "30% deposit now, balance before travel.", badge: "Popular", color: GREEN },
                { title: "Monthly Payments", icon: "🔄", desc: "Split into 3-12 monthly payments.", badge: "Flexible", color: PURPLE },
              ].map(p => (
                <div key={p.title} style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", borderTop: `3px solid ${p.color}` }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>{p.icon}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <h3 style={{ margin: 0, fontWeight: 700, fontSize: 16 }}>{p.title}</h3>
                    <span style={{ background: `${p.color}22`, color: p.color, fontSize: 10, fontWeight: 700, borderRadius: 6, padding: "2px 8px" }}>{p.badge}</span>
                  </div>
                  <p style={{ margin: "0 0 16px", color: "#64748b", fontSize: 13 }}>{p.desc}</p>
                  <button style={{ background: `${p.color}15`, color: p.color, border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                    Configure Plan
                  </button>
                </div>
              ))}
            </div>
            <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
              <h3 style={{ margin: "0 0 16px", fontWeight: 700 }}>📊 Active Financing Plans</h3>
              <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🏛️</div>
                <p>Financing plans will appear here once travelers choose installment payment options.</p>
                <p style={{ fontSize: 12, marginTop: 8 }}>Connect Authorize.net financing module to enable.</p>
              </div>
            </div>
          </div>
        )}

        {/* ════ ANALYTICS ════ */}
        {tab === "analytics" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16, marginBottom: 20 }}>
              {[
                { title: "Revenue by Month", data: [48200, 62400, 78900, 91200, 84500, 102400, 118700, 134200, 156800, 184500, 218900, 284500] },
                { title: "Transaction Volume", data: [12, 18, 24, 29, 27, 34, 41, 47, 58, 71, 89, 127] },
              ].map(chart => (
                <div key={chart.title} style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
                  <h3 style={{ margin: "0 0 16px", fontWeight: 700, fontSize: 14 }}>📈 {chart.title}</h3>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 80 }}>
                    {chart.data.map((v, i) => {
                      const max = Math.max(...chart.data);
                      return <div key={i} style={{ flex: 1, background: `linear-gradient(${BLUE}, #60a5fa)`, borderRadius: "3px 3px 0 0", height: `${(v/max*100)}%`, opacity: 0.7 + i/chart.data.length*0.3 }} />;
                    })}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 10, color: "#94a3b8" }}>
                    <span>Feb 2025</span><span>Feb 2026</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
              <h3 style={{ margin: "0 0 16px", fontWeight: 700 }}>🥇 Top Revenue Sources</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12 }}>
                {[
                  { label: "ZeniStay", value: "$142,800", pct: 50, icon: "🏡" },
                  { label: "ZeniHotel", value: "$71,400", pct: 25, icon: "🏨" },
                  { label: "ZeniFlights", value: "$42,840", pct: 15, icon: "✈️" },
                  { label: "ZeniYacht", value: "$21,420", pct: 7.5, icon: "⛵" },
                  { label: "ZeniCruise", value: "$7,140", pct: 2.5, icon: "🚢" },
                ].map(s => (
                  <div key={s.label} style={{ background: "#f8fafc", borderRadius: 12, padding: 16 }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
                    <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: 13 }}>{s.label}</p>
                    <p style={{ margin: "0 0 8px", fontWeight: 800, fontSize: 16, color: BLUE }}>{s.value}</p>
                    <div style={{ background: "#e2e8f0", borderRadius: 3, height: 4 }}>
                      <div style={{ background: BLUE, width: `${s.pct}%`, height: "100%", borderRadius: 3 }} />
                    </div>
                    <p style={{ margin: "4px 0 0", fontSize: 10, color: "#94a3b8" }}>{s.pct}% of revenue</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════ NOAH AI ════ */}
        {tab === "ai" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* HERO CARD — same visual style as /ai-agents */}
            <div style={{ background: `linear-gradient(135deg, ${DARK} 0%, #1a2f6e 60%, #0d2257 100%)`, borderRadius: 24, padding: 32, color: "white", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, background: `${BLUE}20`, borderRadius: "50%", filter: "blur(40px)" }} />
              <div style={{ display: "flex", alignItems: "flex-start", gap: 24, position: "relative" }}>
                {/* Avatar */}
                <div style={{ flexShrink: 0 }}>
                  <div style={{ width: 88, height: 88, borderRadius: 22, overflow: "hidden", border: `2px solid ${BLUE}60`, boxShadow: `0 0 32px ${BLUE}40`, background: `linear-gradient(135deg, ${DARK}, #1a2f6e)` }}>
                    <img src="/agents/noah.png" alt="Noah" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { (e.target as HTMLImageElement).style.display="none"; (e.target as HTMLImageElement).parentElement!.innerHTML="<div style=\"display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:42px\">🤖</div>"; }} />
                  </div>
                  <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
                    <div style={{ width: 7, height: 7, background: GREEN, borderRadius: "50%", boxShadow: `0 0 6px ${GREEN}` }} />
                    <span style={{ fontSize: 10, color: GREEN, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Online</span>
                  </div>
                </div>
                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                    <h2 style={{ margin: 0, fontWeight: 900, fontSize: 28, letterSpacing: "-0.5px" }}>Noah</h2>
                    <span style={{ background: `${BLUE}30`, border: `1px solid ${BLUE}50`, borderRadius: 8, padding: "3px 10px", fontSize: 11, fontWeight: 700, color: BLUE }}>ZeniPay Finance Agent</span>
                  </div>
                  <p style={{ margin: "0 0 16px", opacity: 0.7, fontSize: 14 }}>ZeniPay financial intelligence. Monitors all payments, detects fraud, distributes commissions to agents and influencers, and generates financial reports in real-time.</p>
                  {/* Feature Chips */}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {["🛡️ Fraud Detection", "📊 Revenue Analytics", "💸 Commission Engine", "⚡ Payment Monitor", "📄 Auto Reports", "🔮 Payout AI"].map(f => (
                      <span key={f} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "4px 10px", fontSize: 11, fontWeight: 600 }}>{f}</span>
                    ))}
                  </div>
                </div>
                {/* Stats */}
                <div style={{ display: "grid", gap: 8, flexShrink: 0 }}>
                  {[
                    { label: "Transactions Monitored", value: "2,847" },
                    { label: "Platform Balance", value: "$475k" },
                    { label: "Success Rate", value: "94.2%" },
                    { label: "Uptime", value: "99.9%" },
                  ].map(s => (
                    <div key={s.label} style={{ background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "8px 14px", textAlign: "center" }}>
                      <p style={{ margin: "0 0 2px", fontSize: 18, fontWeight: 900, color: "white" }}>{s.value}</p>
                      <p style={{ margin: 0, fontSize: 9, opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Capabilities Row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10, marginTop: 24, position: "relative" }}>
                {[
                  { icon: "🛡️", title: "Fraud Detection", desc: "Real-time anomaly detection" },
                  { icon: "📊", title: "Revenue Analytics", desc: "Margin & commission tracking" },
                  { icon: "⚡", title: "Payment Monitor", desc: "Failures, retries, disputes" },
                  { icon: "📄", title: "Auto Reports", desc: "Monthly financial summaries" },
                  { icon: "💸", title: "Payout Engine", desc: "Agent & influencer payouts" },
                ].map(f => (
                  <div key={f.icon} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "14px 12px", textAlign: "center" }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>{f.icon}</div>
                    <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 12 }}>{f.title}</p>
                    <p style={{ margin: 0, fontSize: 10, opacity: 0.5 }}>{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CHAT + LIVE LOG */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* Chat Interface */}
              <div style={{ background: "white", borderRadius: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column" }}>
                <div style={{ background: `linear-gradient(135deg, ${DARK}, #1a2f6e)`, borderRadius: "20px 20px 0 0", padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, overflow: "hidden", border: `1px solid ${BLUE}60`, background: DARK }}>
                    <img src="/agents/noah.png" alt="Noah" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, color: "white", fontWeight: 700, fontSize: 14 }}>Noah · ZeniPay AI</p>
                    <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Financial Intelligence Agent</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, background: `${GREEN}22`, borderRadius: 6, padding: "4px 10px" }}>
                    <div style={{ width: 6, height: 6, background: GREEN, borderRadius: "50%", animation: "pulse 1.5s infinite" }} />
                    <span style={{ fontSize: 10, color: GREEN, fontWeight: 700 }}>Monitoring</span>
                  </div>
                </div>
                <div style={{ flex: 1, padding: 16, overflowY: "auto", maxHeight: 380, display: "flex", flexDirection: "column", gap: 10 }}>
                  {noahChat.map((m, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", gap: 8, alignItems: "flex-end" }}>
                      {m.role === "noah" && <div style={{ width: 28, height: 28, borderRadius: 8, overflow: "hidden", border: `1px solid ${BLUE}30`, flexShrink: 0 }}>
                      <img src="/agents/noah.png" alt="Noah" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>}
                      <div style={{
                        background: m.role === "user" ? `linear-gradient(135deg, ${BLUE}, ${DARK})` : "#f0f4ff",
                        color: m.role === "user" ? "white" : "#0f172a",
                        borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                        padding: "10px 14px", maxWidth: "78%", fontSize: 13, whiteSpace: "pre-wrap", lineHeight: 1.6,
                        boxShadow: m.role === "user" ? `0 2px 8px ${BLUE}30` : "none",
                      }}>{m.text}</div>
                    </div>
                  ))}
                  {aiLoading && (
                    <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                      <div style={{ width: 28, height: 28, background: `${BLUE}20`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🤖</div>
                      <div style={{ background: "#f0f4ff", borderRadius: "16px 16px 16px 4px", padding: "12px 16px" }}>
                        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                          {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, background: BLUE, borderRadius: "50%", opacity: 0.6, animation: `bounce 1s ${i*0.2}s infinite` }} />)}
                        </div>
                        <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ padding: "0 16px 8px", display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {["💰 Revenue du jour", "🛡️ Fraud check", "💸 Payout status", "📊 Rapport mensuel"].map(s => (
                    <button key={s} onClick={() => setNoahMsg(s.replace(/^[^ ]+ /, ""))}
                      style={{ background: "#f0f4ff", color: BLUE, border: "1px solid #dbeafe", borderRadius: 8, padding: "5px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>{s}</button>
                  ))}
                </div>
                <div style={{ padding: "0 16px 16px", display: "flex", gap: 8 }}>
                  <input value={noahMsg} onChange={e => setNoahMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && handleNoahSend()}
                    placeholder="Ask Noah: revenue, fraud, payout, rapport…"
                    style={{ flex: 1, border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "11px 14px", fontSize: 13, outline: "none", background: "#fafbff" }} />
                  <button onClick={handleNoahSend} style={{ background: `linear-gradient(135deg, ${BLUE}, ${DARK})`, color: "white", border: "none", borderRadius: 12, padding: "11px 20px", fontWeight: 800, cursor: "pointer", fontSize: 14 }}>↑</button>
                </div>
              </div>

              {/* Live Activity Log */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ background: "white", borderRadius: 20, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <h3 style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>⚡ Noah Live Activity</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: GREEN, fontWeight: 600 }}>
                      <div style={{ width: 6, height: 6, background: GREEN, borderRadius: "50%", animation: "pulse 1.5s infinite" }} /> Real-time
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {liveActivity.map(a => (
                      <div key={a.id} style={{ background: a.type === "alert" ? "#fff1f2" : "#f0fdf4", borderRadius: 10, padding: "10px 14px", borderLeft: `3px solid ${a.type === "alert" ? RED : GREEN}` }}>
                        <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 600, color: a.type === "alert" ? RED : "#065f46" }}>{a.text}</p>
                        <p style={{ margin: 0, fontSize: 10, color: "#94a3b8" }}>{a.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Quick Actions */}
                <div style={{ background: "white", borderRadius: 20, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
                  <h3 style={{ margin: "0 0 12px", fontWeight: 700, fontSize: 14 }}>⚡ Quick Actions</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {[
                      { label: "📊 Generate Report", color: BLUE },
                      { label: "💸 Trigger Payouts", color: GREEN },
                      { label: "🛡️ Fraud Scan", color: PURPLE },
                      { label: "📧 Email Summary", color: GOLD },
                    ].map(a => (
                      <button key={a.label} onClick={() => setNoahMsg(a.label.replace(/^[^ ]+ /, ""))}
                        style={{ background: `${a.color}15`, color: a.color, border: `1px solid ${a.color}30`, borderRadius: 10, padding: "10px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════ ACCOUNTING ════ */}
        {tab === "accounting" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Header */}
            <div style={{ background: `linear-gradient(135deg, ${DARK}, #1a2f6e)`, borderRadius: 20, padding: 28, color: "white" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h2 style={{ margin: "0 0 6px", fontWeight: 900, fontSize: 24 }}>📚 ZeniPay Accounting</h2>
                  <p style={{ margin: 0, opacity: 0.6, fontSize: 14 }}>Automatic bookkeeping · Real-time P&L · Tax-ready reports</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {["📥 Import", "📤 Export", "🖨️ Print"].map(btn => (
                    <button key={btn} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 9999, padding: "8px 14px", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{btn}</button>
                  ))}
                </div>
              </div>
              {/* Fiscal summary */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginTop: 20 }}>
                {[
                  { label: "Gross Revenue", value: "$0", sub: "FY 2025-2026", color: GREEN },
                  { label: "Total Expenses", value: "$0", sub: "Operating costs", color: RED },
                  { label: "Net Income", value: "$0", sub: "Before tax", color: GOLD },
                  { label: "Tax Provision", value: "$0", sub: "Est. 15% corp tax", color: "#94a3b8" },
                ].map(s => (
                  <div key={s.label} style={{ background: "rgba(255,255,255,0.08)", borderRadius: 12, padding: "14px 16px" }}>
                    <p style={{ margin: "0 0 4px", fontSize: 10, opacity: 0.6, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>{s.label}</p>
                    <p style={{ margin: "0 0 2px", fontWeight: 900, fontSize: 20, color: s.color }}>{s.value}</p>
                    <p style={{ margin: 0, fontSize: 10, opacity: 0.5 }}>{s.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* P&L + Balance Sheet side by side */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* P&L Statement */}
              <div style={{ background: "white", borderRadius: 20, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                  <h3 style={{ margin: 0, fontWeight: 800, fontSize: 16 }}>📊 Profit & Loss</h3>
                  <select style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "4px 10px", fontSize: 12 }}>
                    <option>Q1 2026</option><option>Q4 2025</option><option>Annual 2025</option>
                  </select>
                </div>
                {[
                  { label: "Travel Bookings Revenue", amount: 1_284_000, type: "income" },
                  { label: "ZeniStay Revenue", amount: 187_400, type: "income" },
                  { label: "Agent Commissions (in)", amount: 142_800, type: "income" },
                  { label: "ZeniYacht Revenue", amount: 278_200, type: "income" },
                  { label: "TOTAL REVENUE", amount: 1_892_400, type: "total-income" },
                  { label: "Supplier Payouts", amount: -848_200, type: "expense" },
                  { label: "Agent Commissions (out)", amount: -47_200, type: "expense" },
                  { label: "Influencer Payouts", amount: -18_400, type: "expense" },
                  { label: "Tech Infrastructure", amount: -22_400, type: "expense" },
                  { label: "Marketing", amount: -12_000, type: "expense" },
                  { label: "TOTAL EXPENSES", amount: -948_200, type: "total-expense" },
                  { label: "NET INCOME", amount: 944_200, type: "net" },
                ].map((row, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "9px 12px", borderRadius: 8,
                    background: row.type === "total-income" ? "#f0fdf4" : row.type === "total-expense" ? "#fff1f2" : row.type === "net" ? `${BLUE}10` : "transparent",
                    marginBottom: 2,
                    borderTop: (row.type === "total-income" || row.type === "total-expense" || row.type === "net") ? "2px solid #e2e8f0" : "none",
                  }}>
                    <span style={{ fontSize: 13, fontWeight: (row.type.startsWith("total") || row.type === "net") ? 800 : 500, color: "#374151" }}>{row.label}</span>
                    <span style={{ fontWeight: 800, fontSize: 13, color: row.amount > 0 ? GREEN : row.amount < 0 ? RED : BLUE }}>
                      {row.amount > 0 ? "+" : ""}{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(row.amount)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Balance Sheet */}
              <div style={{ background: "white", borderRadius: 20, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
                <h3 style={{ margin: "0 0 18px", fontWeight: 800, fontSize: 16 }}>🏛️ Balance Sheet</h3>
                <div style={{ marginBottom: 16 }}>
                  <p style={{ margin: "0 0 10px", fontWeight: 700, fontSize: 12, color: "#64748b", textTransform: "uppercase" as const }}>Assets</p>
                  {[
                    { label: "ZeniPay Platform Wallet", value: 94_302 },
                    { label: "Agent Wallets", value: 47_230 },
                    { label: "Supplier Wallets", value: 281_400 },
                    { label: "Accounts Receivable", value: 182_000 },
                    { label: "Cash & Equivalents", value: 94_302 },
                  ].map(a => (
                    <div key={a.label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", fontSize: 13 }}>
                      <span style={{ color: "#374151" }}>{a.label}</span>
                      <span style={{ fontWeight: 700, color: GREEN }}>${(a.value/1000).toFixed(0)}k</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 10px", background: "#f0fdf4", borderRadius: 8, fontWeight: 800, fontSize: 13, marginTop: 4 }}>
                    <span>TOTAL ASSETS</span><span style={{ color: GREEN }}>$699k</span>
                  </div>
                </div>
                <div>
                  <p style={{ margin: "0 0 10px", fontWeight: 700, fontSize: 12, color: "#64748b", textTransform: "uppercase" as const }}>Liabilities & Equity</p>
                  {[
                    { label: "Pending Payouts", value: 89_200 },
                    { label: "Agent Pending", value: 18_900 },
                    { label: "Tax Provision", value: 141_630 },
                  ].map(l => (
                    <div key={l.label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", fontSize: 13 }}>
                      <span style={{ color: "#374151" }}>{l.label}</span>
                      <span style={{ fontWeight: 700, color: RED }}>-${(l.value/1000).toFixed(0)}k</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", fontSize: 13 }}>
                    <span style={{ color: "#374151" }}>Retained Earnings</span>
                    <span style={{ fontWeight: 700, color: BLUE }}>$449k</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 10px", background: "#eff6ff", borderRadius: 8, fontWeight: 800, fontSize: 13, marginTop: 4 }}>
                    <span>TOTAL L+E</span><span style={{ color: BLUE }}>$699k</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart of Accounts + Journal Entries */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* Chart of Accounts */}
              <div style={{ background: "white", borderRadius: 20, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ margin: 0, fontWeight: 800, fontSize: 15 }}>📋 Chart of Accounts</h3>
                  <button style={{ background: BLUE, color: "white", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>+ New Account</button>
                </div>
                {[
                  { code: "1000", name: "Cash & ZeniPay Wallets", type: "Asset", balance: 699_000 },
                  { code: "1200", name: "Accounts Receivable", type: "Asset", balance: 182_000 },
                  { code: "2000", name: "Accounts Payable", type: "Liability", balance: -89_200 },
                  { code: "2500", name: "Tax Payable", type: "Liability", balance: -141_630 },
                  { code: "3000", name: "Retained Earnings", type: "Equity", balance: 449_000 },
                  { code: "4000", name: "Travel Revenue", type: "Income", balance: 1_892_400 },
                  { code: "5000", name: "Supplier Costs (COGS)", type: "Expense", balance: -848_200 },
                  { code: "6000", name: "Commission Expense", type: "Expense", balance: -65_600 },
                  { code: "7000", name: "Operating Expenses", type: "Expense", balance: -34_400 },
                ].map(a => (
                  <div key={a.code} style={{ display: "flex", alignItems: "center", padding: "7px 10px", borderRadius: 8, marginBottom: 2, cursor: "pointer" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#f8fafc"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                    <span style={{ fontSize: 11, color: "#94a3b8", width: 36, fontFamily: "monospace" }}>{a.code}</span>
                    <span style={{ flex: 1, fontSize: 12, color: "#374151" }}>{a.name}</span>
                    <span style={{ fontSize: 10, color: "#94a3b8", marginRight: 8 }}>{a.type}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: a.balance > 0 ? GREEN : RED }}>{a.balance > 0 ? "+" : ""}{(a.balance/1000).toFixed(0)}k</span>
                  </div>
                ))}
              </div>

              {/* Journal Entries */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ background: "white", borderRadius: 20, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <h3 style={{ margin: 0, fontWeight: 800, fontSize: 15 }}>📝 Recent Journal Entries</h3>
                    <button style={{ background: BLUE, color: "white", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>+ New Entry</button>
                  </div>
                  {[
                    { date: "Mar 1", ref: "JE-0042", desc: "ZeniStay AIKA booking - client payment", dr: "Cash 7,677", cr: "Revenue 7,677", status: "Posted" },
                    { date: "Feb 28", ref: "JE-0041", desc: "Agent commission payout - Noah Martin", dr: "Commission Exp 799", cr: "Cash 799", status: "Posted" },
                    { date: "Feb 28", ref: "JE-0040", desc: "Supplier payout - ZeniYacht booking", dr: "COGS 4,200", cr: "AP 4,200", status: "Posted" },
                    { date: "Feb 27", ref: "JE-0039", desc: "Influencer referral commission", dr: "Inf. Exp 150", cr: "Cash 150", status: "Posted" },
                  ].map((je, i) => (
                    <div key={i} style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: 10, marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: BLUE }}>{je.ref}</span>
                        <span style={{ fontSize: 10, background: "#dcfce7", color: "#065f46", borderRadius: 6, padding: "2px 7px", fontWeight: 700 }}>{je.status}</span>
                      </div>
                      <p style={{ margin: "0 0 4px", fontSize: 12, color: "#374151" }}>{je.desc}</p>
                      <div style={{ display: "flex", gap: 12, fontSize: 11, color: "#94a3b8" }}>
                        <span>DR: {je.dr}</span><span>CR: {je.cr}</span><span>{je.date}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tax Summary */}
                <div style={{ background: `linear-gradient(135deg, ${DARK}, #1a2f6e)`, borderRadius: 20, padding: 20, color: "white" }}>
                  <h4 style={{ margin: "0 0 14px", fontWeight: 800 }}>🧾 Tax Summary</h4>
                  {[
                    { label: "Gross Revenue", v: "$0" },
                    { label: "Total Deductions", v: "-$948,200" },
                    { label: "Net Taxable Income", v: "$0" },
                    { label: "Corp Tax Rate (est.)", v: "15%" },
                    { label: "Tax Provision", v: "$0" },
                  ].map(t => (
                    <div key={t.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
                      <span style={{ opacity: 0.6 }}>{t.label}</span>
                      <span style={{ fontWeight: 700, color: GOLD }}>{t.v}</span>
                    </div>
                  ))}
                  <button style={{ width: "100%", background: GOLD, color: DARK, border: "none", borderRadius: 9999, padding: "10px", fontWeight: 800, fontSize: 13, cursor: "pointer", marginTop: 8 }}>
                    📥 Download Tax Report (PDF)
                  </button>
                </div>
              </div>
            </div>

            {/* Reports */}
            <div style={{ background: "white", borderRadius: 20, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontWeight: 800, fontSize: 16 }}>📄 Financial Reports</h3>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>Auto-generated by ZeniPay AI</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
                {[
                  { icon: "📊", title: "Income Statement", desc: "Revenue, expenses, profit", color: BLUE },
                  { icon: "🏛️", title: "Balance Sheet", desc: "Assets, liabilities, equity", color: PURPLE },
                  { icon: "💸", title: "Cash Flow", desc: "Operating, investing, financing", color: GREEN },
                  { icon: "🧾", title: "Tax Return Prep", desc: "Delaware corp filing ready", color: GOLD },
                  { icon: "👤", title: "Agent Payroll Report", desc: "Commissions & 1099s", color: "#ec4899" },
                  { icon: "📦", title: "COGS Report", desc: "Supplier costs by booking", color: RED },
                  { icon: "📈", title: "Revenue by Channel", desc: "Hotel, Yacht, Flights, Stay", color: BLUE },
                  { icon: "🌍", title: "Multi-Currency Report", desc: "CAD/USD/EUR reconciliation", color: DARK },
                ].map(r => (
                  <button key={r.title} style={{ background: `${r.color}10`, border: `1px solid ${r.color}25`, borderRadius: 14, padding: "16px 14px", cursor: "pointer", textAlign: "left" as const }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>{r.icon}</div>
                    <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 13, color: DARK }}>{r.title}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>{r.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════ SETTINGS ════ */}
        {tab === "settings" && (
          <div style={{ display: "grid", gap: 16 }}>
            {[
              { title: "🏦 Payment Gateway", items: [
                { label: "Primary Gateway", value: "Authorize.net", status: "sandbox" },
                { label: "API Login ID", value: "●●●●●●●●●●●●", status: null },
                { label: "Environment", value: "Sandbox · Test Mode", status: "pending" },
                { label: "Production", value: "Pending merchant account approval", status: "pending" },
              ]},
              { title: "💸 Commission Structure", items: [
                { label: "Agent Commission", value: "10.4% of booking total", status: null },
                { label: "Influencer Referral", value: "1.95% of booking total", status: null },
                { label: "Platform Margin", value: "2.96% of booking total", status: null },
                { label: "Supplier Payout", value: "84.7% of booking total (remainder)", status: null },
              ]},
              { title: "🔒 Security & Compliance", items: [
                { label: "PCI Compliance", value: "SAQ-A (card tokenization via Accept.js)", status: "active" },
                { label: "Card Storage", value: "Never stored — processor tokens only", status: "active" },
                { label: "Encryption", value: "TLS 1.3 · AES-256", status: "active" },
                { label: "Fraud Detection", value: "Noah AI · Real-time monitoring", status: "active" },
              ]},
            ].map(section => (
              <div key={section.title} style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
                <h3 style={{ margin: "0 0 16px", fontWeight: 700 }}>{section.title}</h3>
                <div style={{ display: "grid", gap: 10 }}>
                  {section.items.map(item => (
                    <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
                      <span style={{ fontSize: 13, color: "#374151" }}>{item.label}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{item.value}</span>
                        {item.status && <StatusBadge status={item.status} />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
