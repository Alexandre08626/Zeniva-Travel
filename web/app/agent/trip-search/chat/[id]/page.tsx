"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface Message {
  role: "user" | "assistant" | "system";
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
  image?: string;
  selected: boolean;
}

const TYPE_CONFIG: Record<string, { icon: string; color: string; bg: string }> = {
  flight:   { icon: "\u2708\uFE0F", color: "text-blue-700",   bg: "bg-blue-50 border-blue-200" },
  hotel:    { icon: "\uD83C\uDFE8", color: "text-violet-700", bg: "bg-violet-50 border-violet-200" },
  activity: { icon: "\uD83C\uDFAF", color: "text-amber-700",  bg: "bg-amber-50 border-amber-200" },
  transfer: { icon: "\uD83D\uDE95", color: "text-emerald-700",bg: "bg-emerald-50 border-emerald-200" },
  cruise:   { icon: "\uD83D\uDEA2", color: "text-cyan-700",   bg: "bg-cyan-50 border-cyan-200" },
};

const AGENT_SYSTEM_PROMPT = `You are Lina, Zeniva's AI travel concierge assisting a TRAVEL AGENT (not a traveler).

IMPORTANT CONTEXT: You are helping a professional travel advisor search for travel products for their CLIENT. Adapt your tone accordingly - be efficient, professional, use industry terminology.

When the agent describes what they need, search for:
- Flights (airlines, routes, prices, classes)
- Hotels (star rating, amenities, location, rates)
- Activities & excursions
- Transfers
- Cruises if applicable

CRITICAL: Return search results as JSON blocks that the UI will render as selectable cards. Use this exact format:

\`\`\`results
[
  {"type":"flight","title":"Air Canada AC801","subtitle":"YUL → CUN, Jun 15 - Direct 4h30","price":"489","currency":"CAD","details":{"airline":"Air Canada","class":"Economy","departure":"08:30","arrival":"13:00","stops":"Direct"}},
  {"type":"hotel","title":"Riu Palace Riviera Maya","subtitle":"5-star All-Inclusive, Playa del Carmen","price":"285","currency":"CAD","details":{"stars":"5","rating":"4.6","board":"All-Inclusive","room":"Ocean View Suite","per":"night"}},
  {"type":"activity","title":"Chichen Itza Day Trip","subtitle":"Full day guided tour with lunch","price":"89","currency":"CAD","details":{"duration":"10 hours","includes":"Transport, guide, lunch","pickup":"Hotel lobby"}}
]
\`\`\`

Always return multiple options per category so the agent can choose. Vary the price points (budget, mid-range, premium). The agent will select the best options to build a proposal for their client.

Be proactive: after the agent describes the trip, immediately search and return results. Don't ask too many questions - give results fast, then refine.`;

function parseResults(content: string): { text: string; results: SearchResult[] } {
  const results: SearchResult[] = [];
  let text = content;

  const regex = /```results\s*\n([\s\S]*?)```/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    try {
      const parsed = JSON.parse(match[1]);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          results.push({
            id: `${item.type}-${Math.random().toString(36).slice(2, 8)}`,
            type: item.type || "hotel",
            title: item.title || "Unknown",
            subtitle: item.subtitle || "",
            price: item.price || "0",
            currency: item.currency || "CAD",
            details: item.details || {},
            image: item.image || undefined,
            selected: false,
          });
        }
      }
    } catch {}
    text = text.replace(match[0], "");
  }

  return { text: text.trim(), results };
}

