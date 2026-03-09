/**
 * Central push notification helper — call from any API route
 * Sends to info@zeniva.ca (HQ) by default, or any targetEmail
 */

const HQ = "info@zeniva.ca";
const SECRET = "Bearer zeniva-secret-2025";

interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  targetEmail?: string;
  icon?: string;
}

export async function sendPushToHQ(payload: PushPayload) {
  return sendPush({ ...payload, targetEmail: HQ });
}

export async function sendPush(payload: PushPayload) {
  try {
    // Determine base URL for internal fetch
    const base =
      process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NEXT_PUBLIC_SITE_URL || "https://zenivatravel.com";

    await fetch(`${base}/api/push/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: SECRET,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    // Fire-and-forget — never block the main flow
  }
}
