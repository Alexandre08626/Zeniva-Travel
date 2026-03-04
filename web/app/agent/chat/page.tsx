"use client";
export const dynamic = "force-dynamic";
import { useEffect, useRef, useState } from "react";
import { useAuthStore, isHQ } from "@/src/lib/authStore";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  destination?: string;
  status: string;
  last_msg?: string;
  last_ts?: string;
  msg_count: number;
  last_channel?: string;
}

interface AgentContact {
  id: string;
  name: string;
  email: string;
  agent_type: string;
  status: string;
  phone?: string;
}

interface Message {
  id: string;
  role: string;
  content: string;
  channel: string;
  created_at: string;
}

const CHANNEL_ICON: Record<string, string> = {
  chat: "💬", email: "📧", sms: "📱", agent_chat: "👤", voice: "📞",
};

function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const colors = ["#0F6CF5","#7C3AED","#10B981","#F59E0B","#EF4444","#EC4899","#06B6D4"];
  const i = (name.charCodeAt(0) + (name.charCodeAt(1) || 0)) % colors.length;
  const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: colors[i], display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.38, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
      {initials}
    </div>
  );
}

export default function ChatHubPage() {
  const user = useAuthStore((s) => s.user);
  const hq = isHQ(user);
  const [contactTab, setContactTab] = useState<"travelers" | "agents">("travelers");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [agents, setAgents] = useState<AgentContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<AgentContact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [pollInterval, setPollInterval] = useState<ReturnType<typeof setInterval> | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ path: "admin/chat/conversations" });
      if (!hq && user?.email) p.append("agent_email", user.email);
      const r = await fetch(`/api/agents-proxy?${p}`);
      const d = await r.json();
      setLeads(d?.conversations || []);
    } catch {}
    // Also fetch agents list for HQ
    if (hq) {
      try {
        const r = await fetch("/api/agents-proxy?path=admin/agents-list");
        const d = await r.json();
        setAgents(d?.agents || []);
      } catch {}
    }
    setLoading(false);
  };

  const loadMessages = async (leadId: string) => {
    setMsgLoading(true);
    try {
      const r = await fetch(`/api/agents-proxy?path=admin/chat/messages/${leadId}`);
      const d = await r.json();
      setMessages(d?.messages || []);
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch {}
    setMsgLoading(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || !selected) return;
    setSending(true);
    const text = input.trim();
    setInput("");
    // Optimistic update
    const tempMsg: Message = { id: "temp", role: "agent", content: text, channel: "agent_chat", created_at: new Date().toISOString() };
    setMessages(m => [...m, tempMsg]);
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    try {
      await fetch("/api/agents-proxy?path=admin/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_id: selected.id, message: text, agent_email: user?.email || "" }),
      });
      await loadMessages(selected.id);
    } catch {}
    setSending(false);
  };

  useEffect(() => { if (user?.email) void fetchLeads(); }, [user?.email]);

  useEffect(() => {
    if (selected) {
      void loadMessages(selected.id);
      // Poll for new messages every 15s
      const iv = setInterval(() => void loadMessages(selected.id), 15000);
      setPollInterval(iv);
      return () => clearInterval(iv);
    }
  }, [selected?.id]);

  const filtered = search
    ? leads.filter(l => l.name.toLowerCase().includes(search.toLowerCase()) || l.email.toLowerCase().includes(search.toLowerCase()) || (l.destination || "").toLowerCase().includes(search.toLowerCase()))
    : leads;

  const withConvos = filtered.filter(l => (l.msg_count || 0) > 0);
  const noConvos = filtered.filter(l => (l.msg_count || 0) === 0);

  return (
    <main className="min-h-screen bg-[#F3F6FB]">
      <div className="mx-auto max-w-7xl px-5 py-8">

        {/* Header */}
        <header className="mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Messaging</p>
          <h1 className="text-3xl font-black text-slate-900">Client Chat Hub</h1>
          <p className="text-sm text-slate-500 mt-0.5">All conversations with your clients — Lina's chats + your direct messages</p>
        </header>

        <div className="flex gap-4 h-[calc(100vh-200px)] min-h-[500px]">

          {/* ── Left: Contact List ── */}
          <div className="w-80 flex-shrink-0 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            {/* Tabs */}
            <div className="p-3 border-b border-slate-100 flex gap-1">
              <button onClick={() => { setContactTab("travelers"); setSelectedAgent(null); }} className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-colors ${contactTab === "travelers" ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-800"}`}>
                👥 Travelers ({leads.filter(l => l.msg_count > 0).length})
              </button>
              {hq && (
                <button onClick={() => { setContactTab("agents"); setSelected(null); }} className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-colors ${contactTab === "agents" ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-800"}`}>
                  🎯 Agents ({agents.length})
                </button>
              )}
            </div>
            <div className="px-3 py-2 border-b border-slate-100">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={contactTab === "travelers" ? "Search clients..." : "Search agents..."}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex gap-3 items-center animate-pulse">
                      <div className="w-10 h-10 rounded-full bg-slate-200" />
                      <div className="flex-1 space-y-1">
                        <div className="h-3 bg-slate-200 rounded w-3/4" />
                        <div className="h-2 bg-slate-100 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : contactTab === "travelers" ? (
                <>
                  {withConvos.length > 0 && (
                    <>
                      <p className="px-4 pt-3 pb-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Active Conversations ({withConvos.length})</p>
                      {withConvos.map(lead => (
                        <button
                          key={lead.id}
                          onClick={() => setSelected(lead)}
                          className={`w-full text-left px-4 py-3 flex gap-3 items-start hover:bg-blue-50 transition-colors border-b border-slate-50 ${selected?.id === lead.id ? "bg-blue-50 border-l-2 border-l-blue-500" : ""}`}
                        >
                          <Avatar name={lead.name} size={40} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <p className="font-semibold text-slate-900 text-sm truncate">{lead.name}</p>
                              <span className="text-xs text-slate-400 shrink-0">{CHANNEL_ICON[lead.last_channel || "chat"]}</span>
                            </div>
                            <p className="text-xs text-slate-500 truncate">{lead.last_msg || "No messages"}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              {lead.destination && <span className="text-xs text-blue-600">✈️ {lead.destination}</span>}
                              <span className="text-xs text-slate-400 ml-auto">{lead.msg_count} msg{lead.msg_count !== 1 ? "s" : ""}</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </>
                  )}
                  {noConvos.length > 0 && (
                    <>
                      <p className="px-4 pt-3 pb-1 text-xs font-bold text-slate-400 uppercase tracking-wider">No Messages Yet ({noConvos.length})</p>
                      {noConvos.map(lead => (
                        <button
                          key={lead.id}
                          onClick={() => setSelected(lead)}
                          className={`w-full text-left px-4 py-3 flex gap-3 items-start hover:bg-slate-50 transition-colors border-b border-slate-50 ${selected?.id === lead.id ? "bg-blue-50" : ""}`}
                        >
                          <Avatar name={lead.name} size={36} />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-700 text-sm truncate">{lead.name}</p>
                            <p className="text-xs text-slate-400 truncate">{lead.email}</p>
                          </div>
                        </button>
                      ))}
                    </>
                  )}
                  {filtered.length === 0 && (
                    <div className="p-6 text-center text-slate-400 text-sm">No clients found</div>
                  )}
                </>
              ) : contactTab === "agents" ? (
                <>
                  {agents.filter(a => !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase())).length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-sm">No agents found</div>
                  ) : (
                    <>
                      {agents.filter(a => !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase())).map(agent => (
                        <button
                          key={agent.id}
                          onClick={() => { setSelectedAgent(agent); setSelected(null); setMessages([]); }}
                          className={`w-full text-left px-4 py-3 flex gap-3 items-start hover:bg-indigo-50 transition-colors border-b border-slate-50 ${selectedAgent?.id === agent.id ? "bg-indigo-50 border-l-2 border-l-indigo-500" : ""}`}
                        >
                          <Avatar name={agent.name} size={40} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <p className="font-semibold text-slate-900 text-sm truncate">{agent.name}</p>
                              <span className={`text-xs px-1.5 py-0.5 rounded font-semibold shrink-0 ${agent.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{agent.status}</span>
                            </div>
                            <p className="text-xs text-slate-500 truncate">{agent.email}</p>
                            <p className="text-xs text-indigo-600 mt-0.5">{agent.agent_type === "travel_agent" ? "✈️ Travel Agent" : "⛵ Yacht Broker"}</p>
                          </div>
                        </button>
                      ))}
                    </>
                  )}
                </>
              ) : null}
            </div>
          </div>

          {/* ── Right: Conversation Thread ── */}
          <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            {selectedAgent ? (
              /* Agent direct message */
              <>
                <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                  <Avatar name={selectedAgent.name} size={42} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900">{selectedAgent.name}</p>
                      <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">{selectedAgent.agent_type === "travel_agent" ? "✈️ Travel Agent" : "⛵ Yacht Broker"}</span>
                    </div>
                    <p className="text-xs text-slate-500">{selectedAgent.email}</p>
                  </div>
                  <a href={`mailto:${selectedAgent.email}`} className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full font-semibold hover:bg-blue-200">📧 Email</a>
                  {selectedAgent.phone && <a href={`tel:${selectedAgent.phone}`} className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full font-semibold hover:bg-green-200">📞 Call</a>}
                </div>
                <div className="flex-1 flex items-center justify-center flex-col text-slate-400 p-8">
                  <p className="text-4xl mb-3">🎯</p>
                  <p className="font-semibold text-slate-600 text-center">Direct messaging with agents</p>
                  <p className="text-sm text-slate-400 mt-1 text-center max-w-sm">Use the message box below to send a note to {selectedAgent.name}. This is logged internally. For urgent communication use 📧 Email above.</p>
                  <div ref={endRef} />
                </div>
                <div className="p-4 border-t border-slate-100">
                  <div className="flex gap-3 items-end">
                    <textarea
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          // For agents, just open email
                          window.open(`mailto:${selectedAgent.email}?subject=Zeniva+Team+Message&body=${encodeURIComponent(input)}`, "_blank");
                          setInput("");
                        }
                      }}
                      placeholder={`Message ${selectedAgent.name}… (Enter → opens email)`}
                      rows={2}
                      className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                    <a
                      href={`mailto:${selectedAgent.email}?subject=Zeniva+Team+Message&body=${encodeURIComponent(input)}`}
                      target="_blank"
                      className="bg-indigo-600 text-white rounded-xl px-5 py-2.5 text-sm font-bold hover:bg-indigo-700 transition-colors whitespace-nowrap"
                    >
                      📧 Send
                    </a>
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">Opens your email client pre-filled with your message.</p>
                </div>
              </>
            ) : !selected ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <p className="text-5xl mb-3">💬</p>
                <p className="font-semibold text-slate-600">Select a client to view their conversation</p>
                <p className="text-sm mt-1">{leads.length} clients total · {withConvos.length} with conversations</p>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                  <Avatar name={selected.name} size={42} />
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">{selected.name}</p>
                    <p className="text-xs text-slate-500">{selected.email} {selected.phone ? `· ${selected.phone}` : ""} {selected.destination ? `· ✈️ ${selected.destination}` : ""}</p>
                  </div>
                  <div className="flex gap-2">
                    {selected.phone && (
                      <a href={`sms:${selected.phone}`} className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full font-semibold hover:bg-green-200">📱 SMS</a>
                    )}
                    <a href={`mailto:${selected.email}`} className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full font-semibold hover:bg-blue-200">📧 Email</a>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                  {msgLoading ? (
                    <div className="flex items-center justify-center h-full text-slate-400 text-sm">Loading messages…</div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                      <p className="text-3xl mb-2">✉️</p>
                      <p className="font-medium text-slate-600">No messages yet</p>
                      <p className="text-sm mt-1">Send a message below to start the conversation</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isAgent = msg.role === "agent";
                      const isLina = msg.role === "assistant";
                      const isUser = msg.role === "user";
                      return (
                        <div key={msg.id} className={`flex ${isAgent || isLina ? "justify-end" : "justify-start"} gap-2`}>
                          {isUser && <Avatar name={selected.name} size={28} />}
                          <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                            isAgent ? "bg-blue-600 text-white rounded-br-sm" :
                            isLina ? "bg-indigo-100 text-indigo-900 rounded-br-sm" :
                            "bg-slate-100 text-slate-800 rounded-bl-sm"
                          }`}>
                            {(isAgent || isLina) && (
                              <p className={`text-xs font-semibold mb-1 ${isAgent ? "text-blue-200" : "text-indigo-500"}`}>
                                {isAgent ? "You (Agent)" : "🤖 Lina AI"}
                              </p>
                            )}
                            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                            <p className={`text-xs mt-1 ${isAgent ? "text-blue-200" : isLina ? "text-indigo-400" : "text-slate-400"}`}>
                              {CHANNEL_ICON[msg.channel] || "💬"} {new Date(msg.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                          {isAgent && <Avatar name={user?.email || "Agent"} size={28} />}
                        </div>
                      );
                    })
                  )}
                  <div ref={endRef} />
                </div>

                {/* Message input */}
                <div className="p-4 border-t border-slate-100">
                  <div className="flex gap-3 items-end">
                    <textarea
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void sendMessage(); } }}
                      placeholder={`Message ${selected.name}… (Enter to send)`}
                      rows={2}
                      className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button
                      onClick={() => void sendMessage()}
                      disabled={sending || !input.trim()}
                      className="bg-blue-600 text-white rounded-xl px-5 py-2.5 text-sm font-bold hover:bg-blue-700 disabled:opacity-40 transition-colors"
                    >
                      {sending ? "…" : "Send ↗"}
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">Your message is logged in the conversation. The client won&apos;t receive a push notification — contact them via 📧 Email or 📱 SMS for urgent messages.</p>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
