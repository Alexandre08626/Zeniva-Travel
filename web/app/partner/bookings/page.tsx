"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Search, Eye, CheckCircle, XCircle, Calendar } from 'lucide-react';
import PageHeader from '../../../src/components/partner/PageHeader';
import { mockBookings } from '../../../src/lib/mockData';
import { ConfirmModal } from '../../../src/components/partner/Modal';

type StatusFilter = 'all' | 'requested' | 'confirmed' | 'cancelled' | 'completed';

export default function BookingsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookings, setBookings] = useState(mockBookings);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; bookingId: string; action: 'confirm' | 'decline' | null }>({
    isOpen: false,
    bookingId: '',
    action: null
  });

  const filteredBookings = bookings.filter(booking => {
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const matchesSearch = booking.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         booking.listingTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleConfirm = (id: string) => {
    setConfirmModal({ isOpen: true, bookingId: id, action: 'confirm' });
  };

  const handleDecline = (id: string) => {
    setConfirmModal({ isOpen: true, bookingId: id, action: 'decline' });
  };

  const executeAction = () => {
    const { bookingId, action } = confirmModal;
    
    if (action === 'confirm') {
      setBookings(prev => prev.map(b => 
        b.id === bookingId ? { ...b, status: 'confirmed' } : b
      ));
      if (typeof window !== 'undefined') {
        window.showToast('Booking confirmed successfully!', 'success');
      }
    } else if (action === 'decline') {
      setBookings(prev => prev.map(b => 
        b.id === bookingId ? { ...b, status: 'cancelled' } : b
      ));
      if (typeof window !== 'undefined') {
        window.showToast('Booking declined', 'warning');
      }
    }
    
    setConfirmModal({ isOpen: false, bookingId: '', action: null });
  };

  const statusColors = {
    requested: 'bg-blue-50 text-blue-700 border-blue-200',
    confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
    completed: 'bg-gray-100 text-gray-700 border-gray-200'
  };

  return (
    <div>
      {/* Page Header */}
        <PageHeader
          title="Bookings"
          subtitle="Manage reservations and guest requests"
          backHref="/partner/dashboard"
          breadcrumbs={[
            { label: 'Partner', href: '/partner/dashboard' },
            { label: 'Bookings' }
          ]}
        />

      {/* Filters */}
      <div className="mb-6 bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by guest name or listing..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
          >
            <option value="all">All Bookings</option>
            <option value="requested">Requested</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <span className="text-sm text-gray-600">{filteredBookings.length} bookings</span>
        </div>
      </div>

      {/* Empty State */}
      {filteredBookings.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
          <p className="text-gray-600">Try adjusting your filters or search query</p>
        </div>
      )}

      {/* Bookings List */}
      {filteredBookings.length > 0 && (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Booking Info */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <img
                    src={booking.guestAvatar}
                    alt={booking.guestName}
                    className="w-12 h-12 rounded-full flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{booking.guestName}</h3>
                      <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${statusColors[booking.status as keyof typeof statusColors]}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{booking.listingTitle}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {booking.checkIn} → {booking.checkOut}
                      </span>
                      <span>•</span>
                      <span>{booking.guests} guests</span>
                      <span>•</span>
                      <span className="font-semibold text-gray-900">{booking.currency} {booking.totalPrice}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href={`/partner/bookings/${booking.id}`}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </Link>
                  {booking.status === 'requested' && (
                    <>
                      <button
                        onClick={() => handleConfirm(booking.id)}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Confirm
                      </button>
                      <button
                        onClick={() => handleDecline(booking.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Decline
                      </button>
                    </>
                  )}
                </div>
              </div>

              {booking.specialRequests && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-900"><span className="font-semibold">Special Request:</span> {booking.specialRequests}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modals */}
      <ConfirmModal
        isOpen={confirmModal.isOpen && confirmModal.action === 'confirm'}
        onClose={() => setConfirmModal({ isOpen: false, bookingId: '', action: null })}
        onConfirm={executeAction}
        title="Confirm Booking"
        message="Are you sure you want to confirm this booking request? The guest will be notified immediately."
        confirmText="Confirm Booking"
        confirmVariant="primary"
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen && confirmModal.action === 'decline'}
        onClose={() => setConfirmModal({ isOpen: false, bookingId: '', action: null })}
        onConfirm={executeAction}
        title="Decline Booking"
        message="Are you sure you want to decline this booking request? This action cannot be undone and the guest will be notified."
        confirmText="Decline"
        confirmVariant="danger"
      />
    </div>
  );
}
