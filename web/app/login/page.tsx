"use client";
import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { login, useAuthStore } from "../../src/lib/authStore";

function LoginContent() {
  const router = useRouter();
  const search = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const space = search?.get("space");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode] = useState<"traveler" | "agent" | "partner">("traveler");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const result = login(email.trim(), password);
      if (result.activeSpace === "agent") {
        router.push("/agent");
        return;
      }
      if (result.activeSpace === "partner") {
        router.push("/partner/dashboard");
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
        <div className="rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-800">
          Traveler (temporary mode)
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
              onClick={() => router.push("/signup")}
              className="w-full py-2 px-3 border rounded hover:bg-gray-50"
            >
              Create an account
            </button>
            <button
              type="button"
              disabled
              className="w-full py-2 px-3 border rounded bg-gray-50 text-gray-400 cursor-not-allowed"
            >
              Partner sign-up (temporarily disabled)
            </button>
          </div>

          {/* Dev helper: quick HQ login (dev only) */}
          {process.env.NODE_ENV !== 'production' && (
            <div className="mt-2 text-center">
              <button
                type="button"
                onClick={() => { setEmail('info@zeniva.ca'); setPassword('Baton08!!'); setMode('agent'); }}
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
