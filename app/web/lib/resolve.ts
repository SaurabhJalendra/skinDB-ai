import { getProducts } from './fetcher';
import type { ProductListItem, Offer, Rating } from './types';

export async function resolveIdBySlug(slug: string): Promise<string | null> {
  try {
    const products = await getProducts();
    const product = products.find(p => p.slug === slug);
    return product?.id || null;
  } catch (error) {
    console.error('Failed to resolve product ID by slug:', error);
    return null;
  }
}

export function firstSentence(text: string): string {
  if (!text) return '';
  const sentences = text.match(/[^.!?]+[.!?]+/g);
  return sentences ? sentences[0].trim() : text.trim();
}

export function formatPrice(amount: number | null): string {
  if (amount === null || amount === undefined) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatRating(rating: number | null): string {
  if (rating === null || rating === undefined) return '—';
  return rating.toFixed(1);
}

export function formatDate(dateString: string | null): string {
  if (!dateString) return '—';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return 'Today';
  if (diffDays === 2) return 'Yesterday';
  if (diffDays <= 7) return `${diffDays - 1} days ago`;
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

// Helper functions for computing display data
export function computeMinPrice(offers: Record<string, Offer>): number | null {
  const prices: number[] = [];
  for (const key in offers) {
    if (offers.hasOwnProperty(key)) {
      const price = offers[key].price_amount;
      if (price !== null && price !== undefined) {
        prices.push(price);
      }
    }
  }
  
  return prices.length > 0 ? Math.min(...prices) : null;
}

export function computeTopRating(ratings: Record<string, Rating>): { rating: number | null; retailer: string | null } {
  const ratingEntries: Array<{ retailer: string; rating: number }> = [];
  
  for (const key in ratings) {
    if (ratings.hasOwnProperty(key)) {
      const rating = ratings[key].average;
      if (rating !== null && rating !== undefined) {
        ratingEntries.push({ retailer: key, rating });
      }
    }
  }
  
  if (ratingEntries.length === 0) return { rating: null, retailer: null };
  
  const topRating = Math.max(...ratingEntries.map(r => r.rating));
  const topRetailer = ratingEntries.find(r => r.rating === topRating)?.retailer || null;
  
  return { rating: topRating, retailer: topRetailer };
}
