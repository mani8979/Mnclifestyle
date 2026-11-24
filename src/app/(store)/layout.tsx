import StoreLayoutClient from '@/components/store/StoreLayoutClient';
import { getCategories } from '@/services/categoryService';

export const revalidate = 3600;

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCategories();
  return <StoreLayoutClient categories={categories}>{children}</StoreLayoutClient>;
}
