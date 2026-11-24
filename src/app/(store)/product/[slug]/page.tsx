import ProductDetails from '@/views/ProductDetails';
import { getProductByIdOrSlug, getProducts } from '@/services/productService';
import { notFound } from 'next/navigation';

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductByIdOrSlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getProducts({ category: product.category, limit: 4 });

  const cleanProduct = JSON.parse(JSON.stringify(product));
  const cleanRelated = JSON.parse(JSON.stringify(
    relatedProducts.filter(
      (p: any) => p.id !== product.id && p.legacyId !== product.legacyId
    )
  ));

  return (
    <ProductDetails
      initialProduct={cleanProduct}
      initialRelatedProducts={cleanRelated}
    />
  );
}
