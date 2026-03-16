"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { useAuthStore } from "../../../src/lib/authStore";
import { TITLE_TEXT, MUTED_TEXT, PREMIUM_BLUE } from "../../../src/design/tokens";

const VPS = "https://vmi3097009.contaboserver.net";
type Tab = "overview" | "leads" | "marketing" | "commissions" | "chat" | "yachts";

// ─── KPI Card ────────────────────────────────────────────────────
function Kpi({ icon, label, value, sub, color }: { icon: string; label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-start gap-4">
      <div className={`h-11 w-11 rounded-xl ${color} flex items-center justify-center text-lg text-white shrink-0`}>{icon}</div>
      <div>
        <div className="text-2xl font-black" style={{ color: TITLE_TEXT }}>{value}</div>
        <div className="text-xs font-semibold text-slate-500">{label}</div>
        {sub && <div className="text-[10px] text-slate-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

export default function AgentAIDashboard() {
  const user = useAuthStore((s) => s.user);
  const roles = useMemo(() => user?.roles || (user?.role ? [user.role] : []), [user]);
  const isYacht = roles.includes("yacht_broker");
  const isInfluencer = roles.includes("influencer");
  const agentName = user?.name || "Agent";
  const agentEmail = user?.email || "";
  const agentRole = isYacht ? "yacht_broker" : "travel_agent";

  const [tab, setTab] = useState<Tab>("overview");
  const [leads, setLeads] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [yachts, setYachts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Chat
  const [msgs, setMsgs] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Marketing
  const [mktType, setMktType] = useState("social_post");
  const [mktDetails, setMktDetails] = useState("");
  const [mktResult, setMktResult] = useState("");
  const [mktLoading, setMktLoading] = useState(false);

  const hdr = { Authorization: "Bearer zeniva-secret-2025", "Content-Type": "application/json" };

  // ─── Fetch data ──────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [lr, cr, yr] = await Promise.all([
        fetch(`${VPS}/agents/leads`, { headers: hdr }),
        fetch(`${VPS}/agents/commissions`, { headers: hdr }),
        isYacht ? fetch(`${VPS}/agents/yachts`, { headers: hdr }) : Promise.resolve(null),
      ]);
      const ld = await lr.json(); setLeads(ld.leads || []);
      const cd = await cr.json(); setCommissions(cd.commissions || []);
      if (yr) { const yd = await yr.json(); setYachts(yd.yachts || []); }
    } catch {}
    setLoading(false);
  }, [isYacht]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Chat
  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [msgs]);
  useEffect(() => { if (tab === "chat") inputRef.current?.focus(); }, [tab]);

  const sendChat = async () => {
    const text = chatInput.trim();
    if (!text || chatLoading) return;
    const newMsgs = [...msgs, { role: "user" as const, content: text }];
    setMsgs(newMsgs);
    setChatInput("");
    setChatLoading(true);
    try {
      const res = await fetch(`${VPS}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text, sessionId: `agent-${agentEmail}`,
          agentEmail, agentRole, source: "zenivatravel.com",
          history: newMsgs.slice(-20).map(m => ({ role: m.role === "assistant" ? "assistant" : "user", text: m.content })),
        }),
      });
      const data = await res.json();
      setMsgs(prev => [...prev, { role: "assistant", content: data.response || data.reply || "..." }]);
    } catch { setMsgs(prev => [...prev, { role: "assistant", content: "❌ Connection error" }]); }
    finally { setChatLoading(false); }
  };

  // Marketing
  const genMarketing = async () => {
    setMktLoading(true); setMktResult("");
    try {
      const res = await fetch(`${VPS}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Generate marketing content of type "${mktType}". Details: ${mktDetails || "general content for my business"}. Generate the content directly, no questions.`,
          sessionId: `agent-mkt-${agentEmail}`, agentEmail, agentRole, source: "zenivatravel.com",
        }),
      });
      const data = await res.json();
      setMktResult(data.response || data.reply || "Erreur");
    } catch { setMktResult("❌ Erreur"); }
    finally { setMktLoading(false); }
  };

  // ─── Stats ──────────────────────────────────────────────────────
  const openLeads = leads.filter(l => !l.deal_status || l.deal_status === "open").length;
  const closedDeals = leads.filter(l => l.deal_status === "closed_won").length;
  const revenue = leads.filter(l => l.deal_status === "closed_won").reduce((s, l) => s + (parseFloat(l.deal_value) || 0), 0);
  const totalComm = commissions.reduce((s, c) => s + (parseFloat(c.commission_amount) || 0), 0);
  const pendingComm = commissions.filter(c => c.status === "pending").reduce((s, c) => s + (parseFloat(c.commission_amount) || 0), 0);

  // ─── Tabs config ────────────────────────────────────────────────
  const TABS: { id: Tab; label: string }[] = [
    { id: "overview", label: "🏠 Overview" },
    { id: "leads", label: `👥 Mes Clients (${leads.length})` },
    { id: "chat", label: "💬 Lina IA" },
    { id: "marketing", label: "📣 Marketing" },
    { id: "commissions", label: `💰 Commissions (${commissions.length})` },
    ...(isYacht ? [{ id: "yachts" as Tab, label: `⛵ Mes Yachts (${yachts.length})` }] : []),
  ];

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F3F6FB" }}>
      <div className="mx-auto max-w-6xl px-4 py-5 space-y-5">
        {/* Header */}
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Command Center</p>
            <h1 className="text-2xl font-black" style={{ color: TITLE_TEXT }}>{agentName}</h1>
            <p className="text-sm" style={{ color: MUTED_TEXT }}>
              {isYacht ? "⛵ Yacht Broker" : "✈️ Agent de Voyage"}{isInfluencer ? " + 📱 Influenceur" : ""} · {agentEmail}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/agent" className="rounded-full px-4 py-2 text-sm font-bold border border-slate-200 bg-white text-slate-700 hover:border-slate-300">
              ← Dashboard
            </Link>
            <button onClick={fetchData} className="rounded-full px-4 py-2 text-sm font-bold text-white" style={{ backgroundColor: PREMIUM_BLUE }}>
              🔄 Refresh
            </button>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                tab === t.id ? "bg-indigo-600 text-white shadow" : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
              }`}>{t.label}</button>
          ))}
        </div>

        {/* ═══ OVERVIEW ═══ */}
        {tab === "overview" && (
          <div className="space-y-5">
            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Kpi icon="👥" label="Mes Clients" value={leads.length} sub={`${openLeads} actifs`} color="bg-indigo-600" />
              <Kpi icon="🎯" label="Closed Deals" value={closedDeals} sub={`$${revenue.toLocaleString()} revenue`} color="bg-emerald-600" />
              <Kpi icon="💰" label="Commissions" value={`$${totalComm.toLocaleString()}`} sub={`$${pendingComm.toLocaleString()} en attente`} color="bg-amber-500" />
              {isYacht ? (
                <Kpi icon="⛵" label="Mes Yachts" value={yachts.length} sub={`${yachts.filter(y => y.available).length} disponibles`} color="bg-sky-600" />
              ) : (
                <Kpi icon="📊" label="Taux Conversion" value={leads.length > 0 ? `${Math.round(closedDeals / leads.length * 100)}%` : "—"} sub="deals / clients" color="bg-purple-600" />
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <h3 className="text-sm font-bold mb-4" style={{ color: TITLE_TEXT }}>⚡ Actions Rapides</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: "Talk to Lina", icon: "💬", action: () => setTab("chat"), desc: "Personalized AI assistant" },
                  { label: "Create content", icon: "📣", action: () => setTab("marketing"), desc: "Posts, emails, captions" },
                  { label: "Voir mes clients", icon: "👥", action: () => setTab("leads"), desc: `${leads.length} clients` },
                  { label: "Mes commissions", icon: "💰", action: () => setTab("commissions"), desc: `$${totalComm.toLocaleString()} total` },
                ].map(a => (
                  <button key={a.label} onClick={a.action}
                    className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-all text-left">
                    <span className="text-2xl">{a.icon}</span>
                    <div>
                      <div className="text-sm font-bold" style={{ color: TITLE_TEXT }}>{a.label}</div>
                      <div className="text-[10px] text-slate-400">{a.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Leads */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center">
                <h3 className="text-sm font-bold" style={{ color: TITLE_TEXT }}>👥 Derniers Clients</h3>
                <button onClick={() => setTab("leads")} className="text-xs font-semibold text-indigo-600">Voir tout →</button>
              </div>
              <div className="divide-y divide-slate-100">
                {leads.length === 0 && <div className="px-5 py-8 text-center text-sm text-slate-400">No clients yet</div>}
                {leads.slice(0, 5).map(l => (
                  <div key={l.id} className="px-5 py-3 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-700">
                      {(l.first_name || "?")[0]}{(l.last_name || "")[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold" style={{ color: TITLE_TEXT }}>{l.first_name} {l.last_name}</div>
                      <div className="text-xs text-slate-400">{l.destination || "—"} · {l.email}</div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                      l.deal_status === "closed_won" ? "bg-emerald-100 text-emerald-700" :
                      l.status === "new" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"
                    }`}>{l.deal_status === "closed_won" ? "DEAL ✅" : (l.status || "new").toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ LEADS ═══ */}
        {tab === "leads" && (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200">
              <h3 className="text-sm font-bold" style={{ color: TITLE_TEXT }}>👥 Mes Clients ({leads.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="px-5 py-3">Client</th>
                    <th className="px-5 py-3">Destination</th>
                    <th className="px-5 py-3">Contact</th>
                    <th className="px-5 py-3">Statut</th>
                    <th className="px-5 py-3">Deal</th>
                    <th className="px-5 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leads.length === 0 && (
                    <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400">No assigned clients</td></tr>
                  )}
                  {leads.map(l => (
                    <tr key={l.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-semibold" style={{ color: TITLE_TEXT }}>{l.first_name} {l.last_name}</td>
                      <td className="px-5 py-3 text-slate-600">{l.destination || "—"}</td>
                      <td className="px-5 py-3">
                        <div className="text-xs text-slate-500">{l.email}</div>
                        <div className="text-xs text-slate-400">{l.phone}</div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                          l.status === "new" ? "bg-blue-100 text-blue-700" :
                          l.status === "contacted" ? "bg-amber-100 text-amber-700" :
                          l.status === "converted" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                        }`}>{(l.status || "new").toUpperCase()}</span>
                      </td>
                      <td className="px-5 py-3">
                        {l.deal_status === "closed_won" ? (
                          <span className="text-emerald-600 font-bold">${parseFloat(l.deal_value || 0).toLocaleString()}</span>
                        ) : (
                          <span className="text-slate-400 text-xs">{l.deal_status || "open"}</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-400">{l.created_at ? new Date(l.created_at).toLocaleDateString("fr-CA") : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══ CHAT (Lina) ═══ */}
        {tab === "chat" && (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col" style={{ height: "calc(100vh - 260px)", minHeight: 400 }}>
            <div className="bg-indigo-600 text-white px-6 py-3 flex items-center gap-3 shrink-0">
              <div className="h-9 w-9 rounded-full bg-indigo-500 flex items-center justify-center text-lg">✈️</div>
              <div className="flex-1">
                <div className="font-bold text-sm">Lina — {isYacht ? "Mode Yacht & Influenceur" : "Mode Agent Voyage"}</div>
                <div className="text-xs text-indigo-200">Invoices, marketing, itineraries, client follow-up, lead scoring...</div>
              </div>
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div ref={chatRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-3 bg-slate-50">
              {msgs.length === 0 && (
                <div className="text-center text-slate-400 mt-12 space-y-3">
                  <div className="text-4xl">💬</div>
                  <div className="text-sm font-medium">Salut {agentName.split(" ")[0]}! Je suis Lina, ton assistante IA.</div>
                  <div className="text-xs">Ask me to create an invoice, marketing post, itinerary, score a lead...</div>
                  <div className="flex flex-wrap gap-2 justify-center mt-4">
                    {(isYacht ? [
                      "Create an Instagram post for a yacht in the Bahamas",
                      "Fais-moi une facture charter yacht",
                      "Strategy to find yacht leads",
                      "Caption TikTok virale pour yacht",
                    ] : [
                      "Create a 7-day Japan itinerary",
                      "Fais-moi une facture voyage all-inclusive",
                      "Follow-up email for a client",
                      "Facebook post for summer promo",
                    ]).map(s => (
                      <button key={s} onClick={() => { setChatInput(s); }}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 transition-all">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {msgs.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  {m.role === "assistant" && <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm mr-2 mt-1 shrink-0">✈️</div>}
                  <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === "user" ? "bg-indigo-600 text-white rounded-br-md" : "bg-white text-slate-800 border border-slate-200 rounded-bl-md shadow-sm"
                  }`}>{m.content}</div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm mr-2 mt-1 shrink-0">✈️</div>
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                    <div className="flex gap-1.5">
                      <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="border-t border-slate-200 p-4 bg-white shrink-0">
              <div className="flex gap-3">
                <input ref={inputRef} value={chatInput} onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendChat()}
                  placeholder="Type your message to Lina..." disabled={chatLoading}
                  className="flex-1 px-4 py-3 bg-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" />
                <button onClick={sendChat} disabled={chatLoading || !chatInput.trim()}
                  className="h-11 w-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-40 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══ MARKETING ═══ */}
        {tab === "marketing" && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
            <h2 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>📣 Content Generator</h2>
            <p className="text-sm" style={{ color: MUTED_TEXT }}>Lina generates marketing content tailored to your domain. Choose the type and describe what you want.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Type</label>
                <select value={mktType} onChange={e => setMktType(e.target.value)}
                  className="mt-1 w-full px-4 py-3 border border-slate-200 rounded-xl text-sm">
                  <option value="social_post">📱 Social media post</option>
                  <option value="email_campaign">📧 Email marketing</option>
                  <option value="listing_description">📝 Description de listing</option>
                  <option value="follow_up">🔄 Email de relance</option>
                  {(isYacht || isInfluencer) && <option value="influencer_caption">🎬 Caption influenceur (IG/TikTok)</option>}
                  <option value="itinerary">🗺️ Travel itinerary</option>
                  <option value="invoice">🧾 Facture</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Details</label>
                <input value={mktDetails} onChange={e => setMktDetails(e.target.value)}
                  placeholder={isYacht ? "Catamaran 50ft, Bahamas, 8 personnes..." : "All-inclusive Cancun, famille 4, budget $5000..."}
                  className="mt-1 w-full px-4 py-3 border border-slate-200 rounded-xl text-sm" />
              </div>
            </div>
            <button onClick={genMarketing} disabled={mktLoading}
              className="px-6 py-3 rounded-xl text-white font-bold text-sm disabled:opacity-40" style={{ backgroundColor: PREMIUM_BLUE }}>
              {mktLoading ? "⏳ Lina is working..." : "🚀 Generate"}
            </button>
            {mktResult && (
              <div className="relative">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 whitespace-pre-wrap text-sm leading-relaxed">{mktResult}</div>
                <button onClick={() => { navigator.clipboard.writeText(mktResult); }}
                  className="absolute top-3 right-3 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-indigo-50">
                  📋 Copy
                </button>
              </div>
            )}
          </div>
        )}

        {/* ═══ COMMISSIONS ═══ */}
        {tab === "commissions" && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <Kpi icon="💰" label="Total Commissions" value={`$${totalComm.toLocaleString()}`} color="bg-emerald-600" />
              <Kpi icon="⏳" label="En Attente" value={`$${pendingComm.toLocaleString()}`} color="bg-amber-500" />
              <Kpi icon="✅" label="Paid" value={`$${(totalComm - pendingComm).toLocaleString()}`} color="bg-indigo-600" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200">
                <h3 className="text-sm font-bold" style={{ color: TITLE_TEXT }}>💰 Historique des Commissions</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase">
                      <th className="px-5 py-3">Deal</th>
                      <th className="px-5 py-3">Montant Deal</th>
                      <th className="px-5 py-3">Taux</th>
                      <th className="px-5 py-3">Commission</th>
                      <th className="px-5 py-3">Closed by</th>
                      <th className="px-5 py-3">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {commissions.length === 0 && (
                      <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400">No commissions yet</td></tr>
                    )}
                    {commissions.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="px-5 py-3 font-semibold" style={{ color: TITLE_TEXT }}>#{(c.id || "").slice(0, 8)}</td>
                        <td className="px-5 py-3">${parseFloat(c.deal_value || 0).toLocaleString()}</td>
                        <td className="px-5 py-3">{c.commission_rate}%</td>
                        <td className="px-5 py-3 font-bold text-emerald-600">${parseFloat(c.commission_amount || 0).toLocaleString()}</td>
                        <td className="px-5 py-3 text-xs text-slate-500">{c.closed_by === "lina_ai" ? "🤖 Lina" : c.closed_by === "manual" ? "👤 Manuel" : "👤 Agent"}</td>
                        <td className="px-5 py-3">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                            c.status === "paid" ? "bg-emerald-100 text-emerald-700" :
                            c.status === "approved" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                          }`}>{(c.status || "pending").toUpperCase()}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═══ YACHTS (Jason only) ═══ */}
        {tab === "yachts" && isYacht && (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200">
              <h3 className="text-sm font-bold" style={{ color: TITLE_TEXT }}>⛵ Mes Yachts ({yachts.length})</h3>
            </div>
            {yachts.length === 0 ? (
              <div className="px-5 py-8 text-center text-slate-400 text-sm">No yachts listed</div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
                {yachts.map(y => (
                  <div key={y.id} className="border border-slate-200 rounded-xl p-4 hover:border-indigo-200 transition-all">
                    <div className="text-lg font-bold" style={{ color: TITLE_TEXT }}>{y.name}</div>
                    <div className="text-xs text-slate-500 mt-1">{y.yacht_type} · {y.length_ft}ft · {y.capacity} pers.</div>
                    <div className="text-xs text-slate-400 mt-1">{y.location}</div>
                    <div className="flex gap-3 mt-3">
                      {y.price_per_day && <span className="text-sm font-bold text-indigo-600">${y.price_per_day}/jour</span>}
                      {y.price_per_week && <span className="text-sm font-bold text-emerald-600">${y.price_per_week}/sem</span>}
                    </div>
                    <span className={`mt-2 inline-block text-[10px] font-bold px-2 py-1 rounded-full ${
                      y.available ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                    }`}>{y.available ? "DISPONIBLE" : "INDISPONIBLE"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 py-4">
          Zeniva Travel Agent Command Center · Powered by Lina IA
        </div>
      </div>
    </main>
  );
}
