"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { applyTripPatch, generateProposal, updateSnapshot } from "../../lib/store/tripsStore";

type CallState = "idle" | "connecting" | "speaking" | "listening" | "thinking" | "error";
type Lang = "en-US" | "fr-FR" | "es-ES";

function detectLang(text: string): Lang {
  const t = text.toLowerCase();
  if (/\b(je|vous|bonjour|oui|où|voyager|voyage|merci|parfait|dates|budget|je veux|il y a|avec|pour)\b/.test(t))
    return "fr-FR";
  if (/\b(hola|por favor|dónde|sí|quiero|viaje|viajar|gracias|perfecto|con|para)\b/.test(t))
    return "es-ES";
  return "en-US";
}

function langToGoogle(lang: Lang): string {
  // User preference: French text should be read by the English TTS voice,
  // i.e. French with an American accent. Keeps the voice consistent across
  // turns (Google Translate fr TTS sometimes flip-flops between fr-FR and
  // fr-CA, which sounded "mixed" to the user).
  if (lang === "fr-FR") return "en";
  if (lang === "es-ES") return "es";
  return "en";
}

function langToWhisper(lang: Lang): string {
  if (lang === "fr-FR") return "fr";
  if (lang === "es-ES") return "es";
  return "en";
}

function chunkForTts(text: string, maxLen = 190): string[] {
  const out: string[] = [];
  let remaining = text.trim();
  while (remaining.length > maxLen) {
    let cut = remaining.lastIndexOf(",", maxLen);
    if (cut < 50) cut = remaining.lastIndexOf(";", maxLen);
    if (cut < 50) cut = remaining.lastIndexOf(" ", maxLen);
    if (cut < 50) cut = maxLen;
    out.push(remaining.slice(0, cut + 1).trim());
    remaining = remaining.slice(cut + 1).trim();
  }
  if (remaining) out.push(remaining);
  return out;
}

function stripPatchBlock(reply: string): { clean: string; patch: Record<string, any> | null } {
  const m = reply.match(/TRIP_PATCH_START([\s\S]*?)TRIP_PATCH_END/);
  if (!m) return { clean: reply, patch: null };
  let patch: Record<string, any> | null = null;
  try {
    const parsed = JSON.parse(m[1].trim());
    if (parsed && typeof parsed === "object") patch = parsed.patch || parsed;
  } catch {}
  const clean = reply.replace(/TRIP_PATCH_START[\s\S]*?TRIP_PATCH_END/g, "").trim();
  return { clean, patch };
}

// VAD tuning — may need per-environment tweaks
const VAD_SPEECH_THRESHOLD = 12;   // byte-delta from 128 (0-127)
const VAD_SILENCE_MS = 900;        // ms of silence after speech → end of turn
const VAD_MIN_AUDIO_BYTES = 6000;  // skip sends smaller than this (likely noise)
const VAD_MAX_TURN_MS = 15000;     // hard stop after 15s without silence

