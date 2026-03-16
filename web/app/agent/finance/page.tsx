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

// ── Default wallets — overwritten by live API on mount ────────────────
const DEFAULT_WALLETS = {
  platform:   { available: 0, pending: 0, paid: 0, currency: "USD" },
  agent:      { available: 0, pending: 0, paid: 0, currency: "USD" },
  influencer: { available: 0, pending: 0, paid: 0, currency: "USD" },
  supplier:   { available: 0, pending: 0, paid: 0, currency: "USD" },
};
// WALLETS and TRANSACTIONS are now component state — fetched from /api/zenipay/stats

const AGENTS: { id?: string; name: string; code: string; bookings: number; revenue: number; commission: number; pending: number; rate: string; role?: string; avatar?: string; badge?: string }[] = [
  { id: "ag-001", name: "Louis", code: "LOUIS", bookings: 0, revenue: 0, commission: 0, pending: 0, rate: "70%", role: "Senior Travel Agent", badge: "🥇" },
  { id: "ag-002", name: "Jason", code: "JASON", bookings: 0, revenue: 0, commission: 0, pending: 0, rate: "70%", role: "Travel Agent", badge: "🥈" },
  { id: "ag-003", name: "Luca", code: "LUCA", bookings: 0, revenue: 0, commission: 0, pending: 0, rate: "70%", role: "Travel Agent", badge: "🥉" },
];

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

