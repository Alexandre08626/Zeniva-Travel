"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, Plus, Grid, List, Search, Edit, Eye, Trash2, Copy, MoreVertical } from 'lucide-react';
import { mockListings } from '../../../src/lib/mockData';
import { ConfirmModal } from '../../../src/components/partner/Modal';

type ViewMode = 'grid' | 'table';
type StatusFilter = 'all' | 'published' | 'draft' | 'paused';
type TypeFilter = 'all' | 'yacht' | 'home' | 'hotel';

export default function PartnerListingsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [listings, setListings] = useState(mockListings);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; listingId: string }>({ isOpen: false, listingId: '' });
  
  const filteredListings = listings.filter(listing => {
    const matchesStatus = statusFilter === 'all' || listing.status === statusFilter;
    const matchesType = typeFilter === 'all' || listing.type === typeFilter;
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  const handleDuplicate = (id: string) => {
    const listingToDuplicate = listings.find(l => l.id === id);
    if (listingToDuplicate) {
      const timestamp = new Date().getTime();
      const newListing = {
        ...listingToDuplicate,
        id: `listing-${timestamp}`,
        title: `${listingToDuplicate.title} (Copy)`,
        status: 'draft' as const
      };
      setListings(prev => [...prev, newListing]);
      if (typeof window !== 'undefined') {
        window.showToast('Listing duplicated successfully', 'success');
      }
    }
  };

  const handleDelete = (id: string) => {
    setDeleteModal({ isOpen: true, listingId: id });
  };

  const executeDelete = () => {
    setListings(prev => prev.filter(l => l.id !== deleteModal.listingId));
    if (typeof window !== 'undefined') {
      window.showToast('Listing deleted successfully', 'success');
    }
    setDeleteModal({ isOpen: false, listingId: '' });
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? ('paused' as const) : ('published' as const);
    setListings(prev => prev.map(l => 
      l.id === id ? { ...l, status: newStatus } : l
    ));
    if (typeof window !== 'undefined') {
      window.showToast(`Listing ${newStatus}`, 'success');
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 flex items-center gap-3">
              <Package className="w-8 h-8 text-emerald-600" />
              Listings
            </h1>
            <p className="text-gray-600 mt-2">Manage your properties, yachts, and hotels</p>
          </div>
          <Link
            href="/partner/listings/new"
            className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Create Listing
          </Link>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="mb-6 bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="paused">Paused</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
          >
            <option value="all">All Types</option>
            <option value="yacht">Yacht</option>
            <option value="home">Home</option>
            <option value="hotel">Hotel</option>
          </select>

          {/* View Toggle */}
          <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-emerald-50 text-emerald-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'table' ? 'bg-emerald-50 text-emerald-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Active Filters Display */}
        <div className="flex items-center gap-2 mt-4">
          <span className="text-sm text-gray-600">{filteredListings.length} listings</span>
          {(statusFilter !== 'all' || typeFilter !== 'all' || searchQuery) && (
            <>
              <span className="text-gray-400">•</span>
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setTypeFilter('all');
                  setSearchQuery('');
                }}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Clear filters
              </button>
            </>
          )}
        </div>
      </div>

      {/* Empty State */}
      {filteredListings.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchQuery || statusFilter !== 'all' || typeFilter !== 'all' 
              ? 'No listings found' 
              : 'No listings yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'Try adjusting your filters or search query'
              : 'Create your first listing to start receiving bookings'}
          </p>
          <Link
            href="/partner/listings/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create First Listing
          </Link>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && filteredListings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <div key={listing.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group">
              {/* Image */}
              <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                <Image
                  src={listing.thumbnail}
                  alt={listing.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
                    listing.status === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    listing.status === 'draft' ? 'bg-gray-100 text-gray-700 border-gray-200' :
                    'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <button className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors">
                    <MoreVertical className="w-4 h-4 text-gray-700" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="mb-3">
                  <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-1">{listing.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-1">{listing.location}</p>
                </div>

                <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                  <span className="capitalize">{listing.type}</span>
                  <span>•</span>
                  <span>{listing.capacity} guests</span>
                  <span>•</span>
                  <span>{listing.bedrooms} beds</span>
                </div>

                {listing.status === 'published' && (
                  <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-xs text-gray-600">Views</div>
                      <div className="text-sm font-semibold text-gray-900">{listing.views}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Bookings</div>
                      <div className="text-sm font-semibold text-gray-900">{listing.bookings}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Rating</div>
                      <div className="text-sm font-semibold text-gray-900">⭐ {listing.rating}</div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link
                    href={`/partner/listings/${listing.id}`}
                    className="flex-1 px-3 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleToggleStatus(listing.id, listing.status)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    {listing.status === 'published' ? 'Pause' : 'Publish'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && filteredListings.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase">Listing</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase">Type</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase">Price</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase">Performance</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredListings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-20 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={listing.thumbnail}
                            alt={listing.title}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{listing.title}</div>
                          <div className="text-sm text-gray-600">{listing.location}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize text-gray-700">{listing.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${
                        listing.status === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        listing.status === 'draft' ? 'bg-gray-100 text-gray-700 border-gray-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{listing.currency} {listing.price}</div>
                      <div className="text-xs text-gray-600">per night</div>
                    </td>
                    <td className="px-6 py-4">
                      {listing.status === 'published' ? (
                        <div className="space-y-1">
                          <div className="text-sm text-gray-900">{listing.views} views</div>
                          <div className="text-sm text-gray-600">{listing.bookings} bookings</div>
                          <div className="text-sm text-gray-600">⭐ {listing.rating} ({listing.reviews})</div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/partner/listings/${listing.id}`}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 text-gray-700" />
                        </Link>
                        <button
                          onClick={() => handleDuplicate(listing.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Duplicate"
                        >
                          <Copy className="w-4 h-4 text-gray-700" />
                        </button>
                        <button
                          onClick={() => handleDelete(listing.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, listingId: '' })}
        onConfirm={executeDelete}
        title="Delete Listing"
        message="Are you sure you want to delete this listing? This action cannot be undone and all booking history will be lost."
        confirmText="Delete"
        confirmVariant="danger"
      />
    </div>
  );
}
