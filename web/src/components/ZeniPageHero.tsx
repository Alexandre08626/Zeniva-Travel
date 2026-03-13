"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export type ZeniPageHeroField =
  | { kind: "text"; key: string; label: string; placeholder: string }
  | { kind: "date"; key: string; label: string }
  | { kind: "number"; key: string; label: string; min?: number; max?: number; defaultValue?: number }
  | { kind: "select"; key: string; label: string; options: { value: string; label: string }[] };

interface ZeniPageHeroProps {
  emoji: string;
  brand: string; // e.g. "ZeniHotel"
  subtitle: string;
  bgImage?: string; // optional background image URL
  fields: ZeniPageHeroField[];
  actionPath: string; // where the form submits
  searchLabel?: string;
  tags?: string[];
}

export default function ZeniPageHero({
  emoji,
  brand,
  subtitle,
  bgImage,
  fields,
  actionPath,
  searchLabel = "Search",
  tags = [],
}: ZeniPageHeroProps) {
  const router = useRouter();
  const initVals: Record<string, string> = {};
  for (const f of fields) {
    if (f.kind === "number") initVals[f.key] = String(f.defaultValue ?? 2);
    else initVals[f.key] = "";
  }
  const [vals, setVals] = useState<Record<string, string>>(initVals);

  const set = (key: string, val: string) => setVals((v) => ({ ...v, [key]: val }));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(vals).filter(([, v]) => v.trim()))
    );
    router.push(`${actionPath}?${qs.toString()}`);
  };

  // Grid cols: 5 if 3+ fields, else adapt
  const gridCols = fields.length >= 4
    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5"
    : fields.length === 3
    ? "grid-cols-1 sm:grid-cols-3 lg:grid-cols-4"
    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div
      className="relative overflow-hidden text-white"
      style={{ background: "linear-gradient(135deg, #0B1B4D 0%, #0F3A8A 100%)" }}
    >
      {bgImage && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15"
          style={{ backgroundImage: `url('${bgImage}')` }}
        />
      )}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14">
        {/* Brand title */}
        <div className="mb-6">
          <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-1">Zeniva Travel</p>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{emoji}</span>
            <h1 className="text-3xl sm:text-4xl font-black">{brand}</h1>
          </div>
          <p className="text-blue-200 mt-2 text-sm max-w-xl">{subtitle}</p>
        </div>

        {/* Search bar */}
        <form
          onSubmit={handleSearch}
          className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 grid ${gridCols} gap-3`}
        >
          {fields.map((f) => (
            <div key={f.key} className={f.kind === "text" && fields.length >= 4 ? "lg:col-span-2" : ""}>
              <label className="block text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1">
                {f.label}
              </label>
              {f.kind === "text" && (
                <input
                  value={vals[f.key]}
                  onChange={(e) => set(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full rounded-xl bg-white px-4 py-2.5 text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400"
                  onKeyDown={(e) => e.key === "Enter" && handleSearch(e as any)}
                />
              )}
              {f.kind === "date" && (
                <input
                  type="date"
                  value={vals[f.key]}
                  onChange={(e) => set(f.key, e.target.value)}
                  className="w-full rounded-xl bg-white px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              )}
              {f.kind === "number" && (
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={f.min ?? 1}
                    max={f.max ?? 30}
                    value={vals[f.key]}
                    onChange={(e) => set(f.key, e.target.value)}
                    className="w-20 rounded-xl bg-white px-3 py-2.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-black rounded-xl py-2.5 text-sm hover:opacity-90 transition"
                  >
                    {searchLabel}
                  </button>
                </div>
              )}
              {f.kind === "select" && (
                <select
                  value={vals[f.key]}
                  onChange={(e) => set(f.key, e.target.value)}
                  className="w-full rounded-xl bg-white px-4 py-2.5 text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {f.options.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              )}
            </div>
          ))}
          {/* Submit button if last field is NOT number (which has its own button) */}
          {fields[fields.length - 1]?.kind !== "number" && (
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white font-black rounded-xl py-2.5 text-sm hover:opacity-90 transition"
              >
                {searchLabel}
              </button>
            </div>
          )}
        </form>

        {/* Tags row */}
        {tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="bg-white/10 border border-white/20 rounded-full px-3 py-1 text-xs font-bold text-white"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
