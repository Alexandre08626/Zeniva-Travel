import { NextRequest, NextResponse } from "next/server";
import { getLeads, insertMessage, updateLead, log as dbLog } from "@/src/lib/db";
import { sendEmail } from "@/src/lib/email/sender";
import { sendSms } from "@/src/lib/sms/sender";
import { sendWhatsApp } from "@/src/lib/whatsapp/sender";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const CRON_SECRET = process.env.CRON_SECRET || "zeniva-cron-2026";
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

const EMAIL_TEMPLATES = [
  (n: string, d: string) => `Hi ${n}!\n\nI came across your interest in ${d} and wanted to reach out. At Zeniva Travel, we use AI to create customized itineraries that match your exact preferences and budget.\n\n✨ 3 reasons to try Zeniva:\n• AI-powered trip planning in seconds\n• Best prices guaranteed\n• 24/7 support throughout your journey\n\nCreate your free account today and start planning your dream trip:\nhttps://www.zenivatravel.com\n\nSafe travels,\n— Zeniva Travel Team`,
  (n: string, d: string) => `Hello ${n},\n\nDreaming of ${d}? Let's make it happen! Zeniva Travel's AI platform plans your perfect trip — from flights and hotels to activities and dining.\n\n✅ Personalized itineraries\n✅ Real-time price comparison\n✅ Expert local recommendations\n\nJoin thousands of happy travelers. Sign up free:\nhttps://www.zenivatravel.com\n\nBest regards,\n— Zeniva Travel Team`,
];
const SMS_TEMPLATES = [
  (n: string) => `Hi ${n}! 🌍 Ready for your next adventure? Zeniva Travel AI plans your perfect trip. Create your free account: https://www.zenivatravel.com`,
  (n: string) => `${n}, your dream trip is one click away! Zeniva Travel AI finds the best deals. Start free: https://www.zenivatravel.com 🚀`,
];
const WA_TEMPLATES = [
  (n: string) => `Hey ${n}! 👋 Ready to explore the world? 🌍\n\nZeniva Travel AI creates personalized itineraries in seconds — flights, hotels, activities, all in one place. Plus, you get the best prices guaranteed! 🏆\n\nCreate your free account and start planning: https://www.zenivatravel.com 🚀\n\nSee you there!`,
  (n: string) => `Hi ${n}! 🌟\n\nImagine a trip perfectly tailored to you — that's what Zeniva Travel does. Our AI plans everything so you can just enjoy the journey. ✈️🌴\n\n👉 Create your free account: https://www.zenivatravel.com\n\nLet the adventure begin! 🎉`,
];

async function callOpenAI(_system: string, _user: string): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (!key) return null;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST", signal: controller.signal,
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "system", content: _system }, { role: "user", content: _user }], temperature: 0.8, max_tokens: 800 }),
    });
    clearTimeout(timer);
    if (!r.ok) return null;
    const d = await r.json();
    return d?.choices?.[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization") || req.nextUrl.searchParams.get("secret") || "";
  if (auth !== CRON_SECRET && auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const type = req.nextUrl.searchParams.get("type") || "all";
  const results: any[] = [];
  const errors: string[] = [];

  const pending = await getLeads({ outreach_status: "pending", minEmailCount: 4 });

  if (pending.length === 0) {
    return NextResponse.json({ status: "ok", message: "no leads pending outreach", results: [] });
  }

  for (const lead of pending) {
    if (!lead.phone) continue;
    const channels: string[] = [];
    const leadErrors: string[] = [];

    if (type === "all" || type === "email") {
      const emails = lead.emails || [];
      for (const email of emails) {
        const aiBody = await callOpenAI("", "");
        const body = aiBody || pick(EMAIL_TEMPLATES)(lead.name || "there", lead.destination || "travel");
        const subject = `${lead.name?.split(" ")[0] || "Hi"}, your next adventure starts here`;
        const sendResult = await sendEmail({ to: email, subject, html: body.replace(/\n/g, "<br>"), text: body });
        await insertMessage({
          lead_id: lead.id, channel: "email", recipient: email, subject, body,
          status: sendResult.success ? "sent" : "failed",
          sender: process.env.EMAIL_FROM || "info@zenivatravel.com",
          sent_at: sendResult.success ? new Date().toISOString() : null,
          error: sendResult.error || null,
          created_at: new Date().toISOString(),
        });
        channels.push(`email:${email}:${sendResult.success ? "ok" : "fail"}`);
        if (!sendResult.success) leadErrors.push(`email to ${email}: ${sendResult.error}`);
      }
    }

    if (type === "all" || type === "sms") {
      const aiBody = await callOpenAI("", "");
      const body = (aiBody || pick(SMS_TEMPLATES)(lead.name || "there")).slice(0, 160);
      const sendResult = await sendSms({ to: lead.phone, body });
      await insertMessage({
        lead_id: lead.id, channel: "sms", recipient: lead.phone, body,
        status: sendResult.success ? "sent" : "failed",
        sender: process.env.TWILIO_SMS_NUMBER || "",
        sent_at: sendResult.success ? new Date().toISOString() : null,
        error: sendResult.error || null,
        created_at: new Date().toISOString(),
      });
      channels.push(`sms:${lead.phone}:${sendResult.success ? "ok" : "fail"}`);
      if (!sendResult.success) leadErrors.push(`sms: ${sendResult.error}`);
    }

    if (type === "all" || type === "whatsapp") {
      const aiBody = await callOpenAI("", "");
      const body = (aiBody || pick(WA_TEMPLATES)(lead.name || "there")).slice(0, 300);
      const sendResult = await sendWhatsApp({ to: lead.phone, body });
      await insertMessage({
        lead_id: lead.id, channel: "whatsapp", recipient: lead.phone, body,
        status: sendResult.success ? "sent" : "failed",
        sender: process.env.TWILIO_WHATSAPP_NUMBER || "",
        sent_at: sendResult.success ? new Date().toISOString() : null,
        error: sendResult.error || null,
        created_at: new Date().toISOString(),
      });
      channels.push(`whatsapp:${lead.phone}:${sendResult.success ? "ok" : "fail"}`);
      if (!sendResult.success) leadErrors.push(`whatsapp: ${sendResult.error}`);
    }

    await updateLead(lead.id, {
      outreach_status: "contacted", outreach_channels: channels,
      outreach_sent_at: new Date().toISOString(),
    });

    results.push({ lead_id: lead.id, name: lead.name, channels, errors: leadErrors });
    if (leadErrors.length > 0) errors.push(...leadErrors);
  }

  await dbLog("outreach", `${results.length} leads processed, ${errors.length} errors`);
  return NextResponse.json({ status: "ok", message: `${results.length} leads processed`, results, errors: errors.length > 0 ? errors : undefined });
}
