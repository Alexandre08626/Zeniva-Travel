import { NextResponse } from "next/server";
import { getEmailConfig } from "@/src/lib/email/sender";
import { getSmsConfig } from "@/src/lib/sms/sender";
import { getWhatsAppConfig } from "@/src/lib/whatsapp/sender";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const email = getEmailConfig();
  const sms = getSmsConfig();
  const whatsapp = getWhatsAppConfig();

  // Check Supabase connection
  let supabaseConnected = false;
  let supabaseError: string | null = null;
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    );
    const { error } = await sb.from("leads").select("id", { count: "exact", head: true });
    supabaseConnected = !error;
    if (error) supabaseError = error.message;
  } catch (e: any) {
    supabaseError = e?.message || "connection error";
  }

  // OpenAI key check
  const openAiConfigured = !!process.env.OPENAI_API_KEY;
  const cronConfigured = !!process.env.CRON_SECRET;

  const config = {
    sending: {
      email: {
        ...email,
        envVars: {
          EMAIL_FROM: process.env.EMAIL_FROM || "info@zenivatravel.com",
          EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || "Zeniva Travel",
          SMTP_HOST: process.env.SMTP_HOST || "smtp.gmail.com",
          SMTP_PORT: process.env.SMTP_PORT || "587",
          SMTP_USER: process.env.SMTP_USER || "info@zenivatravel.com",
          SMTP_PASS: email.smtpPassSet ? "✅ SET" : "❌ NOT SET",
          EMAIL_REPLY_TO: process.env.EMAIL_REPLY_TO || "info@zenivatravel.com",
        },
      },
      sms: {
        ...sms,
        envVars: {
          TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID ? "✅ SET" : "❌ NOT SET",
          TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN ? "✅ SET" : "❌ NOT SET",
          TWILIO_SMS_NUMBER: sms.smsNumber || "❌ NOT SET",
          TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER || "❌ NOT SET",
        },
      },
      whatsapp: {
        ...whatsapp,
        envVars: {
          TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID ? "✅ SET" : "❌ NOT SET",
          TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN ? "✅ SET" : "❌ NOT SET",
          TWILIO_WHATSAPP_NUMBER: whatsapp.whatsappNumber || "❌ NOT SET",
        },
      },
    },
    infrastructure: {
      supabase: { connected: supabaseConnected, error: supabaseError },
      openai: { configured: openAiConfigured },
      cron: { secretSet: cronConfigured, secret: process.env.CRON_SECRET || "zeniva-cron-2026" },
    },
    allConfigured: email.smtpConfigured && sms.configured && whatsapp.configured && supabaseConnected && openAiConfigured,
    setupGuide: {
      email: [
        "Option 1 — Gmail SMTP: Set SMTP_PASS to your Gmail App Password (generate at https://myaccount.google.com/apppasswords)",
        "Option 2 — Custom SMTP: Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM",
        "Send test: POST /api/outreach/send-test with { to: 'email@example.com' }",
      ],
      sms: [
        "1. Sign up at https://www.twilio.com/try-twilio",
        "2. Get Account SID and Auth Token from Twilio Console",
        "3. Buy or provision an SMS-capable phone number in Twilio Console",
        "4. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_SMS_NUMBER in .env.local",
      ],
      whatsapp: [
        "1. Same Twilio account as SMS above",
        "2. Enable WhatsApp Sandbox at https://console.twilio.com/usg/whatsapp/learn",
        "3. Your WhatsApp number is: whatsapp:+14155238886 (Twilio sandbox default)",
        "4. Set TWILIO_WHATSAPP_NUMBER in .env.local (include + and country code)",
      ],
    },
    senderIdentities: {
      emailSender: process.env.EMAIL_FROM || "info@zenivatravel.com",
      emailFromName: process.env.EMAIL_FROM_NAME || "Zeniva Travel",
      smsSenderNumber: process.env.TWILIO_SMS_NUMBER || process.env.TWILIO_PHONE_NUMBER || "NOT SET",
      whatsappSenderNumber: process.env.TWILIO_WHATSAPP_NUMBER || "NOT SET (sandbox: whatsapp:+14155238886)",
    },
  };

  return NextResponse.json(config);
}
