"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

const MESSAGES = [
  "Hey! 👋 I'm Lina, your AI travel concierge.",
  "Tell me your dream destination and I'll plan everything for you ✈️",
  "Click on me to start! 🌍",
];

export default function LinaHero() {
  const [currentMsg, setCurrentMsg] = useState(-1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(false);

  // Cycle messages
  useEffect(() => {
    const t = setTimeout(() => setCurrentMsg(0), 800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (currentMsg < 0) return;
    const duration = currentMsg === MESSAGES.length - 1 ? 5000 : 2800;
    timerRef.current = setTimeout(() => {
      setCurrentMsg((prev) => (prev + 1) % MESSAGES.length);
    }, duration);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [currentMsg]);

  const playVoice = useCallback(() => {
    if (hasPlayed || !mountedRef.current) return;
    setHasPlayed(true);
    try {
      const audio = new Audio("/branding/lina-voice.mp3");
      audioRef.current = audio;
      audio.volume = 0.85;
      const onPlay = () => setIsSpeaking(true);
      const onEnd = () => { setIsSpeaking(false); cleanup(); };
      const cleanup = () => {
        audio.removeEventListener("play", onPlay);
        audio.removeEventListener("ended", onEnd);
        audio.removeEventListener("pause", onEnd);
        audio.removeEventListener("error", onEnd);
      };
      audio.addEventListener("play", onPlay);
      audio.addEventListener("ended", onEnd);
      audio.addEventListener("pause", onEnd);
      audio.addEventListener("error", onEnd);
      audio.play().catch(() => { setIsSpeaking(false); setHasPlayed(false); });
    } catch { setHasPlayed(false); }
  }, [hasPlayed]);

  // Play on ANY first user interaction with the page
  useEffect(() => {
    mountedRef.current = true;
    const events = ["click", "touchstart", "scroll", "mousemove", "keydown"];
    let played = false;
    const handler = () => {
      if (played) return;
      played = true;
      // Small delay so the interaction registers first
      setTimeout(() => playVoice(), 300);
      events.forEach(e => document.removeEventListener(e, handler, true));
    };
    events.forEach(e => document.addEventListener(e, handler, { capture: true, once: false, passive: true }));
    // Also try autoplay immediately
    const audio = new Audio("/branding/lina-voice.mp3");
    audio.volume = 0.85;
    audio.play().then(() => {
      played = true;
      setHasPlayed(true);
      audioRef.current = audio;
      setIsSpeaking(true);
      audio.addEventListener("ended", () => setIsSpeaking(false));
      audio.addEventListener("pause", () => setIsSpeaking(false));
      events.forEach(e => document.removeEventListener(e, handler, true));
    }).catch(() => { /* blocked, wait for interaction */ });
    return () => {
      mountedRef.current = false;
      events.forEach(e => document.removeEventListener(e, handler, true));
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isLastMsg = currentMsg === MESSAGES.length - 1;

  return (
    <div className="flex-1 hidden md:flex items-end justify-center pr-4">
      <style>{`
        @keyframes lina-float { 0%{transform:translateY(0) scale(1)} 50%{transform:translateY(-10px) scale(1.015)} 100%{transform:translateY(0) scale(1)} }
        @keyframes lina-glow { 0%{filter:drop-shadow(0 20px 40px rgba(43,107,255,.25))} 50%{filter:drop-shadow(0 28px 55px rgba(43,107,255,.45))} 100%{filter:drop-shadow(0 20px 40px rgba(43,107,255,.25))} }
        .lina-hero-animated { animation: lina-float 4.5s ease-in-out infinite, lina-glow 4.5s ease-in-out infinite; }
        .lina-hero-animated:hover { animation-play-state:paused; transform:scale(1.06); filter:drop-shadow(0 30px 60px rgba(43,107,255,.5)); transition:transform .3s,filter .3s; }
        @keyframes bfade { 0%{opacity:0;transform:translateY(8px) scale(.96)} 100%{opacity:1;transform:translateY(0) scale(1)} }
        .lina-speech-bubble { animation: bfade .4s ease-out both; }
        .lina-talking { animation: lina-talk .25s ease-in-out infinite alternate !important; }
        @keyframes lina-talk { 0%{transform:translateY(0) scale(1)} 100%{transform:translateY(-3px) scale(1.01)} }
        @keyframes sound-ring { 0%{box-shadow:0 0 0 0 rgba(99,102,241,.6)} 70%{box-shadow:0 0 0 12px rgba(99,102,241,0)} 100%{box-shadow:0 0 0 0 rgba(99,102,241,0)} }
        .sound-btn-pulse { animation: sound-ring 1.8s ease-out infinite; }
      `}</style>
      <div className="relative flex flex-col items-center">
        {/* Speech bubble — one at a time */}
        {currentMsg >= 0 && (
          <div className="absolute right-0 z-20" style={{ top: "20px", transform: "translateX(30px) translateY(-100%)", width: "280px" }}>
            {isLastMsg ? (
              <Link href="/chat" className="group">
                <div key={currentMsg} className="lina-speech-bubble bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-400 hover:to-blue-400 rounded-2xl rounded-br-sm px-4 py-3 shadow-xl transition-all cursor-pointer hover:scale-[1.02]">
                  <p className="text-sm text-white font-bold flex items-center gap-2">
                    {MESSAGES[currentMsg]}
                    <svg className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
                  </p>
                </div>
              </Link>
            ) : (
              <div key={currentMsg} className="lina-speech-bubble bg-white/95 backdrop-blur-sm rounded-2xl rounded-br-sm px-4 py-3 shadow-xl border border-white/20">
                <p className="text-sm text-slate-800 font-medium">{MESSAGES[currentMsg]}</p>
              </div>
            )}
            <div className="absolute -bottom-2 right-8 w-4 h-4 rotate-45" style={{ background: isLastMsg ? "#6366f1" : "rgba(255,255,255,0.95)" }} />
          </div>
        )}

        {/* Sound button if voice hasn't played yet */}
        {!hasPlayed && (
          <button
            onClick={playVoice}
            className="absolute -top-2 left-1/2 -translate-x-1/2 z-30 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg border border-white/30 flex items-center gap-2 text-xs font-bold text-indigo-600 hover:bg-white transition-all sound-btn-pulse"
          >
            🔊 Listen to Lina
          </button>
        )}

        {/* Lina image */}
        <Link href="/chat" onClick={playVoice}>
          <img
            src="/branding/lina-hero.png"
            alt="Lina AI"
            className={`cursor-pointer ${isSpeaking ? "lina-talking" : "lina-hero-animated"}`}
            style={{ height: "clamp(340px, 34vw, 500px)", objectFit: "contain" }}
          />
        </Link>
      </div>
    </div>
  );
}
