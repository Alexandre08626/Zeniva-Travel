"use client";

import { useMemo, useState } from "react";

type DayCell = {
  date: Date | null;
  label: string;
};

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function toStartOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatMonth(date: Date) {
  return date.toLocaleString("en-US", { month: "long", year: "numeric" });
}

function formatISO(date: Date | null) {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function buildCalendar(date: Date): DayCell[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPadding = firstDay.getDay();
  const totalDays = lastDay.getDate();
  const cells: DayCell[] = [];

  for (let i = 0; i < startPadding; i += 1) {
    cells.push({ date: null, label: "" });
  }

  for (let day = 1; day <= totalDays; day += 1) {
    cells.push({ date: new Date(year, month, day), label: String(day) });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ date: null, label: "" });
  }

  return cells;
}

type Props = {
  storageKey: string;
};

function persistDates(storageKey: string, start: Date | null, end: Date | null) {
  if (typeof window === "undefined") return;
  const payload = { start: formatISO(start), end: formatISO(end) };
  window.localStorage.setItem(storageKey, JSON.stringify(payload));
  window.dispatchEvent(new CustomEvent("airbnb:dates", { detail: { key: storageKey, ...payload } }));
}

export default function AirbnbAvailability({ storageKey }: Props) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const today = useMemo(() => toStartOfDay(new Date()), []);
  const nextMonth = useMemo(() => new Date(today.getFullYear(), today.getMonth() + 1, 1), [today]);

  const handleSelect = (date: Date) => {
    const selected = toStartOfDay(date);
    if (!startDate || (startDate && endDate)) {
      setStartDate(selected);
      setEndDate(null);
      persistDates(storageKey, selected, null);
      return;
    }

    if (startDate && !endDate) {
      if (selected.getTime() < startDate.getTime()) {
        setStartDate(selected);
        setEndDate(null);
        persistDates(storageKey, selected, null);
      } else if (selected.getTime() === startDate.getTime()) {
        setStartDate(selected);
        setEndDate(null);
        persistDates(storageKey, selected, null);
      } else {
        setEndDate(selected);
        persistDates(storageKey, startDate, selected);
      }
    }
  };

  const isInRange = (date: Date) => {
    if (!startDate || !endDate) return false;
    const time = date.getTime();
    return time > startDate.getTime() && time < endDate.getTime();
  };

  const isStart = (date: Date) => startDate && date.getTime() === startDate.getTime();
  const isEnd = (date: Date) => endDate && date.getTime() === endDate.getTime();

  return (
    <section className="rounded-2xl border border-blue-100 bg-white p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Availability</h3>
        <span className="text-xs font-semibold text-blue-700">Select dates</span>
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        {[today, nextMonth].map((monthDate) => (
          <div key={monthDate.toISOString()} className="space-y-2">
            <p className="text-sm font-semibold text-slate-900">{formatMonth(monthDate)}</p>
            <div className="grid grid-cols-7 gap-1 text-xs text-blue-700">
              {WEEKDAYS.map((day) => (
                <span key={day} className="text-center font-semibold uppercase text-[10px] text-blue-500">
                  {day}
                </span>
              ))}
              {buildCalendar(monthDate).map((cell, idx) => {
                if (!cell.date) {
                  return <span key={`${monthDate.getMonth()}-${idx}`} className="h-8" />;
                }

                const start = isStart(cell.date);
                const end = isEnd(cell.date);
                const inRange = isInRange(cell.date);

                return (
                  <button
                    key={`${monthDate.getMonth()}-${idx}`}
                    type="button"
                    onClick={() => handleSelect(cell.date!)}
                    className={`h-8 rounded-lg flex items-center justify-center transition text-xs font-semibold ${
                      start || end
                        ? "bg-blue-600 text-white"
                        : inRange
                          ? "bg-blue-100 text-blue-800"
                          : "bg-blue-50/70 text-slate-900 hover:bg-blue-100"
                    }`}
                    aria-pressed={start || end || inRange}
                  >
                    {cell.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-semibold text-blue-600">
          Check‑in
          <input
            type="date"
            value={formatISO(startDate)}
            onChange={(e) => {
              const nextStart = e.target.value ? new Date(e.target.value) : null;
              setStartDate(nextStart);
              persistDates(storageKey, nextStart, endDate);
            }}
            className="mt-2 w-full rounded-lg border border-blue-200 px-2 py-2 text-sm text-slate-900"
          />
        </label>
        <label className="text-xs font-semibold text-blue-600">
          Check‑out
          <input
            type="date"
            value={formatISO(endDate)}
            onChange={(e) => {
              const nextEnd = e.target.value ? new Date(e.target.value) : null;
              setEndDate(nextEnd);
              persistDates(storageKey, startDate, nextEnd);
            }}
            className="mt-2 w-full rounded-lg border border-blue-200 px-2 py-2 text-sm text-slate-900"
          />
        </label>
      </div>

      <p className="mt-3 text-xs text-blue-700">
        {startDate ? `Selected: ${formatISO(startDate)}` : "Select your check‑in date"}
        {endDate ? ` → ${formatISO(endDate)}` : ""}
      </p>
    </section>
  );
}
