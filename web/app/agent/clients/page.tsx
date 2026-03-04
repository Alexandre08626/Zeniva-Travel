"use client";
export const dynamic = "force-dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuthStore, hasPermission } from "../../../src/lib/authStore";
import { useRequireAnyPermission } from "../../../src/lib/roleGuards";
import { TITLE_TEXT, MUTED_TEXT, PREMIUM_BLUE } from "../../../src/design/tokens";

const VPS = "http://217.216.88.202:8000";
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
  updated_at: string;
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

type Note = {
  id?: string;
  note: string;
  category: string;
  created_at?: string;
};

type Conversation = {
  role: string;
  content: string;
  channel: string;
  created_at: string;
};

type ClientProfile = {
  client: Client;
  dossiers: Dossier[];
  proposals: any[];
  bookings: any[];
  notes: Note[];
  conversations: Conversation[];
  followups: any[];
};

export default function ClientsPage() {
  useRequireAnyPermission(["clients:all", "clients:own"], "/agent");
  const user = useAuthStore((s) => s.user);

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "dossiers" | "notes" | "chat" | "proposals">("profile");

  // New dossier form
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

  // New note form
  const [newNote, setNewNote] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);

  // Add client form
  const [showAddClient, setShowAddClient] = useState(false);
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPhone, setAddPhone] = useState("");
  const [addDest, setAddDest] = useState("");
  const [addSaving, setAddSaving] = useState(false);
  const [addMsg, setAddMsg] = useState("");

  const fetchClients = async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/agents-proxy?path=admin/all-clients`, {
        headers: { Authorization: AUTH },
      });
      const data = await r.json();
      const merged: Client[] = (data?.clients || []).map((a: any) => {
        const nameParts = (a.name || "").split(" ");
        return {
          id: a.id,
          email: a.email,
          first_name: nameParts[0] || "",
          last_name: nameParts.slice(1).join(" ") || "",
          phone: a.phone || "",
          destination: a.destination || "",
          status: a.lead_status || "new",
          language: a.language || "",
          deal_value: a.deal_value || 0,
          source: a.source || "signup",
          created_at: a.created_at,
          updated_at: a.created_at,
        };
      });
      setClients(merged);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchClients(); }, [user?.email]);

  const openProfile = async (c: Client) => {
    setSelectedClient({ client: c, dossiers: [], proposals: [], bookings: [], notes: [], conversations: [], followups: [] });
    setActiveTab("profile");
    setProfileLoading(true);
    try {
      const r = await fetch(`/api/agents-proxy?path=admin/client-profile/${encodeURIComponent(c.email)}`, {
        headers: { Authorization: AUTH },
      });
      if (r.ok) {
        const d = await r.json();
        setSelectedClient({
          client: c,
          dossiers: d.dossiers || [],
          proposals: d.proposals || [],
          bookings: d.bookings || [],
          notes: d.notes || [],
          conversations: d.conversations || [],
          followups: d.followups || [],
        });
      }
    } catch {}
    setProfileLoading(false);
  };

  const saveDossier = async () => {
    if (!selectedClient || !dossierTitle) return;
    setDossierSaving(true);
    try {
      const payload = {
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
      };
      const r = await fetch("/api/agents-proxy?path=admin/dossiers", {
        method: "POST",
        headers: { Authorization: AUTH, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (r.ok) {
        const newDos = await r.json();
        setSelectedClient((prev) => prev ? { ...prev, dossiers: [newDos, ...prev.dossiers] } : prev);
        setShowDossierForm(false);
        setDossierTitle(""); setDossierDest(""); setDossierDepart(""); setDossierReturn("");
        setDossierBudget(""); setDossierNotes("");
      }
    } catch {}
    setDossierSaving(false);
  };

  const saveNote = async () => {
    if (!selectedClient || !newNote.trim()) return;
    setNoteSaving(true);
    try {
      const payload = {
        client_id: selectedClient.client.id,
        client_email: selectedClient.client.email,
        agent_id: user?.email || "",
        note: newNote.trim(),
        category: "general",
      };
      const r = await fetch("/api/agents-proxy?path=admin/client-notes", {
        method: "POST",
        headers: { Authorization: AUTH, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (r.ok) {
        const n = await r.json();
        setSelectedClient((prev) => prev ? { ...prev, notes: [n, ...prev.notes] } : prev);
        setNewNote("");
      }
    } catch {}
    setNoteSaving(false);
  };

  const addClientAsLead = async () => {
    if (!addEmail || !addName) return;
    setAddSaving(true);
    setAddMsg("");
    try {
      const r = await fetch("/api/agents-proxy?path=admin/leads", {
        method: "POST",
        headers: { Authorization: AUTH, "Content-Type": "application/json" },
        body: JSON.stringify({
          email: addEmail.trim().toLowerCase(),
          first_name: addName.split(" ")[0],
          last_name: addName.split(" ").slice(1).join(" ") || "",
          phone: addPhone,
          destination: addDest,
          status: "client",
          source: "agent-added",
          language: "fr",
        }),
      });
      if (r.ok) {
        setAddMsg("✅ Client ajouté !");
        setAddName(""); setAddEmail(""); setAddPhone(""); setAddDest("");
        fetchClients();
        setTimeout(() => { setShowAddClient(false); setAddMsg(""); }, 2000);
      } else {
        setAddMsg("❌ Erreur — email déjà existant?");
      }
    } catch { setAddMsg("❌ Erreur réseau"); }
    setAddSaving(false);
  };

  const STATUS_BADGE: Record<string, string> = {
  client: "bg-emerald-100 text-emerald-700",
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-purple-100 text-purple-700",
  followed_up: "bg-amber-100 text-amber-700",
  junk: "bg-slate-100 text-slate-500",
  prospect: "bg-indigo-100 text-indigo-700",
};

const statusColor: Record<string, string> = {
    prospect: "bg-slate-100 text-slate-700",
    planning: "bg-blue-100 text-blue-700",
    in_progress: "bg-amber-100 text-amber-700",
    proposal_sent: "bg-purple-100 text-purple-700",
    confirmed: "bg-emerald-100 text-emerald-700",
    closed: "bg-gray-100 text-gray-500",
    cancelled: "bg-rose-100 text-rose-700",
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F3F6FB" }}>
      <div className="mx-auto max-w-6xl px-5 py-8 space-y-6">

        {/* Header */}
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Clients</p>
            <h1 className="text-3xl font-black" style={{ color: TITLE_TEXT }}>Client roster</h1>
            <p className="text-sm" style={{ color: MUTED_TEXT }}>{clients.length} clients actifs — Lina a accès à tous leurs dossiers</p>
          </div>
          <button
            onClick={() => setShowAddClient(true)}
            className="rounded-full px-5 py-2 text-sm font-bold text-white"
            style={{ backgroundColor: PREMIUM_BLUE }}
          >
            + Nouveau client
          </button>
        </header>

        {/* Add client modal */}
        {showAddClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
              <h2 className="text-xl font-black" style={{ color: TITLE_TEXT }}>Nouveau client</h2>
              <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Nom complet *" value={addName} onChange={e => setAddName(e.target.value)} />
              <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Email *" value={addEmail} onChange={e => setAddEmail(e.target.value)} />
              <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Téléphone" value={addPhone} onChange={e => setAddPhone(e.target.value)} />
              <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Destination" value={addDest} onChange={e => setAddDest(e.target.value)} />
              {addMsg && <p className="text-sm font-semibold">{addMsg}</p>}
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowAddClient(false)} className="rounded-full px-4 py-2 text-sm border border-slate-200 font-semibold">Annuler</button>
                <button onClick={addClientAsLead} disabled={addSaving} className="rounded-full px-5 py-2 text-sm font-bold text-white" style={{ backgroundColor: PREMIUM_BLUE }}>
                  {addSaving ? "Sauvegarde..." : "Créer"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Client list */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {loading ? (
            <p className="p-6 text-sm" style={{ color: MUTED_TEXT }}>Chargement...</p>
          ) : clients.length === 0 ? (
            <p className="p-6 text-sm" style={{ color: MUTED_TEXT }}>Aucun client trouvé.</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-left text-slate-600">
                  <th className="px-4 py-3 font-semibold">Client</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Téléphone</th>
                  <th className="px-4 py-3 font-semibold">Destination</th>
                  <th className="px-4 py-3 font-semibold">Budget</th>
                  <th className="px-4 py-3 font-semibold">Depuis</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold" style={{ color: TITLE_TEXT }}>
                      {`${c.first_name || ""} ${c.last_name || ""}`.trim() || c.email}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: MUTED_TEXT }}>{c.email}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: MUTED_TEXT }}>{c.phone || "—"}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: MUTED_TEXT }}>
                      <div className="flex items-center gap-2">
                        <span>{c.destination || "—"}</span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${STATUS_BADGE[c.status] || "bg-slate-100 text-slate-500"}`}>{c.status}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold">{c.deal_value ? `$${Number(c.deal_value).toLocaleString()}` : "—"}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: MUTED_TEXT }}>{c.created_at ? new Date(c.created_at).toLocaleDateString("fr-CA") : "—"}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openProfile(c)}
                        className="rounded-full px-3 py-1 text-xs font-bold text-white"
                        style={{ backgroundColor: PREMIUM_BLUE }}
                      >
                        Voir dossier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>

      {/* Client 360° Profile Modal */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/50 p-4 overflow-y-auto">
          <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl my-8">

            {/* Profile header */}
            <div className="flex items-start justify-between gap-4 p-6 border-b border-slate-200" style={{ background: `linear-gradient(135deg, #0B1B4D 0%, #0F6CF5 100%)` }}>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-200">Client 360°</p>
                <h2 className="text-2xl font-black text-white">
                  {`${selectedClient.client.first_name || ""} ${selectedClient.client.last_name || ""}`.trim() || selectedClient.client.email}
                </h2>
                <p className="text-blue-200 text-sm">{selectedClient.client.email} · {selectedClient.client.phone || "—"}</p>
                {selectedClient.client.destination && (
                  <p className="text-blue-200 text-xs mt-1">✈️ Destination: {selectedClient.client.destination}</p>
                )}
              </div>
              <button
                onClick={() => setSelectedClient(null)}
                className="rounded-full border border-blue-300 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
              >
                Fermer
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50">
              {(["profile", "dossiers", "notes", "chat", "proposals"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-3 text-sm font-semibold capitalize transition-colors ${activeTab === tab ? "border-b-2 border-blue-600 text-blue-600" : "text-slate-500 hover:text-slate-700"}`}
                >
                  {tab === "profile" ? "👤 Profile" : tab === "chat" ? "💬 Conversations" : tab === "proposals" ? "📋 Proposals" : tab === "dossiers" ? "🗂️ Dossiers" : "📝 Notes"}
                  {tab === "dossiers" && selectedClient.dossiers.length > 0 && (
                    <span className="ml-1 rounded-full bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5">{selectedClient.dossiers.length}</span>
                  )}
                  {tab === "notes" && selectedClient.notes.length > 0 && (
                    <span className="ml-1 rounded-full bg-amber-100 text-amber-700 text-xs px-1.5 py-0.5">{selectedClient.notes.length}</span>
                  )}
                  {tab === "chat" && selectedClient.conversations.length > 0 && (
                    <span className="ml-1 rounded-full bg-emerald-100 text-emerald-700 text-xs px-1.5 py-0.5">{selectedClient.conversations.length}</span>
                  )}
                </button>
              ))}
            </div>

            <div className="p-6">
              {profileLoading && <p className="text-sm text-slate-500">Chargement du dossier...</p>}

              {/* PROFILE TAB */}
              {activeTab === "profile" && !profileLoading && (
                <div className="space-y-6">
                  {/* Known info card */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Contact info */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                      <h4 className="font-bold text-sm text-slate-700 uppercase tracking-wide">📇 Contact</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Email</span>
                          <span className="font-medium text-slate-800">{selectedClient.client.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Phone</span>
                          <span className="font-medium text-slate-800">{selectedClient.client.phone ? selectedClient.client.phone : <span className="text-slate-400 italic">Not provided</span>}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Language</span>
                          <span className="font-medium text-slate-800 uppercase">{selectedClient.client.language || "—"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Source</span>
                          <span className="font-medium text-slate-800">{selectedClient.client.source || "—"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Client since</span>
                          <span className="font-medium text-slate-800">{selectedClient.client.created_at ? new Date(selectedClient.client.created_at).toLocaleDateString("en-CA") : "—"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Travel info */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                      <h4 className="font-bold text-sm text-slate-700 uppercase tracking-wide">✈️ Travel</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Destination</span>
                          <span className="font-medium text-slate-800">{selectedClient.client.destination ? selectedClient.client.destination : <span className="text-slate-400 italic">Not set</span>}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Deal value</span>
                          <span className="font-medium text-slate-800">{selectedClient.client.deal_value ? `$${Number(selectedClient.client.deal_value).toLocaleString()} USD` : <span className="text-slate-400 italic">Not set</span>}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Status</span>
                          <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-xs">{selectedClient.client.status}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Dossiers</span>
                          <span className="font-medium text-slate-800">{selectedClient.dossiers.length} dossier{selectedClient.dossiers.length !== 1 ? "s" : ""}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Conversations</span>
                          <span className="font-medium text-slate-800">{selectedClient.conversations.length} message{selectedClient.conversations.length !== 1 ? "s" : ""} with Lina</span>
                        </div>
                      </div>
                    </div>

                    {/* To be collected */}
                    <div className="md:col-span-2 rounded-xl border border-dashed border-amber-300 bg-amber-50 p-4 space-y-2">
                      <h4 className="font-bold text-sm text-amber-700 uppercase tracking-wide">📋 Coming Soon — Auto-Collected by Lina</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        {["🛂 Passport", "🏠 Address", "🎂 Birthday", "🚨 Emergency contact", "💳 Preferred payment", "✈️ Seat preference", "🍽️ Dietary needs", "🏨 Hotel preference"].map(f => (
                          <div key={f} className="rounded-lg bg-white border border-amber-200 px-3 py-2 text-amber-700 text-xs font-medium opacity-60">{f}</div>
                        ))}
                      </div>
                      <p className="text-xs text-amber-600">As Lina chats with this client, she collects and saves this info automatically.</p>
                    </div>
                  </div>

                  {/* Last conversation preview */}
                  {selectedClient.conversations.length > 0 && (
                    <div>
                      <h4 className="font-bold text-sm text-slate-700 mb-3">💬 Last Conversation</h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {[...selectedClient.conversations].slice(0, 4).map((c, i) => (
                          <div key={i} className={`rounded-lg p-3 text-sm ${c.role === "user" ? "bg-blue-50 border-l-4 border-blue-400" : "bg-slate-50 border-l-4 border-slate-300"}`}>
                            <div className="flex justify-between text-xs text-slate-500 mb-1">
                              <span className="font-semibold">{c.role === "user" ? "👤 Client" : "🤖 Lina"}</span>
                              <span>{c.created_at ? new Date(c.created_at).toLocaleString("en-CA") : ""}</span>
                            </div>
                            <p className="text-slate-700">{c.content}</p>
                          </div>
                        ))}
                      </div>
                      <button onClick={() => setActiveTab("chat")} className="mt-2 text-xs font-semibold text-blue-600 hover:underline">
                        View all {selectedClient.conversations.length} messages →
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* DOSSIERS TAB */}
              {activeTab === "dossiers" && !profileLoading && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg" style={{ color: TITLE_TEXT }}>Dossiers voyage</h3>
                    <button
                      onClick={() => { setShowDossierForm(!showDossierForm); if (!showDossierForm && selectedClient) { setDossierDest(selectedClient.client.destination || ""); } }}
                      className="rounded-full px-4 py-2 text-sm font-bold text-white"
                      style={{ backgroundColor: PREMIUM_BLUE }}
                    >
                      {showDossierForm ? "Annuler" : "+ Nouveau dossier"}
                    </button>
                  </div>

                  {/* New dossier form */}
                  {showDossierForm && (
                    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 space-y-3">
                      <p className="text-sm font-bold text-blue-800">Créer un nouveau dossier</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Titre du dossier *" value={dossierTitle} onChange={e => setDossierTitle(e.target.value)} />
                        <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Destination" value={dossierDest} onChange={e => setDossierDest(e.target.value)} />
                        <input type="date" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Départ" value={dossierDepart} onChange={e => setDossierDepart(e.target.value)} />
                        <input type="date" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Retour" value={dossierReturn} onChange={e => setDossierReturn(e.target.value)} />
                        <input type="number" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Voyageurs" value={dossierTravelers} onChange={e => setDossierTravelers(Number(e.target.value))} />
                        <input type="number" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Budget USD" value={dossierBudget} onChange={e => setDossierBudget(e.target.value)} />
                        <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm" value={dossierType} onChange={e => setDossierType(e.target.value)}>
                          <option value="leisure">Leisure</option>
                          <option value="honeymoon">Honeymoon</option>
                          <option value="family">Family</option>
                          <option value="business">Business</option>
                          <option value="group">Group</option>
                          <option value="yacht">Yacht</option>
                        </select>
                        <select className="rounded-lg border border-slate-200 px-3 py-2 text-sm" value={dossierStatus} onChange={e => setDossierStatus(e.target.value)}>
                          <option value="prospect">Prospect</option>
                          <option value="planning">Planning</option>
                          <option value="in_progress">En cours</option>
                          <option value="proposal_sent">Proposition envoyée</option>
                          <option value="confirmed">Confirmé</option>
                        </select>
                      </div>
                      <textarea className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" rows={2} placeholder="Notes..." value={dossierNotes} onChange={e => setDossierNotes(e.target.value)} />
                      <button onClick={saveDossier} disabled={dossierSaving || !dossierTitle} className="rounded-full px-5 py-2 text-sm font-bold text-white" style={{ backgroundColor: "#0B1B4D" }}>
                        {dossierSaving ? "Sauvegarde..." : "💾 Sauvegarder"}
                      </button>
                    </div>
                  )}

                  {/* Dossier list */}
                  {selectedClient.dossiers.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
                      <p className="text-slate-500 text-sm">Aucun dossier — crée le premier !</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedClient.dossiers.map((d, i) => (
                        <div key={d.id || i} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-bold text-sm" style={{ color: TITLE_TEXT }}>{d.title}</p>
                              <p className="text-xs text-slate-500">{d.destination || "—"} · {d.departure_date || "?"} → {d.return_date || "?"} · {d.travelers} voyageurs</p>
                              {d.budget_usd && <p className="text-xs text-slate-500">Budget: ${Number(d.budget_usd).toLocaleString()} USD</p>}
                              {d.notes && <p className="text-xs text-slate-600 mt-1">{d.notes}</p>}
                            </div>
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColor[d.status] || "bg-slate-100 text-slate-600"}`}>
                              {d.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* NOTES TAB */}
              {activeTab === "notes" && !profileLoading && (
                <div className="space-y-4">
                  <h3 className="font-bold text-lg" style={{ color: TITLE_TEXT }}>Notes agent</h3>
                  <div className="flex gap-2">
                    <textarea
                      className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      rows={2}
                      placeholder="Ajouter une note sur ce client..."
                      value={newNote}
                      onChange={e => setNewNote(e.target.value)}
                    />
                    <button onClick={saveNote} disabled={noteSaving || !newNote.trim()} className="rounded-full px-4 py-2 text-sm font-bold text-white self-end" style={{ backgroundColor: PREMIUM_BLUE }}>
                      {noteSaving ? "..." : "Ajouter"}
                    </button>
                  </div>
                  {selectedClient.notes.length === 0 ? (
                    <p className="text-sm text-slate-500">Aucune note.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedClient.notes.map((n, i) => (
                        <div key={n.id || i} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                          <p className="text-sm" style={{ color: TITLE_TEXT }}>{n.note}</p>
                          <p className="text-xs text-slate-400 mt-1">{n.created_at ? new Date(n.created_at).toLocaleString("fr-CA") : ""}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* CONVERSATIONS TAB */}
              {activeTab === "chat" && !profileLoading && (
                <div className="space-y-3">
                  <h3 className="font-bold text-lg" style={{ color: TITLE_TEXT }}>Historique conversations avec Lina</h3>
                  {selectedClient.conversations.length === 0 ? (
                    <p className="text-sm text-slate-500">Aucune conversation.</p>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {[...selectedClient.conversations].reverse().map((c, i) => (
                        <div key={i} className={`rounded-lg p-3 text-sm ${c.role === "user" ? "bg-blue-50 border-l-4 border-blue-400" : "bg-slate-50 border-l-4 border-slate-300"}`}>
                          <div className="flex justify-between text-xs text-slate-500 mb-1">
                            <span className="font-semibold">{c.role === "user" ? "👤 Client" : "🤖 Lina"} · {c.channel}</span>
                            <span>{c.created_at ? new Date(c.created_at).toLocaleString("fr-CA") : ""}</span>
                          </div>
                          <p style={{ color: TITLE_TEXT }}>{c.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* PROPOSALS TAB */}
              {activeTab === "proposals" && !profileLoading && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg" style={{ color: TITLE_TEXT }}>Propositions & Devis</h3>
                    <Link href="/agent/proposals" className="rounded-full px-4 py-2 text-sm font-bold text-white" style={{ backgroundColor: PREMIUM_BLUE }}>
                      Créer proposition
                    </Link>
                  </div>
                  {selectedClient.proposals.length === 0 ? (
                    <p className="text-sm text-slate-500">Aucune proposition pour ce client.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedClient.proposals.map((p: any, i: number) => (
                        <div key={p.id || i} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                          <p className="font-bold text-sm" style={{ color: TITLE_TEXT }}>{p.title || "Sans titre"}</p>
                          <p className="text-xs text-slate-500">{p.destination} · {p.departure_date} · ${p.total_price?.toLocaleString()}</p>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${statusColor[p.status] || "bg-slate-100 text-slate-600"}`}>{p.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
// deploy 1772644523
