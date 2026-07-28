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

export interface SendSmsParams {
  to: string;
  body: string;
  from?: string;
}

export interface SendSmsResult {
  success: boolean;
  sid?: string;
  error?: string;
}

export async function sendSms(params: SendSmsParams): Promise<SendSmsResult> {
  const c = getClient();
  if (!c) {
    return { success: false, error: "Twilio not configured — set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env.local" };
  }

  const fromNumber = params.from || process.env.TWILIO_SMS_NUMBER || process.env.TWILIO_PHONE_NUMBER;
  if (!fromNumber) {
    return { success: false, error: "Twilio SMS number not configured — set TWILIO_SMS_NUMBER in .env.local" };
  }

  try {
    const msg = await c.messages.create({
      to: params.to.startsWith("+") ? params.to : `+${params.to}`,
      from: fromNumber,
      body: params.body,
    });
    return { success: true, sid: msg.sid };
  } catch (err: any) {
    return { success: false, error: err?.message || "Unknown SMS error" };
  }
}

export function getSmsConfig() {
  return {
    configured: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_SMS_NUMBER),
    twilioAccountSidSet: !!process.env.TWILIO_ACCOUNT_SID,
    twilioAuthTokenSet: !!process.env.TWILIO_AUTH_TOKEN,
    smsNumber: process.env.TWILIO_SMS_NUMBER || "NOT SET",
    twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER || "",
  };
}
