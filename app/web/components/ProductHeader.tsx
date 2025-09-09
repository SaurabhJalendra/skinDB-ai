'use client';

import Image from 'next/image';
import { Star, Clock, TrendingUp } from 'lucide-react';
import type { Product } from '@/lib/types';

interface ProductHeaderProps {
  product: Product;
  updatedLabel: string;
  globalRating?: string | null;
}

export default function ProductHeader({ 
  product, 
  updatedLabel, 
  globalRating = "—" 
}: ProductHeaderProps) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-luxury mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden rounded-2xl">
          <Image
            src={product.hero_image_url}
            alt={`${product.brand || 'Beauty'} ${product.name}`}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
          {/* Fallback overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-lilac/10 to-blush/10" />
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Brand and Name */}
          <div>
            {product.brand && (
              <p className="text-lg font-medium text-lilac mb-2">
                {product.brand}
              </p>
            )}
            <h1 className="font-playfair text-3xl md:text-4xl font-bold text-charcoal leading-tight">
              {product.name}
            </h1>
            {product.category && (
              <p className="text-gray-700 mt-2 font-inter">
                {product.category}
              </p>
            )}
          </div>

          {/* Status Chips */}
          <div className="flex flex-wrap gap-3">
            {/* Freshness Chip with Tooltip */}
            <div className="group relative">
              <div className="flex items-center space-x-2 bg-green-50 border border-green-200 px-3 py-2 rounded-full">
                <Clock className="h-4 w-4 text-green-700" />
                <span className="text-sm font-medium text-green-800">
                  Updated {updatedLabel}
                </span>
              </div>
              {/* Tooltip */}
              {(product as any).updated_at && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-charcoal text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  {new Date((product as any).updated_at).toISOString()}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-charcoal"></div>
                </div>
              )}
            </div>

            {/* Global Rating Chip */}
            {globalRating !== "—" && (
              <div className="flex items-center space-x-2 bg-lilac/20 border border-lilac/30 px-3 py-2 rounded-full">
                <Star className="h-4 w-4 text-lilac fill-current" />
                <span className="text-sm font-medium text-charcoal">
                  {globalRating} Global Rating
                </span>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <div className="text-2xl font-bold text-charcoal">10+</div>
              <div className="text-sm text-gray-700">Retailers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-charcoal">1000+</div>
              <div className="text-sm text-gray-700">Reviews</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4">
            <button 
              className="beauty-button-primary focus-visible:ring-2 focus-visible:ring-lilac focus-visible:ring-offset-2"
              aria-label="View all prices for this product"
            >
              View All Prices
            </button>
            <button 
              className="beauty-button-secondary focus-visible:ring-2 focus-visible:ring-lilac focus-visible:ring-offset-2"
              aria-label="Read customer reviews for this product"
            >
              Read Reviews
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
