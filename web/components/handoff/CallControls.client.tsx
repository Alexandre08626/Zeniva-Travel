"use client";
import type { CallQuality, CallState } from "../../src/lib/call/types";
import { getHandoffDict, type HandoffLocale } from "./handoffDict";

const STATUS_DOT: Record<CallState, string> = {
  idle: "bg-slate-400",
  joining: "bg-amber-400 animate-pulse",
  waiting_peer: "bg-amber-400 animate-pulse",
  connecting: "bg-amber-400 animate-pulse",
  connected: "bg-emerald-500",
  reconnecting: "bg-amber-500 animate-pulse",
  ended: "bg-slate-400",
  failed: "bg-rose-500",
};

export function StatusBadge({ state, locale, durationSec }: { state: CallState; locale: HandoffLocale; durationSec?: number }) {
  const dict = getHandoffDict(locale);
  const label =
    state === "connected"
      ? dict.inCallStatus.connected
      : state === "reconnecting"
      ? dict.inCallStatus.reconnecting
      : state === "failed"
      ? dict.inCallStatus.failed
      : dict.inCallStatus.connecting;
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-black/40 backdrop-blur border border-white/15 px-3 py-1.5 text-xs font-bold text-white">
      <span className={`inline-block w-2 h-2 rounded-full ${STATUS_DOT[state]}`} />
      <span>{label}</span>
      {typeof durationSec === "number" && state === "connected" ? (
        <span className="font-mono opacity-80">· {formatDuration(durationSec)}</span>
      ) : null}
    </div>
  );
}

export function QualityBars({ quality }: { quality: CallQuality }) {
  const bars = [1, 2, 3] as const;
  return (
    <div className="inline-flex items-end gap-0.5 h-4" aria-label={`Quality level ${quality.level}/3`}>
      {bars.map((b) => {
        const active = quality.level >= b;
        const color = quality.level === 1 ? "bg-rose-400" : quality.level === 2 ? "bg-amber-400" : "bg-emerald-400";
        return (
          <span
            key={b}
            className={`w-1.5 rounded-sm transition ${active ? color : "bg-white/25"}`}
            style={{ height: `${b * 5 + 2}px` }}
          />
        );
      })}
    </div>
  );
}

export function CallControls({
  cameraEnabled,
  microphoneEnabled,
  onToggleCamera,
  onToggleMicrophone,
  onHangUp,
  locale,
}: {
  cameraEnabled: boolean;
  microphoneEnabled: boolean;
  onToggleCamera: () => void;
  onToggleMicrophone: () => void;
  onHangUp: () => void;
  locale: HandoffLocale;
}) {
  const dict = getHandoffDict(locale);
  return (
    <div className="flex items-center justify-center gap-3">
      <ControlButton
        active={microphoneEnabled}
        onClick={onToggleMicrophone}
        labelOn="🎤"
        labelOff="🚫"
        aria={microphoneEnabled ? dict.micOn : dict.micOff}
      />
      <ControlButton
        active={cameraEnabled}
        onClick={onToggleCamera}
        labelOn="📹"
        labelOff="🚫"
        aria={cameraEnabled ? dict.cameraOn : dict.cameraOff}
      />
      <button
        type="button"
        onClick={onHangUp}
        className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xl shadow-lg transition active:scale-95"
        aria-label={dict.hangUp}
        title={dict.hangUp}
      >
        📞
      </button>
    </div>
  );
}

function ControlButton({
  active,
  onClick,
  labelOn,
  labelOff,
  aria,
}: {
  active: boolean;
  onClick: () => void;
  labelOn: string;
  labelOff: string;
  aria: string;
}) {
  return (
    <button
      type="button"
      aria-label={aria}
      title={aria}
      onClick={onClick}
      className={`inline-flex items-center justify-center w-12 h-12 rounded-full transition active:scale-95 ${
        active ? "bg-white/15 hover:bg-white/25 text-white" : "bg-rose-600/90 hover:bg-rose-700 text-white"
      }`}
    >
      <span className="text-xl">{active ? labelOn : labelOff}</span>
    </button>
  );
}

function formatDuration(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export { formatDuration };
