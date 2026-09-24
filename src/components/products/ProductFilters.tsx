import React, { useState, useEffect } from 'react';
import { Search, X, SlidersHorizontal, Loader2, FilterX } from 'lucide-react';
import { CategoryItem } from '@/types/product';
import { productService } from '@/services/productService';

interface ProductFiltersProps {
  searchQuery: string;
  selectedCategory: string;
  sortBy: string;
  order: 'asc' | 'desc';
  isLoading: boolean;
  isHybrid?: boolean;
  onSearchChange: (q: string) => void;
  onCategoryChange: (category: string) => void;
  onSortChange: (sortBy: string, order: 'asc' | 'desc') => void;
  onResetFilters: () => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  searchQuery,
  selectedCategory,
  sortBy,
  order,
  isLoading,
  isHybrid,
  onSearchChange,
  onCategoryChange,
  onSortChange,
  onResetFilters,
}) => {
  // Local state for smooth 350ms debounced input
  const [localSearch, setLocalSearch] = useState<string>(searchQuery);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(false);

  // Sync external search query (e.g. from URL or reset) to local input
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Load category list on mount
  useEffect(() => {
    let isMounted = true;
    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const data = await productService.getCategories();
        if (isMounted) {
          setCategories(data);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      } finally {
        if (isMounted) {
          setIsLoadingCategories(false);
        }
      }
    };

    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  // 350ms Keystroke Debounce for Real-Time Search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearch !== searchQuery) {
        onSearchChange(localSearch);
      }
    }, 350);

    return () => {
      clearTimeout(handler);
    };
  }, [localSearch, searchQuery, onSearchChange]);

  const currentSortKey = sortBy ? `${sortBy}-${order}` : '';

  const handleSortSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) {
      onSortChange('', 'asc');
      return;
    }
    const [newSortBy, newOrder] = val.split('-');
    onSortChange(newSortBy, newOrder as 'asc' | 'desc');
  };

  const hasActiveFilters = Boolean(
    searchQuery.trim() || (selectedCategory && selectedCategory !== 'all') || sortBy
  );

  const selectedCategoryName =
    categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory;

  return (
    <div className="space-y-3.5">
      {/* Control Bar: Search Input, Category Select, Sort Select */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        {/* Search Input Bar */}
        <div className="sm:col-span-6 lg:col-span-5 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            {isLoading && localSearch ? (
              <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </div>
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search products by title, brand, tag..."
            className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all shadow-inner"
          />
          {localSearch && (
            <button
              onClick={() => {
                setLocalSearch('');
                onSearchChange('');
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Dropdown */}
        <div className="sm:col-span-3 lg:col-span-4 relative">
          <select
            value={selectedCategory || 'all'}
            onChange={(e) => onCategoryChange(e.target.value)}
            disabled={isLoadingCategories}
            className="w-full appearance-none bg-slate-900/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all cursor-pointer capitalize disabled:opacity-50"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.slug} value={cat.slug} className="bg-slate-900 text-slate-200">
                {cat.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Sort Select */}
        <div className="sm:col-span-3 lg:col-span-3 relative">
          <select
            value={currentSortKey}
            onChange={handleSortSelectChange}
            className="w-full appearance-none bg-slate-900/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all cursor-pointer"
          >
            <option value="" className="bg-slate-900 text-slate-200">
              Default Sorting
            </option>
            <option value="title-asc" className="bg-slate-900 text-slate-200">
              Title: A to Z
            </option>
            <option value="title-desc" className="bg-slate-900 text-slate-200">
              Title: Z to A
            </option>
            <option value="price-asc" className="bg-slate-900 text-slate-200">
              Price: Low to High
            </option>
            <option value="price-desc" className="bg-slate-900 text-slate-200">
              Price: High to Low
            </option>
            <option value="rating-desc" className="bg-slate-900 text-slate-200">
              Rating: Highest First
            </option>
            <option value="rating-asc" className="bg-slate-900 text-slate-200">
              Rating: Lowest First
            </option>
          </select>
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
            <span className="text-[10px] text-slate-400">▼</span>
          </div>
        </div>
      </div>

      {/* Active Filter Chips and Reset */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-slate-400 font-medium mr-1">Active filters:</span>

          {/* Search Query Chip */}
          {searchQuery.trim() && (
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-brand-500/10 text-brand-300 border border-brand-500/20">
              <span>Query: &ldquo;{searchQuery}&rdquo;</span>
              <button
                onClick={() => {
                  setLocalSearch('');
                  onSearchChange('');
                }}
                className="hover:text-white transition-colors"
                title="Remove query filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Category Chip */}
          {selectedCategory && selectedCategory !== 'all' && (
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 capitalize">
              <span>Category: {selectedCategoryName}</span>
              <button
                onClick={() => onCategoryChange('all')}
                className="hover:text-white transition-colors"
                title="Remove category filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Sort Chip */}
          {sortBy && (
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20 capitalize">
              <span>
                Sorted by: {sortBy} ({order})
              </span>
              <button
                onClick={() => onSortChange('', 'asc')}
                className="hover:text-white transition-colors"
                title="Reset sorting"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Reset All Button */}
          <button
            onClick={onResetFilters}
            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all ml-auto"
          >
            <FilterX className="w-3.5 h-3.5" />
            <span>Reset All</span>
          </button>
        </div>
      )}
    </div>
  );
};
