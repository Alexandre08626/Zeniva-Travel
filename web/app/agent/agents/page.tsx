"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore, type Role } from "../../../src/lib/authStore";
import { listAgents, addAgentFromAccount } from "../../../src/lib/agent/agents";
import { PREMIUM_BLUE, TITLE_TEXT, MUTED_TEXT, ACCENT_GOLD } from "../../../src/design/tokens";

const statusLabels: Record<string, string> = {
  active: "Active",
  inactive: "Inactive",
  suspended: "Suspended",
};

export default function AgentsDirectoryPage() {
  const user = useAuthStore((s) => s.user);
  const accounts = useAuthStore((s) => s.accounts);
  const router = useRouter();
  const [roleFilter, setRoleFilter] = useState<"all" | "travel" | "yacht" | "admin">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "suspended">("all");
  const [data, setData] = useState(listAgents());

  const isHQorAdmin = !!user && user.role === "hq" && user.email?.toLowerCase() === "info@zeniva.ca";
  const isAgentSelf = !!user && user.role !== "traveler";

  useEffect(() => {
    if (!user || user.role === "traveler") return;
    const role = user.role as Role;
    addAgentFromAccount({
      name: user.name || "Agent",
      email: user.email,
      role,
      divisions: user.divisions,
      status: "active",
    });
    setData(listAgents());
  }, [user]);

  useEffect(() => {
    if (!accounts || accounts.length === 0) return;
    const agentRoles: Role[] = ["hq", "admin", "travel-agent", "yacht-partner", "finance", "support", "partner_owner", "partner_staff"];
    const agentRoleSet = new Set(agentRoles);

    accounts.forEach((account) => {
      const roles = account.roles && account.roles.length ? account.roles : (account.role ? [account.role] : []);
      const agentRole = roles.find((r) => agentRoleSet.has(r));
      if (!agentRole) return;

      addAgentFromAccount({
        name: account.name || "Agent",
        email: account.email,
        role: agentRole,
        divisions: account.divisions,
        status: account.status === "suspended" ? "suspended" : account.status === "disabled" ? "inactive" : "active",
      });
    });

    setData(listAgents());
  }, [accounts]);

  useEffect(() => {
    let active = true;
    fetch("/api/accounts")
      .then((res) => res.json())
      .then((payload) => {
        if (!active) return;
        const records = Array.isArray(payload?.data) ? payload.data : [];
        if (!records.length) return;

        const agentRoles: Role[] = ["hq", "admin", "travel-agent", "yacht-partner", "finance", "support", "partner_owner", "partner_staff"];
        const agentRoleSet = new Set(agentRoles);

        records.forEach((account: any) => {
          const roles = Array.isArray(account.roles) && account.roles.length
            ? account.roles
            : account.role
              ? [account.role]
              : [];
          const agentRole = roles.find((r: Role) => agentRoleSet.has(r));
          if (!agentRole) return;

          addAgentFromAccount({
            name: account.name || "Agent",
            email: account.email,
            role: agentRole,
            divisions: account.divisions,
            status: account.status === "suspended" ? "suspended" : account.status === "disabled" ? "inactive" : "active",
          });
        });

        setData(listAgents());
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const source = isHQorAdmin ? data : data.filter((a) => a.email.toLowerCase() === (user?.email || "").toLowerCase());
    return source.filter((a) => {
      const roleOk =
        roleFilter === "all" ||
        (roleFilter === "travel" && a.roleLabel === "Travel Agent") ||
        (roleFilter === "yacht" && a.roleLabel === "Yacht Partner") ||
        (roleFilter === "admin" && (a.roleKey === "admin" || a.roleKey === "hq"));
      const statusOk = statusFilter === "all" || a.status === statusFilter;
      return roleOk && statusOk;
    });
  }, [data, roleFilter, statusFilter, user, isHQorAdmin]);

  if (!user || (!isHQorAdmin && !isAgentSelf)) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl px-5 py-16 space-y-3">
          <h1 className="text-3xl font-black" style={{ color: TITLE_TEXT }}>Restricted</h1>
          <p className="text-sm" style={{ color: MUTED_TEXT }}>Agents Command is visible to HQ/Admin or your own agent profile.</p>
          <button
            onClick={() => router.push("/agent")}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold"
            style={{ color: TITLE_TEXT }}
            type="button"
          >
            Back to dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F3F6FB" }}>
      <div className="mx-auto max-w-6xl px-5 py-8 space-y-6">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Zeniva Agent Command</p>
            <h1 className="text-3xl md:text-4xl font-black" style={{ color: TITLE_TEXT }}>Agents Directory</h1>
            <p className="text-sm" style={{ color: MUTED_TEXT }}>
              HQ view of all agents and partners. Mirror mode ready for training and control.
            </p>
          </div>
          <div className="flex gap-2">
            <span className="rounded-full bg-slate-900 text-white px-3 py-1 text-xs font-semibold">HQ Only</span>
            <Link href="/agent/control-tower" className="rounded-full px-4 py-2 text-sm font-bold text-white" style={{ backgroundColor: PREMIUM_BLUE }}>
              Go to Control Tower
            </Link>
          </div>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 flex flex-wrap gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Role</span>
            {["all", "travel", "yacht", "admin"].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r as any)}
                className={`rounded-full border px-3 py-1 font-semibold ${roleFilter === r ? "bg-slate-900 text-white" : "bg-white border-slate-200"}`}
              >
                {r === "all" ? "All" : r === "travel" ? "Travel" : r === "yacht" ? "Yacht" : "HQ/Admin"}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Status</span>
            {["all", "active", "inactive", "suspended"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s as any)}
                className={`rounded-full border px-3 py-1 font-semibold ${statusFilter === s ? "bg-slate-900 text-white" : "bg-white border-slate-200"}`}
              >
                {s === "all" ? "All" : statusLabels[s]}
              </button>
            ))}
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-2">
          {filtered.map((a) => (
            <div key={a.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center">
                  <img src={a.avatar} alt={a.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>{a.name}</h3>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{a.roleLabel}</span>
                    {a.linkedToYacht && <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-slate-900">Zeniva Yacht</span>}
                    {a.linkedToTravel && <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900">Zeniva Travel</span>}
                    <span className="rounded-full px-3 py-1 text-xs font-semibold border" style={{ borderColor: "#cbd5e1", color: TITLE_TEXT }}>{statusLabels[a.status]}</span>
                  </div>
                  <p className="text-xs" style={{ color: MUTED_TEXT }}>{a.email} · Code {a.code}</p>
                </div>
                <Link href={`/agent/agents/${a.id}`} className="text-xs font-bold" style={{ color: PREMIUM_BLUE }}>View profile →</Link>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <Metric label="Active clients" value={a.metrics.activeClients} />
                <Metric label="Open files" value={a.metrics.openFiles} />
                <Metric label="In-progress sales" value={a.metrics.inProgressSales} />
                <Metric label="Revenue" value={`$${a.metrics.revenue.toLocaleString()}`} />
                <Metric label="Commission" value={`$${a.metrics.commission.toLocaleString()}`} />
                <Metric label="Last activity" value={new Date(a.metrics.lastActivity).toLocaleDateString()} />
              </div>
            </div>
          ))}
        </section>

        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm" style={{ color: MUTED_TEXT }}>
            No agents match these filters.
          </div>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">HQ Controls</p>
              <h2 className="text-xl font-black" style={{ color: TITLE_TEXT }}>Mirror mode + audit</h2>
              <p className="text-sm" style={{ color: MUTED_TEXT }}>Open any agent profile to mirror their view and inspect activity.</p>
            </div>
            <Link href="/agent/control-tower" className="rounded-full px-4 py-2 text-sm font-bold text-slate-900" style={{ backgroundColor: ACCENT_GOLD }}>
              Open Control Tower
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="text-sm font-bold" style={{ color: TITLE_TEXT }}>{value}</p>
    </div>
  );
}
