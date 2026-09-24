import React, { useState, useEffect } from 'react';
import { Product, CategoryItem } from '@/types/product';
import { X, Loader2, Sparkles, AlertCircle, Image as ImageIcon } from 'lucide-react';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: Partial<Product>) => Promise<void>;
  initialData?: Product | null;
  categories: CategoryItem[];
}

interface FormErrors {
  title?: string;
  category?: string;
  price?: string;
  stock?: string;
  description?: string;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  categories,
}) => {
  const isEditMode = Boolean(initialData);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('');
  const [thumbnail, setThumbnail] = useState('');

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync form with initial data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title || '');
        setCategory(initialData.category || '');
        setPrice(initialData.price?.toString() || '');
        setStock(initialData.stock?.toString() || '');
        setDescription(initialData.description || '');
        setBrand(initialData.brand || '');
        setThumbnail(initialData.thumbnail || '');
      } else {
        setTitle('');
        setCategory(categories[0]?.slug || 'beauty');
        setPrice('');
        setStock('');
        setDescription('');
        setBrand('');
        setThumbnail('');
      }
      setErrors({});
      setTouched({});
      setIsSubmitting(false);
    }
  }, [isOpen, initialData, categories]);

  if (!isOpen) return null;

  // Validation logic
  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'title':
        if (!value.trim()) return 'Product title is required';
        if (value.trim().length < 3) return 'Title must be at least 3 characters';
        return undefined;
      case 'category':
        if (!value.trim()) return 'Category is required';
        return undefined;
      case 'price':
        if (!value.trim()) return 'Price is required';
        const numPrice = Number(value);
        if (isNaN(numPrice) || numPrice <= 0) return 'Price must be greater than 0';
        return undefined;
      case 'stock':
        if (!value.trim()) return 'Stock count is required';
        const numStock = Number(value);
        if (isNaN(numStock) || numStock < 0 || !Number.isInteger(numStock)) {
          return 'Stock must be a whole non-negative number';
        }
        return undefined;
      case 'description':
        if (!value.trim()) return 'Description is required';
        if (value.trim().length < 10) return 'Description must be at least 10 characters';
        return undefined;
      default:
        return undefined;
    }
  };

  const handleBlur = (field: string, val: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errorMsg = validateField(field, val);
    setErrors((prev) => ({ ...prev, [field]: errorMsg }));
  };

  const handleChange = (field: string, val: string) => {
    if (field === 'title') setTitle(val);
    if (field === 'category') setCategory(val);
    if (field === 'price') setPrice(val);
    if (field === 'stock') setStock(val);
    if (field === 'description') setDescription(val);
    if (field === 'brand') setBrand(val);
    if (field === 'thumbnail') setThumbnail(val);

    if (touched[field]) {
      const errorMsg = validateField(field, val);
      setErrors((prev) => ({ ...prev, [field]: errorMsg }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: FormErrors = {
      title: validateField('title', title),
      category: validateField('category', category),
      price: validateField('price', price),
      stock: validateField('stock', stock),
      description: validateField('description', description),
    };

    setTouched({
      title: true,
      category: true,
      price: true,
      stock: true,
      description: true,
    });

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some(Boolean);
    if (hasErrors || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSubmit({
        title: title.trim(),
        category: category.trim(),
        price: Number(price),
        stock: Number(stock),
        description: description.trim(),
        brand: brand.trim() || undefined,
        thumbnail: thumbnail.trim() || undefined,
      });
      onClose();
    } catch (err) {
      console.error('Submission failed', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {isEditMode ? 'Edit Product' : 'Add New Product'}
              </h2>
              <p className="text-xs text-slate-400">
                {isEditMode
                  ? 'Update product details and sync changes'
                  : 'Create a new product with full specifications'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs sm:text-sm">
          {/* Title */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Product Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleChange('title', e.target.value)}
              onBlur={(e) => handleBlur('title', e.target.value)}
              disabled={isSubmitting}
              placeholder="e.g. Wireless Noise-Cancelling Headphones"
              className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-1 transition-all ${
                errors.title && touched.title
                  ? 'border-rose-500/80 focus:ring-rose-500'
                  : 'border-slate-800 focus:border-brand-500 focus:ring-brand-500'
              }`}
            />
            {errors.title && touched.title && (
              <p className="text-[11px] text-rose-400 mt-1 flex items-center space-x-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.title}</span>
              </p>
            )}
          </div>

          {/* Category & Brand row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Category <span className="text-rose-400">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => handleChange('category', e.target.value)}
                onBlur={(e) => handleBlur('category', e.target.value)}
                disabled={isSubmitting}
                className={`w-full bg-slate-950 border rounded-xl px-3 py-2.5 text-white focus:outline-none focus:ring-1 transition-all capitalize ${
                  errors.category && touched.category
                    ? 'border-rose-500/80 focus:ring-rose-500'
                    : 'border-slate-800 focus:border-brand-500 focus:ring-brand-500'
                }`}
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug} className="bg-slate-900 text-white">
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.category && touched.category && (
                <p className="text-[11px] text-rose-400 mt-1 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.category}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Brand</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => handleChange('brand', e.target.value)}
                disabled={isSubmitting}
                placeholder="e.g. Sony, Apple, Nike"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
              />
            </div>
          </div>

          {/* Price & Stock row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Price ($) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => handleChange('price', e.target.value)}
                onBlur={(e) => handleBlur('price', e.target.value)}
                disabled={isSubmitting}
                placeholder="29.99"
                className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-1 transition-all ${
                  errors.price && touched.price
                    ? 'border-rose-500/80 focus:ring-rose-500'
                    : 'border-slate-800 focus:border-brand-500 focus:ring-brand-500'
                }`}
              />
              {errors.price && touched.price && (
                <p className="text-[11px] text-rose-400 mt-1 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.price}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Stock Quantity <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                step="1"
                min="0"
                value={stock}
                onChange={(e) => handleChange('stock', e.target.value)}
                onBlur={(e) => handleBlur('stock', e.target.value)}
                disabled={isSubmitting}
                placeholder="50"
                className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-1 transition-all ${
                  errors.stock && touched.stock
                    ? 'border-rose-500/80 focus:ring-rose-500'
                    : 'border-slate-800 focus:border-brand-500 focus:ring-brand-500'
                }`}
              />
              {errors.stock && touched.stock && (
                <p className="text-[11px] text-rose-400 mt-1 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.stock}</span>
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Description <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => handleChange('description', e.target.value)}
              onBlur={(e) => handleBlur('description', e.target.value)}
              disabled={isSubmitting}
              placeholder="Detailed description of features, materials, and specifications..."
              className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-1 transition-all resize-none ${
                errors.description && touched.description
                  ? 'border-rose-500/80 focus:ring-rose-500'
                  : 'border-slate-800 focus:border-brand-500 focus:ring-brand-500'
              }`}
            />
            {errors.description && touched.description && (
              <p className="text-[11px] text-rose-400 mt-1 flex items-center space-x-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errors.description}</span>
              </p>
            )}
          </div>

          {/* Thumbnail URL */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Thumbnail Image URL (optional)
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="url"
                value={thumbnail}
                onChange={(e) => handleChange('thumbnail', e.target.value)}
                disabled={isSubmitting}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-xs"
              />
              <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                {thumbnail ? (
                  <img
                    src={thumbnail}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <ImageIcon className="w-4 h-4 text-slate-600" />
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Footer with Double-Submission Guard */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-slate-800 bg-slate-900/60">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs font-semibold disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{isSubmitting ? 'Saving...' : isEditMode ? 'Update Product' : 'Create Product'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
