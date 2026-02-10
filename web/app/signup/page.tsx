"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signup, useAuthStore, type Role, type Division, updatePartnerProfile, logout } from "../../src/lib/authStore";
import { addAgentFromAccount } from "../../src/lib/agent/agents";
import { addClient } from "../../src/lib/agent/store";
import { clearStoredReferral, getStoredReferral } from "../../src/lib/influencer";

export default function SignupPage() {
  const router = useRouter();
  const search = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const isAgent = mode === "agent";
      const isPartner = mode === "partner";
      const role = isPartner ? ("partner_owner" as Role) : isAgent ? agentRole : ("traveler" as Role);

      if (isAgent && agentStep === "request") {
        const res = await fetch("/api/agent-requests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim() || "Agent",
            email: email.trim(),
            role: agentRole,
            note: requestNote.trim() || undefined,
          }),
        });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload?.error || "Request failed");
        setRequestSent(true);
        if (payload?.status === "approved" && payload?.code) {
          setAgentStep("signup");
          setInviteCode(payload.code);
        }
        return;
      }

      const referral = getStoredReferral();
      const agentDivisions: Division[] = isAgent
        ? agentRole === "yacht_broker"
          ? ["YACHT"]
          : ["TRAVEL"]
        : [];
      await signup({
        name: name.trim() || (isAgent ? "Agent" : isPartner ? "Partner" : "Traveler"),
        email: email.trim(),
        password,
        role,
        roles: isPartner ? ["partner_owner"] : undefined,
        agentLevel: isAgent ? "Agent" : undefined,
        inviteCode: isAgent ? inviteCode.trim() : undefined,
        divisions: agentDivisions,
        referralCode: referral?.referralCode,
        influencerId: referral?.influencerId,
      });
      if (isPartner) {
        updatePartnerProfile({
          legalName: companyLegalName.trim() || undefined,
          displayName: companyDisplayName.trim() || undefined,
          phone: companyPhone.trim() || undefined,
          country: companyCountry.trim() || undefined,
          currency: companyCurrency.trim() || undefined,
          language: companyLanguage || undefined,
          kycStatus: "pending",
        });
      }
      if (mode === "traveler") {
        const entry = addClient({
          name: name.trim() || "Traveler",
          email: email.trim(),
          ownerEmail: "info@zenivatravel.com",
          phone: "",
          primaryDivision: "TRAVEL",
          origin: "web_signup",
        });
        try {
          await fetch("/api/clients", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: entry.id,
              name: entry.name,
              email: entry.email,
              ownerEmail: entry.ownerEmail,
              phone: entry.phone,
              origin: "web_signup",
              assignedAgents: [],
              primaryDivision: entry.primaryDivision,
            }),
          });
        } catch (err) {
          console.error("Failed to sync client", err);
        }
        if (referral?.referralCode && referral?.influencerId) {
          clearStoredReferral();
        }
      }
      if (isAgent) {
        router.push("/agent");
        return;
      }
      if (isPartner) {
        router.push("/partner/dashboard");
        return;
      }
      router.push("/proposals");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to create account";
      setError(message);
    }
  };

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-6 shadow rounded">
          <h1 className="text-2xl font-semibold mb-2">Account already exists</h1>
          <p className="text-sm text-gray-600 mb-4">{user.email}</p>
          <div className="space-y-2">
            <button
              onClick={() => router.push("/")}
              className="w-full py-2 px-3 bg-black text-white rounded hover:bg-gray-800"
            >
              Back to home
            </button>
            <button
              onClick={() => logout(`/signup?space=${mode}`)}
              className="w-full py-2 px-3 border rounded hover:bg-gray-50"
              type="button"
            >
              Sign out and create another account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="max-w-md w-full bg-white p-6 shadow rounded space-y-4" data-mode={mode}>
        <div>
          <h1 className="text-2xl font-semibold">Create an account</h1>
          <p className="text-sm text-gray-600">Choose your space: Traveler, Zeniva Agent or Partner.</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {["traveler", "agent", "partner"].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value as "traveler" | "agent" | "partner")}
              className={`rounded border px-3 py-2 text-xs font-semibold uppercase tracking-wide ${mode === value ? "border-black bg-black text-white" : "border-gray-200 bg-gray-50 text-gray-700"}`}
            >
              {value === "traveler" ? "Traveler" : value === "agent" ? "Agent" : "Partner"}
            </button>
          ))}
        </div>
        <label className="block text-sm font-medium">
          Full name
          <input
            className="mt-1 w-full border rounded px-3 py-2"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Lina Voyageur"
          />
        </label>

        {mode === "agent" && (
          <div className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAgentStep("request")}
                className={`rounded border px-3 py-2 text-xs font-semibold uppercase tracking-wide ${agentStep === "request" ? "border-black bg-black text-white" : "border-gray-200 bg-gray-50 text-gray-700"}`}
              >
                Request access
              </button>
              <button
                type="button"
                onClick={() => setAgentStep("signup")}
                className={`rounded border px-3 py-2 text-xs font-semibold uppercase tracking-wide ${agentStep === "signup" ? "border-black bg-black text-white" : "border-gray-200 bg-gray-50 text-gray-700"}`}
              >
                I have a code
              </button>
            </div>
            <label className="block text-sm font-medium">
              Agent role
              <select
                className="mt-1 w-full border rounded px-3 py-2"
                value={agentRole}
                onChange={(e) => {
                  const next = e.target.value as Role;
                  setAgentRole(next);
                }}
              >
                <option value="travel_agent">Travel agent</option>
                <option value="yacht_broker">Yacht broker</option>
                <option value="influencer">Influencer</option>
                <option value="hq">HQ</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            {agentStep === "signup" && (
              <>
                <label className="block text-sm font-medium">
                  Confirmation code (provided by Zeniva)
                  <input
                    className="mt-1 w-full border rounded px-3 py-2"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    placeholder="Enter your confirmation code"
                    required
                  />
                </label>
                <p className="text-xs text-gray-500">Use the code generated by HQ.</p>
              </>
            )}
            {agentStep === "request" && (
              <>
                <label className="block text-sm font-medium">
                  Request note (optional)
                  <textarea
                    className="mt-1 w-full border rounded px-3 py-2 min-h-[90px]"
                    value={requestNote}
                    onChange={(e) => setRequestNote(e.target.value)}
                    placeholder="Tell us your region, specialty, or team."
                  />
                </label>
                {requestSent && (
                  <p className="text-sm text-emerald-600">Request sent. Wait for HQ approval and code.</p>
                )}
              </>
            )}
          </div>
        )}

        {mode === "partner" && (
          <div className="space-y-3 mt-2">
            <label className="block text-sm font-medium">
              Company legal name
              <input className="mt-1 w-full border rounded px-3 py-2" value={companyLegalName} onChange={(e)=>setCompanyLegalName(e.target.value)} />
            </label>
            <label className="block text-sm font-medium">
              Company display name
              <input className="mt-1 w-full border rounded px-3 py-2" value={companyDisplayName} onChange={(e)=>setCompanyDisplayName(e.target.value)} />
            </label>
            <label className="block text-sm font-medium">
              Phone
              <input className="mt-1 w-full border rounded px-3 py-2" value={companyPhone} onChange={(e)=>setCompanyPhone(e.target.value)} />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="block text-sm font-medium">
                Country
                <input className="mt-1 w-full border rounded px-3 py-2" value={companyCountry} onChange={(e)=>setCompanyCountry(e.target.value)} />
              </label>
              <label className="block text-sm font-medium">
                Currency
                <input className="mt-1 w-full border rounded px-3 py-2" value={companyCurrency} onChange={(e)=>setCompanyCurrency(e.target.value)} />
              </label>
            </div>
            <label className="block text-sm font-medium">
              Language
              <select className="mt-1 w-full border rounded px-3 py-2" value={companyLanguage} onChange={(e)=>setCompanyLanguage(e.target.value)}>
                <option value="en">English</option>
                <option value="fr">French</option>
              </select>
            </label>
          </div>
        )}
        <label className="block text-sm font-medium">
          Email
          <input
            className="mt-1 w-full border rounded px-3 py-2"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        {(mode !== "agent" || agentStep === "signup") && (
          <label className="block text-sm font-medium">
            Password
            <input
              className="mt-1 w-full border rounded px-3 py-2"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="space-y-2">
          <button type="submit" className="w-full py-2 px-3 bg-black text-white rounded hover:bg-gray-800">
            Create account
          </button>
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="w-full py-2 px-3 border rounded hover:bg-gray-50"
          >
            Sign in
          </button>
        </div>
      </form>
    </div>
  );
}
