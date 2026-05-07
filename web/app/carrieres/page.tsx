import type { Metadata } from "next";
import Link from "next/link";
import AgentRoleSection from "../../components/careers/AgentRoleSection";
import InfluencerRoleSection from "../../components/careers/InfluencerRoleSection";
import RoleCategory from "../../components/careers/RoleCategory";
import RoleCard from "../../components/careers/RoleCard";
import FAQ from "../../components/careers/FAQ";
import CareersSignupForm from "../../components/careers/CareersSignupForm.client";
import { AGENT_ROLE_DICT_EN } from "../../components/careers/agentRoleDict";
import { INFLUENCER_ROLE_DICT_EN } from "../../components/careers/influencerRoleDict";
import { buildCareersJsonLd } from "../../src/lib/seo/careersSchema";

const PAGE_URL = "https://zenivatravel.com/carrieres";
const GRADIENT_START = "#0B1B4D";
const GRADIENT_END = "#0F6CF5";
const GOLD_GRADIENT = "linear-gradient(135deg, #E6B85A, #C9941F)";

export const metadata: Metadata = {
  title: "Careers at Zeniva — Travel Agents & Influencers",
  description:
    "Build your career with Zeniva. Two paths: become a Zeniva travel agent (70% commission, AI-assisted) or join the creator program as an influencer (3–5% commission, agency-cost travel at 150 clients).",
  keywords: [
    "Zeniva careers",
    "travel agent career",
    "creator program",
    "influencer travel program",
    "AI travel agent jobs",
    "remote travel work",
    "commission travel",
  ],
  alternates: {
    canonical: PAGE_URL,
    languages: {
      "en-US": PAGE_URL,
      "en-CA": PAGE_URL,
      "fr-CA": "https://zenivatravel.com/fr/carrieres",
      "fr-FR": "https://zenivatravel.com/fr/carrieres",
    },
  },
  openGraph: {
    type: "website",
    url: PAGE_URL,
    title: "Careers at Zeniva — Travel Agents & Influencers",
    description:
      "Two career paths at Zeniva: independent travel agent (70% commission) or creator partner (3–5% commission with Premium perks at 150 clients).",
    siteName: "Zeniva",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Careers at Zeniva — Travel Agents & Influencers",
    description: "Independent travel agent or creator partner — pick your path.",
  },
};

export default function CarrieresPageEn() {
  const jsonLd = buildCareersJsonLd({ locale: "en", pageUrl: PAGE_URL });
  // Override apply CTAs so they target the in-page form rather than /signup
  const agentDict = { ...AGENT_ROLE_DICT_EN, applyHref: "#apply" };
  const influencerDict = { ...INFLUENCER_ROLE_DICT_EN, applyHref: "#apply" };

  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hub hero */}
      <section
        className="relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${GRADIENT_START} 0%, ${GRADIENT_END} 100%)` }}
      >
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&q=60')] bg-cover bg-center opacity-10" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-2 text-sm font-bold text-white mb-6">
              <span>🚀</span> Build your career with Zeniva
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-white mb-6 leading-tight">
              Two paths. One mission. <br className="hidden sm:block" />
              <span className="text-amber-300">The future of travel.</span>
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 mb-8 max-w-3xl mx-auto font-medium">
              Whether you want to run your own travel business or turn your influence into income — Zeniva has the AI-powered platform to make it happen.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="#agent"
                className="inline-block rounded-2xl px-7 py-4 text-base font-black shadow-2xl transition hover:scale-105"
                style={{ background: GOLD_GRADIENT, color: GRADIENT_START }}
              >
                💼 Travel Agent path
              </Link>
              <Link
                href="#influencer"
                className="inline-block rounded-2xl border-2 border-white/30 bg-white/5 px-7 py-4 text-base font-bold text-white shadow-xl transition hover:bg-white/10"
              >
                ✨ Creator path
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Role index */}
      <RoleCategory
        badge="Choose your path"
        title="Which Zeniva role fits you?"
        subtitle="Both come with Lina AI, real-time analytics, and a Delaware-incorporated platform behind you."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <RoleCard
            icon="💼"
            title="Travel Agent"
            desc="Run your own travel business with a complete tech stack. Earn 70% commission on every booking. Setup fee + monthly subscription, no experience required."
            href="#agent"
            cta="See agent program"
            highlight
          />
          <RoleCard
            icon="✨"
            title="Creator / Influencer"
            desc="Share Zeniva with your community and earn 3–5% on every booking. Free to join, no monthly fees. Hit 150 clients to unlock agency-cost travel."
            href="#influencer"
            cta="See creator program"
          />
        </div>
      </RoleCategory>

      {/* Agent section */}
      <div id="agent" className="border-t border-slate-100">
        <AgentRoleSection dict={agentDict} hideHero hideFinalCta />
      </div>

      {/* Influencer section */}
      <div id="influencer" className="border-t border-slate-100">
        <InfluencerRoleSection dict={influencerDict} />
      </div>

      {/* Combined FAQ */}
      <div className="border-t border-slate-100 bg-slate-50">
        <FAQ
          title="Frequently asked questions"
          items={[
            {
              q: "Do I need travel-industry experience?",
              a: "No. The Travel Agent track includes complete training — booking systems, supplier relationships, client management, the entire workflow. The Creator track requires zero travel expertise: you share, Lina AI handles every booking conversation.",
            },
            {
              q: "Can I do both — agent and influencer?",
              a: "Yes. Many of our agents started as influencers, hit Premium, then upgraded to a full agent license. The two tracks are not mutually exclusive — pick where you start, layer on the other when it makes sense.",
            },
            {
              q: "How does the application process work?",
              a: "Submit the form below with your name, email, and which path interests you. We review every application within 48 hours and send onboarding instructions for the path you picked. Travel agents pay the $299 setup fee at this point; influencers join free.",
            },
            {
              q: "What does Lina AI actually do?",
              a: "Lina is your AI travel concierge. For agents, she handles client questions 24/7, generates quotes, manages bookings, and keeps your CRM tidy. For influencers, she closes the sale on every lead your followers send — you don't need to talk to anyone if you don't want to.",
            },
            {
              q: "Where is Zeniva based?",
              a: "Zeniva LLC is a Delaware-incorporated US technology platform serving all 50 states and Canada. Travel services are provided by third-party suppliers; Zeniva acts as the technology and concierge layer.",
            },
          ]}
        />
      </div>

      {/* Capture form */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-16 sm:py-20">
        <CareersSignupForm
          defaultRole="travel_agent"
          copy={{
            title: "Apply now",
            subtitle: "Tell us who you are and which path interests you. We respond within 48 hours.",
            nameLabel: "Full name",
            namePlaceholder: "Jordan Rivera",
            emailLabel: "Email",
            emailPlaceholder: "you@email.com",
            roleLabel: "Which path?",
            roleAgent: "Travel Agent",
            roleInfluencer: "Creator / Influencer",
            noteLabel: "Anything we should know? (optional)",
            notePlaceholder: "Audience size, current niche, why you're interested…",
            submit: "Submit application",
            submitting: "Submitting…",
            successTitle: "Got it — application received",
            successDesc: "We'll review your submission and email you within 48 hours with the next steps.",
            duplicatePending: "We already have an application from this email under review. We'll get back to you shortly.",
            duplicateApproved: "Good news — your application is already approved. Check your inbox for the access link.",
            error: "Something went wrong. Please try again or email careers@zeniva.ca.",
          }}
        />
      </section>
    </main>
  );
}
