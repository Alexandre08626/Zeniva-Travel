"use client";
import React from 'react';
import { MessageCircle, Send } from 'lucide-react';

export default function InboxPreview({ threads = [], loading = false }: { threads?: any[]; loading?: boolean }) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 w-full">
        <div className="animate-pulse space-y-4">
          <div className="h-5 bg-gray-200 rounded w-1/3"></div>
          {[1,2,3].map(i=> <div key={i} className="h-16 bg-gray-200 rounded"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
          <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
            View all
          </button>
        </div>
      </div>
      
      <div className="p-4">
        {threads.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
              <MessageCircle className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 mb-4">No messages yet</p>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors">
              <Send className="w-4 h-4" />
              Send a message
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {threads.slice(0,5).map((t:any) => (
              <div key={t.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                  {t.guest?.charAt(0) || 'G'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-gray-900 truncate">{t.subject || 'Guest inquiry'}</span>
                    {t.unread && (
                      <span className="flex-shrink-0 px-2 py-0.5 bg-emerald-600 text-white text-xs font-medium rounded-full">
                        {t.unread}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate mt-0.5">{t.snippet || 'No preview available'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
