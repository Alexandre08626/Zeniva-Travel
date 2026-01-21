"use client";
export const dynamic = "force-dynamic";
import { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { sendMessageToLina } from "../../../src/lib/linaClient";
import { useAuthStore, isHQ } from "../../../src/lib/authStore";

export default function AgentChatPage() {
  const searchParams = useSearchParams();
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
    { id: "agent-alexandre", label: "Alexandre Blais", scope: "Direct", unread: 0 },
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

  useEffect(() => {
    const targetChannel = searchParams?.get("channel");
    const label = searchParams?.get("label") || targetChannel || "Direct";
    if (!targetChannel) return;

    setChannels((prev) => {
      if (prev.find((c) => c.id === targetChannel)) return prev;
      return [...prev, { id: targetChannel, label, scope: "Direct", unread: 0 }];
    });
    setChannelId(targetChannel);
  }, [searchParams]);

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
      ensureChannel("agent-alexandre", "Alexandre Blais", "Direct");
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
      ensureMessages("agent-alexandre");
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
      .then(async (r) => {
        const text = await r.text();
        try {
          return JSON.parse(text || "{}") as any;
        } catch {
          return { data: [] } as any;
        }
      })
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
          ensureChannel("agent-alexandre", "Alexandre Blais", "Direct");
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
          ensureMessages("agent-alexandre");
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

  const handleClearMyMessages = () => {
    const author = user?.name || "Agent";
    const role = canHQ ? "hq" : "agent";
    setMessages((prev) => ({
      ...prev,
      [channelId]: (prev[channelId] || []).filter((m) => !(m.author === author && m.role === role)),
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
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto flex h-[calc(100vh-3rem)] max-w-[1500px] flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-500">Agent workspace</p>
            <h1 className="text-2xl font-black text-slate-900">Chat interne</h1>
            <p className="text-sm text-slate-500">Coordinate dossiers, handoffs, urgent cases, and HQ requests.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">HQ sees all</span>
            <Link href="/agent" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm">Dashboard</Link>
            <Link href="/agent/finance" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm">Finance (HQ)</Link>
          </div>
        </div>

        <div className="flex flex-1 gap-4 overflow-hidden">
          <aside className="w-80 xl:w-96 flex flex-col gap-3 overflow-y-auto">
            <div className="rounded-2xl border border-blue-100 bg-white p-4 space-y-3">
              <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold">Workspace</p>
              <div className="text-sm font-semibold text-slate-900">Agent: {user?.name || "Agent"}</div>
              <div className="text-xs text-blue-700">Active channel: {title}</div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">Live</span>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">{history.length} messages</span>
              </div>
            </div>

            <div className="rounded-xl border border-blue-100 bg-white p-3 space-y-2">
              <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold">Quick actions</p>
              {quickActions.map((qa) => (
                <button
                  key={qa}
                  onClick={() => onQuick(qa)}
                  className="w-full text-left text-xs font-semibold text-blue-700 border border-blue-200 rounded-lg px-2 py-2 hover:bg-blue-50"
                >
                  {qa}
                </button>
              ))}
            </div>

            <div className="rounded-xl border border-blue-100 bg-white p-3 text-xs text-blue-700">
              <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold">Usage</p>
              <ul className="mt-2 space-y-1">
                <li>• Global: announcements, SLAs</li>
                <li>• HQ ↔ agents</li>
                <li>• Dossier: client collaboration</li>
                <li>• @Lina for summaries / actions</li>
              </ul>
            </div>
          </aside>

          <div className="flex-1 min-w-0 rounded-2xl border border-blue-100 bg-white overflow-hidden flex">
            {/* Threads List */}
            <div className="w-80 border-r border-blue-100 bg-blue-50/60 flex flex-col h-full">
              <div className="p-4 border-b border-blue-100">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold">Channels</p>
                    <h2 className="text-lg font-bold text-slate-900">All threads</h2>
                  </div>
                  <span className="rounded-full bg-blue-600 text-white text-xs font-semibold px-2 py-1">{filteredChannels.length}</span>
                </div>
                <div className="relative">
                  <input
                    value={channelSearch}
                    onChange={(e) => setChannelSearch(e.target.value)}
                    placeholder="Agent, dossier, HQ"
                    className="w-full pl-4 pr-4 py-2.5 border border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {filteredChannels.map((c) => {
                  const active = c.id === channelId;
                  const hiddenHQ = c.id === "hq" && !canHQ;
                  if (hiddenHQ) return null;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setChannelId(c.id)}
                      className={`w-full p-4 border-b border-blue-100 text-left transition ${active ? "bg-white" : "hover:bg-blue-50"}`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                          {c.label.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-slate-900 truncate">{c.label}</span>
                            {c.unread ? (
                              <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">{c.unread}</span>
                            ) : null}
                          </div>
                          <p className="text-sm text-blue-800/80 truncate">{c.scope}</p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-700 truncate">{(messages[c.id] || []).slice(-1)[0]?.text || "No messages yet"}</p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-blue-600 font-semibold">
                        <span className="rounded-full bg-blue-100 px-2 py-0.5">Internal</span>
                        <span className="rounded-full bg-blue-50 px-2 py-0.5">Live</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col h-full min-w-0">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{title}</h3>
                    <p className="text-sm text-gray-600">History retained. HQ sees everything.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearMyMessages}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 hover:border-slate-300"
                  >
                    Clear my messages
                  </button>
                </div>
              </div>

              <div ref={listRef} className="flex-1 overflow-y-auto p-6 space-y-4">
                {history.length === 0 && (
                  <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
                    No messages yet. Share a dossier, request help, or mention @Lina.
                  </div>
                )}
                {history.map((m, idx) => {
                  const isOwn = m.author === (user?.name || "Agent") && m.role === (canHQ ? "hq" : "agent");
                  const bubbleStyle = isOwn
                    ? "bg-blue-600 text-white"
                    : m.role === "lina"
                      ? "bg-amber-50 text-amber-900"
                      : "bg-gray-100 text-gray-900";
                  return (
                    <div key={idx} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-md px-4 py-3 rounded-lg ${bubbleStyle}`}>
                        <p className="text-xs font-semibold opacity-70 mb-1">{m.author}</p>
                        <p className="text-sm whitespace-pre-line">{m.text}</p>
                        <p className={`text-xs mt-1 ${isOwn ? "text-blue-100" : "text-gray-500"}`}>
                          {m.ts}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 border-t border-gray-200">
                <form onSubmit={onSubmit} className="flex items-center gap-3">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="@Lina summarize, transfer a dossier, share a client, request HQ help"
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={sending || !input.trim()}
                    className="px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-60"
                  >
                    {sending ? "Sending..." : "Send"}
                  </button>
                </form>
                {linaBusy && <p className="text-xs text-slate-500 mt-2">Lina is processing…</p>}
              </div>
            </div>

            {/* Agent tools */}
            <aside className="w-80 border-l border-blue-100 bg-blue-50/60 hidden xl:flex flex-col overflow-y-auto">
              <div className="p-4 border-b border-blue-100">
                <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold">Agent tools</p>
                <h3 className="text-lg font-bold text-slate-900">Power actions</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="rounded-xl border border-blue-100 bg-white p-3 space-y-2">
                  <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold">Dossier / Files</p>
                  <ul className="space-y-1 text-xs text-blue-700">
                    <li>• Open dossier TRIP-104</li>
                    <li>• Open dossier YCHT-55</li>
                    <li>• Active proposals (3)</li>
                    <li>• Recent payments</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-blue-100 bg-white p-3 space-y-2">
                  <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold">Lina help</p>
                  <ul className="space-y-1 text-xs text-blue-700">
                    <li>• Summarize this conversation</li>
                    <li>• Extract actions and owners</li>
                    <li>• Draft a client reply</li>
                    <li>• Identify risks (payment, docs)</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-blue-100 bg-white p-3 space-y-2">
                  <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold">Audit</p>
                  <p className="text-xs text-blue-700">History retained. HQ sees all. Shared by dossier/agent.</p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
