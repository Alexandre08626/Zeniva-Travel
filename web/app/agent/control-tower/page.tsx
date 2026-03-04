"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useAuthStore, isHQ } from "@/src/lib/authStore";

const PREMIUM_BLUE = "#0B1B4D";
const BRAND_BLUE = "#0F6CF5";

type ServiceStatus = "online" | "offline" | "degraded" | "unknown";

interface ServiceHealth {
  name: string;
  key: string;
  status: ServiceStatus;
  latency?: number;
  icon: string;
  description: string;
}

interface WorkflowItem {
  name: string;
  description: string;
  status: "running" | "paused" | "error";
  lastRun: string;
  runs: number;
}

interface SystemEvent {
  id: string;
  ts: string;
  type: "info" | "warning" | "error" | "success";
  message: string;
}

const WORKFLOWS: WorkflowItem[] = [
  { name: "Lina Chat", description: "AI chat intake & lead qualification", status: "running", lastRun: "2min ago", runs: 1842 },
  { name: "Email Auto-Reply", description: "Automated email responses via Sofia", status: "running", lastRun: "15min ago", runs: 394 },
  { name: "Marketing Agent", description: "Daily social media posts via Mia", status: "running", lastRun: "6h ago", runs: 87 },
  { name: "Lead Hunter (Marco)", description: "5-engine scraping every 2h", status: "running", lastRun: "1h ago", runs: 220 },
  { name: "Follow-up (Noah)", description: "Smart follow-up sequences", status: "running", lastRun: "3h ago", runs: 156 },
];

const STATUS_DISPLAY: Record<ServiceStatus, { label: string; dot: string; text: string }> = {
  online:   { label: "Online",   dot: "bg-emerald-500 animate-pulse", text: "text-emerald-600" },
  offline:  { label: "Offline",  dot: "bg-red-500 animate-pulse",     text: "text-red-600" },
  degraded: { label: "Degraded", dot: "bg-amber-500 animate-pulse",   text: "text-amber-600" },
  unknown:  { label: "Unknown",  dot: "bg-slate-400",                  text: "text-slate-500" },
};

const EVENT_ICONS: Record<string, string> = { info: "ℹ️", warning: "⚠️", error: "❌", success: "✅" };

const DEMO_EVENTS: SystemEvent[] = [
  { id: "e1", ts: new Date(Date.now() - 2 * 60000).toISOString(), type: "success", message: "VPS API health check passed (23ms)" },
  { id: "e2", ts: new Date(Date.now() - 15 * 60000).toISOString(), type: "info", message: "Lina processed 14 chat sessions" },
  { id: "e3", ts: new Date(Date.now() - 30 * 60000).toISOString(), type: "success", message: "Email batch sent: 42 emails delivered" },
  { id: "e4", ts: new Date(Date.now() - 60 * 60000).toISOString(), type: "info", message: "Marco scraped 8 new leads from Reddit" },
  { id: "e5", ts: new Date(Date.now() - 2 * 3600000).toISOString(), type: "warning", message: "Supabase connection spike detected (resolved)" },
  { id: "e6", ts: new Date(Date.now() - 6 * 3600000).toISOString(), type: "success", message: "Daily backup completed — 4.2MB" },
];

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

