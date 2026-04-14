"use client";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../../../src/lib/authStore";

interface Message { id: string; role: "user" | "kai"; text: string; time: string; }

const QUICK_ACTIONS = [
  { label: "Revenue report", icon: "💹", prompt: "Show me today's revenue intelligence report" },
  { label: "Margin analysis", icon: "📊", prompt: "Analyze margins by product type" },
  { label: "Top routes", icon: "✈️", prompt: "Show top performing routes and destinations" },
  { label: "Pricing optimization", icon: "💰", prompt: "Suggest pricing optimizations" },
  { label: "Revenue forecast", icon: "📈", prompt: "Show revenue forecast for this quarter" },
  { label: "Low-margin alerts", icon: "⚠️", prompt: "Show low-margin deal alerts" },
];

export default function KaiPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", role: "kai", text: "Hey! I'm Kai, your Revenue Intelligence agent. I analyze margins, identify top routes, optimize pricing, and forecast revenue. I send daily reports at 7am and alert in real-time on low-margin deals. What would you like to know?", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  const send = async (text: string) => {
    if (!text.trim()) return;
    setMessages((p) => [...p, { id: Date.now().toString(), role: "user", text: text.trim(), time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    setInput(""); setTyping(true);
    await new Promise((r) => setTimeout(r, 1000 + Math.random() * 800));
    setTyping(false);
    setMessages((p) => [...p, { id: (Date.now() + 1).toString(), role: "kai", text: genKai(text), time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50/20">
      <div className="flex-shrink-0 bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg">
        <div className="px-6 py-4 flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white/30">
              <img src="/agents/kai.png" alt="Kai" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
          </div>
          <div className="flex-1"><h1 className="text-lg font-bold">Kai</h1><p className="text-sky-200 text-xs">Revenue Intelligence · Daily 7am + Real-time</p></div>
          <div className="bg-white/15 rounded-xl px-3 py-1.5 text-xs font-medium border border-white/20"><span className="inline-block w-2 h-2 bg-emerald-400 rounded-full mr-1.5 animate-pulse" />LIVE</div>
        </div>
        <div className="px-6 pb-3 flex gap-4 text-xs">
          <span className="bg-white/10 rounded-lg px-3 py-1 border border-white/10">Revenue MTD: $184K</span>
          <span className="bg-white/10 rounded-lg px-3 py-1 border border-white/10">Avg Margin: 18.2%</span>
          <span className="bg-white/10 rounded-lg px-3 py-1 border border-white/10">Best Route: Cuba</span>
          <span className="bg-white/10 rounded-lg px-3 py-1 border border-white/10">Forecast: $412K/Q</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[70%]">
              {msg.role === "kai" && <div className="flex items-center gap-2 mb-1"><span className="text-xs font-semibold text-sky-600">Kai</span><span className="text-[10px] text-slate-400">{msg.time}</span></div>}
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${msg.role === "user" ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-br-md" : "bg-white border border-slate-200 text-slate-800 rounded-bl-md shadow-sm"}`}>{msg.text}</div>
              {msg.role === "user" && <div className="text-right mt-1"><span className="text-[10px] text-slate-400">{msg.time}</span></div>}
            </div>
          </div>
        ))}
        {typing && <div className="flex justify-start"><div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm"><div className="flex gap-1.5"><span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" /><span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} /><span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} /></div></div></div>}
        <div ref={bottomRef} />
      </div>
      <div className="flex-shrink-0 px-6 py-2 border-t border-slate-100 bg-white/80 backdrop-blur-sm">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {QUICK_ACTIONS.map((a) => (<button key={a.label} onClick={() => send(a.prompt)} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-700 transition-all"><span>{a.icon}</span>{a.label}</button>))}
        </div>
      </div>
      <div className="flex-shrink-0 p-4 bg-white border-t border-slate-200">
        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-3">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Message Kai..." className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50" />
          <button type="submit" disabled={!input.trim() || typing} className="px-5 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-semibold text-sm shadow-lg disabled:opacity-50">Send</button>
        </form>
      </div>
    </div>
  );
}

function genKai(input: string): string {
  const l = input.toLowerCase();
  if (l.includes("revenue") && (l.includes("report") || l.includes("today"))) return "Revenue Intelligence — April 14, 2026:\n\n- Revenue today: $12,400 (3 bookings)\n- Revenue MTD: $184,700 (47 bookings)\n- Revenue target: $200,000 (92% achieved)\n- Days remaining: 16\n- Daily pace needed: $956/day (on track)\n\nTop bookings today:\n1. Greece group trip (15 pax) — $8,400\n2. Cuba all-inclusive (2 pax) — $2,200\n3. Cancun family package (4 pax) — $1,800\n\nProjection: Will hit $204,000 by month end (+2% above target).";
  if (l.includes("margin")) return "Margin Analysis by Product Type:\n\n1. Yacht Charters: 22.5% margin (highest)\n2. Custom Europe Packages: 19.8%\n3. Group Travel: 18.4%\n4. All-Inclusive Sun: 16.2%\n5. Cruises: 14.1%\n6. Flights-Only: 8.3% (lowest)\n\nOverall blended margin: 18.2%\n\nRecommendation: Push yacht charters and custom Europe packages — 25% higher margins than all-inclusive. Consider bundling flights with packages to improve flight-only margins.";
  if (l.includes("route") || l.includes("destination")) return "Top Performing Routes (Revenue):\n\n1. Montreal → Cuba (Varadero/Cayo Coco): $42,300\n2. Montreal → Mexico (Riviera Maya): $31,200\n3. Montreal → Greece (multi-city): $28,900\n4. Montreal → Dominican Republic: $24,100\n5. Montreal → Mediterranean Cruise: $18,400\n\nFastest growing:\n- Greece: +67% vs last month (group trip effect)\n- Croatia: +45% (new destination, high interest)\n- Portugal: +38% (trending on social media)\n\nDeclining: Cuba (-12% vs last year). Consider refreshing Cuba promotions.";
  if (l.includes("pricing") || l.includes("optimization")) return "Pricing Optimization Suggestions:\n\n1. Cuba All-Inclusive ($899): Competitor at $849 — match to $849 or add value (free transfer)\n2. Greece Group Package: Currently $4,200/person — demand is high, test $4,500 (+7%)\n3. Cruise packages: Add shore excursion bundle for +$200 margin per booking\n4. Family packages: Add kids-eat-free positioning — no cost impact, increases conversion\n\nEstimated impact: +$8,200/month in additional margin if all implemented.\n\nWant me to model any of these scenarios in detail?";
  if (l.includes("forecast")) return "Revenue Forecast — Q2 2026:\n\n- April: $204,000 (projected, 92% confidence)\n- May: $228,000 (high season starts, +12%)\n- June: $267,000 (peak booking month, +17%)\n\nQ2 Total: $699,000 (vs Q1: $412,000 = +70%)\n\nKey drivers:\n- Summer Europe season bookings\n- Group trip to Greece (October departure, booking now)\n- 3 new agents onboarding (Jade reports)\n- Increased lead flow from Marco's scraping\n\nRisk: If Cuba demand continues declining, adjust forecast -$15K.";
  if (l.includes("low-margin") || l.includes("alert")) return "Low-Margin Deal Alerts:\n\n1. Booking #4815: Flight-only to Paris — 4.2% margin ($38 profit)\n   Action: Suggest adding hotel bundle to client\n\n2. Booking #4812: Last-minute Cuba — 8.1% margin ($89 profit)\n   Note: Promo pricing, acceptable for volume\n\n3. Quote in progress: Group of 8 to Thailand — margin calculated at 11%\n   Action: Negotiate supplier rate or add excursion package\n\nNo critical alerts. All bookings above minimum 4% threshold.";
  return "I track revenue intelligence across all bookings. Ask me about revenue reports, margin analysis, top routes, pricing optimization, forecasts, or low-margin alerts!";
}
