'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useSWR from 'swr';
import { useParams } from 'next/navigation';
import Head from 'next/head';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NavBar from '@/components/NavBar';
import ProductHeader from '@/components/ProductHeader';
import SummaryTab from '@/components/SummaryTab';
import TrendsTab from '@/components/TrendsTab';
import PricesTab from '@/components/PricesTab';
import RatingsTab from '@/components/RatingsTab';
import ReviewsTab from '@/components/ReviewsTab';
import SpecsTab from '@/components/SpecsTab';
import InfluencersTab from '@/components/InfluencersTab';
import SourcesDrawer from '@/components/SourcesDrawer';
import SectionSkeleton from '@/components/SectionSkeleton';
import { fetcher } from '@/lib/fetcher';
import { resolveIdBySlug } from '@/lib/resolve';
import { formatDate } from '@/lib/resolve';
import { API_BASE } from '@/lib/config';
import type { ConsolidatedProductResponse } from '@/lib/types';

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [activeTab, setActiveTab] = useState('summary');
  const [productId, setProductId] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(true);

  // Resolve product ID from slug
  useEffect(() => {
    const resolveProduct = async () => {
      setIsResolving(true);
      try {
        const id = await resolveIdBySlug(slug);
        setProductId(id);
      } catch (error) {
        console.error('Failed to resolve product ID:', error);
        setProductId(null);
      } finally {
        setIsResolving(false);
      }
    };

    if (slug) {
      resolveProduct();
    }
  }, [slug]);

  // Fetch product data with SWR optimizations
  const { data: productData, error, isLoading } = useSWR<ConsolidatedProductResponse>(
    productId ? `${API_BASE}/product/${productId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300000, // 5 minutes
      errorRetryCount: 3,
      errorRetryInterval: 5000
    }
  );

  // Memoize derived values
  const { updatedLabel, globalRating, metadata } = useMemo(() => {
    if (!productData) {
      return { 
        updatedLabel: 'Never', 
        globalRating: null,
        metadata: {
          title: 'Product Not Found | Prism Beauty',
          description: 'The requested product could not be loaded.'
        }
      };
    }

    const updatedLabel = (productData.product as any).updated_at 
      ? formatDate((productData.product as any).updated_at) 
      : 'Never';
    
    const globalRating = productData.summary?.aspect_scores?.overall?.toString() || null;

    const title = `${productData.product.brand || 'Beauty'} ${productData.product.name} | Prism Beauty`;
    const description = productData.summary?.verdict || 
      `Discover ${productData.product.name} with comprehensive pricing, ratings, and reviews from top retailers.`;

    return { 
      updatedLabel, 
      globalRating,
      metadata: { title, description }
    };
  }, [productData]);

  if (isResolving || isLoading) {
    return (
      <div className="min-h-screen bg-ivory">
        <Head>
          <title>Loading... | Prism Beauty</title>
          <meta name="description" content="Loading product information..." />
        </Head>
        <NavBar />
        <div className="container mx-auto px-4 py-8">
          <SectionSkeleton />
        </div>
      </div>
    );
  }

  if (error || !productData) {
    return (
      <div className="min-h-screen bg-ivory">
        <Head>
          <title>Product Not Found | Prism Beauty</title>
          <meta name="description" content="The requested product could not be loaded." />
        </Head>
        <NavBar />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-playfair text-charcoal mb-4">Product not found</h1>
            <p className="text-charcoal/70">The requested product could not be loaded.</p>
          </div>
        </div>
      </div>
    );
  }

  const { product, offers, ratings, reviews, specs, summary } = productData;

  return (
    <>
      <Head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta name="keywords" content={`${product.brand}, ${product.name}, beauty, cosmetics, reviews, pricing`} />
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:type" content="product" />
        <meta property="og:image" content={product.hero_image_url} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen bg-ivory">
        <NavBar />
        
        <div className="container mx-auto px-4 py-8">
          {/* Product Header */}
          <ProductHeader
            product={product}
            updatedLabel={updatedLabel}
            globalRating={globalRating}
          />

          {/* Sources Drawer Button */}
          <div className="flex justify-end mb-6">
            <SourcesDrawer citations={summary?.citations || {}} />
          </div>

          {/* Product Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-7 mb-8">
              <TabsTrigger value="summary" className="beauty-tab">Summary</TabsTrigger>
              <TabsTrigger value="trends" className="beauty-tab">Trends</TabsTrigger>
              <TabsTrigger value="prices" className="beauty-tab">Prices</TabsTrigger>
              <TabsTrigger value="ratings" className="beauty-tab">Ratings</TabsTrigger>
              <TabsTrigger value="reviews" className="beauty-tab">Reviews</TabsTrigger>
              <TabsTrigger value="influencers" className="beauty-tab">Influencers</TabsTrigger>
              <TabsTrigger value="specs" className="beauty-tab">Specs</TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <TabsContent value="summary" className="mt-0">
                <motion.div
                  key="summary"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {summary ? (
                    <SummaryTab
                      pros={summary.pros}
                      cons={summary.cons}
                      verdict={summary.verdict}
                      aspectScores={summary.aspect_scores}
                    />
                  ) : (
                    <div className="text-center py-16">
                      <p className="text-charcoal/70 text-lg">No summary available yet</p>
                      <p className="text-charcoal/50 mt-2">Check back later for AI-generated insights</p>
                    </div>
                  )}
                </motion.div>
              </TabsContent>

              <TabsContent value="trends" className="mt-0">
                <motion.div
                  key="trends"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {productId ? (
                    <TrendsTab 
                      productId={productId} 
                      availableRetailers={Object.keys(offers)} 
                    />
                  ) : (
                    <div className="text-center py-16">
                      <p className="text-charcoal/70 text-lg">Loading price trends...</p>
                    </div>
                  )}
                </motion.div>
              </TabsContent>

              <TabsContent value="prices" className="mt-0">
                <motion.div
                  key="prices"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <PricesTab offers={offers} />
                </motion.div>
              </TabsContent>

              <TabsContent value="ratings" className="mt-0">
                <motion.div
                  key="ratings"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <RatingsTab ratings={ratings} />
                </motion.div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-0">
                <motion.div
                  key="reviews"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ReviewsTab reviews={reviews} />
                </motion.div>
              </TabsContent>

              <TabsContent value="influencers" className="mt-0">
                <motion.div
                  key="influencers"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <InfluencersTab 
                    youtube={productData?.reviews?.youtube}
                    instagram={productData?.reviews?.instagram}
                  />
                </motion.div>
              </TabsContent>

              <TabsContent value="specs" className="mt-0">
                <motion.div
                  key="specs"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <SpecsTab items={specs} />
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </div>
      </div>
    </>
  );
}
