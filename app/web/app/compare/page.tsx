'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Head from 'next/head';
import { motion } from 'framer-motion';
import useSWR from 'swr';
import Image from 'next/image';
import { ArrowLeft, Download, Star, Award, DollarSign } from 'lucide-react';
import NavBar from '@/components/NavBar';
import { fetcher } from '@/lib/fetcher';
import { API_BASE } from '@/lib/config';
import { fetchCompareData, buildCSV, downloadCSV, findWinners, formatPrice, formatRating } from '@/lib/compare';
import type { CompareResponse, ProductListItem } from '@/lib/types';

export default function ComparePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [productIds, setProductIds] = useState<string[]>([]);
  const [isResolving, setIsResolving] = useState(true);

  // Parse slugs from URL
  useEffect(() => {
    const slugs = searchParams.get('slugs');
    if (slugs) {
      const slugList = slugs.split(',').map(s => s.trim()).filter(Boolean);
      if (slugList.length >= 2 && slugList.length <= 4) {
        resolveSlugsToIds(slugList);
      } else {
        setIsResolving(false);
      }
    } else {
      setIsResolving(false);
    }
  }, [searchParams]);

  // Resolve slugs to product IDs
  const resolveSlugsToIds = async (slugs: string[]) => {
    try {
      const products = await fetcher(`${API_BASE}/products`);
      const idMap = new Map(products.map((p: ProductListItem) => [p.slug, p.id]));
      const ids = slugs.map(slug => idMap.get(slug)).filter(Boolean) as string[];
      
      if (ids.length >= 2) {
        setProductIds(ids);
      }
    } catch (error) {
      console.error('Failed to resolve product IDs:', error);
    } finally {
      setIsResolving(false);
    }
  };

  // Fetch comparison data
  const { data: compareData, error, isLoading } = useSWR<CompareResponse>(
    productIds.length >= 2 ? `compare-${productIds.join(',')}` : null,
    () => fetchCompareData(productIds),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  // Find winners
  const winners = useMemo(() => {
    if (!compareData?.items) return { bestPrice: null, mostRated: null };
    return findWinners(compareData.items);
  }, [compareData]);

  // Handle CSV export
  const handleExportCSV = () => {
    if (compareData) {
      const csvContent = buildCSV(compareData);
      downloadCSV(csvContent, 'beauty-products-comparison.csv');
    }
  };

  // Loading state
  if (isResolving || isLoading) {
    return (
      <div className="min-h-screen bg-ivory">
        <Head>
          <title>Compare Products | Prism</title>
        </Head>
        <NavBar />
        <div className="container mx-auto px-4 py-16">
          <div className="animate-pulse">
            <div className="h-8 bg-charcoal/10 rounded w-1/4 mb-8"></div>
            <div className="h-96 bg-charcoal/5 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !compareData || compareData.items.length < 2) {
    return (
      <div className="min-h-screen bg-ivory">
        <Head>
          <title>Compare Products | Prism</title>
        </Head>
        <NavBar />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-playfair text-charcoal mb-4">Unable to Compare Products</h1>
            <p className="text-charcoal/70 mb-6">Please select 2-4 products to compare.</p>
            <button
              onClick={() => router.push('/')}
              className="beauty-button-primary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  const items = compareData.items;

  return (
    <div className="min-h-screen bg-ivory">
      <Head>
        <title>Compare Products | Prism</title>
        <meta name="description" content="Compare beauty products side-by-side with pricing, ratings, and specifications." />
      </Head>
      
      <NavBar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="p-2 text-charcoal/60 hover:text-charcoal hover:bg-charcoal/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-playfair font-bold text-charcoal">Compare Products</h1>
              <p className="text-charcoal/60 mt-1">{items.length} products selected</p>
            </div>
          </div>
          
          <button
            onClick={handleExportCSV}
            className="beauty-button-secondary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl border border-charcoal/10 overflow-hidden shadow-sm"
        >
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-charcoal/10">
                  <th className="text-left p-6 font-semibold text-charcoal">Product</th>
                  {items.map((item) => (
                    <th key={item.id} className="text-center p-6 min-w-[200px]">
                      <div className="space-y-3">
                        <div className="relative w-24 h-24 mx-auto">
                          <Image
                            src={item.hero_image_url}
                            alt={`${item.brand || 'Beauty'} ${item.name}`}
                            fill
                            className="object-cover rounded-xl"
                            sizes="96px"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-lilac">{item.brand}</p>
                          <h3 className="font-playfair text-lg font-semibold text-charcoal leading-tight">
                            {item.name}
                          </h3>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Price Row */}
                <tr className="border-b border-charcoal/5">
                  <td className="p-6 font-medium text-charcoal flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-lilac" />
                    Price
                  </td>
                  {items.map((item) => (
                    <td key={item.id} className="p-6 text-center">
                      <div className="relative">
                        <span className="text-xl font-bold text-charcoal">
                          {formatPrice(item.min_price_usd || null)}
                        </span>
                        {winners.bestPrice === item.id && (
                          <div className="absolute -top-2 -right-2">
                            <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                              <Award className="w-3 h-3" />
                              Best Price
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Rating Row */}
                <tr className="border-b border-charcoal/5">
                  <td className="p-6 font-medium text-charcoal flex items-center gap-2">
                    <Star className="w-4 h-4 text-lilac" />
                    Rating
                  </td>
                  {items.map((item) => (
                    <td key={item.id} className="p-6 text-center">
                      <div className="relative">
                        <span className="text-lg font-semibold text-charcoal">
                          {formatRating(item.best_rating_avg || null, item.best_rating_count || null)}
                        </span>
                        {winners.mostRated === item.id && (
                          <div className="absolute -top-2 -right-2">
                            <div className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                              <Award className="w-3 h-3" />
                              Most Rated
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Verdict Row */}
                <tr className="border-b border-charcoal/5">
                  <td className="p-6 font-medium text-charcoal">Verdict</td>
                  {items.map((item) => (
                    <td key={item.id} className="p-6 text-center">
                      <p className="text-sm text-charcoal/70 leading-relaxed">
                        {item.verdict_snippet || '—'}
                      </p>
                    </td>
                  ))}
                </tr>

                {/* Size Row */}
                <tr className="border-b border-charcoal/5">
                  <td className="p-6 font-medium text-charcoal">Size</td>
                  {items.map((item) => (
                    <td key={item.id} className="p-6 text-center">
                      <span className="text-charcoal">
                        {item.key_specs.size || '—'}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Form Row */}
                <tr className="border-b border-charcoal/5">
                  <td className="p-6 font-medium text-charcoal">Form</td>
                  {items.map((item) => (
                    <td key={item.id} className="p-6 text-center">
                      <span className="text-charcoal">
                        {item.key_specs.form || '—'}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Finish/Texture Row */}
                <tr>
                  <td className="p-6 font-medium text-charcoal">Finish/Texture</td>
                  {items.map((item) => (
                    <td key={item.id} className="p-6 text-center">
                      <span className="text-charcoal">
                        {item.key_specs.finish_texture || '—'}
                      </span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden p-4 space-y-4">
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-ivory/50 rounded-xl p-4 border border-charcoal/10"
              >
                <div className="flex gap-4 mb-4">
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <Image
                      src={item.hero_image_url}
                      alt={`${item.brand || 'Beauty'} ${item.name}`}
                      fill
                      className="object-cover rounded-lg"
                      sizes="64px"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-lilac">{item.brand}</p>
                    <h3 className="font-playfair text-lg font-semibold text-charcoal leading-tight">
                      {item.name}
                    </h3>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-charcoal/60">Price:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-charcoal">
                        {formatPrice(item.min_price_usd || null)}
                      </span>
                      {winners.bestPrice === item.id && (
                        <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                          Best Price
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-charcoal/60">Rating:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-charcoal">
                        {formatRating(item.best_rating_avg || null, item.best_rating_count || null)}
                      </span>
                      {winners.mostRated === item.id && (
                        <div className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
                          Most Rated
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="col-span-2">
                    <span className="text-charcoal/60">Verdict:</span>
                    <p className="text-charcoal/70 mt-1">
                      {item.verdict_snippet || '—'}
                    </p>
                  </div>
                  
                  <div>
                    <span className="text-charcoal/60">Size:</span>
                    <p className="text-charcoal">{item.key_specs.size || '—'}</p>
                  </div>
                  
                  <div>
                    <span className="text-charcoal/60">Form:</span>
                    <p className="text-charcoal">{item.key_specs.form || '—'}</p>
                  </div>
                  
                  <div className="col-span-2">
                    <span className="text-charcoal/60">Finish/Texture:</span>
                    <p className="text-charcoal">{item.key_specs.finish_texture || '—'}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

