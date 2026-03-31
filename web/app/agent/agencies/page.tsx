"use client";
import { useEffect, useState } from "react";
import { useAuthStore, isHQ } from "@/src/lib/authStore";
import { getSupabaseClient } from "@/src/lib/supabase/client";

interface Agency {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  is_active: boolean;
  setup_fee_paid: boolean;
  config: Record<string, unknown> | null;
  created_at: string;
}

interface SetupStep {
  key: string;
  label: string;
  description: string;
  status: "pending" | "running" | "done" | "error";
  premium?: boolean;
}

function fmtDate(d?: string | null) {
  if (!d) return "\u2014";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getSetupSteps(agency: Agency): SetupStep[] {
  const cfg = agency.config || {};
  const plan = (cfg.plan as string) || "standard";
  const isPremium = plan === "premium";

  const steps: SetupStep[] = [
    { key: "accounts", label: "Create Agency & Agent Accounts", description: "Create workspace login for agency owner + individual agent accounts", status: agency.is_active ? "done" : "pending" },
    { key: "branding", label: "Configure Branding", description: `Apply colors (${cfg.onboarding && (cfg.onboarding as Record<string, unknown>).primaryColor || "TBD"}), logo, tone of voice`, status: agency.is_active ? "done" : "pending" },
    { key: "lina", label: "Configure Lina AI", description: "Set languages, welcome message, business hours, restrictions, promotions", status: agency.domain ? "done" : "pending" },
    { key: "widget", label: "Generate & Install Widget", description: `Install Lina widget on ${agency.domain || "their website"}`, status: agency.domain && agency.is_active ? "done" : "pending" },
    { key: "crm", label: "Import Client Data", description: "Import existing clients from CSV/CRM if provided", status: "pending" },
    { key: "suppliers", label: "Configure Suppliers & Products", description: "Set up supplier inventory for Lina recommendations", status: "pending" },
    { key: "training", label: "Team Training Session", description: "Schedule onboarding call with agency team", status: "pending" },
  ];

  if (isPremium) {
    steps.push(
      { key: "app_analyze", label: "Analyze Website for App", description: "AI analyzes agency website structure, content, and design", status: "pending", premium: true },
      { key: "app_build", label: "Build Mobile App", description: "Code white-label mobile app with agency branding", status: "pending", premium: true },
      { key: "app_deploy", label: "Deploy to App Stores", description: "Submit to Apple App Store & Google Play", status: "pending", premium: true },
    );
  }

  return steps;
}

function AgencyCard({ agency, onRefresh }: { agency: Agency; onRefresh: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [setupRunning, setSetupRunning] = useState(false);
  const [setupLog, setSetupLog] = useState<string[]>([]);

  const cfg = agency.config || {};
  const onboarding = (cfg.onboarding as Record<string, unknown>) || {};
  const plan = (cfg.plan as string) || "standard";
  const numAgents = (cfg.number_of_agents as number) || 0;
  const steps = getSetupSteps(agency);
  const doneCount = steps.filter((s) => s.status === "done").length;

  const str = (key: string) => (onboarding[key] as string) || "";
  const arr = (key: string) => (onboarding[key] as string[]) || [];

  const launchSetup = async () => {
    setSetupRunning(true);
    setSetupLog(["Starting AI Setup Agent..."]);
    setExpanded(true);

    try {
      const r = await fetch("/api/agencies/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agency_id: agency.id }),
      });

      if (r.ok) {
        const data = await r.json();
        setSetupLog((prev) => [...prev, ...(data.log || ["Setup initiated successfully."])]);
        if (data.ok) {
          setSetupLog((prev) => [...prev, "\u2705 Setup complete! Agency is now active."]);
          onRefresh();
        }
      } else {
        const err = await r.json();
        setSetupLog((prev) => [...prev, `\u274C Error: ${err.error || "Setup failed"}`]);
      }
    } catch {
      setSetupLog((prev) => [...prev, "\u274C Connection error."]);
    }
    setSetupRunning(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg" style={{ background: `linear-gradient(135deg, ${agency.primary_color || "#0D9488"}, ${agency.secondary_color || "#7C3AED"})` }}>
              {agency.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-black text-slate-900">{agency.name}</h2>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${agency.is_active ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                  {agency.is_active ? "\u2705 ACTIVE" : "\u23F3 SETUP PENDING"}
                </span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${plan === "premium" ? "bg-violet-100 text-violet-700" : "bg-teal-100 text-teal-700"}`}>
                  {plan === "premium" ? "\uD83D\uDC8E Premium" : "\u2B50 Standard"}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap gap-x-3">
                {agency.domain && <span>{agency.domain}</span>}
                {agency.contact_email && <span>{agency.contact_email}</span>}
                {agency.contact_phone && <span>{agency.contact_phone}</span>}
                <span>{numAgents} advisors</span>
                <span>Since {fmtDate(agency.created_at)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {agency.primary_color && <div className="w-6 h-6 rounded-full border-2 border-white shadow" style={{ background: agency.primary_color }} />}
            {agency.secondary_color && <div className="w-6 h-6 rounded-full border-2 border-white shadow" style={{ background: agency.secondary_color }} />}
          </div>
        </div>
      </div>

      {/* Setup Progress */}
      <div className="px-5 py-3 border-b border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Setup Progress</div>
          <span className="text-xs font-bold text-slate-600">{doneCount}/{steps.length} steps</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2">
          <div className="bg-gradient-to-r from-teal-500 to-violet-500 h-2 rounded-full transition-all" style={{ width: `${(doneCount / steps.length) * 100}%` }} />
        </div>
      </div>

      {/* Setup Steps */}
      <div className="px-5 py-3 border-b border-slate-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {steps.map((step) => (
            <div key={step.key} className={`flex items-start gap-2 p-2.5 rounded-xl text-xs ${step.status === "done" ? "bg-green-50" : step.status === "running" ? "bg-blue-50" : "bg-slate-50"}`}>
              <span className="mt-0.5 shrink-0">
                {step.status === "done" ? "\u2705" : step.status === "running" ? "\u23F3" : step.premium ? "\uD83D\uDC8E" : "\u25CB"}
              </span>
              <div>
                <p className={`font-semibold ${step.status === "done" ? "text-green-700" : "text-slate-700"}`}>{step.label}</p>
                <p className="text-slate-400 mt-0.5">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 py-3 flex flex-wrap gap-2">
        {!agency.is_active && (
          <button onClick={launchSetup} disabled={setupRunning} className="px-5 py-2 bg-gradient-to-r from-teal-600 to-violet-600 text-white text-sm font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-2">
            {setupRunning ? <span className="animate-spin">{"\u23F3"}</span> : <span>{"\uD83E\uDD16"}</span>}
            {setupRunning ? "AI Setup Running..." : "Launch AI Setup"}
          </button>
        )}
        <button onClick={() => setExpanded(!expanded)} className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-200">
          {expanded ? "\u25B2 Hide Details" : "\u25BC Agency Details"}
        </button>
        {agency.is_active && (
          <>
            <button className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700">View Dashboard</button>
            <button className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-200">Configure</button>
            <button className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-200">Billing History</button>
          </>
        )}
      </div>

      {/* Setup Log */}
      {setupLog.length > 0 && (
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-900 text-green-400 font-mono text-xs space-y-1 max-h-60 overflow-y-auto">
          {setupLog.map((line, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-slate-600 shrink-0">[{String(i + 1).padStart(2, "0")}]</span>
              <span>{line}</span>
            </div>
          ))}
          {setupRunning && <div className="animate-pulse text-green-300">{"\u2588"}</div>}
        </div>
      )}

      {/* Expanded: Full onboarding data */}
      {expanded && (
        <div className="border-t border-slate-100 px-5 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { title: "Agency Identity", color: "text-teal-700", items: [
                { l: "Legal Name", v: str("legalName") }, { l: "Trade Name", v: str("tradeName") },
                { l: "OPC Permit", v: str("opcPermit") }, { l: "Year", v: str("yearEstablished") },
                { l: "Address", v: str("address") }, { l: "Locations", v: str("locations") },
              ]},
              { title: "Primary Contact", color: "text-violet-700", items: [
                { l: "Name", v: str("primaryName") }, { l: "Title", v: str("primaryTitle") },
                { l: "Email", v: str("primaryEmail") }, { l: "Phone", v: str("primaryPhone") },
                { l: "Preferred", v: arr("preferredComm").join(", ") },
              ]},
              { title: "Tech & Billing", color: "text-violet-700", items: [
                { l: "Tech", v: str("techName") ? `${str("techName")} (${str("techEmail")})` : "" },
                { l: "Platform", v: arr("websitePlatform").join(", ") },
                { l: "Billing", v: str("billingName") ? `${str("billingName")} (${str("billingEmail")})` : "" },
              ]},
              { title: "Team", color: "text-blue-700", items: [
                { l: "Advisors", v: str("totalAdvisors") },
                { l: "List", v: str("advisorList") },
                { l: "Style", v: arr("workStyle").join(", ") },
              ]},
              { title: "Suppliers", color: "text-amber-700", items: [
                { l: "Suppliers", v: str("suppliers") },
                { l: "GDS", v: arr("gds").join(", ") },
                { l: "Platform", v: arr("bookingPlatform").join(", ") },
                { l: "Specialties", v: arr("specialties").join(", ") },
                { l: "Bookings/mo", v: str("monthlyBookings") },
              ]},
              { title: "Branding", color: "text-pink-700", items: [
                { l: "Colors", v: `${str("primaryColor")} / ${str("secondaryColor")}` },
                { l: "Tone", v: arr("brandTone").join(", ") },
                { l: "Slogan", v: str("slogan") },
                { l: "Socials", v: str("socialLinks") },
              ]},
              { title: "Lina Config", color: "text-cyan-700", items: [
                { l: "Languages", v: arr("languages").join(", ") },
                { l: "Welcome", v: str("welcomeMessage") },
                { l: "Hours", v: `${str("weekdayHours")} / ${str("weekendHours")}` },
                { l: "Restrictions", v: str("linaRestrictions") },
                { l: "Promotions", v: str("promotions") },
                { l: "Widget", v: arr("widgetPlacement").join(", ") },
              ]},
              { title: "Current Tools", color: "text-slate-700", items: [
                { l: "CRM", v: arr("currentCRM").join(", ") },
                { l: "Import", v: arr("importClients").join(", ") },
                { l: "Clients", v: str("activeClients") },
                { l: "Accounting", v: str("accountingSystem") },
                { l: "Payments", v: arr("paymentMethods").join(", ") },
              ]},
              { title: "Goals", color: "text-emerald-700", items: [
                { l: "Reason", v: str("mainReason") },
                { l: "Challenges", v: arr("challenges").join(", ") },
                { l: "Timeline", v: arr("timeline").join(", ") },
                { l: "Notes", v: str("anythingElse") },
              ]},
            ].map((section) => {
              const filled = section.items.filter((i) => i.v);
              if (!filled.length) return null;
              return (
                <div key={section.title} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className={`text-[10px] font-bold uppercase tracking-wide mb-2 ${section.color}`}>{section.title}</p>
                  {filled.map((i) => (
                    <div key={i.l} className="mb-1.5">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">{i.l}</span>
                      <p className="text-xs text-slate-700 whitespace-pre-wrap">{i.v}</p>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AgenciesPage() {
  const user = useAuthStore((s) => s.user);
  const hq = isHQ(user);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAgencies = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/agencies");
      const json = await res.json();
      setAgencies(json.agencies || []);
    } catch {
      try {
        const { client } = getSupabaseClient();
        const { data } = await client.from("agencies").select("*").order("created_at", { ascending: false });
        setAgencies(data || []);
      } catch {
        setAgencies([]);
      }
    }
    setLoading(false);
  };

  useEffect(() => { fetchAgencies(); }, []);

  const activeCount = agencies.filter((a) => a.is_active).length;
  const setupCount = agencies.filter((a) => !a.is_active).length;
  const totalAgents = agencies.reduce((s, a) => s + ((a.config as Record<string, unknown>)?.number_of_agents as number || 0), 0);

  return (
    <div className="min-h-screen bg-[#F3F6FB] p-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">HQ</p>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            {"\uD83C\uDFE2"} Agency Partners
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage partner agencies. Launch AI setup and monitor installation.</p>
        </div>
        <button onClick={() => void fetchAgencies()} className="rounded-full px-5 py-2 text-sm font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm">
          {"\uD83D\uDD04"} Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Agencies", value: agencies.length, color: "text-blue-600" },
          { label: "Active & Live", value: activeCount, color: "text-green-600" },
          { label: "Pending Setup", value: setupCount, color: "text-amber-600" },
          { label: "Total Advisors", value: totalAgents, color: "text-purple-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : agencies.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
          <div className="text-5xl mb-4">{"\uD83C\uDFE2"}</div>
          <div className="text-lg font-bold text-slate-700 mb-2">No agency partners yet</div>
          <div className="text-slate-500 text-sm">
            Approve agencies in{" "}
            <a href="/agent/requests" className="text-blue-600 font-semibold hover:underline">Requests</a>
            {" "}to start the setup process.
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {agencies.map((agency) => (
            <AgencyCard key={agency.id} agency={agency} onRefresh={fetchAgencies} />
          ))}
        </div>
      )}
    </div>
  );
}
