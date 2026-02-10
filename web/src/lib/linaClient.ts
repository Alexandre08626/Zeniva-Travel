// Lightweight Lina client for the web UI.
// Always calls the local server route so secrets never leave the server.
export async function sendMessageToLina(
  historyOrPrompt: any
): Promise<{ reply: string; raw: string; tripPatch: any | null }> {
  try {
    let prompt = "";

    if (Array.isArray(historyOrPrompt)) {
      // prefer most recent user message
      const lastUser = [...historyOrPrompt].reverse().find((m) => m?.role === "user" && m?.text);
      if (lastUser) prompt = lastUser.text;
    } else if (typeof historyOrPrompt === "string") {
      prompt = historyOrPrompt;
    }

    // If no prompt available, send a short default to avoid server 400 errors
    if (!prompt || String(prompt).trim().length === 0) {
      prompt = "Hello, can you introduce yourself and ask departure city?";
    }

    const body: any = { prompt };

    // Pass a slimmed-down history only if present to keep payload light
    if (Array.isArray(historyOrPrompt)) {
      body.history = historyOrPrompt
        .filter((m) => m?.role && m?.text)
        .slice(-10)
        .map((m) => ({ role: m.role === "lina" ? "assistant" : m.role, content: m.text }));
    }

    const res = await fetch("/api/lina", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Lina API error: ${res.status} ${txt}`);
    }
    const json = await res.json();

    // typical shape: { reply: string }
    const rawReply = String(json?.reply || json?.choices?.[0]?.message?.content || "");
    const tripPatch = extractTripPatch(rawReply);
    const reply = stripTripPatch(rawReply);
    return { reply, raw: rawReply, tripPatch };
  } catch (err: any) {
    console.error("sendMessageToLina error", err);
    throw err;
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
