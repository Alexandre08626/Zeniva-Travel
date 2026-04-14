"use client";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../../../src/lib/authStore";

interface Message { id: string; role: "user" | "rex"; text: string; time: string; }

const QUICK_ACTIONS = [
  { label: "Daily health report", icon: "🩺", prompt: "Show me today's health report" },
  { label: "API monitoring", icon: "🔗", prompt: "Check all API endpoints status" },
  { label: "Bug detection", icon: "🐛", prompt: "Show detected bugs and errors" },
  { label: "Performance audit", icon: "⚡", prompt: "Run a performance audit" },
  { label: "Error logs", icon: "📋", prompt: "Show recent error logs" },
  { label: "Deploy status", icon: "🚀", prompt: "Show latest deployment status" },
];

export default function RexPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", role: "rex", text: "Hey! Rex here — your Platform Engineer. I monitor all APIs, detect bugs, send daily health reports, and optimize performance. Today's status: all systems green. What would you like me to check?", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
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
    setMessages((p) => [...p, { id: (Date.now() + 1).toString(), role: "rex", text: genRex(text), time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/20">
      <div className="flex-shrink-0 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg">
        <div className="px-6 py-4 flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white/30">
              <img src="/agents/rex.png" alt="Rex" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
          </div>
          <div className="flex-1"><h1 className="text-lg font-bold">Rex</h1><p className="text-emerald-200 text-xs">AI Platform Engineer · Daily Maintenance</p></div>
          <div className="bg-white/15 rounded-xl px-3 py-1.5 text-xs font-medium border border-white/20"><span className="inline-block w-2 h-2 bg-emerald-400 rounded-full mr-1.5 animate-pulse" />Active</div>
        </div>
        <div className="px-6 pb-3 flex gap-4 text-xs">
          <span className="bg-white/10 rounded-lg px-3 py-1 border border-white/10">APIs: All OK</span>
          <span className="bg-white/10 rounded-lg px-3 py-1 border border-white/10">Errors (24h): 2</span>
          <span className="bg-white/10 rounded-lg px-3 py-1 border border-white/10">Avg Response: 187ms</span>
          <span className="bg-white/10 rounded-lg px-3 py-1 border border-white/10">Last Deploy: 2h ago</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[70%]">
              {msg.role === "rex" && <div className="flex items-center gap-2 mb-1"><span className="text-xs font-semibold text-emerald-600">Rex</span><span className="text-[10px] text-slate-400">{msg.time}</span></div>}
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${msg.role === "user" ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-md" : "bg-white border border-slate-200 text-slate-800 rounded-bl-md shadow-sm"}`}>{msg.text}</div>
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
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Message Rex..." className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50" />
          <button type="submit" disabled={!input.trim() || typing} className="px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold text-sm shadow-lg disabled:opacity-50">Send</button>
        </form>
      </div>
    </div>
  );
}

function genRex(input: string): string {
  const l = input.toLowerCase();
  if (l.includes("health") || l.includes("daily")) return "Daily Health Report — April 14, 2026 (8:00 AM):\n\n- Web App: HEALTHY (234ms avg, 0 errors)\n- API Gateway: HEALTHY (45ms avg, 2 warnings)\n- Database: HEALTHY (12ms latency, 34% storage)\n- Auth Service: HEALTHY (89ms avg)\n- Payment API: HEALTHY (156ms avg)\n- CDN: HEALTHY (18ms global avg)\n\nOverall Score: 98/100\nUptime: 99.97% (30-day rolling)\n\nMinor: 2 slow queries detected in booking search (>500ms). Auto-optimized.";
  if (l.includes("api") || l.includes("endpoint")) return "API Endpoints Status:\n\n- /api/agents-proxy: OK (45ms)\n- /api/auth: OK (89ms)\n- /api/booking-requests: OK (156ms)\n- /api/commission-plans: OK (67ms)\n- /api/lina-chat: OK (234ms)\n- /api/payments: OK (123ms)\n- /api/trip-search: OK (312ms)\n- /api/influencer: OK (78ms)\n\nAll 23 endpoints responding normally. Rate limits: 0 breaches today.";
  if (l.includes("bug") || l.includes("error")) return "Bug Detection Report:\n\n- Critical: 0\n- High: 0\n- Medium: 1 (commission rounding edge case on yacht bookings)\n- Low: 3 (UI alignment issues on mobile Safari)\n\nAuto-fixed today:\n- Fixed stale cache on trip search results\n- Patched timezone offset in calendar events\n\nThe medium bug is tracked — commission calculations round to nearest cent but yacht commissions need 4 decimal precision. I can fix this automatically if you approve.";
  if (l.includes("performance") || l.includes("audit")) return "Performance Audit Results:\n\n- Lighthouse Score: 94/100 (Desktop), 87/100 (Mobile)\n- First Contentful Paint: 1.2s\n- Largest Contentful Paint: 2.1s\n- Total Blocking Time: 45ms\n- Cumulative Layout Shift: 0.02\n\nOptimization opportunities:\n1. Lazy-load agent avatars (save 340KB)\n2. Compress trip search API response (30% smaller)\n3. Add edge caching for static proposals\n\nEstimated improvement: +5 points on mobile Lighthouse.";
  if (l.includes("error log")) return "Recent Error Logs (Last 24h):\n\n[14:22] WARN — Slow query: trip_search took 523ms (threshold: 500ms)\n[09:15] WARN — Rate limit approach: 85% capacity on /api/lina-chat\n[03:41] INFO — Scheduled maintenance: cache purge completed\n[Yesterday 22:30] INFO — Auto-scaling triggered: +1 instance (traffic spike)\n\nNo critical errors. 2 warnings auto-resolved.";
  if (l.includes("deploy")) return "Latest Deployment:\n\n- Branch: main\n- Commit: \"fix: make commission fields read-only for non-HQ agents\"\n- Deployed: 2 hours ago via Vercel\n- Build time: 47s\n- Status: SUCCESS\n- Preview URL: Available\n\nAll checks passed: TypeScript, ESLint, build. No regressions detected in production monitoring.";
  return "I monitor everything technical: APIs, bugs, performance, deployments, and error logs. I send daily health reports at 8am and alert immediately on critical issues. What do you need?";
}
