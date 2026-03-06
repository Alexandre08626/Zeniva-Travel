"use client";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { login, useAuthStore } from "../../src/lib/authStore";

const GOLD = "#E6B85A";
const BLUE = "#0F6CF5";
const NAVY = "#0B1B4D";

function LoginContent() {
  const router = useRouter();
  const search = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const space = search?.get("space");
  const redirect = search?.get("redirect") || "";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const initialMode = space === "agent" || space === "partner" ? space : "traveler";
  const [mode, setMode] = useState<"traveler" | "agent" | "partner">(initialMode);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { setMode(initialMode); }, [initialMode]);

  useEffect(() => {
    if (user) {
      if (redirect) { router.push(redirect); return; }
      if (mode === "agent") { router.push("/agent"); return; }
      router.push("/proposals");
    }
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = mode === "agent"
        ? await login(email.trim(), password, { role: "agent" })
        : mode === "partner"
          ? await login(email.trim(), password, { allowedRoles: ["partner_owner", "partner_staff", "hq"] })
          : await login(email.trim(), password);
      if (redirect) { router.push(redirect); return; }
      if (mode === "agent") { router.push("/agent"); return; }
      if (mode === "partner") { router.push("/partner/dashboard"); return; }
      if (result.activeSpace === "partner") { router.push("/partner/dashboard"); return; }
      if (result.activeSpace === "agent") { router.push("/agent"); return; }
      router.push("/proposals");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
    } finally {
      setLoading(false);
    }
  };

  const modeConfig = {
    traveler: { label: "Traveler", icon: "✈️", desc: "Plan your dream trip with Lina" },
    agent: { label: "Agent", icon: "🏢", desc: "Access your agent dashboard" },
    partner: { label: "Partner", icon: "🤝", desc: "Partner portal" },
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #020810 0%, #0B1B4D 50%, #0F1E5A 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background orbs */}
      <div style={{ position: "absolute", top: "10%", left: "5%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(15,108,245,0.15) 0%, transparent 70%)", filter: "blur(40px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "10%", right: "5%", width: 250, height: 250, borderRadius: "50%", background: "radial-gradient(circle, rgba(230,184,90,0.1) 0%, transparent 70%)", filter: "blur(40px)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <img src="/branding/lina-avatar.png" alt="Lina" style={{ width: 64, height: 64, borderRadius: "50%", border: `2px solid ${GOLD}`, marginBottom: 12 }} />
          <div style={{ fontSize: 24, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
            Zeniva <span style={{ color: GOLD }}>Travel</span>
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>AI-Powered Luxury Travel</div>
        </div>

        {/* Card */}
        <div style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 24,
          padding: "32px 28px",
          backdropFilter: "blur(20px)",
        }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Welcome back</h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>Sign in to your account</p>

          {/* Mode tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 24, background: "rgba(0,0,0,0.3)", borderRadius: 12, padding: 4 }}>
            {(["traveler", "agent", "partner"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                style={{
                  flex: 1,
                  padding: "8px 4px",
                  borderRadius: 9,
                  border: "none",
                  background: mode === m ? "rgba(15,108,245,0.8)" : "transparent",
                  color: mode === m ? "#fff" : "rgba(255,255,255,0.5)",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {modeConfig[m].icon} {modeConfig[m].label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 8 }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 12,
                  color: "#fff",
                  fontSize: 15,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 8 }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 12,
                  color: "#fff",
                  fontSize: 15,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {error && (
              <div style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "12px 16px", color: "#f87171", fontSize: 14 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "16px",
                background: loading ? "rgba(15,108,245,0.5)" : `linear-gradient(135deg, ${NAVY}, ${BLUE})`,
                border: "none",
                borderRadius: 14,
                color: "#fff",
                fontSize: 16,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                letterSpacing: "0.02em",
                marginTop: 4,
              }}
            >
              {loading ? "Signing in..." : `Sign in as ${modeConfig[mode].label} →`}
            </button>
          </form>

          <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <a href="/reset-password" style={{ fontSize: 13, color: GOLD, textDecoration: "none" }}>Forgot password?</a>
            <a href={`/signup?space=${mode}`} style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>Create account →</a>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 24, fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
          🔒 Secure · Zeniva Travel © 2025 · Delaware, USA
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #020810, #0B1B4D)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 48, height: 48, border: "3px solid rgba(15,108,245,0.3)", borderTop: "3px solid #0F6CF5", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
