"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

interface ServiceUsage {
  service: string;
  calls: number;
  cost: number;
}

interface DailyUsage {
  date: string;
  cost: number;
}

interface UsageData {
  totalBill: number;
  services: ServiceUsage[];
  daily: DailyUsage[];
}

const defaultData: UsageData = {
  totalBill: 0,
  services: [
    { service: "Lina AI", calls: 0, cost: 0 },
    { service: "SMS", calls: 0, cost: 0 },
    { service: "WhatsApp", calls: 0, cost: 0 },
    { service: "Email", calls: 0, cost: 0 },
    { service: "API Search", calls: 0, cost: 0 },
  ],
  daily: [],
};

export default function UsagePage() {
  const now = new Date();
  const [month, setMonth] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
  const [data, setData] = useState<UsageData>(defaultData);

  useEffect(() => {
    fetch(`/api/agency/usage?month=${month}`)
      .then((res) => res.json())
      .then((d) => {
        if (d && d.services) setData(d);
      })
      .catch(() => {});
  }, [month]);

  const maxDaily = Math.max(...(data.daily.map((d) => d.cost)), 1);

  const exportCSV = () => {
    const rows = [
      ["Service", "Calls", "Cost"],
      ...data.services.map((s) => [s.service, String(s.calls), `$${s.cost.toFixed(2)}`]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `usage-${month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usage & API</h1>
          <p className="mt-1 text-gray-500">Monitor your monthly usage and costs</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />
            CSV Export
          </button>
        </div>
      </div>

      {/* Total Bill Card */}
      <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-teal-600 to-teal-700 p-6 text-white shadow-sm">
        <p className="text-sm font-medium text-teal-100">Total Bill for {month}</p>
        <p className="mt-2 text-4xl font-bold">${data.totalBill.toFixed(2)}</p>
        <p className="mt-1 text-sm text-teal-200">Usage-based billing - pay only for what you use</p>
      </div>

      {/* Service Breakdown */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Service Breakdown</h2>
        </div>
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Service</th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">API Calls</th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.services.map((svc) => (
              <tr key={svc.service} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{svc.service}</td>
                <td className="px-6 py-4 text-right text-sm text-gray-500">{svc.calls.toLocaleString()}</td>
                <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">${svc.cost.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Daily Bar Chart */}
      {data.daily.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Daily Usage</h2>
          <div className="flex items-end gap-1" style={{ height: 200 }}>
            {data.daily.map((day) => (
              <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-teal-500 transition-all"
                  style={{ height: `${(day.cost / maxDaily) * 160}px` }}
                  title={`${day.date}: $${day.cost.toFixed(2)}`}
                />
                <span className="text-[10px] text-gray-400">{day.date.slice(-2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
