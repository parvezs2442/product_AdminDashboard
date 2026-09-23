import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { ProductTable } from '@/components/products/ProductTable';
import { ProductCardGrid } from '@/components/products/ProductCardGrid';
import { Pagination } from '@/components/products/Pagination';
import { ProductSkeleton } from '@/components/products/ProductSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { productService } from '@/services/productService';
import { Product } from '@/types/product';
import { Package, RefreshCw } from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Defensive URL Parsing: prevents ?page=abc or invalid numbers from crashing
  const rawPage = parseInt(searchParams.get('page') || '1', 10);
  const currentPage = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

  const rawLimit = parseInt(searchParams.get('limit') || '10', 10);
  const currentLimit = [10, 20, 50].includes(rawLimit) ? rawLimit : 10;

  // Local state
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch products with pagination
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const skip = (currentPage - 1) * currentLimit;
      const data = await productService.getProducts({
        limit: currentLimit,
        skip,
      });

      setProducts(data.products || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Unable to load product list. Please check your connection and try again.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, currentLimit]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Page navigation handlers (URL synced)
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    params.set('limit', currentLimit.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLimitChange = (newLimit: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1'); // Reset to page 1 on limit change
    params.set('limit', newLimit.toString());
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100 selection:bg-brand-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Title & Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
                <Package className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Products Catalog
              </h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
                Stage 2
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Browse products loaded dynamically with custom pagination.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchProducts}
              disabled={isLoading}
              className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 px-3.5 py-2 rounded-xl transition-all disabled:opacity-50"
              title="Refresh product list"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Content Body: Loading / Error / Empty / Table & Cards */}
        <div className="mt-6">
          {isLoading ? (
            <ProductSkeleton count={currentLimit} />
          ) : errorMessage ? (
            <ErrorState message={errorMessage} onRetry={fetchProducts} />
          ) : products.length === 0 ? (
            <EmptyState
              title="No products available"
              description="No products matched your request on this page."
              actionText="Go to Page 1"
              onAction={() => handlePageChange(1)}
            />
          ) : (
            <div className="space-y-6">
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <ProductTable products={products} />
              </div>

              {/* Mobile Cards View */}
              <div className="md:hidden">
                <ProductCardGrid products={products} />
              </div>

              {/* Handcrafted Custom Pagination */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl px-4">
                <Pagination
                  currentPage={currentPage}
                  total={total}
                  limit={currentLimit}
                  onPageChange={handlePageChange}
                  onLimitChange={handleLimitChange}
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
