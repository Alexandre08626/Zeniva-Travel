"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ConversationsSidebar from "../../../components/chat/ConversationsSidebar";
import ChatThread from "../../../components/chat/ChatThread";
import TripSnapshotPanel from "../../../components/chat/TripSnapshotPanel";
import { applyTripPatch, ensureSeedTrip, useTripsStore } from "../../../lib/store/tripsStore";
import { TITLE_TEXT, MUTED_TEXT, PREMIUM_BLUE } from "../../../src/design/tokens";
import { sendMessageToLina } from "../../../src/lib/linaClient";

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

function CallNotesPanel({ tripId }) {
  const [notes, setNotes] = useState("");
  const [listening, setListening] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [error, setError] = useState("");
  const [lastSyncedAt, setLastSyncedAt] = useState("");
  const recognitionRef = useRef(null);
  const syncTimerRef = useRef(null);
  const lastSyncedLengthRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech recognition not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let finalText = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        }
      }
      if (finalText.trim()) {
        setNotes((prev) => (prev ? `${prev}\n${finalText.trim()}` : finalText.trim()));
      }
    };

    recognition.onerror = (event) => {
      setError(event?.error ? `Speech recognition error: ${event.error}` : "Speech recognition error.");
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    return () => {
      try {
        recognition.stop();
      } catch (_) {}
    };
  }, []);

  const toggleListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      setError("Speech recognition not available.");
      return;
    }
    setError("");
    if (listening) {
      try {
        recognition.stop();
      } catch (_) {}
      setListening(false);
    } else {
      try {
        recognition.start();
        setListening(true);
      } catch (_) {
        setError("Unable to start speech recognition.");
      }
    }
  };

  const syncNotes = async () => {
    const trimmed = notes.trim();
    if (!trimmed || !tripId) return;
    setSyncing(true);
    setError("");
    try {
      const { tripPatch } = await sendMessageToLina(trimmed);
      if (tripPatch?.patch) {
        applyTripPatch(tripId, tripPatch.patch);
        setLastSyncedAt(new Date().toLocaleTimeString());
        lastSyncedLengthRef.current = trimmed.length;
      } else {
        setError("No snapshot data extracted from notes.");
      }
    } catch (_) {
      setError("Failed to sync notes.");
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    if (!autoSync) return;
    if (!notes.trim() || syncing) return;
    if (notes.trim().length <= lastSyncedLengthRef.current) return;
    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current);
    }
    syncTimerRef.current = setTimeout(() => {
      syncNotes();
    }, 1200);
    return () => {
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
      }
    };
  }, [notes, autoSync, syncing]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-extrabold" style={{ color: TITLE_TEXT }}>Call notes</div>
        <button
          onClick={toggleListening}
          className={`rounded-full px-3 py-1 text-xs font-semibold border ${listening ? "bg-black text-white" : "bg-white"}`}
          style={{ color: listening ? "#fff" : TITLE_TEXT }}
        >
          {listening ? "Stop" : "Start"} voice notes
        </button>
      </div>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={6}
        placeholder="Paste or dictate the call summary here. Lina will extract the trip details for the snapshot."
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold outline-none focus:border-slate-300"
      />

      {error && <div className="mt-2 text-xs text-red-600">{error}</div>}
      {lastSyncedAt && <div className="mt-2 text-xs text-emerald-600">Snapshot updated at {lastSyncedAt}</div>}

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={syncNotes}
          disabled={syncing || !notes.trim()}
          className={`rounded-full px-4 py-2 text-xs font-semibold ${syncing || !notes.trim() ? "opacity-50 cursor-not-allowed" : ""}`}
          style={{ backgroundColor: "#111827", color: "#fff" }}
        >
          {syncing ? "Syncing..." : "Sync to snapshot"}
        </button>
        <label className="flex items-center gap-2 text-xs font-semibold" style={{ color: TITLE_TEXT }}>
          <input
            type="checkbox"
            checked={autoSync}
            onChange={(e) => setAutoSync(e.target.checked)}
            className="h-4 w-4"
          />
          Auto-sync
        </label>
        <button
          onClick={() => setNotes("")}
          className="rounded-full px-4 py-2 text-xs font-semibold border border-slate-200"
          style={{ color: TITLE_TEXT }}
        >
          Clear
        </button>
      </div>
    </div>
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
      chat={(
        <div className="space-y-4">
          <CallNotesPanel tripId={tripId} />
          <ChatThread tripId={tripId} />
        </div>
      )}
      snapshot={<TripSnapshotPanel tripId={tripId} />}
      videoCall={videoCallSection}
    />
  );
}