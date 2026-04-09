"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuthStore, isHQ } from "../../../src/lib/authStore";
import { useRequireAnyPermission } from "../../../src/lib/roleGuards";

const AUTH = "Bearer zeniva-secret-2025";

type Client = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  destination: string;
  status: string;
  language: string;
  deal_value: number;
  source: string;
  created_at: string;
  role?: string;
};

type Dossier = {
  id?: string;
  title: string;
  destination: string;
  departure_date: string;
  return_date: string;
  travelers: number;
  budget_usd: number;
  trip_type: string;
  status: string;
  notes: string;
  created_at?: string;
};

type Note = { id?: string; note: string; category: string; created_at?: string };
type Conversation = { role: string; content: string; channel: string; created_at: string };
type ClientProfile = {
  client: Client;
  dossiers: Dossier[];
  proposals: any[];
  bookings: any[];
  notes: Note[];
  conversations: Conversation[];
};

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  client:      { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  new:         { bg: "bg-blue-100",    text: "text-blue-700",    dot: "bg-blue-500" },
  contacted:   { bg: "bg-purple-100",  text: "text-purple-700",  dot: "bg-purple-500" },
  followed_up: { bg: "bg-amber-100",   text: "text-amber-700",   dot: "bg-amber-500" },
  prospect:    { bg: "bg-indigo-100",  text: "text-indigo-700",  dot: "bg-indigo-500" },
  junk:        { bg: "bg-slate-100",   text: "text-slate-500",   dot: "bg-slate-400" },
  traveler:    { bg: "bg-cyan-100",    text: "text-cyan-700",    dot: "bg-cyan-500" },
};

const DOSSIER_STATUS: Record<string, string> = {
  prospect: "bg-slate-100 text-slate-700",
  planning: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  proposal_sent: "bg-purple-100 text-purple-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  closed: "bg-gray-100 text-gray-500",
  cancelled: "bg-rose-100 text-rose-700",
};

function Avatar({ name, email, size = 48 }: { name: string; email: string; size?: number }) {
  const initials = name
    ? name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : email[0].toUpperCase();
  const colors = ["#6366f1","#0F6CF5","#ec4899","#f59e0b","#06b6d4","#a855f7","#ef4444","#10b981"];
  const color = colors[(email.charCodeAt(0) + email.charCodeAt(1)) % colors.length];
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-white shrink-0"
      style={{ width: size, height: size, background: color, fontSize: size * 0.35 }}
    >
      {initials}
    </div>
  );
}

