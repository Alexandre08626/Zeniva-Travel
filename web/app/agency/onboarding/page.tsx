"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

interface AgentEntry { name: string; email: string; specialties: string; }

const STEP_LABELS = ["Agency Info","Branding","Suppliers","AI Config","Add Agents","Payment","Success"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [agencyName, setAgencyName] = useState("");
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [agentCount, setAgentCount] = useState(1);
  const [primaryColor, setPrimaryColor] = useState("#0f766e");
  const [secondaryColor, setSecondaryColor] = useState("#7c3aed");
  const [suppliers, setSuppliers] = useState("");
  const [greeting, setGreeting] = useState("Hello! I am Lina, your AI travel assistant. How can I help you plan your next trip?");
  const [language, setLanguage] = useState("EN");
  const [widgetPosition, setWidgetPosition] = useState("bottom-right");
  const [agents, setAgents] = useState<AgentEntry[]>([{ name: "", email: "", specialties: "" }]);

  const addAgent = () => setAgents([...agents, { name: "", email: "", specialties: "" }]);
  const removeAgent = (i: number) => setAgents(agents.filter((_, idx) => idx !== i));
  const updateAgent = (i: number, field: keyof AgentEntry, value: string) => {
    const u = [...agents]; u[i] = { ...u[i], [field]: value }; setAgents(u);
  };

  const validAgents = agents.filter((a) => a.name && a.email);
  const agentSetupCost = validAgents.length * 399;
  const totalCost = 1999 + agentSetupCost;
  const snippet = `<script src="https://cdn.zentravel.ai/widget.js"
  data-agency-id="YOUR_AGENCY_ID"
  data-primary-color="${primaryColor}"
  data-secondary-color="${secondaryColor}"
  async>
<\/script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmPayment = async () => {
    setLoading(true);
    try {
      await fetch("/api/agency/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agencyName, website, email, phone, agentCount,
          primaryColor, secondaryColor, suppliers, greeting,
          language, widgetPosition, agents: validAgents,
        }),
      });
    } catch {
      // continue even if API not ready
    }
    setLoading(false);
    setStep(7);
  };

  const canNext = () => {
    if (step === 1) return agencyName && email;
    return true;
  };

  const inputCls = "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500";
  const smallInputCls = "rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50 py-8 px-4">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Agency Onboarding</h1>
          <p className="mt-2 text-gray-500">Set up your AI-powered travel agency in minutes</p>
        </div>

        {/* Step Indicators */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {STEP_LABELS.map((label, i) => {
            const sn = i + 1;
            return (
              <div key={label} className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${step > sn ? "bg-teal-700 text-white" : step === sn ? "bg-teal-600 text-white ring-4 ring-teal-100" : "bg-gray-200 text-gray-500"}`}>
                  {step > sn ? <Check className="h-4 w-4" /> : sn}
                </div>
                {i < STEP_LABELS.length - 1 && <div className={`h-0.5 w-6 ${step > sn ? "bg-teal-700" : "bg-gray-200"}`} />}
              </div>
            );
          })}
        </div>

        <div className="mb-2 text-center text-sm font-medium text-teal-700">
          Step {step}: {STEP_LABELS[step - 1]}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          {/* Step 1: Agency Info */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Agency Name *</label>
                <input type="text" value={agencyName} onChange={(e) => setAgencyName(e.target.value)} className={inputCls} placeholder="Your Travel Agency" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} className={inputCls} placeholder="https://youragency.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email *</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="contact@youragency.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} placeholder="+1 (555) 000-0000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Human Agents</label>
                <input type="number" min={0} value={agentCount} onChange={(e) => setAgentCount(Number(e.target.value))} className={inputCls} />
              </div>
            </div>
          )}

          {/* Step 2: Branding */}
          {step === 2 && (
            <div className="space-y-5">
              <p className="text-sm text-gray-500">Choose colors that match your brand. These will be used in the Lina widget on your website.</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                <div className="flex items-center gap-4">
                  <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="h-12 w-12 cursor-pointer rounded-lg border border-gray-300" />
                  <input type="text" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-40 rounded-lg border border-gray-300 px-3 py-2.5 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                <div className="flex items-center gap-4">
                  <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="h-12 w-12 cursor-pointer rounded-lg border border-gray-300" />
                  <input type="text" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="w-40 rounded-lg border border-gray-300 px-3 py-2.5 text-sm" />
                </div>
              </div>
              <div className="mt-4 rounded-lg p-6" style={{ backgroundColor: primaryColor }}>
                <p className="text-white text-sm font-medium">Preview: This is how your primary color looks</p>
                <button className="mt-3 rounded-lg px-4 py-2 text-sm font-medium text-white" style={{ backgroundColor: secondaryColor }}>Secondary Color Button</button>
              </div>
            </div>
          )}

          {/* Step 3: Suppliers */}
          {step === 3 && (
            <div className="space-y-5">
              <p className="text-sm text-gray-500">List the suppliers your agency works with. Lina will use this information to recommend the right products to your clients.</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Suppliers</label>
                <textarea value={suppliers} onChange={(e) => setSuppliers(e.target.value)} rows={8} className={inputCls} placeholder={"Enter your suppliers, one per line. For example:\nTransat\nAir Canada Vacations\nG Adventures\nSandals Resorts\nCelebrity Cruises"} />
              </div>
            </div>
          )}

          {/* Step 4: AI Config */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lina Greeting Message</label>
                <textarea value={greeting} onChange={(e) => setGreeting(e.target.value)} rows={3} className={inputCls} placeholder="Enter the first message Lina will say to your visitors..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className={inputCls}>
                  <option value="EN">English</option>
                  <option value="FR">French</option>
                  <option value="BILINGUAL">Bilingual (English + French)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Widget Position</label>
                <select value={widgetPosition} onChange={(e) => setWidgetPosition(e.target.value)} className={inputCls}>
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 5: Add Agents */}
          {step === 5 && (
            <div className="space-y-5">
              <p className="text-sm text-gray-500">Add the human travel agents who will use the platform alongside the AI agents.</p>
              <p className="text-sm font-medium text-teal-700">
                {validAgents.length} agent{validAgents.length !== 1 ? "s" : ""} x $399 = ${validAgents.length * 399}
              </p>
              {agents.map((agent, i) => (
                <div key={i} className="rounded-lg border border-gray-200 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Agent {i + 1}</span>
                    {agents.length > 1 && (
                      <button onClick={() => removeAgent(i)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <input type="text" value={agent.name} onChange={(e) => updateAgent(i, "name", e.target.value)} placeholder="Full name" className={smallInputCls} />
                    <input type="email" value={agent.email} onChange={(e) => updateAgent(i, "email", e.target.value)} placeholder="Email" className={smallInputCls} />
                    <input type="text" value={agent.specialties} onChange={(e) => updateAgent(i, "specialties", e.target.value)} placeholder="Specialties (e.g., Cruises, Europe)" className={smallInputCls} />
                  </div>
                </div>
              ))}
              <button onClick={addAgent} className="rounded-lg border border-dashed border-teal-300 px-4 py-2 text-sm font-medium text-teal-700 hover:bg-teal-50 transition-colors w-full">+ Add Another Agent</button>
            </div>
          )}

          {/* Step 6: Payment Summary */}
          {step === 6 && (
            <div className="space-y-6">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Payment Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Agency Setup (8 AI Agents, Dashboard, Widget)</span>
                    <span className="font-medium text-gray-900">$1,999.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Human Agents ({validAgents.length} x $399)</span>
                    <span className="font-medium text-gray-900">${agentSetupCost.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-2 flex justify-between text-base">
                    <span className="font-semibold text-gray-900">Total One-Time Setup</span>
                    <span className="font-bold text-gray-900">${totalCost.toFixed(2)}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500">After setup, you only pay for actual usage (AI conversations, SMS, WhatsApp, emails, API calls). No monthly fees, no surprises.</p>
              </div>
              <button onClick={handleConfirmPayment} disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-700 px-6 py-3 text-sm font-medium text-white hover:bg-teal-800 transition-colors disabled:opacity-50">
                {loading ? (<><Loader2 className="h-4 w-4 animate-spin" />Processing...</>) : "Proceed to Payment"}
              </button>
            </div>
          )}

          {/* Step 7: Success */}
          {step === 7 && (
            <div className="space-y-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Welcome Aboard!</h2>
                <p className="mt-2 text-gray-500">Your agency is now set up with 8 AI agents ready to work. Paste this widget code on your website to get started.</p>
              </div>
              <div className="text-left">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Widget Embed Code</span>
                  <button onClick={handleCopy} className="flex items-center gap-1 text-sm text-teal-700 hover:text-teal-800">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-green-400"><code>{snippet}</code></pre>
              </div>
              <button onClick={() => router.push("/agency/dashboard")} className="rounded-lg bg-teal-700 px-8 py-3 text-sm font-medium text-white hover:bg-teal-800 transition-colors">Go to Dashboard</button>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        {step < 6 && (
          <div className="mt-6 flex justify-between">
            <button onClick={() => setStep(step - 1)} disabled={step === 1} className="flex items-center gap-2 rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
              <ArrowLeft className="h-4 w-4" />Back
            </button>
            <button onClick={() => setStep(step + 1)} disabled={!canNext()} className="flex items-center gap-2 rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-800 transition-colors disabled:opacity-50">
              Next<ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
        {step === 6 && (
          <div className="mt-6 flex justify-start">
            <button onClick={() => setStep(5)} className="flex items-center gap-2 rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <ArrowLeft className="h-4 w-4" />Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
