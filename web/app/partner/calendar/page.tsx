"use client";
import React, { useMemo, useState } from 'react';
import PageHeader from '../../../src/components/partner/PageHeader';
import { DayPicker, DateRange } from 'react-day-picker';
import { addDays, format, startOfToday } from 'date-fns';
import 'react-day-picker/dist/style.css';

export default function CalendarPage() {
  const today = useMemo(() => startOfToday(), []);
  const [range, setRange] = useState<DateRange | undefined>();

  const bookedRanges = useMemo(
    () => [
      { from: addDays(today, 3), to: addDays(today, 6) },
      { from: addDays(today, 11), to: addDays(today, 14) },
      { from: addDays(today, 20), to: addDays(today, 23) },
    ],
    [today]
  );

  const disabledDays = useMemo(
    () => [{ before: today }, ...bookedRanges],
    [today, bookedRanges]
  );

  return (
    <div>
      <PageHeader
        title="Calendar"
        subtitle="Manage availability and pricing for your listings"
        backHref="/partner/dashboard"
        breadcrumbs={[
          { label: 'Partner', href: '/partner/dashboard' },
          { label: 'Calendar' }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Availability calendar</h3>
              <p className="text-sm text-gray-600">Select a date range to block or adjust pricing.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setRange(undefined)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Clear dates
              </button>
              <button className="px-3 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                Save changes
              </button>
            </div>
          </div>

          <DayPicker
            mode="range"
            numberOfMonths={2}
            showOutsideDays
            selected={range}
            onSelect={setRange}
            disabled={disabledDays}
            modifiers={{ booked: bookedRanges }}
            classNames={{
              months: 'flex flex-col lg:flex-row gap-6',
              month: 'space-y-3',
              caption: 'flex justify-center py-2 relative items-center',
              caption_label: 'text-sm font-semibold text-gray-900',
              nav: 'space-x-1 flex items-center',
              nav_button: 'h-8 w-8 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50',
              table: 'w-full border-collapse space-y-1',
              head_row: 'flex',
              head_cell: 'text-gray-500 w-10 font-semibold text-xs',
              row: 'flex w-full mt-2',
              cell: 'relative h-10 w-10 text-center text-sm',
              day: 'h-10 w-10 rounded-full hover:bg-gray-100 transition-colors',
              day_selected: 'bg-emerald-600 text-white hover:bg-emerald-700',
              day_range_start: 'bg-emerald-600 text-white',
              day_range_end: 'bg-emerald-600 text-white',
              day_range_middle: 'bg-emerald-50 text-emerald-700 rounded-full',
              day_today: 'border border-emerald-600 text-emerald-700',
              day_outside: 'text-gray-300',
              day_disabled: 'text-gray-300 line-through',
            }}
            modifiersClassNames={{
              booked: 'bg-rose-100 text-rose-700 rounded-full',
            }}
          />

          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-600" />
              Selected
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-100 border border-rose-200" />
              Booked
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full border border-emerald-600" />
              Today
            </div>
          </div>
        </div>

        <aside className="bg-white rounded-xl border border-gray-200 p-6 h-fit">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-center justify-between">
              <span>Check-in</span>
              <span className="font-medium">
                {range?.from ? format(range.from, 'MMM d, yyyy') : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Check-out</span>
              <span className="font-medium">
                {range?.to ? format(range.to, 'MMM d, yyyy') : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Nights</span>
              <span className="font-medium">
                {range?.from && range?.to ? Math.max(0, Math.round((range.to.getTime() - range.from.getTime()) / 86400000)) : '—'}
              </span>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-gray-200 p-4">
            <div className="text-xs uppercase tracking-wide text-gray-500">Tips</div>
            <ul className="mt-2 space-y-2 text-sm text-gray-600">
              <li>• Click a start date, then an end date.</li>
              <li>• Booked dates are blocked.</li>
              <li>• Past dates are disabled.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
