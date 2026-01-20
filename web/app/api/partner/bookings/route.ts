import { NextResponse } from "next/server";

// DEV NOTE / TODOs:
// - In-memory store here is for development only.
// - TODO: Add database persistence, server-side auth, RBAC checks, and audit logging.

import { bookings } from "../../../../src/lib/devPartnerStore";
// In-memory bookings (dev only) — shared module

export async function GET(req: Request) {
  const url = new URL(req.url);
  const partnerId = url.searchParams.get("partnerId") || req.headers.get("x-zeniva-partner-id");
  if (!partnerId) return NextResponse.json({ error: "partnerId required" }, { status: 400 });
  const results = bookings.filter((b) => b.partnerId === partnerId);
  return NextResponse.json({ data: results });
}

export async function POST(req: Request) {
  const payload = await req.json().catch(() => null);
  if (!payload) return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  const partnerId = payload.partnerId || req.headers.get("x-zeniva-partner-id");
  if (!partnerId) return NextResponse.json({ error: "partnerId required" }, { status: 400 });
  const id = `bk_${Math.random().toString(36).slice(2, 8)}`;
  const now = new Date().toISOString();
  const booking = {
    id,
    partnerId,
    listingId: payload.listingId,
    status: payload.status || "requested",
    guest: payload.guest || {},
    total: payload.total || 0,
    createdAt: now,
    updatedAt: now,
  };
  bookings.push(booking);
  return NextResponse.json({ data: booking }, { status: 201 });
}
