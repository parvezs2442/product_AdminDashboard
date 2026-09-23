import apiClient from '@/lib/axios';
import { Product, ProductsResponse, ProductQueryParams } from '@/types/product';

/**
 * Product API service handling all product data operations.
 * Separated completely from the UI components.
 */
export const productService = {
  /**
   * Fetch paginated products list
   */
  async getProducts(params?: ProductQueryParams, signal?: AbortSignal): Promise<ProductsResponse> {
    const response = await apiClient.get<ProductsResponse>('/products', {
      params: {
        limit: params?.limit ?? 10,
        skip: params?.skip ?? 0,
      },
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
   * Fetch all product categories
   */
  async getCategories(signal?: AbortSignal): Promise<string[] | { slug: string; name: string; url: string }[]> {
    const response = await apiClient.get('/products/categories', { signal });
    return response.data;
  },

  /**
   * Search products by query
   */
  async searchProducts(query: string, params?: { limit?: number; skip?: number }, signal?: AbortSignal): Promise<ProductsResponse> {
    const response = await apiClient.get<ProductsResponse>('/products/search', {
      params: {
        q: query,
        limit: params?.limit ?? 10,
        skip: params?.skip ?? 0,
      },
      signal,
    });
    return response.data;
  },

  /**
   * Fetch products by category
   */
  async getProductsByCategory(category: string, params?: { limit?: number; skip?: number }, signal?: AbortSignal): Promise<ProductsResponse> {
    const response = await apiClient.get<ProductsResponse>(`/products/category/${category}`, {
      params: {
        limit: params?.limit ?? 10,
        skip: params?.skip ?? 0,
      },
      signal,
    });
    return response.data;
  },
};
