"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BRAND_BLUE, LIGHT_BG, MUTED_TEXT, TITLE_TEXT } from "../../../../src/design/tokens";

export default function CheckoutConfirmationPage() {
  const searchParams = useSearchParams();
  const [feedback, setFeedback] = useState("");

  const bookingId = searchParams.get("bookingId") || "";
  const invoiceId = searchParams.get("invoiceId") || "";
  const tripId = searchParams.get("tripId") || "";
  const confirmationNumber = searchParams.get("confirmationNumber") || "";

  const links = useMemo(() => {
    const confirmationPdf = `/api/partners/duffel-stays/bookings/mock-pdf?docId=${encodeURIComponent(bookingId || "confirmation")}`;
    const invoicePdf = `/api/partners/duffel-stays/bookings/mock-pdf?docId=${encodeURIComponent(invoiceId || bookingId || "invoice")}`;
    return { confirmationPdf, invoicePdf };
  }, [bookingId, invoiceId]);

  const handleSendEmail = () => {
    const subject = `Zeniva payment confirmation ${confirmationNumber || bookingId || ""}`;
    const body = [
      "Your trip payment is confirmed.",
      "",
      `Confirmation: ${confirmationNumber || bookingId || "N/A"}`,
      `Confirmation PDF: ${typeof window !== "undefined" ? `${window.location.origin}${links.confirmationPdf}` : links.confirmationPdf}`,
      `Invoice PDF: ${typeof window !== "undefined" ? `${window.location.origin}${links.invoicePdf}` : links.invoicePdf}`,
      `Traveler dashboard: ${typeof window !== "undefined" ? `${window.location.origin}/documents` : "/documents"}`,
    ].join("\n");

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
          title: "Zeniva payment confirmation",
          text: `Confirmation ${confirmationNumber || bookingId || ""}`,
          url: shareUrl,
        });
        setFeedback("Shared successfully.");
        return;
      }
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setFeedback("Confirmation link copied.");
      }
    } catch {
      setFeedback("Unable to share right now.");
    }
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: LIGHT_BG }}>
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-5">
        <section className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">Payment confirmation</p>
          <h1 className="mt-1 text-3xl font-black" style={{ color: TITLE_TEXT }}>Confirmation complete</h1>
          <p className="mt-2 text-sm" style={{ color: MUTED_TEXT }}>
            Your payment is confirmed. You can download, send, or share the confirmation and invoice below.
          </p>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: MUTED_TEXT }}>Reference</div>
              <div className="text-sm font-bold" style={{ color: TITLE_TEXT }}>{confirmationNumber || bookingId || "N/A"}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: MUTED_TEXT }}>Booking Id</div>
              <div className="text-sm font-bold" style={{ color: TITLE_TEXT }}>{bookingId || "N/A"}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: MUTED_TEXT }}>Trip Id</div>
              <div className="text-sm font-bold" style={{ color: TITLE_TEXT }}>{tripId || "N/A"}</div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
          <div className="text-sm font-semibold" style={{ color: TITLE_TEXT }}>Actions</div>
          <div className="flex flex-wrap gap-2">
            <a
              href={links.confirmationPdf}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full px-4 py-2 text-xs font-bold text-white"
              style={{ backgroundColor: BRAND_BLUE }}
            >
              Download confirmation
            </a>
            <a
              href={links.invoicePdf}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold"
              style={{ color: TITLE_TEXT }}
            >
              Download invoice
            </a>
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

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm" style={{ color: TITLE_TEXT }}>
            You can now find this confirmation and invoice in your traveler dashboard documents.
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href="/documents"
              className="rounded-full px-4 py-2 text-xs font-bold text-white"
              style={{ backgroundColor: BRAND_BLUE }}
            >
              Open traveler dashboard
            </Link>
            <Link
              href={tripId ? `/proposals/${tripId}/review` : "/proposals"}
              className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold"
              style={{ color: TITLE_TEXT }}
            >
              Back to trip
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
