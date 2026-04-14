"use client";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../../../src/lib/authStore";

interface Message { id: string; role: "user" | "leo"; text: string; time: string; }

const QUICK_ACTIONS = [
  { label: "Conversion report", icon: "📊", prompt: "Show me conversion analytics for this month" },
  { label: "Pipeline velocity", icon: "⚡", prompt: "What's our current pipeline velocity?" },
  { label: "Agent ROI", icon: "💰", prompt: "Show agent ROI rankings" },
  { label: "Client LTV", icon: "👥", prompt: "Show top clients by lifetime value" },
  { label: "Funnel analysis", icon: "🔍", prompt: "Analyze our sales funnel for drop-offs" },
  { label: "Weekly insights", icon: "💡", prompt: "Give me this week's key insights" },
];

export default function LeoPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", role: "leo", text: "Hi, I'm Leo — your Analytics agent. I track conversions, pipeline velocity, agent ROI, and client lifetime value in real-time. I feed insights back to all agents so they can make smarter decisions. What numbers do you want to see?", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
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
    setMessages((p) => [...p, { id: (Date.now() + 1).toString(), role: "leo", text: genLeo(text), time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/20">
      <div className="flex-shrink-0 bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg">
        <div className="px-6 py-4 flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white/30">
              <img src="/agents/leo.png" alt="Leo" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
          </div>
          <div className="flex-1"><h1 className="text-lg font-bold">Leo</h1><p className="text-violet-200 text-xs">Analytics · Real-time Intelligence</p></div>
          <div className="bg-white/15 rounded-xl px-3 py-1.5 text-xs font-medium border border-white/20"><span className="inline-block w-2 h-2 bg-emerald-400 rounded-full mr-1.5 animate-pulse" />Active</div>
        </div>
        <div className="px-6 pb-3 flex gap-4 text-xs">
          <span className="bg-white/10 rounded-lg px-3 py-1 border border-white/10">Conversion: 12.4%</span>
          <span className="bg-white/10 rounded-lg px-3 py-1 border border-white/10">Pipeline: $347K</span>
          <span className="bg-white/10 rounded-lg px-3 py-1 border border-white/10">Avg LTV: $4,200</span>
          <span className="bg-white/10 rounded-lg px-3 py-1 border border-white/10">Updated: Now</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[70%]">
              {msg.role === "leo" && <div className="flex items-center gap-2 mb-1"><span className="text-xs font-semibold text-violet-600">Leo</span><span className="text-[10px] text-slate-400">{msg.time}</span></div>}
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${msg.role === "user" ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-br-md" : "bg-white border border-slate-200 text-slate-800 rounded-bl-md shadow-sm"}`}>{msg.text}</div>
              {msg.role === "user" && <div className="text-right mt-1"><span className="text-[10px] text-slate-400">{msg.time}</span></div>}
            </div>
          </div>
        ))}
        {typing && <div className="flex justify-start"><div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm"><div className="flex gap-1.5"><span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" /><span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} /><span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} /></div></div></div>}
        <div ref={bottomRef} />
      </div>
      <div className="flex-shrink-0 px-6 py-2 border-t border-slate-100 bg-white/80 backdrop-blur-sm">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {QUICK_ACTIONS.map((a) => (<button key={a.label} onClick={() => send(a.prompt)} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-violet-50 hover:border-violet-300 hover:text-violet-700 transition-all"><span>{a.icon}</span>{a.label}</button>))}
        </div>
      </div>
      <div className="flex-shrink-0 p-4 bg-white border-t border-slate-200">
        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-3">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Message Leo..." className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-slate-50" />
          <button type="submit" disabled={!input.trim() || typing} className="px-5 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-semibold text-sm shadow-lg disabled:opacity-50">Send</button>
        </form>
      </div>
    </div>
  );
}

function genLeo(input: string): string {
  const l = input.toLowerCase();
  if (l.includes("conversion")) return "Conversion Analytics — April 2026:\n\n- Lead → Contact: 67% (industry: 45%)\n- Contact → Proposal: 34% (industry: 22%)\n- Proposal → Booking: 28% (industry: 15%)\n- Overall: 12.4% lead-to-booking\n\nTop converting channels:\n1. Lina chat widget: 18.2%\n2. Phone inquiries: 15.7%\n3. Email campaigns (Sofia): 9.3%\n4. Social media (Mia): 6.1%\n\nConversion is up 3.2% from last month. Lina's chat widget is your best performer.";
  if (l.includes("pipeline") || l.includes("velocity")) return "Pipeline Velocity Report:\n\n- Total pipeline value: $347,200\n- Average deal size: $3,840\n- Avg days to close: 8.3 days\n- Deals in pipeline: 91\n\nStage breakdown:\n- Inquiry: 34 deals ($89K)\n- Proposal sent: 28 deals ($112K)\n- Negotiation: 18 deals ($98K)\n- Ready to book: 11 deals ($48K)\n\nVelocity improved 12% this month. Proposals convert faster when sent within 2 hours of inquiry.";
  if (l.includes("agent roi") || l.includes("ranking")) return "Agent ROI Rankings (April):\n\n1. Marie-Claude — $45,200 revenue, 12 bookings (ROI: 892%)\n2. Patrick — $38,700 revenue, 9 bookings (ROI: 764%)\n3. Isabelle — $31,400 revenue, 8 bookings (ROI: 621%)\n4. Jean-Francois — $28,900 revenue, 7 bookings (ROI: 571%)\n5. Nathalie — $22,100 revenue, 6 bookings (ROI: 437%)\n\nTop performer: Marie-Claude. She converts 2x faster than average.";
  if (l.includes("ltv") || l.includes("lifetime")) return "Top Clients by Lifetime Value:\n\n1. Famille Tremblay — $24,800 (6 trips, 3 years)\n2. Martin & Sophie D. — $18,200 (4 trips, 2 years)\n3. Groupe Lavoie — $15,600 (2 group trips)\n4. Catherine B. — $12,400 (3 trips, repeat yearly)\n5. Jean-Pierre M. — $11,200 (3 trips)\n\nAverage client LTV: $4,200\nRepeat booking rate: 34%\nReferral rate: 22%";
  if (l.includes("funnel") || l.includes("drop")) return "Funnel Drop-off Analysis:\n\nBiggest drop-offs:\n1. Website visit → Lead capture: 92% drop (normal for travel)\n2. Lead capture → First response: 8% drop (Lina handles instantly)\n3. Proposal sent → Client views: 15% drop (improve email subject lines)\n4. Proposal viewed → Booking: 72% drop (main opportunity area)\n\nRecommendation: Focus on proposal-to-booking conversion. Adding urgency elements and limited-time pricing could improve this by 10-15%.";
  if (l.includes("insight") || l.includes("weekly")) return "This Week's Key Insights:\n\n1. Cuba packages are your #1 seller (34% of bookings)\n2. Wednesday is your highest conversion day\n3. Leads contacted within 5 min convert 3x better\n4. Mobile traffic is 68% — ensure proposals look great on mobile\n5. Repeat clients book 40% larger packages than first-timers\n\nAction items I've shared with the team:\n- Sofia: prioritize Cuba-interested leads\n- Lina: emphasize Cuba in widget responses\n- Marco: focus scraping on Cuba-related travel intent";
  return "I can show you conversions, pipeline velocity, agent ROI, client lifetime value, funnel analysis, or weekly insights. What would you like to analyze?";
}
