"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { useAuthStore, isHQ } from "@/src/lib/authStore";

interface Lead {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  destination?: string;
  status: string;
  deal_value?: number;
  source?: string;
  created_at: string;
  phone?: string;
}

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-purple-100 text-purple-700",
  followed_up: "bg-yellow-100 text-yellow-700",
  quoted: "bg-orange-100 text-orange-700",
  client: "bg-green-100 text-green-700",
  junk: "bg-slate-100 text-slate-500",
};

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

export default function LeadsPage() {
  const user = useAuthStore((s) => s.user);
  const hq = isHQ(user);

  const deleteLead = async (leadId: string, email: string) => {
    if (!confirm(`Delete lead ${email}? This cannot be undone.`)) return;
    await fetch(`/api/agents-proxy?path=admin/leads/${leadId}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer zeniva-secret-2025" },
    });
    setLeads((prev) => prev.filter((l) => l.id !== leadId));
  };

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (!user?.email) return;
    const fetchLeads = async () => {
      setLoading(true);
      try {
        const p = new URLSearchParams({ path: "admin/agent-leads/" + encodeURIComponent(user.email!) });
        const r = await fetch(`/api/agents-proxy?${p}`);
        const d = await r.json();
        setLeads(d?.leads || []);
      } catch {}
      setLoading(false);
    };
    fetchLeads();
  }, [user?.email]);

  const filtered = leads.filter(l => {
    const name = `${l.first_name || ""} ${l.last_name || ""}`.trim();
    const matchSearch = !search || name.toLowerCase().includes(search.toLowerCase()) || l.email.toLowerCase().includes(search.toLowerCase()) || (l.destination || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statuses = ["all", "new", "contacted", "followed_up", "quoted", "client", "junk"];
  const counts = statuses.reduce((acc, s) => {
    acc[s] = s === "all" ? leads.length : leads.filter(l => l.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-[#F3F6FB] p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900">🎯 Lead Pipeline</h1>
        <p className="text-slate-500 text-sm mt-1">
          {hq ? "All leads across all agents" : "Your personal lead pipeline"}
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Leads", value: leads.length, color: "text-blue-600" },
          { label: "New", value: counts.new || 0, color: "text-blue-600" },
          { label: "Quoted", value: counts.quoted || 0, color: "text-orange-600" },
          { label: "Converted", value: counts.client || 0, color: "text-green-600" },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-6 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search leads..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-blue-400"
        />
        <div className="flex flex-wrap gap-2">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
                statusFilter === s
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {s === "all" ? `All (${counts.all})` : `${s} (${counts[s] || 0})`}
            </button>
          ))}
        </div>
      </div>

      {/* Leads list */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
          <div className="text-4xl mb-3">🎯</div>
          <div className="text-slate-500 text-sm">
            {leads.length === 0
              ? "No leads yet. Share your referral link to get started!"
              : "No leads match your search."}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(lead => {
            const name = `${lead.first_name || ""} ${lead.last_name || ""}`.trim() || lead.email;
            return (
              <div key={lead.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
                <div className="flex items-start gap-3 mb-3">
                  <Avatar name={name} email={lead.email} />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 text-sm truncate">{name}</div>
                    <div className="text-xs text-slate-500 truncate">{lead.email}</div>
                    {lead.phone && <div className="text-xs text-slate-400">{lead.phone}</div>}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[lead.status] || "bg-slate-100 text-slate-500"}`}>
                    {lead.status}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {lead.destination && (
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span>✈️</span>
                      <span className="font-medium">{lead.destination}</span>
                    </div>
                  )}
                  {lead.deal_value && lead.deal_value > 0 ? (
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span>💰</span>
                      <span className="font-medium">${lead.deal_value.toLocaleString()}</span>
                    </div>
                  ) : null}
                  {lead.source && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>📍</span>
                      <span>{lead.source}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>📅</span>
                    <span>{new Date(lead.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex gap-2">
                  <button className="flex-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-1.5 rounded-lg transition-colors">
                    📋 Propose
                  </button>
                  <button className="flex-1 text-xs bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold py-1.5 rounded-lg transition-colors">
                    💬 Chat
                  </button>
                  {hq && (
                    <button
                      onClick={() => void deleteLead(lead.id, lead.email)}
                      className="text-xs bg-red-50 hover:bg-red-100 text-red-600 font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
                      title="Delete lead"
                    >🗑️</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
