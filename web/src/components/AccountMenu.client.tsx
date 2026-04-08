'use client';

import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useAuthStore, logout, switchActiveSpace, setPreviewRole } from '@/src/lib/authStore';
import { canPreviewRole, RBAC_ROLES, type RbacRole } from '@/src/lib/rbac';
import { locales, localeLabels } from '../lib/i18n/config';
import { useI18n } from '../lib/i18n/I18nProvider';

const T: Record<string, Record<string, string>> = {
  en: {
    signedIn: "Signed in as",
    language: "Language",
    switchTraveler: "Switch to Traveler",
    switchPartner: "Switch to Partner",
    switchAgent: "Switch to Agent",
    switchInfluencer: "Switch to Influencer",
    resetPassword: "Reset password",
    signOut: "Sign out",
    previewMode: "Preview mode",
    off: "Off",
  },
  fr: {
    signedIn: "Connecté en tant que",
    language: "Langue",
    switchTraveler: "Passer en mode Voyageur",
    switchPartner: "Passer en mode Partenaire",
    switchAgent: "Passer en mode Agent",
    switchInfluencer: "Passer en mode Influenceur",
    resetPassword: "Réinitialiser le mot de passe",
    signOut: "Se déconnecter",
    previewMode: "Mode aperçu",
    off: "Désactivé",
  },
  es: {
    signedIn: "Conectado como",
    language: "Idioma",
    switchTraveler: "Cambiar a Viajero",
    switchPartner: "Cambiar a Socio",
    switchAgent: "Cambiar a Agente",
    switchInfluencer: "Cambiar a Influencer",
    resetPassword: "Restablecer contraseña",
    signOut: "Cerrar sesión",
    previewMode: "Modo vista previa",
    off: "Desactivado",
  },
};

export default function AccountMenu() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<{ top: number; right: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const roles = user?.roles || (user?.role ? [user.role] : []);
  const canPartner = roles.includes('partner_owner') || roles.includes('partner_staff');
  const canAgent = roles.some((r) => RBAC_ROLES.includes(r as RbacRole));
  const isInfluencer = roles.includes('influencer');
  const canTraveler = roles.includes('traveler') || !!user?.travelerProfile;
  const canPreview = canPreviewRole({ email: user?.email, id: (user as any)?.id });
  const previewRole = user?.effectiveRole || '';
  const { locale, setLocale } = useI18n();
  const t = T[locale] || T.en;

  function goTo(space: 'traveler'|'partner'|'agent'|'influencer') {
    setOpen(false);
    if (space === 'influencer') {
      switchActiveSpace('agent');
      setTimeout(() => { window.location.href = '/agent/influencer'; }, 150);
      return;
    }
    if (space === 'traveler' && !canTraveler) {
      router.push('/create-traveler-profile');
      return;
    }
    switchActiveSpace(space);
    setTimeout(() => {
      const targetUrl = space === 'partner' ? '/partner/dashboard' : space === 'traveler' ? '/app' : '/agent';
      window.location.href = targetUrl;
    }, 150);
  }

  if (!user) return null;

  const initials = (user.name || user.email || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => {
          const next = !open;
          setOpen(next);
          if (next && buttonRef.current && typeof window !== 'undefined') {
            const rect = buttonRef.current.getBoundingClientRect();
            const right = Math.max(12, window.innerWidth - rect.right);
            const top = rect.bottom + 8;
            setMenuStyle({ top, right });
          }
        }}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-[11px] font-bold text-white">
          {initials}
        </div>
        <span className="hidden sm:inline text-sm font-medium truncate max-w-[120px] text-slate-700">{user.name}</span>
        <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && typeof document !== 'undefined' && createPortal(
        <>
          <div className="fixed inset-0 z-[99998]" onClick={() => setOpen(false)} />
          <div
            className="fixed w-72 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-900 shadow-2xl z-[99999]"
            style={{ top: menuStyle?.top ?? 64, right: menuStyle?.right ?? 16 }}
          >
            {/* User info */}
            <div className="mb-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-slate-900 truncate">{user.name}</div>
                <div className="text-xs text-slate-500 truncate">{user.email}</div>
              </div>
            </div>

            {/* Language switcher */}
            <div className="mb-3 border rounded-xl p-2.5 bg-slate-50">
              <p className="text-[11px] font-semibold text-slate-500 mb-2 px-0.5 uppercase tracking-wider">🌐 {t.language}</p>
              <div className="flex gap-1">
                {locales.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => { setLocale(loc); if (typeof window !== 'undefined') window.localStorage.setItem('zeniva_locale', loc); }}
                    className={[
                      'flex-1 py-1.5 rounded-lg text-xs font-bold transition-all',
                      locale === loc ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200',
                    ].join(' ')}
                  >
                    {localeLabels[loc]}
                  </button>
                ))}
              </div>
            </div>

            {/* Space switching */}
            <div className="space-y-1">
              <button onClick={() => goTo('traveler')} className="w-full text-left px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                <span className="text-base">✈️</span> {t.switchTraveler}
              </button>
              {canAgent && !isInfluencer && (
                <button onClick={() => goTo('agent')} className="w-full text-left px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                  <span className="text-base">🏢</span> {t.switchAgent}
                </button>
              )}
              {(canAgent || isInfluencer) && (
                <button onClick={() => goTo('influencer')} className="w-full text-left px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                  <span className="text-base">📱</span> {t.switchInfluencer}
                </button>
              )}
              {canPartner && (
                <button onClick={() => goTo('partner')} className="w-full text-left px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                  <span className="text-base">🤝</span> {t.switchPartner}
                </button>
              )}
            </div>

            <div className="border-t my-2" />
            <button onClick={() => { router.push('/reset-password'); setOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 text-xs">
              {t.resetPassword}
            </button>
            <button onClick={() => { setOpen(false); logout(); router.push('/'); }} className="w-full text-left px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 text-xs font-semibold">
              {t.signOut}
            </button>

            {canPreview && (
              <>
                <div className="border-t my-2" />
                <div className="px-2">
                  <div className="pb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">{t.previewMode}</div>
                  <select
                    value={previewRole}
                    onChange={(event) => { void setPreviewRole((event.target.value as RbacRole) || null); }}
                    className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs"
                  >
                    <option value="">{t.off}</option>
                    {RBAC_ROLES.map((role) => (
                      <option key={role} value={role}>{role.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
