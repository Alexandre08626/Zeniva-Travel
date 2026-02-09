"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import LinaAvatar from "./LinaAvatar";
import { useAuthStore } from "../lib/authStore";
import { normalizeRbacRole } from "../lib/rbac";

type Mode = "traveler" | "partner" | "agent" | "hq";

const MODE_COPY: Record<Mode, {
  title: string;
  subtitle: string;
}> = {
  traveler: {
    title: "Lina Travel Concierge",
    subtitle: "Trip planning, hotels, flights, and experiences tailored to you.",
  },
  partner: {
    title: "Lina Partner Advisor",
    subtitle: "Inventory tips, pricing strategy, and guest communication support.",
  },
  agent: {
    title: "Lina Agent Copilot",
    subtitle: "Dossier summaries, proposal drafts, and supplier recommendations.",
  },
  hq: {
    title: "Lina HQ Operations",
    subtitle: "Approvals, compliance checks, and high-level reporting support.",
  },
};

function inferMode(pathname: string, role?: string | null): Mode {
  if (pathname.startsWith("/partner")) return "partner";
  if (pathname.startsWith("/agent")) {
    const normalized = normalizeRbacRole(role || "");
    if (normalized === "hq" || normalized === "admin") return "hq";
    return "agent";
  }
  return "traveler";
}

export default function LinaAssistantDock() {
  const pathname = usePathname() || "/";
  const user = useAuthStore((s) => s.user);
  const role = user?.effectiveRole || user?.role || null;
  const mode = useMemo(() => inferMode(pathname, role), [pathname, role]);
  const copy = MODE_COPY[mode];

  const helpUrl = "https://www.zenivatravel.com/chat/agent?channel=agent-alexandre&source=/documents";

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      <button
        type="button"
        onClick={() => {
          if (typeof window !== "undefined") {
            window.location.href = helpUrl;
          }
        }}
        className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-slate-700 shadow-sm hover:border-slate-300"
        aria-label="Open Lina assistant"
      >
        <LinaAvatar size="sm" />
        <div className="text-left">
          <div className="text-sm font-semibold text-slate-700">
            Help
          </div>
          <div className="text-[11px] font-semibold text-slate-500">
            {copy.title}
          </div>
        </div>
      </button>
    </div>
  );
}
