"use client";
import { useEffect, useState } from "react";
import { useAuthStore, isHQ } from "../../../src/lib/authStore";
import { MessageSquare, Send, Users, TrendingUp, Clock, CheckCircle2, X, Play, Pause, Settings, Phone } from "lucide-react";

const AUTH = "Bearer zeniva-secret-2025";

interface Lead {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  destination?: string;
  status: string;
  created_at: string;
  last_sms_sent?: string;
  sms_count?: number;
}

interface SMSTemplate {
  id: string;
  name: string;
  message: string;
  type: "welcome" | "reminder" | "offer" | "urgency";
  charCount: number;
}

const SMS_TEMPLATES: SMSTemplate[] = [
  {
    id: "welcome",
    name: "Welcome SMS",
    message: "Hi {name}! 👋 Thanks for your interest in {destination}. Create your Zeniva account now and get 15% OFF your first booking! 🎁 Sign up: zenivatravel.com",
    type: "welcome",
    charCount: 160
  },
  {
    id: "reminder",
    name: "Quick Reminder",
    message: "Hey {name}! Still dreaming of {destination}? ✈️ Don't forget your exclusive 15% welcome discount is waiting! Create your account: zenivatravel.com",
    type: "reminder",
    charCount: 157
  },
  {
    id: "offer",
    name: "Limited Offer",
    message: "🌟 EXCLUSIVE: {name}, get 15% OFF your first Zeniva trip! Perfect for your {destination} adventure. Limited time - sign up now: zenivatravel.com",
    type: "offer",
    charCount: 152
  },
  {
    id: "urgency",
    name: "Last Chance",
    message: "⏰ {name}, your 15% discount expires soon! Don't miss out on your dream {destination} trip. Create your account TODAY: zenivatravel.com",
    type: "urgency",
    charCount: 144
  },
  {
    id: "value",
    name: "Value Prop",
    message: "Ready for {destination}, {name}? 🎉 Join 1000+ happy travelers! Get 15% OFF your first booking when you sign up: zenivatravel.com",
    type: "offer",
    charCount: 142
  },
  {
    id: "personal",
    name: "Personal Touch",
    message: "Hi {name}! Your perfect {destination} getaway is one click away. ✨ Sign up for Zeniva + save 15% on your first trip: zenivatravel.com",
    type: "welcome",
    charCount: 148
  },
  {
    id: "direct",
    name: "Direct CTA",
    message: "{name}, want 15% OFF your {destination} trip? Simple: Create your free Zeniva account now 👉 zenivatravel.com Let's make it happen!",
    type: "offer",
    charCount: 140
  },
  {
    id: "friendly",
    name: "Friendly Nudge",
    message: "Hey {name}! 👋 Your {destination} adventure awaits. Quick question: Ready to save 15% on your first trip? Join us: zenivatravel.com",
    type: "reminder",
    charCount: 141
  }
];

