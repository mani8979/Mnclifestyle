import { Suspense } from 'react';
import Shop from '@/views/Shop';
import { getProducts } from '@/services/productService';
import { getCategories } from '@/services/categoryService';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function ShopLoader() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center py-24">
      <div className="w-9 h-9 border-2 border-[#E9D8C5] border-t-[#D69A4B] rounded-full animate-spin mb-3.5" />
      <span className="text-[10px] uppercase tracking-[0.25em] text-[#77736D] font-sans font-medium">
        Loading Furniture Collection...
      </span>
    </div>
  );
}

export default async function ShopPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <Suspense fallback={<ShopLoader />}>
      <Shop initialProducts={products} initialCategories={categories} />
    </Suspense>
  );
}
