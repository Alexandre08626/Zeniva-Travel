"use client";
import { useEffect, useState } from "react";
import { useAuthStore, isHQ } from "@/src/lib/authStore";

interface Lead {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  destination?: string;
  language?: string;
  status: string;
  deal_value?: number;
  source?: string;
  created_at: string;
  phone?: string;
}

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
  province: string;
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

const EMPTY_BIZ_LEAD: Omit<BusinessLead, "id" | "created_at"> = {
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
  contacted: "bg-purple-100 text-purple-700",
  followed_up: "bg-yellow-100 text-yellow-700",
  quoted: "bg-orange-100 text-orange-700",
  client: "bg-green-100 text-green-700",
  junk: "bg-slate-100 text-slate-500",
};

const BIZ_STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-yellow-100 text-yellow-700",
  demo_scheduled: "bg-orange-100 text-orange-700",
  demo_done: "bg-purple-100 text-purple-700",
  negotiating: "bg-amber-100 text-amber-700",
  signed: "bg-green-100 text-green-700",
  lost: "bg-red-100 text-red-700",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-slate-100 text-slate-500",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

const BIZ_SOURCES = ["manual", "website", "email", "linkedin", "referral", "cold_outreach", "opc_list"];
const BIZ_PRIORITIES = ["low", "medium", "high", "urgent"];
const BIZ_STATUSES = ["new", "contacted", "demo_scheduled", "demo_done", "negotiating", "signed", "lost"];

