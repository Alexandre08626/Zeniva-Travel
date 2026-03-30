"use client";

import { useEffect, useState } from "react";

interface AIAgent {
  id: string;
  name: string;
  emoji: string;
  role: string;
  description: string;
  gradient: string;
  tier: "agency_agents" | "agency_only";
}

const fallbackAgents: AIAgent[] = [
  {
    id: "lina",
    name: "Lina",
    emoji: "\u2708\uFE0F",
    role: "Lead Travel Concierge",
    description: "Handles client inquiries, builds itineraries, and manages the booking flow end-to-end.",
    gradient: "from-teal-400 to-cyan-500",
    tier: "agency_agents",
  },
  {
    id: "sofia",
    name: "Sofia",
    emoji: "\u2699\uFE0F",
    role: "Operations Manager",
    description: "Manages supplier communications, confirmations, and operational workflows.",
    gradient: "from-violet-400 to-purple-500",
    tier: "agency_agents",
  },
  {
    id: "luna",
    name: "Luna",
    emoji: "\uD83C\uDF19",
    role: "After-Hours Assistant",
    description: "Provides 24/7 support for travelers in different time zones and emergencies.",
    gradient: "from-indigo-400 to-blue-500",
    tier: "agency_agents",
  },
  {
    id: "rex",
    name: "Rex",
    emoji: "\uD83D\uDD0D",
    role: "Research Specialist",
    description: "Searches flights, hotels, and experiences across multiple suppliers and APIs.",
    gradient: "from-amber-400 to-orange-500",
    tier: "agency_agents",
  },
  {
    id: "ben",
    name: "Ben",
    emoji: "\uD83D\uDCB0",
    role: "Pricing & Revenue Agent",
    description: "Optimizes pricing, calculates margins, and manages quotes and invoices.",
    gradient: "from-emerald-400 to-green-500",
    tier: "agency_only",
  },
  {
    id: "atlas",
    name: "Atlas",
    emoji: "\uD83D\uDCCA",
    role: "Analytics Agent",
    description: "Tracks performance metrics, generates reports, and identifies growth opportunities.",
    gradient: "from-sky-400 to-blue-500",
    tier: "agency_only",
  },
  {
    id: "mia",
    name: "Mia",
    emoji: "\uD83D\uDCE3",
    role: "Marketing Agent",
    description: "Creates travel content, manages campaigns, and nurtures leads through email sequences.",
    gradient: "from-pink-400 to-rose-500",
    tier: "agency_only",
  },
  {
    id: "nova",
    name: "Nova",
    emoji: "\uD83D\uDCC4",
    role: "Documentation Agent",
    description: "Handles contracts, travel documents, visa requirements, and compliance paperwork.",
    gradient: "from-slate-400 to-gray-500",
    tier: "agency_only",
  },
];

export default function AIAgentsPage() {
  const [agents, setAgents] = useState<AIAgent[]>(fallbackAgents);

  useEffect(() => {
    fetch("/api/agency/ai-agents")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setAgents(data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Agents</h1>
        <p className="mt-1 text-gray-500">Your team of 8 AI-powered travel specialists</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg"
          >
            {/* Gradient Header */}
            <div className={`bg-gradient-to-br ${agent.gradient} p-6 text-center`}>
              <span className="text-5xl">{agent.emoji}</span>
            </div>

            {/* Content */}
            <div className="p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">{agent.name}</h3>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    agent.tier === "agency_agents"
                      ? "bg-teal-100 text-teal-700"
                      : "bg-violet-100 text-violet-700"
                  }`}
                >
                  {agent.tier === "agency_agents" ? "Agency + Agents" : "Agency Only"}
                </span>
              </div>
              <p className="mt-1 text-sm font-medium text-teal-600">{agent.role}</p>
              <p className="mt-2 text-sm text-gray-500">{agent.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
