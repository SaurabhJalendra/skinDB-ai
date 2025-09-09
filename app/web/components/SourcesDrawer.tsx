'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Info, Globe, FileText, Copy, Check } from 'lucide-react';
import { retailerLabel } from '@/lib/retailers';

interface SourcesDrawerProps {
  citations: Record<string, string>;
}

export default function SourcesDrawer({ citations }: SourcesDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);
  const lastFocusableRef = useRef<HTMLButtonElement>(null);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        return;
      }

      if (e.key === 'Tab') {
        if (!drawerRef.current) return;

        const focusableElements = drawerRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus first element when drawer opens
  useEffect(() => {
    if (isOpen && firstFocusableRef.current) {
      firstFocusableRef.current.focus();
    }
  }, [isOpen]);

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const getSourceIcon = (source: string) => {
    if (source.includes('reddit.com')) return <FileText className="h-4 w-4" />;
    if (source.includes('youtube.com')) return <Globe className="h-4 w-4" />;
    if (source.includes('amazon.com') || source.includes('sephora.com') || source.includes('ulta.com')) return <Info className="h-4 w-4" />;
    return <Globe className="h-4 w-4" />;
  };

  const getSourceLabel = (source: string) => {
    // Try retailer label first for platform consistency
    if (source.includes('amazon.com')) return retailerLabel('amazon');
    if (source.includes('sephora.com')) return retailerLabel('sephora');
    if (source.includes('ulta.com')) return retailerLabel('ulta');
    if (source.includes('walmart.com')) return retailerLabel('walmart');
    if (source.includes('nordstrom.com')) return retailerLabel('nordstrom');
    if (source.includes('brand_site')) return retailerLabel('brand_site');
    
    // Non-retailer sources
    if (source.includes('reddit.com')) return 'Reddit';
    if (source.includes('youtube.com')) return 'YouTube';
    if (source.includes('instagram.com')) return 'Instagram';
    return 'External Source';
  };

  const groupedCitations = Object.entries(citations).reduce((acc, [category, url]) => {
    if (!acc[category]) acc[category] = [];
    acc[category].push(url);
    return acc;
  }, {} as Record<string, string[]>);

  return (
    <>
      {/* Sources Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="beauty-button-secondary focus-visible:ring-2 focus-visible:ring-lilac focus-visible:ring-offset-2"
        aria-label="View data sources and citations"
      >
        <Info className="h-4 w-4 mr-2" />
        View Sources
      </button>

      {/* Sources Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              ref={drawerRef}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-playfair font-semibold text-charcoal">
                  Data Sources
                </h2>
                <button
                  ref={firstFocusableRef}
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-lilac focus-visible:ring-offset-2"
                  aria-label="Close sources drawer"
                >
                  <X className="h-5 w-5 text-charcoal" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto h-full">
                <div className="space-y-6">
                  {Object.entries(groupedCitations).map(([category, urls]) => (
                    <div key={category} className="space-y-3">
                      <h3 className="font-medium text-charcoal capitalize">
                        {category.replace(/_/g, ' ')}
                      </h3>
                      <div className="space-y-2">
                        {urls.map((url, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                          >
                            <div className="flex items-center space-x-2 flex-1 min-w-0">
                              <div className="text-lilac">
                                {getSourceIcon(url)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-charcoal truncate">
                                  {getSourceLabel(url)}
                                </p>
                                <p className="text-xs text-charcoal/60 truncate">
                                  {url}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2 ml-3">
                              <button
                                onClick={() => copyToClipboard(url)}
                                className="p-1.5 hover:bg-gray-200 rounded transition-colors focus-visible:ring-2 focus-visible:ring-lilac focus-visible:ring-offset-2"
                                aria-label={`Copy ${getSourceLabel(url)} URL to clipboard`}
                              >
                                {copiedUrl === url ? (
                                  <Check className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Copy className="h-4 w-4 text-charcoal/60" />
                                )}
                              </button>
                              <button
                                ref={index === urls.length - 1 ? lastFocusableRef : undefined}
                                onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
                                className="p-1.5 hover:bg-gray-200 rounded transition-colors focus-visible:ring-2 focus-visible:ring-lilac focus-visible:ring-offset-2"
                                aria-label={`Open ${getSourceLabel(url)} in new tab`}
                              >
                                <ExternalLink className="h-4 w-4 text-charcoal/60" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <p className="text-sm text-charcoal/60 text-center">
                    All data is sourced from public platforms and updated manually via the Admin panel.
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
