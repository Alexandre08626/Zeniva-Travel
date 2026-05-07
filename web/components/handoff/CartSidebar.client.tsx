"use client";

export interface CartSidebarItem {
  label: string;
  detail?: string;
  amount?: string;
}

export interface CartSidebarProps {
  title?: string;
  items: CartSidebarItem[];
  totalLabel?: string;
  totalAmount?: string;
  /** Light mode = on dark backgrounds (in-call). Dark mode = light backgrounds. */
  variant?: "light" | "dark";
}

/**
 * Compact cart preview shown next to the pre-call screen and in the in-call
 * sidebar so both client and agent see exactly the same order.
 */
export default function CartSidebar({
  title = "Your booking",
  items,
  totalLabel,
  totalAmount,
  variant = "light",
}: CartSidebarProps) {
  const isLight = variant === "light";
  return (
    <div
      className={`rounded-2xl border ${
        isLight ? "border-white/10 bg-white/5 text-white" : "border-slate-200 bg-white text-slate-900"
      }`}
    >
      <div className={`px-5 py-4 border-b ${isLight ? "border-white/10" : "border-slate-100"}`}>
        <div className={`text-xs font-bold uppercase tracking-wider ${isLight ? "text-white/60" : "text-slate-500"}`}>
          {title}
        </div>
      </div>
      <div className="p-5 space-y-3">
        {items.length === 0 ? (
          <p className={`text-sm ${isLight ? "text-white/60" : "text-slate-500"}`}>—</p>
        ) : (
          items.map((it, i) => (
            <div key={i} className="flex items-start justify-between gap-3 text-sm">
              <div>
                <div className="font-bold">{it.label}</div>
                {it.detail ? (
                  <div className={isLight ? "text-white/60" : "text-slate-500"}>{it.detail}</div>
                ) : null}
              </div>
              {it.amount ? <div className="font-mono font-bold tabular-nums">{it.amount}</div> : null}
            </div>
          ))
        )}
      </div>
      {totalAmount ? (
        <div
          className={`px-5 py-4 border-t flex items-center justify-between text-base font-black ${
            isLight ? "border-white/10" : "border-slate-100"
          }`}
        >
          <span>{totalLabel || "Total"}</span>
          <span>{totalAmount}</span>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Best-effort projection of an arbitrary cart_snapshot JSON into rows. Pages
 * that have a richer schema can map their own.
 */
export function projectCartSnapshot(snapshot: Record<string, unknown> | null | undefined): {
  items: CartSidebarItem[];
  totalAmount?: string;
  totalLabel?: string;
} {
  if (!snapshot || typeof snapshot !== "object") return { items: [] };
  const out: CartSidebarItem[] = [];

  const tryArray = (key: string) => {
    const v = (snapshot as any)[key];
    if (Array.isArray(v)) {
      for (const item of v) {
        if (item && typeof item === "object") {
          const label = String(item.label || item.title || item.name || item.product || "Item");
          const detail = item.detail || item.subtitle || item.description;
          const amount = formatMoney(item.amount, item.currency) || formatMoney(item.price, item.currency);
          out.push({ label, detail: detail ? String(detail) : undefined, amount });
        }
      }
    }
  };
  tryArray("items");
  tryArray("lines");

  if (out.length === 0) {
    if ((snapshot as any).label || (snapshot as any).title) {
      out.push({
        label: String((snapshot as any).label || (snapshot as any).title),
        detail: (snapshot as any).detail ? String((snapshot as any).detail) : undefined,
        amount:
          formatMoney((snapshot as any).amount, (snapshot as any).currency) ||
          formatMoney((snapshot as any).price, (snapshot as any).currency),
      });
    }
  }

  const totalAmount =
    formatMoney((snapshot as any).total, (snapshot as any).currency) ||
    formatMoney((snapshot as any).amount, (snapshot as any).currency);
  return { items: out, totalAmount, totalLabel: (snapshot as any).total_label as string | undefined };
}

function formatMoney(amount: unknown, currency?: unknown): string | undefined {
  if (amount == null || amount === "") return undefined;
  const n = typeof amount === "number" ? amount : Number(amount);
  if (!Number.isFinite(n)) return undefined;
  const cur = typeof currency === "string" && currency ? currency.toUpperCase() : "USD";
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: cur, maximumFractionDigits: 2 }).format(n);
  } catch {
    return `${n.toFixed(2)} ${cur}`;
  }
}
