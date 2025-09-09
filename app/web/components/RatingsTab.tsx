'use client';

import { Star, TrendingUp, Users } from 'lucide-react';
import type { Rating } from '@/lib/types';
import { retailerLabel, retailerColor } from '@/lib/retailers';

interface RatingsTabProps {
  ratings: Record<string, Rating>;
}

export default function RatingsTab({ ratings }: RatingsTabProps) {
  const formatRating = (rating: number | null): string => {
    if (rating === null || rating === undefined) return "—";
    return rating.toFixed(1);
  };

  const formatCount = (count: number | null): string => {
    if (count === null || count === undefined) return "—";
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const getRatingColor = (rating: number): string => {
    if (rating >= 4.5) return "text-green-600";
    if (rating >= 4.0) return "text-blue-600";
    if (rating >= 3.5) return "text-yellow-600";
    if (rating >= 3.0) return "text-orange-600";
    return "text-red-600";
  };

  const getRatingLabel = (rating: number): string => {
    if (rating >= 4.5) return "Excellent";
    if (rating >= 4.0) return "Very Good";
    if (rating >= 3.5) return "Good";
    if (rating >= 3.0) return "Fair";
    return "Poor";
  };

  // Calculate global average
  const globalAverage = (() => {
    const validRatings = Object.values(ratings)
      .map(r => r.average)
      .filter(r => r !== null) as number[];
    
    if (validRatings.length === 0) return null;
    return validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length;
  })();

  // Calculate total reviews
  const totalReviews = Object.values(ratings)
    .map(r => r.count)
    .filter(c => c !== null)
    .reduce((sum, c) => sum + (c || 0), 0);

  return (
    <div className="space-y-8">
      {/* Global Rating Summary */}
      <div className="bg-gradient-to-r from-lilac/20 to-blush/20 p-6 rounded-2xl border border-lilac/30">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-charcoal mb-2">
              {globalAverage ? globalAverage.toFixed(1) : "—"}
            </div>
            <div className="flex justify-center mb-2">
              {globalAverage ? (
                Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(globalAverage) 
                        ? "text-yellow-400 fill-current" 
                        : globalAverage - i >= 0.5 
                        ? "text-yellow-400 fill-current opacity-50"
                        : "text-gray-300"
                    }`}
                  />
                ))
              ) : (
                Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className="h-5 w-5 text-gray-300" />
                ))
              )}
            </div>
            <div className="text-sm text-gray-600 font-inter">
              {globalAverage ? getRatingLabel(globalAverage) : "No ratings"}
            </div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-charcoal mb-2">
              {totalReviews > 0 ? formatCount(totalReviews) : "—"}
            </div>
            <div className="flex justify-center mb-2">
              <Users className="h-5 w-5 text-lilac" />
            </div>
            <div className="text-sm text-gray-600 font-inter">Total Reviews</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-charcoal mb-2">
              {Object.keys(ratings).length}
            </div>
            <div className="flex justify-center mb-2">
              <TrendingUp className="h-5 w-5 text-lilac" />
            </div>
            <div className="text-sm text-gray-600 font-inter">Retailers</div>
          </div>
        </div>
      </div>

      {/* Individual Retailer Ratings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(ratings).map(([retailerKey, rating]) => (
          <div key={retailerKey} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
            {/* Retailer Header */}
            <div className="flex items-center justify-between mb-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${retailerColor(retailerKey)}`}>
                {retailerLabel(retailerKey)}
              </span>
              {rating.url && (
                <button
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  disabled
                  title="External links will be enabled in Phase 6"
                >
                  <TrendingUp className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Rating Display */}
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-charcoal mb-2">
                {formatRating(rating.average)}
              </div>
              <div className="flex justify-center mb-2">
                {rating.average ? (
                  Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(rating.average!) 
                          ? "text-yellow-400 fill-current" 
                          : rating.average! - i >= 0.5 
                          ? "text-yellow-400 fill-current opacity-50"
                          : "text-gray-300"
                      }`}
                    />
                  ))
                ) : (
                  Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className="h-4 w-4 text-gray-300" />
                  ))
                )}
              </div>
              <div className={`text-sm font-medium ${rating.average ? getRatingColor(rating.average) : "text-gray-500"}`}>
                {rating.average ? getRatingLabel(rating.average) : "No rating"}
              </div>
            </div>

            {/* Review Count */}
            <div className="text-center mb-4">
              <div className="text-lg font-semibold text-charcoal">
                {formatCount(rating.count)}
              </div>
              <div className="text-sm text-gray-600 font-inter">reviews</div>
            </div>

            {/* Rating Breakdown */}
            {rating.breakdown && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700 mb-2 font-inter">Rating Distribution</div>
                {Object.entries(rating.breakdown)
                  .sort(([a], [b]) => parseInt(b) - parseInt(a))
                  .map(([stars, percentage]) => (
                    <div key={stars} className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 w-16">
                        <span className="text-xs text-gray-600">{stars}</span>
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 w-12 text-right">
                        {Math.round(percentage * 100)}%
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Rating Note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Star className="h-5 w-5 text-yellow-600 mt-0.5" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-yellow-800 font-inter">Rating Information</h4>
            <p className="text-sm text-yellow-700 mt-1 font-inter">
              Ratings are aggregated from customer reviews across multiple platforms. Individual retailer ratings may vary based on their customer base and review policies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