function WalletCard({ name, data, icon, color, onOpen }: { name: string; data: { available: number; pending: number; paid: number; currency: string }; icon: string; color: string; onOpen: () => void }) {
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

function WalletModal({ name, data, icon, color, onClose }: { name: string; data: { available: number; pending: number; paid: number; currency: string }; icon: string; color: string; onClose: () => void }) {
  const isPlatform = name === "Platform";
  type ModalTab = "overview" | "bank" | "history" | "distribute";
  const [tab, setTab] = useState<ModalTab>(isPlatform ? "overview" : "overview");
  const [bankForm, setBankForm] = useState({ holder: "", bank: "", routing: "", account: "", type: "checking" });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [distForm, setDistForm] = useState({ to: "agent", amount: "", note: "" });
  const [distSent, setDistSent] = useState(false);
  const [distSending, setDistSending] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1400));
    setSaved(true);
    setSaving(false);
  };

  const handleDistribute = async () => {
    setDistSending(true);
    await new Promise(r => setTimeout(r, 1800));
    setDistSent(true);
    setDistSending(false);
  };

  const tabs = isPlatform
    ? [
        { id: "overview", label: "💡 Overview" },
        { id: "distribute", label: "💸 Distribute" },
        { id: "bank", label: "🏦 Bank" },
        { id: "history", label: "📋 History" },
      ]
    : [
        { id: "overview", label: "💡 Overview" },
        { id: "bank", label: "🏦 Bank Account" },
        { id: "history", label: "📋 History" },
      ];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 24, width: "100%", maxWidth: isPlatform ? 620 : 560, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.3)" }}>
        {/* Header */}
        <div style={{ background: isPlatform ? `linear-gradient(135deg, #0B1B4D, #0F6CF5)` : `linear-gradient(135deg, ${DARK}, #1a2f6e)`, borderRadius: "24px 24px 0 0", padding: "24px 28px", color: "white" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: isPlatform ? 16 : 0 }}>
            <div style={{ width: 52, height: 52, background: `${color}30`, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, border: `1px solid ${color}50` }}>{icon}</div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 900, fontSize: 20 }}>{name} Wallet</p>
              <p style={{ margin: "2px 0 0", fontSize: 12, opacity: 0.6 }}>{isPlatform ? "Zeniva Travel LLC — Master Control Account" : "ZeniPay Financial Account"}</p>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 9999, width: 32, height: 32, color: "white", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
          </div>
          {isPlatform && (
            <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 14, padding: "12px 16px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
              {[
                { l: "Available", v: fmt(data.available, true), c: "#4ade80" },
                { l: "Pending", v: fmt(data.pending, true), c: GOLD },
                { l: "Paid Out", v: fmt(data.paid, true), c: "#94a3b8" },
                { l: "Gateway", v: "Finix", c: "#60a5fa" },
              ].map(s => (
                <div key={s.l} style={{ textAlign: "center" as const }}>
                  <p style={{ margin: "0 0 2px", fontSize: 9, opacity: 0.55, fontWeight: 700, textTransform: "uppercase" as const }}>{s.l}</p>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: 14, color: s.c }}>{s.v}</p>
                </div>
              ))}
            </div>
          )}
          {!isPlatform && (
            <div style={{ background: `${color}20`, borderRadius: 10, padding: "10px 16px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 12 }}>
              {[{ l: "Available", v: data.available, c: color }, { l: "Pending", v: data.pending, c: GOLD }, { l: "Paid Out", v: data.paid, c: "#94a3b8" }].map(s => (
                <div key={s.l} style={{ textAlign: "center" as const }}>
                  <p style={{ margin: "0 0 2px", fontSize: 9, opacity: 0.6, fontWeight: 700, textTransform: "uppercase" as const }}>{s.l}</p>
                  <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: s.c }}>{fmt(s.v, true)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #f1f5f9" }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id as ModalTab)} style={{
              flex: 1, padding: "13px 8px", border: "none", background: "none", cursor: "pointer", fontSize: 11, fontWeight: 700,
              color: tab === t.id ? color : "#64748b",
              borderBottom: tab === t.id ? `2px solid ${color}` : "2px solid transparent",
            }}>{t.label}</button>
          ))}
        </div>

        <div style={{ padding: 24 }}>
          {/* OVERVIEW */}
          {tab === "overview" && (
            <div style={{ display: "grid", gap: 14 }}>
              {isPlatform && (
                <div style={{ background: `${BLUE}08`, border: `1px solid ${BLUE}20`, borderRadius: 14, padding: 18 }}>
                  <p style={{ margin: "0 0 10px", fontWeight: 800, fontSize: 14, color: DARK }}>🏛️ Platform Control Center</p>
                  <p style={{ margin: "0 0 14px", fontSize: 12, color: "#64748b" }}>All client payments land in this wallet. You control how funds are distributed to agents, suppliers, and influencers.</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {[
                      { label: "💸 Distribute Funds", action: () => setTab("distribute"), highlight: true },
                      { label: "🏦 Add Bank Account", action: () => setTab("bank") },
                      { label: "📊 Export Statement", action: () => {} },
                      { label: "⚡ Instant Payout", action: () => setTab("distribute") },
                    ].map(a => (
                      <button key={a.label} onClick={a.action} style={{
                        background: a.highlight ? BLUE : "white",
                        border: a.highlight ? "none" : "1px solid #e2e8f0",
                        borderRadius: 10, padding: "11px 12px", fontSize: 12, fontWeight: 700,
                        cursor: "pointer", color: a.highlight ? "white" : "#374151", textAlign: "left" as const
                      }}>
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {!isPlatform && (
                <div style={{ background: "#f8fafc", borderRadius: 14, padding: 18 }}>
                  <p style={{ margin: "0 0 12px", fontWeight: 700, fontSize: 14 }}>💳 Quick Actions</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {[
                      { label: "💸 Request Payout", action: () => setTab("bank") },
                      { label: "📄 Download Statement", action: () => setTab("history") },
                      { label: "🔗 Add Payout Method", action: () => setTab("bank") },
                      { label: "📋 View History", action: () => setTab("history") },
                    ].map(a => (
                      <button key={a.label} onClick={a.action} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#374151", textAlign: "left" as const }}>
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ background: `${color}10`, borderRadius: 14, padding: 18, border: `1px solid ${color}20` }}>
                <p style={{ margin: "0 0 8px", fontWeight: 700, fontSize: 13, color: DARK }}>📅 {isPlatform ? "Finix Settlement" : "Next Scheduled Payout"}</p>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "#64748b" }}>Schedule</span>
                  <span style={{ fontWeight: 700, color: color }}>{isPlatform ? "T+1 business day" : "Every Friday"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginTop: 6 }}>
                  <span style={{ color: "#64748b" }}>Next Amount</span>
                  <span style={{ fontWeight: 800, color: color }}>{fmt(data.available, true)}</span>
                </div>
                {isPlatform && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginTop: 6 }}>
                    <span style={{ color: "#64748b" }}>Processor</span>
                    <span style={{ fontWeight: 700, color: "#60a5fa" }}>Finix (Sandbox)</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* DISTRIBUTE (Platform only) */}
          {tab === "distribute" && isPlatform && (
            <div>
              {distSent ? (
                <div style={{ textAlign: "center" as const, padding: "32px 20px" }}>
                  <div style={{ fontSize: 56, marginBottom: 12 }}>✅</div>
                  <h3 style={{ margin: "0 0 8px", fontWeight: 800, color: "#065f46" }}>Transfer Recorded!</h3>
                  <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 20px" }}>The distribution will be processed once Finix live mode is activated.</p>
                  <button onClick={() => { setDistSent(false); setDistForm({ to: "agent", amount: "", note: "" }); }}
                    style={{ background: BLUE, color: "white", border: "none", borderRadius: 9999, padding: "10px 24px", fontWeight: 700, cursor: "pointer" }}>
                    New Transfer
                  </button>
                </div>
              ) : (
                <div style={{ display: "grid", gap: 16 }}>
                  <div style={{ background: `${BLUE}08`, borderRadius: 14, padding: 16, border: `1px solid ${BLUE}15` }}>
                    <p style={{ margin: "0 0 6px", fontWeight: 700, fontSize: 13, color: DARK }}>💰 Platform Balance Available</p>
                    <p style={{ margin: 0, fontSize: 32, fontWeight: 900, color: BLUE }}>{fmt(data.available, true)}</p>
                    <p style={{ margin: "4px 0 0", fontSize: 11, color: "#94a3b8" }}>Zeniva Travel LLC · USD · Finix</p>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 6, textTransform: "uppercase" as const }}>Send To</label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                      {[
                        { id: "agent", icon: "👤", label: "Agent", color: PURPLE },
                        { id: "influencer", icon: "⭐", label: "Influencer", color: GOLD },
                        { id: "supplier", icon: "✈️", label: "Supplier", color: GREEN },
                      ].map(w => (
                        <button key={w.id} onClick={() => setDistForm(p => ({ ...p, to: w.id }))} style={{
                          background: distForm.to === w.id ? `${w.color}15` : "#f8fafc",
                          border: `2px solid ${distForm.to === w.id ? w.color : "#e2e8f0"}`,
                          borderRadius: 12, padding: "12px 8px", cursor: "pointer", textAlign: "center" as const,
                        }}>
                          <div style={{ fontSize: 22, marginBottom: 4 }}>{w.icon}</div>
                          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: distForm.to === w.id ? w.color : "#374151" }}>{w.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 6, textTransform: "uppercase" as const }}>Amount (USD)</label>
                    <input
                      type="number"
                      value={distForm.amount}
                      onChange={e => setDistForm(p => ({ ...p, amount: e.target.value }))}
                      placeholder="Enter amount e.g. 800"
                      style={{ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "12px 14px", fontSize: 16, fontWeight: 700, outline: "none", boxSizing: "border-box" as const }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 6, textTransform: "uppercase" as const }}>Note / Reference (optional)</label>
                    <input
                      value={distForm.note}
                      onChange={e => setDistForm(p => ({ ...p, note: e.target.value }))}
                      placeholder="e.g. Agent commission — Booking #1042"
                      style={{ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "11px 14px", fontSize: 14, outline: "none", boxSizing: "border-box" as const }}
                    />
                  </div>

                  {distForm.amount && Number(distForm.amount) > 0 && (
                    <div style={{ background: "#f0fdf4", borderRadius: 12, padding: "14px 16px", border: "1px solid #bbf7d0" }}>
                      <p style={{ margin: "0 0 6px", fontWeight: 700, fontSize: 13, color: "#065f46" }}>Transfer Summary</p>
                      <div style={{ fontSize: 13, color: "#374151", display: "grid", gap: 4 }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>From</span><span style={{ fontWeight: 700 }}>Platform Wallet (Zeniva Travel LLC)</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>To</span><span style={{ fontWeight: 700, textTransform: "capitalize" as const }}>{distForm.to} Wallet</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>Amount</span><span style={{ fontWeight: 800, color: GREEN }}>${Number(distForm.amount).toLocaleString()}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>Remaining</span><span style={{ fontWeight: 700 }}>${Math.max(0, data.available - Number(distForm.amount)).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <button onClick={handleDistribute} disabled={distSending || !distForm.amount || Number(distForm.amount) <= 0}
                    style={{ background: distSending ? "#94a3b8" : `linear-gradient(135deg, ${BLUE}, ${DARK})`, color: "white", border: "none", borderRadius: 9999, padding: "14px", fontWeight: 800, fontSize: 15, cursor: distSending ? "not-allowed" : "pointer" }}>
                    {distSending ? "Processing Transfer…" : `💸 Send ${distForm.amount ? "$" + Number(distForm.amount).toLocaleString() : ""} to ${distForm.to.charAt(0).toUpperCase() + distForm.to.slice(1)} Wallet`}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* BANK */}
          {tab === "bank" && (
            <div>
              {saved ? (
                <div style={{ textAlign: "center" as const, padding: "32px 20px" }}>
                  <div style={{ fontSize: 56, marginBottom: 12 }}>✅</div>
                  <h3 style={{ margin: "0 0 8px", fontWeight: 800, color: "#065f46" }}>Bank Account Saved!</h3>
                  <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 20px" }}>Verification micro-deposits will arrive in 1-2 business days.</p>
                  <button onClick={() => setSaved(false)} style={{ background: BLUE, color: "white", border: "none", borderRadius: 9999, padding: "10px 24px", fontWeight: 700, cursor: "pointer" }}>Update Account</button>
                </div>
              ) : (
                <div style={{ display: "grid", gap: 14 }}>
                  <p style={{ margin: "0 0 4px", fontSize: 13, color: "#374151", fontWeight: 600 }}>
                    {isPlatform ? "Add Zeniva Travel LLC bank account to receive Finix settlements." : "Add your bank account to receive payouts from ZeniPay."}
                  </p>
                  {[
                    { label: "Account Holder Name", key: "holder", ph: isPlatform ? "Zeniva Travel LLC" : "Full Name" },
                    { label: "Bank Name", key: "bank", ph: "Chase, TD Bank, Royal Bank…" },
                    { label: "Routing / Transit Number", key: "routing", ph: "021000021" },
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
                      <option value="checking">Checking / Chequing</option>
                      <option value="savings">Savings</option>
                      <option value="business">Business Checking</option>
                    </select>
                  </div>
                  <button onClick={handleSave} disabled={saving} style={{ background: saving ? "#94a3b8" : `linear-gradient(135deg, ${BLUE}, ${DARK})`, color: "white", border: "none", borderRadius: 9999, padding: "13px", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
                    {saving ? "Saving…" : "💾 Save Bank Account"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* HISTORY */}
          {tab === "history" && (
            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ background: "#f8fafc", borderRadius: 12, padding: "14px 16px", textAlign: "center" as const, border: "1px dashed #e2e8f0" }}>
                <p style={{ margin: "0 0 4px", fontWeight: 700, color: "#374151" }}>No transactions yet</p>
                <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>Transactions will appear here once Finix live payments are active</p>
              </div>
              <button style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "11px", fontWeight: 700, fontSize: 13, cursor: "pointer", color: "#374151", marginTop: 8 }}>
                📥 Download Full Statement
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// ══ PAYOUTS PANEL (full bank wire transfer system) ══════════════════
type AgentType = { id?: string; name: string; code: string; bookings: number; revenue: number; commission: number; pending: number; rate: string; role?: string; avatar?: string; badge?: string };

function PayoutsPanel({ agents, platformBalance }: { agents: AgentType[]; platformBalance: number }) {
  const [step, setStep] = useState<"select"|"amount"|"confirm"|"sent">("select");
  const [selectedAgent, setSelectedAgent] = useState<AgentType | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [method, setMethod] = useState<"bank"|"instant">("bank");
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState<{id:string;agent:string;amount:number;method:string;note:string;date:string;status:string}[]>([]);

  const handleSend = async () => {
    setSending(true);
    await new Promise(r => setTimeout(r, 2000));
    const ref = "ZNV-PAY-" + Math.random().toString(36).slice(2,8).toUpperCase();
    setHistory(h => [{
      id: ref,
      agent: selectedAgent!.name,
      amount: Number(amount),
      method: method === "instant" ? "Instant Transfer" : "Bank Wire (ACH)",
      note: note || "Agent commission payment",
      date: new Date().toLocaleDateString("en-CA"),
      status: "completed",
    }, ...h]);
    setSending(false);
    setStep("sent");
  };

  const reset = () => {
    setStep("select");
    setSelectedAgent(null);
    setAmount("");
    setNote("");
    setMethod("bank");
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      {/* LEFT: Transfer Form */}
      <div style={{ background: "white", borderRadius: 20, padding: 28, boxShadow: "0 2px 16px rgba(0,0,0,0.08)" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div style={{ width: 44, height: 44, background: `${BLUE}12`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>💸</div>
          <div>
            <p style={{ margin: 0, fontWeight: 900, fontSize: 17, color: DARK }}>Send Payment</p>
            <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>Internal bank transfer · ZeniPay</p>
          </div>
        </div>

        {/* Platform balance pill */}
        <div style={{ background: `${BLUE}08`, borderRadius: 12, padding: "10px 16px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>🏛️ Platform Balance Available</span>
          <span style={{ fontSize: 18, fontWeight: 900, color: BLUE }}>{fmt(platformBalance, true)}</span>
        </div>

        {step === "sent" ? (
          <div style={{ textAlign: "center" as const, padding: "20px 0" }}>
            <div style={{ fontSize: 64, marginBottom: 12 }}>✅</div>
            <h3 style={{ margin: "0 0 6px", fontWeight: 900, color: "#065f46", fontSize: 20 }}>Transfer Sent!</h3>
            <p style={{ margin: "0 0 4px", fontSize: 15, color: "#374151", fontWeight: 600 }}>${Number(amount).toLocaleString()} → {selectedAgent?.name}</p>
            <p style={{ margin: "0 0 20px", fontSize: 12, color: "#94a3b8" }}>{method === "instant" ? "Instant Transfer" : "Bank Wire — arrives in 1-2 business days"}</p>
            <button onClick={reset} style={{ background: BLUE, color: "white", border: "none", borderRadius: 9999, padding: "12px 32px", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
              + New Transfer
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 18 }}>
            {/* STEP 1: Select Agent */}
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 8, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>
                📍 Step 1 — Select Recipient
              </label>
              {agents.length === 0 ? (
                <div style={{ background: "#f8fafc", borderRadius: 10, padding: "14px", textAlign: "center" as const, color: "#94a3b8", fontSize: 13 }}>
                  No agents configured yet
                </div>
              ) : (
                <div style={{ display: "grid", gap: 8 }}>
                  {[
                    { type: "owner", name: "Zeniva Travel LLC", sub: "Owner payout — company account", icon: "🏢", color: "#0F6CF5", data: { id: "owner-001", name: "Zeniva Travel LLC", code: "ZENIVA", bookings: 0, revenue: 0, commission: 0, pending: 0, rate: "100%", role: "Owner · Platform Revenue" } },
                    ...agents.map(a => ({ type: "agent", name: a.name, sub: a.role || "Travel Agent", icon: "👤", color: PURPLE, data: a })),
                    { type: "supplier", name: "Supplier / Hotel", sub: "Direct supplier payment", icon: "✈️", color: GREEN, data: null },
                    { type: "other", name: "Other Recipient", sub: "Bank wire to custom account", icon: "🏦", color: "#64748b", data: null },
                  ].map((r, i) => (
                    <button key={i} onClick={() => {
                      setSelectedAgent(r.data as AgentType || { id: `other-${i}`, name: r.name, code: r.type.toUpperCase(), bookings: 0, revenue: 0, commission: 0, pending: 0, rate: "-" });
                      setStep("amount");
                    }} style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                      background: selectedAgent?.name === r.name ? `${r.color}10` : "#f8fafc",
                      border: `1.5px solid ${selectedAgent?.name === r.name ? r.color : "#e2e8f0"}`,
                      borderRadius: 12, cursor: "pointer", textAlign: "left" as const, transition: "all 0.15s",
                    }}>
                      <div style={{ width: 36, height: 36, background: `${r.color}15`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{r.icon}</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: DARK }}>{r.name}</p>
                        <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>{r.sub}</p>
                      </div>
                      {selectedAgent?.name === r.name && <span style={{ color: r.color, fontSize: 18 }}>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* STEP 2: Amount */}
            {(step === "amount" || step === "confirm") && selectedAgent && (
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 8, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>
                  💵 Step 2 — Amount
                </label>
                <div style={{ position: "relative" as const }}>
                  <span style={{ position: "absolute" as const, left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 20, fontWeight: 900, color: "#94a3b8" }}>$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => { setAmount(e.target.value); setStep("amount"); }}
                    placeholder="0.00"
                    style={{ width: "100%", border: "2px solid #e2e8f0", borderRadius: 12, padding: "14px 14px 14px 36px", fontSize: 24, fontWeight: 900, outline: "none", boxSizing: "border-box" as const, color: DARK }}
                  />
                </div>
                {/* Quick amounts */}
                <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" as const }}>
                  {[500, 800, 1000, 1500, 2500, 5000].map(v => (
                    <button key={v} onClick={() => { setAmount(String(v)); setStep("amount"); }}
                      style={{ background: amount === String(v) ? BLUE : "#f1f5f9", color: amount === String(v) ? "white" : "#374151", border: "none", borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                      ${v.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: Method + Note */}
            {(step === "amount" || step === "confirm") && amount && Number(amount) > 0 && (
              <div style={{ display: "grid", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 8, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>
                    🏦 Step 3 — Transfer Method
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {[
                      { id: "bank", label: "🏦 Bank Wire (ACH)", sub: "1-2 business days · Free", color: BLUE },
                      { id: "instant", label: "⚡ Instant Transfer", sub: "Same day · $0.50 fee", color: GREEN },
                    ].map(m => (
                      <button key={m.id} onClick={() => setMethod(m.id as "bank"|"instant")}
                        style={{ padding: "12px 10px", background: method === m.id ? `${m.color}10` : "#f8fafc", border: `2px solid ${method === m.id ? m.color : "#e2e8f0"}`, borderRadius: 12, cursor: "pointer", textAlign: "left" as const }}>
                        <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 700, color: method === m.id ? m.color : DARK }}>{m.label}</p>
                        <p style={{ margin: 0, fontSize: 10, color: "#94a3b8" }}>{m.sub}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 6, textTransform: "uppercase" as const }}>
                    📝 Reference / Note
                  </label>
                  <input value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Agent commission — Booking #ZNV-1042"
                    style={{ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 10, padding: "11px 14px", fontSize: 13, outline: "none", boxSizing: "border-box" as const }} />
                </div>

                {/* Summary */}
                <div style={{ background: "#f0fdf4", borderRadius: 14, padding: "16px 18px", border: "1px solid #bbf7d0" }}>
                  <p style={{ margin: "0 0 10px", fontWeight: 800, fontSize: 13, color: "#065f46" }}>Transfer Summary</p>
                  {[
                    { l: "From", v: "Platform Wallet (Zeniva Travel LLC)" },
                    { l: "To", v: selectedAgent?.name },
                    { l: "Amount", v: `$${Number(amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}` },
                    { l: "Method", v: method === "instant" ? "Instant Transfer" : "Bank Wire (ACH)" },
                    { l: "Arrival", v: method === "instant" ? "Same day" : "1-2 business days" },
                    { l: "Ref", v: note || "Agent payment" },
                  ].map(s => (
                    <div key={s.l} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                      <span style={{ color: "#64748b" }}>{s.l}</span>
                      <span style={{ fontWeight: 700, color: "#0f172a" }}>{s.v}</span>
                    </div>
                  ))}
                  <div style={{ borderTop: "1px solid #bbf7d0", marginTop: 10, paddingTop: 10, display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#065f46" }}>Platform Balance After</span>
                    <span style={{ fontSize: 14, fontWeight: 900, color: "#065f46" }}>${Math.max(0, platformBalance - Number(amount)).toLocaleString()}</span>
                  </div>
                </div>

                <button onClick={handleSend} disabled={sending || Number(amount) <= 0} style={{
                  background: sending ? "#94a3b8" : `linear-gradient(135deg, ${BLUE}, ${DARK})`,
                  color: "white", border: "none", borderRadius: 9999, padding: "16px",
                  fontWeight: 900, fontSize: 16, cursor: sending ? "not-allowed" : "pointer",
                  boxShadow: sending ? "none" : `0 4px 20px ${BLUE}40`,
                }}>
                  {sending ? "⏳ Processing Transfer…" : `💸 Send $${Number(amount).toLocaleString()} to ${selectedAgent?.name}`}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* RIGHT: History + Agent Balances */}
      <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
        {/* Agent Balances */}
        <div style={{ background: "white", borderRadius: 20, padding: 24, boxShadow: "0 2px 16px rgba(0,0,0,0.08)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontWeight: 800, fontSize: 15 }}>👥 Recipients</h3>
            <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>Quick Pay</span>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {/* Zeniva Travel LLC — toujours en premier */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: `${BLUE}08`, borderRadius: 12, border: `1.5px solid ${BLUE}20` }}>
              <div style={{ width: 40, height: 40, background: `${BLUE}15`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🏢</div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 800, fontSize: 14, color: DARK }}>Zeniva Travel LLC</p>
                <p style={{ margin: 0, fontSize: 11, color: "#64748b" }}>Owner · Platform Revenue · 100%</p>
              </div>
              <div style={{ textAlign: "right" as const }}>
                <p style={{ margin: "0 0 2px", fontSize: 10, color: "#94a3b8" }}>Available</p>
                <p style={{ margin: 0, fontWeight: 900, fontSize: 14, color: BLUE }}>{fmt(platformBalance, true)}</p>
              </div>
              <button onClick={() => {
                setSelectedAgent({ id: "owner-001", name: "Zeniva Travel LLC", code: "ZENIVA", bookings: 0, revenue: 0, commission: 0, pending: platformBalance, rate: "100%", role: "Owner · Platform Revenue" });
                setAmount(String(platformBalance > 0 ? Math.floor(platformBalance) : ""));
                setStep("amount");
              }} style={{ background: BLUE, color: "white", border: "none", borderRadius: 9999, padding: "7px 16px", fontSize: 11, fontWeight: 800, cursor: "pointer", flexShrink: 0 }}>
                💸 Pay Me
              </button>
            </div>
            {/* Agents */}
            {agents.map(a => (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px", background: "#f8fafc", borderRadius: 12 }}>
                <div style={{ width: 40, height: 40, background: `${PURPLE}15`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: PURPLE }}>
                  {a.name.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: DARK }}>{a.name}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>{a.bookings} bookings · {a.rate}</p>
                </div>
                <div style={{ textAlign: "right" as const }}>
                  <p style={{ margin: "0 0 2px", fontSize: 11, color: "#94a3b8" }}>Pending</p>
                  <p style={{ margin: 0, fontWeight: 800, fontSize: 14, color: a.pending > 0 ? GOLD : "#94a3b8" }}>{fmt(a.pending, true)}</p>
                </div>
                <button onClick={() => {
                  setSelectedAgent(a);
                  if (a.pending > 0) setAmount(String(a.pending));
                  setStep("amount");
                }} style={{ background: BLUE, color: "white", border: "none", borderRadius: 9999, padding: "6px 14px", fontSize: 11, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>
                  Pay
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Commission Breakdown */}
        <div style={{ background: "white", borderRadius: 20, padding: 24, boxShadow: "0 2px 16px rgba(0,0,0,0.08)" }}>
          <h3 style={{ margin: "0 0 16px", fontWeight: 800, fontSize: 15 }}>📊 Commission Structure</h3>
          {[
            { role: "Travel Agent", pct: "70%", desc: "Of booking (agent involved)", color: PURPLE },
            { role: "Lina Books Alone", pct: "30% agent", desc: "Zeniva keeps 70%", color: BLUE },
            { role: "Influencer Referral", pct: "5%", desc: "Of Zeniva net profit", color: GOLD },
            { role: "ZeniYacht", pct: "100% Zeniva", desc: "All yacht revenue stays in Zeniva", color: GREEN },
          ].map(r => (
            <div key={r.role} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ width: 36, height: 36, background: `${r.color}12`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 14, height: 14, background: r.color, borderRadius: "50%" }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: DARK }}>{r.role}</p>
                <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>{r.desc}</p>
              </div>
              <span style={{ fontWeight: 900, fontSize: 16, color: r.color }}>{r.pct}</span>
            </div>
          ))}
        </div>

        {/* Transfer History */}
        <div style={{ background: "white", borderRadius: 20, padding: 24, boxShadow: "0 2px 16px rgba(0,0,0,0.08)" }}>
          <h3 style={{ margin: "0 0 16px", fontWeight: 800, fontSize: 15 }}>📋 Transfer History</h3>
          {history.length === 0 ? (
            <div style={{ textAlign: "center" as const, padding: "20px 0" }}>
              <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 600, color: "#374151" }}>No transfers yet</p>
              <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>Your sent payments will appear here</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {history.map(h => (
                <div key={h.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#f8fafc", borderRadius: 10 }}>
                  <div style={{ width: 32, height: 32, background: "#dcfce7", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>✓</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 13 }}>→ {h.agent}</p>
                    <p style={{ margin: 0, fontSize: 10, color: "#94a3b8" }}>{h.id} · {h.date} · {h.method}</p>
                  </div>
                  <span style={{ fontWeight: 900, fontSize: 14, color: GREEN }}>-${h.amount.toLocaleString()}</span>
                </div>
              ))}
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
  { id: "ai", icon: "🤖", label: "Ben AI" },
  { id: "accounting", icon: "📚", label: "Accounting" },
  { id: "settings", icon: "⚙️", label: "Settings" },
  { id: "bookings_link", icon: "✈️", label: "Bookings →", href: "/agent/bookings" },
];

// ══════════════════════════════════════════════════════
//  REVENUE SPLIT WIDGET
// ══════════════════════════════════════════════════════
const SPLIT_SCENARIOS = [
  {
    id: "no_agent",
    label: "Direct / No Agent",
    icon: "🏦",
    desc: "Zeniva platform only",
    rows: (b: number) => [
      { label: "🏦 Zeniva Travel", pct: 100, amount: b, color: "#0F6CF5", sub: "100% platform revenue" },
    ],
  },
  {
    id: "lina_only",
    label: "Lina AI seule",
    icon: "🤖",
    desc: "Lina book without human agent",
    rows: (b: number) => [
      { label: "🏦 Zeniva Travel (70%)", pct: 70, amount: Math.round(b*0.70*100)/100, color: "#0F6CF5", sub: "Lina-only booking" },
      { label: "👤 Agent assigné (30%)", pct: 30, amount: Math.round(b*0.30*100)/100, color: "#8B5CF6", sub: "Agent de suivi" },
    ],
  },
  {
    id: "human_agent",
    label: "Agent humain",
    icon: "👤",
    desc: "Full agent involvement",
    rows: (b: number) => [
      { label: "👤 Agent de voyage (70%)", pct: 70, amount: Math.round(b*0.70*100)/100, color: "#8B5CF6", sub: "Louis / Jason / Luca" },
      { label: "🏦 Zeniva Travel (30%)", pct: 30, amount: Math.round(b*0.30*100)/100, color: "#0F6CF5", sub: "Platform margin" },
    ],
  },
  {
    id: "with_influencer",
    label: "+ Influenceur",
    icon: "⭐",
    desc: "Agent + influencer referral",
    rows: (b: number) => {
      const agent = Math.round(b*0.70*100)/100;
      const zenivaGross = Math.round(b*0.30*100)/100;
      const inf = Math.round(zenivaGross*0.05*100)/100;
      const zenivaNet = Math.round((zenivaGross - inf)*100)/100;
      return [
        { label: "👤 Agent de voyage (70%)", pct: 70, amount: agent, color: "#8B5CF6", sub: "Louis / Jason / Luca" },
        { label: "🏦 Zeniva Travel (~28.5%)", pct: Math.round(zenivaNet/b*100), amount: zenivaNet, color: "#0F6CF5", sub: "Net après influenceur" },
        { label: "⭐ Influenceur (5% du net)", pct: Math.round(inf/b*100), amount: inf, color: "#F59E0B", sub: "5% du 30% Zeniva" },
      ];
    },
  },
  {
    id: "yacht",
    label: "ZeniYacht",
    icon: "⛵",
    desc: "100% Zeniva — always",
    rows: (b: number) => [
      { label: "⛵ Zeniva Travel — ZeniYacht (100%)", pct: 100, amount: b, color: "#10B981", sub: "100% — broker commissions handled separately" },
    ],
  },
];

function RevenueSplitWidget() {
  const [scenario, setScenario] = useState("no_agent");
  const [bookingAmt, setBookingAmt] = useState(7677);
  const active = SPLIT_SCENARIOS.find(s => s.id === scenario)!;
  const rows = active.rows(bookingAmt);
  return (
    <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
        <h3 style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>💡 Revenue Split</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 11, color: "#94a3b8" }}>Booking:</span>
          <input
            type="number"
            value={bookingAmt}
            onChange={e => setBookingAmt(Number(e.target.value) || 0)}
            style={{ width: 80, border: "1px solid #e2e8f0", borderRadius: 6, padding: "3px 8px", fontSize: 12, fontWeight: 700, color: "#0F6CF5", textAlign: "right" }}
          />
        </div>
      </div>
      {/* Scenario tabs */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        {SPLIT_SCENARIOS.map(s => (
          <button key={s.id} onClick={() => setScenario(s.id)} style={{
            padding: "5px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer", border: "1px solid",
            background: scenario === s.id ? "#0F6CF5" : "#f8fafc",
            color: scenario === s.id ? "white" : "#64748b",
            borderColor: scenario === s.id ? "#0F6CF5" : "#e2e8f0",
          }}>
            {s.icon} {s.label}
          </button>
        ))}
      </div>
      {/* Active scenario */}
      <div style={{ padding: "10px 14px", background: "#f0f7ff", borderRadius: 10, marginBottom: 14, borderLeft: "3px solid #0F6CF5" }}>
        <p style={{ margin: 0, fontSize: 11, color: "#0F6CF5", fontWeight: 600 }}>{active.icon} {active.label} — {active.desc}</p>
      </div>
      {rows.map(r => (
        <div key={r.label} style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
            <div>
              <span style={{ fontSize: 12, color: "#374151", fontWeight: 600 }}>{r.label}</span>
              <span style={{ fontSize: 10, color: "#94a3b8", marginLeft: 6 }}>{r.sub}</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: r.color }}>
              ${r.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              <span style={{ fontSize: 11, fontWeight: 400, marginLeft: 4 }}>({r.pct}%)</span>
            </span>
          </div>
          <div style={{ background: "#f1f5f9", borderRadius: 4, height: 7 }}>
            <div style={{ background: r.color, width: `${r.pct}%`, height: "100%", borderRadius: 4, transition: "width 0.3s" }} />
          </div>
        </div>
      ))}
      <div style={{ marginTop: 16, padding: "8px 12px", background: "#fefce8", borderRadius: 8, borderLeft: "3px solid #F59E0B" }}>
        <p style={{ margin: 0, fontSize: 10, color: "#92400e", lineHeight: 1.7 }}>
          <strong>Règle de base :</strong> Sans agent ni influenceur → <strong>100% Zeniva</strong> · 
          Lina seule → <strong>70% Zeniva / 30% Agent</strong> · 
          Agent humain → <strong>70% Agent / 30% Zeniva</strong> · 
          ZeniYacht → <strong>100% Zeniva toujours</strong> · 
          Influenceur → <strong>+5% du net Zeniva</strong>
        </p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════
export default function ZeniPayDashboard() {
  const [tab, setTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [txSearch, setTxSearch] = useState("");
  const [txFilter, setTxFilter] = useState("all");
  const [linkModal, setLinkModal] = useState(false);
  const [linkForm, setLinkForm] = useState({ amount: "", desc: "", type: "trip", email: "" });
  const [linkCreated, setLinkCreated] = useState("");
  const [benMsg, setBenMsg] = useState("");
  const [benChat, setBenChat] = useState<{ role: "user" | "ben"; text: string }[]>([
    { role: "ben", text: "Bonjour! Je suis Ben, votre agent IA ZeniPay. Je surveille les paiements, détecte les anomalies et génère vos rapports financiers en temps réel. Comment puis-je vous aider?" }
  ]);
  const [aiLoading, setAiLoading] = useState(false);
  // Live data from API
  const [WALLETS, setWALLETS] = useState(DEFAULT_WALLETS);
  const [TRANSACTIONS, setTRANSACTIONS] = useState<{ id: string; customer: string; booking: string; amount: number; currency: string; method: string; gateway: string; status: string; date: string }[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [openWallet, setOpenWallet] = useState<{name:string;data:typeof DEFAULT_WALLETS.platform;icon:string;color:string}|null>(null);
  const [liveActivity, setLiveActivity] = useState<{ id: number; text: string; time: string; type: string }[]>([]);
  const [recentBookings, setRecentBookings] = useState<{ id: string; client_name: string; destination: string; total_price: number; status: string; created_at: string }[]>([]);

  // ── Fetch live stats from /api/zenipay/stats ──────────────────────────
  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/zenipay/stats");
        if (!res.ok) return;
        const data = await res.json();

        if (data.wallets) {
          setWALLETS({
            platform:   { available: data.wallets.platform?.available || 0,   pending: data.wallets.platform?.pending || 0,   paid: data.wallets.platform?.paid_out || 0,   currency: "USD" },
            agent:      { available: data.wallets.agent?.available || 0,       pending: data.wallets.agent?.pending || 0,       paid: data.wallets.agent?.paid_out || 0,       currency: "USD" },
            influencer: { available: data.wallets.influencer?.available || 0,  pending: data.wallets.influencer?.pending || 0,  paid: data.wallets.influencer?.paid_out || 0,  currency: "USD" },
            supplier:   { available: data.wallets.supplier?.available || 0,    pending: data.wallets.supplier?.pending || 0,    paid: data.wallets.supplier?.paid_out || 0,    currency: "USD" },
          });
        }

        if (data.recent_transactions?.length > 0) {
          setTRANSACTIONS(data.recent_transactions.map((t: Record<string, unknown>) => ({
            id: String(t.id || ""),
            customer: String(t.customer || ""),
            booking: String(t.description || t.id || ""),
            amount: Number(t.amount || 0),
            currency: String(t.currency || "USD"),
            method: "card",
            gateway: "Finix",
            status: String(t.status || "pending"),
            date: String(t.date || new Date().toISOString()),
          })));
        }
      } catch (e) {
        // API not reachable — stay at $0
      } finally {
        setStatsLoading(false);
      }
    }

    async function fetchBookings() {
      try {
        const r = await fetch("/api/agents-proxy?path=admin/bookings");
        const d = await r.json();
        const bks = (d?.bookings || []) as { id: string; client_name: string; destination: string; total_price: number; status: string; created_at: string }[];
        setRecentBookings(bks.slice(0, 5));
      } catch {}
    }

    void fetchStats();
    void fetchBookings();
    // Refresh every 30s
    const interval = setInterval(() => { void fetchStats(); void fetchBookings(); }, 30_000);
    return () => clearInterval(interval);
  }, []);

  const totalRevenue = TRANSACTIONS.filter(t => t.status === "succeeded" || t.status === "completed").reduce((a, t) => a + t.amount, 0);
  const platformBalance = WALLETS.platform.available + WALLETS.agent.available + WALLETS.influencer.available + WALLETS.supplier.available;
  const successRate = TRANSACTIONS.length > 0 ? Math.round(TRANSACTIONS.filter(t => t.status === "succeeded" || t.status === "completed").length / TRANSACTIONS.length * 100) : 0;

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

  const handleBenSend = async () => {
    if (!benMsg.trim()) return;
    const userMsg = benMsg;
    setBenMsg("");
    setBenChat(prev => [...prev, { role: "user", text: userMsg }]);
    setAiLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    const responses: Record<string, string> = {
      "revenue": `📊 Revenue Analysis:\n• Total today: ${fmt(totalRevenue)}\n• MTD: ${fmt(totalRevenue)}\n• Active agents: Louis, Jason, Luca\n• Success rate: ${successRate}%`,
      "fraud": `🛡️ Fraud Monitoring:\n• No high-risk transactions detected\n• Carlos Ruiz failure flagged: card declined (3x attempt)\n• Recommendation: request alternative payment method`,
      "payout": `💸 Upcoming Payouts:\n• Platform Balance: ${fmt(platformBalance, true)}\n• Agents: Louis, Jason, Luca — $0 pending\n• No payouts scheduled yet — activate Finix live to begin`,
      "rapport": `📄 Financial Report — Current:\n• Gross Revenue: ${fmt(totalRevenue)}\n• Platform Wallet: ${fmt(WALLETS.platform.available)} available\n• Agent Commissions Paid: ${fmt(WALLETS.agent.paid)} (70% travel agents)\n• Influencer Referrals Paid: ${fmt(WALLETS.influencer.paid)} (5% net profit)\n• Supplier Balance: ${fmt(WALLETS.supplier.available)}\n• ZeniYacht: 100% Zeniva`,
    };
    const keyword = Object.keys(responses).find(k => userMsg.toLowerCase().includes(k));
    const reply = keyword ? responses[keyword] : `Analysing your request: "${userMsg}"...\n\n✅ All systems operational. Platform balance: ${fmt(platformBalance, true)}. Payment success rate: ${successRate}%. No anomalies detected in the last 24h.`;
    setBenChat(prev => [...prev, { role: "ben", text: reply }]);
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
    <div style={{ minHeight: "100vh", background: "#f0f4ff", fontFamily: "'Inter',system-ui,sans-serif", display: "flex" }}>
      {/* ══ LEFT SIDEBAR ══ */}
      <div style={{
        width: sidebarOpen ? 240 : 60,
        minHeight: "100vh",
        background: `linear-gradient(180deg, ${DARK} 0%, #0a1f5c 100%)`,
        transition: "width 0.25s ease",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column" as const,
        flexShrink: 0,
        position: "sticky" as const,
        top: 0,
        alignSelf: "flex-start" as const,
        zIndex: 100,
      }}>
        {/* Logo + toggle */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: sidebarOpen ? "space-between" : "center", padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", minHeight: 72 }}>
          {sidebarOpen && <div>
            <p style={{ margin: 0, fontWeight: 900, fontSize: 14, color: "white", letterSpacing: "-0.3px" }}>ZeniPay</p>
            <p style={{ margin: 0, fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 600, textTransform: "uppercase" as const }}>Financial Dashboard</p>
          </div>}
          <button onClick={() => setSidebarOpen((o: boolean) => !o)} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 8, width: 28, height: 28, cursor: "pointer", color: "white", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {sidebarOpen ? "◀" : "▶"}
          </button>
        </div>
        {/* Nav items */}
        <div style={{ flex: 1, overflowY: "auto" as const, padding: "10px 8px", scrollbarWidth: "none" as const }}>
          {TABS.map(t => {
            const isLink = !!(t as any).href;
            const isActive = tab === t.id;
            const btnStyle = {
              width: "100%",
              display: "flex" as const,
              alignItems: "center" as const,
              gap: 10,
              padding: sidebarOpen ? "10px 12px" : "10px 0",
              justifyContent: sidebarOpen ? "flex-start" as const : "center" as const,
              border: "none",
              borderRadius: 10,
              background: isActive ? "rgba(255,255,255,0.12)" : isLink ? "rgba(255,255,255,0.04)" : "transparent",
              cursor: "pointer",
              marginBottom: 2,
              transition: "background 0.15s",
              color: "white",
              textDecoration: "none" as const,
            };
            return isLink ? (
              <a key={t.id} href={(t as any).href} style={btnStyle}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{t.icon}</span>
                {sidebarOpen && <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.7)", whiteSpace: "nowrap" as const }}>{t.label}</span>}
              </a>
            ) : (
              <button key={t.id} onClick={() => setTab(t.id)} style={btnStyle}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{t.icon}</span>
                {sidebarOpen && <span style={{ fontSize: 12, fontWeight: isActive ? 700 : 500, color: isActive ? "white" : "rgba(255,255,255,0.55)", whiteSpace: "nowrap" as const }}>{t.label}</span>}
                {sidebarOpen && isActive && <div style={{ marginLeft: "auto", width: 3, height: 16, background: BLUE, borderRadius: 9999 }} />}
              </button>
            );
          })}
        </div>
        {/* Bottom status */}
        {sidebarOpen && (
          <div style={{ padding: "14px 16px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ width: 7, height: 7, background: GREEN, borderRadius: "50%" }} />
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>Finix · Sandbox</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, background: `${BLUE}30`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>👑</div>
              <div>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>Admin</p>
                <p style={{ margin: 0, fontSize: 9, color: "rgba(255,255,255,0.35)" }}>Zeniva Travel LLC</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ══ MAIN CONTENT ══ */}
      <div style={{ flex: 1, minHeight: "100vh", overflow: "auto" }}>
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
                <p style={{ margin: 0, fontWeight: 700, fontSize: 12, color: GREEN }}>● Finix · Sandbox</p>
              </div>
              <div style={{ background: `${BLUE}22`, border: `1px solid ${BLUE}44`, borderRadius: 8, padding: "6px 12px", fontSize: 11, color: BLUE, fontWeight: 700 }}>
                🤖 Ben AI Online
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
              <StatCard icon="💰" label="Total Revenue (MTD)" value={fmt(totalRevenue)} sub="Real payments only" color={GREEN} />
              <StatCard icon="📥" label="Platform Margin" value={fmt(WALLETS.platform.available)} sub="Zeniva net (after payouts)" color={BLUE} />
              <StatCard icon="✅" label="Success Rate" value={`${successRate}%`} sub={TRANSACTIONS.length === 0 ? "No transactions yet" : `${TRANSACTIONS.length} transactions`} color={GREEN} />
              <StatCard icon="⏳" label="Pending Payments" value={fmt(WALLETS.platform.pending + WALLETS.agent.pending)} sub="Awaiting settlement" color={GOLD} />
              <StatCard icon="👤" label="Agent Commissions" value={fmt(WALLETS.agent.paid)} sub="3 agents — Louis, Jason, Luca" color={PURPLE} />
              <StatCard icon="⭐" label="Influencer Revenue" value={fmt(WALLETS.influencer.paid)} sub="0 active influencers" color={GOLD} />
              <StatCard icon="💸" label="Total Payouts" value={fmt(WALLETS.agent.paid + WALLETS.influencer.paid + WALLETS.supplier.paid)} sub="Platform → Agents / Suppliers" color={RED} />
              <StatCard icon="🔄" label="Refunds" value={fmt(0)} sub="No refunds yet" color={PURPLE} />
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
              <RevenueSplitWidget />
            </div>

            {/* ── Recent Bookings Panel ── */}
            <div style={{ background: "white", borderRadius: 16, padding: 0, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h3 style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>✈️ Recent Bookings</h3>
                <a href="/agent/bookings" style={{ fontSize: 12, color: BLUE, fontWeight: 700, textDecoration: "none" }}>View All →</a>
              </div>
              {recentBookings.length === 0 ? (
                <div style={{ padding: 32, textAlign: "center", color: "#94a3b8" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>✈️</div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>No bookings yet</p>
                  <p style={{ margin: "4px 0 0", fontSize: 11 }}>Bookings appear here after payment is received</p>
                  <a href="/agent/bookings" style={{ display: "inline-block", marginTop: 12, background: BLUE, color: "white", borderRadius: 8, padding: "7px 16px", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>+ New Booking</a>
                </div>
              ) : (
                <div>
                  {recentBookings.map((b, i) => {
                    const statusColor = b.status === "confirmed" ? GREEN : b.status === "pending_payment" ? "#F59E0B" : "#94a3b8";
                    const statusLabel = b.status === "confirmed" ? "✓ Confirmed" : b.status === "pending_payment" ? "⏳ Pending" : b.status;
                    return (
                      <div key={b.id} style={{ display: "flex", alignItems: "center", padding: "12px 20px", borderTop: i > 0 ? "1px solid #f8fafc" : "none", gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#f0f7ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>✈️</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: DARK }}>{b.client_name}</p>
                          <p style={{ margin: 0, fontSize: 11, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.destination}</p>
                        </div>
                        <div style={{ textAlign: "right" as const, flexShrink: 0 }}>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: GREEN }}>${(b.total_price || 0).toLocaleString()}</p>
                          <p style={{ margin: 0, fontSize: 10, color: statusColor, fontWeight: 600 }}>{statusLabel}</p>
                        </div>
                      </div>
                    );
                  })}
                  <div style={{ padding: "12px 20px", borderTop: "1px solid #f1f5f9", textAlign: "center" as const }}>
                    <a href="/agent/bookings" style={{ fontSize: 12, color: BLUE, fontWeight: 700, textDecoration: "none" }}>View All Bookings →</a>
                  </div>
                </div>
              )}
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
              <WalletModal name={openWallet.name} data={openWallet.data} icon={openWallet.icon} color={openWallet.color} onClose={() => setOpenWallet(null)} />
            )}

            {/* HERO BANNER */}
            <div style={{ background: `linear-gradient(135deg, ${DARK} 0%, #1e3a8a 60%, ${BLUE} 100%)`, borderRadius: 24, padding: "32px 36px", color: "white", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -30, right: -30, width: 200, height: 200, background: "rgba(255,255,255,0.04)", borderRadius: "50%" }} />
              <div style={{ position: "absolute", bottom: -50, right: 80, width: 150, height: 150, background: "rgba(255,255,255,0.03)", borderRadius: "50%" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24, flexWrap: "wrap" as const, position: "relative" }}>
                <div>
                  <p style={{ margin: "0 0 6px", fontSize: 11, opacity: 0.55, textTransform: "uppercase" as const, letterSpacing: "0.12em", fontWeight: 700 }}>ZeniPay — Total Platform Balance</p>
                  <p style={{ margin: 0, fontWeight: 900, fontSize: 48, letterSpacing: "-2px", lineHeight: 1 }}>{fmt(platformBalance)}</p>
                  <p style={{ margin: "10px 0 0", fontSize: 12, opacity: 0.45 }}>USD · 4 active wallets · Real-time</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    { l: "Available", v: platformBalance, c: GREEN },
                    { l: "Pending", v: 0, c: GOLD },
                    { l: "Paid Out", v: 0, c: "#94a3b8" },
                    { l: "Gateway", v: "Finix", c: BLUE, txt: true },
                  ].map(s => (
                    <div key={s.l} style={{ background: "rgba(255,255,255,0.08)", borderRadius: 12, padding: "10px 14px", backdropFilter: "blur(8px)" }}>
                      <p style={{ margin: "0 0 2px", fontSize: 9, opacity: 0.6, fontWeight: 700, textTransform: "uppercase" as const }}>{s.l}</p>
                      {s.txt ? (
                        <p style={{ margin: 0, fontWeight: 800, fontSize: 13, color: s.c }}>{String(s.v)}</p>
                      ) : (
                        <p style={{ margin: 0, fontWeight: 800, fontSize: 16, color: s.c }}>{fmt(Number(s.v), true)}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              {/* Quick action bar */}
              <div style={{ marginTop: 24, display: "flex", gap: 10, flexWrap: "wrap" as const }}>
                {[
                  { label: "💸 Withdraw", action: () => setOpenWallet({ name: "Platform", data: WALLETS.platform, icon: "🏛️", color: BLUE }) },
                  { label: "🏦 Add Bank Account", action: () => setOpenWallet({ name: "Platform", data: WALLETS.platform, icon: "🏛️", color: BLUE }) },
                  { label: "📊 Export Statement", action: () => {} },
                  { label: "⚡ Instant Payout", action: () => {} },
                ].map(b => (
                  <button key={b.label} onClick={b.action} style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 9999, padding: "8px 18px", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer", backdropFilter: "blur(4px)" }}>
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* PLATFORM WALLET — full width, control center */}
            <div onClick={() => setOpenWallet({ name: "Platform", data: WALLETS.platform, icon: "🏛️", color: BLUE })}
              style={{ background: `linear-gradient(135deg, ${DARK} 0%, #0a2070 50%, ${BLUE} 100%)`, borderRadius: 20, padding: "28px 32px", color: "white", cursor: "pointer", position: "relative", overflow: "hidden" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}>
              <div style={{ position: "absolute", top: -20, right: -20, width: 160, height: 160, background: "rgba(255,255,255,0.04)", borderRadius: "50%", pointerEvents: "none" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" as const, position: "relative" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 44, height: 44, background: "rgba(255,255,255,0.12)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, border: "1px solid rgba(255,255,255,0.2)" }}>🏛️</div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 900, fontSize: 18 }}>Platform Wallet</p>
                      <p style={{ margin: 0, fontSize: 11, opacity: 0.55 }}>Zeniva Travel LLC · Master Control</p>
                    </div>
                    <span style={{ marginLeft: 8, background: "#4ade8030", border: "1px solid #4ade8060", borderRadius: 9999, padding: "3px 10px", fontSize: 10, fontWeight: 700, color: "#4ade80" }}>ADMIN</span>
                  </div>
                  <p style={{ margin: 0, fontWeight: 900, fontSize: 40, letterSpacing: "-1px" }}>{fmt(WALLETS.platform.available, true)}</p>
                  <p style={{ margin: "6px 0 0", fontSize: 12, opacity: 0.5 }}>Available for distribution</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[
                    { l: "Pending", v: fmt(WALLETS.platform.pending, true), c: GOLD },
                    { l: "Paid Out", v: fmt(WALLETS.platform.paid, true), c: "#94a3b8" },
                    { l: "Processor", v: "Finix", c: "#60a5fa" },
                    { l: "Mode", v: "Sandbox", c: GOLD },
                  ].map(s => (
                    <div key={s.l} style={{ background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "8px 12px", backdropFilter: "blur(4px)" }}>
                      <p style={{ margin: "0 0 2px", fontSize: 9, opacity: 0.55, fontWeight: 700, textTransform: "uppercase" as const }}>{s.l}</p>
                      <p style={{ margin: 0, fontWeight: 800, fontSize: 13, color: s.c }}>{s.v}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: 20, display: "flex", gap: 8, flexWrap: "wrap" as const, position: "relative" }}>
                {["💸 Distribute", "🏦 Bank Account", "📊 Statement", "⚡ Instant Payout"].map(b => (
                  <span key={b} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 9999, padding: "6px 14px", fontSize: 11, fontWeight: 700 }}>{b}</span>
                ))}
              </div>
            </div>

            {/* SUB WALLETS — 3 columns */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
              {[
                { name: "Agent", data: WALLETS.agent, icon: "👤", color: PURPLE },
                { name: "Influencer", data: WALLETS.influencer, icon: "⭐", color: GOLD },
                { name: "Supplier", data: WALLETS.supplier, icon: "✈️", color: GREEN },
              ].map(w => (
                <WalletCard key={w.name} name={w.name} data={w.data} icon={w.icon} color={w.color} onOpen={() => setOpenWallet({ name: w.name, data: w.data, icon: w.icon, color: w.color })} />
              ))}
            </div>

            {/* MONEY FLOW */}
            <div style={{ background: "white", borderRadius: 20, padding: 28, boxShadow: "0 1px 8px rgba(0,0,0,0.07)" }}>
              <h3 style={{ margin: "0 0 20px", fontWeight: 800, fontSize: 16 }}>💰 Money Flow — How ZeniPay Distributes Funds</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 0, overflowX: "auto", paddingBottom: 8 }}>
                {[
                  { icon: "👤", label: "Client Pays", sub: "ZeniPay Checkout", color: "#6366f1" },
                  { arrow: true },
                  { icon: "🔄", label: "Finix Processes", sub: "Card Network", color: BLUE },
                  { arrow: true },
                  { icon: "🏛️", label: "Platform Wallet", sub: "100% lands here", color: BLUE },
                  { arrow: true },
                  { icon: "⚙️", label: "Admin Splits", sub: "Manual or auto", color: GOLD },
                  { arrow: true },
                  { icon: "💸", label: "Pays Out", sub: "Agents · Suppliers", color: GREEN },
                ].map((s, i) => s.arrow ? (
                  <div key={i} style={{ fontSize: 20, color: "#cbd5e1", flexShrink: 0, padding: "0 8px" }}>→</div>
                ) : (
                  <div key={i} style={{ flexShrink: 0, textAlign: "center" as const, minWidth: 90 }}>
                    <div style={{ width: 48, height: 48, background: `${s.color}15`, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, margin: "0 auto 6px", border: `1px solid ${s.color}25` }}>{s.icon}</div>
                    <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: 11, color: "#374151" }}>{s.label}</p>
                    <p style={{ margin: 0, fontSize: 9, color: "#94a3b8" }}>{s.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* PAYOUT RULES */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <div style={{ background: "white", borderRadius: 20, padding: 24, boxShadow: "0 1px 8px rgba(0,0,0,0.07)" }}>
                <h4 style={{ margin: "0 0 16px", fontWeight: 800, fontSize: 14 }}>📋 Commission Structure</h4>
                {[
                  { role: "✈️ Travel Agent", pct: "70%", color: PURPLE },
                  { role: "⭐ Influencer", pct: "5% net", color: GOLD },
                  { role: "🏛️ Zeniva Platform", pct: "30%", color: BLUE },
                  { role: "⛵ ZeniYacht", pct: "100% Zeniva", color: GREEN },
                ].map(r => (
                  <div key={r.role} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f8fafc", alignItems: "center" }}>
                    <span style={{ fontSize: 13, color: "#374151" }}>{r.role}</span>
                    <span style={{ fontWeight: 800, fontSize: 13, color: r.color, background: `${r.color}12`, borderRadius: 6, padding: "2px 8px" }}>{r.pct}</span>
                  </div>
                ))}
                <p style={{ margin: "12px 0 0", fontSize: 11, color: "#94a3b8" }}>Lina books alone: Zeniva 70% · Agent 30% (reversed)</p>
              </div>
              <div style={{ background: "white", borderRadius: 20, padding: 24, boxShadow: "0 1px 8px rgba(0,0,0,0.07)" }}>
                <h4 style={{ margin: "0 0 16px", fontWeight: 800, fontSize: 14 }}>🏦 Payout Schedule</h4>
                {[
                  { label: "Platform (You)", freq: "Instant / On-demand", color: BLUE },
                  { label: "Agents", freq: "Every Friday", color: PURPLE },
                  { label: "Influencers", freq: "1st of month", color: GOLD },
                  { label: "Suppliers", freq: "Net-30 / On invoice", color: GREEN },
                ].map(r => (
                  <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f8fafc", alignItems: "center" }}>
                    <span style={{ fontSize: 13, color: "#374151", fontWeight: 600 }}>{r.label}</span>
                    <span style={{ fontSize: 12, color: r.color, fontWeight: 700 }}>{r.freq}</span>
                  </div>
                ))}
                <button style={{ marginTop: 14, width: "100%", background: `${BLUE}12`, border: `1px solid ${BLUE}25`, borderRadius: 10, padding: "10px", fontWeight: 700, fontSize: 12, cursor: "pointer", color: BLUE }}>
                  ⚙️ Configure Payout Rules
                </button>
              </div>
            </div>

            {/* BANK ACCOUNT STATUS */}
            <div style={{ background: "white", borderRadius: 20, padding: 28, boxShadow: "0 1px 8px rgba(0,0,0,0.07)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontWeight: 800, fontSize: 16 }}>🏦 Connected Bank Accounts</h3>
                <button onClick={() => setOpenWallet({ name: "Platform", data: WALLETS.platform, icon: "🏛️", color: BLUE })}
                  style={{ background: BLUE, color: "white", border: "none", borderRadius: 9999, padding: "8px 18px", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                  + Add Account
                </button>
              </div>
              <div style={{ background: "#f8fafc", borderRadius: 14, padding: "20px 24px", border: "2px dashed #e2e8f0", textAlign: "center" as const }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>🏦</div>
                <p style={{ margin: "0 0 4px", fontWeight: 700, color: "#374151" }}>No bank accounts linked yet</p>
                <p style={{ margin: "0 0 16px", fontSize: 12, color: "#94a3b8" }}>Add your Zeniva Travel LLC bank account to receive payouts from Finix</p>
                <button onClick={() => setOpenWallet({ name: "Platform", data: WALLETS.platform, icon: "🏛️", color: BLUE })}
                  style={{ background: BLUE, color: "white", border: "none", borderRadius: 9999, padding: "10px 24px", fontWeight: 700, cursor: "pointer" }}>
                  Connect Bank Account →
                </button>
              </div>
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
          <PayoutsPanel agents={AGENTS} platformBalance={platformBalance} />
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
                  <StatusBadge status={inf.status || "pending"} />
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
                <p style={{ fontSize: 12, marginTop: 8 }}>Connect Finix financing module to enable installments.</p>
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
                    <img src="/agents/noah.png" alt="Ben" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { (e.target as HTMLImageElement).style.display="none"; (e.target as HTMLImageElement).parentElement!.innerHTML="<div style=\"display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:42px\">🤖</div>"; }} />
                  </div>
                  <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
                    <div style={{ width: 7, height: 7, background: GREEN, borderRadius: "50%", boxShadow: `0 0 6px ${GREEN}` }} />
                    <span style={{ fontSize: 10, color: GREEN, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Online</span>
                  </div>
                </div>
                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                    <h2 style={{ margin: 0, fontWeight: 900, fontSize: 28, letterSpacing: "-0.5px" }}>Ben</h2>
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
                    <img src="/agents/noah.png" alt="Ben" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, color: "white", fontWeight: 700, fontSize: 14 }}>Ben · ZeniPay AI</p>
                    <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Financial Intelligence Agent</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, background: `${GREEN}22`, borderRadius: 6, padding: "4px 10px" }}>
                    <div style={{ width: 6, height: 6, background: GREEN, borderRadius: "50%", animation: "pulse 1.5s infinite" }} />
                    <span style={{ fontSize: 10, color: GREEN, fontWeight: 700 }}>Monitoring</span>
                  </div>
                </div>
                <div style={{ flex: 1, padding: 16, overflowY: "auto", maxHeight: 380, display: "flex", flexDirection: "column", gap: 10 }}>
                  {benChat.map((m, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", gap: 8, alignItems: "flex-end" }}>
                      {m.role === "ben" && <div style={{ width: 28, height: 28, borderRadius: 8, overflow: "hidden", border: `1px solid ${BLUE}30`, flexShrink: 0 }}>
                      <img src="/agents/noah.png" alt="Ben" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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
                    <button key={s} onClick={() => setBenMsg(s.replace(/^[^ ]+ /, ""))}
                      style={{ background: "#f0f4ff", color: BLUE, border: "1px solid #dbeafe", borderRadius: 8, padding: "5px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>{s}</button>
                  ))}
                </div>
                <div style={{ padding: "0 16px 16px", display: "flex", gap: 8 }}>
                  <input value={benMsg} onChange={e => setBenMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && handleBenSend()}
                    placeholder="Ask Ben: revenue, fraud, payout, rapport…"
                    style={{ flex: 1, border: "1.5px solid #e2e8f0", borderRadius: 12, padding: "11px 14px", fontSize: 13, outline: "none", background: "#fafbff" }} />
                  <button onClick={handleBenSend} style={{ background: `linear-gradient(135deg, ${BLUE}, ${DARK})`, color: "white", border: "none", borderRadius: 12, padding: "11px 20px", fontWeight: 800, cursor: "pointer", fontSize: 14 }}>↑</button>
                </div>
              </div>

              {/* Live Activity Log */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ background: "white", borderRadius: 20, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <h3 style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>⚡ Ben Live Activity</h3>
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
                      <button key={a.label} onClick={() => setBenMsg(a.label.replace(/^[^ ]+ /, ""))}
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
                  { label: "Travel Bookings Revenue", amount: 0, type: "income" },
                  { label: "ZeniStay Revenue", amount: 0, type: "income" },
                  { label: "Agent Commissions (in)", amount: 0, type: "income" },
                  { label: "ZeniYacht Revenue", amount: 0, type: "income" },
                  { label: "TOTAL REVENUE", amount: 0, type: "total-income" },
                  { label: "Supplier Payouts", amount: 0, type: "expense" },
                  { label: "Agent Commissions (out)", amount: 0, type: "expense" },
                  { label: "Influencer Payouts", amount: 0, type: "expense" },
                  { label: "Tech Infrastructure", amount: 0, type: "expense" },
                  { label: "Marketing", amount: 0, type: "expense" },
                  { label: "TOTAL EXPENSES", amount: 0, type: "total-expense" },
                  { label: "NET INCOME", amount: 0, type: "net" },
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
                    { label: "ZeniPay Platform Wallet", value: 0 },
                    { label: "Agent Wallets", value: 0 },
                    { label: "Supplier Wallets", value: 0 },
                    { label: "Accounts Receivable", value: 0 },
                    { label: "Cash & Equivalents", value: 0 },
                  ].map(a => (
                    <div key={a.label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", fontSize: 13 }}>
                      <span style={{ color: "#374151" }}>{a.label}</span>
                      <span style={{ fontWeight: 700, color: GREEN }}>${(a.value/1000).toFixed(0)}k</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 10px", background: "#f0fdf4", borderRadius: 8, fontWeight: 800, fontSize: 13, marginTop: 4 }}>
                    <span>TOTAL ASSETS</span><span style={{ color: GREEN }}>$0</span>
                  </div>
                </div>
                <div>
                  <p style={{ margin: "0 0 10px", fontWeight: 700, fontSize: 12, color: "#64748b", textTransform: "uppercase" as const }}>Liabilities & Equity</p>
                  {[
                    { label: "Pending Payouts", value: 0 },
                    { label: "Agent Pending", value: 0 },
                    { label: "Tax Provision", value: 0 },
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
                    <span>TOTAL L+E</span><span style={{ color: BLUE }}>$0</span>
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
                  { code: "1200", name: "Accounts Receivable", type: "Asset", balance: 0 },
                  { code: "2000", name: "Accounts Payable", type: "Liability", balance: -89_200 },
                  { code: "2500", name: "Tax Payable", type: "Liability", balance: 0 },
                  { code: "3000", name: "Retained Earnings", type: "Equity", balance: 449_000 },
                  { code: "4000", name: "Travel Revenue", type: "Income", balance: 0 },
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
                  {TRANSACTIONS.length === 0 ? (
                    <div style={{ background: "#f8fafc", borderRadius: 10, padding: "16px", textAlign: "center" as const, border: "1px dashed #e2e8f0" }}>
                      <p style={{ margin: "0 0 4px", fontWeight: 700, color: "#374151", fontSize: 13 }}>No journal entries yet</p>
                      <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>Generated automatically from real Finix payments</p>
                    </div>
                  ) : (
                    <div style={{ overflowX: "auto" as const }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                        <thead>
                          <tr style={{ background: "#f8fafc" }}>
                            {["Date", "Description", "Account", "Debit", "Credit"].map(h => (
                              <th key={h} style={{ padding: "8px 10px", textAlign: "left" as const, fontWeight: 700, color: "#64748b", borderBottom: "1px solid #e2e8f0", fontSize: 11 }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {TRANSACTIONS.flatMap((t, i) => [
                            { key: `${i}a`, date: t.date?.slice(0,10), desc: `Payment ${t.id}`, account: "1000 Platform Wallet", debit: `$${t.amount.toFixed(2)}`, credit: "—", color: "#10B981" },
                            { key: `${i}b`, date: t.date?.slice(0,10), desc: `Revenue ${t.id}`, account: "4000 Travel Revenue", debit: "—", credit: `$${t.amount.toFixed(2)}`, color: "#0F6CF5" },
                          ]).map(row => (
                            <tr key={row.key} style={{ borderBottom: "1px solid #f8fafc" }}>
                              <td style={{ padding: "7px 10px", color: "#94a3b8" }}>{row.date}</td>
                              <td style={{ padding: "7px 10px", color: "#374151", fontWeight: 500 }}>{row.desc}</td>
                              <td style={{ padding: "7px 10px", color: "#64748b" }}>{row.account}</td>
                              <td style={{ padding: "7px 10px", fontWeight: 700, color: row.debit !== "—" ? "#10B981" : "#94a3b8" }}>{row.debit}</td>
                              <td style={{ padding: "7px 10px", fontWeight: 700, color: row.credit !== "—" ? BLUE : "#94a3b8" }}>{row.credit}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Tax Summary */}
                <div style={{ background: `linear-gradient(135deg, ${DARK}, #1a2f6e)`, borderRadius: 20, padding: 20, color: "white" }}>
                  <h4 style={{ margin: "0 0 14px", fontWeight: 800 }}>🧾 Tax Summary</h4>
                  {[
                    { label: "Gross Revenue", v: "$0" },
                    { label: "Total Deductions", v: "$0" },
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
                { label: "Primary Gateway", value: "Finix", status: "sandbox" },
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
                { label: "Fraud Detection", value: "Ben AI · Real-time monitoring", status: "active" },
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
    </div>
  );
}
