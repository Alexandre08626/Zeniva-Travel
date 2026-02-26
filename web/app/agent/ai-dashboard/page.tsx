"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuthStore } from "../../../src/lib/authStore";
import { TITLE_TEXT, MUTED_TEXT, PREMIUM_BLUE } from "../../../src/design/tokens";

const VPS_API = "https://vmi3097009.contaboserver.net";

type Message = { role: "user" | "assistant"; content: string };

export default function AgentAIDashboard() {
  const user = useAuthStore((s) => s.user);
  const [agentToken, setAgentToken] = useState<string | null>(null);
  const [agentInfo, setAgentInfo] = useState<any>(null);
  const [loginError, setLoginError] = useState("");
  const [tab, setTab] = useState<"chat" | "marketing" | "leads" | "invoicing">("chat");

  // Chat
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Marketing
  const [mktType, setMktType] = useState("social_post");
  const [mktDetails, setMktDetails] = useState("");
  const [mktResult, setMktResult] = useState("");
  const [mktLoading, setMktLoading] = useState(false);

  // Lead scoring
  const [leadData, setLeadData] = useState('{"name":"","email":"","destination":"","budget":""}');
  const [scoreResult, setScoreResult] = useState<any>(null);
  const [scoreLoading, setScoreLoading] = useState(false);

  // Invoicing
  const [invClient, setInvClient] = useState("");
  const [invItems, setInvItems] = useState('[{"description":"Vol aller-retour","price":800},{"description":"Hôtel 5 nuits","price":1200}]');
  const [invNotes, setInvNotes] = useState("");
  const [invResult, setInvResult] = useState("");
  const [invLoading, setInvLoading] = useState(false);

  // Auto-scroll chat
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [msgs]);
  useEffect(() => {
    if (tab === "chat") inputRef.current?.focus();
  }, [tab]);

  // Auto-login with user email
  useEffect(() => {
    if (!user?.email || agentToken) return;
    // Try login with stored password or skip
    const stored = localStorage.getItem(`zeniva_agent_token_${user.email}`);
    if (stored) {
      setAgentToken(stored);
      fetchProfile(stored);
    }
  }, [user?.email, agentToken]);

  const fetchProfile = async (token: string) => {
    try {
      const res = await fetch(`${VPS_API}/agents/me`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setAgentInfo(data.agent);
      }
    } catch {}
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = (form.get("email") as string) || user?.email || "";
    const password = form.get("password") as string;
    setLoginError("");
    try {
      const res = await fetch(`${VPS_API}/agents/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setLoginError(data.detail || "Erreur de connexion"); return; }
      setAgentToken(data.token);
      setAgentInfo(data.agent);
      localStorage.setItem(`zeniva_agent_token_${email}`, data.token);
    } catch { setLoginError("Serveur non disponible"); }
  };

  const authHeaders = () => ({ Authorization: `Bearer ${agentToken}`, "Content-Type": "application/json" });

  // ─── Chat ────
  const sendChat = async () => {
    const text = chatInput.trim();
    if (!text || chatLoading) return;
    const newMsgs: Message[] = [...msgs, { role: "user", content: text }];
    setMsgs(newMsgs);
    setChatInput("");
    setChatLoading(true);
    try {
      const res = await fetch(`${VPS_API}/agents/ai/chat`, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ message: text, history: newMsgs.slice(-20).map(m => ({ role: m.role, content: m.content })) }),
      });
      const data = await res.json();
      setMsgs(prev => [...prev, { role: "assistant", content: data.reply || "..." }]);
    } catch {
      setMsgs(prev => [...prev, { role: "assistant", content: "❌ Erreur de connexion" }]);
    } finally { setChatLoading(false); }
  };

  // ─── Marketing ────
  const genMarketing = async () => {
    setMktLoading(true); setMktResult("");
    try {
      const res = await fetch(`${VPS_API}/agents/ai/marketing`, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ content_type: mktType, details: mktDetails }),
      });
      const data = await res.json();
      setMktResult(data.content || "Erreur");
    } catch { setMktResult("❌ Erreur"); }
    finally { setMktLoading(false); }
  };

  // ─── Lead Score ────
  const scoreLead = async () => {
    setScoreLoading(true); setScoreResult(null);
    try {
      const res = await fetch(`${VPS_API}/agents/ai/score-lead`, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ lead_data: JSON.parse(leadData) }),
      });
      setScoreResult(await res.json());
    } catch { setScoreResult({ score: 0, reason: "Erreur" }); }
    finally { setScoreLoading(false); }
  };

  // ─── Invoice ────
  const genInvoice = async () => {
    setInvLoading(true); setInvResult("");
    try {
      const res = await fetch(`${VPS_API}/agents/ai/invoice`, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ client_name: invClient, items: JSON.parse(invItems), notes: invNotes }),
      });
      const data = await res.json();
      setInvResult(data.invoice_draft || "Erreur");
    } catch { setInvResult("❌ Erreur"); }
    finally { setInvLoading(false); }
  };

  // ─── Login Screen ────
  if (!agentToken) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F3F6FB" }}>
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">🤖</div>
            <h1 className="text-2xl font-black" style={{ color: TITLE_TEXT }}>Agent AI Dashboard</h1>
            <p className="text-sm mt-1" style={{ color: MUTED_TEXT }}>Connecte-toi pour accéder à tes agents IA</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input name="email" type="email" defaultValue={user?.email || ""} placeholder="Email" required
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            <input name="password" type="password" placeholder="Mot de passe" required
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
            <button type="submit" className="w-full py-3 rounded-xl text-white font-bold text-sm" style={{ backgroundColor: PREMIUM_BLUE }}>
              Se connecter
            </button>
          </form>
        </div>
      </main>
    );
  }

  // ─── Dashboard ────
  const tabs = [
    { id: "chat", label: "💬 Assistant IA" },
    { id: "marketing", label: "📣 Marketing" },
    { id: "leads", label: "🎯 Score Leads" },
    { id: "invoicing", label: "🧾 Facturation" },
  ];

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F3F6FB" }}>
      <div className="mx-auto max-w-5xl px-5 py-6 space-y-5">
        {/* Header */}
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">AI Dashboard</p>
            <h1 className="text-2xl font-black" style={{ color: TITLE_TEXT }}>
              {agentInfo ? `${agentInfo.first_name} ${agentInfo.last_name}` : "Agent"} — Agents IA
            </h1>
            <p className="text-sm" style={{ color: MUTED_TEXT }}>
              {agentInfo?.agent_type === "yacht_broker" ? "Yacht Broker + Influenceur" : "Agent de Voyage"} · Commission {agentInfo?.commission_rate || 5}%
            </p>
          </div>
          <Link href="/agent" className="rounded-full px-4 py-2 text-sm font-bold text-white" style={{ backgroundColor: PREMIUM_BLUE }}>
            ← Dashboard
          </Link>
        </header>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                tab === t.id ? "bg-indigo-600 text-white shadow" : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ─── Chat Tab ──── */}
        {tab === "chat" && (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col" style={{ height: "calc(100vh - 280px)", minHeight: 400 }}>
            <div className="bg-indigo-600 text-white px-6 py-3 flex items-center gap-3 shrink-0">
              <div className="h-9 w-9 rounded-full bg-indigo-500 flex items-center justify-center text-lg">🤖</div>
              <div className="flex-1">
                <div className="font-bold text-sm">Assistant IA — {agentInfo?.agent_type === "yacht_broker" ? "Yacht & Influenceur" : "Voyage"}</div>
                <div className="text-xs text-indigo-200">GPT-4o-mini · Personnalisé pour toi</div>
              </div>
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div ref={chatRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-3 bg-slate-50">
              {msgs.length === 0 && (
                <div className="text-center text-slate-400 mt-16 space-y-2">
                  <div className="text-4xl">💬</div>
                  <div className="text-sm font-medium">Demande-moi n&apos;importe quoi!</div>
                  <div className="text-xs">Marketing, itinéraires, relance clients, idées de contenu...</div>
                </div>
              )}
              {msgs.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === "user" ? "bg-indigo-600 text-white rounded-br-md" : "bg-white text-slate-800 border border-slate-200 rounded-bl-md shadow-sm"
                  }`}>{m.content}</div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                    <div className="flex gap-1.5">
                      <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay:"0ms"}}/>
                      <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay:"150ms"}}/>
                      <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay:"300ms"}}/>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="border-t border-slate-200 p-4 bg-white shrink-0">
              <div className="flex gap-3">
                <input ref={inputRef} value={chatInput} onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendChat()}
                  placeholder="Écris ton message..." disabled={chatLoading}
                  className="flex-1 px-4 py-3 bg-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" />
                <button onClick={sendChat} disabled={chatLoading || !chatInput.trim()}
                  className="h-11 w-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-40 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── Marketing Tab ──── */}
        {tab === "marketing" && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>📣 Générateur de Contenu Marketing</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Type de contenu</label>
                <select value={mktType} onChange={e => setMktType(e.target.value)}
                  className="mt-1 w-full px-4 py-3 border border-slate-200 rounded-xl text-sm">
                  <option value="social_post">Post réseaux sociaux</option>
                  <option value="email_campaign">Email marketing</option>
                  <option value="listing_description">Description de listing</option>
                  <option value="follow_up">Email de relance client</option>
                  <option value="influencer_caption">Caption influenceur (IG/TikTok)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Détails / Instructions</label>
                <input value={mktDetails} onChange={e => setMktDetails(e.target.value)}
                  placeholder="Ex: Catamaran de luxe aux Bahamas, 8 personnes, all-inclusive..."
                  className="mt-1 w-full px-4 py-3 border border-slate-200 rounded-xl text-sm" />
              </div>
            </div>
            <button onClick={genMarketing} disabled={mktLoading}
              className="px-6 py-3 rounded-xl text-white font-bold text-sm disabled:opacity-40" style={{ backgroundColor: PREMIUM_BLUE }}>
              {mktLoading ? "Génération..." : "🚀 Générer"}
            </button>
            {mktResult && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 whitespace-pre-wrap text-sm">{mktResult}</div>
            )}
          </div>
        )}

        {/* ─── Lead Scoring Tab ──── */}
        {tab === "leads" && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>🎯 Score de Leads Automatique</h2>
            <p className="text-sm" style={{ color: MUTED_TEXT }}>Colle les infos du lead et l&apos;IA va le scorer de 1 à 10 avec la prochaine action recommandée.</p>
            <textarea value={leadData} onChange={e => setLeadData(e.target.value)} rows={4}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-mono" />
            <button onClick={scoreLead} disabled={scoreLoading}
              className="px-6 py-3 rounded-xl text-white font-bold text-sm disabled:opacity-40" style={{ backgroundColor: PREMIUM_BLUE }}>
              {scoreLoading ? "Analyse..." : "🎯 Scorer ce lead"}
            </button>
            {scoreResult && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`h-14 w-14 rounded-full flex items-center justify-center text-xl font-black text-white ${
                    scoreResult.score >= 7 ? "bg-emerald-500" : scoreResult.score >= 4 ? "bg-amber-500" : "bg-red-500"
                  }`}>{scoreResult.score}/10</div>
                  <div>
                    <div className="font-bold text-sm" style={{ color: TITLE_TEXT }}>{scoreResult.reason}</div>
                    <div className="text-xs mt-1" style={{ color: MUTED_TEXT }}>Action: {scoreResult.next_action}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── Invoicing Tab ──── */}
        {tab === "invoicing" && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>🧾 Générateur de Factures</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Nom du client</label>
                <input value={invClient} onChange={e => setInvClient(e.target.value)} placeholder="Pierre Martin"
                  className="mt-1 w-full px-4 py-3 border border-slate-200 rounded-xl text-sm" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase">Notes</label>
                <input value={invNotes} onChange={e => setInvNotes(e.target.value)} placeholder="Voyage Bahamas, départ 15 mars..."
                  className="mt-1 w-full px-4 py-3 border border-slate-200 rounded-xl text-sm" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase">Items (JSON)</label>
              <textarea value={invItems} onChange={e => setInvItems(e.target.value)} rows={3}
                className="mt-1 w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-mono" />
            </div>
            <button onClick={genInvoice} disabled={invLoading || !invClient}
              className="px-6 py-3 rounded-xl text-white font-bold text-sm disabled:opacity-40" style={{ backgroundColor: PREMIUM_BLUE }}>
              {invLoading ? "Génération..." : "🧾 Générer la facture"}
            </button>
            {invResult && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 whitespace-pre-wrap text-sm">{invResult}</div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
