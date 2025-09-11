import { API_BASE } from './config';
import { CompareResponse } from './types';

/**
 * Fetch comparison data for multiple products
 */
export async function fetchCompareData(productIds: string[]): Promise<CompareResponse> {
  const ids = productIds.join(',');
  const url = `${API_BASE}/compare?ids=${ids}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch comparison data: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Build CSV content from comparison data
 */
export function buildCSV(data: CompareResponse): string {
  const headers = [
    'Product',
    'Brand',
    'Min Price (USD)',
    'Best Rating',
    'Rating Count',
    'Verdict',
    'Size',
    'Form',
    'Finish/Texture'
  ];
  
  const rows = data.items.map(item => [
    `"${item.name}"`,
    `"${item.brand || 'N/A'}"`,
    item.min_price_usd ? `$${item.min_price_usd.toFixed(2)}` : 'N/A',
    item.best_rating_avg ? item.best_rating_avg.toFixed(1) : 'N/A',
    item.best_rating_count || 'N/A',
    `"${item.verdict_snippet || 'N/A'}"`,
    `"${item.key_specs.size || 'N/A'}"`,
    `"${item.key_specs.form || 'N/A'}"`,
    `"${item.key_specs.finish_texture || 'N/A'}"`
  ]);
  
  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent: string, filename: string = 'product-comparison.csv'): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * Find winners for comparison metrics
 */
export function findWinners(items: CompareResponse['items']) {
  const winners = {
    bestPrice: null as string | null,
    mostRated: null as string | null,
  };
  
  // Find best price (lowest)
  const prices = items
    .filter(item => item.min_price_usd !== null)
    .map(item => ({ id: item.id, price: item.min_price_usd! }));
  
  if (prices.length > 0) {
    const bestPrice = prices.reduce((min, current) => 
      current.price < min.price ? current : min
    );
    winners.bestPrice = bestPrice.id;
  }
  
  // Find most rated (highest count)
  const ratings = items
    .filter(item => item.best_rating_count !== null)
    .map(item => ({ id: item.id, count: item.best_rating_count! }));
  
  if (ratings.length > 0) {
    const mostRated = ratings.reduce((max, current) => 
      current.count > max.count ? current : max
    );
    winners.mostRated = mostRated.id;
  }
  
  return winners;
}

/**
 * Format price for display
 */
export function formatPrice(price: number | null): string {
  if (price === null) return '—';
  return `$${price.toFixed(2)}`;
}

/**
 * Format rating for display
 */
export function formatRating(rating: number | null, count: number | null): string {
  if (rating === null) return '—';
  const countStr = count ? ` (${count.toLocaleString()})` : '';
  return `${rating.toFixed(1)}${countStr}`;
}

