"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { applyTripPatch, generateProposal, updateSnapshot } from "../../lib/store/tripsStore";

type CallState = "idle" | "connecting" | "speaking" | "listening" | "thinking" | "error";
type Lang = "en-US" | "fr-FR" | "es-ES";

function detectLang(text: string): Lang {
  const t = text.toLowerCase();
  if (/\b(je|vous|bonjour|oui|où|où|voyager|voyage|merci|parfait|dates|budget)\b/.test(t)) return "fr-FR";
  if (/\b(hola|por favor|dónde|sí|quiero|viaje|viajar|gracias|perfecto)\b/.test(t)) return "es-ES";
  return "en-US";
}

function pickVoice(lang: Lang): SpeechSynthesisVoice | null {
  if (typeof window === "undefined") return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const prefix = lang.split("-")[0];
  // Prefer high-quality female voices that sound human-ish
  const preferred = [
    /julie/i, /amelie/i, /aurelie/i, /marie/i, // French
    /zira/i, /samantha/i, /ava/i, /jenny/i, /aria/i, // English
    /monica/i, /paulina/i, /sofia/i, // Spanish
    /google.+(français|french|español|spanish|female)/i,
  ];
  for (const re of preferred) {
    const v = voices.find((v) => v.lang.toLowerCase().startsWith(prefix) && re.test(v.name));
    if (v) return v;
  }
  // Fallback: any voice matching language, prefer non-default
  return (
    voices.find((v) => v.lang.toLowerCase().startsWith(prefix) && !v.default) ||
    voices.find((v) => v.lang.toLowerCase().startsWith(prefix)) ||
    voices[0]
  );
}

function stripPatchBlock(reply: string): { clean: string; patch: Record<string, any> | null } {
  const m = reply.match(/TRIP_PATCH_START([\s\S]*?)TRIP_PATCH_END/);
  if (!m) return { clean: reply, patch: null };
  let patch: Record<string, any> | null = null;
  try {
    const parsed = JSON.parse(m[1].trim());
    if (parsed && typeof parsed === "object") {
      patch = parsed.patch || parsed;
    }
  } catch {
    // ignore — keep clean reply but no patch
  }
  const clean = reply.replace(/TRIP_PATCH_START[\s\S]*?TRIP_PATCH_END/g, "").trim();
  return { clean, patch };
}

