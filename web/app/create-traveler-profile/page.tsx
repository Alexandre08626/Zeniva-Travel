'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { createTravelerProfile, switchActiveSpace } from '@/src/lib/authStore';

function CreateTravelerProfileContent() {
  const router = useRouter();
  const params = useSearchParams();
  const returnTo = params?.get('returnTo') || '/';
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');

  async function onSubmit(e: any) {
    e.preventDefault();
    setLoading(true);
    try {
      createTravelerProfile({ displayName: displayName || undefined, phone: phone || undefined });
      // Switch to traveler space after creation
      switchActiveSpace('traveler');
      setTimeout(() => router.push(returnTo), 200);
    } catch (err) {
      router.push('/login');
    }
  }

  return (
    <div className="p-8 max-w-md mx-auto" data-space="traveler">
      <h1 className="text-2xl font-semibold">Create traveler profile</h1>
      <p className="mt-2 text-sm text-muted-foreground">This takes 30 seconds. Name and phone are optional.</p>
      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <div>
          <label className="block text-sm">Name</label>
          <input value={displayName} onChange={(e)=>setDisplayName(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm">Phone</label>
          <input value={phone} onChange={(e)=>setPhone(e.target.value)} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">Create and switch</button>
        </div>
      </form>
    </div>
  );
}

export default function CreateTravelerProfilePage() {
  return (
    <Suspense fallback={<div className="p-8 max-w-md mx-auto"><h1 className="text-2xl font-semibold">Create traveler profile</h1></div>}>
      <CreateTravelerProfileContent />
    </Suspense>
  );
}
