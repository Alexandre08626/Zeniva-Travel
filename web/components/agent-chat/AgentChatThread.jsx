"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useAuthStore } from "../../src/lib/authStore";

const AGENT_STORE_KEY = "zeniva_agent_chat_v1";

/* ─── Agent-specific localStorage persistence ─── */
function loadAgentMessages(tripId) {
  try {
    const raw = localStorage.getItem(AGENT_STORE_KEY);
    const store = raw ? JSON.parse(raw) : {};
    return store[tripId]?.messages || [];
  } catch { return []; }
}

function saveAgentMessages(tripId, messages) {
  try {
    const raw = localStorage.getItem(AGENT_STORE_KEY);
    const store = raw ? JSON.parse(raw) : {};
    if (!store[tripId]) store[tripId] = {};
    store[tripId].messages = messages;
    store[tripId].updatedAt = new Date().toISOString();
    localStorage.setItem(AGENT_STORE_KEY, JSON.stringify(store));
  } catch {}
}

function loadAgentSnapshot(tripId) {
  try {
    const raw = localStorage.getItem(AGENT_STORE_KEY);
    const store = raw ? JSON.parse(raw) : {};
    return store[tripId]?.snapshot || {};
  } catch { return {}; }
}

function saveAgentSnapshot(tripId, snapshot) {
  try {
    const raw = localStorage.getItem(AGENT_STORE_KEY);
    const store = raw ? JSON.parse(raw) : {};
    if (!store[tripId]) store[tripId] = {};
    store[tripId].snapshot = { ...(store[tripId].snapshot || {}), ...snapshot };
    localStorage.setItem(AGENT_STORE_KEY, JSON.stringify(store));
  } catch {}
}

