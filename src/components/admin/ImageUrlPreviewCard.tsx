'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { isValidHttpImageUrl } from '@/lib/validations/category';

/**
 * Delays image preview URL activation during typing (450ms) and validates URL completeness
 * before mounting `<img src>` so incomplete keystrokes do not emit 404/network errors.
 */
export function useValidatedImagePreview(rawInput: string, debounceMs = 450) {
  const trimmed = rawInput.trim();
  const isSyntaxValid = isValidHttpImageUrl(trimmed);
  const [debouncedUrl, setDebouncedUrl] = useState<string>(() => (isSyntaxValid ? trimmed : ''));
  const [previewError, setPreviewError] = useState(false);

  useEffect(() => {
    if (!isSyntaxValid) {
      setDebouncedUrl('');
      setPreviewError(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setDebouncedUrl(trimmed);
      setPreviewError(false);
    }, debounceMs);

    return () => window.clearTimeout(timer);
  }, [trimmed, isSyntaxValid, debounceMs]);

  const commitImmediately = (pastedText?: string) => {
    const candidate = (pastedText ?? trimmed).trim();
    if (isValidHttpImageUrl(candidate)) {
      setDebouncedUrl(candidate);
      setPreviewError(false);
    }
  };

  return {
    trimmed,
    isSyntaxValid,
    previewUrl: debouncedUrl,
    previewError,
    setPreviewError,
    commitImmediately,
  };
}

interface ImageUrlPreviewCardProps {
  rawInput: string;
  previewUrl: string;
  previewError: boolean;
  onPreviewError: () => void;
  actionLabel: string;
  onApply: () => void;
}

/**
 * Shared debounced URL image preview card used across Admin uploaders (Product, Category, Collection).
 */
export default function ImageUrlPreviewCard({
  rawInput,
  previewUrl,
  previewError,
  onPreviewError,
  actionLabel,
  onApply,
}: ImageUrlPreviewCardProps) {
  const trimmed = rawInput.trim();
  if (!trimmed) return null;

  const isWaitingForValidUrl = !previewUrl;

  return (
    <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-3.5 shadow-2xs">
      <div className="w-16 h-16 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
        {isWaitingForValidUrl ? (
          <span className="text-[9px] text-slate-400 text-center px-1 leading-tight">
            Waiting for valid URL
          </span>
        ) : previewError ? (
          <div className="text-center p-1 text-red-500">
            <AlertCircle className="w-4 h-4 mx-auto mb-0.5 text-red-400" />
            <span className="text-[9px] block">Invalid URL</span>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="Live link preview"
            onError={onPreviewError}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-800">
          {isWaitingForValidUrl
            ? 'Enter a complete image URL to preview'
            : previewError
              ? 'Unable to load image from this URL'
              : 'Live Image Preview'}
        </p>
        <p className="text-[11px] text-slate-500 truncate mt-0.5 font-mono" title={trimmed}>
          {trimmed}
        </p>
        {!isWaitingForValidUrl && !previewError && (
          <button
            type="button"
            onClick={onApply}
            className="mt-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
