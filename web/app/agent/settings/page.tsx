"use client";

import { useMemo, useState } from "react";
import { useRequireRole } from "../../../src/lib/roleGuards";
import { AgentLevel, Division, DIVISIONS, updateSelfProfile, useAuthStore } from "../../../src/lib/authStore";
import { PREMIUM_BLUE, MUTED_TEXT, TITLE_TEXT } from "../../../src/design/tokens";

const allowedRoles = ["hq", "admin", "travel-agent", "finance", "support"] as const;

export default function AgentSettingsPage() {
  useRequireRole(allowedRoles as any, "/login");
  const user = useAuthStore((s) => s.user);

  const [name, setName] = useState(user?.name || "");
  const [password, setPassword] = useState("");
  const [agentLevel, setAgentLevel] = useState<AgentLevel>(user?.agentLevel || "Agent");
  const [divisions, setDivisions] = useState<Division[]>(user?.divisions || []);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const divisionOptions = useMemo(() => DIVISIONS, []);

  const toggleDivision = (division: Division) => {
    setDivisions((prev) => (prev.includes(division) ? prev.filter((d) => d !== division) : [...prev, division]));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await updateSelfProfile({
        name: name.trim() || user.name,
        password: password.trim() || undefined,
        agentLevel,
        divisions,
      });
      setPassword("");
      setMessage("Profile updated successfully.");
    } catch (err: any) {
      setError(err?.message || "Unable to save changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F3F6FB" }}>
      <div className="mx-auto max-w-4xl px-5 py-8 space-y-6">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Agent Settings</p>
            <h1 className="text-3xl font-black" style={{ color: TITLE_TEXT }}>Manage your profile</h1>
            <p className="text-sm" style={{ color: MUTED_TEXT }}>Update your name, password, agent level, and active divisions.</p>
          </div>
          <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold" style={{ color: TITLE_TEXT }}>
            {user?.email} · {user?.role?.toUpperCase()}
          </div>
        </header>

        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm font-semibold" style={{ color: TITLE_TEXT }}>
              Full name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Your name"
              />
            </label>
            <label className="space-y-1 text-sm font-semibold" style={{ color: TITLE_TEXT }}>
              Email (read-only)
              <input
                value={user?.email || ""}
                disabled
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-slate-50 text-slate-500"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm font-semibold" style={{ color: TITLE_TEXT }}>
              New password (optional)
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Leave blank to keep current"
              />
            </label>
            <label className="space-y-1 text-sm font-semibold" style={{ color: TITLE_TEXT }}>
              Agent level
              <select
                value={agentLevel || "Agent"}
                onChange={(e) => setAgentLevel(e.target.value as AgentLevel)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                {(["Agent", "Senior Agent", "Manager"] as const).map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold" style={{ color: TITLE_TEXT }}>Divisions</p>
            <div className="flex flex-wrap gap-2">
              {divisionOptions.map((div) => (
                <label key={div} className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-semibold text-slate-800">
                  <input type="checkbox" checked={divisions.includes(div)} onChange={() => toggleDivision(div)} />
                  {div}
                </label>
              ))}
            </div>
            <p className="text-xs" style={{ color: MUTED_TEXT }}>Adjust which divisions you actively serve. HQ can still assign additional scopes.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-full px-5 py-2 text-sm font-bold text-white shadow-sm"
              style={{ backgroundColor: PREMIUM_BLUE, opacity: saving ? 0.85 : 1 }}
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
            {message && <span className="text-sm font-semibold text-emerald-600">{message}</span>}
            {error && <span className="text-sm font-semibold text-rose-600">{error}</span>}
          </div>
        </section>
      </div>
    </main>
  );
}
