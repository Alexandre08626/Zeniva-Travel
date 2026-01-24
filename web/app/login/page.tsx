"use client";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { login, useAuthStore } from "../../src/lib/authStore";

function LoginContent() {
  const router = useRouter();
  const search = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const space = search?.get("space");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const initialMode = space === "agent" || space === "partner" ? space : "traveler";
  const [mode, setMode] = useState<"traveler" | "agent" | "partner">(initialMode);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const result = mode === "agent"
        ? await login(email.trim(), password, { role: "agent" })
        : mode === "partner"
          ? await login(email.trim(), password, { allowedRoles: ["partner_owner", "partner_staff", "hq"] })
          : await login(email.trim(), password);
      if (mode === "agent") {
        router.push("/agent");
        return;
      }
      if (mode === "partner") {
        router.push("/partner/dashboard");
        return;
      }
      if (result.activeSpace === "partner") {
        router.push("/partner/dashboard");
        return;
      }
      if (result.activeSpace === "agent") {
        router.push("/agent");
        return;
      }
      router.push("/proposals");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to sign in";
      setError(message);
    }
  };

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-6 shadow rounded">
          <h1 className="text-2xl font-semibold mb-2">Already signed in</h1>
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
      <form onSubmit={handleSubmit} className="max-w-md w-full bg-white p-6 shadow rounded space-y-4" data-mode={mode}>
        <div>
          <h1 className="text-2xl font-semibold">Sign in</h1>
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
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="space-y-2">
          <button type="submit" className="w-full py-2 px-3 bg-black text-white rounded hover:bg-gray-800">
            Sign in
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => router.push(`/signup?space=${mode}`)}
              className="w-full py-2 px-3 border rounded hover:bg-gray-50"
            >
              Create an account
            </button>
            <button
              type="button"
              onClick={() => router.push(`/signup?space=partner`)}
              className="w-full py-2 px-3 border rounded hover:bg-gray-50"
            >
              Partner sign-up
            </button>
          </div>

          {/* Dev helper: quick HQ login (dev only) */}
          {process.env.NODE_ENV !== 'production' && (
            <div className="mt-2 text-center">
              <button
                type="button"
                onClick={() => { setEmail('info@zeniva.ca'); setPassword('Baton08!!'); }}
                className="text-xs text-slate-500 hover:underline"
              >
                Dev: Sign in as HQ
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="max-w-md w-full bg-white p-6 shadow rounded"><h1 className="text-2xl font-semibold">Sign in</h1></div></div>}>
      <LoginContent />
    </Suspense>
  );
}
