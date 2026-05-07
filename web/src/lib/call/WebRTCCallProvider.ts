/**
 * Native-WebRTC implementation of CallProvider.
 *
 * 1-to-1 peer connection over Supabase Realtime signaling, Google STUN, no
 * TURN. Adequate for V1 — most NATs work P2P. Symmetric NATs will need TURN
 * later (or a swap to LiveKit/Daily, which is the whole point of the
 * abstraction).
 */
import {
  type CallEndedBy,
  type CallEvents,
  type CallProvider,
  type CallQuality,
  type CallState,
  type JoinOptions,
} from "./types";
import { SupabaseSignaling, type SignalEnvelope } from "./SupabaseSignaling";

const ICE_SERVERS: RTCIceServer[] = [
  { urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] },
];

const QUALITY_INTERVAL_MS = 3000;

type Listener = (...args: unknown[]) => void;

export class WebRTCCallProvider implements CallProvider {
  private pc: RTCPeerConnection | null = null;
  private signaling: SupabaseSignaling | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private state: CallState = "idle";
  private peerReady = false;
  private offered = false;
  private role: "client" | "agent" = "client";
  private pendingIce: RTCIceCandidateInit[] = [];
  private statsTimer: ReturnType<typeof setInterval> | null = null;
  private readyHeartbeat: ReturnType<typeof setInterval> | null = null;
  private readonly listeners: Map<keyof CallEvents, Set<Listener>> = new Map();

  on<K extends keyof CallEvents>(event: K, handler: CallEvents[K]): () => void {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(handler as Listener);
    return () => set!.delete(handler as Listener);
  }

  private emit<K extends keyof CallEvents>(event: K, ...args: Parameters<CallEvents[K]>): void {
    const set = this.listeners.get(event);
    if (!set) return;
    for (const h of set) {
      try {
        (h as (...a: unknown[]) => void)(...args);
      } catch (err) {
        console.error("[CallProvider] listener error", err);
      }
    }
  }

  private setState(next: CallState) {
    if (next === this.state) return;
    this.state = next;
    this.emit("state", next);
  }

  getState() {
    return this.state;
  }

  getStreams() {
    return { local: this.localStream, remote: this.remoteStream };
  }

  async join(opts: JoinOptions): Promise<void> {
    if (this.state !== "idle" && this.state !== "ended" && this.state !== "failed") {
      throw new Error(`Cannot join from state ${this.state}`);
    }
    this.setState("joining");

    // 1. Acquire local media.
    try {
      const constraints: MediaStreamConstraints = {
        audio: opts.microphoneDeviceId
          ? { deviceId: { exact: opts.microphoneDeviceId } }
          : true,
        video: opts.video
          ? opts.cameraDeviceId
            ? { deviceId: { exact: opts.cameraDeviceId } }
            : { width: { ideal: 1280 }, height: { ideal: 720 } }
          : false,
      };
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      this.emit("localStream", this.localStream);
    } catch (err) {
      this.setState("failed");
      this.emit("error", err as Error);
      throw err;
    }

    // 2. Set up peer connection.
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    this.pc = pc;
    this.remoteStream = new MediaStream();
    this.emit("remoteStream", this.remoteStream);

    for (const track of this.localStream.getTracks()) {
      pc.addTrack(track, this.localStream);
    }

    pc.ontrack = (event) => {
      const stream = this.remoteStream!;
      stream.addTrack(event.track);
      this.emit("remoteStream", stream);
    };

    pc.onconnectionstatechange = () => {
      const cs = pc.connectionState;
      if (cs === "connected") this.setState("connected");
      else if (cs === "disconnected") this.setState("reconnecting");
      else if (cs === "failed") {
        this.setState("failed");
        this.emit("ended", "network");
      } else if (cs === "connecting") this.setState("connecting");
    };

    pc.onicecandidate = async (event) => {
      if (event.candidate && this.signaling) {
        try {
          await this.signaling.send("ice", event.candidate.toJSON());
        } catch (err) {
          console.warn("[CallProvider] failed to send ICE", err);
        }
      }
    };

    // 3. Connect signaling.
    this.role = opts.role;
    this.signaling = new SupabaseSignaling({
      roomId: opts.roomId,
      role: opts.role,
      onMessage: (msg) => this.handleSignal(msg),
    });
    await this.signaling.connect();

    // 4. Announce "ready" on a 1.5s heartbeat for up to ~30s, until the peer
    //    answers with their own "ready". Handles either side joining first.
    //    By convention the agent is the SDP offerer; the client only answers.
    await this.signaling.send("ready");
    this.setState("waiting_peer");
    let beats = 0;
    this.readyHeartbeat = setInterval(async () => {
      beats += 1;
      if (this.peerReady || !this.signaling) {
        if (this.readyHeartbeat) {
          clearInterval(this.readyHeartbeat);
          this.readyHeartbeat = null;
        }
        return;
      }
      if (beats > 20) {
        if (this.readyHeartbeat) {
          clearInterval(this.readyHeartbeat);
          this.readyHeartbeat = null;
        }
        return;
      }
      try {
        await this.signaling.send("ready");
      } catch {}
    }, 1500);

    // 5. Start quality polling.
    this.startQualityPolling();
  }

