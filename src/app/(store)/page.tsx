import Home from '@/views/Home';
import { getProducts } from '@/services/productService';
import { getCategories } from '@/services/categoryService';

export const revalidate = 3600;

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    getProducts({ limit: 12 }),
    getCategories(),
  ]);

  return <Home initialProducts={products} initialCategories={categories} />;
}
