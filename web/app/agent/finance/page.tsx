"use client";
import { useState, useEffect, useCallback } from "react";

const BLUE = "#0F6CF5", DARK = "#0B1B4D", GREEN = "#10b981", RED = "#ef4444", AMBER = "#f59e0b", PURPLE = "#8b5cf6", TEAL = "#14b8a6";

const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
const fmtD = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);
function timeAgo(iso: string) {
  const d = Date.now() - new Date(iso).getTime();
  if (d < 60000) return `${Math.floor(d/1000)}s ago`;
  if (d < 3600000) return `${Math.floor(d/60000)}m ago`;
  if (d < 86400000) return `${Math.floor(d/3600000)}h ago`;
  return `${Math.floor(d/86400000)}d ago`;
}

type TxStatus = "completed"|"pending"|"failed"|"refunded"|"disputed";
type Tab = "overview"|"transactions"|"payments"|"links"|"invoices"|"refunds"|"payouts"|"agents"|"influencers"|"financing"|"analytics"|"settings";

const STATUS_CFG: Record<TxStatus, { label: string; bg: string; color: string }> = {
  completed: { label: "Completed", bg: "#d1fae5", color: "#065f46" },
  pending: { label: "Pending", bg: "#fef3c7", color: "#92400e" },
  failed: { label: "Failed", bg: "#fee2e2", color: "#991b1b" },
  refunded: { label: "Refunded", bg: "#ede9fe", color: "#4c1d95" },
  disputed: { label: "Disputed", bg: "#fce7f3", color: "#9d174d" },
};
const STATUS_ICON: Record<TxStatus, string> = { completed: "✅", pending: "⏳", failed: "❌", refunded: "↩️", disputed: "⚠️" };

interface Tx { id: string; customerName: string; amount: number; currency: string; status: TxStatus; paymentMethod: string; gateway: string; bookingRef?: string; createdAt: string; }
interface Stats { totalRevenue: number; netRevenue: number; pendingPayments: number; successfulPayments: number; failedPayments: number; refunds: number; agentCommissions: number; platformMargin: number; revenueChange: number; transactionCount: number; }

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: "overview", icon: "📊", label: "Overview" },
  { id: "transactions", icon: "💳", label: "Transactions" },
  { id: "payments", icon: "💰", label: "Payments" },
  { id: "links", icon: "🔗", label: "Pay Links" },
  { id: "invoices", icon: "🧾", label: "Invoices" },
  { id: "refunds", icon: "↩️", label: "Refunds" },
  { id: "payouts", icon: "🏦", label: "Payouts" },
  { id: "agents", icon: "👤", label: "Agents" },
  { id: "influencers", icon: "⭐", label: "Influencers" },
  { id: "financing", icon: "📅", label: "Financing" },
  { id: "analytics", icon: "📈", label: "Analytics" },
  { id: "settings", icon: "⚙️", label: "Settings" },
];

