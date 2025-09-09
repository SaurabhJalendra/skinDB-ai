'use client';

import { ExternalLink, ShoppingBag, Tag, Clock } from 'lucide-react';
import type { Offer } from '@/lib/types';
import { retailerLabel, retailerColor } from '@/lib/retailers';

interface PricesTabProps {
  offers: Record<string, Offer>;
}

export default function PricesTab({ offers }: PricesTabProps) {
  const formatPrice = (amount: number | null): string => {
    if (amount === null || amount === undefined) return "—";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getAvailabilityColor = (availability: string | null): string => {
    if (!availability) return "text-gray-500";
    
    const lower = availability.toLowerCase();
    if (lower.includes('in stock') || lower.includes('available')) return "text-green-600";
    if (lower.includes('out of stock') || lower.includes('unavailable')) return "text-red-600";
    if (lower.includes('limited') || lower.includes('low')) return "text-yellow-600";
    return "text-gray-600";
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-lilac/20 to-blush/20 p-4 rounded-xl border border-lilac/30">
          <div className="flex items-center space-x-2 mb-2">
            <ShoppingBag className="h-5 w-5 text-lilac" />
            <span className="font-medium text-charcoal">Retailers</span>
          </div>
          <div className="text-2xl font-bold text-charcoal">{Object.keys(offers).length}</div>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl border border-green-200">
          <div className="flex items-center space-x-2 mb-2">
            <Tag className="h-5 w-5 text-green-600" />
            <span className="font-medium text-charcoal">Best Price</span>
          </div>
          <div className="text-2xl font-bold text-charcoal">
            {(() => {
              const prices = Object.values(offers)
                .map(offer => offer.price_amount)
                .filter(price => price !== null) as number[];
              return prices.length > 0 ? formatPrice(Math.min(...prices)) : "—";
            })()}
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-200">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-charcoal">Last Updated</span>
          </div>
          <div className="text-sm text-charcoal">
            {(() => {
              const dates = Object.values(offers)
                .map(offer => new Date(offer.scraped_at))
                .sort((a, b) => b.getTime() - a.getTime());
              return dates.length > 0 ? dates[0].toLocaleDateString() : "—";
            })()}
          </div>
        </div>
      </div>

      {/* Prices Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-inter">
                  Retailer
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-inter">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-inter">
                  Unit Price
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-inter">
                  Availability
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-inter">
                  Promo
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-inter">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(offers).map(([retailerKey, offer], index) => (
                <tr key={retailerKey} className="hover:bg-gray-50 transition-colors duration-150">
                  {/* Retailer */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${retailerColor(retailerKey)}`}>
                        {retailerLabel(retailerKey)}
                      </span>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-lg font-semibold text-charcoal">
                      {formatPrice(offer.price_amount)}
                    </div>
                    {offer.price_currency && offer.price_currency !== 'USD' && (
                      <div className="text-xs text-gray-500">
                        {offer.price_currency}
                      </div>
                    )}
                  </td>

                  {/* Unit Price */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">
                      {offer.unit_price || "—"}
                    </span>
                  </td>

                  {/* Availability */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getAvailabilityColor(offer.availability)}`}>
                      {offer.availability || "—"}
                    </span>
                  </td>

                  {/* Promo */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">
                      {offer.promo || "—"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lilac transition-colors duration-200"
                      disabled
                      title="External links will be enabled in Phase 6"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Price History Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-800 font-inter">Price Tracking</h4>
            <p className="text-sm text-blue-700 mt-1 font-inter">
              Prices are updated manually via our Admin panel. Historical price data and automated tracking will be available in future phases.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
