import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Navbar } from '@/components/Navbar';
import { ProductGallery } from '@/components/products/ProductGallery';
import { ProductReviews } from '@/components/products/ProductReviews';
import { ProductDetailSkeleton } from '@/components/products/ProductDetailSkeleton';
import { ProductNotFound } from '@/components/products/ProductNotFound';
import { ProductFormModal } from '@/components/products/ProductFormModal';
import { ConfirmDeleteModal } from '@/components/products/ConfirmDeleteModal';
import { ErrorState } from '@/components/ui/ErrorState';
import { productService } from '@/services/productService';
import { useToast } from '@/context/ToastContext';
import { Product, CategoryItem } from '@/types/product';
import {
  ArrowLeft,
  ChevronRight,
  Star,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Truck,
  Shield,
  RotateCcw,
  Box,
  Layers,
  Sparkles,
  Pencil,
  Trash2,
  Tag,
  Scale,
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);

  const fetchProductDetail = async (signal?: AbortSignal) => {
    // 1. Defensive ID validation: Non-numeric or negative IDs fail early
    const numericId = Number(id);
    if (!id || isNaN(numericId) || numericId <= 0) {
      setIsNotFound(true);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setIsNotFound(false);
      setErrorMessage(null);

      const data = await productService.getProductById(numericId, signal);
      setProduct(data);
    } catch (err: any) {
      if (
        axios.isCancel(err) ||
        err?.name === 'CanceledError' ||
        err?.code === 'ERR_CANCELED'
      ) {
        return;
      }
      if (err?.response?.status === 404) {
        setIsNotFound(true);
      } else {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          'Failed to load product details. Please try again.';
        setErrorMessage(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchProductDetail(controller.signal);

    return () => {
      controller.abort();
    };
  }, [id]);

  useEffect(() => {
    let mounted = true;
    productService.getCategories().then((cats) => {
      if (mounted) setCategories(cats);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleFormSubmit = async (formData: Partial<Product>) => {
    if (!product) return;
    const updated = await productService.updateProduct(product.id, formData);
    setProduct(updated);
    toast.success('Product updated', `"${updated.title}" was successfully updated.`);
  };

  const handleConfirmDelete = async (productId: number) => {
    await productService.deleteProduct(productId);
    toast.success('Product deleted', `"${product?.title || 'Product'}" was removed.`);
    navigate('/products', { replace: true });
  };

  // Back navigation that preserves previous list URL filters
  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/products');
    }
  };

  // Stock status helper
  const getStockBadge = (stock: number, availability?: string) => {
    if (stock <= 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <XCircle className="w-3.5 h-3.5 mr-1.5" />
          {availability || 'Out of Stock'}
        </span>
      );
    }
    if (stock <= 10) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
          Low Stock ({stock} remaining)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
        {availability || 'In Stock'} ({stock} units)
      </span>
    );
  };

  // Calculate original price before discount
  const originalPrice =
    product && product.discountPercentage > 0
      ? (product.price / (1 - product.discountPercentage / 100)).toFixed(2)
      : null;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100 selection:bg-brand-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <ProductDetailSkeleton />
        ) : isNotFound ? (
          <ProductNotFound productId={id} />
        ) : errorMessage ? (
          <ErrorState message={errorMessage} onRetry={() => fetchProductDetail()} />
        ) : product ? (
          <div className="space-y-8">
            {/* Breadcrumbs & Navigation Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800">
              {/* Breadcrumb Links */}
              <nav className="flex items-center space-x-2 text-xs text-slate-400">
                <button
                  onClick={handleBack}
                  className="inline-flex items-center space-x-1.5 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer mr-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to List</span>
                </button>

                <Link to="/products" className="hover:text-brand-400 transition-colors">
                  Products
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                <span className="capitalize hover:text-brand-400 transition-colors">
                  {product.category}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                <span className="text-white font-medium truncate max-w-[200px] sm:max-w-xs">
                  {product.title}
                </span>
              </nav>

              {/* Action Buttons: Edit & Delete */}
              <div className="flex items-center space-x-2.5">
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
                  title="Edit product"
                >
                  <Pencil className="w-3.5 h-3.5 text-brand-400" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => setIsDeleteOpen(true)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition-all cursor-pointer"
                  title="Delete product"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>

            {/* Main Product Showcase: Gallery (Left) & Metadata (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Image Gallery */}
              <div className="lg:col-span-5">
                <ProductGallery
                  images={product.images}
                  thumbnail={product.thumbnail}
                  title={product.title}
                />
              </div>

              {/* Right Column: Title, Pricing, Stock, Specs */}
              <div className="lg:col-span-7 space-y-6">
                {/* Category & SKU row */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-brand-500/10 text-brand-300 border border-brand-500/20 capitalize">
                    {product.category}
                  </span>
                  {product.sku && (
                    <span className="px-3 py-1 rounded-lg text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800">
                      SKU: {product.sku}
                    </span>
                  )}
                  {product.brand && (
                    <span className="px-3 py-1 rounded-lg text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800">
                      Brand: {product.brand}
                    </span>
                  )}
                </div>

                {/* Title */}
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {product.title}
                  </h1>

                  {/* Rating Header */}
                  <div className="flex items-center space-x-3 mt-2.5">
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= Math.round(product.rating)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-bold text-white font-mono">
                      {product.rating.toFixed(2)}
                    </span>
                    <span className="text-xs text-slate-400">
                      ({product.reviews?.length || 0} reviews)
                    </span>
                  </div>
                </div>

                {/* Price & Stock Section */}
                <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                      Current Price
                    </span>
                    <div className="flex items-baseline space-x-3">
                      <span className="text-3xl font-extrabold text-white font-mono">
                        ${product.price.toFixed(2)}
                      </span>
                      {originalPrice && (
                        <span className="text-base text-slate-500 line-through font-mono">
                          ${originalPrice}
                        </span>
                      )}
                      {product.discountPercentage > 0 && (
                        <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                          -{Math.round(product.discountPercentage)}% OFF
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    {getStockBadge(product.stock, product.availabilityStatus)}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">
                    Description
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Product Tags */}
                {product.tags && product.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-slate-500 mr-1" />
                    {product.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-medium text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Specifications Grid */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                    Product Specifications
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    {/* Weight */}
                    {product.weight && (
                      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                        <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
                          <Scale className="w-3.5 h-3.5 text-brand-400" />
                          <span>Weight</span>
                        </div>
                        <p className="font-semibold text-white font-mono">
                          {product.weight} oz
                        </p>
                      </div>
                    )}

                    {/* Dimensions */}
                    {product.dimensions && (
                      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                        <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
                          <Box className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Dimensions</span>
                        </div>
                        <p className="font-semibold text-white font-mono text-[11px]">
                          {product.dimensions.width} &times; {product.dimensions.height} &times; {product.dimensions.depth} cm
                        </p>
                      </div>
                    )}

                    {/* Minimum Order */}
                    {product.minimumOrderQuantity && (
                      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                        <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
                          <Layers className="w-3.5 h-3.5 text-amber-400" />
                          <span>Min. Order Qty</span>
                        </div>
                        <p className="font-semibold text-white font-mono">
                          {product.minimumOrderQuantity} units
                        </p>
                      </div>
                    )}

                    {/* Warranty */}
                    {product.warrantyInformation && (
                      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                        <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
                          <Shield className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Warranty</span>
                        </div>
                        <p className="font-semibold text-white truncate" title={product.warrantyInformation}>
                          {product.warrantyInformation}
                        </p>
                      </div>
                    )}

                    {/* Shipping */}
                    {product.shippingInformation && (
                      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                        <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
                          <Truck className="w-3.5 h-3.5 text-sky-400" />
                          <span>Shipping</span>
                        </div>
                        <p className="font-semibold text-white truncate" title={product.shippingInformation}>
                          {product.shippingInformation}
                        </p>
                      </div>
                    )}

                    {/* Return Policy */}
                    {product.returnPolicy && (
                      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                        <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
                          <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                          <span>Return Policy</span>
                        </div>
                        <p className="font-semibold text-white truncate" title={product.returnPolicy}>
                          {product.returnPolicy}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Reviews Section */}
            <div className="pt-8 border-t border-slate-800">
              <ProductReviews
                reviews={product.reviews}
                averageRating={product.rating}
              />
            </div>
          </div>
        ) : null}
      </main>

      {/* Edit Product Form Modal */}
      <ProductFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={product}
        categories={categories}
      />

      {/* Confirm Delete Danger Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        product={product}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
