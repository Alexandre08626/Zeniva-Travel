"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore, updateAccountRole, updateAccountStatus, hasPermission } from "../../../../src/lib/authStore";
import { normalizeRbacRole } from "../../../../src/lib/rbac";
import { getAgentById, setAgentRole, setAgentStatus, type AgentRoleLabel, type AgentDirectoryEntry } from "../../../../src/lib/agent/agents";
import { listClients, listTrips, listLedger } from "../../../../src/lib/agent/store";
import { computeCommissions } from "../../../../src/lib/agent/commissions";
import { TITLE_TEXT, MUTED_TEXT, PREMIUM_BLUE, ACCENT_GOLD } from "../../../../src/design/tokens";
import type { Division } from "../../../../src/lib/authStore";

type AccountRecord = {
  id: string;
  name: string;
  email: string;
  role: string;
  roles?: string[];
  divisions?: Division[];
  status?: "active" | "disabled" | "suspended";
  createdAt?: string;
};

function roleToKey(role: string): AgentDirectoryEntry["roleKey"] {
  const normalized = normalizeRbacRole(role) || role;
  if (normalized === "hq") return "hq";
  if (normalized === "admin") return "admin";
  if (normalized === "yacht_broker") return "yacht_broker";
  if (normalized === "influencer") return "influencer";
  if (role === "partner_owner" || role === "partner_staff") return "partner";
  if (role === "traveler") return "traveler";
  return "travel_agent";
}

function roleToLabel(role: string): AgentRoleLabel {
  const normalized = normalizeRbacRole(role) || role;
  if (normalized === "hq") return "HQ";
  if (normalized === "admin") return "Admin";
  if (normalized === "yacht_broker") return "Yacht Broker";
  if (normalized === "influencer") return "Influencer";
  if (role === "partner_owner" || role === "partner_staff") return "Partner";
  if (role === "traveler") return "Traveler";
  return "Travel Agent";
}

function makeAgentCode(roleKey: AgentDirectoryEntry["roleKey"], email: string) {
  const prefix = roleKey === "hq" ? "Z-HQ" : roleKey === "admin" ? "ZA" : roleKey === "yacht_broker" ? "ZY" : roleKey === "influencer" ? "ZI" : roleKey === "partner" ? "ZP" : "ZT";
  const hash = Array.from(email).reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) % 900, 0) + 100;
  return `${prefix}-${hash}`;
}

function mapAccountToAgent(account: AccountRecord): AgentDirectoryEntry {
  const roles = Array.isArray(account.roles) && account.roles.length
    ? account.roles
    : account.role
      ? [account.role]
      : ["traveler"];
  const primaryRole = roles[0] || "traveler";
  const roleKey = roleToKey(primaryRole);
  const roleLabel = roleToLabel(primaryRole);
  const divisions = (Array.isArray(account.divisions) && account.divisions.length
    ? account.divisions
    : roleKey === "yacht_broker"
      ? ["YACHT"]
      : roleKey === "partner"
        ? []
        : ["TRAVEL"]) as Division[];
  const createdAt = account.createdAt || new Date().toISOString();

  return {
    id: account.id,
    name: account.name || "Agent",
    email: account.email,
    roleLabel,
    roleKey,
    status: account.status === "suspended" ? "suspended" : account.status === "disabled" ? "inactive" : "active",
    code: makeAgentCode(roleKey, account.email),
    avatar: "/branding/lina-avatar.png",
    divisions,
    createdAt,
    linkedToTravel: divisions.includes("TRAVEL"),
    linkedToYacht: divisions.includes("YACHT"),
    metrics: {
      activeClients: 0,
      openFiles: 0,
      inProgressSales: 0,
      revenue: 0,
      commission: 0,
      lastActivity: createdAt,
    },
  };
}

