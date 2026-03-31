"use client";
import { useEffect, useState } from "react";
import { useAuthStore, isHQ } from "@/src/lib/authStore";

type TabKey = "pending" | "approved" | "agencies";

interface AgentRequest {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  requested_at: string;
  phone?: string;
  motivation?: string;
  note?: string;
}

interface ApprovedAgent {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  requested_at: string;
  ref_code?: string;
}

const ROLE_CFG: Record<string, { label: string; bg: string; text: string; icon: string }> = {
  travel_agent:       { label: "Travel Agent",       bg: "bg-blue-100",    text: "text-blue-700",    icon: "\u2708\uFE0F" },
  yacht_broker:       { label: "Yacht Broker",       bg: "bg-indigo-100",  text: "text-indigo-700",  icon: "\u26F5" },
  influencer:         { label: "Influencer",         bg: "bg-purple-100",  text: "text-purple-700",  icon: "\u2B50" },
  agency_onboarding:  { label: "Agency Onboarding",  bg: "bg-teal-100",    text: "text-teal-700",    icon: "\uD83C\uDFE2" },
};

function fmtDate(d?: string | null) {
  if (!d) return "\u2014";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function parseOnboardingData(note?: string) {
  if (!note) return null;
  try { return JSON.parse(note); } catch { return null; }
}

function OnboardingDetail({ data }: { data: Record<string, unknown> }) {
  const str = (key: string) => (data[key] as string) || "";
  const arr = (key: string) => (data[key] as string[]) || [];

  const sections = [
    { title: "Agency Identity", items: [
      { label: "Legal Name", value: str("legalName") },
      { label: "Trade Name", value: str("tradeName") },
      { label: "OPC Permit", value: str("opcPermit") },
      { label: "Year Established", value: str("yearEstablished") },
      { label: "Address", value: str("address") },
      { label: "Website", value: str("website") },
      { label: "Locations", value: str("locations") },
    ]},
    { title: "Contacts", items: [
      { label: "Primary", value: `${str("primaryName")} (${str("primaryTitle")}) - ${str("primaryEmail")} - ${str("primaryPhone")}` },
      { label: "Preferred Comm", value: arr("preferredComm").join(", ") },
      { label: "Tech Contact", value: str("techName") ? `${str("techName")} - ${str("techEmail")}` : "" },
      { label: "Website Platform", value: arr("websitePlatform").join(", ") },
      { label: "Billing Contact", value: str("billingName") ? `${str("billingName")} - ${str("billingEmail")}` : "" },
    ]},
    { title: "Team", items: [
      { label: "Total Advisors", value: str("totalAdvisors") },
      { label: "Advisor List", value: str("advisorList") },
      { label: "Work Style", value: arr("workStyle").join(", ") },
    ]},
    { title: "Suppliers & Products", items: [
      { label: "Suppliers", value: str("suppliers") },
      { label: "GDS", value: arr("gds").join(", ") },
      { label: "Booking Platform", value: arr("bookingPlatform").join(", ") },
      { label: "Specialties", value: arr("specialties").join(", ") },
      { label: "Exclusive Rates", value: str("exclusiveRates") },
      { label: "Monthly Bookings", value: str("monthlyBookings") },
    ]},
    { title: "Branding", items: [
      { label: "Logo", value: arr("logoOption").join(", ") },
      { label: "Primary Color", value: str("primaryColor") },
      { label: "Secondary Color", value: str("secondaryColor") },
      { label: "Tone", value: arr("brandTone").join(", ") },
      { label: "Slogan", value: str("slogan") },
      { label: "Social Links", value: str("socialLinks") },
    ]},
    { title: "Lina AI Config", items: [
      { label: "Languages", value: arr("languages").join(", ") },
      { label: "Default Language", value: str("defaultLanguage") },
      { label: "Welcome Message", value: str("welcomeMessage") },
      { label: "Hours (Weekday)", value: str("weekdayHours") },
      { label: "Hours (Weekend)", value: str("weekendHours") },
      { label: "Restrictions", value: str("linaRestrictions") },
      { label: "Promotions", value: str("promotions") },
      { label: "Widget Placement", value: arr("widgetPlacement").join(", ") },
    ]},
    { title: "Current Tools", items: [
      { label: "CRM", value: arr("currentCRM").join(", ") },
      { label: "Import Clients", value: arr("importClients").join(", ") },
      { label: "Active Clients", value: str("activeClients") },
      { label: "Accounting", value: str("accountingSystem") },
      { label: "Payments", value: arr("paymentMethods").join(", ") },
    ]},
    ...(str("selectedPlan") === "premium" ? [{ title: "Mobile App (Premium)", items: [
      { label: "App Name", value: str("appName") },
      { label: "Dev Accounts", value: arr("devAccounts").join(", ") },
      { label: "App Icon", value: arr("appIcon").join(", ") },
    ]}] : []),
    { title: "Goals", items: [
      { label: "Main Reason", value: str("mainReason") },
      { label: "Challenges", value: arr("challenges").join(", ") },
      { label: "Timeline", value: arr("timeline").join(", ") },
      { label: "Other", value: str("anythingElse") },
    ]},
  ];

  return (
    <div className="mt-4 space-y-4">
      {sections.map((section) => {
        const filledItems = section.items.filter((i) => i.value && i.value !== " -  - ");
        if (filledItems.length === 0) return null;
        return (
          <div key={section.title} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="text-xs font-bold text-teal-700 uppercase tracking-wide mb-2">{section.title}</p>
            <div className="space-y-1.5">
              {filledItems.map((item) => (
                <div key={item.label} className="flex gap-2">
                  <span className="text-xs font-semibold text-slate-500 min-w-[120px] shrink-0">{item.label}:</span>
                  <span className="text-xs text-slate-700 whitespace-pre-wrap">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AgentRequestsPage() {
  const user = useAuthStore((s) => s.user);
  const hq = isHQ(user);
  const [pending, setPending] = useState<AgentRequest[]>([]);
  const [approved, setApproved] = useState<ApprovedAgent[]>([]);
  const [agencyRequests, setAgencyRequests] = useState<AgentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [success, setSuccess] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/agents-proxy?path=admin/agent-requests");
      if (r.ok) {
        const d = await r.json();
        const allPending = d?.pending || [];
        const allApproved = d?.approved || [];
        // Separate agency onboarding from agent requests
        setPending(allPending.filter((r: AgentRequest) => r.role !== "agency_onboarding"));
        setAgencyRequests([
          ...allPending.filter((r: AgentRequest) => r.role === "agency_onboarding"),
          ...allApproved.filter((r: ApprovedAgent) => (r as unknown as AgentRequest).role === "agency_onboarding"),
        ]);
        setApproved(allApproved.filter((r: ApprovedAgent) => (r as unknown as AgentRequest).role !== "agency_onboarding"));
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { void fetchRequests(); }, []);

  if (!hq) {
    return (
      <main className="min-h-screen bg-[#F3F6FB] flex items-center justify-center">
        <div className="bg-white rounded-2xl p-10 shadow-sm border border-slate-200 text-center max-w-sm">
          <p className="text-4xl mb-3">{"\uD83D\uDD12"}</p>
          <p className="font-black text-xl text-slate-900">HQ Access Only</p>
          <p className="text-slate-500 text-sm mt-2">Agent Requests is reserved for Zeniva HQ administrators.</p>
        </div>
      </main>
    );
  }

  const handleAction = async (id: string, action: "approve" | "reject") => {
    setActionLoading(id);
    try {
      await fetch(`/api/agents-proxy?path=admin/agent-requests/${id}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      setSuccess(action === "approve" ? "\u2705 Approved!" : "\u274C Rejected.");
      setTimeout(() => setSuccess(""), 4000);
      await fetchRequests();
    } catch {}
    setActionLoading(null);
  };

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: "pending", label: "\u23F3 Agents", count: pending.length },
    { key: "agencies", label: "\uD83C\uDFE2 Agencies", count: agencyRequests.length },
    { key: "approved", label: "\u2705 Approved", count: approved.length },
  ];

  return (
    <main className="min-h-screen bg-[#F3F6FB]">
      <div className="mx-auto max-w-5xl px-5 py-8 space-y-6">

        {/* Header */}
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">HQ</p>
            <h1 className="text-3xl font-black text-slate-900">Requests</h1>
            <p className="text-sm text-slate-500 mt-0.5">Review agent applications and agency onboarding requests</p>
          </div>
          <button onClick={() => void fetchRequests()} className="rounded-full px-5 py-2 text-sm font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm">
            {"\uD83D\uDD04"} Refresh
          </button>
        </header>

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-5 py-3 text-sm font-semibold">{success}</div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-xs text-slate-500">{"\u23F3"} Pending Agents</p>
            <p className="text-4xl font-black text-amber-600 mt-1">{pending.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-xs text-slate-500">{"\uD83C\uDFE2"} Agency Onboarding</p>
            <p className="text-4xl font-black text-teal-600 mt-1">{agencyRequests.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-xs text-slate-500">{"\u2705"} Approved</p>
            <p className="text-4xl font-black text-emerald-600 mt-1">{approved.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl border border-slate-200 p-1 w-fit">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} className={`rounded-lg px-5 py-2 text-sm font-semibold transition-colors ${activeTab === t.key ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"}`}>
              {t.label} ({t.count})
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-24 animate-pulse border border-slate-200" />)}
          </div>
        ) : activeTab === "pending" ? (
          /* ─── Pending Agents ──────────────────────────────── */
          pending.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <p className="text-4xl mb-3">{"\u2705"}</p>
              <p className="font-semibold text-slate-600">No pending agent requests</p>
              <p className="text-slate-400 text-sm mt-1">All applications have been reviewed.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map((req) => {
                const rc = ROLE_CFG[req.role || ""] || { label: req.role || "Unknown", bg: "bg-slate-100", text: "text-slate-700", icon: "\uD83D\uDC64" };
                return (
                  <div key={req.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg shrink-0">
                        {req.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-black text-slate-900 text-lg">{req.name}</p>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${rc.bg} ${rc.text}`}>{rc.icon} {rc.label}</span>
                        </div>
                        <p className="text-sm text-slate-600">{req.email} {req.phone ? `\u00B7 ${req.phone}` : ""}</p>
                        <p className="text-xs text-slate-400 mt-0.5">Requested {fmtDate(req.requested_at)}</p>
                        {req.motivation && <p className="text-sm text-slate-600 mt-2 italic bg-slate-50 rounded-xl px-3 py-2">{`"${req.motivation}"`}</p>}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => void handleAction(req.id, "approve")} disabled={actionLoading === req.id} className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                          {actionLoading === req.id ? "\u2026" : "\u2705 Approve"}
                        </button>
                        <button onClick={() => void handleAction(req.id, "reject")} disabled={actionLoading === req.id} className="bg-white text-red-600 border border-red-200 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-red-50 disabled:opacity-50 transition-colors">
                          {actionLoading === req.id ? "\u2026" : "\u2715 Reject"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : activeTab === "agencies" ? (
          /* ─── Agency Onboarding Requests ──────────────────── */
          agencyRequests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <p className="text-4xl mb-3">{"\uD83C\uDFE2"}</p>
              <p className="font-semibold text-slate-600">No agency onboarding requests</p>
              <p className="text-slate-400 text-sm mt-1">Agency applications from zenivatravel.com/for-agencies will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {agencyRequests.map((req) => {
                const onboardingData = parseOnboardingData(req.note);
                const isExpanded = expandedId === req.id;
                const plan = onboardingData?.selectedPlan || "standard";
                const companyName = onboardingData?.legalName || onboardingData?.tradeName || "Unknown Agency";
                const advisors = onboardingData?.totalAdvisors || "?";

                return (
                  <div key={req.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <div className="p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-violet-600 flex items-center justify-center text-white font-black text-lg shrink-0">
                          {companyName.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-black text-slate-900 text-lg">{companyName}</p>
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${plan === "premium" ? "bg-violet-100 text-violet-700" : "bg-teal-100 text-teal-700"}`}>
                              {plan === "premium" ? "\uD83D\uDC8E Premium $9,999" : "\u2B50 Standard $1,999"}
                            </span>
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${req.status === "pending" ? "bg-amber-100 text-amber-700" : req.status === "approved" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                              {req.status === "pending" ? "\u23F3 Pending" : req.status === "approved" ? "\u2705 Approved" : "\u274C Rejected"}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600">{req.name} \u00B7 {req.email}</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {fmtDate(req.requested_at)} \u00B7 {advisors} advisors \u00B7 Est. ${plan === "premium" ? "9,999" : "1,999"} + ${advisors !== "?" ? parseInt(advisors) * 399 : "?"} agents
                          </p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => setExpandedId(isExpanded ? null : req.id)} className="bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors">
                            {isExpanded ? "\u25B2 Hide" : "\u25BC Details"}
                          </button>
                          {req.status === "pending" && (
                            <>
                              <button onClick={() => void handleAction(req.id, "approve")} disabled={actionLoading === req.id} className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                                {actionLoading === req.id ? "\u2026" : "\u2705 Approve"}
                              </button>
                              <button onClick={() => void handleAction(req.id, "reject")} disabled={actionLoading === req.id} className="bg-white text-red-600 border border-red-200 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-red-50 disabled:opacity-50 transition-colors">
                                {actionLoading === req.id ? "\u2026" : "\u2715 Reject"}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {isExpanded && onboardingData && (
                      <div className="border-t border-slate-100 px-5 pb-5">
                        <OnboardingDetail data={onboardingData} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* ─── Approved ───────────────────────────────────── */
          approved.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <p className="text-4xl mb-3">{"\uD83D\uDC65"}</p>
              <p className="font-semibold text-slate-600">No recently approved agents</p>
              <p className="text-slate-400 text-sm mt-1">Agents approved in the last 30 days will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {approved.map((agent) => {
                const rc = ROLE_CFG[agent.role || ""] || { label: agent.role || "Agent", bg: "bg-slate-100", text: "text-slate-700", icon: "\uD83D\uDC64" };
                return (
                  <div key={agent.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black shrink-0">
                      {agent.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900">{agent.name}</p>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${rc.bg} ${rc.text}`}>{rc.icon} {rc.label}</span>
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">{"\u2705"} Active</span>
                      </div>
                      <p className="text-sm text-slate-500">{agent.email}</p>
                      <p className="text-xs text-slate-400">Joined {fmtDate(agent.requested_at)}</p>
                    </div>
                    <a href={`mailto:${agent.email}`} className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full font-semibold hover:bg-blue-200 shrink-0">{"\uD83D\uDCE7"} Email</a>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </main>
  );
}
