import React from 'react';

export const ProductDetailSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center space-x-2">
        <div className="w-16 h-4 bg-slate-800 rounded"></div>
        <div className="w-4 h-4 bg-slate-800 rounded"></div>
        <div className="w-24 h-4 bg-slate-800 rounded"></div>
        <div className="w-4 h-4 bg-slate-800 rounded"></div>
        <div className="w-36 h-4 bg-slate-800 rounded"></div>
      </div>

      {/* Main Grid: Gallery & Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Gallery Skeleton */}
        <div className="lg:col-span-5 space-y-4">
          <div className="w-full aspect-square rounded-2xl bg-slate-900 border border-slate-800"></div>
          <div className="flex space-x-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-800"></div>
            ))}
          </div>
        </div>

        {/* Right Column: Info & Specs Skeleton */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center space-x-2">
            <div className="w-24 h-6 rounded-lg bg-slate-800"></div>
            <div className="w-20 h-6 rounded-lg bg-slate-800"></div>
          </div>

          <div className="space-y-2">
            <div className="w-3/4 h-8 rounded-lg bg-slate-800"></div>
            <div className="w-1/2 h-5 rounded-lg bg-slate-800"></div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-32 h-10 rounded-xl bg-slate-800"></div>
            <div className="w-20 h-6 rounded-lg bg-slate-800"></div>
          </div>

          <div className="space-y-2">
            <div className="w-full h-4 rounded bg-slate-800"></div>
            <div className="w-5/6 h-4 rounded bg-slate-800"></div>
            <div className="w-4/6 h-4 rounded bg-slate-800"></div>
          </div>

          {/* Specs Grid Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="w-16 h-3 rounded bg-slate-800"></div>
                <div className="w-24 h-4 rounded bg-slate-800"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews Section Skeleton */}
      <div className="pt-8 border-t border-slate-800 space-y-4">
        <div className="w-48 h-6 rounded bg-slate-800"></div>
        <div className="w-full h-32 rounded-2xl bg-slate-900 border border-slate-800"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-36 rounded-2xl bg-slate-900 border border-slate-800"></div>
          <div className="h-36 rounded-2xl bg-slate-900 border border-slate-800"></div>
        </div>
      </div>
    </div>
  );
};
