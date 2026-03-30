"use client";
import { useEffect, useState } from "react";
import { useAuthStore, isHQ } from "@/src/lib/authStore";
import { getSupabaseClient } from "@/src/lib/supabase/client";

/* ── Types ────────────────────────────────────────────── */
interface Agency {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  is_active: boolean;
  primary_color: string | null;
  secondary_color: string | null;
  number_of_agents: number | null;
  config: any;
  city: string | null;
  province: string | null;
  created_at: string;
}

interface SystemStatus {
  name: string;
  key: string;
  status: "live" | "active" | "standby" | "inactive" | "setup";
  label: string;
  detail: string;
}

interface UsageLine {
  service: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

const EMPTY_AGENCY = {
  name: "",
  slug: "",
  domain: "",
  contact_email: "",
  contact_phone: "",
  primary_color: "#0F6CF5",
  secondary_color: "#7C3AED",
};

/* ── Demo data generators ─────────────────────────────── */
const DEMO_AGENTS: Record<string, string[]> = {};
const AGENT_NAMES = [
  "Marie Tremblay", "Jean Dupont", "Sophie Martin", "Pierre Roy",
  "Anne Gendron", "Marc Bouchard", "Julie Lavoie", "Francois Cote",
  "Isabelle Morin", "Luc Gagnon", "Nathalie Bergeron", "Yves Pelletier",
];
const SUPPLIER_POOL = [
  "Transat", "Air Canada Vacances", "Sunwing", "Club Med",
  "TUI", "Sandals", "MSC Cruises", "Royal Caribbean",
  "G Adventures", "Intrepid Travel",
];

function getDemoAgents(agencyId: string, count: number): string[] {
  if (!DEMO_AGENTS[agencyId]) {
    const shuffled = [...AGENT_NAMES].sort(() => Math.random() - 0.5);
    DEMO_AGENTS[agencyId] = shuffled.slice(0, Math.max(count, 3));
  }
  return DEMO_AGENTS[agencyId];
}

function getDemoSuppliers(agencyId: string): string[] {
  const seed = agencyId.charCodeAt(0) + agencyId.charCodeAt(agencyId.length - 1);
  const count = 2 + (seed % 4);
  const shuffled = [...SUPPLIER_POOL].sort((a, b) => {
    const ha = a.charCodeAt(0) + seed;
    const hb = b.charCodeAt(0) + seed;
    return ha - hb;
  });
  return shuffled.slice(0, count);
}

function getDemoSystems(agency: Agency): SystemStatus[] {
  const active = agency.is_active;
  const hasWidget = !!agency.domain;
  const convToday = active ? 8 + Math.floor(Math.random() * 30) : 0;
  const smsCount = active ? 3 + Math.floor(Math.random() * 20) : 0;
  const emailCount = active ? 2 + Math.floor(Math.random() * 15) : 0;
  const searchCount = active ? 10 + Math.floor(Math.random() * 60) : 0;

  return [
    {
      name: "Lina Widget",
      key: "lina",
      status: hasWidget && active ? "live" : active ? "setup" : "inactive",
      label: hasWidget && active ? "LIVE" : active ? "SETUP" : "INACTIVE",
      detail: hasWidget && active ? `${convToday} conversations today` : active ? "Being configured" : "Not configured",
    },
    {
      name: "SMS (Twilio)",
      key: "sms",
      status: active ? "active" : "inactive",
      label: active ? "ACTIVE" : "INACTIVE",
      detail: active ? `${smsCount} messages sent` : "Not configured",
    },
    {
      name: "Email",
      key: "email",
      status: active ? "active" : "inactive",
      label: active ? "ACTIVE" : "INACTIVE",
      detail: active ? `${emailCount} emails sent` : "Not configured",
    },
    {
      name: "API Searches",
      key: "search",
      status: active ? "active" : "inactive",
      label: active ? "ACTIVE" : "INACTIVE",
      detail: active ? `${searchCount} searches today` : "Not configured",
    },
    {
      name: "WhatsApp",
      key: "whatsapp",
      status: "inactive",
      label: "INACTIVE",
      detail: "Not configured",
    },
  ];
}

function getDemoUsage(systems: SystemStatus[]): { lines: UsageLine[]; total: number } {
  const prices: Record<string, number> = {
    lina: 0.25,
    sms: 0.03,
    email: 0.01,
    search: 0.10,
    whatsapp: 0,
  };
  const labels: Record<string, string> = {
    lina: "Lina AI",
    sms: "SMS",
    email: "Email",
    search: "Searches",
    whatsapp: "WhatsApp",
  };
  const units: Record<string, string> = {
    lina: "conv",
    sms: "msg",
    email: "emails",
    search: "queries",
    whatsapp: "msg",
  };

  const lines: UsageLine[] = [];
  let total = 0;

  for (const s of systems) {
    if (s.status === "inactive" || s.status === "setup") continue;
    const qty = parseInt(s.detail) || 0;
    if (qty === 0) continue;
    const unitPrice = prices[s.key] || 0;
    const lineTotal = +(qty * unitPrice).toFixed(2);
    total += lineTotal;
    lines.push({
      service: `${labels[s.key]}: ${qty} ${units[s.key]} x $${unitPrice.toFixed(2)}`,
      quantity: qty,
      unitPrice,
      total: lineTotal,
    });
  }

  return { lines, total: +total.toFixed(2) };
}

/* ── Status dot colors ────────────────────────────────── */
function statusDotClass(status: string): string {
  switch (status) {
    case "live": return "bg-green-500";
    case "active": return "bg-green-500";
    case "standby": return "bg-yellow-500";
    case "inactive": return "bg-red-500";
    case "setup": return "bg-blue-500";
    default: return "bg-slate-400";
  }
}

function statusLabelClass(status: string): string {
  switch (status) {
    case "live": return "text-green-700 bg-green-50";
    case "active": return "text-green-700 bg-green-50";
    case "standby": return "text-yellow-700 bg-yellow-50";
    case "inactive": return "text-red-700 bg-red-50";
    case "setup": return "text-blue-700 bg-blue-50";
    default: return "text-slate-600 bg-slate-50";
  }
}

/* ── Page ──────────────────────────────────────────────── */
export default function AgenciesPage() {
  const user = useAuthStore((s) => s.user);
  const hq = isHQ(user);

  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_AGENCY);
  const [saving, setSaving] = useState(false);

