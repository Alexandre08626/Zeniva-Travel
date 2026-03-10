"use client";
import { FormEvent, Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { signup, useAuthStore, type Role, type Division, updatePartnerProfile, logout } from "../../src/lib/authStore";
import { addAgentFromAccount } from "../../src/lib/agent/agents";
import { addClient } from "../../src/lib/agent/store";
import { clearStoredReferral, getStoredReferral } from "../../src/lib/influencer";

const GOLD = "#E6B85A";
const BLUE = "#0F6CF5";
const NAVY = "#0B1B4D";

function inp(extra?: React.CSSProperties): React.CSSProperties {
  return {
    width: "100%", padding: "14px 16px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 12, color: "#fff", fontSize: 15,
    outline: "none", boxSizing: "border-box",
    ...extra,
  };
}

function SignupContent() {
  const router = useRouter();
  const search = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const user = useAuthStore((s) => s.user);
  const initialMode = (() => {
    const space = search.get("space");
    return space === "agent" || space === "partner" ? space : "traveler";
  })();
  const [mode, setMode] = useState<"traveler" | "agent" | "partner">(initialMode);
  const [agentRole, setAgentRole] = useState<Role>("travel_agent");
  const [name, setName] = useState("");
  const [companyLegalName, setCompanyLegalName] = useState("");
  const [companyDisplayName, setCompanyDisplayName] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyCountry, setCompanyCountry] = useState("");
  const [companyCurrency, setCompanyCurrency] = useState("");
  const [companyLanguage, setCompanyLanguage] = useState("en");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [agentStep, setAgentStep] = useState<"request" | "signup">("request");
  const [requestNote, setRequestNote] = useState("");
  const [requestSent, setRequestSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const isAgent = mode === "agent";
      const isPartner = mode === "partner";
      const role = isPartner ? ("partner_owner" as Role) : isAgent ? agentRole : ("traveler" as Role);

      if (isAgent && agentStep === "request") {
        const res = await fetch("/api/agent-requests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim() || "Agent", email: email.trim(), role: agentRole, note: requestNote.trim() || undefined }),
        });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload?.error || "Request failed");
        setRequestSent(true);
        if (payload?.status === "approved" && payload?.code) { setAgentStep("signup"); setInviteCode(payload.code); }
        return;
      }

      const referral = getStoredReferral();
      const agentDivisions: Division[] = isAgent ? (agentRole === "yacht_broker" ? ["YACHT"] : ["TRAVEL"]) : [];
      await signup({
        name: name.trim() || (isAgent ? "Agent" : isPartner ? "Partner" : "Traveler"),
        email: email.trim(), password, role,
        roles: isPartner ? ["partner_owner"] : undefined,
        agentLevel: isAgent ? "Agent" : undefined,
        inviteCode: isAgent ? inviteCode.trim() : undefined,
        divisions: agentDivisions,
        referralCode: referral?.referralCode,
        influencerId: referral?.influencerId,
      });
      if (isPartner) {
        updatePartnerProfile({ legalName: companyLegalName.trim() || undefined, displayName: companyDisplayName.trim() || undefined, phone: companyPhone.trim() || undefined, country: companyCountry.trim() || undefined, currency: companyCurrency.trim() || undefined, language: companyLanguage || undefined, kycStatus: "pending" });
      }
      if (mode === "traveler") {
        const entry = addClient({ name: name.trim() || "Traveler", email: email.trim(), ownerEmail: "info@zeniva.ca", phone: "", primaryDivision: "TRAVEL", origin: "web_signup" });
        try {
          await fetch("/api/clients", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: entry.id, name: entry.name, email: entry.email, ownerEmail: entry.ownerEmail, phone: entry.phone, origin: "web_signup", assignedAgents: [], primaryDivision: entry.primaryDivision }) });
        } catch (err) { console.error("Failed to sync client", err); }
        if (referral?.referralCode && referral?.influencerId) clearStoredReferral();
      }
      if (isAgent) { router.push("/agent"); return; }
      if (isPartner) { router.push("/partner/dashboard"); return; }
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account");
    } finally {
      setLoading(false);
    }
  };

  const modeConfig = {
    traveler: { label: "Traveler", icon: "✈️" },
    agent: { label: "Agent", icon: "🏢" },
    partner: { label: "Partner", icon: "🤝" },
  };

  // Already logged in
  if (user) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #020810, #0B1B4D)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: "32px 28px", maxWidth: 380, width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>👤</div>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Already signed in</div>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginBottom: 24 }}>{user.email}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button onClick={() => router.push("/")} style={{ padding: "14px", background: `linear-gradient(135deg, ${NAVY}, ${BLUE})`, border: "none", borderRadius: 14, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
              Back to home →
            </button>
            <button onClick={() => logout(`/signup?space=${mode}`)} style={{ padding: "13px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, color: "rgba(255,255,255,0.5)", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
              Sign out and create another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #020810 0%, #0B1B4D 50%, #0F1E5A 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px", position: "relative", overflow: "hidden" }}>
      {/* Orbs */}
      <div style={{ position: "absolute", top: "10%", left: "5%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(15,108,245,0.15) 0%, transparent 70%)", filter: "blur(40px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "10%", right: "5%", width: 250, height: 250, borderRadius: "50%", background: "radial-gradient(circle, rgba(230,184,90,0.1) 0%, transparent 70%)", filter: "blur(40px)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <img src="/branding/lina-avatar.png" alt="Lina" style={{ width: 64, height: 64, borderRadius: "50%", border: `2px solid ${GOLD}`, marginBottom: 12 }} />
          <div style={{ fontSize: 24, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
            Zeniva <span style={{ color: GOLD }}>Travel</span>
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>AI-Powered Luxury Travel</div>
        </div>

        {/* 15% banner — only for travelers */}
        {mode === "traveler" && (
          <div style={{ background: "linear-gradient(135deg, rgba(230,184,90,0.18), rgba(230,184,90,0.08))", border: "1px solid rgba(230,184,90,0.35)", borderRadius: 16, padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 28 }}>🎁</span>
            <div>
              <div style={{ color: GOLD, fontWeight: 900, fontSize: 14 }}>15% OFF your first booking</div>
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>Applied automatically — villa, yacht, hotel, or flight</div>
            </div>
          </div>
        )}

        {/* Card */}
        <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: "32px 28px", backdropFilter: "blur(20px)" }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Create your account</h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>Free — takes 30 seconds</p>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 24, background: "rgba(0,0,0,0.3)", borderRadius: 12, padding: 4 }}>
            {(["traveler", "agent", "partner"] as const).map((m) => (
              <button key={m} type="button" onClick={() => setMode(m)} style={{ flex: 1, padding: "8px 4px", borderRadius: 9, border: "none", background: mode === m ? "rgba(15,108,245,0.8)" : "transparent", color: mode === m ? "#fff" : "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 700, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {modeConfig[m].icon} {modeConfig[m].label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Name */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 8 }}>Full name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Smith" style={inp()} />
            </div>

            {/* Agent extras */}
            {mode === "agent" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["request", "signup"] as const).map(step => (
                    <button key={step} type="button" onClick={() => setAgentStep(step)} style={{ flex: 1, padding: "9px", borderRadius: 10, border: "none", background: agentStep === step ? "rgba(15,108,245,0.8)" : "rgba(255,255,255,0.06)", color: agentStep === step ? "#fff" : "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                      {step === "request" ? "Request access" : "I have a code"}
                    </button>
                  ))}
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 8 }}>Agent role</label>
                  <select value={agentRole} onChange={e => setAgentRole(e.target.value as Role)} style={{ ...inp(), color: "#cbd5e1" }}>
                    <option value="travel_agent">Travel agent</option>
                    <option value="yacht_broker">Yacht broker</option>
                    <option value="influencer">Influencer</option>
                    <option value="hq">HQ</option>
                  </select>
                </div>
                {agentStep === "signup" && (
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 8 }}>Confirmation code</label>
                    <input value={inviteCode} onChange={e => setInviteCode(e.target.value)} placeholder="Provided by HQ" style={inp()} required />
                  </div>
                )}
                {agentStep === "request" && (
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 8 }}>Note (optional)</label>
                    <textarea value={requestNote} onChange={e => setRequestNote(e.target.value)} placeholder="Your region, specialty..." style={{ ...inp(), minHeight: 80, resize: "vertical" as const }} />
                    {requestSent && <div style={{ color: "#34d399", fontSize: 13, marginTop: 8 }}>✅ Request sent — wait for HQ approval</div>}
                  </div>
                )}
              </div>
            )}

            {/* Partner extras */}
            {mode === "partner" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { label: "Company legal name", val: companyLegalName, set: setCompanyLegalName },
                  { label: "Display name", val: companyDisplayName, set: setCompanyDisplayName },
                  { label: "Phone", val: companyPhone, set: setCompanyPhone },
                ].map(f => (
                  <div key={f.label}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 8 }}>{f.label}</label>
                    <input value={f.val} onChange={e => f.set(e.target.value)} style={inp()} />
                  </div>
                ))}
              </div>
            )}

            {/* Email */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 8 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="your@email.com" style={inp()} />
            </div>

            {/* Password */}
            {(mode !== "agent" || agentStep === "signup") && (
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: 8 }}>Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" style={inp()} />
              </div>
            )}

            {error && (
              <div style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "12px 16px", color: "#f87171", fontSize: 14 }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{ width: "100%", padding: "16px", background: loading ? "rgba(15,108,245,0.5)" : `linear-gradient(135deg, ${NAVY}, ${BLUE})`, border: "none", borderRadius: 14, color: "#fff", fontSize: 16, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", marginTop: 4 }}>
              {loading ? "Creating account..." : mode === "traveler" ? "🎁 Create account — Get 15% OFF →" : `Create ${modeConfig[mode].label} account →`}
            </button>
          </form>

          <div style={{ marginTop: 20, textAlign: "center" }}>
            <a href="/login" style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>Already have an account? Sign in →</a>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 24, fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
          🔒 Secure · Zeniva Travel © 2025 · Delaware, USA
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #020810, #0B1B4D)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 48, height: 48, border: "3px solid rgba(15,108,245,0.3)", borderTop: "3px solid #0F6CF5", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      </div>
    }>
      <SignupContent />
    </Suspense>
  );
}
