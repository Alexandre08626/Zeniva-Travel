"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { applyTripPatch, generateProposal } from "../../lib/store/tripsStore";

type CallState = "idle" | "connecting" | "connected" | "speaking" | "listening" | "thinking" | "error";

export default function LinaVideoCall({ tripId }: { tripId: string }) {
  const [state, setState] = useState<CallState>("idle");
  const [transcript, setTranscript] = useState<{ role: string; text: string }[]>([]);
  const [currentText, setCurrentText] = useState("");
  const [userText, setUserText] = useState("");
  const [amplitude, setAmplitude] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState("");
  const [snapshot, setSnapshot] = useState<Record<string, any>>({});
  const fnArgsRef = useRef<Record<string, string>>({});

  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const playbackCtxRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<ArrayBuffer[]>([]);
  const isPlayingRef = useRef(false);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const currentTextRef = useRef("");

  useEffect(() => { currentTextRef.current = currentText; }, [currentText]);

  useEffect(() => {
    if (["connected", "speaking", "listening", "thinking"].includes(state)) {
      timerRef.current = setInterval(() => setElapsed(p => p + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [state]);

  useEffect(() => {
    if (transcriptRef.current) transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
  }, [transcript, currentText, userText]);

  const monitorAmplitude = useCallback(() => {
    if (!analyserRef.current) return;
    const data = new Uint8Array(analyserRef.current.fftSize);
    const check = () => {
      if (!analyserRef.current) return;
      analyserRef.current.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) { const v = (data[i] - 128) / 128; sum += v * v; }
      setAmplitude(Math.sqrt(sum / data.length));
      animFrameRef.current = requestAnimationFrame(check);
    };
    check();
  }, []);

  const playNextAudio = useCallback(async () => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0) return;
    isPlayingRef.current = true;
    setState("speaking");
    while (audioQueueRef.current.length > 0) {
      const chunk = audioQueueRef.current.shift()!;
      if (!playbackCtxRef.current) playbackCtxRef.current = new AudioContext({ sampleRate: 24000 });
      const ctx = playbackCtxRef.current;
      const pcm16 = new Int16Array(chunk);
      const float32 = new Float32Array(pcm16.length);
      for (let i = 0; i < pcm16.length; i++) float32[i] = pcm16[i] / 32768;
      const buffer = ctx.createBuffer(1, float32.length, 24000);
      buffer.getChannelData(0).set(float32);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      source.connect(analyser);
      analyser.connect(ctx.destination);
      monitorAmplitude();
      await new Promise<void>(resolve => { source.onended = () => resolve(); source.start(); });
    }
    cancelAnimationFrame(animFrameRef.current);
    analyserRef.current = null;
    setAmplitude(0);
    isPlayingRef.current = false;
    setState("listening");
  }, [monitorAmplitude]);

  const startCall = useCallback(async () => {
    setState("connecting");
    setError("");
    setTranscript([]);
    setElapsed(0);
    try {
      const tokenRes = await fetch("/api/realtime-session", { method: "POST" });
      if (!tokenRes.ok) throw new Error("Failed to create session");
      const tokenData = await tokenRes.json();
      const ephemeralKey = tokenData.client_secret?.value;
      if (!ephemeralKey) throw new Error("No token received");
      const ws = new WebSocket(`wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2025-06-03`, [
        "realtime", `openai-insecure-api-key.${ephemeralKey}`, "openai-beta.realtime-v1",
      ]);
      wsRef.current = ws;
      ws.onopen = async () => {
        setState("connected");
        const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
        streamRef.current = stream;
        const audioCtx = new AudioContext({ sampleRate: 24000 });
        audioCtxRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const processor = audioCtx.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;
        source.connect(processor);
        processor.connect(audioCtx.destination);
        processor.onaudioprocess = (e) => {
          if (ws.readyState !== WebSocket.OPEN) return;
          const f = e.inputBuffer.getChannelData(0);
          const p = new Int16Array(f.length);
          for (let i = 0; i < f.length; i++) { const s = Math.max(-1, Math.min(1, f[i])); p[i] = s < 0 ? s * 0x8000 : s * 0x7FFF; }
          ws.send(JSON.stringify({ type: "input_audio_buffer.append", audio: btoa(String.fromCharCode(...new Uint8Array(p.buffer))) }));
        };
        setState("listening");
        ws.send(JSON.stringify({ type: "response.create", response: { modalities: ["audio", "text"] } }));
      };
      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        switch (msg.type) {
          case "response.audio.delta": {
            const raw = atob(msg.delta);
            const buf = new ArrayBuffer(raw.length);
            const v = new Uint8Array(buf);
            for (let i = 0; i < raw.length; i++) v[i] = raw.charCodeAt(i);
            audioQueueRef.current.push(buf);
            playNextAudio();
            break;
          }
          case "response.audio_transcript.delta":
            setCurrentText(p => p + (msg.delta || ""));
            break;
          case "response.audio_transcript.done":
            setTranscript(p => [...p, { role: "lina", text: msg.transcript || currentTextRef.current }]);
            setCurrentText("");
            break;
          case "conversation.item.input_audio_transcription.completed":
            if (msg.transcript?.trim()) setTranscript(p => [...p, { role: "user", text: msg.transcript }]);
            setUserText("");
            break;
          case "input_audio_buffer.speech_started":
            setState("thinking");
            setUserText("Listening...");
            break;
          case "input_audio_buffer.speech_stopped":
            setUserText("");
            break;
          // Function call handling
          case "response.function_call_arguments.delta":
            if (msg.call_id) {
              fnArgsRef.current[msg.call_id] = (fnArgsRef.current[msg.call_id] || "") + (msg.delta || "");
            }
            break;
          case "response.function_call_arguments.done": {
            const callId = msg.call_id;
            const fnName = msg.name;
            const argsStr = fnArgsRef.current[callId] || msg.arguments || "{}";
            delete fnArgsRef.current[callId];
            try {
              const args = JSON.parse(argsStr);
              if (fnName === "update_trip") {
                // Update local snapshot display
                setSnapshot(prev => ({ ...prev, ...args }));
                // Update trip store
                applyTripPatch(tripId, args);
                // Send function result back
                ws.send(JSON.stringify({
                  type: "conversation.item.create",
                  item: { type: "function_call_output", call_id: callId, output: JSON.stringify({ success: true, updated: Object.keys(args) }) }
                }));
              } else if (fnName === "generate_proposal") {
                if (args.confirmed) {
                  generateProposal(tripId);
                  ws.send(JSON.stringify({
                    type: "conversation.item.create",
                    item: { type: "function_call_output", call_id: callId, output: JSON.stringify({ success: true, proposalUrl: `/proposals/${tripId}/select` }) }
                  }));
                  // Redirect after Lina confirms
                  setTimeout(() => {
                    window.location.href = `/proposals/${tripId}/select`;
                  }, 3000);
                }
              }
              // Trigger next response after function call
              ws.send(JSON.stringify({ type: "response.create" }));
            } catch (e) { console.error("Function call error:", e); }
            break;
          }
          case "error": console.error("Realtime error:", msg.error); break;
        }
      };
      ws.onerror = () => { setError("Connection error"); setState("error"); };
      ws.onclose = () => setState("idle");
    } catch (e: any) { setError(e.message); setState("error"); }
  }, [playNextAudio]);

  const endCall = useCallback(() => {
    wsRef.current?.close();
    streamRef.current?.getTracks().forEach(t => t.stop());
    processorRef.current?.disconnect();
    audioCtxRef.current?.close();
    playbackCtxRef.current?.close();
    cancelAnimationFrame(animFrameRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    wsRef.current = null; streamRef.current = null; audioCtxRef.current = null;
    playbackCtxRef.current = null; analyserRef.current = null;
    audioQueueRef.current = []; isPlayingRef.current = false;
    setState("idle"); setAmplitude(0);
  }, []);

  const isActive = state !== "idle" && state !== "error";
  const isSpeaking = state === "speaking";
  const isListening = state === "listening";
  const mo = Math.min(amplitude * 10, 1);
  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  // Mouth: driven directly by amplitude — smooth, natural
  const mouthW = 14 + mo * 16;
  const mouthH = 1.5 + mo * 16;
  const showTeeth = mouthH > 10;

  return (
    <div className="relative w-full overflow-hidden rounded-3xl" style={{ background: "linear-gradient(135deg, #081A4A 0%, #0F3A8A 40%, #2B6BFF 100%)", minHeight: "80vh" }}>
      <style>{`
        /* IDLE — calm, subtle, like a real person standing still */
        @keyframes idle-breathe { 0%,100%{transform:scaleY(1)} 50%{transform:scaleY(1.006)} }
        @keyframes idle-blink {
          0%,100%{clip-path:inset(0 0 0 0)}
          47%{clip-path:inset(0 0 0 0)} 48%{clip-path:inset(40% 20% 50% 20%)} 49.5%{clip-path:inset(0 0 0 0)}
          86%{clip-path:inset(0 0 0 0)} 87%{clip-path:inset(40% 20% 50% 20%)} 88.5%{clip-path:inset(0 0 0 0)}
        }
        @keyframes idle-glow {
          0%,100%{filter:drop-shadow(0 12px 25px rgba(43,107,255,0.2)) brightness(1)}
          50%{filter:drop-shadow(0 16px 35px rgba(43,107,255,0.3)) brightness(1.02)}
        }

        /* SPEAKING — chin/jaw driven by amplitude via inline style, subtle head energy */
        @keyframes speak-energy {
          0%,100%{transform:translateY(0) rotate(0deg)}
          25%{transform:translateY(-1.5px) rotate(0.3deg)}
          50%{transform:translateY(0) rotate(-0.2deg)}
          75%{transform:translateY(-1px) rotate(0.15deg)}
        }

        /* LISTENING — tiny nod */
        @keyframes listen-nod {
          0%,100%{transform:translateY(0)} 50%{transform:translateY(1.5px)}
        }

        .lina-idle { animation: idle-breathe 5s ease-in-out infinite, idle-blink 7s step-end infinite, idle-glow 5s ease-in-out infinite; transform-origin: center bottom; }
        .lina-speaking { animation: speak-energy 1s ease-in-out infinite, idle-blink 7s step-end infinite; transform-origin: center bottom; }
        .lina-listening { animation: listen-nod 3.5s ease-in-out infinite, idle-blink 7s step-end infinite, idle-glow 5s ease-in-out infinite; transform-origin: center bottom; }

        @keyframes eq-bar { 0%,100%{height:3px} 50%{height:var(--h)} }
        @keyframes float-p { 0%{transform:translateY(0);opacity:0} 15%{opacity:0.4} 85%{opacity:0.15} 100%{transform:translateY(-220px);opacity:0} }
        @keyframes ring-out { 0%{transform:scale(1);opacity:0.5} 100%{transform:scale(1.6);opacity:0} }
        @keyframes glow-pulse { 0%,100%{box-shadow:0 0 35px rgba(99,102,241,0.25)} 50%{box-shadow:0 0 65px rgba(99,102,241,0.5)} }
      `}</style>

      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white/8"
            style={{ width: 2 + Math.random() * 4, height: 2 + Math.random() * 4, left: `${Math.random() * 100}%`, bottom: "-5%",
              animation: `float-p ${10 + Math.random() * 15}s linear infinite`, animationDelay: `${Math.random() * 12}s` }} />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center px-6 py-8" style={{ minHeight: "80vh" }}>
        {/* Status */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-3 w-3 rounded-full ${isActive ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
            <span className="text-white/80 text-sm font-semibold">
              {state === "idle" ? "Ready" : state === "connecting" ? "Connecting..." : state === "error" ? "Error" : formatTime(elapsed)}
            </span>
          </div>
          {isActive && (
            <button onClick={endCall} className="bg-red-500 hover:bg-red-400 text-white px-5 py-2 rounded-full text-sm font-bold transition-all shadow-lg shadow-red-500/30">
              End Call
            </button>
          )}
        </div>

        {/* === LINA AVATAR === */}
        <div className="relative mb-6">
          {isSpeaking && (
            <>
              <div className="absolute inset-0 rounded-full" style={{ margin: "-20px", animation: "glow-pulse 2s ease-in-out infinite" }} />
              <div className="absolute inset-0 rounded-full border border-indigo-400/20" style={{ margin: "-35px", animation: "ring-out 2.5s ease-out infinite" }} />
            </>
          )}

          <div
            className={`relative overflow-hidden rounded-full shadow-2xl ${isSpeaking ? "lina-speaking" : isListening ? "lina-listening" : isActive ? "lina-idle" : ""}`}
            style={{
              width: "clamp(230px, 30vw, 340px)",
              height: "clamp(230px, 30vw, 340px)",
              border: `3px solid ${isSpeaking ? "rgba(99,102,241,0.5)" : isListening ? "rgba(52,211,153,0.3)" : "rgba(255,255,255,0.12)"}`,
              transition: "border-color 0.5s",
            }}
          >
            {/* Image — jaw/chin movement driven by amplitude when speaking */}
            <img
              src="/branding/lina-hero.png"
              alt="Lina AI"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center 15%",
                transform: isSpeaking
                  ? `scaleY(${1 + mo * 0.008}) translateY(${-mo * 1.5}px)`
                  : "none",
                transition: "transform 0.07s ease-out",
              }}
            />

            {/* MOUTH — real-time amplitude driven, no frame cycling */}
            {isSpeaking && (
              <svg
                className="absolute left-1/2 -translate-x-1/2"
                style={{ top: "58%", width: "50px", height: "30px", pointerEvents: "none" }}
                viewBox="0 0 50 30"
              >
                {/* Dark mouth interior */}
                <ellipse
                  cx="25" cy="15"
                  rx={mouthW / 2}
                  ry={mouthH / 2}
                  fill="rgba(20,8,8,0.75)"
                  style={{ transition: "all 0.07s ease-out" }}
                />
                {/* Top lip shadow */}
                <ellipse
                  cx="25" cy={15 - mouthH / 2 + 1}
                  rx={mouthW / 2 + 1}
                  ry="1.5"
                  fill="rgba(180,100,90,0.4)"
                  style={{ transition: "all 0.07s ease-out" }}
                />
                {/* Bottom lip */}
                <ellipse
                  cx="25" cy={15 + mouthH / 2 - 1}
                  rx={mouthW / 2 - 1}
                  ry="2"
                  fill="rgba(200,110,100,0.35)"
                  style={{ transition: "all 0.07s ease-out" }}
                />
                {/* Teeth */}
                {showTeeth && (
                  <rect
                    x={25 - mouthW / 3} y={15 - mouthH / 4}
                    width={mouthW / 1.5} height="2.5"
                    rx="1" fill="rgba(255,255,255,0.55)"
                    style={{ transition: "all 0.07s ease-out" }}
                  />
                )}
              </svg>
            )}
          </div>

          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md rounded-full px-5 py-1.5 border border-white/20 whitespace-nowrap">
            <span className="text-white font-bold text-sm">Lina AI</span>
          </div>
        </div>

        {/* Equalizer */}
        {isSpeaking && (
          <div className="flex items-end justify-center gap-1 mb-4 h-6">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="w-0.5 bg-indigo-400/60 rounded-full"
                style={{
                  // @ts-ignore
                  "--h": `${5 + Math.random() * 20}px`,
                  height: `${2 + mo * 18 + Math.random() * 4}px`,
                  animation: `eq-bar ${0.3 + Math.random() * 0.3}s ease-in-out infinite`,
                  animationDelay: `${i * 0.04}s`,
                  transition: "height 0.08s",
                }} />
            ))}
          </div>
        )}

        {/* State label */}
        <div className="text-center mb-5 h-6">
          {isListening && <div className="flex items-center justify-center gap-2 text-emerald-300/80 text-xs font-semibold"><div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"/>Listening...</div>}
          {isSpeaking && <div className="flex items-center justify-center gap-2 text-indigo-300/80 text-xs font-semibold"><div className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse"/>Speaking...</div>}
          {state === "thinking" && <div className="flex items-center justify-center gap-2 text-amber-300/80 text-xs font-semibold"><div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse"/>Processing...</div>}
        </div>

        {/* Transcript */}
        {isActive && (
          <div ref={transcriptRef} className="w-full max-w-xl bg-black/25 backdrop-blur-md rounded-2xl border border-white/8 p-4 max-h-44 overflow-y-auto">
            {transcript.length === 0 && !currentText && !userText && <p className="text-white/30 text-sm text-center">Conversation will appear here...</p>}
            {transcript.map((t, i) => (
              <div key={i} className={`mb-2 ${t.role === "user" ? "text-right" : ""}`}>
                <span className={`inline-block px-3 py-1.5 rounded-2xl text-sm max-w-[80%] ${t.role === "user" ? "bg-white/12 text-white/85 rounded-br-sm" : "bg-indigo-500/25 text-white/90 rounded-bl-sm"}`}>
                  {t.role === "lina" && <span className="text-indigo-300 font-bold mr-1">Lina:</span>}{t.text}
                </span>
              </div>
            ))}
            {currentText && <div className="mb-2"><span className="inline-block px-3 py-1.5 rounded-2xl rounded-bl-sm text-sm bg-indigo-500/25 text-white/75"><span className="text-indigo-300 font-bold mr-1">Lina:</span>{currentText}</span></div>}
            {userText && <div className="mb-2 text-right"><span className="inline-block px-3 py-1.5 rounded-2xl rounded-br-sm text-sm bg-white/12 text-white/50 italic">{userText}</span></div>}
          </div>
        )}

        {/* Trip Snapshot — fills in live */}
        {isActive && Object.keys(snapshot).length > 0 && (
          <div className="w-full max-w-xl mt-4 bg-white/8 backdrop-blur-md rounded-2xl border border-white/10 p-4">
            <div className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3">📋 Trip Snapshot</div>
            <div className="grid grid-cols-2 gap-2">
              {snapshot.destination && <div className="text-sm"><span className="text-white/40">Destination:</span> <span className="text-white font-semibold">{snapshot.destination}</span></div>}
              {snapshot.departureCity && <div className="text-sm"><span className="text-white/40">From:</span> <span className="text-white font-semibold">{snapshot.departureCity}</span></div>}
              {snapshot.checkIn && <div className="text-sm"><span className="text-white/40">Check-in:</span> <span className="text-white font-semibold">{snapshot.checkIn}</span></div>}
              {snapshot.checkOut && <div className="text-sm"><span className="text-white/40">Check-out:</span> <span className="text-white font-semibold">{snapshot.checkOut}</span></div>}
              {snapshot.adults && <div className="text-sm"><span className="text-white/40">Adults:</span> <span className="text-white font-semibold">{snapshot.adults}</span></div>}
              {snapshot.children && <div className="text-sm"><span className="text-white/40">Children:</span> <span className="text-white font-semibold">{snapshot.children}</span></div>}
              {snapshot.budget && <div className="text-sm"><span className="text-white/40">Budget:</span> <span className="text-white font-semibold">{snapshot.currency || "USD"} {snapshot.budget}</span></div>}
              {snapshot.style && <div className="text-sm"><span className="text-white/40">Style:</span> <span className="text-white font-semibold">{snapshot.style}</span></div>}
              {snapshot.accommodationType && <div className="text-sm"><span className="text-white/40">Stay:</span> <span className="text-white font-semibold">{snapshot.accommodationType}</span></div>}
              {snapshot.transportationType && <div className="text-sm"><span className="text-white/40">Transport:</span> <span className="text-white font-semibold">{snapshot.transportationType}</span></div>}
              {snapshot.notes && <div className="text-sm col-span-2"><span className="text-white/40">Notes:</span> <span className="text-white font-semibold">{snapshot.notes}</span></div>}
            </div>
          </div>
        )}

        {/* Start */}
        {state === "idle" && (
          <button onClick={startCall}
            className="group mt-8 relative overflow-hidden bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-400 hover:to-blue-400 text-white px-10 py-4 rounded-full text-lg font-bold shadow-2xl shadow-indigo-500/30 transition-all duration-300 hover:scale-105">
            <span className="relative z-10 flex items-center gap-3">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
              Start Video Call with Lina
            </span>
          </button>
        )}

        {state === "error" && (
          <div className="mt-6 text-center">
            <p className="text-red-300 mb-4">{error}</p>
            <button onClick={startCall} className="bg-white/10 text-white px-6 py-2 rounded-full font-semibold hover:bg-white/20 transition-all">Try Again</button>
          </div>
        )}
      </div>
    </div>
  );
}
