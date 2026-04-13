import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "../../../../src/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { client } = getSupabaseAdminClient();
    const url = new URL(request.url);
    const range = parseInt(url.searchParams.get("range") || "30");

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - range);
    const prevCutoff = new Date(cutoff);
    prevCutoff.setDate(prevCutoff.getDate() - range);

    // All campaigns
    const { data: campaigns } = await client
      .from("email_campaigns")
      .select("id, name, status, audience_type, recipient_count, sent_count, failed_count, sent_at, created_at")
      .order("created_at", { ascending: false });

    const all = campaigns || [];

    // Current period
    const current = all.filter((c: any) => new Date(c.created_at) >= cutoff);
    const previous = all.filter((c: any) => new Date(c.created_at) >= prevCutoff && new Date(c.created_at) < cutoff);

    const currentSent = current.reduce((s: number, c: any) => s + (c.sent_count || 0), 0);
    const previousSent = previous.reduce((s: number, c: any) => s + (c.sent_count || 0), 0);
    const currentFailed = current.reduce((s: number, c: any) => s + (c.failed_count || 0), 0);

    const totalSent = all.reduce((s: number, c: any) => s + (c.sent_count || 0), 0);
    const totalFailed = all.reduce((s: number, c: any) => s + (c.failed_count || 0), 0);
    const deliveryRate = totalSent + totalFailed > 0 ? Math.round((totalSent / (totalSent + totalFailed)) * 1000) / 10 : 0;

    // Trend percentages
    const sentTrend = previousSent > 0 ? Math.round(((currentSent - previousSent) / previousSent) * 100) : currentSent > 0 ? 100 : 0;
    const campaignTrend = previous.length > 0 ? Math.round(((current.length - previous.length) / previous.length) * 100) : current.length > 0 ? 100 : 0;

    // Daily send volume
    const dailyVolume: { date: string; sent: number; failed: number }[] = [];
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayCampaigns = all.filter((c: any) => c.sent_at && c.sent_at.startsWith(dateStr));
      dailyVolume.push({
        date: d.toLocaleDateString("en-CA", { month: "short", day: "numeric" }),
        sent: dayCampaigns.reduce((s: number, c: any) => s + (c.sent_count || 0), 0),
        failed: dayCampaigns.reduce((s: number, c: any) => s + (c.failed_count || 0), 0),
      });
    }

    // Audience breakdown
    const audienceBreakdown = ["travelers", "agents", "agencies"].map((type) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: all.filter((c: any) => c.audience_type === type).length,
    })).filter((a) => a.value > 0);

    // Top campaigns
    const sentCampaigns = all
      .filter((c: any) => c.status === "sent" && c.sent_count > 0)
      .sort((a: any, b: any) => b.sent_count - a.sent_count)
      .slice(0, 10)
      .map((c: any) => ({
        id: c.id,
        name: c.name,
        audience_type: c.audience_type,
        recipient_count: c.recipient_count,
        sent_count: c.sent_count,
        failed_count: c.failed_count,
        success_rate: c.sent_count + c.failed_count > 0 ? Math.round((c.sent_count / (c.sent_count + c.failed_count)) * 1000) / 10 : 0,
        sent_at: c.sent_at,
      }));

    // Recent comms activity
    const { data: recentComms } = await client
      .from("comms_log")
      .select("id, type, recipient, subject, status, created_at")
      .order("created_at", { ascending: false })
      .limit(15);

    return NextResponse.json({
      stats: {
        totalCampaigns: all.length,
        totalSent,
        totalFailed,
        deliveryRate,
        currentPeriodSent: currentSent,
        currentPeriodCampaigns: current.length,
        sentTrend,
        campaignTrend,
      },
      dailyVolume,
      audienceBreakdown,
      topCampaigns: sentCampaigns,
      recentActivity: recentComms || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
