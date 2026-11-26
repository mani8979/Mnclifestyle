import ProductDetails from '@/views/ProductDetails';
import { getProductByIdOrSlug, getProducts } from '@/services/productService';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const products = await getProducts({ limit: 20 });
    return (products || [])
      .map((p: any) => ({ slug: p.slug || p.id }))
      .filter((param: any) => Boolean(param.slug));
  } catch (error) {
    console.warn('[Build Warning] generateStaticParams for product failed gracefully:', error);
    return [];
  }
}

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

  // Related products query inherently depends on resolved product category
  const relatedPool = await getProducts({ category: product.category, limit: 12 });

  const variantIdSet = new Set(
    [
      product.id,
      product.legacyId,
      ...(Array.isArray(product.colorVariants)
        ? product.colorVariants.map((v: any) => v.id)
        : []),
    ].filter(Boolean)
  );

  const nonVariantRelated = relatedPool.filter(
    (p: any) => !variantIdSet.has(p.id) && !variantIdSet.has(p.legacyId)
  );

  const relatedProducts = (
    nonVariantRelated.length > 0
      ? nonVariantRelated
      : relatedPool.filter(
          (p: any) => p.id !== product.id && p.legacyId !== product.legacyId
        )
  ).slice(0, 4);

  const cleanProduct = JSON.parse(JSON.stringify(product));
  const cleanRelated = JSON.parse(JSON.stringify(relatedProducts));

  return (
    <ProductDetails
      initialProduct={cleanProduct}
      initialRelatedProducts={cleanRelated}
    />
  );
}
