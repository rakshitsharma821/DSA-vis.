import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { useAlgorithmStore } from '../../store/useAlgorithmStore';

export const ComplexityChart: React.FC = () => {
  const { chartData } = useAlgorithmStore();

  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center px-4 text-center text-xs text-aurora-muted">
        Comparison and swap counters will appear here once the trace starts.
      </div>
    );
  }

  return (
    <div className="w-full h-48 pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorComparisons" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="colorSwaps" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="step"
            tickLine={false}
            stroke="#888888"
            fontSize={10}
            tickFormatter={(val) => `${val}`}
          />
          <YAxis
            tickLine={false}
            stroke="#888888"
            fontSize={10}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              borderColor: '#e5e7f0',
              borderRadius: '8px',
              fontSize: '11px',
              color: '#172554',
              boxShadow: '0 8px 20px -12px rgba(23,37,84,0.35)',
            }}
          />
          <Area
            type="monotone"
            dataKey="comparisons"
            stroke="#f59e0b"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorComparisons)"
            name="Comparisons"
          />
          <Area
            type="monotone"
            dataKey="swaps"
            stroke="#a855f7"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorSwaps)"
            name="Swaps"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
