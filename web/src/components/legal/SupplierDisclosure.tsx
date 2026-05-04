import React from "react";
import Link from "next/link";

type Tone = "light" | "dark";

type SupplierDisclosureProps = {
  supplier?: string | null;
  tone?: Tone;
  className?: string;
};

const TONE_STYLES: Record<Tone, { wrapper: string; label: string; body: string; link: string }> = {
  light: {
    wrapper:
      "rounded-xl border border-slate-200 bg-slate-50 p-4 text-[12px] leading-relaxed",
    label: "text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-500",
    body: "mt-1 text-slate-700",
    link: "underline font-semibold text-slate-900",
  },
  dark: {
    wrapper:
      "rounded-xl border border-white/15 bg-white/5 p-4 text-[12px] leading-relaxed text-white/80",
    label: "text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/55",
    body: "mt-1 text-white/85",
    link: "underline font-semibold text-white",
  },
};

export default function SupplierDisclosure({
  supplier,
  tone = "light",
  className = "",
}: SupplierDisclosureProps) {
  const styles = TONE_STYLES[tone];
  const supplierLabel = (supplier && supplier.trim()) || "the partner supplier";

  return (
    <aside
      className={`${styles.wrapper} ${className}`}
      role="contentinfo"
      aria-label="Supplier and platform disclosure"
    >
      <p className={styles.label}>Supplier disclosure</p>
      <p className={styles.body}>
        This booking is provided by <strong>{supplierLabel}</strong>. Zeniva
        Travel facilitates this transaction as a technology platform — Zeniva
        does not operate, own or fulfill the underlying travel service. The
        supplier&apos;s own terms, fare rules and cancellation policies apply.
      </p>
      <p className={`${styles.body} mt-2`}>
        See our{" "}
        <Link href="/disclaimer" className={styles.link}>
          Platform Disclaimer
        </Link>{" "}
        and{" "}
        <Link href="/terms" className={styles.link}>
          Terms
        </Link>{" "}
        for the full intermediary framework.
      </p>
    </aside>
  );
}
