"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { X, GitCompare } from 'lucide-react';

interface CompareBarProps {
  selectedCount: number;
  onClear: () => void;
  onCompare: () => void;
}

export default function CompareBar({ selectedCount, onClear, onCompare }: CompareBarProps) {
  // const router = useRouter(); // Commented out - not used yet

  // Handle ESC key to dismiss
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClear();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClear]);

  if (selectedCount === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
      >
        <div className="bg-white/95 backdrop-blur-md border border-charcoal/20 rounded-2xl shadow-lg px-6 py-4 flex items-center gap-4">
          {/* Icon */}
          <div className="flex items-center justify-center w-8 h-8 bg-lilac/20 rounded-full">
            <GitCompare className="w-4 h-4 text-lilac" />
          </div>

          {/* Count */}
          <div className="text-sm font-medium text-charcoal">
            {selectedCount} product{selectedCount !== 1 ? 's' : ''} selected
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onCompare}
              disabled={selectedCount < 2}
              className="px-4 py-2 bg-lilac text-white rounded-lg font-medium text-sm hover:bg-lilac/90 disabled:bg-charcoal/20 disabled:text-charcoal/50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-lilac/50"
            >
              Compare ({selectedCount})
            </button>
            
            <button
              onClick={onClear}
              className="p-2 text-charcoal/60 hover:text-charcoal hover:bg-charcoal/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-lilac/50"
              aria-label="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

