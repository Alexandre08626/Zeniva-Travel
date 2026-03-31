"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";

const LinaVideoCall = dynamic(() => import("@/src/components/LinaVideoCall"), { ssr: false });

/* ─── Types ─────────────────────────────────────────────────── */
interface Message {
  role: "user" | "assistant";
  content: string;
}

interface SearchResult {
  id: string;
  type: "flight" | "hotel" | "activity" | "transfer" | "cruise";
  title: string;
  subtitle: string;
  price: string;
  currency: string;
  details: Record<string, string>;
  selected: boolean;
}

const TYPE_CFG: Record<string, { icon: string; color: string; bg: string; selectedBg: string }> = {
  flight:   { icon: "\u2708\uFE0F", color: "text-blue-700",    bg: "bg-blue-50 border-blue-200",    selectedBg: "border-teal-500 bg-teal-50 ring-2 ring-teal-200" },
  hotel:    { icon: "\uD83C\uDFE8", color: "text-violet-700",  bg: "bg-violet-50 border-violet-200",selectedBg: "border-teal-500 bg-teal-50 ring-2 ring-teal-200" },
  activity: { icon: "\uD83C\uDFAF", color: "text-amber-700",   bg: "bg-amber-50 border-amber-200",  selectedBg: "border-teal-500 bg-teal-50 ring-2 ring-teal-200" },
  transfer: { icon: "\uD83D\uDE95", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", selectedBg: "border-teal-500 bg-teal-50 ring-2 ring-teal-200" },
  cruise:   { icon: "\uD83D\uDEA2", color: "text-cyan-700",    bg: "bg-cyan-50 border-cyan-200",    selectedBg: "border-teal-500 bg-teal-50 ring-2 ring-teal-200" },
};

/* ─── System prompt for agent mode ─────────────────────────── */
const AGENT_SYSTEM = `You are Lina, Zeniva's AI travel concierge helping a PROFESSIONAL TRAVEL AGENT (not a traveler).

CONTEXT: You help advisors search travel products for THEIR CLIENTS. Be efficient, professional, use industry terms.

When the agent describes a trip, search and return results as JSON blocks:

\`\`\`results
[
  {"type":"flight","title":"Air Canada AC801","subtitle":"YUL → CUN, Jun 15 - Direct 4h30","price":"489","currency":"CAD","details":{"airline":"Air Canada","class":"Economy","departure":"08:30","arrival":"13:00","stops":"Direct"}},
  {"type":"hotel","title":"Riu Palace Riviera Maya","subtitle":"5★ All-Inclusive, Playa del Carmen","price":"285","currency":"CAD","details":{"stars":"5","rating":"4.6","board":"All-Inclusive","room":"Ocean View Suite","per":"night"}}
]
\`\`\`

RULES:
- Return MULTIPLE options per category (budget, mid-range, premium)
- Include price per person for flights, per night for hotels
- Be proactive: give results FAST, refine after
- For each result include key details (airline, class, stars, board, room type, duration, etc.)
- Group results by type: flights first, then hotels, then activities/transfers`;

/* ─── Helpers ──────────────────────────────────────────────── */
function parseResults(content: string): { text: string; results: SearchResult[] } {
  const results: SearchResult[] = [];
  let text = content;
  const regex = /```results\s*\n([\s\S]*?)```/g;
  let m;
  while ((m = regex.exec(content)) !== null) {
    try {
      const parsed = JSON.parse(m[1]);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          results.push({
            id: `${item.type}-${Math.random().toString(36).slice(2, 8)}`,
            type: item.type || "hotel",
            title: item.title || "",
            subtitle: item.subtitle || "",
            price: item.price || "0",
            currency: item.currency || "CAD",
            details: item.details || {},
            selected: false,
          });
        }
      }
    } catch {}
    text = text.replace(m[0], "");
  }
  return { text: text.trim(), results };
}