export default function AgentProfilePage() {
  const params = useParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const auditLog = useAuthStore((s) => s.auditLog || []);
  const router = useRouter();
  const agentId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const initialAgent = agentId ? getAgentById(agentId) : undefined;
  const [agent, setAgent] = useState<AgentDirectoryEntry | undefined>(initialAgent);
  const [status, setStatus] = useState(initialAgent?.status || "active");
  const [roleLabel, setRoleLabel] = useState(initialAgent?.roleLabel || "Travel Agent");
  const [loading, setLoading] = useState(!initialAgent && Boolean(agentId));
  const allowed = !!(
    user &&
    (hasPermission(user, "accounts:manage") || (agent && user.email?.toLowerCase() === agent.email.toLowerCase()))
  );

  useEffect(() => {
    if (!agentId || agent) return;
    let active = true;
    const load = async () => {
      try {
        const res = await fetch("/api/accounts");
        const payload = await res.json();
        if (!res.ok) throw new Error(payload?.error || "Failed to load accounts");
        const records = Array.isArray(payload?.data) ? payload.data : [];
        const match = records.find((r: AccountRecord) => r.id === agentId);
        if (!active) return;
        if (match) {
          const mapped = mapAccountToAgent(match);
          setAgent(mapped);
          setStatus(mapped.status);
          setRoleLabel(mapped.roleLabel);
        }
      } catch {
        // ignore
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [agentId, agent]);

  const clients = listClients();
  const trips = listTrips();
  const ledger = listLedger();

  const agentClients = useMemo(() => clients.filter((c) => c.ownerEmail?.toLowerCase() === agent?.email.toLowerCase()), [clients, agent]);
  const agentTrips = useMemo(() => trips.filter((t) => t.ownerEmail?.toLowerCase() === agent?.email.toLowerCase()), [trips, agent]);
  const applyStatus = (next: "active" | "inactive" | "suspended") => {
    if (!agent) return;
    setAgentStatus(agent.id, next);
    setStatus(next);
    updateAccountStatus(agent.email, next === "active" ? "active" : "suspended");
  };

  const toggleRole = () => {
    if (!agent) return;
    const next = roleLabel === "Travel Agent" ? { roleKey: "admin", roleLabel: "Admin" } : { roleKey: "travel_agent", roleLabel: "Travel Agent" };
    setAgentRole(agent.id, next.roleKey as "hq" | "admin" | "travel_agent", next.roleLabel as AgentRoleLabel);
    setRoleLabel(next.roleLabel as AgentRoleLabel);
    const mappedRole = next.roleKey === "admin" ? "admin" : "travel_agent";
    updateAccountRole(agent.email, mappedRole as any);
  };
  const agentLedger = useMemo(() => ledger.filter((l) => l.tripId && agentTrips.find((t) => t.id === l.tripId)), [ledger, agentTrips]);
  const commissions = useMemo(() => computeCommissions(agent?.email), [agent]);

  const bookingLines = useMemo(() => {
    return agentTrips.flatMap((t) =>
      (t.components || []).map((c) => ({
        id: `${t.id}-${c.id}`,
        tripId: t.id,
        tripTitle: t.title,
        division: t.division,
        type: c.type,
        status: c.status,
        confirmation: c.confirmation || "Pending",
      }))
    );
  }, [agentTrips]);

  const proposalLines = useMemo(() => {
    return agentTrips.map((t) => ({
      id: `${t.id}-proposal`,
      title: `${t.title} Proposal`,
      status: t.status === "Draft" ? "draft" : "sent",
      division: t.division,
    }));
  }, [agentTrips]);

  if (!allowed) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl px-5 py-16 space-y-3">
          <h1 className="text-3xl font-black" style={{ color: TITLE_TEXT }}>Restricted</h1>
          <p className="text-sm" style={{ color: MUTED_TEXT }}>Agent profile is visible to HQ, Admin, or the agent owner.</p>
          <button
            onClick={() => router.push("/agent/agents")}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold"
            style={{ color: TITLE_TEXT }}
            type="button"
          >
            Back to Agents
          </button>
        </div>
      </main>
    );
  }

  if (!agent) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl px-5 py-16 space-y-3">
          <h1 className="text-3xl font-black" style={{ color: TITLE_TEXT }}>{loading ? "Loading agent…" : "Agent not found"}</h1>
          <p className="text-sm" style={{ color: MUTED_TEXT }}>
            {loading ? "Loading from the database." : "Check the URL or return to the directory."}
          </p>
          <Link href="/agent/agents" className="text-sm font-bold" style={{ color: PREMIUM_BLUE }}>Back to directory</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F3F6FB" }}>
      <div className="mx-auto max-w-6xl px-5 py-8 space-y-6">
        <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white shadow-sm p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="h-14 w-14 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center">
              <img src={agent.avatar} alt={agent.name} className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Agent Profile · Mirror</p>
              <h1 className="text-3xl md:text-4xl font-black" style={{ color: TITLE_TEXT }}>{agent.name}</h1>
              <p className="text-sm" style={{ color: MUTED_TEXT }}>{roleLabel} · Code {agent.code}</p>
              <p className="text-xs" style={{ color: MUTED_TEXT }}>{agent.email} · Last activity {new Date(agent.metrics.lastActivity).toLocaleString()}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-slate-900 text-white px-3 py-1 text-xs font-semibold">HQ Mirror mode</span>
            <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold" style={{ color: TITLE_TEXT }}>{status}</span>
            <Link href="/agent/agents" className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold" style={{ color: TITLE_TEXT }}>Back to directory</Link>
          </div>
        </header>

        <section className="grid gap-3 md:grid-cols-3">
          <SummaryCard label="Active clients" value={agent.metrics.activeClients} />
          <SummaryCard label="Open files" value={agent.metrics.openFiles} />
          <SummaryCard label="Commission earned" value={`$${agent.metrics.commission.toLocaleString()}`} />
          <SummaryCard label="In-progress sales" value={agent.metrics.inProgressSales} />
          <SummaryCard label="Revenue" value={`$${agent.metrics.revenue.toLocaleString()}`} />
          <SummaryCard label="Last activity" value={new Date(agent.metrics.lastActivity).toLocaleDateString()} />
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 space-y-2">
            <h2 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>Overview</h2>
            <p className="text-sm" style={{ color: MUTED_TEXT }}>Role: {roleLabel}</p>
            <p className="text-sm" style={{ color: MUTED_TEXT }}>Status: {status}</p>
            <p className="text-sm" style={{ color: MUTED_TEXT }}>Divisions: {(agent.divisions || []).join(", ")}</p>
            <p className="text-sm" style={{ color: MUTED_TEXT }}>Created: {new Date(agent.createdAt).toLocaleDateString()}</p>
            <p className="text-sm" style={{ color: MUTED_TEXT }}>Last activity: {new Date(agent.metrics.lastActivity).toLocaleString()}</p>
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <button className="rounded-full border border-slate-200 px-3 py-1" type="button" onClick={() => applyStatus("suspended")}>Suspend</button>
              <button className="rounded-full border border-slate-200 px-3 py-1" type="button" onClick={() => applyStatus("active")}>Activate</button>
              <button className="rounded-full border border-slate-200 px-3 py-1" type="button" onClick={toggleRole}>Change role</button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 space-y-2">
            <h2 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>Performance & Commissions</h2>
            <p className="text-sm" style={{ color: MUTED_TEXT }}>Revenue: ${agent.metrics.revenue.toLocaleString()}</p>
            <p className="text-sm" style={{ color: MUTED_TEXT }}>Commission earned: ${agent.metrics.commission.toLocaleString()}</p>
            <p className="text-sm" style={{ color: MUTED_TEXT }}>Ledger entries: {agentLedger.length}</p>
            <p className="text-sm" style={{ color: MUTED_TEXT }}>Commission lines: {commissions.length}</p>
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <button className="rounded-full border border-slate-200 px-3 py-1" type="button">Adjust commission</button>
              <button className="rounded-full border border-slate-200 px-3 py-1" type="button">Freeze commission</button>
              <button className="rounded-full border border-slate-200 px-3 py-1" type="button">Add bonus</button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 space-y-2">
            <h2 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>Mirror Mode</h2>
            <p className="text-sm" style={{ color: MUTED_TEXT }}>HQ can mirror the agent's portal exactly.</p>
            <Link href="/agent" className="rounded-full px-4 py-2 text-sm font-bold text-white inline-block" style={{ backgroundColor: PREMIUM_BLUE }}>
              Mirror this agent
            </Link>
            <p className="text-xs" style={{ color: MUTED_TEXT }}>Use for QA, training, or live support. HQ sees 100% of the agent's activity.</p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>Clients</h3>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{agentClients.length}</span>
            </div>
            <div className="space-y-2 text-sm max-h-72 overflow-y-auto">
              {agentClients.length === 0 && <p className="text-slate-500">No clients owned by this agent.</p>}
              {agentClients.map((c) => (
                <div key={c.id} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                  <p className="font-semibold" style={{ color: TITLE_TEXT }}>{c.name}</p>
                  <p className="text-xs" style={{ color: MUTED_TEXT }}>{c.id} · {c.primaryDivision || "TRAVEL"} · {c.phone || "No phone"}</p>
                  <div className="flex flex-wrap gap-2 text-[11px] font-semibold mt-1">
                    <span className="rounded-full bg-slate-200 px-2 py-1">Owner {c.ownerEmail}</span>
                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-900">Status: Active</span>
                    <button className="rounded-full border border-slate-200 px-2 py-1" type="button">Transfer (HQ)</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>Files & Trips</h3>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{agentTrips.length}</span>
            </div>
            <div className="space-y-2 text-sm max-h-72 overflow-y-auto">
              {agentTrips.length === 0 && <p className="text-slate-500">No trips yet.</p>}
              {agentTrips.map((t) => (
                <div key={t.id} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                  <p className="font-semibold" style={{ color: TITLE_TEXT }}>{t.title}</p>
                  <p className="text-xs" style={{ color: MUTED_TEXT }}>{t.id} · {t.division} · {t.status}</p>
                  <Link href={`/agent/trips/${t.id}`} className="text-xs font-bold" style={{ color: PREMIUM_BLUE }}>Open file →</Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>Proposals</h3>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{proposalLines.length}</span>
            </div>
            <div className="space-y-2 text-sm max-h-64 overflow-y-auto">
              {proposalLines.length === 0 && <p className="text-slate-500">No proposals yet.</p>}
              {proposalLines.map((p) => (
                <div key={p.id} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                  <p className="font-semibold" style={{ color: TITLE_TEXT }}>{p.title}</p>
                  <p className="text-xs" style={{ color: MUTED_TEXT }}>{p.division} · {p.status}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>Bookings</h3>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{bookingLines.length}</span>
            </div>
            <div className="space-y-2 text-sm max-h-64 overflow-y-auto">
              {bookingLines.length === 0 && <p className="text-slate-500">No bookings yet.</p>}
              {bookingLines.map((b) => (
                <div key={b.id} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                  <p className="font-semibold" style={{ color: TITLE_TEXT }}>{b.tripTitle}</p>
                  <p className="text-xs" style={{ color: MUTED_TEXT }}>{b.type} · {b.status} · {b.confirmation}</p>
                  <p className="text-[11px]" style={{ color: MUTED_TEXT }}>File {b.tripId} · {b.division}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>Purchase Orders</h3>
              <Link href={`/agent/purchase-orders?agent=${agent.id}`} className="text-xs font-bold" style={{ color: PREMIUM_BLUE }}>Open PO inbox →</Link>
            </div>
            <p className="text-sm" style={{ color: MUTED_TEXT }}>All POs submitted by this agent are visible to HQ. Status: sent / approved / invoiced.</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>Audit log</h3>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{auditLog.length}</span>
            </div>
            <div className="space-y-2 text-xs max-h-64 overflow-y-auto">
              {auditLog.length === 0 && <p className="text-slate-500">No audit entries.</p>}
              {auditLog.slice(-20).reverse().map((a) => (
                <div key={a.id} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                  <p className="font-semibold" style={{ color: TITLE_TEXT }}>{a.action}</p>
                  <p className="text-[11px]" style={{ color: MUTED_TEXT }}>{a.actor} · {new Date(a.timestamp).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {agent.roleLabel === "Yacht Broker" && (
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Yacht broker view</p>
                <h3 className="text-xl font-black" style={{ color: TITLE_TEXT }}>Zeniva Yacht pipeline</h3>
                <p className="text-sm" style={{ color: MUTED_TEXT }}>
                  Yacht files flow to HQ for billing. 95% stays with Yacht, 5% to Travel; no agent commissions here.
                </p>
              </div>
              <Link href="/agent/yachts" className="rounded-full px-4 py-2 text-sm font-bold text-slate-900" style={{ backgroundColor: ACCENT_GOLD }}>
                Open yacht files
              </Link>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="text-xl font-black" style={{ color: TITLE_TEXT }}>{value}</p>
    </div>
  );
}
