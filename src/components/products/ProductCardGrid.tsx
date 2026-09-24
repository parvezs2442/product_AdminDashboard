import React from 'react';
import { Product } from '@/types/product';
import { Star, Package, Check, AlertTriangle, XCircle, Pencil, Trash2 } from 'lucide-react';

interface ProductCardGridProps {
  products: Product[];
  onSelectProduct?: (product: Product) => void;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (product: Product) => void;
}

export const ProductCardGrid: React.FC<ProductCardGridProps> = ({
  products,
  onSelectProduct,
  onEditProduct,
  onDeleteProduct,
}) => {
  const getStockBadge = (stock: number) => {
    if (stock <= 0) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <XCircle className="w-3 h-3 mr-1" />
          Out of Stock
        </span>
      );
    }
    if (stock <= 10) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <AlertTriangle className="w-3 h-3 mr-1" />
          {stock} left
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <Check className="w-3 h-3 mr-1" />
        {stock} in stock
      </span>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {products.map((product) => (
        <div
          key={product.id}
          onClick={() => onSelectProduct?.(product)}
          className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 flex flex-col justify-between hover:border-slate-700 transition-all duration-200 cursor-pointer shadow-lg active:scale-[0.99] group"
        >
          {/* Card Top: Image & Category */}
          <div>
            <div className="relative w-full h-44 rounded-xl bg-slate-800 border border-slate-700/60 overflow-hidden mb-3.5 flex items-center justify-center">
              {product.thumbnail ? (
                <img
                  src={product.thumbnail}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              ) : (
                <Package className="w-8 h-8 text-slate-500" />
              )}
              {/* Category Floating Badge */}
              <div className="absolute top-2.5 left-2.5">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-900/90 text-brand-300 border border-slate-700 backdrop-blur-md capitalize">
                  {product.category}
                </span>
              </div>
              {/* Discount Tag */}
              {product.discountPercentage > 0 && (
                <div className="absolute top-2.5 right-2.5">
                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500 text-slate-950 shadow-sm">
                    -{Math.round(product.discountPercentage)}%
                  </span>
                </div>
              )}
            </div>

            {/* Title & Brand */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-white text-base line-clamp-1 group-hover:text-brand-400 transition-colors">
                  {product.title}
                </h3>
                {product.brand && (
                  <p className="text-xs text-slate-400 mt-0.5 truncate">
                    by <span className="text-slate-300">{product.brand}</span>
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-1 shrink-0">
                {onEditProduct && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditProduct(product);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-brand-400 hover:bg-slate-800 transition-colors"
                    title="Edit product"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                )}
                {onDeleteProduct && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteProduct(product);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    title="Delete product"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Card Bottom: Price, Rating & Stock */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-white font-mono">
                ${product.price.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="text-xs font-bold text-slate-200 font-mono">
                  {product.rating.toFixed(1)}
                </span>
              </div>
              {getStockBadge(product.stock)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
