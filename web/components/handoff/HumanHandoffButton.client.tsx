"use client";
import { useState } from "react";
import HumanHandoffModal from "./HumanHandoffModal.client";
import { getHandoffDict, type HandoffLocale } from "./handoffDict";

const GOLD_GRADIENT = "linear-gradient(135deg, #E6B85A, #C9941F)";

export interface HumanHandoffButtonProps {
  /**
   * Snapshot of the current cart / proposal. Stored on the handoff request
   * so the agent sees exactly what the visitor was about to pay for.
   */
  cartSnapshot: Record<string, unknown>;
  /** Optional client identity for prefilling the lead form. */
  clientName?: string;
  clientEmail?: string;
  clientId?: string;
  /** Override the source page identifier saved with the request. */
  sourcePage?: string;
  locale?: HandoffLocale;
  /** Optional className additions for tailoring inside specific page layouts. */
  className?: string;
  /** When true, renders flat (no gradient). Useful next to a primary "Pay" CTA. */
  variant?: "primary" | "secondary";
}

/**
 * Drop-in CTA: place next to your existing "Pay" button on any recap /
 * confirmation page. On click, opens the handoff modal which lets the
 * visitor pick chat or call (with no-agent fallback for lead capture).
 */
export default function HumanHandoffButton({
  cartSnapshot,
  clientName,
  clientEmail,
  clientId,
  sourcePage,
  locale = "en",
  className = "",
  variant = "primary",
}: HumanHandoffButtonProps) {
  const [open, setOpen] = useState(false);
  const dict = getHandoffDict(locale);

  const baseClass =
    "inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-base font-black shadow-lg transition hover:scale-[1.02] active:scale-[0.99]";
  const styleProps =
    variant === "primary"
      ? { style: { background: GOLD_GRADIENT, color: "#0B1B4D" } }
      : {};
  const variantClass =
    variant === "secondary"
      ? "border-2 border-slate-900 bg-white text-slate-900 hover:bg-slate-900 hover:text-white"
      : "";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${baseClass} ${variantClass} ${className}`}
        {...styleProps}
      >
        <span aria-hidden>🧑‍💼</span> {dict.primaryButton}
      </button>
      {open ? (
        <HumanHandoffModal
          locale={locale}
          cartSnapshot={cartSnapshot}
          clientName={clientName}
          clientEmail={clientEmail}
          clientId={clientId}
          sourcePage={sourcePage}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
