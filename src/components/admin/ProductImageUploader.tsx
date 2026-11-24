'use client';

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import {
  UploadCloud,
  ImageIcon,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Star,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Link2,
} from 'lucide-react';
import { MAX_FILE_SIZE_BYTES, MAX_GALLERY_IMAGES, ALLOWED_FORMATS } from '@/lib/storage/cloudinary-constants';

export interface UploadedImageItem {
  url: string;
  key?: string; // Cloudinary public_id
  altText?: string;
  isPrimary?: boolean;
  width?: number;
  height?: number;
}

interface ProductImageUploaderProps {
  images: UploadedImageItem[];
  onChange: (images: UploadedImageItem[]) => void;
  productIdentifier?: string; // SKU or slug to name uploaded assets
}

export default function ProductImageUploader({
  images,
  onChange,
  productIdentifier = 'furniture',
}: ProductImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<Array<{ name: string; progress: number }>>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadTab, setUploadTab] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [urlPreviewError, setUrlPreviewError] = useState(false);
  const [showUrlField, setShowUrlField] = useState(false);

  // Validate file client-side
  const validateFile = (file: File): string | null => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    const type = file.type.toLowerCase();

    const isValidExt = ALLOWED_FORMATS.some((f) => f === ext || (f === 'jpg' && ext === 'jpeg'));
    const isValidType =
      type.startsWith('image/jpeg') ||
      type.startsWith('image/jpg') ||
      type.startsWith('image/png') ||
      type.startsWith('image/webp');

    if (!isValidExt && !isValidType) {
      return `"${file.name}" has an unsupported format. Allowed: JPG, PNG, WebP.`;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `"${file.name}" exceeds the 8 MB maximum file size (${(file.size / (1024 * 1024)).toFixed(1)} MB).`;
    }

    return null;
  };

  // Upload individual file directly to Cloudinary using signed upload
  const uploadSingleFile = async (file: File): Promise<UploadedImageItem | null> => {
    // 1. Request signature from server
    const sigRes = await fetch('/api/admin/uploads/signature', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: file.name,
        format: file.type,
        size: file.size,
        productIdentifier,
      }),
    });

    const sigData = await sigRes.json();
    if (!sigRes.ok || !sigData.success) {
      throw new Error(sigData.message || `Signature generation failed for ${file.name}`);
    }

    // 2. Perform direct upload to Cloudinary CDN
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', sigData.uploadUrl, true);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadingFiles((prev) =>
            prev.map((item) => (item.name === file.name ? { ...item, progress } : item))
          );
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve({
              url: data.secure_url || data.url,
              key: data.public_id,
              altText: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
              width: data.width,
              height: data.height,
              isPrimary: images.length === 0,
            });
          } catch (err) {
            reject(new Error('Failed to parse Cloudinary response.'));
          }
        } else {
          try {
            const errData = JSON.parse(xhr.responseText);
            reject(new Error(errData.error?.message || `Upload failed with status ${xhr.status}`));
          } catch {
            reject(new Error(`Upload failed with HTTP ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error occurred during direct Cloudinary upload.'));
      };

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', sigData.apiKey);
      formData.append('timestamp', sigData.timestamp.toString());
      formData.append('signature', sigData.signature);
      formData.append('folder', sigData.folder);
      formData.append('public_id', sigData.publicId);

      xhr.send(formData);
    });
  };

  // Handle file list batch upload
  const handleFiles = async (filesList: FileList | File[]) => {
    setErrorMessage('');
    const filesArray = Array.from(filesList);

    if (images.length + filesArray.length > MAX_GALLERY_IMAGES) {
      setErrorMessage(`Maximum limit is ${MAX_GALLERY_IMAGES} images per product.`);
      return;
    }

    // Validate all files first
    for (const file of filesArray) {
      const err = validateFile(file);
      if (err) {
        setErrorMessage(err);
        return;
      }
    }

    // Initialize progress tracking
    setUploadingFiles(filesArray.map((f) => ({ name: f.name, progress: 0 })));

    const newUploadedItems: UploadedImageItem[] = [];

    for (const file of filesArray) {
      try {
        const item = await uploadSingleFile(file);
        if (item) {
          newUploadedItems.push(item);
        }
      } catch (err: any) {
        setErrorMessage(err.message || `Failed to upload "${file.name}"`);
      }
    }

    setUploadingFiles([]);

    if (newUploadedItems.length > 0) {
      const updated = [...images, ...newUploadedItems].map((item, idx) => ({
        ...item,
        isPrimary: idx === 0,
      }));
      onChange(updated);
    }
  };

  // Drag & drop listeners
  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const onFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  // Manual URL helper
  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    try {
      new URL(urlInput.trim());
    } catch {
      setErrorMessage('Please enter a valid HTTP/HTTPS image URL.');
      return;
    }

    if (images.length >= MAX_GALLERY_IMAGES) {
      setErrorMessage(`Maximum ${MAX_GALLERY_IMAGES} gallery images permitted.`);
      return;
    }

    const newItem: UploadedImageItem = {
      url: urlInput.trim(),
      altText: '',
      isPrimary: images.length === 0,
    };

    const updated = [...images, newItem].map((img, i) => ({ ...img, isPrimary: i === 0 }));
    onChange(updated);
    setUrlInput('');
    setShowUrlField(false);
  };

  // Gallery ordering & primary manipulation
  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    const copy = [...images];
    const selected = copy.splice(index, 1)[0];
    copy.unshift(selected);
    const updated = copy.map((item, idx) => ({ ...item, isPrimary: idx === 0 }));
    onChange(updated);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= images.length) return;
    const copy = [...images];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;
    const updated = copy.map((item, idx) => ({ ...item, isPrimary: idx === 0 }));
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    setErrorMessage('');
    const copy = images.filter((_, i) => i !== index);
    const updated = copy.map((item, idx) => ({ ...item, isPrimary: idx === 0 }));
    onChange(updated);
  };

  const handleAltTextChange = (index: number, altText: string) => {
    const copy = [...images];
    copy[index] = { ...copy[index], altText };
    onChange(copy);
  };

  return (
    <div className="space-y-5 text-left font-sans">
      {/* Error Message Alert */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage('')}
            className="text-red-300 hover:text-white"
          >
            ×
          </button>
        </div>
      )}

      {/* Upload Method Switcher: File Upload vs URL Link */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setUploadTab('upload')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            uploadTab === 'upload'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Upload Image File</span>
        </button>
        <button
          type="button"
          onClick={() => setUploadTab('url')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            uploadTab === 'url'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Link2 className="w-3.5 h-3.5" />
          <span>Add by Image Link / URL</span>
        </button>
      </div>

      {/* Mode A: Direct Cloudinary Drag & Drop Zone */}
      {uploadTab === 'upload' && (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-blue-600 bg-blue-50 scale-[1.01]'
              : 'border-slate-200 hover:border-blue-600/60 bg-slate-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            onChange={onFileInputChange}
            className="hidden"
          />

          <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-blue-600/30 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-sm">
            <UploadCloud className="w-6 h-6" />
          </div>

          <h3 className="font-serif text-base text-slate-900 font-normal mb-1">
            Direct Cloudinary Image Upload
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-3">
            Drag and drop product photos here, or <span className="text-blue-600 font-medium underline">browse files</span>. Signed direct browser upload to Cloudinary.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-400">
            <span>Formats: JPG, PNG, WebP</span>
            <span>•</span>
            <span>Max file size: 8 MB</span>
            <span>•</span>
            <span>Up to 10 gallery images</span>
          </div>
        </div>
      )}

      {/* Mode B: Add Image by Direct Link / URL with Live Preview */}
      {uploadTab === 'url' && (
        <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Image Link / URL
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                placeholder="Paste direct image link (e.g. https://images.unsplash.com/... or https://res.cloudinary.com/...)"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  setUrlPreviewError(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddUrl();
                  }
                }}
                className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs"
              />
              <button
                type="button"
                onClick={handleAddUrl}
                disabled={!urlInput.trim()}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
              >
                Add Image to Product
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Supports any direct public image URL (Unsplash, Cloudinary, AWS S3, etc.).
            </p>
          </div>

          {/* Live Preview */}
          {urlInput.trim() && (
            <div className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center gap-3.5 shadow-2xs">
              <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                {urlPreviewError ? (
                  <div className="text-center p-1 text-red-500">
                    <AlertCircle className="w-4 h-4 mx-auto mb-0.5 text-red-400" />
                    <span className="text-[9px]">Invalid URL</span>
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={urlInput.trim()}
                    alt="Live link preview"
                    onError={() => setUrlPreviewError(true)}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800">
                  {urlPreviewError ? 'Unable to load image from this URL' : 'Live Image Preview'}
                </p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5 font-mono" title={urlInput}>
                  {urlInput}
                </p>
                {!urlPreviewError && (
                  <button
                    type="button"
                    onClick={handleAddUrl}
                    className="mt-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Click to add this image to gallery →
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active Uploads Progress Indicator */}
      {uploadingFiles.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span>Uploading directly to Cloudinary CDN ({uploadingFiles.length} files)...</span>
          </div>
          {uploadingFiles.map((f, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-700">
                <span className="truncate max-w-xs">{f.name}</span>
                <span className="font-mono">{f.progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-150"
                  style={{ width: `${f.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Gallery Image Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            Product Gallery ({images.length} of {MAX_GALLERY_IMAGES})
          </span>
          <button
            type="button"
            onClick={() => setShowUrlField(!showUrlField)}
            className="text-blue-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <Link2 className="w-3 h-3" />
            <span>{showUrlField ? 'Close URL input' : 'Enter external image URL'}</span>
          </button>
        </div>

        {/* Optional Manual URL Input */}
        {showUrlField && (
          <div className="flex gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <input
              type="url"
              placeholder="Paste existing image URL (e.g., Unsplash or external CDN)..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
            />
            <button
              type="button"
              onClick={handleAddUrl}
              className="px-4 py-2 rounded-xl bg-slate-100 border border-blue-200 text-blue-600 text-xs font-semibold hover:bg-slate-200 cursor-pointer shrink-0"
            >
              Add URL
            </button>
          </div>
        )}

        {/* Images List */}
        <div className="space-y-3">
          {images.length === 0 && (
            <div className="p-8 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 text-center flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2.5">
                <ImageIcon className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-700">No product images added yet</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
                Upload photos using the dropzone above or click &ldquo;Enter external image URL&rdquo; to add public photo links.
              </p>
            </div>
          )}
          {images.map((img, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center gap-4 ${
                idx === 0
                  ? 'border-blue-500 shadow-xs bg-blue-50/50'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              {/* Thumbnail Container */}
              <div className="relative w-20 h-20 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 group">
                <img
                  src={img.url}
                  alt={img.altText || `Product Image ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                {idx === 0 && (
                  <div className="absolute top-1 left-1 bg-blue-600 text-white font-bold text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded shadow">
                    Primary
                  </div>
                )}
              </div>

              {/* Details & Alt Text */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-blue-600 truncate max-w-sm">
                    {img.key ? `Cloudinary: ${img.key}` : img.url}
                  </span>
                  {img.width && img.height && (
                    <span className="text-[10px] text-slate-400 shrink-0">
                      ({img.width}×{img.height})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Image Alt Text (for SEO & Accessibility)..."
                    value={img.altText || ''}
                    onChange={(e) => handleAltTextChange(idx, e.target.value)}
                    className="w-full max-w-md bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] text-slate-700 placeholder-[#61574F] focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                {idx !== 0 && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(idx)}
                    title="Set as Primary Cover Image"
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-blue-200 text-slate-700 hover:text-blue-600 text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Star className="w-3 h-3 text-blue-600" />
                    <span>Set Primary</span>
                  </button>
                )}

                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleMove(idx, 'up')}
                  title="Move image earlier"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-20 cursor-pointer"
                >
                  <MoveUp className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  disabled={idx === images.length - 1}
                  onClick={() => handleMove(idx, 'down')}
                  title="Move image later"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-20 cursor-pointer"
                >
                  <MoveDown className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  title="Remove image"
                  className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/40 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
