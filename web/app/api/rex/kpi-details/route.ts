import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const AUTH = "Bearer zeniva-secret-2025";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const sessionCookie = req.cookies.get("zeniva_session")?.value || "";
  const rolesCookie = req.cookies.get("zeniva_roles")?.value || "";
  const isInternalAuth = authHeader === AUTH;
  const hasAgentSession = sessionCookie.length > 10 &&
    (rolesCookie.includes("hq") || rolesCookie.includes("agent") || rolesCookie.includes("admin"));
  if (!isInternalAuth && !hasAgentSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const kpi = req.nextUrl.searchParams.get("kpi");
  if (!kpi) return NextResponse.json({ error: "kpi param required" }, { status: 400 });

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    if (kpi === "clients") {
      const { data } = await supabase
        .from("clients")
        .select("id, name, email, phone, origin, primary_division, lead_source, created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      return NextResponse.json({ kpi, items: data || [] });
    }

    if (kpi === "leads") {
      const { data } = await supabase
        .from("leads")
        .select("id, email, first_name, last_name, phone, destination, status, source, language, created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      return NextResponse.json({ kpi, items: data || [] });
    }

    if (kpi === "emails") {
      const { data: campaigns } = await supabase
        .from("email_campaigns")
        .select("id, name, status, audience_type, recipient_count, sent_count, failed_count, subject, sent_at, created_at")
        .order("created_at", { ascending: false })
        .limit(20);

      const { data: recentEmails } = await supabase
        .from("comms_log")
        .select("id, recipient, subject, status, created_at")
        .order("created_at", { ascending: false })
        .limit(50);

      return NextResponse.json({ kpi, campaigns: campaigns || [], recent: recentEmails || [] });
    }

    if (kpi === "sms") {
      // Try sms_logs, fallback empty
      try {
        const { data } = await supabase
          .from("sms_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);
        return NextResponse.json({ kpi, items: data || [] });
      } catch {
        return NextResponse.json({ kpi, items: [] });
      }
    }

    if (kpi === "commissions") {
      let bookings: any[] = [];
      let commissions: any[] = [];
      try {
        const { data } = await supabase
          .from("bookings")
          .select("id, status, commission_amount, created_at")
          .in("status", ["pending", "confirmed", "processing"])
          .order("created_at", { ascending: false })
          .limit(50);
        bookings = data || [];
      } catch { /* table might not exist */ }
      try {
        const { data } = await supabase
          .from("commissions")
          .select("id, amount, status, created_at")
          .order("created_at", { ascending: false })
          .limit(50);
        commissions = data || [];
      } catch { /* table might not exist */ }
      return NextResponse.json({ kpi, bookings, commissions });
    }

    if (kpi === "chats") {
      const { data } = await supabase
        .from("agent_inbox_messages")
        .select("id, channel_id, sender, content, created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      return NextResponse.json({ kpi, items: data || [] });
    }

    return NextResponse.json({ error: "Unknown kpi" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
