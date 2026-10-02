"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BRAND_BLUE, LIGHT_BG, MUTED_TEXT, TITLE_TEXT } from "../../../../src/design/tokens";

// No fake PDFs here: the confirmation and invoice are emailed once the advisor has
// confirmed the booking with the partners.
function CheckoutConfirmationPageInner() {
  const searchParams = useSearchParams();
  const [feedback, setFeedback] = useState("");

  const bookingId = searchParams.get("bookingId") || "";
  const tripId = searchParams.get("tripId") || "";
  const confirmationNumber = searchParams.get("confirmationNumber") || "";

  const handleSendEmail = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://www.zenivatravel.com";
    const subject = `Zeniva trip ${confirmationNumber || bookingId || ""}`.trim();
    const body = [
      `Reference: ${confirmationNumber || bookingId || "N/A"}`,
      tripId ? `Trip: ${origin}/proposals/${tripId}/review` : "",
      `My trips: ${origin}/trips`,
    ].filter(Boolean).join("\n");

    const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    if (typeof window !== "undefined") {
      window.location.href = mailto;
    }
  };

  const handleShare = async () => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: "Zeniva trip",
          text: `Reference ${confirmationNumber || bookingId || ""}`,
          url: shareUrl,
        });
        setFeedback("Shared successfully.");
        return;
      }
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setFeedback("Link copied.");
      }
    } catch {
      setFeedback("Unable to share right now.");
    }
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: LIGHT_BG }}>
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-5">
        <section className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">Payment</p>
          <h1 className="mt-1 text-3xl font-black" style={{ color: TITLE_TEXT }}>Thank you!</h1>
          <p className="mt-2 text-sm" style={{ color: MUTED_TEXT }}>
            Your Zeniva advisor confirms availability with our partners and emails your confirmation and invoice, usually within 24 hours.
          </p>

          {(confirmationNumber || bookingId || tripId) && (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: MUTED_TEXT }}>Reference</div>
                <div className="text-sm font-bold" style={{ color: TITLE_TEXT }}>{confirmationNumber || bookingId || "N/A"}</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: MUTED_TEXT }}>Trip</div>
                <div className="text-sm font-bold" style={{ color: TITLE_TEXT }}>{tripId || "N/A"}</div>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
          <div className="text-sm" style={{ color: TITLE_TEXT }}>
            Once confirmed, your booking appears in My Trips.
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/trips"
              className="rounded-full px-4 py-2 text-xs font-bold text-white"
              style={{ backgroundColor: BRAND_BLUE }}
            >
              Open My Trips
            </Link>
            {tripId && (
              <Link
                href={`/proposals/${tripId}/review`}
                className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold"
                style={{ color: TITLE_TEXT }}
              >
                Back to trip
              </Link>
            )}
            <button
              onClick={handleSendEmail}
              className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold"
              style={{ color: TITLE_TEXT }}
            >
              Send by email
            </button>
            <button
              onClick={handleShare}
              className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold"
              style={{ color: TITLE_TEXT }}
            >
              Share
            </button>
          </div>
          {feedback ? <p className="text-xs" style={{ color: MUTED_TEXT }}>{feedback}</p> : null}
        </section>
      </div>
    </main>
  );
}

export default function CheckoutConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-400">Loading…</div>}>
      <CheckoutConfirmationPageInner />
    </Suspense>
  );
}