  private async handleSignal(msg: SignalEnvelope) {
    const pc = this.pc;
    const sig = this.signaling;
    if (!pc || !sig) return;

    switch (msg.kind) {
      case "ready": {
        const wasReady = this.peerReady;
        this.peerReady = true;
        // Reply once so the *other* peer also learns we're here, in case they
        // sent their first "ready" before we subscribed.
        if (!wasReady) {
          try {
            await sig.send("ready");
          } catch {}
        }
        // Only the agent offers — avoids glare from simultaneous offers.
        if (this.role === "agent" && !this.offered) {
          this.offered = true;
          this.setState("connecting");
          try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            await sig.send("offer", offer);
          } catch (err) {
            this.emit("error", err as Error);
          }
        }
        break;
      }
      case "offer": {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(msg.payload as RTCSessionDescriptionInit));
          await this.flushPendingIce();
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await sig.send("answer", answer);
        } catch (err) {
          this.emit("error", err as Error);
        }
        break;
      }
      case "answer": {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(msg.payload as RTCSessionDescriptionInit));
          await this.flushPendingIce();
        } catch (err) {
          this.emit("error", err as Error);
        }
        break;
      }
      case "ice": {
        try {
          const candidate = msg.payload as RTCIceCandidateInit;
          if (pc.remoteDescription) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } else {
            this.pendingIce.push(candidate);
          }
        } catch (err) {
          console.warn("[CallProvider] addIceCandidate failed", err);
        }
        break;
      }
      case "bye": {
        this.emit("ended", "network");
        await this.leave("network");
        break;
      }
    }
  }

  private async flushPendingIce() {
    if (!this.pc) return;
    const queued = this.pendingIce;
    this.pendingIce = [];
    for (const c of queued) {
      try {
        await this.pc.addIceCandidate(new RTCIceCandidate(c));
      } catch (err) {
        console.warn("[CallProvider] queued ICE failed", err);
      }
    }
  }

  toggleCamera(): boolean {
    const track = this.localStream?.getVideoTracks()[0];
    if (!track) return false;
    track.enabled = !track.enabled;
    return track.enabled;
  }

  toggleMicrophone(): boolean {
    const track = this.localStream?.getAudioTracks()[0];
    if (!track) return false;
    track.enabled = !track.enabled;
    return track.enabled;
  }

  async leave(by: CallEndedBy): Promise<void> {
    if (this.state === "ended") return;
    if (this.signaling) {
      try {
        await this.signaling.send("bye", { by });
      } catch {}
      try {
        await this.signaling.disconnect();
      } catch {}
      this.signaling = null;
    }
    if (this.statsTimer) {
      clearInterval(this.statsTimer);
      this.statsTimer = null;
    }
    if (this.readyHeartbeat) {
      clearInterval(this.readyHeartbeat);
      this.readyHeartbeat = null;
    }
    if (this.pc) {
      try {
        this.pc.close();
      } catch {}
      this.pc = null;
    }
    if (this.localStream) {
      for (const t of this.localStream.getTracks()) t.stop();
      this.localStream = null;
    }
    this.remoteStream = null;
    this.setState("ended");
    this.emit("ended", by);
  }

  private startQualityPolling() {
    if (this.statsTimer) return;
    let lastBytes = 0;
    let lastTs = 0;
    this.statsTimer = setInterval(async () => {
      const pc = this.pc;
      if (!pc || pc.connectionState !== "connected") return;
      try {
        const stats = await pc.getStats();
        let rtt = 0;
        let lost = 0;
        let received = 0;
        let bytes = 0;
        let ts = 0;
        stats.forEach((report) => {
          if (report.type === "candidate-pair" && (report as RTCIceCandidatePairStats).state === "succeeded") {
            const r = report as RTCIceCandidatePairStats & { currentRoundTripTime?: number };
            if (typeof r.currentRoundTripTime === "number") rtt = Math.max(rtt, r.currentRoundTripTime * 1000);
          }
          if (report.type === "inbound-rtp") {
            const r = report as RTCInboundRtpStreamStats & {
              packetsLost?: number;
              packetsReceived?: number;
              bytesReceived?: number;
              timestamp?: number;
            };
            if (typeof r.packetsLost === "number") lost += r.packetsLost;
            if (typeof r.packetsReceived === "number") received += r.packetsReceived;
            if (typeof r.bytesReceived === "number") bytes += r.bytesReceived;
            if (typeof r.timestamp === "number") ts = Math.max(ts, r.timestamp);
          }
        });
        const packetLoss = received > 0 ? lost / (lost + received) : 0;
        let bitrateKbps: number | undefined;
        if (lastBytes > 0 && lastTs > 0 && ts > lastTs) {
          bitrateKbps = ((bytes - lastBytes) * 8) / (ts - lastTs);
        }
        lastBytes = bytes;
        lastTs = ts;
        let level: CallQuality["level"] = 3;
        if (rtt > 400 || packetLoss > 0.1) level = 1;
        else if (rtt > 200 || packetLoss > 0.03) level = 2;
        this.emit("quality", { level, rttMs: Math.round(rtt), packetLoss, bitrateKbps });
      } catch {
        /* ignore stats errors */
      }
    }, QUALITY_INTERVAL_MS);
  }
}
