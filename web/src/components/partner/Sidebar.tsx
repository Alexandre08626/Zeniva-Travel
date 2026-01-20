"use client";

import Link from 'next/link';
import React from 'react';
import { Home, List, Calendar, Mail, Wallet, Settings, User } from 'lucide-react';

export default function Sidebar({ active = 'dashboard' }: { active?: string }) {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const nav = [
    { id: 'dashboard', label: 'Dashboard', href: '/partner/dashboard', icon: Home },
    { id: 'listings', label: 'Listings', href: '/partner/listings', icon: List },
    { id: 'calendar', label: 'Calendar', href: '/partner/preview', icon: Calendar },
    { id: 'bookings', label: 'Bookings', href: '/partner/bookings', icon: Mail },
    { id: 'inbox', label: 'Inbox', href: '/partner/inbox', icon: Mail },
    { id: 'payouts', label: 'Payouts', href: '/partner/payouts', icon: Wallet },
    { id: 'settings', label: 'Settings', href: '/partner/settings', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 gap-4 pr-4">
      <div className="px-3 py-4 rounded-md">
        <div className="text-xs text-gray-500">Partner</div>
        <div className="mt-2 font-bold text-lg">Host Dashboard</div>
      </div>

      <nav className="flex-1 px-2 space-y-1">
        {nav.map((n) => {
          const Icon = n.icon;
          const activeClass = active === n.id ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'text-gray-700 hover:bg-gray-50';
          const isActive = pathname.startsWith(n.href) || active === n.id;
          const classes = `flex items-center gap-3 px-3 py-2 rounded-lg border ${isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'text-gray-700 hover:bg-gray-50'}`;
          return (
            <Link key={n.id} href={n.href} className={classes} aria-current={isActive ? 'page' : undefined}>
              <Icon size={18} />
              <span className="font-medium text-sm">{n.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-3">
        <div className="text-xs text-gray-500 mb-2">Account</div>
        <Link href="/partner/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg border text-gray-700 hover:bg-gray-50">
          <User size={16} /> <span className="text-sm">Profile settings</span>
        </Link>
      </div>
    </aside>
  );
}
