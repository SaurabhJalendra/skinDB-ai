import { API_BASE } from './config';

export interface PricePoint {
  day: string;
  retailer: string;
  price_amount: number | null;
  price_currency: string | null;
}

export interface PriceHistoryResponse {
  product_id: string;
  points: PricePoint[];
}

export interface ChartDataPoint {
  day: string;
  [retailer: string]: string | number | null;
}

/**
 * Fetch price history for a product
 */
export async function fetchPriceHistory(
  productId: string,
  retailers?: string[],
  days: number = 90
): Promise<PriceHistoryResponse> {
  const params = new URLSearchParams();
  if (retailers && retailers.length > 0) {
    params.append('retailers', retailers.join(','));
  }
  params.append('days', days.toString());

  const url = `${API_BASE}/price-history/${productId}?${params.toString()}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch price history: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Transform price history points into chart data format
 */
export function transformToChartData(
  points: PricePoint[],
  selectedRetailers: string[]
): ChartDataPoint[] {
  // Group points by day
  const dayMap = new Map<string, Map<string, number | null>>();
  
  points.forEach(point => {
    if (!dayMap.has(point.day)) {
      dayMap.set(point.day, new Map());
    }
    dayMap.get(point.day)!.set(point.retailer, point.price_amount);
  });
  
  // Convert to chart format
  const chartData: ChartDataPoint[] = [];
  
  dayMap.forEach((retailerPrices, day) => {
    const dataPoint: ChartDataPoint = { day };
    
    selectedRetailers.forEach(retailer => {
      dataPoint[retailer] = retailerPrices.get(retailer) || null;
    });
    
    chartData.push(dataPoint);
  });
  
  // Sort by day
  return chartData.sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime());
}

/**
 * Get available retailers from price history points
 */
export function getAvailableRetailers(points: PricePoint[]): string[] {
  const retailers = new Set<string>();
  points.forEach(point => {
    if (point.retailer) {
      retailers.add(point.retailer);
    }
  });
  return Array.from(retailers).sort();
}

