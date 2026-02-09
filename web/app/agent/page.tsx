"use client";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useRouter, usePathname } from "next/navigation";
import { PREMIUM_BLUE, TITLE_TEXT, MUTED_TEXT, ACCENT_GOLD } from "../../src/design/tokens";
import { useAuthStore, isHQ, logout } from "../../src/lib/authStore";
import { normalizeRbacRole } from "../../src/lib/rbac";
import { toAgentWorkspaceId } from "../../src/lib/agent/agentWorkspace";
import LinaAvatar from "../../src/components/LinaAvatar";

interface HelpTicket {
  ticket: string;
  title: string;
  status: 'open' | 'read';
  messages: { role: string; text: string; ts: string }[];
}

type AccountRecord = {
  id: string;
  name: string;
  email: string;
  role: string;
  roles?: string[];
  createdAt?: string;
};

type AgentRequest = {
  id: string;
  name: string;
  email: string;
  role: string | null;
  status: string;
  code: string | null;
  requested_at?: string;
};

const modules = [
  { id: "clients", title: "Clients", desc: "Traveler profiles, preferences, history", href: "/agent/clients" },
  { id: "proposals", title: "Proposals Builder", desc: "Create, edit, resume", href: "/agent/proposals" },
  { id: "bookings", title: "Bookings", desc: "Flights, hotels, excursions", href: "/agent/bookings" },
  { id: "crm", title: "Light CRM", desc: "Pipeline and statuses", href: "/agent/control-tower" },
  { id: "performance", title: "Performance", desc: "Active files, conversions", href: "/agent/control-tower" },
];