export default function ZeniPayDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [live, setLive] = useState(true);
  const [linkForm, setLinkForm] = useState({ amount: "", description: "", customerName: "", customerEmail: "" });
  const [createdLink, setCreatedLink] = useState<{url:string;amount:string}|null>(null);
  const [linkLoading, setLinkLoading] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [sr, tr] = await Promise.all([fetch("/api/zenipay/stats"), fetch("/api/zenipay/transactions")]);
      const sd = await sr.json(); const td = await tr.json();
      setStats(sd.stats); setTxs(td.transactions || []);
    } catch { /**/ }
  }, []);

  useEffect(() => { fetchData(); const iv = setInterval(() => { if (live) fetchData(); }, 30000); return () => clearInterval(iv); }, [fetchData, live]);

  const filtered = txs.filter(t => {
    const ms = !search || t.customerName.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase()) || (t.bookingRef||"").includes(search);
    const mst = filterStatus === "all" || t.status === filterStatus;
    return ms && mst;
  });

  async function createLink() {
    setLinkLoading(true);
    try {
      const r = await fetch("/api/zenipay/create-link", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...linkForm, amount: parseFloat(linkForm.amount), currency: "USD" }) });
      const d = await r.json();
      setCreatedLink({ url: d.url, amount: fmtD(d.amount) });
    } catch { /**/ }
    setLinkLoading(false);
  }

  async function askAI() {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    // Simulate AI response (replace with real VPS endpoint)
    await new Promise(r => setTimeout(r, 1200));
    const responses: Record<string, string> = {
      revenue: `💵 Total platform revenue this period: ${fmt(stats?.totalRevenue||0)}. Net revenue after fees: ${fmt(stats?.netRevenue||0)}. Growth: +${stats?.revenueChange||0}% vs last period.`,
      failed: `⚠️ ${stats?.failedPayments ? fmt(stats.failedPayments) : 0} in failed payments detected. Primary causes: insufficient funds, expired cards. Recommend: automated retry flow for failed transactions.`,
      commission: `🤝 Agent commissions: ${fmt(stats?.agentCommissions||0)} (10% of net revenue). Platform margin: ${fmt(stats?.platformMargin||0)} (20% of revenue).`,
    };
    const key = Object.keys(responses).find(k => aiQuery.toLowerCase().includes(k)) || "revenue";
    setAiResponse(responses[key] || `📊 Analyzing your financial data... Revenue: ${fmt(stats?.totalRevenue||0)}, ${stats?.transactionCount||0} transactions this period.`);
    setAiLoading(false);
  }

  const agents = [
    { name: "Marie Laurent", flag: "🇫🇷", bookings: 34, revenue: 142450, commission: 14245, pending: 3890, paid: 10355, rate: "10%", status: "Active" },
    { name: "James Park", flag: "🇺🇸", bookings: 28, revenue: 89200, commission: 8920, pending: 2450, paid: 6470, rate: "10%", status: "Active" },
    { name: "Sofia Mendez", flag: "🇲🇽", bookings: 41, revenue: 156700, commission: 15670, pending: 4200, paid: 11470, rate: "10%", status: "Active" },
  ];
  const influencers = [
    { name: "@lina.travel", platform: "TikTok", followers: "124K", referrals: 18, revenue: 76400, commission: 3820, rate: "5%", pending: 1200, paid: 2620 },
    { name: "@zenivastyle", platform: "Instagram", followers: "89K", referrals: 11, revenue: 44100, commission: 2205, rate: "5%", pending: 800, paid: 1405 },
  ];
  const financedTrips = [
    { client: "John Smith", trip: "Rome + Amalfi", total: 4200, paid: 1260, remaining: 2940, installments: 3, nextDue: "Jun 15, 2025", status: "On track" },
    { client: "Emily Davis", trip: "Bali 10 days", total: 3800, paid: 950, remaining: 2850, installments: 4, nextDue: "Jun 22, 2025", status: "On track" },
    { client: "Carlos Vega", trip: "Japan Explorer", total: 5600, paid: 0, remaining: 5600, installments: 5, nextDue: "Jun 1, 2025", status: "Overdue" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "system-ui,sans-serif" }}>
      {/* HEADER */}
      <div style={{ background: `linear-gradient(135deg, ${DARK} 0%, #1e3a8a 100%)`, padding: "20px 24px 0", color: "white" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, paddingBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, background: BLUE, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>💳</div>
              <div>
                <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>ZeniPay</h1>
                <p style={{ margin: 0, fontSize: 11, opacity: 0.65 }}>Financial Infrastructure · Zeniva Travel</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.12)", borderRadius: 20, padding: "5px 12px", fontSize: 12 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: live ? GREEN : "#94a3b8", display: "inline-block" }} />
                {live ? "Live" : "Paused"}
              </div>
              <button onClick={() => setLive(v => !v)} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "white", borderRadius: 8, padding: "6px 14px", fontSize: 12, cursor: "pointer" }}>{live ? "⏸" : "▶"}</button>
            </div>
          </div>
          {/* NAV TABS */}
          <div style={{ display: "flex", gap: 2, overflowX: "auto", paddingBottom: 0 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                background: tab === t.id ? "white" : "transparent", color: tab === t.id ? DARK : "rgba(255,255,255,0.75)",
                border: "none", borderRadius: "8px 8px 0 0", padding: "8px 14px", fontSize: 12, fontWeight: tab === t.id ? 700 : 400,
                cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s",
              }}>
                {t.icon} <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "20px 16px" }}>

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))", gap: 12, marginBottom: 20 }}>
              {[
                { l: "Total Revenue", v: fmt(stats?.totalRevenue||0), sub: `+${stats?.revenueChange||0}% vs last month`, c: BLUE, i: "💵" },
                { l: "Net Revenue", v: fmt(stats?.netRevenue||0), sub: "After fees & refunds", c: GREEN, i: "✅" },
                { l: "Pending", v: fmt(stats?.pendingPayments||0), sub: "Awaiting capture", c: AMBER, i: "⏳" },
                { l: "Successful", v: fmt(stats?.successfulPayments||0), sub: "Captured payments", c: GREEN, i: "✔" },
                { l: "Failed", v: fmt(stats?.failedPayments||0), sub: "Needs attention", c: RED, i: "⚠️" },
                { l: "Refunds", v: fmt(stats?.refunds||0), sub: "Processed refunds", c: "#64748b", i: "↩️" },
                { l: "Agent Commissions", v: fmt(stats?.agentCommissions||0), sub: "10% of net revenue", c: PURPLE, i: "🤝" },
                { l: "Influencer Commissions", v: fmt(5205), sub: "5% referral revenue", c: TEAL, i: "⭐" },
                { l: "Platform Margin", v: fmt(stats?.platformMargin||0), sub: "Zeniva 20% take", c: DARK, i: "🏢" },
                { l: "Transactions", v: String(stats?.transactionCount||0), sub: "This period", c: "#0ea5e9", i: "📋" },
              ].map(c => (
                <div key={c.l} style={{ background: "white", borderRadius: 12, padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", borderTop: `3px solid ${c.c}` }}>
                  <p style={{ margin: "0 0 4px", fontSize: 10, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>{c.l}</p>
                  <p style={{ margin: "0 0 2px", fontSize: 20, fontWeight: 800, color: "#0f172a" }}>{stats ? c.v : "—"}</p>
                  <p style={{ margin: 0, fontSize: 10, color: "#94a3b8" }}>{c.sub}</p>
                  <span style={{ fontSize: 18 }}>{c.i}</span>
                </div>
              ))}
            </div>
            {/* LIVE FEED */}
            <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <span style={{ width: 8, height: 8, background: GREEN, borderRadius: "50%", display: "inline-block" }} />
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>Live Payment Activity</h3>
              </div>
              {txs.slice(0,6).map(tx => {
                const cfg = STATUS_CFG[tx.status];
                return (
                  <div key={tx.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f1f5f9", flexWrap: "wrap", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 20 }}>{STATUS_ICON[tx.status]}</span>
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 13 }}>{fmtD(tx.amount)} {tx.status === "completed" ? "received" : tx.status}</p>
                        <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>{tx.bookingRef && `Booking ${tx.bookingRef} · `}{tx.customerName} · {tx.paymentMethod}</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: cfg.bg, color: cfg.color, fontWeight: 600 }}>{cfg.label}</span>
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>{timeAgo(tx.createdAt)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* ZENIPAY AI */}
            <div style={{ background: `linear-gradient(135deg, ${DARK}, #1e3a8a)`, borderRadius: 12, padding: 20, color: "white" }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700 }}>🤖 ZeniPay AI — Financial Intelligence</h3>
              <div style={{ display: "flex", gap: 8 }}>
                <input value={aiQuery} onChange={e => setAiQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && askAI()} placeholder="Ask: revenue, failed payments, commissions…" style={{ flex: 1, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, padding: "9px 14px", color: "white", fontSize: 13, outline: "none" }} />
                <button onClick={askAI} disabled={aiLoading} style={{ background: BLUE, border: "none", color: "white", borderRadius: 8, padding: "9px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{aiLoading ? "…" : "Ask"}</button>
              </div>
              {aiResponse && <p style={{ margin: "12px 0 0", fontSize: 13, opacity: 0.9, lineHeight: 1.6, background: "rgba(255,255,255,0.08)", borderRadius: 8, padding: 12 }}>{aiResponse}</p>}
            </div>
          </>
        )}

        {/* ── TRANSACTIONS ── */}
        {tab === "transactions" && (
          <div style={{ background: "white", borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>All Transactions</h3>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search…" style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "7px 12px", fontSize: 13, outline: "none", minWidth: 180 }} />
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "7px 12px", fontSize: 13, background: "white" }}>
                  {["all","completed","pending","failed","refunded","disputed"].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                </select>
                <button onClick={() => {
                  const csv = ["ID,Customer,Amount,Currency,Status,Method,Gateway,Booking,Date",...filtered.map(t=>`${t.id},${t.customerName},${t.amount},${t.currency},${t.status},${t.paymentMethod},${t.gateway},${t.bookingRef||""},${t.createdAt}`)].join("\n");
                  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv],{type:"text/csv"})); a.download = "zenipay-txs.csv"; a.click();
                }} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "7px 14px", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>⬇ CSV</button>
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead><tr style={{ background: "#f8fafc" }}>{["Transaction ID","Customer","Amount","Method","Gateway","Booking","Status","Date"].map(h=><th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>{h}</th>)}</tr></thead>
                <tbody>{filtered.map((tx,i)=>{const cfg=STATUS_CFG[tx.status]; return (<tr key={tx.id} style={{ borderTop: "1px solid #f1f5f9", background: i%2===0?"white":"#fafbfc" }}>
                  <td style={{ padding: "11px 14px", fontWeight: 700, color: BLUE, whiteSpace: "nowrap" }}>{tx.id}</td>
                  <td style={{ padding: "11px 14px" }}>{tx.customerName}</td>
                  <td style={{ padding: "11px 14px", fontWeight: 700, whiteSpace: "nowrap" }}>{fmtD(tx.amount)}</td>
                  <td style={{ padding: "11px 14px", color: "#64748b", fontSize: 12, whiteSpace: "nowrap" }}>{tx.paymentMethod}</td>
                  <td style={{ padding: "11px 14px", color: "#64748b" }}>{tx.gateway}</td>
                  <td style={{ padding: "11px 14px", color: "#64748b" }}>{tx.bookingRef||"—"}</td>
                  <td style={{ padding: "11px 14px" }}><span style={{ padding: "3px 10px", borderRadius: 20, background: cfg.bg, color: cfg.color, fontSize: 11, fontWeight: 600 }}>{cfg.label}</span></td>
                  <td style={{ padding: "11px 14px", color: "#94a3b8", fontSize: 12, whiteSpace: "nowrap" }}>{timeAgo(tx.createdAt)}</td>
                </tr>);})}</tbody>
              </table>
              {filtered.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>No transactions found</div>}
            </div>
          </div>
        )}

        {/* ── PAYMENTS ── */}
        {tab === "payments" && (
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <div style={{ background: "white", borderRadius: 12, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700 }}>💰 Create Payment</h3>
              {[{ l: "Customer Name", k: "customerName", ph: "John Smith" },{ l: "Email", k: "customerEmail", ph: "john@example.com" },{ l: "Amount (USD)", k: "amount", ph: "2450.00", type: "number" },{ l: "Description", k: "description", ph: "Paris Trip Deposit" }].map(f => (
                <div key={f.k} style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>{f.l}</label>
                  <input type={(f as {type?:string}).type||"text"} value={(linkForm as Record<string,string>)[f.k]||""} onChange={e => setLinkForm(prev => ({...prev,[f.k]:e.target.value}))} placeholder={f.ph} style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 14px", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                </div>
              ))}
              <a href="/payment?type=custom" style={{ display: "block", background: BLUE, color: "white", textAlign: "center", borderRadius: 9999, padding: "12px", fontSize: 15, fontWeight: 800, textDecoration: "none", marginTop: 8 }}>
                💳 Proceed to Checkout
              </a>
              <p style={{ textAlign: "center", fontSize: 11, color: "#94a3b8", marginTop: 8 }}>🔒 Secured by ZeniPay · Helcim · PCI Compliant</p>
            </div>
          </div>
        )}

        {/* ── PAYMENT LINKS ── */}
        {tab === "links" && (
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            <div style={{ background: "white", borderRadius: 12, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700 }}>🔗 Payment Links</h3>
              {!createdLink ? (
                <div style={{ display: "grid", gap: 12 }}>
                  {[{ l: "Amount (USD)", k: "amount", ph: "2450.00", type: "number" },{ l: "Description", k: "description", ph: "Paris Trip Deposit" },{ l: "Client Name (optional)", k: "customerName", ph: "John Smith" },{ l: "Client Email (optional)", k: "customerEmail", ph: "john@email.com" }].map(f => (
                    <div key={f.k}>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5 }}>{f.l}</label>
                      <input type={(f as {type?:string}).type||"text"} value={(linkForm as Record<string,string>)[f.k]||""} onChange={e => setLinkForm(prev=>({...prev,[f.k]:e.target.value}))} placeholder={f.ph} style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 14px", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                    </div>
                  ))}
                  <button onClick={createLink} disabled={!linkForm.amount||linkLoading} style={{ background: linkForm.amount?BLUE:"#94a3b8", color: "white", border: "none", borderRadius: 9999, padding: "12px", fontSize: 14, fontWeight: 700, cursor: "pointer", marginTop: 4 }}>
                    {linkLoading ? "🔄 Generating…" : "🔗 Generate Payment Link"}
                  </button>
                </div>
              ) : (
                <div style={{ background: "#d1fae5", borderRadius: 12, padding: 20 }}>
                  <p style={{ margin: "0 0 12px", fontWeight: 700, color: "#065f46", fontSize: 15 }}>✅ Payment link created — {createdLink.amount}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: "white", borderRadius: 8, padding: "10px 14px" }}>
                    <code style={{ flex: 1, fontSize: 12, wordBreak: "break-all", color: "#0f172a" }}>{createdLink.url}</code>
                    <button onClick={() => navigator.clipboard.writeText(createdLink.url)} style={{ background: BLUE, color: "white", border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer" }}>Copy</button>
                  </div>
                  <button onClick={() => { setCreatedLink(null); setLinkForm({ amount:"",description:"",customerName:"",customerEmail:"" }); }} style={{ marginTop: 10, background: "transparent", border: "none", color: "#065f46", fontSize: 12, cursor: "pointer", textDecoration: "underline" }}>Create another</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── AGENTS ── */}
        {tab === "agents" && (
          <div style={{ background: "white", borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}><h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>👤 Agent Financial Profiles</h3></div>
            {agents.map((a, i) => (
              <div key={a.name} style={{ padding: "20px", borderBottom: i<agents.length-1?"1px solid #f1f5f9":"none" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 42, height: 42, borderRadius: "50%", background: `hsl(${i*80+200},70%,90%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{a.flag}</div>
                    <div><p style={{ margin:0, fontWeight:700, fontSize:15 }}>{a.name}</p><p style={{ margin:0, fontSize:12, color:"#64748b" }}>{a.bookings} bookings · Commission rate: {a.rate}</p></div>
                  </div>
                  <span style={{ background: "#d1fae5", color: "#065f46", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{a.status}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: 10, marginTop: 14 }}>
                  {[["Total Revenue", fmt(a.revenue), BLUE],["Commission", fmt(a.commission), PURPLE],["Pending Payout", fmt(a.pending), AMBER],["Paid Out", fmt(a.paid), GREEN]].map(([l,v,c]) => (
                    <div key={l as string} style={{ background: "#f8fafc", borderRadius: 8, padding: 12 }}>
                      <p style={{ margin:"0 0 2px", fontSize:10, color:"#64748b", fontWeight:600, textTransform:"uppercase" }}>{l}</p>
                      <p style={{ margin:0, fontSize:16, fontWeight:800, color:c as string }}>{v}</p>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button style={{ background: BLUE, color: "white", border: "none", borderRadius: 7, padding: "7px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>💸 Pay Now</button>
                  <button style={{ background: "#f1f5f9", border: "none", borderRadius: 7, padding: "7px 16px", fontSize: 12, cursor: "pointer" }}>📊 View History</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── INFLUENCERS ── */}
        {tab === "influencers" && (
          <div style={{ background: "white", borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}><h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>⭐ Influencer Financial Profiles</h3></div>
            {influencers.map((inf, i) => (
              <div key={inf.name} style={{ padding: 20, borderBottom: i<influencers.length-1?"1px solid #f1f5f9":"none" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <p style={{ margin:0, fontWeight:700, fontSize:15 }}>{inf.name}</p>
                    <p style={{ margin:0, fontSize:12, color:"#64748b" }}>{inf.platform} · {inf.followers} followers · {inf.referrals} referrals · Rate: {inf.rate}</p>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: 10, marginTop: 14 }}>
                  {[["Referral Revenue", fmt(inf.revenue), BLUE],["Commission (5%)", fmt(inf.commission), TEAL],["Pending", fmt(inf.pending), AMBER],["Paid Out", fmt(inf.paid), GREEN]].map(([l,v,c]) => (
                    <div key={l as string} style={{ background: "#f8fafc", borderRadius: 8, padding: 12 }}>
                      <p style={{ margin:"0 0 2px", fontSize:10, color:"#64748b", fontWeight:600, textTransform:"uppercase" }}>{l}</p>
                      <p style={{ margin:0, fontSize:16, fontWeight:800, color:c as string }}>{v}</p>
                    </div>
                  ))}
                </div>
                <button style={{ background: BLUE, color: "white", border: "none", borderRadius: 7, padding: "7px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer", marginTop: 12 }}>💸 Send Payout</button>
              </div>
            ))}
          </div>
        )}

        {/* ── FINANCING ── */}
        {tab === "financing" && (
          <div style={{ background: "white", borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>📅 Travel Financing</h3>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>Installment plans & deposits — pay over time</p>
            </div>
            {financedTrips.map((t, i) => (
              <div key={t.client} style={{ padding: 20, borderBottom: i<financedTrips.length-1?"1px solid #f1f5f9":"none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                  <div><p style={{ margin:0, fontWeight:700, fontSize:14 }}>{t.client}</p><p style={{ margin:0, fontSize:12, color:"#64748b" }}>{t.trip}</p></div>
                  <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: t.status==="Overdue"?"#fee2e2":"#d1fae5", color: t.status==="Overdue"?"#991b1b":"#065f46" }}>{t.status}</span>
                </div>
                <div style={{ background: "#f1f5f9", borderRadius: 8, height: 8, marginBottom: 10 }}>
                  <div style={{ background: t.status==="Overdue"?RED:BLUE, borderRadius: 8, height: 8, width: `${(t.paid/t.total)*100}%` }} />
                </div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 12, color: "#64748b" }}>
                  <span>Total: <b style={{ color:"#0f172a" }}>{fmt(t.total)}</b></span>
                  <span>Paid: <b style={{ color:GREEN }}>{fmt(t.paid)}</b></span>
                  <span>Remaining: <b style={{ color:t.status==="Overdue"?RED:AMBER }}>{fmt(t.remaining)}</b></span>
                  <span>Installments: <b>{t.installments}</b></span>
                  <span>Next due: <b style={{ color:t.status==="Overdue"?RED:"#0f172a" }}>{t.nextDue}</b></span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── ANALYTICS ── */}
        {tab === "analytics" && (
          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ background: "white", borderRadius: 12, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>📈 Revenue Over Time</h3>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 120 }}>
                {[45, 62, 38, 79, 55, 91, 68, 82, 47, 93, 71, 88].map((h, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ width: "100%", background: i === 11 ? BLUE : "#e0e7ff", borderRadius: "4px 4px 0 0", height: `${h}%`, minHeight: 4 }} />
                    <span style={{ fontSize: 9, color: "#94a3b8" }}>{["J","F","M","A","M","J","J","A","S","O","N","D"][i]}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                <h4 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700 }}>Payment Success Rate</h4>
                <div style={{ fontSize: 36, fontWeight: 800, color: GREEN }}>94.2%</div>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>↑ 2.1% vs last month</p>
              </div>
              <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                <h4 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700 }}>Avg Transaction</h4>
                <div style={{ fontSize: 36, fontWeight: 800, color: BLUE }}>{fmt((stats?.totalRevenue||47230)/(stats?.transactionCount||89))}</div>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>Per booking this period</p>
              </div>
            </div>
            <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <h4 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 700 }}>Revenue Distribution</h4>
              {[["Platform Revenue (20%)", 9430, BLUE],["Agent Commissions (10%)", 4723, PURPLE],["Influencer Commissions (5%)", 2362, TEAL],["Net to Zeniva", 24425, GREEN]].map(([l,v,c]) => (
                <div key={l as string} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ fontSize: 12, color: "#374151" }}>{l}</span><span style={{ fontSize: 12, fontWeight: 700 }}>{fmt(v as number)}</span></div>
                  <div style={{ background: "#f1f5f9", borderRadius: 4, height: 8 }}><div style={{ background: c as string, borderRadius: 4, height: 8, width: `${((v as number)/47230)*100}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SIMPLE STUBS FOR OTHER TABS */}
        {(tab === "invoices" || tab === "refunds" || tab === "payouts" || tab === "settings") && (
          <div style={{ background: "white", borderRadius: 12, padding: 40, textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>
              {tab === "invoices" ? "🧾" : tab === "refunds" ? "↩️" : tab === "payouts" ? "🏦" : "⚙️"}
            </div>
            <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
              {tab === "invoices" ? "Invoice Management" : tab === "refunds" ? "Refund Center" : tab === "payouts" ? "Payout Scheduler" : "ZeniPay Settings"}
            </h3>
            <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 20px" }}>
              {tab === "invoices" ? "Generate, send, and track client invoices — coming in v2.0" : 
               tab === "refunds" ? "Process refunds and manage disputes — coming in v2.0" :
               tab === "payouts" ? "Batch payouts to agents and influencers — coming in v2.0" :
               "Configure gateways, commission rates, currencies — coming in v2.0"}
            </p>
            <span style={{ background: "#e0e7ff", color: "#3730a3", padding: "6px 16px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>Coming v2.0</span>
          </div>
        )}
      </div>
    </div>
  );
}
