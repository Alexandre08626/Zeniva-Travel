"use client";
import { useEffect, useState } from "react";
import { useAuthStore, isHQ } from "../../../src/lib/authStore";
import { Mail, Send, Users, TrendingUp, Clock, CheckCircle2, X, Play, Pause, Settings } from "lucide-react";

const AUTH = "Bearer zeniva-secret-2025";

interface Lead {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  destination?: string;
  status: string;
  created_at: string;
  last_email_sent?: string;
  email_count?: number;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  preview: string;
  type: "welcome" | "reminder" | "offer" | "urgency";
}

const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: "welcome",
    name: "Welcome Email",
    subject: "Welcome to Zeniva Travel - Your Dream Trip Awaits! ✈️",
    preview: "Thank you for your interest in [destination]. Start planning your perfect getaway with 15% off your first booking!",
    type: "welcome"
  },
  {
    id: "reminder",
    name: "Gentle Reminder",
    subject: "Still Thinking About [Destination]? 🌴",
    preview: "We noticed you showed interest in [destination]. Our travel experts are ready to help you plan your perfect trip!",
    type: "reminder"
  },
  {
    id: "offer",
    name: "Exclusive Offer",
    subject: "Exclusive: 15% Off Your First Trip with Zeniva! 💎",
    preview: "Create your account today and save 15% on your first booking. Limited time offer for new travelers!",
    type: "offer"
  },
  {
    id: "urgency",
    name: "Limited Time",
    subject: "Last Chance: Your 15% Discount Expires Soon! ⏰",
    preview: "Don't miss out! Your exclusive 15% welcome discount is waiting. Sign up now to unlock your savings!",
    type: "urgency"
  },
  {
    id: "testimonial",
    name: "Social Proof",
    subject: "See Why 1000+ Travelers Trust Zeniva ⭐",
    preview: "Join thousands of happy travelers who have discovered their dream destinations with Zeniva. Plus, get 15% off!",
    type: "offer"
  },
  {
    id: "personalized",
    name: "Personalized Destination",
    subject: "Your Perfect [Destination] Itinerary Awaits 🗺️",
    preview: "Based on your interest in [destination], we've created a custom itinerary just for you. Sign up to view it!",
    type: "reminder"
  }
];