export function AgentDashboardPage({ agentId }: { agentId?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const hq = isHQ(user);
  const roles = user?.roles && user.roles.length ? user.roles : user?.role ? [user.role] : [];
  const effectiveRole = normalizeRbacRole(user?.effectiveRole) || normalizeRbacRole(roles[0]);
  const isInfluencer = effectiveRole === "influencer";
  const isYachtBroker = effectiveRole === "yacht_broker";
  const isHQorAdmin = effectiveRole === "hq" || effectiveRole === "admin" || hq;
  const resolvedAgentId = agentId || toAgentWorkspaceId(user);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (!resolvedAgentId) return;
    try {
      window.localStorage.setItem("zeniva_agent_workspace", resolvedAgentId);
    } catch {
      // ignore
    }
  }, [resolvedAgentId]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [accountsError, setAccountsError] = useState<string | null>(null);
  const [recentTravelers, setRecentTravelers] = useState<AccountRecord[]>([]);
  const [recentPartners, setRecentPartners] = useState<AccountRecord[]>([]);
  const [recentAgentRequests, setRecentAgentRequests] = useState<AgentRequest[]>([]);
  const navLinks = useMemo(() => {
    if (isInfluencer) {
      return [
        { label: "Influencer", href: "/agent/influencer" },
        { label: "Settings", href: "/agent/settings" },
      ];
    }
    if (isYachtBroker && !isHQorAdmin) {
      return [
        { label: "Yacht Desk", href: "/agent/yachts" },
        { label: "Clients", href: "/agent/clients" },
        { label: "Yacht Proposals", href: "/agent/proposals" },
        { label: "Client & Partner Chat", href: "/agent/chat" },
        { label: "Lina AI Desk", href: "/agent/lina" },
        { label: "Settings", href: "/agent/settings" },
      ];
    }
    return [
      { label: "Dashboard", href: "/agent" },
      { label: "Clients", href: "/agent/clients" },
      { label: "Forms", href: "/agent/forms" },
      { label: "Proposals", href: "/agent/proposals" },
      { label: "Purchase Orders", href: "/agent/purchase-orders" },
      { label: "Bookings", href: "/agent/bookings" },
      { label: "Commissions", href: "/agent/commissions" },
      { label: "Client & Partner Chat", href: "/agent/chat" },
      { label: "Lina AI Desk", href: "/agent/lina" },
      ...(isHQorAdmin
        ? [
            { label: "Control Tower", href: "/agent/control-tower" },
            { label: "Finance", href: "/agent/finance" },
            { label: "Agent Command", href: "/agent/agents" },
            { label: "Agent Requests", href: "/agent/requests" },
            { label: "Partners", href: "/agent/partners" },
            { label: "Influencer", href: "/agent/influencer" },
          ]
        : []),
      { label: "Settings", href: "/agent/settings" },
    ];
  }, [isInfluencer, isYachtBroker, isHQorAdmin]);

  const kpiCards = [
    { label: "Active clients", value: "18", delta: "+4 this week" },
    { label: "Open dossiers", value: "27", delta: "12 in progress" },
    { label: "Commission pipeline", value: "$46,280", delta: "$8.2k pending" },
    { label: "Follow-ups due", value: "9", delta: "Next 48 hours" },
  ];

  const clientFocus = [
    { name: "Sofia R.", status: "Proposal sent", next: "Follow-up today", value: "$18,400", last: "Lina chat · 2h" },
    { name: "Daniel K.", status: "Confirmed", next: "Collect final payment", value: "$9,950", last: "Payment · 1d" },
    { name: "Maya L.", status: "Prospect", next: "Needs dates", value: "$6,800", last: "Email · 4h" },
    { name: "Arjun S.", status: "In planning", next: "Send hotel options", value: "$12,300", last: "Call · 6h" },
  ];

  const dossierPipeline = [
    { title: "Tulum escape · 7 nights", stage: "Proposal", due: "Today", owner: "Sofia R." },
    { title: "Miami yacht weekend", stage: "Confirmed", due: "Feb 12", owner: "Daniel K." },
    { title: "Paris fashion week", stage: "In planning", due: "Feb 14", owner: "Maya L." },
    { title: "Bora Bora anniversary", stage: "Prospect", due: "Feb 16", owner: "Arjun S." },
  ];

  const chatQueue = [
    { name: "Sofia R.", subject: "Airport transfer updates", time: "4m", channel: "Chat" },
    { name: "Maya L.", subject: "Best dates for villas", time: "18m", channel: "Email" },
    { name: "Private YCN", subject: "Quote revision", time: "42m", channel: "Chat" },
  ];

  const accountingSnapshot = [
    { label: "Commissions earned", value: "$12,480" },
    { label: "Revenue generated", value: "$248,900" },
    { label: "Payments pending", value: "$31,200" },
    { label: "Client balances", value: "$4,680" },
  ];

  const timeline = [
    { label: "Final payment due · Daniel K.", when: "Today" },
    { label: "Flight ticketing · Sofia R.", when: "Tomorrow" },
    { label: "Proposal review · Maya L.", when: "Feb 10" },
    { label: "Commission payout · Week 7", when: "Feb 14" },
  ];

  const toolLinks = [
    { label: "Create proposal", href: "/agent/proposals" },
    { label: "Client profiles", href: "/agent/clients" },
    { label: "Bookings center", href: "/agent/bookings" },
    { label: "Commissions", href: "/agent/commissions" },
    { label: "Documents", href: "/agent/documents" },
  ];

  const visibleModules = useMemo(() => {
    if (isInfluencer) return [] as typeof modules;
    if (isYachtBroker && !isHQorAdmin) {
      return [
        { id: "yachts", title: "Yacht Desk", desc: "Charter files, quotes, and yacht inventory", href: "/agent/yachts" },
      ];
    }
    return modules;
  }, [isInfluencer, isYachtBroker, isHQorAdmin]);

  const [query, setQuery] = useState("");
  const [selectedClient] = useState("Unassigned");
  const [scopes, setScopes] = useState<string[]>(["flights", "hotels", "resorts", "excursions", "transfers", "cars", "yachts"]);
  const [auditTrail, setAuditTrail] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'flights' | 'hotels' | 'transfers'>('flights');
  const [flightFields, setFlightFields] = useState({
    from: '',
    to: '',
    departDate: '',
    returnDate: '',
    passengers: 1,
    cabin: 'economy'
  });
  const [hotelFields, setHotelFields] = useState({
    destination: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    rooms: 1
  });
  const [transferFields, setTransferFields] = useState({
    pickup: '',
    dropoff: '',
    date: '',
    time: '',
    passengers: 1
  });

  useEffect(() => {
    const checkUnread = () => {
      const helpTickets: HelpTicket[] = JSON.parse(localStorage.getItem('helpTickets') || '[]');
      const unread = helpTickets.filter((ticket) => ticket.status === 'open').length;
      setUnreadCount(unread);
    };

    checkUnread();
    const interval = setInterval(checkUnread, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!hq) return;
    let active = true;
    const load = async () => {
      setAccountsLoading(true);
      setAccountsError(null);
      try {
        const [accountsRes, requestsRes] = await Promise.all([
          fetch("/api/accounts"),
          fetch("/api/agent-requests"),
        ]);

        const accountsPayload = await accountsRes.json();
        const requestsPayload = await requestsRes.json();

        if (!accountsRes.ok) throw new Error(accountsPayload?.error || "Failed to load accounts");
        if (!requestsRes.ok) throw new Error(requestsPayload?.error || "Failed to load agent requests");

        if (!active) return;

        const accounts = Array.isArray(accountsPayload?.data) ? accountsPayload.data : [];
        const requests = Array.isArray(requestsPayload?.data) ? requestsPayload.data : [];

        const toRoles = (account: AccountRecord) =>
          Array.isArray(account.roles) && account.roles.length
            ? account.roles
            : account.role
              ? [account.role]
              : [];

        const travelers = accounts
          .filter((a: AccountRecord) => toRoles(a).includes("traveler"))
          .slice(0, 6);
        const partners = accounts
          .filter((a: AccountRecord) => {
            const roles = toRoles(a);
            return roles.includes("partner_owner") || roles.includes("partner_staff");
          })
          .slice(0, 6);

        const pendingRequests = requests
          .filter((r: AgentRequest) => r.status === "pending")
          .slice(0, 6);

        setRecentTravelers(travelers);
        setRecentPartners(partners);
        setRecentAgentRequests(pendingRequests);
      } catch (err) {
        if (!active) return;
        setAccountsError(err instanceof Error ? err.message : "Failed to load HQ data");
      } finally {
        if (active) setAccountsLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [hq]);

  const handlePrimarySubmit = () => {
    let q = '';
    if (activeTab === 'flights') {
      q = `Flight search: from ${flightFields.from} to ${flightFields.to}, depart ${flightFields.departDate}, return ${flightFields.returnDate}, ${flightFields.passengers} passengers, ${flightFields.cabin} class`;
    } else if (activeTab === 'hotels') {
      q = `Hotel search: ${hotelFields.destination}, check-in ${hotelFields.checkIn}, check-out ${hotelFields.checkOut}, ${hotelFields.guests} guests, ${hotelFields.rooms} rooms`;
    } else if (activeTab === 'transfers') {
      q = `Transfer search: pickup ${transferFields.pickup}, dropoff ${transferFields.dropoff}, date ${transferFields.date}, time ${transferFields.time}, ${transferFields.passengers} passengers`;
    }
    if (!q.trim()) return;
    const entry = `${new Date().toLocaleTimeString()} · PRIMARY · Client: ${selectedClient} · Scope: ${scopes.join("/")} · ${q.trim()}`;
    setAuditTrail((prev) => [entry, ...prev].slice(0, 6));
    router.push(`/agent/proposals?q=${encodeURIComponent(q.trim())}`);
  };

  const submitHybrid = () => {
    if (!query.trim()) return;
    const entry = `${new Date().toLocaleTimeString()} · HYBRID · Client: ${selectedClient} · Scope: ${scopes.join("/")} · ${query.trim()}`;
    setAuditTrail((prev) => [entry, ...prev].slice(0, 6));
    setQuery(query.trim());
    router.push(`/agent/proposals${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`);
  };

  const handleHybridSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitHybrid();
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F3F6FB" }}>
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:w-72">
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Navigation</p>
              <div className="mt-4 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="relative flex items-center justify-between rounded-2xl border border-slate-900 bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  <span>Create trip search</span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-200">New</span>
                </button>
                {navLinks.map((item) => {
                  const active = pathname === item.href || (item.href !== "/agent" && pathname?.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`relative flex items-center justify-between rounded-2xl border px-3 py-2 text-sm font-semibold transition ${
                        active
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                      }`}
                    >
                      <span>{item.label}</span>
                      {item.href === "/agent/chat" && unreadCount > 0 && (
                        <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${active ? "bg-white text-slate-900" : "bg-red-500 text-white"}`}>
                          {unreadCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </aside>

          <div className="flex-1 space-y-8">
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

            <nav className="hidden flex-wrap items-center gap-2 text-sm lg:flex">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm"
              >
                Create trip search
              </button>
              {navLinks.map((item) => (
                <Link key={item.href} href={item.href} className="relative rounded-full border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-800 hover:border-slate-400">
                  {item.label}
                  {item.href === "/agent/chat" && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              ))}
            </nav>

            <nav className="flex flex-wrap gap-2 text-sm lg:hidden">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm"
              >
                Create trip search
              </button>
              {navLinks.map((item) => (
                <Link key={item.href} href={item.href} className="relative rounded-full border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-800 hover:border-slate-400">
                  {item.label}
                  {item.href === "/agent/chat" && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              ))}
            </nav>

        {hq && (
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 space-y-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">HQ Console</p>
                <h2 className="text-xl font-black" style={{ color: TITLE_TEXT }}>New account activity</h2>
                <p className="text-sm" style={{ color: MUTED_TEXT }}>Travelers, partners, and agent requests in one place.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/agent/requests"
                  className="rounded-full px-4 py-2 text-sm font-semibold text-white"
                  style={{ backgroundColor: PREMIUM_BLUE }}
                >
                  Review agent requests
                </Link>
                <Link
                  href="/agent/agents"
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold"
                  style={{ color: TITLE_TEXT }}
                >
                  Agent Command
                </Link>
              </div>
            </div>

            {accountsError && <div className="text-sm text-rose-600">{accountsError}</div>}

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold" style={{ color: TITLE_TEXT }}>New travelers</h3>
                  <Link href="/agent/clients" className="text-xs font-semibold" style={{ color: PREMIUM_BLUE }}>
                    View clients
                  </Link>
                </div>
                <div className="mt-3 space-y-2 text-xs">
                  {accountsLoading ? (
                    <div style={{ color: MUTED_TEXT }}>Loading…</div>
                  ) : recentTravelers.length ? (
                    recentTravelers.map((t) => (
                      <div key={t.id} className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">{t.name}</span>
                        <span className="text-slate-500">{t.email}</span>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: MUTED_TEXT }}>No new travelers.</div>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold" style={{ color: TITLE_TEXT }}>New partners</h3>
                  <Link href="/agent/partners" className="text-xs font-semibold" style={{ color: PREMIUM_BLUE }}>
                    View partners
                  </Link>
                </div>
                <div className="mt-3 space-y-2 text-xs">
                  {accountsLoading ? (
                    <div style={{ color: MUTED_TEXT }}>Loading…</div>
                  ) : recentPartners.length ? (
                    recentPartners.map((p) => (
                      <div key={p.id} className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">{p.name}</span>
                        <span className="text-slate-500">{p.email}</span>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: MUTED_TEXT }}>No new partners.</div>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold" style={{ color: TITLE_TEXT }}>Agent requests</h3>
                  <Link href="/agent/requests" className="text-xs font-semibold" style={{ color: PREMIUM_BLUE }}>
                    Review
                  </Link>
                </div>
                <div className="mt-3 space-y-2 text-xs">
                  {accountsLoading ? (
                    <div style={{ color: MUTED_TEXT }}>Loading…</div>
                  ) : recentAgentRequests.length ? (
                    recentAgentRequests.map((r) => (
                      <div key={r.id} className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">{r.name}</span>
                        <span className="text-slate-500">{r.email}</span>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: MUTED_TEXT }}>No pending requests.</div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 space-y-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Agent Command Center</p>
                <h2 className="text-2xl font-black" style={{ color: TITLE_TEXT }}>Live operations overview</h2>
                <p className="text-sm" style={{ color: MUTED_TEXT }}>Real-time workload, revenue, and client activity in one cockpit.</p>
                {resolvedAgentId && (
                  <p className="mt-2 text-xs font-semibold text-slate-500">Workspace URL: /agent/{resolvedAgentId}</p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold"
                  style={{ color: TITLE_TEXT }}
                >
                  Create trip search
                </button>
                <Link href="/agent/chat" className="rounded-full px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: PREMIUM_BLUE }}>
                  Open chat hub
                </Link>
                <Link href="/agent/proposals" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold" style={{ color: TITLE_TEXT }}>
                  Proposals
                </Link>
                <Link href="/agent/clients" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold" style={{ color: TITLE_TEXT }}>
                  Clients
                </Link>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              {kpiCards.map((card) => (
                <div key={card.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{card.label}</div>
                  <div className="mt-2 text-2xl font-black" style={{ color: TITLE_TEXT }}>{card.value}</div>
                  <div className="text-xs font-semibold text-slate-500">{card.delta}</div>
                </div>
              ))}
            </div>

            <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
              <div className="space-y-5">
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold" style={{ color: TITLE_TEXT }}>Client 360° view</h3>
                    <Link href="/agent/clients" className="text-xs font-semibold" style={{ color: PREMIUM_BLUE }}>Manage clients</Link>
                  </div>
                  <div className="mt-4 space-y-3">
                    {clientFocus.map((client) => (
                      <div key={client.name} className="flex flex-col gap-2 rounded-lg border border-slate-100 bg-slate-50 p-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="text-sm font-semibold text-slate-800">{client.name}</div>
                          <div className="text-xs text-slate-500">{client.status} · {client.last}</div>
                        </div>
                        <div className="text-xs font-semibold text-slate-600">{client.next}</div>
                        <div className="text-sm font-bold" style={{ color: TITLE_TEXT }}>{client.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold" style={{ color: TITLE_TEXT }}>Dossier pipeline</h3>
                    <Link href="/agent/proposals" className="text-xs font-semibold" style={{ color: PREMIUM_BLUE }}>Open pipeline</Link>
                  </div>
                  <div className="mt-4 space-y-3">
                    {dossierPipeline.map((item) => (
                      <div key={item.title} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
                        <div>
                          <div className="text-sm font-semibold text-slate-800">{item.title}</div>
                          <div className="text-xs text-slate-500">Owner: {item.owner}</div>
                        </div>
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">{item.stage}</span>
                        <div className="text-xs font-semibold text-slate-500">Due: {item.due}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold" style={{ color: TITLE_TEXT }}>Agent activity log</h3>
                    <span className="text-xs font-semibold text-slate-500">Audit trail</span>
                  </div>
                  <div className="mt-4 space-y-2 text-xs text-slate-600">
                    {(auditTrail.length ? auditTrail : ["No actions logged yet."]).map((entry, idx) => (
                      <div key={`${entry}-${idx}`} className="rounded-md border border-slate-100 bg-slate-50 px-3 py-2">
                        {entry}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold" style={{ color: TITLE_TEXT }}>Client & partner chat</h3>
                    <Link href="/agent/chat" className="text-xs font-semibold" style={{ color: PREMIUM_BLUE }}>Open inbox</Link>
                  </div>
                  <div className="mt-4 space-y-3">
                    {chatQueue.map((item) => (
                      <div key={`${item.name}-${item.subject}`} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                        <div className="text-sm font-semibold text-slate-800">{item.name}</div>
                        <div className="text-xs text-slate-500">{item.subject}</div>
                        <div className="text-xs font-semibold text-slate-500">{item.channel} · {item.time}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold" style={{ color: TITLE_TEXT }}>Accounting snapshot</h3>
                    <Link href="/agent/commissions" className="text-xs font-semibold" style={{ color: PREMIUM_BLUE }}>Finance</Link>
                  </div>
                  <div className="mt-4 grid gap-3">
                    {accountingSnapshot.map((item) => (
                      <div key={item.label} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                        <span className="text-xs font-semibold text-slate-500">{item.label}</span>
                        <span className="text-sm font-bold" style={{ color: TITLE_TEXT }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold" style={{ color: TITLE_TEXT }}>Timeline & deadlines</h3>
                    <Link href="/agent/trips" className="text-xs font-semibold" style={{ color: PREMIUM_BLUE }}>Calendar</Link>
                  </div>
                  <div className="mt-4 space-y-3 text-xs text-slate-600">
                    {timeline.map((item) => (
                      <div key={item.label} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                        <span>{item.label}</span>
                        <span className="font-semibold text-slate-500">{item.when}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <div className="text-sm font-bold" style={{ color: TITLE_TEXT }}>Operational tools</div>
                  <div className="mt-3 grid gap-2">
                    {toolLinks.map((item) => (
                      <Link key={item.href} href={item.href} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white">
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {searchOpen && (
            <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 px-4 py-10">
              <div className="w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Trip search</p>
                    <h3 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>Create a new travel search</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href="/agent/agent-info"
                      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                    >
                      Partner catalog
                    </Link>
                    <button
                      type="button"
                      onClick={() => setSearchOpen(false)}
                      className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600"
                    >
                      Close
                    </button>
                  </div>
                </div>
                <div className="px-6 py-6">
                  <div
                    className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-xl p-[1px]"
                  >
                    <div className="rounded-[14px] bg-white/90 backdrop-blur-sm p-8 md:p-10 min-h-[520px]">
                      <div className="absolute inset-0 -z-10 opacity-40 bg-blue-500/20"></div>

              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <Link
                    href="/agent/lina/chat"
                    className="relative h-40 w-40 overflow-hidden rounded-2xl border border-slate-100 shadow-lg transition hover:shadow-xl"
                    aria-label="Open Lina AI chat"
                  >
                    <LinaAvatar size="lg" className="h-full w-full" />
                    <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border border-white" style={{ backgroundColor: PREMIUM_BLUE }}></span>
                  </Link>
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
                  <span>Hybrid default · Agent production</span>
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

                      <form onSubmit={handleHybridSubmit} className="mt-6 space-y-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:gap-6">
                  <div className="flex-1 space-y-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Primary Search Bar — Classic</p>
                      <div className="mb-4 flex flex-wrap items-center gap-2">
                        <div className="flex gap-1">
                          {['flights', 'hotels', 'transfers'].map(tab => (
                            <button
                              key={tab}
                              type="button"
                              onClick={() => setActiveTab(tab as 'flights' | 'hotels' | 'transfers')}
                              className={`rounded-full px-4 py-2 text-sm font-semibold ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-700'}`}
                            >
                              {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                          ))}
                        </div>
                        <Link
                          href="/agent/agent-info"
                          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                        >
                          Partner catalog
                        </Link>
                      </div>
                      {activeTab === 'flights' && (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                          <div>
                            <label className="text-xs font-semibold text-slate-500">From</label>
                            <input
                              type="text"
                              value={flightFields.from}
                              onChange={e => setFlightFields({...flightFields, from: e.target.value})}
                              placeholder="Departure city"
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-slate-500">To</label>
                            <input
                              type="text"
                              value={flightFields.to}
                              onChange={e => setFlightFields({...flightFields, to: e.target.value})}
                              placeholder="Arrival city"
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-slate-500">Depart Date</label>
                            <input
                              type="date"
                              value={flightFields.departDate}
                              onChange={e => setFlightFields({...flightFields, departDate: e.target.value})}
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-slate-500">Return Date</label>
                            <input
                              type="date"
                              value={flightFields.returnDate}
                              onChange={e => setFlightFields({...flightFields, returnDate: e.target.value})}
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-slate-500">Passengers</label>
                            <input
                              type="number"
                              value={flightFields.passengers}
                              onChange={e => setFlightFields({...flightFields, passengers: parseInt(e.target.value) || 1})}
                              min="1"
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-slate-500">Cabin Class</label>
                            <select
                              value={flightFields.cabin}
                              onChange={e => setFlightFields({...flightFields, cabin: e.target.value})}
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            >
                              <option value="economy">Economy</option>
                              <option value="premium">Premium Economy</option>
                              <option value="business">Business</option>
                              <option value="first">First</option>
                            </select>
                          </div>
                        </div>
                      )}
                      {activeTab === 'hotels' && (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                          <div>
                            <label className="text-xs font-semibold text-slate-500">Destination</label>
                            <input
                              type="text"
                              value={hotelFields.destination}
                              onChange={e => setHotelFields({...hotelFields, destination: e.target.value})}
                              placeholder="City or hotel name"
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-slate-500">Check-in</label>
                            <input
                              type="date"
                              value={hotelFields.checkIn}
                              onChange={e => setHotelFields({...hotelFields, checkIn: e.target.value})}
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-slate-500">Check-out</label>
                            <input
                              type="date"
                              value={hotelFields.checkOut}
                              onChange={e => setHotelFields({...hotelFields, checkOut: e.target.value})}
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-slate-500">Guests</label>
                            <input
                              type="number"
                              value={hotelFields.guests}
                              onChange={e => setHotelFields({...hotelFields, guests: parseInt(e.target.value) || 1})}
                              min="1"
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-slate-500">Rooms</label>
                            <input
                              type="number"
                              value={hotelFields.rooms}
                              onChange={e => setHotelFields({...hotelFields, rooms: parseInt(e.target.value) || 1})}
                              min="1"
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />
                          </div>
                        </div>
                      )}
                      {activeTab === 'transfers' && (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                          <div>
                            <label className="text-xs font-semibold text-slate-500">Pickup Location</label>
                            <input
                              type="text"
                              value={transferFields.pickup}
                              onChange={e => setTransferFields({...transferFields, pickup: e.target.value})}
                              placeholder="Pickup address"
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-slate-500">Dropoff Location</label>
                            <input
                              type="text"
                              value={transferFields.dropoff}
                              onChange={e => setTransferFields({...transferFields, dropoff: e.target.value})}
                              placeholder="Dropoff address"
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-slate-500">Date</label>
                            <input
                              type="date"
                              value={transferFields.date}
                              onChange={e => setTransferFields({...transferFields, date: e.target.value})}
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-slate-500">Time</label>
                            <input
                              type="time"
                              value={transferFields.time}
                              onChange={e => setTransferFields({...transferFields, time: e.target.value})}
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-slate-500">Passengers</label>
                            <input
                              type="number"
                              value={transferFields.passengers}
                              onChange={e => setTransferFields({...transferFields, passengers: parseInt(e.target.value) || 1})}
                              min="1"
                              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />
                          </div>
                        </div>
                      )}
                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={handlePrimarySubmit}
                          className="rounded-full px-6 py-3 text-sm font-bold text-white shadow-lg"
                          style={{ background: "linear-gradient(90deg, #2563eb, #0ea5e9)" }}
                        >
                          Start Classic Search
                        </button>
                      </div>
                    </div>
                    <div className="border-t border-slate-200 pt-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Hybrid Search — AI-Assisted</p>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 mt-2">
                        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-inner sm:flex-1">
                          <span className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">/</span>
                          <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Build a 7-day Cancun trip for 2 adults, budget 5k"
                            className="w-full text-sm outline-none"
                            aria-label="Hybrid search command"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={submitHybrid}
                          className="whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold text-white shadow-lg sm:self-stretch"
                          style={{ background: "linear-gradient(90deg, #2563eb, #0ea5e9)" }}
                        >
                          Start Hybrid Search
                        </button>
                      </div>
                      <p className="text-xs mt-2" style={{ color: MUTED_TEXT }}>
                        Hybrid = Human control + Lina intelligence. Assists with ideas and speeds up manual work.
                      </p>
                    </div>
                  </div>
                  <div className="md:w-[320px] space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Live audit trail</p>
                    <div className="rounded-xl border border-slate-100 bg-slate-900/80 text-slate-50 p-3 shadow-lg">
                      <div className="space-y-1 text-xs font-semibold">
                        {auditTrail.length === 0 ? (
                          <p className="text-slate-300">Ready. Every command is logged and linked to the selected client.</p>
                        ) : (
                          auditTrail.map((entry, idx) => (
                            <p key={idx} className="truncate">• {entry}</p>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {visibleModules.map((m) => (
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

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Production view</p>
              <h2 className="text-2xl font-black" style={{ color: TITLE_TEXT }}>Pipeline</h2>
              <p className="text-sm" style={{ color: MUTED_TEXT }}>Active files, conversions, revenue (placeholder).</p>
            </div>
            <Link href="/agent/control-tower" className="rounded-full px-4 py-2 text-sm font-bold text-slate-900" style={{ backgroundColor: ACCENT_GOLD }}>
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
        </div>
      </div>
    </div>
  </div>
    </main>
  );
}

export default function AgentRootPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hq = isHQ(user);
  const agentId = toAgentWorkspaceId(user);

  useEffect(() => {
    if (agentId && !hq) {
      router.replace(`/agent/${agentId}`);
    }
  }, [agentId, hq, router]);

  if (agentId && !hq) return null;
  return <AgentDashboardPage />;
}
