"use client";
import { useState, useEffect } from "react";

const BLUE = "#0F6CF5";
const DARK = "#0B1B4D";
const GREEN = "#10b981";
const RED = "#ef4444";
const AMBER = "#f59e0b";
const PURPLE = "#8b5cf6";

function fmt(n: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n); }
function fmtSmall(n: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n); }
function timeAgo(iso: string) {
  const d = Date.now() - new Date(iso).getTime();
  if (d < 60000) return `${Math.floor(d/1000)}s ago`;
  if (d < 3600000) return `${Math.floor(d/60000)}m ago`;
  if (d < 86400000) return `${Math.floor(d/3600000)}h ago`;
  return `${Math.floor(d/86400000)}d ago`;
}

type TxStatus = "completed" | "pending" | "failed" | "refunded";
interface Tx { id: string; customerName: string; amount: number; currency: string; status: TxStatus; paymentMethod: string; gateway: string; bookingRef?: string; createdAt: string; }
interface Stats { totalRevenue: number; netRevenue: number; pendingPayments: number; successfulPayments: number; failedPayments: number; refunds: number; agentCommissions: number; platformMargin: number; revenueChange: number; transactionCount: number; }

const statusConfig: Record<TxStatus, { label: string; bg: string; color: string; dot: string }> = {
  completed: { label: "Completed", bg: "#d1fae5", color: "#065f46", dot: GREEN },
  pending: { label: "Pending", bg: "#fef3c7", color: "#92400e", dot: AMBER },
  failed: { label: "Failed", bg: "#fee2e2", color: "#991b1b", dot: RED },
  refunded: { label: "Refunded", bg: "#ede9fe", color: "#4c1d95", dot: PURPLE },
};

