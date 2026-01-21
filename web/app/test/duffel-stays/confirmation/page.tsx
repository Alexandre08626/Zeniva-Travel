import Link from "next/link";
import fs from "fs";
import path from "path";
import BookingConfirmation from "../../../../src/components/stays/BookingConfirmation";
import { TITLE_TEXT, MUTED_TEXT, PREMIUM_BLUE } from "../../../../src/design/tokens";

async function loadBooking(docId?: string) {
  try {
    const artifactsDir = path.resolve(process.cwd(), "scripts", "artifacts");
    const byId = docId ? path.join(artifactsDir, `booking-${docId}.json`) : null;
    const fallback = path.join(artifactsDir, "booking.json");
    if (byId && fs.existsSync(byId)) {
      return JSON.parse(fs.readFileSync(byId, "utf8"));
    }
    if (fs.existsSync(fallback)) {
      return JSON.parse(fs.readFileSync(fallback, "utf8"));
    }
  } catch (err) {
    console.error("Failed to load booking artifact:", err);
  }
  return null;
}

export default async function ConfirmationPage({ searchParams }: { searchParams: Promise<{ docId?: string }> }) {
  const { docId } = await searchParams;
  const booking = await loadBooking(docId);

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#F3F6FB" }}>
      <div className="mx-auto max-w-3xl px-5 py-8">
        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold" style={{ color: TITLE_TEXT }}>Booking confirmation</h1>

          {!docId ? (
            <div className="mt-6">
              <p className="text-sm" style={{ color: MUTED_TEXT }}>No confirmation id provided.</p>
              <p className="text-sm mt-3">Try <code>?docId=mock-booking-123</code> for a demo.</p>
            </div>
          ) : booking ? (
            <div className="mt-6 space-y-6">
              <BookingConfirmation booking={booking} />

              <div className="flex gap-3">
                <a
                  href={`/api/partners/duffel-stays/bookings/mock-pdf?docId=${encodeURIComponent(docId)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full px-4 py-2 text-sm font-bold text-white"
                  style={{ backgroundColor: PREMIUM_BLUE }}
                >
                  Download PDF
                </a>

                <Link href="/documents" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold" style={{ color: TITLE_TEXT }}>
                  Back
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="text-lg font-bold" style={{ color: TITLE_TEXT }}>Confirmation: {docId}</div>
                <div className="text-sm" style={{ color: MUTED_TEXT }}>This is a test confirmation page used by e2e scripts.</div>
              </div>

              <div className="flex gap-3">
                <a
                  href={`/api/partners/duffel-stays/bookings/mock-pdf?docId=${encodeURIComponent(docId)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full px-4 py-2 text-sm font-bold text-white"
                  style={{ backgroundColor: PREMIUM_BLUE }}
                >
                  Download PDF
                </a>

                <Link href="/documents" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold" style={{ color: TITLE_TEXT }}>
                  Back
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
