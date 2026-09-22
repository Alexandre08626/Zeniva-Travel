import { getSupabaseAdminClient } from "@/src/lib/supabase/server";

export interface LinaTurn {
  sessionId: string;
  requestId?: string;
  source: "lina" | "lina-stream" | "chat";
  mode?: string | null;
  provider?: string | null;
  agencyId?: string | null;
  agentId?: string | null;
  systemPrompt?: string | null;
  history?: { role: string; content: string }[];
  prompt: string;
  reply: string;
  metadata?: Record<string, unknown>;
}

const N8N_LINA_WEBHOOK_URL = process.env.N8N_LINA_WEBHOOK_URL;

/**
 * Fire-and-forget: persist a Lina exchange to `lina_training_turns` (the
 * fine-tuning dataset source) and forward it to n8n when configured.
 * Never throws, never blocks the response.
 */
export function recordLinaTurn(turn: LinaTurn): void {
  const timestamp = new Date().toISOString();

  if (turn.reply && turn.prompt) {
    try {
      const { client } = getSupabaseAdminClient();
      client
        .from("lina_training_turns")
        .insert({
          session_id: turn.sessionId,
          request_id: turn.requestId ?? null,
          source: turn.source,
          mode: turn.mode ?? null,
          provider: turn.provider ?? null,
          agency_id: turn.agencyId ?? null,
          agent_id: turn.agentId ?? null,
          system_prompt: turn.systemPrompt ?? null,
          history: turn.history ?? [],
          prompt: turn.prompt,
          reply: turn.reply,
          metadata: turn.metadata ?? {},
        })
        .then(({ error }) => {
          if (error) console.warn("[lina-training-log] insert failed:", error.message);
        });
    } catch (e) {
      console.warn("[lina-training-log] unavailable:", (e as Error)?.message);
    }
  }

  if (N8N_LINA_WEBHOOK_URL) {
    fetch(N8N_LINA_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...turn, timestamp }),
    }).catch(() => {});
  }
}
