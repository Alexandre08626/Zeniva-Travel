"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ConversationsSidebar from "../../../components/chat/ConversationsSidebar";
import ChatThread from "../../../components/chat/ChatThread";
import TripSnapshotPanel from "../../../components/chat/TripSnapshotPanel";
import { applyTripPatch, ensureSeedTrip, useTripsStore } from "../../../lib/store/tripsStore";
import { TITLE_TEXT, MUTED_TEXT, PREMIUM_BLUE, BRAND_BLUE, LIGHT_BG, ACCENT_GOLD } from "../../../src/design/tokens";
import { sendMessageToLina } from "../../../src/lib/linaClient";

const LINA_URL =
  "https://studio.d-id.com/agents/share?id=v2_agt_IqZ8PnzM&key=WjI5dloyeGxMVzloZFhSb01ud3hNVFUxTXpJeE5EQTRNREl5TmpJMU1qTTJORFk2TkVwSWNVWk9WM0ZGVjNJNFZXSm1abU16VGxaRA==";

function CallLayout({ sidebar, chat, snapshot, videoCall }) {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(max-width: 639px)");
    const sync = () => setIsMobile(media.matches);
    sync();
    media.addEventListener?.("change", sync);
    return () => media.removeEventListener?.("change", sync);
  }, []);

  return (
    <main
      className="min-h-screen"
      style={isMobile
        ? { background: `linear-gradient(160deg, rgba(8,26,74,0.08) 0%, rgba(43,107,255,0.12) 46%, ${LIGHT_BG} 100%)` }
        : { backgroundColor: "#f9fbff" }}
    >
      {isMobile && <div className="absolute -top-12 right-0 h-48 w-48 rounded-full blur-3xl" style={{ backgroundColor: "rgba(43,107,255,0.22)" }} />}
      <div className="w-full px-4 py-4 sm:py-6">
        <header className={`mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between ${isMobile ? "rounded-2xl border border-slate-200 bg-white/92 px-4 py-3 shadow-sm backdrop-blur" : ""}`}>
          <div className="flex items-center gap-3">
            <a href="/" className="text-sm font-semibold" style={{ color: TITLE_TEXT }}>
              ← Back
            </a>
            <div className="rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm" style={isMobile ? { borderColor: "rgba(11,27,77,0.18)", color: PREMIUM_BLUE } : {}}>
              Lina Traveler · Video call
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="/chat"
              className="rounded-full px-4 py-2 text-sm font-semibold border bg-white w-full sm:w-auto text-center"
              style={isMobile ? { color: TITLE_TEXT, borderColor: "rgba(11,27,77,0.18)" } : { color: TITLE_TEXT }}
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
                  className={`rounded-full shadow-sm cursor-pointer ${isMobile ? "ring-2 ring-white" : ""}`}
                />
                <span className={isMobile ? "font-bold" : ""}>Chat with Lina</span>
              </button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:h-[calc(100vh-10.5rem)] lg:overflow-hidden">
          <section className="col-span-12 order-1 space-y-4 min-h-0 lg:overflow-y-auto">
            {videoCall}
            {chat}
          </section>
          <aside className="col-span-12 order-2 space-y-4 min-h-0 lg:overflow-y-auto">
            <section>{sidebar}</section>
            <section>{snapshot}</section>
          </aside>
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
  const [isMobile, setIsMobile] = useState(false);
  const recognitionRef = useRef(null);
  const syncTimerRef = useRef(null);
  const lastSyncedLengthRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(max-width: 639px)");
    const sync = () => setIsMobile(media.matches);
    sync();
    media.addEventListener?.("change", sync);
    return () => media.removeEventListener?.("change", sync);
  }, []);

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
    <div className={`rounded-2xl border border-slate-200 bg-white p-4 ${isMobile ? "shadow-[0_16px_46px_rgba(11,27,77,0.10)]" : "shadow-sm"}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          {isMobile && <div className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: BRAND_BLUE }}>Voice capture</div>}
          <div className="text-sm font-extrabold" style={{ color: TITLE_TEXT }}>Call notes</div>
        </div>
        <button
          onClick={toggleListening}
          className={`rounded-full px-3 py-1 text-xs font-semibold border ${listening ? "text-white" : "bg-white"}`}
          style={isMobile
            ? {
                color: listening ? "#fff" : TITLE_TEXT,
                backgroundColor: listening ? PREMIUM_BLUE : "#fff",
                borderColor: listening ? PREMIUM_BLUE : "#e2e8f0",
              }
            : { color: listening ? "#fff" : TITLE_TEXT, backgroundColor: listening ? "#111827" : "#fff" }}
        >
          {listening ? "Stop" : "Start"} voice notes
        </button>
      </div>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={6}
        placeholder="Paste or dictate the call summary here. Lina will extract the trip details for the snapshot."
        className={`w-full rounded-xl px-3 py-2 text-sm font-semibold outline-none ${isMobile ? "border border-slate-300 focus:border-slate-400" : "border border-slate-200 focus:border-slate-300"}`}
      />

      {error && <div className="mt-2 text-xs text-red-600">{error}</div>}
      {lastSyncedAt && <div className="mt-2 text-xs text-emerald-600">Snapshot updated at {lastSyncedAt}</div>}

      <div className={`mt-3 flex items-center gap-2 ${isMobile ? "flex-wrap" : ""}`}>
        <button
          onClick={syncNotes}
          disabled={syncing || !notes.trim()}
          className={`rounded-full px-4 py-2 text-xs font-semibold ${syncing || !notes.trim() ? "opacity-50 cursor-not-allowed" : ""}`}
          style={{ backgroundColor: isMobile ? PREMIUM_BLUE : "#111827", color: "#fff" }}
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(max-width: 639px)");
    const sync = () => setIsMobile(media.matches);
    sync();
    media.addEventListener?.("change", sync);
    return () => media.removeEventListener?.("change", sync);
  }, []);

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
    <div className={`overflow-hidden border border-slate-200 bg-white ${isMobile ? "rounded-3xl shadow-[0_20px_60px_rgba(11,27,77,0.14)]" : "rounded-2xl shadow-xl"}`}>
      {isMobile && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100" style={{ background: `linear-gradient(110deg, ${PREMIUM_BLUE} 0%, ${BRAND_BLUE} 72%)` }}>
          <div className="text-sm font-bold text-white">Lina Live Call</div>
          <div className="text-[11px] font-semibold" style={{ color: ACCENT_GOLD }}>Premium stream</div>
        </div>
      )}
      <div className="relative" style={{ paddingTop: "56.25%" }}>
        <iframe
          src={LINA_URL}
          title="Appel Lina Voyageur"
          className="absolute inset-0 h-full w-full"
          allow="microphone; camera; autoplay; encrypted-media"
        />
      </div>
      <div className={`px-4 py-3 text-sm text-slate-600 bg-white ${isMobile ? "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between" : "flex items-center justify-between"}`}>
        <span className={isMobile ? "font-semibold" : ""}>🎥 Video call with Lina — same AI as chat</span>
        <a
          href={LINA_URL}
          target="_blank"
          rel="noreferrer"
          className={`font-bold ${isMobile ? "rounded-full border px-3 py-1 text-center" : ""}`}
          style={isMobile ? { color: PREMIUM_BLUE, borderColor: "rgba(11,27,77,0.18)" } : { color: PREMIUM_BLUE }}
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