"use client";

import { useState, useEffect, useCallback } from "react";

const CLIENT_STATUSES: Record<string, string[]> = {
  agencies: ["signed"],
  travelers: ["client", "converted"],
  agents: [],
};

const LEAD_STATUSES: Record<string, string[]> = {
  agencies: ["new", "contacted", "demo_scheduled", "negotiating", "lost"],
  travelers: ["new", "contacted", "qualified", "followed_up", "quoted", "lost"],
  agents: ["active", "inactive"],
};

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-yellow-100 text-yellow-700",
  demo_scheduled: "bg-orange-100 text-orange-700",
  negotiating: "bg-amber-100 text-amber-700",
  signed: "bg-green-100 text-green-700",
  lost: "bg-red-100 text-red-700",
  active: "bg-green-100 text-green-700",
  inactive: "bg-slate-100 text-slate-500",
  client: "bg-green-100 text-green-700",
  converted: "bg-green-100 text-green-700",
  qualified: "bg-purple-100 text-purple-700",
  followed_up: "bg-yellow-100 text-yellow-700",
  quoted: "bg-orange-100 text-orange-700",
  junk: "bg-slate-100 text-slate-500",
};

function getName(c: any, audience: string) {
  return audience === "agencies"
    ? c.contact_name || "\u2014"
    : [c.first_name, c.last_name].filter(Boolean).join(" ") || "\u2014";
}
function getEmail(c: any, audience: string) {
  return audience === "agencies" ? c.contact_email : c.email;
}

