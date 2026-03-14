export const dynamic = "force-dynamic";
"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
// auth not needed client-side for this page

// ─── Types ─────────────────────────────────────────────────────────────────
type InvoiceItem = { description: string; qty: number; unitPrice: number };
type Invoice = {
  id: string;
  type: "outgoing" | "incoming";
  client_name?: string;
  client_email?: string;
  amount: number;
  currency: string;
  status: "draft" | "sent" | "paid" | "overdue" | "pending" | "cancelled";
  items: InvoiceItem[];
  notes?: string;
  due_date?: string;
  paid_at?: string;
  source?: string;
  email_subject?: string;
  email_from?: string;
  email_date?: string;
  created_at: string;
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  sent: "bg-blue-100 text-blue-700",
  paid: "bg-emerald-100 text-emerald-700",
  overdue: "bg-red-100 text-red-700",
  pending: "bg-amber-100 text-amber-700",
  cancelled: "bg-gray-100 text-gray-500",
};

function fmtMoney(n: number, cur = "CAD") {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: cur }).format(n);
}
function fmtDate(s?: string) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" });
}

// ─── Modal: Create Invoice ─────────────────────────────────────────────────
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
    const payload = { ...form, type: "outgoing", status, items, amount: total, source: "manual", created_at: new Date().toISOString() };
    await fetch(`${SUPABASE_URL}/rest/v1/invoices`, {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">New Client Invoice</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">×</button>
        </div>
        <div className="p-6 space-y-5">
          {/* Client */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Client Name *</label>
              <input className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={form.client_name} onChange={e => setForm({ ...form, client_name: e.target.value })} placeholder="Lennox Laliberte" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Client Email</label>
              <input className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                type="email" value={form.client_email} onChange={e => setForm({ ...form, client_email: e.target.value })} placeholder="lennox@email.com" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Currency</label>
              <select className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}>
                <option>CAD</option><option>USD</option><option>EUR</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Due Date</label>
              <input type="date" className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
            </div>
          </div>

          {/* Line items */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Services / Items</label>
            <div className="mt-2 space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm"
                    placeholder="Service description" value={item.description}
                    onChange={e => updateItem(idx, "description", e.target.value)} />
                  <input type="number" className="w-16 border border-slate-200 rounded-lg px-2 py-2 text-sm text-center"
                    placeholder="Qty" min={1} value={item.qty}
                    onChange={e => updateItem(idx, "qty", parseInt(e.target.value) || 1)} />
                  <input type="number" className="w-28 border border-slate-200 rounded-lg px-2 py-2 text-sm text-right"
                    placeholder="0.00" step="0.01" value={item.unitPrice}
                    onChange={e => updateItem(idx, "unitPrice", parseFloat(e.target.value) || 0)} />
                  {items.length > 1 && (
                    <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 text-lg px-1">×</button>
                  )}
                </div>
              ))}
              <button onClick={addItem} className="text-blue-600 text-sm font-medium hover:text-blue-800">+ Add line</button>
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-end">
            <div className="bg-slate-50 rounded-xl px-6 py-3 text-right">
              <p className="text-xs text-slate-500">Total</p>
              <p className="text-2xl font-bold text-slate-800">{fmtMoney(total, form.currency)}</p>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Notes</label>
            <textarea className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm h-20 resize-none"
              value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Payment terms, notes..." />
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
          <button onClick={() => save("draft")} disabled={saving} className="px-4 py-2 text-sm bg-slate-700 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50">
            Save Draft
          </button>
          <button onClick={() => save("sent")} disabled={saving} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            💌 Send to Client
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function InvoicesPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"outgoing" | "incoming" | "overview">("overview");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [scanningEmail, setScanningEmail] = useState(false);
  const [tableError, setTableError] = useState(false);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/invoices?select=*&order=created_at.desc`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    });
    if (!res.ok) { setTableError(true); setLoading(false); return; }
    const data = await res.json();
    setInvoices(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  const markPaid = async (id: string) => {
    await fetch(`${SUPABASE_URL}/rest/v1/invoices?id=eq.${id}`, {
      method: "PATCH",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ status: "paid", paid_at: new Date().toISOString() }),
    });
    fetchInvoices();
  };

  const deleteInvoice = async (id: string) => {
    if (!confirm("Delete this invoice?")) return;
    await fetch(`${SUPABASE_URL}/rest/v1/invoices?id=eq.${id}`, {
      method: "DELETE",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    });
    fetchInvoices();
  };

  const scanEmails = async () => {
    setScanningEmail(true);
    try {
      const res = await fetch("/api/invoices/scan-emails", { method: "POST",
        headers: { Authorization: "Bearer zeniva-secret-2025", "Content-Type": "application/json" } });
      const d = await res.json();
      if (d.added > 0) fetchInvoices();
      alert(`Scan complete — ${d.added || 0} new invoice(s) found in your emails.`);
    } catch { alert("Scan failed. Check your email configuration."); }
    setScanningEmail(false);
  };

  // Stats
  const outgoing = invoices.filter(i => i.type === "outgoing");
  const incoming = invoices.filter(i => i.type === "incoming");
  const totalRevenue = outgoing.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const outstanding = outgoing.filter(i => ["sent", "overdue"].includes(i.status)).reduce((s, i) => s + i.amount, 0);
  const totalExpenses = incoming.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const pendingBills = incoming.filter(i => ["pending", "overdue"].includes(i.status)).reduce((s, i) => s + i.amount, 0);

  const listToShow = tab === "outgoing" ? outgoing : tab === "incoming" ? incoming : [];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/agent")} className="text-slate-400 hover:text-slate-600 mr-1">←</button>
          <span className="text-2xl">🧾</span>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Invoices & Accounting</h1>
            <p className="text-xs text-slate-500">Zeniva Travel — Financial Center</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={scanEmails} disabled={scanningEmail}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-50">
            {scanningEmail ? "⏳ Scanning..." : "📧 Scan Emails"}
          </button>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
            + New Invoice
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Table error */}
        {tableError && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-amber-800 font-semibold text-sm">⚠️ Database table not found</p>
            <p className="text-amber-700 text-xs mt-1">Run this SQL in your Supabase dashboard (SQL Editor):</p>
            <pre className="mt-2 text-xs bg-amber-100 p-3 rounded-lg overflow-x-auto text-amber-900">{`CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'outgoing',
  client_name text,
  client_email text,
  amount numeric(12,2),
  currency text DEFAULT 'CAD',
  status text DEFAULT 'draft',
  items jsonb DEFAULT '[]',
  notes text,
  due_date date,
  paid_at timestamptz,
  source text DEFAULT 'manual',
  email_subject text,
  email_from text,
  email_date timestamptz,
  file_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);`}</pre>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Revenue (Paid)", value: fmtMoney(totalRevenue), icon: "💰", color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Outstanding", value: fmtMoney(outstanding), icon: "⏳", color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Expenses Paid", value: fmtMoney(totalExpenses), icon: "💳", color: "text-slate-600", bg: "bg-slate-100" },
            { label: "Bills Pending", value: fmtMoney(pendingBills), icon: "🔔", color: "text-amber-600", bg: "bg-amber-50" },
          ].map(k => (
            <div key={k.label} className={`${k.bg} rounded-2xl p-4`}>
              <div className="text-2xl mb-1">{k.icon}</div>
              <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
              <p className="text-xs text-slate-500 mt-1">{k.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
          {([["overview", "📊 Overview"], ["outgoing", "📤 Client Invoices"], ["incoming", "📥 Bills & Receipts"]] as const).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${tab === key ? "bg-white text-slate-800 shadow" : "text-slate-600 hover:text-slate-800"}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === "overview" && (
          <div className="space-y-4">
            {/* Recent invoices */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-semibold text-slate-800">Recent Activity</h2>
                <span className="text-xs text-slate-500">{invoices.length} total invoices</span>
              </div>
              {loading ? (
                <div className="p-8 text-center text-slate-400">Loading...</div>
              ) : invoices.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-5xl mb-3">🧾</div>
                  <p className="text-slate-500 font-medium">No invoices yet</p>
                  <p className="text-slate-400 text-sm mt-1">Create your first invoice or scan your emails for receipts</p>
                  <div className="flex gap-3 justify-center mt-4">
                    <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg">+ New Invoice</button>
                    <button onClick={scanEmails} className="px-4 py-2 bg-slate-100 text-slate-700 text-sm rounded-lg">📧 Scan Emails</button>
                  </div>
                </div>
              ) : (
                <InvoiceTable invoices={invoices.slice(0, 10)} onMarkPaid={markPaid} onDelete={deleteInvoice} />
              )}
            </div>
          </div>
        )}

        {/* Outgoing / Incoming Tabs */}
        {(tab === "outgoing" || tab === "incoming") && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-800">
                {tab === "outgoing" ? "📤 Client Invoices" : "📥 Bills & Receipts"}
              </h2>
              {tab === "incoming" && (
                <button onClick={scanEmails} disabled={scanningEmail}
                  className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-200">
                  {scanningEmail ? "⏳ Scanning..." : "📧 Scan Emails for Bills"}
                </button>
              )}
              {tab === "outgoing" && (
                <button onClick={() => setShowCreate(true)} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg">+ New Invoice</button>
              )}
            </div>
            {loading ? (
              <div className="p-8 text-center text-slate-400">Loading...</div>
            ) : listToShow.length === 0 ? (
              <div className="p-12 text-center text-slate-400">No {tab === "outgoing" ? "client invoices" : "bills"} yet</div>
            ) : (
              <InvoiceTable invoices={listToShow} onMarkPaid={markPaid} onDelete={deleteInvoice} />
            )}
          </div>
        )}
      </div>

      {showCreate && <CreateInvoiceModal onClose={() => setShowCreate(false)} onSaved={fetchInvoices} />}
    </div>
  );
}

function InvoiceTable({ invoices, onMarkPaid, onDelete }: { invoices: Invoice[]; onMarkPaid: (id: string) => void; onDelete: (id: string) => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
            <th className="px-6 py-3 text-left font-semibold">Invoice</th>
            <th className="px-4 py-3 text-left font-semibold">Type</th>
            <th className="px-4 py-3 text-left font-semibold">Amount</th>
            <th className="px-4 py-3 text-left font-semibold">Status</th>
            <th className="px-4 py-3 text-left font-semibold">Date</th>
            <th className="px-4 py-3 text-left font-semibold">Due</th>
            <th className="px-4 py-3 text-left font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {invoices.map(inv => (
            <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4">
                <p className="font-medium text-slate-800">{inv.client_name || inv.email_from || "Unknown"}</p>
                <p className="text-xs text-slate-400">{inv.client_email || inv.email_subject || inv.notes?.slice(0, 40) || inv.id.slice(0, 8)}</p>
              </td>
              <td className="px-4 py-4">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${inv.type === "outgoing" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"}`}>
                  {inv.type === "outgoing" ? "📤 Invoice" : "📥 Bill"}
                </span>
              </td>
              <td className="px-4 py-4 font-semibold text-slate-800">{fmtMoney(inv.amount, inv.currency)}</td>
              <td className="px-4 py-4">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[inv.status] || "bg-gray-100 text-gray-600"}`}>
                  {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                </span>
              </td>
              <td className="px-4 py-4 text-slate-500">{fmtDate(inv.created_at)}</td>
              <td className="px-4 py-4 text-slate-500">{fmtDate(inv.due_date)}</td>
              <td className="px-4 py-4">
                <div className="flex gap-2">
                  {inv.status !== "paid" && inv.status !== "cancelled" && (
                    <button onClick={() => onMarkPaid(inv.id)}
                      className="text-xs text-emerald-600 hover:text-emerald-800 font-medium border border-emerald-200 px-2 py-1 rounded-lg hover:bg-emerald-50">
                      ✓ Paid
                    </button>
                  )}
                  <button onClick={() => onDelete(inv.id)}
                    className="text-xs text-red-400 hover:text-red-600 border border-red-100 px-2 py-1 rounded-lg hover:bg-red-50">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
