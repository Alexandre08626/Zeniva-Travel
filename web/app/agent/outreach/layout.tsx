"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { OutreachProvider, useOutreach } from "./components/OutreachContext";
import SofiaChatPanel from "./components/SofiaChatPanel";

const tabs = [
  { label: "Dashboard", href: "/agent/outreach/dashboard" },
  { label: "Campaigns", href: "/agent/outreach" },
  { label: "Templates", href: "/agent/outreach/templates" },
  { label: "Sequences", href: "/agent/outreach/sequences" },
  { label: "Contacts", href: "/agent/outreach/contacts" },
  { label: "Leads", href: "/agent/outreach/newLeads" },
  { label: "Analytics", href: "/agent/outreach/analytics" },
  { label: "Social", href: "/agent/outreach/social" },
];

function OutreachShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { chatOpen, setChatOpen, chatContext } = useOutreach();

  // Hide tabs on wizard / detail pages
  const isSubPage = /\/outreach\/(new|[0-9a-f-]{20,})/.test(pathname);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-4 flex-shrink-0">
        <div className="max-w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Image src="/agents/sofia.png" alt="Sofia" width={48} height={48} className="rounded-full ring-2 ring-violet-200 shadow-md" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Sofia &mdash; Marketing Hub</h1>
              <p className="text-xs text-slate-500">Email, Sequences, Social &amp; Analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/agent/outreach/new" className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-semibold hover:bg-violet-700 transition-colors">
              + New Campaign
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      {!isSubPage && (
        <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex-shrink-0">
          <div className="flex gap-1 py-2 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const isActive = tab.href === "/agent/outreach"
                ? pathname === "/agent/outreach"
                : pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={"px-3 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap " + (isActive ? "bg-violet-600 text-white" : "text-slate-600 hover:bg-slate-100")}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Main + Sofia sidebar */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>

        {/* Sofia chat - desktop */}
        <div className="hidden lg:flex w-[420px] border-l border-slate-200 flex-shrink-0 flex-col bg-white">
          <SofiaChatPanel campaignContext={chatContext} />
        </div>
      </div>

      {/* Mobile floating Sofia button */}
      <button
        onClick={() => setChatOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full bg-violet-600 shadow-lg z-40 flex items-center justify-center hover:bg-violet-700 transition-colors hover:scale-105 active:scale-95 ring-4 ring-violet-200"
      >
        <Image src="/agents/sofia.png" alt="Chat with Sofia" width={40} height={40} className="rounded-full" />
      </button>

      {/* Mobile chat slide-over */}
      {chatOpen && (
        <>
          <div className="lg:hidden fixed inset-0 bg-black/40 z-40" onClick={() => setChatOpen(false)} />
          <div className="lg:hidden fixed inset-y-0 right-0 w-full sm:w-[420px] bg-white shadow-2xl z-50 flex flex-col">
            <SofiaChatPanel onClose={() => setChatOpen(false)} campaignContext={chatContext} />
          </div>
        </>
      )}
    </div>
  );
}

export default function OutreachLayout({ children }: { children: ReactNode }) {
  return (
    <OutreachProvider>
      <OutreachShell>{children}</OutreachShell>
    </OutreachProvider>
  );
}