export default function NewLeadsPage() {
  const [audience, setAudience] = useState("agencies");
  const [activeTab, setActiveTab] = useState<"leads" | "clients">("leads");

  // Leads state
  const [leads, setLeads] = useState<any[]>([]);
  const [leadsTotal, setLeadsTotal] = useState(0);
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [leadsSearch, setLeadsSearch] = useState("");
  const [leadsStatus, setLeadsStatus] = useState("all");
  const [leadsCity, setLeadsCity] = useState("");
  const [leadsProvince, setLeadsProvince] = useState("");
  const [leadsPage, setLeadsPage] = useState(1);
  const [leadsLimit, setLeadsLimit] = useState(25);

  // Clients state
  const [clients, setClients] = useState<any[]>([]);
  const [clientsTotal, setClientsTotal] = useState(0);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [clientsSearch, setClientsSearch] = useState("");
  const [clientsPage, setClientsPage] = useState(1);
  const [clientsLimit, setClientsLimit] = useState(25);

  const [drawer, setDrawer] = useState<any | null>(null);

  const clientStatuses = CLIENT_STATUSES[audience] || [];
  const leadStatuses = LEAD_STATUSES[audience] || [];

  const fetchLeads = useCallback(async () => {
    setLeadsLoading(true);
    try {
      const allLeadStatuses = leadStatuses;
      const params = new URLSearchParams({
        audience,
        page: String(leadsPage),
        limit: String(leadsLimit),
      });
      if (leadsSearch) params.set("search", leadsSearch);
      if (leadsStatus !== "all") {
        params.set("status", leadsStatus);
      }
      if (leadsCity) params.set("city", leadsCity);
      if (leadsProvince) params.set("province", leadsProvince);
      params.set("exclude_statuses", clientStatuses.join(","));

      const res = await fetch("/api/outreach/contacts?" + params.toString());
      if (res.ok) {
        const data = await res.json();
        // Filter client-side as fallback if API doesn't support exclude_statuses
        const filtered = (data.contacts || []).filter(
          (c: any) => !clientStatuses.includes(c.status)
        );
        setLeads(leadsStatus !== "all" || !clientStatuses.length ? data.contacts || [] : filtered);
        setLeadsTotal(leadsStatus !== "all" || !clientStatuses.length ? data.total || 0 : filtered.length);
      }
    } catch {
      /* silent */
    } finally {
      setLeadsLoading(false);
    }
  }, [audience, leadsPage, leadsLimit, leadsSearch, leadsStatus, leadsCity, leadsProvince, leadStatuses, clientStatuses]);

  const fetchClients = useCallback(async () => {
    if (clientStatuses.length === 0) {
      setClients([]);
      setClientsTotal(0);
      setClientsLoading(false);
      return;
    }
    setClientsLoading(true);
    try {
      // Fetch each client status
      const allClients: any[] = [];
      let total = 0;
      for (const status of clientStatuses) {
        const params = new URLSearchParams({
          audience,
          page: String(clientsPage),
          limit: String(clientsLimit),
          status,
        });
        if (clientsSearch) params.set("search", clientsSearch);
        const res = await fetch("/api/outreach/contacts?" + params.toString());
        if (res.ok) {
          const data = await res.json();
          allClients.push(...(data.contacts || []));
          total += data.total || 0;
        }
      }
      setClients(allClients);
      setClientsTotal(total);
    } catch {
      /* silent */
    } finally {
      setClientsLoading(false);
    }
  }, [audience, clientsPage, clientsLimit, clientsSearch, clientStatuses]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  useEffect(() => {
    setLeadsPage(1);
  }, [audience, leadsSearch, leadsStatus, leadsCity, leadsProvince, leadsLimit]);
  useEffect(() => {
    setClientsPage(1);
  }, [audience, clientsSearch, clientsLimit]);

  // Reset on audience change
  useEffect(() => {
    setLeadsSearch("");
    setLeadsStatus("all");
    setLeadsCity("");
    setLeadsProvince("");
    setClientsSearch("");
    setActiveTab("leads");
  }, [audience]);

  const leadsTotalPages = Math.max(1, Math.ceil(leadsTotal / leadsLimit));
  const clientsTotalPages = Math.max(1, Math.ceil(clientsTotal / clientsLimit));

  const PROVINCES = [
    "Quebec", "Ontario", "British Columbia", "Alberta", "Manitoba", "Saskatchewan",
    "Nova Scotia", "New Brunswick", "Newfoundland", "PEI",
    "New York", "Florida", "California", "Texas", "Illinois", "Massachusetts",
  ];

  function renderTable(
    items: any[],
    loading: boolean,
    search: string,
    setSearch: (v: string) => void,
    statusFilter: string | null,
    setStatusFilter: ((v: string) => void) | null,
    statuses: string[],
    total: number,
    page: number,
    setPage: (v: number) => void,
    limit: number,
    setLimit: (v: number) => void,
    totalPages: number
  ) {
    return (
      <>
        <div className="flex flex-wrap gap-3 mb-4">
          <input
            type="text"
            placeholder="Search name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 w-64"
          />
          {setStatusFilter && statuses.length > 0 && (
            <select
              value={statusFilter || "all"}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="all">All statuses</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          )}
          {audience === "agencies" && (
            <>
              <input
                type="text"
                placeholder="Filter by city..."
                value={leadsCity}
                onChange={(e) => setLeadsCity(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 w-40"
              />
              <select
                value={leadsProvince}
                onChange={(e) => setLeadsProvince(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="">All provinces/states</option>
                {PROVINCES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </>
          )}
          <span className="text-sm text-slate-500 self-center">
            {total} {total === 1 ? "contact" : "contacts"}
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-4">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 bg-slate-100 rounded animate-pulse" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center text-slate-500">No contacts found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Name</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Email</th>
                    {audience === "agencies" && (
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Company</th>
                    )}
                    {audience === "agencies" && (
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Phone</th>
                    )}
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
                    {audience === "agencies" && (
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">City</th>
                    )}
                    {audience === "agencies" && (
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">Province</th>
                    )}
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                      onClick={() => setDrawer(c)}
                    >
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {getName(c, audience)}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {getEmail(c, audience) || "\u2014"}
                      </td>
                      {audience === "agencies" && (
                        <td className="px-4 py-3 text-slate-600">
                          {c.company_name || "\u2014"}
                        </td>
                      )}
                      {audience === "agencies" && (
                        <td className="px-4 py-3 text-slate-600">
                          {c.contact_phone || "\u2014"}
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <span
                          className={
                            "px-2 py-0.5 rounded-full text-xs font-semibold " +
                            (statusColors[c.status] || "bg-slate-100 text-slate-600")
                          }
                        >
                          {c.status?.replace(/_/g, " ")}
                        </span>
                      </td>
                      {audience === "agencies" && (
                        <td className="px-4 py-3 text-slate-500">{c.city || "\u2014"}</td>
                      )}
                      {audience === "agencies" && (
                        <td className="px-4 py-3 text-slate-500">{c.province || "\u2014"}</td>
                      )}
                      <td className="px-4 py-3 text-slate-500">
                        {c.created_at
                          ? new Date(c.created_at).toLocaleDateString("en-CA")
                          : "\u2014"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {[25, 50, 100].map((n) => (
                <button
                  key={n}
                  onClick={() => setLimit(n)}
                  className={
                    "px-3 py-1 rounded text-xs font-semibold " +
                    (limit === n
                      ? "bg-violet-600 text-white"
                      : "bg-white border border-slate-200 text-slate-600")
                  }
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="flex gap-2 items-center">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded text-sm bg-white border border-slate-200 text-slate-600 disabled:opacity-40"
              >
                Prev
              </button>
              <span className="text-sm text-slate-500">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 rounded text-sm bg-white border border-slate-200 text-slate-600 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
        {/* Audience selector */}
        <div className="flex gap-2 mb-6">
          {(["agencies", "travelers", "agents"] as const).map((a) => (
            <button
              key={a}
              onClick={() => setAudience(a)}
              className={
                "px-4 py-2 rounded-xl text-sm font-semibold " +
                (audience === a
                  ? "bg-violet-600 text-white"
                  : "bg-white border border-slate-200 text-slate-600")
              }
            >
              {a.charAt(0).toUpperCase() + a.slice(1)}
            </button>
          ))}
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">
              Total Leads
            </p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{leadsTotal}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">
              Total Clients
            </p>
            <p className="text-2xl font-bold text-green-600 mt-1">{clientsTotal}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">
              Conversion Rate
            </p>
            <p className="text-2xl font-bold text-violet-600 mt-1">
              {leadsTotal + clientsTotal > 0
                ? Math.round((clientsTotal / (leadsTotal + clientsTotal)) * 100)
                : 0}
              %
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">
              Pipeline Total
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {leadsTotal + clientsTotal}
            </p>
          </div>
        </div>

        {/* Leads / Clients toggle */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl border border-slate-200 p-1 w-fit">
          <button
            onClick={() => setActiveTab("leads")}
            className={
              "px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 " +
              (activeTab === "leads"
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-100")
            }
          >
            <span>Leads</span>
            <span
              className={
                "px-2 py-0.5 rounded-full text-xs font-bold " +
                (activeTab === "leads"
                  ? "bg-blue-500 text-white"
                  : "bg-slate-100 text-slate-600")
              }
            >
              {leadsTotal}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("clients")}
            className={
              "px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 " +
              (activeTab === "clients"
                ? "bg-green-600 text-white"
                : "text-slate-600 hover:bg-slate-100")
            }
          >
            <span>Clients</span>
            <span
              className={
                "px-2 py-0.5 rounded-full text-xs font-bold " +
                (activeTab === "clients"
                  ? "bg-green-500 text-white"
                  : "bg-slate-100 text-slate-600")
              }
            >
              {clientsTotal}
            </span>
          </button>
        </div>

        {/* Active tab content */}
        {activeTab === "leads" &&
          renderTable(
            leads,
            leadsLoading,
            leadsSearch,
            setLeadsSearch,
            leadsStatus,
            setLeadsStatus,
            leadStatuses,
            leadsTotal,
            leadsPage,
            setLeadsPage,
            leadsLimit,
            setLeadsLimit,
            leadsTotalPages
          )}

        {activeTab === "clients" &&
          (clientStatuses.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
              No client statuses defined for this audience type.
            </div>
          ) : (
            renderTable(
              clients,
              clientsLoading,
              clientsSearch,
              setClientsSearch,
              null,
              null,
              [],
              clientsTotal,
              clientsPage,
              setClientsPage,
              clientsLimit,
              setClientsLimit,
              clientsTotalPages
            )
          ))}

      {/* Detail drawer */}
      {drawer && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setDrawer(null)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900">Contact Details</h2>
              <button
                onClick={() => setDrawer(null)}
                className="text-slate-400 hover:text-slate-600 text-xl"
              >
                {"\u2715"}
              </button>
            </div>
            <div className="space-y-3">
              {Object.entries(drawer).map(([key, value]) => (
                <div key={key}>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {key.replace(/_/g, " ")}
                  </p>
                  <p className="text-sm text-slate-900">{String(value ?? "\u2014")}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
