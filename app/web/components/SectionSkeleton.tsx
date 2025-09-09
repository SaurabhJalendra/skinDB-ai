'use client';

export default function SectionSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-3">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
      
      {/* Content skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="space-y-3">
              {/* Icon and title */}
              <div className="flex items-center space-x-3">
                <div className="h-6 w-6 bg-gray-200 rounded" />
                <div className="h-5 bg-gray-200 rounded w-24" />
              </div>
              
              {/* Content lines */}
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
              
              {/* Footer */}
              <div className="flex items-center justify-between pt-2">
                <div className="h-3 bg-gray-200 rounded w-20" />
                <div className="h-3 bg-gray-200 rounded w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
