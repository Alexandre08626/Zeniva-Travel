"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

const MESSAGES = [
  { text: "Hey! 👋 I'm Lina, your AI travel concierge.", audio: "/branding/lina-v1.mp3" },
  { text: "Tell me your dream destination and I'll plan everything for you ✈️", audio: "/branding/lina-v2.mp3" },
  { text: "Click on me to start! 🌍", audio: "/branding/lina-v3.mp3" },
];

export default function LinaHero() {
  const [currentMsg, setCurrentMsg] = useState(-1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [started, setStarted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Start sequence on first user interaction
  useEffect(() => {
    let done = false;
    const start = () => {
      if (done) return;
      done = true;
      setStarted(true);
      events.forEach(e => document.removeEventListener(e, start, true));
    };
    const events = ["click", "touchstart", "scroll", "mousemove", "keydown"];
    events.forEach(e => document.addEventListener(e, start, { capture: true, passive: true }));
    // Also try auto-start after 1s
    const t = setTimeout(start, 1000);
    return () => { clearTimeout(t); events.forEach(e => document.removeEventListener(e, start, true)); };
  }, []);

  // Play messages in sequence: show bubble → play audio → wait for audio end → next
  useEffect(() => {
    if (!started) return;
    let cancelled = false;

    const playMsg = (index: number) => {
      if (cancelled || index >= MESSAGES.length) {
        // Loop back after a pause
        if (!cancelled) {
          setTimeout(() => { if (!cancelled) playMsg(0); }, 3000);
        }
        return;
      }

      setCurrentMsg(index);
      setIsSpeaking(true);

      const audio = new Audio(MESSAGES[index].audio);
      audioRef.current = audio;
      audio.volume = 0.85;

      audio.addEventListener("ended", () => {
        setIsSpeaking(false);
        // Small pause between messages
        setTimeout(() => { if (!cancelled) playMsg(index + 1); }, 600);
      });

      audio.addEventListener("error", () => {
        setIsSpeaking(false);
        setTimeout(() => { if (!cancelled) playMsg(index + 1); }, 1500);
      });

      audio.play().catch(() => {
        // Audio blocked — still show text, advance after delay
        setIsSpeaking(false);
        setTimeout(() => { if (!cancelled) playMsg(index + 1); }, 2500);
      });
    };

    // Small initial delay
    const t = setTimeout(() => playMsg(0), 400);
    return () => { cancelled = true; clearTimeout(t); if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; } };
  }, [started]);

  const isLastMsg = currentMsg === MESSAGES.length - 1;

  return (
    <div className="flex-1 hidden md:flex items-end justify-center pr-4">
      <style>{`
        @keyframes lina-float{0%{transform:translateY(0) scale(1)}50%{transform:translateY(-10px) scale(1.015)}100%{transform:translateY(0) scale(1)}}
        @keyframes lina-glow{0%{filter:drop-shadow(0 20px 40px rgba(43,107,255,.25))}50%{filter:drop-shadow(0 28px 55px rgba(43,107,255,.45))}100%{filter:drop-shadow(0 20px 40px rgba(43,107,255,.25))}}
        .lina-hero-animated{animation:lina-float 4.5s ease-in-out infinite,lina-glow 4.5s ease-in-out infinite}
        .lina-hero-animated:hover{animation-play-state:paused;transform:scale(1.06);filter:drop-shadow(0 30px 60px rgba(43,107,255,.5));transition:transform .3s,filter .3s}
        @keyframes bfade{0%{opacity:0;transform:translateY(8px) scale(.96)}100%{opacity:1;transform:translateY(0) scale(1)}}
        .lina-speech-bubble{animation:bfade .35s ease-out both}
        .lina-talking{animation:ltalk .2s ease-in-out infinite alternate !important}
        @keyframes ltalk{0%{transform:translateY(0) scale(1)}100%{transform:translateY(-4px) scale(1.012)}}
      `}</style>
      <div className="relative flex flex-col items-center">
        {/* Speech bubble */}
        {currentMsg >= 0 && (
          <div className="absolute right-0 z-20" style={{ top: "20px", transform: "translateX(30px) translateY(-100%)", width: "280px" }}>
            {isLastMsg ? (
              <Link href="/chat" className="group">
                <div key={currentMsg} className="lina-speech-bubble bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-400 hover:to-blue-400 rounded-2xl rounded-br-sm px-4 py-3 shadow-xl cursor-pointer hover:scale-[1.02] transition-all">
                  <p className="text-sm text-white font-bold flex items-center gap-2">
                    {MESSAGES[currentMsg].text}
                    <svg className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
                  </p>
                </div>
              </Link>
            ) : (
              <div key={currentMsg} className="lina-speech-bubble bg-white/95 backdrop-blur-sm rounded-2xl rounded-br-sm px-4 py-3 shadow-xl border border-white/20">
                <p className="text-sm text-slate-800 font-medium">{MESSAGES[currentMsg].text}</p>
              </div>
            )}
            <div className="absolute -bottom-2 right-8 w-4 h-4 rotate-45" style={{ background: isLastMsg ? "#6366f1" : "rgba(255,255,255,0.95)" }} />
          </div>
        )}

        {/* Lina */}
        <Link href="/chat">
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
