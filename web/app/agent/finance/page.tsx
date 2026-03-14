"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore, isHQ } from "@/src/lib/authStore";

const PREMIUM_BLUE = "#0B1B4D";
const BRAND_BLUE = "#0F6CF5";
const ACCENT_GOLD = "#E6B85A";

// ─── Finance types ─────────────────────────────────────────────────────────
interface FinanceStats {
  total_revenue: number; commissions_paid: number; commissions_pending: number;
  bookings_this_month: number; revenue_this_month: number; avg_deal_value: number;
}
interface Commission {
  id: string; agent_name: string; agent_email: string; client_name: string;
  trip: string; sale_amount: number; zeniva_profit: number; commission: number;
  status: "pending" | "paid"; created_at: string;
}
interface Booking {
  id: string; client_name: string; destination: string; total_price: number;
  status: string; departure_date: string; agent_email?: string;
}

// ─── Invoice types ─────────────────────────────────────────────────────────
type InvoiceItem = { description: string; qty: number; unitPrice: number };
type Invoice = {
  id: string; type: "outgoing" | "incoming"; client_name?: string; client_email?: string;
  amount: number; currency: string;
  status: "draft" | "sent" | "paid" | "overdue" | "pending" | "cancelled";
  items: InvoiceItem[]; notes?: string; due_date?: string; paid_at?: string;
  source?: string; email_subject?: string; email_from?: string; email_date?: string;
  created_at: string;
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const INV_STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600", sent: "bg-blue-100 text-blue-700",
  paid: "bg-emerald-100 text-emerald-700", overdue: "bg-red-100 text-red-700",
  pending: "bg-amber-100 text-amber-700", cancelled: "bg-gray-100 text-gray-500",
};
function fmtMoney(n: number, cur = "CAD") {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: cur }).format(n);
}
function fmtDate(s?: string) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" });
}

