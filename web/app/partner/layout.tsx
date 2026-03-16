"use client";
import React from "react";
import PartnerSidebar from "../../src/components/partner/PartnerSidebar";
import PartnerHeader from "../../src/components/partner/PartnerHeader";
import { ToastContainer } from "../../src/components/partner/Toast";

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-brand="partner" className="min-h-screen bg-gray-50">
      <PartnerSidebar />
      <div className="lg:pl-72">
        <PartnerHeader />
        <main className="p-6">{children}</main>
      </div>
      <ToastContainer />
    </div>
  );
}