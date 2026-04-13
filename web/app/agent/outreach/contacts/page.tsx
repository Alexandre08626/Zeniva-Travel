"use client";

import { useState, useEffect, useCallback } from "react";

const statusColors: Record<string, string> = { new: "bg-blue-100 text-blue-700", contacted: "bg-yellow-100 text-yellow-700", demo_scheduled: "bg-orange-100 text-orange-700", signed: "bg-green-100 text-green-700", lost: "bg-red-100 text-red-700", active: "bg-green-100 text-green-700", inactive: "bg-slate-100 text-slate-500" };

function getName(c: any, audience: string) { return audience === "agencies" ? c.contact_name || "\u2014" : [c.first_name, c.last_name].filter(Boolean).join(" ") || "\u2014"; }
function getEmail(c: any, audience: string) { return audience === "agencies" ? c.contact_email : c.email; }

export default function ContactsPage() {
  const [audience, setAudience] = useState("agencies");
  const [contacts, setContacts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [drawer, setDrawer] = useState<any | null>(null);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try { const params = new URLSearchParams({ audience, page: String(page), limit: String(limit) }); if (search) params.set("search", search); if (statusFilter !== "all") params.set("status", statusFilter); const res = await fetch("/api/outreach/contacts?" + params.toString()); if (res.ok) { const data = await res.json(); setContacts(data.contacts || []); setTotal(data.total || 0); } } catch { /* silent */ } finally { setLoading(false); }
  }, [audience, page, limit, search, statusFilter]);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);
  useEffect(() => { setPage(1); }, [audience, search, statusFilter, limit]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4"><p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Total</p><p className="text-2xl font-bold text-slate-900 mt-1">{total}</p></div>
        <div className="bg-white rounded-xl border border-slate-200 p-4"><p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">With Email</p><p className="text-2xl font-bold text-slate-900 mt-1">{contacts.filter((c) => getEmail(c, audience)).length}</p></div>
        <div className="bg-white rounded-xl border border-slate-200 p-4"><p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Contacted</p><p className="text-2xl font-bold text-emerald-600 mt-1">{contacts.filter((c) => c.status !== "new").length}</p></div>
        <div className="bg-white rounded-xl border border-slate-200 p-4"><p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">New</p><p className="text-2xl font-bold text-amber-600 mt-1">{contacts.filter((c) => c.status === "new").length}</p></div>
      </div>

      <div className="flex gap-2 mb-4">
        {([["agencies", "Agencies"], ["travelers", "Leads & Clients"], ["agents", "Agent Leads"]] as const).map(([a, label]) => (
          <button key={a} onClick={() => { setAudience(a); setSearch(""); setStatusFilter("all"); }} className={"px-4 py-2 rounded-xl text-sm font-semibold " + (audience === a ? "bg-violet-600 text-white" : "bg-white border border-slate-200 text-slate-600")}>{label}</button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <input type="text" placeholder="Search name, email..." value={search} onChange={(e) => setSearch(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 w-64" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
          <option value="all">All statuses</option><option value="new">New</option><option value="contacted">Contacted</option>
          {audience === "agencies" && <option value="signed">Signed</option>}
          {audience === "agencies" && <option value="lost">Lost</option>}
        </select>
        <span className="text-sm text-slate-500 self-center">{total} contacts</span>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-4">
        {loading ? (
          <div className="p-6 space-y-3">{[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-10 bg-slate-100 rounded animate-pulse" />)}</div>
        ) : contacts.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No contacts found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Email</th>
                  {audience === "agencies" && <th className="text-left px-4 py-3 font-semibold text-slate-600">Company</th>}
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
                  {audience === "agencies" && <th className="text-left px-4 py-3 font-semibold text-slate-600">Province</th>}
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Created</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer" onClick={() => setDrawer(c)}>
                    <td className="px-4 py-3 font-medium text-slate-900">{getName(c, audience)}</td>
                    <td className="px-4 py-3 text-slate-600">{getEmail(c, audience) || "\u2014"}</td>
                    {audience === "agencies" && <td className="px-4 py-3 text-slate-600">{c.company_name || "\u2014"}</td>}
                    <td className="px-4 py-3"><span className={"px-2 py-0.5 rounded-full text-xs font-semibold " + (statusColors[c.status] || "bg-slate-100 text-slate-600")}>{c.status}</span></td>
                    {audience === "agencies" && <td className="px-4 py-3 text-slate-500">{c.province || "\u2014"}</td>}
                    <td className="px-4 py-3 text-slate-500">{c.created_at ? new Date(c.created_at).toLocaleDateString("en-CA") : "\u2014"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex gap-2">{[25, 50, 100].map((n) => (<button key={n} onClick={() => setLimit(n)} className={"px-3 py-1 rounded text-xs font-semibold " + (limit === n ? "bg-violet-600 text-white" : "bg-white border border-slate-200 text-slate-600")}>{n}</button>))}</div>
          <div className="flex gap-2 items-center">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-3 py-1 rounded text-sm bg-white border border-slate-200 text-slate-600 disabled:opacity-40">Prev</button>
            <span className="text-sm text-slate-500">{"Page " + page + " of " + totalPages}</span>
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-3 py-1 rounded text-sm bg-white border border-slate-200 text-slate-600 disabled:opacity-40">Next</button>
          </div>
        </div>
      )}

      {drawer && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setDrawer(null)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900">Contact Details</h2>
              <button onClick={() => setDrawer(null)} className="text-slate-400 hover:text-slate-600 text-xl">{"\u2715"}</button>
            </div>
            <div className="space-y-3">
              {Object.entries(drawer).map(([key, value]) => (<div key={key}><p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{key.replace(/_/g, " ")}</p><p className="text-sm text-slate-900">{String(value ?? "\u2014")}</p></div>))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