// ─── Create Invoice Modal ──────────────────────────────────────────────────
function CreateInvoiceModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ client_name: "", client_email: "", currency: "CAD", due_date: "", notes: "" });
  const [items, setItems] = useState<InvoiceItem[]>([{ description: "", qty: 1, unitPrice: 0 }]);
  const [saving, setSaving] = useState(false);
  const total = items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const addItem = () => setItems([...items, { description: "", qty: 1, unitPrice: 0 }]);
  const updateItem = (idx: number, field: keyof InvoiceItem, val: string | number) =>
    setItems(items.map((it, i) => i === idx ? { ...it, [field]: val } : it));
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  const save = async (status: "draft" | "sent") => {
    if (!form.client_name || items.every(i => !i.description)) return;
    setSaving(true);
    await fetch(`${SUPABASE_URL}/rest/v1/invoices`, {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify({ ...form, type: "outgoing", status, items, amount: total, source: "manual", created_at: new Date().toISOString() }),
    });
    setSaving(false); onSaved(); onClose();
  };
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">New Client Invoice</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">×</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs font-semibold text-slate-600 mb-1 block">Client Name *</label>
              <input className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" value={form.client_name} onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))} placeholder="John Smith" /></div>
            <div><label className="text-xs font-semibold text-slate-600 mb-1 block">Client Email</label>
              <input type="email" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" value={form.client_email} onChange={e => setForm(f => ({ ...f, client_email: e.target.value }))} placeholder="john@email.com" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs font-semibold text-slate-600 mb-1 block">Currency</label>
              <select className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
                <option>CAD</option><option>USD</option><option>EUR</option>
              </select></div>
            <div><label className="text-xs font-semibold text-slate-600 mb-1 block">Due Date</label>
              <input type="date" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} /></div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-600">Line Items *</label>
              <button onClick={addItem} className="text-xs px-3 py-1 rounded-lg font-semibold" style={{ background: BRAND_BLUE, color: "white" }}>+ Add Item</button>
            </div>
            {items.map((it, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 mb-2">
                <input className="col-span-6 border border-slate-200 rounded-xl px-3 py-2 text-sm" placeholder="Description" value={it.description} onChange={e => updateItem(idx, "description", e.target.value)} />
                <input type="number" className="col-span-2 border border-slate-200 rounded-xl px-3 py-2 text-sm" placeholder="Qty" value={it.qty} min={1} onChange={e => updateItem(idx, "qty", Number(e.target.value))} />
                <input type="number" className="col-span-3 border border-slate-200 rounded-xl px-3 py-2 text-sm" placeholder="Price" value={it.unitPrice} min={0} onChange={e => updateItem(idx, "unitPrice", Number(e.target.value))} />
                <button onClick={() => removeItem(idx)} className="col-span-1 text-red-400 hover:text-red-600 text-lg">×</button>
              </div>
            ))}
            <div className="text-right font-bold text-lg mt-2" style={{ color: PREMIUM_BLUE }}>
              Total: {fmtMoney(total, form.currency)}
            </div>
          </div>
          <div><label className="text-xs font-semibold text-slate-600 mb-1 block">Notes</label>
            <textarea className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Payment terms, additional info..." /></div>
        </div>
        <div className="p-6 border-t border-slate-100 flex justify-between">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200">Cancel</button>
          <div className="flex gap-2">
            <button onClick={() => save("draft")} disabled={saving} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50">Save Draft</button>
            <button onClick={() => save("sent")} disabled={saving} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: BRAND_BLUE }}>
              {saving ? "Sending..." : "Send to Client"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Invoice Tab Content ───────────────────────────────────────────────────
function InvoiceTab() {
  const [invoiceTab, setInvoiceTab] = useState<"outgoing" | "incoming">("outgoing");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invLoading, setInvLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanMsg, setScanMsg] = useState("");
  const [invStats, setInvStats] = useState({ revenuePaid: 0, outstanding: 0, expensesPaid: 0, billsPending: 0 });

  const loadInvoices = useCallback(async () => {
    setInvLoading(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/invoices?select=*&order=created_at.desc&limit=200`, {
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      });
      if (!res.ok) throw new Error("table_missing");
      const data: Invoice[] = await res.json();
      setInvoices(data);
      const out = data.filter(i => i.type === "outgoing");
      const inc = data.filter(i => i.type === "incoming");
      setInvStats({
        revenuePaid: out.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0),
        outstanding: out.filter(i => i.status === "sent" || i.status === "overdue").reduce((s, i) => s + i.amount, 0),
        expensesPaid: inc.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0),
        billsPending: inc.filter(i => i.status === "pending").reduce((s, i) => s + i.amount, 0),
      });
    } catch {
      setInvoices([]);
    } finally {
      setInvLoading(false);
    }
  }, []);

  useEffect(() => { loadInvoices(); }, [loadInvoices]);

  const scanEmails = async () => {
    setScanning(true); setScanMsg("");
    try {
      const res = await fetch("/api/invoices/scan-emails", {
        method: "POST", headers: { Authorization: "Bearer zeniva-secret-2025" },
      });
      const d = await res.json();
      setScanMsg(d.message || `${d.added} new invoices imported`);
      if ((d.added || 0) > 0) loadInvoices();
    } catch { setScanMsg("Scan failed — try again"); }
    finally { setScanning(false); }
  };

  const markPaid = async (id: string) => {
    await fetch(`${SUPABASE_URL}/rest/v1/invoices?id=eq.${id}`, {
      method: "PATCH", headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ status: "paid", paid_at: new Date().toISOString() }),
    });
    loadInvoices();
  };

  const deleteInv = async (id: string) => {
    if (!confirm("Delete this invoice?")) return;
    await fetch(`${SUPABASE_URL}/rest/v1/invoices?id=eq.${id}`, {
      method: "DELETE", headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    });
    loadInvoices();
  };

  const filtered = invoices.filter(i => i.type === invoiceTab);

  return (
    <div className="space-y-4">
      {/* Invoice KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Revenue Paid", value: fmtMoney(invStats.revenuePaid), icon: "💵", color: "bg-emerald-500" },
          { label: "Outstanding", value: fmtMoney(invStats.outstanding), icon: "⏳", color: "bg-amber-500" },
          { label: "Expenses Paid", value: fmtMoney(invStats.expensesPaid), icon: "💳", color: "bg-blue-500" },
          { label: "Bills Pending", value: fmtMoney(invStats.billsPending), icon: "📬", color: "bg-red-500" },
        ].map(k => (
          <div key={k.label} className={`${k.color} rounded-2xl p-4 text-white`}>
            <div className="text-xl mb-1">{k.icon}</div>
            <div className="text-xl font-black">{k.value}</div>
            <div className="text-xs text-white/80">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Actions bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2">
          <button onClick={() => setInvoiceTab("outgoing")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold ${invoiceTab === "outgoing" ? "text-white" : "bg-white/10 text-white/70"}`}
            style={invoiceTab === "outgoing" ? { background: BRAND_BLUE } : {}}>
            📤 Client Invoices ({invoices.filter(i => i.type === "outgoing").length})
          </button>
          <button onClick={() => setInvoiceTab("incoming")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold ${invoiceTab === "incoming" ? "text-white" : "bg-white/10 text-white/70"}`}
            style={invoiceTab === "incoming" ? { background: BRAND_BLUE } : {}}>
            📥 Bills & Receipts ({invoices.filter(i => i.type === "incoming").length})
          </button>
        </div>
        <div className="flex gap-2">
          {invoiceTab === "outgoing" && (
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
              style={{ background: ACCENT_GOLD, color: PREMIUM_BLUE }}>
              ➕ New Invoice
            </button>
          )}
          {invoiceTab === "incoming" && (
            <button onClick={scanEmails} disabled={scanning}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-60">
              {scanning ? "⏳ Scanning..." : "📧 Scan Emails"}
            </button>
          )}
        </div>
      </div>
      {scanMsg && <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-semibold border border-emerald-200">✅ {scanMsg}</div>}

      {/* Invoice list */}
      <div className="bg-white rounded-2xl overflow-hidden">
        {invLoading ? (
          <div className="p-8 text-center text-slate-400">Loading invoices...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">{invoiceTab === "outgoing" ? "📤" : "📥"}</div>
            <p className="text-slate-500 font-semibold">{invoiceTab === "outgoing" ? "No client invoices yet" : "No bills or receipts yet"}</p>
            <p className="text-slate-400 text-sm mt-1">{invoiceTab === "outgoing" ? "Click '+ New Invoice' to create one" : "Click '📧 Scan Emails' to import from Gmail"}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map(inv => (
              <div key={inv.id} className="p-4 hover:bg-slate-50 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-bold text-slate-800 text-sm truncate">
                      {inv.type === "outgoing" ? (inv.client_name || "Unknown Client") : (inv.email_from || inv.email_subject || "Receipt")}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${INV_STATUS_COLORS[inv.status] || "bg-slate-100 text-slate-600"}`}>
                      {inv.status}
                    </span>
                  </div>
                  {inv.type === "incoming" && inv.email_subject && (
                    <p className="text-xs text-slate-500 truncate">{inv.email_subject}</p>
                  )}
                  {inv.type === "outgoing" && inv.notes && (
                    <p className="text-xs text-slate-400 truncate">{inv.notes}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1">
                    <span className="font-black text-sm" style={{ color: PREMIUM_BLUE }}>{fmtMoney(inv.amount || 0, inv.currency)}</span>
                    {inv.due_date && <span className="text-xs text-slate-400">Due: {fmtDate(inv.due_date)}</span>}
                    {inv.email_date && <span className="text-xs text-slate-400">{fmtDate(inv.email_date)}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {inv.status !== "paid" && (
                    <button onClick={() => markPaid(inv.id)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
                      ✓ Paid
                    </button>
                  )}
                  <button onClick={() => deleteInv(inv.id)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-500 hover:bg-red-100">
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {showCreate && <CreateInvoiceModal onClose={() => setShowCreate(false)} onSaved={loadInvoices} />}
    </div>
  );
}

// ─── Main Finance Page ─────────────────────────────────────────────────────
export default function FinancePage() {
  const { user } = useAuthStore();
  const hq = isHQ(user);
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tab, setTab] = useState<"overview" | "commissions" | "bookings" | "invoices">("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hq) return;
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [cRes, bRes] = await Promise.all([
          fetch("/api/agents-proxy?path=admin/commissions"),
          fetch("/api/agents-proxy?path=admin/bookings"),
        ]);
        const cData = await cRes.json().catch(() => []);
        const bData = await bRes.json().catch(() => []);
        const comms: Commission[] = Array.isArray(cData) ? cData : [];
        const books: Booking[] = Array.isArray(bData) ? bData : [];
        setCommissions(comms);
        setBookings(books);
        const totalRev = books.reduce((s, b) => s + (b.total_price || 0), 0);
        const commPaid = comms.filter(c => c.status === "paid").reduce((s, c) => s + c.commission, 0);
        const commPending = comms.filter(c => c.status === "pending").reduce((s, c) => s + c.commission, 0);
        const now = new Date();
        const thisMonth = books.filter(b => new Date(b.departure_date).getMonth() === now.getMonth());
        setStats({
          total_revenue: totalRev, commissions_paid: commPaid, commissions_pending: commPending,
          bookings_this_month: thisMonth.length,
          revenue_this_month: thisMonth.reduce((s, b) => s + (b.total_price || 0), 0),
          avg_deal_value: books.length ? Math.round(totalRev / books.length) : 0,
        });
      } catch { setStats(null); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, [hq]);

  if (!hq) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: PREMIUM_BLUE }}>
        <div className="bg-white rounded-2xl p-10 text-center shadow-xl max-w-sm">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-black text-slate-800 mb-2">HQ Access Only</h2>
          <p className="text-slate-500 text-sm">Finance is restricted to Zeniva headquarters.</p>
        </div>
      </div>
    );
  }

  const fmt = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;

  const kpis = [
    { label: "Total Revenue", value: fmt(stats?.total_revenue ?? 0), icon: "💵", color: "from-blue-500 to-blue-700", sub: "All time" },
    { label: "This Month", value: fmt(stats?.revenue_this_month ?? 0), icon: "📅", color: "from-emerald-500 to-emerald-700", sub: `${stats?.bookings_this_month ?? 0} bookings` },
    { label: "Commissions Paid", value: fmt(stats?.commissions_paid ?? 0), icon: "✅", color: "from-purple-500 to-purple-700", sub: "To agents" },
    { label: "Commissions Pending", value: fmt(stats?.commissions_pending ?? 0), icon: "⏳", color: "from-amber-500 to-amber-700", sub: "Awaiting payout" },
    { label: "Avg Deal Value", value: fmt(stats?.avg_deal_value ?? 0), icon: "📊", color: "from-rose-500 to-rose-700", sub: "Per booking" },
    { label: "Net Profit Est.", value: fmt(Math.round((stats?.total_revenue ?? 0) * 0.2)), icon: "🏦", color: "from-slate-600 to-slate-800", sub: "~20% margin" },
  ];

  const tabs = [
    { id: "overview", label: "📊 Overview" },
    { id: "commissions", label: "💰 Commissions" },
    { id: "bookings", label: "✈️ Revenue" },
    { id: "invoices", label: "🧾 Invoices" },
  ];

  return (
    <div className="min-h-screen p-6 space-y-6" style={{ background: PREMIUM_BLUE }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">📊 Finance & Invoices</h1>
          <p className="text-white/60 text-sm mt-1">Revenue, commissions, invoices & accounting</p>
        </div>
        <button
          onClick={() => {
            const csv = commissions.map(c => `${c.agent_name},${c.client_name},${c.trip},${c.sale_amount},${c.commission},${c.status},${c.created_at}`).join("\n");
            const blob = new Blob(["Agent,Client,Trip,Sale,Commission,Status,Date\n" + csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a"); a.href = url; a.download = "zeniva-finance.csv"; a.click();
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: ACCENT_GOLD, color: PREMIUM_BLUE }}
        >
          ⬇️ Export CSV
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {kpis.map(k => (
          <div key={k.label} className={`bg-gradient-to-br ${k.color} rounded-2xl p-5 text-white`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{k.icon}</span>
              <span className="text-xs text-white/70">{k.sub}</span>
            </div>
            <div className="text-2xl font-black">{loading ? "—" : k.value}</div>
            <div className="text-xs text-white/80 mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === t.id ? "text-white shadow-lg" : "bg-white/10 text-white/70 hover:bg-white/20"}`}
            style={tab === t.id ? { background: BRAND_BLUE } : {}}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-black text-slate-800 mb-4">Revenue Breakdown</h3>
            {[
              { label: "Gross Revenue", value: stats?.total_revenue ?? 0, color: "bg-blue-500", max: stats?.total_revenue ?? 1 },
              { label: "Commissions Paid", value: stats?.commissions_paid ?? 0, color: "bg-purple-500", max: stats?.total_revenue ?? 1 },
              { label: "Commissions Pending", value: stats?.commissions_pending ?? 0, color: "bg-amber-500", max: stats?.total_revenue ?? 1 },
              { label: "Est. Net Profit (20%)", value: Math.round((stats?.total_revenue ?? 0) * 0.2), color: "bg-emerald-500", max: stats?.total_revenue ?? 1 },
            ].map(row => (
              <div key={row.label} className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">{row.label}</span>
                  <span className="font-bold text-slate-800">{fmt(row.value)}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${row.color} rounded-full transition-all duration-700`}
                    style={{ width: `${row.max > 0 ? Math.min(100, (row.value / row.max) * 100) : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-black text-slate-800 mb-4">Commission Structures</h3>
            {[
              { icon: "✈️", label: "Travel Agents", pct: "70%", sub: "agent · 30% Zeniva", color: "bg-blue-50 border-blue-200", textColor: "text-blue-700" },
              { icon: "🤖", label: "Lina Books Alone", pct: "70%", sub: "Zeniva · 30% agent", color: "bg-amber-50 border-amber-200", textColor: "text-amber-700" },
              { icon: "⛵", label: "Yacht Brokers", pct: "5%", sub: "agent · 95% Zeniva", color: "bg-indigo-50 border-indigo-200", textColor: "text-indigo-700" },
              { icon: "⭐", label: "Influencers", pct: "5%", sub: "influencer · 95% Zeniva", color: "bg-purple-50 border-purple-200", textColor: "text-purple-700" },
            ].map(row => (
              <div key={row.label} className={`rounded-xl p-3 mb-2 border ${row.color} flex items-center gap-3`}>
                <span className="text-xl">{row.icon}</span>
                <div className="flex-1">
                  <div className="font-bold text-slate-800 text-sm">{row.label}</div>
                  <div className="text-xs text-slate-500">{row.sub}</div>
                </div>
                <span className={`text-xl font-black ${row.textColor}`}>{row.pct}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Commissions Tab */}
      {tab === "commissions" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-black text-slate-800">All Commissions</h3>
            <p className="text-slate-500 text-sm">{commissions.length} total records</p>
          </div>
          {loading ? <div className="p-8 text-center text-slate-400">Loading...</div> :
           commissions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-3">💰</div>
              <p className="text-slate-500 font-semibold">No commissions yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>{["Agent", "Client", "Trip", "Sale", "Commission", "Status", "Date"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {commissions.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3"><div className="font-semibold">{c.agent_name || c.agent_email?.split("@")[0]}</div><div className="text-xs text-slate-400">{c.agent_email}</div></td>
                      <td className="px-4 py-3">{c.client_name}</td>
                      <td className="px-4 py-3">{c.trip}</td>
                      <td className="px-4 py-3 font-semibold">{fmt(c.sale_amount)}</td>
                      <td className="px-4 py-3 font-bold" style={{ color: ACCENT_GOLD }}>{fmt(c.commission)}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-bold ${c.status === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{c.status === "paid" ? "✅ Paid" : "⏳ Pending"}</span></td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Revenue Tab */}
      {tab === "bookings" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-black text-slate-800">Revenue by Booking</h3>
            <p className="text-slate-500 text-sm">{bookings.length} total bookings</p>
          </div>
          {loading ? <div className="p-8 text-center text-slate-400">Loading...</div> :
           bookings.length === 0 ? (
            <div className="p-12 text-center"><div className="text-4xl mb-3">✈️</div><p className="text-slate-500 font-semibold">No bookings yet</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>{["Client", "Destination", "Departure", "Revenue", "Agent", "Status"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map(b => (
                    <tr key={b.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold">{b.client_name}</td>
                      <td className="px-4 py-3">{b.destination}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{b.departure_date ? new Date(b.departure_date).toLocaleDateString() : "—"}</td>
                      <td className="px-4 py-3 font-bold">{fmt(b.total_price || 0)}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{b.agent_email?.split("@")[0] || "—"}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-bold ${b.status === "confirmed" ? "bg-emerald-100 text-emerald-700" : b.status === "pending_payment" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>{b.status?.replace("_", " ") || "upcoming"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Invoices Tab */}
      {tab === "invoices" && <InvoiceTab />}
    </div>
  );
}
