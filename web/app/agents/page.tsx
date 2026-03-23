import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Become a Zeniva Agent — Join the Future of Travel",
  description: "Join Zeniva as a travel agent. Earn 70% commission, get full tech setup, AI assistant Lina, and access to 200+ destinations worldwide. No experience required.",
  keywords: ["travel agent", "work from home", "commission", "AI assistant", "travel business", "Zeniva agent"],
};

const GRADIENT_START = "#0B1B4D";
const GRADIENT_END = "#0F6CF5";
const GOLD_GRADIENT = "linear-gradient(135deg, #E6B85A, #C9941F)";

export default function AgentsPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${GRADIENT_START} 0%, ${GRADIENT_END} 100%)` }}>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1600&q=60')] bg-cover bg-center opacity-10" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-2 text-sm font-bold text-white mb-6">
              <span>💼</span> Join the Future of Travel
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-white mb-6 leading-tight">
              Become a Zeniva Agent
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 mb-8 max-w-3xl mx-auto font-medium">
              Join the future of travel. Earn 70% commission. Work from anywhere.
            </p>
            <Link
              href="/signup"
              className="inline-block rounded-2xl px-8 py-4 text-lg font-black shadow-2xl transition hover:scale-105"
              style={{ background: GOLD_GRADIENT, color: GRADIENT_START }}
            >
              Apply Now →
            </Link>
            <p className="text-white/60 text-sm mt-4">Setup fee: $299 one-time · $97/month subscription</p>
          </div>
        </div>
      </section>

      {/* Avantages Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">Why Join Zeniva?</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">Everything you need to succeed as a travel agent, powered by AI</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: "💰",
              title: "70% Commission",
              desc: "Keep 70% of net profit on every booking. No hidden fees, transparent payouts.",
            },
            {
              icon: "🤖",
              title: "AI Assistant Lina",
              desc: "Your personal AI agent handles clients 24/7. Quote generation, booking management, customer support.",
            },
            {
              icon: "💳",
              title: "ZeniPay Account",
              desc: "Receive payments instantly. Professional invoicing and payment processing included.",
            },
            {
              icon: "📱",
              title: "Full Tech Setup",
              desc: "Phone number via Tillo, professional email, n8n automation workflows — all configured for you.",
            },
            {
              icon: "🌍",
              title: "200+ Destinations",
              desc: "Access our global network of hotels, yachts, villas, cruises and exclusive packages.",
            },
            {
              icon: "🎓",
              title: "No Experience Required",
              desc: "Complete training included. We teach you everything from booking to client management.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="group rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:shadow-xl hover:-translate-y-1"
            >
              <div className="text-5xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-black text-slate-900 mb-3">{item.title}</h3>
              <p className="text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">Transparent Pricing</h2>
            <p className="text-lg text-slate-600">Simple, straightforward. No surprises.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Setup Fee */}
            <div className="rounded-3xl border-2 border-slate-200 bg-white p-8 shadow-lg">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-200 px-4 py-1.5 text-sm font-bold text-blue-700 mb-4">
                  One-time
                </div>
                <div className="text-5xl font-black text-slate-900 mb-2">$299</div>
                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Setup Fee</div>
              </div>
              <ul className="space-y-3 mb-6">
                {[
                  "Complete account configuration",
                  "Phone number via Tillo",
                  "Professional email setup",
                  "Lina AI personal assistant",
                  "n8n automation workflows",
                  "ZeniPay merchant account",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Monthly Subscription */}
            <div className="rounded-3xl border-2 bg-white p-8 shadow-lg relative overflow-hidden" style={{ borderColor: GRADIENT_END }}>
              <div className="absolute top-4 right-4 rounded-full px-3 py-1 text-xs font-bold text-white" style={{ background: GRADIENT_END }}>
                REQUIRED
              </div>
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-200 px-4 py-1.5 text-sm font-bold text-blue-700 mb-4">
                  Monthly
                </div>
                <div className="text-5xl font-black text-slate-900 mb-2">$97</div>
                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Per Month</div>
              </div>
              <ul className="space-y-3 mb-6">
                {[
                  "All tools included",
                  "Lina AI unlimited access",
                  "ZeniPay dashboard",
                  "Priority support",
                  "Training & resources",
                  "Software updates",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="text-green-500 text-xl">✓</span>
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Referral Program */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="rounded-3xl border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 p-8 sm:p-12">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🎁</div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3">Refer & Earn</h2>
            <p className="text-lg text-slate-700">Grow your network and get rewarded</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-md text-center">
              <div className="text-4xl mb-3">1️⃣</div>
              <div className="text-xl font-black text-slate-900 mb-2">Recruit 1 Agent</div>
              <div className="text-slate-600">Get <strong>1 month free</strong></div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-md text-center">
              <div className="text-4xl mb-3">2️⃣</div>
              <div className="text-xl font-black text-slate-900 mb-2">Recruit 2 Agents</div>
              <div className="text-slate-600">Get your <strong>$299 setup fee</strong> fully reimbursed</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-md text-center">
              <div className="text-4xl mb-3">3️⃣</div>
              <div className="text-xl font-black text-slate-900 mb-2">Recruit 3+ Agents</div>
              <div className="text-slate-600">Become a <strong>Zeniva Ambassador</strong> with bonus commissions</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">How It Works</h2>
            <p className="text-lg text-slate-600">Four simple steps to get started</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Apply & Pay Setup Fee",
                desc: "Fill out the application and pay the $299 one-time setup fee to get started.",
              },
              {
                step: "2",
                title: "We Configure Everything",
                desc: "Our team sets up your phone, email, Lina AI, ZeniPay account within 24 hours.",
              },
              {
                step: "3",
                title: "Receive Your Credentials",
                desc: "Get your login, phone number, email and full access to Lina AI assistant.",
              },
              {
                step: "4",
                title: "Start Earning 70%",
                desc: "Begin booking for clients and keep 70% commission on every transaction.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full text-2xl font-black text-white mb-4"
                  style={{ background: `linear-gradient(135deg, ${GRADIENT_START}, ${GRADIENT_END})` }}
                >
                  {item.step}
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commission Example */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">Commission Example</h2>
            <p className="text-lg text-slate-600">See how much you can earn per booking</p>
          </div>

          <div className="rounded-3xl border-2 border-slate-200 bg-white p-8 shadow-lg">
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                <span className="text-slate-600">Booking value</span>
                <span className="text-xl font-bold text-slate-900">$7,677</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                <span className="text-slate-600">Supplier cost</span>
                <span className="text-xl font-bold text-red-600">-$5,078</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                <span className="text-slate-600 font-semibold">Net profit</span>
                <span className="text-2xl font-black text-slate-900">$2,599</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-bold text-slate-900">Your 70% commission</span>
                <span className="text-3xl font-black" style={{ color: GRADIENT_END }}>$1,819</span>
              </div>
            </div>
            <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 text-center">
              <p className="text-sm text-blue-900">
                <strong>That's $1,819 per booking</strong> — imagine 5-10 bookings per month 💰
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${GRADIENT_START} 0%, ${GRADIENT_END} 100%)` }}>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&q=60')] bg-cover bg-center opacity-10" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
          <div className="text-center">
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-6">Ready to Start?</h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join hundreds of agents earning 70% commission with full tech setup and AI support
            </p>
            <Link
              href="/signup"
              className="inline-block rounded-2xl px-8 py-4 text-xl font-black shadow-2xl transition hover:scale-105"
              style={{ background: GOLD_GRADIENT, color: GRADIENT_START }}
            >
              Become an Agent — $299 Setup
            </Link>
            <p className="text-white/70 text-sm mt-6">Questions? Email us at <a href="mailto:agents@zeniva.ca" className="underline text-white">agents@zeniva.ca</a></p>
          </div>
        </div>
      </section>
    </main>
  );
}
