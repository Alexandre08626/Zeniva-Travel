// linaClient — client d'appel à l'IA Lina (Zeniva AI).
// Envoie une conversation vers /api/chat et retourne { reply, tripPatch }.

export type LinaMessage = {
  role: "system" | "user" | "assistant";
  text: string;
};

export type LinaResult =
  | { success: true; reply: string; tripPatch?: Record<string, unknown>; meta?: Record<string, unknown> }
  | { success: false; error: string };

function buildMessages(conversation: { role?: string; text?: string }[]): { role: string; content: string }[] {
  const out: { role: string; content: string }[] = [];
  for (const m of conversation || []) {
    const role = m?.role === "assistant" ? "assistant" : m?.role === "system" ? "system" : "user";
    if (m?.text) out.push({ role, content: String(m.text) });
  }
  if (out.length === 0) out.push({ role: "user", content: "Bonjour" });
  return out;
}

const FAIL_REPLY = "Je n'ai pas pu répondre pour le moment. Réessayez dans quelques secondes.";

/**
 * mode "client" (traveler chat) → /api/lina: Lina's intake prompt + TRIP_PATCH, returned split out.
 * Other modes (agent / partner / hq copilots) → /api/chat.
 */
export async function sendMessageToLina(
  conversation: string | { role?: string; text?: string }[],
  opts?: { prompt?: string; mode?: string; sessionId?: string }
): Promise<{ reply: string; tripPatch?: Record<string, unknown>; meta?: Record<string, unknown> }> {
  const mode = opts?.mode || "agent";
  try {
    if (mode === "client") {
      const msgs = typeof conversation === "string" ? [{ role: "user", content: conversation }] : buildMessages(conversation);
      const last = msgs.at(-1)?.role === "user" ? msgs.pop()! : null;
      const prompt = opts?.prompt || last?.content || "Bonjour";
      const res = await fetch("/api/lina", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          mode: "client",
          sessionId: opts?.sessionId,
          history: msgs.filter((m) => m.role !== "system").slice(-30),
        }),
      });
      if (!res.ok) return { reply: FAIL_REPLY };
      const data = await res.json();
      const reply = String(data?.text || "").trim();
      if (!reply) return { reply: FAIL_REPLY };
      return { reply, tripPatch: data?.tripPatch || undefined, meta: data?.meta };
    }

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: opts?.prompt || (typeof conversation === "string" ? conversation : ""),
        messages: typeof conversation === "string" ? [] : buildMessages(conversation),
        mode,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      const reply = String(data?.reply || "");
      if (reply) return { reply, meta: data?.meta };
    }
    return { reply: FAIL_REPLY };
  } catch {
    return { reply: FAIL_REPLY };
  }
}
