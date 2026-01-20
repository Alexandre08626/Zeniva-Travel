"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type RateOption = {
  id: string;
  hours: number;
  price: number;
  label: string;
  note?: string;
};

type Props = {
  rates: string[];
};

function parseRateOption(rate: string, index: number): RateOption | null {
  const hourMatch = rate.match(/(\d+)\s*(?:hrs?|hours?)/i);
  const priceMatch = rate.match(/\$([\d,]+)/);

  if (!hourMatch || !priceMatch) return null;

  const hours = Number.parseInt(hourMatch[1], 10);
  const price = Number.parseInt(priceMatch[1].replace(/,/g, ""), 10);

  if (!Number.isFinite(hours) || !Number.isFinite(price)) return null;

  let note = rate;
  note = note.replace(hourMatch[0], "");
  note = note.replace(priceMatch[0], "");
  note = note.replace(/\s+/g, " ").trim();
  note = note.replace(/^[-–—:]+\s*/g, "");

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);

  const label = note ? `${hours} hrs · ${formattedPrice} · ${note}` : `${hours} hrs · ${formattedPrice}`;

  return {
    id: `${hours}-${price}-${index}`,
    hours,
    price,
    label,
    note: note || undefined,
  };
}

export default function YachtRatePicker({ rates }: Props) {
  const options = useMemo(() => {
    return (rates || [])
      .map((rate, index) => parseRateOption(rate, index))
      .filter((option): option is RateOption => Boolean(option))
      .sort((a, b) => a.hours - b.hours);
  }, [rates]);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedId, setSelectedId] = useState(() => options[0]?.id ?? "");

  useEffect(() => {
    if (!options.length) return;
    const hoursParam = searchParams.get("hours");
    const priceParam = searchParams.get("price");
    if (!hoursParam || !priceParam) return;

    const hours = Number.parseInt(hoursParam, 10);
    const price = Number.parseInt(priceParam, 10);
    if (!Number.isFinite(hours) || !Number.isFinite(price)) return;

    const match = options.find((option) => option.hours === hours && option.price === price);
    if (match && match.id !== selectedId) {
      setSelectedId(match.id);
    }
  }, [options, searchParams, selectedId]);

  useEffect(() => {
    if (!options.length) {
      setSelectedId("");
      return;
    }

    if (!options.find((option) => option.id === selectedId)) {
      setSelectedId(options[0].id);
    }
  }, [options, selectedId]);

  const selected = options.find((option) => option.id === selectedId) ?? options[0];

  useEffect(() => {
    if (!selected) return;
    const currentHours = searchParams.get("hours");
    const currentPrice = searchParams.get("price");
    const currentNote = searchParams.get("note");
    const nextNote = selected.note ?? null;

    if (
      currentHours === String(selected.hours) &&
      currentPrice === String(selected.price) &&
      (currentNote ?? null) === nextNote
    ) {
      return;
    }

    const next = new URLSearchParams(searchParams.toString());
    next.set("hours", String(selected.hours));
    next.set("price", String(selected.price));
    if (selected.note) {
      next.set("note", selected.note);
    } else {
      next.delete("note");
    }
    router.replace(`${pathname}?${next.toString()}`);
  }, [selected, pathname, router, searchParams]);

  if (!options.length || !selected) return null;

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(selected.price);

  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-semibold text-slate-800">Quick price</p>
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-[1fr,auto] gap-3 items-end">
        <label className="text-sm font-semibold text-slate-700">
          Duration
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
          >
            {options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
          <p className="text-[10px] uppercase tracking-wide text-blue-700 font-semibold">Estimated price</p>
          <p className="text-2xl font-black text-slate-900">{formattedPrice}</p>
          {selected.note && <p className="text-xs text-slate-600 mt-1">{selected.note}</p>}
        </div>
      </div>
    </div>
  );
}
