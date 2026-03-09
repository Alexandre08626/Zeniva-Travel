import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Lazy client — avoids module-level crash during build when env vars aren't available
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

// Fallback file storage if Supabase table doesn't exist yet
const SUBS_FILE = "/tmp/zeniva_push_subs.json";
function readSubs(): any[] {
  try { return JSON.parse(fs.readFileSync(SUBS_FILE, "utf8")); } catch { return []; }
}
function writeSubs(subs: any[]) {
  fs.writeFileSync(SUBS_FILE, JSON.stringify(subs), "utf8");
}

export async function POST(req: NextRequest) {
  try {
    const { subscription, userEmail: bodyEmail } = await req.json();
    if (!subscription?.endpoint) {
      return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
    }
    // Also try to get email from cookie
    const cookieEmail = req.cookies.get("zeniva_email")?.value || null;
    const userEmail = bodyEmail || cookieEmail || null;

    // Try Supabase first
    const supabase = getSupabase();
    try {
      if (!supabase) throw new Error("no supabase");
      const { error } = await supabase
        .from("push_subscriptions")
        .upsert({
          endpoint: subscription.endpoint,
          subscription: JSON.stringify(subscription),
          user_email: userEmail || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: "endpoint" });

      if (!error) return NextResponse.json({ ok: true, storage: "supabase" });
    } catch { /* fall through to file */ }

    // Fallback: local file
    const subs = readSubs().filter((s: any) => s.endpoint !== subscription.endpoint);
    subs.push({ endpoint: subscription.endpoint, subscription, userEmail: userEmail || null });
    writeSubs(subs);

    return NextResponse.json({ ok: true, storage: "file" });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// GET: VAPID public key
export async function GET() {
  return NextResponse.json({ publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "" });
}
