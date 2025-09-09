'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import useSWR, { mutate } from 'swr';
import { RefreshCw, Download, Clock, Info, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import NavBar from '@/components/NavBar';
import { fetcher, ingestAll, ingestOne, ingestOneChunked, ingestOneAdaptive } from '@/lib/fetcher';
import { API_BASE } from '@/lib/config';
import { formatDate } from '@/lib/resolve';
import type { ProductListItem } from '@/lib/types';

export default function AdminPage() {
  const [isIngestingAll, setIsIngestingAll] = useState(false);
  const [ingestingProducts, setIngestingProducts] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const { data: products, error, isLoading } = useSWR<ProductListItem[]>(
    `${API_BASE}/products`, 
    fetcher,
    { 
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 300000 // 5 minutes
    }
  );

  const handleIngestAll = async () => {
    setIsIngestingAll(true);
    try {
      await ingestAll();
      toast({
        title: "Ingestion Complete",
        description: "All products have been refreshed successfully.",
        variant: "success",
        duration: 3000,
      });
      // Revalidate data
      mutate(`${API_BASE}/products`);
    } catch (error) {
      toast({
        title: "Ingestion Failed",
        description: "Failed to refresh products. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsIngestingAll(false);
    }
  };

  const handleIngestOne = async (productId: string) => {
    setIngestingProducts(prev => new Set(prev).add(productId));
    try {
      await ingestOne(productId);
      toast({
        title: "Product Refreshed",
        description: "Product data has been updated successfully.",
        variant: "success",
        duration: 3000,
      });
      // Revalidate both product list and individual product
      mutate(`${API_BASE}/products`);
      mutate(`${API_BASE}/product/${productId}`);
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh product. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIngestingProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleIngestOneChunked = async (productId: string) => {
    setIngestingProducts(prev => new Set(prev).add(productId));
    try {
      await ingestOneChunked(productId);
      toast({
        title: "Product Refreshed (Chunked)",
        description: "Complete product data collected from all 9 platforms successfully.",
        variant: "success",
        duration: 4000,
      });
      // Revalidate both product list and individual product
      mutate(`${API_BASE}/products`);
      mutate(`${API_BASE}/product/${productId}`);
    } catch (error) {
      toast({
        title: "Chunked Refresh Failed",
        description: "Failed to refresh product with chunked method. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIngestingProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleIngestOneAdaptive = async (productId: string) => {
    setIngestingProducts(prev => new Set(prev).add(productId));
    try {
      await ingestOneAdaptive(productId);
      toast({
        title: "Product Refreshed (Adaptive AI)",
        description: "Category-aware analysis with flexible, context-specific insights completed.",
        variant: "success",
        duration: 4000,
      });
      // Revalidate both product list and individual product
      mutate(`${API_BASE}/products`);
      mutate(`${API_BASE}/product/${productId}`);
    } catch (error) {
      toast({
        title: "Adaptive Refresh Failed",
        description: "Failed to refresh product with adaptive method. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIngestingProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-ivory">
        <NavBar />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-playfair text-charcoal mb-4">Failed to load admin panel</h1>
            <p className="text-charcoal/70">Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory">
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-playfair font-bold text-charcoal mb-2">
            Admin Dashboard
          </h1>
          <p className="text-charcoal/70">
            Manage product data ingestion and monitor system status
          </p>
          <div className="mt-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
            <h3 className="text-sm font-semibold text-purple-800 mb-2">🤖 NEW: Adaptive AI Ingestion</h3>
            <p className="text-sm text-charcoal/80 mb-2">
              <strong>Adaptive AI:</strong> Our latest breakthrough uses category-aware analysis (Fragrance, Makeup, Skincare, Tools) 
              with flexible prompts that ask only relevant questions and provide richer, context-specific insights.
            </p>
            <p className="text-sm text-charcoal/70">
              <strong>Complete:</strong> Reliable chunked approach collecting data from all 9 platforms. 
              <strong>Quick:</strong> Basic refresh for urgent updates.
            </p>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-luxury">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-lilac/20 rounded-full">
                <Download className="h-6 w-6 text-lilac" />
              </div>
              <div>
                <p className="text-sm text-charcoal/60">Total Products</p>
                <p className="text-2xl font-bold text-charcoal">
                  {products ? products.length : '—'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-luxury">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-full">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-charcoal/60">Last Updated</p>
                <p className="text-2xl font-bold text-charcoal">
                  {products && products.length > 0 
                    ? formatDate(new Date(Math.max(...products.map(p => new Date(p.last_updated || 0).getTime()))).toISOString())
                    : 'Never'
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-luxury">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-amber-100 rounded-full">
                <Info className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-charcoal/60">System Status</p>
                <p className="text-2xl font-bold text-green-600">Healthy</p>
              </div>
            </div>
          </div>
        </div>

        {/* Batch Operations */}
        <div className="bg-white rounded-2xl p-6 shadow-luxury mb-8">
          <h2 className="text-xl font-playfair text-charcoal mb-4">Batch Operations</h2>
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={handleIngestAll} 
              disabled={isIngestingAll || isLoading} 
              className="beauty-button-primary focus-visible:ring-2 focus-visible:ring-lilac focus-visible:ring-offset-2"
            >
              {isIngestingAll ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Refreshing All...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Refresh All Products
                </>
              )}
            </Button>
            <div className="text-sm text-charcoal/60 flex items-center">
              <Info className="h-4 w-4 mr-2" />
              This will refresh data for all products
            </div>
          </div>
        </div>

        {/* Product Management Table */}
        <div className="bg-white rounded-2xl shadow-luxury overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-xl font-playfair text-charcoal">Product Management</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-charcoal/60 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-charcoal/60 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-charcoal/60 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  // Loading skeletons
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4">
                        <div className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="animate-pulse">
                          <div className="h-3 bg-gray-200 rounded w-20"></div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="animate-pulse">
                          <div className="h-8 bg-gray-200 rounded w-20"></div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : products && products.length > 0 ? (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-charcoal">{product.name}</div>
                          {product.brand && (
                            <div className="text-sm text-charcoal/60">{product.brand}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-charcoal/60">
                        {formatDate(product.last_updated || new Date().toISOString())}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          {/* Primary Actions */}
                          <div className="flex gap-2">
                            {/* Adaptive Ingestion - NEW & BEST */}
                            <Button 
                              onClick={() => handleIngestOneAdaptive(product.id)} 
                              disabled={ingestingProducts.has(product.id)} 
                              variant="default" 
                              size="sm" 
                              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
                            >
                              {ingestingProducts.has(product.id) ? (
                                <>
                                  <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                                  Analyzing...
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-2" />
                                  Adaptive AI
                                </>
                              )}
                            </Button>
                            
                            {/* Chunked Ingestion - Reliable */}
                            <Button 
                              onClick={() => handleIngestOneChunked(product.id)} 
                              disabled={ingestingProducts.has(product.id)} 
                              variant="default" 
                              size="sm" 
                              className="bg-lilac hover:bg-lilac/90 text-white focus-visible:ring-2 focus-visible:ring-lilac focus-visible:ring-offset-2"
                            >
                              {ingestingProducts.has(product.id) ? (
                                <>
                                  <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-2" />
                                  Complete
                                </>
                              )}
                            </Button>
                          </div>
                          
                          {/* Secondary Action */}
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => handleIngestOne(product.id)} 
                              disabled={ingestingProducts.has(product.id)} 
                              variant="outline" 
                              size="sm" 
                              className="beauty-button-secondary focus-visible:ring-2 focus-visible:ring-lilac focus-visible:ring-offset-2"
                            >
                              {ingestingProducts.has(product.id) ? (
                                <>
                                  <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                                  Quick...
                                </>
                              ) : (
                                <>
                                  <RefreshCw className="h-3 w-3 mr-2" />
                                  Quick Refresh
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                        
                        {/* Enhanced Helper text */}
                        <div className="text-xs text-charcoal/50 mt-2">
                          <div className="font-medium text-purple-600">Adaptive AI: Category-aware analysis</div>
                          <div>Complete: All 9 platforms | Quick: Basic refresh</div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center">
                      <div className="text-charcoal/50">
                        <Info className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium">No products available</p>
                        <p className="text-sm">Products will appear here once added to the system</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
