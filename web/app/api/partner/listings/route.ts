import { NextResponse } from "next/server";

// DEV NOTE / TODOs:
// - This in-memory store is temporary for the partner portal MVP.
// - TODO: Replace with a persistent DB (Postgres + Prisma) and implement server-side auth/session checks.
// - TODO: Enforce RBAC server-side using session and user roles, and audit all sensitive actions.

import { listings } from "../../../../src/lib/devPartnerStore";
// In-memory store (dev only) — shared module


export async function GET(req: Request) {
  const url = new URL(req.url);
  const partnerId = url.searchParams.get("partnerId") || req.headers.get("x-zeniva-partner-id");
  if (!partnerId) {
    return NextResponse.json({ error: "partnerId required" }, { status: 400 });
  }
  const results = listings.filter((l) => l.partnerId === partnerId);
  return NextResponse.json({ data: results });
}

export async function POST(req: Request) {
  const payload = await req.json().catch(() => null);
  if (!payload) return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  const partnerId = payload.partnerId || req.headers.get("x-zeniva-partner-id");
  if (!partnerId) return NextResponse.json({ error: "partnerId required" }, { status: 400 });

  const id = `lst_${Math.random().toString(36).slice(2, 8)}`;
  const now = new Date().toISOString();
  const newListing = {
    id,
    partnerId,
    type: payload.type || "home",
    title: payload.title || "Untitled listing",
    status: payload.status || "draft",
    createdAt: now,
    updatedAt: now,
    data: payload.data || {},
  };
  listings.push(newListing);
  return NextResponse.json({ data: newListing }, { status: 201 });
}

export async function PATCH(req: Request) {
  const payload = await req.json().catch(() => null);
  if (!payload) return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  const id = payload.id || payload.listingId;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const idx = listings.findIndex((l) => l.id === id);
  if (idx < 0) return NextResponse.json({ error: "listing not found" }, { status: 404 });

  const existing = listings[idx];
  const updated = { ...existing, ...payload, updatedAt: new Date().toISOString() };
  listings[idx] = updated;

  return NextResponse.json({ data: updated });
}
