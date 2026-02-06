"use client";

import { useEffect, useState } from "react";
import { useRequirePermission } from "../../../src/lib/roleGuards";
import { TITLE_TEXT, MUTED_TEXT, PREMIUM_BLUE } from "../../../src/design/tokens";
import { buildInfluencerCode } from "../../../src/lib/influencer";
import { normalizeRbacRole } from "../../../src/lib/rbac";

export default function InfluencerDashboardPage() {
  const user = useRequirePermission("referrals:read", "/agent");
  const roles = user?.roles && user.roles.length ? user.roles : user?.role ? [user.role] : [];
  const effectiveRole = normalizeRbacRole(user?.effectiveRole) || normalizeRbacRole(roles[0]);
  const isHQorAdmin = effectiveRole === "hq" || effectiveRole === "admin";
  const influencerCode = user?.email ? buildInfluencerCode(user.email) : "";
  const [stats, setStats] = useState({
    referralCode: influencerCode,
    influencerId: influencerCode,
    clicks: 0,
    signups: 0,
    bookings: 0,
    commissionTotal: 0,
  });
  const [commissions, setCommissions] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);

  const [planId, setPlanId] = useState("plan-" + new Date().toISOString().slice(0, 7));
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState("");
  const [pct, setPct] = useState("5");

  const referralLink = influencerCode
    ? `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.zenivatravel.com"}?ref=${encodeURIComponent(influencerCode)}`
    : "";

  useEffect(() => {
    if (!user) return;
    fetch("/api/influencer/dashboard")
      .then((res) => res.json())
      .then((payload) => {
        if (!payload?.data) return;
        setStats(payload.data);
        setCommissions(payload.data.commissions || []);
      })
      .catch(() => undefined);
  }, [user]);

  useEffect(() => {
    if (!isHQorAdmin) return;
    fetch("/api/commission-plans")
      .then((res) => res.json())
      .then((payload) => {
        if (!payload?.data) return;
        setPlans(payload.data || []);
      })
      .catch(() => undefined);
  }, [isHQorAdmin]);

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
    <main className="min-h-screen" style={{ backgroundColor: "#F3F6FB" }}>
      <div className="mx-auto max-w-6xl px-5 py-8 space-y-6">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Influencer</p>
            <h1 className="text-3xl font-black" style={{ color: TITLE_TEXT }}>Referral dashboard</h1>
            <p className="text-sm" style={{ color: MUTED_TEXT }}>Track clicks, signups, and attributed bookings.</p>
          </div>
          {influencerCode && (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Referral link</div>
              <div className="mt-1 font-semibold" style={{ color: TITLE_TEXT }}>{referralLink}</div>
            </div>
          )}
        </header>

        <section className="grid gap-3 md:grid-cols-4">
          {[
            { label: "Clicks", value: stats.clicks },
            { label: "Signups", value: stats.signups },
            { label: "Bookings", value: stats.bookings },
            { label: "Commission", value: `$${stats.commissionTotal}` },
          ].map((card) => (
            <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{card.label}</div>
              <div className="mt-1 text-2xl font-black" style={{ color: TITLE_TEXT }}>{card.value}</div>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>Commission lines</h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{commissions.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-600">
                  <th className="pb-2 pr-3">Booking</th>
                  <th className="pb-2 pr-3">Traveler</th>
                  <th className="pb-2 pr-3">Amount</th>
                  <th className="pb-2 pr-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {commissions.length === 0 && (
                  <tr><td colSpan={4} className="py-2 text-slate-500">No commissions yet.</td></tr>
                )}
                {commissions.map((line) => (
                  <tr key={line.id} className="border-t border-slate-100">
                    <td className="py-2 pr-3" style={{ color: TITLE_TEXT }}>{line.booking_id || line.bookingId}</td>
                    <td className="py-2 pr-3" style={{ color: TITLE_TEXT }}>{line.traveler_email || line.travelerEmail || "-"}</td>
                    <td className="py-2 pr-3" style={{ color: TITLE_TEXT }}>${line.amount}</td>
                    <td className="py-2 pr-3 text-xs" style={{ color: MUTED_TEXT }}>{new Date(line.booking_date || line.bookingDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {isHQorAdmin && (
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Commission plans</p>
              <h2 className="text-lg font-bold" style={{ color: TITLE_TEXT }}>Monthly commission rules</h2>
              <p className="text-sm" style={{ color: MUTED_TEXT }}>Plans are applied based on booking date.</p>
            </div>
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
          </section>
        )}
      </div>
    </main>
  );
}
