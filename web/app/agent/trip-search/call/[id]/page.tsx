"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import AgentChatThread from "@/components/agent-chat/AgentChatThread";

const LinaVideoCall = dynamic(() => import("@/src/components/LinaVideoCall"), { ssr: false });

export default function AgentTripCallPage() {
  const params = useParams();
  const tripId = params.id as string;
  const [showChat, setShowChat] = useState(false);

  return (
    <main className="min-h-screen bg-slate-950">
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/agent/trip-search" className="text-white/60 hover:text-white text-sm font-semibold transition-colors">{"\u2190"} Trip Search</Link>
            <div className="h-4 w-px bg-white/10" />
            <img src="/agents/lina.png" alt="Lina" className="h-8 w-8 rounded-full object-cover" />
            <span className="text-white font-bold text-sm">Lina AI</span>
            <span className="text-white/40 text-xs">{"\u00B7"} Agent Voice Call</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowChat(!showChat)} className={`text-xs font-semibold px-4 py-2 rounded-full border transition-all ${showChat ? "bg-teal-500/20 text-teal-300 border-teal-500/30" : "bg-white/5 text-white/60 border-white/10 hover:text-white"}`}>
              {"\uD83D\uDCAC"} {showChat ? "Hide" : "Show"} Chat
            </button>
            <Link href={`/agent/trip-search/chat/${tripId}`} className="text-xs font-semibold px-4 py-2 rounded-full bg-white/5 text-white/60 border border-white/10 hover:text-white transition-all">
              Switch to Chat
            </Link>
          </div>
        </div>
      </header>
      <div className={`max-w-7xl mx-auto px-4 py-6 ${showChat ? "grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6" : ""}`}>
        <div className={`flex items-center justify-center ${showChat ? "" : "min-h-[70vh]"}`}>
          <LinaVideoCall tripId={tripId} />
        </div>
        {showChat && (
          <div className="bg-slate-900 rounded-2xl border border-white/10 flex flex-col max-h-[80vh] overflow-hidden">
            <AgentChatThread tripId={tripId} />
          </div>
        )}
      </div>
    </main>
  );
}
