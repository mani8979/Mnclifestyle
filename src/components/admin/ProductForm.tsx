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
  Tags,
  Eye,
  Palette,
} from 'lucide-react';
import { slugify } from '@/lib/validations/product';
import { formatINR, calculateDiscount } from '@/utils/currency';
import ProductImageUploader, { UploadedImageItem } from './ProductImageUploader';
import ProductColorVariantMapper, { MappedVariantItem } from './ProductColorVariantMapper';

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
  initialLinkedVariants?: MappedVariantItem[];
  isColorVariantClone?: boolean;
}

export default function ProductForm({
  initialProduct,
  isEdit = false,
  initialCategories = [],
  initialLinkedVariants = [],
  isColorVariantClone = false,
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
  const [isCustomSubcategory, setIsCustomSubcategory] = useState(false);
  const [customSubcategoryText, setCustomSubcategoryText] = useState('');

  // If new product and categories load, ensure category points to a valid option
  useEffect(() => {
    if (!initialProduct?.category && categories.length > 0) {
      const exists = categories.some((c) => (c.slug || c.id) === category);
      if (!exists) {
        const defaultCat = categories[0].slug || categories[0].id || 'sofas';
        setCategory(defaultCat);
        const targetCat = categories[0];
        if (Array.isArray(targetCat?.subcategories) && targetCat.subcategories.length > 0) {
          setSubCategory(targetCat.subcategories[0]);
        }
      }
    }
  }, [categories, initialProduct, category]);

  const activeCategoryObj = categories.find(
    (c) => (c.slug || c.id) === category || c.name?.toLowerCase() === category?.toLowerCase()
  );
  const availableSubcategories: string[] = Array.isArray(activeCategoryObj?.subcategories)
    ? activeCategoryObj.subcategories
    : [];

  // When changing category, auto-select its first subcategory or reset
  const handleCategorySelect = (newCatSlug: string) => {
    setCategory(newCatSlug);
    const targetCat = categories.find(
      (c) => (c.slug || c.id) === newCatSlug || c.name?.toLowerCase() === newCatSlug?.toLowerCase()
    );
    const subs = Array.isArray(targetCat?.subcategories) ? targetCat.subcategories : [];
    if (subs.length > 0) {
      setSubCategory(subs[0]);
      setIsCustomSubcategory(false);
      setCustomSubcategoryText('');
    } else {
      setSubCategory('');
      setIsCustomSubcategory(false);
    }
  };

  // On mount/category load, set initial subcategory if empty and not editing
  useEffect(() => {
    if (!initialProduct && availableSubcategories.length > 0 && !subCategory && !isCustomSubcategory) {
      setSubCategory(availableSubcategories[0]);
    }
  }, [availableSubcategories, initialProduct, subCategory, isCustomSubcategory]);
  const [price, setPrice] = useState<number | string>(initialProduct?.price ?? '');
  const [originalPrice, setOriginalPrice] = useState<number | string>(initialProduct?.originalPrice ?? '');
  const [shortDescription, setShortDescription] = useState(initialProduct?.shortDescription || '');
  const [fullDescription, setFullDescription] = useState(initialProduct?.fullDescription || '');

  // Dimensions & Materials (preserved / defaulted on save)
  const width = initialProduct?.dimensions?.width || '';
  const depth = initialProduct?.dimensions?.depth || '';
  const height = initialProduct?.dimensions?.height || '';
  const seatHeight = initialProduct?.dimensions?.seatHeight || '';
  const bedBaseHeight = initialProduct?.dimensions?.bedBaseHeight || '';
  const weight = initialProduct?.dimensions?.weight || '';
  const materialsText = Array.isArray(initialProduct?.materials)
    ? initialProduct.materials.join(', ')
    : 'Kiln-Dried Indian Teak';

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
    return [];
  }, [initialProduct]);

  const [imageItems, setImageItems] = useState<UploadedImageItem[]>(initialImagesList);

  // Primary Product Color + Linked Sibling Variants (Same Category & Subcategory)
  const [colorName, setColorName] = useState(
    isColorVariantClone
      ? ''
      : initialProduct?.colorName || initialProduct?.colors?.[0]?.name || ''
  );
  const [colorHex, setColorHex] = useState(
    isColorVariantClone
      ? '#211710'
      : initialProduct?.colorHex || initialProduct?.colors?.[0]?.hex || '#211710'
  );
  const [linkedVariants, setLinkedVariants] = useState<MappedVariantItem[]>(
    Array.isArray(initialLinkedVariants) ? initialLinkedVariants : []
  );

  // Preserved finish swatches from existing product (single colour edited via colorName/colorHex)
  const [colors] = useState<
    Array<{
      name: string;
      hex: string;
      inStock: boolean;
      image?: string;
      price?: number;
      originalPrice?: number;
    }>
  >(
    !isColorVariantClone && Array.isArray(initialProduct?.colors) && initialProduct.colors.length > 0
      ? initialProduct.colors
      : []
  );

  // Publication & Stock Badges
  const [isActive, setIsActive] = useState(initialProduct?.isActive ?? true);
  const [isFeatured, setIsFeatured] = useState(initialProduct?.isFeatured ?? false);
  const [isBestseller, setIsBestseller] = useState(initialProduct?.isBestseller ?? false);
  const [inStock, setInStock] = useState(initialProduct?.inStock ?? true);
  const [badge, setBadge] = useState(initialProduct?.badge || '');

  // Warranty & Delivery (preserved / defaulted on save)
  const warranty =
    initialProduct?.warranty || '10-Year Structural Frame & Termite Warranty';
  const leadTime =
    initialProduct?.leadTime || 'Complimentary White-Glove In-Home Delivery across AP (3–7 Days)';

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

  // SEO (preserved / defaulted on save)
  const seoTitle = initialProduct?.seoMeta?.title || '';
  const seoDescription = initialProduct?.seoMeta?.description || '';
  const seoKeywords = Array.isArray(initialProduct?.seoMeta?.keywords)
    ? initialProduct.seoMeta.keywords.join(', ')
    : '';

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Auto-slugify when name changes
  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(slugify(val));
  };

  // Submission
  const handleSubmit = async (publishStatus?: boolean) => {
    setErrorMessage('');
    setSuccessMessage('');

    // 1. Client-side field validations
    if (!name.trim() || name.trim().length < 2) {
      setErrorMessage('Product name is required (at least 2 characters).');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const numericPrice = Number(price);
    if (!price || isNaN(numericPrice) || numericPrice <= 0) {
      setErrorMessage('Please specify a valid product selling price greater than ₹0.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!activeCategoryObj) {
      setErrorMessage('Please select an active primary category for this product.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (imageItems.length === 0) {
      setErrorMessage('Please upload at least one product image before saving.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

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

    const derivedSubCategory =
      (isCustomSubcategory ? customSubcategoryText.trim() : subCategory.trim()) ||
      availableSubcategories[0] ||
      activeCategoryObj?.name ||
      'General';

    const derivedShortDescription =
      shortDescription.trim().length >= 5
        ? shortDescription.trim()
        : `${name.trim()} — Handcrafted ${activeCategoryObj?.name || 'furniture piece'} designed for contemporary living.`;

    const derivedFullDescription =
      fullDescription.trim().length >= 10
        ? fullDescription.trim()
        : `${name.trim()} is an exquisite handcrafted furniture piece made with seasoned materials, precision joinery, and tailored luxury aesthetics.`;

    const finalImages = imageItems.map((img) => img.url);

    const finalImageDetails = imageItems.map((img, idx) => ({
      url: img.url,
      key: img.key || '',
      altText: img.altText || '',
      isPrimary: idx === 0,
      width: img.width,
      height: img.height,
    }));

    const cleanColorName = colorName.trim();
    const cleanColorHex = colorHex.trim() || '#211710';
    let effectiveColors = [...colors];
    if (cleanColorName) {
      const existingIdx = effectiveColors.findIndex(
        (c) => c.name.trim().toLowerCase() === cleanColorName.toLowerCase()
      );
      if (existingIdx >= 0) {
        effectiveColors[existingIdx] = {
          ...effectiveColors[existingIdx],
          name: cleanColorName,
          hex: cleanColorHex,
        };
      } else {
        effectiveColors = [
          { name: cleanColorName, hex: cleanColorHex, inStock: true },
          ...effectiveColors,
        ];
      }
    }

    const payload = {
      name: name.trim(),
      slug: finalSlug,
      sku: finalSku,
      category,
      categoryLabel: activeCategoryObj?.name || category,
      subCategory: derivedSubCategory,
      price: numericPrice,
      originalPrice: originalPrice ? Number(originalPrice) : 0,
      badge: badge.trim() || null,
      isBestseller,
      isFeatured,
      isActive: activeState,
      stockQuantity: inStock
        ? initialProduct?.stockQuantity && initialProduct.stockQuantity > 0
          ? initialProduct.stockQuantity
          : 100
        : 0,
      lowStockThreshold: initialProduct?.lowStockThreshold ?? 5,
      costPrice: initialProduct?.costPrice ?? 0,
      trackInventory: inStock ? Boolean(initialProduct?.trackInventory) : true,
      allowBackorders: inStock ? (initialProduct?.allowBackorders ?? true) : false,
      inStock,
      shortDescription: derivedShortDescription,
      fullDescription: derivedFullDescription,
      dimensions: {
        width: width.trim(),
        depth: depth.trim(),
        height: height.trim(),
        seatHeight: seatHeight.trim(),
        bedBaseHeight: bedBaseHeight.trim(),
        weight: weight.trim(),
      },
      materials: materialsArray.length > 0 ? materialsArray : ['Kiln-Dried Hardwood', 'High-Density Foam'],
      colorName: cleanColorName,
      colorHex: cleanColorHex,
      linkedVariantIds: linkedVariants.map((v) => v._id || v.id).filter(Boolean),
      colors: effectiveColors,
      images: finalImages,
      imageDetails: finalImageDetails,
      leadTime: leadTime.trim() || 'Complimentary White-Glove In-Home Delivery across AP (3–7 Days)',
      warranty: warranty.trim() || '10-Year Structural Frame & Termite Warranty',
      customSections: customSections
        .filter((s) => s.title.trim().length > 0)
        .map((s) => ({
          title: s.title.trim(),
          content: s.content.trim(),
          icon: s.icon || 'check',
        })),
      seoMeta: {
        title: seoTitle.trim() || name.trim(),
        description: seoDescription.trim() || derivedShortDescription,
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
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {isEdit && initialProduct && (
            <Link
              href={`/admin/products/new?variantOf=${encodeURIComponent(initialProduct._id || initialProduct.id)}`}
              className="px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-800 text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Another Color</span>
            </Link>
          )}
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

      {/* Variant Clone Info Banner */}
      {isColorVariantClone && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">
              Adding a New Color Variant in {activeCategoryObj?.name || category} → {subCategory || 'General'}
            </p>
            <p className="text-blue-700 mt-0.5">
              Specifications, Category, and Subcategory have been copied and sibling colors are pre-linked. Upload the new color&apos;s photos, set its Color Name &amp; Price, and publish.
            </p>
          </div>
        </div>
      )}

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
                value={activeCategoryObj ? (activeCategoryObj.slug || activeCategoryObj.id || category) : ''}
                onChange={(e) => handleCategorySelect(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 transition-colors cursor-pointer"
              >
                {!activeCategoryObj && (
                  <option value="" disabled>
                    -- Select an active category (current &quot;{category || 'none'}&quot; missing) --
                  </option>
                )}
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

            {/* Subcategory Dropdown & Custom Switcher */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs uppercase tracking-wider text-slate-700 font-medium">
                  Subcategory <span className="text-red-400">*</span>
                </label>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      const next = !isCustomSubcategory;
                      setIsCustomSubcategory(next);
                      if (next) {
                        setCustomSubcategoryText(subCategory || '');
                      } else if (availableSubcategories.length > 0) {
                        setSubCategory(availableSubcategories[0]);
                      }
                    }}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                  >
                    {isCustomSubcategory ? '← Choose from Dropdown' : '+ Add New Subcategory'}
                  </button>
                  <Link
                    href="/admin/categories"
                    target="_blank"
                    className="text-[10px] text-slate-400 hover:text-slate-600 transition-colors underline"
                    title="Manage all categories and subcategories in Categories section"
                  >
                    Categories Section ↗
                  </Link>
                </div>
              </div>

              {!isCustomSubcategory ? (
                <div className="space-y-2">
                  <select
                    value={subCategory}
                    onChange={(e) => {
                      if (e.target.value === '__add_new__') {
                        setIsCustomSubcategory(true);
                        setCustomSubcategoryText('');
                      } else {
                        setSubCategory(e.target.value);
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 transition-colors cursor-pointer"
                  >
                    {availableSubcategories.length === 0 ? (
                      <option value={subCategory || ''}>
                        {subCategory || `No subcategories configured for ${activeCategoryObj?.name || 'this category'}`}
                      </option>
                    ) : (
                      <>
                        {subCategory &&
                          !availableSubcategories.some(
                            (s) => s.toLowerCase() === subCategory.toLowerCase()
                          ) && (
                            <option value={subCategory} className="bg-white">
                              {subCategory}
                            </option>
                          )}
                        {availableSubcategories.map((sub) => (
                          <option key={sub} value={sub} className="bg-white">
                            {sub}
                          </option>
                        ))}
                      </>
                    )}
                    <option value="__add_new__" className="bg-white text-blue-600 font-semibold">
                      + Add New Subcategory to {activeCategoryObj?.name || 'Category'}...
                    </option>
                  </select>

                  {/* Quick Select Pill Suggestions */}
                  {availableSubcategories.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className="text-[10px] text-slate-400 font-medium">Quick Select:</span>
                      {availableSubcategories.map((sub) => (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => {
                            setSubCategory(sub);
                            setIsCustomSubcategory(false);
                          }}
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
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={customSubcategoryText}
                      onChange={(e) => {
                        setCustomSubcategoryText(e.target.value);
                        setSubCategory(e.target.value);
                      }}
                      placeholder={`Enter new subcategory for ${activeCategoryObj?.name || 'category'} (e.g. Ergonomic Loungers)...`}
                      className="w-full bg-white border border-blue-400 ring-2 ring-blue-500/10 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 transition-colors"
                      autoFocus
                    />
                  </div>
                  <p className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
                    <span className="font-bold">✓</span>
                    <span>This subcategory will automatically be saved to <strong>{activeCategoryObj?.name}</strong> in the Categories section when you add this product.</span>
                  </p>
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

            {/* Product Colour (Optional single colour shown on storefront) */}
            <div className="sm:col-span-2 pt-2 border-t border-slate-100">
              <label className="block text-xs uppercase tracking-wider text-slate-700 font-medium mb-1">
                Product Colour (Optional)
              </label>
              <p className="text-[11px] text-slate-500 mb-2.5">
                Set the colour name and swatch for this product (shown on the product page &amp; storefront colour filters).
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                <div className="sm:col-span-7">
                  <input
                    type="text"
                    placeholder="Colour Name (e.g. Walnut Brown, Ivory, Charcoal)"
                    value={colorName}
                    onChange={(e) => setColorName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 transition-colors"
                  />
                </div>
                <div className="sm:col-span-5 flex items-center gap-2">
                  <input
                    type="color"
                    value={/^#[0-9A-Fa-f]{6}$/.test(colorHex) ? colorHex : '#211710'}
                    onChange={(e) => setColorHex(e.target.value.toUpperCase())}
                    aria-label="Pick product colour swatch"
                    className="w-10 h-10 rounded-lg border border-slate-200 bg-white cursor-pointer p-0.5 shrink-0"
                  />
                  <input
                    type="text"
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    placeholder="#211710"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600 transition-colors"
                  />
                </div>
              </div>
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
                checked={inStock}
                onChange={(e) => setInStock(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-slate-50 border-slate-200"
              />
              <span>In Stock (Available for Order)</span>
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

        {/* SECTION 4: Color Variant Mapping */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <Palette className="w-4 h-4 text-blue-600" />
            <h2 className="font-serif text-lg text-slate-900 font-normal">
              4. Color Variant Mapping
            </h2>
          </div>

          {/* Same-Category/Subcategory Variant Mapping */}
          <ProductColorVariantMapper
            currentProductId={isEdit ? (initialProduct?._id || initialProduct?.id) : undefined}
            category={category}
            categoryLabel={activeCategoryObj?.name || category}
            subCategory={
              isCustomSubcategory
                ? customSubcategoryText
                : subCategory || availableSubcategories[0] || ''
            }
            colorName={colorName}
            colorHex={colorHex}
            onColorNameChange={setColorName}
            onColorHexChange={setColorHex}
            selectedVariants={linkedVariants}
            onSelectedVariantsChange={setLinkedVariants}
            previewProduct={{
              name,
              price: Number(price) || 0,
              originalPrice: Number(originalPrice) || 0,
              image: imageItems[0]?.url || '',
            }}
          />
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
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 leading-relaxed resize-y font-sans"
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

      </div>

      {/* Bottom Sticky Action Bar with live feedback */}
      <div className="space-y-3 sticky bottom-4 z-30">
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-950/95 border border-red-800 text-red-200 text-xs flex items-center gap-3 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="font-medium flex-1">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-950/95 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-3 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium flex-1">{successMessage}</span>
          </div>
        )}

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
    </div>
  );
}
