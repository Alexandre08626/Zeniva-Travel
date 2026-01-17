import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: Request) {
  const artifactsDir = path.resolve(process.cwd(), "scripts", "artifacts");
  const url = new URL(req.url);
  const docId = url.searchParams.get('docId');

  // If docId is provided, attempt to find a specific artifact file
  if (docId) {
    const candidates = [
      path.join(artifactsDir, `${docId}.json`),
      path.join(artifactsDir, `booking-${docId}.json`),
      path.join(artifactsDir, `booking_${docId}.json`),
    ];

    for (const p of candidates) {
      try {
        if (fs.existsSync(p)) {
          const raw = fs.readFileSync(p, 'utf-8');
          const booking = JSON.parse(raw);
          return NextResponse.json({ ok: true, booking });
        }
      } catch (err: any) {
        console.error('Failed to read booking artifact', p, err?.message || err);
      }
    }
    // If a docId was specified but not found, return 404
    return NextResponse.json({ ok: false, error: 'booking artifact not found' }, { status: 404 });
  }

  const bookingPath = path.join(artifactsDir, "booking.json");

  try {
    if (fs.existsSync(bookingPath)) {
      const raw = fs.readFileSync(bookingPath, "utf-8");
      const booking = JSON.parse(raw);
      return NextResponse.json({ ok: true, booking });
    }
  } catch (err: any) {
    console.error("Failed to read booking artifact:", err?.message || err);
  }

  // Fallback mock booking (useful for demonstration when no artifact exists)
  const mockBooking = {
    id: "mock-booking-123",
    booking_reference: "REF12345",
    accommodation: { name: "Duffel Test Hotel", address: "Henderson Island" },
    check_in: "2025-06-10",
    check_out: "2025-06-17",
    rooms: 1,
    guests: [{ given_name: "John", family_name: "Doe", born_on: "1985-01-01" }],
    price: { total: "USD 450", tax: "USD 50", fees: "USD 10", due_at_property: "USD 100" },
    cancellation_policy: { refundable: true },
  };

  return NextResponse.json({ ok: true, booking: mockBooking });
}

export const runtime = "nodejs";