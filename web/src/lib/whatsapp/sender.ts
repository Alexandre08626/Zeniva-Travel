import { Twilio } from "twilio";

let client: Twilio | null = null;

function getClient(): Twilio | null {
  if (client) return client;
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return null;
  client = new Twilio(sid, token);
  return client;
}

export interface SendWhatsAppParams {
  to: string;
  body: string;
  from?: string;
  mediaUrl?: string;
}

export interface SendWhatsAppResult {
  success: boolean;
  sid?: string;
  error?: string;
}

export async function sendWhatsApp(params: SendWhatsAppParams): Promise<SendWhatsAppResult> {
  const c = getClient();
  if (!c) {
    return { success: false, error: "Twilio not configured — set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env.local" };
  }

  const fromNumber = params.from || process.env.TWILIO_WHATSAPP_NUMBER;
  if (!fromNumber) {
    return { success: false, error: "Twilio WhatsApp number not configured — set TWILIO_WHATSAPP_NUMBER in .env.local" };
  }

  const whatsappFrom = `whatsapp:${fromNumber}`;
  const whatsappTo = `whatsapp:${params.to.startsWith("+") ? params.to : `+${params.to}`}`;

  try {
    const msg = await c.messages.create({
      to: whatsappTo,
      from: whatsappFrom,
      body: params.body,
      ...(params.mediaUrl ? { mediaUrl: [params.mediaUrl] } : {}),
    });
    return { success: true, sid: msg.sid };
  } catch (err: any) {
    return { success: false, error: err?.message || "Unknown WhatsApp error" };
  }
}

export function getWhatsAppConfig() {
  return {
    configured: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_NUMBER),
    whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER || "NOT SET",
  };
}
