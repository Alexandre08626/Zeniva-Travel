"use client";

import { useState } from "react";

import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";

const aiAgents = [
  { name: "Lina", emoji: "\u2708\uFE0F", role: "Lead Travel Concierge", gradient: "from-teal-400 to-cyan-500" },
  { name: "Sofia", emoji: "\u2699\uFE0F", role: "Operations Manager", gradient: "from-violet-400 to-purple-500" },
  { name: "Luna", emoji: "\uD83C\uDF19", role: "After-Hours Assistant", gradient: "from-indigo-400 to-blue-500" },
  { name: "Rex", emoji: "\uD83D\uDD0D", role: "Research Specialist", gradient: "from-amber-400 to-orange-500" },
  { name: "Ben", emoji: "\uD83D\uDCB0", role: "Pricing & Revenue Agent", gradient: "from-emerald-400 to-green-500" },
  { name: "Atlas", emoji: "\uD83D\uDCCA", role: "Analytics Agent", gradient: "from-sky-400 to-blue-500" },
  { name: "Mia", emoji: "\uD83D\uDCE3", role: "Marketing Agent", gradient: "from-pink-400 to-rose-500" },
  { name: "Nova", emoji: "\uD83D\uDCC4", role: "Documentation Agent", gradient: "from-slate-400 to-gray-500" },
];

const toolkitItems = [
  "24/7 AI-powered client support via chat widget",
  "Automated itinerary building and quoting",
  "Multi-supplier search across flights, hotels, and tours",
  "SMS, WhatsApp, and email communication channels",
  "Real-time pricing and availability checks",
  "Client lead capture and CRM integration",
  "Custom-branded widget for your website",
  "Detailed analytics and performance reporting",
  "Revenue optimization and margin management",
  "Contract and document generation",
];

const ownershipCards = [
  { title: "Your Suppliers", desc: "Lina only recommends the suppliers you choose. Your relationships, your commissions." },
  { title: "Your Brand", desc: "The widget matches your colors, your logo, your voice. Clients see you, not us." },
  { title: "Your Margins", desc: "Set your own markups and margins. We never touch your pricing strategy." },
  { title: "Your Agents", desc: "Your human agents stay in control. AI assists them, never replaces them." },
];

const howItWorks = [
  { step: "1", title: "Integrate", desc: "Complete onboarding, paste the widget on your site. Takes under 30 minutes." },
  { step: "2", title: "AI Works", desc: "8 AI agents handle inquiries, build itineraries, search suppliers, and capture leads 24/7." },
  { step: "3", title: "Pay for Use", desc: "No monthly fees. You only pay for actual AI conversations, messages, and API calls." },
];

const usageTable = [
  { service: "AI Conversation", price: "$0.05 / message" },
  { service: "SMS", price: "$0.02 / message" },
  { service: "WhatsApp", price: "$0.03 / message" },
  { service: "Email", price: "$0.01 / email" },
  { service: "API Search", price: "$0.10 / call" },
];


function ContactForm() {
  const [form, setForm] = useState({ agencyName: "", contactName: "", email: "", phone: "", website: "", agents: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.contactName || !form.email) { setError("Name and email are required."); return; }
    setSending(true); setError("");
    try {
      const res = await fetch("/api/leads-business/public", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contact_name: form.contactName, contact_email: form.email, contact_phone: form.phone, company_name: form.agencyName, website: form.website, number_of_agents: parseInt(form.agents) || undefined, message: form.message }) });
      if (res.ok) setSent(true); else setError("Something went wrong.");
    } catch { setError("Connection error."); }
    setSending(false);
  };
  if (sent) return (<div className="mt-10 rounded-2xl bg-white p-10 text-center shadow-lg"><div className="text-4xl mb-4">✅</div><h3 className="text-xl font-bold text-gray-900">Thank you!</h3><p className="mt-2 text-gray-600">We will be in touch within 24 hours.</p></div>);
  const ic = "w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200";
  return (
    <form onSubmit={handleSubmit} className="mt-10 space-y-5 rounded-2xl bg-white p-8 shadow-lg">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div><label className="mb-1 block text-sm font-medium text-gray-700">Agency Name</label><input className={ic} value={form.agencyName} onChange={e => setForm({...form, agencyName: e.target.value})} placeholder="Voyages ABC" /></div>
        <div><label className="mb-1 block text-sm font-medium text-gray-700">Contact Name *</label><input className={ic} value={form.contactName} onChange={e => setForm({...form, contactName: e.target.value})} required /></div>
        <div><label className="mb-1 block text-sm font-medium text-gray-700">Email *</label><input type="email" className={ic} value={form.email} onChange={e => setForm({...form, email: e.target.value})} required /></div>
        <div><label className="mb-1 block text-sm font-medium text-gray-700">Phone</label><input className={ic} value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
        <div><label className="mb-1 block text-sm font-medium text-gray-700">Website</label><input className={ic} value={form.website} onChange={e => setForm({...form, website: e.target.value})} /></div>
        <div><label className="mb-1 block text-sm font-medium text-gray-700">Number of Agents</label><input type="number" min="1" className={ic} value={form.agents} onChange={e => setForm({...form, agents: e.target.value})} /></div>
      </div>
      <div><label className="mb-1 block text-sm font-medium text-gray-700">Message</label><textarea rows={4} className={ic} value={form.message} onChange={e => setForm({...form, message: e.target.value})} placeholder="Tell us about your agency..." /></div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={sending} className="w-full rounded-lg bg-teal-700 py-3 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-50">
        {sending ? "Sending..." : "Get Started"}
      </button>
    </form>
  );
}

