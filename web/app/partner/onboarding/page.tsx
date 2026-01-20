"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, updatePartnerProfile } from "../../../src/lib/authStore";
import PartnerHeader from '../../../src/components/partner/PartnerHeader';
import { Building2, Save } from 'lucide-react';

export default function PartnerOnboardingPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [legalName, setLegalName] = useState(user?.partnerCompany?.legalName || "");
  const [displayName, setDisplayName] = useState(user?.partnerCompany?.displayName || "");
  const [phone, setPhone] = useState(user?.partnerCompany?.phone || "");
  const [country, setCountry] = useState(user?.partnerCompany?.country || "");
  const [currency, setCurrency] = useState(user?.partnerCompany?.currency || "");
  const [language, setLanguage] = useState(user?.partnerCompany?.language || "en");

  const handleSave = () => {
    try {
      updatePartnerProfile({ legalName, displayName, phone, country, currency, language, kycStatus: "pending" });
      router.push("/partner/dashboard");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PartnerHeader />
      <div className="max-w-[1280px] mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-emerald-600" />
            Partner Onboarding
          </h1>
          <p className="text-gray-600 mt-2">Complete your company profile. KYC will be reviewed by Zeniva.</p>
        </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-2xl">
        <div className="space-y-6">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Legal company name</span>
          <input className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all" value={legalName} onChange={(e)=>setLegalName(e.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Display name</span>
          <input className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all" value={displayName} onChange={(e)=>setDisplayName(e.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Phone</span>
          <input className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all" value={phone} onChange={(e)=>setPhone(e.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Country</span>
          <input className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all" value={country} onChange={(e)=>setCountry(e.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Currency</span>
          <input className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all" value={currency} onChange={(e)=>setCurrency(e.target.value)} />
        </label>
        <label className="block">
          Language
          <select className="mt-1 w-full border rounded px-3 py-2" value={language} onChange={(e)=>setLanguage(e.target.value)}>
            <option value="en">English</option>
            <option value="fr">French</option>
          </select>
        </label>

        <div className="flex gap-2">
          <button onClick={handleSave} className="px-3 py-2 bg-black text-white rounded">Save and continue</button>
          <button onClick={()=>router.push('/partner/dashboard')} className="px-3 py-2 border rounded">Skip</button>
        </div>
      </div>
      </div>
      </div>
    </div>
  );
}