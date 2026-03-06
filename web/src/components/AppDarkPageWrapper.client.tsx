"use client";
/**
 * AppDarkPageWrapper
 * Wraps catalog pages (Yachts, Residences, Chat) in PWA mode
 * with a dark overlay header + bottom padding.
 * The actual content is rendered as-is; CSS overrides handle card colors.
 */
import { useIsApp } from "../hooks/useIsApp";

interface Props {
  children: React.ReactNode;
  title: string;
  emoji: string;
  subtitle?: string;
}

export default function AppDarkPageWrapper({ children, title, emoji, subtitle }: Props) {
  const isApp = useIsApp();
  if (!isApp) return <>{children}</>;

  return (
    <div style={{
      minHeight: "100dvh",
      background: "#030812",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      <style>{`
        /* Hide the site header inside the dark wrapper */
        [data-site-header] { display: none !important; }
        /* Force all white cards dark */
        .bg-white.rounded-3xl, .group.bg-white, .bg-white.rounded-2xl {
          background: rgba(255,255,255,0.05) !important;
          border: 1px solid rgba(255,255,255,0.08) !important;
        }
        .bg-white.rounded-3xl h2, .group.bg-white h2 { color: #fff !important; }
        .bg-white.rounded-3xl p, .group.bg-white p { color: rgba(255,255,255,0.5) !important; }
        .text-slate-900 { color: #fff !important; }
        .text-slate-700 { color: rgba(255,255,255,0.7) !important; }
        .text-slate-600 { color: rgba(255,255,255,0.5) !important; }
        .text-slate-500 { color: rgba(255,255,255,0.4) !important; }
        .text-slate-400 { color: rgba(255,255,255,0.3) !important; }
        .bg-slate-50 { background: #030812 !important; }
        .border-slate-200 { border-color: rgba(255,255,255,0.07) !important; }
        .bg-slate-100 { background: rgba(255,255,255,0.06) !important; }
        select.bg-white, .bg-white.px-4.py-2, .bg-white.px-8.py-3 {
          background: rgba(255,255,255,0.07) !important;
          color: #fff !important;
          border-color: rgba(255,255,255,0.12) !important;
        }
        .hover\\:bg-slate-50:hover { background: rgba(255,255,255,0.07) !important; }
        /* "Load more" button */
        .rounded-2xl.border.border-slate-200.bg-white {
          background: rgba(255,255,255,0.05) !important;
          border-color: rgba(255,255,255,0.1) !important;
          color: rgba(255,255,255,0.7) !important;
        }
        /* "View details" button */
        a.rounded-xl.border.border-slate-200 {
          background: rgba(255,255,255,0.05) !important;
          border-color: rgba(255,255,255,0.1) !important;
          color: rgba(255,255,255,0.7) !important;
        }
        /* Filter select */
        .rounded-xl.border.border-slate-200.bg-white {
          background: rgba(255,255,255,0.07) !important;
          border-color: rgba(255,255,255,0.12) !important;
          color: #fff !important;
        }
        /* Empty state */
        .rounded-2xl.border.border-slate-200.bg-white.p-12 {
          background: rgba(255,255,255,0.03) !important;
        }
      `}</style>

      {/* Dark sticky mini-header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(3,8,18,0.95)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        paddingTop: "calc(env(safe-area-inset-top) + 10px)",
        paddingBottom: 10,
        paddingLeft: 20, paddingRight: 20,
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <div style={{ fontSize: 24 }}>{emoji}</div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em" }}>{title}</div>
          {subtitle && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>{subtitle}</div>}
        </div>
      </div>

      {/* Content — hide original header via CSS, show everything else */}
      <div style={{ paddingBottom: "calc(88px + env(safe-area-inset-bottom))" }}>
        {children}
      </div>
    </div>
  );
}
