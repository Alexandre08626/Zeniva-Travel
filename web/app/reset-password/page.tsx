'use client';

import React, { useState } from 'react';
import { resetPasswordByEmail, useAuthStore } from '@/src/lib/authStore';

export default function ResetPasswordPage() {
  const user = useAuthStore((s) => s.user);
  const [email, setEmail] = useState(user?.email ?? '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState<'idle'|'loading'|'success'|'error'>('idle');
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!password || password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setStatus('loading');
    try {
      resetPasswordByEmail(email, password);
      try {
        await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
      } catch (_) {
        // ignore dev email failures
      }
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err?.message || 'Erreur, réessayez.');
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow">
      <h1 className="text-lg font-semibold mb-2">Réinitialiser le mot de passe</h1>
        <p className="text-sm text-gray-500 mb-4">Entrez votre adresse courriel et définissez un nouveau mot de passe.</p>
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block">
          <span className="text-sm text-gray-700">Adresse courriel</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="mt-1 block w-full rounded border px-3 py-2" />
        </label>
        <label className="block">
          <span className="text-sm text-gray-700">Nouveau mot de passe</span>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required className="mt-1 block w-full rounded border px-3 py-2" />
        </label>
        <label className="block">
          <span className="text-sm text-gray-700">Confirmer le mot de passe</span>
          <input value={confirm} onChange={(e) => setConfirm(e.target.value)} type="password" required className="mt-1 block w-full rounded border px-3 py-2" />
        </label>

        <div className="flex items-center gap-2">
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded" disabled={status === 'loading'}>{status === 'loading' ? 'Mise à jour...' : 'Réinitialiser'}</button>
          {status === 'success' && <span className="text-blue-600">Mot de passe réinitialisé.</span>}
          {status === 'error' && <span className="text-red-600">Erreur, réessayez.</span>}
        </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          {status === 'success' && (
            <div className="pt-2">
              <a href="/login" className="text-sm font-semibold text-blue-700">Aller à la connexion</a>
            </div>
          )}
      </form>
    </div>
  );
}