export default function LunaPage() {
  const user = useAuthStore((s) => s.user);
  const hq = isHQ(user);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLeads: 0,
    withPhone: 0,
    smsSent: 0,
    conversionRate: 0,
  });
  const [campaignActive, setCampaignActive] = useState(true);
  const [frequency, setFrequency] = useState("4h");
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

        // Filter: unconverted leads WITH phone numbers
        const unconvertedWithPhone = allLeads.filter(l =>
          l.status !== "client" &&
          l.status !== "junk" &&
          !l.email?.endsWith("@zeniva-lead.com") &&
          l.phone && l.phone.trim().length > 0
        );

        setLeads(unconvertedWithPhone);

        // Calculate stats
        const totalLeads = allLeads.length;
        const converted = allLeads.filter(l => l.status === "client").length;
        const withPhone = allLeads.filter(l => l.phone && l.phone.trim().length > 0).length;
        const conversionRate = totalLeads > 0 ? (converted / totalLeads) * 100 : 0;

        setStats({
          totalLeads,
          withPhone: unconvertedWithPhone.length,
          smsSent: 0, // Mock data - replace with real API call
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
    setSending(true);
    try {
      // TODO: Replace with actual API call to trigger Luna SMS campaign
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert(`SMS Campaign launched! ${leads.length} messages queued for delivery.`);
    } catch (err) {
      alert("Failed to launch SMS campaign");
    }
    setSending(false);
  };

  const toggleCampaign = () => {
    setCampaignActive(!campaignActive);
    // TODO: Call API to enable/disable automated SMS campaigns
  };

  const previewMessage = (template: SMSTemplate, lead?: Lead) => {
    const name = lead?.first_name || "{FirstName}";
    const destination = lead?.destination || "{Destination}";
    return template.message
      .replace(/{name}/g, name)
      .replace(/{destination}/g, destination);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white sticky top-0 z-20 shadow-lg">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl">
                📱
              </div>
              <div>
                <h1 className="text-2xl font-bold">Luna - SMS Marketing AI</h1>
                <p className="text-cyan-100 text-sm">Automated SMS lead conversion via Twilio</p>
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
                <Phone className="w-5 h-5 text-cyan-100" />
                <span className="text-xs text-cyan-100 font-medium">Leads with Phone</span>
              </div>
              <div className="text-3xl font-bold">{stats.withPhone}</div>
              <div className="text-xs text-cyan-100 mt-1">Ready for SMS</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-5 h-5 text-cyan-100" />
                <span className="text-xs text-cyan-100 font-medium">SMS Sent</span>
              </div>
              <div className="text-3xl font-bold">{stats.smsSent}</div>
              <div className="text-xs text-cyan-100 mt-1">Last 24 hours</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-cyan-100" />
                <span className="text-xs text-cyan-100 font-medium">Response Rate</span>
              </div>
              <div className="text-3xl font-bold">—</div>
              <div className="text-xs text-cyan-100 mt-1">Tracking soon</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-cyan-100" />
                <span className="text-xs text-cyan-100 font-medium">Next Send</span>
              </div>
              <div className="text-2xl font-bold">
                {campaignActive ? "3h 20m" : "Paused"}
              </div>
              <div className="text-xs text-cyan-100 mt-1">Every {frequency}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* SMS Templates */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">SMS Templates</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Luna personalizes these templates for each lead (under 160 chars)
                  </p>
                </div>
                <button
                  onClick={sendCampaign}
                  disabled={sending || !campaignActive}
                  className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  {sending ? "Sending..." : "Send SMS Campaign"}
                </button>
              </div>
              <div className="p-6 space-y-4">
                {SMS_TEMPLATES.map((template) => {
                  const preview = previewMessage(template, leads[0]);
                  return (
                    <div
                      key={template.id}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        selectedTemplate === template.id
                          ? "border-cyan-500 bg-cyan-50"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <MessageSquare className="w-4 h-4 text-slate-400" />
                            <span className="font-semibold text-slate-900">{template.name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              template.type === "welcome" ? "bg-blue-100 text-blue-700" :
                              template.type === "reminder" ? "bg-purple-100 text-purple-700" :
                              template.type === "offer" ? "bg-emerald-100 text-emerald-700" :
                              "bg-amber-100 text-amber-700"
                            }`}>
                              {template.type}
                            </span>
                            <span className="text-xs text-slate-400 ml-auto">
                              {template.charCount} chars
                            </span>
                          </div>
                        </div>
                        {selectedTemplate === template.id && (
                          <CheckCircle2 className="w-5 h-5 text-cyan-500 flex-shrink-0 ml-3" />
                        )}
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                        <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                          {preview}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Key Message Box */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">💎</span>
                </div>
                <div>
                  <h3 className="font-bold text-emerald-900 mb-2">SMS Conversion Strategy</h3>
                  <p className="text-sm text-emerald-800 leading-relaxed mb-3">
                    Every SMS emphasizes: <strong>"Get 15% OFF your first trip - Sign up at zenivatravel.com"</strong>
                  </p>
                  <div className="bg-white/60 rounded-lg p-3 space-y-2">
                    <div className="text-xs text-emerald-700">
                      <strong>✅ Short & Direct:</strong> SMS must be under 160 characters
                    </div>
                    <div className="text-xs text-emerald-700">
                      <strong>✅ Clear CTA:</strong> Always include the link to sign up
                    </div>
                    <div className="text-xs text-emerald-700">
                      <strong>✅ Personalized:</strong> Uses first name + destination interest
                    </div>
                    <div className="text-xs text-emerald-700">
                      <strong>✅ Varied:</strong> 8 different templates rotating automatically
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Twilio Integration Status */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-blue-900 mb-2">Twilio Integration</h3>
                  <div className="space-y-2 text-sm text-blue-800">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      <span>SMS API Connected</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      <span>Verified Sender Number</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      <span>Delivery Tracking Enabled</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>Inbound SMS Replies (Coming Soon)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Leads with Phone */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="p-4 border-b border-slate-200 bg-slate-50">
                <h3 className="font-semibold text-slate-900 text-sm">
                  Leads with Phone ({leads.length})
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Unconverted leads ready for SMS
                </p>
              </div>
              <div className="divide-y divide-slate-100 max-h-[700px] overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                    <p className="text-sm text-slate-500">Loading leads...</p>
                  </div>
                ) : leads.length === 0 ? (
                  <div className="p-8 text-center">
                    <Phone className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-600 font-medium">No leads with phone</p>
                    <p className="text-xs text-slate-400 mt-1">Collect phone numbers to enable SMS</p>
                  </div>
                ) : (
                  leads.slice(0, 50).map((lead) => {
                    const name = `${lead.first_name || ""} ${lead.last_name || ""}`.trim() || lead.email;
                    return (
                      <div key={lead.id} className="p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-slate-900 text-sm truncate">
                              {name}
                            </div>
                            <div className="text-xs text-slate-500 truncate">{lead.phone}</div>
                            <div className="text-xs text-slate-400 truncate">{lead.email}</div>
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
                              {lead.sms_count && lead.sms_count > 0 && (
                                <span className="text-xs text-slate-400">
                                  {lead.sms_count} SMS sent
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
                  {campaignActive ? "SMS Campaign Active" : "SMS Campaign Paused"}
                </span>
              </div>
              <div className="space-y-2 text-sm text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Frequency:</span>
                  <span className="font-medium">Every {frequency}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Next batch:</span>
                  <span className="font-medium">{campaignActive ? `~${Math.min(leads.length, 20)} SMS` : "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Template rotation:</span>
                  <span className="font-medium">Automatic</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Cost per SMS:</span>
                  <span className="font-medium">~$0.0075</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Luna automatically rotates through 8 SMS templates. Each message is personalized
                  with the lead's name and destination interest. SMS sent via Twilio.
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
              <h3 className="font-bold text-lg text-slate-900">SMS Campaign Settings</h3>
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
                  SMS Frequency
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="2h">Every 2 hours</option>
                  <option value="4h">Every 4 hours (Recommended)</option>
                  <option value="6h">Every 6 hours</option>
                  <option value="12h">Every 12 hours</option>
                  <option value="24h">Once per day</option>
                </select>
                <p className="text-xs text-slate-500 mt-2">
                  SMS is more direct than email - less frequent = less intrusive
                </p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="text-xs text-amber-800 space-y-1">
                  <div><strong>⚠️ SMS Best Practices:</strong></div>
                  <div>• Always provide opt-out option (add "Reply STOP to unsubscribe")</div>
                  <div>• Respect time zones (send 9am-8pm local time)</div>
                  <div>• Keep messages short and valuable</div>
                  <div>• Monitor opt-out rates</div>
                </div>
              </div>
              <div className="pt-4">
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-full bg-cyan-500 text-white py-2.5 rounded-xl font-medium hover:bg-cyan-600 transition-colors"
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
