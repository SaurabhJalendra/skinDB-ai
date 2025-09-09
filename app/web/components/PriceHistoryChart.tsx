"use client";

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { retailerLabel } from '@/lib/retailers';

interface PriceHistoryChartProps {
  data: Array<{ day: string; [retailer: string]: number | null | string }>;
  retailers: string[];
}

const COLORS = [
  '#E9D7FE', // lilac
  '#FDE1E1', // blush
  '#232323', // charcoal
  '#8B5CF6', // purple
  '#F59E0B', // amber
  '#10B981', // emerald
  '#EF4444', // red
  '#3B82F6', // blue
];

export default function PriceHistoryChart({ data, retailers }: PriceHistoryChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-ivory/50 rounded-xl border border-charcoal/10">
        <div className="text-center">
          <div className="text-charcoal/60 text-lg mb-2">📈</div>
          <p className="text-charcoal/60">No price history data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-80 bg-white rounded-xl border border-charcoal/10 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="day" 
            stroke="#6B7280"
            fontSize={12}
            tickFormatter={(value) => {
              const date = new Date(value);
              return `${date.getMonth() + 1}/${date.getDate()}`;
            }}
          />
          <YAxis 
            stroke="#6B7280"
            fontSize={12}
            tickFormatter={(value) => `$${value}`}
            domain={['dataMin - 5', 'dataMax + 5']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            labelStyle={{ color: '#374151', fontWeight: '600' }}
            formatter={(value: number, name: string) => [
              value ? `$${value.toFixed(2)}` : 'N/A',
              retailerLabel(name)
            ]}
            labelFormatter={(label) => {
              const date = new Date(label);
              return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });
            }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
            formatter={(value) => retailerLabel(value)}
          />
          {retailers.map((retailer, index) => (
            <Line
              key={retailer}
              type="monotone"
              dataKey={retailer}
              stroke={COLORS[index % COLORS.length]}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6, stroke: COLORS[index % COLORS.length], strokeWidth: 2 }}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

