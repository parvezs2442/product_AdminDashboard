import React from 'react';
import { ProductReview } from '@/types/product';
import { Star, MessageSquare, CheckCircle, User } from 'lucide-react';

interface ProductReviewsProps {
  reviews?: ProductReview[];
  averageRating: number;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({
  reviews = [],
  averageRating,
}) => {
  // Calculate distribution breakdown (5 to 1)
  const totalReviews = reviews.length;
  const ratingDistribution = [5, 4, 3, 2, 1].map((score) => {
    const count = reviews.filter((r) => Math.round(r.rating) === score).length;
    const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    return { score, count, percentage };
  });

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center space-x-2 pb-4 border-b border-slate-800">
        <MessageSquare className="w-5 h-5 text-brand-400" />
        <h2 className="text-xl font-bold text-white">Customer Reviews</h2>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
          {totalReviews}
        </span>
      </div>

      {/* Rating Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
        {/* Left: Score & Star Display */}
        <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-4 border-b md:border-b-0 md:border-r border-slate-800">
          <span className="text-5xl font-extrabold text-white font-mono">
            {averageRating.toFixed(1)}
          </span>
          <div className="flex items-center space-x-1 my-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.round(averageRating)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-slate-700'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-slate-400">
            Based on {totalReviews} verified {totalReviews === 1 ? 'review' : 'reviews'}
          </span>
        </div>

        {/* Right: Distribution Bars */}
        <div className="md:col-span-8 flex flex-col justify-center space-y-2.5">
          {ratingDistribution.map(({ score, count, percentage }) => (
            <div key={score} className="flex items-center space-x-3 text-xs">
              <span className="w-12 text-slate-400 flex items-center space-x-1 font-mono">
                <span>{score}</span>
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              </span>
              <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-brand-500 transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-12 text-right text-slate-400 font-mono">
                {count} ({percentage}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Review Cards List */}
      {reviews.length === 0 ? (
        <div className="text-center py-10 bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 text-sm">
          No customer reviews for this product yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((rev, idx) => (
            <div
              key={`${rev.reviewerEmail}-${idx}`}
              className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-colors shadow-md"
            >
              {/* Header: User info & Rating */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow">
                    {rev.reviewerName?.charAt(0)?.toUpperCase() || <User className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-sm font-semibold text-white">
                        {rev.reviewerName}
                      </span>
                      <span title="Verified Customer" className="inline-flex">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {rev.reviewerEmail}
                    </span>
                  </div>
                </div>

                {/* Star rating */}
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3.5 h-3.5 ${
                        star <= rev.rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Review Comment */}
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                &ldquo;{rev.comment}&rdquo;
              </p>

              {/* Review Date */}
              <div className="pt-2 border-t border-slate-800/60 text-[11px] text-slate-500 font-mono">
                Reviewed on {formatDate(rev.date)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
