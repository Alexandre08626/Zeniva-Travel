"use client";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../../../src/lib/authStore";

interface Message { id: string; role: "user" | "max"; text: string; time: string; }

const QUICK_ACTIONS = [
  { label: "Risk dashboard", icon: "🎯", prompt: "Show me the current risk dashboard" },
  { label: "Chargeback alerts", icon: "⚠️", prompt: "Show chargeback alerts and ratios" },
  { label: "Fraud patterns", icon: "🕵️", prompt: "Show detected fraud patterns" },
  { label: "AML compliance", icon: "📜", prompt: "Show AML compliance report" },
  { label: "Transaction review", icon: "🔍", prompt: "Show flagged transactions for review" },
  { label: "Monthly report", icon: "📊", prompt: "Generate monthly compliance report" },
];

export default function MaxPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", role: "max", text: "Max here — your Compliance & Risk agent. I scan ZeniPay transactions every 30 minutes for fraud, chargebacks, and AML red flags. Current risk level: LOW. All systems clean. What do you need?", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
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
    setMessages((p) => [...p, { id: (Date.now() + 1).toString(), role: "max", text: genMax(text), time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/20">
      <div className="flex-shrink-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg">
        <div className="px-6 py-4 flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white/30">
              <img src="/agents/max.png" alt="Max" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
          </div>
          <div className="flex-1"><h1 className="text-lg font-bold">Max</h1><p className="text-amber-100 text-xs">Compliance & Risk Agent · Every 30min</p></div>
          <div className="bg-white/15 rounded-xl px-3 py-1.5 text-xs font-medium border border-white/20"><span className="inline-block w-2 h-2 bg-emerald-400 rounded-full mr-1.5 animate-pulse" />LIVE</div>
        </div>
        <div className="px-6 pb-3 flex gap-4 text-xs">
          <span className="bg-white/10 rounded-lg px-3 py-1 border border-white/10">Risk Level: LOW</span>
          <span className="bg-white/10 rounded-lg px-3 py-1 border border-white/10">Chargebacks: 0.1%</span>
          <span className="bg-white/10 rounded-lg px-3 py-1 border border-white/10">Flagged: 2</span>
          <span className="bg-white/10 rounded-lg px-3 py-1 border border-white/10">Last Scan: 8min ago</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[70%]">
              {msg.role === "max" && <div className="flex items-center gap-2 mb-1"><span className="text-xs font-semibold text-amber-600">Max</span><span className="text-[10px] text-slate-400">{msg.time}</span></div>}
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${msg.role === "user" ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-br-md" : "bg-white border border-slate-200 text-slate-800 rounded-bl-md shadow-sm"}`}>{msg.text}</div>
              {msg.role === "user" && <div className="text-right mt-1"><span className="text-[10px] text-slate-400">{msg.time}</span></div>}
            </div>
          </div>
        ))}
        {typing && <div className="flex justify-start"><div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm"><div className="flex gap-1.5"><span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" /><span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} /><span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} /></div></div></div>}
        <div ref={bottomRef} />
      </div>
      <div className="flex-shrink-0 px-6 py-2 border-t border-slate-100 bg-white/80 backdrop-blur-sm">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {QUICK_ACTIONS.map((a) => (<button key={a.label} onClick={() => send(a.prompt)} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700 transition-all"><span>{a.icon}</span>{a.label}</button>))}
        </div>
      </div>
      <div className="flex-shrink-0 p-4 bg-white border-t border-slate-200">
        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-3">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Message Max..." className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50" />
          <button type="submit" disabled={!input.trim() || typing} className="px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold text-sm shadow-lg disabled:opacity-50">Send</button>
        </form>
      </div>
    </div>
  );
}

function genMax(input: string): string {
  const l = input.toLowerCase();
  if (l.includes("risk") || l.includes("dashboard")) return "Risk Dashboard — April 14, 2026:\n\nOverall Risk Level: LOW\n\n- Transaction volume: $127,400 (last 7 days)\n- Flagged transactions: 2 (both reviewed & cleared)\n- Chargeback ratio: 0.1% (threshold: 1.0%)\n- Failed payments: 4 (3.2% — normal range)\n- Suspicious patterns: 0 detected\n\nRisk Score by Category:\n- Fraud: 2/100 (Excellent)\n- Chargebacks: 5/100 (Excellent)\n- AML: 1/100 (Excellent)\n- Regulatory: 3/100 (Excellent)\n\nNo action required. Next scan in 22 minutes.";
  if (l.includes("chargeback")) return "Chargeback Report:\n\n- Current ratio: 0.1% (well below 1% threshold)\n- Total chargebacks (30 days): 1\n- Amount: $899 (Cuba package — client dispute resolved)\n- Resolution: Won — evidence submitted, refund reversed\n\nChargeback prevention measures active:\n- Pre-auth verification on all bookings >$2,000\n- Automatic confirmation emails with terms\n- 24h cooling period for first-time clients\n\nNo chargeback alerts at this time.";
  if (l.includes("fraud")) return "Fraud Pattern Detection:\n\n- Velocity checks: 0 triggers (no rapid successive transactions)\n- Geo anomalies: 0 (all transactions match client profiles)\n- Card testing: 0 detected\n- Identity mismatch: 0\n\nRecent cleared flags:\n1. $4,200 booking from new client — verified via phone (cleared)\n2. Multiple cards on same IP — family booking, same household (cleared)\n\nFraud score: 2/100. No active threats detected.";
  if (l.includes("aml") || l.includes("compliance")) return "AML Compliance Report:\n\n- KYC verification: 100% for transactions >$3,000\n- PEP screening: All clients checked, 0 matches\n- Sanctions list: All clients checked, 0 matches\n- Suspicious activity reports: 0 filed\n- Large transaction reports: 2 filed (>$10,000 — as required)\n\nCompliance score: 100%\nNext audit date: June 2026\n\nAll regulatory requirements are being met.";
  if (l.includes("flagged") || l.includes("transaction") || l.includes("review")) return "Flagged Transactions for Review:\n\n1. TXN-4821: $5,200 — Group booking (15 pax) from new client\n   Reason: High value + first-time client\n   Recommendation: Request phone verification\n   \n2. TXN-4819: $3,100 — Booking with different billing/shipping address\n   Reason: Address mismatch\n   Recommendation: Confirm with client\n\nBoth are low-risk flags (precautionary). Want me to auto-clear them or should I escalate?";
  if (l.includes("monthly") || l.includes("report")) return "Monthly Compliance Report — March 2026:\n\n- Total transactions processed: $489,200\n- Total volume: 312 transactions\n- Chargebacks: 1 ($899 — won)\n- Fraud attempts: 0\n- AML filings: 3 (routine large transaction reports)\n- Compliance score: 100%\n\nKey metrics:\n- Chargeback ratio: 0.03% (excellent)\n- Fraud rate: 0% \n- Avg transaction: $1,568\n- Payment success rate: 96.8%\n\nFull report exported to compliance folder.";
  return "I monitor all ZeniPay transactions for risk. Ask me about the risk dashboard, chargebacks, fraud patterns, AML compliance, flagged transactions, or monthly reports.";
}
