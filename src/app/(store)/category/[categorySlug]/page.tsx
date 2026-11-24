import Category from '@/views/Category';
import { getCategoryBySlug } from '@/services/categoryService';
import { getProducts } from '@/services/productService';
import { notFound } from 'next/navigation';

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}) {
  const { categorySlug } = await params;
  const category = await getCategoryBySlug(categorySlug);

  if (!category) {
    notFound();
  }

  const products = await getProducts({ category: category.slug || categorySlug });

  return <Category initialCategory={category} initialProducts={products} />;
}
