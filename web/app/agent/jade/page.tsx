"use client";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../../../src/lib/authStore";

interface Message { id: string; role: "user" | "jade"; text: string; time: string; }

const QUICK_ACTIONS = [
  { label: "Onboarding status", icon: "🎓", prompt: "Show me current agent onboarding progress" },
  { label: "Performance scores", icon: "⭐", prompt: "Show agent performance scores" },
  { label: "Reactivation list", icon: "🔄", prompt: "Show dormant agents that need reactivation" },
  { label: "Coaching tips", icon: "💡", prompt: "Generate coaching tips for underperforming agents" },
  { label: "Leaderboard", icon: "🏆", prompt: "Show the agent leaderboard" },
  { label: "Welcome sequence", icon: "👋", prompt: "Create a welcome sequence for a new agent" },
];

export default function JadePage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", role: "jade", text: "Hi! I'm Jade, your Agent Success & Onboarding specialist. I help new agents get started, track performance, and coach your team to sell more. I also reactivate agents who've gone quiet. How can I help your team today?", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
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
    setMessages((p) => [...p, { id: (Date.now() + 1).toString(), role: "jade", text: genJade(text), time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/20">
      <div className="flex-shrink-0 bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg">
        <div className="px-6 py-4 flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white/30">
              <img src="/agents/jade.png" alt="Jade" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
          </div>
          <div className="flex-1"><h1 className="text-lg font-bold">Jade</h1><p className="text-emerald-100 text-xs">Agent Success & Onboarding · Daily</p></div>
          <div className="bg-white/15 rounded-xl px-3 py-1.5 text-xs font-medium border border-white/20"><span className="inline-block w-2 h-2 bg-emerald-400 rounded-full mr-1.5 animate-pulse" />LIVE</div>
        </div>
        <div className="px-6 pb-3 flex gap-4 text-xs">
          <span className="bg-white/10 rounded-lg px-3 py-1 border border-white/10">Active Agents: 24</span>
          <span className="bg-white/10 rounded-lg px-3 py-1 border border-white/10">Onboarding: 3</span>
          <span className="bg-white/10 rounded-lg px-3 py-1 border border-white/10">Dormant: 5</span>
          <span className="bg-white/10 rounded-lg px-3 py-1 border border-white/10">Avg Score: 78%</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[70%]">
              {msg.role === "jade" && <div className="flex items-center gap-2 mb-1"><span className="text-xs font-semibold text-emerald-600">Jade</span><span className="text-[10px] text-slate-400">{msg.time}</span></div>}
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${msg.role === "user" ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-br-md" : "bg-white border border-slate-200 text-slate-800 rounded-bl-md shadow-sm"}`}>{msg.text}</div>
              {msg.role === "user" && <div className="text-right mt-1"><span className="text-[10px] text-slate-400">{msg.time}</span></div>}
            </div>
          </div>
        ))}
        {typing && <div className="flex justify-start"><div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm"><div className="flex gap-1.5"><span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" /><span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} /><span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} /></div></div></div>}
        <div ref={bottomRef} />
      </div>
      <div className="flex-shrink-0 px-6 py-2 border-t border-slate-100 bg-white/80 backdrop-blur-sm">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {QUICK_ACTIONS.map((a) => (<button key={a.label} onClick={() => send(a.prompt)} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-all"><span>{a.icon}</span>{a.label}</button>))}
        </div>
      </div>
      <div className="flex-shrink-0 p-4 bg-white border-t border-slate-200">
        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-3">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Message Jade..." className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50" />
          <button type="submit" disabled={!input.trim() || typing} className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl font-semibold text-sm shadow-lg disabled:opacity-50">Send</button>
        </form>
      </div>
    </div>
  );
}

function genJade(input: string): string {
  const l = input.toLowerCase();
  if (l.includes("onboarding") || l.includes("progress")) return "Current Onboarding Progress:\n\n1. Sophie Martin (Travel Agent) — Step 4/7\n   - Account created, profile set, training started\n   - Next: Complete product catalog training\n   - ETA: 2 days\n\n2. David Chen (Yacht Broker) — Step 2/7\n   - Account created\n   - Next: Profile setup & yacht inventory training\n   - ETA: 5 days\n\n3. Camille Roy (Influencer) — Step 6/7\n   - Almost done! Final: activate referral link\n   - ETA: Tomorrow\n\nAll on track. I'll send reminders to David — he hasn't logged in for 48h.";
  if (l.includes("performance") || l.includes("score")) return "Agent Performance Scores (April):\n\n1. Marie-Claude J. — 95% (Top Performer)\n   Bookings: 12 | Revenue: $45,200 | Response time: 1.2h\n\n2. Patrick J. — 88%\n   Bookings: 9 | Revenue: $38,700 | Response time: 2.1h\n\n3. Isabelle C. — 82%\n   Bookings: 8 | Revenue: $31,400 | Response time: 1.8h\n\n4. Jean-Francois M. — 74%\n   Bookings: 7 | Revenue: $28,900 | Response time: 3.4h\n\n5. Nathalie B. — 68%\n   Bookings: 6 | Revenue: $22,100 | Response time: 4.2h\n\nTeam average: 78%. Jean-Francois and Nathalie could benefit from response time coaching.";
  if (l.includes("dormant") || l.includes("reactivat")) return "Dormant Agents (No activity >14 days):\n\n1. Alexandre T. — Last active: Mar 28 (17 days ago)\n   History: 3 bookings total, was promising\n   Action: Reactivation email sent yesterday, no reply yet\n\n2. Karine M. — Last active: Mar 22 (23 days ago)\n   History: 1 booking, struggled with platform\n   Action: Scheduled coaching call for this week\n\n3. Michel D. — Last active: Apr 1 (13 days ago)\n   History: 5 bookings, seasonal pattern\n   Action: Sending personalized win-back with new commission offer\n\nWant me to escalate any of these to a phone call?";
  if (l.includes("coaching") || l.includes("tips") || l.includes("underperform")) return "Coaching Tips for Underperformers:\n\nFor Nathalie (Response time: 4.2h):\n- Tip: Enable mobile notifications for new leads\n- Tip: Use Lina's pre-built proposal templates to respond faster\n- Data: Agents who respond within 1h convert 3x more\n\nFor Jean-Francois (Response time: 3.4h):\n- Tip: Set up auto-responses for after-hours inquiries\n- Tip: Batch process proposals in morning and afternoon blocks\n- Data: His conversion rate jumps to 22% when he responds within 2h\n\nI can send these tips as a personalized coaching email to each agent. Shall I?";
  if (l.includes("leaderboard")) return "Agent Leaderboard — April 2026:\n\n🥇 Marie-Claude J. — $45,200 revenue | 12 bookings\n🥈 Patrick J. — $38,700 revenue | 9 bookings\n🥉 Isabelle C. — $31,400 revenue | 8 bookings\n4. Jean-Francois M. — $28,900 | 7 bookings\n5. Nathalie B. — $22,100 | 6 bookings\n6. Stephanie R. — $18,400 | 5 bookings\n\nTotal team: $184,700 | 47 bookings\nMonthly target: $200,000 (92% achieved with 16 days left)\n\nOn track to hit target by April 22!";
  if (l.includes("welcome") || l.includes("sequence") || l.includes("new agent")) return "Welcome Sequence for New Agents:\n\nDay 1: Welcome email + platform access\nDay 2: Video tutorial: \"Your first 24h on Zeniva\"\nDay 3: Product catalog walkthrough\nDay 5: Live onboarding call (30min)\nDay 7: First lead assignment + Lina introduction\nDay 10: Check-in: \"How's your first week?\"\nDay 14: Performance review + coaching session\nDay 21: Full platform certification\nDay 30: First month performance report\n\nWant me to start this sequence for a new agent? Just give me their name and email.";
  return "I handle everything related to agent success: onboarding, performance tracking, coaching, reactivation, and leaderboards. What would you like to work on?";
}
