"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Circle, ChevronRight } from 'lucide-react';

export default function ActionCenter({ tasks = [], progress = 0, loading = false }: { tasks?: { id: string; title: string; desc?: string; required?: boolean; done?: boolean; href?: string }[]; progress?: number; loading?: boolean }) {
  const router = useRouter();
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 w-full">
        <div className="animate-pulse space-y-4">
          <div className="h-5 bg-gray-200 rounded w-1/3"></div>
          <div className="h-2 bg-gray-200 rounded w-full"></div>
          {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-200 rounded"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 w-full hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Setup Progress</h3>
          <p className="text-sm text-gray-600 mt-1">Complete these steps to activate your listings</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg">
          <div className="text-2xl font-bold text-emerald-600">{progress}%</div>
        </div>
      </div>

      <div className="mb-6">
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            style={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500 ease-out"
          />
        </div>
      </div>

      <ul className="space-y-2">
        {tasks.length === 0 && (
          <li className="text-center py-8 text-gray-500 text-sm">All setup tasks completed! 🎉</li>
        )}
        {tasks.map((t) => (
          <li
            key={t.id}
            className={`group flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all ${t.href ? 'cursor-pointer' : ''}`}
            onClick={() => t.href && router.push(t.href)}
          >
            <div className="flex-shrink-0">
              {t.done ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              ) : (
                <Circle className="w-6 h-6 text-gray-300" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-gray-900">{t.title}</span>
                {t.required && (
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-medium rounded-md">
                    Required
                  </span>
                )}
              </div>
              {t.desc && <p className="text-sm text-gray-600">{t.desc}</p>}
            </div>

            <div className="flex-shrink-0 flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (t.href) router.push(t.href);
                }}
                className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100"
              >
                {t.done ? 'Review' : 'Start'}
              </button>
              <ChevronRight className="w-5 h-5 text-gray-400 hidden md:block md:group-hover:hidden" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
