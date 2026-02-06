import { NextResponse } from "next/server";
import crypto from "crypto";
import { bookingRequests, type BookingRequest, type BookingRequestStatus, type BookingPaymentStatus } from "../../../src/lib/devBookingRequests";
import { assertBackendEnv } from "../../../src/lib/server/db";
import { requireRbacPermission } from "../../../src/lib/server/rbac";
import { normalizeRbacRole } from "../../../src/lib/rbac";

function isHQorAdmin(roles: string[]) {
  const normalized = roles.map((role) => normalizeRbacRole(role)).filter(Boolean) as string[];
  return normalized.includes("hq") || normalized.includes("admin");
}

function canUpdateStatus(status: BookingRequestStatus, current: BookingRequestStatus) {
  if (current === "confirmed_paid") return false;
  if (status === "approved" || status === "needs_changes" || status === "rejected") return true;
  return false;
}

export async function GET(request: Request) {
  try {
    assertBackendEnv();
    const gate = await requireRbacPermission(request, "bookings:all");
    if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

    const session = gate.session;
    const roles = Array.isArray(session.roles) ? session.roles : [];
    const allowAll = isHQorAdmin(roles);
    const url = new URL(request.url);
    const status = url.searchParams.get("status") || "";

    let data = bookingRequests;
    if (!allowAll) {
      data = data.filter((item) => item.requestedBy && item.requestedBy.toLowerCase() === session.email.toLowerCase());
    }
    if (status) {
      data = data.filter((item) => item.status === status);
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to load booking requests" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    assertBackendEnv();
    const gate = await requireRbacPermission(request, "bookings:all");
    if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

    const body = await request.json();
    const title = String(body?.title || "").trim();
    const clientName = String(body?.clientName || "").trim();
    const source = body?.source === "api"
      ? "api"
      : body?.source === "lina"
        ? "lina"
        : body?.source === "traveler"
          ? "traveler"
          : "agent";
    const provider = String(body?.provider || "unknown").trim();
    const totalAmount = Number(body?.totalAmount || 0);
    const currency = String(body?.currency || "USD").toUpperCase();
    const paymentStatus = (body?.paymentStatus || "unknown") as BookingPaymentStatus;
    const confirmationReference = body?.confirmationReference ? String(body.confirmationReference) : undefined;

    if (!title || !clientName || !provider || !Number.isFinite(totalAmount)) {
      return NextResponse.json({ error: "Missing booking request fields" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const status: BookingRequestStatus = source === "api"
      ? paymentStatus === "paid"
        ? "confirmed_paid"
        : "confirmed_unpaid"
      : "pending_hq";

    const record: BookingRequest = {
      id: `br-${crypto.randomUUID()}`,
      title,
      clientName,
      dossierId: body?.dossierId ? String(body.dossierId) : undefined,
      source,
      provider,
      status,
      paymentStatus: paymentStatus || "unknown",
      confirmationReference,
      requestedBy: body?.requestedBy ? String(body.requestedBy) : gate.session.email,
      totalAmount,
      currency,
      createdAt: now,
      updatedAt: now,
    };

    bookingRequests.unshift(record);
    return NextResponse.json({ data: record }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to create booking request" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    assertBackendEnv();
    const gate = await requireRbacPermission(request, "bookings:all");
    if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

    const roles = Array.isArray(gate.session.roles) ? gate.session.roles : [];
    if (!isHQorAdmin(roles)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const id = String(body?.id || "").trim();
    const status = body?.status as BookingRequestStatus | undefined;
    const flag = body?.flagged === true;

    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const idx = bookingRequests.findIndex((item) => item.id === id);
    if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const existing = bookingRequests[idx];
    if (status) {
      if (!canUpdateStatus(status, existing.status)) {
        return NextResponse.json({ error: "Invalid status transition" }, { status: 400 });
      }
      existing.status = status;
      existing.updatedAt = new Date().toISOString();
      if (status === "approved") {
        existing.approvedBy = gate.session.email;
        existing.approvedAt = existing.updatedAt;
      }
    }
    if (flag) {
      existing.flagged = true;
      existing.updatedAt = new Date().toISOString();
    }

    bookingRequests[idx] = existing;
    return NextResponse.json({ data: existing });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to update booking request" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
