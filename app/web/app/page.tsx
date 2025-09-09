'use client';

import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import useSWR from 'swr';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import ProductCard from '@/components/ProductCard';
import ProductCardWithData from '@/components/ProductCardWithData';
import CardSkeleton from '@/components/CardSkeleton';
import CompareBar from '@/components/CompareBar';
import { fetcher } from '@/lib/fetcher';
import { API_BASE } from '@/lib/config';
// import { computeMinPrice, computeTopRating, firstSentence } from '@/lib/resolve';
import type { ProductListItem } from '@/lib/types';
// import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  
  const { data: products, error, isLoading } = useSWR<ProductListItem[]>(
    `${API_BASE}/products`, 
    fetcher,
    { 
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000 // 1 minute
    }
  );

  // Compare handlers
  const handleCompareToggle = (slug: string) => {
    setSelectedForCompare(prev => {
      if (prev.includes(slug)) {
        return prev.filter(s => s !== slug);
      } else if (prev.length < 4) {
        return [...prev, slug];
      }
      return prev; // Max 4 products
    });
  };

  const handleCompare = () => {
    if (selectedForCompare.length >= 2) {
      const slugs = selectedForCompare.join(',');
      router.push(`/compare?slugs=${slugs}`);
    }
  };

  const handleClearCompare = () => {
    setSelectedForCompare([]);
  };

  // Memoize derived values to avoid recalculation on re-renders
  const productCards = useMemo(() => {
    if (!products) return [];
    
    return products.map((product, index) => {
      return (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
        >
          <ProductCardWithData
            item={product}
            isSelected={selectedForCompare.includes(product.slug)}
            onCompareToggle={handleCompareToggle}
          />
        </motion.div>
      );
    });
  }, [products, selectedForCompare]);

  if (error) {
    return (
      <div className="min-h-screen bg-ivory">
        <Head>
          <title>Error | Prism</title>
          <meta name="description" content="Failed to load beauty products" />
        </Head>
        <NavBar />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-playfair text-charcoal mb-4">Failed to load products</h1>
            <p className="text-charcoal/70">Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Prism - AI-Powered Beauty Intelligence</title>
        <meta name="description" content="Next-generation beauty intelligence with adaptive AI, parallel processing, and real-time multi-platform insights." />
        <meta name="keywords" content="beauty, AI, adaptive analysis, parallel processing, cosmetics, skincare, makeup, reviews, pricing" />
        <meta property="og:title" content="Prism - AI-Powered Beauty Intelligence" />
        <meta property="og:description" content="Advanced beauty intelligence platform with category-aware AI analysis and influencer insights." />
        <meta property="og:type" content="website" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen bg-ivory">
        <NavBar />
        
        {/* Modern Hero Section */}
        <section className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* AI Badge */}
            <motion.div
              className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 text-sm font-medium mb-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              🤖 Powered by Adaptive AI & Parallel Processing
            </motion.div>

            <h1 className="text-5xl md:text-6xl font-playfair text-charcoal mb-6">
              Next-Generation
              <span className="text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text block">Beauty Intelligence</span>
            </h1>
            
            <p className="text-xl text-charcoal/70 max-w-3xl mx-auto leading-relaxed mb-8">
              Advanced category-aware AI analysis, real-time multi-platform data, 
              and influencer insights powered by cutting-edge machine learning
            </p>

            {/* Feature highlights */}
            <motion.div 
              className="flex flex-wrap justify-center gap-6 text-sm text-charcoal/60"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Adaptive AI Analysis</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>3-5x Faster Processing</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                <span>YouTube & Instagram</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>9+ Platform Integration</span>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Products Grid */}
        <section className="container mx-auto px-4 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                >
                  <CardSkeleton />
                </motion.div>
              ))
            ) : products && products.length > 0 ? (
              // Real product data
              productCards
            ) : (
              // No data state
              <div className="col-span-full text-center py-16">
                <p className="text-charcoal/70">No products available</p>
              </div>
            )}
          </div>
        </section>
      </div>
      
      {/* Compare Bar */}
      <CompareBar
        selectedCount={selectedForCompare.length}
        onCompare={handleCompare}
        onClear={handleClearCompare}
      />
    </>
  );
}
