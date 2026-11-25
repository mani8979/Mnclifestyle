'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error('Application segment error:', error);
  }, [error]);

  return (
    <div className="min-h-[65vh] bg-[#F8F0E8] text-[#211A15] flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full bg-white rounded-3xl border border-[#E9D8C5] p-8 sm:p-10 text-center shadow-soft">
        <span className="text-[11px] uppercase tracking-[0.25em] text-[#855214] font-semibold block mb-2">
          Temporary Interruption
        </span>
        <h1 className="font-serif text-3xl text-[#211710] font-normal tracking-tight mb-3">
          We couldn&apos;t load this page
        </h1>
        <p className="text-xs sm:text-sm text-[#766B61] leading-relaxed mb-6 font-sans">
          Please try refreshing this section or return to our catalog while we restore the view.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => retry()}
            className="w-full sm:w-auto px-6 py-3 bg-[#211710] hover:bg-[#D69A4B] text-[#F8F0E8] hover:text-[#211710] text-xs uppercase tracking-wider font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Try Again
          </button>
          <Link
            href="/shop"
            className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-[#F8F0E8] text-[#211710] border border-[#E9D8C5] text-xs uppercase tracking-wider font-semibold rounded-xl transition-colors"
          >
            Browse Furniture
          </Link>
        </div>
      </div>
    </div>
  );
}
