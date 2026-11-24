'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FolderTree,
  Plus,
  Trash2,
  Edit2,
  X,
  Search,
  Check,
  AlertCircle,
  Tag,
  ArrowUpDown,
  ExternalLink,
} from 'lucide-react';
import { slugify } from '@/lib/validations/product';

interface CategoryItem {
  _id?: string;
  id: string;
  name: string;
  slug: string;
  title?: string;
  description?: string;
  image?: string;
  subcategories: string[];
  orderIndex: number;
  itemCount?: number;
  isActive?: boolean;
}

interface CategoryManagerClientProps {
  initialCategories: CategoryItem[];
}

export default function CategoryManagerClient({ initialCategories }: CategoryManagerClientProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);

  // Sync state if initialCategories updates from server revalidation
  React.useEffect(() => {
    if (Array.isArray(initialCategories) && initialCategories.length > 0) {
      setCategories(initialCategories);
    }
  }, [initialCategories]);

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formOrder, setFormOrder] = useState<number>(0);
  const [formSubcategories, setFormSubcategories] = useState<string[]>([]);
  const [newSubcatInput, setNewSubcatInput] = useState('');

  // Inline quick-add subcategory states (mapped by category id)
  const [inlineSubcatInputs, setInlineSubcatInputs] = useState<Record<string, string>>({});
  const [savingInlineId, setSavingInlineId] = useState<string | null>(null);

  // Notification Toast
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setFormName('');
    setFormSlug('');
    setFormTitle('');
    setFormDescription('');
    setFormOrder(categories.length + 1);
    setFormSubcategories([]);
    setNewSubcatInput('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setFormName(cat.name || '');
    setFormSlug(cat.slug || '');
    setFormTitle(cat.title || cat.name || '');
    setFormDescription(cat.description || '');
    setFormOrder(cat.orderIndex ?? 0);
    setFormSubcategories([...(cat.subcategories || [])]);
    setNewSubcatInput('');
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setFormName(val);
    if (!editingCategory) {
      const generatedSlug = slugify(val);
      setFormSlug(generatedSlug);
      setFormTitle(val);
    }
  };

  const addFormSubcategory = () => {
    const val = newSubcatInput.trim();
    if (val && !formSubcategories.includes(val)) {
      setFormSubcategories([...formSubcategories, val]);
      setNewSubcatInput('');
    }
  };

  const removeFormSubcategory = (sub: string) => {
    setFormSubcategories(formSubcategories.filter((s) => s !== sub));
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('error', 'Category name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const finalSlug = editingCategory ? editingCategory.slug : (formSlug.trim() || slugify(formName.trim()));
      const payload = {
        name: formName.trim(),
        slug: finalSlug,
        title: formTitle.trim() || formName.trim(),
        description: formDescription.trim() || `Handcrafted ${formName.trim()} by MNC LifeStyle.`,
        orderIndex: Number(formOrder) || 0,
        subcategories: formSubcategories,
      };

      const categoryIdentifier = editingCategory
        ? (editingCategory._id || editingCategory.id || editingCategory.slug)
        : null;
      const url = categoryIdentifier
        ? `/api/admin/categories/${encodeURIComponent(categoryIdentifier)}`
        : '/api/admin/categories';
      const method = editingCategory ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save category');
      }

      if (editingCategory) {
        const updatedCat: CategoryItem = {
          ...editingCategory,
          name: formName.trim(),
          title: formTitle.trim(),
          description: formDescription.trim(),
          orderIndex: Number(formOrder) || 0,
          subcategories: formSubcategories,
          ...(data.category || {}),
        };

        setCategories((prev) =>
          prev.map((c) =>
            (c.id === editingCategory.id || c._id === editingCategory._id || c.slug === editingCategory.slug)
              ? { ...c, ...updatedCat }
              : c
          )
        );
        showToast('success', `Category "${formName}" updated successfully`);
      } else {
        const newCat: CategoryItem = data.category || {
          id: data.id || `cat-${Date.now()}`,
          name: formName.trim(),
          slug: payload.slug,
          title: formTitle.trim(),
          description: formDescription.trim(),
          orderIndex: Number(formOrder) || 0,
          subcategories: formSubcategories,
        };
        setCategories((prev) => [...prev, newCat]);
        showToast('success', `Category "${formName}" added successfully`);
      }

      setIsModalOpen(false);
      router.refresh();
    } catch (err: any) {
      console.error('Error saving category:', err);
      showToast('error', err.message || 'An error occurred while saving category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (cat: CategoryItem) => {
    if (!window.confirm(`Are you sure you want to delete category "${cat.name}"? Products under this category will need reassignment.`)) {
      return;
    }

    setDeletingId(cat.id);
    try {
      const res = await fetch(`/api/admin/categories/${cat.id || cat.slug}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete category');
      }

      setCategories((prev) => prev.filter((c) => c.id !== cat.id && c.slug !== cat.slug));
      showToast('success', `Category "${cat.name}" deleted successfully`);
      router.refresh();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete category');
    } finally {
      setDeletingId(null);
    }
  };

  // Quick inline add subcategory to category
  const handleInlineAddSubcategory = async (cat: CategoryItem) => {
    const inputVal = (inlineSubcatInputs[cat.id] || '').trim();
    if (!inputVal) return;

    if (cat.subcategories?.includes(inputVal)) {
      showToast('error', `Subcategory "${inputVal}" already exists in ${cat.name}`);
      return;
    }

    const updatedSubcategories = [...(cat.subcategories || []), inputVal];
    setSavingInlineId(cat.id);

    try {
      const catIdentifier = cat._id || cat.id || cat.slug;
      const res = await fetch(`/api/admin/categories/${encodeURIComponent(catIdentifier)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subcategories: updatedSubcategories }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to add subcategory');
      }

      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id || c._id === cat._id || c.slug === cat.slug ? { ...c, subcategories: updatedSubcategories } : c))
      );
      setInlineSubcatInputs((prev) => ({ ...prev, [cat.id]: '' }));
      showToast('success', `Added "${inputVal}" to ${cat.name}`);
      router.refresh();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to add subcategory');
    } finally {
      setSavingInlineId(null);
    }
  };

  // Quick inline remove subcategory from category
  const handleInlineRemoveSubcategory = async (cat: CategoryItem, subToRemove: string) => {
    const updatedSubcategories = (cat.subcategories || []).filter((s) => s !== subToRemove);

    try {
      const catIdentifier = cat._id || cat.id || cat.slug;
      const res = await fetch(`/api/admin/categories/${encodeURIComponent(catIdentifier)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subcategories: updatedSubcategories }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to remove subcategory');
      }

      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id || c._id === cat._id || c.slug === cat.slug ? { ...c, subcategories: updatedSubcategories } : c))
      );
      showToast('success', `Removed "${subToRemove}" from ${cat.name}`);
      router.refresh();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to remove subcategory');
    }
  };

  const filteredCategories = categories.filter((cat) => {
    const q = search.toLowerCase();
    return (
      cat.name.toLowerCase().includes(q) ||
      cat.slug.toLowerCase().includes(q) ||
      (cat.subcategories && cat.subcategories.some((s) => s.toLowerCase().includes(q)))
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2.5 text-sm font-medium animate-in slide-in-from-top duration-200 ${
            toast.type === 'success'
              ? 'bg-blue-50 border-blue-200 text-blue-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          {toast.type === 'success' ? (
            <Check className="w-4 h-4 text-blue-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/admin/dashboard" className="hover:text-blue-600 transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-blue-600 font-medium">Categories & Subcategories</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FolderTree className="w-6 h-6 text-blue-600" />
            <span>Categories ({categories.length})</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your furniture catalog categories and configure dynamic subcategories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Category</span>
          </button>
        </div>
      </div>

      {/* Search and Stats Row */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories or subcategories..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs"
          />
        </div>
        <div className="text-xs text-slate-500 flex items-center gap-3">
          <span>Showing {filteredCategories.length} of {categories.length} categories</span>
        </div>
      </div>

      {/* Categories List Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="py-3.5 px-5">Category Name</th>
                <th className="py-3.5 px-5">Subcategories ({filteredCategories.reduce((acc, c) => acc + (c.subcategories?.length || 0), 0)} Total)</th>
                <th className="py-3.5 px-4 text-center">Order</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    No categories found matching &quot;{search}&quot;.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr key={cat.id || cat.slug} className="hover:bg-slate-50/70 transition-colors align-top">
                    {/* 1. Name & Title */}
                    <td className="py-4 px-5">
                      <div className="font-semibold text-slate-900 text-[13px] flex items-center gap-1.5">
                        <span>{cat.name}</span>
                        <Link
                          href={`/category/${cat.slug}`}
                          target="_blank"
                          className="text-slate-400 hover:text-blue-600 transition-colors"
                          title="View storefront category"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                      {cat.title && cat.title !== cat.name && (
                        <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {cat.title}
                        </div>
                      )}
                    </td>

                    {/* Subcategories with Inline Quick Add & Delete */}
                    <td className="py-4 px-5">
                      <div className="flex flex-wrap gap-1.5 items-center mb-2.5">
                        {(!cat.subcategories || cat.subcategories.length === 0) ? (
                          <span className="text-[11px] text-slate-400 italic">No subcategories defined</span>
                        ) : (
                          cat.subcategories.map((sub) => (
                            <span
                              key={sub}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200"
                            >
                              <span>{sub}</span>
                              <button
                                type="button"
                                onClick={() => handleInlineRemoveSubcategory(cat, sub)}
                                className="text-blue-400 hover:text-blue-700 rounded p-0.5"
                                title={`Remove "${sub}"`}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))
                        )}
                      </div>

                      {/* Inline Add Subcategory input */}
                      <div className="flex items-center gap-1.5 max-w-xs">
                        <input
                          type="text"
                          value={inlineSubcatInputs[cat.id] || ''}
                          onChange={(e) =>
                            setInlineSubcatInputs({ ...inlineSubcatInputs, [cat.id]: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleInlineAddSubcategory(cat);
                            }
                          }}
                          placeholder="+ Add subcategory..."
                          className="flex-1 px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleInlineAddSubcategory(cat)}
                          disabled={savingInlineId === cat.id || !inlineSubcatInputs[cat.id]?.trim()}
                          className="px-2.5 py-1 text-xs font-semibold bg-slate-900 hover:bg-blue-600 disabled:opacity-40 text-white rounded-lg transition-colors cursor-pointer"
                        >
                          {savingInlineId === cat.id ? 'Saving...' : 'Add'}
                        </button>
                      </div>
                    </td>

                    {/* 4. Order */}
                    <td className="py-4 px-4 text-center font-mono font-medium text-slate-700">
                      {cat.orderIndex ?? 0}
                    </td>

                    {/* 5. Actions */}
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(cat)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit Category & Subcategories"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat)}
                          disabled={deletingId === cat.id}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Living Room, Recliners, Dining Sets"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formOrder}
                  onChange={(e) => setFormOrder(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  SEO Title / Heading
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Luxury Handcrafted Sofas"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Brief editorial description for this category..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              {/* Subcategories Chip Builder */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subcategories
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newSubcatInput}
                    onChange={(e) => setNewSubcatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addFormSubcategory();
                      }
                    }}
                    placeholder="Type subcategory (e.g. 3-Seaters, Sectionals) and press Enter"
                    className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                  <button
                    type="button"
                    onClick={addFormSubcategory}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-blue-600 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl min-h-[44px]">
                  {formSubcategories.length === 0 ? (
                    <span className="text-[11px] text-slate-400 italic">No subcategories added yet</span>
                  ) : (
                    formSubcategories.map((sub) => (
                      <span
                        key={sub}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                      >
                        <span>{sub}</span>
                        <button
                          type="button"
                          onClick={() => removeFormSubcategory(sub)}
                          className="text-blue-400 hover:text-blue-700"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
