/**
 * Strict TypeScript types mirroring Phase 4 FastAPI response models.
 * All types are production-ready and ready for API integration in Phase 6.
 */

export type ProductListItem = {
  id: string;
  slug: string;
  name: string;
  brand?: string | null;
  hero_image_url: string;
  last_updated?: string | null;
};

export type Offer = {
  retailer: string;
  price_amount: number | null;
  price_currency: string | null;
  unit_price: string | null;
  availability: string | null;
  promo: string | null;
  url: string | null;
  scraped_at: string;
};

export type Rating = {
  retailer: string;
  average: number | null;
  count: number | null;
  breakdown?: Record<string, number> | null;
  url: string | null;
  scraped_at: string;
};

export type ReviewSnippet = {
  author?: string | null;
  rating?: number | null;
  title?: string | null;
  body: string;
  posted_at?: string | null;
  url?: string | null;
};

export type SpecItem = {
  key: string;
  value: string;
  source?: string | null;
  url?: string | null;
  scraped_at: string;
};

export type Summary = {
  pros: string[];
  cons: string[];
  verdict: string;
  aspect_scores: Record<string, number | null>;
  citations: Record<string, string>;
  updated_at: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand?: string | null;
  category?: string | null;
  hero_image_url: string;
};

export type ConsolidatedProductResponse = {
  product: Product;
  offers: Record<string, Offer>;
  ratings: Record<string, Rating>;
  reviews: Record<string, ReviewSnippet[]>;
  specs: SpecItem[];
  summary: Summary | null;
};

export type CompareItem = {
  id: string;
  slug: string;
  name: string;
  brand?: string | null;
  hero_image_url: string;
  min_price_usd?: number | null;
  best_rating_avg?: number | null;
  best_rating_count?: number | null;
  verdict_snippet?: string | null;
  key_specs: Record<string, string | null>;
};

export type CompareResponse = {
  items: CompareItem[];
};