export default function ZeniPayDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [tab, setTab] = useState<"overview" | "transactions" | "links" | "payouts">("overview");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showCreateLink, setShowCreateLink] = useState(false);
  const [linkForm, setLinkForm] = useState({ amount: "", description: "", customerName: "", customerEmail: "" });
  const [createdLink, setCreatedLink] = useState<{ url: string; amount: string } | null>(null);
  const [linkLoading, setLinkLoading] = useState(false);
  const [live, setLive] = useState(true);

  useEffect(() => {
    fetchData();
    const iv = setInterval(() => { if (live) fetchData(); }, 30000);
    return () => clearInterval(iv);
  }, [live]);

  async function fetchData() {
    try {
      const [sRes, tRes] = await Promise.all([
        fetch("/api/zenipay/stats"),
        fetch("/api/zenipay/transactions"),
      ]);
      const sd = await sRes.json();
      const td = await tRes.json();
      setStats(sd.stats);
      setTxs(td.transactions || []);
    } catch { /* silent */ }
  }

  async function createLink() {
    setLinkLoading(true);
    try {
      const res = await fetch("/api/zenipay/create-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...linkForm, amount: parseFloat(linkForm.amount), currency: "USD" }),
      });
      const data = await res.json();
      setCreatedLink({ url: data.url, amount: fmtSmall(data.amount) });
    } catch { /* silent */ }
    setLinkLoading(false);
  }

  const filteredTxs = txs.filter(t => {
    const matchSearch = !search || t.customerName.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase()) || (t.bookingRef || "").includes(search);
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const payouts = [
    { name: "Marie Laurent", earnings: 12450, commission: 1245, pending: 890, paid: 355 },
    { name: "James Park", earnings: 8920, commission: 892, pending: 450, paid: 442 },
    { name: "Sofia Mendez", earnings: 15670, commission: 1567, pending: 1200, paid: 367 },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "system-ui,sans-serif" }}>
      {/* HEADER */}
      <div style={{ background: `linear-gradient(135deg, ${DARK} 0%, #1e3a8a 100%)`, padding: "24px 32px", color: "white" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, background: BLUE, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>💳</div>
                <div>
                  <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px" }}>ZeniPay</h1>
                  <p style={{ margin: 0, fontSize: 11, opacity: 0.7 }}>Financial Infrastructure · Zeniva Travel</p>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.1)", borderRadius: 20, padding: "6px 14px", fontSize: 12 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: live ? GREEN : "#94a3b8", animation: live ? "pulse 2s infinite" : "none" }} />
                {live ? "Live" : "Paused"}
              </div>
              <button onClick={() => setLive(v => !v)} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "white", borderRadius: 8, padding: "7px 14px", fontSize: 12, cursor: "pointer" }}>
                {live ? "⏸ Pause" : "▶ Resume"}
              </button>
            </div>
          </div>
          {/* TABS */}
          <div style={{ display: "flex", gap: 4, marginTop: 20, overflowX: "auto" }}>
            {(["overview", "transactions", "links", "payouts"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                background: tab === t ? "rgba(255,255,255,0.2)" : "transparent",
                border: tab === t ? "1px solid rgba(255,255,255,0.3)" : "1px solid transparent",
                color: "white", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: tab === t ? 700 : 400,
                cursor: "pointer", textTransform: "capitalize", whiteSpace: "nowrap",
              }}>
                {t === "overview" ? "📊 Overview" : t === "transactions" ? "💳 Transactions" : t === "links" ? "🔗 Payment Links" : "💰 Payouts"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>
        {/* ====== OVERVIEW ====== */}
        {tab === "overview" && (
          <>
            {/* METRICS */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
              {[
                { label: "Total Revenue", value: fmt(stats?.totalRevenue || 0), sub: `+${stats?.revenueChange || 0}% vs last month`, color: BLUE, icon: "💵" },
                { label: "Net Revenue", value: fmt(stats?.netRevenue || 0), sub: "After fees & refunds", color: GREEN, icon: "✅" },
                { label: "Pending", value: fmt(stats?.pendingPayments || 0), sub: `${Math.round((stats?.pendingPayments || 0) / (stats?.totalRevenue || 1) * 100)}% of total`, color: AMBER, icon: "⏳" },
                { label: "Failed Payments", value: fmt(stats?.failedPayments || 0), sub: "Needs attention", color: RED, icon: "⚠️" },
                { label: "Commissions", value: fmt(stats?.agentCommissions || 0), sub: "Agent earnings (10%)", color: PURPLE, icon: "🤝" },
                { label: "Platform Margin", value: fmt(stats?.platformMargin || 0), sub: "Zeniva keep (20%)", color: DARK, icon: "🏢" },
                { label: "Refunds", value: fmt(stats?.refunds || 0), sub: "Processed refunds", color: "#64748b", icon: "↩️" },
                { label: "Transactions", value: String(stats?.transactionCount || 0), sub: "This period", color: "#0ea5e9", icon: "📋" },
              ].map(c => (
                <div key={c.label} style={{ background: "white", borderRadius: 14, padding: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.07)", border: "1px solid #f1f5f9" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 11, color: "#64748b", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.5px" }}>{c.label}</p>
                      <p style={{ margin: "4px 0", fontSize: 22, fontWeight: 800, color: "#0f172a" }}>{stats ? c.value : "—"}</p>
                      <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>{c.sub}</p>
                    </div>
                    <span style={{ fontSize: 20 }}>{c.icon}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* LIVE FEED */}
            <div style={{ background: "white", borderRadius: 14, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.07)", border: "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: GREEN, animation: "pulse 2s infinite" }} />
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Live Payment Activity</h3>
              </div>
              {txs.slice(0, 5).map((tx) => {
                const cfg = statusConfig[tx.status];
                return (
                  <div key={tx.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #f8fafc", flexWrap: "wrap", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: tx.status === "completed" ? "#d1fae5" : tx.status === "failed" ? "#fee2e2" : "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                        {tx.status === "completed" ? "✅" : tx.status === "failed" ? "❌" : tx.status === "refunded" ? "↩️" : "⏳"}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>{fmtSmall(tx.amount)} {tx.status === "completed" ? "received" : tx.status}</p>
                        <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>
                          {tx.bookingRef && `Booking ${tx.bookingRef} · `}{tx.customerName} · {tx.paymentMethod}
                        </p>
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
          </>
        )}

        {/* ====== TRANSACTIONS ====== */}
        {tab === "transactions" && (
          <div style={{ background: "white", borderRadius: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.07)", border: "1px solid #f1f5f9", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>All Transactions</h3>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search customer, ID..." style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "7px 12px", fontSize: 13, outline: "none", minWidth: 200 }} />
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "7px 12px", fontSize: 13, background: "white", cursor: "pointer" }}>
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
                <button onClick={() => {
                  const csv = ["ID,Customer,Amount,Currency,Status,Method,Gateway,Booking,Date",
                    ...filteredTxs.map(t => `${t.id},${t.customerName},${t.amount},${t.currency},${t.status},${t.paymentMethod},${t.gateway},${t.bookingRef||""},${t.createdAt}`)
                  ].join("\n");
                  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "zenipay-transactions.csv"; a.click();
                }} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "7px 14px", fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
                  ⬇ Export CSV
                </button>
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["Transaction ID", "Customer", "Amount", "Method", "Gateway", "Booking", "Status", "Date"].map(h => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredTxs.map((tx, i) => {
                    const cfg = statusConfig[tx.status];
                    return (
                      <tr key={tx.id} style={{ borderTop: "1px solid #f1f5f9", background: i % 2 === 0 ? "white" : "#fafbfc" }}>
                        <td style={{ padding: "12px 14px", fontWeight: 700, color: BLUE, whiteSpace: "nowrap" }}>{tx.id}</td>
                        <td style={{ padding: "12px 14px" }}>{tx.customerName}</td>
                        <td style={{ padding: "12px 14px", fontWeight: 700, whiteSpace: "nowrap" }}>{fmtSmall(tx.amount)}</td>
                        <td style={{ padding: "12px 14px", color: "#64748b", whiteSpace: "nowrap", fontSize: 12 }}>{tx.paymentMethod}</td>
                        <td style={{ padding: "12px 14px", color: "#64748b" }}>{tx.gateway}</td>
                        <td style={{ padding: "12px 14px", color: "#64748b" }}>{tx.bookingRef || "—"}</td>
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{ padding: "3px 10px", borderRadius: 20, background: cfg.bg, color: cfg.color, fontSize: 11, fontWeight: 600 }}>{cfg.label}</span>
                        </td>
                        <td style={{ padding: "12px 14px", color: "#94a3b8", whiteSpace: "nowrap", fontSize: 12 }}>{timeAgo(tx.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredTxs.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>No transactions found</div>}
            </div>
          </div>
        )}

        {/* ====== PAYMENT LINKS ====== */}
        {tab === "links" && (
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <div style={{ background: "white", borderRadius: 14, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.07)", border: "1px solid #f1f5f9", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>🔗 Payment Links</h3>
                <button onClick={() => { setShowCreateLink(true); setCreatedLink(null); }} style={{ background: BLUE, color: "white", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                  + Create Link
                </button>
              </div>

              {showCreateLink && !createdLink && (
                <div style={{ background: "#f8fafc", borderRadius: 12, padding: 20, marginBottom: 16 }}>
                  <h4 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700 }}>New Payment Link</h4>
                  <div style={{ display: "grid", gap: 12 }}>
                    <input value={linkForm.amount} onChange={e => setLinkForm(f => ({...f, amount: e.target.value}))} placeholder="Amount (USD)" type="number" style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 14px", fontSize: 14, outline: "none" }} />
                    <input value={linkForm.description} onChange={e => setLinkForm(f => ({...f, description: e.target.value}))} placeholder="Description (e.g. Paris Trip Deposit)" style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 14px", fontSize: 14, outline: "none" }} />
                    <input value={linkForm.customerName} onChange={e => setLinkForm(f => ({...f, customerName: e.target.value}))} placeholder="Customer Name (optional)" style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 14px", fontSize: 14, outline: "none" }} />
                    <input value={linkForm.customerEmail} onChange={e => setLinkForm(f => ({...f, customerEmail: e.target.value}))} placeholder="Customer Email (optional)" style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 14px", fontSize: 14, outline: "none" }} />
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={createLink} disabled={!linkForm.amount || linkLoading} style={{ flex: 1, background: linkForm.amount ? BLUE : "#94a3b8", color: "white", border: "none", borderRadius: 8, padding: "10px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                        {linkLoading ? "Creating…" : "Generate Link"}
                      </button>
                      <button onClick={() => setShowCreateLink(false)} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, padding: "10px 16px", fontSize: 14, cursor: "pointer" }}>Cancel</button>
                    </div>
                  </div>
                </div>
              )}

              {createdLink && (
                <div style={{ background: "#d1fae5", borderRadius: 12, padding: 20, marginBottom: 16 }}>
                  <p style={{ margin: "0 0 4px", fontWeight: 700, color: "#065f46", fontSize: 15 }}>✅ Payment link created — {createdLink.amount}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: "white", borderRadius: 8, padding: "10px 14px", marginTop: 10 }}>
                    <code style={{ flex: 1, fontSize: 12, wordBreak: "break-all", color: "#0f172a" }}>{createdLink.url}</code>
                    <button onClick={() => navigator.clipboard.writeText(createdLink.url)} style={{ background: BLUE, color: "white", border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 12, cursor: "pointer", whiteSpace: "nowrap" }}>Copy</button>
                  </div>
                  <button onClick={() => { setCreatedLink(null); setLinkForm({ amount: "", description: "", customerName: "", customerEmail: "" }); }} style={{ marginTop: 10, background: "transparent", border: "none", color: "#065f46", fontSize: 12, cursor: "pointer", textDecoration: "underline" }}>Create another</button>
                </div>
              )}

              <div style={{ padding: 32, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🔗</div>
                <p>Create secure payment links and send them to clients.<br />They can pay directly via the Zeniva checkout.</p>
              </div>
            </div>
          </div>
        )}

        {/* ====== PAYOUTS ====== */}
        {tab === "payouts" && (
          <div style={{ background: "white", borderRadius: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.07)", border: "1px solid #f1f5f9", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>💰 Agent Payouts</h3>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>May 2025 · Commission: 10% of booking value</p>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["Agent", "Total Earnings", "Commission (10%)", "Pending", "Paid", "Action"].map(h => (
                      <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((p, i) => (
                    <tr key={p.name} style={{ borderTop: "1px solid #f1f5f9", background: i % 2 === 0 ? "white" : "#fafbfc" }}>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: "50%", background: `hsl(${i * 80 + 200}, 70%, 90%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: `hsl(${i * 80 + 200}, 70%, 35%)` }}>
                            {p.name.charAt(0)}
                          </div>
                          <span style={{ fontWeight: 600 }}>{p.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px", fontWeight: 700 }}>{fmt(p.earnings)}</td>
                      <td style={{ padding: "14px 16px", color: PURPLE, fontWeight: 700 }}>{fmt(p.commission)}</td>
                      <td style={{ padding: "14px 16px" }}><span style={{ background: "#fef3c7", color: "#92400e", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{fmt(p.pending)}</span></td>
                      <td style={{ padding: "14px 16px" }}><span style={{ background: "#d1fae5", color: "#065f46", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{fmt(p.paid)}</span></td>
                      <td style={{ padding: "14px 16px" }}>
                        <button style={{ background: BLUE, color: "white", border: "none", borderRadius: 7, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Pay Now</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}
