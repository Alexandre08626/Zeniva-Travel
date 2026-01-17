import React from 'react';

export default function GlobalErrorPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center p-8">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="mt-3 text-sm text-slate-600">We're sorry — the team has been notified.</p>
        <div className="mt-6">
          <a href="/" className="text-blue-600 underline">Return to home</a>
        </div>
      </div>
    </main>
  );
}