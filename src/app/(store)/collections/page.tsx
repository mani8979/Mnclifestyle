import Collections from '@/views/Collections';
import { getCollections } from '@/services/collectionService';
import { getProducts } from '@/services/productService';

export const revalidate = 3600;

export default async function CollectionsPage() {
  const [collections, products] = await Promise.all([
    getCollections(),
    getProducts(),
  ]);

  return <Collections initialCollections={collections} initialProducts={products} />;
}
