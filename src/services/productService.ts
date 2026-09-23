import apiClient from '@/lib/axios';
import { Product, ProductsResponse, ProductQueryParams, CategoryItem } from '@/types/product';

/**
 * Product API service handling all product data operations.
 * Fully decoupled from UI components.
 * 
 * DESIGN DECISION: Assignment Edge-Case Solution
 * DummyJSON does not natively support combining search queries (GET /products/search?q=...)
 * with category filters (GET /products/category/:category).
 * When both are present, productService triggers an intelligent hybrid pipeline:
 * fetches all products within the category and performs real-time client-side search,
 * sorting, and pagination while marking the response with `isHybrid: true`.
 */
export const productService = {
  /**
   * Fetch products with support for pagination, search, category filter, sorting,
   * race condition cancellation (signal), and hybrid dual-filter processing.
   */
  async getProducts(params?: ProductQueryParams, signal?: AbortSignal): Promise<ProductsResponse> {
    const hasCategory = Boolean(params?.category && params.category !== 'all');
    const hasSearch = Boolean(params?.q && params.q.trim().length > 0);
    const limit = params?.limit ?? 10;
    const skip = params?.skip ?? 0;
    const sortBy = params?.sortBy;
    const order = params?.order ?? 'asc';

    // 1. HYBRID PIPELINE: Both Category AND Search query are present
    if (hasCategory && hasSearch) {
      const categorySlug = encodeURIComponent(params!.category!);
      const query = params!.q!.trim().toLowerCase();

      // Fetch all products in the selected category
      const response = await apiClient.get<ProductsResponse>(
        `/products/category/${categorySlug}`,
        {
          params: { limit: 0 },
          signal,
        }
      );

      const allCategoryProducts = response.data.products || [];

      // Perform client-side multi-field fuzzy search
      let filtered = allCategoryProducts.filter((product: Product) => {
        const titleMatch = product.title?.toLowerCase().includes(query);
        const descMatch = product.description?.toLowerCase().includes(query);
        const brandMatch = product.brand?.toLowerCase().includes(query);
        const tagMatch = product.tags?.some((t) => t.toLowerCase().includes(query));
        return titleMatch || descMatch || brandMatch || tagMatch;
      });

      // Apply sorting if requested
      if (sortBy) {
        filtered.sort((a: any, b: any) => {
          const valA = a[sortBy];
          const valB = b[sortBy];
          if (typeof valA === 'string' && typeof valB === 'string') {
            return order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
          }
          const numA = Number(valA) || 0;
          const numB = Number(valB) || 0;
          return order === 'asc' ? numA - numB : numB - numA;
        });
      }

      // Apply pagination slice
      const paginatedProducts = filtered.slice(skip, skip + limit);

      return {
        products: paginatedProducts,
        total: filtered.length,
        skip,
        limit,
        isHybrid: true,
      };
    }

    // 2. CATEGORY ONLY
    if (hasCategory) {
      const categorySlug = encodeURIComponent(params!.category!);
      const queryParams: Record<string, any> = { limit, skip };
      if (sortBy) {
        queryParams.sortBy = sortBy;
        queryParams.order = order;
      }

      const response = await apiClient.get<ProductsResponse>(
        `/products/category/${categorySlug}`,
        { params: queryParams, signal }
      );
      return response.data;
    }

    // 3. SEARCH ONLY
    if (hasSearch) {
      const queryParams: Record<string, any> = {
        q: params!.q!.trim(),
        limit,
        skip,
      };
      if (sortBy) {
        queryParams.sortBy = sortBy;
        queryParams.order = order;
      }

      const response = await apiClient.get<ProductsResponse>('/products/search', {
        params: queryParams,
        signal,
      });
      return response.data;
    }

    // 4. STANDARD PRODUCT CATALOG (Default / Sorting / Pagination)
    const queryParams: Record<string, any> = { limit, skip };
    if (sortBy) {
      queryParams.sortBy = sortBy;
      queryParams.order = order;
    }

    const response = await apiClient.get<ProductsResponse>('/products', {
      params: queryParams,
      signal,
    });
    return response.data;
  },

  /**
   * Fetch single product by ID
   */
  async getProductById(id: string | number, signal?: AbortSignal): Promise<Product> {
    const response = await apiClient.get<Product>(`/products/${id}`, { signal });
    return response.data;
  },

  /**
   * Fetch and normalize product categories
   */
  async getCategories(signal?: AbortSignal): Promise<CategoryItem[]> {
    const response = await apiClient.get<any[]>('/products/categories', { signal });
    const rawData = response.data || [];

    return rawData.map((item: any) => {
      if (typeof item === 'string') {
        const readableName = item
          .split('-')
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        return { slug: item, name: readableName };
      }
      return {
        slug: item.slug,
        name: item.name || item.slug,
        url: item.url,
      };
    });
  },
};
