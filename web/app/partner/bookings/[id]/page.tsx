"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import PageHeader from "../../../../src/components/partner/PageHeader";
import { mockBookings } from "../../../../src/lib/mockData";

export default function PartnerBookingDetailPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : "";

  const booking = useMemo(() => mockBookings.find((b) => b.id === id), [id]);

  if (!id) {
    return (
      <div>
        <PageHeader
          title="Booking"
          subtitle="Booking details"
          backHref="/partner/bookings"
          breadcrumbs={[
            { label: "Partner", href: "/partner/dashboard" },
            { label: "Bookings", href: "/partner/bookings" },
            { label: "Booking" },
          ]}
        />
        <div className="bg-white rounded-xl border border-gray-200 p-8">Missing booking id.</div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div>
        <PageHeader
          title={`Booking ${id}`}
          subtitle="Booking details"
          backHref="/partner/bookings"
          breadcrumbs={[
            { label: "Partner", href: "/partner/dashboard" },
            { label: "Bookings", href: "/partner/bookings" },
            { label: `Booking ${id}` },
          ]}
          actions={
            <Link
              href="/partner/bookings"
              className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              Back to bookings
            </Link>
          }
        />
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Booking not found</h2>
          <p className="text-sm text-gray-600">This booking is not available in the demo store yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={booking.listingTitle}
        subtitle={`Booking ${booking.id} · ${booking.status}`}
        backHref="/partner/bookings"
        breadcrumbs={[
          { label: "Partner", href: "/partner/dashboard" },
          { label: "Bookings", href: "/partner/bookings" },
          { label: booking.id },
        ]}
        actions={
          <div className="flex gap-2">
            <Link
              href="/partner/inbox"
              className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Message guest
            </Link>
            <button
              onClick={() => window.showToast?.("Booking updated (demo)", "success")}
              className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              Update status
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr,1fr] gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900">Guest details</h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Guest</p>
              <p className="mt-1 font-semibold text-gray-900">{booking.guestName}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Email</p>
              <p className="mt-1 font-semibold text-gray-900">{booking.guestEmail}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Phone</p>
              <p className="mt-1 font-semibold text-gray-900">{booking.guestPhone}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Guests</p>
              <p className="mt-1 font-semibold text-gray-900">{booking.guests}</p>
            </div>
          </div>
          {booking.specialRequests && (
            <div className="mt-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">Special requests</p>
              <p className="mt-2 text-sm text-gray-700">{booking.specialRequests}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-xs uppercase tracking-wide text-gray-500">Stay</p>
            <div className="mt-3 text-sm text-gray-700">
              <p><span className="font-semibold">Check-in:</span> {booking.checkIn}</p>
              <p><span className="font-semibold">Check-out:</span> {booking.checkOut}</p>
            </div>
            <div className="mt-4 text-2xl font-black text-gray-900">
              {booking.currency} {booking.totalPrice}
            </div>
            <p className="text-sm text-gray-600 mt-1">Payment: {booking.paymentStatus}</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <p className="text-xs uppercase tracking-wide text-gray-500">Timeline</p>
            <div className="mt-3 space-y-3 text-sm">
              {(booking.timeline || []).map((item) => (
                <div key={item.date} className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">{item.action}</p>
                    <p className="text-gray-600">{item.actor}</p>
                  </div>
                  <p className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
