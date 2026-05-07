/**
 * CallProvider abstraction.
 *
 * Today: backed by native WebRTC + Supabase Realtime signaling (P2P, $0/mo).
 * Tomorrow: swap to LiveKit/Daily.co/Twilio by writing a new implementation
 * of this interface. UI components only depend on this surface.
 */

export type CallRole = "client" | "agent";

export type CallState =
  | "idle"
  | "joining"
  | "waiting_peer"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "ended"
  | "failed";

export type CallEndedBy = "client" | "agent" | "network";

export interface CallQuality {
  /** 0 = unknown, 1 = poor, 2 = ok, 3 = good */
  level: 0 | 1 | 2 | 3;
  /** ms */
  rttMs?: number;
  /** 0..1 */
  packetLoss?: number;
  /** kbps */
  bitrateKbps?: number;
}

export interface CallEvents {
  state: (next: CallState) => void;
  localStream: (stream: MediaStream) => void;
  remoteStream: (stream: MediaStream) => void;
  quality: (q: CallQuality) => void;
  error: (err: Error) => void;
  ended: (by: CallEndedBy) => void;
}

export interface JoinOptions {
  /** A unique room id shared by both peers (e.g. the handoff request id). */
  roomId: string;
  /** Identifies which side this client is. */
  role: CallRole;
  /** Whether to publish the local camera. Audio is always on at first. */
  video: boolean;
  /** Optional explicit device IDs. */
  cameraDeviceId?: string;
  microphoneDeviceId?: string;
}

export interface CallProvider {
  /** Acquire local media + open signaling channel + start the negotiation. */
  join(opts: JoinOptions): Promise<void>;

  /** Toggle the local camera track. Returns the new "enabled" value. */
  toggleCamera(): boolean;

  /** Toggle the local microphone track. Returns the new "enabled" value. */
  toggleMicrophone(): boolean;

  /** Hang up: tear down peer connection + signaling, stop tracks. */
  leave(by: CallEndedBy): Promise<void>;

  /** Subscribe to lifecycle events. Returns an unsubscribe fn. */
  on<K extends keyof CallEvents>(event: K, handler: CallEvents[K]): () => void;

  /** Lookup the current local + remote streams (may be null before they arrive). */
  getStreams(): { local: MediaStream | null; remote: MediaStream | null };

  /** Live state snapshot. */
  getState(): CallState;
}

export interface DeviceList {
  cameras: MediaDeviceInfo[];
  microphones: MediaDeviceInfo[];
}

/** Helper used by the pre-call screen to enumerate cams/mics after permission grant. */
export async function enumerateAvDevices(): Promise<DeviceList> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.enumerateDevices) {
    return { cameras: [], microphones: [] };
  }
  const all = await navigator.mediaDevices.enumerateDevices();
  return {
    cameras: all.filter((d) => d.kind === "videoinput"),
    microphones: all.filter((d) => d.kind === "audioinput"),
  };
}
