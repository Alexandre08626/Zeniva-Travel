import React from 'react';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';

export default function ListingPreview({ items = [], loading = false }: { items?: any[]; loading?: boolean }) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-4 w-full">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Listings</h3>
          <a href="/partner/listings" className="text-sm text-emerald-600">View all listings</a>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[1,2,3].map((i) => (
            <div key={i} className="rounded-lg overflow-hidden border bg-gray-50 p-3"><Skeleton className="h-36 w-full rounded"/></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-4 w-full">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Listings</h3>
        <a href="/partner/listings" className="text-sm text-emerald-600">View all listings</a>
      </div>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {items.length === 0 ? (
          <EmptyState title="No listings yet" subtitle="Create your first listing to start receiving bookings" action={<a href="/partner/listings" className="px-3 py-2 bg-emerald-600 text-white rounded">Create listing</a>} />
        ) : (
          items.slice(0,3).map((l:any)=> (
            <div key={l.id} className="rounded-lg overflow-hidden border bg-gray-50">
              <div className="h-40 bg-gray-200 flex items-center justify-center text-gray-400">Photo</div>
              <div className="p-3">
                <div className="font-medium">{l.title}</div>
                <div className="text-sm text-gray-500 mt-1">{l.status}</div>
                <div className="mt-2 flex gap-2">
                  <button className="px-2 py-1 border rounded text-sm">Edit</button>
                  <button className="px-2 py-1 bg-emerald-600 text-white rounded text-sm">Publish</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
