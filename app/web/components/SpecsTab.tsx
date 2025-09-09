'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Award, CheckCircle, Info, ExternalLink } from 'lucide-react';
import type { SpecItem } from '@/lib/types';

interface SpecsTabProps {
  items: SpecItem[];
}

export default function SpecsTab({ items }: SpecsTabProps) {
  const [expandedIngredients, setExpandedIngredients] = useState(false);

  // Group specifications by category
  const groupedSpecs = items.reduce((acc, spec) => {
    const key = spec.key.toLowerCase();
    
    if (key.includes('ingredient') || key.includes('inci')) {
      if (!acc.ingredients) acc.ingredients = [];
      acc.ingredients.push(spec);
    } else if (key.includes('certification') || key.includes('award')) {
      if (!acc.certifications) acc.certifications = [];
      acc.certifications.push(spec);
    } else {
      if (!acc.general) acc.general = [];
      acc.general.push(spec);
    }
    
    return acc;
  }, {} as Record<string, SpecItem[]>);

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return "—";
    }
  };

  const getSpecIcon = (key: string): React.ReactNode => {
    const lowerKey = key.toLowerCase();
    
    if (lowerKey.includes('size') || lowerKey.includes('volume')) {
      return <span className="text-blue-500">📏</span>;
    } else if (lowerKey.includes('form') || lowerKey.includes('texture')) {
      return <span className="text-purple-500">✨</span>;
    } else if (lowerKey.includes('spf') || lowerKey.includes('pa')) {
      return <span className="text-orange-500">☀️</span>;
    } else if (lowerKey.includes('skin') || lowerKey.includes('type')) {
      return <span className="text-pink-500">👩</span>;
    } else if (lowerKey.includes('usage') || lowerKey.includes('application')) {
      return <span className="text-green-500">💆</span>;
    } else {
      return <span className="text-gray-500">ℹ️</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* General Specifications */}
      {groupedSpecs.general && groupedSpecs.general.length > 0 && (
        <div>
          <h3 className="font-playfair text-xl font-semibold text-charcoal mb-6">
            Product Specifications
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {groupedSpecs.general.map((spec, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getSpecIcon(spec.key)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider font-inter">
                        {spec.key.replace(/_/g, ' ')}
                      </h4>
                      {spec.source && (
                        <span className="text-xs text-gray-400 font-inter">
                          {spec.source}
                        </span>
                      )}
                    </div>
                    <p className="text-charcoal font-inter">{spec.value}</p>
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                      <span>Updated {formatDate(spec.scraped_at)}</span>
                      {spec.url && (
                        <button
                          className="text-lilac hover:text-lilac/80 transition-colors duration-200 disabled:opacity-50"
                          disabled
                          title="External links will be enabled in Phase 6"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ingredients Section */}
      {groupedSpecs.ingredients && groupedSpecs.ingredients.length > 0 && (
        <div>
          <h3 className="font-playfair text-xl font-semibold text-charcoal mb-6">
            Ingredients & Formulation
          </h3>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🧪</span>
                  <span className="font-medium text-charcoal font-inter">INCI Ingredients</span>
                </div>
                <button
                  onClick={() => setExpandedIngredients(!expandedIngredients)}
                  className="flex items-center space-x-2 text-lilac hover:text-lilac/80 transition-colors duration-200"
                >
                  <span className="text-sm font-medium font-inter">
                    {expandedIngredients ? 'Show Less' : 'Show All'}
                  </span>
                  {expandedIngredients ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </div>
              
              <div className="space-y-3">
                {groupedSpecs.ingredients.slice(0, expandedIngredients ? undefined : 3).map((spec, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 mt-1">
                      <span className="text-sm text-gray-500">#{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-charcoal font-inter">{spec.value}</p>
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                        <span>Source: {spec.source || 'Unknown'}</span>
                        <span>{formatDate(spec.scraped_at)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {!expandedIngredients && groupedSpecs.ingredients.length > 3 && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600 font-inter">
                    Showing 3 of {groupedSpecs.ingredients.length} ingredients
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Certifications & Awards */}
      {groupedSpecs.certifications && groupedSpecs.certifications.length > 0 && (
        <div>
          <h3 className="font-playfair text-xl font-semibold text-charcoal mb-6">
            Certifications & Awards
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupedSpecs.certifications.map((spec, index) => (
              <div key={index} className="bg-gradient-to-r from-lilac/20 to-blush/20 border border-lilac/30 rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-3">
                  {spec.key.toLowerCase().includes('award') ? (
                    <Award className="h-5 w-5 text-yellow-600" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                  <span className="font-medium text-charcoal font-inter">
                    {spec.key.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-sm text-gray-700 font-inter mb-3">{spec.value}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Source: {spec.source || 'Unknown'}</span>
                  <span>{formatDate(spec.scraped_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Specifications Note */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Info className="h-5 w-5 text-gray-600 mt-0.5" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-800 font-inter">Specifications Information</h4>
            <p className="text-sm text-gray-700 mt-1 font-inter">
              Product specifications are gathered from multiple sources including brand websites, retailer listings, and customer reviews. 
              All data is manually verified and updated through our Admin panel.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
