import React from 'react';

interface ProductSkeletonProps {
  count?: number;
}

export const ProductSkeleton: React.FC<ProductSkeletonProps> = ({ count = 8 }) => {
  return (
    <div>
      {/* Desktop Table Skeleton */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
        <div className="h-12 bg-slate-800/60 border-b border-slate-800 flex items-center px-6">
          <div className="w-1/4 h-4 bg-slate-700/50 rounded animate-pulse" />
        </div>
        <div className="divide-y divide-slate-800/60">
          {Array.from({ length: count }).map((_, idx) => (
            <div key={idx} className="p-4 px-6 flex items-center justify-between animate-pulse">
              {/* Product Info */}
              <div className="flex items-center space-x-4 w-2/5">
                <div className="w-12 h-12 bg-slate-800 rounded-xl shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-800 rounded w-4/5" />
                  <div className="h-3 bg-slate-800/60 rounded w-2/5" />
                </div>
              </div>
              {/* Category */}
              <div className="w-1/6">
                <div className="h-5 bg-slate-800 rounded-full w-20" />
              </div>
              {/* Price */}
              <div className="w-1/6">
                <div className="h-4 bg-slate-800 rounded w-16" />
              </div>
              {/* Rating */}
              <div className="w-1/6">
                <div className="h-4 bg-slate-800 rounded w-14" />
              </div>
              {/* Stock */}
              <div className="w-1/12 text-right">
                <div className="h-5 bg-slate-800 rounded-full w-16 ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Cards Skeleton */}
      <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 animate-pulse space-y-3"
          >
            <div className="h-40 bg-slate-800 rounded-xl w-full" />
            <div className="h-4 bg-slate-800 rounded w-3/4" />
            <div className="flex justify-between items-center">
              <div className="h-4 bg-slate-800 rounded w-1/4" />
              <div className="h-4 bg-slate-800 rounded w-1/4" />
            </div>
            <div className="flex justify-between items-center pt-2">
              <div className="h-5 bg-slate-800 rounded-full w-20" />
              <div className="h-5 bg-slate-800 rounded-full w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