function norm(s: unknown): string {
  return String(s ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function matchesQuery(q: string, fields: unknown[]): boolean {
  const nq = norm(q).trim();
  if (!nq) return true;
  const blob = fields.map(norm).join(" ");
  return nq.split(/\s+/).every(tok => blob.includes(tok));
}

const CA_PROV = new Set(["qc","quebec","ontario","on","bc","british columbia","alberta","ab","manitoba","mb","saskatchewan","sk","nova scotia","ns","new brunswick","nb","newfoundland","newfoundland and labrador","nl","pei","pe","prince edward island","yukon","yt","nwt","nt","northwest territories","nunavut","nu","laval"]);
const CA_CITY = new Set(["quebec","montreal","toronto","ottawa","vancouver","calgary","edmonton","winnipeg","hamilton","kitchener","london","victoria","halifax","saskatoon","regina","st john's","laval","gatineau","longueuil","sherbrooke","saguenay","levis","trois-rivieres","chicoutimi","rimouski","drummondville","granby","saint-jerome","mississauga","brampton","markham","vaughan","richmond hill","oakville","burlington","kingston","guelph","sudbury","thunder bay","windsor","whitby","oshawa","barrie","kelowna","surrey","burnaby","richmond","abbotsford","coquitlam"]);
const US_STATES = new Set(["alabama","al","alaska","ak","arizona","az","arkansas","ar","california","ca","colorado","co","connecticut","ct","delaware","de","florida","fl","georgia","ga","hawaii","hi","idaho","id","illinois","il","indiana","in","iowa","ia","kansas","ks","kentucky","ky","louisiana","la","maine","me","maryland","md","massachusetts","ma","michigan","mi","minnesota","mn","mississippi","ms","missouri","mo","montana","mt","nebraska","ne","nevada","nv","new hampshire","nh","new jersey","nj","new mexico","nm","new york","ny","north carolina","nc","north dakota","nd","ohio","oh","oklahoma","ok","oregon","or","pennsylvania","pa","rhode island","ri","south carolina","sc","south dakota","sd","tennessee","tn","texas","tx","utah","ut","vermont","vt","virginia","va","washington","wa","west virginia","wv","wisconsin","wi","wyoming","wy","dc","district of columbia","hawaii","puerto rico","pr"]);
const US_CITY = new Set(["new york","new york city","los angeles","chicago","houston","phoenix","philadelphia","san antonio","san diego","dallas","san jose","austin","jacksonville","fort worth","columbus","charlotte","indianapolis","san francisco","seattle","denver","boston","nashville","detroit","memphis","portland","oklahoma city","las vegas","miami","atlanta","minneapolis","tampa","orlando","saint louis","pittsburgh","cincinnati","kansas city","salt lake city","rapid city","panama city beach","honolulu"]);

function inferCountry(lead: { city?: string | null; province?: string | null }): "Canada" | "USA" | "Other" {
  const city = norm(lead.city);
  const prov = norm(lead.province);
  if (CA_PROV.has(prov) || CA_CITY.has(city)) return "Canada";
  if (US_STATES.has(prov) || US_CITY.has(city)) return "USA";
  return "Other";
}

function Avatar({ name, email }: { name: string; email: string }) {
  const colors = ["#0F6CF5","#7C3AED","#10B981","#F59E0B","#EF4444","#EC4899","#06B6D4","#8B5CF6"];
  const safeEmail = email || "";
  const i = (safeEmail.charCodeAt(0) || 0 + (safeEmail.charCodeAt(1) || 0)) % colors.length;
  const initials = (name || "").split(" ").map(w => w?.[0]).filter(Boolean).join("").toUpperCase().slice(0, 2) || "?";
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
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [destinationFilter, setDestinationFilter] = useState("all");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [provinceFilter, setProvinceFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");

  const [activeTab, setActiveTab] = useState<"travelers" | "agents" | "agencies">("travelers");
  const [businessLeads, setBusinessLeads] = useState<BusinessLead[]>([]);
  const [businessLoading, setBusinessLoading] = useState(false);
  const [showBizModal, setShowBizModal] = useState(false);
  const [editingBizLead, setEditingBizLead] = useState<BusinessLead | null>(null);
  const [bizForm, setBizForm] = useState<Omit<BusinessLead, "id" | "created_at">>(EMPTY_BIZ_LEAD);

  useEffect(() => {
    if (!user?.email) { setLoading(false); return; }
    const fetchLeads = async () => {
      setLoading(true);
      try {
        const p = new URLSearchParams({ path: "admin/agent-leads/" + encodeURIComponent(user.email!) });
        const r = await fetch(`/api/agents-proxy?${p}`);
        if (!r.ok) { setLoading(false); return; }
        const d = await r.json();
        setLeads(Array.isArray(d?.leads) ? d.leads : []);
      } catch {
        setLeads([]);
      }
      setLoading(false);
    };
    fetchLeads();
    const interval = setInterval(fetchLeads, 30000);
    return () => clearInterval(interval);
  }, [user?.email]);

  const fetchBusinessLeads = (type: string) => {
    setBusinessLoading(true);
    fetch(`/api/leads-business?type=${type}`)
      .then(r => r.ok ? r.json() : { leads: [] })
      .then(d => setBusinessLeads(Array.isArray(d?.leads) ? d.leads : []))
      .catch(() => setBusinessLeads([]))
      .finally(() => setBusinessLoading(false));
  };

  useEffect(() => {
    if (activeTab === "travelers") return;
    const type = activeTab === "agents" ? "travel_agent" : "travel_agency";
    fetchBusinessLeads(type);
  }, [activeTab]);

  const openAddBizModal = () => {
    const type = activeTab === "agents" ? "travel_agent" : "travel_agency";
    const isAgency = type === "travel_agency";
    setBizForm({
      ...EMPTY_BIZ_LEAD,
      type,
      estimated_setup_value: isAgency ? 1999 : 199,
      estimated_monthly_value: isAgency ? 399 : 97,
    });
    setEditingBizLead(null);
    setShowBizModal(true);
  };

  const openEditBizModal = (lead: BusinessLead) => {
    setEditingBizLead(lead);
    const { id, created_at, ...rest } = lead;
    setBizForm(rest);
    setShowBizModal(true);
  };

  const recalcBizValues = (form: typeof bizForm): typeof bizForm => {
    if (form.type === "travel_agency") {
      return { ...form, estimated_setup_value: 1999, estimated_monthly_value: (form.number_of_agents || 1) * 399 };
    }
    return { ...form, estimated_setup_value: 199, estimated_monthly_value: 97 };
  };

  const saveBizLead = async () => {
    const finalForm = recalcBizValues(bizForm);
    if (editingBizLead) {
      await fetch(`/api/leads-business/${editingBizLead.id}`, {
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
    setShowBizModal(false);
    const type = activeTab === "agents" ? "travel_agent" : "travel_agency";
    fetchBusinessLeads(type);
  };

  const deleteBizLead = async (lead: BusinessLead) => {
    if (!confirm(`Delete lead ${lead.contact_name}? This cannot be undone.`)) return;
    await fetch(`/api/leads-business/${lead.id}`, { method: "DELETE" });
    setBusinessLeads(prev => prev.filter(l => l.id !== lead.id));
  };

  const filtered = leads.filter(l => {
    if (!l || l.email?.endsWith("@zeniva-lead.com")) return false;
    const matchSearch = matchesQuery(search, [l.first_name, l.last_name, l.email, l.destination, l.phone]);
    const matchStatus = statusFilter === "all" || l.status === statusFilter;
    const matchDest = destinationFilter === "all" || (l.destination || "").toLowerCase().includes(destinationFilter.toLowerCase());
    const matchLang = languageFilter === "all" || l.language === languageFilter;
    return matchSearch && matchStatus && matchDest && matchLang;
  });

  // Build unique values for dropdowns
  const destinations = [...new Set(leads.filter(l => l.destination && !l.email?.endsWith("@zeniva-lead.com")).map(l => l.destination!))].sort();
  const languages = [...new Set(leads.filter(l => l.language).map(l => l.language!))].sort();
  const provinces = [...new Set(businessLeads.filter(l => l.province).map(l => l.province))].sort();
  const cities = [...new Set(businessLeads.filter(l => l.city).map(l => l.city))].sort();

  const realLeads = leads.filter(l => l && !l.email?.endsWith("@zeniva-lead.com"));
  const statuses = ["all", "new", "contacted", "followed_up", "quoted", "client", "junk"];
  const counts = statuses.reduce((acc, s) => {
    acc[s] = s === "all" ? realLeads.length : realLeads.filter(l => l.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-[#F3F6FB] p-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">🎯 Lead Pipeline</h1>
          <p className="text-slate-500 text-sm mt-1">
            {hq ? "All leads across all agents" : "Your personal lead pipeline"}
          </p>
        </div>
        {activeTab !== "travelers" && (
          <button
            onClick={openAddBizModal}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            + Add Lead
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {([
          { key: "travelers" as const, label: "Travelers", count: realLeads.length },
          { key: "agents" as const, label: "Travel Agents", count: activeTab === "agents" ? businessLeads.length : null },
          { key: "agencies" as const, label: "Travel Agencies", count: activeTab === "agencies" ? businessLeads.length : null },
        ]).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTab === tab.key
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {tab.label}{tab.count !== null ? ` (${tab.count})` : ""}
          </button>
        ))}
      </div>

      {/* Search & Filters — all tabs */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-6 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder={activeTab === "travelers" ? "Search leads... (press Enter)" : "Search by name, email, company, city, province, country... (press Enter)"}
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") { e.preventDefault(); setSearch(searchInput.trim()); }
              else if (e.key === "Escape") { setSearchInput(""); setSearch(""); }
            }}
            onBlur={() => setSearch(searchInput.trim())}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-blue-400"
          />
          {activeTab === "travelers" && (
            <>
              <select value={destinationFilter} onChange={e => setDestinationFilter(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-blue-400 min-w-[160px]">
                <option value="all">All Destinations</option>
                {destinations.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select value={languageFilter} onChange={e => setLanguageFilter(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-blue-400 min-w-[120px]">
                <option value="all">All Languages</option>
                {languages.map(l => <option key={l} value={l}>{l === "fr" ? "Fran\u00e7ais" : l === "en" ? "English" : l === "es" ? "Espa\u00f1ol" : l === "ar" ? "Arabic" : l}</option>)}
              </select>
            </>
          )}
          {(activeTab === "agencies" || activeTab === "agents") && (
            <>
              <select value={countryFilter} onChange={e => setCountryFilter(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-blue-400 min-w-[140px]">
                <option value="all">All Countries</option>
                <option value="Canada">Canada</option>
                <option value="USA">USA</option>
                <option value="Other">Other</option>
              </select>
              <select value={cityFilter} onChange={e => setCityFilter(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-blue-400 min-w-[160px]">
                <option value="all">All Cities</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={provinceFilter} onChange={e => setProvinceFilter(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-blue-400 min-w-[160px]">
                <option value="all">All Provinces</option>
                {provinces.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </>
          )}
        </div>
        {activeTab === "travelers" && (
          <div className="flex flex-wrap gap-2">
            {statuses.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={"px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all " +
                  (statusFilter === s
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200")}
              >
                {s === "all" ? "All (" + counts.all + ")" : s + " (" + (counts[s] || 0) + ")"}
              </button>
            ))}
          </div>
        )}
      </div>

      {activeTab === "travelers" && (<>
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
      </>)}

      {(activeTab === "agents" || activeTab === "agencies") && (<>
        {/* Business Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
          {[
            { label: "Total Leads", value: businessLeads.length, color: "text-blue-600" },
            { label: "New This Week", value: businessLeads.filter(l => {
              const d = new Date(l.created_at);
              const now = new Date();
              const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              return d >= weekAgo;
            }).length, color: "text-blue-600" },
            { label: "Demos Scheduled", value: businessLeads.filter(l => l.status === "demo_scheduled").length, color: "text-orange-600" },
            { label: "Pipeline Value", value: "$" + businessLeads.reduce((s, l) => s + (l.estimated_setup_value || 0), 0).toLocaleString(), color: "text-green-600" },
            { label: "Conversion Rate", value: businessLeads.length > 0 ? Math.round((businessLeads.filter(l => l.status === "signed").length / businessLeads.length) * 100) + "%" : "0%", color: "text-purple-600" },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Business Leads list */}
        {businessLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
          </div>
        ) : businessLeads.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
            <div className="text-4xl mb-3">🏢</div>
            <div className="text-slate-500 text-sm">
              No {activeTab === "agents" ? "travel agent" : "travel agency"} leads yet. Click &quot;+ Add Lead&quot; to get started!
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {businessLeads.filter(lead => {
              const matchProv = provinceFilter === "all" || lead.province === provinceFilter;
              const matchCity = cityFilter === "all" || lead.city === cityFilter;
              const matchCountry = countryFilter === "all" || inferCountry(lead) === countryFilter;
              const matchSearch2 = matchesQuery(search, [
                lead.contact_name,
                lead.contact_email,
                lead.contact_phone,
                lead.company_name,
                lead.website,
                lead.city,
                lead.province,
                lead.notes,
              ]);
              return matchProv && matchCity && matchCountry && matchSearch2;
            }).map(lead => {
              const isOverdue = lead.next_followup_at && new Date(lead.next_followup_at) < new Date();
              return (
                <div
                  key={lead.id}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer"
                  onClick={() => openEditBizModal(lead)}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar name={lead.contact_name || "?"} email={lead.contact_email || "a@b.com"} />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-900 text-sm truncate">{lead.contact_name}</div>
                      {lead.company_name && <div className="text-xs text-slate-500 truncate">{lead.company_name}</div>}
                      <div className="text-xs text-slate-400 truncate">{lead.contact_email}</div>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${BIZ_STATUS_COLORS[lead.status] || "bg-slate-100 text-slate-500"}`}>
                        {lead.status?.replace(/_/g, " ")}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${PRIORITY_COLORS[lead.priority] || "bg-slate-100 text-slate-500"}`}>
                        {lead.priority}
                      </span>
                    </div>
                  </div>

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
                      <div className={`flex items-center gap-2 text-xs ${isOverdue ? "text-red-600 font-semibold" : "text-slate-400"}`}>
                        <span>📅</span>
                        <span>Follow-up: {new Date(lead.next_followup_at).toLocaleDateString()}{isOverdue ? " (overdue)" : ""}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); openEditBizModal(lead); }}
                      className="flex-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-1.5 rounded-lg transition-colors"
                    >
                      ✏️ Edit
                    </button>
                    {hq && (
                      <button
                        onClick={(e) => { e.stopPropagation(); void deleteBizLead(lead); }}
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
      </>)}

      {/* Business Lead Modal */}
      {showBizModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowBizModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-black text-slate-900 mb-4">
              {editingBizLead ? "Edit" : "Add"} {bizForm.type === "travel_agent" ? "Travel Agent" : "Travel Agency"} Lead
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Contact Name *</label>
                <input type="text" value={bizForm.contact_name} onChange={e => setBizForm(f => ({ ...f, contact_name: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-blue-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Email</label>
                  <input type="email" value={bizForm.contact_email} onChange={e => setBizForm(f => ({ ...f, contact_email: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Phone</label>
                  <input type="tel" value={bizForm.contact_phone} onChange={e => setBizForm(f => ({ ...f, contact_phone: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-blue-400" />
                </div>
              </div>
              {bizForm.type === "travel_agency" && (
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Company Name</label>
                  <input type="text" value={bizForm.company_name} onChange={e => setBizForm(f => ({ ...f, company_name: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-blue-400" />
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Website</label>
                <input type="url" value={bizForm.website} onChange={e => setBizForm(f => ({ ...f, website: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-blue-400" />
              </div>
              {bizForm.type === "travel_agency" && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Number of Agents</label>
                    <input type="number" min={1} value={bizForm.number_of_agents} onChange={e => {
                      const n = parseInt(e.target.value) || 1;
                      setBizForm(f => recalcBizValues({ ...f, number_of_agents: n }));
                    }}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-blue-400" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Current Suppliers</label>
                    <textarea value={bizForm.current_suppliers} onChange={e => setBizForm(f => ({ ...f, current_suppliers: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-blue-400" rows={2} />
                  </div>
                </>
              )}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">City</label>
                <input type="text" value={bizForm.city} onChange={e => setBizForm(f => ({ ...f, city: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-blue-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Source</label>
                  <select value={bizForm.source} onChange={e => setBizForm(f => ({ ...f, source: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white">
                    {BIZ_SOURCES.map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Priority</label>
                  <select value={bizForm.priority} onChange={e => setBizForm(f => ({ ...f, priority: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white">
                    {BIZ_PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              {editingBizLead && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Status</label>
                    <select value={bizForm.status} onChange={e => setBizForm(f => ({ ...f, status: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white">
                      {BIZ_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Last Contacted</label>
                      <input type="date" value={bizForm.last_contacted_at?.split("T")[0] || ""} onChange={e => setBizForm(f => ({ ...f, last_contacted_at: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-blue-400" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Next Follow-up</label>
                      <input type="date" value={bizForm.next_followup_at?.split("T")[0] || ""} onChange={e => setBizForm(f => ({ ...f, next_followup_at: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-blue-400" />
                    </div>
                  </div>
                </>
              )}
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Notes</label>
                <textarea value={bizForm.notes} onChange={e => setBizForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:outline-none focus:border-blue-400" rows={3} />
              </div>
              <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-500">
                Estimated: Setup <span className="font-semibold text-slate-700">${bizForm.estimated_setup_value.toLocaleString()}</span> + Monthly <span className="font-semibold text-slate-700">${bizForm.estimated_monthly_value.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowBizModal(false)}
                className="flex-1 text-sm bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold py-2.5 rounded-xl transition-colors">
                Cancel
              </button>
              <button onClick={() => void saveBizLead()}
                disabled={!bizForm.contact_name.trim()}
                className="flex-1 text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50">
                {editingBizLead ? "Save Changes" : "Add Lead"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
