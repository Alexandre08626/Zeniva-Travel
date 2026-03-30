"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bot,
  Users,
  UserCircle,
  Building2,
  BarChart3,
  Receipt,
  Code2,
  Settings,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/agency/dashboard" },
  { label: "AI Agents", icon: Bot, href: "/agency/ai-agents" },
  { label: "My Agents", icon: Users, href: "/agency/agents" },
  { label: "Business Leads", icon: Building2, href: "/agent/leads-business" },
  { label: "Clients", icon: UserCircle, href: "/agency/clients" },
  { label: "Usage & API", icon: BarChart3, href: "/agency/usage" },
  { label: "Billing", icon: Receipt, href: "/agency/billing" },
  { label: "Widget Code", icon: Code2, href: "/agency/widget-code" },
  { label: "Settings", icon: Settings, href: "/agency/settings" },
];

export default function AgencyLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={
          "fixed top-0 left-0 z-40 h-full w-72 bg-white border-r border-gray-200 flex flex-col transition-transform duration-200 " +
          (sidebarOpen ? "translate-x-0" : "-translate-x-full") +
          " lg:translate-x-0 lg:static lg:z-auto"
        }
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h1 className="text-xl font-bold text-teal-700">Agency Portal</h1>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors mb-1 " +
                  (active
                    ? "bg-teal-50 text-teal-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900")
                }
              >
                <Icon className={"w-5 h-5 " + (active ? "text-teal-700" : "text-gray-400")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-6 py-4 border-t border-gray-100 text-xs text-gray-400">
          ZenTrip Agency &copy; 2026
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-teal-700">Agency Portal</h1>
          <div className="w-6" />
        </header>

        <main className="flex-1 p-6 lg:pl-6">{children}</main>
      </div>
    </div>
  );
}
