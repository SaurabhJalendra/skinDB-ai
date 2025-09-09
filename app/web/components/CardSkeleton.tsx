'use client';

export default function CardSkeleton() {
  return (
    <div className="beauty-card animate-pulse">
      {/* Image skeleton */}
      <div className="aspect-square bg-gray-200 rounded-t-2xl" />
      
      {/* Content skeleton */}
      <div className="p-6 space-y-4">
        {/* Brand skeleton */}
        <div className="h-4 bg-gray-200 rounded w-20" />
        
        {/* Name skeleton */}
        <div className="space-y-2">
          <div className="h-5 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
        </div>
        
        {/* Price and rating skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded w-16" />
          <div className="h-6 bg-gray-200 rounded w-20" />
        </div>
        
        {/* Verdict skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
        
        {/* Footer skeleton */}
        <div className="flex items-center justify-between pt-2">
          <div className="h-3 bg-gray-200 rounded w-24" />
          <div className="h-3 bg-gray-200 rounded w-3" />
        </div>
      </div>
    </div>
  );
}
