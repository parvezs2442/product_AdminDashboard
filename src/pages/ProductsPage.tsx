import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Navbar } from '@/components/Navbar';
import { ProductFilters } from '@/components/products/ProductFilters';
import { ProductTable } from '@/components/products/ProductTable';
import { ProductCardGrid } from '@/components/products/ProductCardGrid';
import { Pagination } from '@/components/products/Pagination';
import { ProductSkeleton } from '@/components/products/ProductSkeleton';
import { ProductFormModal } from '@/components/products/ProductFormModal';
import { ConfirmDeleteModal } from '@/components/products/ConfirmDeleteModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { productService } from '@/services/productService';
import { productOverlay } from '@/services/productOverlay';
import { useToast } from '@/context/ToastContext';
import { Product, CategoryItem } from '@/types/product';
import { Package, RefreshCw, Zap, Plus, RotateCcw, Clock } from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();

  // URL State Parsing (Bidirectional sync with defensive fallback)
  const rawPage = parseInt(searchParams.get('page') || '1', 10);
  const currentPage = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

  const rawLimit = parseInt(searchParams.get('limit') || '10', 10);
  const currentLimit = [10, 20, 50].includes(rawLimit) ? rawLimit : 10;

  const rawDelay = parseInt(searchParams.get('delay') || '0', 10);
  const currentDelay = isNaN(rawDelay) || rawDelay < 0 ? 0 : rawDelay;

  const searchQuery = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('category') || '';
  const sortBy = searchParams.get('sortBy') || '';
  const order = (searchParams.get('order') === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc';

  // Data & UI states
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isHybrid, setIsHybrid] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // CRUD Modals state
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Overlay state indicator
  const [hasModifications, setHasModifications] = useState<boolean>(
    productOverlay.hasOverlayModifications()
  );

  // Race condition protection: Abort in-flight requests on quick user actions
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load categories for modals
  useEffect(() => {
    let mounted = true;
    productService.getCategories().then((cats) => {
      if (mounted) setCategories(cats);
    });
    return () => {
      mounted = false;
    };
  }, []);

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
          delay: currentDelay > 0 ? currentDelay : undefined,
        },
        controller.signal
      );

      // Verify that this is still the active controller before committing state
      if (abortControllerRef.current === controller) {
        setProducts(data.products || []);
        setTotal(data.total || 0);
        setIsHybrid(Boolean(data.isHybrid));
        setHasModifications(productOverlay.hasOverlayModifications());
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
  }, [currentPage, currentLimit, searchQuery, selectedCategory, sortBy, order, currentDelay]);

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

  // Defensive URL Clamping: Auto-adjust if page exceeds available pages (e.g. ?page=999)
  useEffect(() => {
    if (total > 0) {
      const maxPage = Math.max(1, Math.ceil(total / currentLimit));
      if (currentPage > maxPage) {
        const params = new URLSearchParams(searchParams);
        params.set('page', maxPage.toString());
        setSearchParams(params, { replace: true });
      }
    }
  }, [total, currentLimit, currentPage, searchParams, setSearchParams]);

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

  // Toggle artificial network latency (&delay=2000) for race condition evaluation
  const handleToggleDelay = () => {
    const params = new URLSearchParams(searchParams);
    if (currentDelay > 0) {
      params.delete('delay');
      toast.info('Latency simulation removed', 'Normal API response speed restored.');
    } else {
      params.set('delay', '2000');
      toast.info('Latency simulation active', 'All requests delayed by 2000ms. Test rapid typing in search!');
    }
    setSearchParams(params);
  };

  // Connection to Stage 4: Product detail view
  const handleSelectProduct = (product: Product) => {
    navigate(`/products/${product.id}`);
  };

  // CRUD Trigger Handlers
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleOpenDelete = (product: Product) => {
    setDeletingProduct(product);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = async (formData: Partial<Product>) => {
    if (editingProduct) {
      // Edit mode
      await productService.updateProduct(editingProduct.id, formData);
      toast.success('Product updated', `"${formData.title}" was successfully updated.`);
    } else {
      // Add mode
      const created = await productService.addProduct(formData);
      toast.success('Product created', `"${created.title}" was added to catalog.`);
    }
    setHasModifications(true);
    fetchProducts();
  };

  const handleConfirmDelete = async (id: number) => {
    const targetTitle = deletingProduct?.title || 'Product';
    await productService.deleteProduct(id);
    toast.success('Product deleted', `"${targetTitle}" was removed from catalog.`);
    setHasModifications(true);
    fetchProducts();
  };

  const handleResetDemoData = () => {
    productOverlay.resetOverlay();
    setHasModifications(false);
    toast.info('Demo data restored', 'Original DummyJSON product catalog reset.');
    fetchProducts();
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
                Stage 5: CRUD Ready
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Full CRUD management with validation, race-condition protection, and client persistence simulation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Race Condition Latency Simulation Toggle */}
            <button
              onClick={handleToggleDelay}
              className={`inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                currentDelay > 0
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 ring-1 ring-amber-500/30 shadow-md shadow-amber-500/10'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-700/80'
              }`}
              title="Toggle &delay=2000 in API requests to evaluate rapid typing race condition protection"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{currentDelay > 0 ? 'Latency: 2000ms (Active)' : 'Test &delay=2000'}</span>
            </button>

            {/* Reset Demo Data button if changes made */}
            {hasModifications && (
              <button
                onClick={handleResetDemoData}
                className="inline-flex items-center space-x-1.5 text-xs font-medium text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 px-3 py-2 rounded-xl transition-all cursor-pointer"
                title="Reset simulated overlay to original DummyJSON data"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo Data</span>
              </button>
            )}

            {/* Refresh Button */}
            <button
              onClick={fetchProducts}
              disabled={isLoading}
              className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 px-3.5 py-2 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
              title="Refresh product list"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            {/* Primary Add Product Button */}
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center space-x-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-500 px-4 py-2 rounded-xl shadow-lg shadow-brand-600/30 transition-all cursor-pointer"
              title="Create a new product"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
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
              actionText={hasActiveFilters ? 'Clear All Filters' : 'Add First Product'}
              onAction={hasActiveFilters ? handleResetFilters : handleOpenAdd}
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
                  onEditProduct={handleOpenEdit}
                  onDeleteProduct={handleOpenDelete}
                />
              </div>

              {/* Mobile Cards View */}
              <div className="md:hidden">
                <ProductCardGrid
                  products={products}
                  onSelectProduct={handleSelectProduct}
                  onEditProduct={handleOpenEdit}
                  onDeleteProduct={handleOpenDelete}
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

      {/* Product Form Modal (Add / Edit) */}
      <ProductFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingProduct}
        categories={categories}
      />

      {/* Confirm Delete Danger Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        product={deletingProduct}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

