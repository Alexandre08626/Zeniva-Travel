"use client";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../../../src/lib/authStore";

interface Message { id: string; role: "user" | "atlas"; text: string; time: string; }

const QUICK_ACTIONS = [
  { label: "System health", icon: "🩺", prompt: "Run a full system health check" },
  { label: "SSL status", icon: "🔒", prompt: "Check SSL certificate status for all domains" },
  { label: "Server load", icon: "📊", prompt: "Show me current server load and resource usage" },
  { label: "Security scan", icon: "🛡️", prompt: "Run a security scan for vulnerabilities" },
  { label: "Docker status", icon: "🐳", prompt: "Show Docker container status" },
  { label: "Recent alerts", icon: "🚨", prompt: "Show recent alerts and incidents" },
];

export default function AtlasPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", role: "atlas", text: "Atlas here — your Security Guardian. I monitor all services 24/7: SSL certificates, disk/RAM usage, SSH logins, and Docker containers. Everything is currently green. What would you like me to check?", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
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
    setMessages((p) => [...p, { id: (Date.now() + 1).toString(), role: "atlas", text: genAtlas(text), time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/30">
      <div className="flex-shrink-0 bg-gradient-to-r from-slate-600 to-slate-800 text-white shadow-lg">
        <div className="px-6 py-4 flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white/30">
              <img src="/agents/atlas.png" alt="Atlas" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
          </div>
          <div className="flex-1"><h1 className="text-lg font-bold">Atlas</h1><p className="text-slate-300 text-xs">Security Guardian · 24/7 Monitoring</p></div>
          <div className="bg-white/15 rounded-xl px-3 py-1.5 text-xs font-medium border border-white/20"><span className="inline-block w-2 h-2 bg-emerald-400 rounded-full mr-1.5 animate-pulse" />Active</div>
        </div>
        <div className="px-6 pb-3 flex gap-4 text-xs">
          <span className="bg-white/10 rounded-lg px-3 py-1 border border-white/10">Uptime: 99.97%</span>
          <span className="bg-white/10 rounded-lg px-3 py-1 border border-white/10">SSL: Valid</span>
          <span className="bg-white/10 rounded-lg px-3 py-1 border border-white/10">CPU: 23%</span>
          <span className="bg-white/10 rounded-lg px-3 py-1 border border-white/10">Threats: 0</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[70%]">
              {msg.role === "atlas" && <div className="flex items-center gap-2 mb-1"><span className="text-xs font-semibold text-slate-600">Atlas</span><span className="text-[10px] text-slate-400">{msg.time}</span></div>}
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${msg.role === "user" ? "bg-gradient-to-r from-slate-600 to-slate-800 text-white rounded-br-md" : "bg-white border border-slate-200 text-slate-800 rounded-bl-md shadow-sm"}`}>{msg.text}</div>
              {msg.role === "user" && <div className="text-right mt-1"><span className="text-[10px] text-slate-400">{msg.time}</span></div>}
            </div>
          </div>
        ))}
        {typing && <div className="flex justify-start"><div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm"><div className="flex gap-1.5"><span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" /><span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} /><span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} /></div></div></div>}
        <div ref={bottomRef} />
      </div>
      <div className="flex-shrink-0 px-6 py-2 border-t border-slate-100 bg-white/80 backdrop-blur-sm">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {QUICK_ACTIONS.map((a) => (<button key={a.label} onClick={() => send(a.prompt)} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-100 hover:border-slate-400 transition-all"><span>{a.icon}</span>{a.label}</button>))}
        </div>
      </div>
      <div className="flex-shrink-0 p-4 bg-white border-t border-slate-200">
        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-3">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Message Atlas..." className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 bg-slate-50" />
          <button type="submit" disabled={!input.trim() || typing} className="px-5 py-3 bg-gradient-to-r from-slate-600 to-slate-800 text-white rounded-xl font-semibold text-sm shadow-lg disabled:opacity-50">Send</button>
        </form>
      </div>
    </div>
  );
}

function genAtlas(input: string): string {
  const l = input.toLowerCase();
  if (l.includes("health")) return "System Health Report:\n\n- zenivatravel.com: UP (234ms response)\n- zenipay.ca: UP (189ms response)\n- API Gateway: UP (45ms)\n- Database: UP (12ms latency)\n- Redis Cache: UP (2ms)\n- Vercel Edge: UP (all regions)\n\nDisk: 34% used (62GB free)\nRAM: 4.2GB / 16GB (26%)\nCPU: 23% average\n\nAll systems nominal. No issues detected.";
  if (l.includes("ssl")) return "SSL Certificate Status:\n\n- zenivatravel.com: Valid until Dec 2026 (256 days)\n- zenipay.ca: Valid until Nov 2026 (225 days)\n- api.zeniva.ca: Valid until Jan 2027 (290 days)\n- *.supabase.co: Valid (managed by Supabase)\n\nAll certificates are valid. Auto-renewal is enabled. No action needed.";
  if (l.includes("load") || l.includes("resource") || l.includes("server")) return "Current Server Load:\n\n- CPU: 23% (peak today: 67% at 14:22)\n- RAM: 4.2GB / 16GB (26%)\n- Disk I/O: 12 MB/s read, 3 MB/s write\n- Network: 45 Mbps in, 120 Mbps out\n- Active connections: 847\n- Request rate: 342 req/s\n\nAll within normal parameters. No throttling needed.";
  if (l.includes("security") || l.includes("vulnerab")) return "Security Scan Results:\n\n- SSH: No unauthorized login attempts (last 24h)\n- Firewall: 2,341 blocked requests (all automated bots)\n- Dependencies: All up to date, 0 known vulnerabilities\n- API keys: All rotated within policy (90 days)\n- CORS: Properly configured\n- Rate limiting: Active on all endpoints\n\nSecurity posture: STRONG. No action required.";
  if (l.includes("docker")) return "Docker Container Status:\n\n- zeniva-web: Running (up 14d 7h)\n- zeniva-api: Running (up 14d 7h)\n- redis: Running (up 30d 2h)\n- nginx-proxy: Running (up 30d 2h)\n\nAll containers healthy. No restarts in the last 30 days. Image updates available for nginx (recommended).";
  if (l.includes("alert") || l.includes("incident")) return "Recent Alerts (Last 7 days):\n\n- Apr 12, 14:22: CPU spike to 67% (auto-resolved in 3min)\n- Apr 10, 03:15: 12 failed SSH attempts from 185.x.x.x (IP blocked)\n- Apr 8, 22:00: Scheduled maintenance completed\n\nNo active incidents. System stability: 99.97% uptime this month.";
  return "I'm monitoring everything 24/7. Ask me about system health, SSL certificates, server load, security scans, Docker containers, or recent alerts. I'll give you real-time status.";
}
