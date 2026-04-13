import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "../../../../src/lib/supabase/server";

export async function GET() {
  try {
    const { client } = getSupabaseAdminClient();

    // Fetch all data in parallel
    const [campaignsRes, commsRes, contactsRes, leadsRes, clientsRes] = await Promise.all([
      client.from("email_campaigns").select("id, name, status, audience_type, recipient_count, sent_count, failed_count, sent_at, created_at").order("created_at", { ascending: false }),
      client.from("comms_log").select("id, type, recipient, subject, status, created_at").order("created_at", { ascending: false }).limit(20),
      client.from("leads_business").select("id", { count: "exact", head: true }),
      client.from("leads").select("id", { count: "exact", head: true }),
      client.from("clients").select("id", { count: "exact", head: true }),
    ]);

    const campaigns = campaignsRes.data || [];
    const commsLog = commsRes.data || [];

    const totalSent = campaigns.reduce((s: number, c: any) => s + (c.sent_count || 0), 0);
    const totalFailed = campaigns.reduce((s: number, c: any) => s + (c.failed_count || 0), 0);
    const deliveryRate = totalSent + totalFailed > 0 ? Math.round((totalSent / (totalSent + totalFailed)) * 1000) / 10 : 0;
    const activeCampaigns = campaigns.filter((c: any) => c.status === "sending" || c.status === "scheduled").length;
    const sentCampaigns = campaigns.filter((c: any) => c.status === "sent").length;

    // Weekly send volume (last 8 weeks)
    const weeklyVolume: { week: string; sent: number }[] = [];
    const now = new Date();
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      const label = weekStart.toLocaleDateString("en-CA", { month: "short", day: "numeric" });
      const sentInWeek = campaigns
        .filter((c: any) => c.sent_at && new Date(c.sent_at) >= weekStart && new Date(c.sent_at) < weekEnd)
        .reduce((s: number, c: any) => s + (c.sent_count || 0), 0);
      weeklyVolume.push({ week: label, sent: sentInWeek });
    }

    // Audience breakdown
    const audienceBreakdown = ["travelers", "agents", "agencies"].map((type) => ({
      type,
      campaigns: campaigns.filter((c: any) => c.audience_type === type).length,
      sent: campaigns.filter((c: any) => c.audience_type === type).reduce((s: number, c: any) => s + (c.sent_count || 0), 0),
    }));

    return NextResponse.json({
      stats: {
        totalCampaigns: campaigns.length,
        sentCampaigns,
        activeCampaigns,
        totalSent,
        totalFailed,
        deliveryRate,
        totalAgencies: contactsRes.count || 0,
        totalLeads: leadsRes.count || 0,
        totalClients: clientsRes.count || 0,
      },
      recentActivity: commsLog,
      weeklyVolume,
      audienceBreakdown,
      recentCampaigns: campaigns.slice(0, 5),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
