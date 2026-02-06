'use client';

import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useAuthStore, logout, switchActiveSpace } from '@/src/lib/authStore';
import LinaAvatar from './LinaAvatar';

export default function AccountMenu() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<{ top: number; right: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const roles = user?.roles || (user?.role ? [user.role] : []);
  // HQ has access to all spaces including partner for admin purposes
  const isHQ = user?.email?.toLowerCase() === 'info@zenivatravel.com' || roles.includes('hq');
  const canPartner = isHQ || roles.includes('partner_owner') || roles.includes('partner_staff');
  const canAgent = roles.some((r) => ['hq','admin','finance','support','travel-agent','yacht-broker','yacht-partner','influencer','agent'].includes(r));
  const canTraveler = roles.includes('traveler') || !!user?.travelerProfile;

  function goTo(space: 'traveler'|'partner'|'agent') {
    if (space === 'traveler' && !canTraveler) {
      router.push('/create-traveler-profile');
      return;
    }
    switchActiveSpace(space);
    // Force full page reload to ensure cookies are applied by middleware
    setTimeout(() => {
      const targetUrl = space === 'partner' ? '/partner/dashboard' : space === 'traveler' ? '/app' : '/agent';
      window.location.href = targetUrl;
    }, 150);
  }

  if (!user) {
    return null;
  }

  return (
    <div className="relative">
      <div>
        <button
          ref={buttonRef}
          onClick={() => {
            const next = !open;
            setOpen(next);
            if (next && buttonRef.current && typeof window !== 'undefined') {
              const rect = buttonRef.current.getBoundingClientRect();
              const right = Math.max(12, window.innerWidth - rect.right);
              const top = rect.bottom + 8;
              setMenuStyle({ top, right });
            }
          }}
          className="flex items-center space-x-2 p-2 rounded-full border bg-white shadow-sm hover:shadow-md transition-shadow"
        >
          <LinaAvatar size="sm" />
          <span className="hidden sm:inline text-sm font-medium truncate max-w-[120px]">{user.name}</span>
        </button>
        {open && typeof document !== 'undefined' && createPortal(
          <div
            className="fixed w-64 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 shadow-xl ring-1 ring-black/5 z-[99999]"
            style={{ top: menuStyle?.top ?? 64, right: menuStyle?.right ?? 16 }}
          >
            <div className="mb-2 text-sm text-slate-600">Signed in as <strong className="text-slate-900">{user.email}</strong></div>
            <div className="space-y-2">
              <button onClick={() => goTo('traveler')} className="w-full text-left px-3 py-2 rounded text-slate-900 hover:bg-slate-50">Switch to Traveler</button>
              {canPartner && <button onClick={() => goTo('partner')} className="w-full text-left px-3 py-2 rounded text-slate-900 hover:bg-slate-50">Switch to Partner</button>}
              {canAgent && <button onClick={() => goTo('agent')} className="w-full text-left px-3 py-2 rounded text-slate-900 hover:bg-slate-50">Switch to Agent</button>}
              
              <div className="border-t pt-2">
                <button onClick={() => { router.push('/reset-password'); setOpen(false); }} className="w-full text-left px-3 py-2 rounded text-slate-900 hover:bg-slate-50">Reset password</button>
              </div>

              <div className="border-t pt-2">
                <button onClick={() => { logout(); router.push('/'); }} className="w-full text-left px-3 py-2 rounded text-slate-900 hover:bg-slate-50">Sign out</button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </div>
  );
}
