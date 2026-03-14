"use client";
import { useEffect, useState } from "react";
import { useAuthStore, isHQ } from "@/src/lib/authStore";
import { useRouter } from "next/navigation";

const AUTH = "Bearer zeniva-secret-2025";

interface ServiceHealth {
  status: "online" | "offline" | "degraded";
  latency?: number;
}

interface HealthData {
  vps_api?: ServiceHealth;
  supabase?: ServiceHealth;
  n8n?: ServiceHealth;
  openai?: ServiceHealth;
  [key: string]: ServiceHealth | undefined;
}

const SERVICES = [
  { key: "vps_api",  name: "VPS API",   icon: "⚡", desc: "Main Python FastAPI backend · Port 8000" },
  { key: "supabase", name: "Supabase",  icon: "🗄️", desc: "PostgreSQL database · All client data" },
  { key: "n8n",      name: "n8n",       icon: "🔄", desc: "Workflow automation · Email & SMS agents" },
  { key: "openai",   name: "OpenAI",    icon: "🤖", desc: "GPT-4o-mini · Lina's brain" },
];

function StatusBadge({ s }: { s?: ServiceHealth }) {
  if (!s) return <span className="text-xs bg-slate-100 text-slate-400 px-2 py-1 rounded-full font-bold">Unknown</span>;
  const cfg = s.status === "online" ? "bg-emerald-100 text-emerald-700" : s.status === "degraded" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700";
  return <span className={`text-xs px-2 py-1 rounded-full font-bold ${cfg}`}>{s.status === "online" ? "🟢 Online" : s.status === "degraded" ? "🟡 Degraded" : "🔴 Offline"}{s.latency ? ` · ${s.latency}ms` : ""}</span>;
}

export default function ControlTowerPage() {
  const user = useAuthStore((s) => s.user);
  const hq = isHQ(user);
  const router = useRouter();
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [stats, setStats] = useState<any>(null);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const [hr, sr] = await Promise.all([
        fetch("/api/agents-proxy?path=admin/health"),
        fetch("/api/agents-proxy?path=admin/stats"),
      ]);
      if (hr.ok) { setHealth(await hr.json()); setLastCheck(new Date()); }
      if (sr.ok) { setStats(await sr.json()); }
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    if (!user?.email) return;
    void checkHealth();
    const iv = setInterval(checkHealth, 30000);
    return () => clearInterval(iv);
  }, [user?.email]);

  if (!hq) {
    return (
      <main className="min-h-screen bg-[#F3F6FB] flex items-center justify-center">
        <div className="rounded-3xl bg-white shadow-xl p-10 text-center max-w-sm">
          <p className="text-5xl mb-4">🗼</p>
          <h2 className="text-xl font-black text-slate-900">HQ Access Only</h2>
          <p className="text-slate-500 text-sm mt-2">The Control Tower is restricted to HQ administrators.</p>
          <button onClick={() => router.push("/agent")} className="mt-5 rounded-full px-6 py-2.5 text-sm font-bold text-white" style={{ background: "linear-gradient(135deg,#0F6CF5,#0B1B4D)" }}>
            Back to Dashboard
          </button>
        </div>
      </main>
    );
  }

  const allOnline = health && Object.values(health).every(s => s?.status === "online");

  return (
    <main className="min-h-screen bg-[#F3F6FB]">
      <div className="mx-auto max-w-5xl px-5 py-8 space-y-6">

        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">HQ Operations</p>
            <h1 className="text-3xl font-black text-slate-900">Control Tower</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {lastCheck ? `Last check: ${lastCheck.toLocaleTimeString("en-US")}` : "Checking systems…"}
            </p>
          </div>
          <button onClick={checkHealth} disabled={loading} className="rounded-full px-6 py-2.5 text-sm font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm disabled:opacity-50">
            {loading ? "⟳ Checking…" : "🔄 Refresh"}
          </button>
        </header>

        {/* Overall status */}
        <div className={`rounded-2xl p-5 text-white ${allOnline ? "bg-emerald-600" : "bg-amber-600"}`}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{allOnline ? "✅" : "⚠️"}</span>
            <div>
              <p className="font-black text-xl">{allOnline ? "All Systems Operational" : "Some Services Need Attention"}</p>
              <p className="text-white/80 text-sm">Zeniva Travel infrastructure status · Auto-refreshes every 30s</p>
            </div>
          </div>
        </div>

        {/* Service cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SERVICES.map((svc) => {
            const s = health?.[svc.key];
            return (
              <div key={svc.key} className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{svc.icon}</span>
                    <div>
                      <p className="font-black text-slate-900">{svc.name}</p>
                      <p className="text-xs text-slate-400">{svc.desc}</p>
                    </div>
                  </div>
                  <StatusBadge s={s} />
                </div>
                {s?.latency && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Response time</span>
                      <span className="font-semibold">{s.latency}ms</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${s.latency < 200 ? "bg-emerald-500" : s.latency < 500 ? "bg-amber-500" : "bg-red-500"}`}
                           style={{ width: `${Math.min(100, 100 - (s.latency / 20))}%` }} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Live stats */}
        {stats && (
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
            <h3 className="font-black text-slate-900 mb-4">📊 Live Database Stats</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Total Leads", value: stats.total_leads || 0, icon: "🎯" },
                { label: "Conversations", value: stats.total_conversations || 0, icon: "💬" },
                { label: "Active Agents", value: stats.total_agents || 0, icon: "👤" },
                { label: "SMS Sent", value: stats.sms_sent || 0, icon: "📱" },
              ].map((s) => (
                <div key={s.label} className="text-center p-3 rounded-xl bg-slate-50">
                  <p className="text-2xl">{s.icon}</p>
                  <p className="text-xl font-black text-slate-900">{s.value.toLocaleString()}</p>
                  <p className="text-xs text-slate-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* System info */}
        <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
          <h3 className="font-black text-slate-900 mb-4">🖥️ System Info</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {[
              { label: "VPS IP", value: "217.216.88.202" },
              { label: "API Port", value: "8000" },
              { label: "Python Venv", value: "/root/zeniva-ai/venv" },
              { label: "n8n URL", value: "vmi3097009.contaboserver.net" },
              { label: "Database", value: "PostgreSQL · Supabase" },
              { label: "AI Model", value: "GPT-4o-mini (all agents)" },
            ].map((r) => (
              <div key={r.label} className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">{r.label}</span>
                <span className="font-mono font-semibold text-slate-800 text-xs">{r.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
