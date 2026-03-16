'use client';
export const dynamic = "force-dynamic";

import { useState, useEffect } from 'react';
import { createTravelerProfile, switchActiveSpace } from '@/src/lib/authStore';

export default function CreateTravelerProfilePage() {
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [returnTo, setReturnTo] = useState('/');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setReturnTo(params.get('returnTo') || '/');
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      createTravelerProfile({ displayName: displayName || undefined, phone: phone || undefined });
      switchActiveSpace('traveler');
      setTimeout(() => { window.location.href = returnTo; }, 200);
    } catch {
      window.location.href = '/login';
    }
  }

  return (
    <div className="p-8 max-w-md mx-auto" data-space="traveler">
      <h1 className="text-2xl font-semibold">Create traveler profile</h1>
      <p className="mt-2 text-sm text-muted-foreground">This takes 30 seconds. Name and phone are optional.</p>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <div>
          <label className="block text-sm">Name</label>
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm">Phone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
          {loading ? 'Creating…' : 'Create and switch'}
        </button>
      </form>
    </div>
  );
}
