
import { notFound } from 'next/navigation';
import { getProduct, getProducts } from '@/lib/products-service';
import { getReviewsForProduct } from '@/lib/reviews-service';
import type { Product } from '@/lib/types';
import { ProductDetails } from '@/components/product-details';

// This makes this page dynamic so it will be rendered for each request
export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  const products = await getProducts();
 
  return products.map((product) => ({
    id: product.id,
  }));
}

async function getProductData(id: string): Promise<{ product: Product, reviews: any[] } | null> {
    try {
        const [product, reviews] = await Promise.all([
            getProduct(id),
            getReviewsForProduct(id)
        ]);

        if (!product) {
            return null;
        }

        return { product, reviews };
    } catch (error) {
        console.error("Error fetching product data:", error);
        return null;
    }
}


export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const data = await getProductData(params.id);

  if (!data) {
    notFound();
  }
  
  const { product, reviews } = data;

  const productLdJson = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.images,
    "description": product.longDescription || product.description,
    "brand": {
      "@type": "Brand",
      "name": product.brand
    },
    "sku": product.id,
    "offers": {
      "@type": "Offer",
      "url": `https://saahbusiness.com/products/${product.id}`,
      "priceCurrency": "XOF",
      "price": product.price,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "SAAH Business"
      }
    },
    "aggregateRating": product.reviews > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": product.rating.toFixed(1),
      "reviewCount": product.reviews
    } : undefined,
    "review": reviews.length > 0 ? reviews.map(review => ({
        "@type": "Review",
        "author": {"@type": "Person", "name": review.userName},
        "datePublished": new Date(review.createdAt).toISOString(),
        "reviewBody": review.comment,
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": review.rating,
          "bestRating": "5"
        }
    })) : undefined
  };
  
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Accueil",
        "item": "https://saahbusiness.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Produits",
        "item": "https://saahbusiness.com/products"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": product.name,
      }
    ]
  };

  return (
    <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productLdJson) }}
        />
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        <ProductDetails product={product} initialReviews={reviews} />
    </>
  );
}
