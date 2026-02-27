"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { applyTripPatch, generateProposal } from "../../lib/store/tripsStore";

type CallState = "idle" | "connecting" | "speaking" | "listening" | "thinking" | "error";

export default function LinaVideoCall({ tripId }: { tripId: string }) {
  const [state, setState] = useState<CallState>("idle");
  const [transcript, setTranscript] = useState<{ role: string; text: string }[]>([]);
  const [currentText, setCurrentText] = useState("");
  const [userText, setUserText] = useState("");
  const [amplitude, setAmplitude] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState("");
  const [snapshot, setSnapshot] = useState<Record<string, any>>({});

  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const playCtxRef = useRef<AudioContext | null>(null);
  const queueRef = useRef<ArrayBuffer[]>([]);
  const playingRef = useRef(false);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const ctRef = useRef("");
  const fnArgs = useRef<Record<string, string>>({});
  const stateRef = useRef<CallState>("idle");

  // Keep stateRef in sync
  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => { ctRef.current = currentText; }, [currentText]);

  // Timer
  useEffect(() => {
    if (state !== "idle" && state !== "error" && state !== "connecting") {
      timerRef.current = setInterval(() => setElapsed(p => p + 1), 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
  }, [state]);

  // Auto scroll
  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [transcript, currentText, userText]);

  // Amplitude loop
  const startAmplitudeLoop = useCallback(() => {
    const check = () => {
      const a = analyserRef.current;
      if (!a) { setAmplitude(0); return; }
      const buf = new Uint8Array(a.fftSize);
      a.getByteTimeDomainData(buf);
      let sum = 0;
      for (let i = 0; i < buf.length; i++) { const v = (buf[i] - 128) / 128; sum += v * v; }
      setAmplitude(Math.sqrt(sum / buf.length));
      rafRef.current = requestAnimationFrame(check);
    };
    check();
  }, []);

  const stopAmplitudeLoop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    analyserRef.current = null;
    setAmplitude(0);
  }, []);

  // Audio playback
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

      const an = ctx.createAnalyser();
      an.fftSize = 256;
      analyserRef.current = an;
      src.connect(an).connect(ctx.destination);

      startAmplitudeLoop();
      await new Promise<void>(r => { src.onended = () => r(); src.start(); });
    }

    stopAmplitudeLoop();
    playingRef.current = false;
    if (stateRef.current === "speaking") setState("listening");
  }, [startAmplitudeLoop, stopAmplitudeLoop]);

  // Handle function call
  const handleFnCall = useCallback((ws: WebSocket, callId: string, name: string, argsStr: string) => {
    try {
      const args = JSON.parse(argsStr);
      let output = "{}";

      if (name === "update_trip") {
        setSnapshot(prev => ({ ...prev, ...args }));
        applyTripPatch(tripId, args);
        output = JSON.stringify({ success: true, fields: Object.keys(args) });
      } else if (name === "generate_proposal" && args.confirmed) {
        generateProposal(tripId);
        output = JSON.stringify({ success: true, url: `/proposals/${tripId}/select` });
        setTimeout(() => { window.location.href = `/proposals/${tripId}/select`; }, 3500);
      }

      ws.send(JSON.stringify({
        type: "conversation.item.create",
        item: { type: "function_call_output", call_id: callId, output },
      }));
      ws.send(JSON.stringify({ type: "response.create" }));
    } catch (e) {
      console.error("fn call error", e);
    }
  }, [tripId]);

  // Start
  const startCall = useCallback(async () => {
    setState("connecting"); setError(""); setTranscript([]); setElapsed(0); setSnapshot({});
    try {
      // Request mic FIRST
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      } catch (micErr: any) {
        // Try with basic audio constraints as fallback
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch {
          throw new Error("Microphone not found or blocked. Please check your browser permissions and make sure a microphone is connected.");
        }
      }
      streamRef.current = stream;

      const res = await fetch("/api/realtime-session", { method: "POST" });
      if (!res.ok) throw new Error("Session failed");
      const data = await res.json();
      const key = data.client_secret?.value;
      if (!key) throw new Error(data.error || "No token");

      const ws = new WebSocket(
        "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2025-06-03",
        ["realtime", `openai-insecure-api-key.${key}`, "openai-beta.realtime-v1"]
      );
      wsRef.current = ws;

      ws.onopen = async () => {

        const actx = new AudioContext({ sampleRate: 24000 });
        audioCtxRef.current = actx;
        if (actx.state === "suspended") await actx.resume();
        const msrc = actx.createMediaStreamSource(stream);
        const proc = actx.createScriptProcessor(4096, 1, 1);
        processorRef.current = proc;
        msrc.connect(proc).connect(actx.destination);

        proc.onaudioprocess = (e) => {
          if (ws.readyState !== WebSocket.OPEN) return;
          const ch = e.inputBuffer.getChannelData(0);
          const i16 = new Int16Array(ch.length);
          for (let i = 0; i < ch.length; i++) {
            const s = Math.max(-1, Math.min(1, ch[i]));
            i16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
          }
          const b64 = btoa(String.fromCharCode(...new Uint8Array(i16.buffer)));
          ws.send(JSON.stringify({ type: "input_audio_buffer.append", audio: b64 }));
        };

        setState("listening");
        ws.send(JSON.stringify({ type: "response.create", response: { modalities: ["audio", "text"] } }));
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
            setCurrentText(p => p + (m.delta || ""));
            break;
          case "response.audio_transcript.done":
            setTranscript(p => [...p, { role: "lina", text: m.transcript || ctRef.current }]);
            setCurrentText("");
            break;
          case "conversation.item.input_audio_transcription.completed":
            if (m.transcript?.trim()) setTranscript(p => [...p, { role: "user", text: m.transcript }]);
            setUserText("");
            break;
          case "input_audio_buffer.speech_started":
            setUserText("🎤 ...");
            break;
          case "input_audio_buffer.speech_stopped":
            setUserText("");
            break;
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
            break;
        }
      };

      ws.onerror = () => { setError("Connection lost"); setState("error"); };
      ws.onclose = () => { if (stateRef.current !== "error") setState("idle"); };
    } catch (e: any) { setError(e.message); setState("error"); }
  }, [drainQueue, handleFnCall]);

  const endCall = useCallback(() => {
    wsRef.current?.close(); wsRef.current = null;
    streamRef.current?.getTracks().forEach(t => t.stop()); streamRef.current = null;
    processorRef.current?.disconnect(); processorRef.current = null;
    audioCtxRef.current?.close().catch(() => {}); audioCtxRef.current = null;
    playCtxRef.current?.close().catch(() => {}); playCtxRef.current = null;
    stopAmplitudeLoop();
    if (timerRef.current) clearInterval(timerRef.current);
    queueRef.current = []; playingRef.current = false;
    setState("idle"); setAmplitude(0);
  }, [stopAmplitudeLoop]);

  const active = !["idle", "error", "connecting"].includes(state);
  const speaking = state === "speaking";
  const listening = state === "listening";
  const mo = Math.min(amplitude * 10, 1);
  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="relative w-full overflow-hidden rounded-3xl" style={{ background: "linear-gradient(135deg, #081A4A 0%, #0F3A8A 40%, #2B6BFF 100%)", minHeight: "80vh" }}>
      <style>{`
        @keyframes gentle-breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.004)}}
        @keyframes gentle-blink{0%,46%,50%,86%,90%,100%{opacity:1}47.5%,88%{opacity:.92}}
        @keyframes soft-glow{0%,100%{filter:drop-shadow(0 10px 25px rgba(43,107,255,.2))}50%{filter:drop-shadow(0 14px 35px rgba(43,107,255,.3))}}
        @keyframes eq{0%,100%{height:3px}50%{height:var(--h)}}
        @keyframes fp{0%{transform:translateY(0);opacity:0}15%{opacity:.35}85%{opacity:.1}100%{transform:translateY(-200px);opacity:0}}
        @keyframes gp{0%,100%{box-shadow:0 0 30px rgba(99,102,241,.2)}50%{box-shadow:0 0 50px rgba(99,102,241,.4)}}
        .lina-alive{animation:gentle-breathe 5s ease-in-out infinite,gentle-blink 7s ease-in-out infinite,soft-glow 5s ease-in-out infinite;transform-origin:center bottom}
      `}</style>

      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({length:8},(_,i)=>(
          <div key={i} className="absolute rounded-full bg-white/6" style={{width:2+Math.random()*3,height:2+Math.random()*3,left:`${Math.random()*100}%`,bottom:"-3%",animation:`fp ${12+Math.random()*15}s linear infinite`,animationDelay:`${Math.random()*12}s`}}/>
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center px-6 py-8" style={{minHeight:"80vh"}}>
        {/* Top bar */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-2.5 w-2.5 rounded-full ${active?"bg-emerald-400 animate-pulse":"bg-slate-500"}`}/>
            <span className="text-white/70 text-sm font-medium">
              {state==="idle"?"Ready":state==="connecting"?"Connecting...":state==="error"?"Error":fmt(elapsed)}
            </span>
          </div>
          {active&&<button onClick={endCall} className="bg-red-500/90 hover:bg-red-400 text-white px-5 py-2 rounded-full text-sm font-bold transition-all">End Call</button>}
        </div>

        {/* LINA */}
        <div className="relative mb-6">
          {speaking&&<div className="absolute inset-0 rounded-full" style={{margin:"-18px",animation:"gp 2s ease-in-out infinite"}}/>}
          <div
            className="lina-alive relative overflow-hidden rounded-full shadow-2xl"
            style={{
              width:"clamp(230px,28vw,320px)",
              height:"clamp(230px,28vw,320px)",
              border:`3px solid ${speaking?"rgba(99,102,241,.45)":listening?"rgba(52,211,153,.3)":"rgba(255,255,255,.1)"}`,
              transition:"border-color .5s",
            }}
          >
            <img src="/branding/lina-hero.png" alt="Lina AI"
              style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center 15%"}}/>

            {/* Mouth — only when speaking, driven by amplitude */}
            {speaking&&(
              <svg className="absolute left-1/2 -translate-x-1/2" style={{top:"52%",width:"44px",height:"26px",pointerEvents:"none"}} viewBox="0 0 44 26">
                <ellipse cx="22" cy="13" rx={6+mo*9} ry={1+mo*9}
                  fill="rgba(15,5,5,.7)" style={{transition:"all .06s ease-out"}}/>
                {mo>.5&&<rect x={22-(6+mo*9)*.6} y={13-(1+mo*9)*.35} width={(6+mo*9)*1.2} height="2" rx="1"
                  fill="rgba(255,255,255,.45)" style={{transition:"all .06s ease-out"}}/>}
                <ellipse cx="22" cy={13+(1+mo*9)*.7} rx={(6+mo*9)*.7} ry="1.5"
                  fill="rgba(180,90,80,.3)" style={{transition:"all .06s ease-out"}}/>
              </svg>
            )}
          </div>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur rounded-full px-4 py-1 border border-white/15">
            <span className="text-white font-bold text-xs">Lina AI</span>
          </div>
        </div>

        {/* Equalizer */}
        {speaking&&(
          <div className="flex items-end justify-center gap-0.5 mb-3 h-5">
            {Array.from({length:7},(_,i)=>(
              <div key={i} className="w-0.5 bg-indigo-400/50 rounded-full"
                // @ts-ignore
                style={{"--h":`${4+Math.random()*16}px`,height:`${2+mo*14}px`,animation:`eq ${.3+Math.random()*.3}s ease-in-out infinite`,animationDelay:`${i*.04}s`,transition:"height .07s"}}/>
            ))}
          </div>
        )}

        {/* State label */}
        <div className="h-5 mb-4">
          {listening&&<p className="text-emerald-300/70 text-xs font-medium flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"/>Listening...</p>}
          {speaking&&<p className="text-indigo-300/70 text-xs font-medium flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse"/>Speaking...</p>}
          {state==="thinking"&&<p className="text-amber-300/70 text-xs font-medium flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse"/>Processing...</p>}
        </div>

        {/* Transcript */}
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

        {/* Snapshot */}
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
              {snapshot.accommodationType&&<p className="text-xs"><span className="text-white/35">Stay:</span> <span className="text-white/80 font-medium">{snapshot.accommodationType}</span></p>}
              {snapshot.notes&&<p className="text-xs col-span-2"><span className="text-white/35">Notes:</span> <span className="text-white/80 font-medium">{snapshot.notes}</span></p>}
            </div>
          </div>
        )}

        {/* Start */}
        {state==="idle"&&(
          <button onClick={startCall} className="group mt-8 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-400 hover:to-blue-400 text-white px-10 py-4 rounded-full text-lg font-bold shadow-2xl shadow-indigo-500/25 transition-all duration-300 hover:scale-105">
            <span className="flex items-center gap-3">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
              Start Video Call with Lina
            </span>
          </button>
        )}

        {state==="connecting"&&(
          <div className="mt-8 text-white/50 text-sm font-medium animate-pulse">Connecting to Lina...</div>
        )}

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
