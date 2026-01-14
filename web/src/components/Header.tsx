"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState } from "react";
import { PREMIUM_BLUE, TITLE_TEXT, MUTED_TEXT } from "../design/tokens";
import { logout, useAuthStore, isAgent } from "../lib/authStore";
import LocaleSwitcher from "./LocaleSwitcher";
import Pill from "./Pill";

export default function Header({ isLoggedIn, userEmail }: { isLoggedIn?: boolean; userEmail?: string }) {
  const authUser = useAuthStore((s) => s.user);
  const loggedIn = authUser ? true : isLoggedIn;
  const email = authUser?.email || userEmail;
  const agent = authUser ? isAgent(authUser) : false;
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <style>{`
        @media (max-width: 640px) {
          .header-main {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 0;
          }
          .header-left {
            flex: 1;
          }
          .header-right {
            display: none;
          }
          .mobile-menu-btn {
            display: block;
          }
        }
        .mobile-menu-btn {
          display: none;
        }
      `}</style>
      <div className="mb-6 flex items-center justify-between header-main" style={{ paddingTop: '6px' }}>
        <div className="flex items-center gap-4 header-left">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/branding/logo.png" alt="Zeniva logo" width={56} height={56} />
            <div className="hidden sm:block">
              <div className="text-lg font-extrabold" style={{ color: TITLE_TEXT }}>Zeniva Travel</div>
              <div className="text-xs flex items-center gap-1" style={{ color: MUTED_TEXT }}>
                Powered by Lina AI
                <img src="/branding/lina-avatar.png" alt="Lina AI" width={20} height={20} style={{ borderRadius: '50%' }} />
              </div>
            </div>
            <div className="sm:hidden">
              <div className="text-sm font-extrabold" style={{ color: TITLE_TEXT }}>Zeniva</div>
              <div className="text-xs flex items-center gap-1" style={{ color: MUTED_TEXT }}>
                Lina AI
                <img src="/branding/lina-avatar.png" alt="Lina AI" width={16} height={16} style={{ borderRadius: '50%' }} />
              </div>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center gap-3 ml-4">
            <Link href="/yachts" className="text-sm text-slate-700 hover:underline">Yacht Charters</Link>
            <Link href="/partners/resorts" className="text-sm text-slate-700 hover:underline">Partner Resorts</Link>
            <Link href="/collections/group" className="text-sm text-slate-700 hover:underline">Group Trips</Link>
            <Link href="/airbnbs" className="text-sm text-slate-700 hover:underline">Partner Airbnbs</Link>
            {loggedIn && (
              <Link href="/documents" className="text-sm text-slate-900 font-semibold hover:underline">My Travel Documents</Link>
            )}
          </nav>
        </div>

        <button onClick={() => setMenuOpen(true)} className="hidden mobile-menu-btn p-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="flex items-center gap-3 header-right">
          {!loggedIn && (
            <Link
              href="/partner"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold mr-2 header-partner"
              style={{ color: TITLE_TEXT }}
            >
              Partner with us
            </Link>
          )}

          {loggedIn ? (
          <>
            <div className="max-w-[220px] truncate text-xs font-semibold" style={{ color: MUTED_TEXT }} title={email}>
              {email}
            </div>
            <button
              className="rounded-full border px-4 py-2 text-sm font-semibold"
              style={{ borderColor: "#000000ff", color: "#01000aff" }}
              onClick={() => logout()}
            >
              Log out
            </button>
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
            <Link href="/signup" className="rounded-full px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: PREMIUM_BLUE, opacity: 0.96 }}>
              Sign up
            </Link>
            <Link href="/login" className="rounded-full border px-4 py-2 text-sm font-semibold" style={{ borderColor: PREMIUM_BLUE, color: PREMIUM_BLUE, opacity: 0.92 }}>
              Log in
            </Link>
          </>
        )}

        <div className="hidden sm:flex items-center gap-2 ml-4">
          <Image src="/branding/lina-avatar.png" alt="Lina avatar" width={40} height={40} className="rounded-full" />
          {!loggedIn && <LocaleSwitcher orientation="horizontal" className="h-9" />}
        </div>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setMenuOpen(false)}>
          <div className="fixed bottom-0 left-0 right-0 bg-white p-6 rounded-t-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col gap-4">
              <Link href="/partner" className="text-center py-3 bg-slate-100 rounded-lg font-semibold" onClick={() => setMenuOpen(false)}>
                Partner with us
              </Link>
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
  );
}