/* ─── Extract trip info from conversation ─── */
function extractTripInfo(messages) {
  const patch = {};
  const text = messages.slice(-8).map(m => m.content || "").join("\n");

  // Destination
  const destMatch = text.match(/["']destination["']\s*:\s*["']([^"']+)["']/i)
    || text.match(/(?:destination|dest)\s*[:=]\s*([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s-]{2,30})/i)
    || text.match(/\b(?:to|à|au|en|aux|for|going to|trip to|travel to|voyage)\s+([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s-]{2,25})/i);
  if (destMatch) {
    const d = destMatch[1].trim().split(/[,\n•]/)[0].trim();
    if (d.length >= 3 && d.length <= 30) patch.destination = d;
  }

  // Departure
  const depMatch = text.match(/\b(YUL|YYZ|YVR|JFK|LAX|MIA|ORD|CDG|LHR|YOW)\b/)
    || text.match(/["']departure["']\s*:\s*["']([^"']+)["']/i)
    || text.match(/(?:from|depart|departure)\s+([A-Za-zÀ-ÿ]{3,20})/i);
  if (depMatch) patch.departure = depMatch[1].trim();

  // Dates (ISO format)
  const dateMatch = text.match(/\b(\d{4}-\d{2}-\d{2})\b/g);
  if (dateMatch?.length >= 2) patch.dates = `${dateMatch[0]} → ${dateMatch[1]}`;
  else if (dateMatch?.length === 1) patch.dates = dateMatch[0];

  // French dates
  if (!patch.dates) {
    const months = { janvier:"01", février:"02", fevrier:"02", mars:"03", avril:"04", mai:"05", juin:"06", juillet:"07", août:"08", aout:"08", septembre:"09", octobre:"10", novembre:"11", décembre:"12" };
    const frDates = text.match(/\b(\d{1,2})\s+(janvier|février|fevrier|mars|avril|mai|juin|juillet|août|aout|septembre|octobre|novembre|décembre)\b/gi) || [];
    const parsed = frDates.map(s => {
      const m = s.match(/(\d{1,2})\s+(\w+)/i);
      if (!m) return null;
      const mon = months[m[2].toLowerCase()];
      if (!mon) return null;
      return `${new Date().getFullYear()}-${mon}-${m[1].padStart(2, "0")}`;
    }).filter(Boolean);
    if (parsed.length >= 2) patch.dates = `${parsed[0]} → ${parsed[1]}`;
    else if (parsed.length === 1) patch.dates = parsed[0];
  }

  // English dates: "June 14-21" or "July 5 to July 12"
  if (!patch.dates) {
    const enMonths = { jan:"01", january:"01", feb:"02", february:"02", mar:"03", march:"03", apr:"04", april:"04", may:"05", jun:"06", june:"06", jul:"07", july:"07", aug:"08", august:"08", sep:"09", september:"09", oct:"10", october:"10", nov:"11", november:"11", dec:"12", december:"12" };
    const rangeMatch = text.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{1,2})\s*[-–to]+\s*(\d{1,2})\b/i);
    if (rangeMatch) {
      const mon = enMonths[rangeMatch[1].toLowerCase().slice(0,3)];
      if (mon) {
        const yr = new Date().getFullYear();
        patch.dates = `${yr}-${mon}-${rangeMatch[2].padStart(2,"0")} → ${yr}-${mon}-${rangeMatch[3].padStart(2,"0")}`;
      }
    }
  }

  // Travelers
  const travMatch = text.match(/(\d+)\s*(?:person|adult|voyageur|pax|people|adulte)/i);
  if (travMatch) {
    const n = parseInt(travMatch[1]);
    if (n > 0 && n <= 20) patch.travelers = `${n} adults`;
  }

  // Budget
  const budgetMatch = text.match(/\$\s*([\d,]+)/) || text.match(/([\d,]+)\s*\$/);
  if (budgetMatch) patch.budget = `$${budgetMatch[1].replace(/,/g, "")} CAD`;

  return Object.keys(patch).length > 0 ? patch : null;
}

/* ─── Quick prompts ─── */
const quickPrompts = [
  "All-inclusive Cancun, 2 adults, June 14-21",
  "Paris + Rome, 10 days, family of 4, July",
  "Luxury Maldives honeymoon, 7 nights",
  "Caribbean cruise, 7 nights, from Miami",
  "Ski Whistler, 5 nights, group of 8",
];

/* ─── Component ─── */
export default function AgentChatThread({ tripId }) {
  const user = useAuthStore((s) => s.user);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Load messages from agent-specific storage
  useEffect(() => {
    if (!tripId) return;
    const saved = loadAgentMessages(tripId);
    if (saved.length > 0) setMessages(saved);
  }, [tripId]);

  // Auto-scroll
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Check if proposal-ready (3+ assistant messages)
  useEffect(() => {
    const assistantCount = messages.filter(m => m.role === "assistant").length;
    setIsReady(assistantCount >= 2);
  }, [messages]);

  // Persistent session ID per trip (agent-specific)
  const sessionIdRef = useRef("");
  useEffect(() => {
    if (!tripId) return;
    const key = `lina-agent-session-${tripId}`;
    const stored = typeof window !== "undefined" ? localStorage.getItem(key) : null;
    if (stored) {
      sessionIdRef.current = stored;
    } else {
      const id = `agent-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      sessionIdRef.current = id;
      if (typeof window !== "undefined") localStorage.setItem(key, id);
    }
  }, [tripId]);

  const sendMessage = async (text) => {
    if (!text?.trim() || loading) return;
    const userMsg = { role: "user", content: text.trim(), ts: Date.now() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    saveAgentMessages(tripId, newMessages);
    setInput("");
    setLoading(true);

    // Build history for Lina API (same format as traveler)
    const history = newMessages
      .filter(m => m.role && m.content)
      .slice(-20)
      .map(m => ({ role: m.role === "lina" ? "assistant" : m.role, content: m.content }));

    const lastUserMsg = text.trim();

    try {
      const res = await fetch("/api/lina", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: lastUserMsg,
          sessionId: sessionIdRef.current,
          mode: "agent",
          history,
        }),
      });

      let reply = "Lina is temporarily unavailable. Please try again.";
      if (res.ok) {
        const data = await res.json();
        reply = String(data?.reply || data?.response || reply);
        // Strip TRIP_PATCH blocks from reply (keep it clean)
        const patchStart = reply.indexOf("TRIP_PATCH_START");
        if (patchStart !== -1) {
          const patchEnd = reply.indexOf("TRIP_PATCH_END");
          if (patchEnd !== -1) {
            // Extract trip patch for snapshot
            try {
              const patchJson = reply.slice(patchStart + "TRIP_PATCH_START".length, patchEnd).trim();
              const parsed = JSON.parse(patchJson);
              if (parsed?.patch) saveAgentSnapshot(tripId, parsed.patch);
            } catch {}
            reply = (reply.slice(0, patchStart) + reply.slice(patchEnd + "TRIP_PATCH_END".length)).trim();
          }
        }
      }

      const assistantMsg = { role: "assistant", content: reply, ts: Date.now() };
      const updated = [...newMessages, assistantMsg];
      setMessages(updated);
      saveAgentMessages(tripId, updated);

      // Also extract from conversation text
      const patch = extractTripInfo(updated);
      if (patch) saveAgentSnapshot(tripId, patch);
    } catch (err) {
      const errMsg = { role: "assistant", content: "Connection error. Please try again.", ts: Date.now() };
      const updated = [...newMessages, errMsg];
      setMessages(updated);
      saveAgentMessages(tripId, updated);
    }

    setLoading(false);
    inputRef.current?.focus();
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <Image src="/agents/lina.png" alt="Lina" width={80} height={80} className="mx-auto rounded-full mb-4 shadow-lg" />
            <h3 className="text-lg font-black text-slate-900">Agent Trip Search</h3>
            <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
              Describe your client&apos;s trip and I&apos;ll search flights, hotels, and activities.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-5">
              {quickPrompts.map((p) => (
                <button key={p} onClick={() => sendMessage(p)} className="text-xs bg-white border border-slate-200 text-slate-600 px-3 py-2 rounded-xl hover:bg-teal-50 hover:border-teal-300 transition-colors text-left shadow-sm">
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          msg.role === "user" ? (
            <div key={i} className="flex justify-end">
              <div className="bg-slate-900 text-white rounded-2xl rounded-br-md px-4 py-3 max-w-[75%] text-sm whitespace-pre-wrap shadow-md">
                {msg.content}
              </div>
            </div>
          ) : (
            <div key={i} className="flex gap-3">
              <Image src="/agents/lina.png" alt="Lina" width={36} height={36} className="w-9 h-9 rounded-full shrink-0 mt-1 shadow" />
              <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-slate-100 text-sm text-slate-700 whitespace-pre-wrap max-w-[85%]">
                {msg.content}
              </div>
            </div>
          )
        ))}

        {loading && (
          <div className="flex gap-3">
            <Image src="/agents/lina.png" alt="Lina" width={36} height={36} className="w-9 h-9 rounded-full shrink-0 shadow" />
            <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-slate-100">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Proposal button */}
      {isReady && (
        <div className="px-4 pb-2">
          <button
            onClick={() => { window.location.href = `/agent/proposals/select/${tripId}`; }}
            className="w-full rounded-2xl px-5 py-3.5 text-sm font-black text-slate-900 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg"
            style={{ background: "linear-gradient(90deg, #E6B85A, #f0c96b)" }}
          >
            ✈️ See Proposals for This Trip →
          </button>
        </div>
      )}

      {/* Input area */}
      <form onSubmit={handleSubmit} className="px-4 pb-4 pt-2">
        <div className="flex gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe the trip for your client..."
            rows={1}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm resize-none focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-5 py-3 bg-gradient-to-r from-teal-600 to-violet-600 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-40 transition-opacity shrink-0"
          >
            {loading ? "⏳" : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}
