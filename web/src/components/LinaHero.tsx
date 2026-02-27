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

  // Cycle messages one at a time
  useEffect(() => {
    // Start after small delay
    const startDelay = setTimeout(() => {
      setCurrentMsg(0);
    }, 800);

    return () => clearTimeout(startDelay);
  }, []);

  useEffect(() => {
    if (currentMsg < 0) return;
    // Auto advance messages
    const duration = currentMsg === MESSAGES.length - 1 ? 5000 : 2800;
    timerRef.current = setTimeout(() => {
      setCurrentMsg((prev) => (prev + 1) % MESSAGES.length);
    }, duration);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [currentMsg]);

  // Play voice on first user interaction
  const playVoice = useCallback(() => {
    if (hasPlayed) return;
    setHasPlayed(true);
    const audio = new Audio("/branding/lina-voice.mp3");
    audioRef.current = audio;
    audio.addEventListener("play", () => setIsSpeaking(true));
    audio.addEventListener("ended", () => setIsSpeaking(false));
    audio.addEventListener("pause", () => setIsSpeaking(false));
    audio.play().catch(() => setIsSpeaking(false));
  }, [hasPlayed]);

  // Try autoplay on mount, fallback to click
  useEffect(() => {
    const audio = new Audio("/branding/lina-voice.mp3");
    audioRef.current = audio;
    audio.addEventListener("play", () => setIsSpeaking(true));
    audio.addEventListener("ended", () => setIsSpeaking(false));
    audio.addEventListener("pause", () => setIsSpeaking(false));
    audio.play().then(() => setHasPlayed(true)).catch(() => {
      // Autoplay blocked, will play on click
    });
    return () => { audio.pause(); audio.remove(); };
  }, []);

  const isLastMsg = currentMsg === MESSAGES.length - 1;

  return (
    <div className="flex-1 hidden md:flex items-end justify-center pr-4">
      <style>{`
        @keyframes lina-float { 0% { transform: translateY(0px) scale(1); } 50% { transform: translateY(-10px) scale(1.015); } 100% { transform: translateY(0px) scale(1); } }
        @keyframes lina-glow { 0% { filter: drop-shadow(0 20px 40px rgba(43,107,255,0.25)); } 50% { filter: drop-shadow(0 28px 55px rgba(43,107,255,0.45)); } 100% { filter: drop-shadow(0 20px 40px rgba(43,107,255,0.25)); } }
        .lina-hero-animated { animation: lina-float 4.5s ease-in-out infinite, lina-glow 4.5s ease-in-out infinite; }
        .lina-hero-animated:hover { animation-play-state: paused; transform: scale(1.06); filter: drop-shadow(0 30px 60px rgba(43,107,255,0.5)); transition: transform 0.3s ease, filter 0.3s ease; }
        @keyframes bubble-fade { 0% { opacity: 0; transform: translateY(8px) scale(0.96); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
        .lina-speech-bubble { animation: bubble-fade 0.4s ease-out both; }
        @keyframes mouth-talk { 0% { clip-path: inset(0 0 0 0); } 15% { clip-path: inset(0 0 2px 0); } 30% { clip-path: inset(0 0 0 0); } 45% { clip-path: inset(0 0 3px 0); } 60% { clip-path: inset(0 0 0 0); } 75% { clip-path: inset(0 0 1px 0); } 100% { clip-path: inset(0 0 0 0); } }
        .lina-talking { animation: lina-talk-bounce 0.3s ease-in-out infinite alternate; }
        @keyframes lina-talk-bounce { 0% { transform: translateY(0px) scale(1); } 100% { transform: translateY(-2px) scale(1.008); } }
      `}</style>
      <div className="relative flex flex-col items-center">
        {/* Single speech bubble */}
        {currentMsg >= 0 && (
          <div
            className="absolute right-0 z-20"
            style={{ top: "-10px", transform: "translateX(30px) translateY(-100%)", width: "280px" }}
          >
            {isLastMsg ? (
              <Link href="/chat" className="group" onClick={playVoice}>
                <div
                  key={currentMsg}
                  className="lina-speech-bubble bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-400 hover:to-blue-400 rounded-2xl rounded-br-sm px-4 py-3 shadow-xl transition-all duration-300 cursor-pointer hover:scale-[1.02]"
                >
                  <p className="text-sm text-white font-bold flex items-center gap-2">
                    {MESSAGES[currentMsg]}
                    <svg className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </p>
                </div>
              </Link>
            ) : (
              <div
                key={currentMsg}
                className="lina-speech-bubble bg-white/95 backdrop-blur-sm rounded-2xl rounded-br-sm px-4 py-3 shadow-xl border border-white/20 cursor-pointer"
                onClick={playVoice}
              >
                <p className="text-sm text-slate-800 font-medium">{MESSAGES[currentMsg]}</p>
              </div>
            )}
            {/* Triangle pointer */}
            <div
              className="absolute -bottom-2 right-8 w-4 h-4 rotate-45"
              style={{ background: isLastMsg ? "#6366f1" : "rgba(255,255,255,0.95)" }}
            />
          </div>
        )}
        {/* Lina image */}
        <Link href="/chat" onClick={playVoice}>
          <img
            src="/branding/lina-hero.png"
            alt="Lina AI"
            className={`lina-hero-animated cursor-pointer ${isSpeaking ? "lina-talking" : ""}`}
            style={{
              height: "clamp(340px, 34vw, 500px)",
              objectFit: "contain",
            }}
          />
        </Link>
      </div>
    </div>
  );
}
