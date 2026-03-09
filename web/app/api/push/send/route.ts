import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";
import fs from "fs";

// Lazy — avoids module-level crash during build
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

function getVapid() {
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const sub = process.env.VAPID_SUBJECT || "mailto:info@zeniva.ca";
  if (pub && priv) {
    webpush.setVapidDetails(sub, pub, priv);
    return true;
  }
  return false;
}

const SUBS_FILE = "/tmp/zeniva_push_subs.json";
function readFileSubs(): any[] {
  try { return JSON.parse(fs.readFileSync(SUBS_FILE, "utf8")); } catch { return []; }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== "Bearer zeniva-secret-2025") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, body, url, targetEmail, icon, tag } = await req.json();

    getVapid();
    const supabase = getSupabase();

    // Get subscriptions from Supabase
    let subs: any[] = [];
    try {
      if (!supabase) throw new Error("no supabase");
      let query = supabase.from("push_subscriptions").select("*");
      if (targetEmail) query = query.eq("user_email", targetEmail);
      const { data } = await query;
      subs = data || [];
    } catch { /* ignore */ }

    // Fallback to file
    if (subs.length === 0) {
      const fileSubs = readFileSubs();
      subs = targetEmail ? fileSubs.filter((s: any) => s.userEmail === targetEmail) : fileSubs;
    }

    if (subs.length === 0) {
      return NextResponse.json({ ok: true, sent: 0, message: "No subscriptions" });
    }

    const payload = JSON.stringify({
      title: title || "✈️ Zeniva Travel",
      body: body || "You have a new notification",
      url: url || "/",
      icon: icon || "/icons/icon-192x192.png",
      tag: tag || "zeniva",
    });

    let sent = 0;
    await Promise.allSettled(
      subs.map(async (row: any) => {
        try {
          const sub = typeof row.subscription === "string" ? JSON.parse(row.subscription) : row.subscription;
          await webpush.sendNotification(sub, payload);
          sent++;
        } catch (e: any) {
          if (e.statusCode === 410 || e.statusCode === 404) {
            // Expired — remove
            try {
              if (supabase) await supabase.from("push_subscriptions").delete().eq("endpoint", row.endpoint);
            } catch { /* ignore */ }
          }
        }
      })
    );

    return NextResponse.json({ ok: true, sent, total: subs.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
