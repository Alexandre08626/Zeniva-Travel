"use client";
import { useEffect, useState } from "react";
import { useAuthStore, isHQ } from "@/src/lib/authStore";
import { getSupabaseClient } from "@/src/lib/supabase/client";

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
  created_at: string;
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

export default function AgenciesPage() {
  const user = useAuthStore((s) => s.user);
  const hq = isHQ(user);

  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_AGENCY);
  const [saving, setSaving] = useState(false);

  const fetchAgencies = async () => {
    setLoading(true);
    try {
      const { client } = getSupabaseClient();
      const { data } = await client
        .from("agencies")
        .select("*")
        .order("created_at", { ascending: false });
      setAgencies(data || []);
    } catch {
      setAgencies([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAgencies();
  }, []);

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

  const totalAgents = agencies.reduce((s, a) => s + (a.number_of_agents || 0), 0);
  const activeCount = agencies.filter((a) => a.is_active).length;
  const pendingCount = agencies.filter((a) => !a.is_active).length;

  return (
    <div className="min-h-screen bg-[#F3F6FB] p-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Agency Partners</h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your network of agency partners
          </p>
        </div>
        <button
          onClick={() => {
            setForm(EMPTY_AGENCY);
            setShowModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
        >
          + Add Agency
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Agencies", value: agencies.length, color: "text-blue-600" },
          { label: "Active", value: activeCount, color: "text-green-600" },
          { label: "Pending Setup", value: pendingCount, color: "text-orange-600" },
          { label: "Total Agents", value: totalAgents, color: "text-purple-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Agencies table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : agencies.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
          <div className="text-4xl mb-3">🏢</div>
          <div className="text-slate-500 text-sm">
            No agency partners yet. Start prospecting in Agency Leads.
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Table header */}
          <div className="hidden sm:grid grid-cols-7 gap-4 px-5 py-3 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <div>Name</div>
            <div>Slug</div>
            <div>Status</div>
            <div>Contact Email</div>
            <div>Contact Phone</div>
            <div>Domain</div>
            <div>Date Joined</div>
          </div>

          {/* Table rows */}
          {agencies.map((agency) => (
            <div key={agency.id}>
              <div
                onClick={() => setExpandedId(expandedId === agency.id ? null : agency.id)}
                className="grid grid-cols-1 sm:grid-cols-7 gap-2 sm:gap-4 px-5 py-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors items-center"
              >
                <div className="font-bold text-slate-900 text-sm truncate">{agency.name}</div>
                <div className="text-xs text-slate-500 truncate">{agency.slug}</div>
                <div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      agency.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {agency.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="text-xs text-slate-600 truncate">{agency.contact_email || "-"}</div>
                <div className="text-xs text-slate-600 truncate">{agency.contact_phone || "-"}</div>
                <div className="text-xs text-slate-600 truncate">{agency.domain || "-"}</div>
                <div className="text-xs text-slate-400">
                  {new Date(agency.created_at).toLocaleDateString()}
                </div>
              </div>

              {/* Expanded details */}
              {expandedId === agency.id && (
                <div className="px-5 py-4 bg-slate-50 border-b border-slate-100">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-xs font-semibold text-slate-500 mb-1">Number of Agents</div>
                      <div className="text-slate-900 font-medium">{agency.number_of_agents || 0}</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-500 mb-1">Primary Color</div>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-5 h-5 rounded-full border border-slate-200"
                          style={{ background: agency.primary_color || "#ccc" }}
                        />
                        <span className="text-slate-900 text-xs">{agency.primary_color || "-"}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-500 mb-1">Secondary Color</div>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-5 h-5 rounded-full border border-slate-200"
                          style={{ background: agency.secondary_color || "#ccc" }}
                        />
                        <span className="text-slate-900 text-xs">{agency.secondary_color || "-"}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-500 mb-1">Domain</div>
                      <div className="text-slate-900 text-xs">{agency.domain || "Not configured"}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Agency Modal */}
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
