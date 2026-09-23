import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Failed to load data from server. Please check your connection.',
  onRetry,
}) => {
  return (
    <div className="py-16 px-4 flex flex-col items-center justify-center text-center bg-slate-900/50 border border-rose-500/20 rounded-2xl backdrop-blur-sm my-6">
      <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 shadow-lg shadow-rose-500/10">
        <AlertTriangle className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">Something went wrong</h3>
      <p className="text-sm text-slate-400 max-w-md mb-6">{message}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center space-x-2 text-sm font-semibold text-white bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 px-5 py-2.5 rounded-xl shadow-lg shadow-rose-500/20 transition-all active:scale-95 cursor-pointer"
        id="retry-button"
      >
        <RotateCcw className="w-4 h-4" />
        <span>Try Again</span>
      </button>
    </div>
  );
};
