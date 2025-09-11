/**
 * Placeholder data factories for Phase 5 visual testing.
 * Provides realistic mock data shapes that mirror the API responses.
 * NOTE: This file is ONLY for Phase 5 visual testing. Remove usage in Phase 6.
 */

import type { 
  ProductListItem, 
  ConsolidatedProductResponse, 
  Offer, 
  Rating, 
  ReviewSnippet, 
  SpecItem, 
  Summary 
} from './types';

/**
 * Generate mock product list with 10 iconic beauty products.
 */
export function mockProductList(): ProductListItem[] {
  return [
    {
      id: "1",
      slug: "chanel-no5-parfum",
      name: "N°5 Eau de Parfum",
      brand: "Chanel",
      hero_image_url: "/images/chanel-no5.jpg",
      last_updated: new Date().toISOString()
    },
    {
      id: "2",
      slug: "la-mer-cream",
      name: "Crème de la Mer",
      brand: "La Mer",
      hero_image_url: "/images/la-mer-cream.jpg",
      last_updated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "3",
      slug: "sk-ii-essence",
      name: "Facial Treatment Essence",
      brand: "SK-II",
      hero_image_url: "/images/sk-ii-essence.jpg",
      last_updated: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "4",
      slug: "estee-lauder-advanced-night-repair",
      name: "Advanced Night Repair",
      brand: "Estée Lauder",
      hero_image_url: "/images/estee-lauder-serum.jpg",
      last_updated: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "5",
      slug: "dior-rouge-lipstick",
      name: "Rouge Dior Lipstick",
      brand: "Dior",
      hero_image_url: "/images/dior-lipstick.jpg",
      last_updated: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "6",
      slug: "tom-ford-black-orchid",
      name: "Black Orchid Eau de Parfum",
      brand: "Tom Ford",
      hero_image_url: "/images/tom-ford-perfume.jpg",
      last_updated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "7",
      slug: "drunk-elephant-protini",
      name: "Protini Polypeptide Cream",
      brand: "Drunk Elephant",
      hero_image_url: "/images/drunk-elephant-cream.jpg",
      last_updated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "8",
      slug: "pat-mcgrath-labs-eyeshadow",
      name: "Mothership Eyeshadow Palette",
      brand: "Pat McGrath Labs",
      hero_image_url: "/images/pat-mcgrath-palette.jpg",
      last_updated: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "9",
      slug: "tatcha-water-cream",
      name: "The Water Cream",
      brand: "Tatcha",
      hero_image_url: "/images/tatcha-water-cream.jpg",
      last_updated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "10",
      slug: "hourglass-ambient-lighting-powder",
      name: "Ambient Lighting Powder",
      brand: "Hourglass",
      hero_image_url: "/images/hourglass-powder.jpg",
      last_updated: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
}

/**
 * Generate mock consolidated product data for a given slug.
 */
export function mockConsolidatedProduct(slug: string): ConsolidatedProductResponse {
  const product = mockProductList().find(p => p.slug === slug);
  
  if (!product) {
    throw new Error(`Product with slug "${slug}" not found`);
  }

  // Mock offers (2 retailers)
  const offers: Record<string, Offer> = {
    amazon: {
      retailer: "amazon",
      price_amount: 89.99,
      price_currency: "USD",
      unit_price: "$89.99/oz",
      availability: "In Stock",
      promo: "Free Prime Shipping",
      url: "https://amazon.com/product",
      scraped_at: new Date().toISOString()
    },
    sephora: {
      retailer: "sephora",
      price_amount: 95.00,
      price_currency: "USD",
      unit_price: "$95.00/oz",
      availability: "In Stock",
      promo: "Beauty Insider Points",
      url: "https://sephora.com/product",
      scraped_at: new Date().toISOString()
    }
  };

  // Mock ratings (2 retailers)
  const ratings: Record<string, Rating> = {
    amazon: {
      retailer: "amazon",
      average: 4.6,
      count: 1247,
      breakdown: { "5_star": 0.68, "4_star": 0.22, "3_star": 0.08, "2_star": 0.01, "1_star": 0.01 },
      url: "https://amazon.com/reviews",
      scraped_at: new Date().toISOString()
    },
    sephora: {
      retailer: "sephora",
      average: 4.8,
      count: 892,
      breakdown: { "5_star": 0.72, "4_star": 0.20, "3_star": 0.06, "2_star": 0.01, "1_star": 0.01 },
      url: "https://sephora.com/reviews",
      scraped_at: new Date().toISOString()
    }
  };

  // Mock reviews (2 retailers, 3-4 reviews each)
  const reviews: Record<string, ReviewSnippet[]> = {
    amazon: [
      {
        author: "BeautyLover123",
        rating: 5,
        title: "Absolutely stunning fragrance",
        body: "This is my signature scent. It's sophisticated, long-lasting, and always gets compliments.",
        posted_at: "2024-01-15",
        url: "https://amazon.com/review1"
      },
      {
        author: "PerfumeEnthusiast",
        rating: 4,
        title: "Classic and elegant",
        body: "A timeless fragrance that's perfect for special occasions. The longevity is impressive.",
        posted_at: "2024-01-10",
        url: "https://amazon.com/review2"
      },
      {
        author: "LuxuryShopper",
        rating: 5,
        title: "Worth every penny",
        body: "This is an investment piece that will last for years. The quality is unmatched.",
        posted_at: "2024-01-05",
        url: "https://amazon.com/review3"
      }
    ],
    sephora: [
      {
        author: "StyleIcon",
        rating: 5,
        title: "Iconic fragrance",
        body: "This is the definition of luxury. Every woman should own this classic scent.",
        posted_at: "2024-01-12",
        url: "https://sephora.com/review1"
      },
      {
        author: "BeautyGuru",
        rating: 4,
        title: "Sophisticated and timeless",
        body: "Perfect for both day and evening wear. The sillage is perfect - noticeable but not overwhelming.",
        posted_at: "2024-01-08",
        url: "https://sephora.com/review2"
      }
    ]
  };

  // Mock specifications (5-6 items)
  const specs: SpecItem[] = [
    {
      key: "size",
      value: "3.4 fl oz / 100 ml",
      source: "brand_site",
      url: "https://brand.com/specs",
      scraped_at: new Date().toISOString()
    },
    {
      key: "form",
      value: "Eau de Parfum",
      source: "brand_site",
      url: "https://brand.com/specs",
      scraped_at: new Date().toISOString()
    },
    {
      key: "finish_texture",
      value: "Liquid, spray",
      source: "amazon",
      url: "https://amazon.com/product",
      scraped_at: new Date().toISOString()
    },
    {
      key: "skin_types",
      value: "All skin types",
      source: "sephora",
      url: "https://sephora.com/product",
      scraped_at: new Date().toISOString()
    },
    {
      key: "usage",
      value: "Spray on pulse points (wrists, neck, behind ears)",
      source: "brand_site",
      url: "https://brand.com/usage",
      scraped_at: new Date().toISOString()
    },
    {
      key: "ingredients_inci",
      value: "Alcohol, Fragrance, Water, Limonene, Linalool, Citral, Geraniol, Citronellol, Benzyl Benzoate, Benzyl Salicylate",
      source: "brand_site",
      url: "https://brand.com/ingredients",
      scraped_at: new Date().toISOString()
    }
  ];

  // Mock summary with aspect scores
  const summary: Summary = {
    pros: [
      "Long-lasting fragrance that stays for 8+ hours",
      "Sophisticated and timeless scent profile",
      "Excellent sillage without being overwhelming"
    ],
    cons: [
      "Premium price point may be prohibitive",
      "Strong initial application can be intense",
      "Limited availability in some regions"
    ],
    verdict: "This iconic fragrance lives up to its legendary status. The sophisticated blend of floral and woody notes creates a timeless scent that's perfect for special occasions. While the price is steep, the quality and longevity make it a worthwhile investment for fragrance enthusiasts.",
    aspect_scores: {
      longevity: 0.9,
      texture: 0.8,
      irritation: 0.1,
      value: 0.7
    },
    citations: {
      "amazon": "https://amazon.com/product",
      "sephora": "https://sephora.com/product",
      "brand_site": "https://brand.com/product"
    },
    updated_at: new Date().toISOString()
  };

  return {
    product: {
      id: product.id,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      category: "Fragrance",
      hero_image_url: product.hero_image_url
    },
    offers,
    ratings,
    reviews,
    specs,
    summary
  };
}
