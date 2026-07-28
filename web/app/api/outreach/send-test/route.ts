import { NextRequest, NextResponse } from "next/server";
import { sendEmail, getEmailConfig } from "@/src/lib/email/sender";
import { sendSms, getSmsConfig } from "@/src/lib/sms/sender";
import { sendWhatsApp, getWhatsAppConfig } from "@/src/lib/whatsapp/sender";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const CRON_SECRET = process.env.CRON_SECRET || "zeniva-cron-2026";
  if (auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { to, channels } = await req.json();
  if (!to) return NextResponse.json({ error: "to required" }, { status: 400 });

  const results: any = { to };

  if (!channels || channels.includes("email")) {
    results.email = await sendEmail({
      to,
      subject: "🧪 Test de Zeniva Travel — Système d'envoi opérationnel",
      html: `<h1>✅ Test réussi!</h1><p>Ceci est un email de test du système Zeniva Travel Outreach.</p><p>Expédié depuis: <b>${process.env.EMAIL_FROM || "info@zenivatravel.com"}</b></p><p>Date: ${new Date().toLocaleString()}</p>`,
    });
  }

  if (!channels || channels.includes("sms")) {
    results.sms = await sendSms({ to, body: "✅ Zeniva Travel SMS test — votre système d'envoi est opérationnel!" });
  }

  if (!channels || channels.includes("whatsapp")) {
    results.whatsapp = await sendWhatsApp({ to, body: "✅ Zeniva Travel WhatsApp test — votre système est opérationnel! 🚀" });
  }

  return NextResponse.json({
    ...results,
    config: {
      email: getEmailConfig(),
      sms: getSmsConfig(),
      whatsapp: getWhatsAppConfig(),
    },
  });
}
