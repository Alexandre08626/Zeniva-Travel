"use client";
import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function KpiCard({ label, value, hint, trend, series, onClick }: {
  label: string;
  value: string;
  hint?: string;
  trend?: { delta: string; up?: boolean };
  series?: number[];
  onClick?: () => void;
}) {
  const data = (series || []).map((v, i) => ({ x: i, y: v }));
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <button
      onClick={onClick}
      className="group bg-white rounded-xl border border-gray-200 p-6 text-left hover:shadow-lg hover:border-gray-300 transition-all duration-200 w-full"
    >
      <div className="text-sm font-medium text-gray-600 mb-3">{label}</div>
      
      <div className="flex items-baseline gap-3 mb-2">
        <div className="text-3xl font-semibold text-gray-900">{value}</div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${trend.up ? 'text-emerald-600' : 'text-red-600'}`}>
            {trend.up ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{trend.delta}</span>
          </div>
        )}
      </div>
      
      {hint && <div className="text-xs text-gray-500 mb-4">{hint}</div>}
      
      {mounted && data.length > 0 && (
        <div className="h-12 w-full -mb-2">
          <ResponsiveContainer width="100%" height="100%" minWidth={120} minHeight={48}>
            <LineChart data={data}>
              <Line
                type="monotone"
                dataKey="y"
                stroke="#10B981"
                strokeWidth={2}
                dot={false}
                strokeLinecap="round"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </button>
  );
}
