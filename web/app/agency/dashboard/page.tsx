"use client";

import Link from "next/link";
import { Bot, Users, DollarSign, CheckCircle, ArrowRight } from "lucide-react";

const stats = [
  { label: "AI Agents", value: "8", icon: Bot, color: "bg-teal-50 text-teal-700" },
  { label: "Active Leads", value: "0", icon: Users, color: "bg-violet-50 text-violet-700" },
  { label: "Monthly Usage", value: "$0.00", icon: DollarSign, color: "bg-pink-50 text-pink-700" },
  { label: "Widget Status", value: "Ready", icon: CheckCircle, color: "bg-emerald-50 text-emerald-700" },
];

const quickActions = [
  { label: "Manage AI Agents", href: "/agency/ai-agents", description: "View and configure your 8 AI agents" },
  { label: "Widget Code", href: "/agency/widget-code", description: "Get the embed code for your website" },
  { label: "Usage & API", href: "/agency/usage", description: "Monitor usage and API consumption" },
  { label: "My Agents", href: "/agency/agents", description: "Manage your human travel agents" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-500">Welcome to your agency control panel</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className={`rounded-lg p-3 ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-teal-300 hover:shadow-md"
            >
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-teal-700">
                  {action.label}
                </p>
                <p className="mt-1 text-sm text-gray-500">{action.description}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-teal-700" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
