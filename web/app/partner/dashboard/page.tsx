"use client";
import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../../src/lib/authStore";
import Link from 'next/link';
import KpiCard from '../../../src/components/partner/KpiCard';
import PageHeader from '../../../src/components/partner/PageHeader';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import ActionCenter from '../../../src/components/partner/ActionCenter';
import BookingsTable from '../../../src/components/partner/BookingsTable';
import InboxPreview from '../../../src/components/partner/InboxPreview';
import PayoutCard from '../../../src/components/partner/PayoutCard';
import ListingCard from '../../../src/components/partner/ListingCard';
import { SkeletonKpi, SkeletonCard } from '../../../src/components/partner/SkeletonCard';
import { TrendingUp, Calendar, Plus, Users, Shield, CheckCircle2 } from 'lucide-react';
import Modal from '../../../src/components/partner/Modal';

// Mock data for premium UI showcase
const mockKpis = [
  { 
    label: 'Upcoming bookings', 
    value: '0', 
    hint: 'Next 7 days', 
    trend: { delta: '0%', up: true }, 
    series: [0,0,0,0,0,0,0] 
  },
  { 
    label: 'Revenue (30d)', 
    value: '$0', 
    hint: 'Last 30 days', 
    trend: { delta: '—', up: false }, 
    series: [0,0,0,0,0,0,0] 
  },
  { 
    label: 'Occupancy (90d)', 
    value: '0%', 
    hint: 'Last 90 days', 
    trend: { delta: '—', up: false }, 
    series: [0,0,0,0,0,0,0] 
  },
  { 
    label: 'Response time', 
    value: '—', 
    hint: 'Avg to guests', 
    trend: { delta: '—', up: true }, 
    series: [1,1,1,1,1,1,1] 
  },
];

const revenueChart = Array.from({length: 30}).map((_,i)=> ({ 
  day: i+1, 
  revenue: Math.round(Math.random()*500),
  label: `Day ${i+1}`
}));

const mockTasks = [
  { id: '1', title: 'Complete company profile', desc: 'Add legal name and payout details', required: true, done: false, href: '/partner/settings' },
  { id: '2', title: 'Upload property photos', desc: 'Add at least 8 high-quality images', required: true, done: false, href: '/partner/listings' },
  { id: '3', title: 'Set calendar availability', desc: 'Open calendar for next 90 days', required: false, done: false, href: '/partner/calendar' },
  { id: '4', title: 'Add pricing rules', desc: 'Configure seasonal rates and discounts', required: false, done: false, href: '/partner/listings' },
];

const mockBookings = [] as any[];
const mockListings = [
  { id: 'l_1', title: 'Cozy Beach House', status: 'Draft' },
  { id: 'l_2', title: 'Luxury Yacht Charter', status: 'Published' },
  { id: 'l_3', title: 'Mountain Villa Retreat', status: 'Paused' },
];
const mockThreads = [] as any[];

export default function PartnerDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [loading, setLoading] = useState(true);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [chartsReady, setChartsReady] = useState(false);

  const headerActions = (
    <>
      <Link
        href="/partner/calendar"
        className="px-4 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
      >
        <Calendar className="w-4 h-4" />
        View Calendar
      </Link>
      <button
        onClick={() => setInviteModalOpen(true)}
        className="px-4 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
      >
        <Users className="w-4 h-4" />
        Invite Staff
      </button>
      <Link
        href="/partner/listings/new"
        className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Create Listing
      </Link>
    </>
  );

  const handleInviteStaff = () => {
    if (inviteEmail && inviteEmail.includes('@')) {
      if (typeof window !== 'undefined') {
        window.showToast?.(`Invitation sent to ${inviteEmail}`, 'success');
      }
      setInviteEmail('');
      setInviteModalOpen(false);
    } else {
      if (typeof window !== 'undefined') {
        window.showToast?.('Please enter a valid email address', 'error');
      }
    }
  };

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    setChartsReady(true);
  }, []);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Manage listings, bookings, payouts, and guest messages"
        backHref="/partner"
        breadcrumbs={[
          { label: 'Partner', href: '/partner/dashboard' },
          { label: 'Dashboard' }
        ]}
        actions={headerActions}
      />

        {/* KPI Row */}
        <section className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {loading ? (
              <>
                {[1,2,3,4].map(i => <SkeletonKpi key={i} />)}
              </>
            ) : (
              mockKpis.map((k) => (
                <KpiCard key={k.label} label={k.label} value={k.value} hint={k.hint} trend={k.trend} series={k.series} />
              ))
            )}
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Main Content (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Action Center */}
            <ActionCenter tasks={mockTasks} progress={35} loading={loading} />

            {/* Bookings Table */}
            <BookingsTable bookings={mockBookings} />

            {/* Performance Chart */}
            <div className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-gray-600" />
                      Performance
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">Revenue over the last 30 days</p>
                  </div>
                  <button className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    View Report
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="h-64 w-full">
                  {chartsReady && (
                    <ResponsiveContainer width="100%" height="100%" minWidth={240} minHeight={256}>
                      <LineChart data={revenueChart}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis 
                          dataKey="day" 
                          stroke="#9CA3AF" 
                          fontSize={12}
                          tickLine={false}
                        />
                        <YAxis 
                          stroke="#9CA3AF" 
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px',
                            fontSize: '14px'
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="#10B981"
                          strokeWidth={3}
                          dot={false}
                          strokeLinecap="round"
                          name="Revenue ($)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
                
                <div className="mt-6 flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <div className="text-sm">
                    <span className="text-gray-700">Insight: </span>
                    <span className="font-medium text-gray-900">Revenue trending upward</span>
                    <span className="text-gray-600"> — Keep your listings active to maximize bookings</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sidebar (4 cols) */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Listings Preview */}
            <div className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Your Listings</h3>
                  <a
                    href="/partner/listings"
                    className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    View all
                  </a>
                </div>
              </div>
              
              <div className="p-4">
                {loading ? (
                  <div className="space-y-4">
                    {[1,2,3].map(i => <SkeletonCard key={i} />)}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {mockListings.map((listing) => (
                      <ListingCard key={listing.id} listing={listing} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Messages */}
            <InboxPreview threads={mockThreads} loading={loading} />

            {/* Payouts */}
            <PayoutCard balance="$0" nextPayout="—" loading={loading} />

            {/* Compliance/KYC Status */}
            <div className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow duration-200">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-gray-600" />
                  Verification
                </h3>
              </div>
              
              <div className="p-6">
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg mb-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                    <Shield className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-amber-900 mb-1">Verification Pending</div>
                    <p className="text-sm text-amber-800">
                      Complete identity verification to activate payouts and publish listings
                    </p>
                  </div>
                </div>
                
                <button className="w-full px-4 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Complete Verification
                </button>
              </div>
            </div>
          </aside>
        </div>

      {/* Invite Staff Modal */}
      <Modal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title="Invite Team Member"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@example.com"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleInviteStaff()}
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button
              onClick={() => setInviteModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleInviteStaff}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              Send Invitation
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}