"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  Calendar, 
  BookOpen, 
  MessageSquare, 
  Wallet, 
  Settings,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { label: 'Dashboard', href: '/partner/dashboard', icon: LayoutDashboard },
  { label: 'Listings', href: '/partner/listings', icon: Package },
  { label: 'Calendar', href: '/partner/calendar', icon: Calendar },
  { label: 'Bookings', href: '/partner/bookings', icon: BookOpen },
  { label: 'Inbox', href: '/partner/inbox', icon: MessageSquare },
  { label: 'Payouts', href: '/partner/payouts', icon: Wallet },
  { label: 'Settings', href: '/partner/settings', icon: Settings },
];

function PartnerNavContent({
  pathname,
  onNavigate,
}: {
  pathname?: string | null;
  onNavigate: () => void;
}) {
  const isActive = (href: string) => {
    if (href === '/partner/dashboard') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className="flex flex-col h-full">
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                active
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-emerald-600' : 'text-gray-500'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-gray-200">
        <div className="px-4 py-3 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-900">Premium Plan</span>
            <span className="text-xs px-2 py-0.5 bg-emerald-600 text-white rounded-full">Active</span>
          </div>
          <p className="text-xs text-gray-600 mb-3">Unlimited listings & bookings</p>
          <Link href="/partner/settings?tab=billing" className="text-xs font-medium text-emerald-600 hover:text-emerald-700">
            Manage subscription →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PartnerSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleNavigate = () => setMobileOpen(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
      >
        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileOpen(false)}>
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Partner Portal</h2>
            </div>
            <PartnerNavContent pathname={pathname} onNavigate={handleNavigate} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-72 bg-white border-r border-gray-200 fixed inset-y-0 left-0">
        <div className="p-6 border-b border-gray-200">
          <Link href="/partner/dashboard">
            <h2 className="text-xl font-bold text-gray-900">Partner Portal</h2>
            <p className="text-sm text-gray-600 mt-1">Manage your properties</p>
          </Link>
        </div>
        <PartnerNavContent pathname={pathname} onNavigate={handleNavigate} />
      </aside>
    </>
  );
}
