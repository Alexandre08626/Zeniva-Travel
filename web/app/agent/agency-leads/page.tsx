"use client";
import { useEffect, useState } from "react";
import { useAuthStore, isHQ } from "@/src/lib/authStore";

interface BusinessLead {
  id: string;
  type: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  company_name: string;
  website: string;
  number_of_agents: number;
  current_suppliers: string;
  city: string;
  status: string;
  source: string;
  priority: string;
  estimated_setup_value: number;
  estimated_monthly_value: number;
  notes: string;
  last_contacted_at: string;
  next_followup_at: string;
  created_at: string;
}

const EMPTY_LEAD: Omit<BusinessLead, "id" | "created_at"> = {
  type: "travel_agent",
  contact_name: "",
  contact_email: "",
  contact_phone: "",
  company_name: "",
  website: "",
  number_of_agents: 1,
  current_suppliers: "",
  city: "",
  status: "new",
  source: "manual",
  priority: "medium",
  estimated_setup_value: 199,
  estimated_monthly_value: 97,
  notes: "",
  last_contacted_at: "",
  next_followup_at: "",
};

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-yellow-100 text-yellow-700",
  demo_scheduled: "bg-orange-100 text-orange-700",
  demo_done: "bg-indigo-100 text-indigo-700",
  negotiating: "bg-purple-100 text-purple-700",
  signed: "bg-green-100 text-green-700",
  lost: "bg-red-100 text-red-700",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-slate-100 text-slate-500",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

const TYPE_COLORS: Record<string, string> = {
  travel_agent: "bg-emerald-100 text-emerald-700",
  travel_agency: "bg-violet-100 text-violet-700",
};

const SOURCES = ["manual", "website", "email", "linkedin", "referral", "cold_outreach", "opc_list"];
const PRIORITIES = ["low", "medium", "high", "urgent"];
const STATUSES = ["new", "contacted", "demo_scheduled", "demo_done", "negotiating", "signed", "lost"];

function Avatar({ name, email }: { name: string; email: string }) {
  const colors = ["#0F6CF5","#7C3AED","#10B981","#F59E0B","#EF4444","#EC4899","#06B6D4","#8B5CF6"];
  const i = (email.charCodeAt(0) + (email.charCodeAt(1) || 0)) % colors.length;
  const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?";
  return (
    <div style={{ background: colors[i] }} className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
      {initials}
    </div>
  );
}

