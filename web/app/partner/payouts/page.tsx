"use client";
import React from 'react';
import Link from 'next/link';
import { Wallet, TrendingUp, Download, CheckCircle, Clock } from 'lucide-react';
import PageHeader from '../../../src/components/partner/PageHeader';
import { mockPayouts } from '../../../src/lib/mockData';

export default function PayoutsPage() {
  return (
    <div>
      <PageHeader
        title="Payouts"
        subtitle="Track your earnings and payment history"
        backHref="/partner/dashboard"
        breadcrumbs={[
          { label: 'Partner', href: '/partner/dashboard' },
          { label: 'Payouts' }
        ]}
      />

      {/* Balance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-emerald-700">Available Balance</span>
            <Wallet className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">EUR 8,400</div>
          <p className="text-sm text-gray-600">Ready for payout on Feb 1, 2026</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">This Month</span>
            <TrendingUp className="w-5 h-5 text-gray-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">EUR 15,750</div>
          <p className="text-sm text-emerald-600">↑ 23% vs last month</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">Total Earned</span>
            <CheckCircle className="w-5 h-5 text-gray-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">EUR 46,250</div>
          <p className="text-sm text-gray-600">All-time earnings</p>
        </div>
      </div>

      {/* Payout Method */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Payout Method</h2>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">🏦</span>
            </div>
            <div>
              <div className="font-semibold text-gray-900">Bank Transfer</div>
              <div className="text-sm text-gray-600">Account ending in ••••4321</div>
            </div>
          </div>
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            Update Method
          </button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase">Date</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase">Amount</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase">Status</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-700 uppercase">Bookings</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockPayouts.map((payout) => (
                <tr key={payout.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{payout.date}</div>
                    <div className="text-xs text-gray-600">{payout.method}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{payout.currency} {payout.amount.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    {payout.status === 'completed' ? (
                      <span className="px-2.5 py-1 rounded-md text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1 w-fit">
                        <CheckCircle className="w-3 h-3" />
                        Completed
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-md text-xs font-medium border bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1 w-fit">
                        <Clock className="w-3 h-3" />
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-700">{payout.bookingsCount} bookings</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Download Invoice">
                        <Download className="w-4 h-4 text-gray-700" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
