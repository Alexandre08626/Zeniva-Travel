"use client";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useState } from "react";

const LinaVideoCall = dynamic(() => import("@/src/components/LinaVideoCall"), { ssr: false });

export default function AgentTripCallPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = params.id as string;
  const clientName = searchParams.get("client") || "";
  const [showChat, setShowChat] = useState(false);

  return (
    <main className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/agent/trip-search" className="text-white/60 hover:text-white text-sm font-semibold transition-colors">
              {"\u2190"} Back
            </Link>
            <div className="h-4 w-px bg-white/10" />
            <Image src="/agents/lina.png" alt="Lina" width={32} height={32} className="rounded-full" />
            <span className="text-white font-bold text-sm">Lina AI</span>
            <span className="text-white/40 text-xs">{"\u00B7"} Agent Voice Search</span>
            {clientName && (
              <div className="flex items-center gap-1 bg-violet-500/20 border border-violet-500/30 rounded-full px-2.5 py-0.5">
                <span className="text-violet-300 text-xs font-semibold">{"\uD83D\uDC64"} {clientName}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowChat(!showChat)} className={`text-xs font-semibold px-4 py-2 rounded-full border transition-all ${showChat ? "bg-teal-500/20 text-teal-300 border-teal-500/30" : "bg-white/5 text-white/60 border-white/10 hover:text-white"}`}>
              {"\uD83D\uDCAC"} {showChat ? "Hide" : "Show"} Chat
            </button>
            <button onClick={() => router.push(`/agent/trip-search/chat/${sessionId}?client=${encodeURIComponent(clientName)}&hybrid=1`)} className="text-xs font-semibold px-4 py-2 rounded-full bg-white/5 text-white/60 border border-white/10 hover:text-white transition-all">
              Switch to Hybrid
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        {/* Video call */}
        <div className="flex-1 flex items-center justify-center min-h-[70vh]">
          <LinaVideoCall tripId={sessionId} />
        </div>

        {/* Chat panel (toggle) */}
        {showChat && (
          <div className="w-[380px] shrink-0 bg-slate-900 rounded-2xl border border-white/10 flex flex-col max-h-[80vh]">
            <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
              <Image src="/agents/lina.png" alt="Lina" width={24} height={24} className="rounded-full" />
              <span className="text-white text-sm font-bold">Chat with Lina</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <p className="text-white/40 text-sm text-center py-8">Chat messages from your voice call will appear here.</p>
            </div>
            <div className="p-3 border-t border-white/10">
              <input placeholder="Type a message..." className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-teal-500" />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
