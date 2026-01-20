"use client";
import React from 'react';
import { Wallet, Calendar, ExternalLink } from 'lucide-react';

export default function PayoutCard({ balance = '$0', nextPayout = '—', loading = false }: { balance?: string; nextPayout?: string; loading?: boolean }) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 w-full">
        <div className="animate-pulse space-y-4">
          <div className="h-5 bg-gray-200 rounded w-1/3"></div>
          <div className="h-10 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  const hasBalance = balance && balance !== '$0';

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-gray-600" />
            Payouts
          </h3>
          {hasBalance && (
            <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1">
              View all <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
      
      <div className="p-6">
        {!hasBalance ? (
          <div className="text-center py-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
              <Wallet className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 mb-4">No balance yet</p>
            <button className="w-full px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors">
              Set payout method
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium text-gray-600 mb-2">Available balance</div>
              <div className="text-3xl font-bold text-gray-900">{balance}</div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <Calendar className="w-4 h-4 text-gray-600" />
              <div className="text-sm">
                <span className="text-gray-600">Next payout: </span>
                <span className="font-medium text-gray-900">{nextPayout}</span>
              </div>
            </div>
            
            <button className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
              Manage payout method
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