export default function ForAgenciesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-700 via-teal-600 to-violet-700 px-4 py-24 text-center text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-pink-500/20 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-4xl">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Transform Your Travel Agency with AI
          </h1>
          <p className="mt-6 text-lg text-teal-100 sm:text-xl">
            Get 8 AI agents working for your agency 24/7. Capture leads, build itineraries, search suppliers, and close deals while you sleep.
          </p>
          <Link
            href="/agency/onboarding"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-bold text-teal-700 shadow-lg hover:bg-teal-50 transition-colors"
          >
            Get Started
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Your AI Team */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-4xl">Your AI Team</h2>
          <p className="mt-4 text-center text-lg text-gray-500">8 specialized agents, each with a unique skill set</p>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {aiAgents.map((agent) => (
              <div
                key={agent.name}
                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-lg transition-all"
              >
                <div className={`bg-gradient-to-br ${agent.gradient} p-6 text-center`}>
                  <span className="text-5xl">{agent.emoji}</span>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900">{agent.name}</h3>
                  <p className="mt-1 text-sm text-teal-600 font-medium">{agent.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Your Agents Get */}
      <section className="bg-gray-50 px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-4xl">What Your Agents Get</h2>
          <p className="mt-4 text-center text-lg text-gray-500">A complete AI-powered toolkit for modern travel agencies</p>
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {toolkitItems.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-lg bg-white p-4 shadow-sm">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
                <span className="text-sm text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* We Don't Touch Your Business */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-4xl">
            {"We Don\u0027t Touch Your Business"}
          </h2>
          <p className="mt-4 text-center text-lg text-gray-500">Your agency stays yours. Period.</p>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ownershipCards.map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur-sm p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-bold text-gray-900">{card.title}</h3>
                <p className="mt-2 text-sm text-gray-500">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-4xl">How It Works</h2>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {howItWorks.map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-violet-500 text-xl font-bold text-white">
                  {item.step}
                </div>
                <h3 className="mt-4 text-lg font-bold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-4xl">Pricing</h2>
          <p className="mt-4 text-center text-lg text-gray-500">Simple, transparent pricing. No monthly fees.</p>

          <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Agency Plan */}
            <div className="rounded-2xl border-2 border-teal-600 bg-white p-8 shadow-lg relative">
              <div className="absolute -top-3 left-6 rounded-full bg-teal-600 px-4 py-1 text-xs font-bold text-white">MOST POPULAR</div>
              <h3 className="text-xl font-bold text-gray-900">Agency Plan</h3>
              <p className="mt-2 text-sm text-gray-500">For travel agencies with a team</p>
              <div className="mt-6">
                <span className="text-4xl font-extrabold text-gray-900">$1,999</span>
                <span className="text-sm text-gray-500"> one-time setup</span>
              </div>
              <p className="mt-2 text-sm text-teal-700 font-medium">+ $399 per additional human agent</p>
              <ul className="mt-6 space-y-3">
                {["8 AI Agents included", "Custom-branded widget", "Full agency dashboard", "Multi-agent support", "Priority onboarding", "Usage-based billing only"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="h-4 w-4 text-teal-600" />{f}
                  </li>
                ))}
              </ul>
              <Link href="/agency/onboarding" className="mt-8 block rounded-lg bg-teal-700 py-3 text-center text-sm font-medium text-white hover:bg-teal-800 transition-colors">Get Started</Link>
            </div>

            {/* Individual Plan */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900">Individual Plan</h3>
              <p className="mt-2 text-sm text-gray-500">For independent travel advisors</p>
              <div className="mt-6">
                <span className="text-4xl font-extrabold text-gray-900">$97</span>
                <span className="text-sm text-gray-500"> / month</span>
              </div>
              <p className="mt-2 text-sm text-gray-500">+ $199 one-time setup</p>
              <ul className="mt-6 space-y-3">
                {["Lina AI concierge", "Basic widget", "Personal dashboard", "Email support", "Standard onboarding", "Usage-based billing"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="h-4 w-4 text-teal-600" />{f}
                  </li>
                ))}
              </ul>
              <Link href="/agency/onboarding" className="mt-8 block rounded-lg border border-gray-300 py-3 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Get Started</Link>
            </div>
          </div>

          {/* Usage Table */}
          <div className="mt-12 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <h3 className="mb-6 text-lg font-bold text-gray-900">Usage-Based Pricing</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 text-left text-sm font-semibold text-gray-500">Service</th>
                  <th className="pb-3 text-right text-sm font-semibold text-gray-500">Price</th>
                </tr>
              </thead>
              <tbody>
                {usageTable.map((row) => (
                  <tr key={row.service} className="border-b border-gray-100">
                    <td className="py-3 text-sm text-gray-700">{row.service}</td>
                    <td className="py-3 text-right text-sm font-medium text-gray-900">{row.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>


      {/* Contact Form */}
      <section id="contact" className="bg-gray-50 px-4 py-20">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center text-3xl font-extrabold text-gray-900">Get in Touch</h2>
          <p className="mt-4 text-center text-gray-600">Fill out the form below and we will be in touch within 24 hours.</p>
          <ContactForm />
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-teal-700 via-violet-600 to-pink-600 px-4 py-20 text-center text-white">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Ready to give your agency 8 AI employees?
          </h2>
          <p className="mt-4 text-lg text-white/80">
            Join the agencies already using ZenTravel to capture more leads, build better itineraries, and close more deals.
          </p>
          <Link
            href="/agency/onboarding"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-bold text-teal-700 shadow-lg hover:bg-teal-50 transition-colors"
          >
            Get Started
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
