"use client";
import { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { TITLE_TEXT, MUTED_TEXT, PREMIUM_BLUE, ACCENT_GOLD } from "../../../src/design/tokens";
import { sendMessageToLina } from "../../../src/lib/linaClient";
import { useAuthStore, isHQ } from "../../../src/lib/authStore";

export default function AgentChatPage() {
  const user = useAuthStore((s) => s.user);
  const [channelId, setChannelId] = useState("global");
  const [input, setInput] = useState("");
  const [channelSearch, setChannelSearch] = useState("");
  const [messages, setMessages] = useState<Record<string, { role: "agent" | "hq" | "lina"; author: string; text: string; ts: string }[]>>({
    global: [
      { role: "hq", author: "HQ", text: "Daily: push proposals before 4pm ET.", ts: "09:02" },
      { role: "agent", author: "Alice", text: "Need help with Maldives honeymoon, budget $12k.", ts: "09:05" },
    ],
    hq: [
      { role: "hq", author: "HQ", text: "Audit payments after wire cutoff.", ts: "08:55" },
    ],
    "dossier-yacht-55": [
      { role: "agent", author: "Marco", text: "Client approved 7-day Med yacht, need crew confirmation.", ts: "08:40" },
    ],
  });
  const [sending, setSending] = useState(false);
  const [linaBusy, setLinaBusy] = useState(false);
  const [channels, setChannels] = useState([
    { id: "global", label: "Global", scope: "All agents", unread: 2 },
    { id: "hq", label: "HQ", scope: "HQ only", unread: 1 },
    { id: "ops", label: "Ops", scope: "Production", unread: 0 },
    { id: "agent-alice", label: "Alice", scope: "Direct", unread: 0 },
    { id: "agent-jason", label: "Jason Lanthier", scope: "Direct", unread: 0 },
    { id: "agent-marco", label: "Marco", scope: "Direct", unread: 0 },
    { id: "dossier-trip-104", label: "Dossier TRIP-104", scope: "Client file", unread: 0 },
    { id: "dossier-yacht-55", label: "Yacht YCHT-55", scope: "Client file", unread: 1 },
  ]);
  const listRef = useRef<HTMLDivElement | null>(null);

  const quickActions = [
    "Share dossier TRIP-104 to Sara",
    "Ask HQ for payment override",
    "Request proposal support",
    "@Lina summarize this thread",
    "Link booking ORD-1032",
  ];

  const filteredChannels = useMemo(() => {
    const search = channelSearch.trim().toLowerCase();
    if (!search) return channels;
    return channels.filter((c) => c.label.toLowerCase().includes(search) || c.scope.toLowerCase().includes(search));
  }, [channels, channelSearch]);

  const history = messages[channelId] || [];
  const canHQ = isHQ(user);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [history, channelId]);

  // Load help tickets
  useEffect(() => {
    const helpTickets = JSON.parse(localStorage.getItem('helpTickets') || '[]');
    const newChannels = [...channels];
    const newMessages = { ...messages };

    helpTickets.forEach((ticket: any) => {
      const channelId = `help-${ticket.ticket}`;
      if (!newChannels.find(c => c.id === channelId)) {
        newChannels.push({
          id: channelId,
          label: ticket.title,
          scope: "Help Center",
          unread: ticket.status === 'open' ? 1 : 0
        });
        newMessages[channelId] = ticket.messages.map((msg: any) => ({
          role: msg.role === 'user' ? 'agent' : 'hq',
          author: msg.role === 'user' ? 'User' : 'Bot',
          text: msg.text,
          ts: msg.ts
        }));
      }
    });

    setChannels(newChannels);
    setMessages(newMessages);
  }, []);

  // Mark help ticket as read when selected
  useEffect(() => {
    if (channelId.startsWith('help-')) {
      const ticketNumber = channelId.replace('help-', '');
      const helpTickets = JSON.parse(localStorage.getItem('helpTickets') || '[]');
      const updatedTickets = helpTickets.map((ticket: any) => {
        if (ticket.ticket === ticketNumber) {
          return { ...ticket, status: 'read' };
        }
        return ticket;
      });
      localStorage.setItem('helpTickets', JSON.stringify(updatedTickets));

      // Update channels unread count
      setChannels(prev => prev.map(ch => 
        ch.id === channelId ? { ...ch, unread: 0 } : ch
      ));
    }
  }, [channelId]);

  // Load yacht request form submissions
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("yachtRequests") || "[]");
    if (!stored.length) return;

    setChannels((prev) => {
      const next = [...prev];
      const ensureChannel = (id: string, label: string, scope: string) => {
        if (!next.find((c) => c.id === id)) {
          next.push({ id, label, scope, unread: 0 });
        }
      };

      ensureChannel("agent-jason", "Jason Lanthier", "Direct");
      ensureChannel("hq", "HQ", "HQ only");

      stored.forEach((req: any) => {
        const targets: string[] = Array.isArray(req.channelIds) ? req.channelIds : ["hq"];
        targets.forEach((id) => {
          const idx = next.findIndex((c) => c.id === id);
          if (idx >= 0) {
            const current = next[idx];
            next[idx] = { ...current, unread: (current.unread || 0) + 1 };
          }
        });
      });

      return next;
    });

    setMessages((prev) => {
      const next = { ...prev };
      const ensureMessages = (id: string) => {
        if (!next[id]) next[id] = [];
      };

      ensureMessages("agent-jason");
      ensureMessages("hq");

      stored.forEach((req: any) => {
        const ts = new Date(req.createdAt || Date.now()).toLocaleTimeString().slice(0, 5);
        const message = { role: "hq" as const, author: "Client Request", text: req.message || "New yacht request", ts };
        const targets: string[] = Array.isArray(req.channelIds) ? req.channelIds : ["hq"];
        targets.forEach((id) => {
          next[id] = [...(next[id] || []), message];
        });
      });

      return next;
    });
  }, []);

  // Load partner requests from server
  useEffect(() => {
    let active = true;
    fetch("/api/agent/requests")
      .then((r) => r.json())
      .then((res) => {
        if (!active) return;
        const stored = (res && res.data) || [];
        if (!stored.length) return;

        setChannels((prev) => {
          const next = [...prev];
          const ensureChannel = (id: string, label: string, scope: string) => {
            if (!next.find((c) => c.id === id)) {
              next.push({ id, label, scope, unread: 0 });
            }
          };

          ensureChannel("agent-jason", "Jason Lanthier", "Direct");
          ensureChannel("hq", "HQ", "HQ only");

          stored.forEach((req: any) => {
            const targets: string[] = Array.isArray(req.channelIds) ? req.channelIds : ["hq"];
            targets.forEach((id) => {
              const idx = next.findIndex((c) => c.id === id);
              if (idx >= 0) {
                const current = next[idx];
                next[idx] = { ...current, unread: (current.unread || 0) + 1 };
              }
            });
          });

          return next;
        });

        setMessages((prev) => {
          const next = { ...prev };
          const ensureMessages = (id: string) => {
            if (!next[id]) next[id] = [];
          };

          ensureMessages("agent-jason");
          ensureMessages("hq");

          stored.forEach((req: any) => {
            const ts = new Date(req.createdAt || Date.now()).toLocaleTimeString().slice(0, 5);
            const message = { role: "hq" as const, author: "Client Request", text: req.message || "New yacht request", ts };
            const targets: string[] = Array.isArray(req.channelIds) ? req.channelIds : ["hq"];
            targets.forEach((id) => {
              const exists = (next[id] || []).some((m) => m.text === message.text && m.ts === message.ts);
              if (!exists) {
                next[id] = [...(next[id] || []), message];
              }
            });
          });

          return next;
        });
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  const title = useMemo(() => channels.find((c) => c.id === channelId)?.label || "Chat", [channelId]);

  const addMessage = (msg: { role: "agent" | "hq" | "lina"; author: string; text: string }) => {
    setMessages((prev) => ({
      ...prev,
      [channelId]: [...(prev[channelId] || []), { ...msg, ts: new Date().toLocaleTimeString().slice(0, 5) }],
    }));
  };

  const handleSend = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setInput("");
    addMessage({ role: canHQ ? "hq" : "agent", author: user?.name || "Agent", text: trimmed });
    // Simple Lina assist when @Lina is mentioned
    if (trimmed.toLowerCase().includes("@lina")) {
      setLinaBusy(true);
      try {
        const { reply } = await sendMessageToLina(trimmed);
        addMessage({ role: "lina", author: "Lina", text: reply || "Lina processed the request." });
      } catch (_) {
        addMessage({ role: "lina", author: "Lina", text: "Lina is unavailable. Try later." });
      } finally {
        setLinaBusy(false);
      }
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    Promise.resolve(handleSend(input)).finally(() => setSending(false));
  };

  const onQuick = (value: string) => {
    setInput(value);
    handleSend(value);
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-5 py-8 space-y-6">
        <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Agent workspace</p>
            <h1 className="text-2xl font-black" style={{ color: TITLE_TEXT }}>Chat interne</h1>
            <p className="text-sm" style={{ color: MUTED_TEXT }}>Coordinate dossiers, handoffs, urgent cases, and HQ requests.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">HQ sees all</span>
            <Link href="/agent" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm">Dashboard</Link>
            <Link href="/agent/finance" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm">Finance (HQ)</Link>
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-[280px,1fr,300px]">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Channels</p>
                <p className="text-sm font-bold text-slate-900">All threads</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">{filteredChannels.length}</span>
            </div>
            <label className="text-xs font-semibold text-slate-600">
              Search
              <input
                value={channelSearch}
                onChange={(e) => setChannelSearch(e.target.value)}
                placeholder="Agent, dossier, HQ"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
              />
            </label>
            <div className="space-y-2">
              {filteredChannels.map((c) => {
                const active = c.id === channelId;
                const hiddenHQ = c.id === "hq" && !canHQ;
                if (hiddenHQ) return null;
                return (
                  <button
                    key={c.id}
                    onClick={() => setChannelId(c.id)}
                    className={`w-full rounded-xl border px-3 py-2 text-left transition ${active ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                      <span>{c.label}</span>
                      {c.unread ? <span className="rounded-full bg-blue-600 px-2 py-[2px] text-[10px] text-white">{c.unread}</span> : null}
                    </div>
                    <p className="text-[11px] text-slate-500">{c.scope}</p>
                  </button>
                );
              })}
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
              <p className="font-semibold uppercase tracking-[0.12em] text-slate-500">Usage</p>
              <ul className="mt-2 space-y-1">
                <li>• Global: announcements, SLAs</li>
                <li>• HQ ↔ agents</li>
                <li>• Dossier: client collaboration</li>
                <li>• @Lina for summaries / actions</li>
              </ul>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col" style={{ minHeight: "72vh" }}>
            <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Channel</p>
                <h2 className="text-xl font-black" style={{ color: TITLE_TEXT }}>{title}</h2>
                <p className="text-xs" style={{ color: MUTED_TEXT }}>
                  History retained. HQ sees everything. Dossiers and actions are tracked.
                </p>
              </div>
              <div className="flex gap-2">
                <span className="rounded-full bg-blue-100 px-3 py-1 text-[11px] font-semibold text-blue-700">Live</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">{history.length} messages</span>
              </div>
            </div>

            <div ref={listRef} className="flex-1 overflow-y-auto space-y-3 py-4 pr-1">
              {history.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm" style={{ color: MUTED_TEXT }}>
                  No messages yet. Share a dossier, request help, or mention @Lina.
                </div>
              )}
              {history.map((m, idx) => {
                const isOwn = m.author === (user?.name || "Agent") && m.role === (canHQ ? "hq" : "agent");
                const bubbleStyle = isOwn
                  ? "bg-blue-600 text-white border-blue-600"
                  : m.role === "lina"
                    ? "bg-amber-50 text-amber-900 border-amber-200"
                    : "bg-slate-50 text-slate-900 border-slate-200";
                return (
                  <div key={idx} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl border px-4 py-3 shadow-sm ${bubbleStyle}`}>
                      <div className="flex items-center justify-between gap-4 text-[11px] font-semibold opacity-70">
                        <span>{m.author}</span>
                        <span>{m.ts}</span>
                      </div>
                      <div className="mt-1 whitespace-pre-line text-sm font-semibold">{m.text}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-slate-200 pt-4 space-y-3">
              <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
                {quickActions.map((qa) => (
                  <button
                    key={qa}
                    onClick={() => onQuick(qa)}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-700 hover:border-slate-300"
                  >
                    {qa}
                  </button>
                ))}
              </div>
              <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="@Lina summarize, transfer a dossier, share a client, request HQ help"
                  className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 outline-none focus:border-slate-400"
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="rounded-2xl px-5 py-3 text-sm font-extrabold text-white"
                  style={{ backgroundColor: PREMIUM_BLUE, opacity: sending ? 0.8 : 1 }}
                >
                  {sending ? "Sending…" : "Send"}
                </button>
              </form>
              {linaBusy && <p className="text-xs text-slate-500">Lina is processing…</p>}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Dossier / Files</p>
              <p className="text-sm" style={{ color: MUTED_TEXT }}>
                Link a dossier or proposal. Files and links appear here (audited, HQ-visible).
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 space-y-2">
              <p className="font-semibold">Quick links</p>
              <ul className="space-y-1 text-xs">
                <li>• Open dossier TRIP-104</li>
                <li>• Open dossier YCHT-55</li>
                <li>• Active proposals (3)</li>
                <li>• Recent payments</li>
              </ul>
            </div>
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-sm text-slate-700">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-500">Lina help</p>
              <ul className="mt-2 space-y-1 text-xs">
                <li>• Summarize this conversation</li>
                <li>• Extract actions and owners</li>
                <li>• Draft a client reply</li>
                <li>• Identify risks (payment, docs)</li>
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
              <p className="font-semibold uppercase tracking-[0.12em] text-slate-400">Audit</p>
              <p>History retained. HQ sees all. Shared by dossier/agent.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
