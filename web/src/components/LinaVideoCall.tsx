"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { applyTripPatch, generateProposal, updateSnapshot } from "../../lib/store/tripsStore";
import {
  LINA_REALTIME_MODEL,
  LINA_REALTIME_INSTRUCTIONS,
  LINA_REALTIME_VOICE,
  LINA_REALTIME_TOOLS,
  LINA_REALTIME_TURN_DETECTION,
  LINA_REALTIME_INPUT_TRANSCRIPTION,
} from "../lib/linaRealtimeConfig";

type CallState = "idle" | "connecting" | "speaking" | "listening" | "thinking" | "error";

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  return btoa(binary);
}

function resampleTo24k(input: Float32Array, fromRate: number): Int16Array {
  const ratio = 24000 / fromRate;
  const newLen = Math.round(input.length * ratio);
  const out = new Int16Array(newLen);
  for (let i = 0; i < newLen; i++) {
    const srcIdx = i / ratio;
    const idx = Math.floor(srcIdx);
    const frac = srcIdx - idx;
    const sample = idx + 1 < input.length
      ? input[idx] * (1 - frac) + input[idx + 1] * frac
      : input[idx] || 0;
    const s = Math.max(-1, Math.min(1, sample));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return out;
}


export default function LinaVideoCall({ tripId }: { tripId: string }) {
  const [state, setState] = useState<CallState>("idle");
  const [transcript, setTranscript] = useState<{ role: string; text: string }[]>([]);
  const [currentText, setCurrentText] = useState("");
  const [userText, setUserText] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState("");
  const [micStatus, setMicStatus] = useState<"none" | "denied" | "ok">("none");
  const [snapshot, setSnapshot] = useState<Record<string, any>>({});

  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const workletRef = useRef<AudioWorkletNode | null>(null);
  const playCtxRef = useRef<AudioContext | null>(null);
  const queueRef = useRef<ArrayBuffer[]>([]);
  const playingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const ctRef = useRef("");
  const fnArgs = useRef<Record<string, string>>({});
  const stateRef = useRef<CallState>("idle");

  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => { ctRef.current = currentText; }, [currentText]);

  useEffect(() => {
    if (state !== "idle" && state !== "error" && state !== "connecting") {
      timerRef.current = setInterval(() => setElapsed(p => p + 1), 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
  }, [state]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [transcript, currentText, userText]);

  const drainQueue = useCallback(async () => {
    if (playingRef.current || queueRef.current.length === 0) return;
    playingRef.current = true;
    setState("speaking");

    if (!playCtxRef.current) playCtxRef.current = new AudioContext({ sampleRate: 24000 });
    const ctx = playCtxRef.current;
    if (ctx.state === "suspended") await ctx.resume();

    while (queueRef.current.length > 0) {
      const chunk = queueRef.current.shift()!;
      const pcm = new Int16Array(chunk);
      const f32 = new Float32Array(pcm.length);
      for (let i = 0; i < pcm.length; i++) f32[i] = pcm[i] / 32768;
      const ab = ctx.createBuffer(1, f32.length, 24000);
      ab.getChannelData(0).set(f32);
      const src = ctx.createBufferSource();
      src.buffer = ab;
      src.connect(ctx.destination);
      await new Promise<void>(r => { src.onended = () => r(); src.start(); });
    }

    playingRef.current = false;
    if (stateRef.current === "speaking") setState("listening");
  }, []);

  const handleFnCall = useCallback((ws: WebSocket, callId: string, name: string, argsStr: string) => {
    try {
      const args = JSON.parse(argsStr);
      let output = "{}";
      if (name === "update_trip") {
        setSnapshot(prev => ({ ...prev, ...args }));
        applyTripPatch(tripId, args);
        // Also sync to snapshots so /proposals/select page can find the data
        const snapPatch: Record<string,string> = {};
        if (args.departureCity) snapPatch.departure = args.departureCity;
        if (args.destination) snapPatch.destination = args.destination;
        if (args.checkIn && args.checkOut) snapPatch.dates = `${args.checkIn} → ${args.checkOut}`;
        else if (args.checkIn) snapPatch.dates = args.checkIn;
        if (args.adults) snapPatch.travelers = `${args.adults} adult${args.adults > 1 ? "s" : ""}${args.children ? `, ${args.children} child${args.children > 1 ? "ren" : ""}` : ""}`;
        if (args.budget) snapPatch.budget = `${args.currency || "USD"} ${args.budget}`;
        if (args.style) snapPatch.style = args.style;
        if (args.accommodationType) snapPatch.accommodationType = args.accommodationType;
        if (args.transportationType) snapPatch.transportationType = args.transportationType;
        if (Object.keys(snapPatch).length > 0) updateSnapshot(tripId, snapPatch);
        // Persist to server so proposal page works even without localStorage
        // Fetch existing then merge to accumulate all patches
        fetch(`/api/proposals?ownerEmail=voice-call@zenivatravel.com`)
          .then(r => r.json())
          .then(d => {
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
          .catch(() => {
            // Fallback: save without merging
            fetch("/api/proposals", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: tripId,
                ownerEmail: "voice-call@zenivatravel.com",
                status: "Draft",
                payload: { tripDraft: args, snapshot: snapPatch },
              }),
            }).catch(() => {});
          });
        output = JSON.stringify({ success: true, fields: Object.keys(args) });
      } else if (name === "generate_proposal" && args.confirmed) {
        generateProposal(tripId);
        output = JSON.stringify({ success: true, url: `/proposals/${tripId}/select` });
        setTimeout(() => { window.location.href = `/proposals/${tripId}/select`; }, 3500);
      }
      ws.send(JSON.stringify({ type: "conversation.item.create", item: { type: "function_call_output", call_id: callId, output } }));
      ws.send(JSON.stringify({ type: "response.create" }));
    } catch (e) { console.error("fn call error", e); }
  }, [tripId]);

  const startCall = useCallback(async () => {
    setState("connecting"); setError(""); setTranscript([]); setElapsed(0); setSnapshot({}); setMicStatus("none");
    try {
      // 1. Request microphone FIRST — must be in direct click handler
      let micStream: MediaStream | null = null;
      try {
        micStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          }
        });
        streamRef.current = micStream;
        setMicStatus("ok");
      } catch (micErr: any) {
        console.warn("Microphone error:", micErr.name, micErr.message);
        setMicStatus(micErr.name === "NotAllowedError" || micErr.name === "PermissionDeniedError" ? "denied" : "none");
      }

      // 2. Create AudioContext in click handler (user gesture required)
      if (micStream) {
        try {
          const actx = new AudioContext();
          audioCtxRef.current = actx;
          if (actx.state === "suspended") await actx.resume();
        } catch (e) {
          console.warn("AudioContext creation failed:", e);
        }
      }
      if (!playCtxRef.current) {
        try {
          playCtxRef.current = new AudioContext({ sampleRate: 24000 });
          if (playCtxRef.current.state === "suspended") await playCtxRef.current.resume();
        } catch (e) {
          console.warn("Playback AudioContext creation failed:", e);
        }
      }

      // 3. Get session token
      const res = await fetch("/api/realtime-session", { method: "POST" });
      if (!res.ok) throw new Error("Session failed");
      const data = await res.json();
      const key = data.client_secret?.value;
      if (!key) throw new Error(data.error || "No token");

      const wsUrl = `wss://api.openai.com/v1/realtime?model=${encodeURIComponent(LINA_REALTIME_MODEL)}`;
      const ws = new WebSocket(wsUrl, ["realtime", "openai-insecure-api-key." + key, "openai-beta.realtime-v1"]);
      wsRef.current = ws;

      const wsTimeout = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          ws.close();
          setError("Connection timeout. Please try again.");
          setState("error");
        }
      }, 10000);

      ws.onopen = async () => {
        clearTimeout(wsTimeout);
        let hasMic = false;

        if (micStream && audioCtxRef.current) {
          const actx = audioCtxRef.current;
          if (actx.state === "suspended") await actx.resume();
          const nativeSR = actx.sampleRate;

          // Try AudioWorklet first (modern, reliable on desktop Chrome)
          try {
            
            
            await actx.audioWorklet.addModule("/mic-processor.js");
            

            const msrc = actx.createMediaStreamSource(micStream);
            const worklet = new AudioWorkletNode(actx, "mic-processor");
            workletRef.current = worklet;
            msrc.connect(worklet);
            // NOT connected to destination — no mic playback through speakers

            worklet.port.onmessage = (e: MessageEvent) => {
              if (ws.readyState !== WebSocket.OPEN) return;
              const float32: Float32Array = e.data;
              const i16 = nativeSR === 24000
                ? (() => {
                    const o = new Int16Array(float32.length);
                    for (let i = 0; i < float32.length; i++) {
                      const s = Math.max(-1, Math.min(1, float32[i]));
                      o[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                    }
                    return o;
                  })()
                : resampleTo24k(float32, nativeSR);
              ws.send(JSON.stringify({ type: "input_audio_buffer.append", audio: arrayBufferToBase64(i16.buffer as ArrayBuffer) }));
            };
            hasMic = true;
          } catch (workletErr) {
            console.warn("AudioWorklet failed, trying ScriptProcessor fallback:", workletErr);
            // Fallback: ScriptProcessorNode with silent gain
            try {
              const msrc = actx.createMediaStreamSource(micStream);
              const proc = actx.createScriptProcessor(4096, 1, 1);
              const silentGain = actx.createGain();
              silentGain.gain.value = 0;
              msrc.connect(proc);
              proc.connect(silentGain);
              silentGain.connect(actx.destination);
              proc.onaudioprocess = (ev) => {
                if (ws.readyState !== WebSocket.OPEN) return;
                const input = ev.inputBuffer.getChannelData(0);
                const i16 = nativeSR === 24000
                  ? (() => {
                      const o = new Int16Array(input.length);
                      for (let i = 0; i < input.length; i++) {
                        const s = Math.max(-1, Math.min(1, input[i]));
                        o[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                      }
                      return o;
                    })()
                  : resampleTo24k(input, nativeSR);
                ws.send(JSON.stringify({ type: "input_audio_buffer.append", audio: arrayBufferToBase64(i16.buffer as ArrayBuffer) }));
              };
              hasMic = true;
            } catch (fallbackErr) {
              console.warn("ScriptProcessor fallback also failed:", fallbackErr);
            }
          }
        }

        setState(hasMic ? "listening" : "speaking");

        // Apply full session config on the WS — the config passed to
        // /v1/realtime/sessions is not always inherited by the WS connection,
        // so we re-send it here to guarantee Lina has her instructions, voice,
        // tools, and VAD settings before we trigger her greeting.
        ws.send(JSON.stringify({
          type: "session.update",
          session: {
            modalities: ["audio", "text"],
            voice: LINA_REALTIME_VOICE,
            instructions: LINA_REALTIME_INSTRUCTIONS,
            tools: LINA_REALTIME_TOOLS,
            tool_choice: "auto",
            input_audio_transcription: LINA_REALTIME_INPUT_TRANSCRIPTION,
            turn_detection: LINA_REALTIME_TURN_DETECTION,
          },
        }));

        // Trigger Lina's greeting. The model will use the instructions above
        // to say "Hi! I'm Lina..." as her first turn.
        ws.send(JSON.stringify({
          type: "response.create",
          response: {
            modalities: ["audio", "text"],
            instructions: "Start the conversation now by saying your greeting exactly as specified in your instructions. Then wait for the client.",
          },
        }));
      };

      ws.onmessage = (ev) => {
        const m = JSON.parse(ev.data);
        switch (m.type) {
          case "response.audio.delta": {
            const raw = atob(m.delta);
            const buf = new ArrayBuffer(raw.length);
            const u8 = new Uint8Array(buf);
            for (let i = 0; i < raw.length; i++) u8[i] = raw.charCodeAt(i);
            queueRef.current.push(buf);
            drainQueue();
            break;
          }
          case "response.audio_transcript.delta":
            setCurrentText(p => p + (m.delta || "")); break;
          case "response.audio_transcript.done":
            setTranscript(p => [...p, { role: "lina", text: m.transcript || ctRef.current }]);
            setCurrentText(""); break;
          case "conversation.item.input_audio_transcription.completed":
            if (m.transcript?.trim()) setTranscript(p => [...p, { role: "user", text: m.transcript }]);
            setUserText(""); break;
          case "input_audio_buffer.speech_started":
            setUserText("🎤 ..."); break;
          case "input_audio_buffer.speech_stopped":
            setUserText(""); break;
          case "response.function_call_arguments.delta":
            if (m.call_id) fnArgs.current[m.call_id] = (fnArgs.current[m.call_id] || "") + (m.delta || "");
            break;
          case "response.function_call_arguments.done": {
            const cid = m.call_id;
            const args = fnArgs.current[cid] || m.arguments || "{}";
            delete fnArgs.current[cid];
            handleFnCall(ws, cid, m.name, args);
            break;
          }
          case "error":
            console.error("RT error:", m.error);
            setError(`${m.error?.code || "error"}: ${m.error?.message || "Unknown realtime error"}`);
            setState("error");
            break;
        }
      };

      ws.onerror = (e) => { clearTimeout(wsTimeout); console.error("WS error", e); setError("Connection error. Please try again."); setState("error"); };
      ws.onclose = (e) => { clearTimeout(wsTimeout); console.log("WS closed", e.code, e.reason); if (stateRef.current !== "error") setState("idle"); };
    } catch (e: any) { setError(e.message); setState("error"); }
  }, [drainQueue, handleFnCall]);

  const endCall = useCallback(() => {
    wsRef.current?.close(); wsRef.current = null;
    streamRef.current?.getTracks().forEach(t => t.stop()); streamRef.current = null;
    workletRef.current?.disconnect(); workletRef.current = null;
    audioCtxRef.current?.close().catch(() => {}); audioCtxRef.current = null;
    playCtxRef.current?.close().catch(() => {}); playCtxRef.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
    queueRef.current = []; playingRef.current = false;
    setMicStatus("none");
    setState("idle");
  }, []);

  const active = !["idle", "error", "connecting"].includes(state);
  const speaking = state === "speaking";
  const listening = state === "listening";
  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="relative w-full overflow-hidden rounded-3xl" style={{ background: "linear-gradient(135deg, #081A4A 0%, #0F3A8A 40%, #2B6BFF 100%)", minHeight: "80vh" }}>
      <style>{`
        @keyframes breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.004)}}
        @keyframes glow{0%,100%{filter:drop-shadow(0 10px 25px rgba(43,107,255,.2))}50%{filter:drop-shadow(0 14px 35px rgba(43,107,255,.3))}}
        @keyframes gp{0%,100%{box-shadow:0 0 30px rgba(99,102,241,.2)}50%{box-shadow:0 0 50px rgba(99,102,241,.4)}}
        .lina-alive{animation:breathe 5s ease-in-out infinite,glow 5s ease-in-out infinite;transform-origin:center bottom}
      `}</style>

      <div className="relative z-10 flex flex-col items-center justify-center px-6 py-8" style={{minHeight:"80vh"}}>
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-2.5 w-2.5 rounded-full ${active?"bg-emerald-400 animate-pulse":"bg-slate-500"}`}/>
            <span className="text-white/70 text-sm font-medium">
              {state==="idle"?"Ready":state==="connecting"?"Connecting...":state==="error"?"Error":fmt(elapsed)}
            </span>
          </div>
          {active&&<button onClick={endCall} className="bg-red-500/90 hover:bg-red-400 text-white px-5 py-2 rounded-full text-sm font-bold transition-all">End Call</button>}
        </div>

        <div className="relative mb-6">
          {speaking&&<div className="absolute inset-0 rounded-full" style={{margin:"-18px",animation:"gp 2s ease-in-out infinite"}}/>}
          <div className="lina-alive relative overflow-hidden rounded-full shadow-2xl"
            style={{
              width:"clamp(230px,28vw,320px)", height:"clamp(230px,28vw,320px)",
              border:`3px solid ${speaking?"rgba(99,102,241,.45)":listening?"rgba(52,211,153,.3)":"rgba(255,255,255,.1)"}`,
              transition:"border-color .5s",
            }}>
            <img src="/branding/lina-hero.png" alt="Lina AI" style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 15%"}}/>
          </div>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur rounded-full px-4 py-1 border border-white/15">
            <span className="text-white font-bold text-xs">Lina AI</span>
          </div>
        </div>

        <div className="min-h-[20px] mb-4 text-center">
          {listening&&<p className="text-emerald-300/70 text-xs font-medium flex items-center justify-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"/>Listening...</p>}
          {speaking&&<p className="text-indigo-300/70 text-xs font-medium flex items-center justify-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse"/>Speaking...</p>}
          {state==="thinking"&&<p className="text-amber-300/70 text-xs font-medium flex items-center justify-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse"/>Processing...</p>}
          {active && micStatus === "denied" && <p className="text-red-300/80 text-xs font-medium mt-1">🔇 Microphone blocked — allow mic access in your browser settings and reload</p>}
          {active && micStatus === "none" && state !== "connecting" && <p className="text-orange-300/70 text-xs font-medium mt-1">🔇 No microphone detected — listen-only mode</p>}
        </div>

        {active&&(
          <div ref={scrollRef} className="w-full max-w-xl bg-black/20 backdrop-blur rounded-2xl border border-white/8 p-4 max-h-40 overflow-y-auto">
            {transcript.length===0&&!currentText&&!userText&&<p className="text-white/25 text-sm text-center">Conversation will appear here...</p>}
            {transcript.map((t,i)=>(
              <div key={i} className={`mb-2 ${t.role==="user"?"text-right":""}`}>
                <span className={`inline-block px-3 py-1.5 rounded-2xl text-sm max-w-[80%] ${t.role==="user"?"bg-white/10 text-white/80 rounded-br-sm":"bg-indigo-500/20 text-white/85 rounded-bl-sm"}`}>
                  {t.role==="lina"&&<span className="text-indigo-300 font-bold mr-1">Lina:</span>}{t.text}
                </span>
              </div>
            ))}
            {currentText&&<div className="mb-2"><span className="inline-block px-3 py-1.5 rounded-2xl rounded-bl-sm text-sm bg-indigo-500/20 text-white/70"><span className="text-indigo-300 font-bold mr-1">Lina:</span>{currentText}</span></div>}
            {userText&&<div className="mb-2 text-right"><span className="inline-block px-3 py-1.5 rounded-2xl rounded-br-sm text-sm bg-white/10 text-white/50">{userText}</span></div>}
          </div>
        )}

        {active&&Object.keys(snapshot).length>0&&(
          <div className="w-full max-w-xl mt-3 bg-white/6 backdrop-blur rounded-2xl border border-white/8 p-4">
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">📋 Trip Snapshot</div>
            <div className="grid grid-cols-2 gap-1.5">
              {snapshot.destination&&<p className="text-xs"><span className="text-white/35">Destination:</span> <span className="text-white/80 font-medium">{snapshot.destination}</span></p>}
              {snapshot.departureCity&&<p className="text-xs"><span className="text-white/35">From:</span> <span className="text-white/80 font-medium">{snapshot.departureCity}</span></p>}
              {snapshot.checkIn&&<p className="text-xs"><span className="text-white/35">In:</span> <span className="text-white/80 font-medium">{snapshot.checkIn}</span></p>}
              {snapshot.checkOut&&<p className="text-xs"><span className="text-white/35">Out:</span> <span className="text-white/80 font-medium">{snapshot.checkOut}</span></p>}
              {snapshot.adults&&<p className="text-xs"><span className="text-white/35">Adults:</span> <span className="text-white/80 font-medium">{snapshot.adults}</span></p>}
              {snapshot.children&&<p className="text-xs"><span className="text-white/35">Children:</span> <span className="text-white/80 font-medium">{snapshot.children}</span></p>}
              {snapshot.budget&&<p className="text-xs"><span className="text-white/35">Budget:</span> <span className="text-white/80 font-medium">{snapshot.currency||"USD"} {snapshot.budget}</span></p>}
              {snapshot.style&&<p className="text-xs"><span className="text-white/35">Style:</span> <span className="text-white/80 font-medium">{snapshot.style}</span></p>}
              {snapshot.transportationType&&<p className="text-xs"><span className="text-white/35">✈️ Transport:</span> <span className="text-white/80 font-medium">{snapshot.transportationType}</span></p>}
              {snapshot.accommodationType&&<p className="text-xs"><span className="text-white/35">🏨 Lodging:</span> <span className="text-white/80 font-medium">{snapshot.accommodationType}</span></p>}
              {snapshot.includeActivities&&<p className="text-xs"><span className="text-white/35">🎯 Activities:</span> <span className="text-emerald-400/80 font-medium">Included</span></p>}
              {snapshot.includeTransfers&&<p className="text-xs"><span className="text-white/35">🚗 Transfers:</span> <span className="text-emerald-400/80 font-medium">Included</span></p>}
              {snapshot.notes&&<p className="text-xs col-span-2"><span className="text-white/35">Notes:</span> <span className="text-white/80 font-medium">{snapshot.notes}</span></p>}
            </div>
          </div>
        )}

        {state==="idle"&&(
          <button onClick={startCall} className="mt-8 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-400 hover:to-blue-400 text-white px-10 py-4 rounded-full text-lg font-bold shadow-2xl shadow-indigo-500/25 transition-all duration-300 hover:scale-105">
            <span className="flex items-center gap-3">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
              Start Video Call with Lina
            </span>
          </button>
        )}

        {state==="connecting"&&<div className="mt-8 text-white/50 text-sm font-medium animate-pulse">Connecting to Lina...</div>}

        {state==="error"&&(
          <div className="mt-6 text-center">
            <p className="text-red-300/80 text-sm mb-4">{error}</p>
            <button onClick={startCall} className="bg-white/10 text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-white/15 transition-all">Try Again</button>
          </div>
        )}
      </div>
    </div>
  );
}