export default function SofiaPage() {
  const user = useAuthStore((s) => s.user);
  const hq = isHQ(user);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLeads: 0,
    unconverted: 0,
    emailsSent: 0,
    conversionRate: 0,
  });
  const [campaignActive, setCampaignActive] = useState(true);
  const [frequency, setFrequency] = useState("6h");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("welcome");
  const [sending, setSending] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Fetch leads
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ path: "admin/leads" });
        const r = await fetch(`/api/agents-proxy?${params}`, {
          headers: { Authorization: AUTH },
        });
        const data = await r.json();
        const allLeads: Lead[] = data?.leads || [];

        // Filter out clients (those who have status "client" or have created an account)
        const unconvertedLeads = allLeads.filter(l =>
          l.status !== "client" &&
          l.status !== "junk" &&
          !l.email?.endsWith("@zeniva-lead.com")
        );

        setLeads(unconvertedLeads);

        // Calculate stats
        const totalLeads = allLeads.length;
        const converted = allLeads.filter(l => l.status === "client").length;
        const unconverted = unconvertedLeads.length;
        const conversionRate = totalLeads > 0 ? (converted / totalLeads) * 100 : 0;

        setStats({
          totalLeads,
          unconverted,
          emailsSent: 39, // Mock data - replace with real API call
          conversionRate: Math.round(conversionRate * 10) / 10,
        });
      } catch (err) {
        console.error("Failed to fetch leads:", err);
      }
      setLoading(false);
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const sendCampaign = async () => {
    if (!confirm("Send personalized AI packages to all clients? This will email every active client with a custom offer.")) return;
    setSending(true);
    try {
      const res = await fetch("/api/sofia/send-packages", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        alert(`Campaign sent! ${data.sent} emails delivered out of ${data.total} clients.${data.errors ? ` (${data.errors} errors)` : ""}`);
      } else {
        alert("Campaign failed: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      alert("Failed to launch campaign — network error");
    }
    setSending(false);
  };

  const toggleCampaign = () => {
    setCampaignActive(!campaignActive);
    // TODO: Call API to enable/disable automated campaigns
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-pink-50/30 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white sticky top-0 z-20 shadow-lg">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl">
                📬
              </div>
              <div>
                <h1 className="text-2xl font-bold">Sofia - Email Marketing AI</h1>
                <p className="text-pink-100 text-sm">Automated lead conversion campaigns</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSettings(true)}
                className="p-2.5 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={toggleCampaign}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                  campaignActive
                    ? "bg-white/20 hover:bg-white/30"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {campaignActive ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Pause Campaign
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Resume Campaign
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-pink-100" />
                <span className="text-xs text-pink-100 font-medium">Unconverted Leads</span>
              </div>
              <div className="text-3xl font-bold">{stats.unconverted}</div>
              <div className="text-xs text-pink-100 mt-1">Ready for outreach</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Send className="w-5 h-5 text-pink-100" />
                <span className="text-xs text-pink-100 font-medium">Emails Sent</span>
              </div>
              <div className="text-3xl font-bold">{stats.emailsSent}</div>
              <div className="text-xs text-pink-100 mt-1">Last 24 hours</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-pink-100" />
                <span className="text-xs text-pink-100 font-medium">Conversion Rate</span>
              </div>
              <div className="text-3xl font-bold">{stats.conversionRate}%</div>
              <div className="text-xs text-pink-100 mt-1">Lead to client</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-pink-100" />
                <span className="text-xs text-pink-100 font-medium">Next Send</span>
              </div>
              <div className="text-2xl font-bold">
                {campaignActive ? "2h 15m" : "Paused"}
              </div>
              <div className="text-xs text-pink-100 mt-1">Frequency: Every {frequency}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Email Templates */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Email Templates</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Sofia uses AI to personalize these templates for each lead
                  </p>
                </div>
                <button
                  onClick={sendCampaign}
                  disabled={sending || !campaignActive}
                  className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  {sending ? "Sending..." : "Send Campaign Now"}
                </button>
              </div>
              <div className="p-6 space-y-4">
                {EMAIL_TEMPLATES.map((template) => (
                  <div
                    key={template.id}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      selectedTemplate === template.id
                        ? "border-pink-500 bg-pink-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Mail className="w-4 h-4 text-slate-400" />
                          <span className="font-semibold text-slate-900">{template.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            template.type === "welcome" ? "bg-blue-100 text-blue-700" :
                            template.type === "reminder" ? "bg-purple-100 text-purple-700" :
                            template.type === "offer" ? "bg-emerald-100 text-emerald-700" :
                            "bg-amber-100 text-amber-700"
                          }`}>
                            {template.type}
                          </span>
                        </div>
                        <div className="text-sm font-medium text-slate-700 mb-2">
                          {template.subject}
                        </div>
                        <div className="text-xs text-slate-500 leading-relaxed">
                          {template.preview}
                        </div>
                      </div>
                      {selectedTemplate === template.id && (
                        <CheckCircle2 className="w-5 h-5 text-pink-500 flex-shrink-0 ml-3" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Message Box */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">💎</span>
                </div>
                <div>
                  <h3 className="font-bold text-emerald-900 mb-2">Main Conversion Message</h3>
                  <p className="text-sm text-emerald-800 leading-relaxed mb-3">
                    Every email emphasizes: <strong>"Create your account today and get 15% off your first trip with Zeniva!"</strong>
                  </p>
                  <div className="bg-white/60 rounded-lg p-3 text-xs text-emerald-700 border border-emerald-200">
                    <strong>Goal:</strong> Convert leads into registered users by offering immediate value (15% discount)
                    that they can only unlock by creating an account.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Unconverted Leads */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="p-4 border-b border-slate-200 bg-slate-50">
                <h3 className="font-semibold text-slate-900 text-sm">
                  Unconverted Leads ({leads.length})
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  These leads haven't created an account yet
                </p>
              </div>
              <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                    <p className="text-sm text-slate-500">Loading leads...</p>
                  </div>
                ) : leads.length === 0 ? (
                  <div className="p-8 text-center">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                    <p className="text-sm text-slate-600 font-medium">All leads converted!</p>
                    <p className="text-xs text-slate-400 mt-1">Great job! 🎉</p>
                  </div>
                ) : (
                  leads.slice(0, 50).map((lead) => {
                    const name = `${lead.first_name || ""} ${lead.last_name || ""}`.trim() || lead.email;
                    return (
                      <div key={lead.id} className="p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-slate-900 text-sm truncate">
                              {name}
                            </div>
                            <div className="text-xs text-slate-500 truncate">{lead.email}</div>
                            {lead.destination && (
                              <div className="text-xs text-slate-400 mt-1">
                                ✈️ {lead.destination}
                              </div>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                lead.status === "new" ? "bg-blue-100 text-blue-700" :
                                lead.status === "contacted" ? "bg-purple-100 text-purple-700" :
                                lead.status === "followed_up" ? "bg-amber-100 text-amber-700" :
                                "bg-slate-100 text-slate-600"
                              }`}>
                                {lead.status}
                              </span>
                              {lead.email_count && lead.email_count > 0 && (
                                <span className="text-xs text-slate-400">
                                  {lead.email_count} emails sent
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Campaign Status */}
            <div className={`rounded-2xl p-6 ${
              campaignActive
                ? "bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200"
                : "bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-300"
            }`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-3 h-3 rounded-full ${campaignActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                <span className="font-bold text-slate-900">
                  {campaignActive ? "Campaign Active" : "Campaign Paused"}
                </span>
              </div>
              <div className="space-y-2 text-sm text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Frequency:</span>
                  <span className="font-medium">Every {frequency}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Next batch:</span>
                  <span className="font-medium">{campaignActive ? "~25 emails" : "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Template rotation:</span>
                  <span className="font-medium">Automatic</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Sofia automatically varies email templates to avoid repetition. Each lead receives
                  personalized content based on their destination interest and signup date.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowSettings(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900">Campaign Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Frequency
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="2h">Every 2 hours</option>
                  <option value="4h">Every 4 hours</option>
                  <option value="6h">Every 6 hours (Recommended)</option>
                  <option value="12h">Every 12 hours</option>
                  <option value="24h">Once per day</option>
                </select>
              </div>
              <div className="pt-4">
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-full bg-pink-500 text-white py-2.5 rounded-xl font-medium hover:bg-pink-600 transition-colors"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