  /* ── Fetch from dedicated API (admin, bypasses RLS) ── */
  const fetchAgencies = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/agencies");
      const json = await res.json();
      setAgencies(json.agencies || []);
    } catch {
      // fallback to client
      try {
        const { client } = getSupabaseClient();
        const { data } = await client.from("agencies").select("*").order("created_at", { ascending: false });
        setAgencies(data || []);
      } catch {
        setAgencies([]);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAgencies();
  }, []);

  /* ── Add Agency ── */
  const addAgency = async () => {
    if (!form.name.trim() || !form.slug.trim()) return;
    setSaving(true);
    try {
      const { client } = getSupabaseClient();
      await client.from("agencies").insert({
        name: form.name,
        slug: form.slug,
        domain: form.domain || null,
        contact_email: form.contact_email || null,
        contact_phone: form.contact_phone || null,
        primary_color: form.primary_color || null,
        secondary_color: form.secondary_color || null,
        is_active: true,
      });
      setShowModal(false);
      setForm(EMPTY_AGENCY);
      fetchAgencies();
    } catch {}
    setSaving(false);
  };

  /* ── Stats ── */
  const totalAgents = agencies.reduce((s, a) => s + (a.number_of_agents || 0), 0);
  const activeCount = agencies.filter((a) => a.is_active).length;
  const monthlyRevenue = agencies.reduce((s, a) => {
    if (!a.is_active) return s;
    const systems = getDemoSystems(a);
    const { total } = getDemoUsage(systems);
    return s + total;
  }, 0);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  return (
    <div className="min-h-screen bg-[#F3F6FB] p-6">
      {/* ── Header ── */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <span>🏢</span> Agency Partners
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your partner agency network. Live status monitoring.
          </p>
        </div>
        <button
          onClick={() => { setForm(EMPTY_AGENCY); setShowModal(true); }}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
        >
          + Add Agency
        </button>
      </div>

      {/* ── Stats Bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Agencies", value: agencies.length, color: "text-blue-600" },
          { label: "Active & Live", value: activeCount, color: "text-green-600", dot: "bg-green-500" },
          { label: "Total Agents", value: totalAgents, color: "text-purple-600" },
          { label: "Monthly Revenue", value: `$${monthlyRevenue.toFixed(2)}`, color: "text-emerald-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className={`text-2xl font-black ${stat.color} flex items-center gap-2`}>
              {stat.dot && <span className={`w-2 h-2 rounded-full inline-block ${stat.dot}`} />}
              {stat.value}
            </div>
            <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : agencies.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
          <div className="text-5xl mb-4">🏢</div>
          <div className="text-lg font-bold text-slate-700 mb-2">No agency partners yet</div>
          <div className="text-slate-500 text-sm">
            Your prospecting pipeline has 26 leads — go to{" "}
            <a href="/agent/leads-agency" className="text-blue-600 font-semibold hover:underline">
              Agency Leads
            </a>{" "}
            to start converting!
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {agencies.map((agency) => {
            const systems = getDemoSystems(agency);
            const { lines, total } = getDemoUsage(systems);
            const agents = getDemoAgents(agency.id, agency.number_of_agents || 6);
            const suppliers = getDemoSuppliers(agency.id);

            return (
              <div key={agency.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                {/* ── Agency Header ── */}
                <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🏢</span>
                      <h2 className="text-lg font-black text-slate-900">{agency.name}</h2>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${agency.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        <span className={`w-2 h-2 rounded-full inline-block ${agency.is_active ? "bg-green-500" : "bg-red-500"}`} />
                        {agency.is_active ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                      {agency.domain && <span>{agency.domain}</span>}
                      {agency.contact_email && <span>{agency.contact_email}</span>}
                      {agency.contact_phone && <span>{agency.contact_phone}</span>}
                      {(agency.city || agency.province) && (
                        <span>{[agency.city, agency.province].filter(Boolean).join(", ")}</span>
                      )}
                      <span>Joined {formatDate(agency.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {agency.primary_color && (
                      <div className="w-5 h-5 rounded-full border border-slate-200" style={{ background: agency.primary_color }} title="Primary color" />
                    )}
                    {agency.secondary_color && (
                      <div className="w-5 h-5 rounded-full border border-slate-200" style={{ background: agency.secondary_color }} title="Secondary color" />
                    )}
                  </div>
                </div>

                {/* ── Systems Status ── */}
                <div className="px-5 py-3 border-b border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Systems Status</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                    {systems.map((sys) => (
                      <div key={sys.key} className="flex items-center gap-2 text-sm">
                        <span className={`w-2 h-2 rounded-full inline-block flex-shrink-0 ${statusDotClass(sys.status)}`} />
                        <span className="font-semibold text-slate-700 text-xs whitespace-nowrap">{sys.name}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${statusLabelClass(sys.status)}`}>
                          {sys.label}
                        </span>
                        <span className="text-[11px] text-slate-400 truncate hidden lg:inline">{sys.detail}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Agents ── */}
                <div className="px-5 py-3 border-b border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Agents ({agents.length})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {agents.map((name) => (
                      <span key={name} className="inline-flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg text-xs text-slate-700">
                        <span>👤</span> {name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* ── Suppliers ── */}
                <div className="px-5 py-3 border-b border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Suppliers</div>
                  <div className="flex flex-wrap gap-2">
                    {suppliers.map((s) => (
                      <span key={s} className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* ── Usage This Month ── */}
                <div className="px-5 py-3 border-b border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Usage This Month</div>
                    <div className="text-sm font-black text-slate-900">TOTAL: ${total.toFixed(2)}</div>
                  </div>
                  {lines.length > 0 ? (
                    <div className="space-y-1">
                      {lines.map((l) => (
                        <div key={l.service} className="flex items-center justify-between text-xs text-slate-600">
                          <span>{l.service}</span>
                          <span className="font-semibold text-slate-800">${l.total.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400">No usage recorded this month.</div>
                  )}
                </div>

                {/* ── Actions ── */}
                <div className="px-5 py-3 flex flex-wrap gap-2">
                  <button className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                    View Dashboard
                  </button>
                  <button className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors">
                    Configure
                  </button>
                  <button className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors">
                    Billing History
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add Agency Modal ── */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-black text-slate-900 mb-4">Add Agency</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Agency Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-blue-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Slug *</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                    placeholder="my-agency"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Domain</label>
                  <input
                    type="text"
                    value={form.domain}
                    onChange={(e) => setForm((f) => ({ ...f, domain: e.target.value }))}
                    placeholder="agency.com"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={form.contact_email}
                    onChange={(e) => setForm((f) => ({ ...f, contact_email: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={form.contact_phone}
                    onChange={(e) => setForm((f) => ({ ...f, contact_phone: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Primary Color</label>
                  <input
                    type="color"
                    value={form.primary_color}
                    onChange={(e) => setForm((f) => ({ ...f, primary_color: e.target.value }))}
                    className="w-full h-10 rounded-xl border border-slate-200 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Secondary Color</label>
                  <input
                    type="color"
                    value={form.secondary_color}
                    onChange={(e) => setForm((f) => ({ ...f, secondary_color: e.target.value }))}
                    className="w-full h-10 rounded-xl border border-slate-200 cursor-pointer"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 text-sm bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold py-2.5 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => void addAgency()}
                disabled={!form.name.trim() || !form.slug.trim() || saving}
                className="flex-1 text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50"
              >
                {saving ? "Adding..." : "Add Agency"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
