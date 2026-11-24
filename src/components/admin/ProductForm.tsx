'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Sparkles,
  Image as ImageIcon,
  Layers,
  Ruler,
  Tags,
  Eye,
  ShieldCheck,
} from 'lucide-react';
import { slugify } from '@/lib/validations/product';
import { formatINR, calculateDiscount } from '@/utils/currency';
import ProductImageUploader, { UploadedImageItem } from './ProductImageUploader';

export interface CategoryOption {
  _id?: string;
  id?: string;
  slug: string;
  name: string;
  subcategories?: string[];
  orderIndex?: number;
}

const FALLBACK_CATEGORIES: CategoryOption[] = [
  { id: 'sofas', slug: 'sofas', name: 'Sofas' },
  { id: 'beds', slug: 'beds', name: 'Beds' },
  { id: 'dining-sets', slug: 'dining-sets', name: 'Dining Sets' },
  { id: 'study-tables', slug: 'study-tables', name: 'Study Tables' },
  { id: 'centre-tables', slug: 'centre-tables', name: 'Centre Tables' },
  { id: 'recliners', slug: 'recliners', name: 'Recliners' },
  { id: 'wardrobes', slug: 'wardrobes', name: 'Wardrobes' },
  { id: 'cabinets-sideboards', slug: 'cabinets-sideboards', name: 'Cabinets & Sideboards' },
  { id: 'office-furniture', slug: 'office-furniture', name: 'Office Furniture' },
  { id: 'shoe-racks', slug: 'shoe-racks', name: 'Shoe Racks' },
  { id: 'bar-furniture', slug: 'bar-furniture', name: 'Bar Furniture' },
];

const DEFAULT_SECTIONS = [
  {
    title: 'Product Details & Architecture',
    content: 'Every piece is crafted in Visakhapatnam under rigorous quality supervision with hand-sanded timber contours and calibrated hardware joints.',
    icon: 'check',
  },
  {
    title: 'Dimensions & Materials',
    content: 'Kiln-dried solid hardwood joinery with moisture-calibrated structural integrity and tactile artisan upholstery.',
    icon: 'ruler',
  },
  {
    title: 'Finish & Bespoke Customization',
    content: 'Need custom width, seat height, or specialized upholstery fabric? Our furniture artisans accommodate custom sizing. Discuss your floor plan directly on WhatsApp.',
    icon: 'palette',
  },
  {
    title: 'Delivery & Assembly in India',
    content: 'Complimentary scheduled 2-person white-glove placement, in-home assembly, leveling, and packaging removal across AP within 3–7 business days. Insured Pan-India transit.',
    icon: 'truck',
  },
  {
    title: 'Warranty & Care Guidelines',
    content: '10-Year Craftsmanship Warranty covers internal structural hardwood framework, mortise joinery, and anti-termite treatment under normal residential use.',
    icon: 'shield',
  },
];

interface ProductFormProps {
  initialProduct?: any;
  isEdit?: boolean;
  initialCategories?: CategoryOption[];
}

