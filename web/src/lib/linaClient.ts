// Lightweight Lina client for the web UI.
// Sends messages to an n8n webhook instead of calling OpenAI directly.
export async function sendMessageToLina(
  historyOrPrompt: any
): Promise<{ reply: string; raw: string; tripPatch: any | null }> {
  try {
    let prompt = "";

    if (Array.isArray(historyOrPrompt)) {
      // prefer most recent user message
      const lastUser = [...historyOrPrompt].reverse().find((m) => m?.role === "user" && (m?.text || m?.content));
      if (lastUser) prompt = lastUser.text || lastUser.content || "";
    } else if (typeof historyOrPrompt === "string") {
      prompt = historyOrPrompt;
    }

    // If no prompt available, send a short default to avoid server 400 errors
    if (!prompt || String(prompt).trim().length === 0) {
      prompt = "Hello, can you introduce yourself and ask departure city?";
    }

    const body: any = {};

    // build message and history according to n8n webhook contract
    const sessionId = (Array.isArray(historyOrPrompt) && (historyOrPrompt.sessionId || historyOrPrompt.sessionId === 0 && String(historyOrPrompt.sessionId))) ||
      // generate simple random id if none provided
      `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    body.message = prompt;
    body.sessionId = sessionId;
    body.source = "zenivatravel.com";
    body.language = "fr";

    if (Array.isArray(historyOrPrompt)) {
      body.history = historyOrPrompt
        .filter((m) => m?.role && (m?.text || m?.content))
        .slice(-20)
        .map((m) => ({ role: m.role === "lina" ? "assistant" : m.role, text: m.text || m.content }));
    } else {
      body.history = [];
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    let rawReply = "";

    try {
      const res = await fetch("https://vmi3097009.contaboserver.net/webhook/zeniva-lina-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        // treat non-2xx as service unavailable for UI
        console.error("n8n webhook error", res.status);
        rawReply = "Lina est momentanément indisponible. Contactez-nous à info@zeniva.ca";
      } else {
        const json = await res.json();
        rawReply = String(json?.response || json?.reply || "");
      }
    } catch (err: any) {
      clearTimeout(timeout);
      console.error("sendMessageToLina n8n error", err?.message || err);
      rawReply = "Lina est momentanément indisponible. Contactez-nous à info@zeniva.ca";
    }

    const tripPatch = extractTripPatch(rawReply);
    const reply = stripTripPatch(rawReply);
    return { reply, raw: rawReply, tripPatch };
  } catch (err: any) {
    console.error("sendMessageToLina error", err);
    // In case of unexpected error, return user-facing message
    return {
      reply: "Lina est momentanément indisponible. Contactez-nous à info@zeniva.ca",
      raw: "",
      tripPatch: null,
    };
  }
}

// Extract TRIP_PATCH block from assistant text
export function extractTripPatch(text?: string) {
  if (!text) return null;
  const start = text.indexOf("TRIP_PATCH_START");
  const end = text.indexOf("TRIP_PATCH_END");
  if (start === -1 || end === -1 || end <= start) return null;
  const jsonBlock = text.slice(start + "TRIP_PATCH_START".length, end).trim();
  try {
    const parsed = JSON.parse(jsonBlock);
    if (!parsed?.patch || typeof parsed.patch !== "object") return null;
    return parsed;
  } catch (e: any) {
    console.warn("TRIP PATCH parse failed:", e?.message || e);
    return null;
  }
}

// Remove TRIP_PATCH block to keep UI responses clean
export function stripTripPatch(text?: string) {
  if (!text) return "";
  const start = text.indexOf("TRIP_PATCH_START");
  if (start === -1) return text;
  const end = text.indexOf("TRIP_PATCH_END", start);
  if (end === -1) return text;
  return (text.slice(0, start) + text.slice(end + "TRIP_PATCH_END".length)).trim();
}
