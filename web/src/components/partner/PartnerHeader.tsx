"use client";
import React, { useState } from 'react';
import { Search, Bell, ChevronDown, User, Settings, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore, logout, switchActiveSpace } from '@/src/lib/authStore';
import LinaAvatar from '../LinaAvatar';

export default function PartnerHeader() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSwitchToTraveler = () => {
    switchActiveSpace('traveler');
    setTimeout(() => {
      router.push('/switch-space?target=traveler&returnTo=/');
    }, 150);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

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
            <a href="/partner/dashboard" className="px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              Dashboard
            </a>
            <a href="/partner/listings" className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              Listings
            </a>
            <a href="/partner/calendar" className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              Calendar
            </a>
            <a href="/partner/bookings" className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              Bookings
            </a>
            <a href="/partner/inbox" className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              Inbox
            </a>
          </nav>
        </div>

        {/* Right: Search + Notifications + Avatar */}
        <div className="flex items-center gap-4">
          {/* Search */}
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

          {/* Notifications */}
          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Avatar dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LinaAvatar size="sm" />
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-2">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="font-medium text-sm">{user?.name || 'User'}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{user?.email}</div>
                  </div>
                  
                  <div className="py-2">
                    <button
                      onClick={handleSwitchToTraveler}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      Switch to Traveler
                    </button>
                    <a
                      href="/partner/settings"
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Account Settings
                    </a>
                  </div>

                  <div className="border-t border-gray-100 pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
