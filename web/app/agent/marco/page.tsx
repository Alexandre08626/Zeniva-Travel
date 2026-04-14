"use client";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../../../src/lib/authStore";

interface Message {
  id: string;
  role: "user" | "marco";
  text: string;
  time: string;
}

const QUICK_ACTIONS = [
  { label: "Scan Reddit now", icon: "🔍", prompt: "Run a Reddit scan for travel leads right now" },
  { label: "Competitor check", icon: "🕵️", prompt: "Check competitor sites for new deals we can beat" },
  { label: "SEO keywords", icon: "📈", prompt: "Show me top SEO intent keywords for travel leads" },
  { label: "Lead quality report", icon: "📊", prompt: "Give me a quality breakdown of recent leads" },
  { label: "Social signals", icon: "📱", prompt: "Show social media signals for travel intent" },
  { label: "Deep web scan", icon: "🌐", prompt: "Run a deep web scan for untapped lead sources" },
];

export default function MarcoPage() {
  const user = useAuthStore((s) => s.user);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "marco",
      text: "Hey boss! I'm Marco, your Lead Hunter. I run 5 scraping engines 24/7: Reddit, competitor sites, social signals, SEO intent, and deep web. I find the leads before they even know they need a travel agent. What do you want me to hunt down?",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", text: text.trim(), time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);
    await new Promise((r) => setTimeout(r, 1000 + Math.random() * 1000));
    const marcoMsg: Message = { id: (Date.now() + 1).toString(), role: "marco", text: generateMarcoResponse(text), time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setTyping(false);
    setMessages((prev) => [...prev, marcoMsg]);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-white to-red-50/20">
      {/* Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg">
        <div className="px-6 py-4 flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white/30">
              <img src="/agents/marco.png" alt="Marco" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold">Marco</h1>
            <p className="text-red-100 text-xs">Lead Hunter · 5-Engine Scraper · Every 2h</p>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-xl px-3 py-1.5 text-xs font-medium border border-white/20">
            <span className="inline-block w-2 h-2 bg-emerald-400 rounded-full mr-1.5 animate-pulse" />Active
          </div>
        </div>
        <div className="px-6 pb-3 flex gap-4 text-xs">
          <span className="bg-white/10 rounded-lg px-3 py-1 border border-white/10">Leads Found: 156</span>
          <span className="bg-white/10 rounded-lg px-3 py-1 border border-white/10">Qualified: 89</span>
          <span className="bg-white/10 rounded-lg px-3 py-1 border border-white/10">Sources: 5 engines</span>
          <span className="bg-white/10 rounded-lg px-3 py-1 border border-white/10">Last Scan: 12min ago</span>
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[70%]">
              {msg.role === "marco" && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-red-600">Marco</span>
                  <span className="text-[10px] text-slate-400">{msg.time}</span>
                </div>
              )}
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${msg.role === "user" ? "bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-br-md" : "bg-white border border-slate-200 text-slate-800 rounded-bl-md shadow-sm"}`}>
                {msg.text}
              </div>
              {msg.role === "user" && <div className="text-right mt-1"><span className="text-[10px] text-slate-400">{msg.time}</span></div>}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Actions */}
      <div className="flex-shrink-0 px-6 py-2 border-t border-slate-100 bg-white/80 backdrop-blur-sm">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {QUICK_ACTIONS.map((a) => (
            <button key={a.label} onClick={() => send(a.prompt)} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all">
              <span>{a.icon}</span>{a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="flex-shrink-0 p-4 bg-white border-t border-slate-200">
        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-3">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Message Marco..." className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-slate-50" />
          <button type="submit" disabled={!input.trim() || typing} className="px-5 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-red-500/25 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">Send</button>
        </form>
      </div>
    </div>
  );
}

function generateMarcoResponse(input: string): string {
  const l = input.toLowerCase();
  if (l.includes("reddit")) return "Scanning Reddit now...\n\nFound 8 new posts in r/travel, r/solotravel, and r/honeymoonplanning:\n\n1. \"Planning a trip to Greece in October\" — r/travel (2h ago)\n2. \"Best all-inclusive in Riviera Maya?\" — r/travel (4h ago)\n3. \"Honeymoon in Santorini budget?\" — r/honeymoonplanning (6h ago)\n4. \"Family cruise recommendations\" — r/travel (8h ago)\n5. \"Cuba resort suggestions\" — r/travel (12h ago)\n\n3 already qualified and pushed to Sofia for outreach. Want me to adjust my subreddit list?";
  if (l.includes("competitor")) return "Competitor scan complete:\n\n- VoyagesRebecca.com: New Cuba promo $849 (we're at $899 — recommend matching)\n- TravelPlus.ca: Pushing Mediterranean cruises hard\n- FlightCentre: 20% off Europe early bird\n\nI spotted 12 leads asking questions on competitor review pages. 5 look high-intent. Want me to send them to Sofia for outreach?";
  if (l.includes("seo") || l.includes("keyword")) return "Top SEO intent keywords this week:\n\n1. \"cheap flights to cancun 2026\" — 2,400 searches\n2. \"all inclusive cuba deals\" — 1,800 searches\n3. \"mediterranean cruise packages\" — 1,500 searches\n4. \"family vacation packages 2026\" — 1,200 searches\n5. \"best travel agent near me\" — 890 searches\n\nI'm tracking 47 keywords total. 3 new high-intent keywords added this week.";
  if (l.includes("quality") || l.includes("breakdown")) return "Lead quality breakdown (last 7 days):\n\n- Hot (ready to book): 12 leads (13%)\n- Warm (researching): 34 leads (38%)\n- Cool (browsing): 28 leads (31%)\n- Cold (low intent): 15 leads (17%)\n\nBest sources: Reddit (42% hot rate), SEO (38%), Competitors (25%), Social (18%), Deep web (12%)";
  if (l.includes("social")) return "Social signals detected:\n\n- 15 Instagram posts tagged #dreamvacation2026 from Montreal area\n- 8 Facebook travel group discussions about group trips\n- 4 TikTok travel planning videos mentioning budget concerns\n- 3 Twitter threads asking for travel agent recommendations\n\n6 profiles matched to existing leads. 9 new potential leads identified.";
  if (l.includes("deep web")) return "Deep web scan running...\n\nSources checked: travel forums, wedding planning sites, expat communities, corporate travel boards.\n\nFound 7 new leads:\n- 3 from wedding planning forums (honeymoon intent)\n- 2 from expat communities (visiting family = flight bookings)\n- 2 from corporate travel boards (business travel)\n\nAll pushed to the pipeline. Quality score: 78% average.";
  return "On it! I can scan any of my 5 engines for you: Reddit, competitor sites, social signals, SEO keywords, or deep web. Just tell me what you're looking for and I'll hunt it down!";
}
