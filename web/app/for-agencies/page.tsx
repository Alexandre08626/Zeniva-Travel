"use client";

import { useState } from "react";
import Link from "next/link";

const aiAgents = [
  {
    name: "Lina",
    emoji: "\u2708\uFE0F",
    role: "AI Travel Concierge",
    desc: "Responds to visitors 24/7, creates itineraries, captures leads",
    tier: "Agency + Agents",
    gradient: "from-teal-500 to-cyan-500",
  },
  {
    name: "Sofia",
    emoji: "\u2699\uFE0F",
    role: "Operations Agent",
    desc: "Booking follow-ups, confirmations, documents, reminders",
    tier: "Agency + Agents",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    name: "Luna",
    emoji: "\uD83C\uDF19",
    role: "Client Relationship",
    desc: "Post-trip follow-ups, personalized suggestions, re-engagement",
    tier: "Agency + Agents",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    name: "Rex",
    emoji: "\uD83D\uDD0D",
    role: "Research & Intelligence",
    desc: "Destination trends, price comparisons, data feeds",
    tier: "Agency + Agents",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    name: "Ben",
    emoji: "\uD83D\uDCB0",
    role: "Finance Agent",
    desc: "Invoicing, commission tracking, payment reconciliation",
    tier: "Agency Only",
    gradient: "from-emerald-500 to-green-500",
  },
  {
    name: "Atlas",
    emoji: "\uD83D\uDCCA",
    role: "Analytics Agent",
    desc: "Performance dashboards, conversion tracking, revenue forecasting",
    tier: "Agency Only",
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    name: "Mia",
    emoji: "\uD83D\uDCE3",
    role: "Marketing Agent",
    desc: "Email campaigns, social content, promotional materials",
    tier: "Agency Only",
    gradient: "from-fuchsia-500 to-pink-500",
  },
  {
    name: "Nova",
    emoji: "\uD83D\uDCC4",
    role: "Document Agent",
    desc: "Contract generation, insurance tracking, travel document prep",
    tier: "Agency Only",
    gradient: "from-sky-500 to-blue-500",
  },
];

const toolkitItems = [
  "Personal AI assistant",
  "Full booking management",
  "Travel CRM",
  "Proposal generator with payment links",
  "Lead capture",
  "Commission tracking",
  "Document management",
  "Messaging system",
  "Calendar & pipeline",
  "Push notifications",
];

const ownershipCards = [
  { title: "Your suppliers stay yours", desc: "Lina only recommends the suppliers you choose. Your relationships, your commissions." },
  { title: "Your brand stays yours", desc: "The widget matches your colors, your logo, your voice. Clients see you, not us." },
  { title: "Your margins stay yours", desc: "Set your own markups and margins. We never touch your pricing strategy." },
  { title: "Your agents stay yours", desc: "Your human agents stay in control. AI assists them, never replaces them." },
];

const howItWorks = [
  { step: "1", title: "We integrate", desc: "Complete onboarding, paste the widget on your site. Takes under 30 minutes." },
  { step: "2", title: "AI starts working", desc: "8 AI agents handle inquiries, build itineraries, search suppliers, and capture leads 24/7." },
  { step: "3", title: "You pay for what you use", desc: "No monthly fees on Standard. You only pay for actual AI conversations, messages, and API calls." },
];

const standardFeatures = [
  "8 AI agents",
  "Lina widget",
  "Full agent dashboard",
  "CRM",
  "Proposals with payment",
  "Invoicing & commissions",
  "Document management",
  "Team training",
];

const premiumExtras = [
  "White-label mobile app (your name, logo, colors in App Store & Google Play)",
  "Push notifications to travelers",
  "Mobile client portal",
  "In-app chat with Lina and advisor",
];

const usageRows = [
  { service: "Lina AI", price: "$0.25/conv" },
  { service: "SMS", price: "$0.03/msg" },
  { service: "WhatsApp", price: "$0.02/msg" },
  { service: "Email", price: "$0.01/email" },
  { service: "API Searches", price: "$0.10/search" },
];

