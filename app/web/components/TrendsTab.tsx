"use client";

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Filter, Calendar } from 'lucide-react';
import PriceHistoryChart from './PriceHistoryChart';
import { fetchPriceHistory, transformToChartData, getAvailableRetailers } from '@/lib/history';
import useSWR from 'swr';

interface TrendsTabProps {
  productId: string;
  availableRetailers: string[];
}

export default function TrendsTab({ productId, availableRetailers }: TrendsTabProps) {
  const [selectedRetailers, setSelectedRetailers] = useState<string[]>(availableRetailers);
  const [days, setDays] = useState(90);

  // Fetch price history data
  const { data, error, isLoading } = useSWR(
    `price-history-${productId}-${days}`,
    () => fetchPriceHistory(productId, undefined, days),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  // Transform data for chart
  const chartData = useMemo(() => {
    if (!data?.points) return [];
    return transformToChartData(data.points, selectedRetailers);
  }, [data?.points, selectedRetailers]);

  // Get all available retailers from the data
  const allRetailers = useMemo(() => {
    if (!data?.points) return availableRetailers;
    return getAvailableRetailers(data.points);
  }, [data?.points, availableRetailers]);

  const handleRetailerToggle = (retailer: string) => {
    setSelectedRetailers(prev => 
      prev.includes(retailer)
        ? prev.filter(r => r !== retailer)
        : [...prev, retailer]
    );
  };

  const handleSelectAll = () => {
    setSelectedRetailers(allRetailers);
  };

  const handleSelectNone = () => {
    setSelectedRetailers([]);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-lilac" />
          <h3 className="text-xl font-semibold text-charcoal">Price Trends</h3>
        </div>
        
        <div className="animate-pulse">
          <div className="h-4 bg-charcoal/10 rounded w-1/4 mb-4"></div>
          <div className="h-80 bg-charcoal/5 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-lilac" />
          <h3 className="text-xl font-semibold text-charcoal">Price Trends</h3>
        </div>
        
        <div className="flex items-center justify-center h-64 bg-ivory/50 rounded-xl border border-charcoal/10">
          <div className="text-center">
            <div className="text-charcoal/60 text-lg mb-2">⚠️</div>
            <p className="text-charcoal/60">Failed to load price history</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data?.points || data.points.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-lilac" />
          <h3 className="text-xl font-semibold text-charcoal">Price Trends</h3>
        </div>
        
        <div className="flex items-center justify-center h-64 bg-ivory/50 rounded-xl border border-charcoal/10">
          <div className="text-center">
            <div className="text-charcoal/60 text-lg mb-2">📈</div>
            <p className="text-charcoal/60">No price history data available</p>
            <p className="text-charcoal/40 text-sm mt-1">Run ingestion to start tracking prices</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <TrendingUp className="w-6 h-6 text-lilac" />
        <h3 className="text-xl font-semibold text-charcoal">Price Trends</h3>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-ivory/30 rounded-xl border border-charcoal/10">
        {/* Time Range */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-charcoal/60" />
          <label className="text-sm font-medium text-charcoal">Period:</label>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-3 py-1 text-sm border border-charcoal/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-lilac/50"
          >
            <option value={30}>30 days</option>
            <option value={60}>60 days</option>
            <option value={90}>90 days</option>
            <option value={180}>6 months</option>
            <option value={365}>1 year</option>
          </select>
        </div>

        {/* Retailer Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-charcoal/60" />
          <label className="text-sm font-medium text-charcoal">Retailers:</label>
          <div className="flex gap-2">
            <button
              onClick={handleSelectAll}
              className="px-2 py-1 text-xs bg-lilac/20 text-charcoal rounded hover:bg-lilac/30 transition-colors"
            >
              All
            </button>
            <button
              onClick={handleSelectNone}
              className="px-2 py-1 text-xs bg-charcoal/10 text-charcoal rounded hover:bg-charcoal/20 transition-colors"
            >
              None
            </button>
          </div>
        </div>
      </div>

      {/* Retailer Checkboxes */}
      {allRetailers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {allRetailers.map((retailer) => (
            <motion.label
              key={retailer}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-charcoal/20 rounded-lg cursor-pointer hover:border-lilac/50 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <input
                type="checkbox"
                checked={selectedRetailers.includes(retailer)}
                onChange={() => handleRetailerToggle(retailer)}
                className="w-4 h-4 text-lilac border-charcoal/30 rounded focus:ring-lilac/50"
              />
              <span className="text-sm font-medium text-charcoal capitalize">
                {retailer}
              </span>
            </motion.label>
          ))}
        </div>
      )}

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <PriceHistoryChart 
          data={chartData} 
          retailers={selectedRetailers} 
        />
      </motion.div>

      {/* Summary Stats */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-ivory/30 rounded-xl border border-charcoal/10">
          <div className="text-center">
            <div className="text-2xl font-bold text-charcoal">
              {chartData.length}
            </div>
            <div className="text-sm text-charcoal/60">Data Points</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-charcoal">
              {selectedRetailers.length}
            </div>
            <div className="text-sm text-charcoal/60">Retailers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-charcoal">
              {days}
            </div>
            <div className="text-sm text-charcoal/60">Days Tracked</div>
          </div>
        </div>
      )}
    </div>
  );
}

