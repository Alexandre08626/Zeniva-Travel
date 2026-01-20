'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/src/lib/authStore';

export default function ResetPasswordPage() {
  const user = useAuthStore((s) => s.user);
  const [email, setEmail] = useState(user?.email ?? '');
  const [status, setStatus] = useState<'idle'|'loading'|'success'|'error'>('idle');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error('Network error');
      setStatus('success');
    } catch (err) {
      setStatus('error');
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow">
      <h1 className="text-lg font-semibold mb-2">Réinitialiser le mot de passe</h1>
      <p className="text-sm text-gray-500 mb-4">Entrez votre adresse courriel et nous vous enverrons un lien pour réinitialiser votre mot de passe.</p>
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block">
          <span className="text-sm text-gray-700">Adresse courriel</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="mt-1 block w-full rounded border px-3 py-2" />
        </label>

        <div className="flex items-center gap-2">
          <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded" disabled={status === 'loading'}>{status === 'loading' ? 'Envoi...' : 'Envoyer le lien'}</button>
          {status === 'success' && <span className="text-green-600">Lien envoyé (simulation)</span>}
          {status === 'error' && <span className="text-red-600">Erreur, réessayez.</span>}
        </div>
      </form>
    </div>
  );
}
