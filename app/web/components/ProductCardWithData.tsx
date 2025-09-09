'use client';

import { useMemo } from 'react';
import useSWR from 'swr';
import ProductCard from './ProductCard';
import { fetcher } from '@/lib/fetcher';
import { API_BASE } from '@/lib/config';
import type { ProductListItem, ConsolidatedProductResponse } from '@/lib/types';

interface ProductCardWithDataProps {
  item: ProductListItem;
  isSelected?: boolean;
  onCompareToggle?: (slug: string) => void;
}

export default function ProductCardWithData({ item, isSelected, onCompareToggle }: ProductCardWithDataProps) {
  // Fetch full product data for rich display
  const { data: productData } = useSWR<ConsolidatedProductResponse>(
    `${API_BASE}/product/${item.id}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 600000, // 10 minutes - longer cache for home page
      errorRetryCount: 1, // Minimal retries to avoid slowing down home page
      shouldRetryOnError: false // Don't retry on error for home page performance
    }
  );

  // Compute derived values from rich data
  const { minPrice, ratingChip, verdictPreview } = useMemo(() => {
    if (!productData) {
      return {
        minPrice: null,
        ratingChip: null,
        verdictPreview: "Loading rich data..."
      };
    }

    // Compute minimum price from offers
    let computedMinPrice: string | null = null;
    if (productData.offers && typeof productData.offers === 'object') {
      const prices: number[] = [];
      
      // Handle the actual data structure where offers are objects with price_amount
      Object.values(productData.offers).forEach((offer: any) => {
        if (offer && typeof offer === 'object') {
          // Check for price_amount (from LLM data) or price (fallback)
          const price = offer.price_amount || offer.price;
          if (price && typeof price === 'number') {
            prices.push(price);
          }
        }
      });
      
      if (prices.length > 0) {
        const minPriceValue = Math.min(...prices);
        computedMinPrice = `$${minPriceValue.toFixed(2)}`;
      }
    }

    // Compute average rating for chip
    let computedRatingChip: string | null = null;
    if (productData.ratings && typeof productData.ratings === 'object') {
      const ratings: number[] = [];
      
      // Handle the actual data structure where ratings might be objects or arrays
      Object.values(productData.ratings).forEach((ratingData: any) => {
        if (ratingData && typeof ratingData === 'object') {
          // Check if it's a direct rating object or array of ratings
          if (Array.isArray(ratingData)) {
            ratingData.forEach((rating: any) => {
              const ratingValue = rating.rating || rating.value;
              if (ratingValue && typeof ratingValue === 'number') {
                ratings.push(ratingValue);
              }
            });
          } else {
            // Single rating object
            const ratingValue = ratingData.rating || ratingData.value;
            if (ratingValue && typeof ratingValue === 'number') {
              ratings.push(ratingValue);
            }
          }
        }
      });
      
      if (ratings.length > 0) {
        const avgRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
        computedRatingChip = avgRating.toFixed(1);
      }
    }

    // Get verdict preview from summary
    let computedVerdictPreview = "AI analysis pending - click for details";
    if (productData.summary?.verdict && productData.summary.verdict.trim().length > 10) {
      // Get first sentence or first 120 characters
      const verdict = productData.summary.verdict.trim();
      const firstSentence = verdict.split('.')[0];
      if (firstSentence.length > 20 && firstSentence.length <= 120) {
        computedVerdictPreview = firstSentence + '.';
      } else if (verdict.length <= 120) {
        computedVerdictPreview = verdict;
      } else {
        computedVerdictPreview = verdict.substring(0, 117) + '...';
      }
    } else if (computedMinPrice || computedRatingChip) {
      // Has some data but no verdict
      computedVerdictPreview = "Pricing and rating data available - detailed analysis coming soon";
    }

    return {
      minPrice: computedMinPrice,
      ratingChip: computedRatingChip,
      verdictPreview: computedVerdictPreview
    };
  }, [productData]);

  return (
    <ProductCard
      item={item}
      minPrice={minPrice}
      ratingChip={ratingChip}
      verdictPreview={verdictPreview}
      isSelected={isSelected}
      onCompareToggle={onCompareToggle}
    />
  );
}
