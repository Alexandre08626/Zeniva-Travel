import { NextResponse } from "next/server";
import { z } from "zod";
import fs from "fs";
import path from "path";
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

    // Persist a copy of the booking artifact for test/demo flows so the confirmation page can read it
    try {
      const artifactsDir = path.resolve(process.cwd(), 'scripts', 'artifacts');
      if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir, { recursive: true });
      const bookingData = result.data;
      const id = bookingData?.id || bookingData?.booking_reference || `booking-${Date.now()}`;
      try {
        fs.writeFileSync(path.join(artifactsDir, `booking-${id}.json`), JSON.stringify(bookingData, null, 2));
      } catch (err: any) {
        console.error('Failed to write booking artifact (id file):', err?.message || err);
      }
      try {
        // also write the canonical last booking file for convenience
        fs.writeFileSync(path.join(artifactsDir, 'booking.json'), JSON.stringify(bookingData, null, 2));
      } catch (err: any) {
        console.error('Failed to write booking artifact (last booking):', err?.message || err);
      }
    } catch (err: any) {
      console.error('Failed to persist booking artifact directory:', err?.message || err);
    }

    return NextResponse.json({ ok: true, booking: result.data });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 502 });
  }
}

export const runtime = "nodejs";