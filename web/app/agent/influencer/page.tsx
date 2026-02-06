"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRequirePermission } from "../../../src/lib/roleGuards";
import { TITLE_TEXT, MUTED_TEXT, PREMIUM_BLUE } from "../../../src/design/tokens";
import { normalizeRbacRole } from "../../../src/lib/rbac";

type InfluencerForm = {
  id: string;
  slug: string;
  title: string;
  created_at?: string;
};

type InfluencerLead = {
  id: string;
  traveler_name?: string;
  traveler_email?: string;
  phone?: string;
  destination?: string;
  start_date?: string;
  end_date?: string;
  budget?: string;
  notes?: string;
  created_at?: string;
};

type CommissionLine = {
  booking_id?: string;
  traveler_email?: string;
  amount?: number | string;
  currency?: string;
  booking_date?: string;
  status?: string;
};

type PayoutLine = {
  id: string;
  amount: number | string;
  currency: string;
  status: string;
  paid_at?: string;
  created_at?: string;
};

type AccountRecord = {
  id: string;
  name: string;
  email: string;
  role: string;
  roles?: string[];
};

export default function InfluencerDashboardPage() {
  const user = useRequirePermission("referrals:read", "/agent");
  const roles = user?.roles && user.roles.length ? user.roles : user?.role ? [user.role] : [];
  const effectiveRole = normalizeRbacRole(user?.effectiveRole) || normalizeRbacRole(roles[0]);
  const isHQorAdmin = effectiveRole === "hq" || effectiveRole === "admin";

  const [activeTab, setActiveTab] = useState<"overview" | "forms" | "assets" | "money" | "support">("overview");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedInfluencer, setSelectedInfluencer] = useState("");
  const [accounts, setAccounts] = useState<AccountRecord[]>([]);
  const [forms, setForms] = useState<InfluencerForm[]>([]);
  const [leads, setLeads] = useState<InfluencerLead[]>([]);
  const [commissions, setCommissions] = useState<CommissionLine[]>([]);
  const [payouts, setPayouts] = useState<PayoutLine[]>([]);
  const [stats, setStats] = useState({
    referralCode: "",
    clicks: 0,
    signups: 0,
    leads: 0,
    bookings: 0,
    commissionTotal: 0,
    commissionPending: 0,
    commissionApproved: 0,
    commissionPaid: 0,
    commissionRate: 0,
  });

  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [formMessage, setFormMessage] = useState<string | null>(null);

  const referralLink = stats.referralCode
    ? `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.zenivatravel.com"}?ref=${encodeURIComponent(stats.referralCode)}`
    : "";

  const shareBase = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.zenivatravel.com").replace(/\/$/, "");

  const loadDashboard = () => {
    if (!user) return;
    const params = new URLSearchParams();
    if (startDate) params.set("start", startDate);
    if (endDate) params.set("end", endDate);
    if (isHQorAdmin && selectedInfluencer) params.set("email", selectedInfluencer);
    const query = params.toString();
    fetch(`/api/influencer/dashboard${query ? `?${query}` : ""}`)
      .then((res) => res.json())
      .then((payload) => {
        if (!payload?.data) return;
        setStats(payload.data);
        setForms(payload.data.forms || []);
        setLeads(payload.data.leadsList || []);
        setCommissions(payload.data.commissions || []);
        setPayouts(payload.data.payouts || []);
      })
      .catch(() => undefined);
  };

  useEffect(() => {
    loadDashboard();
  }, [user, startDate, endDate, selectedInfluencer]);

  useEffect(() => {
    if (!isHQorAdmin) return;
    fetch("/api/accounts")
      .then((res) => res.json())
      .then((payload) => {
        const records = Array.isArray(payload?.data) ? payload.data : [];
        const filtered = records.filter((acc: AccountRecord) => {
          const roles = Array.isArray(acc.roles) && acc.roles.length ? acc.roles : acc.role ? [acc.role] : [];
          return roles.includes("influencer");
        });
        setAccounts(filtered);
      })
      .catch(() => undefined);
  }, [isHQorAdmin]);

  const handleCreateForm = async () => {
    setFormMessage(null);
    if (!newTitle.trim()) {
      setFormMessage("Form title is required.");
      return;
    }
    const res = await fetch("/api/influencer/forms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle.trim(), slug: newSlug.trim() || undefined, email: selectedInfluencer || undefined }),
    });
    const payload = await res.json();
    if (!res.ok) {
      setFormMessage(payload?.error || "Unable to create form.");
      return;
    }
    setNewTitle("");
    setNewSlug("");
    setFormMessage("Form created. Share the new link below.");
    loadDashboard();
  };

  const copyToClipboard = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setFormMessage("Link copied.");
    } catch {
      setFormMessage("Copy failed. Please select and copy.");
    }
  };

  const metricCards = [
    { label: "Clicks", value: stats.clicks },
    { label: "Leads", value: stats.leads },
    { label: "Signups", value: stats.signups },
    { label: "Bookings", value: stats.bookings },
  ];

  const moneyCards = [
    { label: "Total commission", value: `$${Number(stats.commissionTotal || 0).toLocaleString()}` },
    { label: "Pending", value: `$${Number(stats.commissionPending || 0).toLocaleString()}` },
    { label: "Approved", value: `$${Number(stats.commissionApproved || 0).toLocaleString()}` },
    { label: "Paid", value: `$${Number(stats.commissionPaid || 0).toLocaleString()}` },
  ];

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F3F6FB" }}>
      <div className="mx-auto max-w-6xl px-5 py-8 space-y-6">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Creator Partner Hub</p>
            <h1 className="text-3xl md:text-4xl font-black" style={{ color: TITLE_TEXT }}>Influencer workspace</h1>
            <p className="text-sm" style={{ color: MUTED_TEXT }}>Everything you need to share, track, and get paid with Zeniva Travel.</p>
          </div>
          <div className="flex flex-col gap-2 md:items-end">
            {referralLink && (
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Referral link</div>
                <div className="mt-1 font-semibold break-all" style={{ color: TITLE_TEXT }}>{referralLink}</div>
              </div>
            )}
            {isHQorAdmin && accounts.length > 0 && (
              <select
                value={selectedInfluencer}
                onChange={(e) => setSelectedInfluencer(e.target.value)}
                className="rounded-full border border-slate-200 px-3 py-2 text-xs"
              >
                <option value="">View your influencer profile</option>
                {accounts.map((acc) => (
                  <option key={acc.email} value={acc.email}>{acc.name} · {acc.email}</option>
                ))}
              </select>
            )}
          </div>
        </header>

        <section className="flex flex-wrap gap-2">
          {([
            { key: "overview", label: "Influencer Overview" },
            { key: "forms", label: "Shareable forms" },
            { key: "assets", label: "Brand kit" },
            { key: "money", label: "Sales & money" },
            { key: "support", label: "Support" },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-full px-4 py-2 text-xs font-semibold ${activeTab === tab.key ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-600"}`}
            >
              {tab.label}
            </button>
          ))}
        </section>

        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm h-fit">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Creator Hub</p>
            <div className="mt-3 flex flex-col gap-2">
              {([
                { key: "overview", label: "Influencer Overview" },
                { key: "forms", label: "Shareable forms" },
                { key: "assets", label: "Brand kit" },
                { key: "money", label: "Sales & money" },
                { key: "support", label: "Support" },
              ] as const).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full rounded-xl px-3 py-2 text-left text-xs font-semibold ${activeTab === tab.key ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-700 hover:bg-slate-100"}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </aside>

          <div className="space-y-6">
            {activeTab === "overview" && (
              <section className="space-y-4">
            <div className="grid gap-3 md:grid-cols-4">
              {metricCards.map((card) => (
                <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{card.label}</div>
                  <div className="mt-2 text-2xl font-black" style={{ color: TITLE_TEXT }}>{card.value}</div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <h2 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>Your shareable link</h2>
              <p className="text-sm" style={{ color: MUTED_TEXT }}>Use this in your bio, stories, and highlights. Every lead and booking stays tied to you.</p>
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="text-sm font-semibold break-all" style={{ color: TITLE_TEXT }}>{referralLink || ""}</div>
                {referralLink && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(referralLink)}
                    className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold"
                  >
                    Copy link
                  </button>
                )}
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr]">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>Latest leads</h3>
                <div className="mt-3 space-y-2 text-sm">
                  {leads.length === 0 && <p className="text-slate-500">No leads yet. Share a form link to start collecting.</p>}
                  {leads.slice(0, 4).map((lead) => (
                    <div key={lead.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <div className="font-semibold" style={{ color: TITLE_TEXT }}>{lead.traveler_name || "Traveler"}</div>
                      <p className="text-xs" style={{ color: MUTED_TEXT }}>{lead.destination || "Destination"} · {lead.start_date || ""}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>Commission snapshot</h3>
                <p className="text-sm" style={{ color: MUTED_TEXT }}>Current rate: {stats.commissionRate || 0}%</p>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Pending</span>
                    <span className="font-semibold" style={{ color: TITLE_TEXT }}>${Number(stats.commissionPending || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Approved</span>
                    <span className="font-semibold" style={{ color: TITLE_TEXT }}>${Number(stats.commissionApproved || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Paid</span>
                    <span className="font-semibold" style={{ color: TITLE_TEXT }}>${Number(stats.commissionPaid || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
              </section>
            )}

            {activeTab === "forms" && (
              <section className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>Create a referral form</h2>
              <p className="text-sm" style={{ color: MUTED_TEXT }}>Generate a unique lead capture page for your socials.</p>
              <div className="mt-4 grid gap-3 md:grid-cols-[1.2fr_1fr_auto]">
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Form title (e.g. Luxury Europe 2026)"
                />
                <input
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="Custom slug (optional)"
                />
                <button
                  type="button"
                  onClick={handleCreateForm}
                  className="rounded-full px-4 py-2 text-sm font-semibold text-white"
                  style={{ backgroundColor: PREMIUM_BLUE }}
                >
                  Create form
                </button>
              </div>
              {formMessage && <p className="mt-2 text-xs text-slate-600">{formMessage}</p>}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>Your forms</h3>
              <div className="mt-3 space-y-3 text-sm">
                {forms.length === 0 && <p className="text-slate-500">No forms yet.</p>}
                {forms.map((form) => {
                  const url = `${shareBase}/ref/${stats.referralCode}/${form.slug}`;
                  return (
                    <div key={form.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-semibold" style={{ color: TITLE_TEXT }}>{form.title}</p>
                          <p className="text-xs" style={{ color: MUTED_TEXT }}>{url}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => copyToClipboard(url)}
                            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold"
                          >
                            Copy link
                          </button>
                          <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold"
                          >
                            Preview
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>Leads collected</h3>
              <div className="overflow-x-auto mt-3">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-500">
                      <th className="pb-2 pr-3">Traveler</th>
                      <th className="pb-2 pr-3">Destination</th>
                      <th className="pb-2 pr-3">Dates</th>
                      <th className="pb-2 pr-3">Budget</th>
                      <th className="pb-2 pr-3">Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.length === 0 && (
                      <tr><td colSpan={5} className="py-2 text-slate-500">No leads yet.</td></tr>
                    )}
                    {leads.map((lead) => (
                      <tr key={lead.id} className="border-t border-slate-100">
                        <td className="py-2 pr-3" style={{ color: TITLE_TEXT }}>{lead.traveler_name || "Traveler"}</td>
                        <td className="py-2 pr-3 text-slate-600">{lead.destination || "-"}</td>
                        <td className="py-2 pr-3 text-slate-600">{lead.start_date || ""}{lead.end_date ? ` → ${lead.end_date}` : ""}</td>
                        <td className="py-2 pr-3 text-slate-600">{lead.budget || "-"}</td>
                        <td className="py-2 pr-3 text-slate-500 text-xs">{lead.created_at ? new Date(lead.created_at).toLocaleDateString() : ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
              </section>
            )}

            {activeTab === "assets" && (
              <section className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>Brand kit</h2>
              <p className="text-sm" style={{ color: MUTED_TEXT }}>Use these assets to keep Zeniva presentation consistent and premium.</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Logo pack</p>
                  <div className="mt-3 flex items-center gap-3">
                    <img src="/branding/logo.svg" alt="Zeniva logo" className="h-10" />
                    <img src="/branding/logo.png" alt="Zeniva logo dark" className="h-10" />
                  </div>
                  <div className="mt-3 flex gap-2 text-xs">
                    <a href="/branding/logo.svg" className="rounded-full border border-slate-200 px-3 py-1">Download SVG</a>
                    <a href="/branding/logo.png" className="rounded-full border border-slate-200 px-3 py-1">Download PNG</a>
                  </div>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Color palette</p>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <div className="rounded-lg border border-slate-200 bg-white p-2">Midnight #0F172A</div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2">Ocean #1D4ED8</div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2">Pearl #F8FAFC</div>
                  </div>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Typography</p>
                  <div className="mt-3 space-y-2 text-xs" style={{ color: MUTED_TEXT }}>
                    <p>Headlines: Editorial serif (Playfair Display or equivalent)</p>
                    <p>Body: Clean sans (Inter or equivalent)</p>
                    <p>Use generous spacing and high contrast for trust.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>Approved captions</h3>
              <ul className="mt-3 space-y-2 text-sm" style={{ color: MUTED_TEXT }}>
                <li>“Planning a once-in-a-lifetime escape? Zeniva Travel handles every detail for you.”</li>
                <li>“Send me your dream destination and I will connect you with my Zeniva concierge.”</li>
                <li>“Private villas, yachting, and curated itineraries — request your travel plan here.”</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>Do / Don’t</h3>
              <div className="mt-3 grid gap-3 md:grid-cols-2 text-sm" style={{ color: MUTED_TEXT }}>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Do</p>
                  <ul className="mt-2 space-y-2">
                    <li>Emphasize curated, concierge travel and white-glove service.</li>
                    <li>Use approved assets and neutral, premium visuals.</li>
                    <li>Share real timelines for response and planning.</li>
                  </ul>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Don’t</p>
                  <ul className="mt-2 space-y-2">
                    <li>Promise pricing, availability, or discounts.</li>
                    <li>Use unapproved discounts or guarantees.</li>
                    <li>Post client details or private itineraries.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>How to represent the brand</h3>
              <ul className="mt-3 space-y-2 text-sm" style={{ color: MUTED_TEXT }}>
                <li>Lead with reassurance: curated trips, verified partners, concierge oversight.</li>
                <li>Set expectations clearly: timelines, approvals, and pricing are confirmed by Zeniva.</li>
                <li>Keep the tone calm, elevated, and service-first.</li>
              </ul>
            </div>
              </section>
            )}

            {activeTab === "money" && (
              <section className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>Sales & money</h2>
                  <p className="text-sm" style={{ color: MUTED_TEXT }}>Transparent reporting across leads, bookings, and commissions.</p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <input
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    type="date"
                    className="rounded-full border border-slate-200 px-3 py-1"
                  />
                  <input
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    type="date"
                    className="rounded-full border border-slate-200 px-3 py-1"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-4">
              {moneyCards.map((card) => (
                <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{card.label}</div>
                  <div className="mt-2 text-2xl font-black" style={{ color: TITLE_TEXT }}>{card.value}</div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>Commission lines</h3>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{commissions.length}</span>
              </div>
              <div className="overflow-x-auto mt-3">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-500">
                      <th className="pb-2 pr-3">Booking</th>
                      <th className="pb-2 pr-3">Traveler</th>
                      <th className="pb-2 pr-3">Amount</th>
                      <th className="pb-2 pr-3">Status</th>
                      <th className="pb-2 pr-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commissions.length === 0 && (
                      <tr><td colSpan={5} className="py-2 text-slate-500">No commissions yet.</td></tr>
                    )}
                    {commissions.map((line, idx) => (
                      <tr key={`${line.booking_id || "line"}-${idx}`} className="border-t border-slate-100">
                        <td className="py-2 pr-3" style={{ color: TITLE_TEXT }}>{line.booking_id || "—"}</td>
                        <td className="py-2 pr-3 text-slate-600">{line.traveler_email || "—"}</td>
                        <td className="py-2 pr-3 text-slate-800">{line.currency || "USD"} {Number(line.amount || 0).toLocaleString()}</td>
                        <td className="py-2 pr-3">
                          <span className={`rounded-full px-2 py-1 text-xs font-semibold ${line.status === "paid" ? "bg-emerald-100 text-emerald-700" : line.status === "approved" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                            {line.status || "pending"}
                          </span>
                        </td>
                        <td className="py-2 pr-3 text-xs text-slate-500">{line.booking_date ? new Date(line.booking_date).toLocaleDateString() : ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>Payout history</h3>
              <div className="overflow-x-auto mt-3">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-500">
                      <th className="pb-2 pr-3">Payout</th>
                      <th className="pb-2 pr-3">Amount</th>
                      <th className="pb-2 pr-3">Status</th>
                      <th className="pb-2 pr-3">Paid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.length === 0 && (
                      <tr><td colSpan={4} className="py-2 text-slate-500">No payouts yet.</td></tr>
                    )}
                    {payouts.map((payout) => (
                      <tr key={payout.id} className="border-t border-slate-100">
                        <td className="py-2 pr-3 text-slate-700">{payout.id}</td>
                        <td className="py-2 pr-3 text-slate-800">{payout.currency} {Number(payout.amount || 0).toLocaleString()}</td>
                        <td className="py-2 pr-3 text-slate-600">{payout.status}</td>
                        <td className="py-2 pr-3 text-xs text-slate-500">{payout.paid_at ? new Date(payout.paid_at).toLocaleDateString() : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
              </section>
            )}

            {activeTab === "support" && (
              <section className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>Need help? Talk to an agent</h2>
              <p className="mt-2 text-sm" style={{ color: MUTED_TEXT }}>Our concierge team is ready to assist with your client requests or content questions.</p>
              <Link
                href="/agent/chat"
                className="mt-4 inline-flex rounded-full px-4 py-2 text-sm font-semibold text-white"
                style={{ backgroundColor: PREMIUM_BLUE }}
              >
                Open agent chat
              </Link>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>How support works</h3>
              <ul className="mt-3 space-y-2 text-sm" style={{ color: MUTED_TEXT }}>
                <li>Share client goals and timing.</li>
                <li>We confirm pricing and availability within 1 business day.</li>
                <li>You stay in the loop for every update.</li>
              </ul>
            </div>
              </section>
            )}

            {isHQorAdmin && (
              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Admin only</p>
              <h2 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>Monthly commission rules</h2>
              <p className="text-sm" style={{ color: MUTED_TEXT }}>Influencers can view their rate, but only HQ/Admin can edit plans.</p>
            </div>
            <CommissionPlansAdmin />
              </section>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function CommissionPlansAdmin() {
  const [plans, setPlans] = useState<any[]>([]);
  const [planId, setPlanId] = useState("plan-" + new Date().toISOString().slice(0, 7));
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState("");
  const [pct, setPct] = useState("5");

  useEffect(() => {
    fetch("/api/commission-plans")
      .then((res) => res.json())
      .then((payload) => {
        if (!payload?.data) return;
        setPlans(payload.data || []);
      })
      .catch(() => undefined);
  }, []);

  const handleAddPlan = async () => {
    if (!planId || !startDate || !pct) return;
    const res = await fetch("/api/commission-plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: planId,
        startDate,
        endDate: endDate || null,
        influencerPct: Number(pct),
      }),
    });
    const payload = await res.json();
    if (res.ok && payload?.data) {
      setPlans((prev) => [payload.data, ...prev.filter((p) => p.id !== payload.data.id)]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-4">
        <input
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          placeholder="Plan id"
          value={planId}
          onChange={(e) => setPlanId(e.target.value)}
        />
        <input
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          placeholder="Start date (YYYY-MM-DD)"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          placeholder="End date (optional)"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <input
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
          placeholder="Influencer %"
          value={pct}
          onChange={(e) => setPct(e.target.value)}
        />
      </div>
      <button
        type="button"
        onClick={handleAddPlan}
        className="rounded-full px-4 py-2 text-sm font-semibold text-white"
        style={{ backgroundColor: PREMIUM_BLUE }}
      >
        Save plan
      </button>
      <div className="space-y-2">
        {plans.map((plan) => (
          <div key={plan.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm">
            <div className="font-semibold" style={{ color: TITLE_TEXT }}>{plan.id}</div>
            <div className="text-xs" style={{ color: MUTED_TEXT }}>
              {plan.start_date || plan.startDate} → {plan.end_date || plan.endDate || "open"} · {plan.influencer_pct || plan.influencerPct}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
