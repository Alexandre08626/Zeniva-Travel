"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import LinaAvatar from "./LinaAvatar";
import AutoTranslate from "./AutoTranslate";
import { useAuthStore } from "../lib/authStore";
import { normalizeRbacRole } from "../lib/rbac";

type Mode = "traveler" | "partner" | "agent" | "hq";

type LinaMessage = {
  id: string;
  role: "user" | "lina";
  text: string;
  ts: string;
};

const MODE_COPY: Record<Mode, {
  title: string;
  subtitle: string;
  placeholder: string;
  ctaLabel: string;
  ctaHref: string;
  quickPrompts: string[];
}> = {
  traveler: {
    title: "Lina Travel Concierge",
    subtitle: "Trip planning, hotels, flights, and experiences tailored to you.",
    placeholder: "Ask Lina to plan your next trip...",
    ctaLabel: "Open traveler chat",
    ctaHref: "/chat",
    quickPrompts: [
      "Plan a 7-day beach trip under $4,000",
      "Find a boutique hotel in Paris for May",
      "Suggest a honeymoon itinerary for Bali",
    ],
  },
  partner: {
    title: "Lina Partner Advisor",
    subtitle: "Inventory tips, pricing strategy, and guest communication support.",
    placeholder: "Ask Lina about partner operations...",
    ctaLabel: "Open partner inbox",
    ctaHref: "/partner/inbox",
    quickPrompts: [
      "Draft a response for a late check-in request",
      "Improve my listing description for families",
      "Summarize upcoming booking priorities",
    ],
  },
  agent: {
    title: "Lina Agent Copilot",
    subtitle: "Dossier summaries, proposal drafts, and supplier recommendations.",
    placeholder: "Ask Lina to assist with a client request...",
    ctaLabel: "Open agent chat",
    ctaHref: "/agent/chat",
    quickPrompts: [
      "Summarize dossier TRIP-104",
      "Draft a Maldives proposal under $12k",
      "Find nonstop flight options from YUL",
    ],
  },
  hq: {
    title: "Lina HQ Operations",
    subtitle: "Approvals, compliance checks, and high-level reporting support.",
    placeholder: "Ask Lina about HQ operations...",
    ctaLabel: "Open HQ chat",
    ctaHref: "/agent/chat?channel=hq",
    quickPrompts: [
      "Summarize pending booking approvals",
      "List urgent payment follow-ups",
      "Draft a compliance checklist",
    ],
  },
};

function inferMode(pathname: string, role?: string | null): Mode {
  if (pathname.startsWith("/partner")) return "partner";
  if (pathname.startsWith("/agent")) {
    const normalized = normalizeRbacRole(role || "");
    if (normalized === "hq" || normalized === "admin") return "hq";
    return "agent";
  }
  return "traveler";
}

export default function LinaAssistantDock() {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const user = useAuthStore((s) => s.user);
  const role = user?.effectiveRole || user?.role || null;
  const mode = useMemo(() => inferMode(pathname, role), [pathname, role]);
  const copy = MODE_COPY[mode];

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<LinaMessage[]>([]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const now = new Date();
    const userMessage: LinaMessage = {
      id: `${now.getTime()}-user`,
      role: "user",
      text: trimmed,
      ts: now.toLocaleTimeString().slice(0, 5),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const resp = await fetch(`/api/chat?prompt=${encodeURIComponent(trimmed)}&mode=${mode}`);
      const data = await resp.json();
      const reply = data?.reply || "Lina is currently unavailable.";
      const linaMessage: LinaMessage = {
        id: `${now.getTime()}-lina`,
        role: "lina",
        text: reply,
        ts: new Date().toLocaleTimeString().slice(0, 5),
      };
      setMessages((prev) => [...prev, linaMessage]);
    } catch {
      const linaMessage: LinaMessage = {
        id: `${now.getTime()}-lina-fail`,
        role: "lina",
        text: "Lina is currently unavailable.",
        ts: new Date().toLocaleTimeString().slice(0, 5),
      };
      setMessages((prev) => [...prev, linaMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-lg"
        aria-label="Open Lina assistant"
      >
        <LinaAvatar size="sm" />
        <div className="text-left">
          <div className="text-sm font-bold text-slate-900">
            <AutoTranslate text="Talk to Lina" className="inline" />
          </div>
          <div className="text-[11px] font-semibold text-slate-500">
            {copy.title}
          </div>
        </div>
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-end bg-black/30 p-6" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <LinaAvatar size="md" />
                <div>
                  <div className="text-sm font-bold text-slate-900">{copy.title}</div>
                  <div className="text-xs text-slate-600">
                    <AutoTranslate text={copy.subtitle} className="inline" />
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
              >
                Close
              </button>
            </div>

            <div className="mt-4 space-y-2 text-xs text-slate-600">
              <div className="flex flex-wrap gap-2">
                {copy.quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendMessage(prompt)}
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:border-slate-300"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 max-h-64 space-y-3 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
              {messages.length === 0 && (
                <p className="text-xs text-slate-500">
                  <AutoTranslate text="Ask Lina a question to get started." className="inline" />
                </p>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className={msg.role === "user" ? "text-right" : "text-left"}>
                  <div className={`inline-block max-w-[85%] rounded-xl px-3 py-2 text-xs font-semibold ${msg.role === "user" ? "bg-blue-600 text-white" : "bg-white text-slate-800"}`}>
                    {msg.text}
                  </div>
                  <div className="mt-1 text-[10px] text-slate-400">{msg.ts}</div>
                </div>
              ))}
              {loading && <div className="text-xs text-slate-500">Lina is typing...</div>}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={copy.placeholder}
                className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage(input);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => sendMessage(input)}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Send
              </button>
            </div>

            <button
              type="button"
              onClick={() => router.push(copy.ctaHref)}
              className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              {copy.ctaLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
