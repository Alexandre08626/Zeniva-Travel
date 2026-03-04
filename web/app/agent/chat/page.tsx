"use client";
export const dynamic = "force-dynamic";
import { useEffect, useRef, useState } from "react";
import { useAuthStore, isHQ } from "@/src/lib/authStore";

const AUTH = "Bearer zeniva-secret-2025";

interface Conversation {
  id: string;
  client_name: string;
  client_email: string;
  last_message: string;
  last_ts: string;
  count: number;
  channel: string;
}

interface Message {
  id: string;
  role: string;
  content: string;
  channel: string;
  created_at: string;
}

export default function ChatHubPage() {
  const user = useAuthStore((s) => s.user);
  const hq = isHQ(user);
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [search, setSearch] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const fetchConvos = async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ path: "admin/dashboard-stats" });
      if (!hq && user?.email) p.append("agent_email", user.email);
      const r = await fetch(`/api/agents-proxy?${p}`);
      const d = await r.json();
      const clients = d?.recent_clients || [];
      const list: Conversation[] = clients.map((c: any) => ({
        id: c.email,
        client_name: c.name || c.email,
        client_email: c.email,
        last_message: c.last_message || "No messages yet",
        last_ts: c.last_contact || c.created_at || new Date().toISOString(),
        count: c.conversation_count || 0,
        channel: c.last_channel || "chat",
      }));
      setConvos(list);
    } catch {}
    setLoading(false);
  };

  const loadMessages = async (email: string) => {
    setMsgLoading(true);
    setMessages([]);
    try {
      const r = await fetch(`/api/agents-proxy?path=admin/client-profile/${encodeURIComponent(email)}`);
      const d = await r.json();
      setMessages((d?.conversations || []).slice(-50).reverse());
    } catch {}
    setMsgLoading(false);
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  useEffect(() => { if (user?.email) void fetchConvos(); }, [user?.email]);
  useEffect(() => { if (selected) void loadMessages(selected); }, [selected]);

  const shown = search ? convos.filter(c => c.client_name.toLowerCase().includes(search.toLowerCase()) || c.client_email.toLowerCase().includes(search.toLowerCase())) : convos;
  const selConvo = convos.find(c => c.id === selected);

  return (
    <main className="min-h-screen bg-[#F3F6FB]">
      <div className="mx-auto max-w-7xl px-5 py-8">

        <header className="mb-5">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Communication</p>
          <h1 className="text-3xl font-black text-slate-900">Chat Hub</h1>
          <p className="text-sm text-slate-500 mt-0.5">All client conversations with Lina — read-only audit trail</p>
        </header>

        <div className="flex gap-4 h-[calc(100vh-200px)]">

          {/* Left — Conversation list */}
          <div className="w-72 shrink-0 flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="p-3 border-b border-slate-100">
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search clients…" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400" />
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-sm text-slate-400 text-center">Loading…</div>
              ) : shown.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-sm">No conversations yet</div>
              ) : shown.map((c) => (
                <button key={c.id} onClick={() => setSelected(c.id)} className={`w-full text-left p-3 border-b border-slate-100 hover:bg-blue-50 transition-colors ${selected === c.id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""}`}>
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0" style={{ background: "#0F6CF5" }}>
                      {c.client_name[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm truncate">{c.client_name}</p>
                      <p className="text-xs text-slate-400 truncate">{c.last_message}</p>
                    </div>
                    {c.count > 0 && <span className="text-xs bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded-full">{c.count}</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right — Message thread */}
          <div className="flex-1 flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {!selected ? (
              <div className="flex-1 flex items-center justify-center text-center p-8">
                <div>
                  <p className="text-5xl mb-4">💬</p>
                  <p className="text-slate-600 font-semibold">Select a conversation</p>
                  <p className="text-slate-400 text-sm mt-1">Click a client on the left to view their chat history with Lina</p>
                </div>
              </div>
            ) : (
              <>
                <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
                  <p className="font-black text-slate-900">{selConvo?.client_name}</p>
                  <p className="text-xs text-slate-400">{selConvo?.client_email} · {selConvo?.count} messages</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {msgLoading ? (
                    <div className="text-center text-slate-400 text-sm py-8">Loading messages…</div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-slate-400 text-sm py-8">No messages found</div>
                  ) : messages.map((m, i) => (
                    <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      {m.role !== "user" && (
                        <img src="/branding/lina-avatar.png" alt="Lina" className="w-7 h-7 rounded-full shrink-0" onError={e => { (e.currentTarget as HTMLImageElement).style.display="none"; }} />
                      )}
                      <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-2xl text-sm ${m.role === "user" ? "bg-blue-600 text-white rounded-br-sm" : "bg-slate-100 text-slate-800 rounded-bl-sm"}`}>
                        <p>{m.content}</p>
                        <p className={`text-[10px] mt-1 ${m.role === "user" ? "text-blue-200" : "text-slate-400"}`}>
                          {m.role === "user" ? "Client" : "Lina"} · {m.created_at ? new Date(m.created_at).toLocaleString("en-CA") : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={endRef} />
                </div>
                <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-400 text-center">
                  Read-only view · Lina manages all client conversations automatically
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
