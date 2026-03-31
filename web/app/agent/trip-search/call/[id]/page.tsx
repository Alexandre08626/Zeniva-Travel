"use client";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function AgentTripCallPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const sessionId = params.id as string;
  const clientName = searchParams.get("client") || "";

  return (
    <main className="min-h-screen bg-[#F3F6FB] flex items-center justify-center">
      <div className="max-w-lg text-center space-y-6">
        <Image src="/agents/sofia.png" alt="Lina Voice" width={120} height={120} className="mx-auto rounded-full shadow-lg" />
        <h1 className="text-2xl font-black text-slate-900">Voice Search with Lina</h1>
        <p className="text-sm text-slate-500">
          Describe your client{clientName ? `'s (${clientName})` : "'s"} trip by voice. Lina will search flights, hotels, and activities in real-time.
        </p>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
          <p className="text-sm text-slate-600">Session: <span className="font-mono text-xs text-slate-400">{sessionId}</span></p>
          <button className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold rounded-xl text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
            {"\uD83C\uDF99\uFE0F"} Start Voice Call
          </button>
          <p className="text-xs text-slate-400">Uses your microphone. Make sure it is enabled in your browser.</p>
        </div>
        <Link href={`/agent/trip-search/chat/${sessionId}?client=${encodeURIComponent(clientName)}`} className="text-sm text-teal-600 font-semibold hover:underline">
          Switch to Chat Mode {"\u2192"}
        </Link>
        <br />
        <Link href="/agent/trip-search" className="text-sm text-slate-400 hover:text-slate-600">{"\u2190"} Back to Trip Search</Link>
      </div>
    </main>
  );
}