function ContactForm() {
  const [form, setForm] = useState({
    agencyName: "",
    contactName: "",
    email: "",
    phone: "",
    website: "",
    agents: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.contactName || !form.email) {
      setError("Name and email are required.");
      return;
    }
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/leads-business/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact_name: form.contactName,
          contact_email: form.email,
          contact_phone: form.phone,
          company_name: form.agencyName,
          website: form.website,
          number_of_agents: parseInt(form.agents) || undefined,
          message: form.message,
        }),
      });
      if (res.ok) setSent(true);
      else setError("Something went wrong.");
    } catch {
      setError("Connection error.");
    }
    setSending(false);
  };

  if (sent) {
    return (
      <div className="mt-10 rounded-2xl bg-white p-10 text-center shadow-lg">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
          &#10003;
        </div>
        <h3 className="mt-4 text-xl font-bold text-gray-900">Thank you!</h3>
        <p className="mt-2 text-gray-600">
          We will be in touch within 24 hours.
        </p>
      </div>
    );
  }

  const ic =
    "w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200";

  return (
    <form onSubmit={handleSubmit} className="mt-10 space-y-5 rounded-2xl bg-white p-8 shadow-lg">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Agency Name</label>
          <input
            className={ic}
            value={form.agencyName}
            onChange={(e) => setForm({ ...form, agencyName: e.target.value })}
            placeholder="Voyages ABC"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Contact Name *</label>
          <input
            className={ic}
            value={form.contactName}
            onChange={(e) => setForm({ ...form, contactName: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Email *</label>
          <input
            type="email"
            className={ic}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
          <input
            className={ic}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Website</label>
          <input
            className={ic}
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Number of Agents</label>
          <input
            type="number"
            min="1"
            className={ic}
            value={form.agents}
            onChange={(e) => setForm({ ...form, agents: e.target.value })}
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Message</label>
        <textarea
          rows={4}
          className={ic}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Tell us about your agency..."
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={sending}
        className="w-full rounded-lg bg-gradient-to-r from-teal-600 to-violet-600 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {sending ? "Sending..." : "Get Started"}
      </button>
    </form>
  );
}

export default function ForAgenciesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-700 via-violet-600 to-pink-600 px-4 py-24 text-center text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-pink-500/20 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-4xl">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Transform Your Travel Agency with AI
          </h1>
          <p className="mt-6 text-lg text-white/80 sm:text-xl">
            8 AI agents that work 24/7
          </p>
          <a
            href="#contact"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-bold text-teal-700 shadow-lg hover:bg-teal-50 transition-colors"
          >
            Get Started
          </a>
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { value: "8", label: "AI Agents" },
              { value: "4", label: "Per Advisor" },
              { value: "24/7", label: "Always On" },
              { value: "0%", label: "Commission" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-white/10 backdrop-blur-sm px-4 py-4">
                <div className="text-2xl font-extrabold">{s.value}</div>
                <div className="mt-1 text-sm text-white/70">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Your AI Team ─────────────────────────────────────────────────── */}
      <section className="bg-white px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-4xl">
            Your AI Team
          </h2>
          <p className="mt-4 text-center text-lg text-gray-500">
            8 specialized agents, each with a unique skill set
          </p>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {aiAgents.map((agent) => (
              <div
                key={agent.name}
                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-lg transition-all"
              >
                <div className={`bg-gradient-to-br ${agent.gradient} p-6 text-center`}>
                  <span className="text-5xl">{agent.emoji}</span>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900">{agent.name}</h3>
                  <p className="mt-1 text-sm font-medium text-teal-600">{agent.role}</p>
                  <p className="mt-2 text-sm text-gray-500">{agent.desc}</p>
                  <span
                    className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                      agent.tier === "Agency + Agents"
                        ? "bg-teal-50 text-teal-700"
                        : "bg-violet-50 text-violet-700"
                    }`}
                  >
                    {agent.tier}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Complete Agent Toolkit ────────────────────────────────────────── */}
      <section className="bg-gray-50 px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-4xl">
            Complete Agent Toolkit
          </h2>
          <p className="mt-4 text-center text-lg text-gray-500">
            Everything your advisors need in one platform
          </p>
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {toolkitItems.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-lg bg-white p-4 shadow-sm">
                <svg
                  className="mt-0.5 h-5 w-5 shrink-0 text-teal-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── We Don't Touch Your Business ──────────────────────────────────── */}
      <section className="bg-white px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-4xl">
            {"We Don\u0027t Touch Your Business"}
          </h2>
          <p className="mt-4 text-center text-lg text-gray-500">
            Your agency stays yours. Period.
          </p>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ownershipCards.map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-bold text-gray-900">{card.title}</h3>
                <p className="mt-2 text-sm text-gray-500">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section className="bg-gray-50 px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-4xl">
            How It Works
          </h2>
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

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section className="bg-white px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-4xl">
            Pricing
          </h2>
          <p className="mt-4 text-center text-lg text-gray-500">
            Simple, transparent pricing. Zero commission on bookings.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Standard */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm flex flex-col">
              <h3 className="text-xl font-bold text-gray-900">Standard</h3>
              <div className="mt-4">
                <span className="text-4xl font-extrabold text-gray-900">$1,999</span>
                <span className="ml-2 text-sm text-gray-500">one-time setup</span>
              </div>
              <p className="mt-2 text-sm text-teal-700 font-medium">
                + $399 per agent (one-time)
              </p>
              <ul className="mt-6 space-y-2.5 flex-1">
                {standardFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                    <svg className="h-4 w-4 shrink-0 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-6 border-t border-gray-100 pt-4">
                <p className="text-sm font-semibold text-gray-900">Usage-Based Monthly:</p>
                <table className="mt-2 w-full text-sm">
                  <tbody>
                    {usageRows.map((r) => (
                      <tr key={r.service} className="border-b border-gray-50">
                        <td className="py-1.5 text-gray-600">{r.service}</td>
                        <td className="py-1.5 text-right font-medium text-gray-900">{r.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="mt-4 text-center text-sm font-bold text-teal-700">
                0% commission on bookings - guaranteed
              </p>

              <a
                href="#contact"
                className="mt-6 block rounded-lg border-2 border-teal-600 py-3 text-center text-sm font-semibold text-teal-700 hover:bg-teal-50 transition-colors"
              >
                Get Started
              </a>
            </div>

            {/* Premium */}
            <div className="relative rounded-2xl bg-gradient-to-br from-teal-600 to-violet-600 p-8 shadow-lg text-white flex flex-col">
              <div className="absolute top-4 right-4 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-bold uppercase tracking-wide">
                BEST VALUE
              </div>
              <h3 className="text-xl font-bold">Premium</h3>
              <div className="mt-4">
                <span className="text-4xl font-extrabold">$4,999</span>
                <span className="ml-2 text-sm text-white/70">one-time setup</span>
              </div>
              <p className="mt-2 text-sm font-medium text-white/80">
                + $399 per agent (one-time)
              </p>
              <p className="mt-1 text-sm font-medium text-white/80">
                $299/month app fee + usage
              </p>

              <p className="mt-6 text-sm font-semibold text-white/90">
                Everything in Standard, plus:
              </p>
              <ul className="mt-3 space-y-2.5 flex-1">
                {premiumExtras.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-white/90">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href="#contact"
                className="mt-6 block rounded-lg bg-white py-3 text-center text-sm font-semibold text-teal-700 hover:bg-teal-50 transition-colors"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact Form ─────────────────────────────────────────────────── */}
      <section id="contact" className="bg-gray-50 px-4 py-20">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Get Started
          </h2>
          <p className="mt-4 text-center text-gray-600">
            Fill out the form and we'll be in touch within 24 hours
          </p>
          <ContactForm />
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-teal-600 via-violet-600 to-pink-600 px-4 py-20 text-center text-white">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Ready to give your agency 8 AI employees?
          </h2>
          <p className="mt-4 text-lg text-white/80">
            Join the agencies already using Zeniva to capture more leads, build better itineraries, and close more deals.
          </p>
          <a
            href="#contact"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-bold text-teal-700 shadow-lg hover:bg-teal-50 transition-colors"
          >
            Get Started
          </a>
        </div>
      </section>
    </div>
  );
}
