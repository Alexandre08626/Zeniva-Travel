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
  const [messages, setMessages] = useState<Record<string, { role: "agent" | "hq" | "lina"; author: string; text: string; ts: string }[]>>({
    global: [
      { role: "hq", author: "HQ", text: "Daily: push proposals before 4pm ET.", ts: "09:02" },
      { role: "agent", author: "Alice", text: "Need help with honeymoon Maldives, budget 12k.", ts: "09:05" },
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
    { id: "agent-marco", label: "Marco", scope: "Direct", unread: 0 },
    { id: "dossier-trip-104", label: "Dossier TRIP-104", scope: "Client file", unread: 0 },
    { id: "dossier-yacht-55", label: "Yacht YCHT-55", scope: "Client file", unread: 1 },
  ]);
  const listRef = useRef<HTMLDivElement | null>(null);

  const quickActions = [
    "Share dossier TRIP-104 to Sara",
    "Transfer client Lavoie to Marco",
    "Ask HQ for payment override",
    "Request proposal support",
    "@Lina summarize this thread",
    "Link booking ORD-1032",
  ];

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
          unread: 1
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
    <main className="min-h-screen" style={{ backgroundColor: "#0b1220" }}>
      <div className="mx-auto max-w-6xl px-5 py-8 grid gap-4 md:grid-cols-[280px,1fr,280px]">
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Channels</p>
              <p className="text-sm font-bold text-white">Chat interne</p>
            </div>
            <span className="rounded-full bg-emerald-600 px-2 py-1 text-[11px] font-bold text-white">HQ sees all</span>
          </div>
          <div className="space-y-1">
            {channels.map((c) => {
              const active = c.id === channelId;
              const hiddenHQ = c.id === "hq" && !canHQ;
              if (hiddenHQ) return null;
              return (
                <button
                  key={c.id}
                  onClick={() => setChannelId(c.id)}
                  className="w-full rounded-xl border px-3 py-2 text-left transition"
                  style={{
                    backgroundColor: active ? "#111827" : "#0f172a",
                    borderColor: active ? PREMIUM_BLUE : "#1e293b",
                    color: "white",
                  }}
                >
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span>{c.label}</span>
                    {c.unread ? <span className="rounded-full bg-rose-600 px-2 py-[2px] text-[10px] text-white">{c.unread}</span> : null}
                  </div>
                  <p className="text-[11px] text-slate-400">{c.scope}</p>
                </button>
              );
            })}
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs text-slate-200">
            <p className="font-semibold uppercase tracking-[0.12em] text-slate-400">Usage</p>
            <ul className="mt-2 space-y-1">
              <li>• Global: annonces, SLA</li>
              <li>• HQ ↔ agents</li>
              <li>• Dossier: collaboration par client</li>
              <li>• Fichiers et liens vers dossiers</li>
              <li>• @Lina pour résumé / actions</li>
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 flex flex-col" style={{ minHeight: "75vh" }}>
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Channel</p>
              <h1 className="text-xl font-black text-white">{title}</h1>
              <p className="text-xs" style={{ color: MUTED_TEXT }}>
                Partage dossiers, transferts, demandes d'aide, HQ peut voir tout. Historique conservé (audit).
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/agent" className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200">Go to dashboard</Link>
              <Link href="/agent/finance" className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200">Finance (HQ)</Link>
            </div>
          </div>

          <div ref={listRef} className="flex-1 overflow-y-auto space-y-2 py-3 pr-1">
            {history.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900 p-4 text-sm" style={{ color: MUTED_TEXT }}>
                Pas encore de messages. Partagez un dossier, demandez de l'aide, ou mentionnez @Lina.
              </div>
            )}
            {history.map((m, idx) => (
              <div key={idx} className="rounded-xl border border-slate-800 bg-slate-900 p-3 shadow-sm">
                <div className="flex items-center justify-between text-[11px] font-semibold" style={{ color: MUTED_TEXT }}>
                  <span>{m.author}</span>
                  <span>{m.ts}</span>
                </div>
                <div className="mt-1 whitespace-pre-line text-sm font-semibold" style={{ color: m.role === "lina" ? ACCENT_GOLD : "white" }}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-800 pt-3 space-y-3">
            <div className="flex flex-wrap gap-2 text-[11px] font-semibold">
              {quickActions.map((qa) => (
                <button
                  key={qa}
                  onClick={() => onQuick(qa)}
                  className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-slate-200 hover:border-slate-500"
                >
                  {qa}
                </button>
              ))}
            </div>
            <form onSubmit={onSubmit} className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="@Lina résume, transfère un dossier, partage un client, demande aide HQ"
                className="flex-1 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm font-semibold text-white outline-none focus:border-slate-600"
              />
              <button
                type="submit"
                disabled={sending}
                className="rounded-2xl px-4 py-3 text-sm font-extrabold text-white"
                style={{ backgroundColor: PREMIUM_BLUE, opacity: sending ? 0.8 : 1 }}
              >
                {sending ? "Envoi…" : "Envoyer"}
              </button>
            </form>
            {linaBusy && <p className="text-xs text-slate-300">Lina traite la demande…</p>}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Dossier / Pièces</p>
            <p className="text-sm" style={{ color: MUTED_TEXT }}>
              Liez un dossier ou une proposition. Fichiers et liens apparaissent ici (audités, visibles HQ).
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-sm text-slate-200 space-y-2">
            <p className="font-semibold">Liens rapides</p>
            <ul className="space-y-1 text-xs">
              <li>• Ouvrir dossier TRIP-104</li>
              <li>• Ouvrir dossier YCHT-55</li>
              <li>• Propositions actives (3)</li>
              <li>• Paiements récents</li>
            </ul>
          </div>
          <div className="rounded-xl border border-indigo-500 bg-indigo-600/10 p-3 text-sm text-slate-100">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-200">Lina aide</p>
            <ul className="mt-2 space-y-1 text-xs">
              <li>• Résumer cette conversation</li>
              <li>• Extraire actions et propriétaires</li>
              <li>• Préparer réponse client</li>
              <li>• Identifier risques (paiement, docs)</li>
            </ul>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-xs text-slate-300">
            <p className="font-semibold uppercase tracking-[0.12em] text-slate-400">Audit</p>
            <p>Historique conservé. HQ voit tout. Partage par dossier/agent.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
