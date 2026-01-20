import React from 'react';

export default function EmptyState({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="text-center p-8 rounded-xl bg-white border shadow-sm">
      <div className="flex items-center justify-center mb-3">
        <svg width="88" height="64" viewBox="0 0 88 64" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="8" width="84" height="48" rx="8" fill="#f3f4f6"/><rect x="10" y="16" width="24" height="32" rx="4" fill="#e6e9ee"/><rect x="40" y="18" width="34" height="8" rx="3" fill="#e6e9ee"/><rect x="40" y="30" width="34" height="6" rx="3" fill="#e6e9ee"/><rect x="40" y="40" width="34" height="8" rx="3" fill="#e6e9ee"/></svg>
      </div>
      <div className="text-lg font-medium">{title}</div>
      {subtitle && <div className="text-sm text-gray-500 mt-2">{subtitle}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
