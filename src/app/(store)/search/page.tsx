import { Suspense } from 'react';
import SearchView from '@/views/Search';
import { getProducts } from '@/services/productService';
import { getCategories } from '@/services/categoryService';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function SearchLoader() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center py-24">
      <div className="w-9 h-9 border-2 border-[#E9D8C5] border-t-[#D69A4B] rounded-full animate-spin mb-3.5" />
      <span className="text-[10px] uppercase tracking-[0.25em] text-[#77736D] font-sans font-medium">
        Loading Search...
      </span>
    </div>
  );
}

export default async function SearchPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <Suspense fallback={<SearchLoader />}>
      <SearchView initialProducts={products} initialCategories={categories} />
    </Suspense>
  );
}
