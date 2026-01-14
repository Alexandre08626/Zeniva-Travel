import { NextResponse } from "next/server";
import { z } from "zod";
import { createStayQuote } from "../../../../../src/lib/duffelClient";

const schema = z.object({
  rateId: z.string().trim().min(1, "rateId required"),
});

export async function POST(req: Request) {
  if (!process.env.DUFFEL_STAYS_API_KEY && !process.env.DUFFEL_API_KEY) {
    return NextResponse.json({ ok: false, error: "Duffel stays key missing" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "invalid params", issues: parsed.error.issues }, { status: 400 });
    }

    const { rateId } = parsed.data;
    const result = await createStayQuote(rateId);
    return NextResponse.json({ ok: true, quote: result.data });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 502 });
  }
}

export const runtime = "nodejs";