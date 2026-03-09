"use client";
/**
 * AppPageWrapper (formerly AppDarkPageWrapper)
 * Wraps catalog pages (Yachts, Residences, etc.) in PWA mode
 * with a WHITE light header + bottom padding for bottom nav.
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
      background: "#f8fafc",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      <style>{`
        /* Hide the site header inside the wrapper */
        [data-site-header] { display: none !important; }
        /* Keep white cards as-is — white theme */
        .bg-slate-50 { background: #f1f5f9 !important; }
      `}</style>

      {/* White sticky mini-header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid #e2e8f0",
        paddingTop: "calc(env(safe-area-inset-top) + 10px)",
        paddingBottom: 12,
        paddingLeft: 20, paddingRight: 20,
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <div style={{ fontSize: 24 }}>{emoji}</div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 800, color: "#0B1B4D", letterSpacing: "-0.02em" }}>{title}</div>
          {subtitle && <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>{subtitle}</div>}
        </div>
      </div>

      {/* Content */}
      <div style={{ paddingBottom: "calc(88px + env(safe-area-inset-bottom))" }}>
        {children}
      </div>
    </div>
  );
}
