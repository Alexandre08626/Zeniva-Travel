import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSessionCookieName, verifySession } from "../../../../src/lib/server/auth";
import { requireRbacPermission } from "../../../../src/lib/server/rbac";
import { normalizeRbacRole } from "../../../../src/lib/rbac";
import { getSupabaseAdminClient } from "../../../../src/lib/supabase/server";

const VPS_BASE = "https://vmi3097009.contaboserver.net";
const VPS_AUTH = "Bearer zeniva-secret-2025";

function getSession(request: Request) {
  const cookies = request.headers.get("cookie") || "";
  const token = cookies
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${getSessionCookieName()}=`))
    ?.split("=")[1] || "";
  return verifySession(token);
}

/**
 * GET — list all influencer community content
 * Public to all influencers (requires referrals:read)
 */
export async function GET(request: NextRequest) {
  try {
    const gate = await requireRbacPermission(request, "referrals:read");
    if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

    const session = getSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { client: admin } = getSupabaseAdminClient();

    const url = new URL(request.url);
    const filter = url.searchParams.get("filter") || "all"; // all | mine | trending | reposted
    const page = Math.max(1, Number(url.searchParams.get("page") || 1));
    const limit = 30;
    const offset = (page - 1) * limit;

    let query = admin
      .from("influencer_content")
      .select("*, accounts!influencer_content_user_id_fkey(name, email)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (filter === "mine") {
      query = query.eq("user_id", session.id);
    } else if (filter === "trending") {
      query = query.order("views", { ascending: false });
    } else if (filter === "reposted") {
      query = query.eq("reposted", true);
    }

    const { data, count, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      data: data || [],
      total: count || 0,
      page,
      pages: Math.ceil((count || 0) / limit),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}

/**
 * POST — upload new content (video or image)
 * Uploads file to VPS, stores metadata in Supabase
 */
export async function POST(request: NextRequest) {
  try {
    const gate = await requireRbacPermission(request, "referrals:read");
    if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

    const session = getSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const title = String(formData.get("title") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const contentType = String(formData.get("content_type") || "video"); // video | image | reel
    const platform = String(formData.get("platform") || ""); // tiktok, instagram, youtube, etc.
    const externalUrl = String(formData.get("external_url") || "").trim(); // optional link to original post

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const { client: admin } = getSupabaseAdminClient();
    const id = `ic-${crypto.randomUUID()}`;
    let fileUrl = "";
    let thumbnailUrl = "";

    // Upload file to VPS if provided
    if (file && file.size > 0) {
      if (file.size > 500 * 1024 * 1024) {
        return NextResponse.json({ error: "File too large (max 500MB)" }, { status: 400 });
      }

      const vpsForm = new FormData();
      vpsForm.append("file", file);
      vpsForm.append("title", title);
      vpsForm.append("source", "influencer-content");
      vpsForm.append("influencer_id", session.id);

      const vpsRes = await fetch(`${VPS_BASE}/video-queue/upload`, {
        method: "POST",
        headers: { Authorization: VPS_AUTH },
        body: vpsForm,
      });

      if (vpsRes.ok) {
        const vpsData = await vpsRes.json();
        fileUrl = vpsData?.video_url || vpsData?.url || "";
        thumbnailUrl = vpsData?.thumbnail || "";
      }
    }

    // Insert metadata into Supabase
    const { error } = await admin.from("influencer_content").insert({
      id,
      user_id: session.id,
      title,
      description,
      content_type: contentType,
      platform,
      external_url: externalUrl,
      file_url: fileUrl,
      thumbnail_url: thumbnailUrl,
      file_name: file?.name || "",
      file_size: file?.size || 0,
      status: "published", // influencer content is immediately visible to community
      reposted: false,
      views: 0,
      likes: 0,
      created_at: new Date().toISOString(),
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, id });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Upload failed" }, { status: 500 });
  }
}

/**
 * PATCH — HQ-only actions: repost, feature, delete
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = getSession(request);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const roles = Array.isArray(session.roles) ? session.roles : [];
    const normalized = roles.map((r: string) => normalizeRbacRole(r)).filter(Boolean) as string[];
    const isHQ = normalized.includes("hq") || normalized.includes("admin");

    const body = await request.json();
    const { contentId, action } = body; // action: repost | unrepost | feature | delete

    const { client: admin } = getSupabaseAdminClient();

    if (action === "repost" || action === "unrepost") {
      if (!isHQ) return NextResponse.json({ error: "Only HQ can repost content" }, { status: 403 });
      await admin
        .from("influencer_content")
        .update({ reposted: action === "repost", reposted_at: action === "repost" ? new Date().toISOString() : null })
        .eq("id", contentId);
      return NextResponse.json({ ok: true });
    }

    if (action === "feature") {
      if (!isHQ) return NextResponse.json({ error: "Only HQ can feature content" }, { status: 403 });
      await admin
        .from("influencer_content")
        .update({ featured: true, featured_at: new Date().toISOString() })
        .eq("id", contentId);
      return NextResponse.json({ ok: true });
    }

    if (action === "delete") {
      // Influencer can delete own, HQ can delete any
      if (!isHQ) {
        const { data: content } = await admin.from("influencer_content").select("user_id").eq("id", contentId).single();
        if (content?.user_id !== session.id) {
          return NextResponse.json({ error: "You can only delete your own content" }, { status: 403 });
        }
      }
      await admin.from("influencer_content").delete().eq("id", contentId);
      return NextResponse.json({ ok: true });
    }

    if (action === "view") {
      await admin.rpc("increment_content_views", { content_id: contentId });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Action failed" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