/* ─── Result Card ──────────────────────────────────────────── */
function ResultCard({ r, onToggle }: { r: SearchResult; onToggle: () => void }) {
  const cfg = TYPE_CFG[r.type] || TYPE_CFG.hotel;
  return (
    <div onClick={onToggle} className={`rounded-xl border-2 p-4 cursor-pointer transition-all ${r.selected ? cfg.selectedBg : `${cfg.bg} hover:shadow-md`}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span>{cfg.icon}</span>
            <span className={`text-[10px] font-bold uppercase tracking-wide ${cfg.color}`}>{r.type}</span>
            {r.selected && <span className="text-[10px] font-bold text-teal-700 bg-teal-200 px-2 py-0.5 rounded-full">{"\u2713"} Added</span>}
          </div>
          <h4 className="font-bold text-slate-900 mt-1 text-sm">{r.title}</h4>
          <p className="text-xs text-slate-500 mt-0.5">{r.subtitle}</p>
          {Object.keys(r.details).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {Object.entries(r.details).map(([k, v]) => (
                <span key={k} className="text-[10px] bg-white/80 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                  <span className="font-semibold">{k}:</span> {v}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-black text-slate-900">${r.price}</p>
          <p className="text-[10px] text-slate-400">{r.currency}{r.details?.per ? `/${r.details.per}` : ""}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ─────────────────────────────────────────────────── */
export default function AgentTripChat() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = params.id as string;
  const clientName = searchParams.get("client") || "";
  const clientEmail = searchParams.get("email") || "";
  const isHybrid = searchParams.get("hybrid") === "1";

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [allResults, setAllResults] = useState<SearchResult[]>([]);
  const [proposalOpen, setProposalOpen] = useState(false);
  const [showCall, setShowCall] = useState(isHybrid);
  const [tripDetailsOpen, setTripDetailsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [messages]);

  const selectedResults = allResults.filter((r) => r.selected);

  const toggleResult = useCallback((id: string) => {
    setAllResults((prev) => prev.map((r) => r.id === id ? { ...r, selected: !r.selected } : r));
  }, []);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "system", content: AGENT_SYSTEM }, ...newMessages],
          agent_mode: true,
          session_id: sessionId,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const content = data.reply || data.content || data.message || "";
        setMessages([...newMessages, { role: "assistant", content }]);
        const { results } = parseResults(content);
        if (results.length > 0) setAllResults((prev) => [...prev, ...results]);
      }
    } catch {}
    setLoading(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const createProposal = () => {
    // Build proposal and redirect to proposals page
    const items = selectedResults.map((r) => ({ type: r.type, title: r.title, subtitle: r.subtitle, price: r.price, currency: r.currency, details: r.details }));
    sessionStorage.setItem("zeniva_proposal_draft", JSON.stringify({ client: { name: clientName, email: clientEmail }, items, session_id: sessionId, created_at: new Date().toISOString() }));
    router.push("/agent/proposals?from=trip-search");
  };

  const renderMessage = (msg: Message, idx: number) => {
    if (msg.role === "user") {
      return (
        <div key={idx} className="flex justify-end">
          <div className="bg-slate-900 text-white rounded-2xl rounded-br-md px-4 py-3 max-w-[75%] text-sm whitespace-pre-wrap">{msg.content}</div>
        </div>
      );
    }
    const { text, results } = parseResults(msg.content);
    return (
      <div key={idx} className="flex gap-3 max-w-full">
        <Image src="/agents/lina.png" alt="Lina" width={36} height={36} className="w-9 h-9 rounded-full shrink-0 mt-1" />
        <div className="flex-1 min-w-0 space-y-2">
          {text && <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-slate-100 text-sm text-slate-700 whitespace-pre-wrap">{text}</div>}
          {results.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Click to add to proposal</p>
              {results.map((r) => {
                const tracked = allResults.find((a) => a.id === r.id) || r;
                return <ResultCard key={r.id} r={tracked} onToggle={() => toggleResult(r.id)} />;
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen flex flex-col bg-slate-50">
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-5 py-3 bg-white border-b border-slate-100 shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link href="/agent/trip-search" className="text-slate-500 hover:text-slate-800 text-sm font-semibold">{"\u2190"}</Link>
          <div className="h-4 w-px bg-slate-200" />
          <Image src="/agents/lina.png" alt="Lina" width={30} height={30} className="rounded-full ring-2 ring-teal-100" />
          <div>
            <span className="text-slate-900 font-black text-sm">Lina</span>
            <span className="text-teal-600 font-black text-sm"> AI</span>
            <span className="text-slate-400 text-xs ml-1">{"\u00B7"} Agent Mode</span>
          </div>
          <div className="flex items-center gap-1 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-green-700 text-[10px] font-bold">Online</span>
          </div>
          {clientName && (
            <div className="hidden sm:flex items-center gap-1 bg-violet-50 border border-violet-200 rounded-full px-2.5 py-0.5">
              <span className="text-violet-700 text-xs font-semibold">{"\uD83D\uDC64"} {clientName}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {selectedResults.length > 0 && (
            <button onClick={() => setProposalOpen(!proposalOpen)} className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold border transition-all ${proposalOpen ? "bg-teal-600 text-white border-teal-600" : "bg-white text-teal-700 border-teal-300 hover:bg-teal-50"}`}>
              {"\uD83D\uDCCB"} Proposal ({selectedResults.length})
            </button>
          )}
          <button onClick={() => setTripDetailsOpen(!tripDetailsOpen)} className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold border transition-all ${tripDetailsOpen ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"}`}>
            {"\u2708\uFE0F"} <span className="hidden sm:inline">Trip Details</span>
          </button>
          <button onClick={() => setShowCall(!showCall)} className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-black transition-all ${showCall ? "bg-red-500 text-white" : "bg-gradient-to-r from-teal-600 to-violet-600 text-white"}`}>
            {showCall ? "\uD83D\uDCF5 End Call" : "\uD83D\uDCDE Call Lina"}
          </button>
        </div>
      </header>

      {/* ── Trip details drawer ── */}
      {tripDetailsOpen && (
        <div className="border-b border-slate-200 bg-white shadow-sm px-5 py-4">
          <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div><span className="text-[10px] font-bold text-slate-400 uppercase">Client</span><p className="text-sm font-bold text-slate-800">{clientName || "Not specified"}</p></div>
            <div><span className="text-[10px] font-bold text-slate-400 uppercase">Email</span><p className="text-sm text-slate-600">{clientEmail || "N/A"}</p></div>
            <div><span className="text-[10px] font-bold text-slate-400 uppercase">Results Found</span><p className="text-sm font-bold text-slate-800">{allResults.length}</p></div>
            <div><span className="text-[10px] font-bold text-slate-400 uppercase">Selected</span><p className="text-sm font-bold text-teal-700">{selectedResults.length} items</p></div>
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Voice call panel */}
        {showCall && (
          <div className="w-[380px] border-r border-slate-200 bg-slate-950 shrink-0 flex flex-col">
            <div className="flex-1 flex items-center justify-center">
              <LinaVideoCall tripId={sessionId} />
            </div>
          </div>
        )}

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <Image src="/agents/lina.png" alt="Lina" width={80} height={80} className="mx-auto rounded-full mb-4" />
                <h3 className="text-lg font-black text-slate-900">Agent Trip Search</h3>
                <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">Describe your client&apos;s trip. I&apos;ll find flights, hotels, activities. Click results to build a proposal.</p>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {[
                    "All-inclusive Cancun, 2 adults, June 14-21, budget $3000",
                    "Paris + Rome, 10 days, family 4, July, mid-range",
                    "Luxury Maldives honeymoon, 7 nights, overwater villa",
                    "Caribbean cruise, 7 nights, from Miami, November, couple",
                    "Ski Whistler, 5 nights, group of 8, February, condos",
                  ].map((s) => (
                    <button key={s} onClick={() => setInput(s)} className="text-xs bg-white border border-slate-200 text-slate-600 px-3 py-2 rounded-xl hover:bg-teal-50 hover:border-teal-300 transition-colors text-left">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg, i) => renderMessage(msg, i))}
            {loading && (
              <div className="flex gap-3">
                <Image src="/agents/lina.png" alt="Lina" width={36} height={36} className="w-9 h-9 rounded-full shrink-0" />
                <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-slate-100">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="bg-white border-t border-slate-200 px-5 py-3 shrink-0">
            <div className="flex gap-3 max-w-4xl mx-auto">
              <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Describe the trip for your client..." rows={1} className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm resize-none focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100" />
              <button onClick={sendMessage} disabled={!input.trim() || loading} className="px-6 py-3 bg-gradient-to-r from-teal-600 to-violet-600 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-40 transition-opacity shrink-0">
                {loading ? "\u23F3" : "\uD83D\uDD0D Search"}
              </button>
            </div>
          </div>
        </div>

        {/* Proposal sidebar */}
        {proposalOpen && (
          <div className="w-80 border-l border-slate-200 bg-white flex flex-col shrink-0">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900">{"\uD83D\uDCCB"} Proposal Draft</h3>
              <button onClick={() => setProposalOpen(false)} className="text-slate-400 hover:text-slate-600">{"\u2715"}</button>
            </div>
            {clientName && (
              <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 text-xs text-slate-500">
                Client: <span className="font-bold text-slate-700">{clientName}</span>
                {clientEmail && <span className="block">{clientEmail}</span>}
              </div>
            )}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {selectedResults.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">Click on search results to add them here.</p>
              ) : (
                ["flight", "hotel", "activity", "transfer", "cruise"].map((type) => {
                  const items = selectedResults.filter((r) => r.type === type);
                  if (items.length === 0) return null;
                  const cfg = TYPE_CFG[type];
                  return (
                    <div key={type}>
                      <p className={`text-[10px] font-bold uppercase tracking-wide ${cfg.color} mb-1`}>{cfg.icon} {type}s ({items.length})</p>
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 mb-1">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{item.title}</p>
                            <p className="text-[10px] text-slate-400 truncate">{item.subtitle}</p>
                          </div>
                          <div className="text-right shrink-0 ml-2">
                            <p className="text-xs font-bold">${item.price}</p>
                            <button onClick={() => toggleResult(item.id)} className="text-red-500 text-[10px] font-bold">{"\u2715"}</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })
              )}
            </div>
            {selectedResults.length > 0 && (
              <div className="px-4 py-3 border-t border-slate-100">
                <div className="flex justify-between text-sm mb-3">
                  <span className="font-bold text-slate-700">Total</span>
                  <span className="font-black text-teal-700">${selectedResults.reduce((s, r) => s + parseFloat(r.price || "0"), 0).toLocaleString()}</span>
                </div>
                <button onClick={createProposal} className="w-full py-3 bg-gradient-to-r from-teal-600 to-violet-600 text-white font-bold rounded-xl hover:opacity-90 text-sm">
                  Create Proposal {"\u2192"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
