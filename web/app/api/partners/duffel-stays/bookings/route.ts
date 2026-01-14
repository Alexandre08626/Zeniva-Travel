import { NextResponse } from "next/server";
import { z } from "zod";
import { createStayBooking } from "../../../../../src/lib/duffelClient";

const guestSchema = z.object({
  given_name: z.string().trim().min(1, "given_name required"),
  family_name: z.string().trim().min(1, "family_name required"),
  born_on: z.string().trim().min(1, "born_on required"),
});

const schema = z.object({
  quote_id: z.string().trim().min(1, "quote_id required"),
  phone_number: z.string().trim().min(1, "phone_number required"),
  guests: z.array(guestSchema).min(1, "at least one guest required"),
  email: z.string().email("valid email required"),
  accommodation_special_requests: z.string().optional(),
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

    const result = await createStayBooking(parsed.data);
    return NextResponse.json({ ok: true, booking: result.data });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 502 });
  }
}

export const runtime = "nodejs";