export default function LinaVideoCall({ tripId }: { tripId: string }) {
  const [state, setState] = useState<CallState>("idle");
  const [transcript, setTranscript] = useState<{ role: string; text: string }[]>([]);
  const [userText, setUserText] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState("");
  const [micStatus, setMicStatus] = useState<"none" | "denied" | "ok">("none");
  const [snapshot, setSnapshot] = useState<Record<string, any>>({});

  const recognitionRef = useRef<any>(null);
  const historyRef = useRef<{ role: "user" | "assistant"; content: string }[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(false);
  const speakingRef = useRef(false);
  const langRef = useRef<Lang>("en-US");
  const voicesReadyRef = useRef(false);
  const ttsQueueRef = useRef<{ text: string; lang: Lang }[]>([]);
  const ttsRunningRef = useRef(false);

  // Pre-load voices (some browsers load them async)
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const check = () => {
      if (window.speechSynthesis.getVoices().length > 0) voicesReadyRef.current = true;
    };
    check();
    window.speechSynthesis.addEventListener("voiceschanged", check);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", check);
  }, []);

  useEffect(() => {
    if (state !== "idle" && state !== "error" && state !== "connecting") {
      timerRef.current = setInterval(() => setElapsed((p) => p + 1), 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [state]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [transcript, userText]);

  const speakOne = useCallback((text: string, lang: Lang): Promise<void> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined" || !window.speechSynthesis) return resolve();
      const u = new SpeechSynthesisUtterance(text);
      const voice = pickVoice(lang);
      if (voice) u.voice = voice;
      u.lang = lang;
      u.rate = 1.02;
      u.pitch = 1.08;
      u.volume = 1;
      u.onend = () => resolve();
      u.onerror = () => resolve();
      window.speechSynthesis.speak(u);
    });
  }, []);

  const runTtsQueue = useCallback(async () => {
    if (ttsRunningRef.current) return;
    ttsRunningRef.current = true;
    speakingRef.current = true;
    setState("speaking");
    try {
      recognitionRef.current?.stop();
    } catch {}

    while (ttsQueueRef.current.length > 0) {
      const next = ttsQueueRef.current.shift();
      if (!next) break;
      await speakOne(next.text, next.lang);
    }

    ttsRunningRef.current = false;
    speakingRef.current = false;
    if (activeRef.current) {
      try {
        recognitionRef.current?.start();
      } catch {}
      setState("listening");
    }
  }, [speakOne]);

  const enqueueSpeech = useCallback(
    (text: string, lang: Lang) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      ttsQueueRef.current.push({ text: trimmed, lang });
      runTtsQueue();
    },
    [runTtsQueue]
  );

  const speakAndWait = useCallback(
    (text: string, lang: Lang): Promise<void> => {
      return new Promise((resolve) => {
        enqueueSpeech(text, lang);
        const check = setInterval(() => {
          if (!ttsRunningRef.current && ttsQueueRef.current.length === 0) {
            clearInterval(check);
            resolve();
          }
        }, 80);
      });
    },
    [enqueueSpeech]
  );

  const applyPatchToTrip = useCallback(
    (args: Record<string, any>) => {
      setSnapshot((prev) => ({ ...prev, ...args }));
      applyTripPatch(tripId, args);
      const snapPatch: Record<string, string> = {};
      if (args.departureCity) snapPatch.departure = args.departureCity;
      if (args.destination) snapPatch.destination = args.destination;
      if (args.checkIn && args.checkOut) snapPatch.dates = `${args.checkIn} → ${args.checkOut}`;
      else if (args.checkIn) snapPatch.dates = args.checkIn;
      if (args.adults)
        snapPatch.travelers = `${args.adults} adult${args.adults > 1 ? "s" : ""}${args.children ? `, ${args.children} child${args.children > 1 ? "ren" : ""}` : ""}`;
      if (args.budget) snapPatch.budget = `${args.currency || "USD"} ${args.budget}`;
      if (args.style) snapPatch.style = args.style;
      if (args.accommodationType) snapPatch.accommodationType = args.accommodationType;
      if (args.transportationType) snapPatch.transportationType = args.transportationType;
      if (Object.keys(snapPatch).length > 0) updateSnapshot(tripId, snapPatch);

      // Persist on server
      fetch(`/api/proposals?ownerEmail=voice-call@zenivatravel.com`)
        .then((r) => r.json())
        .then((d) => {
          const existing = (d?.data || []).find((p: any) => p.id === tripId);
          const prevDraft = existing?.payload?.tripDraft || {};
          const prevSnap = existing?.payload?.snapshot || {};
          return fetch("/api/proposals", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: tripId,
              ownerEmail: "voice-call@zenivatravel.com",
              status: "Draft",
              payload: {
                tripDraft: { ...prevDraft, ...args },
                snapshot: { ...prevSnap, ...snapPatch },
              },
            }),
          });
        })
        .catch(() => {});
    },
    [tripId]
  );

  const askLina = useCallback(
    async (userInput: string) => {
      historyRef.current.push({ role: "user", content: userInput });
      setTranscript((p) => [...p, { role: "user", text: userInput }]);
      setState("thinking");

      // Lock the TTS language based on the user's input. If they spoke French,
      // Lina replies in French. English → English. This is what makes the call
      // feel natural — we switch sides on first user turn.
      const userLang = detectLang(userInput);
      langRef.current = userLang;
      if (recognitionRef.current) recognitionRef.current.lang = userLang;

      try {
        const resp = await fetch("/api/lina-stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: userInput,
            history: historyRef.current.slice(-20),
          }),
        });
        if (!resp.ok || !resp.body) {
          const text = await resp.text();
          throw new Error(text || "Stream failed");
        }

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let sseBuffer = "";      // leftover bytes from incomplete SSE lines
        let fullReply = "";       // everything Lina has generated (for history)
        let speakBuffer = "";     // text not yet handed to TTS
        let inPatch = false;      // inside TRIP_PATCH_START…TRIP_PATCH_END
        let patchText = "";
        const replyLang: Lang = userLang;

        // Regex that matches a complete sentence at the start of speakBuffer
        const sentenceRe = /^([\s\S]*?[.!?…])(\s+|$)/;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          sseBuffer += decoder.decode(value, { stream: true });

          // Process complete SSE lines
          let eol: number;
          while ((eol = sseBuffer.indexOf("\n")) >= 0) {
            const rawLine = sseBuffer.slice(0, eol);
            sseBuffer = sseBuffer.slice(eol + 1);
            const line = rawLine.trim();
            if (!line || !line.startsWith("data:")) continue;
            const data = line.slice(line.indexOf(":") + 1).trim();
            if (data === "[DONE]") continue;
            let json: any;
            try {
              json = JSON.parse(data);
            } catch {
              continue;
            }
            const token = json?.choices?.[0]?.delta?.content;
            if (!token) continue;
            fullReply += token;

            if (inPatch) {
              patchText += token;
              const endIdx = patchText.indexOf("TRIP_PATCH_END");
              if (endIdx >= 0) {
                const jsonPart = patchText.slice(0, endIdx).trim();
                try {
                  const parsed = JSON.parse(jsonPart);
                  const patch = parsed?.patch || parsed;
                  if (patch && typeof patch === "object") applyPatchToTrip(patch);
                } catch {}
                inPatch = false;
                patchText = "";
              }
              continue;
            }

            speakBuffer += token;
            // Watch for the patch block opening and clip it off the spoken text
            const patchStart = speakBuffer.indexOf("TRIP_PATCH_START");
            if (patchStart >= 0) {
              const before = speakBuffer.slice(0, patchStart);
              speakBuffer = before;
              inPatch = true;
              patchText = "";
            }

            // Stream full sentences to TTS as soon as they land
            while (true) {
              const m = speakBuffer.match(sentenceRe);
              if (!m) break;
              const sentence = m[1].trim();
              speakBuffer = speakBuffer.slice(m[0].length);
              if (sentence) enqueueSpeech(sentence, replyLang);
            }
          }
        }

        // Flush any trailing partial sentence
        if (speakBuffer.trim()) enqueueSpeech(speakBuffer.trim(), replyLang);

        const { clean } = stripPatchBlock(fullReply);
        historyRef.current.push({ role: "assistant", content: clean });
        setTranscript((p) => [...p, { role: "lina", text: clean }]);

        const ready =
          /generate proposal|proposal.*ready|génère votre|votre proposition|personnalisée|appuyez sur le bouton|cliquez sur le bouton|click the gold|botón dorado|votre proposition est pr/i.test(
            clean
          );
        if (ready) {
          setTimeout(() => {
            generateProposal(tripId);
            window.location.href = `/proposals/${tripId}/select`;
          }, 2500);
        }
      } catch (e: any) {
        console.error("askLina stream error", e);
        setError("Connection error. Check your internet and try again.");
        setState("error");
      }
    },
    [tripId, enqueueSpeech, applyPatchToTrip]
  );

  const startCall = useCallback(async () => {
    setState("connecting");
    setError("");
    setTranscript([]);
    setElapsed(0);
    setSnapshot({});
    historyRef.current = [];

    // Mic permission (SpeechRecognition will ask again but prompting upfront
    // gives a clearer UX and pre-warms the permission grant on some browsers)
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      s.getTracks().forEach((t) => t.stop());
      setMicStatus("ok");
    } catch {
      setMicStatus("denied");
      setError("Microphone access denied. Allow mic in your browser and try again.");
      setState("error");
      return;
    }

    // Speech recognition support check
    const SR: any =
      (typeof window !== "undefined" && (window as any).SpeechRecognition) ||
      (typeof window !== "undefined" && (window as any).webkitSpeechRecognition);
    if (!SR) {
      setError(
        "Your browser doesn't support voice. Please use Chrome, Edge, or Safari (recent version)."
      );
      setState("error");
      return;
    }

    const recog = new SR();
    recognitionRef.current = recog;
    recog.continuous = true;
    recog.interimResults = true;
    recog.lang = "en-US";

    let interim = "";
    recog.onresult = (e: any) => {
      if (speakingRef.current) return;
      interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) {
          const txt = String(res[0].transcript || "").trim();
          if (txt.length >= 2) askLina(txt);
        } else {
          interim += res[0].transcript;
        }
      }
      setUserText(interim);
    };

    recog.onerror = (e: any) => {
      if (e?.error === "no-speech" || e?.error === "aborted") return;
      console.warn("SpeechRecognition error:", e?.error);
    };

    recog.onend = () => {
      setUserText("");
      if (activeRef.current && !speakingRef.current) {
        try {
          recog.start();
        } catch {}
      }
    };

    activeRef.current = true;
    try {
      recog.start();
    } catch {}

    // Greet in English — Lina will switch to the user's language on their
    // first reply (see language lock in askLina).
    const greeting = "Hi! I'm Lina from Zeniva. Where would you like to go?";
    setTranscript([{ role: "lina", text: greeting }]);
    historyRef.current = [{ role: "assistant", content: greeting }];
    setState("listening");
    await speakAndWait(greeting, "en-US");
  }, [speakAndWait, askLina]);

  const endCall = useCallback(() => {
    activeRef.current = false;
    speakingRef.current = false;
    ttsRunningRef.current = false;
    ttsQueueRef.current = [];
    try {
      recognitionRef.current?.stop();
    } catch {}
    recognitionRef.current = null;
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setMicStatus("none");
    setState("idle");
  }, []);

  useEffect(() => {
    return () => {
      activeRef.current = false;
      try {
        recognitionRef.current?.stop();
      } catch {}
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const active = !["idle", "error", "connecting"].includes(state);
  const speaking = state === "speaking";
  const listening = state === "listening";
  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div
      className="relative w-full overflow-hidden rounded-3xl"
      style={{
        background: "linear-gradient(135deg, #081A4A 0%, #0F3A8A 40%, #2B6BFF 100%)",
        minHeight: "80vh",
      }}
    >
      <style>{`
        @keyframes breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.004)}}
        @keyframes glow{0%,100%{filter:drop-shadow(0 10px 25px rgba(43,107,255,.2))}50%{filter:drop-shadow(0 14px 35px rgba(43,107,255,.3))}}
        @keyframes gp{0%,100%{box-shadow:0 0 30px rgba(99,102,241,.2)}50%{box-shadow:0 0 50px rgba(99,102,241,.4)}}
        .lina-alive{animation:breathe 5s ease-in-out infinite,glow 5s ease-in-out infinite;transform-origin:center bottom}
      `}</style>

      <div className="relative z-10 flex flex-col items-center justify-center px-6 py-8" style={{ minHeight: "80vh" }}>
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-2.5 w-2.5 rounded-full ${active ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
            <span className="text-white/70 text-sm font-medium">
              {state === "idle"
                ? "Ready"
                : state === "connecting"
                ? "Connecting..."
                : state === "error"
                ? "Error"
                : fmt(elapsed)}
            </span>
          </div>
          {active && (
            <button
              onClick={endCall}
              className="bg-red-500/90 hover:bg-red-400 text-white px-5 py-2 rounded-full text-sm font-bold transition-all"
            >
              End Call
            </button>
          )}
        </div>

        <div className="relative mb-6">
          {speaking && <div className="absolute inset-0 rounded-full" style={{ margin: "-18px", animation: "gp 2s ease-in-out infinite" }} />}
          <div
            className="lina-alive relative overflow-hidden rounded-full shadow-2xl"
            style={{
              width: "clamp(230px,28vw,320px)",
              height: "clamp(230px,28vw,320px)",
              border: `3px solid ${speaking ? "rgba(99,102,241,.45)" : listening ? "rgba(52,211,153,.3)" : "rgba(255,255,255,.1)"}`,
              transition: "border-color .5s",
            }}
          >
            <img
              src="/branding/lina-hero.png"
              alt="Lina AI"
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 15%" }}
            />
          </div>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur rounded-full px-4 py-1 border border-white/15">
            <span className="text-white font-bold text-xs">Lina AI</span>
          </div>
        </div>

        <div className="min-h-[20px] mb-4 text-center">
          {listening && (
            <p className="text-emerald-300/70 text-xs font-medium flex items-center justify-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Listening...
            </p>
          )}
          {speaking && (
            <p className="text-indigo-300/70 text-xs font-medium flex items-center justify-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Speaking...
            </p>
          )}
          {state === "thinking" && (
            <p className="text-amber-300/70 text-xs font-medium flex items-center justify-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              Processing...
            </p>
          )}
          {active && micStatus === "denied" && (
            <p className="text-red-300/80 text-xs font-medium mt-1">🔇 Microphone blocked — allow mic access in your browser and reload</p>
          )}
        </div>

        {active && (
          <div
            ref={scrollRef}
            className="w-full max-w-xl bg-black/20 backdrop-blur rounded-2xl border border-white/8 p-4 max-h-40 overflow-y-auto"
          >
            {transcript.length === 0 && !userText && (
              <p className="text-white/25 text-sm text-center">Conversation will appear here...</p>
            )}
            {transcript.map((t, i) => (
              <div key={i} className={`mb-2 ${t.role === "user" ? "text-right" : ""}`}>
                <span
                  className={`inline-block px-3 py-1.5 rounded-2xl text-sm max-w-[80%] ${
                    t.role === "user"
                      ? "bg-white/10 text-white/80 rounded-br-sm"
                      : "bg-indigo-500/20 text-white/85 rounded-bl-sm"
                  }`}
                >
                  {t.role === "lina" && <span className="text-indigo-300 font-bold mr-1">Lina:</span>}
                  {t.text}
                </span>
              </div>
            ))}
            {userText && (
              <div className="mb-2 text-right">
                <span className="inline-block px-3 py-1.5 rounded-2xl rounded-br-sm text-sm bg-white/10 text-white/50">
                  {userText}
                </span>
              </div>
            )}
          </div>
        )}

        {active && Object.keys(snapshot).length > 0 && (
          <div className="w-full max-w-xl mt-3 bg-white/6 backdrop-blur rounded-2xl border border-white/8 p-4">
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">📋 Trip Snapshot</div>
            <div className="grid grid-cols-2 gap-1.5">
              {snapshot.destination && (
                <p className="text-xs">
                  <span className="text-white/35">Destination:</span>{" "}
                  <span className="text-white/80 font-medium">{snapshot.destination}</span>
                </p>
              )}
              {snapshot.departureCity && (
                <p className="text-xs">
                  <span className="text-white/35">From:</span>{" "}
                  <span className="text-white/80 font-medium">{snapshot.departureCity}</span>
                </p>
              )}
              {snapshot.checkIn && (
                <p className="text-xs">
                  <span className="text-white/35">In:</span>{" "}
                  <span className="text-white/80 font-medium">{snapshot.checkIn}</span>
                </p>
              )}
              {snapshot.checkOut && (
                <p className="text-xs">
                  <span className="text-white/35">Out:</span>{" "}
                  <span className="text-white/80 font-medium">{snapshot.checkOut}</span>
                </p>
              )}
              {snapshot.adults && (
                <p className="text-xs">
                  <span className="text-white/35">Adults:</span>{" "}
                  <span className="text-white/80 font-medium">{snapshot.adults}</span>
                </p>
              )}
              {snapshot.children && (
                <p className="text-xs">
                  <span className="text-white/35">Children:</span>{" "}
                  <span className="text-white/80 font-medium">{snapshot.children}</span>
                </p>
              )}
              {snapshot.budget && (
                <p className="text-xs">
                  <span className="text-white/35">Budget:</span>{" "}
                  <span className="text-white/80 font-medium">
                    {snapshot.currency || "USD"} {snapshot.budget}
                  </span>
                </p>
              )}
              {snapshot.style && (
                <p className="text-xs">
                  <span className="text-white/35">Style:</span>{" "}
                  <span className="text-white/80 font-medium">{snapshot.style}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {state === "idle" && (
          <button
            onClick={startCall}
            className="mt-8 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-400 hover:to-blue-400 text-white px-10 py-4 rounded-full text-lg font-bold shadow-2xl shadow-indigo-500/25 transition-all duration-300 hover:scale-105"
          >
            <span className="flex items-center gap-3">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              Start Video Call with Lina
            </span>
          </button>
        )}

        {state === "connecting" && <div className="mt-8 text-white/50 text-sm font-medium animate-pulse">Connecting to Lina...</div>}

        {state === "error" && (
          <div className="mt-6 text-center">
            <p className="text-red-300/80 text-sm mb-4">{error}</p>
            <button
              onClick={startCall}
              className="bg-white/10 text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-white/15 transition-all"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
