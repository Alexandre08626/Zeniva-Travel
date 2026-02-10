"use client";
import { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { sendMessageToLina } from "../../../src/lib/linaClient";
import { normalizeAgentId } from "../../../src/lib/agent/agentWorkspace";
import { useAuthStore, isHQ } from "../../../src/lib/authStore";
import { getSupabaseClient } from "../../../src/lib/supabase/client";

type MessageRole = "agent" | "hq" | "lina";

type ChatMessage = {
  id: string;
  role: MessageRole;
  author: string;
  text: string;
  ts: string;
  createdAt?: string;
};

const createLocalId = () => `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export default function AgentChatClient() {
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const [channelId, setChannelId] = useState("global");
  const [input, setInput] = useState("");
  const [channelSearch, setChannelSearch] = useState("");
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [sending, setSending] = useState(false);
  const [linaBusy, setLinaBusy] = useState(false);
  const [contacts, setContacts] = useState<
    { id: string; name: string; email: string; role: string; roles?: string[]; status?: string; channelId: string; scopeLabel: string }[]
  >([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactsError, setContactsError] = useState<string | null>(null);
  const [channels, setChannels] = useState([
    { id: "global", label: "Global", scope: "All agents", unread: 0 },
    { id: "hq", label: "HQ", scope: "HQ only", unread: 0 },
    { id: "ops", label: "Ops", scope: "Production", unread: 0 },
  ]);
  const listRef = useRef<HTMLDivElement | null>(null);
  const activeChannelRef = useRef(channelId);
  const contactsByChannelIdRef = useRef<
    Map<string, { id: string; name: string; email: string; role: string; roles?: string[]; status?: string; channelId: string; scopeLabel: string }>
  >(new Map());
  const nonDeletableChannels = useMemo(() => new Set(["global", "hq", "ops"]), []);
  const totalUnread = useMemo(() => channels.reduce((sum, ch) => sum + (ch.unread || 0), 0), [channels]);
  const directThreads = useMemo(() => channels.filter((ch) => ch.scope === "Direct").length, [channels]);
  const contactsByChannelId = useMemo(() => {
    const map = new Map<string, { id: string; name: string; email: string; role: string; roles?: string[]; status?: string; channelId: string; scopeLabel: string }>();
    contacts.forEach((contact) => {
      map.set(contact.channelId, contact);
    });
    return map;
  }, [contacts]);

  useEffect(() => {
    contactsByChannelIdRef.current = contactsByChannelId;
  }, [contactsByChannelId]);

  const quickActions: string[] = [];

  const filteredChannels = useMemo(() => {
    const search = channelSearch.trim().toLowerCase();
    if (!search) return channels;
    return channels.filter((c) => c.label.toLowerCase().includes(search) || c.scope.toLowerCase().includes(search));
  }, [channels, channelSearch]);

  const visibleContacts = useMemo(() => {
    const ownEmail = (user?.email || "").toLowerCase();
    return contacts
      .filter((contact) => contact.email.toLowerCase() !== ownEmail)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [contacts, user?.email]);

  const history = messages[channelId] || [];
  const canHQ = isHQ(user);
  const resolveSenderRole = (raw: string | undefined): MessageRole =>
    raw === "agent" || raw === "hq" || raw === "lina" ? raw : "hq";

  useEffect(() => {
    let active = true;
    const resolveScopeLabel = (role: string, roles?: string[]) => {
      const allRoles = [role, ...(roles || [])].map((r) => (r || "").toLowerCase());
      if (allRoles.some((r) => r.includes("traveler"))) return "Traveler";
      if (allRoles.some((r) => r.includes("partner"))) return "Partner";
      if (allRoles.some((r) => r.includes("agent") || r.includes("hq") || r.includes("admin"))) return "Agent";
      return "Contact";
    };

    const resolveChannelId = (name: string, email: string, role: string, roles?: string[], id?: string) => {
      const allRoles = [role, ...(roles || [])].map((r) => (r || "").toLowerCase());
      if (allRoles.some((r) => r.includes("agent") || r.includes("hq") || r.includes("admin"))) {
        return normalizeAgentId(email || name);
      }
      const safeId = id || name || "unknown";
      return `contact-${String(safeId).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
    };

    const loadContacts = async () => {
      setContactsLoading(true);
      setContactsError(null);
      try {
        const resp = await fetch("/api/accounts");
        const payload = await resp.json();
        if (!resp.ok) throw new Error(payload?.error || "Failed to load contacts");
        if (!active) return;
        const rows = Array.isArray(payload?.data) ? payload.data : [];
        const mapped = rows.map((row: any) => {
          const name = String(row?.name || "Unknown");
          const email = String(row?.email || "");
          const role = String(row?.role || "");
          const roles = Array.isArray(row?.roles) ? row.roles : undefined;
          const scopeLabel = resolveScopeLabel(role, roles);
          const channelId = resolveChannelId(name, email, role, roles, row?.id);
          return {
            id: String(row?.id || channelId),
            name,
            email,
            role,
            roles,
            status: row?.status,
            channelId,
            scopeLabel,
          };
        });
        setContacts(mapped);
      } catch (err) {
        if (!active) return;
        setContactsError(err instanceof Error ? err.message : "Failed to load contacts");
      } finally {
        if (active) setContactsLoading(false);
      }
    };

    void loadContacts();
    const interval = setInterval(loadContacts, 10000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

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

  useEffect(() => {
    setChannels((prev) => prev.map((ch) => (ch.id === channelId ? { ...ch, unread: 0 } : ch)));
    activeChannelRef.current = channelId;
  }, [channelId]);

  const buildMessageFromRow = (row: any): ChatMessage => {
    const createdAt = row?.createdAt || row?.created_at || new Date().toISOString();
    const author = String(row?.author || row?.fullName || row?.full_name || row?.email || "Client");
    return {
      id: String(row?.id || createLocalId()),
      role: resolveSenderRole(row?.senderRole || row?.sender_role),
      author,
      text: String(row?.message || ""),
      ts: new Date(createdAt).toLocaleTimeString().slice(0, 5),
      createdAt,
    };
  };

  const ensureChannel = (id: string, row?: any) => {
    setChannels((prev) => {
      if (prev.find((c) => c.id === id)) return prev;
      const contact = contactsByChannelIdRef.current.get(id);
      const label = contact?.name || row?.fullName || row?.full_name || row?.email || row?.author || id;
      const scope = contact?.scopeLabel || (row?.email || row?.full_name ? "Traveler" : "Direct");
      return [...prev, { id, label, scope, unread: 0 }];
    });
  };

  const upsertMessage = (channelIds: string[], message: ChatMessage) => {
    setMessages((prev) => {
      const next: Record<string, ChatMessage[]> = { ...prev };
      channelIds.forEach((id) => {
        const current = next[id] || [];
        const exists = current.some((m) => m.id === message.id);
        const updated = exists
          ? current.map((m) => (m.id === message.id ? message : m))
          : [...current, message];
        updated.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
        next[id] = updated;
      });
      return next;
    });
  };

  const removeMessageById = (messageId: string) => {
    setMessages((prev) => {
      const next: Record<string, ChatMessage[]> = {};
      Object.entries(prev).forEach(([id, list]) => {
        next[id] = (list || []).filter((msg) => msg.id !== messageId);
      });
      return next;
    });
  };

  const refreshMessages = async () => {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from("agent_inbox_messages")
        .select("id, created_at, channel_ids, message, author, sender_role")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const rows = Array.isArray(data) ? data : [];
      const nextMessages: Record<string, ChatMessage[]> = {};
      rows.forEach((row: any) => {
        if (row?.deleted_at || row?.is_deleted) return;
        const message = buildMessageFromRow(row);
        const channelIds: string[] = Array.isArray(row?.channel_ids) ? row.channel_ids : ["hq"];
        channelIds.forEach((id) => {
          ensureChannel(id, row);
          nextMessages[id] = [...(nextMessages[id] || []), message];
        });
      });
      Object.values(nextMessages).forEach((list) =>
        list.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime())
      );
      setMessages(nextMessages);
    } catch {
      // ignore
    }
  };

  const deleteMessagesByIds = async (ids: string[]) => {
    if (!ids.length) return;
    try {
      const client = getSupabaseClient();
      const chunkSize = 100;
      for (let i = 0; i < ids.length; i += chunkSize) {
        const chunk = ids.slice(i, i + chunkSize);
        const { error } = await client.from("agent_inbox_messages").delete().in("id", chunk);
        if (error) throw error;
      }
    } catch {
      await refreshMessages();
    }
  };

  useEffect(() => {
    let active = true;
    const loadInitialMessages = async () => {
      if (!active) return;
      await refreshMessages();
    };

    void loadInitialMessages();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const client = getSupabaseClient();
    const channel = client
      .channel("agent-inbox-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "agent_inbox_messages" },
        (payload) => {
          const row = payload.new as any;
          const message = buildMessageFromRow(row);
          const channelIds: string[] = Array.isArray(row?.channel_ids) ? row.channel_ids : ["hq"];
          channelIds.forEach((id) => ensureChannel(id, row));
          upsertMessage(channelIds, message);
          const activeId = activeChannelRef.current;
          setChannels((prev) =>
            prev.map((ch) =>
              channelIds.includes(ch.id)
                ? { ...ch, unread: ch.id === activeId ? 0 : (ch.unread || 0) + 1 }
                : ch
            )
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "agent_inbox_messages" },
        (payload) => {
          const row = payload.new as any;
          if (row?.deleted_at || row?.is_deleted) {
            removeMessageById(String(row?.id));
            return;
          }
          const message = buildMessageFromRow(row);
          const channelIds: string[] = Array.isArray(row?.channel_ids) ? row.channel_ids : ["hq"];
          channelIds.forEach((id) => ensureChannel(id, row));
          upsertMessage(channelIds, message);
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "agent_inbox_messages" },
        (payload) => {
          const row = payload.old as any;
          if (row?.id) removeMessageById(String(row.id));
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.info("Supabase realtime status: SUBSCRIBED");
        }
      });

    return () => {
      client.removeChannel(channel);
    };
  }, []);


  const title = useMemo(() => channels.find((c) => c.id === channelId)?.label || "Chat", [channelId]);

  const addMessage = (msg: { id: string; role: "agent" | "hq" | "lina"; author: string; text: string; createdAt?: string }) => {
    const createdAt = msg.createdAt || new Date().toISOString();
    const message: ChatMessage = {
      id: msg.id,
      role: msg.role,
      author: msg.author,
      text: msg.text,
      ts: new Date(createdAt).toLocaleTimeString().slice(0, 5),
      createdAt,
    };
    upsertMessage([channelId], message);
  };

  const handleClearMyMessages = () => {
    const author = user?.name || "Agent";
    const role = canHQ ? "hq" : "agent";
    const toRemove = (messages[channelId] || []).filter((m) => m.author === author && m.role === role);
    setMessages((prev) => ({
      ...prev,
      [channelId]: (prev[channelId] || []).filter((m) => !(m.author === author && m.role === role)),
    }));
    void deleteMessagesByIds(toRemove.map((msg) => msg.id));
  };

  const handleDeleteConversation = async (targetChannelId: string) => {
    if (nonDeletableChannels.has(targetChannelId)) return;
    if (typeof window !== "undefined" && !window.confirm("Delete this conversation for everyone?")) return;

    try {
      await deleteMessagesByIds((messages[targetChannelId] || []).map((msg) => msg.id));
    } catch {
      await refreshMessages();
    }

    setChannels((prev) => prev.filter((ch) => ch.id !== targetChannelId));
    setMessages((prev) => {
      const next = { ...prev };
      delete next[targetChannelId];
      return next;
    });
    if (channelId === targetChannelId) {
      setChannelId("global");
    }
  };

  const handleEmptyTrash = async (targetChannelId: string) => {
    if (nonDeletableChannels.has(targetChannelId)) return;
    if (typeof window !== "undefined" && !window.confirm("Empty trash for everyone? This deletes all messages in this thread.")) return;

    try {
      await deleteMessagesByIds((messages[targetChannelId] || []).map((msg) => msg.id));
    } catch {
      await refreshMessages();
    }

    setMessages((prev) => ({
      ...prev,
      [targetChannelId]: [],
    }));
    setChannels((prev) => prev.map((ch) => (ch.id === targetChannelId ? { ...ch, unread: 0 } : ch)));
  };

  const handleDeleteMessage = async (msg: { id: string; role: "agent" | "hq" | "lina"; author: string; text: string; ts: string }) => {
    setMessages((prev) => ({
      ...prev,
      [channelId]: (prev[channelId] || []).filter((m) => m.id !== msg.id),
    }));
    try {
      await deleteMessagesByIds([msg.id]);
    } catch {
      await refreshMessages();
    }
  };

  const postMessage = async (payload: {
    id: string;
    createdAt: string;
    channelIds: string[];
    message: string;
    author: string;
    senderRole: "agent" | "hq" | "lina";
    source: string;
    sourcePath: string;
    propertyName: string;
  }) => {
    const resp = await fetch("/api/agent/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) {
      const data = await resp.json().catch(() => ({}));
      throw new Error(data?.error || "Failed to send message");
    }
  };

  const handleSend = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setInput("");
    const requestId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const createdAt = new Date().toISOString();
    const author = user?.name || "Agent";
    const senderRole = canHQ ? "hq" : "agent";

    addMessage({ id: requestId, role: senderRole, author, text: trimmed, createdAt });
    try {
      await postMessage({
        id: requestId,
        createdAt,
        channelIds: [channelId],
        message: trimmed,
        author,
        senderRole,
        source: "agent-chat",
        sourcePath: `/agent/chat?channel=${encodeURIComponent(channelId)}`,
        propertyName: title,
      });
    } catch {
      removeMessageById(requestId);
    }
    // Simple Lina assist when @Lina is mentioned
    if (trimmed.toLowerCase().includes("@lina")) {
      setLinaBusy(true);
      try {
        const { reply } = await sendMessageToLina(trimmed);
        const linaId =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        const linaText = reply || "Lina processed the request.";
        const linaCreatedAt = new Date().toISOString();
        addMessage({ id: linaId, role: "lina", author: "Lina", text: linaText, createdAt: linaCreatedAt });
        try {
          await postMessage({
            id: linaId,
            createdAt: linaCreatedAt,
            channelIds: [channelId],
            message: linaText,
            author: "Lina",
            senderRole: "lina",
            source: "agent-chat",
            sourcePath: `/agent/chat?channel=${encodeURIComponent(channelId)}`,
            propertyName: title,
          });
        } catch {
          removeMessageById(linaId);
        }
      } catch (_) {
        const failId =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        const failText = "Lina is unavailable. Try later.";
        const failCreatedAt = new Date().toISOString();
        addMessage({ id: failId, role: "lina", author: "Lina", text: failText, createdAt: failCreatedAt });
        try {
          await postMessage({
            id: failId,
            createdAt: failCreatedAt,
            channelIds: [channelId],
            message: failText,
            author: "Lina",
            senderRole: "lina",
            source: "agent-chat",
            sourcePath: `/agent/chat?channel=${encodeURIComponent(channelId)}`,
            propertyName: title,
          });
        } catch {
          removeMessageById(failId);
        }
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

  const handleOpenContact = (contact: { channelId: string; name: string; scopeLabel: string }) => {
    setChannels((prev) => {
      if (prev.some((ch) => ch.id === contact.channelId)) return prev;
      return [...prev, { id: contact.channelId, label: contact.name, scope: contact.scopeLabel, unread: 0 }];
    });
    setChannelId(contact.channelId);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      <div className="mx-auto flex h-[calc(100vh-3rem)] max-w-[1700px] flex-col gap-6">
        <div className="rounded-3xl border border-slate-200 bg-white/90 px-6 py-5 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Agent workspace</p>
              <h1 className="text-2xl font-black text-slate-900">Communication center</h1>
              <p className="text-sm text-slate-500">Coordinate case files, urgencies, and HQ escalations in real time.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">HQ sees everything</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{channels.length} channels</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{directThreads} directs</span>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">{totalUnread} unread</span>
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
              <div className="text-xs text-slate-500">Active channel: {title}</div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">Live</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{history.length} messages</span>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-4 space-y-2 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Quick actions</p>
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
                <li>• Global: announcements, SLAs</li>
                <li>• HQ ↔ agents</li>
                <li>• Case file: client collaboration</li>
                <li>• @Lina: summaries and actions</li>
              </ul>
            </div>
          </aside>

          <div className="flex-1 min-w-0 rounded-3xl border border-slate-200 bg-white overflow-hidden flex shadow-sm">
            {/* Threads List */}
            <div className="w-72 border-r border-slate-200 bg-slate-50 flex flex-col h-full">
              <div className="p-4 border-b border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Channels</p>
                    <h2 className="text-lg font-bold text-slate-900">All threads</h2>
                  </div>
                  <span className="rounded-full bg-slate-900 text-white text-xs font-semibold px-2 py-1">{filteredChannels.length}</span>
                </div>
                <div className="relative">
                  <input
                    value={channelSearch}
                    onChange={(e) => setChannelSearch(e.target.value)}
                    placeholder="Agent, case file, HQ"
                    className="w-full pl-4 pr-4 py-2.5 border border-slate-200 rounded-xl focus:border-slate-400 focus:ring-2 focus:ring-slate-200 outline-none bg-white"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="border-b border-slate-200 bg-white">
                  <div className="p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Contacts</p>
                    <p className="text-xs text-slate-500">Travelers, partners, and agents</p>
                  </div>
                  <div className="px-4 pb-4 space-y-2">
                    {contactsLoading && <div className="text-xs text-slate-500">Loading contacts…</div>}
                    {contactsError && <div className="text-xs text-rose-600">{contactsError}</div>}
                    {!contactsLoading && !contactsError && visibleContacts.length === 0 && (
                      <div className="text-xs text-slate-500">No contacts found.</div>
                    )}
                    {!contactsLoading && !contactsError && visibleContacts.slice(0, 8).map((contact) => (
                      <button
                        key={contact.channelId}
                        type="button"
                        onClick={() => handleOpenContact(contact)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate">{contact.name}</span>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">{contact.scopeLabel}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">{contact.email || contact.role}</div>
                      </button>
                    ))}
                  </div>
                </div>
                {filteredChannels.map((c) => {
                  const active = c.id === channelId;
                  const hiddenHQ = c.id === "hq" && !canHQ;
                  if (hiddenHQ) return null;
                  return (
                    <div
                      key={c.id}
                      className={`w-full p-4 border-b border-slate-100 text-left transition ${active ? "bg-white" : "hover:bg-slate-50"}`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold">
                          {c.label.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <button
                          type="button"
                          onClick={() => setChannelId(c.id)}
                          className="flex-1 min-w-0 text-left"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-slate-900 truncate">{c.label}</span>
                            {c.unread ? (
                              <span className="px-2 py-0.5 bg-slate-900 text-white text-xs rounded-full">{c.unread}</span>
                            ) : null}
                          </div>
                          <p className="text-sm text-slate-500 truncate">{c.scope}</p>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteConversation(c.id)}
                          disabled={nonDeletableChannels.has(c.id)}
                          className="inline-flex items-center justify-center rounded-full p-1.5 text-slate-500 hover:text-slate-700 disabled:opacity-50"
                          aria-label="Delete conversation"
                        >
                          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" focusable="false">
                            <path
                              fill="currentColor"
                              d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v9h-2V9zm4 0h2v9h-2V9zM7 9h2v9H7V9z"
                            />
                          </svg>
                        </button>
                      </div>
                      <p className="text-sm text-slate-700 truncate">{(messages[c.id] || []).slice(-1)[0]?.text || "No messages yet"}</p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 font-semibold">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5">Internal</span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5">Live</span>
                      </div>
                    </div>
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
                    <p className="text-sm text-gray-600">History is kept. HQ sees everything.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleClearMyMessages}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 hover:border-slate-300"
                    >
                      Clear my messages
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEmptyTrash(channelId)}
                      disabled={nonDeletableChannels.has(channelId)}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 hover:border-slate-300 disabled:opacity-50"
                    >
                      Empty trash
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteConversation(channelId)}
                      disabled={nonDeletableChannels.has(channelId)}
                      className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white p-1.5 text-slate-600 hover:border-slate-300 disabled:opacity-50"
                      aria-label="Delete conversation"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" focusable="false">
                        <path
                          fill="currentColor"
                          d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v9h-2V9zm4 0h2v9h-2V9zM7 9h2v9H7V9z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div ref={listRef} className="flex-1 overflow-y-auto p-6 space-y-4">
                {history.length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    No messages yet. Share a case file, request support, or mention @Lina.
                  </div>
                )}
                {history.map((m) => {
                  const isOwn = m.author === (user?.name || "Agent") && m.role === (canHQ ? "hq" : "agent");
                  const bubbleStyle = isOwn
                    ? "bg-slate-900 text-white"
                    : m.role === "lina"
                      ? "bg-amber-50 text-amber-900"
                      : "bg-slate-100 text-slate-900";
                  return (
                    <div key={m.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-md px-4 py-3 rounded-lg ${bubbleStyle}`}>
                        <p className="text-xs font-semibold opacity-70 mb-1">{m.author}</p>
                        <p className="text-sm whitespace-pre-line">{m.text}</p>
                        <div className="mt-1 flex items-center justify-between gap-3">
                          <p className={`text-xs ${isOwn ? "text-slate-200" : "text-slate-500"}`}>
                            {m.ts}
                          </p>
                          <button
                            type="button"
                            onClick={() => handleDeleteMessage(m)}
                            className={`inline-flex items-center justify-center rounded-full p-1 ${
                              isOwn ? "text-slate-200 hover:text-white" : "text-slate-500 hover:text-slate-700"
                            }`}
                            aria-label="Delete message"
                          >
                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true" focusable="false">
                              <path
                                fill="currentColor"
                                d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v9h-2V9zm4 0h2v9h-2V9zM7 9h2v9H7V9z"
                              />
                            </svg>
                          </button>
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
                    placeholder="@Lina summarize, transfer a case file, share a client, request HQ help"
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
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Agent tools</p>
                <h3 className="text-lg font-bold text-slate-900">Power actions</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Case files</p>
                  <ul className="space-y-1 text-xs text-slate-600">
                    <li>• Open case file TRIP-104</li>
                    <li>• Open case file YCHT-55</li>
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
                  <p className="text-xs text-slate-600">History is kept. HQ sees everything. Shared by case file/agent.</p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
