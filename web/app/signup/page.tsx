"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signup, useAuthStore, type Role } from "../../src/lib/authStore";
import { addAgentFromAccount } from "../../src/lib/agent/agents";

export default function SignupPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [mode, setMode] = useState<"traveler" | "agent">("traveler");
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState(deriveInvite("travel-agent"));
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
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
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Account type">
          <button
            type="button"
            onClick={() => setMode("traveler")}
            className={`rounded border px-3 py-2 text-sm font-semibold ${mode === "traveler" ? "border-black bg-black text-white" : "border-gray-300 text-gray-800"}`}
          >
            Traveler account
          </button>
          <button
            type="button"
            onClick={() => setMode("agent")}
            className={`rounded border px-3 py-2 text-sm font-semibold ${mode === "agent" ? "border-black bg-black text-white" : "border-gray-300 text-gray-800"}`}
          >
            Agent account
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