export default function ProductForm({
  initialProduct,
  isEdit = false,
  initialCategories = [],
}: ProductFormProps) {
  const router = useRouter();

  const [categories, setCategories] = useState<CategoryOption[]>(
    Array.isArray(initialCategories) && initialCategories.length > 0
      ? initialCategories
      : FALLBACK_CATEGORIES
  );

  // Sync state if initialCategories updates from server revalidation
  useEffect(() => {
    if (Array.isArray(initialCategories) && initialCategories.length > 0) {
      setCategories(initialCategories);
    }
  }, [initialCategories]);

  // Always fetch fresh categories so changes made in Admin Categories reflect immediately
  useEffect(() => {
    async function loadFreshCategories() {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (data.success && Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories(data.categories);
        }
      } catch (err) {
        console.error('Failed to load dynamic categories in ProductForm:', err);
      }
    }
    loadFreshCategories();
  }, []);

  const [name, setName] = useState(initialProduct?.name || '');
  const [slug, setSlug] = useState(initialProduct?.slug || '');
  const [sku, setSku] = useState(initialProduct?.sku || '');
  const [category, setCategory] = useState(
    initialProduct?.category ||
      (initialCategories && initialCategories[0]
        ? initialCategories[0].slug || initialCategories[0].id || 'sofas'
        : 'sofas')
  );
  const [subCategory, setSubCategory] = useState(initialProduct?.subCategory || '');

  // If new product and categories load, ensure category points to a valid option
  useEffect(() => {
    if (!initialProduct?.category && categories.length > 0) {
      const exists = categories.some((c) => (c.slug || c.id) === category);
      if (!exists) {
        setCategory(categories[0].slug || categories[0].id || 'sofas');
      }
    }
  }, [categories, initialProduct, category]);

  const activeCategoryObj = categories.find(
    (c) => (c.slug || c.id) === category || c.name?.toLowerCase() === category?.toLowerCase()
  );
  const availableSubcategories: string[] = Array.isArray(activeCategoryObj?.subcategories)
    ? activeCategoryObj.subcategories
    : [];
  const [price, setPrice] = useState<number | string>(initialProduct?.price ?? '');
  const [originalPrice, setOriginalPrice] = useState<number | string>(initialProduct?.originalPrice ?? '');
  const [shortDescription, setShortDescription] = useState(initialProduct?.shortDescription || '');
  const [fullDescription, setFullDescription] = useState(initialProduct?.fullDescription || '');

  // Dimensions
  const [width, setWidth] = useState(initialProduct?.dimensions?.width || '');
  const [depth, setDepth] = useState(initialProduct?.dimensions?.depth || '');
  const [height, setHeight] = useState(initialProduct?.dimensions?.height || '');
  const [seatHeight, setSeatHeight] = useState(initialProduct?.dimensions?.seatHeight || '');
  const [bedBaseHeight, setBedBaseHeight] = useState(initialProduct?.dimensions?.bedBaseHeight || '');
  const [weight, setWeight] = useState(initialProduct?.dimensions?.weight || '');

  // Materials (comma separated)
  const [materialsText, setMaterialsText] = useState(
    Array.isArray(initialProduct?.materials) ? initialProduct.materials.join(', ') : 'Kiln-Dried Indian Teak'
  );

  // Cloudinary / Gallery Images
  const initialImagesList: UploadedImageItem[] = React.useMemo(() => {
    if (Array.isArray(initialProduct?.imageDetails) && initialProduct.imageDetails.length > 0) {
      return initialProduct.imageDetails.map((img: any, i: number) => ({
        url: img.url,
        key: img.key || '',
        altText: img.altText || '',
        isPrimary: img.isPrimary ?? i === 0,
        width: img.width,
        height: img.height,
      }));
    }
    if (Array.isArray(initialProduct?.images) && initialProduct.images.length > 0) {
      return initialProduct.images.map((url: string, i: number) => ({
        url,
        isPrimary: i === 0,
      }));
    }
    return [
      {
        url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
        isPrimary: true,
      },
    ];
  }, [initialProduct]);

  const [imageItems, setImageItems] = useState<UploadedImageItem[]>(initialImagesList);

  // Colors
  const [colors, setColors] = useState<Array<{ name: string; hex: string; inStock: boolean }>>(
    Array.isArray(initialProduct?.colors) && initialProduct.colors.length > 0
      ? initialProduct.colors
      : [{ name: 'Warm Cream', hex: '#F4EBE1', inStock: true }]
  );
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#2563EB');

  // Publication & Badges
  const [isActive, setIsActive] = useState(initialProduct?.isActive ?? true);
  const [isFeatured, setIsFeatured] = useState(initialProduct?.isFeatured ?? false);
  const [isBestseller, setIsBestseller] = useState(initialProduct?.isBestseller ?? false);
  const [badge, setBadge] = useState(initialProduct?.badge || '');

  // Warranty & Delivery
  const [warranty, setWarranty] = useState(
    initialProduct?.warranty || '10-Year Structural Frame & Termite Warranty'
  );
  const [leadTime, setLeadTime] = useState(
    initialProduct?.leadTime || 'Complimentary White-Glove In-Home Delivery across AP (3–7 Days)'
  );

  // Custom Architectural Accordion Sections
  const [customSections, setCustomSections] = useState<Array<{ title: string; content: string; icon: string }>>(
    Array.isArray(initialProduct?.customSections) && initialProduct.customSections.length > 0
      ? initialProduct.customSections
      : DEFAULT_SECTIONS
  );

  const handleAddSection = () => {
    setCustomSections([
      ...customSections,
      { title: 'New Specification Section', content: '', icon: 'check' }
    ]);
  };

  const handleUpdateSection = (index: number, field: string, value: string) => {
    const updated = [...customSections];
    updated[index] = { ...updated[index], [field]: value };
    setCustomSections(updated);
  };

  const handleRemoveSection = (index: number) => {
    setCustomSections(customSections.filter((_, i) => i !== index));
  };

  const handleMoveSectionUp = (index: number) => {
    if (index === 0) return;
    const updated = [...customSections];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    setCustomSections(updated);
  };

  const handleMoveSectionDown = (index: number) => {
    if (index === customSections.length - 1) return;
    const updated = [...customSections];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    setCustomSections(updated);
  };

  const handleResetDefaultSections = () => {
    setCustomSections(DEFAULT_SECTIONS);
  };

  // SEO
  const [seoTitle, setSeoTitle] = useState(initialProduct?.seoMeta?.title || '');
  const [seoDescription, setSeoDescription] = useState(initialProduct?.seoMeta?.description || '');
  const [seoKeywords, setSeoKeywords] = useState(
    Array.isArray(initialProduct?.seoMeta?.keywords) ? initialProduct.seoMeta.keywords.join(', ') : ''
  );

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Auto-slugify when name changes
  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(slugify(val));
  };

  // Color helpers
  const handleAddColor = () => {
    if (newColorName.trim()) {
      setColors([...colors, { name: newColorName.trim(), hex: newColorHex, inStock: true }]);
      setNewColorName('');
    }
  };

  const handleRemoveColor = (index: number) => {
    setColors(colors.filter((_, i) => i !== index));
  };

  // Submission
  const handleSubmit = async (publishStatus?: boolean) => {
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    const activeState = publishStatus !== undefined ? publishStatus : isActive;

    const materialsArray = materialsText
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);

    const finalSlug = slugify(name) || (slug ? slug.trim() : '');
    const finalSku =
      sku.trim() ||
      initialProduct?.sku ||
      `FUR-${(finalSlug || 'ITEM').slice(0, 10).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const payload = {
      name: name.trim(),
      slug: finalSlug,
      sku: finalSku,
      category,
      categoryLabel: activeCategoryObj?.name || category,
      subCategory: subCategory.trim(),
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : 0,
      badge: badge.trim() || null,
      isBestseller,
      isFeatured,
      isActive: activeState,
      stockQuantity: 100,
      lowStockThreshold: 5,
      costPrice: 0,
      trackInventory: false,
      allowBackorders: true,
      inStock: true,
      shortDescription: shortDescription.trim(),
      fullDescription: fullDescription.trim(),
      dimensions: {
        width: width.trim(),
        depth: depth.trim(),
        height: height.trim(),
        seatHeight: seatHeight.trim(),
        bedBaseHeight: bedBaseHeight.trim(),
        weight: weight.trim(),
      },
      materials: materialsArray.length > 0 ? materialsArray : ['Kiln-Dried Indian Teak'],
      colors,
      images: imageItems.map((img) => img.url),
      imageDetails: imageItems.map((img, idx) => ({
        url: img.url,
        key: img.key || '',
        altText: img.altText || '',
        isPrimary: idx === 0,
        width: img.width,
        height: img.height,
      })),
      leadTime: leadTime.trim(),
      warranty: warranty.trim(),
      customSections: customSections
        .filter((s) => s.title.trim().length > 0)
        .map((s) => ({
          title: s.title.trim(),
          content: s.content.trim(),
          icon: s.icon || 'check',
        })),
      seoMeta: {
        title: seoTitle.trim() || name.trim(),
        description: seoDescription.trim() || shortDescription.trim(),
        keywords: seoKeywords
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean),
      },
    };

    try {
      const url = isEdit
        ? `/api/admin/products/${initialProduct._id || initialProduct.id}`
        : '/api/admin/products';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'Operation failed. Please review your input.');
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage(
        isEdit
          ? 'Product updated successfully.'
          : 'Product created and catalog updated successfully.'
      );

      // Navigate back to product list after short delay
      setTimeout(() => {
        router.push('/admin/products');
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setErrorMessage('Network error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  const discountText = calculateDiscount(Number(price) || 0, Number(originalPrice) || 0);

  return (
    <div className="max-w-5xl mx-auto space-y-8 font-sans pb-24 text-left">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Products</span>
          </Link>
          <h1 className="font-serif text-3xl sm:text-4xl text-slate-900 font-normal tracking-tight">
            {isEdit ? `Edit Product: ${initialProduct?.name}` : 'Add New Furniture Product'}
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-sans">
            Fill in the handcrafted furniture details, dimensions, pricing, and high-resolution imagery.
          </p>
        </div>

        {/* Action Buttons Top */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit(false)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
          >
            Save as Draft
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit(true)}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{isEdit ? 'Save Changes' : 'Publish Product'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Form Grid Sections */}
      <div className="space-y-6">
        
        {/* SECTION 1: Basic Information */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <Layers className="w-4 h-4 text-blue-600" />
            <h2 className="font-serif text-lg text-slate-900 font-normal">
              1. Basic Furniture Identification
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Product Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-slate-700 font-medium mb-2">
                Product Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Aura Curved Bouclé Sofa"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 transition-colors"
              />
            </div>

            {/* Category Dropdown */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-700 font-medium mb-2">
                Primary Category <span className="text-red-400">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 transition-colors"
              >
                {categories.map((c) => {
                  const val = c.slug || c.id || '';
                  return (
                    <option key={val} value={val} className="bg-white">
                      {c.name}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Subcategory */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs uppercase tracking-wider text-slate-700 font-medium">
                  Subcategory <span className="text-red-400">*</span>
                </label>
                {activeCategoryObj && availableSubcategories.length > 0 && (
                  <span className="text-[10px] text-blue-600 font-medium">
                    {availableSubcategories.length} configured in {activeCategoryObj.name}
                  </span>
                )}
              </div>
              <input
                type="text"
                list="admin-subcategory-list"
                required
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                placeholder={
                  availableSubcategories.length > 0
                    ? `e.g. ${availableSubcategories.slice(0, 3).join(', ')}`
                    : 'e.g. Curved Sofas, Platform Beds, Dining Tables'
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 transition-colors"
              />
              <datalist id="admin-subcategory-list">
                {availableSubcategories.map((sub) => (
                  <option key={sub} value={sub} />
                ))}
              </datalist>

              {/* Quick Select Pill Suggestions */}
              {availableSubcategories.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-400 font-medium">Suggestions:</span>
                  {availableSubcategories.map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => setSubCategory(sub)}
                      className={`text-[11px] px-2.5 py-0.5 rounded-lg border transition-colors cursor-pointer ${
                        subCategory.toLowerCase() === sub.toLowerCase()
                          ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Short Description */}
            <div className="sm:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-slate-700 font-medium mb-2">
                Short Description (Summary) <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Architectural low-profile silhouette with sculptural curves and tactile bouclé upholstery."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 transition-colors leading-relaxed"
              />
            </div>

            {/* Full Description */}
            <div className="sm:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-slate-700 font-medium mb-2">
                Full Architectural Description <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={5}
                required
                value={fullDescription}
                onChange={(e) => setFullDescription(e.target.value)}
                placeholder="Crafted from seasoned solid Indian teakwood, featuring organic contours and premium multi-density cushioning engineered for exceptional long-term ergonomics..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 transition-colors leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Pricing & Publication */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <Tags className="w-4 h-4 text-blue-600" />
            <h2 className="font-serif text-lg text-slate-900 font-normal">
              2. Pricing & Publication (INR ₹)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Selling Price */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-700 font-medium mb-2">
                Selling Price (₹) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="145000"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-blue-600 placeholder-slate-400 focus:outline-none focus:border-blue-600 transition-colors"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Formatted: {price ? formatINR(Number(price)) : '₹0'}
              </span>
            </div>

            {/* Original / MRP Price */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-700 font-medium mb-2">
                Original Price / MRP (₹)
              </label>
              <input
                type="number"
                min="0"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="165000"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-500 placeholder-slate-400 focus:outline-none focus:border-blue-600 transition-colors"
              />
              {discountText && (
                <span className="text-[10px] text-emerald-400 font-medium mt-1 block">
                  Active Discount: {discountText}
                </span>
              )}
            </div>
          </div>

          {/* Visibility & Curation Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
            <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-slate-50 border-slate-200"
              />
              <span>Published (Live in Store)</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isBestseller}
                onChange={(e) => setIsBestseller(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-slate-50 border-slate-200"
              />
              <span>Bestseller Piece</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-slate-50 border-slate-200"
              />
              <span>Featured Showcase</span>
            </label>
          </div>

          {/* Product Badge Pill */}
          <div className="pt-2">
            <label className="block text-xs uppercase tracking-wider text-slate-700 font-medium mb-2">
              Product Badge (Optional)
            </label>
            <input
              type="text"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              placeholder="e.g. Signature Piece, Limited Edition, New Arrival"
              className="w-full sm:w-80 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-blue-600 placeholder-slate-400 focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>

        {/* SECTION 3: Product Imagery with Cloudinary Direct Upload */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-blue-600" />
              <h2 className="font-serif text-lg text-slate-900 font-normal">
                3. High-Resolution Imagery (Cloudinary Media)
              </h2>
            </div>
          </div>

          <ProductImageUploader
            images={imageItems}
            onChange={setImageItems}
            productIdentifier={sku || slug || 'furniture'}
          />
        </div>

        {/* SECTION 4: Dimensions, Materials & Colors */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <Ruler className="w-4 h-4 text-blue-600" />
            <h2 className="font-serif text-lg text-slate-900 font-normal">
              4. Dimensions, Materials & Finishes
            </h2>
          </div>

          {/* Dimensions 6-col */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-700 font-medium mb-3">
              Architectural Proportions & Dimensions
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div>
                <span className="text-[10px] text-slate-500 block mb-1">Width</span>
                <input
                  type="text"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  placeholder="240 cm"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block mb-1">Depth</span>
                <input
                  type="text"
                  value={depth}
                  onChange={(e) => setDepth(e.target.value)}
                  placeholder="105 cm"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block mb-1">Height</span>
                <input
                  type="text"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="76 cm"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block mb-1">Seat Height</span>
                <input
                  type="text"
                  value={seatHeight}
                  onChange={(e) => setSeatHeight(e.target.value)}
                  placeholder="42 cm"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block mb-1">Base Height</span>
                <input
                  type="text"
                  value={bedBaseHeight}
                  onChange={(e) => setBedBaseHeight(e.target.value)}
                  placeholder="22 cm"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block mb-1">Weight</span>
                <input
                  type="text"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="68 kg"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Materials */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-700 font-medium mb-2">
              Materials (Comma Separated) <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={materialsText}
              onChange={(e) => setMaterialsText(e.target.value)}
              placeholder="Kiln-Dried Indian Teak, Belgian Textured Bouclé, High-Resilience Foam"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900"
            />
          </div>

          {/* Color Swatches */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-700 font-medium mb-3">
              Color & Fabric Variants
            </label>
            <div className="flex flex-wrap gap-2.5 mb-3">
              {colors.map((c, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/30 shrink-0"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span>{c.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveColor(i)}
                    className="text-slate-400 hover:text-red-400 ml-1"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 max-w-sm">
              <input
                type="color"
                value={newColorHex}
                onChange={(e) => setNewColorHex(e.target.value)}
                className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer p-0"
              />
              <input
                type="text"
                placeholder="Variant Name (e.g. Oatmeal Bouclé)"
                value={newColorName}
                onChange={(e) => setNewColorName(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
              />
              <button
                type="button"
                onClick={handleAddColor}
                className="px-3 py-2 rounded-xl bg-slate-100 border border-blue-200 text-blue-600 text-xs font-semibold cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 5: Architectural Integrity & Specifications Accordions */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <div>
                <h2 className="font-serif text-lg text-slate-900 font-normal">
                  5. Architectural Integrity & Specifications Accordions
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Customize the 5 standard accordion sections or add new custom sections for this piece.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetDefaultSections}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 text-xs font-medium transition-colors cursor-pointer"
              >
                Reset Standard 5
              </button>
              <button
                type="button"
                onClick={handleAddSection}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-50 border border-blue-200 hover:bg-blue-600 hover:text-white text-blue-600 text-xs font-semibold transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Section</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {customSections.map((sec, i) => (
              <div
                key={i}
                className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 flex-1">
                    <span className="w-6 h-6 rounded-lg bg-slate-50 text-blue-600 font-mono text-xs flex items-center justify-center font-bold shrink-0">
                      {i + 1}
                    </span>
                    <input
                      type="text"
                      value={sec.title}
                      onChange={(e) => handleUpdateSection(i, 'title', e.target.value)}
                      placeholder="Section Title (e.g. Product Details & Architecture)"
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={sec.icon || 'check'}
                      onChange={(e) => handleUpdateSection(i, 'icon', e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-700 focus:outline-none focus:border-blue-600"
                      title="Section Icon"
                    >
                      <option value="check">Checkmark Icon</option>
                      <option value="ruler">Ruler / Dimensions Icon</option>
                      <option value="palette">Palette / Finish Icon</option>
                      <option value="truck">Truck / Delivery Icon</option>
                      <option value="shield">Shield / Warranty Icon</option>
                      <option value="sparkles">Sparkles / Craft Icon</option>
                      <option value="layers">Layers / Timber Icon</option>
                    </select>

                    <button
                      type="button"
                      disabled={i === 0}
                      onClick={() => handleMoveSectionUp(i)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-900 disabled:opacity-20 transition-colors cursor-pointer disabled:cursor-not-allowed"
                      title="Move Up"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={i === customSections.length - 1}
                      onClick={() => handleMoveSectionDown(i)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-900 disabled:opacity-20 transition-colors cursor-pointer disabled:cursor-not-allowed"
                      title="Move Down"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveSection(i)}
                      className="p-1.5 rounded-lg border border-red-900/30 text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                      title="Delete Section"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <textarea
                    rows={3}
                    value={sec.content}
                    onChange={(e) => handleUpdateSection(i, 'content', e.target.value)}
                    placeholder="Detailed specifications, craftsmanship notes, or architectural guidelines for this accordion section..."
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-[#E0D8D0] placeholder-slate-400 focus:outline-none focus:border-blue-600 leading-relaxed resize-y font-sans"
                  />
                </div>
              </div>
            ))}

            {customSections.length === 0 && (
              <div className="text-center py-8 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
                No specification sections configured. Click "Reset Standard 5" or "Add Section" to create accordion items.
              </div>
            )}
          </div>
        </div>

        {/* SECTION 6: Warranty, Delivery & SEO */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <h2 className="font-serif text-lg text-slate-900 font-normal">
              6. Assurance, Delivery & SEO Metadata
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-700 font-medium mb-2">
                Warranty Terms
              </label>
              <input
                type="text"
                value={warranty}
                onChange={(e) => setWarranty(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-700 font-medium mb-2">
                Delivery / Lead Time
              </label>
              <input
                type="text"
                value={leadTime}
                onChange={(e) => setLeadTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900"
              />
            </div>

            <div className="sm:col-span-2 pt-2">
              <label className="block text-xs uppercase tracking-wider text-slate-700 font-medium mb-2">
                SEO Meta Title (Optional)
              </label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Defaults to product name if empty"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-slate-700 font-medium mb-2">
                SEO Meta Description (Optional)
              </label>
              <input
                type="text"
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Defaults to short description if empty"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900"
              />
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-2xl">
        <Link
          href="/admin/products"
          className="text-xs text-slate-500 hover:text-slate-900 transition-colors"
        >
          Discard Changes
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit(false)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
          >
            Save as Draft
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit(true)}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isEdit ? 'Update Product' : 'Publish Product'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
