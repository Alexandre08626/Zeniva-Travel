"use client";
import { useEffect, useRef, useState } from "react";
import { enumerateAvDevices, type DeviceList } from "../../src/lib/call/types";
import { getHandoffDict, type HandoffLocale } from "./handoffDict";

const GOLD_GRADIENT = "linear-gradient(135deg, #E6B85A, #C9941F)";

export interface PreCallScreenProps {
  locale: HandoffLocale;
  /** Headline override (e.g. "Get ready to talk to Sofia"). */
  title?: string;
  /** Sub-headline override. */
  subtitle?: string;
  /** Right-side panel (cart preview for client, request preview for agent). */
  rightPanel?: React.ReactNode;
  /** Disable the join button until external state is ready. */
  joinDisabled?: boolean;
  /** Override join button label (e.g. "Accept call"). */
  joinLabel?: string;
  onJoin: (params: { video: boolean; cameraDeviceId?: string; microphoneDeviceId?: string }) => void;
}

/**
 * Pre-call screen: live camera preview, live audio level meter, device
 * pickers, and a "Join the call" CTA. Used by both client and agent rooms.
 */
export default function PreCallScreen({
  locale,
  title,
  subtitle,
  rightPanel,
  joinDisabled,
  joinLabel,
  onJoin,
}: PreCallScreenProps) {
  const dict = getHandoffDict(locale);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const meterFrameRef = useRef<number | null>(null);
  const previewStreamRef = useRef<MediaStream | null>(null);

  const [devices, setDevices] = useState<DeviceList>({ cameras: [], microphones: [] });
  const [cameraDeviceId, setCameraDeviceId] = useState<string | undefined>(undefined);
  const [microphoneDeviceId, setMicrophoneDeviceId] = useState<string | undefined>(undefined);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(true);
  const [audioLevel, setAudioLevel] = useState(0);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // Acquire preview stream + populate device list.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: microphoneDeviceId ? { deviceId: { exact: microphoneDeviceId } } : true,
          video: cameraEnabled
            ? cameraDeviceId
              ? { deviceId: { exact: cameraDeviceId } }
              : { width: { ideal: 1280 }, height: { ideal: 720 } }
            : false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        previewStreamRef.current?.getTracks().forEach((t) => t.stop());
        previewStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => undefined);
        }
        setupAudioMeter(stream);
        const enumerated = await enumerateAvDevices();
        if (!cancelled) setDevices(enumerated);
      } catch (err: any) {
        if (!cancelled) setPermissionError(err?.message || dict.permissionDenied);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraDeviceId, microphoneDeviceId, cameraEnabled]);

  // Toggle local mic mute on the preview stream.
  useEffect(() => {
    const t = previewStreamRef.current?.getAudioTracks()[0];
    if (t) t.enabled = microphoneEnabled;
  }, [microphoneEnabled]);

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      previewStreamRef.current?.getTracks().forEach((t) => t.stop());
      previewStreamRef.current = null;
      if (meterFrameRef.current) cancelAnimationFrame(meterFrameRef.current);
      audioCtxRef.current?.close().catch(() => undefined);
    };
  }, []);

  function setupAudioMeter(stream: MediaStream) {
    try {
      audioCtxRef.current?.close().catch(() => undefined);
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      const buffer = new Uint8Array(analyser.frequencyBinCount);
      src.connect(analyser);
      const tick = () => {
        analyser.getByteFrequencyData(buffer);
        let sum = 0;
        for (const v of buffer) sum += v;
        const avg = sum / buffer.length / 255;
        setAudioLevel(avg);
        meterFrameRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      /* meter is best-effort */
    }
  }

  const join = () => {
    onJoin({
      video: cameraEnabled,
      cameraDeviceId,
      microphoneDeviceId,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
        <header className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-black mb-2">{title || dict.preCallTitle}</h1>
          <p className="text-white/70">{subtitle || dict.preCallSub}</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          {/* Camera preview + controls */}
          <div className="space-y-4">
            <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-900 shadow-2xl border border-white/10">
              {permissionError ? (
                <div className="absolute inset-0 flex items-center justify-center text-center px-6">
                  <p className="text-rose-300 font-semibold">{permissionError}</p>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    muted
                    playsInline
                    className={`w-full h-full object-cover ${cameraEnabled ? "" : "opacity-0"}`}
                  />
                  {!cameraEnabled ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl mb-3">📵</div>
                        <p className="text-white/60 text-sm">{dict.cameraOff}</p>
                      </div>
                    </div>
                  ) : null}
                </>
              )}

              {/* Mic meter overlay */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 bg-black/40 backdrop-blur rounded-full px-3 py-2 border border-white/10">
                <span className="text-xs font-bold text-white/80 w-9">
                  {microphoneEnabled ? "🎤" : "🚫"}
                </span>
                <div className="relative flex-1 h-1.5 rounded-full bg-white/15 overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-emerald-400 transition-[width] duration-100"
                    style={{ width: `${Math.min(100, audioLevel * 220)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setCameraEnabled((v) => !v)}
                className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                  cameraEnabled
                    ? "bg-white/10 border-white/20 hover:bg-white/15"
                    : "bg-rose-600/90 border-rose-500 hover:bg-rose-700"
                }`}
              >
                {cameraEnabled ? "📹 " + dict.cameraOn : "🚫 " + dict.cameraOff}
              </button>
              <button
                type="button"
                onClick={() => setMicrophoneEnabled((v) => !v)}
                className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                  microphoneEnabled
                    ? "bg-white/10 border-white/20 hover:bg-white/15"
                    : "bg-rose-600/90 border-rose-500 hover:bg-rose-700"
                }`}
              >
                {microphoneEnabled ? "🎤 " + dict.micOn : "🚫 " + dict.micOff}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <DeviceSelect
                label={dict.selectCamera}
                value={cameraDeviceId}
                options={devices.cameras}
                onChange={setCameraDeviceId}
                placeholderId="default-cam"
              />
              <DeviceSelect
                label={dict.selectMicrophone}
                value={microphoneDeviceId}
                options={devices.microphones}
                onChange={setMicrophoneDeviceId}
                placeholderId="default-mic"
              />
            </div>

            <button
              type="button"
              disabled={!!permissionError || joinDisabled}
              onClick={join}
              className="w-full rounded-2xl px-6 py-4 text-lg font-black shadow-2xl transition hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: GOLD_GRADIENT, color: "#0B1B4D" }}
            >
              {joinLabel || dict.joinCall} →
            </button>
          </div>

          {rightPanel ? (
            <aside className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-5">{rightPanel}</aside>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function DeviceSelect({
  label,
  value,
  options,
  onChange,
  placeholderId,
}: {
  label: string;
  value: string | undefined;
  options: MediaDeviceInfo[];
  onChange: (v: string | undefined) => void;
  placeholderId: string;
}) {
  return (
    <label className="block text-left">
      <span className="text-xs font-bold uppercase tracking-wider text-white/60 mb-1.5 block">{label}</span>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value || undefined)}
        className="w-full rounded-xl bg-white/10 border border-white/15 px-3 py-2.5 text-sm text-white focus:border-white/30 outline-none"
      >
        <option value="">{label} (default)</option>
        {options.map((d) => (
          <option key={d.deviceId} value={d.deviceId} style={{ color: "#0B1B4D" }}>
            {d.label || `${label} ${d.deviceId.slice(0, 4)}`}
          </option>
        ))}
        <option value={placeholderId} disabled hidden />
      </select>
    </label>
  );
}
