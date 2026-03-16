'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/src/lib/authStore';

export default function PartnerConnectPage() {
  const user = useAuthStore((s) => s.user);
  const [email, setEmail] = useState(user?.email ?? '');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle'|'loading'|'success'|'error'>('idle');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/partner/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      if (!res.ok) throw new Error('Network error');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow">
      <h1 className="text-lg font-semibold mb-2">Connexion partenaire</h1>
      <p className="text-sm text-gray-500 mb-4">Si vous avez perdu votre code, entrez votre adresse courriel et votre code ici. Vous pouvez aussi demander que l&apos;on vous renvoie un code.</p>

      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block">
          <span className="text-sm text-gray-700">Adresse courriel</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="mt-1 block w-full rounded border px-3 py-2" />
        </label>

        <label className="block">
          <span className="text-sm text-gray-700">Code partenaire (si vous l&apos;avez)</span>
          <input value={code} onChange={(e) => setCode(e.target.value)} type="text" className="mt-1 block w-full rounded border px-3 py-2" />
        </label>

        <div className="flex items-center gap-2">
          <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded" disabled={status === 'loading'}>{status === 'loading' ? 'Envoi...' : 'Soumettre'}</button>
          <button type="button" onClick={async () => {
            setStatus('loading');
            try {
              const res = await fetch('/api/auth/resend-invite', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
              if (!res.ok) throw new Error('Network');
              setStatus('success');
            } catch {
              setStatus('error');
            }
          }} className="px-3 py-2 border rounded">Renvoyer le code</button>

          {status === 'success' && <span className="text-green-600">Requête envoyée (simulation)</span>}
          {status === 'error' && <span className="text-red-600">Erreur, réessayez.</span>}
        </div>
      </form>
    </div>
  );
}
