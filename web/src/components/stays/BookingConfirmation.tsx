"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useAuthStore } from "../../lib/authStore";
import { useTripsStore, createTrip } from "../../../lib/store/tripsStore";
import { upsertDocuments, getDocumentsForUser, DocumentRecord } from "../../lib/documentsStore";

export default function BookingConfirmation({ booking, businessInfo }: { booking: any; businessInfo?: any }) {
  const [added, setAdded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = useAuthStore((s:any) => s.user);
  const userId = user?.email || "";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { trips } = useTripsStore((s:any) => ({ trips: s.trips }));

  const addToDocumentsAs = (targetUserId: string) => {
    try {
      const bookingId = booking?.id || booking?.booking_reference || `booking-${Date.now()}`;
      const tripId = trips[0]?.id || createTrip({ title: booking?.accommodation?.name || 'Hotel booking', destination: booking?.accommodation?.address || '', dates: `${booking.check_in} → ${booking.check_out}`, travelers: booking.guests?.length?.toString() });
      const existing = (getDocumentsForUser(targetUserId) || {})[tripId] || [];
      const now = new Date().toISOString();
      const doc: DocumentRecord = {
        id: String(bookingId),
        tripId,
        userId: targetUserId,
        type: 'confirmation',
        title: `Hotel confirmation (${booking?.accommodation?.name || 'Hotel'})`,
        provider: booking?.provider || 'Duffel',
        confirmationNumber: booking?.booking_reference || booking?.reference || booking?.id || '',
        url: `/test/duffel-stays/confirmation?docId=${encodeURIComponent(String(bookingId))}`,
        updatedAt: now,
        details: booking ? JSON.stringify(booking) : undefined,
      };

      // If a doc with the same id is already present, don't add again
      if (existing.some((e) => e.id === doc.id)) {
        setAdded(true);
        setNeedsLogin(false);
        return;
      }

      upsertDocuments(targetUserId, tripId, [doc, ...existing]);
      setAdded(true);
      setNeedsLogin(false);
    } catch (err) {
      console.error('Failed to add confirmation to documents:', err);
    }
  };

  const handleAddToDocuments = () => {
    if (!userId) {
      setNeedsLogin(true);
      // For convenience, also save locally so the booking is visible on this device
      addToDocumentsAs('__local__');
      return;
    }

    setSaving(true);
    try {
      addToDocumentsAs(userId);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!booking || added) return;
    // auto-save booking to documents: prefer logged-in user, otherwise save locally
    const target = userId || '__local__';
    addToDocumentsAs(target);
  }, [booking, userId, added]);

  if (!booking) return <div>No booking data</div>;

  const charges = booking?.charges || booking?.price || {};
  const cancellation = booking?.cancellation_policy || booking?.rate_conditions || booking?.conditions || booking?.policy || {};
  const checkinInfo = booking?.check_in_instructions || booking?.key_collection || booking?.arrival_instructions || booking?.checkin_info || "Please contact the property for check-in details.";



  return (
    <div className="max-w-3xl mx-auto py-12 px-6 bg-white rounded-2xl shadow">
          <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <Image src="/branding/logo.png" alt="Company logo" width={72} height={72} className="rounded-md" />
          <div>
            <h1 className="text-2xl font-bold">Booking confirmation</h1>
            <div className="text-sm text-slate-600">{businessInfo?.name || process.env.NEXT_PUBLIC_BUSINESS_NAME || 'Zeniva Travel'}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm text-slate-500">Booking reference</div>
            <div className="font-mono mt-1">{booking?.id || booking?.reference || booking?.booking_reference}</div>
            <div className="text-sm text-slate-400">Confirmed: {booking?.confirmed_at || booking?.created_at || booking?.booking_date || 'N/A'}</div>
          </div>
          <Image src="/branding/lina-avatar.png" alt="Lina" width={56} height={56} className="rounded-full bg-white p-1" />
        </div>
      </div>

      <div className="mb-6">
        <div className="text-sm mt-1">Provider: {booking?.provider || booking?.supplier || booking?.booking_provider || 'Duffel'}</div>
        <div className="text-sm">Provider reference: {booking?.provider_reference || booking?.supplier_reference || booking?.booking_reference || 'N/A'}</div>

        <div className="mt-3 flex items-center gap-3">
          <button onClick={handleAddToDocuments} disabled={saving || added} className="rounded-full bg-blue-600 text-white px-3 py-1 text-sm">
            {saving ? 'Saving...' : added ? 'Added' : 'Add to My Documents'}
          </button>
          {needsLogin && (
            <a href="/login" className="text-sm text-blue-600 font-semibold">Log in to save</a>
          )}
          {added && (
            userId ? (
              <span className="text-sm text-emerald-600">Added to My Travel Documents ✅</span>
            ) : (
              <span className="text-sm text-emerald-600">Saved locally on this device — <a href="/login" className="underline">Log in</a> to save to your account</span>
            )
          )}
        </div>

        {booking?.guests && booking.guests.length > 0 && (
          <div className="mt-2">
            <strong>Occupants:</strong>
            <ul className="mt-1 text-sm list-disc pl-5">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(booking.guests || []).map((g:any, i:number) => <li key={i}>{g.given_name || g.first_name || ''} {g.family_name || g.last_name || ''}{g.born_on ? ` (born ${g.born_on})` : ''}</li>)}
            </ul>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-bold">Accommodation</h3>
          <div>{booking?.accommodation?.name || booking?.hotel_name || booking?.accommodation?.title}</div>
          <div className="text-sm text-slate-500">{booking?.accommodation?.address || booking?.hotel_address || booking?.accommodation?.location}</div>
        </div>

        <div>
          <h3 className="font-bold">Stay details</h3>
          <div>Check-in: {booking?.check_in || booking?.checkIn || booking?.arrival_date}</div>
          <div>Check-out: {booking?.check_out || booking?.checkOut || booking?.departure_date}</div>
          <div>
            Nights: {booking?.nights ?? booking?.number_of_nights ?? (booking?.check_in && booking?.check_out ? Math.round((Number(new Date(booking.check_out)) - Number(new Date(booking.check_in))) / (1000 * 60 * 60 * 24)) : 'N/A')}
          </div>
          <div>Rooms: {booking?.rooms || booking?.room_count || booking?.room_quantity || 1}</div>
          <div>Guests: {booking?.guests?.length ?? booking?.guest_count ?? 'N/A'}</div>
          <div className="mt-2">
            <strong>Check-in info:</strong>
            <div className="text-sm text-slate-600 mt-1">{typeof checkinInfo === 'string' ? checkinInfo : JSON.stringify(checkinInfo)}</div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-bold">Price breakdown</h3>
        <ul className="mt-2 list-disc pl-5 text-sm">
          <li>Total: {charges?.total || booking?.total || booking?.price?.total || 'TBD'}</li>
          <li>Taxes: {charges?.tax || booking?.tax || booking?.price?.tax || 'TBD'}</li>
          <li>Fees: {charges?.fees || booking?.fees || 'TBD'}</li>
          <li>Due at accommodation: {booking?.due_at_property || booking?.price?.due_at_property || 'TBD'}</li>
        </ul>
      </div>

      <div className="mt-6">
        <h3 className="font-bold">Refundability & policy</h3>
        <div className="text-sm mt-2">
          <strong>Refundable:</strong> {String(cancellation?.refundable ?? cancellation?.is_refundable ?? false)}
        </div>
        <pre className="mt-2 text-sm bg-slate-50 p-3 rounded" style={{whiteSpace: 'pre-wrap'}}>{JSON.stringify(cancellation, null, 2)}</pre>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-bold">Business info</h4>
          <div>{businessInfo?.name || process.env.NEXT_PUBLIC_BUSINESS_NAME || 'Zeniva Travel'}</div>
          <div>{businessInfo?.address || process.env.NEXT_PUBLIC_BUSINESS_ADDRESS || 'Montreal, QC'}</div>
          <div className="text-sm">Contact: {businessInfo?.support_email || process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'contact@zeniva.ca'}</div>
          <div className="text-sm">Phone: {businessInfo?.support_phone || process.env.NEXT_PUBLIC_SUPPORT_PHONE || ''}</div>
          <div className="text-sm mt-2">Terms: <a href={businessInfo?.terms_url || process.env.NEXT_PUBLIC_TERMS_URL || '#'} className="underline">View terms</a></div>
        </div>

        <div>
          <h4 className="font-bold">Customer</h4>
          <div>{booking?.customer?.name || (booking?.guests?.[0] ? booking?.guests?.[0]?.given_name + ' ' + booking?.guests?.[0]?.family_name : '')}</div>
          <div>{booking?.customer?.email || booking?.email}</div>
          <div className="mt-4 text-sm text-slate-600">Key collection: {booking?.key_collection || booking?.key_collection_info || 'N/A'}</div>
        </div>
      </div>

          <div className="mt-6">
        <div className="flex items-center justify-between">
          <h4 className="font-bold">Booking details</h4>
          <div className="flex items-center gap-2">
            <button id="download-json" onClick={() => {
              const blob = new Blob([JSON.stringify(booking, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `booking-${booking?.id || Date.now()}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }} className="text-sm px-3 py-1 rounded bg-slate-100">Download JSON</button>
            <button onClick={() => setShowRaw(s => !s)} className="text-sm px-3 py-1 rounded bg-slate-100">{showRaw ? 'Hide' : 'Show'} details</button>
          </div>
        </div>
        {showRaw ? (
          <pre className="mt-2 text-xs bg-black text-white p-3 rounded max-h-64 overflow-auto">{JSON.stringify(booking, null, 2)}</pre>
        ) : (
          <div className="mt-2 text-sm text-slate-600">For reviewers: you can download the booking JSON or click "Show details" to view it inline.</div>
        )}
      </div>
    </div>
  );
}