"use client";
import { useEffect, useState } from "react";
import { useAuthStore, isHQ } from "@/src/lib/authStore";

const AUTH = "Bearer zeniva-secret-2025";

type BookingStatus = "confirmed" | "pending_payment" | "upcoming" | "past" | "cancelled";

interface Booking {
  id: string;
  client_name: string;
  client_email?: string;
  destination: string;
  departure_date?: string;
  return_date?: string;
  travelers: number;
  total_price: number;
  currency: string;
  status: BookingStatus;
  notes?: string;
  created_at: string;
}

const STATUS_CFG: Record<string, { label: string; bg: string; text: string }> = {
  confirmed:       { label: "Confirmed",       bg: "bg-emerald-100", text: "text-emerald-700" },
  pending_payment: { label: "Pending Payment", bg: "bg-amber-100",   text: "text-amber-700" },
  upcoming:        { label: "Upcoming",        bg: "bg-blue-100",    text: "text-blue-700" },
  past:            { label: "Completed",       bg: "bg-slate-100",   text: "text-slate-600" },
  cancelled:       { label: "Cancelled",       bg: "bg-red-100",     text: "text-red-700" },
};

function fmt(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function BookingsPage() {
  const user = useAuthStore((s) => s.user);
  const hq = isHQ(user);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | BookingStatus>("all");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  // form state
  const [form, setForm] = useState({ client_name: "", client_email: "", destination: "", departure_date: "", return_date: "", travelers: "2", total_price: "", currency: "USD", status: "pending_payment", notes: "" });

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ path: "admin/bookings" });
      if (!hq && user?.email) p.append("agent_email", user.email);
      const r = await fetch(`/api/agents-proxy?${p}`);
      const d = await r.json();
      setBookings(d?.bookings || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { if (user?.email) void fetchBookings(); }, [user?.email]);

  const displayed = filter === "all" ? bookings : bookings.filter(b => b.status === filter);
  const totalRev = bookings.reduce((s, b) => s + (b.total_price || 0), 0);
  const confirmed = bookings.filter(b => b.status === "confirmed").length;
  const pending = bookings.filter(b => b.status === "pending_payment").length;

  const createBooking = async () => {
    setSaving(true);
    try {
      const payload = { ...form, travelers: Number(form.travelers), total_price: Number(form.total_price) };
      if (!hq && user?.email) (payload as any).agent_email = user.email;
      const r = await fetch("/api/agents-proxy?path=admin/bookings", {
        method: "POST",
        headers: { Authorization: AUTH, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (r.ok) { setShowForm(false); setForm({ client_name:"",client_email:"",destination:"",departure_date:"",return_date:"",travelers:"2",total_price:"",currency:"USD",status:"pending_payment",notes:"" }); void fetchBookings(); }
    } catch {}
    setSaving(false);
  };

  const updateStatus = async (id: string, status: string) => {
    setActionId(id + status);
    await fetch(`/api/agents-proxy?path=admin/bookings/${id}`, {
      method: "PATCH",
      headers: { Authorization: AUTH, "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setActionId(null);
    void fetchBookings();
  };

  return (
    <main className="min-h-screen bg-[#F3F6FB]">
      <div className="mx-auto max-w-7xl px-5 py-8 space-y-6">

        {/* Header */}
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Bookings</p>
            <h1 className="text-3xl font-black text-slate-900">Booking Center</h1>
            <p className="text-sm text-slate-500 mt-0.5">All confirmed and upcoming trips — real-time from Supabase</p>
          </div>
          <button onClick={() => setShowForm(true)} className="rounded-full px-6 py-2.5 text-sm font-bold text-white shadow-lg hover:opacity-90" style={{ background: "linear-gradient(135deg,#0F6CF5,#0B1B4D)" }}>
            + New Booking
          </button>
        </header>

        {/* KPI row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Bookings", value: bookings.length, color: "text-blue-600" },
            { label: "Confirmed", value: confirmed, color: "text-emerald-600" },
            { label: "Pending Payment", value: pending, color: "text-amber-600" },
            { label: "Total Revenue", value: `$${totalRev.toLocaleString()}`, color: "text-slate-900" },
          ].map((k) => (
            <div key={k.label} className="rounded-2xl bg-white border border-slate-200 px-5 py-4 shadow-sm">
              <p className={`text-2xl font-black ${k.color}`}>{k.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{k.label}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {(["all","confirmed","pending_payment","upcoming","past","cancelled"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${filter === f ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
              {f === "all" ? "All" : STATUS_CFG[f]?.label || f}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading bookings…</div>
          ) : displayed.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-4xl mb-3">✈️</p>
              <p className="text-slate-600 font-semibold">No bookings yet</p>
              <p className="text-slate-400 text-sm">Create your first booking above</p>
            </div>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-left text-slate-500 text-xs uppercase tracking-wide">
                  <th className="px-5 py-3">Client</th>
                  <th className="px-5 py-3">Destination</th>
                  <th className="px-5 py-3">Dates</th>
                  <th className="px-5 py-3">Travelers</th>
                  <th className="px-5 py-3">Revenue</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Actions & Documents</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((b) => {
                  const sc = STATUS_CFG[b.status] || { label: b.status, bg: "bg-slate-100", text: "text-slate-600" };
                  return (
                    <tr key={b.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3">
                        <p className="font-semibold text-slate-900">{b.client_name}</p>
                        {b.client_email && <p className="text-xs text-slate-400">{b.client_email}</p>}
                      </td>
                      <td className="px-5 py-3 font-medium text-slate-700">{b.destination || "—"}</td>
                      <td className="px-5 py-3 text-xs text-slate-500">{fmt(b.departure_date)} → {fmt(b.return_date)}</td>
                      <td className="px-5 py-3 text-center">{b.travelers}</td>
                      <td className="px-5 py-3 font-bold text-emerald-700">${(b.total_price || 0).toLocaleString()}</td>
                      <td className="px-5 py-3"><span className={`text-xs font-bold px-2.5 py-1 rounded-full ${sc.bg} ${sc.text}`}>{sc.label}</span></td>
                      <td className="px-5 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {b.status === "pending_payment" && (
                            <button disabled={actionId === b.id+"confirmed"} onClick={() => updateStatus(b.id, "confirmed")} className="text-xs bg-emerald-500 text-white px-2 py-1 rounded-lg font-bold hover:bg-emerald-600 disabled:opacity-50">
                              ✓ Confirm
                            </button>
                          )}
                          {b.status !== "cancelled" && b.status !== "past" && (
                            <button disabled={actionId === b.id+"cancelled"} onClick={() => updateStatus(b.id, "cancelled")} className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-lg font-bold hover:bg-red-200 disabled:opacity-50">
                              Cancel
                            </button>
                          )}
                          {/* ── Document buttons ── */}
                          <a
                            href={`/api/documents/generate?type=invoice&ref=INV-${b.id?.slice(0,8).toUpperCase()}&client=${encodeURIComponent(b.client_name||"")}&email=${encodeURIComponent(b.client_email||"")}&destination=${encodeURIComponent(b.destination||"")}&total=${b.total_price||0}&departure=${encodeURIComponent(b.departure_date||"")}&travelers=${b.travelers||1}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs px-2 py-1 rounded-lg font-bold"
                            style={{ background: "#0B1B4D", color: "#E6B85A" }}
                            title="View Invoice"
                          >🧾 Invoice</a>
                          <a
                            href={`/api/documents/generate?type=invoice&ref=INV-${b.id?.slice(0,8).toUpperCase()}&client=${encodeURIComponent(b.client_name||"")}&email=${encodeURIComponent(b.client_email||"")}&destination=${encodeURIComponent(b.destination||"")}&total=${b.total_price||0}&departure=${encodeURIComponent(b.departure_date||"")}&travelers=${b.travelers||1}&download=1`}
                            className="text-xs px-2 py-1 rounded-lg font-bold"
                            style={{ background: "#E6B85A", color: "#0B1B4D" }}
                            title="Download Invoice"
                          >⬇ Save</a>
                          <a
                            href={`/api/documents/generate?type=flight&ref=ZNV-${b.id?.slice(0,8).toUpperCase()}&passenger=${encodeURIComponent(b.client_name||"")}&to=${encodeURIComponent(b.destination?.split(",")[0]?.substring(0,3).toUpperCase()||"CDG")}&toCity=${encodeURIComponent(b.destination||"")}&price=${b.total_price||0}&depart=${encodeURIComponent(b.departure_date||"")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs px-2 py-1 rounded-lg font-bold"
                            style={{ background: "#0F6CF5", color: "#fff" }}
                            title="View Flight Confirmation"
                          >✈️ Flight</a>
                          <button
                            onClick={() => {
                              const url = `/api/documents/generate?type=invoice&ref=INV-${b.id?.slice(0,8).toUpperCase()}&client=${encodeURIComponent(b.client_name||"")}&email=${encodeURIComponent(b.client_email||"")}&destination=${encodeURIComponent(b.destination||"")}&total=${b.total_price||0}&departure=${encodeURIComponent(b.departure_date||"")}&travelers=${b.travelers||1}`;
                              const w = window.open(url, "_blank");
                              if (w) setTimeout(() => w.print(), 1500);
                            }}
                            className="text-xs px-2 py-1 rounded-lg font-bold"
                            style={{ background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0" }}
                            title="Print Invoice"
                          >🖨️ Print</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* New Booking Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl p-6 space-y-4">
            <h2 className="text-xl font-black text-slate-900">New Booking</h2>
            <div className="grid grid-cols-2 gap-3">
              <input className="col-span-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm" placeholder="Client name *" value={form.client_name} onChange={e => setForm(p=>({...p,client_name:e.target.value}))} />
              <input className="col-span-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm" placeholder="Client email" value={form.client_email} onChange={e => setForm(p=>({...p,client_email:e.target.value}))} />
              <input className="col-span-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm" placeholder="Destination *" value={form.destination} onChange={e => setForm(p=>({...p,destination:e.target.value}))} />
              <div><label className="text-xs text-slate-500 mb-1 block">Departure</label><input type="date" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" value={form.departure_date} onChange={e => setForm(p=>({...p,departure_date:e.target.value}))} /></div>
              <div><label className="text-xs text-slate-500 mb-1 block">Return</label><input type="date" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" value={form.return_date} onChange={e => setForm(p=>({...p,return_date:e.target.value}))} /></div>
              <input type="number" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm" placeholder="Travelers" value={form.travelers} onChange={e => setForm(p=>({...p,travelers:e.target.value}))} />
              <input type="number" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm" placeholder="Total price (USD)" value={form.total_price} onChange={e => setForm(p=>({...p,total_price:e.target.value}))} />
              <select className="col-span-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm" value={form.status} onChange={e => setForm(p=>({...p,status:e.target.value}))}>
                <option value="pending_payment">Pending Payment</option>
                <option value="confirmed">Confirmed</option>
                <option value="upcoming">Upcoming</option>
              </select>
              <textarea className="col-span-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm" rows={2} placeholder="Notes…" value={form.notes} onChange={e => setForm(p=>({...p,notes:e.target.value}))} />
            </div>
            <div className="flex gap-2 justify-end pt-1">
              <button onClick={() => setShowForm(false)} className="rounded-full px-5 py-2 text-sm border border-slate-200 font-semibold text-slate-600">Cancel</button>
              <button onClick={createBooking} disabled={saving || !form.client_name || !form.destination} className="rounded-full px-6 py-2 text-sm font-bold text-white disabled:opacity-50" style={{ background: "linear-gradient(135deg,#0F6CF5,#0B1B4D)" }}>
                {saving ? "Saving…" : "Create Booking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
