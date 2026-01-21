"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState } from "react";
import { PREMIUM_BLUE, TITLE_TEXT, MUTED_TEXT } from "../design/tokens";
import { logout, useAuthStore, isAgent, isPartner } from "../lib/authStore";
import LocaleSwitcher from "./LocaleSwitcher";
import Pill from "./Pill";
import LinaAvatar from "./LinaAvatar";
import AccountMenu from "./AccountMenu.client";
import { Bell, Search } from 'lucide-react';

export default function Header({ isLoggedIn, userEmail }: { isLoggedIn?: boolean; userEmail?: string }) {
  const authUser = useAuthStore((s) => s.user);
  const loggedIn = authUser ? true : isLoggedIn;
  const email = authUser?.email || userEmail;
  const agent = authUser ? isAgent(authUser) : false;
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between header-main" style={{ paddingTop: '6px' }}>
        <div className="flex items-center gap-4 header-left">
          {/* Mobile: logo et titre centrés, rien d'autre */}
          <div className="w-full flex flex-col items-center justify-center sm:hidden">
            <Image src="/branding/logo.png" alt="Zeniva logo" width={56} height={56} className="mx-auto mb-1" />
            <span className="text-lg font-extrabold text-center" style={{ color: TITLE_TEXT }}>{process.env.NEXT_PUBLIC_BUSINESS_NAME || 'Zeniva Travel'}</span>
          </div>
          {/* Desktop: logo et titre comme avant */}
          <Link href="/" className="items-center gap-3 hidden sm:flex">
            <Image src="/branding/logo.png" alt="Zeniva logo" width={56} height={56} />
            <div>
              <div className="text-lg font-extrabold" style={{ color: TITLE_TEXT }}>{process.env.NEXT_PUBLIC_BUSINESS_NAME || 'Zeniva Travel'}</div>
              <div className="text-xs flex items-center gap-1" style={{ color: MUTED_TEXT }}>
                Powered by Lina AI
                <LinaAvatar size="sm" />
              </div>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center gap-3 ml-4">
            <Link href="/yachts" className="text-sm text-slate-700 hover:underline">Yacht Charters</Link>
            <Link href="/partners/resorts" className="text-sm text-slate-700 hover:underline">Partner Resorts</Link>
            <Link href="/collections/group" className="text-sm text-slate-700 hover:underline">Group Trips</Link>
            <Link href="/airbnbs" className="text-sm text-slate-700 hover:underline">Partner Airbnbs</Link>
            {loggedIn && (
              <>
                <Link href="/documents" className="text-sm text-slate-900 font-semibold hover:underline">My Travel Documents</Link>
                {isPartner(authUser) && (
                  <Link href="/partner/dashboard" className="text-sm text-slate-900 font-semibold hover:underline">Partner</Link>
                )}
              </>
            )}
          </nav>
        </div>

        <button onClick={() => setMenuOpen(true)} className="mobile-menu-btn sm:hidden p-1 sm:p-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="flex items-center gap-2 header-right sm:flex hidden">
          {loggedIn ? (
          <>
            {agent && (
              <Link
                href="/agent"
                className="rounded-full border px-4 py-2 text-sm font-semibold"
                style={{ borderColor: PREMIUM_BLUE, color: PREMIUM_BLUE, opacity: 0.92 }}
              >
                Switch to agent workspace
              </Link>
            )}
          </>
        ) : (
          <>
            <Link href="/signup" className="rounded-full px-2 py-1 text-xs font-semibold text-white sm:px-4 sm:py-2 sm:text-sm" style={{ backgroundColor: PREMIUM_BLUE, opacity: 0.96 }}>
              Sign up
            </Link>
            <Link href="/login" className="rounded-full border px-2 py-1 text-xs font-semibold sm:px-4 sm:py-2 sm:text-sm" style={{ borderColor: PREMIUM_BLUE, color: PREMIUM_BLUE, opacity: 0.92 }}>
              Log in
            </Link>
          </>
        )}

        <div className="hidden sm:flex items-center gap-3 ml-4">
          <div className="hidden md:block">
            <button aria-label="Search" className="p-2 rounded-lg hover:bg-gray-100"><Search size={18} /></button>
          </div>
          <button aria-label="Notifications" className="p-2 rounded-lg hover:bg-gray-100"><Bell size={18} /></button>
          {loggedIn ? (
            <AccountMenu />
          ) : (
            <>
              <Image src="/branding/lina-avatar.png" alt="Lina avatar" width={40} height={40} className="rounded-full" />
              <LocaleSwitcher orientation="horizontal" className="h-9" />
            </>
          )}
        </div>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setMenuOpen(false)}>
          <div className="fixed bottom-0 left-0 right-0 bg-white p-6 rounded-t-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col gap-4">
              <Link href="/signup" className="text-center py-3 bg-blue-500 text-white rounded-lg font-semibold" onClick={() => setMenuOpen(false)}>
                Sign up
              </Link>
              <Link href="/login" className="text-center py-3 border border-slate-300 rounded-lg font-semibold" onClick={() => setMenuOpen(false)}>
                Log in
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
