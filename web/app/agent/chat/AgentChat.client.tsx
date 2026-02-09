"use client";
import { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { sendMessageToLina } from "../../../src/lib/linaClient";
import { useAuthStore, isHQ } from "../../../src/lib/authStore";

export default function AgentChatClient() {
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
  const seenRequestsRef = useRef<Set<string>>(new Set());
  const totalUnread = useMemo(() => channels.reduce((sum, ch) => sum + (ch.unread || 0), 0), [channels]);
  const directThreads = useMemo(() => channels.filter((ch) => ch.scope === "Direct").length, [channels]);

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
    if (typeof window === "undefined") return;
    const helpTickets = JSON.parse(localStorage.getItem("helpTickets") || "[]");
    const newChannels = [...channels];
    const newMessages = { ...messages };

    helpTickets.forEach((ticket: any) => {
      const channelId = `help-${ticket.ticket}`;
      if (!newChannels.find((c) => c.id === channelId)) {
        newChannels.push({
          id: channelId,
          label: ticket.title,
          scope: "Help Center",
          unread: ticket.status === "open" ? 1 : 0,
        });
        newMessages[channelId] = ticket.messages.map((msg: any) => ({
          role: msg.role === "user" ? "agent" : "hq",
          author: msg.role === "user" ? "User" : "Bot",
          text: msg.text,
          ts: msg.ts,
        }));
      }
    });

    setChannels(newChannels);
    setMessages(newMessages);
  }, []);

  // Mark help ticket as read when selected
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (channelId.startsWith("help-")) {
      const ticketNumber = channelId.replace("help-", "");
      const helpTickets = JSON.parse(localStorage.getItem("helpTickets") || "[]");
      const updatedTickets = helpTickets.map((ticket: any) => {
        if (ticket.ticket === ticketNumber) {
          return { ...ticket, status: "read" };
        }
        return ticket;
      });
      localStorage.setItem("helpTickets", JSON.stringify(updatedTickets));

      // Update channels unread count
      setChannels((prev) => prev.map((ch) => (ch.id === channelId ? { ...ch, unread: 0 } : ch)));
    }
  }, [channelId]);

  // Load yacht request form submissions
  useEffect(() => {
    if (typeof window === "undefined") return;
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

  // Load partner requests from server (polling)
  useEffect(() => {
    let active = true;

    const mergeRequests = (stored: any[]) => {
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
          if (req?.id && seenRequestsRef.current.has(req.id)) return;
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
          if (req?.id && seenRequestsRef.current.has(req.id)) return;
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

        stored.forEach((req: any) => {
          if (req?.id) seenRequestsRef.current.add(req.id);
        });

        return next;
      });
    };

    const loadRequests = async () => {
      try {
        const resp = await fetch("/api/agent/requests");
        const text = await resp.text();
        const parsed = JSON.parse(text || "{}");
        if (!active) return;
        const stored = (parsed && parsed.data) || [];
        mergeRequests(stored);
      } catch {
        // ignore
      }
    };

    void loadRequests();
    const interval = setInterval(loadRequests, 5000);

    return () => {
      active = false;
      clearInterval(interval);
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

  const handleDeleteMessage = (index: number) => {
    setMessages((prev) => ({
      ...prev,
      [channelId]: (prev[channelId] || []).filter((_, i) => i !== index),
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
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      <div className="mx-auto flex h-[calc(100vh-3rem)] max-w-[1700px] flex-col gap-6">
        <div className="rounded-3xl border border-slate-200 bg-white/90 px-6 py-5 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Agent workspace</p>
              <h1 className="text-2xl font-black text-slate-900">Centre de communication</h1>
              <p className="text-sm text-slate-500">Coordonnez les dossiers, urgences, et escalades HQ en temps réel.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">HQ voit tout</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{channels.length} canaux</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{directThreads} directs</span>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">{totalUnread} non lus</span>
              <Link href="/agent" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm">Dashboard</Link>
              <Link href="/agent/finance" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm">Finance (HQ)</Link>
            </div>
          </div>
        </div>

        <div className="flex flex-1 gap-4 overflow-hidden">
          <aside className="w-72 xl:w-80 flex flex-col gap-3 overflow-y-auto">
            <div className="rounded-3xl border border-slate-200 bg-white p-4 space-y-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Workspace</p>
              <div className="text-sm font-semibold text-slate-900">Agent: {user?.name || "Agent"}</div>
              <div className="text-xs text-slate-500">Canal actif: {title}</div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">Live</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{history.length} messages</span>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-4 space-y-2 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Actions rapides</p>
              <div className="flex flex-col gap-2">
                {quickActions.map((qa) => (
                  <button
                    key={qa}
                    onClick={() => onQuick(qa)}
                    className="w-full text-left text-xs font-semibold text-slate-700 border border-slate-200 rounded-xl px-3 py-2 hover:bg-slate-50"
                  >
                    {qa}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-4 text-xs text-slate-600 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Usage</p>
              <ul className="mt-2 space-y-1">
                <li>• Global : annonces, SLAs</li>
                <li>• HQ ↔ agents</li>
                <li>• Dossier : collaboration client</li>
                <li>• @Lina : résumés et actions</li>
              </ul>
            </div>
          </aside>

          <div className="flex-1 min-w-0 rounded-3xl border border-slate-200 bg-white overflow-hidden flex shadow-sm">
            {/* Threads List */}
            <div className="w-72 border-r border-slate-200 bg-slate-50 flex flex-col h-full">
              <div className="p-4 border-b border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Canaux</p>
                    <h2 className="text-lg font-bold text-slate-900">All threads</h2>
                  </div>
                  <span className="rounded-full bg-slate-900 text-white text-xs font-semibold px-2 py-1">{filteredChannels.length}</span>
                </div>
                <div className="relative">
                  <input
                    value={channelSearch}
                    onChange={(e) => setChannelSearch(e.target.value)}
                    placeholder="Agent, dossier, HQ"
                    className="w-full pl-4 pr-4 py-2.5 border border-slate-200 rounded-xl focus:border-slate-400 focus:ring-2 focus:ring-slate-200 outline-none bg-white"
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
                      className={`w-full p-4 border-b border-slate-100 text-left transition ${active ? "bg-white" : "hover:bg-slate-50"}`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold">
                          {c.label.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-slate-900 truncate">{c.label}</span>
                            {c.unread ? (
                              <span className="px-2 py-0.5 bg-slate-900 text-white text-xs rounded-full">{c.unread}</span>
                            ) : null}
                          </div>
                          <p className="text-sm text-slate-500 truncate">{c.scope}</p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-700 truncate">{(messages[c.id] || []).slice(-1)[0]?.text || "No messages yet"}</p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 font-semibold">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5">Interne</span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5">Live</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col h-full min-w-0">
              <div className="p-4 border-b border-slate-200">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{title}</h3>
                    <p className="text-sm text-gray-600">Historique conservé. HQ voit tout.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearMyMessages}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 hover:border-slate-300"
                  >
                    Effacer mes messages
                  </button>
                </div>
              </div>

              <div ref={listRef} className="flex-1 overflow-y-auto p-6 space-y-4">
                {history.length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    Aucun message. Partagez un dossier, demandez du support, ou mentionnez @Lina.
                  </div>
                )}
                {history.map((m, idx) => {
                  const isOwn = m.author === (user?.name || "Agent") && m.role === (canHQ ? "hq" : "agent");
                  const bubbleStyle = isOwn
                    ? "bg-slate-900 text-white"
                    : m.role === "lina"
                      ? "bg-amber-50 text-amber-900"
                      : "bg-slate-100 text-slate-900";
                  return (
                    <div key={idx} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-md px-4 py-3 rounded-lg ${bubbleStyle}`}>
                        <p className="text-xs font-semibold opacity-70 mb-1">{m.author}</p>
                        <p className="text-sm whitespace-pre-line">{m.text}</p>
                        <div className="mt-1 flex items-center justify-between gap-3">
                          <p className={`text-xs ${isOwn ? "text-slate-200" : "text-slate-500"}`}>
                            {m.ts}
                          </p>
                          {isOwn && (
                            <button
                              type="button"
                              onClick={() => handleDeleteMessage(idx)}
                              className="text-[10px] font-semibold text-slate-200 hover:text-white"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 border-t border-slate-200">
                <form onSubmit={onSubmit} className="flex items-center gap-3">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="@Lina summarize, transfer a dossier, share a client, request HQ help"
                    className="flex-1 min-w-0 w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-slate-400 focus:ring-2 focus:ring-slate-200 outline-none"
                  />
                  <button
                    type="submit"
                    disabled={sending || !input.trim()}
                    className="px-4 py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-60"
                  >
                    {sending ? "Sending..." : "Send"}
                  </button>
                </form>
                {linaBusy && <p className="text-xs text-slate-500 mt-2">Lina is processing…</p>}
              </div>
            </div>

            {/* Agent tools */}
            <aside className="w-72 border-l border-slate-200 bg-slate-50 hidden xl:flex flex-col overflow-y-auto">
              <div className="p-4 border-b border-slate-200">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Outils agent</p>
                <h3 className="text-lg font-bold text-slate-900">Power actions</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Dossiers</p>
                  <ul className="space-y-1 text-xs text-slate-600">
                    <li>• Open dossier TRIP-104</li>
                    <li>• Open dossier YCHT-55</li>
                    <li>• Active proposals (3)</li>
                    <li>• Recent payments</li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Lina</p>
                  <ul className="space-y-1 text-xs text-slate-600">
                    <li>• Summarize this conversation</li>
                    <li>• Extract actions and owners</li>
                    <li>• Draft a client reply</li>
                    <li>• Identify risks (payment, docs)</li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Audit</p>
                  <p className="text-xs text-slate-600">Historique conservé. HQ voit tout. Partagé par dossier/agent.</p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
