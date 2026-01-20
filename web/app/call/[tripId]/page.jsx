"use client";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ConversationsSidebar from "../../../components/chat/ConversationsSidebar";
import ChatThread from "../../../components/chat/ChatThread";
import TripSnapshotPanel from "../../../components/chat/TripSnapshotPanel";
import { ensureSeedTrip, useTripsStore } from "../../../lib/store/tripsStore";
import { TITLE_TEXT, MUTED_TEXT, PREMIUM_BLUE } from "../../../src/design/tokens";

const LINA_URL =
  "https://studio.d-id.com/agents/share?id=v2_agt_IqZ8PnzM&key=WjI5dloyeGxMVzloZFhSb01ud3hNVFUxTXpJeE5EQTRNREl5TmpJMU1qTTJORFk2TkVwSWNVWk9WM0ZGVjNJNFZXSm1abU16VGxaRA==";

function CallLayout({ sidebar, chat, snapshot, videoCall }) {
  const router = useRouter();
  return (
    <main className="min-h-screen" style={{ backgroundColor: "#f9fbff" }}>
      <div className="mx-auto max-w-7xl px-4 py-6">
        <header className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="text-sm font-semibold" style={{ color: TITLE_TEXT }}>
              ← Back
            </a>
            <div className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
              Lina Traveler · Video call
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/chat"
              className="rounded-full px-4 py-2 text-sm font-semibold border border-slate-200 bg-white"
              style={{ color: TITLE_TEXT }}
            >
              Switch to Chat
            </a>
            <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: MUTED_TEXT }}>
              <button
                onClick={() => router.push('/agent/lina')}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <img
                  src="/branding/lina-avatar.png"
                  alt="Lina avatar"
                  width={40}
                  height={40}
                  className="rounded-full shadow-sm cursor-pointer"
                />
                <span>Chat with Lina</span>
              </button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-4">
          <section className="col-span-12 lg:col-span-3">{sidebar}</section>
          <section className="col-span-12 lg:col-span-6 space-y-4">
            {videoCall}
            {chat}
          </section>
          <section className="col-span-12 lg:col-span-3">{snapshot}</section>
        </div>
      </div>
    </main>
  );
}

export default function CallTripPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = Array.isArray(params.tripId) ? params.tripId[0] : params.tripId;
  const { trip } = useTripsStore((s) => ({ trip: s.trips.find((t) => t.id === tripId) }));

  useEffect(() => {
    if (!tripId) {
      const fallback = ensureSeedTrip();
      router.replace(`/call/${fallback}`);
      return;
    }
    if (!trip) {
      // ensure seed if unknown id
      ensureSeedTrip();
    }
  }, [tripId, trip, router]);

  const videoCallSection = (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
      <div className="relative" style={{ paddingTop: "56.25%" }}>
        <iframe
          src={LINA_URL}
          title="Appel Lina Voyageur"
          className="absolute inset-0 h-full w-full"
          allow="microphone; camera; autoplay; encrypted-media"
        />
      </div>
      <div className="flex items-center justify-between px-4 py-3 text-sm text-slate-600">
        <span>🎥 Video call with Lina - same AI as chat</span>
        <a
          href={LINA_URL}
          target="_blank"
          rel="noreferrer"
          className="font-bold"
          style={{ color: PREMIUM_BLUE }}
        >
          Open in new tab
        </a>
      </div>
    </div>
  );

  return (
    <CallLayout
      sidebar={<ConversationsSidebar currentTripId={tripId} />}
      chat={<ChatThread tripId={tripId} />}
      snapshot={<TripSnapshotPanel tripId={tripId} />}
      videoCall={videoCallSection}
    />
  );
}