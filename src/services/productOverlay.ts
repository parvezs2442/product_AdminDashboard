import { Product } from '@/types/product';

const STORAGE_KEYS = {
  ADDED: 'admin_overlay_added',
  UPDATED: 'admin_overlay_updated',
  DELETED: 'admin_overlay_deleted',
} as const;

/**
 * Local State Overlay Layer for DummyJSON Mutations.
 * 
 * DESIGN DECISION:
 * DummyJSON API simulates mutations (POST /products/add, PUT /products/:id, DELETE /products/:id)
 * but does not persist them to the remote database.
 * This overlay maintains client-side persistence in localStorage, merging local
 * additions, updates, and deletions across all API queries, searches, and page refreshes.
 */
export const productOverlay = {
  getAddedProducts(): Product[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ADDED);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  getUpdatedProducts(): Record<number, Partial<Product>> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.UPDATED);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  getDeletedProductIds(): number[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DELETED);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  isDeleted(id: number): boolean {
    const deleted = this.getDeletedProductIds();
    return deleted.includes(Number(id));
  },

  saveAddedProduct(product: Product): Product {
    const added = this.getAddedProducts();
    // Ensure product is prepended so newest items show first
    const updated = [product, ...added.filter((p) => p.id !== product.id)];
    localStorage.setItem(STORAGE_KEYS.ADDED, JSON.stringify(updated));
    return product;
  },

  saveUpdatedProduct(id: number, updates: Partial<Product>): void {
    const numId = Number(id);
    const added = this.getAddedProducts();
    const addedIndex = added.findIndex((p) => p.id === numId);

    if (addedIndex !== -1) {
      // If it's a locally added product, update it in the added list directly
      added[addedIndex] = { ...added[addedIndex], ...updates };
      localStorage.setItem(STORAGE_KEYS.ADDED, JSON.stringify(added));
    } else {
      // Otherwise, save field-level overrides for remote product
      const currentUpdates = this.getUpdatedProducts();
      currentUpdates[numId] = { ...(currentUpdates[numId] || {}), ...updates };
      localStorage.setItem(STORAGE_KEYS.UPDATED, JSON.stringify(currentUpdates));
    }
  },

  saveDeletedProductId(id: number): void {
    const numId = Number(id);
    // Remove from added list if present
    const added = this.getAddedProducts().filter((p) => p.id !== numId);
    localStorage.setItem(STORAGE_KEYS.ADDED, JSON.stringify(added));

    // Remove from updated overrides if present
    const updated = this.getUpdatedProducts();
    if (updated[numId]) {
      delete updated[numId];
      localStorage.setItem(STORAGE_KEYS.UPDATED, JSON.stringify(updated));
    }

    // Add to deleted IDs list
    const deleted = this.getDeletedProductIds();
    if (!deleted.includes(numId)) {
      deleted.push(numId);
      localStorage.setItem(STORAGE_KEYS.DELETED, JSON.stringify(deleted));
    }
  },

  applyOverlayToSingleProduct(product: Product): Product | null {
    if (this.isDeleted(product.id)) {
      return null;
    }
    const updates = this.getUpdatedProducts()[product.id];
    return updates ? { ...product, ...updates } : product;
  },

  hasOverlayModifications(): boolean {
    return (
      this.getAddedProducts().length > 0 ||
      Object.keys(this.getUpdatedProducts()).length > 0 ||
      this.getDeletedProductIds().length > 0
    );
  },

  resetOverlay(): void {
    localStorage.removeItem(STORAGE_KEYS.ADDED);
    localStorage.removeItem(STORAGE_KEYS.UPDATED);
    localStorage.removeItem(STORAGE_KEYS.DELETED);
  },
};