export default function ClientsPage() {
  useRequireAnyPermission(["clients:all", "clients:own"], "/agent");
  const user = useAuthStore((s) => s.user);
  const canDelete = isHQ(user);

  const deleteClient = async (email: string) => {
    if (!confirm(`Delete client ${email}? This cannot be undone.`)) return;
    // Delete from VPS
    await fetch(`/api/agents-proxy?path=admin/clients/${encodeURIComponent(email)}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer zeniva-secret-2025" },
    });
    // Delete from Supabase (clients + accounts)
    await fetch("/api/clients/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => {});
    setClients((prev) => prev.filter((c) => c.email !== email));
    setFiltered((prev) => prev.filter((c) => c.email !== email));
    setSelectedClient(null);
  };

  const [clients, setClients] = useState<Client[]>([]);
  const [filtered, setFiltered] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "dossiers" | "notes" | "chat" | "proposals">("profile");

  // Dossier form
  const [showDossierForm, setShowDossierForm] = useState(false);
  const [dossierTitle, setDossierTitle] = useState("");
  const [dossierDest, setDossierDest] = useState("");
  const [dossierDepart, setDossierDepart] = useState("");
  const [dossierReturn, setDossierReturn] = useState("");
  const [dossierTravelers, setDossierTravelers] = useState(2);
  const [dossierBudget, setDossierBudget] = useState("");
  const [dossierType, setDossierType] = useState("leisure");
  const [dossierStatus, setDossierStatus] = useState("prospect");
  const [dossierNotes, setDossierNotes] = useState("");
  const [dossierSaving, setDossierSaving] = useState(false);

  // Note form
  const [newNote, setNewNote] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);

  // Add client modal
  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPhone, setAddPhone] = useState("");
  const [addDest, setAddDest] = useState("");
  const [addSaving, setAddSaving] = useState(false);
  const [addMsg, setAddMsg] = useState("");

  const fetchClients = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/clients");
      const data = await r.json();
      const list: Client[] = (data?.data || []).map((a: any) => {
        const nameParts = (a.name || "").split(" ");
        return {
          id: a.id,
          email: a.email,
          first_name: nameParts[0] || "",
          last_name: nameParts.slice(1).join(" ") || "",
          phone: a.phone || "",
          destination: "",
          status: a.origin || "new",
          language: "",
          deal_value: 0,
          source: a.origin || "signup",
          created_at: a.createdAt || a.created_at,
          role: "",
        };
      });
      setClients(list);
      setFiltered(list);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => {
    if (!user?.email) return;
    fetchClients();
    // Auto-refresh every 30s so new signups appear immediately
    const interval = setInterval(fetchClients, 30000);
    return () => clearInterval(interval);
  }, [user?.email]);

  useEffect(() => {
    if (!search.trim()) { setFiltered(clients); return; }
    const q = search.toLowerCase();
    setFiltered(clients.filter(c =>
      `${c.first_name} ${c.last_name}`.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.destination || "").toLowerCase().includes(q)
    ));
  }, [search, clients]);

  const openProfile = async (c: Client) => {
    setSelectedClient({ client: c, dossiers: [], proposals: [], bookings: [], notes: [], conversations: [] });
    setActiveTab("profile");
    setProfileLoading(true);
    try {
      // Fetch from VPS proxy + Supabase proposals/bookings in parallel
      const [proxyRes, proposalsRes, bookingsRes] = await Promise.all([
        fetch(`/api/agents-proxy?path=admin/client-profile/${encodeURIComponent(c.email)}`, { headers: { Authorization: AUTH } }),
        fetch(`/api/rex/kpi-details?kpi=client-proposals&email=${encodeURIComponent(c.email)}`, { headers: { Authorization: AUTH } }),
        fetch(`/api/rex/kpi-details?kpi=client-bookings&email=${encodeURIComponent(c.email)}`, { headers: { Authorization: AUTH } }),
      ]);

      let d: any = {};
      if (proxyRes.ok) d = await proxyRes.json();

      let supaProposals: any[] = [];
      let supaBookings: any[] = [];
      if (proposalsRes.ok) { const pd = await proposalsRes.json(); supaProposals = pd.items || []; }
      if (bookingsRes.ok) { const bd = await bookingsRes.json(); supaBookings = bd.items || []; }

      // Merge: Supabase proposals take priority, add VPS ones that aren't duplicates
      const vpsProposals = d.proposals || [];
      const mergedProposals = [...supaProposals];
      for (const vp of vpsProposals) {
        if (!mergedProposals.find((sp: any) => sp.id === vp.id)) mergedProposals.push(vp);
      }

      const vpsBookings = d.bookings || [];
      const mergedBookings = [...supaBookings];
      for (const vb of vpsBookings) {
        if (!mergedBookings.find((sb: any) => sb.id === vb.id)) mergedBookings.push(vb);
      }

      setSelectedClient({
        client: c,
        dossiers: d.dossiers || [],
        proposals: mergedProposals,
        bookings: mergedBookings,
        notes: d.notes || [],
        conversations: d.conversations || [],
      });
    } catch {}
    setProfileLoading(false);
  };

  const saveDossier = async () => {
    if (!selectedClient || !dossierTitle) return;
    setDossierSaving(true);
    try {
      const r = await fetch("/api/agents-proxy?path=admin/dossiers", {
        method: "POST",
        headers: { Authorization: AUTH, "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: selectedClient.client.id,
          client_email: selectedClient.client.email,
          client_name: `${selectedClient.client.first_name} ${selectedClient.client.last_name}`.trim(),
          agent_id: user?.email || "",
          title: dossierTitle,
          destination: dossierDest || selectedClient.client.destination,
          departure_date: dossierDepart || null,
          return_date: dossierReturn || null,
          travelers: dossierTravelers,
          budget_usd: parseFloat(dossierBudget) || null,
          trip_type: dossierType,
          status: dossierStatus,
          notes: dossierNotes,
        }),
      });
      if (r.ok) {
        const nd = await r.json();
        setSelectedClient((p) => p ? { ...p, dossiers: [nd, ...p.dossiers] } : p);
        setShowDossierForm(false);
        setDossierTitle(""); setDossierDest(""); setDossierDepart(""); setDossierReturn(""); setDossierBudget(""); setDossierNotes("");
      }
    } catch {}
    setDossierSaving(false);
  };

  const saveNote = async () => {
    if (!selectedClient || !newNote.trim()) return;
    setNoteSaving(true);
    try {
      const r = await fetch("/api/agents-proxy?path=admin/client-notes", {
        method: "POST",
        headers: { Authorization: AUTH, "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: selectedClient.client.id,
          client_email: selectedClient.client.email,
          agent_id: user?.email || "",
          note: newNote.trim(),
          category: "general",
        }),
      });
      if (r.ok) {
        const n = await r.json();
        setSelectedClient((p) => p ? { ...p, notes: [n, ...p.notes] } : p);
        setNewNote("");
      }
    } catch {}
    setNoteSaving(false);
  };

  const addClient = async () => {
    if (!addEmail || !addName) return;
    setAddSaving(true); setAddMsg("");
    try {
      const r = await fetch("/api/agents-proxy?path=admin/leads", {
        method: "POST",
        headers: { Authorization: AUTH, "Content-Type": "application/json" },
        body: JSON.stringify({
          email: addEmail.trim().toLowerCase(),
          first_name: addName.split(" ")[0],
          last_name: addName.split(" ").slice(1).join(" ") || "",
          phone: addPhone, destination: addDest,
          status: "client", source: "agent-added", language: "en",
        }),
      });
      if (r.ok) {
        setAddMsg("✅ Client added!");
        setAddName(""); setAddEmail(""); setAddPhone(""); setAddDest("");
        fetchClients();
        setTimeout(() => { setShowAdd(false); setAddMsg(""); }, 2000);
      } else { setAddMsg("❌ Error — email already exists?"); }
    } catch { setAddMsg("❌ Network error"); }
    setAddSaving(false);
  };

  const fullName = (c: Client) => `${c.first_name || ""} ${c.last_name || ""}`.trim() || c.email;
  const sc = selectedClient?.client;
  const scStatus = STATUS_COLORS[sc?.status || "new"] || STATUS_COLORS.new;

  return (
    <main className="min-h-screen bg-[#F3F6FB]">
      <div className="mx-auto max-w-7xl px-5 py-8 pb-24 space-y-6">

        {/* ── Header ── */}
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Client Roster</p>
            <h1 className="text-3xl font-black text-slate-900">Clients</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {loading ? "Loading…" : `${clients.length} registered accounts · all data saved & synced with Lina`}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAdd(true)}
              className="rounded-full px-5 py-2.5 text-sm font-bold text-white shadow-lg hover:opacity-90 transition-opacity"
              style={{ background: "linear-gradient(135deg,#0F6CF5,#0B1B4D)" }}
            >
              + New Client
            </button>
          </div>
        </header>

        {/* ── Search + Stats Bar ── */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <input
              type="text"
              placeholder="🔍  Search by name, email, destination…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          {[
            { label: "Total Accounts", value: clients.length, color: "text-blue-600" },
            { label: "With Destination", value: clients.filter(c => c.destination).length, color: "text-emerald-600" },
            { label: "High Value (>$5k)", value: clients.filter(c => c.deal_value > 5000).length, color: "text-amber-600" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl bg-white border border-slate-200 px-4 py-3 shadow-sm">
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Client Grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-white border border-slate-200 p-5 animate-pulse space-y-3">
                <div className="flex gap-3 items-center">
                  <div className="w-12 h-12 rounded-full bg-slate-200" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-4xl mb-3">👥</p>
            <p className="text-slate-600 font-semibold">No clients found</p>
            <p className="text-slate-400 text-sm mt-1">Add a client or wait for new registrations</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((c) => {
              const st = STATUS_COLORS[c.status] || STATUS_COLORS.new;
              return (
                <div
                  key={c.id}
                  onClick={() => openProfile(c)}
                  className="group rounded-2xl bg-white border border-slate-200 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <Avatar name={fullName(c)} email={c.email} size={48} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900 truncate">{fullName(c)}</p>
                        <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${st.bg} ${st.text}`}>
                          {c.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate">{c.email}</p>
                      {c.role && c.role !== "traveler" && (
                        <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 mt-0.5">{c.role}</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 space-y-1.5 text-xs text-slate-500">
                    {c.destination && (
                      <div className="flex items-center gap-1.5">
                        <span>✈️</span>
                        <span className="font-medium text-slate-700">{c.destination}</span>
                      </div>
                    )}
                    {c.phone && (
                      <div className="flex items-center gap-1.5">
                        <span>📱</span>
                        <span>{c.phone}</span>
                      </div>
                    )}
                    {c.deal_value > 0 && (
                      <div className="flex items-center gap-1.5">
                        <span>💰</span>
                        <span className="font-bold text-emerald-600">${Number(c.deal_value).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <span>📅</span>
                      <span>Joined {c.created_at ? new Date(c.created_at).toLocaleDateString("en-CA") : "—"}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400">{c.source || "signup"}</span>
                    <div className="flex items-center gap-2">
                      {canDelete && (
                        <button
                          onClick={(e) => { e.stopPropagation(); void deleteClient(c.email); }}
                          className="text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-0.5 rounded"
                          title="Delete client"
                        >🗑️</button>
                      )}
                      <span className="text-xs font-bold text-blue-600 group-hover:underline">Open 360° →</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Add Client Modal ── */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <h2 className="text-xl font-black text-slate-900">New Client</h2>
            <input className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Full name *" value={addName} onChange={e => setAddName(e.target.value)} />
            <input className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Email *" value={addEmail} onChange={e => setAddEmail(e.target.value)} />
            <input className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Phone" value={addPhone} onChange={e => setAddPhone(e.target.value)} />
            <input className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Destination" value={addDest} onChange={e => setAddDest(e.target.value)} />
            {addMsg && <p className="text-sm font-semibold">{addMsg}</p>}
            <div className="flex gap-2 justify-end pt-1">
              <button onClick={() => setShowAdd(false)} className="rounded-full px-4 py-2 text-sm border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={addClient} disabled={addSaving} className="rounded-full px-6 py-2 text-sm font-bold text-white" style={{ background: "linear-gradient(135deg,#0F6CF5,#0B1B4D)" }}>
                {addSaving ? "Saving…" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Client 360° Modal ── */}
      {selectedClient && sc && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/60 p-4 overflow-y-auto backdrop-blur-sm">
          <div className="w-full max-w-4xl rounded-3xl bg-white shadow-2xl my-6 overflow-hidden">

            {/* Modal Header */}
            <div className="relative p-6" style={{ background: "linear-gradient(135deg,#0B1B4D 0%,#0F6CF5 100%)" }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Avatar name={fullName(sc)} email={sc.email} size={64} />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-200">Client 360°</p>
                    <h2 className="text-2xl font-black text-white">{fullName(sc)}</h2>
                    <p className="text-blue-200 text-sm">{sc.email}{sc.phone ? ` · ${sc.phone}` : ""}</p>
                    {sc.destination && <p className="text-blue-300 text-xs mt-1">✈️ {sc.destination}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${scStatus.bg} ${scStatus.text}`}>{sc.status}</span>
                  <button onClick={() => setSelectedClient(null)} className="rounded-full bg-white/20 hover:bg-white/30 px-3 py-1.5 text-xs font-bold text-white transition-colors">
                    ✕ Close
                  </button>
                </div>
              </div>

              {/* Mini stats */}
              <div className="grid grid-cols-3 gap-3 mt-5">
                {[
                  { label: "Dossiers", value: selectedClient.dossiers.length },
                  { label: "Messages", value: selectedClient.conversations.length },
                  { label: "Pipeline", value: sc.deal_value ? `$${Number(sc.deal_value).toLocaleString()}` : "—" },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl bg-white/10 px-3 py-2 text-center">
                    <p className="text-lg font-black text-white">{s.value}</p>
                    <p className="text-xs text-blue-200">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto">
              {([
                { id: "profile", label: "👤 Profile" },
                { id: "dossiers", label: "🗂️ Dossiers", count: selectedClient.dossiers.length },
                { id: "notes", label: "📝 Notes", count: selectedClient.notes.length },
                { id: "chat", label: "💬 Conversations", count: selectedClient.conversations.length },
                { id: "proposals", label: "📋 Proposals", count: selectedClient.proposals.length },
              ] as const).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`shrink-0 flex items-center gap-1.5 px-5 py-3.5 text-sm font-semibold transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? "border-blue-600 text-blue-600 bg-white"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {tab.label}
                  {"count" in tab && (tab.count ?? 0) > 0 && (
                    <span className="rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5">{tab.count}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {profileLoading && (
                <div className="space-y-3 animate-pulse">
                  {[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-slate-100 rounded-xl" />)}
                </div>
              )}

              {/* PROFILE */}
              {activeTab === "profile" && !profileLoading && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                      <h4 className="font-bold text-xs text-slate-500 uppercase tracking-widest">📇 Contact Info</h4>
                      {[
                        { label: "Email", value: sc.email },
                        { label: "Phone", value: sc.phone || null },
                        { label: "Language", value: sc.language ? sc.language.toUpperCase() : null },
                        { label: "Source", value: sc.source || null },
                        { label: "Joined", value: sc.created_at ? new Date(sc.created_at).toLocaleDateString("en-CA") : null },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between text-sm">
                          <span className="text-slate-400">{label}</span>
                          <span className="font-medium text-slate-800">{value ?? <span className="text-slate-300 italic text-xs">Not provided</span>}</span>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                      <h4 className="font-bold text-xs text-slate-500 uppercase tracking-widest">✈️ Travel Profile</h4>
                      {[
                        { label: "Destination", value: sc.destination || null },
                        { label: "Deal Value", value: sc.deal_value ? `$${Number(sc.deal_value).toLocaleString()} USD` : null },
                        { label: "Status", value: sc.status },
                        { label: "Dossiers", value: `${selectedClient.dossiers.length} active` },
                        { label: "Lina chats", value: `${selectedClient.conversations.length} messages` },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between text-sm">
                          <span className="text-slate-400">{label}</span>
                          <span className="font-medium text-slate-800">{value ?? <span className="text-slate-300 italic text-xs">Not set</span>}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Coming soon fields */}
                  <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50 p-4">
                    <h4 className="font-bold text-xs text-amber-700 uppercase tracking-widest mb-3">📋 Auto-Collected by Lina Over Time</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {["🛂 Passport", "🏠 Address", "🎂 Birthday", "🚨 Emergency contact",
                        "💳 Preferred payment", "✈️ Seat preference", "🍽️ Dietary needs", "🏨 Hotel preference"].map((f) => (
                        <div key={f} className="rounded-xl bg-white/70 border border-amber-200 px-3 py-2 text-amber-600 text-xs font-medium opacity-70">{f}</div>
                      ))}
                    </div>
                    <p className="text-xs text-amber-500 mt-2">Lina asks naturally during chat and saves answers here automatically.</p>
                  </div>

                  {/* Last conversation preview */}
                  {selectedClient.conversations.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-sm text-slate-700">💬 Last Conversation</h4>
                        <button onClick={() => setActiveTab("chat")} className="text-xs font-semibold text-blue-600 hover:underline">
                          View all {selectedClient.conversations.length} →
                        </button>
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {[...selectedClient.conversations].slice(0, 3).map((c, i) => (
                          <div key={i} className={`rounded-xl p-3 text-sm ${c.role === "user" ? "bg-blue-50 border-l-4 border-blue-400" : "bg-slate-50 border-l-4 border-slate-300"}`}>
                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                              <span className="font-semibold">{c.role === "user" ? "👤 Client" : "🤖 Lina"}</span>
                              <span>{c.created_at ? new Date(c.created_at).toLocaleString("en-CA") : ""}</span>
                            </div>
                            <p className="text-slate-700 text-sm">{c.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* DOSSIERS */}
              {activeTab === "dossiers" && !profileLoading && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-slate-900">Travel Dossiers</h3>
                    <button
                      onClick={() => { setShowDossierForm(!showDossierForm); if (!showDossierForm && sc) setDossierDest(sc.destination || ""); }}
                      className="rounded-full px-4 py-2 text-sm font-bold text-white"
                      style={{ background: "linear-gradient(135deg,#0F6CF5,#0B1B4D)" }}
                    >
                      {showDossierForm ? "✕ Cancel" : "+ New Dossier"}
                    </button>
                  </div>

                  {showDossierForm && (
                    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 space-y-3">
                      <p className="text-sm font-bold text-blue-800">Create New Dossier</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input className="rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white" placeholder="Title *" value={dossierTitle} onChange={e => setDossierTitle(e.target.value)} />
                        <input className="rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white" placeholder="Destination" value={dossierDest} onChange={e => setDossierDest(e.target.value)} />
                        <input type="date" className="rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white" value={dossierDepart} onChange={e => setDossierDepart(e.target.value)} />
                        <input type="date" className="rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white" value={dossierReturn} onChange={e => setDossierReturn(e.target.value)} />
                        <input type="number" className="rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white" placeholder="Travelers" value={dossierTravelers} onChange={e => setDossierTravelers(Number(e.target.value))} />
                        <input type="number" className="rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white" placeholder="Budget (USD)" value={dossierBudget} onChange={e => setDossierBudget(e.target.value)} />
                        <select className="rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white" value={dossierType} onChange={e => setDossierType(e.target.value)}>
                          <option value="leisure">Leisure</option>
                          <option value="honeymoon">Honeymoon</option>
                          <option value="family">Family</option>
                          <option value="business">Business</option>
                          <option value="group">Group</option>
                          <option value="yacht">Yacht</option>
                        </select>
                        <select className="rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white" value={dossierStatus} onChange={e => setDossierStatus(e.target.value)}>
                          <option value="prospect">Prospect</option>
                          <option value="planning">Planning</option>
                          <option value="in_progress">In Progress</option>
                          <option value="proposal_sent">Proposal Sent</option>
                          <option value="confirmed">Confirmed</option>
                        </select>
                      </div>
                      <textarea className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white" rows={2} placeholder="Notes…" value={dossierNotes} onChange={e => setDossierNotes(e.target.value)} />
                      <button onClick={saveDossier} disabled={dossierSaving || !dossierTitle} className="rounded-full px-6 py-2 text-sm font-bold text-white disabled:opacity-50" style={{ background: "#0B1B4D" }}>
                        {dossierSaving ? "Saving…" : "💾 Save Dossier"}
                      </button>
                    </div>
                  )}

                  {selectedClient.dossiers.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center">
                      <p className="text-3xl mb-2">🗂️</p>
                      <p className="text-slate-500 text-sm">No dossiers yet — create the first one!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedClient.dossiers.map((d, i) => (
                        <div key={d.id || i} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1">
                              <p className="font-bold text-slate-900">{d.title}</p>
                              <p className="text-xs text-slate-500">
                                {d.destination || "—"} · {d.departure_date || "?"} → {d.return_date || "?"} · {d.travelers} travelers
                              </p>
                              {d.budget_usd > 0 && <p className="text-xs text-emerald-600 font-semibold">Budget: ${Number(d.budget_usd).toLocaleString()} USD</p>}
                              {d.notes && <p className="text-xs text-slate-600 mt-1 italic">"{d.notes}"</p>}
                            </div>
                            <span className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${DOSSIER_STATUS[d.status] || "bg-slate-100 text-slate-600"}`}>{d.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* NOTES */}
              {activeTab === "notes" && !profileLoading && (
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-slate-900">Agent Notes</h3>
                  <div className="flex gap-2">
                    <textarea
                      className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      rows={2}
                      placeholder="Add a note about this client…"
                      value={newNote}
                      onChange={e => setNewNote(e.target.value)}
                    />
                    <button onClick={saveNote} disabled={noteSaving || !newNote.trim()} className="rounded-full px-4 py-2 text-sm font-bold text-white self-end disabled:opacity-50" style={{ background: "#0F6CF5" }}>
                      {noteSaving ? "…" : "Add"}
                    </button>
                  </div>
                  {selectedClient.notes.length === 0 ? (
                    <p className="text-sm text-slate-400 italic">No notes yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedClient.notes.map((n, i) => (
                        <div key={n.id || i} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <p className="text-sm text-slate-800">{n.note}</p>
                          <p className="text-xs text-slate-400 mt-1">{n.created_at ? new Date(n.created_at).toLocaleString("en-CA") : ""}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* CONVERSATIONS */}
              {activeTab === "chat" && !profileLoading && (
                <div className="space-y-3">
                  <h3 className="font-bold text-lg text-slate-900">Lina Conversation History</h3>
                  {selectedClient.conversations.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center">
                      <p className="text-3xl mb-2">💬</p>
                      <p className="text-slate-500 text-sm">No conversations yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                      {[...selectedClient.conversations].reverse().map((c, i) => (
                        <div key={i} className={`rounded-xl p-3 text-sm ${c.role === "user" ? "bg-blue-50 border-l-4 border-blue-400" : "bg-slate-50 border-l-4 border-slate-300"}`}>
                          <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span className="font-bold">{c.role === "user" ? "👤 Client" : "🤖 Lina"} · {c.channel}</span>
                            <span>{c.created_at ? new Date(c.created_at).toLocaleString("en-CA") : ""}</span>
                          </div>
                          <p className="text-slate-700">{c.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* PROPOSALS & TRIPS */}
              {activeTab === "proposals" && !profileLoading && (
                <div className="space-y-6">
                  {/* Bookings - Past & Active Trips */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-lg text-slate-900">{"✈️ Voyages"}</h3>
                      <span className="text-xs text-slate-400">{selectedClient.bookings?.length || 0} booking(s)</span>
                    </div>
                    {(!selectedClient.bookings || selectedClient.bookings.length === 0) ? (
                      <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center">
                        <p className="text-3xl mb-2">{"✈️"}</p>
                        <p className="text-slate-500 text-sm">Aucun voyage encore.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedClient.bookings.map((b: any, i: number) => (
                          <div key={b.id || i} className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                            <div className="flex items-center justify-between">
                              <p className="font-bold text-slate-900">{b.destination || "Destination TBD"}</p>
                              <span className={`text-xs font-bold px-2 py-1 rounded-full ${b.status === "Confirmed" || b.status === "confirmed" ? "bg-emerald-100 text-emerald-700" : b.status === "Booked" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>{b.status}</span>
                            </div>
                            <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-600">
                              {b.departure_date && <span>{"📅"} {b.departure_date} → {b.return_date || "?"}</span>}
                              {b.travelers && <span>{"👥"} {b.travelers} voyageurs</span>}
                              {b.total_price && <span className="font-bold text-emerald-700">{"💰"} ${Number(b.total_price).toLocaleString()}</span>}
                            </div>
                            {b.payment_status && (
                              <div className="mt-2 flex gap-3 text-xs">
                                <span className={`font-semibold ${b.payment_status === "paid" ? "text-emerald-600" : "text-amber-600"}`}>{"💳"} {b.payment_status}</span>
                                {b.paid_amount && <span>Paid: ${Number(b.paid_amount).toLocaleString()}</span>}
                                {b.balance_due && Number(b.balance_due) > 0 && <span className="text-red-500">Due: ${Number(b.balance_due).toLocaleString()}</span>}
                              </div>
                            )}
                            {b.notes && <p className="text-xs text-slate-400 mt-2">{b.notes}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Proposals */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-lg text-slate-900">{"📋 Propositions"}</h3>
                      <Link href="/agent/proposals" className="rounded-full px-4 py-2 text-sm font-bold text-white" style={{ background: "linear-gradient(135deg,#0F6CF5,#0B1B4D)" }}>
                        + New Proposal
                      </Link>
                    </div>
                    {selectedClient.proposals.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center">
                        <p className="text-3xl mb-2">{"📋"}</p>
                        <p className="text-slate-500 text-sm">Aucune proposition pour ce client.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedClient.proposals.map((p: any, i: number) => (
                          <div key={p.id || i} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <div className="flex items-center justify-between">
                              <p className="font-bold text-slate-900">{p.title || p.destination || "Proposition"}</p>
                              <span className={`text-xs font-bold px-2 py-1 rounded-full ${p.status === "Sent" ? "bg-blue-100 text-blue-700" : p.status === "Accepted" ? "bg-emerald-100 text-emerald-700" : p.status === "Ready" ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-600"}`}>{p.status}</span>
                            </div>
                            <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-600">
                              {p.destination && <span>{"📍"} {p.destination}</span>}
                              {p.departure_date && <span>{"📅"} {p.departure_date} → {p.return_date || "?"}</span>}
                              {p.travelers && <span>{"👥"} {p.travelers} voyageurs</span>}
                              {p.trip_type && <span>{"🏷️"} {p.trip_type}</span>}
                            </div>
                            <div className="flex flex-wrap gap-3 mt-2 text-xs">
                              {p.budget_usd && <span className="text-slate-500">Budget: ${Number(p.budget_usd).toLocaleString()}</span>}
                              {p.total_price && <span className="font-bold text-violet-700">Total: ${Number(p.total_price).toLocaleString()}</span>}
                              <span className="text-slate-400">{new Date(p.created_at).toLocaleDateString("en-CA")}</span>
                            </div>
                            {p.notes && <p className="text-xs text-slate-400 mt-2">{p.notes}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
