"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { login, useAuthStore } from "../../src/lib/authStore";

export default function LoginPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"traveler" | "agent">("traveler");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      login(email.trim(), password, { role: mode });
      router.push(mode === "agent" ? "/agent" : "/proposals");
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
      <form onSubmit={handleSubmit} className="max-w-md w-full bg-white p-6 shadow rounded space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Sign in</h1>
          <p className="text-sm text-gray-600">Choose your space: Traveler or Zeniva Agent.</p>
        </div>
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Sign-in type">
          <button
            type="button"
            onClick={() => setMode("traveler")}
            className={`rounded border px-3 py-2 text-sm font-semibold ${mode === "traveler" ? "border-black bg-black text-white" : "border-gray-300 text-gray-800"}`}
          >
            Traveler sign-in
          </button>
          <button
            type="button"
            onClick={() => setMode("agent")}
            className={`rounded border px-3 py-2 text-sm font-semibold ${mode === "agent" ? "border-black bg-black text-white" : "border-gray-300 text-gray-800"}`}
          >
            Agent sign-in
          </button>
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
          <button
            type="button"
            onClick={() => router.push("/signup")}
            className="w-full py-2 px-3 border rounded hover:bg-gray-50"
          >
            Create an account
          </button>
        </div>
      </form>
    </div>
  );
}
