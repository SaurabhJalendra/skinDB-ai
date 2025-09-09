'use client';

import { Star, User, Calendar, ExternalLink, MessageCircle } from 'lucide-react';
import type { ReviewSnippet } from '@/lib/types';
import { retailerLabel, retailerColor } from '@/lib/retailers';

interface ReviewsTabProps {
  reviews: Record<string, ReviewSnippet[]>;
}

export default function ReviewsTab({ reviews }: ReviewsTabProps) {
  const formatRating = (rating: number | null): string => {
    if (rating === null || rating === undefined) return "—";
    return rating.toFixed(1);
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "—";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return "—";
    }
  };

  const getRatingColor = (rating: number): string => {
    if (rating >= 4.5) return "text-green-600";
    if (rating >= 4.0) return "text-blue-600";
    if (rating >= 3.5) return "text-yellow-600";
    if (rating >= 3.0) return "text-orange-600";
    return "text-red-600";
  };

  // Calculate total reviews across all retailers
  const totalReviews = Object.values(reviews)
    .reduce((sum, retailerReviews) => sum + retailerReviews.length, 0);

  // Calculate average rating across all reviews
  const averageRating = (() => {
    const allRatings = Object.values(reviews)
      .flat()
      .map(review => review.rating)
      .filter(rating => rating !== null) as number[];
    
    if (allRatings.length === 0) return null;
    return allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length;
  })();

  return (
    <div className="space-y-8">
      {/* Reviews Summary */}
      <div className="bg-gradient-to-r from-lilac/20 to-blush/20 p-6 rounded-2xl border border-lilac/30">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-charcoal mb-2">
              {totalReviews}
            </div>
            <div className="flex justify-center mb-2">
              <MessageCircle className="h-5 w-5 text-lilac" />
            </div>
            <div className="text-sm text-gray-600 font-inter">Total Reviews</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-charcoal mb-2">
              {averageRating ? averageRating.toFixed(1) : "—"}
            </div>
            <div className="flex justify-center mb-2">
              {averageRating ? (
                Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(averageRating) 
                        ? "text-yellow-400 fill-current" 
                        : averageRating - i >= 0.5 
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
            <div className="text-sm text-gray-600 font-inter">Average Rating</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-charcoal mb-2">
              {Object.keys(reviews).length}
            </div>
            <div className="flex justify-center mb-2">
              <ExternalLink className="h-5 w-5 text-lilac" />
            </div>
            <div className="text-sm text-gray-600 font-inter">Retailers</div>
          </div>
        </div>
      </div>

      {/* Reviews by Retailer */}
      <div className="space-y-8">
        {Object.entries(reviews).map(([retailerKey, retailerReviews]) => (
          <div key={retailerKey} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Retailer Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${retailerColor(retailerKey)}`}>
                    {retailerLabel(retailerKey)}
                  </span>
                  <span className="text-sm text-gray-600 font-inter">
                    {retailerReviews.length} review{retailerReviews.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                {/* Retailer average rating */}
                {(() => {
                  const avgRating = retailerReviews
                    .map(r => r.rating)
                    .filter(r => r !== null) as number[];
                  
                  if (avgRating.length === 0) return null;
                  
                  const avg = avgRating.reduce((sum, r) => sum + r, 0) / avgRating.length;
                  
                  return (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-charcoal">{avg.toFixed(1)}</span>
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Reviews List */}
            <div className="divide-y divide-gray-200">
              {retailerReviews.slice(0, 5).map((review, index) => (
                <div key={index} className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Review Content */}
                    <div className="flex-1 space-y-3">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            {review.rating ? (
                              Array.from({ length: 5 }, (_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < Math.floor(review.rating!) 
                                      ? "text-yellow-400 fill-current" 
                                      : review.rating! - i >= 0.5 
                                      ? "text-yellow-400 fill-current opacity-50"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))
                            ) : (
                              <span className="text-sm text-gray-500">No rating</span>
                            )}
                          </div>
                          {review.rating && (
                            <span className={`text-sm font-medium ${getRatingColor(review.rating)}`}>
                              {formatRating(review.rating)}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          {review.posted_at && (
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(review.posted_at)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Title */}
                      {review.title && (
                        <h4 className="font-medium text-charcoal font-inter">
                          {review.title}
                        </h4>
                      )}

                      {/* Body */}
                      <p className="text-gray-700 leading-relaxed font-inter">
                        {review.body}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          {review.author && (
                            <div className="flex items-center space-x-1">
                              <User className="h-3 w-3" />
                              <span>{review.author}</span>
                            </div>
                          )}
                        </div>

                        {review.url && (
                          <button
                            className="text-lilac hover:text-lilac/80 transition-colors duration-200 disabled:opacity-50"
                            disabled
                            title="External links will be enabled in Phase 6"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Show more indicator if there are more than 5 reviews */}
            {retailerReviews.length > 5 && (
              <div className="bg-gray-50 px-6 py-4 text-center">
                <p className="text-sm text-gray-600 font-inter">
                  Showing 5 of {retailerReviews.length} reviews. 
                  <button className="text-lilac hover:text-lilac/80 ml-1 font-medium" disabled>
                    View all reviews
                  </button>
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Reviews Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <MessageCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-800 font-inter">Review Information</h4>
            <p className="text-sm text-blue-700 mt-1 font-inter">
              Reviews are aggregated from multiple sources including Reddit, YouTube, and retailer platforms. Each review is carefully curated to provide authentic customer experiences.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
