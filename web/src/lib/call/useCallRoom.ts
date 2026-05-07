"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CallEndedBy, CallProvider, CallQuality, CallRole, CallState, JoinOptions } from "./types";
import { WebRTCCallProvider } from "./WebRTCCallProvider";

/**
 * React wrapper around CallProvider. Mirrors the provider's lifecycle into
 * React state so UI components can render reactively without dealing with
 * the imperative interface.
 */
export interface UseCallRoom {
  state: CallState;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  quality: CallQuality;
  error: string | null;
  join: (opts: Omit<JoinOptions, "roomId" | "role">) => Promise<void>;
  leave: (by: CallEndedBy) => Promise<void>;
  toggleCamera: () => boolean;
  toggleMicrophone: () => boolean;
  cameraEnabled: boolean;
  microphoneEnabled: boolean;
}

export function useCallRoom(roomId: string, role: CallRole): UseCallRoom {
  const providerRef = useRef<CallProvider | null>(null);
  const [state, setState] = useState<CallState>("idle");
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [quality, setQuality] = useState<CallQuality>({ level: 0 });
  const [error, setError] = useState<string | null>(null);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(true);

  const ensureProvider = useCallback((): CallProvider => {
    if (!providerRef.current) {
      const p = new WebRTCCallProvider();
      p.on("state", (s) => setState(s));
      p.on("localStream", (s) => setLocalStream(s));
      p.on("remoteStream", (s) => setRemoteStream(s));
      p.on("quality", (q) => setQuality(q));
      p.on("error", (e) => setError(e.message));
      providerRef.current = p;
    }
    return providerRef.current;
  }, []);

  const join = useCallback(
    async (opts: Omit<JoinOptions, "roomId" | "role">) => {
      setError(null);
      const p = ensureProvider();
      try {
        await p.join({ roomId, role, ...opts });
        setCameraEnabled(opts.video);
        setMicrophoneEnabled(true);
      } catch (err: any) {
        setError(err?.message || "Failed to join");
        throw err;
      }
    },
    [roomId, role, ensureProvider]
  );

  const leave = useCallback(async (by: CallEndedBy) => {
    if (providerRef.current) {
      await providerRef.current.leave(by);
    }
  }, []);

  const toggleCamera = useCallback(() => {
    const p = providerRef.current;
    if (!p) return false;
    const next = p.toggleCamera();
    setCameraEnabled(next);
    return next;
  }, []);

  const toggleMicrophone = useCallback(() => {
    const p = providerRef.current;
    if (!p) return false;
    const next = p.toggleMicrophone();
    setMicrophoneEnabled(next);
    return next;
  }, []);

  // Tear down on unmount.
  useEffect(() => {
    return () => {
      providerRef.current?.leave("network").catch(() => undefined);
      providerRef.current = null;
    };
  }, []);

  return useMemo(
    () => ({
      state,
      localStream,
      remoteStream,
      quality,
      error,
      join,
      leave,
      toggleCamera,
      toggleMicrophone,
      cameraEnabled,
      microphoneEnabled,
    }),
    [state, localStream, remoteStream, quality, error, join, leave, toggleCamera, toggleMicrophone, cameraEnabled, microphoneEnabled]
  );
}
