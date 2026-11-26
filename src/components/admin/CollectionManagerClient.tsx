'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  AlertCircle,
  Check,
  ArrowUp,
  ArrowDown,
  Save,
  ExternalLink,
  UploadCloud,
  Link2,
  Loader2,
  Eye,
  Sparkles,
  Tag,
} from 'lucide-react';
import { slugify } from '@/lib/validations/product';
import { formatINR } from '@/utils/currency';
import ImageUrlPreviewCard, { useValidatedImagePreview } from './ImageUrlPreviewCard';

export interface AdminCollectionItem {
  _id?: string;
  id: string;
  slug: string;
  legacyId?: string | null;
  title: string;
  category: string;
  subtitle?: string;
  tagline?: string;
  description: string;
  image: string;
  imageKey?: string;
  materials?: string[];
  piecesCount?: string;
  featuredProductIds?: string[];
  orderIndex: number;
  isActive?: boolean;
  seoMeta?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

interface CategoryOption {
  id: string;
  slug: string;
  name: string;
}

interface ProductOption {
  id: string;
  slug: string;
  legacyId?: string;
  sku: string;
  name: string;
  category: string;
  categoryLabel?: string;
  price: number;
  images: string[];
  isActive: boolean;
}

interface CollectionManagerClientProps {
  initialCollections: AdminCollectionItem[];
  categories: CategoryOption[];
  products: ProductOption[];
}

export default function CollectionManagerClient({
  initialCollections,
  categories,
  products,
}: CollectionManagerClientProps) {
  const [collections, setCollections] = useState<AdminCollectionItem[]>(initialCollections);
  const [search, setSearch] = useState('');
  const [hasOrderChanges, setHasOrderChanges] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<AdminCollectionItem | null>(null);
  const [showPreviewPane, setShowPreviewPane] = useState(false);

  // Delete confirmation modal
  const [deleteTarget, setDeleteTarget] = useState<AdminCollectionItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast / form error state
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Collection form fields (mapped 1:1 to existing Collection schema fields)
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formCategory, setFormCategory] = useState(categories[0]?.slug || '');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formTagline, setFormTagline] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPiecesCount, setFormPiecesCount] = useState('');
  const [formMaterials, setFormMaterials] = useState<string[]>([]);
  const [materialInput, setMaterialInput] = useState('');
  const [formFeaturedIds, setFormFeaturedIds] = useState<string[]>([]);
  const [featuredSearch, setFeaturedSearch] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formSeoTitle, setFormSeoTitle] = useState('');
  const [formSeoDescription, setFormSeoDescription] = useState('');
  const [formSeoKeywords, setFormSeoKeywords] = useState('');

  // Image Upload / Link state
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [formImage, setFormImage] = useState('');
  const [formImageKey, setFormImageKey] = useState('');
  const [imageTab, setImageTab] = useState<'upload' | 'url'>('upload');
  const [linkInput, setLinkInput] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const {
    trimmed: trimmedLink,
    isSyntaxValid: isLinkSyntaxValid,
    previewUrl: debouncedLinkPreview,
    previewError: linkPreviewError,
    setPreviewError: setLinkPreviewError,
    commitImmediately: commitLinkPreviewImmediately,
  } = useValidatedImagePreview(linkInput);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  const categoryNameBySlug = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of categories) {
      map.set(c.slug, c.name);
    }
    return map;
  }, [categories]);

  const productByRef = useMemo(() => {
    const map = new Map<string, ProductOption>();
    for (const p of products) {
      map.set(p.slug, p);
      if (p.id) map.set(p.id, p);
      if (p.legacyId) map.set(p.legacyId, p);
      if (p.sku) map.set(p.sku, p);
    }
    return map;
  }, [products]);

  const filteredCollections = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return collections;
    return collections.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        (categoryNameBySlug.get(c.category) || '').toLowerCase().includes(q) ||
        (c.subtitle || '').toLowerCase().includes(q)
    );
  }, [collections, search, categoryNameBySlug]);

  const filteredPickerProducts = useMemo(() => {
    const q = featuredSearch.trim().toLowerCase();
    return products
      .filter((p) => {
        if (!q) return true;
        return (
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          (p.categoryLabel || p.category).toLowerCase().includes(q)
        );
      })
      .slice(0, 30);
  }, [products, featuredSearch]);

  const openAddModal = () => {
    setEditingCollection(null);
    setFormError('');
    setFormTitle('');
    setFormSlug('');
    setFormCategory(categories[0]?.slug || '');
    setFormSubtitle('');
    setFormTagline('');
    setFormDescription('');
    setFormPiecesCount('');
    setFormMaterials([]);
    setMaterialInput('');
    setFormFeaturedIds([]);
    setFeaturedSearch('');
    setFormImage('');
    setFormImageKey('');
    setLinkInput('');
    setImageTab('upload');
    setFormIsActive(true);
    setFormSeoTitle('');
    setFormSeoDescription('');
    setFormSeoKeywords('');
    setShowPreviewPane(false);
    setIsModalOpen(true);
  };

  const openEditModal = (col: AdminCollectionItem) => {
    setEditingCollection(col);
    setFormError('');
    setFormTitle(col.title);
    setFormSlug(col.slug);
    setFormCategory(col.category || categories[0]?.slug || '');
    setFormSubtitle(col.subtitle || '');
    setFormTagline(col.tagline || '');
    setFormDescription(col.description || '');
    setFormPiecesCount(col.piecesCount || '');
    setFormMaterials(Array.isArray(col.materials) ? [...col.materials] : []);
    setMaterialInput('');
    setFormFeaturedIds(Array.isArray(col.featuredProductIds) ? [...col.featuredProductIds] : []);
    setFeaturedSearch('');
    setFormImage(col.image || '');
    setFormImageKey(col.imageKey || '');
    setLinkInput(col.image || '');
    setImageTab(col.imageKey ? 'upload' : col.image ? 'url' : 'upload');
    setFormIsActive(col.isActive !== false);
    setFormSeoTitle(col.seoMeta?.title || '');
    setFormSeoDescription(col.seoMeta?.description || '');
    setFormSeoKeywords(
      Array.isArray(col.seoMeta?.keywords) ? col.seoMeta!.keywords.join(', ') : ''
    );
    setShowPreviewPane(false);
    setIsModalOpen(true);
  };

  const handleApplyLink = () => {
    if (!trimmedLink) {
      setFormError('Please enter an image link / URL.');
      return;
    }
    if (!isLinkSyntaxValid) {
      setFormError('Please enter a valid, complete HTTP or HTTPS image URL.');
      return;
    }
    setFormError('');
    setFormImage(trimmedLink);
    setFormImageKey('');
    showToast('success', 'Collection cover photo applied');
  };

  const handleUploadImageFile = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    const type = file.type.toLowerCase();
    const isImage = type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp'].includes(ext || '');
    if (!isImage) {
      setFormError('Only JPG, PNG, and WebP images are supported.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setFormError('Image size exceeds the 8 MB limit.');
      return;
    }

    setIsUploadingImage(true);
    setFormError('');
    try {
      const sigRes = await fetch('/api/admin/uploads/signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          format: file.type,
          size: file.size,
          productIdentifier: formTitle ? slugify(formTitle) : 'collection',
        }),
      });
      const sigData = await sigRes.json();
      if (!sigRes.ok || !sigData.success) {
        throw new Error(sigData.message || 'Failed to generate Cloudinary signature');
      }

      const fd = new FormData();
      fd.append('file', file);
      fd.append('api_key', sigData.apiKey);
      fd.append('timestamp', sigData.timestamp.toString());
      fd.append('signature', sigData.signature);
      fd.append('folder', sigData.folder);
      fd.append('public_id', sigData.publicId);

      const uploadRes = await fetch(sigData.uploadUrl, { method: 'POST', body: fd });
      const uploadJson = await uploadRes.json();
      const uploadedUrl = uploadJson.secure_url || uploadJson.url;
      if (!uploadRes.ok || !uploadedUrl) {
        throw new Error('Failed to upload image to CDN');
      }

      setFormImage(uploadedUrl);
      setFormImageKey(uploadJson.public_id || sigData.publicId);
      setLinkInput(uploadedUrl);
      showToast('success', 'Collection cover uploaded to Cloudinary');
    } catch (err: any) {
      setFormError(err.message || 'Image upload failed');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const addMaterialTag = () => {
    const trimmed = materialInput.trim();
    if (!trimmed) return;
    if (!formMaterials.some((m) => m.toLowerCase() === trimmed.toLowerCase())) {
      setFormMaterials([...formMaterials, trimmed]);
    }
    setMaterialInput('');
  };

  const toggleFeaturedProduct = (slug: string) => {
    if (formFeaturedIds.includes(slug)) {
      setFormFeaturedIds(formFeaturedIds.filter((id) => id !== slug));
    } else {
      setFormFeaturedIds([...formFeaturedIds, slug]);
    }
  };

  const handleSaveCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formTitle.trim() || formTitle.trim().length < 2) {
      setFormError('Collection title must be at least 2 characters.');
      return;
    }
    if (!formCategory.trim()) {
      setFormError('Please select a referenced furniture category.');
      return;
    }
    if (!formDescription.trim() || formDescription.trim().length < 5) {
      setFormError('Description must be at least 5 characters.');
      return;
    }

    const effectiveImage = formImage.trim() || (isLinkSyntaxValid ? trimmedLink : '');
    if (!effectiveImage) {
      setFormError('Please upload a cover image or enter a valid image URL.');
      return;
    }

    setIsSubmitting(true);
    try {
      const targetId = editingCollection
        ? editingCollection._id || editingCollection.id || editingCollection.slug
        : '';
      const url = editingCollection
        ? `/api/admin/collections/${encodeURIComponent(targetId)}`
        : '/api/admin/collections';
      const method = editingCollection ? 'PATCH' : 'POST';

      const cleanSlug = formSlug.trim() ? slugify(formSlug.trim()) : undefined;
      const payload: Record<string, any> = {
        title: formTitle.trim(),
        ...(cleanSlug ? { slug: cleanSlug } : {}),
        category: formCategory.trim(),
        subtitle: formSubtitle.trim(),
        tagline: formTagline.trim(),
        description: formDescription.trim(),
        image: effectiveImage,
        imageKey: formImageKey.trim(),
        piecesCount: formPiecesCount.trim(),
        materials: formMaterials,
        featuredProductIds: formFeaturedIds,
        isActive: formIsActive,
        seoMeta: {
          title: formSeoTitle.trim(),
          description: formSeoDescription.trim(),
          keywords: formSeoKeywords,
        },
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save collection');
      }

      if (editingCollection) {
        setCollections((prev) =>
          prev.map((c) =>
            c.id === editingCollection.id || c._id === editingCollection._id
              ? data.collection
              : c
          )
        );
        showToast('success', `Collection "${data.collection.title}" updated and synced to storefront.`);
      } else {
        setCollections((prev) => [...prev, data.collection]);
        showToast('success', `Collection "${data.collection.title}" published to storefront.`);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Unable to save collection');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const targetId = deleteTarget._id || deleteTarget.id || deleteTarget.slug;
      const res = await fetch(`/api/admin/collections/${encodeURIComponent(targetId)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete collection');
      }
      setCollections((prev) =>
        prev.filter((c) => c.id !== deleteTarget.id && c._id !== deleteTarget._id)
      );
      showToast('success', data.message || `Collection "${deleteTarget.title}" removed`);
      setDeleteTarget(null);
    } catch (err: any) {
      showToast('error', err.message || 'Delete failed');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMove = (id: string, dir: 'up' | 'down') => {
    const idx = collections.findIndex((c) => c.id === id || c.slug === id);
    if (idx === -1) return;
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= collections.length) return;
    const next = [...collections];
    const [item] = next.splice(idx, 1);
    next.splice(swapIdx, 0, item);
    setCollections(next.map((c, i) => ({ ...c, orderIndex: i + 1 })));
    setHasOrderChanges(true);
  };

  const handleSaveOrder = async () => {
    setIsSavingOrder(true);
    try {
      const orders = collections.map((c, idx) => ({
        id: c._id || c.id || c.slug,
        orderIndex: idx + 1,
      }));
      const res = await fetch('/api/admin/collections/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save order');
      }
      setHasOrderChanges(false);
      showToast('success', 'Collection display order updated on storefront');
    } catch (err: any) {
      showToast('error', err.message || 'Order save failed');
    } finally {
      setIsSavingOrder(false);
    }
  };

  const resolvedPreviewProducts = formFeaturedIds
    .map((ref) => productByRef.get(ref))
    .filter((p): p is ProductOption => Boolean(p));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/admin/dashboard" className="hover:text-blue-600 transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-blue-600 font-medium">Collections</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-blue-600" />
            <span>Curated Collections ({collections.length})</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage curated room suites, category links, harmonized finishes, and featured pieces shown on /collections.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {hasOrderChanges && (
            <button
              type="button"
              onClick={handleSaveOrder}
              disabled={isSavingOrder}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              {isSavingOrder ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Order Changes</span>
            </button>
          )}
          <Link
            href="/collections"
            target="_blank"
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Storefront</span>
          </Link>
          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Collection</span>
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs font-medium ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
          <button type="button" onClick={() => setToast(null)} className="p-1 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search collections by title, slug, or category..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white"
          />
        </div>
      </div>

      {/* Collections Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {filteredCollections.length === 0 ? (
          <div className="py-16 text-center px-4">
            <Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 mb-1">No collections found</h3>
            <p className="text-xs text-slate-500 mb-4">
              Create curated furniture suites to showcase room pairings on the storefront.
            </p>
            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create First Collection</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 uppercase tracking-wider text-[11px] font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Collection</th>
                  <th className="py-3.5 px-4">Category Link</th>
                  <th className="py-3.5 px-4">Featured Pieces</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Order</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredCollections.map((col, idx) => {
                  const isFirst = idx === 0;
                  const isLast = idx === filteredCollections.length - 1;
                  const featCount = Array.isArray(col.featuredProductIds)
                    ? col.featuredProductIds.length
                    : 0;

                  return (
                    <tr key={col.id || col.slug} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                            {col.image && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={col.image}
                                alt={col.title}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900">{col.title}</div>
                            <div className="text-[11px] text-slate-500 font-mono truncate">
                              /{col.slug}
                              {col.piecesCount ? ` · ${col.piecesCount}` : ''}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-medium text-slate-700">
                          {categoryNameBySlug.get(col.category) || col.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap items-center gap-1 max-w-xs">
                          <span className="font-semibold text-slate-900 mr-1">{featCount}</span>
                          {(col.featuredProductIds || []).slice(0, 2).map((fid) => (
                            <span
                              key={fid}
                              className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] truncate max-w-[130px]"
                            >
                              {productByRef.get(fid)?.name || fid}
                            </span>
                          ))}
                          {featCount > 2 && (
                            <span className="text-[10px] text-slate-500">+{featCount - 2} more</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {col.isActive !== false ? (
                          <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            Hidden
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-slate-500 mr-1">#{col.orderIndex || idx + 1}</span>
                          {!search && (
                            <>
                              <button
                                type="button"
                                disabled={isFirst}
                                onClick={() => handleMove(col.id || col.slug, 'up')}
                                title="Move collection up"
                                className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-25 cursor-pointer"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={isLast}
                                onClick={() => handleMove(col.id || col.slug, 'down')}
                                title="Move collection down"
                                className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-25 cursor-pointer"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href="/collections"
                            target="_blank"
                            title="View collection on storefront"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => openEditModal(col)}
                            title="Edit collection"
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(col)}
                            title="Delete collection"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Collection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingCollection ? `Edit Collection: ${editingCollection.title}` : 'Create New Collection'}
                </h2>
                <p className="text-[11px] text-slate-500">
                  Uses existing Collection fields and immediately syncs with /collections.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPreviewPane((p) => !p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 cursor-pointer ${
                    showPreviewPane
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{showPreviewPane ? 'Hide Preview' : 'Preview Storefront Card'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  aria-label="Close collection modal"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveCollection} className="overflow-y-auto flex-1 p-6 space-y-5">
              {formError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {showPreviewPane && (
                <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E9D8C5] space-y-4">
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-widest font-semibold text-[#855214]">
                    <span>Live /collections Preview</span>
                    <span>{formIsActive ? 'Visible on storefront' : 'Hidden draft'}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                    <div className="md:col-span-6">
                      <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-[#EAE2D8] border border-[#E9D8C5]">
                        {formImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={formImage} alt={formTitle || 'Collection'} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                            No cover photo selected
                          </div>
                        )}
                        {formPiecesCount && (
                          <div className="absolute top-3 left-3 bg-[#211710]/85 text-[#F8F0E8] text-[10px] uppercase tracking-widest px-2.5 py-1 rounded">
                            {formPiecesCount}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="md:col-span-6 space-y-2">
                      {formSubtitle && (
                        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#D69A4B] block">
                          {formSubtitle}
                        </span>
                      )}
                      <h3 className="font-serif text-2xl text-[#211A15]">
                        {formTitle || 'Collection Title'}
                      </h3>
                      {formTagline && (
                        <p className="text-xs italic text-[#49301F]">&ldquo;{formTagline}&rdquo;</p>
                      )}
                      <p className="text-xs text-[#6B6157] leading-relaxed">
                        {formDescription || 'Collection editorial overview appears here.'}
                      </p>
                      {formMaterials.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {formMaterials.map((m) => (
                            <span
                              key={m}
                              className="text-[11px] bg-white px-2.5 py-0.5 rounded-full border border-[#E9D8C5] text-[#211A15]"
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="text-[11px] font-semibold text-[#211A15] pt-1">
                        Category Link: {categoryNameBySlug.get(formCategory) || formCategory || '—'} ·{' '}
                        Featured Products: {resolvedPreviewProducts.length}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Collection Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormTitle(val);
                      if (!editingCollection) setFormSlug(slugify(val));
                    }}
                    placeholder="e.g. Modern Living Collection"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    placeholder="modern-living"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Linked Storefront Category *
                  </label>
                  <select
                    required
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    aria-label="Collection Category"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name} ({c.slug})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Pieces Summary Badge (`piecesCount`)
                  </label>
                  <input
                    type="text"
                    value={formPiecesCount}
                    onChange={(e) => setFormPiecesCount(e.target.value)}
                    placeholder="e.g. 8 Coordinated Pieces"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={formSubtitle}
                    onChange={(e) => setFormSubtitle(e.target.value)}
                    placeholder="e.g. Architectural Serenity"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Tagline Quote
                  </label>
                  <input
                    type="text"
                    value={formTagline}
                    onChange={(e) => setFormTagline(e.target.value)}
                    placeholder="e.g. Crafted for quiet luxury living rooms"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Collection Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Describe the design language, room harmony, and signature materials of this collection..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              {/* Cover Image Upload / Validated URL Preview */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-800">Cover Image *</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setImageTab('upload')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                        imageTab === 'upload'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>Upload Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageTab('url')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                        imageTab === 'url'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      <span>Add by Image Link / URL</span>
                    </button>
                  </div>
                </div>

                {formImage && (
                  <div className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={formImage} alt="Selected cover" className="w-16 h-12 rounded-lg object-cover border border-slate-200 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-[11px] font-semibold text-emerald-700 block">Selected Cover Photo</span>
                      <span className="text-[11px] text-slate-500 font-mono truncate block">{formImage}</span>
                    </div>
                  </div>
                )}

                {imageTab === 'upload' ? (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleUploadImageFile(e.target.files[0]);
                      }}
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={isUploadingImage}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl bg-white hover:border-blue-400 text-xs text-slate-600 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isUploadingImage ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                          <span>Uploading to Cloudinary...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-4 h-4 text-blue-600" />
                          <span>Click to upload JPG, PNG, or WebP cover image</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={linkInput}
                        onChange={(e) => setLinkInput(e.target.value)}
                        onPaste={(e) => {
                          const pasted = e.clipboardData?.getData('text') || '';
                          if (pasted) commitLinkPreviewImmediately(pasted);
                        }}
                        placeholder="https://images.unsplash.com/... or https://res.cloudinary.com/..."
                        className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
                      />
                      <button
                        type="button"
                        onClick={handleApplyLink}
                        disabled={!trimmedLink}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-semibold rounded-xl cursor-pointer shrink-0"
                      >
                        Use Photo
                      </button>
                    </div>
                    <ImageUrlPreviewCard
                      rawInput={linkInput}
                      previewUrl={debouncedLinkPreview}
                      previewError={linkPreviewError}
                      onPreviewError={() => setLinkPreviewError(true)}
                      actionLabel="Apply this photo to collection →"
                      onApply={handleApplyLink}
                    />
                  </div>
                )}
              </div>

              {/* Materials / Finishes */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Harmonized Materials / Finishes
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={materialInput}
                    onChange={(e) => setMaterialInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addMaterialTag();
                      }
                    }}
                    placeholder="e.g. Solid Burma Teak, Bouclé Fabric"
                    className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={addMaterialTag}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold cursor-pointer"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {formMaterials.map((mat) => (
                    <span
                      key={mat}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-medium text-slate-800"
                    >
                      <Tag className="w-3 h-3 text-blue-600" />
                      <span>{mat}</span>
                      <button
                        type="button"
                        onClick={() => setFormMaterials(formMaterials.filter((m) => m !== mat))}
                        className="text-slate-400 hover:text-red-600 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Featured Products Selector */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">
                      Featured Products ({formFeaturedIds.length} selected)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Select existing catalog products shown under &ldquo;Featured Pieces&rdquo; on /collections.
                    </span>
                  </div>
                  <input
                    type="text"
                    value={featuredSearch}
                    onChange={(e) => setFeaturedSearch(e.target.value)}
                    placeholder="Search catalog products..."
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 w-56 focus:outline-none focus:border-blue-600"
                  />
                </div>

                {formFeaturedIds.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {formFeaturedIds.map((slug) => {
                      const prod = productByRef.get(slug);
                      return (
                        <span
                          key={slug}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-[11px] font-medium text-blue-900"
                        >
                          <Sparkles className="w-3 h-3 text-blue-600" />
                          <span>{prod?.name || slug}</span>
                          <button
                            type="button"
                            onClick={() => toggleFeaturedProduct(slug)}
                            className="text-blue-600 hover:text-red-600 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}

                <div className="max-h-44 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2 pr-1">
                  {filteredPickerProducts.map((p) => {
                    const checked = formFeaturedIds.includes(p.slug);
                    return (
                      <label
                        key={p.id}
                        className={`flex items-center gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                          checked
                            ? 'bg-blue-50/70 border-blue-300'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleFeaturedProduct(p.slug)}
                          className="rounded border-slate-300 text-blue-600"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-slate-900 truncate">{p.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono truncate">
                            {p.sku} · {formatINR(p.price)} {!p.isActive ? '(Draft)' : ''}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Active status & SEO Meta */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600"
                  />
                  <div>
                    <span className="font-semibold text-slate-900 block">Active on Storefront</span>
                    <span className="text-[11px] text-slate-500">
                      Publish collection publicly on /collections
                    </span>
                  </div>
                </label>

                <div className="space-y-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                    SEO Metadata (Optional)
                  </span>
                  <input
                    type="text"
                    value={formSeoTitle}
                    onChange={(e) => setFormSeoTitle(e.target.value)}
                    placeholder="SEO Title"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900"
                  />
                  <input
                    type="text"
                    value={formSeoDescription}
                    onChange={(e) => setFormSeoDescription(e.target.value)}
                    placeholder="SEO Meta Description"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900"
                  />
                  <input
                    type="text"
                    value={formSeoKeywords}
                    onChange={(e) => setFormSeoKeywords(e.target.value)}
                    placeholder="SEO Keywords (comma separated)"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingCollection ? 'Update Collection' : 'Create Collection'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Safe Removal Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center mb-4">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Remove Collection?</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Are you sure you want to delete <strong className="text-slate-900">&quot;{deleteTarget.title}&quot;</strong>?
              Products and categories referenced inside this collection will remain completely intact.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Confirm Delete Collection</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
