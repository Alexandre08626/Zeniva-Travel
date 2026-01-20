"use client";
import React, { useMemo, useState } from 'react';
import { Calendar, Package, ExternalLink } from 'lucide-react';

type Booking = {
  id: string;
  guest: string;
  listing: string;
  dates: string;
  status: 'requested' | 'confirmed' | 'completed' | 'cancelled' | string;
  total: string;
};

const statusStyles = {
  requested: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  completed: 'bg-gray-100 text-gray-700 border-gray-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

export default function BookingsTable({ bookings = [] }: { bookings?: Booking[] }) {
  const [filter, setFilter] = useState<'all'|'requested'|'confirmed'|'completed'|'cancelled'>('all');
  const data = useMemo(() => (bookings || []).filter((b) => (filter === 'all' ? true : b.status === filter)), [bookings, filter]);

  const formatStatus = (status: Booking['status']) => {
    const key = status as keyof typeof statusStyles;
    return (
      <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${statusStyles[key] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
        {String(status).charAt(0).toUpperCase() + String(status).slice(1)}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 w-full hover:shadow-md transition-shadow duration-200">
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
            <p className="text-sm text-gray-600 mt-0.5">Manage and track your guest reservations</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {(['all','requested','confirmed','completed','cancelled'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  filter === s
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        {data.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h4>
            <p className="text-sm text-gray-600 mb-6">Publish a listing to start receiving guest reservations</p>
            <a
              href="/partner/listings"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Package className="w-4 h-4" />
              Create Listing
            </a>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Guest</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Listing</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Dates</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-900">
                    <div className="font-medium text-gray-900">{booking.guest}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-900">{booking.listing}</td>
                  <td className="px-6 py-4 text-gray-900">{booking.dates}</td>
                  <td className="px-6 py-4 text-gray-900">{formatStatus(booking.status)}</td>
                  <td className="px-6 py-4 text-gray-900">
                    <span className="font-semibold">{booking.total}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-900">
                    <button
                      onClick={() => console.log('view', booking.id)}
                      className="px-3 py-1.5 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-1"
                    >
                      View <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
