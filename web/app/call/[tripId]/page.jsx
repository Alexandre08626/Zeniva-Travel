"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import ConversationsSidebar from "../../../components/chat/ConversationsSidebar";
import ChatThread from "../../../components/chat/ChatThread";
import TripSnapshotPanel from "../../../components/chat/TripSnapshotPanel";
import { ensureSeedTrip, useTripsStore } from "../../../lib/store/tripsStore";

const LinaVideoCall = dynamic(() => import("../../../src/components/LinaVideoCall"), { ssr: false });

export default function CallTripPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = Array.isArray(params.tripId) ? params.tripId[0] : params.tripId;
  const { trip } = useTripsStore((s) => ({ trip: s.trips.find((t) => t.id === tripId) }));
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (!tripId) {
      const fallback = ensureSeedTrip();
      router.replace(`/call/${fallback}`);
      return;
    }
    if (!trip) ensureSeedTrip();
  }, [tripId, trip, router]);

  return (
    <main className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-white/60 hover:text-white text-sm font-semibold transition-colors">
              ← Back
            </Link>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <img src="/branding/lina-hero.png" alt="Lina" className="h-8 w-8 rounded-full object-cover object-top" />
              <span className="text-white font-bold text-sm">Lina AI</span>
              <span className="text-white/40 text-xs">· Video Call</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowChat(!showChat)}
              className={`text-xs font-semibold px-4 py-2 rounded-full border transition-all ${showChat ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" : "bg-white/5 text-white/60 border-white/10 hover:text-white hover:border-white/20"}`}
            >
              💬 {showChat ? "Hide" : "Show"} Chat
            </button>
            <Link href="/chat" className="text-xs font-semibold px-4 py-2 rounded-full bg-white/5 text-white/60 border border-white/10 hover:text-white hover:border-white/20 transition-all">
              Switch to Chat
            </Link>
          </div>
        </div>
      </header>

      {/* Main grid */}
      <div className={`max-w-7xl mx-auto px-4 py-6 ${showChat ? "grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6" : ""}`}>
        {/* Video call - main area */}
        <div>
          <LinaVideoCall tripId={tripId} />
        </div>

        {/* Side panel - chat + snapshot */}
        {showChat && (
          <div className="space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
            <TripSnapshotPanel tripId={tripId} />
            <ChatThread tripId={tripId} />
          </div>
        )}
      </div>
    </main>
  );
}
