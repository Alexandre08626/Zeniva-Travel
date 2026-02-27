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
  const [mouthFrame, setMouthFrame] = useState(0);

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
  const mouthTimerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const currentTextRef = useRef("");

  useEffect(() => { currentTextRef.current = currentText; }, [currentText]);

  // Timer
  useEffect(() => {
    if (["connected", "speaking", "listening", "thinking"].includes(state)) {
      timerRef.current = setInterval(() => setElapsed(p => p + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [state]);

  // Scroll transcript
  useEffect(() => {
    if (transcriptRef.current) transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
  }, [transcript, currentText, userText]);

  // Mouth frame cycling when speaking
  useEffect(() => {
    if (state === "speaking") {
      let frame = 0;
      mouthTimerRef.current = setInterval(() => {
        frame = (frame + 1) % 4;
        setMouthFrame(frame);
      }, 120);
    } else {
      setMouthFrame(0);
    }
    return () => { if (mouthTimerRef.current) clearInterval(mouthTimerRef.current); };
  }, [state]);

  // Amplitude monitoring
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

  // Play queued audio
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
          case "error":
            console.error("Realtime error:", msg.error);
            break;
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
  const mo = Math.min(amplitude * 8, 1); // mouth openness
  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  // Mouth shapes based on frame + amplitude
  const mouthShapes = [
    { w: 22, h: 3 + mo * 4, ry: 40 },   // closed / barely open
    { w: 20 + mo * 8, h: 6 + mo * 12, ry: 50 },  // open round
    { w: 28 + mo * 6, h: 3 + mo * 8, ry: 30 },   // wide
    { w: 18 + mo * 5, h: 8 + mo * 14, ry: 50 },  // tall open
  ];
  const mouth = mouthShapes[mouthFrame] || mouthShapes[0];

  return (
    <div className="relative w-full overflow-hidden rounded-3xl" style={{ background: "linear-gradient(135deg, #081A4A 0%, #0F3A8A 40%, #2B6BFF 100%)", minHeight: "80vh" }}>
      <style>{`
        /* === IDLE: Rich organic movement like a Pixar character waiting === */
        @keyframes idle-breathe {
          0%,100% { transform: scaleY(1) scaleX(1); }
          40% { transform: scaleY(1.012) scaleX(0.997); }
          70% { transform: scaleY(0.998) scaleX(1.003); }
        }
        @keyframes idle-sway {
          0%,100% { transform: translateX(0) rotate(0deg); }
          20% { transform: translateX(3px) rotate(0.4deg); }
          50% { transform: translateX(-2px) rotate(-0.3deg); }
          80% { transform: translateX(1px) rotate(0.2deg); }
        }
        @keyframes idle-head-tilt {
          0%,100% { transform: rotate(0deg) translateY(0); }
          15% { transform: rotate(0.8deg) translateY(-2px); }
          35% { transform: rotate(-0.5deg) translateY(1px); }
          55% { transform: rotate(0.3deg) translateY(-3px); }
          75% { transform: rotate(-0.7deg) translateY(0px); }
        }
        @keyframes idle-blink {
          0%,100% { clip-path: inset(0 0 0 0); }
          49% { clip-path: inset(0 0 0 0); }
          50% { clip-path: inset(42% 25% 48% 25%); }
          52% { clip-path: inset(0 0 0 0); }
          88% { clip-path: inset(0 0 0 0); }
          89% { clip-path: inset(42% 25% 48% 25%); }
          90.5% { clip-path: inset(0 0 0 0); }
        }
        @keyframes idle-float {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes idle-glow {
          0%,100% { filter: drop-shadow(0 15px 30px rgba(43,107,255,0.2)) brightness(1); }
          50% { filter: drop-shadow(0 20px 45px rgba(43,107,255,0.35)) brightness(1.03); }
        }

        /* === SPEAKING: Energetic, expressive like talking in a movie === */
        @keyframes speak-bounce {
          0%,100% { transform: translateY(0) scale(1); }
          25% { transform: translateY(-5px) scale(1.008); }
          50% { transform: translateY(-2px) scale(0.998); }
          75% { transform: translateY(-7px) scale(1.005); }
        }
        @keyframes speak-lean {
          0%,100% { transform: rotate(0deg); }
          30% { transform: rotate(1.2deg); }
          60% { transform: rotate(-0.8deg); }
        }
        @keyframes speak-gesture {
          0%,100% { transform: translateX(0) scaleX(1); }
          25% { transform: translateX(4px) scaleX(1.005); }
          75% { transform: translateX(-3px) scaleX(0.998); }
        }

        /* === LISTENING: Attentive, slight nods === */
        @keyframes listen-nod {
          0%,100% { transform: translateY(0) rotate(0deg); }
          30% { transform: translateY(3px) rotate(0.5deg); }
          60% { transform: translateY(1px) rotate(-0.3deg); }
          80% { transform: translateY(4px) rotate(0.3deg); }
        }
        @keyframes listen-lean-in {
          0%,100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.01) translateY(-2px); }
        }

        /* === GLOW RINGS === */
        @keyframes glow-ring { 0%,100%{box-shadow:0 0 40px rgba(99,102,241,0.3)} 50%{box-shadow:0 0 80px rgba(99,102,241,0.6),0 0 150px rgba(43,107,255,0.15)} }
        @keyframes ring-out { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(1.8);opacity:0} }
        @keyframes eq-bar { 0%,100%{height:3px} 50%{height:var(--h)} }
        @keyframes float-p { 0%{transform:translateY(0) translateX(0);opacity:0} 15%{opacity:0.5} 85%{opacity:0.2} 100%{transform:translateY(-250px) translateX(30px);opacity:0} }

        .avatar-container { position: relative; }
        .avatar-layer-breathe { animation: idle-breathe 4s ease-in-out infinite; transform-origin: center bottom; }
        .avatar-layer-sway { animation: idle-sway 7s ease-in-out infinite; transform-origin: center bottom; }
        .avatar-layer-head { animation: idle-head-tilt 8s ease-in-out infinite; transform-origin: center 60%; }
        .avatar-layer-blink { animation: idle-blink 6s step-end infinite; }
        .avatar-layer-float { animation: idle-float 5s ease-in-out infinite; }
        .avatar-layer-glow { animation: idle-glow 4s ease-in-out infinite; }

        .avatar-speaking .avatar-layer-sway { animation: speak-gesture 1.2s ease-in-out infinite; }
        .avatar-speaking .avatar-layer-head { animation: speak-lean 1.8s ease-in-out infinite; }
        .avatar-speaking .avatar-layer-float { animation: speak-bounce 0.8s ease-in-out infinite; }

        .avatar-listening .avatar-layer-head { animation: listen-nod 3s ease-in-out infinite; }
        .avatar-listening .avatar-layer-float { animation: listen-lean-in 4s ease-in-out infinite; }
      `}</style>

      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white/10"
            style={{ width: 2 + Math.random() * 5, height: 2 + Math.random() * 5, left: `${Math.random() * 100}%`, bottom: "-5%",
              animation: `float-p ${7 + Math.random() * 15}s linear infinite`, animationDelay: `${Math.random() * 10}s` }} />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center px-6 py-8" style={{ minHeight: "80vh" }}>
        {/* Status bar */}
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

        {/* ============ LINA ANIMATED AVATAR ============ */}
        <div className={`avatar-container mb-6 ${isSpeaking ? "avatar-speaking" : isListening ? "avatar-listening" : ""}`}>
          {/* Glow rings when speaking */}
          {isSpeaking && (
            <>
              <div className="absolute inset-0 rounded-full" style={{ margin: "-25px", animation: "glow-ring 2s ease-in-out infinite" }} />
              <div className="absolute inset-0 rounded-full border-2 border-indigo-400/30" style={{ margin: "-35px", animation: "ring-out 2s ease-out infinite" }} />
              <div className="absolute inset-0 rounded-full border border-blue-400/20" style={{ margin: "-55px", animation: "ring-out 2s ease-out infinite 0.7s" }} />
            </>
          )}

          {/* Layered animation system — each layer adds organic movement */}
          <div className="avatar-layer-float">
            <div className="avatar-layer-glow">
              <div className="avatar-layer-sway">
                <div className="avatar-layer-breathe">
                  <div className="avatar-layer-head">
                    <div className="avatar-layer-blink">
                      <div
                        className="relative overflow-hidden rounded-full shadow-2xl"
                        style={{
                          width: "clamp(220px, 30vw, 340px)",
                          height: "clamp(220px, 30vw, 340px)",
                          border: `3px solid ${isSpeaking ? "rgba(99,102,241,0.6)" : isListening ? "rgba(52,211,153,0.4)" : "rgba(255,255,255,0.15)"}`,
                          transition: "border-color 0.5s",
                        }}
                      >
                        <img
                          src="/branding/lina-hero.png"
                          alt="Lina AI"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            objectPosition: "center 15%",
                          }}
                        />

                        {/* Animated mouth overlay */}
                        {isSpeaking && (
                          <svg
                            className="absolute left-1/2 -translate-x-1/2"
                            style={{ bottom: "30%", width: "60px", height: "40px" }}
                            viewBox="0 0 60 40"
                          >
                            <ellipse
                              cx="30" cy="20"
                              rx={mouth.w / 2}
                              ry={mouth.h / 2}
                              fill="rgba(30,10,10,0.7)"
                              style={{ transition: "all 0.08s ease-out" }}
                            />
                            {/* Teeth hint for wide open */}
                            {mouth.h > 12 && (
                              <rect x={30 - mouth.w / 3} y={20 - mouth.h / 4} width={mouth.w / 1.5} height={2.5} rx="1" fill="rgba(255,255,255,0.5)" />
                            )}
                          </svg>
                        )}

                        {/* Subtle smile line when idle/listening */}
                        {!isSpeaking && isActive && (
                          <svg className="absolute left-1/2 -translate-x-1/2" style={{ bottom: "31%", width: "40px", height: "20px" }} viewBox="0 0 40 20">
                            <path d="M10 8 Q20 16 30 8" stroke="rgba(30,10,10,0.3)" strokeWidth="2" fill="none" strokeLinecap="round" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Name */}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md rounded-full px-5 py-1.5 border border-white/20 whitespace-nowrap">
            <span className="text-white font-bold text-sm">Lina AI</span>
          </div>
        </div>

        {/* Audio equalizer */}
        {isSpeaking && (
          <div className="flex items-end justify-center gap-1 mb-4 h-8">
            {[...Array(11)].map((_, i) => (
              <div key={i} className="w-1 bg-indigo-400/80 rounded-full"
                style={{
                  // @ts-ignore
                  "--h": `${6 + Math.random() * 28}px`,
                  height: `${3 + mo * 22 + Math.random() * 6}px`,
                  animation: `eq-bar ${0.25 + Math.random() * 0.35}s ease-in-out infinite`,
                  animationDelay: `${i * 0.04}s`,
                  transition: "height 0.08s",
                }} />
            ))}
          </div>
        )}

        {/* State */}
        <div className="text-center mb-6">
          {isListening && <div className="flex items-center gap-2 text-emerald-300 text-sm font-semibold"><div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"/>Listening...</div>}
          {isSpeaking && <div className="flex items-center gap-2 text-indigo-300 text-sm font-semibold"><div className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse"/>Lina is speaking...</div>}
          {state === "thinking" && <div className="flex items-center gap-2 text-amber-300 text-sm font-semibold"><div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse"/>Processing...</div>}
        </div>

        {/* Transcript */}
        {isActive && (
          <div ref={transcriptRef} className="w-full max-w-xl bg-black/30 backdrop-blur-md rounded-2xl border border-white/10 p-4 max-h-48 overflow-y-auto">
            {transcript.length === 0 && !currentText && !userText && <p className="text-white/40 text-sm text-center">Conversation will appear here...</p>}
            {transcript.map((t, i) => (
              <div key={i} className={`mb-2 ${t.role === "user" ? "text-right" : ""}`}>
                <span className={`inline-block px-3 py-1.5 rounded-2xl text-sm max-w-[80%] ${t.role === "user" ? "bg-white/15 text-white/90 rounded-br-sm" : "bg-indigo-500/30 text-white rounded-bl-sm"}`}>
                  {t.role === "lina" && <span className="text-indigo-300 font-bold mr-1">Lina:</span>}{t.text}
                </span>
              </div>
            ))}
            {currentText && <div className="mb-2"><span className="inline-block px-3 py-1.5 rounded-2xl rounded-bl-sm text-sm bg-indigo-500/30 text-white/80"><span className="text-indigo-300 font-bold mr-1">Lina:</span>{currentText}</span></div>}
            {userText && <div className="mb-2 text-right"><span className="inline-block px-3 py-1.5 rounded-2xl rounded-br-sm text-sm bg-white/15 text-white/60 italic">{userText}</span></div>}
          </div>
        )}

        {/* Start button */}
        {state === "idle" && (
          <button onClick={startCall}
            className="group mt-8 relative overflow-hidden bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-400 hover:to-blue-400 text-white px-10 py-4 rounded-full text-lg font-bold shadow-2xl shadow-indigo-500/30 transition-all duration-300 hover:scale-105 hover:shadow-indigo-500/50">
            <span className="relative z-10 flex items-center gap-3">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
              Start Video Call with Lina
            </span>
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"/>
          </button>
        )}

        {state === "error" && (
          <div className="mt-6 text-center">
            <p className="text-red-300 mb-4">{error || "Something went wrong"}</p>
            <button onClick={startCall} className="bg-white/10 text-white px-6 py-2 rounded-full font-semibold hover:bg-white/20 transition-all">Try Again</button>
          </div>
        )}
      </div>
    </div>
  );
}
