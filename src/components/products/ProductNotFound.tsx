import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PackageX, ArrowLeft, LayoutDashboard, Search } from 'lucide-react';

interface ProductNotFoundProps {
  productId?: string;
}

export const ProductNotFound: React.FC<ProductNotFoundProps> = ({ productId }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6 p-8 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-2xl backdrop-blur-md">
        {/* Visual Icon Badge */}
        <div className="relative inline-flex">
          <div className="w-20 h-20 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto shadow-inner">
            <PackageX className="w-10 h-10" />
          </div>
          <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-rose-500 text-white shadow-lg">
            404
          </span>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Product Not Found
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            The product with ID{' '}
            <span className="font-mono text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
              #{productId || 'Unknown'}
            </span>{' '}
            does not exist in the DummyJSON catalog or has been removed.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate('/products')}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/30 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Products</span>
          </button>

          <button
            onClick={() => navigate('/products')}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>Search Catalog</span>
          </button>
        </div>
      </div>
    </div>
  );
};
