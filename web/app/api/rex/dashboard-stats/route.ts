import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const AUTH = "Bearer zeniva-secret-2025";

/**
 * Rex Dashboard Stats API
 * Returns real-time dashboard metrics directly from Supabase
 * Replaces stale VPS data with fresh queries
 */
export async function GET(req: NextRequest) {
  // Auth check
  const authHeader = req.headers.get("authorization");
  const sessionCookie = req.cookies.get("zeniva_session")?.value || "";
  const rolesCookie = req.cookies.get("zeniva_roles")?.value || "";

  const isInternalAuth = authHeader === AUTH;
  const hasAgentSession = sessionCookie.length > 10 &&
    (rolesCookie.includes("hq") || rolesCookie.includes("agent") || rolesCookie.includes("admin"));

  if (!isInternalAuth && !hasAgentSession) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const stats: any = {
    timestamp: new Date().toISOString(),
    active_clients: 0,
    total_leads: 0,
    leads_today: 0,
    emails_sent: 0,
    emails_today: 0,
    sms_sent: 0,
    sms_today: 0,
    commission_pipeline: 0,
    total_messages: 0,
    open_dossiers: 0,
    followups_due: 0,
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  try {
    // 1. Active Clients - count from clients table
    const { count: clientsCount } = await supabase
      .from("clients")
      .select("*", { count: "exact", head: true });

    stats.active_clients = clientsCount || 0;

    // 2. Total Leads - count all leads
    const { count: totalLeadsCount } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true });

    stats.total_leads = totalLeadsCount || 0;

    // 3. Leads added today
    const { count: leadsToday } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .gte("created_at", todayISO);

    stats.leads_today = leadsToday || 0;

    // 4. Emails sent (from comms_log + email_campaign_recipients)
    try {
      const { count: commsCount } = await supabase
        .from("comms_log")
        .select("*", { count: "exact", head: true })
        .eq("status", "sent");
      stats.emails_sent = commsCount || 0;

      const { count: commsToday } = await supabase
        .from("comms_log")
        .select("*", { count: "exact", head: true })
        .eq("status", "sent")
        .gte("created_at", todayISO);
      stats.emails_today = commsToday || 0;
    } catch {
      stats.emails_sent = 0;
      stats.emails_today = 0;
    }

    // 5. SMS sent (from sms_logs if exists, else 0)
    try {
      const { count: smsCount } = await supabase
        .from("sms_logs")
        .select("*", { count: "exact", head: true });
      stats.sms_sent = smsCount || 0;

      const { count: smsToday } = await supabase
        .from("sms_logs")
        .select("*", { count: "exact", head: true })
        .gte("created_at", todayISO);
      stats.sms_today = smsToday || 0;
    } catch {
      stats.sms_sent = 0;
      stats.sms_today = 0;
    }

    // 6. Commission Pipeline - SUM of all open proposals/bookings not yet confirmed
    try {
      const { data: openBookings } = await supabase
        .from("bookings")
        .select("commission_amount")
        .in("status", ["pending", "confirmed", "processing"]);

      if (openBookings && openBookings.length > 0) {
        stats.commission_pipeline = openBookings.reduce(
          (sum: number, b: any) => sum + (Number(b.commission_amount) || 0),
          0
        );
      }
    } catch {
      // Table might not exist or query failed
    }

    // Also check commissions table for pending commissions
    try {
      const { data: pendingCommissions } = await supabase
        .from("commissions")
        .select("amount")
        .eq("status", "pending");

      if (pendingCommissions && pendingCommissions.length > 0) {
        const commSum = pendingCommissions.reduce(
          (sum: number, c: any) => sum + (Number(c.amount) || 0),
          0
        );
        stats.commission_pipeline += commSum;
      }
    } catch {
      // Commissions table might not exist
    }

    // 7. Lina Chats - total messages
    try {
      const { count: messagesCount } = await supabase
        .from("agent_inbox_messages")
        .select("*", { count: "exact", head: true });
      stats.total_messages = messagesCount || 0;
    } catch {
      stats.total_messages = 0;
    }

    // 8. Open dossiers (trips/bookings in progress)
    try {
      const { count: dossiers } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .in("status", ["pending", "confirmed", "processing"]);
      stats.open_dossiers = dossiers || 0;
    } catch {
      stats.open_dossiers = 0;
    }

    // 9. Follow-ups due (bookings/leads with follow_up_date <= today)
    try {
      const { count: followups } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .lte("follow_up_date", new Date().toISOString());
      stats.followups_due = followups || 0;
    } catch {
      stats.followups_due = 0;
    }

    // Log successful stats fetch
    await supabase.from("rex_maintenance_log").insert({
      check_type: "metric_validation",
      status: "success",
      issue_found: null,
      resolution: "Dashboard stats refreshed successfully",
      metadata: stats,
    });

    return NextResponse.json(stats);
  } catch (error: any) {
    // Log error
    await supabase.from("rex_maintenance_log").insert({
      check_type: "metric_validation",
      status: "error",
      issue_found: `Failed to fetch dashboard stats: ${error.message}`,
      resolution: null,
      metadata: { error: error.message },
    });

    return NextResponse.json(
      { error: "Failed to fetch stats", message: error.message },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";
