"use client";
import React from "react";
import PageHeader from "../../../src/components/partner/PageHeader";

export default function PartnerPreviewPage() {
  return (
    <main className="min-h-screen p-10 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Visual preview — Publish flow"
          subtitle="This mockup shows the partner publish flow and how a listing appears on public pages (Airbnb / Yacht / Hotel)."
          backHref="/partner/dashboard"
          breadcrumbs={[
            { label: 'Partner', href: '/partner/dashboard' },
            { label: 'Preview' }
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="bg-white p-4 rounded shadow">
            <h2 className="font-semibold mb-3">Partner workspace (onboarding)</h2>
            <div className="text-sm text-slate-600">Company: <strong>La Mer Voyages</strong></div>
            <div className="mt-3 space-y-2">
              <div className="p-3 bg-slate-50 rounded">KYC: <span className="font-semibold">Verified</span></div>
              <div className="p-3 bg-slate-50 rounded">Listings: <span className="font-semibold">3</span></div>
              <div className="p-3 bg-slate-50 rounded">Wallet: <span className="font-semibold">$2,430</span></div>
            </div>
          </section>

          <section className="bg-white p-4 rounded shadow">
            <h2 className="font-semibold mb-3">Listing editor</h2>

            <div className="border rounded-lg overflow-hidden">
              <div className="h-40 w-full bg-slate-200 flex items-center justify-center">Image preview</div>
              <div className="p-4">
                <div className="text-xl font-bold">Seaside Villa, 4BR</div>
                <div className="text-sm text-slate-500">Type: <strong>Home (Airbnb)</strong></div>
                <p className="mt-2 text-sm text-slate-600">Bright 4-bedroom villa on the coast with pool, chef, and private dock.</p>

                <div className="mt-4 flex gap-2">
                  <button className="px-4 py-2 bg-black text-white rounded">Save draft</button>
                  <button className="px-4 py-2 border rounded">Preview</button>
                  <button className="px-4 py-2 bg-emerald-600 text-white rounded">Publish</button>
                </div>
              </div>
            </div>

            <div className="mt-3 text-xs text-slate-500">Publishing a listing with status <code>published</code> will make it appear on the appropriate public page (Airbnbs, Yachts, or Hotels).</div>
          </section>

          <section className="bg-white p-4 rounded shadow">
            <h2 className="font-semibold mb-3">Public listing preview</h2>

            <div className="rounded-lg overflow-hidden border">
              <div className="h-40 w-full bg-cover bg-center" style={{ backgroundImage: 'url(/branding/hotel.jpg)' }} />
              <div className="p-4">
                <div className="text-sm text-slate-500">Airbnbs</div>
                <div className="text-xl font-bold">Seaside Villa, 4BR</div>
                <div className="text-sm text-slate-600 mt-2">4 guests · 2 bedrooms · From $420 / night</div>
                <div className="mt-3 flex gap-2">
                  <button className="px-3 py-2 border rounded">View details</button>
                  <button className="px-3 py-2 bg-black text-white rounded">Message host</button>
                </div>
              </div>
            </div>

            <div className="mt-4 text-xs text-slate-500">This is how a published partner listing will render across public pages. It will be discoverable via search and reachable from partner-specific pages.</div>
          </section>
        </div>

        <div className="mt-8 bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Notes</h3>
          <ul className="list-disc ml-5 mt-2 text-sm text-slate-600">
            <li>Partners publish listings into the shared catalog (type determines the public page).</li>
            <li>Listings must pass basic compliance/KYC checks before going live (KYC currently manual).</li>
            <li>Next: add calendar, pricing, fees, and AI pricing optimizer.</li>
          </ul>
        </div>
      </div>
    </main>
  );
}