import Category from '@/views/Category';
import { getCategoryBySlug, getCategories } from '@/services/categoryService';
import { getProducts } from '@/services/productService';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const categories = await getCategories();
    return (categories || [])
      .map((c: any) => ({ categorySlug: c.slug || c.id }))
      .filter((param: any) => Boolean(param.categorySlug));
  } catch (error) {
    console.warn('[Build Warning] generateStaticParams for category failed gracefully:', error);
    return [];
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}) {
  const { categorySlug } = await params;
  const [category, products] = await Promise.all([
    getCategoryBySlug(categorySlug),
    getProducts({ category: categorySlug }),
  ]);

  if (!category) {
    notFound();
  }

  return <Category initialCategory={category} initialProducts={products} />;
}
