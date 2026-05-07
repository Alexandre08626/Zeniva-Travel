/**
 * Tiny wrapper over a Supabase Realtime broadcast channel used as a signaling
 * transport. Carries SDP offers/answers + ICE candidates between two peers.
 *
 * Channel naming: `call:<roomId>`. Each peer broadcasts under its role
 * ("client" | "agent") and receives messages from the other role.
 */
import { getSupabaseClient } from "../supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { CallRole } from "./types";

export type SignalKind = "offer" | "answer" | "ice" | "bye" | "ready";

export interface SignalEnvelope {
  kind: SignalKind;
  from: CallRole;
  payload?: unknown;
}

export interface SupabaseSignalingOptions {
  roomId: string;
  role: CallRole;
  onMessage: (msg: SignalEnvelope) => void;
}

export class SupabaseSignaling {
  private channel: RealtimeChannel | null = null;
  private readonly opts: SupabaseSignalingOptions;
  private subscribed = false;

  constructor(opts: SupabaseSignalingOptions) {
    this.opts = opts;
  }

  async connect(): Promise<void> {
    const supabase = getSupabaseClient();
    const channel = supabase.channel(`call:${this.opts.roomId}`, {
      config: { broadcast: { self: false, ack: false } },
    });
    channel.on("broadcast", { event: "signal" }, (msg) => {
      const envelope = msg.payload as SignalEnvelope;
      if (!envelope || envelope.from === this.opts.role) return;
      this.opts.onMessage(envelope);
    });
    await new Promise<void>((resolve, reject) => {
      channel.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          this.subscribed = true;
          resolve();
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          reject(new Error(`Signaling channel status: ${status}`));
        }
      });
    });
    this.channel = channel;
  }

  async send(kind: SignalKind, payload?: unknown): Promise<void> {
    if (!this.channel || !this.subscribed) {
      throw new Error("Signaling channel not connected");
    }
    await this.channel.send({
      type: "broadcast",
      event: "signal",
      payload: { kind, from: this.opts.role, payload } satisfies SignalEnvelope,
    });
  }

  async disconnect(): Promise<void> {
    if (this.channel) {
      try {
        await this.channel.unsubscribe();
      } catch {}
      try {
        getSupabaseClient().removeChannel(this.channel);
      } catch {}
    }
    this.channel = null;
    this.subscribed = false;
  }
}
