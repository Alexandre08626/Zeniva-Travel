'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { switchActiveSpace } from '@/src/lib/authStore';

export default function SwitchSpacePage() {
  const router = useRouter();
  const params = useSearchParams();
  const target = params?.get('target') || 'traveler';
  const returnTo = params?.get('returnTo') || (target === 'partner' ? '/partner/dashboard' : '/');

  useEffect(() => {
    try {
      switchActiveSpace(target as 'traveler' | 'partner' | 'agent');
      // Small delay for cookies to settle
      setTimeout(() => router.push(returnTo), 200);
    } catch (err) {
      // If not authenticated, redirect to login
      router.push('/login');
    }
  }, [target, returnTo, router]);

  return (
    <div className="p-8">
      <h1>Switching space…</h1>
      <p>If nothing happens, <a href={returnTo}>click here</a>.</p>
    </div>
  );
}
