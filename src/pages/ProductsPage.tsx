import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Navbar } from '@/components/Navbar';
import { ProductFilters } from '@/components/products/ProductFilters';
import { ProductTable } from '@/components/products/ProductTable';
import { ProductCardGrid } from '@/components/products/ProductCardGrid';
import { Pagination } from '@/components/products/Pagination';
import { ProductSkeleton } from '@/components/products/ProductSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { productService } from '@/services/productService';
import { Product } from '@/types/product';
import { Package, RefreshCw, Zap } from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // URL State Parsing (Bidirectional sync with defensive fallback)
  const rawPage = parseInt(searchParams.get('page') || '1', 10);
  const currentPage = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

  const rawLimit = parseInt(searchParams.get('limit') || '10', 10);
  const currentLimit = [10, 20, 50].includes(rawLimit) ? rawLimit : 10;

  const searchQuery = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('category') || '';
  const sortBy = searchParams.get('sortBy') || '';
  const order = (searchParams.get('order') === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc';

  // Data & UI states
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isHybrid, setIsHybrid] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Race condition protection: Abort in-flight requests on quick user actions
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch products with real-time cancellation
  const fetchProducts = useCallback(async () => {
    // 1. Abort previous in-flight request if user typed fast or changed filters
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const skip = (currentPage - 1) * currentLimit;
      const data = await productService.getProducts(
        {
          limit: currentLimit,
          skip,
          q: searchQuery,
          category: selectedCategory,
          sortBy: sortBy || undefined,
          order,
        },
        controller.signal
      );

      // Verify that this is still the active controller before committing state
      if (abortControllerRef.current === controller) {
        setProducts(data.products || []);
        setTotal(data.total || 0);
        setIsHybrid(Boolean(data.isHybrid));
      }
    } catch (err: any) {
      // Gracefully ignore requests canceled by AbortController
      if (
        axios.isCancel(err) ||
        err?.name === 'CanceledError' ||
        err?.code === 'ERR_CANCELED'
      ) {
        return;
      }
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Unable to load products. Please check your connection and try again.';
      setErrorMessage(message);
    } finally {
      if (abortControllerRef.current === controller) {
        setIsLoading(false);
      }
    }
  }, [currentPage, currentLimit, searchQuery, selectedCategory, sortBy, order]);

  useEffect(() => {
    fetchProducts();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchProducts]);

  // URL-synced Filter Handlers (Resets page to 1 on filter alteration)
  const handleSearchChange = useCallback(
    (newQ: string) => {
      const params = new URLSearchParams(searchParams);
      if (newQ.trim()) {
        params.set('q', newQ.trim());
      } else {
        params.delete('q');
      }
      params.set('page', '1');
      setSearchParams(params);
    },
    [searchParams, setSearchParams]
  );

  const handleCategoryChange = useCallback(
    (newCategory: string) => {
      const params = new URLSearchParams(searchParams);
      if (newCategory && newCategory !== 'all') {
        params.set('category', newCategory);
      } else {
        params.delete('category');
      }
      params.set('page', '1');
      setSearchParams(params);
    },
    [searchParams, setSearchParams]
  );

  const handleSortChange = useCallback(
    (newSortBy: string, newOrder: 'asc' | 'desc') => {
      const params = new URLSearchParams(searchParams);
      if (newSortBy) {
        params.set('sortBy', newSortBy);
        params.set('order', newOrder);
      } else {
        params.delete('sortBy');
        params.delete('order');
      }
      params.set('page', '1');
      setSearchParams(params);
    },
    [searchParams, setSearchParams]
  );

  const handleResetFilters = useCallback(() => {
    const params = new URLSearchParams();
    params.set('page', '1');
    params.set('limit', currentLimit.toString());
    setSearchParams(params);
  }, [currentLimit, setSearchParams]);

  // Page navigation handlers
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLimitChange = (newLimit: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    params.set('limit', newLimit.toString());
    setSearchParams(params);
  };

  // Connection to Stage 4: Product detail view
  const handleSelectProduct = (product: Product) => {
    navigate(`/products/${product.id}`);
  };

  const hasActiveFilters = Boolean(
    searchQuery.trim() || (selectedCategory && selectedCategory !== 'all') || sortBy
  );

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
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center space-x-1">
                <Zap className="w-3 h-3 mr-1" />
                Stage 3
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Real-time search, category filtering & multi-field sorting with race-condition protection.
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

        {/* Stage 3 Controls: Search Bar, Category Dropdown, Sort Controls, Hybrid Banner */}
        <div className="mt-6 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 sm:p-5">
          <ProductFilters
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            sortBy={sortBy}
            order={order}
            isLoading={isLoading}
            isHybrid={isHybrid}
            onSearchChange={handleSearchChange}
            onCategoryChange={handleCategoryChange}
            onSortChange={handleSortChange}
            onResetFilters={handleResetFilters}
          />
        </div>

        {/* Content Body: Loading / Error / Empty / Table & Cards */}
        <div className="mt-6">
          {isLoading && products.length === 0 ? (
            <ProductSkeleton count={currentLimit} />
          ) : errorMessage ? (
            <ErrorState message={errorMessage} onRetry={fetchProducts} />
          ) : products.length === 0 ? (
            <EmptyState
              title={hasActiveFilters ? 'No matching products found' : 'No products available'}
              description={
                hasActiveFilters
                  ? 'No products matched your search or filter criteria. Try adjusting your search term or clearing filters.'
                  : 'No products are currently available on this page.'
              }
              actionText={hasActiveFilters ? 'Clear All Filters' : 'Go to Page 1'}
              onAction={hasActiveFilters ? handleResetFilters : () => handlePageChange(1)}
            />
          ) : (
            <div className="space-y-6">
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <ProductTable
                  products={products}
                  sortBy={sortBy}
                  order={order}
                  onSortChange={handleSortChange}
                  onSelectProduct={handleSelectProduct}
                />
              </div>

              {/* Mobile Cards View */}
              <div className="md:hidden">
                <ProductCardGrid
                  products={products}
                  onSelectProduct={handleSelectProduct}
                />
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

