"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signup, useAuthStore, type Role, updatePartnerProfile } from "../../src/lib/authStore";
import { addAgentFromAccount } from "../../src/lib/agent/agents";

export default function SignupPage() {
  const router = useRouter();
  const search = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const user = useAuthStore((s) => s.user);
  const [mode, setMode] = useState<"traveler" | "agent" | "partner">(search.get("space") === "partner" ? "partner" : "traveler");
  const deriveInvite = (role: string) => {
    if (role === "hq") return "ZENIVA-HQ";
    if (role === "admin") return "ZENIVA-ADMIN";
    if (role === "finance") return "ZENIVA-ADMIN";
    if (role === "support") return "ZENIVA-ADMIN";
    if (role === "yacht-partner") return "ZENIVA-AGENT";
    return "ZENIVA-AGENT";
  };
  const [agentRole, setAgentRole] = useState<Role>("travel-agent");
  const [name, setName] = useState("");
  const [companyLegalName, setCompanyLegalName] = useState("");
  const [companyDisplayName, setCompanyDisplayName] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyCountry, setCompanyCountry] = useState("");
  const [companyCurrency, setCompanyCurrency] = useState("");
  const [companyLanguage, setCompanyLanguage] = useState("en");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState(deriveInvite("travel-agent"));
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (mode === "partner") {
        // Create partner owner account and pre-fill partner company info (KYC pending)
        signup({
          name: name.trim() || "Partner Owner",
          email: email.trim(),
          password,
          role: "partner_owner",
          agentLevel: undefined,
          inviteCode: inviteCode ? inviteCode.trim() : undefined,
          divisions: [],
        });
        // Immediately attach partner company profile to the signed-in account
        try {
          setTimeout(() => {
            // lazy call to avoid race with signup persistence
            try {
              updatePartnerProfile({
                legalName: companyLegalName,
                displayName: companyDisplayName,
                phone: companyPhone,
                country: companyCountry,
                currency: companyCurrency,
                language: companyLanguage,
                kycStatus: "pending",
              });
            } catch (ex) {
              console.error("updatePartnerProfile error:", ex);
            }
            router.push("/partner/onboarding");
          }, 200);
        } catch (err) {
          console.error("partner signup flow error:", err);
          router.push("/partner/onboarding");
        }
        return;
      }

      signup({
        name: name.trim() || (mode === "agent" ? "Agent" : "Traveler"),
        email: email.trim(),
        password,
        role: mode === "agent" ? agentRole : ("traveler" as Role),
        agentLevel: mode === "agent" ? "Agent" : undefined,
        inviteCode: mode === "agent" ? inviteCode.trim() : undefined,
        divisions: mode === "agent" ? ["TRAVEL", "YACHT", "VILLAS", "GROUPS", "RESORTS"] : [],
      });
      if (mode === "agent") {
        addAgentFromAccount({
          name: name.trim() || "Agent",
          email: email.trim(),
          role: agentRole,
          divisions: ["TRAVEL", "YACHT", "VILLAS", "GROUPS", "RESORTS"],
          status: "active",
        });
      }
      router.push(mode === "agent" ? "/agent" : "/proposals");
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
          <button
            onClick={() => router.push("/")}
            className="w-full py-2 px-3 bg-black text-white rounded hover:bg-gray-800"
          >
            Back to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="max-w-md w-full bg-white p-6 shadow rounded space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Create an account</h1>
          <p className="text-sm text-gray-600">Choose your space: Traveler or Zeniva Agent.</p>
        </div>
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Account type">
          <button
            type="button"
            onClick={() => setMode("traveler")}
            className={`rounded border px-3 py-2 text-sm font-semibold ${mode === "traveler" ? "border-black bg-black text-white" : "border-gray-300 text-gray-800"}`}
          >
            Traveler
          </button>
          <button
            type="button"
            onClick={() => setMode("agent")}
            className={`rounded border px-3 py-2 text-sm font-semibold ${mode === "agent" ? "border-black bg-black text-white" : "border-gray-300 text-gray-800"}`}
          >
            Agent
          </button>
          <button
            type="button"
            onClick={() => setMode("partner")}
            className={`rounded border px-3 py-2 text-sm font-semibold ${mode === "partner" ? "border-black bg-black text-white" : "border-gray-300 text-gray-800"}`}
          >
            Partner
          </button>
        </div>
        {mode === "agent" && (
          <label className="block text-sm font-medium">
            Agent role
            <select
              className="mt-1 w-full border rounded px-3 py-2"
              value={agentRole}
              onChange={(e) => {
                const nextRole = e.target.value as Role;
                setAgentRole(nextRole);
                setInviteCode(deriveInvite(nextRole));
              }}
            >
              <option value="hq">Owner (HQ)</option>
              <option value="travel-agent">Travel Agent</option>
              <option value="yacht-partner">Yacht Partner</option>
              <option value="admin">Admin</option>
            </select>
          </label>
        )}
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
        {mode === "agent" && (
          <label className="block text-sm font-medium">
            Invite code / admin validation
            <input
              className="mt-1 w-full border rounded px-3 py-2"
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Ex: ZENIVA-AGENT"
              required={mode === "agent"}
              readOnly
            />
            <p className="text-xs text-gray-500 mt-1">Auto-selected from agent role. Reserved for Zeniva agents and partners.</p>
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
