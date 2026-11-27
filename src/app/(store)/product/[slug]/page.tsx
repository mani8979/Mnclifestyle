import ProductDetails from '@/views/ProductDetails';
import { getProductByIdOrSlug, getProducts } from '@/services/productService';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { slugify } from '@/lib/validations/product';
import { getSafeImageSrc } from '@/utils/image';

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

/**
 * Generate dynamic Open Graph and Twitter metadata for each product detail page.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductByIdOrSlug(slug);

  if (!product) {
    return {
      title: 'Product Not Found | MNC LifeStyle Visakhapatnam',
      description: 'The requested luxury furniture piece could not be found.',
    };
  }

  const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const siteUrl = rawSiteUrl && !rawSiteUrl.includes('localhost') ? rawSiteUrl : 'https://mnclifestyle-liard.vercel.app';
  const productSlug = product.slug || slugify(product.name);
  const canonicalUrl = `${siteUrl}/product/${productSlug}`;
  const title = `${product.name} | MNC LifeStyle`;
  const description =
    product.shortDescription ||
    (product.fullDescription
      ? `${product.fullDescription.slice(0, 150).trim()}...`
      : `Discover ${product.name} at MNC LifeStyle. Premium handcrafted solid teak and sheesham furniture in Visakhapatnam.`);

  const rawImage = Array.isArray(product.images) && product.images[0] ? product.images[0] : '';
  const safeImage = getSafeImageSrc(rawImage);
  const absoluteImageUrl = safeImage.startsWith('http')
    ? safeImage
    : `${siteUrl}${safeImage.startsWith('/') ? '' : '/'}${safeImage}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'MNC LifeStyle',
      locale: 'en_IN',
      type: 'website',
      images: [
        {
          url: absoluteImageUrl,
          width: 1200,
          height: 630,
          alt: `${product.name} — MNC LifeStyle Luxury Furniture`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [absoluteImageUrl],
    },
  };
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
