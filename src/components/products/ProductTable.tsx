import React from 'react';
import { Product } from '@/types/product';
import { Star, Package, Check, AlertTriangle, XCircle } from 'lucide-react';

interface ProductTableProps {
  products: Product[];
  onSelectProduct?: (product: Product) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onSelectProduct,
}) => {
  const getStockBadge = (stock: number) => {
    if (stock <= 0) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <XCircle className="w-3 h-3 mr-1" />
          Out of Stock
        </span>
      );
    }
    if (stock <= 10) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <AlertTriangle className="w-3 h-3 mr-1" />
          {stock} left
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <Check className="w-3 h-3 mr-1" />
        {stock} in stock
      </span>
    );
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl backdrop-blur-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-900/90 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <th className="py-3.5 px-6">Product</th>
            <th className="py-3.5 px-6">Category</th>
            <th className="py-3.5 px-6">Price</th>
            <th className="py-3.5 px-6">Rating</th>
            <th className="py-3.5 px-6 text-right">Stock</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 text-sm">
          {products.map((product) => (
            <tr
              key={product.id}
              onClick={() => onSelectProduct?.(product)}
              className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
            >
              {/* Product Info & Thumbnail */}
              <td className="py-4 px-6">
                <div className="flex items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700/60 overflow-hidden shrink-0 flex items-center justify-center relative">
                    {product.thumbnail ? (
                      <img
                        src={product.thumbnail}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          // Fallback to placeholder icon
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <Package className="w-5 h-5 text-slate-500" />
                    )}
                  </div>
                  <div className="min-w-0 max-w-xs sm:max-w-md">
                    <p className="font-semibold text-white truncate group-hover:text-brand-400 transition-colors">
                      {product.title}
                    </p>
                    {product.brand && (
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        Brand: <span className="text-slate-300">{product.brand}</span>
                      </p>
                    )}
                  </div>
                </div>
              </td>

              {/* Category */}
              <td className="py-4 px-6 whitespace-nowrap">
                <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-brand-300 border border-slate-700/60 capitalize">
                  {product.category}
                </span>
              </td>

              {/* Price */}
              <td className="py-4 px-6 whitespace-nowrap">
                <div className="flex items-baseline space-x-2">
                  <span className="text-base font-bold text-white font-mono">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.discountPercentage > 0 && (
                    <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      -{Math.round(product.discountPercentage)}%
                    </span>
                  )}
                </div>
              </td>

              {/* Rating */}
              <td className="py-4 px-6 whitespace-nowrap">
                <div className="flex items-center space-x-1.5">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-xs font-bold text-slate-200 font-mono">
                    {product.rating.toFixed(1)}
                  </span>
                  <span className="text-[10px] text-slate-500">/ 5</span>
                </div>
              </td>

              {/* Stock */}
              <td className="py-4 px-6 whitespace-nowrap text-right">
                {getStockBadge(product.stock)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
