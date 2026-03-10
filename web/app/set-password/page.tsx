'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

const BLUE = "#0F6CF5";
const GOLD = "#E6B85A";
const DARK = "#040d1f";

function SetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();
  const isNew = params?.get("new") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Get email from cookie if available
  useEffect(() => {
    const m = document.cookie.match(/zeniva_email=([^;]+)/);
    if (m) setEmail(decodeURIComponent(m[1]));
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    if (!password || password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus("error");
        setErrorMsg(data.error || "Failed. Please try again.");
        return;
      }
      setStatus("success");
      // Redirect to homepage after 2 seconds
      setTimeout(() => router.push("/"), 2000);
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please try again.");
    }
  }

  const firstName = email.split("@")[0].split(".")[0];
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  return (
    <div style={{ minHeight: "100vh", background: DARK, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 20px" }}>
      <div style={{ maxWidth: 420, width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: "40px 32px" }}>
        {/* Lina avatar */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", border: `3px solid ${GOLD}`, overflow: "hidden", margin: "0 auto 16px" }}>
            <img src="/branding/lina-avatar.png" alt="Lina" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          {isNew ? (
            <>
              <h1 style={{ color: "white", fontSize: 24, fontWeight: 900, margin: "0 0 8px" }}>
                Welcome{email ? `, ${displayName}` : ""}! 🎉
              </h1>
              <p style={{ color: "#94a3b8", fontSize: 14, margin: "0 0 16px" }}>
                Your account is ready — create your password to access your Zeniva dashboard.
              </p>
              {/* 15% discount banner */}
              <div style={{ background: `linear-gradient(135deg, ${GOLD}22, ${GOLD}11)`, border: `1.5px solid ${GOLD}55`, borderRadius: 14, padding: "12px 16px", marginBottom: 4 }}>
                <div style={{ color: GOLD, fontWeight: 900, fontSize: 15, marginBottom: 3 }}>🎁 Your 15% discount is confirmed!</div>
                <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, lineHeight: 1.5 }}>
                  It will be automatically applied to your first booking — no code needed.
                </div>
              </div>
            </>
          ) : (
            <>
              <h1 style={{ color: "white", fontSize: 22, fontWeight: 900, margin: "0 0 8px" }}>Set your password</h1>
              <p style={{ color: "#94a3b8", fontSize: 14, margin: 0 }}>Choose a secure password for your account.</p>
            </>
          )}
        </div>

        {status === "success" ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <p style={{ color: "#4ade80", fontWeight: 700, fontSize: 16 }}>Password set! Redirecting…</p>
          </div>
        ) : (
          <form onSubmit={onSubmit}>
            {/* Email hidden — already collected in form */}
            <input type="hidden" value={email} />

            {/* Password */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", color: "#64748b", fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  autoFocus
                  style={{ width: "100%", background: "rgba(255,255,255,0.07)", border: `1.5px solid ${password.length >= 6 ? BLUE : "rgba(255,255,255,0.12)"}`, borderRadius: 12, padding: "12px 48px 12px 16px", color: "white", fontSize: 15, outline: "none", boxSizing: "border-box" }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#64748b", fontSize: 16 }}>
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Confirm */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", color: "#64748b", fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Confirm password</label>
              <input
                type={showPass ? "text" : "password"}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repeat your password"
                style={{ width: "100%", background: "rgba(255,255,255,0.07)", border: `1.5px solid ${confirm && confirm === password ? "#4ade80" : "rgba(255,255,255,0.12)"}`, borderRadius: 12, padding: "12px 16px", color: "white", fontSize: 15, outline: "none", boxSizing: "border-box" }}
              />
            </div>

            {/* Error */}
            {(status === "error" || errorMsg) && (
              <div style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, color: "#fca5a5", fontSize: 13 }}>
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={status === "loading" || password.length < 6 || password !== confirm}
              style={{ width: "100%", background: password.length >= 6 && password === confirm ? `linear-gradient(135deg, ${BLUE}, #0851c4)` : "rgba(255,255,255,0.1)", color: "white", border: "none", borderRadius: 50, padding: "14px", fontWeight: 700, fontSize: 16, cursor: password.length >= 6 && password === confirm ? "pointer" : "not-allowed", transition: "all 0.2s" }}
            >
              {status === "loading" ? "Setting password…" : isNew ? "🚀 Access my account" : "Set password"}
            </button>
          </form>
        )}

        {!isNew && (
          <p style={{ textAlign: "center", marginTop: 20, color: "#475569", fontSize: 12 }}>
            <a href="/login" style={{ color: BLUE, textDecoration: "none" }}>← Back to login</a>
          </p>
        )}
      </div>
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: DARK, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#64748b", fontSize: 14 }}>Loading…</div>
      </div>
    }>
      <SetPasswordForm />
    </Suspense>
  );
}
