"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useAuthStore } from "../../../src/lib/authStore";
import Link from "next/link";

const AUTH = "Bearer zeniva-secret-2025";

export default function AgentSettingsPage() {
  const user = useAuthStore((s) => s.user);
  const [profile, setProfile] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [personalEmail, setPersonalEmail] = useState("");
  const [bio, setBio] = useState("");
  const [signature, setSignature] = useState("");

  useEffect(() => {
    if (!user?.email) return;
    fetch(`/api/agents-proxy?path=admin/agent-profile/${encodeURIComponent(user.email)}`, {
      headers: { Authorization: AUTH },
    })
      .then((r) => r.json())
      .then((d) => {
        const p = d?.profile;
        if (p) {
          setProfile(p);
          setFirstName(p.first_name || "");
          setLastName(p.last_name || "");
          setPhone(p.phone || "");
          setPersonalEmail(p.personal_email || p.email || "");
          setBio(p.bio || "");
          setSignature(p.signature || "");
        }
      })
      .catch(() => {});
  }, [user?.email]);

  const save = async () => {
    if (!user?.email) return;
    setSaving(true);
    try {
      await fetch(`/api/agents-proxy?path=admin/agent-profile/${encodeURIComponent(user.email)}`, {
        method: "PATCH",
        headers: { Authorization: AUTH, "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          phone,
          personal_email: personalEmail,
          bio,
          signature,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/agent" className="text-slate-400 hover:text-white transition-colors">← Dashboard</Link>
          <span className="text-slate-600">/</span>
          <h1 className="text-xl font-black">Agent Settings</h1>
        </div>

        <div className="space-y-6">
          {/* Profile card */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
            <h2 className="font-bold text-lg mb-4 text-blue-400">👤 Agent Profile</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">First Name</label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-slate-800 rounded-xl px-4 py-2.5 text-white border border-slate-600 focus:border-blue-500 outline-none"
                  placeholder="Louis"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Last Name</label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-slate-800 rounded-xl px-4 py-2.5 text-white border border-slate-600 focus:border-blue-500 outline-none"
                  placeholder="Blais"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-400 mb-1">Bio (shown to clients)</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full bg-slate-800 rounded-xl px-4 py-2.5 text-white border border-slate-600 focus:border-blue-500 outline-none resize-none"
                placeholder="Travel specialist since 2020..."
              />
            </div>
          </div>

          {/* Contact / Communication */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
            <h2 className="font-bold text-lg mb-1 text-blue-400">📬 Communication Channels</h2>
            <p className="text-xs text-slate-400 mb-4">Lina will use these to send emails and SMS <strong>in your name</strong> to your clients.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Your professional email</label>
                <input
                  value={personalEmail}
                  onChange={(e) => setPersonalEmail(e.target.value)}
                  type="email"
                  className="w-full bg-slate-800 rounded-xl px-4 py-2.5 text-white border border-slate-600 focus:border-blue-500 outline-none"
                  placeholder="louis@myagency.com"
                />
                <p className="text-xs text-slate-500 mt-1">Clients reply to this address. Lina signs emails with your name.</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Your cell / WhatsApp number</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  type="tel"
                  className="w-full bg-slate-800 rounded-xl px-4 py-2.5 text-white border border-slate-600 focus:border-blue-500 outline-none"
                  placeholder="+15141234567"
                />
                <p className="text-xs text-slate-500 mt-1">Used for SMS campaigns and Lina outbound calls on your behalf.</p>
              </div>
            </div>
          </div>

          {/* Email signature */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
            <h2 className="font-bold text-lg mb-1 text-blue-400">✍️ Email Signature</h2>
            <p className="text-xs text-slate-400 mb-4">Added to all emails Lina sends on your behalf.</p>
            <textarea
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              rows={4}
              className="w-full bg-slate-800 rounded-xl px-4 py-2.5 text-white border border-slate-600 focus:border-blue-500 outline-none resize-none font-mono text-sm"
              placeholder={`${firstName || "Louis"} ${lastName || "Blais"}\nTravel Specialist · Zeniva Travel\n${phone || "+1 514 000-0000"}`}
            />
          </div>

          {/* Account info (read-only) */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700">
            <h2 className="font-bold text-lg mb-4 text-slate-400">🔐 Account</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Login email</span>
                <span className="text-white font-mono">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Role</span>
                <span className="text-blue-400 font-semibold">{profile?.agent_type || user?.role || "agent"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Commission rate</span>
                <span className="text-emerald-400 font-semibold">{profile?.commission_rate || 5}% of net profit</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ref code</span>
                <span className="text-white font-mono text-xs">{profile?.ref_code || "—"}</span>
              </div>
            </div>
          </div>

          {/* Save button */}
          <div className="flex justify-end gap-3">
            {saved && (
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                ✅ Saved!
              </div>
            )}
            <button
              onClick={save}
              disabled={saving}
              className="px-8 py-3 rounded-xl font-black text-white transition-all"
              style={{ background: saving ? "#334155" : "linear-gradient(90deg, #0F6CF5, #0B1B4D)" }}
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
