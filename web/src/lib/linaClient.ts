// Lightweight Lina client for the web UI.
// Routes messages through the Zeniva API (Claude) via VPS webhook.
export async function sendMessageToLina(
  historyOrPrompt: any
): Promise<{ reply: string; raw: string; tripPatch: any | null }> {
  const WEBHOOK_FALLBACK =
    "/api/lina";  // Route through Next.js API → VPS /chat (correct prompt)

  // build prompt and optional history/session
  let prompt = "";
  if (Array.isArray(historyOrPrompt)) {
    const lastUser = [...historyOrPrompt]
      .reverse()
      .find((m) => m?.role === "user" && (m?.text || m?.content));
    if (lastUser) prompt = lastUser.text || lastUser.content || "";
  } else if (typeof historyOrPrompt === "string") {
    prompt = historyOrPrompt;
  }

  if (!prompt || String(prompt).trim() === "") {
    prompt = ""; // allow empty, webhook may handle it
  }

  // Persistent session ID per browser tab — keeps n8n memory across messages
  // Derive sessionId from tripId in the URL (persisted per-trip in localStorage)
  let sessionId = "";
  if (typeof window !== "undefined") {
    // Get tripId from URL: /chat/<tripId>
    const tripIdMatch = window.location.pathname.match(/\/chat\/([^/?#]+)/);
    const tripId = tripIdMatch ? tripIdMatch[1] : null;
    const storageKey = tripId ? `lina-session-${tripId}` : "lina-session-id";
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      sessionId = stored;
    } else {
      sessionId = `web-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem(storageKey, sessionId);
    }
  }
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  // Check if an agent is logged in
  let agentEmail: string | undefined;
  let agentRole: string | undefined;
  if (typeof window !== "undefined") {
    try {
      const authRaw = window.localStorage.getItem("zeniva_auth_store_v1");
      if (authRaw) {
        const authState = JSON.parse(authRaw);
        const user = authState?.user;
        if (user?.email && user.email !== "info@zenivatravel.com") {
          agentEmail = user.email;
          const roles = user.roles || (user.role ? [user.role] : []);
          if (roles.includes("yacht_broker")) agentRole = "yacht_broker";
          else if (roles.includes("travel_agent")) agentRole = "travel_agent";
          else if (roles.includes("influencer")) agentRole = "influencer";
        }
      }
    } catch {}
  }

  const history = Array.isArray(historyOrPrompt)
    ? historyOrPrompt
        .filter((m) => m?.role && (m?.text || m?.content))
        .slice(-20)
        .map((m: any) => ({ role: m.role === "lina" ? "assistant" : m.role, content: m.content || m.text || "" }))
    : [];

  const body: any = {
    prompt,           // /api/lina expects `prompt` not `message`
    sessionId,
    history,          // history items must have `content` not `text`
  };

  const url = "/api/lina";  // Always route through Next.js API → VPS /chat
  console.log("Lina webhook URL:", url);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  let rawReply = "";

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    console.log("Lina webhook status:", res.status);

    if (!res.ok) {
      rawReply = "Lina est momentanément indisponible. Contactez-nous à info@zeniva.ca";
    } else {
      const json = await res.json();
      rawReply = String(json?.reply || json?.response || "");
    }
  } catch (err: any) {
    clearTimeout(timeout);
    console.log("Lina webhook error", err?.message || err);
    rawReply = "Lina est momentanément indisponible. Contactez-nous à info@zeniva.ca";
  }

  const tripPatch = extractTripPatch(rawReply);
  const reply = stripTripPatch(rawReply);

  // Notify agents when a client sends a message
  if (prompt && typeof window !== "undefined") {
    try {
      fetch("/api/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer zeniva-secret-2025" },
        body: JSON.stringify({
          title: "✈️ New message from client",
          body: prompt.length > 80 ? prompt.slice(0, 80) + "…" : prompt,
          url: "/agent/chat",
          tag: "client-message",
        }),
      }).catch(() => {}); // fire-and-forget, never block UI
    } catch { /* ignore */ }
  }

  return { reply, raw: rawReply, tripPatch };
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
