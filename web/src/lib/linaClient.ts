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

export async function sendMessageToLina(
  conversation: { role?: string; text?: string }[],
  opts?: { prompt?: string }
): Promise<{ reply: string; tripPatch?: Record<string, unknown>; meta?: Record<string, unknown> }> {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: opts?.prompt || "",
        messages: buildMessages(conversation),
      }),
    });
    if (res.ok) {
      const data = await res.json();
      const reply = String(data?.reply || "");
      if (reply) return { reply, meta: data?.meta };
    } else {
      try { await res.json(); } catch { /* ignore */ }
    }
    return { reply: "Je n'ai pas pu répondre pour le moment. Réessayez dans quelques secondes." };
  } catch (e) {
    return { reply: "Je n'ai pas pu répondre pour le moment. Réessayez dans quelques secondes." };
  }
}
