import StoreLayoutClient from '@/components/store/StoreLayoutClient';
import { getCategories } from '@/services/categoryService';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCategories();
  return <StoreLayoutClient categories={categories}>{children}</StoreLayoutClient>;
}
