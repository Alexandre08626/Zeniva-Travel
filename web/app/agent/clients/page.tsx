"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { listClients, addClient } from "../../../src/lib/agent/store";
import { useAuthStore } from "../../../src/lib/authStore";
import { TITLE_TEXT, MUTED_TEXT, PREMIUM_BLUE } from "../../../src/design/tokens";

export default function ClientsPage() {
  const user = useAuthStore((s) => s.user);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [division, setDivision] = useState("TRAVEL");
  const [agentEmail, setAgentEmail] = useState("");
  const [clientsState, setClientsState] = useState(listClients());
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clients = useMemo(() => clientsState, [clientsState]);

  const handleCreate = () => {
    setError(null);
    setMessage(null);
    if (!name.trim()) {
      setError("Client name is required.");
      return;
    }
    if (!email.trim()) {
      setError("Client email is required.");
      return;
    }
    if (!phone.trim()) {
      setError("Phone number is required.");
      return;
    }
    const entry = addClient({
      name: name.trim(),
      email: email.trim(),
      ownerEmail: user?.email || "agent@zeniva.ca",
      phone: phone.trim(),
      primaryDivision: division as any,
      assignedAgent: agentEmail.trim() || undefined,
    });
    setClientsState(listClients());
    setName("");
    setEmail("");
    setPhone("");
    setAgentEmail("");
    setMessage(
      `Client created (${entry.id}). Commission rule: ${entry.assignedAgents && entry.assignedAgents.length > 0 ? "agent commission applies" : "100% Zeniva Travel"}.`
    );
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F3F6FB" }}>
      <div className="mx-auto max-w-5xl px-5 py-8 space-y-6">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Clients</p>
            <h1 className="text-3xl font-black" style={{ color: TITLE_TEXT }}>Client roster</h1>
            <p className="text-sm" style={{ color: MUTED_TEXT }}>All clients booked via Zeniva. Assign an agent to trigger commission; otherwise 100% Zeniva Travel.</p>
          </div>
          <Link href="/agent/trips" className="rounded-full px-4 py-2 text-sm font-bold text-white" style={{ backgroundColor: PREMIUM_BLUE }}>
            View trips
          </Link>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-12 md:items-end">
            <label className="md:col-span-3 flex flex-col text-sm font-semibold" style={{ color: TITLE_TEXT }}>
              Client name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Client or company name"
              />
            </label>
            <label className="md:col-span-2 flex flex-col text-sm font-semibold" style={{ color: TITLE_TEXT }}>
              Client email
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="client@email.com"
              />
            </label>
            <label className="md:col-span-2 flex flex-col text-sm font-semibold" style={{ color: TITLE_TEXT }}>
              Phone number
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="+1 (555) 555-5555"
              />
            </label>
            <label className="md:col-span-1 flex flex-col text-sm font-semibold" style={{ color: TITLE_TEXT }}>
              Division
              <select
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="TRAVEL">Travel</option>
                <option value="YACHT">Yacht</option>
              </select>
            </label>
            <label className="md:col-span-2 flex flex-col text-sm font-semibold" style={{ color: TITLE_TEXT }}>
              Assigned agent (optional)
              <input
                value={agentEmail}
                onChange={(e) => setAgentEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="agent@zeniva.ca"
              />
            </label>
            <div className="md:col-span-2 flex items-end">
              <button
                type="button"
                onClick={handleCreate}
                className="h-[42px] w-full rounded-full px-4 py-2 text-sm font-bold text-white md:w-auto md:justify-self-end"
                style={{ backgroundColor: PREMIUM_BLUE }}
              >
                Create client
              </button>
            </div>
          </div>
          <p className="text-xs" style={{ color: MUTED_TEXT }}>
            Commission rule: if a client is assigned to an agent, that agent commission applies; otherwise 100% goes to Zeniva Travel.
          </p>
          {message && <p className="text-sm font-semibold text-emerald-600">{message}</p>}
          {error && <p className="text-sm font-semibold text-rose-600">{error}</p>}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 space-y-3">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-600">
                  <th className="pb-2 pr-3">Client</th>
                  <th className="pb-2 pr-3">Email</th>
                  <th className="pb-2 pr-3">Phone</th>
                  <th className="pb-2 pr-3">Division</th>
                  <th className="pb-2 pr-3">Owner</th>
                  <th className="pb-2 pr-3">Origin</th>
                  <th className="pb-2 pr-3">Assigned</th>
                  <th className="pb-2 pr-3">Commission</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c.id} className="border-t border-slate-100">
                    <td className="py-2 pr-3" style={{ color: TITLE_TEXT }}>{c.name}</td>
                    <td className="py-2 pr-3 text-xs" style={{ color: MUTED_TEXT }}>{c.email || "-"}</td>
                    <td className="py-2 pr-3 text-xs" style={{ color: MUTED_TEXT }}>{c.phone || "-"}</td>
                    <td className="py-2 pr-3 text-xs font-semibold"><span className="rounded-full bg-slate-100 px-2 py-1">{c.primaryDivision || "TRAVEL"}</span></td>
                    <td className="py-2 pr-3" style={{ color: TITLE_TEXT }}>{c.ownerEmail}</td>
                    <td className="py-2 pr-3 text-xs font-semibold"><span className="rounded-full bg-slate-100 px-2 py-1">{c.origin}</span></td>
                    <td className="py-2 pr-3 text-xs" style={{ color: MUTED_TEXT }}>{c.assignedAgents?.join(", ") || "-"}</td>
                    <td className="py-2 pr-3 text-xs" style={{ color: MUTED_TEXT }}>
                      {c.assignedAgents && c.assignedAgents.length > 0 ? "Agent commission" : "100% Zeniva Travel"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
