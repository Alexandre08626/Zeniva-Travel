"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";

type CallState = "idle" | "connecting" | "connected" | "speaking" | "listening" | "thinking" | "error";

export default function LinaVideoCall({ tripId }: { tripId: string }) {
  const [state, setState] = useState<CallState>("idle");
  const [transcript, setTranscript] = useState<{ role: string; text: string }[]>([]);
  const [currentText, setCurrentText] = useState("");
  const [userText, setUserText] = useState("");
  const [amplitude, setAmplitude] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState("");

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

  // Timer
  useEffect(() => {
    if (state === "connected" || state === "speaking" || state === "listening" || state === "thinking") {
      timerRef.current = setInterval(() => setElapsed(p => p + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [state]);

  // Scroll transcript
  useEffect(() => {
    if (transcriptRef.current) transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
  }, [transcript, currentText, userText]);

  // Amplitude monitoring for mouth animation
  const monitorAmplitude = useCallback(() => {
    if (!analyserRef.current) return;
    const data = new Uint8Array(analyserRef.current.fftSize);
    const check = () => {
      if (!analyserRef.current) return;
      analyserRef.current.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128;
        sum += v * v;
      }
      setAmplitude(Math.sqrt(sum / data.length));
      animFrameRef.current = requestAnimationFrame(check);
    };
    check();
  }, []);

  // Play queued audio
  const playNextAudio = useCallback(async () => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0) return;
    isPlayingRef.current = true;
    setState("speaking");

    while (audioQueueRef.current.length > 0) {
      const chunk = audioQueueRef.current.shift()!;
      if (!playbackCtxRef.current) {
        playbackCtxRef.current = new AudioContext({ sampleRate: 24000 });
      }
      const ctx = playbackCtxRef.current;

      // PCM16 to Float32
      const pcm16 = new Int16Array(chunk);
      const float32 = new Float32Array(pcm16.length);
      for (let i = 0; i < pcm16.length; i++) float32[i] = pcm16[i] / 32768;

      const buffer = ctx.createBuffer(1, float32.length, 24000);
      buffer.getChannelData(0).set(float32);

      const source = ctx.createBufferSource();
      source.buffer = buffer;

      // Analyser for amplitude
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      source.connect(analyser);
      analyser.connect(ctx.destination);

      monitorAmplitude();

      await new Promise<void>(resolve => {
        source.onended = () => resolve();
        source.start();
      });
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
      // Get ephemeral token
      const tokenRes = await fetch("/api/realtime-session", { method: "POST" });
      if (!tokenRes.ok) throw new Error("Failed to create session");
      const tokenData = await tokenRes.json();
      const ephemeralKey = tokenData.client_secret?.value;
      if (!ephemeralKey) throw new Error("No token received");

      // Connect WebSocket
      const ws = new WebSocket(`wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2025-06-03`, [
        "realtime",
        `openai-insecure-api-key.${ephemeralKey}`,
        "openai-beta.realtime-v1",
      ]);
      wsRef.current = ws;

      ws.onopen = async () => {
        setState("connected");

        // Get microphone
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
          const float32 = e.inputBuffer.getChannelData(0);
          const pcm16 = new Int16Array(float32.length);
          for (let i = 0; i < float32.length; i++) {
            const s = Math.max(-1, Math.min(1, float32[i]));
            pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
          }
          const base64 = btoa(String.fromCharCode(...new Uint8Array(pcm16.buffer)));
          ws.send(JSON.stringify({ type: "input_audio_buffer.append", audio: base64 }));
        };

        setState("listening");

        // Trigger Lina's greeting
        ws.send(JSON.stringify({
          type: "response.create",
          response: { modalities: ["audio", "text"] }
        }));
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);

        switch (msg.type) {
          case "response.audio.delta": {
            const raw = atob(msg.delta);
            const buf = new ArrayBuffer(raw.length);
            const view = new Uint8Array(buf);
            for (let i = 0; i < raw.length; i++) view[i] = raw.charCodeAt(i);
            audioQueueRef.current.push(buf);
            playNextAudio();
            break;
          }
          case "response.audio_transcript.delta":
            setCurrentText(p => p + (msg.delta || ""));
            break;
          case "response.audio_transcript.done":
            setTranscript(p => [...p, { role: "lina", text: msg.transcript || currentText }]);
            setCurrentText("");
            break;
          case "conversation.item.input_audio_transcription.completed":
            if (msg.transcript?.trim()) {
              setTranscript(p => [...p, { role: "user", text: msg.transcript }]);
              setUserText("");
            }
            break;
          case "input_audio_buffer.speech_started":
            setState("thinking");
            setUserText("Listening...");
            break;
          case "input_audio_buffer.speech_stopped":
            setUserText("");
            break;
          case "error":
            console.error("Realtime error:", msg.error);
            break;
        }
      };

      ws.onerror = () => { setError("Connection error"); setState("error"); };
      ws.onclose = () => { if (state !== "idle") setState("idle"); };

    } catch (e: any) {
      setError(e.message);
      setState("error");
    }
  }, []);

  const endCall = useCallback(() => {
    wsRef.current?.close();
    streamRef.current?.getTracks().forEach(t => t.stop());
    processorRef.current?.disconnect();
    audioCtxRef.current?.close();
    playbackCtxRef.current?.close();
    cancelAnimationFrame(animFrameRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    wsRef.current = null;
    streamRef.current = null;
    audioCtxRef.current = null;
    playbackCtxRef.current = null;
    analyserRef.current = null;
    audioQueueRef.current = [];
    isPlayingRef.current = false;
    setState("idle");
    setAmplitude(0);
  }, []);

  const isActive = state !== "idle" && state !== "error";
  const isSpeaking = state === "speaking";
  const mouthOpen = Math.min(amplitude * 8, 1);
  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="relative w-full overflow-hidden rounded-3xl" style={{ background: "linear-gradient(135deg, #081A4A 0%, #0F3A8A 40%, #2B6BFF 100%)", minHeight: "80vh" }}>
      <style>{`
        @keyframes lina-idle{0%{transform:translateY(0) scale(1) rotate(0deg)}25%{transform:translateY(-6px) scale(1.005) rotate(0.3deg)}50%{transform:translateY(-3px) scale(1.01) rotate(-0.2deg)}75%{transform:translateY(-8px) scale(1.005) rotate(0.2deg)}100%{transform:translateY(0) scale(1) rotate(0deg)}}
        @keyframes lina-blink{0%,92%,100%{opacity:1}95%,97%{opacity:0.3}}
        @keyframes glow-pulse{0%{box-shadow:0 0 30px rgba(99,102,241,0.3)}50%{box-shadow:0 0 60px rgba(99,102,241,0.6),0 0 120px rgba(43,107,255,0.2)}100%{box-shadow:0 0 30px rgba(99,102,241,0.3)}}
        @keyframes ring-expand{0%{transform:scale(0.9);opacity:0.8}100%{transform:scale(1.5);opacity:0}}
        @keyframes float-particle{0%{transform:translateY(0) translateX(0);opacity:0}20%{opacity:0.6}80%{opacity:0.3}100%{transform:translateY(-200px) translateX(40px);opacity:0}}
        @keyframes wave-eq{0%,100%{height:4px}50%{height:var(--h)}}
        .lina-call-idle{animation:lina-idle 6s ease-in-out infinite,lina-blink 7s infinite}
        .lina-call-speaking{animation:lina-blink 7s infinite}
        .glow-ring{animation:glow-pulse 2s ease-in-out infinite}
        .ring-ping{animation:ring-expand 1.5s ease-out infinite}
      `}</style>

      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/10"
            style={{
              width: 3 + Math.random() * 4,
              height: 3 + Math.random() * 4,
              left: `${Math.random() * 100}%`,
              bottom: `-10%`,
              animation: `float-particle ${8 + Math.random() * 12}s linear infinite`,
              animationDelay: `${Math.random() * 8}s`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 py-8" style={{ minHeight: "80vh" }}>

        {/* Status bar */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-3 w-3 rounded-full ${isActive ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`} />
            <span className="text-white/80 text-sm font-semibold">
              {state === "idle" ? "Ready to call" : state === "connecting" ? "Connecting..." : state === "error" ? "Error" : `${formatTime(elapsed)}`}
            </span>
          </div>
          {isActive && (
            <button onClick={endCall} className="bg-red-500 hover:bg-red-400 text-white px-5 py-2 rounded-full text-sm font-bold transition-all shadow-lg shadow-red-500/30">
              End Call
            </button>
          )}
        </div>

        {/* Lina Avatar Area */}
        <div className="relative mb-8">
          {/* Glow rings when speaking */}
          {isSpeaking && (
            <>
              <div className="absolute inset-0 rounded-full glow-ring" style={{ margin: "-20px" }} />
              <div className="absolute inset-0 rounded-full border-2 border-indigo-400/30 ring-ping" style={{ margin: "-30px" }} />
              <div className="absolute inset-0 rounded-full border border-blue-400/20 ring-ping" style={{ margin: "-50px", animationDelay: "0.5s" }} />
            </>
          )}

          {/* Avatar container */}
          <div
            className="relative overflow-hidden rounded-full shadow-2xl"
            style={{
              width: "clamp(200px, 30vw, 320px)",
              height: "clamp(200px, 30vw, 320px)",
              border: `3px solid ${isSpeaking ? "rgba(99,102,241,0.6)" : "rgba(255,255,255,0.15)"}`,
              transition: "border-color 0.3s",
            }}
          >
            <img
              src="/branding/lina-hero.png"
              alt="Lina AI"
              className={isActive ? (isSpeaking ? "lina-call-speaking" : "lina-call-idle") : ""}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center top",
                transform: isSpeaking
                  ? `scale(${1 + mouthOpen * 0.03}) translateY(${-mouthOpen * 3}px)`
                  : "scale(1)",
                transition: "transform 0.08s ease-out",
              }}
            />

            {/* Mouth overlay — animated based on amplitude */}
            {isSpeaking && (
              <div
                className="absolute left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-b from-rose-900/60 to-rose-950/80"
                style={{
                  bottom: "32%",
                  width: `${18 + mouthOpen * 20}px`,
                  height: `${2 + mouthOpen * 14}px`,
                  transition: "all 0.06s ease-out",
                  filter: "blur(1px)",
                }}
              />
            )}
          </div>

          {/* Name plate */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md rounded-full px-5 py-1.5 border border-white/20">
            <span className="text-white font-bold text-sm">Lina AI</span>
          </div>
        </div>

        {/* Audio equalizer when speaking */}
        {isSpeaking && (
          <div className="flex items-end justify-center gap-1 mb-4 h-8">
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-indigo-400 rounded-full"
                style={{
                  // @ts-ignore
                  "--h": `${8 + Math.random() * 24}px`,
                  height: `${4 + mouthOpen * 20 + Math.random() * 8}px`,
                  animation: `wave-eq ${0.3 + Math.random() * 0.4}s ease-in-out infinite`,
                  animationDelay: `${i * 0.05}s`,
                  transition: "height 0.1s",
                }}
              />
            ))}
          </div>
        )}

        {/* State indicator */}
        <div className="text-center mb-6">
          {state === "listening" && (
            <div className="flex items-center gap-2 text-emerald-300 text-sm font-semibold">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Listening...
            </div>
          )}
          {state === "speaking" && (
            <div className="flex items-center gap-2 text-indigo-300 text-sm font-semibold">
              <div className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
              Lina is speaking...
            </div>
          )}
          {state === "thinking" && (
            <div className="flex items-center gap-2 text-amber-300 text-sm font-semibold">
              <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              Processing...
            </div>
          )}
        </div>

        {/* Live transcript */}
        {isActive && (
          <div
            ref={transcriptRef}
            className="w-full max-w-xl bg-black/30 backdrop-blur-md rounded-2xl border border-white/10 p-4 max-h-48 overflow-y-auto"
          >
            {transcript.length === 0 && !currentText && !userText && (
              <p className="text-white/40 text-sm text-center">Conversation will appear here...</p>
            )}
            {transcript.map((t, i) => (
              <div key={i} className={`mb-2 ${t.role === "user" ? "text-right" : ""}`}>
                <span className={`inline-block px-3 py-1.5 rounded-2xl text-sm max-w-[80%] ${
                  t.role === "user"
                    ? "bg-white/15 text-white/90 rounded-br-sm"
                    : "bg-indigo-500/30 text-white rounded-bl-sm"
                }`}>
                  {t.role === "lina" && <span className="text-indigo-300 font-bold mr-1">Lina:</span>}
                  {t.text}
                </span>
              </div>
            ))}
            {currentText && (
              <div className="mb-2">
                <span className="inline-block px-3 py-1.5 rounded-2xl rounded-bl-sm text-sm bg-indigo-500/30 text-white/80">
                  <span className="text-indigo-300 font-bold mr-1">Lina:</span>{currentText}
                </span>
              </div>
            )}
            {userText && (
              <div className="mb-2 text-right">
                <span className="inline-block px-3 py-1.5 rounded-2xl rounded-br-sm text-sm bg-white/15 text-white/60 italic">
                  {userText}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Start button */}
        {state === "idle" && (
          <button
            onClick={startCall}
            className="group mt-8 relative overflow-hidden bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-400 hover:to-blue-400 text-white px-10 py-4 rounded-full text-lg font-bold shadow-2xl shadow-indigo-500/30 transition-all duration-300 hover:scale-105 hover:shadow-indigo-500/50"
          >
            <span className="relative z-10 flex items-center gap-3">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
              Start Video Call with Lina
            </span>
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </button>
        )}

        {/* Error */}
        {state === "error" && (
          <div className="mt-6 text-center">
            <p className="text-red-300 mb-4">{error || "Something went wrong"}</p>
            <button onClick={startCall} className="bg-white/10 text-white px-6 py-2 rounded-full font-semibold hover:bg-white/20 transition-all">
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
