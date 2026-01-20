"use client";
import React from 'react';
import { Image, Eye, Edit } from 'lucide-react';

const statusStyles = {
  draft: 'bg-gray-100 text-gray-700',
  published: 'bg-emerald-50 text-emerald-700',
  paused: 'bg-amber-50 text-amber-700',
};

export default function ListingCard({ listing }: { listing: { id: string; title: string; status: string; img?: string } }) {
  const status = listing.status.toLowerCase() as keyof typeof statusStyles;
  
  return (
    <div className="group rounded-xl overflow-hidden border border-gray-200 bg-white hover:shadow-lg hover:border-gray-300 transition-all duration-200">
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
        {listing.img ? (
          <img src={listing.img} alt={listing.title} className="w-full h-full object-cover" />
        ) : (
          <Image className="w-12 h-12 text-gray-400" />
        )}
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 rounded-lg text-xs font-medium backdrop-blur-sm ${statusStyles[status] || statusStyles.draft}`}>
            {listing.status}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h4 className="font-semibold text-gray-900 truncate">{listing.title}</h4>
        <div className="mt-3 flex gap-2">
          <button className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5">
            <Edit className="w-4 h-4" />
            Edit
          </button>
          {status !== 'published' && (
            <button className="flex-1 px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5">
              <Eye className="w-4 h-4" />
              Publish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
