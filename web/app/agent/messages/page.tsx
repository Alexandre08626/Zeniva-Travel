"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useAuthStore } from "../../../src/lib/authStore";

const VPS = "https://vmi3097009.contaboserver.net";

type Thread = {
  thread_id: string;
  subject: string;
  other_party: string;
  other_name: string;
  last_message: string;
  last_at: string;
  unread: number;
  count: number;
};
type Msg = {
  id: string;
  sender_type: string;
  sender_id: string;
  sender_name: string;
  recipient_id: string;
  body: string;
  subject?: string;
  read: boolean;
  created_at: string;
};
type ClientChat = {
  lead_id: string;
  client_name: string;
  email: string;
  phone: string;
  last_message: string;
  last_at: string;
  message_count: number;
};

export default function MessagesPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.email === "info@zenivatravel.com" || user?.role === "admin";
  const hdr = { Authorization: "Bearer zeniva-secret-2025", "Content-Type": "application/json" };

  const [view, setView] = useState<"threads" | "compose" | "thread" | "clients">("threads");
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThread, setActiveThread] = useState<string>("");
  const [threadMsgs, setThreadMsgs] = useState<Msg[]>([]);
  const [clientChats, setClientChats] = useState<ClientChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [unread, setUnread] = useState(0);

  // Compose
  const [toId, setToId] = useState("");
  const [toType, setToType] = useState("admin");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const msgEndRef = useRef<HTMLDivElement>(null);

  // Agents list (for admin)
  const [agents, setAgents] = useState<{ email: string; name: string }[]>([]);

  const fetchThreads = useCallback(async () => {
    setLoading(true);
    try {
      const [tr, ur] = await Promise.all([
        fetch(`${VPS}/agents/messages/threads`, { headers: hdr }),
        fetch(`${VPS}/agents/messages/unread-count`, { headers: hdr }),
      ]);
      const td = await tr.json();
      const ud = await ur.json();
      setThreads(td.threads || []);
      setUnread(ud.unread || 0);
    } catch {}
    setLoading(false);
  }, []);

  const fetchAgents = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const r = await fetch(`${VPS}/agents/list`, { headers: hdr });
      const d = await r.json();
      setAgents((d.agents || []).map((a: any) => ({
        email: a.email,
        name: `${a.first_name || ""} ${a.last_name || ""}`.trim() || a.email,
      })));
    } catch {}
  }, [isAdmin]);

  useEffect(() => { fetchThreads(); fetchAgents(); }, [fetchThreads, fetchAgents]);

  const openThread = async (tid: string) => {
    setActiveThread(tid);
    setView("thread");
    try {
      const r = await fetch(`${VPS}/agents/messages/thread/${tid}`, { headers: hdr });
      const d = await r.json();
      setThreadMsgs(d.messages || []);
      // Update unread
      fetchThreads();
    } catch {}
  };

  const fetchClientChats = async () => {
    setView("clients");
    try {
      const r = await fetch(`${VPS}/agents/messages/client-chats`, { headers: hdr });
      const d = await r.json();
      setClientChats(d.client_chats || []);
    } catch {}
  };

  useEffect(() => {
    if (view === "thread" && msgEndRef.current) msgEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [threadMsgs, view]);

  const sendMsg = async (recipientId: string, recipientType: string, subj: string, msgBody: string, threadId?: string) => {
    setSending(true);
    try {
      await fetch(`${VPS}/agents/messages/send`, {
        method: "POST",
        headers: hdr,
        body: JSON.stringify({
          recipient_id: recipientId,
          recipient_type: recipientType,
          subject: subj || undefined,
          body: msgBody,
          thread_id: threadId || undefined,
        }),
      });
    } catch {}
    setSending(false);
  };

  const handleCompose = async () => {
    if (!body.trim() || !toId) return;
    await sendMsg(toId, toType, subject, body);
    setBody(""); setSubject(""); setToId("");
    setView("threads");
    fetchThreads();
  };

  const handleReply = async () => {
    if (!replyBody.trim()) return;
    // Find who to reply to
    const lastMsg = threadMsgs[threadMsgs.length - 1];
    const myId = isAdmin ? "admin" : user?.email || "";
    const replyTo = lastMsg?.sender_id === myId ? lastMsg?.recipient_id : lastMsg?.sender_id;
    const replyType = lastMsg?.sender_id === myId ? lastMsg?.sender_type === "admin" ? "admin" : "agent" : lastMsg?.sender_type;
    await sendMsg(replyTo || "admin", replyType || "admin", threadMsgs[0]?.subject || "", replyBody, activeThread);
    setReplyBody("");
    openThread(activeThread);
  };

  const myId = isAdmin ? "admin" : user?.email || "";
  const fmtDate = (d: string) => {
    if (!d) return "";
    const dt = new Date(d);
    return dt.toLocaleDateString("fr-CA", { month: "short", day: "numeric" }) + " " + dt.toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">💬 Messagerie</h1>
          <p className="text-sm text-gray-500">{unread > 0 ? `${unread} non lu${unread > 1 ? "s" : ""}` : "Aucun nouveau message"}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchClientChats} className="px-4 py-2 text-sm font-semibold rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700">
            👥 Conversations clients
          </button>
          <button onClick={() => { setView("compose"); setToId(isAdmin ? "" : "admin"); setToType(isAdmin ? "agent" : "admin"); }} className="px-4 py-2 text-sm font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700">
            ✏️ Nouveau message
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-xl">
        <button onClick={() => { setView("threads"); fetchThreads(); }} className={`flex-1 py-2 text-sm font-semibold rounded-lg ${view === "threads" ? "bg-white shadow text-gray-900" : "text-gray-500"}`}>
          📥 Inbox {unread > 0 && <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">{unread}</span>}
        </button>
        <button onClick={fetchClientChats} className={`flex-1 py-2 text-sm font-semibold rounded-lg ${view === "clients" ? "bg-white shadow text-gray-900" : "text-gray-500"}`}>
          👥 Clients Lina
        </button>
      </div>

      {/* Thread list */}
      {view === "threads" && (
        <div className="space-y-2">
          {loading ? <p className="text-gray-400 text-center py-8">Chargement...</p> :
           threads.length === 0 ? <p className="text-gray-400 text-center py-8">Aucun message</p> :
           threads.map(t => (
            <button key={t.thread_id} onClick={() => openThread(t.thread_id)}
              className={`w-full text-left p-4 rounded-xl border transition hover:shadow-md ${t.unread > 0 ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"}`}>
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {t.unread > 0 && <span className="w-2 h-2 bg-blue-600 rounded-full shrink-0" />}
                    <span className={`text-sm font-semibold ${t.unread > 0 ? "text-gray-900" : "text-gray-600"}`}>
                      {t.other_name || t.other_party || "—"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{t.subject || "Sans objet"}</div>
                  <div className="text-xs text-gray-400 mt-1 truncate">{t.last_message}</div>
                </div>
                <div className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{fmtDate(t.last_at)}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Thread view */}
      {view === "thread" && (
        <div>
          <button onClick={() => { setView("threads"); fetchThreads(); }} className="text-sm text-blue-600 hover:underline mb-3">← Retour</button>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h2 className="font-bold text-gray-900">{threadMsgs[0]?.subject || "Conversation"}</h2>
            </div>
            <div className="max-h-[500px] overflow-y-auto p-4 space-y-3">
              {threadMsgs.map(m => (
                <div key={m.id} className={`flex ${m.sender_id === myId ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${m.sender_id === myId ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"}`}>
                    <div className={`text-[10px] font-semibold mb-1 ${m.sender_id === myId ? "text-blue-200" : "text-gray-500"}`}>
                      {m.sender_name || m.sender_id} · {fmtDate(m.created_at)}
                    </div>
                    <div className="text-sm whitespace-pre-wrap">{m.body}</div>
                  </div>
                </div>
              ))}
              <div ref={msgEndRef} />
            </div>
            {/* Reply */}
            <div className="p-3 border-t border-gray-100 flex gap-2">
              <input value={replyBody} onChange={e => setReplyBody(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleReply()}
                placeholder="Répondre..." className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button onClick={handleReply} disabled={sending || !replyBody.trim()}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50">
                {sending ? "..." : "Envoyer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compose */}
      {view === "compose" && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <button onClick={() => setView("threads")} className="text-sm text-blue-600 hover:underline mb-3">← Retour</button>
          <h2 className="font-bold text-gray-900 mb-4">Nouveau message</h2>
          <div className="space-y-3">
            {isAdmin ? (
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Destinataire</label>
                <select value={toId} onChange={e => setToId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm">
                  <option value="">— Choisir un agent —</option>
                  {agents.map(a => <option key={a.email} value={a.email}>{a.name} ({a.email})</option>)}
                </select>
              </div>
            ) : (
              <div className="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-xl">
                📤 Message au <strong>Boss (Admin)</strong>
              </div>
            )}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Sujet</label>
              <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Objet du message"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Message</label>
              <textarea value={body} onChange={e => setBody(e.target.value)} rows={5} placeholder="Votre message..."
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm resize-none" />
            </div>
            <button onClick={handleCompose} disabled={sending || !body.trim() || !toId}
              className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50">
              {sending ? "Envoi..." : "📤 Envoyer"}
            </button>
          </div>
        </div>
      )}

      {/* Client Lina chats */}
      {view === "clients" && (
        <div className="space-y-2">
          {clientChats.length === 0 ? <p className="text-gray-400 text-center py-8">Aucune conversation client</p> :
           clientChats.map(c => (
            <div key={c.lead_id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-gray-900">{c.client_name}</div>
                  <div className="text-xs text-gray-500">{c.email} {c.phone && `· ${c.phone}`}</div>
                  <div className="text-xs text-gray-400 mt-1 truncate">{c.last_message}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] text-gray-400">{fmtDate(c.last_at)}</div>
                  <div className="text-xs text-gray-500 mt-1">{c.message_count} msg</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