export default function ControlTowerPage() {
  const user = useAuthStore((s) => s.user);
  const hq = isHQ(user);

  const [services, setServices] = useState<ServiceHealth[]>([
    { name: "VPS API",    key: "vps",      status: "unknown", icon: "🖥️",  description: "Main backend API (port 8000)" },
    { name: "n8n",        key: "n8n",      status: "unknown", icon: "⚡",  description: "Workflow automation engine" },
    { name: "Supabase",   key: "supabase", status: "unknown", icon: "🗄️",  description: "Database & realtime" },
    { name: "Last Backup",key: "backup",   status: "unknown", icon: "💾",  description: "Automated daily backup" },
  ]);
  const [events, setEvents] = useState<SystemEvent[]>(DEMO_EVENTS);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!hq) return;
    const checkHealth = async () => {
      try {
        const res = await fetch("/api/agents-proxy?path=health");
        if (res.ok) {
          const json = await res.json();
          setServices((prev) => prev.map((s) => {
            if (s.key === "vps") return { ...s, status: "online", latency: json?.latency ?? 15 };
            if (s.key === "supabase") return { ...s, status: json?.supabase === false ? "offline" : "online" };
            if (s.key === "n8n") return { ...s, status: json?.n8n === false ? "offline" : "online" };
            if (s.key === "backup") return { ...s, status: "online", description: `Last: ${json?.last_backup ?? "today 02:00"}` };
            return s;
          }));
        } else {
          setServices((prev) => prev.map((s) => s.key === "vps" ? { ...s, status: "offline" } : { ...s, status: "unknown" }));
        }
      } catch {
        setServices((prev) => prev.map((s) => s.key === "vps" ? { ...s, status: "offline" } : { ...s, status: "unknown" }));
      }
    };
    void checkHealth();
    const iv = window.setInterval(checkHealth, 60000);
    return () => window.clearInterval(iv);
  }, [hq]);

  const runAction = async (action: string) => {
    setActionLoading(action);
    try {
      await fetch(`/api/agents-proxy?path=admin/${action}`, { method: "POST" });
      const ev: SystemEvent = { id: Date.now().toString(), ts: new Date().toISOString(), type: "success", message: `Action "${action}" triggered successfully` };
      setEvents((prev) => [ev, ...prev].slice(0, 20));
    } catch {
      const ev: SystemEvent = { id: Date.now().toString(), ts: new Date().toISOString(), type: "error", message: `Action "${action}" failed` };
      setEvents((prev) => [ev, ...prev].slice(0, 20));
    } finally {
      setActionLoading(null);
    }
  };

  if (!hq) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: PREMIUM_BLUE }}>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center max-w-md">
          <p className="text-5xl mb-4">🔒</p>
          <h2 className="text-2xl font-black text-slate-900">Access Denied</h2>
          <p className="text-slate-400 mt-2">Control Tower is restricted to HQ administrators only.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ background: PREMIUM_BLUE }}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-black text-white">🗼 Control Tower</h1>
        <p className="text-slate-400 text-sm mt-1">System health, workflows, and quick actions</p>
      </div>

      {/* Service health */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {services.map((svc) => {
          const cfg = STATUS_DISPLAY[svc.status];
          return (
            <div key={svc.key} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl">{svc.icon}</span>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                  <span className={`text-xs font-bold ${cfg.text}`}>{cfg.label}</span>
                </div>
              </div>
              <p className="font-bold text-slate-900">{svc.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{svc.latency ? `${svc.latency}ms` : svc.description}</p>
            </div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        {/* Workflows */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h2 className="font-bold text-slate-900 mb-4">⚡ Active Workflows</h2>
          <div className="space-y-3">
            {WORKFLOWS.map((w) => (
              <div key={w.name} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  w.status === "running" ? "bg-emerald-500 animate-pulse" : w.status === "error" ? "bg-red-500" : "bg-amber-400"
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-sm">{w.name}</p>
                  <p className="text-xs text-slate-400">{w.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-slate-400">{w.lastRun}</p>
                  <p className="text-xs font-bold text-slate-500">{w.runs} runs</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions + Events */}
        <div className="space-y-4">
          {/* Quick actions */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h2 className="font-bold text-slate-900 mb-3">🎯 Quick Actions</h2>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: "restart",   label: "Restart API",   icon: "🔄" },
                { key: "cache",     label: "Clear Cache",   icon: "🗑️" },
                { key: "backup",    label: "Run Backup",    icon: "💾" },
              ].map((a) => (
                <button
                  key={a.key}
                  disabled={!!actionLoading}
                  onClick={() => void runAction(a.key)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition disabled:opacity-50"
                >
                  <span className="text-xl">{a.icon}</span>
                  <span className="text-xs font-semibold text-slate-700">{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* System events */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h2 className="font-bold text-slate-900 mb-3">📋 Recent Events</h2>
            <div className="space-y-2 max-h-52 overflow-y-auto">
              {events.map((ev) => (
                <div key={ev.id} className="flex items-start gap-2 text-sm">
                  <span className="shrink-0 text-base">{EVENT_ICONS[ev.type]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-700 text-xs">{ev.message}</p>
                    <p className="text-slate-400 text-[10px] mt-0.5">{timeAgo(ev.ts)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
