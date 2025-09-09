'use client';

import { Search } from 'lucide-react';

export default function NavBar() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-white/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="font-playfair text-2xl font-bold text-charcoal">
              Prism
            </h1>
          </div>

          {/* Search Input */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search luxury beauty products..."
                className="beauty-input w-full pl-10 pr-4 bg-white/90 backdrop-blur-sm focus-visible:ring-2 focus-visible:ring-lilac focus-visible:ring-offset-2"
                disabled
                title="Search functionality will be implemented in Phase 6"
              />
            </div>
          </div>

          {/* Right side - placeholder for future features */}
          <div className="flex items-center space-x-4">
            {/* Placeholder for user menu, notifications, etc. */}
          </div>
        </div>
      </div>
    </nav>
  );
}