export default function AgencyLeadsPage() {
  const user = useAuthStore((s) => s.user);
  const hq = isHQ(user);

  const [leads, setLeads] = useState<BusinessLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<"all" | "travel_agent" | "travel_agency">("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState<BusinessLead | null>(null);
  const [form, setForm] = useState<Omit<BusinessLead, "id" | "created_at">>(EMPTY_LEAD);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter !== "all") params.set("type", typeFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (priorityFilter !== "all") params.set("priority", priorityFilter);
      const r = await fetch(`/api/leads-business?${params}`);
      const d = await r.json();
      setLeads(d.leads || []);
    } catch {
      setLeads([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeads();
  }, [typeFilter, statusFilter, priorityFilter]);

  const recalcValues = (f: typeof form): typeof form => {
    if (f.type === "travel_agency") {
      return { ...f, estimated_setup_value: 1999, estimated_monthly_value: (f.number_of_agents || 1) * 399 };
    }
    return { ...f, estimated_setup_value: 199, estimated_monthly_value: 97 };
  };

  const openAddModal = () => {
    setEditingLead(null);
    setBizFormDefaults("travel_agent");
    setShowModal(true);
  };

  const setBizFormDefaults = (type: string) => {
    const isAgency = type === "travel_agency";
    setForm({
      ...EMPTY_LEAD,
      type,
      estimated_setup_value: isAgency ? 1999 : 199,
      estimated_monthly_value: isAgency ? 399 : 97,
    });
  };

  const openEditModal = (lead: BusinessLead) => {
    setEditingLead(lead);
    const { id, created_at, ...rest } = lead;
    setForm(rest);
    setShowModal(true);
  };

  const saveLead = async () => {
    const finalForm = recalcValues(form);
    try {
      if (editingLead) {
        await fetch(`/api/leads-business/${editingLead.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(finalForm),
        });
      } else {
        await fetch("/api/leads-business", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(finalForm),
        });
      }
      setShowModal(false);
      fetchLeads();
    } catch {}
  };

  const deleteLead = async (lead: BusinessLead) => {
    if (!confirm(`Delete lead "${lead.contact_name}"? This cannot be undone.`)) return;
    try {
      await fetch(`/api/leads-business/${lead.id}`, { method: "DELETE" });
      setLeads((prev) => prev.filter((l) => l.id !== lead.id));
    } catch {}
  };

  // Stats
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const newThisWeek = leads.filter((l) => new Date(l.created_at) >= weekAgo).length;
  const demosScheduled = leads.filter((l) => l.status === "demo_scheduled").length;
  const pipelineValue = leads.reduce((s, l) => s + (l.estimated_setup_value || 0), 0);
  const signedCount = leads.filter((l) => l.status === "signed").length;
  const conversionRate = leads.length > 0 ? Math.round((signedCount / leads.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#F3F6FB] p-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Agency Leads</h1>
          <p className="text-slate-500 text-sm mt-1">
            B2B prospecting pipeline for agency and agent partnerships
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
        >
          + Add Lead
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
        {[
          { label: "Total Leads", value: leads.length, color: "text-blue-600" },
          { label: "New This Week", value: newThisWeek, color: "text-blue-600" },
          { label: "Demos Scheduled", value: demosScheduled, color: "text-orange-600" },
          { label: "Pipeline Value", value: "$" + pipelineValue.toLocaleString(), color: "text-green-600" },
          { label: "Conversion Rate", value: conversionRate + "%", color: "text-purple-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-6 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Type toggle */}
        <div className="flex gap-2">
          {([
            { key: "all" as const, label: "All" },
            { key: "travel_agent" as const, label: "Travel Agent" },
            { key: "travel_agency" as const, label: "Travel Agency" },
          ]).map((t) => (
            <button
              key={t.key}
              onClick={() => setTypeFilter(t.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                typeFilter === t.key
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Status dropdown */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400 bg-white"
        >
          <option value="all">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>

        {/* Priority dropdown */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:border-blue-400 bg-white"
        >
          <option value="all">All Priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {/* Lead cards */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : leads.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
          <div className="text-4xl mb-3">🏢</div>
          <div className="text-slate-500 text-sm">
            No leads yet. Click &quot;+ Add Lead&quot; to start prospecting.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {leads.map((lead) => {
            const isOverdue = lead.next_followup_at && new Date(lead.next_followup_at) < now;
            return (
              <div
                key={lead.id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
              >
                {/* Header row */}
                <div className="flex items-start gap-3 mb-3">
                  <Avatar name={lead.contact_name || "?"} email={lead.contact_email || "a@b.com"} />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 text-sm truncate">{lead.contact_name}</div>
                    {lead.company_name && (
                      <div className="text-xs text-slate-500 truncate">{lead.company_name}</div>
                    )}
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                      STATUS_COLORS[lead.status] || "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {lead.status?.replace(/_/g, " ")}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                      PRIORITY_COLORS[lead.priority] || "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {lead.priority}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      TYPE_COLORS[lead.type] || "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {lead.type === "travel_agent" ? "Agent" : "Agency"}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-1.5">
                  {lead.type === "travel_agency" && lead.number_of_agents > 0 && (
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span>👥</span>
                      <span className="font-medium">{lead.number_of_agents} agents</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span>💰</span>
                    <span className="font-medium">
                      Setup ${(lead.estimated_setup_value || 0).toLocaleString()} + ${(lead.estimated_monthly_value || 0).toLocaleString()}/mo
                    </span>
                  </div>
                  {lead.city && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>📍</span>
                      <span>{lead.city}</span>
                    </div>
                  )}
                  {lead.source && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>🔗</span>
                      <span className="capitalize">{lead.source.replace(/_/g, " ")}</span>
                    </div>
                  )}
                  {lead.next_followup_at && (
                    <div
                      className={`flex items-center gap-2 text-xs ${
                        isOverdue ? "text-red-600 font-semibold" : "text-slate-400"
                      }`}
                    >
                      <span>📅</span>
                      <span>
                        Follow-up: {new Date(lead.next_followup_at).toLocaleDateString()}
                        {isOverdue ? " (overdue)" : ""}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>📅</span>
                    <span>Created: {new Date(lead.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex gap-2">
                  <button
                    onClick={() => openEditModal(lead)}
                    className="flex-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-1.5 rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => void deleteLead(lead)}
                    className="text-xs bg-red-50 hover:bg-red-100 text-red-600 font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
                    title="Delete lead"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-black text-slate-900 mb-4">
              {editingLead ? "Edit" : "Add"} Lead
            </h2>
            <div className="space-y-3">
              {/* Type radio */}
              {!editingLead && (
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Type</label>
                  <div className="flex gap-3">
                    {([
                      { key: "travel_agent", label: "Travel Agent" },
                      { key: "travel_agency", label: "Travel Agency" },
                    ]).map((t) => (
                      <label key={t.key} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="lead_type"
                          checked={form.type === t.key}
                          onChange={() => {
                            const isAgency = t.key === "travel_agency";
                            setForm((f) =>
                              recalcValues({
                                ...f,
                                type: t.key,
                                estimated_setup_value: isAgency ? 1999 : 199,
                                estimated_monthly_value: isAgency ? (f.number_of_agents || 1) * 399 : 97,
                              })
                            );
                          }}
                          className="accent-blue-600"
                        />
                        <span className="text-sm text-slate-700">{t.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Contact Name *</label>
                <input
                  type="text"
                  value={form.contact_name}
                  onChange={(e) => setForm((f) => ({ ...f, contact_name: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-blue-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Email</label>
                  <input
                    type="email"
                    value={form.contact_email}
                    onChange={(e) => setForm((f) => ({ ...f, contact_email: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Phone</label>
                  <input
                    type="tel"
                    value={form.contact_phone}
                    onChange={(e) => setForm((f) => ({ ...f, contact_phone: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              {form.type === "travel_agency" && (
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Company Name</label>
                  <input
                    type="text"
                    value={form.company_name}
                    onChange={(e) => setForm((f) => ({ ...f, company_name: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-blue-400"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Website</label>
                <input
                  type="url"
                  value={form.website}
                  onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-blue-400"
                />
              </div>

              {form.type === "travel_agency" && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Number of Agents</label>
                    <input
                      type="number"
                      min={1}
                      value={form.number_of_agents}
                      onChange={(e) => {
                        const n = parseInt(e.target.value) || 1;
                        setForm((f) => recalcValues({ ...f, number_of_agents: n }));
                      }}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Current Suppliers</label>
                    <textarea
                      value={form.current_suppliers}
                      onChange={(e) => setForm((f) => ({ ...f, current_suppliers: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-blue-400"
                      rows={2}
                    />
                  </div>
                </>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">City</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-blue-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Source</label>
                  <select
                    value={form.source}
                    onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white"
                  >
                    {SOURCES.map((s) => (
                      <option key={s} value={s}>
                        {s.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Edit-only fields */}
              {editingLead && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Last Contacted</label>
                      <input
                        type="date"
                        value={form.last_contacted_at?.split("T")[0] || ""}
                        onChange={(e) => setForm((f) => ({ ...f, last_contacted_at: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-blue-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Next Follow-up</label>
                      <input
                        type="date"
                        value={form.next_followup_at?.split("T")[0] || ""}
                        onChange={(e) => setForm((f) => ({ ...f, next_followup_at: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-blue-400"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-blue-400"
                  rows={3}
                />
              </div>

              {/* Value preview */}
              <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-500">
                Estimated: Setup{" "}
                <span className="font-semibold text-slate-700">
                  ${form.estimated_setup_value.toLocaleString()}
                </span>{" "}
                + Monthly{" "}
                <span className="font-semibold text-slate-700">
                  ${form.estimated_monthly_value.toLocaleString()}
                </span>
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
                onClick={() => void saveLead()}
                disabled={!form.contact_name.trim()}
                className="flex-1 text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50"
              >
                {editingLead ? "Save Changes" : "Add Lead"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
