import type { ReactNode } from "react";

type Accent = "blue" | "rose" | "neutral";

const ACCENT_STYLES: Record<Accent, { badgeBg: string; badgeText: string; ring: string }> = {
  blue: {
    badgeBg: "bg-blue-50 border-blue-200",
    badgeText: "text-blue-700",
    ring: "ring-blue-100",
  },
  rose: {
    badgeBg: "bg-rose-50 border-rose-200",
    badgeText: "text-rose-700",
    ring: "ring-rose-100",
  },
  neutral: {
    badgeBg: "bg-slate-50 border-slate-200",
    badgeText: "text-slate-700",
    ring: "ring-slate-100",
  },
};

export interface RoleCategoryProps {
  id?: string;
  badge?: string;
  title: string;
  subtitle?: string;
  accent?: Accent;
  children: ReactNode;
}

export default function RoleCategory({
  id,
  badge,
  title,
  subtitle,
  accent = "neutral",
  children,
}: RoleCategoryProps) {
  const a = ACCENT_STYLES[accent];
  return (
    <section id={id} className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
      <div className="text-center mb-12">
        {badge ? (
          <div
            className={`inline-flex items-center gap-2 rounded-full ${a.badgeBg} border px-4 py-1.5 text-xs font-bold uppercase tracking-wider ${a.badgeText} mb-5`}
          >
            {badge}
          </div>
        ) : null}
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">{title}</h2>
        {subtitle ? (
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">{subtitle}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
