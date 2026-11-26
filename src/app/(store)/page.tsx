import Home from '@/views/Home';
import { getProducts } from '@/services/productService';
import { getCategories } from '@/services/categoryService';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    getProducts({ isBestseller: true, limit: 4 }),
    getCategories(),
  ]);

  return <Home initialProducts={products} initialCategories={categories} />;
}
