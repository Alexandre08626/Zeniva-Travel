import { NextRequest, NextResponse } from "next/server";
import { getSessionCookieName, verifySession } from "../../../src/lib/server/auth";
import { getSupabaseAdminClient } from "../../../src/lib/supabase/server";

function getSessionEmailFromRequest(request: NextRequest) {
  const cookies = request.headers.get("cookie") || "";
  const sessionToken = cookies
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${getSessionCookieName()}=`))
    ?.split("=")[1] || "";
  return verifySession(sessionToken)?.email || "";
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function mergeRecords(base: Record<string, unknown>, patch: Record<string, unknown>) {
  const next = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    if (isRecord(value) && isRecord(next[key])) {
      next[key] = mergeRecords(next[key] as Record<string, unknown>, value);
      continue;
    }
    next[key] = value;
  }
  return next;
}

function getEmailFromRequest(request: NextRequest) {
  const sessionEmail = normalizeEmail(getSessionEmailFromRequest(request));
  if (sessionEmail) return sessionEmail;
  const cookieEmail = request.cookies.get("zeniva_email")?.value || "";
  return cookieEmail ? normalizeEmail(cookieEmail) : "";
}

export async function GET(request: NextRequest) {
  try {
    const email = getEmailFromRequest(request);
    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { client: admin } = getSupabaseAdminClient();
    const { data: account, error } = await admin
      .from("accounts")
      .select("traveler_profile")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      console.error("Supabase user-data fetch error", { message: error.message, email });
      return NextResponse.json({ error: "Failed to load user data" }, { status: 500 });
    }

    const travelerProfile =
      account?.traveler_profile && typeof account.traveler_profile === "object"
        ? (account.traveler_profile as Record<string, unknown>)
        : {};

    const nestedUserData =
      travelerProfile.user_data && typeof travelerProfile.user_data === "object"
        ? (travelerProfile.user_data as Record<string, unknown>)
        : {};

    const data =
      nestedUserData && Object.keys(nestedUserData).length > 0
        ? nestedUserData
        : travelerProfile;

    const tripsState =
      (data?.tripsState as Record<string, unknown> | null | undefined) ||
      (travelerProfile?.tripsState as Record<string, unknown> | null | undefined) ||
      null;

    const workflowState =
      (data?.workflowState as Record<string, unknown> | null | undefined) ||
      (travelerProfile?.workflowState as Record<string, unknown> | null | undefined) ||
      null;

    return NextResponse.json({ data, tripsState, workflowState });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to load user data" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const email = getEmailFromRequest(request);
    const body = await request.json();
    const bodyEmail = body?.email ? normalizeEmail(String(body.email)) : "";

    if (!email || !bodyEmail || email !== bodyEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { client: admin } = getSupabaseAdminClient();
    const { data: account, error } = await admin
      .from("accounts")
      .select("id, traveler_profile")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      console.error("Supabase user-data fetch error", { message: error.message, email });
      return NextResponse.json({ error: "Failed to save user data" }, { status: 500 });
    }

    if (!account?.id) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const travelerProfile =
      account.traveler_profile && typeof account.traveler_profile === "object"
        ? (account.traveler_profile as Record<string, unknown>)
        : {};

    const existingUserData =
      travelerProfile.user_data && typeof travelerProfile.user_data === "object"
        ? (travelerProfile.user_data as Record<string, unknown>)
        : {};

    const workflowStatePatch = isRecord(body?.workflowStatePatch) ? body.workflowStatePatch : null;
    const workflowStateFull = isRecord(body?.workflowState) ? body.workflowState : null;
    const existingWorkflowState = isRecord(existingUserData.workflowState)
      ? (existingUserData.workflowState as Record<string, unknown>)
      : {};
    const nextWorkflowState = workflowStateFull
      ? workflowStateFull
      : workflowStatePatch
      ? mergeRecords(existingWorkflowState, workflowStatePatch)
      : existingWorkflowState;

    const nextUserData = {
      ...existingUserData,
      tripsState: body?.tripsState || existingUserData.tripsState || null,
      workflowState: nextWorkflowState,
      updatedAt: new Date().toISOString(),
    };

    const nextTravelerProfile = {
      ...travelerProfile,
      user_data: nextUserData,
    };

    const { error: updateError } = await admin
      .from("accounts")
      .update({ traveler_profile: nextTravelerProfile })
      .eq("id", account.id);

    if (updateError) {
      console.error("Supabase user-data update error", { message: updateError.message, email });
      return NextResponse.json({ error: "Failed to save user data" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to save user data" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