export default function LinaVideoCall({ tripId }: { tripId: string }) {
  const [state, setState] = useState<CallState>("idle");
  const [transcript, setTranscript] = useState<{ role: string; text: string }[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState("");
  const [micStatus, setMicStatus] = useState<"none" | "denied" | "ok">("none");
  const [snapshot, setSnapshot] = useState<Record<string, any>>({});

  // Call lifecycle
  const activeRef = useRef(false);
  const speakingRef = useRef(false);
  const langRef = useRef<Lang>("en-US");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<{ role: "user" | "assistant"; content: string }[]>([]);

  // Audio I/O
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const rafRef = useRef<number | null>(null);
  const speechStartedRef = useRef(false);
  const lastAboveRef = useRef(0);
  const recStartedAtRef = useRef(0);

  // TTS queue
  const ttsQueueRef = useRef<{ text: string; lang: Lang }[]>([]);
  const ttsRunningRef = useRef(false);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

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
  }, [transcript]);

  // ——— TTS ——————————————————————————————————————————————

  const speakOne = useCallback((text: string, lang: Lang): Promise<void> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") return resolve();
      const chunks = chunkForTts(text);
      if (!chunks.length) return resolve();
      const gLang = langToGoogle(lang);
      let idx = 0;

      const playNext = () => {
        if (idx >= chunks.length || !activeRef.current) {
          currentAudioRef.current = null;
          return resolve();
        }
        const chunk = chunks[idx++];
        const src = `/api/tts?lang=${encodeURIComponent(gLang)}&text=${encodeURIComponent(chunk)}`;
        const audio = new Audio(src);
        audio.preload = "auto";
        currentAudioRef.current = audio;
        audio.onended = () => playNext();
        audio.onerror = () => {
          console.warn("TTS audio failed for", chunk.slice(0, 40));
          playNext();
        };
        audio.play().catch(() => {
          console.warn("audio.play() rejected");
          playNext();
        });
      };
      playNext();
    });
  }, []);

  const runTtsQueue = useCallback(async () => {
    if (ttsRunningRef.current) return;
    ttsRunningRef.current = true;
    speakingRef.current = true;
    setState("speaking");

    while (ttsQueueRef.current.length > 0 && activeRef.current) {
      const next = ttsQueueRef.current.shift();
      if (!next) break;
      await speakOne(next.text, next.lang);
    }

    ttsRunningRef.current = false;
    speakingRef.current = false;
    // Resume VAD after Lina is done
    if (activeRef.current) {
      speechStartedRef.current = false;
      lastAboveRef.current = 0;
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

  // ——— Snapshot patch ————————————————————————————————————

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
        snapPatch.travelers = `${args.adults} adult${args.adults > 1 ? "s" : ""}${
          args.children ? `, ${args.children} child${args.children > 1 ? "ren" : ""}` : ""
        }`;
      if (args.budget) snapPatch.budget = `${args.currency || "USD"} ${args.budget}`;
      if (args.style) snapPatch.style = args.style;
      if (args.accommodationType) snapPatch.accommodationType = args.accommodationType;
      if (args.transportationType) snapPatch.transportationType = args.transportationType;
      if (Object.keys(snapPatch).length > 0) updateSnapshot(tripId, snapPatch);

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
              payload: { tripDraft: { ...prevDraft, ...args }, snapshot: { ...prevSnap, ...snapPatch } },
            }),
          });
        })
        .catch(() => {});
    },
    [tripId]
  );

  // ——— Ask Lina (streaming) ——————————————————————————————

  const askLina = useCallback(
    async (userInput: string) => {
      historyRef.current.push({ role: "user", content: userInput });
      setTranscript((p) => [...p, { role: "user", text: userInput }]);
      setState("thinking");

      const userLang = detectLang(userInput);
      langRef.current = userLang;

      try {
        const resp = await fetch("/api/lina-stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: userInput, history: historyRef.current.slice(-20) }),
        });
        if (!resp.ok || !resp.body) throw new Error(await resp.text().catch(() => "stream failed"));

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let sseBuffer = "";
        let fullReply = "";
        let speakBuffer = "";
        let inPatch = false;
        let patchText = "";
        const replyLang: Lang = userLang;
        const sentenceRe = /^([\s\S]*?[.!?…])(\s+|$)/;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          sseBuffer += decoder.decode(value, { stream: true });
          let eol: number;
          while ((eol = sseBuffer.indexOf("\n")) >= 0) {
            const rawLine = sseBuffer.slice(0, eol);
            sseBuffer = sseBuffer.slice(eol + 1);
            const line = rawLine.trim();
            if (!line || !line.startsWith("data:")) continue;
            const data = line.slice(line.indexOf(":") + 1).trim();
            if (data === "[DONE]") continue;
            let json: any;
            try { json = JSON.parse(data); } catch { continue; }
            const token = json?.choices?.[0]?.delta?.content;
            if (!token) continue;
            fullReply += token;

            if (inPatch) {
              patchText += token;
              const endIdx = patchText.indexOf("TRIP_PATCH_END");
              if (endIdx >= 0) {
                try {
                  const parsed = JSON.parse(patchText.slice(0, endIdx).trim());
                  const patch = parsed?.patch || parsed;
                  if (patch && typeof patch === "object") applyPatchToTrip(patch);
                } catch {}
                inPatch = false;
                patchText = "";
              }
              continue;
            }

            speakBuffer += token;
            const patchStart = speakBuffer.indexOf("TRIP_PATCH_START");
            if (patchStart >= 0) {
              speakBuffer = speakBuffer.slice(0, patchStart);
              inPatch = true;
              patchText = "";
            }
            while (true) {
              const m = speakBuffer.match(sentenceRe);
              if (!m) break;
              const sentence = m[1].trim();
              speakBuffer = speakBuffer.slice(m[0].length);
              if (sentence) enqueueSpeech(sentence, replyLang);
            }
          }
        }
        if (speakBuffer.trim()) enqueueSpeech(speakBuffer.trim(), replyLang);

        const { clean } = stripPatchBlock(fullReply);
        historyRef.current.push({ role: "assistant", content: clean });
        setTranscript((p) => [...p, { role: "lina", text: clean }]);

        const ready =
          /generate proposal|proposal.*ready|génère votre|votre proposition|personnalisée|appuyez sur le bouton|cliquez sur le bouton|click the gold|botón dorado|votre proposition est pr/i.test(clean);
        if (ready) {
          setTimeout(() => {
            generateProposal(tripId);
            window.location.href = `/proposals/${tripId}/select`;
          }, 2500);
        }
      } catch (e: any) {
        console.error("askLina error", e);
        setError("Connection error. Please try again.");
        setState("error");
      }
    },
    [tripId, enqueueSpeech, applyPatchToTrip]
  );

  // ——— STT (Groq Whisper) ——————————————————————————————

  const transcribeBlob = useCallback(
    async (blob: Blob) => {
      if (blob.size < VAD_MIN_AUDIO_BYTES) {
        // too short — likely noise, go back to listening
        if (activeRef.current && !speakingRef.current) {
          speechStartedRef.current = false;
          lastAboveRef.current = 0;
          setState("listening");
        }
        return;
      }
      setState("thinking");
      const form = new FormData();
      form.append("file", blob, "audio.webm");
      // Hint Whisper with the locked language if we have one
      if (langRef.current === "fr-FR") form.append("language", "fr");
      else if (langRef.current === "es-ES") form.append("language", "es");
      // Don't hint for English — let Whisper auto-detect on first turn

      try {
        const resp = await fetch("/api/stt", { method: "POST", body: form });
        const data = await resp.json();
        const text = String(data?.text || "").trim();
        if (text.length >= 2) {
          await askLina(text);
        } else {
          if (activeRef.current && !speakingRef.current) setState("listening");
        }
      } catch (e) {
        console.error("STT error", e);
        if (activeRef.current && !speakingRef.current) setState("listening");
      }
    },
    [askLina]
  );

  // ——— VAD loop ———————————————————————————————————————————

  const stopRecording = useCallback((sendToStt: boolean) => {
    const rec = recorderRef.current;
    if (!rec) return;
    if (rec.state !== "recording") return;
    // Mark the next onstop handler
    (rec as any).__send = sendToStt;
    try {
      rec.stop();
    } catch {}
  }, []);

  const startRecording = useCallback(() => {
    const rec = recorderRef.current;
    if (!rec) return;
    if (rec.state === "recording") return;
    chunksRef.current = [];
    try {
      rec.start(250);
      recStartedAtRef.current = Date.now();
    } catch (e) {
      console.warn("recorder.start failed", e);
    }
  }, []);

  const vadTick = useCallback(() => {
    if (!activeRef.current) return;
    const analyser = analyserRef.current;
    if (!analyser) {
      rafRef.current = requestAnimationFrame(vadTick);
      return;
    }

    // Don't VAD while Lina speaks — we'd record her own voice bleed
    if (speakingRef.current) {
      if (recorderRef.current?.state === "recording") stopRecording(false);
      speechStartedRef.current = false;
      rafRef.current = requestAnimationFrame(vadTick);
      return;
    }

    const data = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(data);
    let peak = 0;
    for (let i = 0; i < data.length; i++) {
      const d = Math.abs(data[i] - 128);
      if (d > peak) peak = d;
    }
    const now = Date.now();

    if (peak > VAD_SPEECH_THRESHOLD) {
      if (!speechStartedRef.current) {
        speechStartedRef.current = true;
        startRecording();
      }
      lastAboveRef.current = now;
    } else if (speechStartedRef.current) {
      const silent = now - lastAboveRef.current;
      const turnTooLong = now - recStartedAtRef.current > VAD_MAX_TURN_MS;
      if (silent > VAD_SILENCE_MS || turnTooLong) {
        speechStartedRef.current = false;
        stopRecording(true);
      }
    }

    rafRef.current = requestAnimationFrame(vadTick);
  }, [startRecording, stopRecording]);

  // ——— Start / end call ——————————————————————————————————

  const startCall = useCallback(async () => {
    setState("connecting");
    setError("");
    setTranscript([]);
    setElapsed(0);
    setSnapshot({});
    historyRef.current = [];

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;
      setMicStatus("ok");
    } catch {
      setMicStatus("denied");
      setError("Microphone access denied. Allow mic in your browser and try again.");
      setState("error");
      return;
    }

    if (typeof MediaRecorder === "undefined") {
      setError("Your browser doesn't support audio recording. Try Chrome, Edge, or Safari.");
      setState("error");
      return;
    }

    // Pick a supported mime type for broad compatibility
    const mime = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"].find(
      (m) => MediaRecorder.isTypeSupported(m)
    );
    const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
    recorderRef.current = rec;
    rec.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };
    rec.onstop = () => {
      const sendToStt = (rec as any).__send !== false;
      const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
      chunksRef.current = [];
      if (sendToStt) transcribeBlob(blob);
    };

    // Web Audio → AnalyserNode for VAD
    const Ctx: typeof AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
    const ctx = new Ctx();
    audioCtxRef.current = ctx;
    if (ctx.state === "suspended") {
      try {
        await ctx.resume();
      } catch {}
    }
    const src = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.3;
    src.connect(analyser);
    analyserRef.current = analyser;

    activeRef.current = true;
    speechStartedRef.current = false;
    lastAboveRef.current = 0;
    rafRef.current = requestAnimationFrame(vadTick);

    // Lina greets in English — will auto-switch on user's first reply
    const greeting = "Hi! I'm Lina from Zeniva. Where would you like to go?";
    setTranscript([{ role: "lina", text: greeting }]);
    historyRef.current = [{ role: "assistant", content: greeting }];
    setState("listening");
    await speakAndWait(greeting, "en-US");
  }, [speakAndWait, transcribeBlob, vadTick]);

  const endCall = useCallback(() => {
    activeRef.current = false;
    speakingRef.current = false;
    speechStartedRef.current = false;
    ttsRunningRef.current = false;
    ttsQueueRef.current = [];

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;

    if (recorderRef.current) {
      try {
        if (recorderRef.current.state === "recording") recorderRef.current.stop();
      } catch {}
      recorderRef.current = null;
    }
    chunksRef.current = [];

    if (analyserRef.current) {
      try {
        analyserRef.current.disconnect();
      } catch {}
      analyserRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.src = "";
      } catch {}
      currentAudioRef.current = null;
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setMicStatus("none");
    setState("idle");
  }, []);

  useEffect(() => () => endCall(), [endCall]);

  const active = !["idle", "error", "connecting"].includes(state);
  const speaking = state === "speaking";
  const listening = state === "listening";
  const thinking = state === "thinking";
  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

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
          {thinking && (
            <p className="text-amber-300/70 text-xs font-medium flex items-center justify-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              Transcribing...
            </p>
          )}
          {active && micStatus === "denied" && (
            <p className="text-red-300/80 text-xs font-medium mt-1">
              🔇 Microphone blocked — allow mic access in your browser and reload
            </p>
          )}
        </div>

        {active && (
          <div ref={scrollRef} className="w-full max-w-xl bg-black/20 backdrop-blur rounded-2xl border border-white/8 p-4 max-h-40 overflow-y-auto">
            {transcript.length === 0 && <p className="text-white/25 text-sm text-center">Conversation will appear here...</p>}
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
          </div>
        )}

        {active && Object.keys(snapshot).length > 0 && (
          <div className="w-full max-w-xl mt-3 bg-white/6 backdrop-blur rounded-2xl border border-white/8 p-4">
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">📋 Trip Snapshot</div>
            <div className="grid grid-cols-2 gap-1.5">
              {snapshot.destination && (
                <p className="text-xs"><span className="text-white/35">Destination:</span> <span className="text-white/80 font-medium">{snapshot.destination}</span></p>
              )}
              {snapshot.departureCity && (
                <p className="text-xs"><span className="text-white/35">From:</span> <span className="text-white/80 font-medium">{snapshot.departureCity}</span></p>
              )}
              {snapshot.checkIn && (
                <p className="text-xs"><span className="text-white/35">In:</span> <span className="text-white/80 font-medium">{snapshot.checkIn}</span></p>
              )}
              {snapshot.checkOut && (
                <p className="text-xs"><span className="text-white/35">Out:</span> <span className="text-white/80 font-medium">{snapshot.checkOut}</span></p>
              )}
              {snapshot.adults && (
                <p className="text-xs"><span className="text-white/35">Adults:</span> <span className="text-white/80 font-medium">{snapshot.adults}</span></p>
              )}
              {snapshot.children && (
                <p className="text-xs"><span className="text-white/35">Children:</span> <span className="text-white/80 font-medium">{snapshot.children}</span></p>
              )}
              {snapshot.budget && (
                <p className="text-xs"><span className="text-white/35">Budget:</span> <span className="text-white/80 font-medium">{snapshot.currency || "USD"} {snapshot.budget}</span></p>
              )}
              {snapshot.style && (
                <p className="text-xs"><span className="text-white/35">Style:</span> <span className="text-white/80 font-medium">{snapshot.style}</span></p>
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
