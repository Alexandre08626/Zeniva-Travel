import { NextResponse } from "next/server";
import { z } from "zod";
import { fetchStayRates } from "../../../../../src/lib/duffelClient";

const schema = z.object({
  searchResultId: z.string().trim().min(1, "searchResultId required"),
});

export async function GET(req: Request) {
  if (!process.env.DUFFEL_STAYS_API_KEY && !process.env.DUFFEL_API_KEY) {
    return NextResponse.json({ ok: false, error: "Duffel stays key missing" }, { status: 500 });
  }

  const url = new URL(req.url);
  const parsed = schema.safeParse({
    searchResultId: url.searchParams.get("searchResultId") || "",
  });

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid params", issues: parsed.error.issues }, { status: 400 });
  }

  const { searchResultId } = parsed.data;

  try {
    const result = await fetchStayRates(searchResultId);
    return NextResponse.json({ ok: true, rates: result.data || [] });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 502 });
  }
}

export const runtime = "nodejs";