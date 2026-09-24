import apiClient from '@/lib/axios';
import { Product, ProductsResponse, ProductQueryParams, CategoryItem } from '@/types/product';
import { productOverlay } from './productOverlay';

/**
 * Product API service handling all product data operations.
 * Fully decoupled from UI components.
 * 
 * DESIGN DECISION: Assignment Edge-Case Solutions
 * 1. Hybrid Pipeline:
 *    DummyJSON does not natively support combining search queries (GET /products/search?q=...)
 *    with category filters (GET /products/category/:category).
 *    When both are present, productService triggers an intelligent hybrid pipeline.
 * 2. Mutation Persistence:
 *    DummyJSON mutations (POST/PUT/DELETE) do not actually persist on the remote server.
 *    ProductService merges a local state overlay layer (productOverlay) so added,
 *    updated, and deleted products persist across search, pagination, and refreshes.
 */
export const productService = {
  /**
   * Fetch products with support for pagination, search, category filter, sorting,
   * race condition cancellation (signal), hybrid dual-filter, and local state overlay.
   */
  async getProducts(params?: ProductQueryParams, signal?: AbortSignal): Promise<ProductsResponse> {
    const hasCategory = Boolean(params?.category && params.category !== 'all');
    const hasSearch = Boolean(params?.q && params.q.trim().length > 0);
    const limit = params?.limit ?? 10;
    const skip = params?.skip ?? 0;
    const sortBy = params?.sortBy;
    const order = params?.order ?? 'asc';

    let rawResponse: ProductsResponse;
    let isHybrid = false;

    // 1. HYBRID PIPELINE: Both Category AND Search query are present
    if (hasCategory && hasSearch) {
      isHybrid = true;
      const categorySlug = encodeURIComponent(params!.category!);
      const query = params!.q!.trim().toLowerCase();

      // Fetch all products in the selected category
      const response = await apiClient.get<ProductsResponse>(
        `/products/category/${categorySlug}`,
        {
          params: { limit: 0, ...(params?.delay ? { delay: params.delay } : {}) },
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

      rawResponse = {
        products: filtered,
        total: filtered.length,
        skip,
        limit,
        isHybrid: true,
      };
    }
    // 2. CATEGORY ONLY
    else if (hasCategory) {
      const categorySlug = encodeURIComponent(params!.category!);
      const queryParams: Record<string, any> = { limit, skip };
      if (sortBy) {
        queryParams.sortBy = sortBy;
        queryParams.order = order;
      }
      if (params?.delay) {
        queryParams.delay = params.delay;
      }

      const response = await apiClient.get<ProductsResponse>(
        `/products/category/${categorySlug}`,
        { params: queryParams, signal }
      );
      rawResponse = response.data;
    }
    // 3. SEARCH ONLY
    else if (hasSearch) {
      const queryParams: Record<string, any> = {
        q: params!.q!.trim(),
        limit,
        skip,
      };
      if (sortBy) {
        queryParams.sortBy = sortBy;
        queryParams.order = order;
      }
      if (params?.delay) {
        queryParams.delay = params.delay;
      }

      const response = await apiClient.get<ProductsResponse>('/products/search', {
        params: queryParams,
        signal,
      });
      rawResponse = response.data;
    }
    // 4. STANDARD PRODUCT CATALOG (Default / Sorting / Pagination)
    else {
      const queryParams: Record<string, any> = { limit, skip };
      if (sortBy) {
        queryParams.sortBy = sortBy;
        queryParams.order = order;
      }
      if (params?.delay) {
        queryParams.delay = params.delay;
      }

      const response = await apiClient.get<ProductsResponse>('/products', {
        params: queryParams,
        signal,
      });
      rawResponse = response.data;
    }

    // -------------------------------------------------------------
    // APPLY LOCAL STATE OVERLAY (Deletions, Updates, and Local Additions)
    // -------------------------------------------------------------
    const deletedIds = productOverlay.getDeletedProductIds();
    const updatedMap = productOverlay.getUpdatedProducts();
    const addedProducts = productOverlay.getAddedProducts();

    // Filter out deleted items and apply edits to fetched products
    let activeProducts = (rawResponse.products || [])
      .filter((p) => !deletedIds.includes(p.id))
      .map((p) => (updatedMap[p.id] ? { ...p, ...updatedMap[p.id] } : p));

    // Filter matching locally added products
    const matchingAdded = addedProducts.filter((p) => {
      if (deletedIds.includes(p.id)) return false;
      if (hasCategory && p.category !== params?.category) return false;
      if (hasSearch) {
        const query = params!.q!.trim().toLowerCase();
        const titleMatch = p.title?.toLowerCase().includes(query);
        const descMatch = p.description?.toLowerCase().includes(query);
        const brandMatch = p.brand?.toLowerCase().includes(query);
        const tagMatch = p.tags?.some((t) => t.toLowerCase().includes(query));
        if (!titleMatch && !descMatch && !brandMatch && !tagMatch) return false;
      }
      return true;
    });

    // If on first page or hybrid mode, prepend locally added products
    if (skip === 0 && matchingAdded.length > 0) {
      // Remove duplicates if any
      const existingIds = new Set(activeProducts.map((p) => p.id));
      const newItems = matchingAdded.filter((p) => !existingIds.has(p.id));
      activeProducts = [...newItems, ...activeProducts].slice(0, limit);
    }

    // Adjust total count
    const totalAdjusted = Math.max(
      0,
      rawResponse.total + matchingAdded.length - deletedIds.length
    );

    return {
      products: activeProducts,
      total: totalAdjusted,
      skip,
      limit,
      isHybrid,
    };
  },

  /**
   * Fetch single product by ID (incorporating local overlay and 404 on deleted products)
   */
  async getProductById(id: string | number, signal?: AbortSignal): Promise<Product> {
    const numId = Number(id);

    // If marked as deleted in overlay, simulate 404
    if (productOverlay.isDeleted(numId)) {
      const err: any = new Error('Product not found (deleted)');
      err.response = { status: 404 };
      throw err;
    }

    // Check if product was created locally
    const localAdded = productOverlay.getAddedProducts().find((p) => p.id === numId);
    if (localAdded) {
      const productWithUpdates = productOverlay.applyOverlayToSingleProduct(localAdded);
      if (!productWithUpdates) {
        const err: any = new Error('Product not found');
        err.response = { status: 404 };
        throw err;
      }
      return productWithUpdates;
    }

    // Fetch from remote API
    const response = await apiClient.get<Product>(`/products/${id}`, { signal });
    const overlaid = productOverlay.applyOverlayToSingleProduct(response.data);
    if (!overlaid) {
      const err: any = new Error('Product not found');
      err.response = { status: 404 };
      throw err;
    }
    return overlaid;
  },

  /**
   * Create a new product (POST /products/add) and save in local overlay
   */
  async addProduct(newProductData: Partial<Product>): Promise<Product> {
    // Generate unique local ID (timestamp based) to avoid colliding with DummyJSON's mock ID
    const uniqueId = Date.now();

    // Call DummyJSON API
    let apiData: any = {};
    try {
      const response = await apiClient.post('/products/add', newProductData);
      apiData = response.data;
    } catch {
      // Fallback if offline or network hiccup
      apiData = {};
    }

    const fullProduct: Product = {
      title: newProductData.title || 'Untitled Product',
      description: newProductData.description || '',
      category: newProductData.category || 'general',
      price: Number(newProductData.price) || 0,
      discountPercentage: Number(newProductData.discountPercentage) || 0,
      rating: Number(newProductData.rating) || 5,
      stock: Number(newProductData.stock) || 0,
      brand: newProductData.brand || '',
      sku: newProductData.sku || `PRD-${uniqueId.toString().slice(-4)}`,
      thumbnail:
        newProductData.thumbnail ||
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60',
      images: newProductData.images || [
        newProductData.thumbnail ||
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60',
      ],
      availabilityStatus: (newProductData.stock ?? 0) > 0 ? 'In Stock' : 'Out of Stock',
      warrantyInformation: newProductData.warrantyInformation || '1 year standard warranty',
      shippingInformation: newProductData.shippingInformation || 'Ships in 2-4 business days',
      returnPolicy: newProductData.returnPolicy || '30 days return policy',
      reviews: [],
      ...apiData,
      id: uniqueId, // maintain unique ID
    };

    // Persist in local state overlay
    productOverlay.saveAddedProduct(fullProduct);
    return fullProduct;
  },

  /**
   * Update an existing product (PUT /products/:id) and save in local overlay
   */
  async updateProduct(id: number, updates: Partial<Product>): Promise<Product> {
    const numId = Number(id);

    try {
      await apiClient.put(`/products/${numId}`, updates);
    } catch {
      // DummyJSON may 404 for locally created IDs; overlay handles persistence regardless
    }

    // Persist changes in overlay
    productOverlay.saveUpdatedProduct(numId, updates);

    // Retrieve and return the updated entity
    return this.getProductById(numId);
  },

  /**
   * Delete product (DELETE /products/:id) and register in local overlay
   */
  async deleteProduct(id: number): Promise<boolean> {
    const numId = Number(id);

    try {
      await apiClient.delete(`/products/${numId}`);
    } catch {
      // DummyJSON may error on locally created IDs; overlay handles deletion regardless
    }

    productOverlay.saveDeletedProductId(numId);
    return true;
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
