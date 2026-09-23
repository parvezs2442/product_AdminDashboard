import React from 'react';
import { PackageOpen, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No products found',
  description = 'Try adjusting your search query, clearing filters, or switching pages.',
  actionText,
  onAction,
}) => {
  return (
    <div className="py-16 px-4 flex flex-col items-center justify-center text-center bg-slate-900/40 border border-slate-800 rounded-2xl backdrop-blur-sm my-6">
      <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
        <PackageOpen className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 max-w-md mb-6">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-brand-400 hover:text-white bg-brand-500/10 hover:bg-brand-600 border border-brand-500/20 hover:border-transparent px-4 py-2 rounded-xl transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};
