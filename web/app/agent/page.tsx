"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { PREMIUM_BLUE, TITLE_TEXT, MUTED_TEXT, ACCENT_GOLD } from "../../src/design/tokens";
import { useAuthStore, isHQ, logout } from "../../src/lib/authStore";

const modules = [
  { id: "clients", title: "Clients", desc: "Traveler profiles, preferences, history", href: "#clients" },
  { id: "proposals", title: "Proposals Builder", desc: "Create, edit, resume", href: "#proposals" },
  { id: "bookings", title: "Bookings", desc: "Flights, hotels, excursions", href: "#bookings" },
  { id: "crm", title: "Light CRM", desc: "Pipeline and statuses", href: "#crm" },
  { id: "performance", title: "Performance", desc: "Active files, conversions", href: "#performance" },
];

export default function AgentDashboardPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hq = isHQ(user);
  const navLinks = useMemo(
    () => [
      { label: "Dashboard", href: "/agent" },
      { label: "Clients", href: "/agent/clients" },
      { label: "Proposals", href: "/agent/proposals" },
      { label: "Purchase Orders", href: "/agent/purchase-orders" },
      { label: "Bookings", href: "/agent/bookings" },
      { label: "Commissions", href: "/agent/commissions" },
      { label: "Yachts", href: "/agent/yachts" },
      { label: "Chat", href: "/agent/chat" },
      ...(hq
        ? [
            { label: "Control Tower", href: "/agent/control-tower" },
            { label: "Finance", href: "/agent/finance" },
            { label: "Agent Command", href: "/agent/agents" },
          ]
        : []),
      { label: "Settings", href: "/agent/settings" },
    ],
    [hq]
  );

  const [mode, setMode] = useState<"manual" | "lina" | "hybrid">("hybrid");
  const [query, setQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState("Unassigned");
  const [scopes, setScopes] = useState<string[]>(["flights", "hotels", "resorts", "excursions", "transfers", "cars", "yachts"]);
  const [auditTrail, setAuditTrail] = useState<string[]>([]);

  const scopeOptions = [
    { key: "flights", label: "Flights" },
    { key: "hotels", label: "Hotels" },
    { key: "resorts", label: "Resorts" },
    { key: "excursions", label: "Excursions" },
    { key: "transfers", label: "Transfers" },
    { key: "cars", label: "Cars" },
    { key: "yachts", label: "Yachts" },
  ];

  const quickActions = [
    { label: "Create flight search", value: "Flight search: add routes, dates, cabin" },
    { label: "Create hotel search", value: "Hotel search: city, dates, board, budget" },
    { label: "Create full trip", value: "Build a 7-day Cancun luxury trip for 2 adults, budget 5k" },
    { label: "Open client file", value: "Open client file and summarize" },
    { label: "Draft proposal", value: "Draft proposal for client with flights + hotel" },
    { label: "Draft email", value: "Prepare follow-up email" },
    { label: "Bookable check", value: "Run bookable check on open trip" },
    { label: "Open Lina Chat", value: "Start Lina chat for this file" },
    { label: "Call Lina (voice)", value: "Call Lina for live assistance" },
  ];

  const modeOptions: { key: "manual" | "lina" | "hybrid"; label: string }[] = [
    { key: "manual", label: "Manual Mode" },
    { key: "lina", label: "Lina AI Mode" },
    { key: "hybrid", label: "Hybrid" },
  ];

  const clients = ["Unassigned", "Martin Dupuis", "HQ – Escapes", "VIP – Lavoie", "Corporate – NovaTech"];

  const toggleScope = (key: string) => {
    setScopes((prev) => (prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]));
  };

  const handleQuickAction = (value: string) => {
    setQuery(value);
    const entry = `${new Date().toLocaleTimeString()} · Quick action queued (${mode}): ${value}`;
    setAuditTrail((prev) => [entry, ...prev].slice(0, 6));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!query.trim()) return;
    const entry = `${new Date().toLocaleTimeString()} · ${mode.toUpperCase()} · Client: ${selectedClient} · Scope: ${scopes.join("/")} · ${query.trim()}`;
    setAuditTrail((prev) => [entry, ...prev].slice(0, 6));
    setQuery(query.trim());
    router.push(`/agent/proposals${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`);
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F3F6FB" }}>
      <div className="mx-auto max-w-6xl px-5 py-8 space-y-8">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Agent Portal</p>
            <h1 className="text-3xl md:text-4xl font-black" style={{ color: TITLE_TEXT }}>
              Zeniva production workspace
            </h1>
            <p className="text-sm md:text-base" style={{ color: MUTED_TEXT }}>
              Reserved for Zeniva agents. Lina runs in production mode to create, compare, and finalize files.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/agent/lina" className="rounded-full px-4 py-2 text-sm font-bold text-white" style={{ backgroundColor: PREMIUM_BLUE }}>
              Open Lina (Agent)
            </Link>
            <Link href="/agent/settings" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold" style={{ color: TITLE_TEXT }}>
              Settings
            </Link>
            <button
              onClick={() => logout("/")}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold hover:border-slate-400"
              style={{ color: TITLE_TEXT }}
              type="button"
            >
              Logout
            </button>
          </div>
        </header>

        <nav className="flex flex-wrap gap-2 text-sm">
          {navLinks.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-800 hover:border-slate-400">
              {item.label}
            </Link>
          ))}
        </nav>

        <section className="grid gap-6">
          <div
            className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-xl p-[1px] md:sticky md:top-4"
          >
            <div className="rounded-[14px] bg-white/90 backdrop-blur-sm p-6">
              <div className="absolute inset-0 -z-10 opacity-40" style={{ background: "radial-gradient(circle at 30% 20%, rgba(59,130,246,0.35), transparent 45%), radial-gradient(circle at 80% 0%, rgba(16,185,129,0.2), transparent 40%)" }}></div>

              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-slate-100 shadow-lg">
                    <img src="/branding/lina-avatar.png" alt="Lina" className="h-full w-full object-cover" />
                    <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border border-white" style={{ backgroundColor: PREMIUM_BLUE }}></span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Lina Agent Command Bar</p>
                    <h2 className="text-2xl font-black" style={{ color: TITLE_TEXT }}>Production-grade control</h2>
                    <p className="text-sm" style={{ color: MUTED_TEXT }}>
                      Hybrid bar for manual provider search + Lina AI. No auto-booking—every action audited and tied to a dossier.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm">
                  <span className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: PREMIUM_BLUE }}></span>
                  Hybrid default · Agent production
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-700">
                {["Compare best nonstop flights", "Draft proposal", "Audit-logged", "Attach to client", "No auto-book", "Voice-ready"].map((pill) => (
                  <span
                    key={pill}
                    className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 shadow-inner"
                  >
                    {pill}
                  </span>
                ))}
              </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:gap-6">
                <div className="flex-1 space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Command / itinerary brief</label>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-inner sm:flex-1">
                      <span className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">/</span>
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Build a 7-day Cancun luxury trip for 2 adults, budget 5k"
                        className="w-full text-sm outline-none"
                        aria-label="Lina Agent command"
                      />
                    </div>
                    <button
                      type="submit"
                      className="whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold text-white shadow-lg sm:self-stretch"
                      style={{ background: "linear-gradient(90deg, #2563eb, #0ea5e9)" }}
                    >
                      Start search
                    </button>
                  </div>
                  <p className="text-xs" style={{ color: MUTED_TEXT }}>
                    Hybrid keeps manual controls active while Lina enriches with AI. Every dispatch is logged; agent validation required before any booking.
                  </p>
                </div>

                <div className="md:w-[320px] space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Mode</p>
                  <div className="grid grid-cols-3 gap-2">
                    {modeOptions.map((option) => {
                      const active = mode === option.key;
                      return (
                        <button
                          type="button"
                          key={option.key}
                          onClick={() => setMode(option.key)}
                          className="rounded-full border px-3 py-2 text-xs font-bold transition"
                          style={{
                            backgroundColor: active ? PREMIUM_BLUE : "#fff",
                            color: active ? "#fff" : TITLE_TEXT,
                            borderColor: active ? PREMIUM_BLUE : "#e2e8f0",
                          }}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs" style={{ color: MUTED_TEXT }}>
                    Manual = structured search; Lina = AI-only; Hybrid = both (default).
                  </p>
                </div>
              </div>

              {mode === "lina" && (
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Choose Lina interface</p>
                      <p className="text-sm" style={{ color: MUTED_TEXT }}>
                        Agent production only. AI chat is separate from agent-to-agent comms. Voice (DID) and audit-ready.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs font-semibold">
                      <Link
                        href="/agent/lina"
                        className="rounded-full border border-slate-300 bg-white px-3 py-1.5 shadow-sm hover:border-slate-400"
                        style={{ color: TITLE_TEXT }}
                      >
                        Lina Agent (production)
                      </Link>
                      <Link
                        href="/agent/lina"
                        className="rounded-full border border-slate-300 bg-slate-900 text-white px-3 py-1.5 shadow-sm hover:border-slate-200"
                      >
                        Open Lina Chat (agent AI)
                      </Link>
                      <Link
                        href="/call"
                        className="rounded-full border border-emerald-300 bg-emerald-600 text-white px-3 py-1.5 shadow-sm hover:border-emerald-200"
                      >
                        Appel Lina (DID)
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Search scope (manual)</p>
                  <div className="flex flex-wrap gap-2">
                    {scopeOptions.map(({ key, label }) => {
                      const active = scopes.includes(key);
                      return (
                        <button
                          type="button"
                          key={key}
                          onClick={() => toggleScope(key)}
                          className="rounded-full border px-3 py-1.5 text-xs font-semibold transition"
                          style={{
                            backgroundColor: active ? "#0f172a" : "#fff",
                            color: active ? "#fff" : TITLE_TEXT,
                            borderColor: active ? "#0f172a" : "#e2e8f0",
                          }}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs" style={{ color: MUTED_TEXT }}>
                    Comparable results stay structured and attachable to the active client dossier.
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Link to client file</p>
                  <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                    <select
                      value={selectedClient}
                      onChange={(e) => setSelectedClient(e.target.value)}
                      className="w-full bg-transparent text-sm outline-none"
                      aria-label="Select client file"
                    >
                      {clients.map((client) => (
                        <option key={client} value={client}>
                          {client}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-xs" style={{ color: MUTED_TEXT }}>
                    All actions are tied to a dossier and mirrored to Audit Log; HQ sees everything.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Quick commands</p>
                <div className="flex flex-wrap gap-2">
                  {quickActions.map(({ label, value }) => (
                    <button
                      type="button"
                      key={label}
                      onClick={() => handleQuickAction(value)}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:border-slate-400 transition"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="submit"
                    className="rounded-full px-4 py-2 text-sm font-bold text-white shadow-lg"
                    style={{ background: "linear-gradient(90deg, #2563eb, #0ea5e9)" }}
                  >
                    Dispatch (no auto-book)
                  </button>
                  <Link
                    href="/agent/lina"
                    className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold bg-white/80 backdrop-blur"
                    style={{ color: TITLE_TEXT }}
                  >
                    Open Lina workspace
                  </Link>
                </div>
                <p className="text-xs" style={{ color: MUTED_TEXT }}>
                  Safety: Lina never books without explicit agent validation; HQ override logged in Audit Log.
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-900/80 text-slate-50 p-3 shadow-lg">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-200">Live audit trail</p>
                <div className="mt-2 space-y-1 text-xs font-semibold">
                  {auditTrail.length === 0 ? (
                    <p className="text-slate-300">Ready. Every command is logged and linked to the selected client.</p>
                  ) : (
                    auditTrail.map((entry, idx) => (
                      <p key={idx} className="truncate">• {entry}</p>
                    ))
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
            <div className="grid gap-4 md:grid-cols-3">
              {modules.map((m) => (
                <div key={m.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4 flex flex-col gap-2 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{m.id}</p>
                  <h3 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>{m.title}</h3>
                  <p className="text-sm" style={{ color: MUTED_TEXT }}>{m.desc}</p>
                  <Link href={m.href} className="text-xs font-bold" style={{ color: PREMIUM_BLUE }}>
                    Open →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Production view</p>
              <h2 className="text-2xl font-black" style={{ color: TITLE_TEXT }}>Pipeline</h2>
              <p className="text-sm" style={{ color: MUTED_TEXT }}>Active files, conversions, revenue (placeholder).</p>
            </div>
            <Link href="#performance" className="rounded-full px-4 py-2 text-sm font-bold text-slate-900" style={{ backgroundColor: ACCENT_GOLD }}>
              Update
            </Link>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3 text-sm">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500">Active files</p>
              <p className="text-2xl font-black" style={{ color: TITLE_TEXT }}>12</p>
              <p className="text-xs" style={{ color: MUTED_TEXT }}>Clients in progress.</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500">Conversions</p>
              <p className="text-2xl font-black" style={{ color: TITLE_TEXT }}>38%</p>
              <p className="text-xs" style={{ color: MUTED_TEXT }}>Last 30 days.</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500">Forecasted revenue</p>
              <p className="text-2xl font-black" style={{ color: TITLE_TEXT }}>$126k</p>
              <p className="text-xs" style={{ color: MUTED_TEXT }}>To be detailed.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
