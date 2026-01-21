"use client";
import React from "react";
import { useRouter } from "next/navigation";

export default function LinaWidget({ size = 280 }: { size?: number }) {
  const router = useRouter();

  const handleClick = () => {
    router.push('/chat');
  };

  return (
    <div className="relative inline-block">
      <style>{`
        .lina-widget { display: inline-block; cursor: pointer; }
        .lina-avatar { border-radius: 9999px; overflow: hidden; display:block; }
        .lina-frame { transition: transform 180ms ease, box-shadow 180ms ease; }
        .lina-widget:hover .lina-frame { transform: scale(1.02); box-shadow: 0 18px 40px rgba(2,6,23,0.18); }

        /* Subtle breathing & blink */
        @keyframes lina-breathe { 0% { transform: scale(1); } 50% { transform: scale(1.02); } 100% { transform: scale(1); } }
        @keyframes lina-blink { 0%, 92%, 100% { filter: none; } 94%, 96% { filter: brightness(0.6); } }
        .lina-animated { animation: lina-breathe 4.8s ease-in-out infinite; }
        .lina-blink { animation: lina-blink 7s infinite; }

        .lina-bubble { position: absolute; right: -160px; bottom: -28px; background: linear-gradient(90deg,#0B57FF 0%, #4DA1FF 100%); color: white; padding: 14px 18px; border-radius: 999px; box-shadow: 0 18px 40px rgba(2,6,23,0.18); font-weight:700; font-size:15px; display:flex; align-items:center; gap:10px; border: none; animation: lina-bubble-pulse 3.2s ease-in-out infinite; }
        .lina-bubble:active { transform: translateY(1px); }
        .lina-bubble::after { content: ""; position: absolute; right: 28px; bottom: -8px; width: 12px; height: 12px; background: linear-gradient(90deg,#0B57FF 0%, #4DA1FF 100%); transform: rotate(45deg); border-radius: 2px; box-shadow: 0 6px 12px rgba(2,6,23,0.12); }
        .lina-bubble .msg-icon { width:16px; height:16px; display:inline-block; }
        @keyframes lina-bubble-pulse { 0% { transform: translateY(0) scale(1); box-shadow: 0 18px 40px rgba(2,6,23,0.18); } 50% { transform: translateY(-2px) scale(1.02); box-shadow: 0 22px 48px rgba(2,6,23,0.22); } 100% { transform: translateY(0) scale(1); box-shadow: 0 18px 40px rgba(2,6,23,0.18); } }

      `}</style>

      <div className="lina-widget" role="button" onClick={handleClick} onKeyDown={(e) => e.key === 'Enter' && handleClick()} tabIndex={0} aria-label="Start chat with Lina">
        <div className="lina-frame lina-animated" style={{ width: size, height: size, borderRadius: 9999 }}>
          <img src="/branding/lina-avatar.png" alt="Lina" className="lina-avatar lina-blink" style={{ width: '100%', height: '100%', objectFit: 'cover', boxShadow: '0 8px 30px rgba(2,6,23,0.12)' }} />
        </div>

        <div className="lina-bubble" style={{ right: -160, bottom: -28 }}>
          <svg className="msg-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M4 5h16a1 1 0 0 1 1 1v9.5a1 1 0 0 1-1 1H8.8L4 21V6a1 1 0 0 1 1-1Z" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 10h8M8 13h5" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
          <span style={{ fontSize: 15, fontWeight: 700 }}>Tap Lina’s face to start planning your trip with Lina AI</span>
        </div>
      </div>
    </div>
  );
}
