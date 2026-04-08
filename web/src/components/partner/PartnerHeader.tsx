"use client";
import React, { useState } from 'react';
import { Search, Bell } from 'lucide-react';
import Image from 'next/image';
import { useAuthStore } from '@/src/lib/authStore';
import AccountMenu from '../AccountMenu.client';

export default function PartnerHeader() {
  const user = useAuthStore((s) => s.user);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between gap-6">
        {/* Left: Brand */}
        <div className="flex items-center gap-8">
          <a href="/partner/dashboard" className="flex items-center gap-3">
            <Image
              src="/branding/logo.png"
              alt="Zeniva"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="font-semibold text-lg hidden sm:inline">Partner</span>
          </a>

          <nav className="hidden md:flex items-center gap-1">
            <a href="/partner/dashboard" className="px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">Dashboard</a>
            <a href="/partner/listings" className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Listings</a>
            <a href="/partner/calendar" className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Calendar</a>
            <a href="/partner/bookings" className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Bookings</a>
            <a href="/partner/inbox" className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Inbox</a>
          </nav>
        </div>

        {/* Right: Search + Notifications + AccountMenu */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg w-64">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search bookings, listings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full"
            />
          </div>

          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <AccountMenu />
        </div>
      </div>
    </header>
  );
}
