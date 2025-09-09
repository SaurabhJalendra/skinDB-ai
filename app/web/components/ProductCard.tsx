'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Star, ShoppingBag } from 'lucide-react';
import type { ProductListItem } from '@/lib/types';

interface ProductCardProps {
  item: ProductListItem;
  minPrice: string | null;
  ratingChip: string | null;
  verdictPreview: string;
  isSelected?: boolean;
  onCompareToggle?: (slug: string) => void;
}

export default function ProductCard({ item, minPrice, ratingChip, verdictPreview, isSelected = false, onCompareToggle }: ProductCardProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileHover={{ 
        y: -4,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      className="group"
    >
      <Link href={`/p/${item.slug}`} className="block">
        <div className="beauty-card relative overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer">
        {/* Gradient sheen effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 -translate-x-full group-hover:translate-x-full" />
        
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden rounded-t-2xl">
          <Image
            src={item.hero_image_url}
            alt={`${item.brand || 'Beauty'} ${item.name}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            priority={false}
          />
          {/* Fallback overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-lilac/10 to-blush/10" />
          
          {/* Compare Checkbox */}
          {onCompareToggle && (
            <div 
              className="absolute top-3 left-3 z-10"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onCompareToggle(item.slug);
              }}
            >
              <label className="flex items-center justify-center w-6 h-6 bg-white/90 backdrop-blur-sm rounded-full cursor-pointer hover:bg-white transition-colors shadow-sm">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}} // Handled by parent onClick
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded-full border-2 transition-all ${
                  isSelected 
                    ? 'bg-lilac border-lilac' 
                    : 'border-charcoal/30 hover:border-lilac/50'
                }`}>
                  {isSelected && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </div>
              </label>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Brand and Name */}
          <div>
            {item.brand && (
              <p className="text-sm font-medium text-lilac mb-1">
                {item.brand}
              </p>
            )}
            <h3 className="font-playfair text-lg font-semibold text-charcoal leading-tight line-clamp-2">
              {item.name}
            </h3>
          </div>

          {/* Price and Rating Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="h-4 w-4 text-charcoal/60" />
              <span className="text-lg font-bold text-charcoal">
                {minPrice || '—'}
              </span>
            </div>
            
            {ratingChip && (
              <div className="flex items-center space-x-1 bg-lilac/20 px-2 py-1 rounded-full">
                <Star className="h-3 w-3 text-lilac fill-current" />
                <span className="text-xs font-medium text-lilac">
                  {ratingChip}
                </span>
              </div>
            )}
          </div>

          {/* Verdict Preview */}
          <p className="text-sm text-charcoal/70 leading-relaxed line-clamp-2">
            {verdictPreview}
          </p>

          {/* Freshness Indicator */}
          {item.last_updated && (
            <div className="flex items-center justify-between text-xs text-charcoal/50">
              <span>Updated recently</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            </div>
          )}
        </div>
        </div>
      </Link>
    </motion.div>
  );
}