function ResultCard({ result, onToggle }: { result: SearchResult; onToggle: () => void }) {
  const cfg = TYPE_CONFIG[result.type] || TYPE_CONFIG.hotel;
  return (
    <div onClick={onToggle} className={`rounded-xl border-2 p-4 cursor-pointer transition-all ${result.selected ? "border-teal-500 bg-teal-50 shadow-md ring-2 ring-teal-200" : `${cfg.bg} hover:shadow-md`}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span>{cfg.icon}</span>
            <span className={`text-xs font-bold uppercase tracking-wide ${cfg.color}`}>{result.type}</span>
            {result.selected && <span className="text-xs font-bold text-teal-700 bg-teal-200 px-2 py-0.5 rounded-full">{"\u2713"} Selected</span>}
          </div>
          <h4 className="font-bold text-slate-900 mt-1">{result.title}</h4>
          <p className="text-sm text-slate-500 mt-0.5">{result.subtitle}</p>
          {Object.keys(result.details).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {Object.entries(result.details).map(([k, v]) => (
                <span key={k} className="text-xs bg-white/80 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
                  <span className="font-semibold text-slate-500">{k}:</span> {v}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="text-xl font-black text-slate-900">${result.price}</p>
          <p className="text-xs text-slate-400">{result.currency}</p>
        </div>
      </div>
    </div>
  );
}

export default function AgentTripChatPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const sessionId = params.id as string;
  const clientName = searchParams.get("client") || "";
  const clientEmail = searchParams.get("email") || "";
  const quickNotes = searchParams.get("notes") || "";
  const isHybrid = searchParams.get("hybrid") === "1";

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState(quickNotes ? `I need to plan a trip for my client${clientName ? ` ${clientName}` : ""}. ${quickNotes}` : "");
  const [loading, setLoading] = useState(false);
  const [allResults, setAllResults] = useState<SearchResult[]>([]);
  const [proposalOpen, setProposalOpen] = useState(false);
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
          messages: [
            { role: "system", content: AGENT_SYSTEM_PROMPT },
            ...newMessages,
          ],
          agent_mode: true,
          session_id: sessionId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.reply || data.content || data.message || "";
        const assistantMsg: Message = { role: "assistant", content };
        setMessages([...newMessages, assistantMsg]);

        // Parse results from the response
        const { results } = parseResults(content);
        if (results.length > 0) {
          setAllResults((prev) => [...prev, ...results]);
        }
      }
    } catch {}
    setLoading(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const createProposal = async () => {
    if (selectedResults.length === 0) return;
    // TODO: Create proposal with selected items
    alert(`Proposal created with ${selectedResults.length} items for ${clientName || "client"}!`);
  };

  // Render message content, extracting results into cards
  const renderMessage = (msg: Message, idx: number) => {
    if (msg.role === "user") {
      return (
        <div key={idx} className="flex justify-end">
          <div className="bg-slate-900 text-white rounded-2xl rounded-br-md px-4 py-3 max-w-[75%] text-sm">{msg.content}</div>
        </div>
      );
    }

    const { text, results } = parseResults(msg.content);
    return (
      <div key={idx} className="flex gap-3">
        <Image src="/agents/lina.png" alt="Lina" width={36} height={36} className="w-9 h-9 rounded-full shrink-0 mt-1" />
        <div className="flex-1 space-y-3">
          {text && (
            <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-slate-100 text-sm text-slate-700 whitespace-pre-wrap">{text}</div>
          )}
          {results.length > 0 && (
            <div className="space-y-2">
              {results.map((r) => {
                const tracked = allResults.find((a) => a.id === r.id) || r;
                return <ResultCard key={r.id} result={tracked} onToggle={() => toggleResult(r.id)} />;
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-[#F3F6FB] flex">
      {/* Chat Panel */}
      <div className="flex-1 flex flex-col max-h-screen">
        {/* Top Bar */}
        <div className="bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Link href="/agent/trip-search" className="text-slate-400 hover:text-slate-600 text-sm font-bold">{"\u2190"}</Link>
            <Image src="/agents/lina.png" alt="Lina" width={32} height={32} className="w-8 h-8 rounded-full" />
            <div>
              <h2 className="text-sm font-black text-slate-900">Lina AI {isHybrid ? "(Hybrid)" : "(Chat)"}</h2>
              <p className="text-xs text-slate-400">Agent Trip Search {clientName ? `\u00B7 Client: ${clientName}` : ""}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selectedResults.length > 0 && (
              <button onClick={() => setProposalOpen(!proposalOpen)} className="px-4 py-2 bg-gradient-to-r from-teal-600 to-violet-600 text-white text-xs font-bold rounded-xl hover:opacity-90 transition-opacity flex items-center gap-1.5">
                {"\uD83D\uDCCB"} Proposal ({selectedResults.length})
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <Image src="/agents/lina.png" alt="Lina" width={80} height={80} className="mx-auto rounded-full mb-4" />
              <h3 className="text-lg font-black text-slate-900">Trip Search with Lina</h3>
              <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
                Describe your client&apos;s trip and I&apos;ll search flights, hotels, and activities. Click on results to add them to your proposal.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {[
                  "All-inclusive Cancun, 2 adults, June 14-21",
                  "Europe tour: Paris + Rome + Barcelona, 10 days, family of 4",
                  "Luxury honeymoon Maldives, 7 nights, overwater villa",
                  "Caribbean cruise, 7 nights, departing Miami, November",
                ].map((suggestion) => (
                  <button key={suggestion} onClick={() => setInput(suggestion)} className="text-xs bg-white border border-slate-200 text-slate-600 px-3 py-2 rounded-xl hover:bg-teal-50 hover:border-teal-300 transition-colors">
                    {suggestion}
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
            <button onClick={sendMessage} disabled={!input.trim() || loading} className="px-5 py-3 bg-gradient-to-r from-teal-600 to-violet-600 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-40 transition-opacity shrink-0">
              {loading ? "\u23F3" : "Search"}
            </button>
          </div>
        </div>
      </div>

      {/* Proposal Sidebar */}
      {proposalOpen && (
        <div className="w-80 border-l border-slate-200 bg-white flex flex-col max-h-screen shrink-0">
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
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
            {selectedResults.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">Click on search results to add them to the proposal.</p>
            ) : (
              <>
                {["flight", "hotel", "activity", "transfer", "cruise"].map((type) => {
                  const items = selectedResults.filter((r) => r.type === type);
                  if (items.length === 0) return null;
                  const cfg = TYPE_CONFIG[type];
                  return (
                    <div key={type}>
                      <p className={`text-xs font-bold uppercase tracking-wide ${cfg.color} mb-1`}>{cfg.icon} {type}s ({items.length})</p>
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 mb-1 text-xs">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-800 truncate">{item.title}</p>
                            <p className="text-slate-400 truncate">{item.subtitle}</p>
                          </div>
                          <div className="text-right shrink-0 ml-2">
                            <p className="font-bold text-slate-900">${item.price}</p>
                            <button onClick={() => toggleResult(item.id)} className="text-red-500 hover:text-red-700 text-[10px] font-bold">{"\u2715"} Remove</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </>
            )}
          </div>
          {selectedResults.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-100">
              <div className="flex justify-between text-sm mb-3">
                <span className="font-bold text-slate-700">Total Estimate</span>
                <span className="font-black text-teal-700">${selectedResults.reduce((s, r) => s + parseFloat(r.price || "0"), 0).toLocaleString()} {selectedResults[0]?.currency || "CAD"}</span>
              </div>
              <button onClick={createProposal} className="w-full py-3 bg-gradient-to-r from-teal-600 to-violet-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-sm">
                Create Proposal {"\u2192"}
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
