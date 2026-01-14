"use client";

import Link from "next/link";
import Image from "next/image";
import React from "react";
import { PREMIUM_BLUE, TITLE_TEXT, MUTED_TEXT } from "../design/tokens";
import { logout, useAuthStore, isAgent } from "../lib/authStore";
import LocaleSwitcher from "./LocaleSwitcher";
import Pill from "./Pill";

export default function Header({ isLoggedIn, userEmail }: { isLoggedIn?: boolean; userEmail?: string }) {
  const authUser = useAuthStore((s) => s.user);
  const loggedIn = authUser ? true : isLoggedIn;
  const email = authUser?.email || userEmail;
  const agent = authUser ? isAgent(authUser) : false;

  return (
    <div className="mb-6 flex items-center justify-between" style={{ paddingTop: '6px' }}>
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/branding/logo.png" alt="Zeniva logo" width={56} height={56} />
          <div className="hidden sm:block">
            <div className="text-lg font-extrabold" style={{ color: TITLE_TEXT }}>Zeniva Travel</div>
            <div className="text-xs flex items-center gap-1" style={{ color: MUTED_TEXT }}>
              Powered by Lina AI
              <Image src="/branding/lina-avatar.png" alt="Lina AI" width={20} height={20} />
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

      <div className="flex items-center gap-3">
        {!loggedIn && (
          <Link
            href="/partner"
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold mr-2"
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

        <div className="flex items-center gap-2 ml-4">
          <Image src="/branding/lina-avatar.png" alt="Lina avatar" width={40} height={40} className="rounded-full" />
          {!loggedIn && <LocaleSwitcher orientation="horizontal" className="h-9" />}
        </div>
      </div>
    </div>
  );
}
