"use client";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useAuthStore, isHQ } from "@/src/lib/authStore";
import Link from "next/link";

type TabKey = "dashboard" | "configure" | "billing";

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
  updated_at: string;
}

function fmtDate(d?: string | null) {
  if (!d) return "\u2014";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/* ═══ Dashboard Tab ═══ */
function DashboardTab({ agency }: { agency: Agency }) {
  const cfg = agency.config || {};
  const onboarding = (cfg.onboarding as Record<string, unknown>) || {};
  const numAgents = (cfg.number_of_agents as number) || 0;
  const plan = (cfg.plan as string) || "standard";
  const linaConfig = (cfg.lina_config as Record<string, unknown>) || {};
  const widgetCode = (cfg.widget_code as string) || "";

  const systems = [
    { name: "Lina Widget", status: agency.domain && agency.is_active ? "live" : "setup", detail: agency.domain ? `Active on ${agency.domain}` : "Pending installation" },
    { name: "SMS (Twilio)", status: agency.is_active ? "active" : "inactive", detail: agency.is_active ? "Ready" : "Not configured" },
    { name: "Email", status: agency.is_active ? "active" : "inactive", detail: agency.is_active ? "Ready" : "Not configured" },
    { name: "API Searches", status: agency.is_active ? "active" : "inactive", detail: agency.is_active ? "Ready" : "Not configured" },
    { name: "WhatsApp", status: "inactive", detail: "Not configured" },
  ];

  const statusColor = (s: string) => s === "live" || s === "active" ? "bg-green-500" : s === "setup" ? "bg-blue-500" : "bg-red-400";
  const statusLabel = (s: string) => s === "live" ? "LIVE" : s === "active" ? "ACTIVE" : s === "setup" ? "SETUP" : "OFF";

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Plan", value: plan === "premium" ? "Premium" : "Standard", color: "text-violet-600" },
          { label: "Advisors", value: numAgents, color: "text-blue-600" },
          { label: "Setup Value", value: `$${((cfg.estimated_setup_value as number) || 0).toLocaleString()}`, color: "text-emerald-600" },
          { label: "Status", value: agency.is_active ? "Active" : "Pending", color: agency.is_active ? "text-green-600" : "text-amber-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Systems */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Systems Status</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {systems.map((sys) => (
            <div key={sys.name} className="flex items-center gap-2 bg-slate-50 rounded-xl p-3">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${statusColor(sys.status)}`} />
              <div>
                <p className="text-xs font-bold text-slate-700">{sys.name}</p>
                <p className="text-[10px] text-slate-400">{statusLabel(sys.status)} \u00B7 {sys.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Widget Code */}
      {widgetCode && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Widget Embed Code</h3>
          <div className="bg-slate-900 rounded-xl p-4 text-green-400 font-mono text-xs overflow-x-auto whitespace-pre">{widgetCode}</div>
          <button onClick={() => navigator.clipboard.writeText(widgetCode)} className="mt-3 px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-lg hover:bg-teal-700 transition-colors">
            Copy Widget Code
          </button>
        </div>
      )}

      {/* Team */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Team ({numAgents} advisors)</h3>
        {onboarding.advisorList ? (
          <div className="text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 rounded-xl p-4">{onboarding.advisorList as string}</div>
        ) : (
          <p className="text-sm text-slate-400">No advisor list provided.</p>
        )}
      </div>

      {/* Suppliers */}
      {onboarding.specialties && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Specialties & Suppliers</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {(onboarding.specialties as string[]).map((s: string) => (
              <span key={s} className="bg-teal-50 text-teal-700 px-3 py-1 rounded-lg text-xs font-medium">{s}</span>
            ))}
          </div>
          {onboarding.suppliers && (
            <div className="text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 rounded-xl p-4">{onboarding.suppliers as string}</div>
          )}
        </div>
      )}

      {/* Lina Config Summary */}
      {linaConfig.welcome_message && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Lina AI Configuration</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><span className="text-[10px] font-bold text-slate-400 uppercase">Languages</span><p className="text-sm text-slate-700">{((linaConfig.languages as string[]) || []).join(", ")}</p></div>
            <div><span className="text-[10px] font-bold text-slate-400 uppercase">Widget Placement</span><p className="text-sm text-slate-700">{((linaConfig.widget_placement as string[]) || []).join(", ")}</p></div>
            <div className="sm:col-span-2"><span className="text-[10px] font-bold text-slate-400 uppercase">Welcome Message</span><p className="text-sm text-slate-700 italic">&ldquo;{linaConfig.welcome_message as string}&rdquo;</p></div>
            <div><span className="text-[10px] font-bold text-slate-400 uppercase">Business Hours</span><p className="text-sm text-slate-700">{(linaConfig.business_hours as Record<string, string>)?.weekday} / {(linaConfig.business_hours as Record<string, string>)?.weekend}</p></div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══ Configure Tab ═══ */
function ConfigureTab({ agency, onSave }: { agency: Agency; onSave: () => void }) {
  const cfg = agency.config || {};
  const onboarding = (cfg.onboarding as Record<string, unknown>) || {};

  const [form, setForm] = useState({
    name: agency.name,
    domain: agency.domain || "",
    contact_email: agency.contact_email || "",
    contact_phone: agency.contact_phone || "",
    primary_color: agency.primary_color || "#0D9488",
    secondary_color: agency.secondary_color || "#7C3AED",
    is_active: agency.is_active,
    welcome_message: ((cfg.lina_config as Record<string, unknown>)?.welcome_message as string) || (onboarding.welcomeMessage as string) || "",
    default_language: ((cfg.lina_config as Record<string, unknown>)?.default_language as string) || (onboarding.defaultLanguage as string) || "English",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const ic = "w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100";

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedConfig = { ...cfg };
      if (updatedConfig.lina_config) {
        (updatedConfig.lina_config as Record<string, unknown>).welcome_message = form.welcome_message;
        (updatedConfig.lina_config as Record<string, unknown>).default_language = form.default_language;
      }
      const r = await fetch(`/api/agencies`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: agency.id,
          name: form.name,
          domain: form.domain || null,
          contact_email: form.contact_email || null,
          contact_phone: form.contact_phone || null,
          primary_color: form.primary_color,
          secondary_color: form.secondary_color,
          is_active: form.is_active,
          config: updatedConfig,
        }),
      });
      if (r.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); onSave(); }
    } catch {}
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      {saved && <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl px-5 py-3 text-sm font-semibold">{"\u2705"} Settings saved!</div>}

      {/* General */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">General Settings</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="text-xs font-semibold text-slate-600 block mb-1">Agency Name</label><input className={ic} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className="text-xs font-semibold text-slate-600 block mb-1">Domain</label><input className={ic} value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} placeholder="voyagejendron.com" /></div>
          <div><label className="text-xs font-semibold text-slate-600 block mb-1">Contact Email</label><input className={ic} value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} /></div>
          <div><label className="text-xs font-semibold text-slate-600 block mb-1">Contact Phone</label><input className={ic} value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} /></div>
        </div>
      </div>

      {/* Branding */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Branding</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Primary Color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer" />
              <span className="text-xs text-slate-500 font-mono">{form.primary_color}</span>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Secondary Color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={form.secondary_color} onChange={(e) => setForm({ ...form, secondary_color: e.target.value })} className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer" />
              <span className="text-xs text-slate-500 font-mono">{form.secondary_color}</span>
            </div>
          </div>
          <div className="col-span-2">
            <label className="text-xs font-semibold text-slate-600 block mb-1">Preview</label>
            <div className="h-10 rounded-xl" style={{ background: `linear-gradient(135deg, ${form.primary_color}, ${form.secondary_color})` }} />
          </div>
        </div>
      </div>

      {/* Lina */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Lina AI Settings</h3>
        <div className="space-y-4">
          <div><label className="text-xs font-semibold text-slate-600 block mb-1">Default Language</label><input className={ic} value={form.default_language} onChange={(e) => setForm({ ...form, default_language: e.target.value })} /></div>
          <div><label className="text-xs font-semibold text-slate-600 block mb-1">Welcome Message</label><textarea className={`${ic} min-h-[80px]`} value={form.welcome_message} onChange={(e) => setForm({ ...form, welcome_message: e.target.value })} /></div>
        </div>
      </div>

      {/* Status */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Agency Status</h3>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-5 h-5 accent-teal-600 rounded" />
          <span className="text-sm font-semibold text-slate-700">Agency is active</span>
        </label>
      </div>

      <button onClick={handleSave} disabled={saving} className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-teal-600 to-violet-600 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity">
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}

/* ═══ Billing Tab ═══ */
function BillingTab({ agency }: { agency: Agency }) {
  const cfg = agency.config || {};
  const plan = (cfg.plan as string) || "standard";
  const numAgents = (cfg.number_of_agents as number) || 0;
  const setupBase = plan === "premium" ? 9999 : 1999;
  const agentFees = numAgents * 399;
  const totalSetup = setupBase + agentFees;

  const usageRates = [
    { service: "Lina AI Conversations", rate: "$0.25/conv", mtd: 0 },
    { service: "SMS Messages", rate: "$0.03/msg", mtd: 0 },
    { service: "WhatsApp Messages", rate: "$0.02/msg", mtd: 0 },
    { service: "Email Sends", rate: "$0.01/email", mtd: 0 },
    { service: "API Searches", rate: "$0.10/search", mtd: 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Setup Fees */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Setup Fees</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm"><span className="text-slate-600">{plan === "premium" ? "Premium" : "Standard"} Plan Setup</span><span className="font-bold text-slate-900">${setupBase.toLocaleString()}</span></div>
          <div className="flex justify-between text-sm"><span className="text-slate-600">{numAgents} Advisor Licenses x $399</span><span className="font-bold text-slate-900">${agentFees.toLocaleString()}</span></div>
          <div className="border-t border-slate-100 pt-2 flex justify-between text-sm"><span className="font-bold text-slate-900">Total Setup</span><span className="font-black text-lg text-teal-700">${totalSetup.toLocaleString()}</span></div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${agency.setup_fee_paid ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
            {agency.setup_fee_paid ? "\u2705 Paid" : "\u23F3 Pending Payment"}
          </span>
        </div>
      </div>

      {/* Monthly Usage */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Monthly Usage (Current Period)</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left py-2 text-xs font-bold text-slate-400">Service</th>
              <th className="text-right py-2 text-xs font-bold text-slate-400">Rate</th>
              <th className="text-right py-2 text-xs font-bold text-slate-400">MTD Usage</th>
              <th className="text-right py-2 text-xs font-bold text-slate-400">Amount</th>
            </tr>
          </thead>
          <tbody>
            {usageRates.map((u) => (
              <tr key={u.service} className="border-b border-slate-50">
                <td className="py-2.5 text-slate-700">{u.service}</td>
                <td className="py-2.5 text-right text-slate-500">{u.rate}</td>
                <td className="py-2.5 text-right text-slate-700 font-medium">{u.mtd}</td>
                <td className="py-2.5 text-right font-bold text-slate-900">$0.00</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-200">
              <td colSpan={3} className="py-3 font-bold text-slate-900">Total This Month</td>
              <td className="py-3 text-right font-black text-lg text-teal-700">$0.00</td>
            </tr>
          </tfoot>
        </table>
        <p className="text-xs text-slate-400 mt-2">0% commission on bookings \u2014 guaranteed.</p>
      </div>

      {/* Invoice History */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Invoice History</h3>
        <div className="text-sm text-slate-400 text-center py-6">No invoices yet. Usage billing starts when the agency goes live.</div>
      </div>
    </div>
  );
}

/* ═══ Main Page ═══ */
export default function AgencyDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const hq = isHQ(user);

  const agencyId = params.id as string;
  const initialTab = (searchParams.get("tab") as TabKey) || "dashboard";

  const [agency, setAgency] = useState<Agency | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  const fetchAgency = async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/agencies?id=${agencyId}`);
      if (r.ok) {
        const d = await r.json();
        const found = d.agencies?.find((a: Agency) => a.id === agencyId) || d.agency || null;
        setAgency(found);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchAgency(); }, [agencyId]);

  if (!hq) {
    return (
      <main className="min-h-screen bg-[#F3F6FB] flex items-center justify-center">
        <div className="bg-white rounded-2xl p-10 shadow-sm border border-slate-200 text-center max-w-sm">
          <p className="text-4xl mb-3">{"\uD83D\uDD12"}</p>
          <p className="font-black text-xl text-slate-900">HQ Access Only</p>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F3F6FB] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full" />
      </main>
    );
  }

  if (!agency) {
    return (
      <main className="min-h-screen bg-[#F3F6FB] flex items-center justify-center">
        <div className="bg-white rounded-2xl p-10 text-center">
          <p className="text-4xl mb-3">{"\u2753"}</p>
          <p className="font-bold text-slate-700">Agency not found</p>
          <Link href="/agent/agencies" className="mt-4 inline-block text-sm text-blue-600 font-semibold hover:underline">{"\u2190"} Back to Agencies</Link>
        </div>
      </main>
    );
  }

  const tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: "dashboard", label: "Dashboard", icon: "\uD83D\uDCCA" },
    { key: "configure", label: "Configure", icon: "\u2699\uFE0F" },
    { key: "billing", label: "Billing", icon: "\uD83D\uDCB0" },
  ];

  return (
    <main className="min-h-screen bg-[#F3F6FB]">
      <div className="mx-auto max-w-6xl px-5 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/agent/agencies" className="text-slate-400 hover:text-slate-600 text-sm font-bold">{"\u2190"} Agencies</Link>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black" style={{ background: `linear-gradient(135deg, ${agency.primary_color || "#0D9488"}, ${agency.secondary_color || "#7C3AED"})` }}>
              {agency.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">{agency.name}</h1>
              <p className="text-xs text-slate-500">{agency.domain || agency.slug} \u00B7 {agency.contact_email}</p>
            </div>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${agency.is_active ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
              {agency.is_active ? "\u2705 ACTIVE" : "\u23F3 PENDING"}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl border border-slate-200 p-1 w-fit">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors flex items-center gap-2 ${activeTab === t.key ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"}`}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "dashboard" && <DashboardTab agency={agency} />}
        {activeTab === "configure" && <ConfigureTab agency={agency} onSave={fetchAgency} />}
        {activeTab === "billing" && <BillingTab agency={agency} />}
      </div>
    </main>
  );
}
